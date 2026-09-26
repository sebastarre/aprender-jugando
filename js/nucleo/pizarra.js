/* ============================================================
   La pizarra: un lugar para hacer la cuenta a mano.

   Abajo de las respuestas, en los juegos de tarjetas. Una suma de dos
   cifras no se hace de memoria a los siete años: se hace en columna, en
   un papel. Sin papel, el chico elegía al azar entre cuatro números.

   Se borra sola cuando aparece otra pregunta, porque lo de la anterior ya
   no sirve y un chico no se acuerda de borrar. En los juegos del mapa no
   aparece: ahí el mapa ocupa la pantalla y no hay cuentas que hacer.

   Los trazos se guardan como listas de puntos y no sólo pintados en el
   lienzo: así se puede deshacer el último, y si la pantalla cambia de
   tamaño (el celular que se gira) se vuelven a dibujar en vez de perderse.
   ============================================================ */
window.Pizarra = (function () {
  'use strict';

  var GROSOR = { lapiz: 4, goma: 28 };

  var caja, lienzo, pincel;
  var trazos = [];
  var actual = null;          // el trazo que se está haciendo
  var dedo = null;            // qué dedo o lápiz lo está haciendo
  var herramienta = 'lapiz';
  var color = '#27304A';
  var ancho = 0, alto = 0;

  function iniciar() {
    caja = Util.$('pizarra');
    lienzo = Util.$('pizarra-lienzo');
    if (!caja || !lienzo || !lienzo.getContext) return;
    pincel = lienzo.getContext('2d');

    lienzo.addEventListener('pointerdown', empezar);
    lienzo.addEventListener('pointermove', mover);
    lienzo.addEventListener('pointerup', terminar);
    lienzo.addEventListener('pointercancel', terminar);

    caja.querySelectorAll('[data-color]').forEach(function (b) {
      b.addEventListener('click', function () { elegir('lapiz', b.getAttribute('data-color')); });
    });
    caja.querySelector('[data-herramienta="goma"]').addEventListener('click', function () {
      elegir('goma');
    });
    Util.$('pizarra-deshacer').addEventListener('click', deshacer);
    Util.$('pizarra-borrar').addEventListener('click', borrar);

    if (window.ResizeObserver) new ResizeObserver(ajustarTamano).observe(lienzo);
    else window.addEventListener('resize', ajustarTamano);

    /* Aparece con la botonera de respuestas y se va con ella: el mapa
       usa la otra zona, y ahí la pizarra sólo empujaría el mapa. Y sólo
       si la pregunta es de hacer cuentas (la botonera lo dice con
       data-pizarra): debajo de «¿con qué letra empieza?» no sirve. */
    var opciones = Util.$('zona-opciones');
    new MutationObserver(sincronizar).observe(opciones, { attributes: true, attributeFilter: ['hidden', 'data-pizarra'] });

    /* Pregunta nueva, pizarra limpia. */
    new MutationObserver(function () { if (trazos.length) borrar(); })
      .observe(Util.$('pregunta-texto'), { childList: true, characterData: true, subtree: true });

    sincronizar();
    pintarBotones();
  }

  function sincronizar() {
    var opciones = Util.$('zona-opciones');
    caja.hidden = opciones.hidden || opciones.getAttribute('data-pizarra') !== 'si';
    if (!caja.hidden) ajustarTamano();
  }

  /* ---------------------- tamaño ---------------------- */

  /* El lienzo se dibuja a la densidad de la pantalla: sin esto, en un
     celular con pantalla de alta definición la letra sale borrosa. */
  function ajustarTamano() {
    var r = lienzo.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (Math.round(r.width) === ancho && Math.round(r.height) === alto) return;
    ancho = Math.round(r.width);
    alto = Math.round(r.height);
    var densidad = window.devicePixelRatio || 1;
    lienzo.width = Math.round(ancho * densidad);
    lienzo.height = Math.round(alto * densidad);
    pincel.setTransform(densidad, 0, 0, densidad, 0, 0);
    redibujar();
  }

  /* ---------------------- dibujar ---------------------- */

  function punto(ev) {
    var r = lienzo.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  function empezar(ev) {
    if (actual) return;                    // un segundo dedo no dibuja
    ev.preventDefault();
    dedo = ev.pointerId;
    try { lienzo.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
    actual = { herramienta: herramienta, color: color, grosor: GROSOR[herramienta], puntos: [punto(ev)] };
    trazos.push(actual);
    dibujar(actual, 0);
    pintarBotones();
  }

  function mover(ev) {
    if (!actual || ev.pointerId !== dedo) return;
    ev.preventDefault();
    var desde = actual.puntos.length - 1;
    // los movimientos que el navegador juntó entre dos cuadros: sin ellos,
    // un trazo rápido sale en rayitas rectas
    var eventos = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [];
    if (!eventos.length) eventos = [ev];
    eventos.forEach(function (e) { actual.puntos.push(punto(e)); });
    dibujar(actual, desde);
  }

  function terminar(ev) {
    if (!actual || ev.pointerId !== dedo) return;
    actual = null;
    dedo = null;
  }

  /** Dibuja un trazo desde el punto `desde` en adelante. */
  function dibujar(trazo, desde) {
    var p = trazo.puntos;
    pincel.save();
    // la goma saca tinta del lienzo; la cuadrícula es el fondo, y queda
    pincel.globalCompositeOperation = trazo.herramienta === 'goma' ? 'destination-out' : 'source-over';
    pincel.strokeStyle = trazo.color;
    pincel.fillStyle = trazo.color;
    pincel.lineWidth = trazo.grosor;
    pincel.lineCap = 'round';
    pincel.lineJoin = 'round';
    if (p.length === 1) {
      pincel.beginPath();
      pincel.arc(p[0].x, p[0].y, trazo.grosor / 2, 0, Math.PI * 2);
      pincel.fill();
    } else {
      pincel.beginPath();
      pincel.moveTo(p[Math.max(0, desde)].x, p[Math.max(0, desde)].y);
      for (var i = Math.max(1, desde + 1); i < p.length; i++) pincel.lineTo(p[i].x, p[i].y);
      pincel.stroke();
    }
    pincel.restore();
  }

  function redibujar() {
    pincel.clearRect(0, 0, ancho, alto);
    trazos.forEach(function (t) { dibujar(t, 0); });
  }

  /* ---------------------- herramientas ---------------------- */

  function elegir(cual, nuevoColor) {
    herramienta = cual;
    if (nuevoColor) color = nuevoColor;
    if (window.Sonido) Sonido.tocar('clic');
    pintarBotones();
  }

  function deshacer() {
    if (!trazos.length) return;
    trazos.pop();
    redibujar();
    pintarBotones();
  }

  function borrar() {
    trazos = [];
    actual = null;
    if (pincel) pincel.clearRect(0, 0, ancho, alto);
    pintarBotones();
  }

  function pintarBotones() {
    if (!caja) return;
    caja.querySelectorAll('[data-color]').forEach(function (b) {
      b.setAttribute('aria-pressed', herramienta === 'lapiz' && b.getAttribute('data-color') === color ? 'true' : 'false');
    });
    caja.querySelector('[data-herramienta="goma"]').setAttribute('aria-pressed', herramienta === 'goma' ? 'true' : 'false');
    Util.$('pizarra-deshacer').disabled = !trazos.length;
    Util.$('pizarra-borrar').disabled = !trazos.length;
  }

  iniciar();

  return {
    borrar: borrar,
    /** Para las pruebas: cuántos trazos hay. */
    cuantosTrazos: function () { return trazos.length; }
  };
})();
