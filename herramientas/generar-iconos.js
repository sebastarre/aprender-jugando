/* ============================================================
   Genera los íconos de la app (assets/icono-*.png) a partir de
   herramientas/icono.html, sacándole una captura con Edge o Chrome
   en modo headless. No hace falta instalar nada más.

   Uso:  node herramientas/generar-iconos.js
   ============================================================ */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets');
const PAGINA = path.join(__dirname, 'icono.html');

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
  if (!encontrado) throw new Error('no encontré Chrome ni Edge para generar los íconos');
  return encontrado;
}

/* Cada ícono: archivo de salida, tamaño y parámetros de dibujo. */
const ICONOS = [
  { archivo: 'icono-192.png', lado: 192, query: '' },
  { archivo: 'icono-512.png', lado: 512, query: '' },
  { archivo: 'icono-maskable-512.png', lado: 512, query: '&relleno=0.16' },
  { archivo: 'icono-apple-180.png', lado: 180, query: '&recto=1' },
  // la tarjeta que muestran WhatsApp y las redes al compartir el link
  { archivo: 'compartir.png', ancho: 1200, alto: 630, query: '&compartir=1' },
  /* Para la ficha de Google Play. No van en assets/ porque no son parte
     del sitio: se suben a mano en Play Console. El ícono de Play va
     cuadrado y sin transparencia, porque Google le pone las esquinas. */
  { archivo: 'icono-play-512.png', lado: 512, query: '&recto=1', carpeta: 'play' },
  { archivo: 'grafico-destacado.png', ancho: 1024, alto: 500,
    query: '&compartir=1&ancho=1024&alto=500', carpeta: 'play' }
];

/* La mascota de la cortina del arranque (index.html): el gato disfrazado
   de león, saludando, como archivo SVG suelto. Sale del mismo dibujo que
   usa la app, js/nucleo/mascota.js. */
{
  global.window = {};
  global.document = { readyState: 'complete', querySelectorAll: () => [] };
  require(path.join(RAIZ, 'js', 'nucleo', 'mascota.js'));
  const dibujo = window.Mascota.svg('gato', 'leon', 'hola')
    .replace('<svg class="mascota-img"', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250"');
  fs.writeFileSync(path.join(DESTINO, 'mascota.svg'), dibujo + '\n');
  console.log('mascota.svg  ' + Math.round(dibujo.length / 1024 * 10) / 10 + ' KB');
}

const exe = navegador();
const perfil = path.join(os.tmpdir(), 'iconos-aprender-jugando');
fs.mkdirSync(DESTINO, { recursive: true });

for (const icono of ICONOS) {
  const carpeta = icono.carpeta ? path.join(__dirname, icono.carpeta) : DESTINO;
  fs.mkdirSync(carpeta, { recursive: true });
  const salida = path.join(carpeta, icono.archivo);
  const ancho = icono.ancho || icono.lado, alto = icono.alto || icono.lado;
  const url = 'file:///' + PAGINA.replace(/\\/g, '/') + '?lado=' + (icono.lado || 512) + icono.query;
  execFileSync(exe, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--user-data-dir=' + perfil,
    '--virtual-time-budget=6000',
    '--allow-file-access-from-files',
    '--window-size=' + ancho + ',' + alto,
    '--screenshot=' + salida,
    url
  ], { stdio: 'ignore' });

  const b = fs.readFileSync(salida);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (w !== ancho || h !== alto) {
    throw new Error(icono.archivo + ': salió ' + w + 'x' + h + ' y esperaba ' + ancho + 'x' + alto);
  }
  console.log(icono.archivo + '  ' + w + 'x' + h + '  ' + Math.round(b.length / 1024) + ' KB');
}
console.log('íconos generados en assets/ y herramientas/play/');
