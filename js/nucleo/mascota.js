/* ============================================================
   Pipo, el zorrito de la app.

   Aparece donde hace falta una cara: la bienvenida, el final de una
   partida y las pantallas que están vacías porque el chico todavía no
   hizo nada. Una app para chicos sin un personaje se siente como un
   formulario con colores.

   Tiene colores propios y fijos, a propósito: no sigue la paleta que
   el chico elija. Un zorro que a veces es verde y a veces violeta deja
   de ser un personaje y pasa a ser una decoración más. Lo único que
   cambia son los gestos.

   Gestos: 'hola' (saludando), 'festejo' (ojos cerrados de contento),
   'piensa' (mirando al costado) y 'ups' (para cuando salió mal).
   ============================================================ */
window.Mascota = (function () {
  'use strict';

  var PELO = '#f97316';
  var PELO_OSC = '#c2410c';
  var CREMA = '#fff7ed';
  var OREJA = '#fda4af';
  var CACHETE = '#fb7185';
  var OJO = '#3b1a06';

  /* Los ojos y la boca son lo único que cambia entre gestos. */
  var GESTOS = {
    hola: {
      ojos: '<circle cx="45" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<circle cx="75" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<circle cx="46.8" cy="56.2" r="1.8" fill="#fff"/>' +
            '<circle cx="76.8" cy="56.2" r="1.8" fill="#fff"/>',
      boca: '<path d="M53 78q7 6 14 0" fill="none" stroke="' + OJO +
            '" stroke-width="3.4" stroke-linecap="round"/>'
    },
    festejo: {
      // ojos cerrados hacia arriba: la cara de estar contento de verdad
      ojos: '<path d="M39 59q6-8 12 0M69 59q6-8 12 0" fill="none" stroke="' + OJO +
            '" stroke-width="3.8" stroke-linecap="round"/>',
      boca: '<path d="M50 76q10 11 20 0z" fill="' + OJO + '"/>' +
            '<path d="M55 82q5 4 10 0" fill="' + CACHETE + '"/>'
    },
    piensa: {
      ojos: '<circle cx="48" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<circle cx="78" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<circle cx="49.8" cy="56.2" r="1.8" fill="#fff"/>' +
            '<circle cx="79.8" cy="56.2" r="1.8" fill="#fff"/>',
      boca: '<path d="M54 79h12" fill="none" stroke="' + OJO +
            '" stroke-width="3.4" stroke-linecap="round"/>'
    },
    ups: {
      ojos: '<circle cx="45" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<circle cx="75" cy="58" r="5.4" fill="' + OJO + '"/>' +
            '<path d="M37 48q7-4 14 0M69 48q7-4 14 0" fill="none" stroke="' + OJO +
            '" stroke-width="3" stroke-linecap="round"/>',
      boca: '<path d="M53 81q7-6 14 0" fill="none" stroke="' + OJO +
            '" stroke-width="3.4" stroke-linecap="round"/>'
    }
  };

  function svg(gesto) {
    var g = GESTOS[gesto] || GESTOS.hola;
    return '' +
      '<svg class="mascota-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
        /* orejas */
        '<path d="M26 46 30 12l28 20z" fill="' + PELO_OSC + '"/>' +
        '<path d="M94 46 90 12 62 32z" fill="' + PELO_OSC + '"/>' +
        '<path d="M33 40 35.5 22l14.5 10z" fill="' + OREJA + '"/>' +
        '<path d="M87 40 84.5 22 70 32z" fill="' + OREJA + '"/>' +
        /* cabeza */
        '<path d="M18 56c0-22 18-32 42-32s42 10 42 32c0 26-19 44-42 44S18 82 18 56Z" fill="' + PELO + '"/>' +
        /* la mancha clara de la cara */
        '<path d="M60 44c16 0 26 10 26 24 0 18-12 30-26 30S34 86 34 68c0-14 10-24 26-24Z" fill="' + CREMA + '"/>' +
        '<circle cx="31" cy="70" r="7.5" fill="' + CACHETE + '" opacity=".55"/>' +
        '<circle cx="89" cy="70" r="7.5" fill="' + CACHETE + '" opacity=".55"/>' +
        g.ojos +
        /* hocico */
        '<path d="M60 66c4 0 6.4 2.4 6.4 5 0 3-2.8 5-6.4 5s-6.4-2-6.4-5c0-2.6 2.4-5 6.4-5Z" fill="' + OJO + '"/>' +
        g.boca +
      '</svg>';
  }

  /**
   * Devuelve la mascota lista para meter en el DOM.
   * `clase` sirve para darle un tamaño distinto según la pantalla.
   */
  function crear(gesto, clase) {
    var caja = document.createElement('div');
    caja.className = 'mascota' + (clase ? ' ' + clase : '');
    caja.innerHTML = svg(gesto);
    return caja;
  }

  /** Cambia el gesto de una mascota que ya está en pantalla. */
  function gesto(caja, cual) {
    if (caja) caja.innerHTML = svg(cual);
  }

  /** Reemplaza todo [data-mascota="gesto"] por el dibujo. */
  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-mascota]');
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].innerHTML = svg(nodos[i].getAttribute('data-mascota'));
      nodos[i].classList.add('mascota');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return { crear: crear, gesto: gesto, hidratar: hidratar, GESTOS: GESTOS };
})();
