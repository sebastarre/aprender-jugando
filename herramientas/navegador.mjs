/* ============================================================
   Abrir la app en un navegador sin ventana y manejarla desde Node.

   Lo usan las pruebas (probar.mjs) y el que junta las frases para las
   voces grabadas (generar-voces.mjs). Levanta un servidor propio para la
   carpeta, abre Edge o Chrome sin ventana y habla con la página por el
   protocolo de depuración (CDP). No hace falta instalar nada: alcanza con
   Node 22 o más nuevo, que ya trae fetch y WebSocket. Si el navegador
   está en otro lado, se le dice con la variable NAVEGADOR.
   ============================================================ */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const dormir = ms => new Promise(r => setTimeout(r, ms));

/* ---------------------- el servidor ---------------------- */

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg'
};

/* Un perfil nuevo, de la edad pedida, con la prueba gratis recién empezada
   y sin voz (se prueba el recorrido; esperar a que la voz termine cada
   explicación haría que una partida tarde minutos): se guarda en este
   origen y se va a la ruta pedida. */
function paginaDePerfil(edad) {
  const id = 'prueba';
  const datos = {
    version: 5,
    perfiles: [{ id, nombre: 'Prueba', avatar: 'x', edad, genero: 'nene', creado: Date.now() }],
    activo: id,
    datos: {},
    ajustes: { sonido: false, voz: false, pin: null, plan: { pruebaDesde: Date.now() }, quienUsa: 'chico' }
  };
  return '<!DOCTYPE html><meta charset="utf-8"><script>' +
    'localStorage.clear();' +
    'localStorage.setItem("aprenderJugando.v2", ' + JSON.stringify(JSON.stringify(datos)) + ');' +
    'location.replace("/" + (location.hash || "#/"));</script>';
}

/** Sirve la carpeta de la app; /__perfil?edad=N deja un perfil de prueba. */
export function levantarServidor() {
  const servidor = createServer(async (pide, responde) => {
    const url = new URL(pide.url, 'http://x');
    if (url.pathname === '/__perfil') {
      responde.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return responde.end(paginaDePerfil(+(url.searchParams.get('edad') || 8)));
    }
    const ruta = join(RAIZ, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!ruta.startsWith(RAIZ)) { responde.writeHead(403); return responde.end(); }
    try {
      if (!(await stat(ruta)).isFile()) throw new Error('no es un archivo');
      responde.writeHead(200, { 'Content-Type': TIPOS[extname(ruta).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      responde.end(await readFile(ruta));
    } catch {
      responde.writeHead(404);
      responde.end();
    }
  });
  return new Promise(ok => servidor.listen(0, '127.0.0.1', () => ok(servidor)));
}

/* ---------------------- el navegador ---------------------- */

export function buscarNavegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'
  ];
  return candidatos.find(c => c && existsSync(c));
}

/**
 * Abre el navegador y devuelve { ir(url), correr(fn, arg), errores, cerrar() }.
 * correr() manda una función a la página (tiene que valerse sola: no ve
 * nada de Node) y devuelve lo que ella devuelva. `errores` junta los que
 * tire la página.
 */
export async function abrirNavegador(ejecutable) {
  const perfil = mkdtempSync(join(tmpdir(), 'probar-'));
  const puerto = 9400 + Math.floor(Math.random() * 400);
  const proceso = spawn(ejecutable, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  let lista;
  for (let i = 0; i < 60 && !lista; i++) {
    try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); } catch { await dormir(250); }
  }
  if (!lista) throw new Error('No se pudo hablar con el navegador');
  const ws = new WebSocket(lista.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let n = 0;
  const pendientes = {}, errores = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes[m.id]) {
      m.error ? pendientes[m.id].mal(new Error(m.error.message)) : pendientes[m.id].ok(m.result);
      delete pendientes[m.id];
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errores.push((d.exception && d.exception.description || d.text).split('\n')[0] + ' @' + (d.url || '').split('/').pop() + ':' + d.lineNumber);
    }
  };
  const cmd = (method, params = {}) => new Promise((ok, mal) => {
    const id = ++n;
    pendientes[id] = { ok, mal };
    ws.send(JSON.stringify({ id, method, params }));
  });
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  /* Sin el service worker: una vez instalado, contestaba él la página del
     perfil nuevo con la app guardada, y la prueba seguía con el perfil viejo. */
  await cmd('Network.enable');
  await cmd('Network.setBypassServiceWorker', { bypass: true });
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  return {
    cmd, errores,
    async ir(url, espera = 2500) { await cmd('Page.navigate', { url }); await dormir(espera); },
    async correr(fn, arg) {
      const r = await cmd('Runtime.evaluate', { expression: '(' + fn.toString() + ')(' + JSON.stringify(arg === undefined ? null : arg) + ')', awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
      return r.result.value;
    },
    cerrar() {
      try { ws.close(); } catch { /* ya estaba cerrado */ }
      proceso.kill();
      setTimeout(() => { try { rmSync(perfil, { recursive: true, force: true }); } catch { /* lo borra el sistema */ } }, 1500);
    }
  };
}
