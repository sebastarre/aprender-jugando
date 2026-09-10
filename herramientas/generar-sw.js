/* ============================================================
   Escribe sw.js (el service worker) con la lista de todos los
   archivos que la app tiene que guardar para funcionar sin internet.

   Uso:  node herramientas/generar-sw.js
   Hay que volver a correrlo cada vez que se agrega o cambia un archivo
   del sitio: la versión sale del contenido, así el celular se entera
   de que hay algo nuevo y actualiza su copia.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');

/* Carpetas y archivos que forman la app. Todo lo demás (herramientas,
   .claude, textos sueltos) queda afuera: no hace falta en el celular. */
const SUELTOS = ['index.html', 'manifest.json', 'css/estilos.css'];
const CARPETAS = ['js', 'assets'];
/* .woff2 es la tipografía: si no se guarda, la app instalada abre sin
   internet con la fuente del sistema y se ve distinta en cada celular. */
const EXTENSIONES = ['.js', '.css', '.png', '.webp', '.json', '.html', '.svg', '.woff2'];

function recorrer(dir) {
  const salida = [];
  for (const entrada of fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })) {
    const relativo = dir + '/' + entrada.name;
    if (entrada.isDirectory()) salida.push(...recorrer(relativo));
    else if (EXTENSIONES.includes(path.extname(entrada.name))) salida.push(relativo);
  }
  return salida;
}

const archivos = SUELTOS.concat(CARPETAS.flatMap(recorrer))
  .filter(f => fs.existsSync(path.join(RAIZ, f)))
  .sort();

/* La versión es un resumen del contenido: si nada cambió, no cambia. */
const resumen = crypto.createHash('sha1');
let bytes = 0;
for (const f of archivos) {
  const datos = fs.readFileSync(path.join(RAIZ, f));
  bytes += datos.length;
  resumen.update(f).update(datos);
}
const VERSION = resumen.digest('hex').slice(0, 10);

const sw = `/* Generado por herramientas/generar-sw.js — no editar a mano.
   Guarda toda la app en el celular para que funcione sin internet. */
'use strict';

const VERSION = 'aprender-jugando-${VERSION}';
const ARCHIVOS = ${JSON.stringify(archivos.map(f => './' + f), null, 2).replace(/\n/g, '\n')};

/* Al instalarse guarda todo. Se hace de a tandas porque son muchos archivos
   chicos (las banderas) y algunos navegadores se atragantan con una sola. */
async function precargar() {
  const cache = await caches.open(VERSION);
  const TANDA = 24;
  for (let i = 0; i < ARCHIVOS.length; i += TANDA) {
    await cache.addAll(ARCHIVOS.slice(i, i + TANDA));
  }
}

async function borrarViejos() {
  const nombres = await caches.keys();
  await Promise.all(nombres.filter(n => n !== VERSION).map(n => caches.delete(n)));
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(precargar().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(borrarViejos().then(() => self.clients.claim()));
});

/* Primero la copia guardada (así abre al instante y anda sin señal);
   si no está, se pide a la red y se guarda para la próxima. */
self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  if (new URL(pedido.url).origin !== self.location.origin) return;

  evento.respondWith((async () => {
    // Abrir la app (sea "/", "/index.html" o con ?algo) siempre se resuelve
    // con la portada guardada: es lo que la hace arrancar sin internet.
    if (pedido.mode === 'navigate') {
      const portada = await caches.match('./index.html');
      if (portada) return portada;
    }

    const guardado = await caches.match(pedido, { ignoreSearch: true });
    if (guardado) return guardado;

    const respuesta = await fetch(pedido);
    if (respuesta && respuesta.ok && respuesta.type === 'basic') {
      const cache = await caches.open(VERSION);
      cache.put(pedido, respuesta.clone());
    }
    return respuesta;
  })());
});
`;

fs.writeFileSync(path.join(RAIZ, 'sw.js'), sw, 'utf8');
console.log('sw.js escrito · ' + archivos.length + ' archivos · ' +
  (bytes / 1048576).toFixed(2) + ' MB · versión ' + VERSION);
