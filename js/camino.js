/* ============================================================
   El camino de niveles de un juego: el mapa, como en los juegos de
   caramelos. Sólo dibuja; qué pasa al tocar un nivel lo decide app.js.

   Los niveles van de arriba hacia abajo, uno por fila, serpenteando de
   un lado al otro. Arriba es el principio: en una página, lo primero se
   lee arriba, y un chico que abre el mapa tiene que ver dónde empezó.

   Cada nivel es un botón redondo:
     - pasado: del color del juego, con su número y sus estrellas abajo;
     - el que toca: con el color, un anillo que late y la cara del chico
       arriba («estás acá»);
     - cerrado: gris, con un candado;
     - desafío (cada cinco): más grande, con un trofeo.
   El camino que los une está pintado hasta el que toca, y punteado de
   ahí en adelante: se ve cuánto falta sin leer ningún número.
   ============================================================ */
window.Camino = (function () {
  'use strict';

  var FILA = 104;          // píxeles entre un nivel y el siguiente
  var ARRIBA = 104;        // lugar para la cara del chico sobre el primero
  var ABAJO = 70;          // y para las estrellas del último
  var VAIVEN = 30;         // cuánto se corre para los costados, en % del ancho

  function lugar(i) {
    return { x: 50 + VAIVEN * Math.sin(i * 0.95), y: ARRIBA + i * FILA };
  }

  /** Un tramo en S entre dos niveles: baja derecho y dobla suave. */
  function tramo(a, b) {
    var medio = (b.y - a.y) / 2;
    return ' C ' + a.x + ' ' + (a.y + medio) + ' ' + b.x + ' ' + (b.y - medio) + ' ' + b.x + ' ' + b.y;
  }

  function camino(puntos) {
    if (!puntos.length) return '';
    var d = 'M ' + puntos[0].x + ' ' + puntos[0].y;
    for (var i = 1; i < puntos.length; i++) d += tramo(puntos[i - 1], puntos[i]);
    return d;
  }

  function estrellitas(cuantas) {
    var caja = Util.crear('span', 'camino-estrellas');
    for (var i = 0; i < 3; i++) {
      var e = Util.crear('span', i < cuantas ? 'ganada' : '');
      e.appendChild(Iconos.crear('estrella'));
      caja.appendChild(e);
    }
    caja.setAttribute('aria-hidden', 'true');
    return caja;
  }

  /**
   * datos:
   *   niveles     los del juego ({ numero, nombre, test, etapa })
   *   estrellas   { numero: 0..3 } la mejor vez de cada uno
   *   color       el del juego; oscuro, su escalón
   *   cara        function () -> un elemento con la cara del chico
   *   recien      el número del nivel que se acaba de abrir (se anima)
   *   alTocar     function (nivel, abierto)
   * Devuelve el botón del nivel que toca, para llevarlo a la vista.
   */
  function pintar(caja, datos) {
    Util.vaciar(caja);
    var n = datos.niveles.length;
    var alto = ARRIBA + ABAJO + (n - 1) * FILA;
    caja.style.height = alto + 'px';
    caja.style.setProperty('--camino-color', datos.color);
    caja.style.setProperty('--camino-oscuro', datos.oscuro);

    var puntos = datos.niveles.map(function (nv, i) { return lugar(i); });
    var actual = null;
    datos.niveles.forEach(function (nv) {
      if (!actual && !(datos.estrellas[nv.numero] > 0)) actual = nv.numero;
    });
    var hastaDonde = actual ? actual - 1 : n - 1;      // índice del último punto pintado

    /* El camino, en un SVG estirado al ancho de la caja: la x va en
       porcentaje y la y en píxeles, y el trazo no se deforma gracias a
       vector-effect. */
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'camino-trazo');
    svg.setAttribute('viewBox', '0 0 100 ' + alto);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var fondo = document.createElementNS(ns, 'path');
    fondo.setAttribute('d', camino(puntos));
    fondo.setAttribute('class', 'camino-fondo');
    svg.appendChild(fondo);
    if (hastaDonde > 0) {
      var hecho = document.createElementNS(ns, 'path');
      hecho.setAttribute('d', camino(puntos.slice(0, hastaDonde + 1)));
      hecho.setAttribute('class', 'camino-hecho');
      svg.appendChild(hecho);
    }
    caja.appendChild(svg);

    var botonActual = null;
    var etapaAntes = null;
    datos.niveles.forEach(function (nv, i) {
      var p = puntos[i];
      var estrellas = datos.estrellas[nv.numero] || 0;
      var abierto = nv.numero === 1 || (datos.estrellas[nv.numero - 1] || 0) > 0;
      var estado = estrellas > 0 ? 'hecho' : abierto ? 'actual' : 'cerrado';

      /* El nombre de la etapa, al costado, cuando empieza una nueva
         («Los de la granja»): el mapa se lee como un viaje por partes. */
      if (nv.etapa && nv.etapa !== etapaAntes) {
        var cartel = Util.crear('span', 'camino-etapa', nv.etapa);
        cartel.style.top = p.y + 'px';
        cartel.classList.add(p.x > 50 ? 'a-la-izquierda' : 'a-la-derecha');
        caja.appendChild(cartel);
      }
      if (nv.etapa) etapaAntes = nv.etapa;

      var b = Util.crear('button', 'camino-nivel ' + estado +
        (nv.test ? ' desafio' : '') + (nv.numero === n ? ' final' : ''));
      b.type = 'button';
      b.style.left = p.x + '%';
      b.style.top = p.y + 'px';
      b.setAttribute('aria-label', 'Nivel ' + nv.numero + ', ' + nv.nombre +
        (estado === 'cerrado' ? ', cerrado'
          : estado === 'hecho' ? ', ' + estrellas + (estrellas === 1 ? ' estrella' : ' estrellas')
          : ', el que te toca'));

      var cara = Util.crear('span', 'camino-cara');
      if (estado === 'cerrado') cara.appendChild(Iconos.crear('candado'));
      else if (nv.test) cara.appendChild(Iconos.crear('trofeo'));
      else cara.appendChild(Util.crear('span', 'camino-numero', String(nv.numero)));
      b.appendChild(cara);
      if (nv.test && estado !== 'cerrado') b.appendChild(Util.crear('span', 'camino-numerito', String(nv.numero)));
      if (estado === 'hecho') b.appendChild(estrellitas(estrellas));

      if (datos.recien === nv.numero) b.classList.add('recien');
      b.addEventListener('click', function () { datos.alTocar(nv, abierto); });
      caja.appendChild(b);

      if (estado === 'actual') {
        botonActual = b;
        // la cara del chico sobre el nivel que le toca: «estás acá»
        var yo = Util.crear('span', 'camino-yo');
        yo.appendChild(datos.cara());
        yo.style.left = p.x + '%';
        yo.style.top = p.y + 'px';
        yo.setAttribute('aria-hidden', 'true');
        /* Si el nivel se acaba de abrir, la cara arranca en el anterior
           y camina hasta éste: es lo que dice «pasaste» sin palabras. */
        if (datos.recien === nv.numero && i > 0) {
          var antes = puntos[i - 1];
          yo.style.left = antes.x + '%';
          yo.style.top = antes.y + 'px';
          yo.classList.add('caminando');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              yo.style.left = p.x + '%';
              yo.style.top = p.y + 'px';
            });
          });
        }
        caja.appendChild(yo);
      }
    });
    return botonActual;
  }

  return { pintar: pintar };
})();
