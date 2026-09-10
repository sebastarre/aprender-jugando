/* ============================================================
   La mascota de la app: un gato o un perro, con disfraz.

   Aparece donde hace falta una cara: la bienvenida, el final de una
   partida y las pantallas vacías. Una app para chicos sin un personaje
   se siente como un formulario con colores.

   Tres cosas se pueden cambiar, y son independientes entre sí:

     base     'gato' o 'perro'. Lo elige el chico y no se compra.
     disfraz  la cabeza de otro animal puesta encima. Tres son gratis
              y el resto se compran en la tienda.
     gesto    la cara: 'hola', 'festejo', 'piensa', 'ups'. No lo elige
              nadie, sale de lo que está pasando en la app.

   El animal tiene colores propios y fijos, a propósito: no sigue la
   paleta que el chico arme. Un gato que a veces es verde y a veces
   violeta deja de ser un personaje y pasa a ser una decoración más.
   Los disfraces sí traen sus colores, que para eso son disfraces.
   ============================================================ */
window.Mascota = (function () {
  'use strict';

  var OJO = '#3b1a06';
  var CACHETE = '#fb7185';

  /* ---------------------- los dos animales ---------------------- */
  var BASES = {
    gato: {
      nombre: 'Gato',
      pelo: '#f59e0b', peloOsc: '#b45309', crema: '#fffbeb',
      /* orejas en punta, bien de gato */
      orejas: '<path d="M25 44 29 11l29 21z" fill="{peloOsc}"/>' +
              '<path d="M95 44 91 11 62 32z" fill="{peloOsc}"/>' +
              '<path d="M33 39 35.5 21l14 11z" fill="#fda4af"/>' +
              '<path d="M87 39 84.5 21l-14 11z" fill="#fda4af"/>',
      /* bigotes: es lo que lo hace gato de un vistazo */
      extra: '<path d="M22 66h13M22 73h13M98 66H85M98 73H85" stroke="{peloOsc}" ' +
             'stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".75"/>',
      hocico: '<path d="M60 66c3.6 0 5.8 2.2 5.8 4.4 0 2.6-2.6 4.4-5.8 4.4s-5.8-1.8-5.8-4.4c0-2.2 2.2-4.4 5.8-4.4Z"/>'
    },
    perro: {
      nombre: 'Perro',
      pelo: '#c2874f', peloOsc: '#8b5a2b', crema: '#fff7ed',
      /* orejas caídas, largas a los costados */
      orejas: '<path d="M24 40c-9 4-11 22-6 34 4 10 13 12 17 6 4-7-2-16-1-26 1-8-3-16-10-14Z" fill="{peloOsc}"/>' +
              '<path d="M96 40c9 4 11 22 6 34-4 10-13 12-17 6-4-7 2-16 1-26-1-8 3-16 10-14Z" fill="{peloOsc}"/>',
      extra: '',
      hocico: '<path d="M60 65c4.6 0 7.4 2.6 7.4 5.2 0 3-3.2 5.2-7.4 5.2s-7.4-2.2-7.4-5.2c0-2.6 2.8-5.2 7.4-5.2Z"/>'
    }
  };

  /* ---------------------- los disfraces ----------------------
     `atras` se dibuja antes que la cabeza (melenas, capuchas) y
     `adelante` después (orejas, cuernos, antenas). */
  var DISFRACES = {
    ninguno: { nombre: 'Sin disfraz', precio: 0, atras: '', adelante: '' },

    conejo: {
      nombre: 'Conejo', precio: 0,
      atras: '<path d="M40 30c-4-16-2-26 3-26s9 10 8 25z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>' +
             '<path d="M80 30c4-16 2-26-3-26s-9 10-8 25z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>' +
             '<path d="M43 27c-2.6-11-1.6-18 1-18s5 7 4.4 17z" fill="#fbcfe8"/>' +
             '<path d="M77 27c2.6-11 1.6-18-1-18s-5 7-4.4 17z" fill="#fbcfe8"/>',
      adelante: ''
    },

    leon: {
      nombre: 'León', precio: 0,
      atras: '<g fill="#d97706">' +
             '<circle cx="60" cy="16" r="13"/><circle cx="30" cy="30" r="14"/>' +
             '<circle cx="90" cy="30" r="14"/><circle cx="16" cy="60" r="14"/>' +
             '<circle cx="104" cy="60" r="14"/><circle cx="28" cy="90" r="13"/>' +
             '<circle cx="92" cy="90" r="13"/><circle cx="60" cy="102" r="13"/>' +
             '</g>',
      adelante: ''
    },

    rana: {
      nombre: 'Rana', precio: 0,
      atras: '',
      adelante: '<circle cx="38" cy="22" r="13" fill="#4ade80" stroke="#16a34a" stroke-width="2.5"/>' +
                '<circle cx="82" cy="22" r="13" fill="#4ade80" stroke="#16a34a" stroke-width="2.5"/>' +
                '<circle cx="38" cy="22" r="5" fill="#111"/><circle cx="82" cy="22" r="5" fill="#111"/>' +
                '<circle cx="39.6" cy="20" r="1.8" fill="#fff"/><circle cx="83.6" cy="20" r="1.8" fill="#fff"/>'
    },

    dino: {
      nombre: 'Dinosaurio', precio: 90,
      atras: '<path d="M60 2 70 18H50Z" fill="#22c55e"/>' +
             '<path d="M34 12 46 26 28 30Z" fill="#22c55e"/>' +
             '<path d="M86 12 74 26l18 4Z" fill="#22c55e"/>',
      adelante: '<path d="M26 44c0-14 14-22 34-22s34 8 34 22c0 4-2 7-5 7H31c-3 0-5-3-5-7Z" ' +
                'fill="#16a34a" opacity=".92"/>' +
                '<path d="M42 40h6M56 38h8M72 40h6" stroke="#bbf7d0" stroke-width="3" stroke-linecap="round"/>'
    },

    panda: {
      nombre: 'Panda', precio: 90,
      atras: '<circle cx="30" cy="24" r="16" fill="#1f2937"/>' +
             '<circle cx="90" cy="24" r="16" fill="#1f2937"/>',
      adelante: '<path d="M26 46c0-13 15-20 34-20s34 7 34 20c0 3-2 5-4 5H30c-2 0-4-2-4-5Z" fill="#f8fafc"/>' +
                '<circle cx="30" cy="24" r="9" fill="#374151"/><circle cx="90" cy="24" r="9" fill="#374151"/>'
    },

    tiburon: {
      nombre: 'Tiburón', precio: 110,
      atras: '<path d="M60 0c10 8 15 20 16 32H44c1-12 6-24 16-32Z" fill="#60a5fa"/>',
      adelante: '<path d="M22 48c0-16 17-26 38-26s38 10 38 26c0 4-3 6-6 6H28c-3 0-6-2-6-6Z" fill="#3b82f6"/>' +
                '<path d="M26 50h68l-5 7-6-7-6 7-6-7-6 7-6-7-6 7-6-7-6 7-6-7-4 5Z" fill="#f8fafc"/>'
    },

    abeja: {
      nombre: 'Abeja', precio: 120,
      atras: '<ellipse cx="24" cy="52" rx="17" ry="24" fill="#bae6fd" opacity=".85" transform="rotate(-24 24 52)"/>' +
             '<ellipse cx="96" cy="52" rx="17" ry="24" fill="#bae6fd" opacity=".85" transform="rotate(24 96 52)"/>',
      adelante: '<path d="M44 24c-5-9-9-12-13-11M76 24c5-9 9-12 13-11" stroke="#111" stroke-width="3" ' +
                'fill="none" stroke-linecap="round"/>' +
                '<circle cx="30" cy="11" r="5" fill="#facc15" stroke="#111" stroke-width="2"/>' +
                '<circle cx="90" cy="11" r="5" fill="#facc15" stroke="#111" stroke-width="2"/>' +
                '<path d="M28 44c0-11 14-18 32-18s32 7 32 18c0 3-2 5-4 5H32c-2 0-4-2-4-5Z" fill="#facc15"/>' +
                '<path d="M44 30v18M60 27v22M76 30v18" stroke="#111" stroke-width="5" stroke-linecap="round"/>'
    },

    unicornio: {
      nombre: 'Unicornio', precio: 160,
      atras: '<path d="M60 0 68 30H52Z" fill="#fbbf24"/>' +
             '<path d="M60 4 55 30h10Z" fill="#fde68a"/>',
      adelante: '<path d="M30 42c6-12 18-18 30-18s24 6 30 18c1 3-1 6-4 6H34c-3 0-5-3-4-6Z" fill="#f0abfc"/>' +
                '<path d="M36 44c3-7 10-12 12-13M52 42c2-8 6-13 8-14M68 42c1-8 4-13 6-14M84 44c-2-8-6-12-8-13" ' +
                'stroke="#a855f7" stroke-width="3" fill="none" stroke-linecap="round"/>'
    }
  };

  /* ---------------------- las caras ---------------------- */
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

  /* Los dibujos de las orejas traen {pelo} y {peloOsc} en vez del color,
     porque el mismo dibujo sirve para el gato y para el perro. */
  function pintar(plantilla, base) {
    return plantilla
      .split('{peloOsc}').join(base.peloOsc)
      .split('{pelo}').join(base.pelo)
      .split('{crema}').join(base.crema);
  }

  function svg(gesto, baseId, disfrazId) {
    var base = BASES[baseId] || BASES.gato;
    var traje = DISFRACES[disfrazId] || DISFRACES.ninguno;
    var g = GESTOS[gesto] || GESTOS.hola;

    /* Con disfraz las orejas propias no se dibujan: el conejo no tiene
       que asomar orejas de gato abajo de las suyas. */
    var conDisfraz = !!(traje.atras || traje.adelante);

    return '' +
      '<svg class="mascota-svg" viewBox="-4 -4 128 128" aria-hidden="true" focusable="false">' +
        traje.atras +
        (conDisfraz ? '' : pintar(base.orejas, base)) +
        '<path d="M18 56c0-22 18-32 42-32s42 10 42 32c0 26-19 44-42 44S18 82 18 56Z" fill="' + base.pelo + '"/>' +
        '<path d="M60 44c16 0 26 10 26 24 0 18-12 30-26 30S34 86 34 68c0-14 10-24 26-24Z" fill="' + base.crema + '"/>' +
        '<circle cx="31" cy="70" r="7.5" fill="' + CACHETE + '" opacity=".5"/>' +
        '<circle cx="89" cy="70" r="7.5" fill="' + CACHETE + '" opacity=".5"/>' +
        pintar(base.extra, base) +
        g.ojos +
        '<g fill="' + OJO + '">' + base.hocico + '</g>' +
        g.boca +
        traje.adelante +
      '</svg>';
  }

  /* ---------------------- lo que está puesto ----------------------
     Se lee del almacén, así cada chico tiene el suyo. Si todavía no
     eligió nada, gato sin disfraz. */
  function baseElegida() {
    return (window.Almacen && Almacen.equipado && Almacen.equipado('mascota')) || 'gato';
  }

  function disfrazElegido() {
    return (window.Almacen && Almacen.equipado && Almacen.equipado('disfraz')) || 'ninguno';
  }

  /** La mascota lista para meter en el DOM, con lo que el chico tenga puesto. */
  function crear(gesto, clase) {
    var caja = document.createElement('div');
    caja.className = 'mascota' + (clase ? ' ' + clase : '');
    caja.innerHTML = svg(gesto, baseElegida(), disfrazElegido());
    return caja;
  }

  /** Cambia el gesto de una mascota que ya está en pantalla. */
  function gesto(caja, cual) {
    if (caja) caja.innerHTML = svg(cual, baseElegida(), disfrazElegido());
  }

  /** Para la vista previa de la tienda: un animal y un disfraz sueltos. */
  function vista(baseId, disfrazId, gestoId) {
    return svg(gestoId || 'hola', baseId, disfrazId);
  }

  /** Vuelve a dibujar todas las mascotas que haya en pantalla. */
  function refrescar() {
    var nodos = document.querySelectorAll('.mascota');
    for (var i = 0; i < nodos.length; i++) {
      var gest = nodos[i].getAttribute('data-mascota') || 'hola';
      nodos[i].innerHTML = svg(gest, baseElegida(), disfrazElegido());
    }
  }

  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-mascota]');
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].innerHTML = svg(nodos[i].getAttribute('data-mascota'),
                               baseElegida(), disfrazElegido());
      nodos[i].classList.add('mascota');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return {
    crear: crear, gesto: gesto, vista: vista, refrescar: refrescar,
    hidratar: hidratar,
    BASES: BASES, DISFRACES: DISFRACES, GESTOS: GESTOS
  };
})();
