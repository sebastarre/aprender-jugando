/* ============================================================
   Prepara los dibujos de los juegos (assets/contar/*.webp) a partir de
   las imágenes generadas con IA, usando Chrome o Edge en headless. No
   hace falta instalar nada más.

   Qué les hace a cada una:
     1. vuelve transparente el fondo blanco (vienen en PNG con fondo
        blanco liso, y en la app se apoyan sobre tarjetas de color);
     2. las recorta al dibujo y las centra, para que doce manzanas y
        doce mariposas se vean del mismo tamaño;
     3. las achica a 256 y las guarda en WebP: de ~1,5 MB cada una a
        unos 30 KB. La app se guarda entera para usarla sin internet,
        así que el peso importa.

   Uso:  node herramientas/preparar-dibujos.js
   Las direcciones de origen están en ORIGEN, abajo.
   ============================================================ */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets', 'contar');
const LADO = 256;          // el tamaño final
const MARGEN = 0.06;       // aire alrededor del dibujo, en partes del lado

/* De dónde salió cada dibujo. Se deja anotado para poder rehacerlos:
   son las generaciones de higgsfield (modelo gpt_image_2_5), pedidas
   todas con el mismo estilo (contorno grueso, colores planos, fondo
   blanco). */
const ORIGEN = {
  manzana: 'hf_20260917_195538_f35eca37-8eea-4d0f-bf68-5726481f06cd.png',
  frutilla: 'hf_20260917_195644_813901f7-46ce-4197-b9a9-6c9e509bf474.png',
  banana: 'hf_20260917_195643_5d3473f9-1953-42f5-900d-cdc862cb7244.png',
  pez: 'hf_20260917_195643_7bbe5d72-a703-487b-90ea-411eb0a08044.png',
  globo: 'hf_20260917_195644_ca46eb99-d480-47e2-b2c3-aa91c56f9310.png',
  mariquita: 'hf_20260917_195644_fe9ed0ac-7ac1-4f2a-8e84-93c23e8b655b.png',
  flor: 'hf_20260917_195643_952b0f17-2e49-4121-ab42-59747671957f.png',
  pollito: 'hf_20260917_195644_596843db-6d1c-4a23-b779-66eb7e798f93.png',
  /* De colores y no blanca y negra: la pelota de fútbol clásica es
     casi toda blanca, y al sacarle el fondo blanco se le iban también
     los gajos de adentro. */
  pelota: 'hf_20260917_201708_45489e19-774a-46a6-8714-2636bb90fa24.png',
  mariposa: 'hf_20260917_195644_90bb84b0-3a34-46ec-b746-faeaab3e2592.png'
};
const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3IPYnmfmJthqii855Q3YVmit885/';

const CANDIDATOS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

function navegador() {
  const encontrado = CANDIDATOS.find(p => fs.existsSync(p));
  if (!encontrado) throw new Error('no encontré Chrome ni Edge');
  return encontrado;
}

/* La página que hace el trabajo: la corre el navegador, que es el que
   sabe abrir un PNG y mirarle los píxeles. Deja el dibujo ya limpio en
   un lienzo de 256×256 pegado arriba a la izquierda, y de eso se saca
   una captura con fondo transparente (--screenshot), que es el mismo
   camino que usa generar-iconos.js. */
function pagina(entrada) {
  return `<!DOCTYPE html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}canvas{display:block}</style>
<body><script>
var ARCHIVOS = ${JSON.stringify([entrada])};
var LADO = ${LADO}, MARGEN = ${MARGEN};

function cargar(src) {
  return new Promise(function (listo, falla) {
    var img = new Image();
    img.onload = function () { listo(img); };
    img.onerror = function () { falla(new Error('no cargó ' + src)); };
    img.src = src;
  });
}

/* El fondo se va desde los bordes hacia adentro, como un balde de
   pintura, y frena en el primer píxel oscuro. Borrar todo lo blanco de
   la imagen sonaba más simple, pero le comía los gajos blancos a la
   pelota de fútbol: un blanco rodeado de contorno es dibujo, no fondo.
   Lo que está cerca del blanco se va a medias, para que el borde no
   quede con un halo gris. */
function sacarFondo(datos, ancho, alto) {
  var d = datos.data;
  var visto = new Uint8Array(ancho * alto);
  var cola = [];
  function mirar(x, y) {
    if (x < 0 || y < 0 || x >= ancho || y >= alto) return;
    var p = y * ancho + x;
    if (visto[p]) return;
    var min = Math.min(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]);
    if (min <= 232) return;                 // llegó al dibujo
    visto[p] = 1;
    d[p * 4 + 3] = min >= 250 ? 0 : Math.round(d[p * 4 + 3] * (250 - min) / 18);
    cola.push(p);
  }
  for (var x = 0; x < ancho; x++) { mirar(x, 0); mirar(x, alto - 1); }
  for (var y = 0; y < alto; y++) { mirar(0, y); mirar(ancho - 1, y); }
  while (cola.length) {
    var p = cola.pop(), px = p % ancho, py = (p - px) / ancho;
    mirar(px + 1, py); mirar(px - 1, py); mirar(px, py + 1); mirar(px, py - 1);
  }
  return datos;
}

/* Dónde empieza y termina el dibujo, para recortar el aire de sobra. */
function recuadro(datos, ancho, alto) {
  var d = datos.data, x1 = ancho, y1 = alto, x2 = -1, y2 = -1;
  for (var y = 0; y < alto; y++) {
    for (var x = 0; x < ancho; x++) {
      if (d[(y * ancho + x) * 4 + 3] > 24) {
        if (x < x1) x1 = x;
        if (x > x2) x2 = x;
        if (y < y1) y1 = y;
        if (y > y2) y2 = y;
      }
    }
  }
  return x2 < 0 ? { x: 0, y: 0, ancho: ancho, alto: alto } : { x: x1, y: y1, ancho: x2 - x1 + 1, alto: y2 - y1 + 1 };
}

async function preparar(entrada) {
  var img = await cargar(entrada.archivo);
  var lienzo = document.createElement('canvas');
  lienzo.width = img.width; lienzo.height = img.height;
  var ctx = lienzo.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  var datos = sacarFondo(ctx.getImageData(0, 0, img.width, img.height), img.width, img.height);
  ctx.putImageData(datos, 0, 0);

  var r = recuadro(datos, img.width, img.height);
  var salida = document.createElement('canvas');
  salida.width = salida.height = LADO;
  var sctx = salida.getContext('2d');
  sctx.imageSmoothingQuality = 'high';

  // el dibujo entra entero y centrado, con el mismo aire para todos
  var util = LADO * (1 - MARGEN * 2);
  var escala = Math.min(util / r.ancho, util / r.alto);
  var ancho = r.ancho * escala, alto = r.alto * escala;
  sctx.drawImage(lienzo, r.x, r.y, r.ancho, r.alto,
                 (LADO - ancho) / 2, (LADO - alto) / 2, ancho, alto);
  document.body.appendChild(salida);
  return salida;
}

(async function () {
  try {
    await preparar(ARCHIVOS[0]);
    document.title = 'listo';
  } catch (e) {
    document.title = 'error: ' + String(e && e.message || e);
  }
})();
</script></body>`;
}

/* Espera a que la captura esté escrita y completa (un PNG termina con
   el bloque IEND). Hasta 40 segundos por dibujo. */
function esperarArchivo(ruta) {
  const limite = Date.now() + 40000;
  while (Date.now() < limite) {
    try {
      const b = fs.readFileSync(ruta);
      if (b.length > 1000 && b.slice(-8, -4).toString('latin1') === 'IEND') return b;
    } catch (error) { /* todavía no está */ }
    execFileSync(process.execPath, ['-e', 'setTimeout(function(){}, 250)']);
  }
  throw new Error('la captura no apareció: ' + ruta);
}

async function bajar(temporal) {
  const archivos = [];
  for (const [id, nombre] of Object.entries(ORIGEN)) {
    const destino = path.join(temporal, id + '.png');
    if (!fs.existsSync(destino)) {
      const respuesta = await fetch(BASE + nombre);
      if (!respuesta.ok) throw new Error(id + ': ' + respuesta.status);
      fs.writeFileSync(destino, Buffer.from(await respuesta.arrayBuffer()));
    }
    /* La imagen va incrustada en la página, y no como file:///, porque
       un archivo local «mancha» el lienzo y el navegador no deja
       leerle los píxeles, que es justo lo que hay que hacer acá. */
    archivos.push({
      id: id,
      archivo: 'data:image/png;base64,' + fs.readFileSync(destino).toString('base64')
    });
  }
  return archivos;
}

(async function () {
  const temporal = path.join(os.tmpdir(), 'dibujos-bichito');
  fs.mkdirSync(temporal, { recursive: true });
  fs.mkdirSync(DESTINO, { recursive: true });

  const exe = navegador();
  const archivos = await bajar(temporal);

  for (const entrada of archivos) {
    const html = path.join(temporal, entrada.id + '.html');
    fs.writeFileSync(html, pagina(entrada));
    const salida = path.join(DESTINO, entrada.id + '.png');
    // si quedó el de la vuelta anterior, la espera de abajo lo daría por bueno
    try { fs.unlinkSync(salida); } catch (error) { /* no estaba */ }

    execFileSync(exe, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1',
      // sin esto la captura sale con el fondo blanco del navegador
      '--default-background-color=00000000',
      /* un perfil por dibujo: el navegador vuelve antes de terminar, y
         dos instancias con el mismo perfil se traban entre ellas */
      '--user-data-dir=' + path.join(temporal, 'perfil-' + entrada.id),
      '--virtual-time-budget=15000',
      '--window-size=' + LADO + ',' + LADO,
      '--screenshot=' + salida,
      'file:///' + html.split(path.sep).join('/')
    ], { stdio: 'ignore' });

    /* Edge vuelve antes de terminar de escribir la captura (delega en
       otro proceso), así que hay que esperarla. */
    const b = esperarArchivo(salida);
    const ancho = b.readUInt32BE(16), alto = b.readUInt32BE(20);
    if (ancho !== LADO || alto !== LADO) {
      throw new Error(entrada.id + ': salió ' + ancho + 'x' + alto + ' y esperaba ' + LADO);
    }
    console.log(entrada.id + '.png  ' + ancho + 'x' + alto + '  ' + Math.round(b.length / 1024) + ' KB');
  }
  console.log('dibujos listos en assets/contar/');
})();
