/* ============================================================
   Baja la tipografía Baloo 2 a assets/fuentes/.

   Uso:  node herramientas/bajar-fuente.js

   Por qué se guarda en el repo en vez de pedirla a Google en cada
   visita: la app tiene que funcionar sin internet una vez instalada.
   Si la fuente viniera de fonts.gstatic.com, el chico abriría la app en
   el colectivo y le aparecería todo en la tipografía del sistema.

   Baloo 2 es una fuente variable: un solo archivo cubre de 400 a 800,
   así que pesa una vez y no cuatro. Se baja sólo el subconjunto
   "latin", que ya trae los acentos y la eñe del español (están todos
   dentro de U+0000-00FF).

   Licencia: SIL Open Font License 1.1 — se puede redistribuir dentro
   del proyecto. La licencia queda en assets/fuentes/LICENCIA.txt.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets', 'fuentes');

const CSS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&display=swap';
const LICENCIA = 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloo2/OFL.txt';

/* Google devuelve woff2 sólo si le llega un navegador moderno; con el
   agente de Node manda ttf, que pesa cinco veces más. */
const AGENTE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
               '(KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function texto(url) {
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error('no se pudo pedir ' + url + ' (HTTP ' + r.status + ')');
  return r.text();
}

/** La URL del woff2 del bloque "latin" (el comentario que precede al @font-face). */
function urlLatina(css) {
  const bloques = css.split('/*').map(b => '/*' + b);
  const latino = bloques.find(b => b.startsWith('/* latin */'));
  if (!latino) throw new Error('el CSS de Google no trajo el bloque latin');
  const m = /src:\s*url\((https:[^)]+\.woff2)\)/.exec(latino);
  if (!m) throw new Error('no encontré el woff2 dentro del bloque latin');
  return m[1];
}

async function main() {
  fs.mkdirSync(DESTINO, { recursive: true });

  const css = await texto(CSS);
  const url = urlLatina(css);
  process.stdout.write('bajando ' + url.split('/').pop() + '... ');

  const r = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!r.ok) throw new Error('no se pudo bajar la fuente (HTTP ' + r.status + ')');
  const bytes = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(path.join(DESTINO, 'baloo2.woff2'), bytes);
  console.log((bytes.length / 1024).toFixed(1) + ' KB');

  const licencia = await texto(LICENCIA);
  fs.writeFileSync(path.join(DESTINO, 'LICENCIA.txt'), licencia, 'utf8');
  console.log('LICENCIA.txt escrita (' + (licencia.length / 1024).toFixed(1) + ' KB)');
  console.log('\nListo. Acordate de correr node herramientas/generar-sw.js');
}

main().catch(e => { console.error('Falló:', e.message); process.exit(1); });
