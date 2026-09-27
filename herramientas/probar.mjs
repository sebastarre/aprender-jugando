/* ============================================================
   Las pruebas de la app, de una sola vez:

     node herramientas/probar.mjs            todas
     node herramientas/probar.mjs lecciones  sólo las que se nombran
       (lecciones, juegos, trazos, partidas)

   Abre la app en Edge (o Chrome) sin ventana y la maneja desde acá (ver
   navegador.mjs): no hace falta instalar nada, alcanza con Node 22 o más
   nuevo. Si el navegador está en otro lado, se le dice con la variable
   NAVEGADOR.

   Qué se prueba:
     lecciones  cada paso de cada lección, equivocándose y acertando en
                cada pregunta; que ningún dibujo delate la respuesta de su
                predicción; y que arranque el ejercicio de cada una.
     juegos     cada nivel del camino y de la pantalla de opciones de
                cada juego: que no salgan dos preguntas iguales seguidas
                ni la misma más de dos veces, que haya una sola respuesta
                correcta, que ningún texto diga «undefined» o «NaN», y que
                cada pregunta se pueda rearmar desde su clave (el repaso).
     trazos     que cada letra y cada número se pueda trazar entero, con
                un dedo lento y con uno rápido.
     partidas   jugar niveles enteros tocando los botones como un chico
                (y equivocándose), hasta la pantalla del final.
   En todas, además, que la página no tire ningún error.

   Termina con código 1 si algo falló: sirve para correrla antes de subir.
   ============================================================ */
import { levantarServidor, buscarNavegador, abrirNavegador } from './navegador.mjs';

const TODAS = ['lecciones', 'juegos', 'trazos', 'partidas'];
const pedidas = process.argv.slice(2).filter(a => TODAS.includes(a));
const QUE = pedidas.length ? pedidas : TODAS;

/* ---------------------- las pruebas (corren en la página) ---------------------- */

async function probarLecciones() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const fallas = [];
  const limpio = h => {
    const d = document.createElement('div');
    d.innerHTML = h;
    return (d.textContent + ' ' + [...d.querySelectorAll('[alt],[aria-label]')].map(e => e.getAttribute('alt') || e.getAttribute('aria-label')).join(' ')).replace(/\s+/g, ' ').trim();
  };
  for (const l of Lecciones.LECCIONES) {
    // la predicción no se puede contestar mirando el dibujo que tiene abajo
    l.pasos.forEach((p, i) => {
      if (!p.prediccion || !p.visual || p.prediccion.sinDibujo) return;
      const correcta = limpio(p.prediccion.opciones[p.prediccion.correcta]).toLowerCase();
      if (correcta && limpio(p.visual()).toLowerCase().includes(correcta)) fallas.push(l.id + ' paso ' + (i + 1) + ': el dibujo delata la predicción');
    });
    location.hash = '#/leccion/' + l.id;
    await sleep(160);
    for (let i = 0; i < l.pasos.length; i++) {
      const p = l.pasos[i];
      let cuerpo = document.getElementById('leccion-cuerpo');
      if (p.prediccion) {
        const mala = [...cuerpo.querySelectorAll('.leccion-opcion')].find(b => b.getAttribute('data-i') !== String(p.prediccion.correcta));
        if (!mala) { fallas.push(l.id + ' paso ' + (i + 1) + ': la predicción no tiene opciones'); break; }
        mala.click(); await sleep(80); cuerpo = document.getElementById('leccion-cuerpo');
      }
      if (p.visual && (!cuerpo.querySelector('.paso-visual') || !cuerpo.querySelector('.paso-visual').innerHTML.trim())) fallas.push(l.id + ' paso ' + (i + 1) + ': dibujo vacío');
      if (p.interactivo && !cuerpo.querySelector('.actividad')) fallas.push(l.id + ' paso ' + (i + 1) + ': falta la actividad');
      if (document.documentElement.scrollWidth > innerWidth + 1) fallas.push(l.id + ' paso ' + (i + 1) + ': se sale de la pantalla');
      if (/undefined|NaN/.test(cuerpo.textContent)) fallas.push(l.id + ' paso ' + (i + 1) + ': texto roto');
      if (p.practica) {
        const mala = [...cuerpo.querySelectorAll('.paso-practica .leccion-opcion')].find(b => b.getAttribute('data-i') !== String(p.practica.correcta));
        mala.click(); await sleep(50);
        cuerpo.querySelector('.paso-practica .leccion-opcion[data-i="' + p.practica.correcta + '"]').click(); await sleep(50);
      }
      const sig = document.getElementById('btn-leccion-siguiente');
      if (sig.hidden) { fallas.push(l.id + ' paso ' + (i + 1) + ': no se puede seguir'); break; }
      sig.click(); await sleep(90);
    }
    if (!document.querySelector('.paso-final')) fallas.push(l.id + ': no llega al final');
  }
  // el ejercicio de cada lección arranca con su primera pregunta
  for (const l of Lecciones.LECCIONES) {
    location.hash = '#/ejercicio/' + l.id; await sleep(700);
    const pres = document.getElementById('presenta');
    if (pres && !pres.hidden) { document.getElementById('presenta-saltar').click(); await sleep(300); }
    const texto = (document.getElementById('pregunta-texto') || {}).textContent || '';
    const hay = document.querySelectorAll('#zona-opciones button, #zona-opciones .trazo-lienzo, #zona-mapa svg').length;
    if (!texto.trim() || !hay) fallas.push(l.id + ': el ejercicio no arranca');
    if (window.Motor) Motor.abandonar();
  }
  location.hash = '#/';
  return { hechas: Lecciones.LECCIONES.length + ' lecciones', fallas };
}

async function probarJuegos() {
  const fallas = [];
  const roto = s => s !== undefined && s !== null && /undefined|NaN|\[object/.test(String(s));
  const materias = { geografia: window.Geografia, matematica: window.Matematica, lengua: window.Lengua, ciencias: window.Ciencias, ingles: window.Ingles, historia: window.Historia };
  let preguntas = 0, juegos = 0;
  for (const [mid, mod] of Object.entries(materias)) {
    if (!mod) { fallas.push(mid + ': no cargó'); continue; }
    for (const j of mod.JUEGOS) {
      juegos++;
      const nombre = mid + '/' + j.id;
      const falla = t => { if (fallas.length < 200) fallas.push(nombre + ' ' + t); };
      const g = j.ganchos();
      const tandas = [];
      const mapa = typeof j.mapa === 'function' ? j.mapa() : [];
      mapa.forEach(n => { for (let v = 0; v < 2; v++) tandas.push(['nivel ' + n.numero, n.preguntas()]); });
      (j.opciones ? j.opciones() : []).filter(o => o.esNivel).forEach(op => op.items.forEach(o => {
        const sel = { cantidad: 10 };
        sel[op.id] = o.id;
        tandas.push(['libre ' + o.id, j.preguntas(sel)]);
      }));
      for (const [donde, lista] of tandas) {
        if (!lista.length) { falla(donde + ': sin preguntas'); continue; }
        const veces = {};
        lista.forEach((it, k) => {
          veces[it.id] = (veces[it.id] || 0) + 1;
          if (k && it.id === lista[k - 1].id) falla(donde + ': «' + it.id + '» dos veces seguidas');
        });
        Object.keys(veces).forEach(id => { if (veces[id] > 2) falla(donde + ': «' + id + '» ' + veces[id] + ' veces'); });
        for (const it of lista) {
          preguntas++;
          try { j.montar(it); } catch (e) { falla(it.id + ': no se arma (' + e.message + ')'); continue; }
          const consigna = document.getElementById('pregunta-texto').innerHTML;
          const visual = document.getElementById('pregunta-visual').innerHTML;
          // en los juegos del mapa la botonera queda escondida (con los botones del juego anterior)
          const zona = document.getElementById('zona-opciones');
          const botones = zona.hidden ? [] : [...zona.querySelectorAll('[data-id]')];
          const correcta = String(it.respuesta !== undefined ? it.respuesta : it.r !== undefined ? it.r : '');
          if (botones.length && !it.__alReves) {
            const valores = botones.map(b => b.getAttribute('data-id'));
            // lo decide el juego; si no dice nada, como el motor: la respuesta es la pregunta misma (el país)
            const esBuena = v => g.esCorrecta ? g.esCorrecta(it, v) || g.esCorrecta(it, Number(v)) : v === String(it.id);
            const buenas = valores.filter(esBuena).length;
            if (buenas !== 1) falla(it.id + ': ' + buenas + ' respuestas correctas');
            if (new Set(valores).size !== valores.length) falla(it.id + ': botones repetidos');
            const rotulos = botones.map(b => b.textContent.trim() || b.getAttribute('aria-label') || (b.querySelector('[alt]') || {}).alt);
            if (new Set(rotulos).size !== rotulos.length) falla(it.id + ': dos botones dicen lo mismo');
            if (rotulos.some(roto)) falla(it.id + ': un botón dice ' + rotulos.find(roto));
            valores.filter(v => !esBuena(v)).forEach(v => {
              const r = typeof it.respuesta === 'number' ? Number(v) : v;
              if (g.textoFallo && roto(g.textoFallo(it, r))) falla(it.id + ': el aviso de error está roto');
            });
          }
          if (roto(consigna) || roto(visual)) falla(it.id + ': la pregunta dice ' + (roto(consigna) ? consigna : visual).slice(0, 60));
          const dichos = [g.textoAcierto && g.textoAcierto(it, it.respuesta), g.textoRevelado(it), g.pista && g.pista(it, 1), g.pista && g.pista(it, 2)];
          if (dichos.some(roto)) falla(it.id + ': un aviso está roto');
          const vuelta = mod.itemDeClave(it.id);
          if (!vuelta || vuelta.id !== it.id) falla(it.id + ': no se rearma desde su clave (el repaso la perdería)');
          // un país ('ar') lo puede preguntar cualquiera de los juegos del mapa: no tiene juego propio
          const dueño = mod.juegoDeClave(it.id);
          if (dueño !== j.id && !(dueño === null && String(it.id).indexOf(':') < 0)) falla(it.id + ': la clave apunta a otro juego');
          const rp = mod.repaso(it);
          if (!rp || roto(rp.nombre) || roto(rp.dato)) falla(it.id + ': la tarjeta del repaso está rota');
        }
      }
    }
  }
  location.hash = '#/';
  return { hechas: juegos + ' juegos, ' + preguntas + ' preguntas', fallas };
}

async function probarTrazos() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  location.hash = '#/nivel/lengua/trazar/1'; await sleep(1400);
  const pres = document.getElementById('presenta');
  if (pres && !pres.hidden) { document.getElementById('presenta-saltar').click(); await sleep(500); }
  const fallas = [];
  const original = Motor.responder;
  Motor.responder = () => {};
  try {
    for (const densidad of [60, 14]) {
      for (const forma of Object.keys(Trazo.FORMAS)) {
        Trazo.trazar({ forma, respuesta: forma, nombre: forma });
        const svg = document.querySelector('.trazo-lienzo');
        const ev = (t, c) => svg.dispatchEvent(new PointerEvent(t, { clientX: c.x, clientY: c.y, pointerId: 1, bubbles: true, pointerType: 'touch' }));
        for (const d of Trazo.FORMAS[forma]) {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', d);
          svg.appendChild(p);
          const largo = p.getTotalLength(), m = svg.getScreenCTM(), puntos = [];
          const n = Math.max(3, Math.round(densidad * largo / 120));
          for (let i = 0; i <= n; i++) {
            const q = p.getPointAtLength(largo * i / n), s = svg.createSVGPoint();
            s.x = q.x; s.y = q.y;
            puntos.push(s.matrixTransform(m));
          }
          p.remove();
          ev('pointerdown', puntos[0]);
          puntos.slice(1).forEach(c => ev('pointermove', c));
          ev('pointerup', puntos[puntos.length - 1]);
        }
        if (!svg.closest('.trazo').classList.contains('trazada')) fallas.push(forma + (densidad < 20 ? ' (con el dedo rápido)' : '') + ': no se completa');
      }
    }
  } finally {
    Motor.responder = original;
    Motor.abandonar();
    location.hash = '#/';
  }
  return { hechas: Object.keys(Trazo.FORMAS).length + ' formas', fallas };
}

/* Juega un nivel entero como un chico: toca el primer botón que haya (a
   veces está mal, a veces bien) hasta que la pregunta cambie; si es para
   trazar, traza. Tiene que llegar a la pantalla del final. */
async function probarPartida(ruta) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  location.hash = ruta; await sleep(1400);
  const pres = document.getElementById('presenta');
  if (pres && !pres.hidden) { document.getElementById('presenta-saltar').click(); await sleep(500); }
  const fallas = [];
  let toques = 0;
  const hasta = Date.now() + 120000;
  while (Date.now() < hasta && !/fin/.test(location.hash)) {
    const svg = document.querySelector('#zona-opciones .trazo-lienzo');
    if (svg && !svg.closest('.trazo').classList.contains('trazada')) {
      const forma = document.querySelector('#pregunta-texto b').textContent.trim();
      const ev = (t, c) => svg.dispatchEvent(new PointerEvent(t, { clientX: c.x, clientY: c.y, pointerId: 1, bubbles: true, pointerType: 'touch' }));
      for (const d of Trazo.FORMAS[forma]) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', d); svg.appendChild(p);
        const largo = p.getTotalLength(), m = svg.getScreenCTM();
        const puntos = Array.from({ length: 41 }, (x, i) => {
          const q = p.getPointAtLength(largo * i / 40), s = svg.createSVGPoint();
          s.x = q.x; s.y = q.y; return s.matrixTransform(m);
        });
        p.remove();
        ev('pointerdown', puntos[0]); puntos.slice(1).forEach(c => ev('pointermove', c)); ev('pointerup', puntos[40]);
      }
      toques++;
      await sleep(400);
      continue;
    }
    const boton = [...document.querySelectorAll('#zona-opciones .btn-opcion')].find(b => !b.disabled);
    if (boton && Motor.libre()) { boton.click(); toques++; }
    await sleep(250);
  }
  if (!/fin/.test(location.hash)) {
    const botones = [...document.querySelectorAll('#zona-opciones button')];
    fallas.push(ruta + ': no llegó al final. Quedó en ' + location.hash + ', «' + (document.getElementById('pregunta-texto') || {}).textContent +
      '», ' + botones.filter(b => !b.disabled).length + ' de ' + botones.length + ' botones libres, forma ' +
      document.getElementById('zona-opciones').getAttribute('data-forma') + (window.Motor && Motor.libre() ? '' : ', el juego no espera respuesta'));
  }
  const resultado = (document.getElementById('pantalla-nivel-fin') || document.body).textContent;
  if (/undefined|NaN/.test(resultado)) fallas.push(ruta + ': la pantalla del final dice algo roto');
  location.hash = '#/';
  await sleep(300);
  return { hechas: ruta + ' (' + toques + ' toques)', fallas };
}

/* ---------------------- el orden de todo ---------------------- */

const PARTIDAS = ['#/nivel/matematica/cuentas/1', '#/nivel/lengua/rimas/1', '#/nivel/ciencias/sonidos/1',
                  '#/nivel/historia/fechas/1', '#/nivel/matematica/dinero/1', '#/nivel/lengua/trazar/1'];

async function principal() {
  const ejecutable = buscarNavegador();
  if (!ejecutable) {
    console.error('No encontré Edge ni Chrome. Decime dónde está con la variable NAVEGADOR.');
    process.exit(2);
  }
  const servidor = await levantarServidor();
  const base = 'http://127.0.0.1:' + servidor.address().port;
  const nav = await abrirNavegador(ejecutable);
  let malas = 0;
  const informar = (nombre, r, errores) => {
    const fallas = r.fallas.concat(errores.map(e => 'error de la página: ' + e));
    const unicas = [...new Set(fallas)];
    malas += unicas.length;
    console.log((unicas.length ? '✗ ' : '✓ ') + nombre + ' — ' + r.hechas + (unicas.length ? ', ' + unicas.length + ' problemas' : ''));
    unicas.slice(0, 15).forEach(f => console.log('    ' + f));
    if (unicas.length > 15) console.log('    … y ' + (unicas.length - 15) + ' más');
  };
  try {
    for (const prueba of QUE) {
      const edad = prueba === 'trazos' || prueba === 'partidas' ? 5 : 9;
      await nav.ir(base + '/__perfil?edad=' + edad);
      nav.errores.length = 0;
      const inicio = Date.now();
      if (prueba === 'partidas') {
        for (const ruta of PARTIDAS) {
          await nav.ir(base + '/__perfil?edad=' + edad);
          nav.errores.length = 0;
          informar('partida', await nav.correr(probarPartida, ruta), nav.errores.splice(0));
        }
        continue;
      }
      const fn = { lecciones: probarLecciones, juegos: probarJuegos, trazos: probarTrazos }[prueba];
      const r = await nav.correr(fn);
      informar(prueba + ' (' + Math.round((Date.now() - inicio) / 1000) + ' s)', r, nav.errores.splice(0));
    }
  } catch (e) {
    console.error('✗ la prueba se cortó: ' + e.message);
    malas++;
  } finally {
    nav.cerrar();
    servidor.close();
  }
  console.log(malas ? '\n' + malas + ' problemas.' : '\nTodo bien.');
  process.exit(malas ? 1 : 0);
}

principal();
