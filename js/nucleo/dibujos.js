/* ============================================================
   Los dibujos de la app: ilustraciones chicas, hechas a mano en SVG.

   Son el mismo idioma que la mascota: trazo azul marino grueso, con
   las puntas redondeadas, y rellenos planos de colores de juguete, sin
   degradados ni sombras. Es lo que usan las apps de la vara (Pok Pok
   para los chicos, Duolingo para los grandes): un objeto dibujado
   reconocible de lejos, no un ícono dentro de un círculo.

   Cada materia tiene el suyo, y cada lugar grande de la app también:
   jugar, aprender, la meta, el repaso, la tienda. Las caritas de la
   bienvenida («soy un adulto», «soy un nene», «soy una nena») también
   viven acá: antes eran emojis, y cada teléfono dibuja los emojis a su
   manera.

   Van todos con aria-hidden: al lado siempre hay un texto que dice lo
   mismo. Se piden con Dibujos.svg('geografia') o se ponen solos en
   cualquier elemento con data-dibujo="geografia".

   Los dibujos no usan ids (ni clipPath, ni gradientes con nombre): se
   pueden repetir en la misma pantalla sin pisarse.
   ============================================================ */
window.Dibujos = (function () {
  'use strict';

  var T = '#27304A';          // la tinta: el mismo azul marino del texto
  var C = {
    cielo: '#3AA3E8', coral: '#F2644E', girasol: '#FFC93C', verde: '#4DBF6B',
    violeta: '#8B6CF0', rosa: '#FF93B4', agua: '#C7EBFD', blanco: '#FFFFFF',
    naranja: '#FF9A3C', piel: '#F2B48E', pelo: '#7A4A2E', pelo2: '#3B2A22',
    canas: '#8C94A6', pasto: '#9ED98B'
  };

  // el trazo de todos los dibujos: grueso, redondo, del color de la tinta
  var TR = ' stroke="' + T + '" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';

  function rect(x, y, w, h, r, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r +
      '" fill="' + fill + '"' + TR + (extra || '') + '/>';
  }
  function circ(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + TR + (extra || '') + '/>';
  }
  function camino(d, fill, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + TR + (extra || '') + '/>';
  }
  // una raya sin relleno, de otro color o grosor
  function raya(d, color, ancho, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + ancho +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function letra(x, y, texto, color, tam, extra) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="\'Baloo 2\', sans-serif" ' +
      'font-weight="800" font-size="' + tam + '" fill="' + color + '"' + (extra || '') + '>' + texto + '</text>';
  }
  // una estrellita de cinco puntas centrada en (cx, cy)
  function estrella(cx, cy, r, fill, conTrazo) {
    var puntos = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var rr = i % 2 ? r * 0.46 : r;
      puntos.push((cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return '<path d="M' + puntos.join(' L') + ' Z" fill="' + fill + '"' + (conTrazo ? TR : '') + '/>';
  }
  // brillito de luz: una curva blanca corta
  function brillo(d) { return raya(d, C.blanco, 4, ' opacity=".85"'); }

  var D = {};

  /* ---------- las materias ---------- */

  // Geografía: el globo terráqueo con su pie
  D.geografia =
    rect(40, 97, 40, 10, 5, C.coral) +
    rect(56, 84, 8, 15, 3, T) +
    raya('M24 70 A38 38 0 0 0 92 84', T, 5) +
    circ(58, 52, 34, C.cielo) +
    '<path d="M42 30 c7 -5 17 -4 19 3 c2 6 -5 9 -3 15 c2 7 -6 11 -13 7 c-7 -4 -11 -18 -3 -25 z" fill="' + C.verde + '"/>' +
    '<path d="M66 58 c7 -3 14 1 14 8 c0 7 -7 13 -14 11 c-5 -2 -7 -7 -5 -12 c1 -3 2 -6 5 -7 z" fill="' + C.verde + '"/>' +
    '<path d="M76 32 c4 -1 8 2 7 6 c-1 3 -5 4 -8 2 c-2 -2 -2 -7 1 -8 z" fill="' + C.verde + '"/>' +
    circ(58, 52, 34, 'none') +
    brillo('M34 40 a26 26 0 0 1 10 -12');

  // Matemática: un círculo, un cuadrado, un triángulo y un «más»
  D.matematica =
    rect(16, 52, 42, 42, 7, C.cielo, ' transform="rotate(-8 37 73)"') +
    camino('M56 98 L79 58 L102 98 Z', C.girasol) +
    circ(78, 40, 21, C.coral) +
    raya('M32 18 v22 M21 29 h22', C.verde, 8) +
    brillo('M70 29 a13 13 0 0 1 10 -4');

  // Lengua: tres bloques de madera con letras
  D.lengua =
    '<g transform="rotate(-9 37 69)">' + rect(15, 47, 44, 44, 8, C.coral) + letra(37, 81, 'A', C.blanco, 32) + '</g>' +
    '<g transform="rotate(7 80 57)">' + rect(58, 35, 44, 44, 8, C.girasol) + letra(80, 69, 'b', T, 34) + '</g>' +
    '<g transform="rotate(-3 83 99)">' + rect(66, 82, 34, 34, 7, C.cielo) + letra(83, 108, 'c', C.blanco, 28) + '</g>';

  // Ciencias: la lupa mirando una vaquita de San Antonio
  D.ciencias =
    raya('M72 72 L98 98', T, 14) +
    raya('M74 74 L96 96', C.coral, 7) +
    circ(50, 50, 32, C.agua, ' stroke-width="6"') +
    '<ellipse cx="50" cy="56" rx="19" ry="16" fill="' + C.coral + '"' + TR + '/>' +
    camino('M42 43 a8 6.5 0 0 1 16 0 z', T) +
    raya('M50 43 V71', T, 2.6) +
    circ(42, 54, 3.2, T, ' stroke-width="0"') + circ(58, 54, 3.2, T, ' stroke-width="0"') +
    circ(44, 64, 2.6, T, ' stroke-width="0"') + circ(56, 64, 2.6, T, ' stroke-width="0"') +
    raya('M46 38 l-3 -5 M54 38 l3 -5', T, 2.6) +
    brillo('M37 49 a13 13 0 0 1 6 -6') +
    brillo('M28 36 a24 24 0 0 1 12 -12');

  // Inglés: dos globitos de diálogo, uno dice «Hi!»
  D.ingles =
    camino('M76 10 h26 q8 0 8 8 v12 q0 8 -8 8 h-5 l-7 7 v-7 h-14 q-8 0 -8 -8 v-12 q0 -8 8 -8 z', C.girasol) +
    circ(80, 24, 2.2, T, ' stroke-width="0"') + circ(89, 24, 2.2, T, ' stroke-width="0"') + circ(98, 24, 2.2, T, ' stroke-width="0"') +
    camino('M14 42 q0 -12 12 -12 h52 q12 0 12 12 v32 q0 12 -12 12 h-34 l-16 16 v-16 h-2 q-12 0 -12 -12 z', C.blanco) +
    letra(52, 71, 'Hi!', C.violeta, 32);

  /* ---------- los lugares grandes ---------- */

  // Jugar: juguetes (un bloque con estrella, un triángulo y una pelota)
  D.jugar =
    '<g transform="rotate(9 86 60)">' + rect(68, 42, 36, 36, 6, C.cielo) + estrella(86, 60, 10, C.blanco) + '</g>' +
    camino('M72 104 L89 76 L106 104 Z', C.verde) +
    circ(44, 72, 29, C.coral) +
    '<path d="M16.4 64 Q44 55 71.6 64 L72.4 77 Q44 68 15.6 77 Z" fill="' + C.girasol + '"/>' +
    circ(44, 72, 29, 'none') +
    brillo('M28 58 a19 19 0 0 1 10 -8');

  // Aprender: un libro abierto y una estrella encima
  D.aprender =
    camino('M10 46 L10 102 Q35 94 60 104 Q85 94 110 102 L110 46', C.violeta) +
    camino('M16 40 Q38 31 60 43 L60 97 Q38 86 16 94 Z', C.blanco) +
    camino('M60 43 Q82 31 104 40 L104 94 Q82 86 60 97 Z', C.blanco) +
    raya('M26 56 Q37 51 50 56 M26 68 Q37 63 50 68 M70 56 Q83 51 94 56 M70 68 Q83 63 94 68', T, 2.6, ' opacity=".4"') +
    estrella(60, 20, 13, C.girasol, true);

  // Repaso: un bumerán, que siempre vuelve
  D.repaso =
    raya('M88 74 q12 14 0 30', C.cielo, 5) +
    raya('M76 88 q6 9 -2 17', C.cielo, 5) +
    camino('M14 40 Q12 28 24 30 L58 60 Q62 63 66 60 L96 32 Q108 30 106 42 L68 84 Q62 90 56 84 Z', C.coral) +
    raya('M21 39 L30 47 M99 41 L90 49', C.girasol, 5);

  // La meta del día: una copa
  D.meta =
    raya('M38 34 h-11 q0 18 14 20 M82 34 h11 q0 18 -14 20', T, 3.2) +
    camino('M38 22 h44 v20 q0 24 -22 26 q-22 -2 -22 -26 z', C.girasol) +
    rect(54, 67, 12, 12, 2, C.girasol) +
    rect(38, 79, 44, 14, 5, C.coral) +
    estrella(60, 40, 9, C.blanco);

  // La tienda: un regalo con moño
  D.tienda =
    rect(22, 54, 76, 46, 6, C.coral) +
    rect(16, 42, 88, 16, 5, C.coral) +
    rect(54, 42, 12, 58, 2, C.girasol) +
    camino('M60 42 q-20 -20 -25 -5 q4 11 25 5 z', C.girasol) +
    camino('M60 42 q20 -20 25 -5 q-4 11 -25 5 z', C.girasol);

  // Personalizar: la paleta de pintor
  D.personalizar =
    camino('M60 16 C89 16 106 37 104 60 C102 77 88 72 82 81 C76 91 86 104 64 104 C35 104 16 85 16 60 C16 36 34 16 60 16 Z', '#FFD978') +
    circ(70, 84, 7, C.blanco) +
    circ(40, 44, 8, C.coral) + circ(61, 34, 8, C.cielo) + circ(81, 46, 8, C.verde) + circ(36, 67, 8, C.violeta);

  // Ajustes: un engranaje
  D.ajustes = (function () {
    var dientes = '';
    for (var i = 0; i < 8; i++) {
      dientes += '<rect x="-8" y="-45" width="16" height="18" rx="4" fill="' + C.cielo + '"' + TR +
        ' transform="rotate(' + (i * 45) + ')"/>';
    }
    return '<g transform="translate(60 60)">' + dientes +
      '<circle r="31" fill="' + C.cielo + '"' + TR + '/>' +
      '<circle r="12" fill="' + C.blanco + '"' + TR + '/></g>';
  })();

  // El candado de los padres
  D.candado =
    raya('M42 54 V40 a18 18 0 0 1 36 0 V54', T, 7) +
    rect(30, 52, 60, 48, 10, C.girasol) +
    circ(60, 72, 6, T, ' stroke-width="0"') + rect(57, 74, 6, 14, 3, T, ' stroke-width="0"');

  /* ---------- los lugares de la Tierra ---------- */

  /* El río. El emoji 🏞️ es un parque con un lago, y en el juego de los
     lugares no se entendía que era un río. Éste nace angostito entre las
     lomas y se viene ensanchando, con olitas que muestran que corre, un
     árbol en cada orilla y piedras. Va en un recuadro, como una foto: un
     río suelto sobre el papel parecía un camino. Sin atributos repetidos,
     porque también se usa como imagen (ver url()). */
  D.rio =
    // el cielo y el sol
    '<rect x="8" y="12" width="104" height="96" rx="16" fill="' + C.agua + '"/>' +
    circ(86, 32, 9, C.girasol) +
    // las lomas del fondo
    camino('M8 58 Q26 38 46 52 Q64 36 84 50 Q98 42 112 52 L112 72 L8 72 Z', C.verde) +
    // el pasto de adelante, con las esquinas del recuadro
    '<path d="M8 66 L112 66 L112 92 A16 16 0 0 1 96 108 L24 108 A16 16 0 0 1 8 92 Z" fill="' + C.pasto + '"/>' +
    // el río: angostito atrás y ancho adelante
    camino('M55 66 L65 66 C66 74 80 80 74 90 C70 98 78 104 82 108 L34 108 C38 102 32 96 40 88 C48 80 51 74 55 66 Z', C.cielo) +
    // las olitas, para que se vea que el agua corre
    raya('M47 97 q4 -3 8 0 M60 86 q3 -2 6 0 M53 103 q5 -3 10 0', C.blanco, 2.6) +
    // un árbol en cada orilla, y unas piedras
    rect(21, 74, 5, 12, 2, C.pelo) + circ(23.5, 70, 9, C.verde) +
    rect(93, 80, 5, 12, 2, C.pelo) + circ(95.5, 76, 10, C.verde) +
    '<ellipse cx="87" cy="100" rx="6" ry="3.5" fill="' + C.canas + '"' + TR + '/>' +
    '<ellipse cx="26" cy="97" rx="5" ry="3" fill="' + C.canas + '"' + TR + '/>' +
    // el recuadro, al final: tapa las puntas de todo lo de adentro
    rect(8, 12, 104, 96, 16, 'none');

  /* Los otros lugares que con emoji confundían, en el mismo recuadro: la
     cueva era un agujero (🕳️), el puente estaba de noche (🌉), el granero
     era una casa abandonada (🏚️), el bosque era un solo pino (🌲) y el
     campo, una espiga (🌾). */
  function cielo() { return '<rect x="8" y="12" width="104" height="96" rx="16" fill="' + C.agua + '"/>'; }
  // el suelo desde la altura y hasta abajo, con las esquinas del recuadro
  function suelo(y, color) {
    return '<path d="M8 ' + y + ' L112 ' + y + ' L112 92 A16 16 0 0 1 96 108 L24 108 A16 16 0 0 1 8 92 Z" fill="' + color + '"/>';
  }
  function recuadro() { return rect(8, 12, 104, 96, 16, 'none'); }
  function pino(cx, base, ancho, alto) {
    return rect(cx - 2.5, base - 2, 5, 9, 1.5, C.pelo) +
      camino('M' + (cx - ancho) + ' ' + base + ' L' + cx + ' ' + (base - alto * 0.62) + ' L' + (cx + ancho) + ' ' + base + ' Z', C.verde) +
      camino('M' + (cx - ancho * 0.72) + ' ' + (base - alto * 0.42) + ' L' + cx + ' ' + (base - alto) + ' L' +
             (cx + ancho * 0.72) + ' ' + (base - alto * 0.42) + ' Z', C.verde);
  }

  // La cueva: una loma de piedra con la boca oscura abajo
  D.cueva =
    cielo() + circ(90, 30, 8, C.girasol) +
    camino('M8 74 Q16 40 46 32 Q76 24 98 40 Q108 48 112 58 L112 92 A16 16 0 0 1 96 108 L24 108 A16 16 0 0 1 8 92 Z', C.canas) +
    raya('M22 62 q6 -4 12 -2 M86 50 q6 -3 11 1 M94 78 q5 -3 9 0 M20 86 q5 -3 9 0', T, 2.2, ' opacity=".35"') +
    camino('M40 108 L40 86 Q40 62 60 62 Q80 62 80 86 L80 108 Z', T) +
    '<ellipse cx="31" cy="102" rx="6" ry="3.5" fill="' + C.canas + '"' + TR + '/>' +
    '<ellipse cx="89" cy="103" rx="5" ry="3" fill="' + C.canas + '"' + TR + '/>' +
    recuadro();

  // El puente: de día, de una orilla a la otra por arriba del agua
  D.puente =
    cielo() + circ(26, 30, 8, C.girasol) +
    suelo(80, C.cielo) +
    raya('M20 94 q5 -3 10 0 M52 100 q5 -3 10 0 M82 92 q5 -3 10 0', C.blanco, 2.6) +
    camino('M8 60 L28 60 L34 80 L8 80 Z', C.pasto) +
    camino('M112 60 L92 60 L86 80 L112 80 Z', C.pasto) +
    camino('M26 80 Q60 34 94 80 L84 80 Q60 50 36 80 Z', C.coral) +
    rect(18, 52, 84, 8, 3, C.coral) +
    raya('M22 52 V43 M34 52 V43 M46 52 V43 M58 52 V43 M70 52 V43 M82 52 V43 M96 52 V43 M20 43 H100', T, 2.6) +
    recuadro();

  // El granero: el galpón rojo del campo, con su portón y un fardo
  D.granero =
    cielo() + circ(94, 28, 8, C.girasol) +
    suelo(86, C.pasto) +
    rect(30, 54, 56, 42, 3, C.coral) +
    camino('M24 58 L58 30 L92 58 Z', C.pelo) +
    rect(52, 40, 12, 12, 2, C.blanco) +
    rect(46, 70, 24, 26, 2, C.blanco) +
    raya('M46 70 L70 96 M70 70 L46 96', C.coral, 3) +
    rect(92, 86, 14, 10, 2, C.girasol) +
    recuadro();

  // El bosque: muchos árboles juntos, los de atrás más chicos
  D.bosque =
    cielo() + circ(92, 28, 8, C.girasol) +
    suelo(76, C.pasto) +
    pino(30, 76, 14, 34) + pino(80, 76, 13, 30) +
    pino(52, 94, 20, 54) + pino(98, 96, 12, 36) +
    rect(18, 86, 5, 12, 2, C.pelo) + circ(20.5, 80, 10, C.verde) +
    recuadro();

  // El campo: la llanura con los surcos, el alambrado y el molino
  D.campo =
    cielo() + circ(28, 30, 8, C.girasol) +
    suelo(66, C.pasto) +
    raya('M8 80 L66 72 M8 94 L70 82 M18 106 L76 92', C.verde, 3.4) +
    raya('M14 64 V80 M30 62 V78 M46 60 V76 M10 68 L50 63', T, 2.6) +
    raya('M84 96 L91 42 L98 96 M86 80 H96 M88 62 H94', T, 3) +
    raya('M91 27 V53 M78 40 H104 M81.8 30.8 L100.2 49.2 M100.2 30.8 L81.8 49.2', T, 3) +
    circ(91, 40, 4, C.coral) +
    recuadro();

  /* ---------- las caritas de la bienvenida ---------- */

  function cara(cx, cy, r, pelo, conAnteojos) {
    var ojos = conAnteojos
      ? circ(cx - r * 0.33, cy + r * 0.05, r * 0.28, 'rgba(255,255,255,.55)') +
        circ(cx + r * 0.33, cy + r * 0.05, r * 0.28, 'rgba(255,255,255,.55)') +
        raya('M' + (cx - r * 0.06) + ' ' + (cy + r * 0.02) + ' h' + (r * 0.12), T, 3) +
        circ(cx - r * 0.33, cy + r * 0.07, r * 0.09, T, ' stroke-width="0"') +
        circ(cx + r * 0.33, cy + r * 0.07, r * 0.09, T, ' stroke-width="0"')
      : circ(cx - r * 0.33, cy + r * 0.07, r * 0.1, T, ' stroke-width="0"') +
        circ(cx + r * 0.33, cy + r * 0.07, r * 0.1, T, ' stroke-width="0"');
    return circ(cx, cy, r, C.piel) + pelo + ojos +
      circ(cx - r * 0.55, cy + r * 0.38, r * 0.13, C.rosa, ' stroke-width="0" opacity=".7"') +
      circ(cx + r * 0.55, cy + r * 0.38, r * 0.13, C.rosa, ' stroke-width="0" opacity=".7"') +
      raya('M' + (cx - r * 0.25) + ' ' + (cy + r * 0.42) + ' q' + (r * 0.25) + ' ' + (r * 0.22) + ' ' + (r * 0.5) + ' 0', T, 3);
  }
  // el pelo de arriba de una cara, como un casquito
  function casquito(cx, cy, r, color) {
    return camino('M' + (cx - r) + ' ' + (cy - r * 0.05) +
      ' Q' + (cx - r) + ' ' + (cy - r * 1.05) + ' ' + cx + ' ' + (cy - r * 1.02) +
      ' Q' + (cx + r) + ' ' + (cy - r * 1.05) + ' ' + (cx + r) + ' ' + (cy - r * 0.05) +
      ' Q' + (cx + r * 0.62) + ' ' + (cy - r * 0.55) + ' ' + cx + ' ' + (cy - r * 0.5) +
      ' Q' + (cx - r * 0.62) + ' ' + (cy - r * 0.55) + ' ' + (cx - r) + ' ' + (cy - r * 0.05) + ' Z', color);
  }

  D.nene = cara(60, 64, 32, casquito(60, 64, 32, C.pelo) + raya('M60 31 q6 -8 12 -6', T, 3.2));

  D.nena =
    circ(26, 56, 13, C.pelo2) + circ(94, 56, 13, C.pelo2) +
    camino('M18 44 l-8 -6 v12 z', C.coral) + camino('M102 44 l8 -6 v12 z', C.coral) +
    cara(60, 64, 32, casquito(60, 64, 32, C.pelo2));

  // un grande con anteojos y un chico al lado
  D.adulto =
    cara(50, 54, 30, casquito(50, 54, 30, C.canas), true) +
    cara(90, 88, 19, casquito(90, 88, 19, C.pelo));

  /* ---------- cómo se usan ---------- */

  function svg(nombre) {
    var cuerpo = D[nombre];
    if (!cuerpo) return '';
    return '<svg class="dibujo dibujo-' + nombre + '" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      cuerpo + '</svg>';
  }

  function poner(el, nombre) {
    if (!el) return el;
    el.innerHTML = svg(nombre);
    return el;
  }

  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-dibujo]');
    for (var i = 0; i < nodos.length; i++) {
      if (!nodos[i].firstChild) poner(nodos[i], nodos[i].getAttribute('data-dibujo'));
    }
  }

  function hay(nombre) { return !!D[nombre]; }

  /** El dibujo como imagen, para un <img> (el repaso muestra imágenes). */
  function url(nombre) {
    var cuerpo = D[nombre];
    if (!cuerpo) return '';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' + cuerpo + '</svg>');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return { svg: svg, poner: poner, hidratar: hidratar, hay: hay, url: url, COLORES: C, TINTA: T };
})();
