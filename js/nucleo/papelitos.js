/* ============================================================
   Los papelitos del festejo

   Cuando un chico pasa un nivel, la pantalla le decía «¡Nivel 3
   superado!» y le prendía las estrellas. Está bien, pero es un cartel:
   lo mismo que le diría una app de gimnasia. Faltaba la parte que no se
   lee, la que hace que quiera volver a pasar el siguiente.

   Esto tira papelitos de colores sobre la pantalla: veinticuatro
   rectangulitos que caen, giran y se van. Duran poco más de dos
   segundos y desaparecen solos.

   Tres cosas a propósito:

     - Van en una capa fija que NO recibe toques, así que un chico
       puede apretar «Seguir» mientras todavía están cayendo. Un
       festejo que hay que esperar deja de ser un premio.

     - Cada papelito sale con su posición, su color, su tamaño, su
       demora y su giro sorteados. Con valores fijos la segunda vez que
       lo ves ya sabés qué va a pasar y se siente barato.

     - Con «reducir movimiento» puesto en el sistema no se dibuja
       ninguno. No alcanza con que la animación dure cero: serían
       veinticuatro manchas quietas tapando la pantalla.
   ============================================================ */
window.Papelitos = (function () {
  'use strict';

  /* Los mismos colores de premio que usa el resto de la app. El verde
     de «acertaste» y el rojo de «erraste» quedan afuera: acá no
     significan nada y mezclados con los otros los desgastan. */
  var COLORES = [
    '#fbbf24', '#f59e0b', '#60a5fa', '#3b82f6',
    '#a78bfa', '#f472b6', '#2dd4bf', '#fde047'
  ];

  var CUANTOS = 24;
  var CAPA = null;
  var RELOJ = null;

  function quietos() {
    return window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function entre(min, max) { return min + Math.random() * (max - min); }

  /** Tira papelitos sobre toda la pantalla. Llamarla de nuevo reinicia. */
  function festejar() {
    if (quietos()) return;
    limpiar();

    CAPA = document.createElement('div');
    CAPA.className = 'papelitos';
    CAPA.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < CUANTOS; i++) {
      var p = document.createElement('i');
      p.style.left = entre(2, 98).toFixed(1) + '%';
      p.style.background = COLORES[i % COLORES.length];
      p.style.width = entre(7, 13).toFixed(0) + 'px';
      p.style.height = entre(9, 18).toFixed(0) + 'px';
      /* la mitad redondos, la mitad rectangulares: dos formas mezcladas
         se leen como papel picado y una sola como una grilla */
      if (i % 2) p.style.borderRadius = '50%';
      p.style.animationDelay = entre(0, 0.55).toFixed(2) + 's';
      p.style.animationDuration = entre(1.6, 2.4).toFixed(2) + 's';
      p.style.setProperty('--giro', Math.round(entre(-520, 520)) + 'deg');
      p.style.setProperty('--corrida', Math.round(entre(-70, 70)) + 'px');
      CAPA.appendChild(p);
    }

    document.body.appendChild(CAPA);
    RELOJ = setTimeout(limpiar, 3200);
  }

  function limpiar() {
    if (RELOJ) { clearTimeout(RELOJ); RELOJ = null; }
    if (CAPA && CAPA.parentNode) CAPA.parentNode.removeChild(CAPA);
    CAPA = null;
  }

  return { festejar: festejar, limpiar: limpiar };
})();
