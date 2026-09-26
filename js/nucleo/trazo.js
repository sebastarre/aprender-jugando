/* ============================================================
   Trazar con el dedo: una letra o un número, trazo por trazo.

   Es la mecánica de «Trazá las letras» y «Trazá los números». La forma
   aparece como un caminito gris, con un punto verde donde empieza el
   trazo que toca y una bolita que lo recorre para mostrar hacia dónde
   se va. Se pasa el dedo (o el mouse) por encima y el caminito se va
   pintando; cuando están todos los trazos, se contesta sola.

   No hay forma de hacerlo «mal»: si el dedo se sale del camino, lo
   pintado se queda donde iba y se sigue desde ahí. Lo que se aprende es
   el recorrido —dónde se empieza y para dónde se va—, que en la escuela
   se enseña con numeritos y flechas.

   Cada forma está dibujada en una caja de 100 × 120, como la lista de
   sus trazos en el orden y el sentido en que se hacen (la imprenta
   mayúscula de primer grado). Con el teclado, Enter o espacio completan
   el trazo que toca: el que no puede arrastrar también llega al final.

   Contesta con Motor.responder() y se anota en Opciones como el control
   de la pregunta, como las fichas de «Armá la palabra».
   ============================================================ */
window.Trazo = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var FORMAS = {
    // las vocales
    A: ['M50 10 L16 110', 'M50 10 L84 110', 'M28 76 L72 76'],
    E: ['M26 10 L26 110', 'M26 10 L76 10', 'M26 60 L70 60', 'M26 110 L76 110'],
    I: ['M50 10 L50 110'],
    O: ['M50 10 C12 10 12 110 50 110 C88 110 88 10 50 10'],
    U: ['M22 10 L22 74 C22 118 78 118 78 74 L78 10'],
    // las consonantes de las primeras palabras
    M: ['M18 110 L18 10 L50 70 L82 10 L82 110'],
    P: ['M26 10 L26 110', 'M26 10 L56 10 C86 10 86 60 56 60 L26 60'],
    L: ['M28 10 L28 110 L78 110'],
    S: ['M76 24 C68 6 24 6 24 34 C24 60 76 56 76 86 C76 116 28 116 22 94'],
    T: ['M16 10 L84 10', 'M50 10 L50 110'],
    N: ['M22 110 L22 10 L78 110 L78 10'],
    D: ['M26 10 L26 110', 'M26 10 L46 10 C94 10 94 110 46 110 L26 110'],
    C: ['M78 26 C68 6 22 6 22 60 C22 114 68 114 78 94'],
    // los números
    0: ['M50 10 C14 10 14 110 50 110 C86 110 86 10 50 10'],
    1: ['M30 34 L54 10 L54 110'],
    2: ['M22 34 C22 6 80 4 78 36 C76 60 40 80 20 110 L82 110'],
    3: ['M22 24 C36 4 80 6 76 34 C74 54 58 58 44 58 C70 58 84 72 80 90 C74 116 30 116 20 98'],
    4: ['M60 10 L16 76 L86 76', 'M64 42 L64 110'],
    5: ['M30 10 L27 54 C44 42 82 46 80 78 C78 110 38 116 20 98', 'M30 10 L78 10'],
    6: ['M72 18 C52 2 20 26 22 70 C24 104 46 112 54 110 C74 108 82 92 80 78 C78 60 58 54 46 56 C34 58 24 66 22 76'],
    7: ['M18 12 L82 12 L40 110'],
    8: ['M76 32 C76 12 24 12 24 32 C24 52 76 58 76 84 C76 112 24 112 24 84 C24 58 76 52 76 32'],
    9: ['M74 36 C70 12 26 14 26 40 C26 64 72 64 74 38 L70 110']
  };

  // la caja de 100 × 120, con un margen para que el camino gordo y el punto verde no toquen el borde
  var CAJA = '-7 -7 114 134';
  var TOLERANCIA = 14;   // qué tan lejos del camino puede ir el dedo, en unidades de la caja
  var PASO = 2;          // cada cuánto se toma un punto del camino
  var ADELANTE = 12;     // cuántos puntos puede avanzar de una vez: así no se corta camino

  function hay(forma) { return !!FORMAS[forma]; }

  function crear(tag, atributos) {
    var el = document.createElementNS(NS, tag);
    Object.keys(atributos || {}).forEach(function (k) { el.setAttribute(k, atributos[k]); });
    return el;
  }

  function quieto() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function distancia(a, b) { return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }

  /**
   * trazar({
   *   forma:     'A',          // una de FORMAS
   *   respuesta: 'A',          // con qué contesta al terminar
   *   nombre:    'la A'        // para el lector de pantalla
   * })
   */
  function trazar(config) {
    var zona = Util.$('zona-opciones');
    Util.vaciar(zona);
    zona.setAttribute('data-columnas', '1');
    zona.setAttribute('data-forma', 'trazo');

    var caja = Util.crear('div', 'trazo');
    var svg = crear('svg', {
      viewBox: CAJA, class: 'trazo-lienzo', tabindex: '0', role: 'img',
      'aria-label': 'Trazá ' + config.nombre + ' con el dedo, desde el punto verde. Con Enter se completa cada trazo.'
    });
    caja.appendChild(svg);
    zona.appendChild(caja);

    // cada trazo: el caminito gris, la guía punteada y lo que se va pintando
    var capas = FORMAS[config.forma].map(function (d) {
      var g = crear('g');
      g.appendChild(crear('path', { d: d, class: 'trazo-camino' }));
      g.appendChild(crear('path', { d: d, class: 'trazo-guia' }));
      var pintado = crear('path', { d: d, class: 'trazo-pintado' });
      g.appendChild(pintado);
      svg.appendChild(g);
      var largo = pintado.getTotalLength();
      pintado.style.strokeDasharray = largo + ' ' + largo;
      var n = Math.max(2, Math.ceil(largo / PASO));
      var puntos = [];
      for (var i = 0; i <= n; i++) {
        var p = pintado.getPointAtLength(largo * i / n);
        puntos.push({ x: p.x, y: p.y });
      }
      return { d: d, pintado: pintado, largo: largo, puntos: puntos };
    });

    // la bolita que recorre el trazo que toca, y el punto verde (con su número) donde se sigue
    var bolita = crear('circle', { r: '5', class: 'trazo-bolita' });
    var inicio = crear('g', { class: 'trazo-inicio' });
    inicio.appendChild(crear('circle', { r: '7.5' }));
    var numero = crear('text', { 'text-anchor': 'middle', dy: '3.3', 'font-size': '9' });
    inicio.appendChild(numero);
    svg.appendChild(bolita);
    svg.appendChild(inicio);

    var actual = 0;          // el trazo que toca
    var avance = 0;          // hasta qué punto de ese trazo va pintado
    var siguiendo = false;   // el dedo está apoyado sobre el camino
    var bloqueado = false;

    function pintar() {
      capas.forEach(function (c, i) {
        var hecho = i < actual ? c.largo : i === actual ? c.largo * avance / (c.puntos.length - 1) : 0;
        c.pintado.style.strokeDashoffset = String(c.largo - hecho);
      });
    }

    function mostrarInicio() {
      var listo = actual >= capas.length;
      inicio.style.display = listo || siguiendo ? 'none' : '';
      while (bolita.firstChild) bolita.removeChild(bolita.firstChild);
      bolita.style.display = 'none';
      if (listo) return;
      var c = capas[actual], p = c.puntos[avance];
      inicio.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      numero.textContent = avance === 0 && capas.length > 1 ? String(actual + 1) : '';
      // la bolita muestra el camino sólo antes de empezar cada trazo
      if (avance === 0 && !siguiendo && !quieto()) {
        bolita.style.display = '';
        bolita.appendChild(crear('animateMotion', {
          dur: Math.max(1.2, c.largo / 90).toFixed(2) + 's', repeatCount: 'indefinite', path: c.d
        }));
      }
    }

    function aLaCaja(e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      p = p.matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }

    function avanzar(p) {
      var c = capas[actual], mejor = -1;
      var hasta = Math.min(c.puntos.length - 1, avance + ADELANTE);
      for (var j = avance; j <= hasta; j++) if (distancia(p, c.puntos[j]) <= TOLERANCIA) mejor = j;
      if (mejor > avance) {
        avance = mejor;
        pintar();
        if (avance >= c.puntos.length - 2) terminarTrazo();
      } else if (mejor < 0 && distancia(p, c.puntos[avance]) > TOLERANCIA * 2.2) {
        // se fue del camino: queda pintado hasta ahí, y se sigue desde ese punto
        siguiendo = false;
        mostrarInicio();
      }
    }

    function terminarTrazo() {
      actual++;
      avance = 0;
      siguiendo = false;
      pintar();
      Sonido.tocar('pop', actual);
      if (actual >= capas.length) {
        bloqueado = true;
        caja.classList.add('trazada');
        mostrarInicio();
        Motor.responder(config.respuesta);
        return;
      }
      mostrarInicio();
    }

    svg.addEventListener('pointerdown', function (e) {
      if (bloqueado || !Motor.libre()) return;
      var p = aLaCaja(e);
      if (!p) return;
      e.preventDefault();
      if (distancia(p, capas[actual].puntos[avance]) <= TOLERANCIA * 1.4) {
        siguiendo = true;
        try { svg.setPointerCapture(e.pointerId); } catch (x) { /* sin captura, igual sigue */ }
        mostrarInicio();
        avanzar(p);
        return;
      }
      // empezó en otro lado: el punto verde se hace notar
      inicio.classList.remove('llamar');
      inicio.getBoundingClientRect();
      inicio.classList.add('llamar');
    });
    svg.addEventListener('pointermove', function (e) {
      if (!siguiendo || bloqueado) return;
      var p = aLaCaja(e);
      if (p) avanzar(p);
    });
    function soltar() {
      if (!siguiendo) return;
      siguiendo = false;
      mostrarInicio();
    }
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    svg.addEventListener('keydown', function (e) {
      if (bloqueado || !Motor.libre() || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      terminarTrazo();
    });

    Opciones.usar({
      marcar: function (id, clase) {
        // al mostrar la que era (o en el examen), la forma queda entera
        actual = capas.length;
        avance = 0;
        pintar();
        mostrarInicio();
        if (clase === 'correcta') caja.classList.add('trazada');
      },
      bloquear: function () { bloqueado = true; },
      desarmar: function () { bloqueado = true; }
    }, false);

    pintar();
    mostrarInicio();
  }

  /**
   * La forma quieta, para mirar en una lección: el caminito, la guía y el
   * número de cada trazo donde empieza. Si dos trazos empiezan en el mismo
   * punto (los dos palos de la A), el número del segundo se corre un poco
   * por su propio camino, que además muestra para dónde va.
   */
  function dibujo(forma) {
    var trazos = FORMAS[forma] || [];
    // el largo de un camino sólo se puede medir con el camino en la página
    var medidor = crear('svg', { width: '0', height: '0', style: 'position:absolute' });
    document.body.appendChild(medidor);
    var inicios = [];
    var marcas = trazos.map(function (d, i) {
      var p = crear('path', { d: d });
      medidor.appendChild(p);
      var a = p.getPointAtLength(0);
      var pisa = inicios.some(function (b) { return distancia(a, b) < 8; });
      inicios.push({ x: a.x, y: a.y });
      if (pisa) a = p.getPointAtLength(Math.min(30, p.getTotalLength() / 3));
      return '<g class="trazo-inicio" transform="translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ')">' +
        '<circle r="7.5"/><text text-anchor="middle" dy="3.3" font-size="9">' + (i + 1) + '</text></g>';
    });
    document.body.removeChild(medidor);
    return '<svg class="trazo-lienzo trazo-dibujo" viewBox="' + CAJA + '" role="img" aria-label="Cómo se traza ' + forma + '">' +
      trazos.map(function (d) { return '<path class="trazo-camino" d="' + d + '"/><path class="trazo-guia" d="' + d + '"/>'; }).join('') +
      marcas.join('') + '</svg>';
  }

  return { trazar: trazar, dibujo: dibujo, hay: hay, FORMAS: FORMAS };
})();
