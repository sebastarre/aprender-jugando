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
  { archivo: 'icono-apple-180.png', lado: 180, query: '&recto=1' }
];

const exe = navegador();
const perfil = path.join(os.tmpdir(), 'iconos-aprender-jugando');
fs.mkdirSync(DESTINO, { recursive: true });

for (const icono of ICONOS) {
  const salida = path.join(DESTINO, icono.archivo);
  const url = 'file:///' + PAGINA.replace(/\\/g, '/') + '?lado=' + icono.lado + icono.query;
  execFileSync(exe, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--user-data-dir=' + perfil,
    '--virtual-time-budget=6000',
    '--window-size=' + icono.lado + ',' + icono.lado,
    '--screenshot=' + salida,
    url
  ], { stdio: 'ignore' });

  const b = fs.readFileSync(salida);
  const ancho = b.readUInt32BE(16), alto = b.readUInt32BE(20);
  if (ancho !== icono.lado || alto !== icono.lado) {
    throw new Error(icono.archivo + ': salió ' + ancho + 'x' + alto + ' y esperaba ' + icono.lado);
  }
  console.log(icono.archivo + '  ' + ancho + 'x' + alto + '  ' + Math.round(b.length / 1024) + ' KB');
}
console.log('íconos generados en assets/');
