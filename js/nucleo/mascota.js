/* ============================================================
   La mascota de la app: un gato o un perro, siempre disfrazado.

   Aparece donde hace falta una cara: la bienvenida, el globo de la
   pregunta, el final de una partida, las lecciones, el mapa. Una app
   para chicos sin un personaje se siente como un formulario con colores.

   Está dibujada acá, en SVG, con el mismo idioma que los dibujos de la
   app (js/nucleo/dibujos.js): trazo azul marino grueso y redondo, y
   rellenos planos de juguete. Proporciones de cachorro —la cabeza casi
   tan grande como el cuerpo, ojos grandes y bajos, cachetes rosados—
   porque eso es lo que hace a un personaje tierno.

   Antes fueron ilustraciones (14 imágenes WebP, una por combinación de
   animal y disfraz). Dibujada en código vuelve a tener gestos, se ve
   nítida en cualquier tamaño y pesa casi nada.

   Tres cosas se combinan:

     base     'gato' o 'perro'. Lo elige el chico y no se compra.
     disfraz  el animal que tiene puesto. Tres son gratis y cuatro se
              compran en la tienda.
     gesto    la cara y los brazos, según lo que esté pasando:
                normal   parada, sonriendo
                hola     saluda con la mano
                festejo  los dos brazos arriba y los ojos felices
                piensa   la mano en el mentón, mirando para arriba
                animo    el puño arriba: «¡vamos, otra vez!»

   Como los otros dibujos, no usa ids (ni clipPath ni gradientes con
   nombre): se puede repetir en la misma pantalla sin que se pisen.
   ============================================================ */
window.Mascota = (function () {
  'use strict';

  /* ---------------------- el trazo ---------------------- */
  var T = '#27304A';          // la tinta: el mismo azul marino del texto
  var B = '#FFFFFF';
  var ROSA = '#FF93B4';
  var S = 5;                  // el grosor del trazo, en un dibujo de 200 × 250

  function trazo(w) { return ' stroke="' + T + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"'; }
  var TR = trazo(S);

  function n(v) { return Math.round(v * 10) / 10; }
  function circ(cx, cy, r, fill, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra === undefined ? TR : extra) + '/>';
  }
  function elip(cx, cy, rx, ry, fill, extra, giro) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' +
      (extra === undefined ? TR : extra) + (giro ? ' transform="rotate(' + giro + ' ' + cx + ' ' + cy + ')"' : '') + '/>';
  }
  function camino(d, fill, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (extra === undefined ? TR : extra) + '/>';
  }
  function raya(d, color, w, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  // una cola hecha con un tubo: el trazo ancho de tinta abajo y el color encima
  function tubo(d, color, ancho) { return raya(d, T, ancho + S * 2) + raya(d, color, ancho); }

  /* ---------------------- los animales ----------------------
     Tienen sus colores propios y no siguen la paleta que el chico arme en
     la tienda: un gato que a veces es verde deja de ser un personaje. */
  var BASES = {
    gato:  { nombre: 'Gato',  piel: '#C3CAD8', hocico: B,         nariz: ROSA },
    perro: { nombre: 'Perro', piel: '#F5C48E', hocico: '#FFF3E1', nariz: T, oreja: '#C98A52' }
  };

  /* ---------------------- los disfraces ----------------------
     El orden es el que se ve en Personalización: primero los gratis.
     «ribete» es el borde de la capucha alrededor de la cara, un tono más
     oscuro que el traje, como la costura de un disfraz de verdad. */
  var DISFRACES = {
    leon:     { nombre: 'León',       precio: 0,   traje: '#FFC93C', ribete: '#F2AE1F', panza: '#FFF1C7', melena: '#FF9A3C' },
    zorro:    { nombre: 'Zorro',      precio: 0,   traje: '#FF8A3D', ribete: '#EE7128', panza: B },
    dino:     { nombre: 'Dinosaurio', precio: 0,   traje: '#5CC46F', ribete: '#45AD59', panza: '#E4F6C8', puas: '#FFC93C' },
    abeja:    { nombre: 'Abeja',      precio: 90,  traje: '#FFC93C', ribete: '#F2AE1F', panza: null, alas: '#E3F4FF' },
    pinguino: { nombre: 'Pingüino',   precio: 100, traje: '#46547A', ribete: '#35415F', panza: B, pico: '#FF9A3C', patas: '#FF9A3C' },
    tiburon:  { nombre: 'Tiburón',    precio: 120, traje: '#4FA3E0', ribete: '#3B8CC8', panza: B },
    dragon:   { nombre: 'Dragón',     precio: 150, traje: '#F2644E', ribete: '#DB4C37', panza: '#FFE1A6', cuernos: '#FFD76A', alas: '#FF9A86', puas: '#FFC93C' }
  };

  var GESTOS = { normal: 1, hola: 1, festejo: 1, piensa: 1, animo: 1 };

  var BASE_POR_DEFECTO = 'gato';
  var DISFRAZ_POR_DEFECTO = 'leon';

  function existeBase(id) { return !!BASES[id]; }
  function existeDisfraz(id) { return !!DISFRACES[id]; }
  function gestoValido(g) { return GESTOS[g] ? g : 'normal'; }

  /* ---------------------- el cuerpo ---------------------- */
  var CUERPO = 'M68 148 C56 170 52 200 58 216 Q63 228 80 228 L120 228 Q137 228 142 216 C148 200 144 170 132 148 Z';

  // lo que va detrás de todo: las alas
  function alas(id, d) {
    if (id === 'abeja') {
      return elip(44, 150, 24, 15, d.alas, undefined, -28) + elip(156, 150, 24, 15, d.alas, undefined, 28) +
             elip(46, 174, 15, 10, d.alas, undefined, 12) + elip(154, 174, 15, 10, d.alas, undefined, -12);
    }
    if (id === 'dragon') {
      return camino('M72 160 C54 146 34 136 18 138 C22 150 22 160 30 166 C36 162 42 164 44 172 C50 170 56 174 58 182 C64 178 68 172 72 168 Z', d.alas) +
             camino('M128 160 C146 146 166 136 182 138 C178 150 178 160 170 166 C164 162 158 164 156 172 C150 170 144 174 142 182 C136 178 132 172 128 168 Z', d.alas);
    }
    return '';
  }

  function cola(id, d) {
    switch (id) {
      case 'leon':
        return tubo('M126 206 C150 214 170 204 168 182', d.traje, 9) +
               camino('M168 186 C158 184 158 168 168 164 C178 160 184 176 176 184 C174 186 171 187 168 186 Z', d.melena);
      case 'zorro':
        return camino('M126 198 C150 208 180 198 184 168 C186 150 170 140 160 150 C152 160 158 176 148 184 C140 190 132 190 126 188 Z', d.traje) +
               camino('M184 168 C186 150 170 140 160 150 C166 160 176 164 184 168 Z', B);
      case 'dino':
        return camino('M124 190 C146 194 170 204 190 220 C172 224 146 222 124 216 Z', d.traje) +
               camino('M146 197 L152 185 L160 200 Z', d.puas) + camino('M164 205 L172 194 L178 211 Z', d.puas);
      case 'tiburon':
        return camino('M126 200 C150 204 162 196 170 180 C168 194 170 206 184 218 C166 218 146 218 126 216 Z', d.traje);
      case 'dragon':
        return tubo('M126 208 C150 216 172 210 176 190', d.traje, 9) +
               camino('M176 176 L186 190 L176 198 L166 190 Z', d.puas);
      case 'pinguino':
        return camino('M124 214 L146 222 L126 226 Z', d.traje);
    }
    return '';
  }

  // las rayas del traje de abeja, y el contorno de nuevo encima para que queden adentro
  function rayasAbeja() {
    return raya('M64 172 L136 172', T, 10, ' stroke-linecap="butt"') +
           raya('M59 192 L141 192', T, 10, ' stroke-linecap="butt"') +
           raya('M60 211 L140 211', T, 10, ' stroke-linecap="butt"') +
           camino(CUERPO, 'none');
  }

  /* ---------------------- la capucha ---------------------- */
  function melena(cx, cy, r, color) {
    var k = 12, d = '';
    for (var i = 0; i < k; i++) {
      var a1 = (i / k) * Math.PI * 2 - Math.PI / 2;
      var a2 = ((i + 1) / k) * Math.PI * 2 - Math.PI / 2;
      var am = (a1 + a2) / 2;
      d += (i === 0 ? 'M' + n(cx + Math.cos(a1) * r) + ' ' + n(cy + Math.sin(a1) * r) : '') +
           ' Q' + n(cx + Math.cos(am) * (r + 19)) + ' ' + n(cy + Math.sin(am) * (r + 19)) +
           ' ' + n(cx + Math.cos(a2) * r) + ' ' + n(cy + Math.sin(a2) * r);
    }
    return camino(d + ' Z', color);
  }

  // lo que asoma por arriba de la capucha: orejas, púas, antenas, aleta, cuernos
  function adornosAtras(id, d) {
    switch (id) {
      case 'leon':
        return melena(100, 98, 70, d.melena) +
               circ(52, 46, 15, d.traje) + circ(148, 46, 15, d.traje) +
               circ(52, 46, 7, d.panza, '') + circ(148, 46, 7, d.panza, '');
      case 'zorro':
        return camino('M50 72 L46 20 Q48 15 55 19 L88 44 Z', d.traje) + camino('M150 72 L154 20 Q152 15 145 19 L112 44 Z', d.traje) +
               camino('M55 58 L53 30 L75 46 Z', d.panza, '') + camino('M145 58 L147 30 L125 46 Z', d.panza, '');
      case 'dino':
        return camino('M70 50 Q70 26 84 30 Q90 36 88 46 Z', d.puas) +
               camino('M88 40 Q94 10 108 20 Q114 30 110 40 Z', d.puas) +
               camino('M110 44 Q124 22 132 36 Q132 46 126 52 Z', d.puas);
      case 'abeja':
        return raya('M84 42 Q76 22 64 14', T, 4) + circ(62, 13, 6.5, T, '') +
               raya('M116 42 Q124 22 136 14', T, 4) + circ(138, 13, 6.5, T, '');
      case 'tiburon':
        return camino('M84 44 Q96 2 124 22 Q116 28 114 42 Z', d.traje);
      case 'dragon':
        return camino('M76 50 C70 38 62 26 62 12 C72 20 82 32 88 44 Z', d.cuernos) +
               camino('M124 50 C130 38 138 26 138 12 C128 20 118 32 112 44 Z', d.cuernos) +
               camino('M92 40 L100 26 L108 40 Z', d.puas);
    }
    return '';
  }

  // lo que va encima de la cara: los dientes del tiburón, el pico del pingüino
  function adornosAdelante(id, d) {
    if (id === 'tiburon') {
      var s = '';
      for (var k = 0; k < 7; k++) {
        var a = (-152 + k * 20.7) * Math.PI / 180;
        var px = 100 + Math.cos(a) * 51, py = 106 + Math.sin(a) * 45;
        // a lo largo del borde (tangente) y hacia el centro de la cara
        var tx = -Math.sin(a) * 51, ty = Math.cos(a) * 45, tl = Math.sqrt(tx * tx + ty * ty);
        var cx = 100 - px, cy = 106 - py, cl = Math.sqrt(cx * cx + cy * cy);
        tx /= tl; ty /= tl; cx /= cl; cy /= cl;
        s += camino('M' + n(px - tx * 5.5) + ' ' + n(py - ty * 5.5) + ' L' + n(px + cx * 10) + ' ' + n(py + cy * 10) +
                    ' L' + n(px + tx * 5.5) + ' ' + n(py + ty * 5.5) + ' Z', B, trazo(2.4));
      }
      return s;
    }
    if (id === 'pinguino') return camino('M86 44 Q100 37 114 44 Q107 60 100 63 Q93 60 86 44 Z', d.pico);
    return '';
  }

  /* ---------------------- la cara ---------------------- */
  function ojos(gesto) {
    // contento de verdad: los ojos cerrados, como dos arquitos
    if (gesto === 'festejo') {
      return raya('M68 112 Q78 100 88 112', T, 4.6) + raya('M112 112 Q122 100 132 112', T, 4.6);
    }
    var dy = gesto === 'piensa' ? -3 : 0, dx = gesto === 'piensa' ? -2 : 0;
    function ojo(x) {
      return elip(x + dx, 109 + dy, 10, 12.5, T, '') +
             circ(x + dx + 3.4, 103.5 + dy, 4.2, B, '') +
             circ(x + dx - 3.2, 114.5 + dy, 2, B, '');
    }
    return ojo(78) + ojo(122);
  }

  function boca(gesto) {
    if (gesto === 'festejo') {
      return camino('M89 125 Q100 142 111 125 Q100 128 89 125 Z', T, trazo(2.4)) +
             camino('M93.5 132 Q100 139 106.5 132 Q100 129 93.5 132 Z', ROSA, '');
    }
    if (gesto === 'hola' || gesto === 'animo') {
      return camino('M92 126 Q100 137 108 126 Q100 128.5 92 126 Z', T, trazo(2.4)) +
             camino('M95.5 131.5 Q100 135.5 104.5 131.5 Q100 129.5 95.5 131.5 Z', ROSA, '');
    }
    if (gesto === 'piensa') return circ(104, 131, 2.8, T, '');
    return raya('M100 125 Q100 130 94 131 M100 125 Q100 130 106 131', T, 2.8);     // la «w»
  }

  function nariz(base) {
    if (base === 'perro') return elip(100, 120, 7.5, 5.5, T, '') + circ(97.4, 118.2, 1.9, B, '');
    return camino('M94 118 Q100 116 106 118 Q103 123.5 100 124.5 Q97 123.5 94 118 Z', BASES.gato.nariz, trazo(2.2));
  }

  function cara(base, gesto, d) {
    var b = BASES[base];
    var s = elip(100, 106, 56, 50, d.ribete, '');                 // el borde de la capucha
    s += elip(100, 106, 51, 45, b.piel);                          // la cara, que asoma por la capucha
    s += elip(100, 126, base === 'perro' ? 20 : 17, base === 'perro' ? 13 : 11, b.hocico, '');
    s += elip(66, 124, 8.5, 5.5, ROSA, ' opacity=".6"') + elip(134, 124, 8.5, 5.5, ROSA, ' opacity=".6"');
    s += ojos(gesto) + nariz(base) + boca(gesto);
    if (base === 'gato') {
      s += raya('M52 117 L64 119.5 M52 125 L64 125', T, 2.2, ' opacity=".7"') +
           raya('M148 117 L136 119.5 M148 125 L136 125', T, 2.2, ' opacity=".7"');
    } else {
      // las orejas caídas del perro, que asoman por la capucha
      s += camino('M58 82 C44 90 40 114 49 126 C56 134 64 126 63 114 C62 102 61 92 58 82 Z', b.oreja) +
           camino('M142 82 C156 90 160 114 151 126 C144 134 136 126 137 114 C138 102 139 92 142 82 Z', b.oreja);
    }
    return s;
  }

  /* ---------------------- los brazos, según el gesto ----------------------
     Cada brazo va en una de tres capas: «abajo» (colgando, detrás de la
     cabeza), «arriba» (levantado: delante de la melena y detrás de la
     capucha, así se ve aunque el disfraz sea el león) o «adelante» (la
     mano en el mentón, delante de la cara). */
  function brazos(gesto, traje) {
    var abajoIzq = elip(59, 184, 12.5, 22, traje, undefined, 16);
    var abajoDer = elip(141, 184, 12.5, 22, traje, undefined, -16);
    var saluda = elip(157, 146, 12.5, 22, traje, undefined, 40) +
                 raya('M178 112 Q185 119 185 128 M187 104 Q196 113 196 125', T, 3, ' opacity=".5"');
    switch (gesto) {
      case 'hola':
        return { abajo: abajoIzq, arriba: saluda, adelante: '' };
      case 'festejo':
        return { abajo: '', arriba: elip(43, 146, 12.5, 22, traje, undefined, -40) + elip(157, 146, 12.5, 22, traje, undefined, 40), adelante: '' };
      case 'animo':
        // el puño bien arriba, al costado de la cabeza, con tres rayitas de fuerza
        return {
          abajo: abajoIzq,
          arriba: elip(163, 140, 12.5, 23, traje, undefined, 22) +
                  raya('M178 98 L184 90 M185 112 L194 109 M170 94 L171 85', T, 3, ' opacity=".55"'),
          adelante: ''
        };
      case 'piensa':
        return { abajo: abajoIzq, arriba: '', adelante: elip(126, 156, 11, 19, traje, undefined, -30) };
    }
    return { abajo: abajoIzq + abajoDer, arriba: '', adelante: '' };
  }

  /* ---------------------- todo junto ---------------------- */
  /** El dibujo entero, como texto SVG. */
  function svg(baseId, disfrazId, gesto) {
    var base = existeBase(baseId) ? baseId : BASE_POR_DEFECTO;
    var id = existeDisfraz(disfrazId) ? disfrazId : DISFRAZ_POR_DEFECTO;
    var d = DISFRACES[id];
    gesto = gestoValido(gesto);
    var br = brazos(gesto, d.traje);
    var s = '<svg class="mascota-img" viewBox="0 0 200 250" aria-hidden="true" focusable="false">';
    s += alas(id, d) + cola(id, d);
    s += camino(CUERPO, d.traje);
    s += d.panza ? elip(100, 195, 27, 26, d.panza, '') : rayasAbeja();
    s += br.abajo;
    s += elip(79, 229, 19, 10.5, d.patas || d.traje) + elip(121, 229, 19, 10.5, d.patas || d.traje);
    s += adornosAtras(id, d);
    s += br.arriba;
    s += elip(100, 98, 66, 62, d.traje);                           // la capucha
    s += raya('M50 78 Q56 58 76 46', B, 5, ' opacity=".5"');      // el brillo de juguete
    s += cara(base, gesto, d);
    s += adornosAdelante(id, d);
    s += br.adelante;                                              // la mano en el mentón, adelante de la cara
    return s + '</svg>';
  }

  function comoTexto(baseId, disfrazId) {
    var b = BASES[baseId] || BASES[BASE_POR_DEFECTO];
    var d = DISFRACES[disfrazId] || DISFRACES[DISFRAZ_POR_DEFECTO];
    return b.nombre + ' disfrazado de ' + d.nombre.toLowerCase();
  }

  /* ---------------------- lo que está puesto ---------------------- */
  function baseElegida() {
    var id = window.Almacen && Almacen.equipado ? Almacen.equipado('mascota') : null;
    return existeBase(id) ? id : BASE_POR_DEFECTO;
  }

  function disfrazElegido() {
    var id = window.Almacen && Almacen.equipado ? Almacen.equipado('disfraz') : null;
    return existeDisfraz(id) ? id : DISFRAZ_POR_DEFECTO;
  }

  /* ---------------------- dibujar en la página ---------------------- */
  /* Cada caja recuerda qué tiene dibujado: si no cambió nada, no se toca,
     así repintar la pantalla no la hace parpadear. */
  function pintar(caja, gesto) {
    if (!caja) return;
    gesto = gestoValido(gesto || caja.getAttribute('data-gesto'));
    var base = baseElegida(), disfraz = disfrazElegido();
    var clave = base + '|' + disfraz + '|' + gesto;
    caja.setAttribute('data-gesto', gesto);
    if (caja.getAttribute('data-dibujada') === clave) return;
    caja.setAttribute('data-dibujada', clave);
    caja.innerHTML = svg(base, disfraz, gesto);
  }

  /** La mascota lista para meter en el DOM, con lo que el chico tenga puesto. */
  function crear(gesto, clase) {
    var caja = document.createElement('div');
    caja.className = 'mascota' + (clase ? ' ' + clase : '');
    pintar(caja, gesto);
    return caja;
  }

  /** Le cambia el gesto a una mascota que ya está en pantalla. */
  function gesto(caja, g) { pintar(caja, g); }

  /** Para las vistas previas: un animal y un disfraz sueltos. */
  function vista(baseId, disfrazId, g) { return svg(baseId, disfrazId, g || 'normal'); }

  /** Vuelve a dibujar todas las mascotas que haya en pantalla (cambió el disfraz). */
  function refrescar() {
    var nodos = document.querySelectorAll('.mascota');
    for (var i = 0; i < nodos.length; i++) pintar(nodos[i]);
  }

  /** Las que vienen escritas en el HTML: <div data-mascota="hola">. */
  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-mascota]');
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].classList.add('mascota');
      pintar(nodos[i], nodos[i].getAttribute('data-gesto') || nodos[i].getAttribute('data-mascota'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return {
    svg: svg, crear: crear, gesto: gesto, vista: vista, refrescar: refrescar,
    hidratar: hidratar, comoTexto: comoTexto,
    BASES: BASES, DISFRACES: DISFRACES,
    BASE_POR_DEFECTO: BASE_POR_DEFECTO,
    DISFRAZ_POR_DEFECTO: DISFRAZ_POR_DEFECTO
  };
})();
