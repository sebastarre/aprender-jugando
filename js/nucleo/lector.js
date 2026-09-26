/* ============================================================
   El lector: la voz que lee las preguntas de los juegos.

   Un chico de cuatro o cinco años todavía no lee, y la mitad de los
   juegos preguntan con palabras («¿Qué palabra rima con gato?»). Sin
   voz, esos juegos eran para que los jugara un grande al lado.

     - De 4 a 7 (el registro de los chicos) cada pregunta se lee sola al
       aparecer. Si las respuestas son palabras o frases, después de la
       pregunta se lee cada una, y el botón de la que se está diciendo se
       marca: así el que no lee sabe cuál es cuál. También se lee lo que
       se le dice al errar, las pistas y el «era ésta», que es donde está
       lo que hay que aprender.
     - De 8 a 12 no se lee nada solo, pero el parlantito de al lado de la
       pregunta la lee cuando se lo toca.

   No se le pide el texto a cada juego: se escucha el cartel de la
   pregunta, así sirve para los cincuenta juegos sin tocar ninguno.
   ============================================================ */
window.Lector = (function () {
  'use strict';

  var auto = false;           // leer sola cada pregunta nueva
  var conOpciones = false;    // y después sus respuestas, si son palabras
  var observadores = [];
  var espera = null, esperaAviso = null;
  var resaltado = null;

  function vozActiva() { return Voz.hay() && Almacen.vozActiva(); }

  /** Arranca a escuchar la pantalla de juego. */
  function prender(opciones) {
    apagar();
    opciones = opciones || {};
    auto = !!opciones.auto;
    conOpciones = !!opciones.opciones;
    var boton = Util.$('btn-escuchar');
    if (boton) boton.hidden = !Voz.hay();
    if (!auto || !vozActiva() || !window.MutationObserver) return;

    var cartel = Util.$('pregunta-texto');
    var o1 = new MutationObserver(function () {
      clearTimeout(espera);
      // la primera pregunta se arma dos veces seguidas: se lee una sola
      espera = setTimeout(function () { leer(false); }, 160);
    });
    o1.observe(cartel, { childList: true, characterData: true, subtree: true });

    var aviso = Util.$('aviso');
    var o2 = new MutationObserver(function () {
      clearTimeout(esperaAviso);
      esperaAviso = setTimeout(function () {
        /* También cuando se equivoca: «¡Buen intento! ¡Probá otra vez!»
           dicho en voz alta es lo que haría un grande al lado, y el que
           todavía no lee no tiene otra manera de enterarse. */
        if (/\b(mal|pista|dato)\b/.test(aviso.className) && aviso.textContent.trim()) {
          quitarResaltado();
          Voz.decir(aviso.innerHTML);
        }
      }, 60);
    });
    o2.observe(aviso, { attributes: true, attributeFilter: ['class'], childList: true });
    observadores = [o1, o2];
  }

  function apagar() {
    observadores.forEach(function (o) { o.disconnect(); });
    observadores = [];
    clearTimeout(espera);
    clearTimeout(esperaAviso);
    quitarResaltado();
    auto = false;
    conOpciones = false;
  }

  /** Las respuestas que vale la pena leer: las que son palabras o frases. */
  function opcionesParaLeer() {
    var zona = Util.$('zona-opciones');
    if (!zona || zona.hidden) return [];
    var forma = zona.getAttribute('data-forma');
    if (forma !== 'palabra' && forma !== 'frase') return [];
    return Array.prototype.slice.call(zona.querySelectorAll('.btn-opcion:not(:disabled)'));
  }

  function resaltar(boton) {
    quitarResaltado();
    if (!boton) return;
    resaltado = boton;
    boton.classList.add('leyendo');
  }

  function quitarResaltado() {
    if (resaltado) resaltado.classList.remove('leyendo');
    resaltado = null;
  }

  /**
   * Lee la pregunta de ahora. `aMano` es el parlantito: ése lee aunque la
   * voz automática esté apagada en Configuración, porque lo pidió el chico.
   */
  function leer(aMano) {
    if (aMano ? !Voz.hay() : !vozActiva()) return;
    var cartel = Util.$('pregunta-texto');
    if (!cartel || !cartel.textContent.trim()) return;
    var partes = [cartel.innerHTML];
    var botones = (conOpciones || (aMano && esChico())) ? opcionesParaLeer() : [];
    botones.forEach(function (b) { partes.push(b.innerHTML); });
    Voz.decir(partes, {
      pausa: botones.length ? 0.25 : 0,
      alEmpezarParte: botones.length ? function (i) { resaltar(i > 0 ? botones[i - 1] : null); } : null,
      alTerminar: quitarResaltado
    });
  }

  function esChico() { return document.documentElement.classList.contains('registro-chico'); }

  /* Al contestar se deja de leer: la voz no puede seguir nombrando
     opciones cuando la pregunta ya se respondió. */
  document.addEventListener('DOMContentLoaded', function () {
    var zona = Util.$('zona-opciones');
    if (zona) zona.addEventListener('click', function (ev) {
      if (!ev.target.closest('.btn-opcion')) return;
      if (resaltado || Voz.leyendo()) { Voz.parar(); quitarResaltado(); }
    }, true);
    var boton = Util.$('btn-escuchar');
    if (boton) boton.addEventListener('click', function () {
      Sonido.despertar();
      leer(true);
    });
  });

  return { prender: prender, apagar: apagar, leer: leer };
})();
