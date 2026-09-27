/* ============================================================
   Las voces grabadas: juntar las frases fijas de la app y grabarlas.

     node herramientas/generar-voces.mjs              junta y cuenta
     node herramientas/generar-voces.mjs --generar    además, graba las que falten
     node herramientas/generar-voces.mjs --limpiar    borra grabaciones que ya no se usan

   Juntar. Abre la app en un navegador sin ventana (ver navegador.mjs) y
   le pide a la propia app sus textos fijos: cada paso de cada lección,
   las frases de los carteles del juego, y de cada pregunta de los
   juegos de lista, lo que lee el lector (la consigna, las respuestas que
   son palabras o frases, y los carteles de acierto, error y «era ésta»).
   Las preguntas que se arman al vuelo (las cuentas, la plata) no: son
   infinitas, y ésas siguen con la voz del aparato. Cada texto se parte en
   frases con el mismo código con que la app habla (Voz.frasesDe), y cada
   frase recibe su clave (Voz.claveDe): así lo que se graba es exactamente
   lo que la app va a buscar. La lista queda en herramientas/voz/frases.json,
   para revisarla.

   Grabar. Con --generar pide cada frase que falte a Azure Speech (voces
   neuronales, con acento argentino) y la guarda en assets/voz/<clave>.mp3.
   Después escribe assets/voz/manifiesto.json con las que hay: la app sólo
   usa grabaciones si ese archivo existe. La clave y la región van en
   variables de entorno, nunca en un archivo del repositorio:

     AZURE_SPEECH_KEY      la clave del recurso de Speech
     AZURE_SPEECH_REGION   su región (por ejemplo, brazilsouth o eastus)
     VOZ_ES, VOZ_EN        otras voces (si no: es-AR-ElenaNeural y en-US-JennyNeural)

   Cambiar de voz cambia todas las claves: la app nunca mezcla una frase
   grabada con una voz vieja. Con --limpiar se borran los .mp3 que quedaron
   sin usar. Después de grabar, correr node herramientas/generar-sw.js.
   ============================================================ */
import { mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, levantarServidor, buscarNavegador, abrirNavegador } from './navegador.mjs';

const GENERAR = process.argv.includes('--generar');
const LIMPIAR = process.argv.includes('--limpiar');
const VOCES = { es: process.env.VOZ_ES || 'es-AR-ElenaNeural', en: process.env.VOZ_EN || 'en-US-JennyNeural' };
// un poco más despacio que lo normal, como la voz del aparato (rate 0.95 y 0.85)
const RITMO = { es: '-5%', en: '-15%' };
const CARPETA = join(RAIZ, 'assets', 'voz');
const LISTA = join(RAIZ, 'herramientas', 'voz', 'frases.json');

/* ---------------------- juntar (corre en la página) ---------------------- */

async function juntarFrases(voces) {
  const textos = [];
  const agregar = h => { if (h) textos.push(String(h)); };

  // las lecciones: lo que dice la mascota y lo que se pregunta
  for (const l of Lecciones.LECCIONES) {
    l.pasos.forEach(p => {
      agregar(p.texto);
      agregar(p.truco);
      [p.prediccion, p.practica].forEach(q => {
        if (!q) return;
        agregar(q.pregunta);
        (q.opciones || []).forEach(agregar);
        agregar(q.explicacion);
        agregar(q.pista);
      });
    });
    (l.aprendiste || []).forEach(agregar);
    if (l.reflexion) {
      agregar(l.reflexion.pregunta);
      (l.reflexion.razones || []).forEach(agregar);
      agregar(l.reflexion.porque);
      agregar(l.reflexion.grande);
    }
    if (l.ejercicio) agregar(l.ejercicio.consigna);
  }

  // los carteles del juego: «¡Muy bien!», «¡Probá otra vez!»…
  (Motor.FRASES || []).forEach(agregar);

  // los juegos de lista, pregunta por pregunta, como los lee el lector
  const materias = [window.Geografia, window.Matematica, window.Lengua, window.Ciencias, window.Ingles, window.Historia];
  for (const mod of materias) {
    if (!mod) continue;
    for (const j of mod.JUEGOS) {
      if (!j.ITEMS) continue;
      const g = j.ganchos();
      // todas las respuestas que puede tener este juego: el cartel de error depende de cuál se eligió
      const respuestas = [...new Set(j.ITEMS.map(x => String(x.r)).concat(...j.ITEMS.map(x => (x.m || []).map(String))))];
      for (const original of j.ITEMS) {
        const it = Object.assign({}, original);
        // las respuestas malas se sortean: armándola varias veces se juntan más botones
        for (let vuelta = 0; vuelta < 4; vuelta++) {
          j.montar(it);
          const zona = document.getElementById('zona-opciones');
          const forma = zona.getAttribute('data-forma');
          if (!zona.hidden && (forma === 'palabra' || forma === 'frase')) zona.querySelectorAll('.btn-opcion').forEach(b => agregar(b.innerHTML));
        }
        agregar(document.getElementById('pregunta-texto').innerHTML);
        agregar(g.textoAcierto && g.textoAcierto(it, it.r));
        agregar(g.textoRevelado(it));
        if (g.pista) { agregar(g.pista(it, 1)); agregar(g.pista(it, 2)); }
        if (g.textoFallo) respuestas.filter(v => v !== String(it.r)).forEach(v => agregar(g.textoFallo(it, v)));
      }
    }
  }

  const frases = {};
  textos.forEach(h => Voz.frasesDe(h).forEach(f => {
    const clave = Voz.claveDe(f.texto, f.idioma, voces[f.idioma]);
    if (!frases[clave]) frases[clave] = { clave, idioma: f.idioma, texto: f.texto, veces: 0 };
    else if (frases[clave].texto !== f.texto) frases[clave].choca = f.texto;
    frases[clave].veces++;
  }));
  location.hash = '#/';
  return Object.values(frases);
}

/* ---------------------- grabar ---------------------- */

function escaparXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function grabar(frase, clave, region) {
  const voz = VOCES[frase.idioma];
  const lang = voz.split('-').slice(0, 2).join('-');
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voz}"><prosody rate="${RITMO[frase.idioma] || '0%'}">` +
    escaparXml(frase.texto) + '</prosody></voice></speak>';
  for (let intento = 1; intento <= 4; intento++) {
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': clave,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'bichito-curioso'
      },
      body: ssml
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    // demasiados pedidos seguidos: se espera y se vuelve a probar
    if (r.status === 429 || r.status >= 500) { await new Promise(ok => setTimeout(ok, 1500 * intento)); continue; }
    throw new Error('Azure contestó ' + r.status + ' ' + (await r.text()).slice(0, 200));
  }
  throw new Error('Azure no contestó después de cuatro intentos');
}

/* ---------------------- todo junto ---------------------- */

async function principal() {
  const ejecutable = buscarNavegador();
  if (!ejecutable) {
    console.error('No encontré Edge ni Chrome. Decime dónde está con la variable NAVEGADOR.');
    process.exit(2);
  }
  const servidor = await levantarServidor();
  const nav = await abrirNavegador(ejecutable);
  let frases;
  try {
    await nav.ir('http://127.0.0.1:' + servidor.address().port + '/__perfil?edad=9');
    frases = await nav.correr(juntarFrases, VOCES);
  } finally {
    nav.cerrar();
    servidor.close();
  }

  const chocan = frases.filter(f => f.choca);
  if (chocan.length) {
    console.error('Dos frases distintas con la misma clave (hay que cambiar Voz.claveDe):');
    chocan.forEach(f => console.error('  «' + f.texto + '» y «' + f.choca + '»'));
    process.exit(1);
  }
  frases.sort((a, b) => b.veces - a.veces || a.texto.localeCompare(b.texto));
  const caracteres = frases.reduce((s, f) => s + f.texto.length, 0);
  mkdirSync(join(RAIZ, 'herramientas', 'voz'), { recursive: true });
  writeFileSync(LISTA, JSON.stringify({ voces: VOCES, total: frases.length, caracteres, frases }, null, 1));

  const hay = f => existsSync(join(CARPETA, f.clave + '.mp3'));
  const faltan = frases.filter(f => !hay(f));
  console.log(frases.length + ' frases (' + caracteres.toLocaleString('es-AR') + ' caracteres), ' +
    (frases.length - faltan.length) + ' ya grabadas. La lista está en herramientas/voz/frases.json.');

  if (GENERAR && faltan.length) {
    const clave = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
    if (!clave || !region) {
      console.error('Para grabar hacen falta AZURE_SPEECH_KEY y AZURE_SPEECH_REGION (en variables de entorno).');
      process.exit(2);
    }
    const chars = faltan.reduce((s, f) => s + f.texto.length, 0);
    mkdirSync(CARPETA, { recursive: true });
    console.log('Grabando ' + faltan.length + ' frases (' + chars.toLocaleString('es-AR') + ' caracteres) con ' + VOCES.es + ' y ' + VOCES.en + '…');
    let hechas = 0;
    for (const f of faltan) {
      writeFileSync(join(CARPETA, f.clave + '.mp3'), await grabar(f, clave, region));
      if (++hechas % 50 === 0) console.log('  ' + hechas + ' de ' + faltan.length);
    }
  } else if (!GENERAR && faltan.length) {
    console.log('Para grabar las que faltan: node herramientas/generar-voces.mjs --generar');
  }

  if (LIMPIAR && existsSync(CARPETA)) {
    const usadas = new Set(frases.map(f => f.clave + '.mp3'));
    const sobran = readdirSync(CARPETA).filter(n => n.endsWith('.mp3') && !usadas.has(n));
    sobran.forEach(n => unlinkSync(join(CARPETA, n)));
    console.log(sobran.length + ' grabaciones sin usar borradas.');
  }

  // el manifiesto: sólo si hay alguna grabada (sin él, la app usa la voz del aparato)
  const grabadas = frases.filter(hay).map(f => f.clave).sort();
  const manifiesto = join(CARPETA, 'manifiesto.json');
  if (grabadas.length) {
    writeFileSync(manifiesto, JSON.stringify({ voces: VOCES, frases: grabadas }));
    console.log('assets/voz/manifiesto.json: ' + grabadas.length + ' frases grabadas. Falta correr node herramientas/generar-sw.js.');
  } else if (existsSync(manifiesto)) {
    unlinkSync(manifiesto);
  }
}

principal().catch(e => { console.error(e.message); process.exit(1); });
