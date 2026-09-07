/* ============================================================
   Descarga las banderas a assets/banderas/ (una por país, PNG).

   Uso:  node herramientas/bajar-banderas.js
   Necesita Node 18 o más nuevo y conexión a internet. Las que ya
   están descargadas no se vuelven a pedir.

   Fuente: flagcdn.com (dominio público / libre uso).
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets', 'banderas');
const EN_PARALELO = 8;

function paises() {
  const archivo = path.join(RAIZ, 'js', 'datos', 'paises.js');
  if (!fs.existsSync(archivo)) {
    throw new Error('falta js/datos/paises.js: corré antes "node herramientas/generar-datos.js"');
  }
  const contexto = { window: {} };
  new Function('window', fs.readFileSync(archivo, 'utf8'))(contexto.window);
  return contexto.window.PAISES;
}

async function bajar(codigo) {
  const destino = path.join(DESTINO, codigo + '.png');
  if (fs.existsSync(destino) && fs.statSync(destino).size > 80) return false;
  const r = await fetch('https://flagcdn.com/w320/' + codigo + '.png');
  if (!r.ok) throw new Error(codigo + ': HTTP ' + r.status);
  const datos = Buffer.from(await r.arrayBuffer());
  if (datos.length < 80) throw new Error(codigo + ': archivo vacío');
  fs.writeFileSync(destino, datos);
  return true;
}

(async () => {
  fs.mkdirSync(DESTINO, { recursive: true });
  const cola = paises().map(p => p.id.toLowerCase());
  const total = cola.length;
  const fallos = [];
  let nuevas = 0;

  const obrero = async () => {
    while (cola.length) {
      const codigo = cola.shift();
      try { if (await bajar(codigo)) nuevas++; }
      catch (error) { fallos.push(error.message); }
    }
  };
  await Promise.all(Array.from({ length: EN_PARALELO }, obrero));

  const archivos = fs.readdirSync(DESTINO);
  const bytes = archivos.reduce((s, f) => s + fs.statSync(path.join(DESTINO, f)).size, 0);
  console.log('banderas: ' + archivos.length + '/' + total +
    ' (nuevas: ' + nuevas + ') · ' + (bytes / 1048576).toFixed(2) + ' MB');
  if (fallos.length) console.log('fallaron: ' + fallos.join(', '));
})();
