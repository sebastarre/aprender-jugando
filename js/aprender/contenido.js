/* ============================================================
   Contenido de la sección Aprender: cursitos cortos.

   Una lección la cuenta la mascota, de a un paso por vez, desde un
   globito: frases cortas, como le hablaría un grande a un chico, y abajo
   algo para mirar o para tocar. Al final, lo que aprendió en dos o tres
   frases y un ejercicio con preguntas de un juego: aprender algo y
   enseguida usarlo, que es la idea de toda la app.

   Cómo se escribe un paso:
     - Arranca con algo para mirar o para tocar, no con una definición.
     - Una o dos frases, de veinte palabras o menos: si hace falta más,
       son dos pasos. La voz lee todo lo que dice la mascota.
     - Sin títulos: habla la mascota, y un título arriba de cada paso
       delataba la respuesta de la pregunta que venía abajo.
     - Si algo sale mal, la pista enseña y anima (la Regla del Error
       Amable, en DESIGN.md): nunca «mal», nunca «incorrecto».

   Un paso puede tener:
     texto               lo que dice la mascota (admite <b> para resaltar, y
                         <span lang="en"> para que la voz lo diga en inglés)
     gesto               la cara de la mascota: 'hola', 'piensa', 'festejo',
                         'animo' o 'normal' (si no está, la elige el visor)
     visual: function () devuelve HTML (normalmente un SVG dibujado acá)
     interactivo: {...}  una actividad para tocar y probar: contar, juntar,
                         clasificar, mover el reloj… (ver js/aprender/actividades.js).
                         Puede ser una función que la devuelva.
     truco:  'texto'     un recuadro con el atajo para acordarse
     video:  'url'       un video embebido (necesita internet)
     practica: { pregunta, opciones, correcta, explicacion, pista }
                         «¿Y vos?» después de la explicación: hay que
                         contestarla bien para seguir
     prediccion: { pregunta, opciones, correcta, explicacion, sinDibujo }
                         la mascota pregunta ANTES de explicar, y lo que se
                         toca aparece después; con sinDibujo el dibujo
                         también espera, cuando delataría la respuesta

   Y la lección entera:
     aprendiste  dos o tres frases con lo que se lleva, antes del ejercicio
     ejercicio   unas preguntas de un juego para terminarla:
       juego      'materia/juego'
       nivel      el id del nivel de ese juego (el que mejor ejercita lo
                  que explica la lección)
       valores    otras opciones del juego, si tiene (sumas o restas)
       cantidad   cuántas preguntas (5)
       consigna   lo que se le dice antes de empezar; también lo lee la voz
     Con el 80% bien la lección queda completada; si no, se vuelve a probar.
     reflexion   { pregunta, razones, correcta, porque, grande }
                 «¿por qué?» después del ejercicio, eligiendo la razón;
                 «grande» propone contárselo a un adulto
   ============================================================ */
window.Lecciones = (function () {
  'use strict';

  // los colores y la tinta de los dibujos de la app (js/nucleo/dibujos.js)
  var C = (window.Dibujos && Dibujos.COLORES) || {};
  var T = (window.Dibujos && Dibujos.TINTA) || '#27304A';
  var LETRA = ' font-family="\'Baloo 2\', sans-serif" font-weight="800"';

  /* ---------------------- dibujos reutilizables ---------------------- */

  /** Dos columnas: el inglés a la izquierda y qué quiere decir a la derecha. */
  function listaEn(pares, alReves) {
    return '<div class="lista-en">' + pares.map(function (p) {
      var ingles = alReves ? p[0] : p[1];
      var otro = alReves ? p[1] : p[0];
      return '<div class="lista-en-fila"><b lang="en">' + ingles + '</b>' +
             '<span>' + otro + '</span></div>';
    }).join('') + '</div>';
  }

  /** Una cuenta en columna, con el acarreo opcional arriba. */
  function columna(arriba, abajo, signo, resultado, llevo, resaltar) {
    function fila(n, clase) {
      var texto = String(n);
      var celdas = texto.split('').map(function (d, i) {
        var esUltima = i === texto.length - 1;
        var marca = (resaltar === 'unidades' && esUltima) ||
                    (resaltar === 'decenas' && !esUltima);
        return '<span class="cd' + (marca ? ' cd-marca' : '') + '">' + d + '</span>';
      }).join('');
      return '<div class="cuenta-fila ' + (clase || '') + '">' + celdas + '</div>';
    }

    var html = '<div class="cuenta-columna">';
    if (llevo) {
      html += '<div class="cuenta-fila cuenta-llevo"><span class="cd cd-llevo">' +
              llevo + '</span><span class="cd"></span></div>';
    }
    html += fila(arriba);
    html += '<div class="cuenta-fila cuenta-signo"><span class="cd cd-op">' + signo +
            '</span>' + String(abajo).split('').map(function (d) {
              return '<span class="cd">' + d + '</span>';
            }).join('') + '</div>';
    html += '<div class="cuenta-raya"></div>';
    html += fila(resultado === null ? '' : resultado, 'cuenta-resultado');
    html += '</div>';
    return html;
  }

  /**
   * Una resta de dos cifras pidiendo prestado, como se hace en el
   * cuaderno: el número de arriba tachado, y encima lo que quedó (la
   * decena que prestó, una menos; las unidades, diez más).
   */
  function prestado(arriba, abajo, resultado) {
    var d = Math.floor(arriba / 10), u = arriba % 10;
    var html = '<div class="cuenta-columna cuenta-prestada">';
    html += '<div class="cuenta-fila cuenta-llevo"><span class="cd cd-llevo">' + (d - 1) + '</span>' +
            '<span class="cd cd-llevo">' + (u + 10) + '</span></div>';
    html += '<div class="cuenta-fila"><span class="cd cd-tachado">' + d + '</span>' +
            '<span class="cd cd-tachado">' + u + '</span></div>';
    html += '<div class="cuenta-fila cuenta-signo"><span class="cd cd-op">−</span>' +
            String(abajo).split('').map(function (x) { return '<span class="cd">' + x + '</span>'; }).join('') + '</div>';
    html += '<div class="cuenta-raya"></div>';
    html += '<div class="cuenta-fila cuenta-resultado">' + String(resultado).split('').map(function (x) {
      return '<span class="cd">' + x + '</span>';
    }).join('') + '</div>';
    return html + '</div>';
  }

  /**
   * La fila de los números, del 0 al 10. Desde `desde` da tantos
   * saltitos como diga `salto`: para adelante si es positivo (sumar) y
   * para atrás si es negativo (restar). `marcas` resalta otros números,
   * para comparar cuál viene antes.
   */
  function recta(desde, salto, marcas) {
    var X0 = 16, PASO = 28, Y = 62;
    function x(n) { return X0 + n * PASO; }
    var hasta = desde === null ? null : desde + salto;
    var dice = desde === null
      ? 'La fila de los números, del 0 al 10'
      : 'La fila de los números: desde el ' + desde + ', ' + Math.abs(salto) + ' saltitos para ' +
        (salto > 0 ? 'adelante' : 'atrás') + ', hasta el ' + hasta;
    var s = '<svg class="recta" viewBox="0 0 312 100" role="img" aria-label="' + dice + '">';
    s += '<path d="M' + (X0 - 8) + ' ' + Y + ' H' + (x(10) + 8) + '" stroke="' + T + '" stroke-width="3" stroke-linecap="round"/>';
    for (var n = 0; n <= 10; n++) {
      s += '<path d="M' + x(n) + ' ' + (Y - 6) + ' V' + (Y + 6) + '" stroke="' + T + '" stroke-width="3" stroke-linecap="round"/>';
      var marcado = n === desde || n === hasta || (marcas && marcas.indexOf(n) >= 0);
      if (marcado) {
        s += '<circle cx="' + x(n) + '" cy="' + (Y + 22) + '" r="13" fill="' +
             (n === hasta && salto ? C.verde : C.girasol) + '" stroke="' + T + '" stroke-width="2.4"/>';
      }
      s += '<text x="' + x(n) + '" y="' + (Y + 28) + '" text-anchor="middle"' + LETRA +
           ' font-size="17" fill="' + T + '">' + n + '</text>';
    }
    if (desde !== null && salto) {
      var dir = salto > 0 ? 1 : -1;
      for (var k = 0; k < Math.abs(salto); k++) {
        var a = x(desde + dir * k), b = x(desde + dir * (k + 1));
        s += '<path d="M' + a + ' ' + (Y - 8) + ' Q' + ((a + b) / 2) + ' ' + (Y - 40) + ' ' + b + ' ' + (Y - 8) +
             '" fill="none" stroke="' + C.coral + '" stroke-width="3" stroke-linecap="round"/>';
        // la puntita de la flecha, en la dirección en que llega el salto
        s += '<path d="M' + (b - 8.2 * dir) + ' ' + (Y - 14) + ' L' + b + ' ' + (Y - 8) + ' L' + (b + 1 * dir) + ' ' + (Y - 18) +
             '" fill="none" stroke="' + C.coral + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
        s += '<text x="' + ((a + b) / 2) + '" y="' + (Y - 30) + '" text-anchor="middle"' + LETRA +
             ' font-size="12" fill="' + T + '">' + (dir > 0 ? '+1' : '−1') + '</text>';
      }
    }
    return s + '</svg>';
  }

  /** Filas y columnas de puntitos, para ver la multiplicación. */
  function puntitos(filas, columnas) {
    var html = '<div class="puntitos">';
    for (var f = 0; f < filas; f++) {
      html += '<div class="puntitos-fila">';
      for (var c = 0; c < columnas; c++) html += '<span class="punto-bola"></span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /**
   * Una palabra cortada en pedacitos (ma · ri · po · sa), o cualquier
   * lista en fila. `fuerte` es el lugar del pedacito que va resaltado.
   */
  function trozos(partes, fuerte) {
    return '<div class="trozos">' + partes.map(function (p, i) {
      return '<span' + (i === fuerte ? ' class="trozo-fuerte"' : '') + '>' + p + '</span>';
    }).join('') + '</div>';
  }

  /** Una ronda de «¿qué parte suena más fuerte?», para la lección de la tilde. */
  function fuerte(palabra, partes, correcta, bien) {
    var pistas = {};
    partes.forEach(function (p, i) {
      if (i !== correcta) pistas[i] = 'Decí «' + palabra + '» otra vez, despacito, como si llamaras a alguien de lejos. ¿Qué parte se estira?';
    });
    return { consigna: '¿Qué parte de «' + palabra + '» suena más fuerte?', partes: partes, correcta: correcta, bien: bien, pistas: pistas };
  }

  /** Una cosa que se convierte en otra: flor → fruto → planta nueva. */
  function cadena(pasos) {
    return '<div class="cadena">' + pasos.map(function (p) {
      return '<span class="cadena-paso"><span class="visual-emoji" aria-hidden="true">' + p[0] + '</span>' +
             '<b>' + p[1] + '</b></span>';
    }).join('<span class="cadena-flecha" aria-hidden="true">→</span>') + '</div>';
  }

  /** Rosa de los vientos. */
  function brujula() {
    return '<svg class="dibujo-svg" viewBox="0 0 200 200" role="img" aria-label="Los cuatro puntos cardinales">' +
      '<circle cx="100" cy="100" r="78" fill="#ffffff" stroke="#E3E8F0" stroke-width="4"/>' +
      '<polygon points="100,28 112,100 100,88 88,100" fill="#F2644E"/>' +
      '<polygon points="100,172 112,100 100,112 88,100" fill="#3AA3E8"/>' +
      '<polygon points="172,100 100,112 112,100 100,88" fill="#8B6CF0"/>' +
      '<polygon points="28,100 100,112 88,100 100,88" fill="#4DBF6B"/>' +
      '<circle cx="100" cy="100" r="7" fill="#27304A"/>' +
      '<text x="100" y="18" text-anchor="middle" font-size="20" font-weight="700" fill="#27304A">N</text>' +
      '<text x="100" y="196" text-anchor="middle" font-size="20" font-weight="700" fill="#27304A">S</text>' +
      '<text x="190" y="107" text-anchor="middle" font-size="20" font-weight="700" fill="#27304A">E</text>' +
      '<text x="10" y="107" text-anchor="middle" font-size="20" font-weight="700" fill="#27304A">O</text>' +
      '</svg>';
  }

  /** El globo terráqueo de Geografía, el mismo de su ficha. */
  function globo() {
    return window.Dibujos ? '<div class="visual-dibujo">' + Dibujos.svg('geografia') + '</div>' : '';
  }

  /** País → capital, con la bandera. */
  function paisCapital(codigos) {
    var porId = {};
    (window.PAISES || []).forEach(function (p) { porId[p.id] = p; });
    return '<div class="tarjetitas">' + codigos.map(function (id) {
      var p = porId[id];
      if (!p) return '';
      return '<div class="tarjetita"><img src="' + Util.bandera(id) + '" alt="" class="tarjetita-bandera">' +
             '<b>' + p.nombre + '</b><span>' + p.capital + '</span></div>';
    }).join('') + '</div>';
  }

  function reloj(hora, minuto) {
    return window.Matematica ? Matematica.dibujarReloj(hora, minuto) : '';
  }

  /** Un dibujo grande (un emoji que es la cosa misma: la vaca, la uva). */
  function emoji(e) { return '<div class="visual-emoji" aria-hidden="true">' + e + '</div>'; }

  /** Varios dibujos grandes en fila. */
  function emojis(lista) {
    return '<div class="fila-emojis" aria-hidden="true">' + lista.map(function (e) {
      return '<span class="visual-emoji">' + e + '</span>';
    }).join('') + '</div>';
  }

  /** Una letra grande con su dibujo al lado: la A y la abeja. */
  function letraCon(letra, dibujo) {
    return '<span class="letra-con"><b>' + letra + '</b><span aria-hidden="true">' + dibujo + '</span></span>';
  }

  /** Un cuadrado del color, para escuchar su nombre. */
  function color(hex) { return '<div class="visual-color" style="background:' + hex + '"></div>'; }

  /** N cosas en fila, con los dibujos de contar (assets/contar). */
  function cosas(cosa, n) {
    var html = '<div class="act-fila" aria-hidden="true">';
    for (var i = 0; i < n; i++) html += '<img class="act-cosa" src="assets/contar/' + cosa + '.png" alt="">';
    return html + '</div>';
  }

  /** Lo repartido: un plato por amigo, con lo que le tocó a cada uno. */
  function repartir(cosa, cadaUno, platos) {
    var html = '<div class="repartir" aria-hidden="true">';
    for (var i = 0; i < platos; i++) html += '<div class="act-grupo">' + cosas(cosa, cadaUno) + '</div>';
    return html + '</div>';
  }

  /** Dos grupos, uno arriba del otro, para comparar cuántos hay. */
  function dosFilas(cosa, a, b) {
    return '<div class="dos-filas">' + cosas(cosa, a) + cosas(cosa, b) + '</div>';
  }

  /** Las figuras de Matemática, en fila: [[id, color], …] */
  function figuras(lista) {
    if (!window.Matematica) return '';
    return '<div class="fila-figuras">' + lista.map(function (f) {
      return Matematica.dibujarFigura(f[0], f[1]);
    }).join('') + '</div>';
  }

  /** Una opción de respuesta con el dibujo de la figura adelante: a los
      cuatro años, «el triángulo» escrito no alcanza. */
  function conFigura(id, relleno, nombre) {
    if (!window.Matematica) return nombre;
    return Matematica.dibujarFigura(id, relleno)
      .replace('class="figura"', 'class="figura figura-opcion"')
      .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"') + nombre;
  }

  function torta(n, d) {
    return window.Matematica ? Matematica.dibujarFraccion(n, d, 'circulo') : '';
  }

  /** Una planta con sus partes, de la raíz a la flor. */
  function planta() {
    var t = ' stroke="#27304A" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
    function rotulo(x, y, texto, ancla) {
      return '<text x="' + x + '" y="' + y + '" font-family="\'Baloo 2\', sans-serif" font-weight="800" ' +
             'font-size="15" fill="#27304A" text-anchor="' + (ancla || 'start') + '">' + texto + '</text>';
    }
    function linea(x1, y1, x2, y2) {
      return '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="#5B6478" stroke-width="1.6" stroke-dasharray="3 3"/>';
    }
    return '<svg class="dibujo-svg dibujo-planta" viewBox="0 0 240 230" role="img" aria-label="Una planta con su raíz, su tallo, sus hojas y su flor">' +
      '<rect x="10" y="150" width="220" height="72" rx="14" fill="#F2B48E"/>' +
      '<path d="M120 150 C118 170 104 180 96 200 M120 152 C124 172 138 182 146 202 M120 150 L120 206"' + t + ' fill="none"/>' +
      '<path d="M120 152 L120 64"' + t + ' fill="none"/>' +
      '<path d="M120 116 C100 118 86 106 80 92 C98 90 112 98 120 116 Z" fill="#4DBF6B"' + t + '/>' +
      '<path d="M120 96 C140 98 154 86 160 72 C142 70 128 78 120 96 Z" fill="#4DBF6B"' + t + '/>' +
      '<circle cx="120" cy="40" r="13" fill="#FFC93C"' + t + '/><circle cx="101" cy="50" r="13" fill="#FFC93C"' + t + '/>' +
      '<circle cx="139" cy="50" r="13" fill="#FFC93C"' + t + '/><circle cx="108" cy="68" r="13" fill="#FFC93C"' + t + '/>' +
      '<circle cx="132" cy="68" r="13" fill="#FFC93C"' + t + '/><circle cx="120" cy="56" r="11" fill="#F2644E"' + t + '/>' +
      linea(150, 44, 182, 34) + rotulo(186, 39, 'flor') +
      linea(160, 76, 186, 84) + rotulo(190, 89, 'hoja') +
      linea(120, 132, 72, 136) + rotulo(66, 141, 'tallo', 'end') +
      linea(144, 196, 180, 204) + rotulo(184, 209, 'raíz') +
      '</svg>';
  }

  /**
   * Los planetas, chiquitos, para las tarjetas del sistema solar. No
   * están a escala (Júpiter sería once Tierras de ancho), pero se ve cuáles
   * son los chicos y cuáles los gigantes.
   */
  function planeta(id) {
    var tr = ' stroke="' + T + '" stroke-width="2.6"';
    function bola(r, relleno) { return '<circle cx="32" cy="32" r="' + r + '" fill="' + relleno + '"' + tr + '/>'; }
    function borde(r) { return '<circle cx="32" cy="32" r="' + r + '" fill="none"' + tr + '/>'; }
    function mancha(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + T + '" opacity=".22"/>'; }
    function banda(y, x1, x2, tono) {
      return '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" stroke="' + tono + '" stroke-width="4"/>';
    }
    // el anillo de Saturno: la mitad de atrás va antes que el planeta, y la de adelante después
    function anillo(mitad) {
      var d = 'M4 32 A28 8 0 0 ' + (mitad === 'atras' ? 1 : 0) + ' 60 32';
      return '<g transform="rotate(-18 32 32)"><path d="' + d + '" fill="none" stroke="' + T + '" stroke-width="7" stroke-linecap="round"/>' +
             '<path d="' + d + '" fill="none" stroke="' + C.naranja + '" stroke-width="3" stroke-linecap="round"/></g>';
    }
    var cuerpo = {
      mercurio: bola(11, C.canas) + mancha(28, 30, 2.2) + mancha(35, 35, 1.8),
      venus: bola(14, C.piel) + '<path d="M23 29 q9 -4 18 0 M24 36 q8 3 16 0" fill="none" stroke="' + T + '" stroke-width="1.6" opacity=".3"/>',
      tierra: bola(14.5, C.cielo) +
        '<path d="M25 26 c4 -3 9 -2 9 2 c0 4 -5 5 -8 4 c-2 -1 -3 -4 -1 -6 z M34 36 c3 -1 6 1 5 4 c-1 2 -4 3 -6 1 c-1 -2 -1 -4 1 -5 z" fill="' + C.verde + '"/>' +
        borde(14.5),
      marte: bola(12, C.coral) + mancha(28, 29, 2.2) + mancha(35, 35, 1.7),
      jupiter: bola(27, C.piel) + banda(24, 7.3, 56.7, C.naranja) + banda(33, 5.5, 58.5, C.naranja) + banda(42, 8, 56, C.naranja) +
        '<ellipse cx="41" cy="41" rx="4.5" ry="2.8" fill="' + C.coral + '"/>' + borde(27),
      saturno: anillo('atras') + bola(15, C.girasol) + anillo('adelante'),
      urano: bola(17, C.agua) + '<path d="M22 24 q10 -5 20 0" fill="none" stroke="' + C.blanco + '" stroke-width="2.4" stroke-linecap="round"/>',
      neptuno: bola(16, C.cielo) + '<path d="M21 28 q11 -4 22 0 M24 38 q8 2 16 0" fill="none" stroke="' + C.blanco + '" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>'
    }[id];
    return '<svg class="planeta" viewBox="0 0 64 64" aria-hidden="true">' + cuerpo + '</svg>';
  }

  /** El Sol a un lado y la Tierra al otro: la mitad que lo mira tiene día. */
  function diaNoche() {
    var tr = ' stroke="' + T + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
    var rayos = '';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      rayos += '<path d="M' + (46 + Math.cos(a) * 32).toFixed(1) + ' ' + (72 + Math.sin(a) * 32).toFixed(1) +
               ' L' + (46 + Math.cos(a) * 41).toFixed(1) + ' ' + (72 + Math.sin(a) * 41).toFixed(1) + '"' + tr + '/>';
    }
    var luz = [52, 72, 92].map(function (y) {
      return '<path d="M92 ' + y + ' H138" stroke="' + C.girasol + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/>';
    }).join('');
    return '<svg class="dibujo-svg dibujo-ancho" viewBox="0 0 260 152" role="img" ' +
      'aria-label="El Sol ilumina la mitad de la Tierra que lo mira: ahí es de día, y del otro lado es de noche">' +
      rayos + '<circle cx="46" cy="72" r="24" fill="' + C.girasol + '"' + tr + '/>' + luz +
      '<circle cx="192" cy="72" r="46" fill="' + C.cielo + '"/>' +
      '<path d="M170 44 c8 -6 20 -4 22 4 c2 8 -6 12 -3 19 c2 8 -8 13 -16 8 c-9 -6 -12 -22 -3 -31 z" fill="' + C.verde + '"/>' +
      '<path d="M200 82 c9 -3 17 2 16 10 c-1 8 -9 13 -17 11 c-6 -2 -8 -8 -6 -14 c1 -4 3 -6 7 -7 z" fill="' + C.verde + '"/>' +
      '<path d="M192 26 A46 46 0 0 1 192 118 Z" fill="' + T + '" opacity=".6"/>' +
      '<circle cx="192" cy="72" r="46" fill="none"' + tr + '/>' +
      // la flecha de la vuelta arriba, y cada mitad con su nombre abajo
      '<path d="M164 16 Q192 2 220 16"' + tr + ' fill="none"/>' +
      '<path d="M210.6 18.9 L220 16 L215 7.9"' + tr + ' fill="none"/>' +
      '<text x="168" y="142" text-anchor="middle"' + LETRA + ' font-size="16" fill="' + T + '">día</text>' +
      '<text x="218" y="142" text-anchor="middle"' + LETRA + ' font-size="16" fill="' + T + '">noche</text>' +
      '</svg>';
  }

  /* ---------------------- las lecciones ---------------------- */
  var LECCIONES = [
    /* ============ MATEMÁTICA ============ */
    {
      id: 'contar-hasta-diez',
      materia: 'matematica',
      titulo: 'Contar de a uno',
      icono: 'contar',
      edadMin: 4,
      minutos: 2,
      resumen: 'Tocar cada cosa y decir su número.',
      juego: 'matematica/contar',
      ejercicio: { juego: 'matematica/contar', nivel: 'hasta5', cantidad: 5, consigna: 'Contá cuántas hay en cada dibujo. Podés tocarlas para contarlas.' },
      aprendiste: [
        'A cada cosa le toca <b>un número</b>: uno, dos, tres…',
        'El <b>último número</b> que decís es cuántas hay.',
        'Cada una se toca <b>una sola vez</b>.'
      ],
      pasos: [
        {
          texto: '¡Hola! ¿Me ayudás a contar manzanas? Tocá cada una y decí su número en voz alta.',
          interactivo: { tipo: 'contar', cosa: 'manzana', n: 3 }
        },
        {
          texto: 'Ahora los peces. Cuando termines, fijate: el <b>último número</b> que dijiste es cuántos hay.',
          interactivo: { tipo: 'contar', cosa: 'pez', n: 5 },
          practica: { pregunta: 'Contaste «uno, dos, tres, cuatro». ¿Cuántos hay?', opciones: ['4', '1', '5'], correcta: 0, explicacion: 'El último número que dijiste es cuántos hay: cuatro.', pista: '¿Cuál fue el último número que dijiste?' }
        },
        {
          texto: '¡Uy, cuántos pollitos! Para no perderte, tocá cada uno <b>una sola vez</b>.',
          gesto: 'festejo',
          interactivo: { tipo: 'contar', cosa: 'pollito', n: 8 },
          truco: 'Si son muchos, contá de izquierda a derecha, como cuando se lee.'
        }
      ]
    },

    {
      id: 'las-figuras',
      materia: 'matematica',
      titulo: 'Las figuras',
      icono: 'figuras',
      edadMin: 4,
      minutos: 2,
      resumen: 'El círculo, el cuadrado, el triángulo y el rectángulo.',
      juego: 'matematica/figuras',
      ejercicio: { juego: 'matematica/figuras', nivel: 'basicas', cantidad: 5, consigna: 'Mirá cada figura y elegí cómo se llama.' },
      aprendiste: [
        'El <b>círculo</b> es redondo: no tiene puntas.',
        'El <b>triángulo</b> tiene 3 lados, y el <b>cuadrado</b>, 4 iguales.',
        'El <b>rectángulo</b> es como un cuadrado estirado.'
      ],
      pasos: [
        {
          texto: '¡Hola! Te presento a cuatro figuras. Tocá cada una y escuchá cómo se llama.',
          interactivo: function () {
            return { tipo: 'escuchar', cosas: [
              { visual: Matematica.dibujarFigura('circulo', C.cielo), nombre: 'círculo', decir: 'El círculo' },
              { visual: Matematica.dibujarFigura('cuadrado', C.girasol), nombre: 'cuadrado', decir: 'El cuadrado' },
              { visual: Matematica.dibujarFigura('triangulo', C.verde), nombre: 'triángulo', decir: 'El triángulo' },
              { visual: Matematica.dibujarFigura('rectangulo', C.coral), nombre: 'rectángulo', decir: 'El rectángulo' }
            ] };
          }
        },
        {
          texto: 'El <b>círculo</b> es redondo, redondo: no tiene ninguna punta. Como una pelota o una galletita.',
          visual: function () { return figuras([['circulo', C.cielo]]) + emojis(['⚽', '🍪']); },
          practica: { pregunta: '¿Cuál es <b>redondo</b>, como el círculo?', opciones: ['🕐 El reloj', '📦 La caja', '🚪 La puerta'], correcta: 0, explicacion: 'El reloj es redondo, como el círculo.', pista: 'Buscá el que no tiene puntas.' }
        },
        {
          texto: 'El <b>triángulo</b> tiene <b>3 lados</b> y <b>3 puntas</b>. ¡Como una porción de pizza!',
          visual: function () { return figuras([['triangulo', C.verde]]) + emoji('🍕'); },
          practica: { pregunta: '¿Cuál tiene <b>3 puntas</b>?', opciones: [conFigura('triangulo', C.verde, 'El triángulo'), conFigura('circulo', C.cielo, 'El círculo'), conFigura('cuadrado', C.girasol, 'El cuadrado')], correcta: 0, explicacion: 'El triángulo tiene 3 lados y 3 puntas.', pista: 'Contá las puntas de cada una con el dedo.' }
        },
        {
          texto: 'El <b>cuadrado</b> tiene 4 lados iguales. Si lo estirás, ¡se hace un <b>rectángulo</b>! Como una puerta.',
          visual: function () { return figuras([['cuadrado', C.girasol], ['rectangulo', C.coral]]) + emoji('🚪'); },
          practica: { pregunta: '¿Cuántos lados tiene el <b>rectángulo</b>?', opciones: ['4', '3', '2'], correcta: 0, explicacion: 'Tiene 4, como el cuadrado: dos largos y dos cortos.', pista: 'Recorré el borde con el dedo y contá cada lado.' }
        }
      ]
    },

    {
      id: 'sumar-es-juntar',
      materia: 'matematica',
      titulo: 'Sumar es juntar',
      icono: 'mas',
      edadMin: 5,
      minutos: 2,
      resumen: 'Juntar dos grupos y contar todo.',
      juego: 'matematica/cuentas',
      ejercicio: { juego: 'matematica/cuentas', nivel: 'facil', valores: { operacion: 'suma' }, cantidad: 5, consigna: 'Resolvé cinco sumas chiquitas. Si querés, contá con los dedos.' },
      aprendiste: [
        'Sumar es <b>juntar</b> y contar todo.',
        'Se escribe con el signo <b>+</b>, que se lee «más».',
        'Un atajo: empezá en el número más grande y <b>seguí contando</b>.'
      ],
      pasos: [
        {
          texto: 'Tengo <b>2</b> manzanas y me regalan <b>3</b>. ¿Cuántas tengo ahora? Tocá «¡Juntar!» y contalas.',
          interactivo: { tipo: 'sumar', a: 2, b: 3, cosa: 'manzana' }
        },
        {
          texto: 'Juntar se escribe con el signo <b>+</b>, que se lee «más». Probá con las frutillas: <b>4 + 2</b>.',
          interactivo: { tipo: 'sumar', a: 4, b: 2, cosa: 'frutilla' },
          practica: { pregunta: '¿Cuánto es <b>3 + 1</b>?', opciones: ['4', '2', '31'], correcta: 0, explicacion: 'Tres y uno más son cuatro.', pista: 'Levantá 3 dedos, después 1 más, y contalos todos.' }
        },
        {
          texto: 'Un truco de grandes: parate en el número más grande y <b>seguí contando</b>. Tres… ¡cuatro, cinco!',
          visual: function () { return recta(3, 2); },
          practica: { pregunta: 'Estás en el <b>5</b> y das 2 saltitos para adelante. ¿Dónde llegás?', opciones: ['7', '6', '3'], correcta: 0, explicacion: 'Cinco… seis, siete: 5 + 2 = 7.', pista: 'Decí «cinco» y contá dos números más.' }
        }
      ]
    },

    {
      id: 'restar-es-sacar',
      materia: 'matematica',
      titulo: 'Restar es sacar',
      icono: 'menos',
      edadMin: 5,
      minutos: 2,
      resumen: 'Sacar algunas y ver cuántas quedan.',
      juego: 'matematica/cuentas',
      ejercicio: { juego: 'matematica/cuentas', nivel: 'facil', valores: { operacion: 'resta' }, cantidad: 5, consigna: 'Resolvé cinco restas chiquitas.' },
      aprendiste: [
        'Restar es <b>sacar</b> y ver cuántas quedan.',
        'Se escribe con el signo <b>−</b>, que se lee «menos».',
        'Para restar, podés <b>contar para atrás</b>.'
      ],
      pasos: [
        {
          texto: 'Tengo <b>5</b> globos… ¡y se me escapan <b>2</b>! ¿Cuántos me quedan? Tocá el botón.',
          interactivo: { tipo: 'restar', a: 5, b: 2, cosa: 'globo' }
        },
        {
          texto: 'Sacar se escribe con el signo <b>−</b>, que se lee «menos». Ahora sacá <b>3</b> pelotas de <b>6</b>.',
          interactivo: { tipo: 'restar', a: 6, b: 3, cosa: 'pelota' },
          practica: { pregunta: 'Tenés <b>4</b> pelotas y regalás <b>1</b>. ¿Cuántas te quedan?', opciones: ['3', '5', '4'], correcta: 0, explicacion: '4 − 1 = 3: si sacás una, quedan tres.', pista: 'Si regalás una, te quedan menos. ¿Cuántas hay antes del 4?' }
        },
        {
          texto: 'Otro truco: para restar, contá <b>para atrás</b>. Desde el 5, dos saltitos: cuatro… ¡tres!',
          visual: function () { return recta(5, -2); },
          practica: { pregunta: 'Estás en el <b>7</b> y das 2 saltitos para atrás. ¿Dónde llegás?', opciones: ['5', '9', '6'], correcta: 0, explicacion: 'Siete… seis, cinco: 7 − 2 = 5.', pista: 'Para atrás es hacia los números más chicos: seis, y uno más.' }
        }
      ]
    },

    {
      id: 'mas-y-menos',
      materia: 'matematica',
      titulo: '¿Dónde hay más?',
      icono: 'comparar',
      edadMin: 5,
      minutos: 2,
      resumen: 'Cuál número es más grande y cuál más chico.',
      juego: 'matematica/comparar',
      ejercicio: { juego: 'matematica/comparar', nivel: 'hasta10', cantidad: 5, consigna: 'En cada pregunta, buscá el número que te piden.' },
      aprendiste: [
        'Para saber dónde hay más, se <b>cuenta</b>.',
        'En la fila de los números, el que viene <b>después</b> es más grande.',
        'Y el que viene <b>antes</b>, más chico.'
      ],
      pasos: [
        {
          texto: '¡Mirá cuántas flores! ¿Dónde hay <b>más</b>: arriba o abajo? Contalas.',
          gesto: 'piensa',
          visual: function () { return dosFilas('flor', 3, 5); },
          practica: { pregunta: '¿Dónde hay más flores?', opciones: ['Abajo', 'Arriba'], correcta: 0, explicacion: 'Abajo hay 5 y arriba hay 3: 5 es más que 3.', pista: 'Contá las de arriba, y después las de abajo.' }
        },
        {
          texto: 'En la fila de los números, el que viene <b>después</b> siempre es más grande. El 6 está más lejos que el 2.',
          visual: function () { return recta(null, 0, [2, 6]); },
          practica: { pregunta: '¿Qué es más: <b>2</b> o <b>6</b>?', opciones: ['6', '2'], correcta: 0, explicacion: 'Seis es más que dos: en la fila, el 6 viene después.', pista: '¿Cuál está más lejos en la fila?' }
        },
        {
          texto: 'Y al revés: el que viene <b>antes</b> es el más chico.',
          visual: function () { return recta(null, 0, [4, 7, 9]); },
          practica: { pregunta: '¿Cuál es el <b>más chico</b>: 7, 4 o 9?', opciones: ['4', '7', '9'], correcta: 0, explicacion: 'El 4 viene antes que el 7 y que el 9.', pista: 'Buscá cuál aparece primero en la fila.' }
        }
      ]
    },

    {
      id: 'sumar-llevando',
      materia: 'matematica',
      titulo: 'Sumar llevándose una',
      icono: 'mas',
      edadMin: 6,
      minutos: 3,
      resumen: 'Qué hacer cuando una columna se pasa de 9.',
      juego: 'matematica/cuentas',
      ejercicio: { juego: 'matematica/cuentas', nivel: 'dificil', valores: { operacion: 'suma' }, cantidad: 5, consigna: 'Resolvé cinco sumas. En algunas te vas a tener que llevar una.' },
      reflexion: {"pregunta":"¿Por qué, cuando una columna da 12, escribís el 2 y te llevás el 1?","razones":["Porque en cada columna entra un solo número, y ese 1 es una decena","Porque el 1 no sirve y se deja de lado","Porque siempre se escribe el número más chico"],"correcta":0,"porque":"El 12 son 1 decena y 2 unidades: el 2 queda en las unidades y la decena se va a su columna.","grande":"Contale a un grande por qué 27 + 15 da 42 y no 32."},
      aprendiste: [
        'Se empieza por la derecha: por las <b>unidades</b>.',
        'Si una columna da 10 o más, escribís las unidades y <b>te llevás 1</b>.',
        'Ese 1 es <b>una decena</b>: diez cubitos juntos en una barra.'
      ],
      pasos: [
        {
          texto: '¿Por qué los grandes dicen «me llevo una»? Miralo con bloques: cada <b>barra</b> son 10 cubitos. Juntemos <b>27 + 15</b>.',
          interactivo: { tipo: 'bloques', a: 27, b: 15, op: '+' }
        },
        {
          prediccion: {"pregunta":"Ahora con números. Para hacer 27 + 15, ¿con qué columna empezarías?","opciones":["Con la de la derecha: 7 + 5","Con la de la izquierda: 2 + 1"],"correcta":0,"explicacion":"Se empieza por las unidades, porque lo que sobra ahí pasa a la columna de al lado."},
          texto: 'Arrancamos por la derecha: <b>7 + 5 = 12</b>. Pero en cada columna entra un solo número… ¡y 12 son dos!',
          // sin resaltar: la columna marcada delataría la respuesta
          visual: function () { return columna(27, 15, '+', null); }
        },
        {
          texto: 'Del 12, el <b>2</b> se queda abajo y el <b>1</b> sube a la columna de al lado. ¡Es la barra que armaste con los cubitos!',
          visual: function () { return columna(27, 15, '+', 2, 1, 'unidades'); },
          truco: 'Cuando sumás dos números, lo que te llevás es siempre un 1.'
        },
        {
          texto: 'Última columna, sin olvidarte del 1: <b>2 + 1 + 1 = 4</b>. ¡<b>27 + 15 = 42</b>!',
          gesto: 'festejo',
          visual: function () { return columna(27, 15, '+', 42, 1, 'decenas'); },
          practica: { pregunta: '¿Cuánto es <b>18 + 5</b>?', opciones: ['23', '13', '113'], correcta: 0, explicacion: '8 + 5 = 13: escribís el 3 y te llevás 1. Después, 1 + 1 = 2. Da 23.', pista: 'Empezá por 8 + 5, y acordate del 1 que te llevás.' }
        }
      ]
    },

    {
      id: 'leer-el-reloj',
      materia: 'matematica',
      titulo: 'Leer el reloj de agujas',
      icono: 'reloj',
      edadMin: 6,
      minutos: 3,
      resumen: 'Cuál aguja es cuál y qué significa cada número.',
      juego: 'matematica/reloj',
      ejercicio: { juego: 'matematica/reloj', nivel: 'media', cantidad: 5, consigna: 'Mirá cada reloj y elegí qué hora marca.' },
      reflexion: {"pregunta":"¿Por qué, cuando la aguja larga está en el 6, son 30 minutos?","razones":["Porque cada número vale 5 minutos, y seis veces 5 es 30","Porque son las 6","Porque la aguja corta también está en el 6"],"correcta":0,"porque":"Contá de 5 en 5 desde el 12 hasta el 6: 5, 10, 15, 20, 25, 30.","grande":"Preguntale a un grande qué hora es, y fijate vos en el reloj."},
      aprendiste: [
        'La aguja <b>corta</b> marca la hora, y la <b>larga</b>, los minutos.',
        'Para la larga, cada número vale <b>5 minutos</b>.',
        'La larga en el 12 es <b>en punto</b>; en el 3, <b>y cuarto</b>; en el 6, <b>y media</b>.'
      ],
      pasos: [
        {
          texto: 'El reloj tiene dos agujas. La <b>corta</b> marca la hora y la <b>larga</b>, los minutos. Acá son las <b>3 en punto</b>.',
          visual: function () { return reloj(3, 0); },
          truco: '«Hora» es una palabra corta, como su aguja. «Minutos» es larga, como la suya.'
        },
        {
          prediccion: {"pregunta":"La aguja larga se fue al 3. ¿Cuántos minutos te parece que son?","opciones":["15 minutos","3 minutos","30 minutos"],"correcta":0,"explicacion":"Para la aguja larga, cada número vale 5 minutos: 5, 10, 15."},
          texto: 'Contá de 5 en 5 desde el 12 hasta donde está la larga. Son las <b>3 y cuarto</b>: un cuarto de hora son 15 minutos.',
          visual: function () { return reloj(3, 15); }
        },
        {
          texto: 'Cuando la larga llega al <b>6</b>, dio media vuelta: son las <b>3 y media</b>. Fijate que la corta también se movió un poquito.',
          visual: function () { return reloj(3, 30); }
        },
        {
          texto: 'Ahora movelo vos: la larga da toda la vuelta, y la corta avanza despacito.',
          interactivo: { tipo: 'reloj', hora: 3, minuto: 0 },
          practica: { pregunta: 'La corta está en el <b>8</b> y la larga en el <b>12</b>. ¿Qué hora es?', opciones: ['Las 8 en punto', 'Las 12 y 8', 'Las 8 y media'], correcta: 0, explicacion: 'La larga en el 12 es «en punto», y la corta dice la hora: las 8.', pista: 'La corta dice la hora. ¿Y qué quiere decir la larga en el 12?' }
        }
      ]
    },

    {
      id: 'restar-prestando',
      materia: 'matematica',
      titulo: 'Restar pidiendo prestado',
      icono: 'menos',
      edadMin: 7,
      minutos: 3,
      resumen: 'Cuando el de arriba es más chico que el de abajo.',
      juego: 'matematica/cuentas',
      ejercicio: { juego: 'matematica/cuentas', nivel: 'dificil', valores: { operacion: 'resta' }, cantidad: 5, consigna: 'Resolvé cinco restas. En algunas vas a tener que pedir prestado.' },
      reflexion: {"pregunta":"¿Por qué, cuando el 4 presta, el 2 pasa a ser 12?","razones":["Porque el 4 presta una decena, que vale diez","Porque se le suma el 10 que sobraba","Porque en las restas siempre se suma 10"],"correcta":0,"porque":"El 4 son cuatro decenas. Presta una, que vale diez, y se queda en 3: 2 + 10 = 12.","grande":"Contale a un grande cómo se resuelve 42 − 17."},
      aprendiste: [
        'Si arriba hay menos que abajo, se le <b>pide prestado</b> al de al lado.',
        'El de al lado baja <b>1</b>, y el tuyo sube <b>10</b>.',
        'La cuenta no se da vuelta: el de arriba va <b>siempre primero</b>.'
      ],
      pasos: [
        {
          texto: 'Tengo <b>42</b> cubitos y tengo que sacar <b>17</b>. ¡Pero sueltos tengo sólo 2! Tocá el botón y mirá cómo se arregla.',
          interactivo: { tipo: 'bloques', a: 42, b: 17, op: '-' }
        },
        {
          prediccion: {"pregunta":"En el cuaderno: arriba hay un 2 y abajo un 7. ¿Qué hacemos?","opciones":["Pedirle prestado al 4","Dar vuelta la cuenta: 7 − 2","Poner un 0 y seguir"],"correcta":0,"explicacion":"La cuenta no se da vuelta: el de arriba va siempre primero. Si no alcanza, se pide prestado."},
          texto: 'Igual que con los bloques: al 2 no le alcanza, así que le pide prestado al <b>4</b>.',
          visual: function () { return columna(42, 17, '−', null, null, 'unidades'); }
        },
        {
          texto: 'El 4 presta una decena y queda en <b>3</b>. El 2 recibe diez y pasa a ser <b>12</b>. Ahora sí: <b>12 − 7 = 5</b>.',
          visual: function () { return prestado(42, 17, 5); },
          truco: 'El de al lado baja 1, y el tuyo sube 10.'
        },
        {
          texto: 'Queda la otra columna: <b>3 − 1 = 2</b>. ¡<b>42 − 17 = 25</b>!',
          gesto: 'festejo',
          visual: function () { return prestado(42, 17, 25); },
          practica: { pregunta: '¿Cuánto es <b>31 − 9</b>?', opciones: ['22', '38', '32'], correcta: 0, explicacion: 'Al 1 no le alcanza: el 3 presta y queda en 2, y el 1 pasa a ser 11. 11 − 9 = 2. Da 22.', pista: '¿Al 1 le alcanza para sacar 9? Si no, pedile prestado al 3.' }
        }
      ]
    },

    {
      id: 'que-es-multiplicar',
      materia: 'matematica',
      titulo: 'Qué es multiplicar',
      icono: 'tablas',
      edadMin: 7,
      minutos: 2,
      resumen: 'Multiplicar es sumar muchas veces lo mismo.',
      juego: 'matematica/tablas',
      ejercicio: { juego: 'matematica/tablas', nivel: '2', cantidad: 5, consigna: 'Empezá por la tabla del 2: cinco multiplicaciones.' },
      reflexion: {"pregunta":"¿Por qué 4 × 3 da lo mismo que 3 × 4?","razones":["Porque 3 filas de 4 y 4 filas de 3 son los mismos puntitos","Porque en las multiplicaciones el orden a veces importa","Porque los dos números son chicos"],"correcta":0,"porque":"Si das vuelta los puntitos no aparece ni se va ninguno: siguen siendo 12.","grande":"Mostrale a un grande con puntitos por qué 2 × 5 es lo mismo que 5 × 2."},
      aprendiste: [
        'Multiplicar es sumar <b>el mismo número</b> varias veces.',
        '<b>3 filas de 4</b> son 4 + 4 + 4: <b>4 × 3 = 12</b>.',
        'El orden no importa: <b>4 × 3 = 3 × 4</b>.'
      ],
      pasos: [
        {
          prediccion: {"pregunta":"¿Cuántos puntitos hay? Son 3 filas de 4.","opciones":["12","7","34"],"correcta":0,"explicacion":"Son 4 + 4 + 4 = 12. El 7 sería 3 + 4, que es otra cuenta."},
          texto: 'Sumar <b>4 + 4 + 4</b> es largo. Multiplicar es el atajo: se escribe <b>4 × 3</b>, y se lee «cuatro por tres».',
          visual: function () { return puntitos(3, 4); }
        },
        {
          texto: 'Ahora armalo vos: cambiá las filas y las columnas, y mirá cómo cambia la cuenta.',
          interactivo: { tipo: 'multiplicar', filas: 3, columnas: 4 }
        },
        {
          texto: 'Si das vuelta la caja, ¿cambia algo? <b>4 filas de 3</b> siguen siendo 12. ¡El orden no importa!',
          visual: function () { return puntitos(4, 3); },
          truco: 'Si sabés 7 × 3, ya sabés 3 × 7: ¡la mitad de las tablas, de regalo!',
          practica: { pregunta: 'Si <b>2 × 5 = 10</b>, ¿cuánto es <b>5 × 2</b>?', opciones: ['10', '7', '25'], correcta: 0, explicacion: 'El orden no importa: 5 × 2 también es 10.', pista: 'Pensá en los puntitos: si das vuelta la caja, ¿aparece alguno nuevo?' }
        }
      ]
    },

    {
      id: 'dividir-es-repartir',
      materia: 'matematica',
      titulo: 'Dividir es repartir',
      icono: 'division',
      edadMin: 8,
      minutos: 3,
      resumen: 'Repartir en partes iguales, y la tabla al revés.',
      juego: 'matematica/division',
      ejercicio: { juego: 'matematica/division', nivel: '2', cantidad: 5, consigna: 'Empezá dividiendo por 2: cinco divisiones.' },
      reflexion: {"pregunta":"¿Por qué, si sabés que 3 × 4 = 12, ya sabés cuánto es 12 ÷ 4?","razones":["Porque dividir es la multiplicación al revés","Porque siempre da 3","Porque 12 es un número par"],"correcta":0,"porque":"12 ÷ 4 pregunta qué número por 4 da 12, y eso es 3.","grande":"Repartí con un grande unas galletitas en partes iguales y decí la cuenta."},
      aprendiste: [
        'Dividir es <b>repartir en partes iguales</b>.',
        'Es la tabla al revés: si <b>2 × 4 = 8</b>, entonces <b>8 ÷ 2 = 4</b>.',
        'Para saber si está bien, se <b>multiplica</b>.'
      ],
      pasos: [
        {
          texto: 'Tengo <b>6</b> frutillas para <b>2</b> amigos, y a los dos les tiene que tocar lo mismo. Repartilas de a una.',
          interactivo: { tipo: 'repartir', n: 6, platos: 2, cosa: 'frutilla' }
        },
        {
          prediccion: {"pregunta":"Ya sabés que 2 × 4 = 8. Entonces, ¿cuánto te parece que es 8 ÷ 2?","opciones":["4","16","6"],"correcta":0,"explicacion":"Dividir es preguntarse qué número por 2 da 8: es el 4."},
          texto: 'Dividir es la <b>tabla al revés</b>: la respuesta está en las tablas. Mirá: 8 frutillas en 2 platos, ¡4 en cada uno!',
          visual: function () { return repartir('frutilla', 4, 2); },
          practica: { pregunta: '¿Cuánto es <b>12 ÷ 3</b>?', opciones: ['4', '9', '36'], correcta: 0, explicacion: 'Porque 3 × 4 = 12.', pista: 'Buscá en la tabla del 3: ¿qué número por 3 da 12?' }
        },
        {
          texto: '¿Cómo sé si está bien? Multiplicando: si <b>12 ÷ 3 = 4</b>, entonces <b>4 × 3</b> tiene que dar 12. ¡Y da!',
          gesto: 'festejo',
          visual: function () { return repartir('manzana', 4, 3); },
          truco: 'Para dividir por un número, pensá en su tabla.'
        }
      ]
    },

    {
      id: 'las-fracciones',
      materia: 'matematica',
      titulo: 'Las fracciones',
      icono: 'fracciones',
      edadMin: 9,
      minutos: 3,
      resumen: 'Partes iguales de un entero: medios, tercios y cuartos.',
      juego: 'matematica/fracciones',
      ejercicio: { juego: 'matematica/fracciones', nivel: 'faciles', cantidad: 5, consigna: 'Mirá cada torta y elegí qué parte está pintada.' },
      reflexion: {"pregunta":"¿Por qué 1/2 y 2/4 son lo mismo?","razones":["Porque las dos pintan la mitad de la torta","Porque tienen los mismos números","Porque 4 es más que 2"],"correcta":0,"porque":"2 de 4 partes iguales ocupan lo mismo que 1 de 2: la mitad.","grande":"Cortá con un grande una fruta en partes iguales y pónganle nombre a cada parte."},
      aprendiste: [
        'Una fracción es una parte de algo cortado en <b>partes iguales</b>.',
        'Abajo va en cuántas partes se cortó, y arriba, cuántas se toman.',
        'Cuantas más partes, <b>más chiquita</b> es cada una.'
      ],
      pasos: [
        {
          texto: 'Esta torta está cortada en <b>4 partes iguales</b>. Tocá algunas porciones para pintarlas.',
          interactivo: { tipo: 'fraccion', partes: 4 }
        },
        {
          texto: 'Se escribe así: abajo, en <b>cuántas partes</b> se cortó; arriba, <b>cuántas se pintaron</b>. Ésta es <b>3/4</b>, «tres cuartos».',
          visual: function () { return torta(3, 4); },
          practica: { pregunta: 'Una pizza de <b>8</b> porciones: comiste <b>3</b>. ¿Qué parte comiste?', opciones: ['3/8', '8/3', '3/5'], correcta: 0, explicacion: 'Abajo va el total de porciones, 8, y arriba las que comiste, 3.', pista: 'Abajo va el total de porciones. ¿Cuántas tenía la pizza?' }
        },
        {
          // el dibujo delataría la respuesta: aparece después de contestar
          prediccion: {"pregunta":"¿Qué pedazo de torta es más grande: 1/2 o 1/4?","opciones":["1/2","1/4"],"correcta":0,"explicacion":"Cuantas más partes se corta la torta, más chiquita es cada una: 1/2 es más.","sinDibujo":true},
          texto: 'Parece raro, porque 4 es más que 2. ¡Pero una torta repartida entre <b>4</b> deja porciones más chicas que entre <b>2</b>!',
          visual: function () { return torta(1, 2) + torta(1, 4); }
        },
        {
          texto: 'Si pintás la mitad de las partes, es <b>la mitad</b>. Probá: pintá la mitad de esta torta de 6.',
          gesto: 'festejo',
          interactivo: { tipo: 'fraccion', partes: 6 },
          truco: 'La mitad de 6 son 3: 3/6 también es la mitad.'
        }
      ]
    },

    /* ============ GEOGRAFÍA ============ */
    {
      id: 'los-paisajes',
      materia: 'geografia',
      titulo: 'Los lugares de la Tierra',
      icono: 'paisajes',
      edadMin: 4,
      minutos: 2,
      resumen: 'La montaña, el río, el mar y el bosque.',
      juego: 'geografia/paisajes',
      ejercicio: { juego: 'geografia/paisajes', nivel: 'n1', cantidad: 5, consigna: 'Mirá cada dibujo y decí qué lugar es.' },
      aprendiste: [
        'La <b>montaña</b> es altísima, y arriba puede tener nieve.',
        'El <b>mar</b> es enorme y salado, y al lado está la <b>playa</b>.',
        'En el <b>bosque</b> hay muchos árboles, y el <b>campo</b> es grande y plano.'
      ],
      pasos: [
        {
          texto: '¡Nos vamos de paseo! Tocá cada lugar y escuchá cómo se llama.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🏔️'), nombre: 'la montaña', decir: 'La montaña.' },
            { visual: emoji('🏞️'), nombre: 'el río', decir: 'El río.' },
            { visual: emoji('🌊'), nombre: 'el mar', decir: 'El mar.' },
            { visual: emoji('🏖️'), nombre: 'la playa', decir: 'La playa.' },
            { visual: emoji('🌲'), nombre: 'el bosque', decir: 'El bosque.' },
            { visual: emoji('🌾'), nombre: 'el campo', decir: 'El campo.' }
          ] }
        },
        {
          texto: 'La <b>montaña</b> es tan alta que arriba hace frío y hay <b>nieve</b>. Y el <b>río</b> es agua que baja corriendo.',
          visual: function () { return emojis(['🏔️', '🏞️']); },
          practica: { pregunta: '¿Dónde hay <b>nieve</b> arriba?', opciones: ['🏔️ En la montaña', '🏖️ En la playa', '🌾 En el campo'], correcta: 0, explicacion: 'Arriba de las montañas hace mucho frío, y por eso hay nieve.', pista: '¿Qué lugar es tan alto que llega hasta donde hace frío?' }
        },
        {
          texto: 'El <b>mar</b> es enorme y su agua es <b>salada</b>. Al lado está la <b>playa</b>: ¡arena para hacer castillos!',
          visual: function () { return emojis(['🌊', '🏖️']); },
          practica: { pregunta: '¿Dónde hay <b>arena y olas</b>?', opciones: ['🏖️ En la playa', '🌲 En el bosque', '🏔️ En la montaña'], correcta: 0, explicacion: 'En la playa: la arena está al lado del mar, y el mar tiene olas.', pista: 'Las olas son del mar. ¿Qué lugar está al lado del mar?' }
        },
        {
          texto: 'En el <b>bosque</b> hay muchísimos árboles juntos. El <b>campo</b> es grande y plano, con pasto y vacas.',
          gesto: 'festejo',
          visual: function () { return emojis(['🌲', '🌾']); },
          practica: { pregunta: '¿Dónde hay <b>muchos árboles</b> juntos?', opciones: ['🌲 En el bosque', '🌊 En el mar', '🏖️ En la playa'], correcta: 0, explicacion: 'Un bosque es un lugar lleno de árboles.', pista: 'Buscá el dibujo que tiene árboles.' }
        }
      ]
    },

    {
      id: 'campo-ciudad-mar',
      materia: 'geografia',
      titulo: 'La ciudad, el campo y el mar',
      icono: 'donde',
      edadMin: 5,
      minutos: 2,
      resumen: 'Qué se ve en cada lugar.',
      juego: 'geografia/donde',
      ejercicio: { juego: 'geografia/donde', nivel: 'n2', cantidad: 5, consigna: 'Decí dónde se ve cada cosa: en la ciudad, en el campo o en el mar.' },
      aprendiste: [
        'En la <b>ciudad</b> hay edificios, semáforos y colectivos.',
        'En el <b>campo</b> hay vacas, tractores y mucho pasto.',
        'En el <b>mar</b> hay barcos, peces y ballenas.'
      ],
      pasos: [
        {
          texto: 'Hay lugares con muchísima gente y lugares con muchísimas vacas. Tocá cada uno.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🏙️'), nombre: 'la ciudad', decir: 'La ciudad: edificios, autos y mucha gente.' },
            { visual: emoji('🌾'), nombre: 'el campo', decir: 'El campo: pasto, vacas y tractores.' },
            { visual: emoji('🌊'), nombre: 'el mar', decir: 'El mar: agua salada, barcos y peces.' }
          ] }
        },
        {
          texto: '¿Me ayudás a ordenar? Tocá una cosa y después el lugar donde se ve.',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'ciudad', nombre: 'La ciudad', visual: '🏙️' },
              { id: 'campo', nombre: 'El campo', visual: '🌾' },
              { id: 'mar', nombre: 'El mar', visual: '🌊' }
            ],
            cosas: [
              { nombre: 'el semáforo', visual: '🚦', grupo: 'ciudad', pista: 'El semáforo ordena a los autos en las calles. ¿Dónde hay muchas calles?' },
              { nombre: 'la vaca', visual: '🐮', grupo: 'campo', bien: '¡Sí! En el campo, la vaca tiene pasto de sobra para comer.', pista: 'La vaca come mucho pasto. ¿Dónde hay pasto de sobra?' },
              { nombre: 'el barco', visual: '⛵', grupo: 'mar', pista: 'El barco flota en el agua. ¿Dónde hay agua para navegar?' },
              { nombre: 'el tractor', visual: '🚜', grupo: 'campo', bien: '¡Sí! Con el tractor se siembra en el campo.', pista: 'El tractor sirve para sembrar. ¿Dónde se siembra?' },
              { nombre: 'el pulpo', visual: '🐙', grupo: 'mar', pista: 'El pulpo vive bajo el agua salada. ¿Dónde está esa agua?' },
              { nombre: 'el colectivo', visual: '🚌', grupo: 'ciudad', pista: 'El colectivo lleva gente por las calles. ¿Dónde vive tanta gente junta?' }
            ],
            final: '¡Todo en su lugar! Ya sabés qué se ve en la ciudad, en el campo y en el mar.'
          }
        },
        {
          texto: 'Cada cosa está donde la necesitan. La ballena, por ejemplo, necesita muchísima agua…',
          gesto: 'piensa',
          visual: function () { return emoji('🐳'); },
          practica: { pregunta: '¿Dónde se ve una <b>ballena</b>?', opciones: ['🌊 En el mar', '🏙️ En la ciudad', '🌾 En el campo'], correcta: 0, explicacion: 'La ballena vive en el mar: es enorme y necesita muchísima agua.', pista: 'Es un animal gigante que nada. ¿Dónde hay tanta agua?' }
        }
      ]
    },

    {
      id: 'que-es-un-continente',
      materia: 'geografia',
      titulo: 'Qué es un continente',
      icono: 'continentes',
      edadMin: 6,
      minutos: 2,
      resumen: 'Los pedazos grandes de tierra donde vivimos.',
      juego: 'geografia/paises',
      ejercicio: { juego: 'geografia/continentes', nivel: 'n2', cantidad: 5, consigna: 'Elegí en qué continente está cada país.' },
      reflexion: {"pregunta":"¿Por qué Argentina y Brasil están en el mismo continente?","razones":["Porque los dos están en el mismo gran pedazo de tierra: América","Porque hablan el mismo idioma","Porque tienen la misma bandera"],"correcta":0,"porque":"Un continente es un pedazo grande de tierra: no importan el idioma ni la bandera.","grande":"Buscá con un grande, en un mapa, dónde está Argentina y dónde está España."},
      aprendiste: [
        'Casi toda la Tierra es <b>agua</b>: los océanos.',
        'Los pedazos grandes de tierra son los <b>continentes</b>: con gente hay 5.',
        'Nosotros vivimos en <b>América</b>, en la parte de abajo.'
      ],
      pasos: [
        {
          texto: 'Si mirás la Tierra desde el espacio, casi todo es <b>azul</b>: es agua, los océanos. Lo verde es la tierra firme.',
          visual: globo
        },
        {
          prediccion: {"pregunta":"Los pedazos más grandes de tierra se llaman continentes. ¿Cuántos con gente te parece que hay?","opciones":["5","2","194"],"correcta":0,"explicacion":"194 son los países. Los continentes son pedazos mucho más grandes, y con gente hay 5."},
          texto: 'Son <b>cinco</b>: América, Europa, África, Asia y Oceanía. Tocalos en el mapa.',
          interactivo: { tipo: 'mapa', modo: 'continentes' }
        },
        {
          texto: 'Hay un sexto, abajo de todo: la <b>Antártida</b>. Es casi toda de hielo, y hace tanto frío que casi nadie vive ahí.',
          visual: function () { return emojis(['🧊', '🐧']); },
          practica: { pregunta: '¿En qué continente está la <b>Argentina</b>?', opciones: ['América', 'Europa', 'África'], correcta: 0, explicacion: 'La Argentina está en América, en la parte de abajo: América del Sur.', pista: 'Es el continente donde vivimos nosotros. ¿Te acordás cuál era en el mapa?' }
        }
      ]
    },

    {
      id: 'leer-un-mapa',
      materia: 'geografia',
      titulo: 'Cómo se lee un mapa',
      icono: 'mapa',
      edadMin: 6,
      minutos: 2,
      resumen: 'Norte, sur, este, oeste y qué significan los colores.',
      juego: 'geografia/paises',
      ejercicio: { juego: 'geografia/paises', nivel: 'america-sur', cantidad: 5, consigna: 'Buscá cada país en el mapa de América del Sur.' },
      reflexion: {"pregunta":"Si en el mapa Brasil queda a la derecha de Perú, ¿qué es Brasil de Perú?","razones":["Está al este","Está al oeste","Está al norte"],"correcta":0,"porque":"En los mapas, la derecha es el este y la izquierda, el oeste.","grande":"Jugá con un grande: uno dice norte, sur, este u oeste y el otro señala."},
      aprendiste: [
        'En los mapas, arriba es el <b>norte</b> y abajo, el <b>sur</b>.',
        'A la derecha está el <b>este</b>, y a la izquierda, el <b>oeste</b>.',
        'Lo <b>azul</b> es agua: mares, ríos y lagos.'
      ],
      pasos: [
        {
          texto: 'En casi todos los mapas, <b>arriba es el norte</b> y abajo, el <b>sur</b>. A la derecha está el <b>este</b>, y a la izquierda, el <b>oeste</b>.',
          visual: brujula,
          truco: 'Empezá arriba y girá como las agujas del reloj: Norte, Este, Sur, Oeste.'
        },
        {
          texto: 'Ahora, un mapa de verdad: América del Sur. ¿Qué países tenemos alrededor?',
          interactivo: { tipo: 'mapa', modo: 'rumbos' }
        },
        {
          prediccion: {"pregunta":"En un mapa, ¿qué te parece que es lo que está pintado de azul?","opciones":["Agua: mares, ríos y lagos","Los países más fríos","El cielo"],"correcta":0,"explicacion":"El azul es siempre agua. La tierra se pinta de otros colores."},
          texto: 'Y las <b>rayitas</b> que cruzan la tierra son los límites: dónde termina un país y empieza otro.',
          practica: { pregunta: 'Chile está a la <b>izquierda</b> de la Argentina. ¿Hacia dónde queda?', opciones: ['Al oeste', 'Al este', 'Al norte'], correcta: 0, explicacion: 'En los mapas, la izquierda es el oeste.', pista: 'Acordate: a la derecha el este, y a la izquierda…' }
        }
      ]
    },

    {
      id: 'que-es-una-capital',
      materia: 'geografia',
      titulo: 'Qué es una capital',
      icono: 'capitales',
      edadMin: 7,
      minutos: 2,
      resumen: 'La ciudad principal de cada país (no siempre la más grande).',
      juego: 'geografia/capitales',
      ejercicio: { juego: 'geografia/capitales', nivel: 'america-sur', cantidad: 5, consigna: 'Buscá en el mapa el país de cada capital. Son todos de América del Sur.' },
      reflexion: {"pregunta":"¿Por qué Brasilia es la capital de Brasil, si São Paulo es más grande?","razones":["Porque la capital es donde está el gobierno, no la ciudad más grande","Porque Brasilia es más linda","Porque São Paulo está en otro país"],"correcta":0,"porque":"Lo que hace a una ciudad capital es que ahí está el gobierno del país.","grande":"Preguntale a un grande cuál es la capital de Argentina."},
      aprendiste: [
        'La <b>capital</b> es la ciudad donde está el gobierno del país.',
        'No siempre es la más grande: la de Brasil es <b>Brasilia</b>.',
        'La capital de la Argentina es <b>Buenos Aires</b>.'
      ],
      pasos: [
        {
          texto: 'Cada país tiene una ciudad especial: la <b>capital</b>. Ahí está el gobierno, que decide cosas para todo el país.',
          visual: function () { return paisCapital(['AR', 'CL', 'UY']); }
        },
        {
          texto: 'Probá vos: tocá un país de América del Sur y te digo su capital.',
          interactivo: { tipo: 'mapa', modo: 'capitales' }
        },
        {
          prediccion: {"pregunta":"La ciudad más grande de Brasil es São Paulo. ¿Será su capital?","opciones":["No, es otra ciudad","Sí, la capital siempre es la más grande"],"correcta":0,"explicacion":"La capital es donde está el gobierno. En Brasil es Brasilia, aunque São Paulo sea más grande."},
          texto: 'En <b>Estados Unidos</b> tampoco es Nueva York: es Washington. Y en <b>Australia</b>, Canberra, no Sídney.',
          visual: function () { return paisCapital(['BR', 'US', 'AU']); },
          truco: 'Si dudás entre dos ciudades famosas, la capital suele ser la menos famosa.'
        }
      ]
    },

    /* ============ LENGUA ============ */
    {
      id: 'las-vocales',
      materia: 'lengua',
      titulo: 'Las vocales',
      icono: 'vocales',
      edadMin: 4,
      minutos: 2,
      resumen: 'A, E, I, O, U: las cinco vocales.',
      juego: 'lengua/letras',
      ejercicio: { juego: 'lengua/letras', nivel: 'n1', cantidad: 5, consigna: 'Mirá cada dibujo, decí su nombre despacio y elegí con qué letra empieza.' },
      aprendiste: [
        'Las vocales son cinco: <b>A, E, I, O, U</b>.',
        'Se pueden estirar: <b>aaaa, oooo, uuuu</b>.',
        'Todas las palabras tienen alguna vocal.'
      ],
      pasos: [
        {
          texto: '¡Hola! Te presento a cinco letras muy especiales: las <b>vocales</b>. Tocá cada una.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: letraCon('A', '🐝'), nombre: 'A de abeja', decir: 'A. A de abeja.' },
            { visual: letraCon('E', '🐘'), nombre: 'E de elefante', decir: 'E. E de elefante.' },
            { visual: letraCon('I', '🏝️'), nombre: 'I de isla', decir: 'I. I de isla.' },
            { visual: letraCon('O', '🐻'), nombre: 'O de oso', decir: 'O. O de oso.' },
            { visual: letraCon('U', '🍇'), nombre: 'U de uva', decir: 'U. U de uva.' }
          ] }
        },
        {
          texto: 'Las vocales se pueden <b>estirar</b>: ooooso. ¡Decilo conmigo, bien largo!',
          gesto: 'festejo',
          visual: function () { return emoji('🐻'); },
          practica: { pregunta: '¿Con qué vocal empieza <b>oso</b>?', opciones: ['O', 'A', 'U'], correcta: 0, explicacion: 'Oooo-so: empieza con O.', pista: 'Decí «oso» despacito y estirá lo primero que suena.' }
        },
        {
          texto: 'Ahora decí despacio <b>uuuu-va</b>. ¿Qué suena primero?',
          gesto: 'piensa',
          visual: function () { return emoji('🍇'); },
          practica: { pregunta: '¿Con qué vocal empieza <b>uva</b>?', opciones: ['U', 'O', 'E'], correcta: 0, explicacion: 'Uuuu-va: empieza con U.', pista: 'Estirá el principio: uuuu…' }
        },
        {
          texto: 'Las vocales se esconden entre otras letras. ¿Las encontrás?',
          interactivo: { tipo: 'tocar', rondas: [
            { consigna: 'Tocá la <b>A</b>.', partes: ['M', 'A', 'S'], correcta: 1, bien: '¡Esa es! La <b>A</b>, de abeja.',
              pistas: { 0: 'Esa es la M, de mamá. La A tiene forma de techito.', 2: 'Esa es la S, de sol. La A tiene forma de techito.' } },
            { consigna: 'Tocá la <b>O</b>.', partes: ['P', 'L', 'O'], correcta: 2, bien: '¡Sí! La <b>O</b>, redonda como una rueda.',
              pistas: { 0: 'Esa es la P, de papá. La O es redonda como una rueda.', 1: 'Esa es la L, de luna. La O es redonda como una rueda.' } },
            { consigna: 'Tocá la <b>U</b>.', partes: ['U', 'T', 'R'], correcta: 0, bien: '¡Muy bien! La <b>U</b>, de uva.',
              pistas: { 1: 'Esa es la T, de tomate. La U parece una tacita.', 2: 'Esa es la R, de ratón. La U parece una tacita.' } }
          ] }
        }
      ]
    },

    {
      id: 'palabras-que-riman',
      materia: 'lengua',
      titulo: 'Palabras que riman',
      icono: 'rimas',
      edadMin: 5,
      minutos: 2,
      resumen: 'Dos palabras riman cuando terminan igual.',
      juego: 'lengua/rimas',
      ejercicio: { juego: 'lengua/rimas', nivel: 'n1', cantidad: 5, consigna: 'Escuchá la palabra y buscá la que rima.' },
      aprendiste: [
        'Dos palabras <b>riman</b> cuando terminan igual.',
        'Para saberlo, escuchá <b>el final</b>: g<b>ato</b>, p<b>ato</b>.'
      ],
      pasos: [
        {
          texto: 'Escuchá: <b>gato</b>… <b>pato</b>. ¿Oíste? Terminan igual: <b>-ato</b>. ¡Por eso riman!',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐱'), nombre: 'g<b>ato</b>', decir: 'gato' },
            { visual: emoji('🦆'), nombre: 'p<b>ato</b>', decir: 'pato' }
          ] }
        },
        {
          texto: 'Tocá cada pareja y escuchá cómo suenan igual al final.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emojis(['🌸', '🥁']), nombre: 'fl<b>or</b> y tamb<b>or</b>', decir: 'flor, tambor' },
            { visual: emojis(['🍋', '🚚']), nombre: 'lim<b>ón</b> y cami<b>ón</b>', decir: 'limón, camión' },
            { visual: emojis(['🧀', '💋']), nombre: 'qu<b>eso</b> y b<b>eso</b>', decir: 'queso, beso' }
          ] }
        },
        {
          texto: '¿Cuáles riman con <b>sol</b>? Tocá una palabra y llevala a su lugar.',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'si', nombre: 'Rima con sol', visual: '☀️' },
              { id: 'no', nombre: 'No rima' }
            ],
            cosas: [
              { nombre: 'caracol', visual: '🐌', grupo: 'si', bien: '¡Sí! Cara-<b>col</b>, <b>sol</b>: terminan igual.', pista: 'Escuchá el final: cara-col… ¡suena como sol!' },
              { nombre: 'girasol', visual: '🌻', grupo: 'si', bien: '¡Sí! Gira-<b>sol</b>: ¡tiene un sol adentro!', pista: 'Escuchá el final: gira-sol. ¿No suena como sol?' },
              { nombre: 'gol', visual: '⚽', grupo: 'si', bien: '¡Gooool! Y rima con sol.', pista: 'Decí «gol» y «sol»: terminan igual.' },
              { nombre: 'casa', visual: '🏠', grupo: 'no', pista: 'Casa termina en -asa, y sol en -ol: no suenan igual.' },
              { nombre: 'mano', visual: '✋', grupo: 'no', pista: 'Mano termina en -ano: no suena como sol.' },
              { nombre: 'perro', visual: '🐶', grupo: 'no', pista: 'Perro termina en -erro: no suena como sol.' }
            ],
            final: '¡Muy bien! Caracol, girasol y gol riman con sol.'
          }
        },
        {
          texto: '¡Ahora te toca a vos! Buscá la que rima con <b>luna</b>.',
          gesto: 'piensa',
          visual: function () { return emoji('🌙'); },
          practica: { pregunta: '¿Qué palabra rima con <b>luna</b>?', opciones: ['cuna', 'sol', 'mesa'], correcta: 0, explicacion: 'Luna y cuna terminan igual: -una.', pista: 'Decí «luna» y escuchá el final: -una. ¿Cuál termina así?' }
        }
      ]
    },

    {
      id: 'armar-palabras',
      materia: 'lengua',
      titulo: 'Armar palabras',
      icono: 'silabas',
      edadMin: 5,
      minutos: 2,
      resumen: 'Las sílabas, y cómo se arma una palabra con ellas.',
      juego: 'lengua/armar',
      ejercicio: { juego: 'lengua/armar', nivel: 'n1', cantidad: 5, consigna: 'Armá cada palabra con sus pedacitos, en orden.' },
      aprendiste: [
        'Las palabras se parten en pedacitos: las <b>sílabas</b>.',
        'Se cuentan con aplausos: <b>ma-ri-po-sa</b> son 4.',
        'El <b>orden</b> importa: ca-sa no es lo mismo que sa-ca.'
      ],
      pasos: [
        {
          texto: 'Si decís <b>ca-sa</b> despacito, la palabra se parte en dos pedacitos. Tocá las palabras y escuchalas.',
          interactivo: { tipo: 'silabas', palabras: ['ca-sa', 'lu-na', 'ga-to'] }
        },
        {
          texto: 'Cada pedacito es una <b>sílaba</b>. Aplaudí una vez por cada una: <b>ma-ri-po-sa</b> son cuatro palmas.',
          gesto: 'festejo',
          interactivo: { tipo: 'silabas', palabras: ['ma-ri-po-sa', 'to-ma-te', 'sol'] },
          practica: { pregunta: '¿Cuántas sílabas tiene <b>pe-lo-ta</b>?', opciones: ['3', '2', '4'], correcta: 0, explicacion: 'Pe-lo-ta: tres palmas.', pista: 'Aplaudí despacito: pe… lo… ta.' }
        },
        {
          prediccion: {"pregunta":"Si das vuelta los pedacitos de ca-sa, ¿qué palabra queda?","opciones":["saca","casa","asac"],"correcta":0,"explicacion":"Sa-ca: ¡otra palabra! Por eso el orden importa."},
          texto: 'Para armar una palabra, primero va el pedacito que <b>suena primero</b>. ¿Me ayudás?',
          interactivo: { tipo: 'tocar', silabas: true, rondas: [
            { consigna: 'Para armar <b>luna</b>, ¿qué va primero?', partes: ['na', 'lu'], correcta: 1, bien: '¡Sí! Primero <b>lu</b> y después <b>na</b>: lu-na.',
              pistas: { 0: 'Decí «luna» despacito: ¿qué suena primero?' } },
            { consigna: 'Para armar <b>gato</b>, ¿qué va primero?', partes: ['to', 'ga'], correcta: 1, bien: '¡Eso! Ga-to.',
              pistas: { 0: 'Decí «gato» despacito: ¿qué suena primero?' } },
            { consigna: 'Para armar <b>mesa</b>, ¿qué va primero?', partes: ['me', 'sa'], correcta: 0, bien: '¡Muy bien! Me-sa.',
              pistas: { 1: 'Decí «mesa» despacito: ¿qué suena primero?' } }
          ] },
          truco: 'Decí la palabra despacio, y poné primero la sílaba que suena primero.'
        }
      ]
    },

    {
      id: 'los-contrarios',
      materia: 'lengua',
      titulo: 'Los contrarios',
      icono: 'contrarios',
      edadMin: 6,
      minutos: 2,
      resumen: 'Palabras que dicen lo opuesto: grande y chico.',
      juego: 'lengua/contrarios',
      ejercicio: { juego: 'lengua/contrarios', nivel: 'n1', cantidad: 5, consigna: 'Buscá el contrario de cada palabra.' },
      aprendiste: [
        'Dos palabras son <b>contrarias</b> cuando dicen lo opuesto.',
        'Grande y chico, frío y caliente, rápido y lento.',
        '<b>Enorme</b> no es el contrario de grande: dice casi lo mismo.'
      ],
      pasos: [
        {
          texto: 'Un elefante es <b>grande</b> y un ratón es <b>chico</b>: dicen lo opuesto. ¡Son palabras <b>contrarias</b>! Tocalas.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐘'), nombre: 'grande', decir: 'grande' },
            { visual: emoji('🐭'), nombre: 'chico', decir: 'chico' },
            { visual: emoji('☀️'), nombre: 'día', decir: 'día' },
            { visual: emoji('🌙'), nombre: 'noche', decir: 'noche' }
          ] }
        },
        {
          texto: 'Cada palabra busca a su contraria. Tocá una y llevala con su pareja.',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'frio', nombre: 'Al revés de <b>frío</b>', visual: '🧊' },
              { id: 'rapido', nombre: 'Al revés de <b>rápido</b>', visual: '🐇' },
              { id: 'arriba', nombre: 'Al revés de <b>arriba</b>', visual: '⬆️' }
            ],
            cosas: [
              { nombre: 'caliente', visual: '🔥', grupo: 'frio', bien: '¡Sí! Frío y caliente dicen lo opuesto.', pista: 'Caliente es como el fuego. Buscá su opuesto: algo bien helado.' },
              { nombre: 'lento', visual: '🐢', grupo: 'rapido', bien: '¡Sí! La liebre es rápida, y la tortuga, lenta.', pista: 'Lento es como la tortuga. Buscá su opuesto: ¡el que corre ligero!' },
              { nombre: 'abajo', visual: '⬇️', grupo: 'arriba', bien: '¡Sí! Arriba y abajo dicen lo opuesto.', pista: 'Abajo es hacia el piso. Buscá su opuesto: hacia el cielo.' }
            ],
            final: '¡Cada una con su contraria!'
          }
        },
        {
          texto: '¡Ojo con los parecidos! <b>Enorme</b> no es el contrario de grande: dice casi lo mismo. El contrario dice <b>lo opuesto</b>.',
          gesto: 'piensa',
          visual: function () { return emojis(['🐘', '🦕']); },
          practica: { pregunta: '¿Cuál es el contrario de <b>alto</b>?', opciones: ['bajo', 'grande', 'largo'], correcta: 0, explicacion: 'Alto y bajo dicen lo opuesto: una jirafa es alta, y una hormiga, baja.', pista: 'Pensá en una jirafa y en una hormiga: una es alta, y la otra…' }
        }
      ]
    },

    {
      id: 'que-es-una-silaba',
      materia: 'lengua',
      titulo: 'Qué es una sílaba',
      icono: 'silabas',
      edadMin: 7,
      minutos: 3,
      resumen: 'Cómo se corta una palabra en pedacitos.',
      juego: 'lengua/silabas',
      ejercicio: { juego: 'lengua/silabas', nivel: 'n1', cantidad: 5, consigna: 'Contá cuántas sílabas tiene cada palabra. Aplaudí si te ayuda.' },
      reflexion: {"pregunta":"¿Por qué «sol» tiene una sola sílaba si tiene tres letras?","razones":["Porque se dice en un solo golpe de voz","Porque las sílabas son las vocales","Porque las palabras cortas no se cortan"],"correcta":0,"porque":"Las sílabas se cuentan por golpes de voz: «sol» sale de una vez.","grande":"Aplaudí con un grande los nombres de toda tu familia."},
      aprendiste: [
        'Una <b>sílaba</b> es un golpe de voz.',
        'Se cuentan por golpes, no por letras: <b>sol</b> tiene una sola.',
        'Toda sílaba tiene por lo menos una <b>vocal</b>, y a veces dos juntas.'
      ],
      pasos: [
        {
          texto: 'Decí una palabra despacio: vas a notar que sale en <b>golpes de voz</b>. Cada golpe es una <b>sílaba</b>. ¡Tocá y aplaudí!',
          interactivo: { tipo: 'silabas', palabras: ['ma-ri-po-sa', 'sol', 'ca-sa', 'e-le-fan-te'] }
        },
        {
          prediccion: {"pregunta":"«Mariposa» tiene 8 letras. ¿Cuántas sílabas tiene?","opciones":["4","8","2"],"correcta":0,"explicacion":"Ma-ri-po-sa: cuatro golpes de voz. Las sílabas se cuentan por golpes, no por letras.","sinDibujo":true},
          texto: '¡Las letras no importan! <b>Sol</b> tiene tres letras y sale de un solo golpe: tiene una sílaba.',
          visual: function () { return trozos(['ma', 'ri', 'po', 'sa']); }
        },
        {
          texto: 'Toda sílaba tiene por lo menos una <b>vocal</b>. A veces van dos juntas, en el mismo golpe: es-<b>cue</b>-la.',
          visual: function () { return trozos(['es', 'cue', 'la'], 1); }
        },
        {
          texto: 'Ahora buscá vos las sílabas que tienen <b>dos vocales juntas</b>.',
          gesto: 'piensa',
          interactivo: { tipo: 'tocar', silabas: true, rondas: [
            { consigna: 'En <b>cuaderno</b>, ¿cuál tiene dos vocales juntas?', partes: ['cua', 'der', 'no'], correcta: 0, bien: '¡Sí! En <b>cua</b> van la u y la a, de un solo golpe.',
              pistas: { 1: '«Der» tiene una sola vocal: la e. ¡Buscá una con dos!', 2: '«No» tiene una sola vocal: la o. ¡Buscá una con dos!' } },
            { consigna: '¿Y en <b>piano</b>?', partes: ['pia', 'no'], correcta: 0, bien: '¡Eso! En <b>pia</b> van la i y la a.',
              pistas: { 1: '«No» tiene una sola vocal. ¡Probá la otra!' } },
            { consigna: '¿Y en <b>radio</b>?', partes: ['ra', 'dio'], correcta: 1, bien: '¡Muy bien! En <b>dio</b> van la i y la o.',
              pistas: { 0: '«Ra» tiene una sola vocal: la a. ¡Probá la otra!' } },
            { consigna: '¿Y en <b>auto</b>?', partes: ['au', 'to'], correcta: 0, bien: '¡Perfecto! En <b>au</b> van la a y la u, de un solo golpe.',
              pistas: { 1: '«To» tiene una sola vocal. ¡Probá la otra!' } }
          ] }
        }
      ]
    },

    {
      id: 'clases-de-palabras',
      materia: 'lengua',
      titulo: 'Sustantivos, adjetivos y verbos',
      icono: 'clases',
      edadMin: 9,
      minutos: 4,
      resumen: 'Para qué sirve cada clase de palabra.',
      juego: 'lengua/clases',
      ejercicio: { juego: 'lengua/clases', nivel: 'n2', cantidad: 5, consigna: 'Decí si cada palabra es un sustantivo, un adjetivo o un verbo.' },
      reflexion: {"pregunta":"¿Por qué «correr» es un verbo?","razones":["Porque dice una acción, algo que se hace","Porque es una palabra larga","Porque nombra una cosa"],"correcta":0,"porque":"Los verbos dicen lo que alguien hace. Los sustantivos nombran y los adjetivos dicen cómo es algo.","grande":"Decile a un grande tres verbos de cosas que hiciste hoy."},
      aprendiste: [
        'Los <b>sustantivos</b> nombran: perro, plaza, mesa.',
        'Los <b>adjetivos</b> dicen cómo es algo: redonda, gordo, azul.',
        'Los <b>verbos</b> dicen qué se hace: salta, corre, come.'
      ],
      pasos: [
        {
          texto: 'Las palabras tienen trabajos distintos. Unas <b>nombran</b> personas, animales, cosas o lugares: son los <b>sustantivos</b>.',
          interactivo: { tipo: 'tocar', rondas: [
            { consigna: '¿Cuál nombra a un animal?', partes: ['El', 'perro', 'valiente', 'corre'], correcta: 1, bien: '¡Sí! <b>Perro</b> es un sustantivo: nombra a un animal.',
              pistas: { 0: '«El» acompaña al nombre, pero no nombra nada. ¡Probá otra!', 2: '«Valiente» dice cómo es. Buscá la que dice quién es.', 3: '«Corre» dice qué hace. Buscá la que dice quién es.' } },
            { consigna: '¿Y cuál nombra un lugar?', partes: ['La', 'plaza', 'está', 'llena'], correcta: 1, bien: '¡Eso! <b>Plaza</b> nombra un lugar: es un sustantivo.',
              pistas: { 0: '«La» acompaña al nombre, pero no nombra nada. ¡Probá otra!', 2: '«Está» no nombra nada. Buscá el lugar.', 3: '«Llena» dice cómo está. Buscá el lugar.' } }
          ] }
        },
        {
          texto: 'Otras cuentan <b>cómo es</b> algo: grande, redonda, valiente. Son los <b>adjetivos</b>.',
          interactivo: { tipo: 'tocar', rondas: [
            { consigna: '¿Cuál dice cómo es la mesa?', partes: ['La', 'mesa', 'redonda', 'brilla'], correcta: 2, bien: '¡Sí! <b>Redonda</b> dice cómo es la mesa: es un adjetivo.',
              pistas: { 0: '«La» acompaña, pero no dice cómo es. ¡Probá otra!', 1: '«Mesa» nombra la cosa. Buscá la que dice cómo es.', 3: '«Brilla» dice qué hace. Buscá la que dice cómo es.' } },
            { consigna: '¿Y cómo es el gato?', partes: ['Mi', 'gato', 'gordo', 'duerme'], correcta: 2, bien: '¡Eso! <b>Gordo</b> dice cómo es el gato.',
              pistas: { 0: '«Mi» dice de quién es, no cómo es. ¡Probá otra!', 1: '«Gato» nombra al animal. Buscá la que dice cómo es.', 3: '«Duerme» dice qué hace. Buscá la que dice cómo es.' } }
          ] }
        },
        {
          prediccion: {"pregunta":"En «Mi hermana salta la soga», ¿cuál dice lo que hace?","opciones":["salta","hermana","soga"],"correcta":0,"explicacion":"«Hermana» dice quién es, y «soga», con qué juega. «Salta» cuenta qué hace."},
          texto: 'Las que dicen <b>qué se hace</b> son los <b>verbos</b>: salta, corre, come. En el diccionario terminan en <b>-ar</b>, <b>-er</b> o <b>-ir</b>: saltar, correr, escribir.',
          truco: 'Para encontrar el verbo, preguntá «¿qué hace?». Mi hermana… salta.'
        },
        {
          texto: 'Y hay otras que cuentan <b>cómo</b>, <b>cuándo</b> o <b>dónde</b> pasa algo: corre <b>rápido</b>, llegó <b>ayer</b>, vive <b>acá</b>. Son los <b>adverbios</b>.',
          practica: { pregunta: 'En «Llegó <b>ayer</b>», ¿qué cuenta «ayer»?', opciones: ['Cuándo pasó', 'Cómo es', 'Quién llegó'], correcta: 0, explicacion: '«Ayer» dice cuándo pasó: es un adverbio.', pista: '¿«Ayer» es una persona, cómo es algo, o un momento?' }
        },
        {
          texto: '¡A ordenar! Llevá cada palabra con su trabajo.',
          gesto: 'festejo',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'sust', nombre: 'Sustantivo', visual: '🏷️' },
              { id: 'adj', nombre: 'Adjetivo', visual: '🎨' },
              { id: 'verbo', nombre: 'Verbo', visual: '🏃' }
            ],
            cosas: [
              { nombre: 'mesa', grupo: 'sust', pista: '«Mesa» no dice cómo es algo ni qué se hace: nombra una cosa.' },
              { nombre: 'azul', grupo: 'adj', pista: '«Azul» dice cómo es algo: de qué color.' },
              { nombre: 'saltar', grupo: 'verbo', pista: '«Saltar» es algo que se hace, y termina en -ar.' },
              { nombre: 'gato', grupo: 'sust', pista: '«Gato» nombra a un animal.' },
              { nombre: 'feliz', grupo: 'adj', pista: '«Feliz» dice cómo está alguien.' },
              { nombre: 'comer', grupo: 'verbo', pista: '«Comer» es algo que se hace, y termina en -er.' }
            ],
            final: '¡Cada palabra con su trabajo!'
          }
        }
      ]
    },

    {
      id: 'donde-va-la-tilde',
      materia: 'lengua',
      titulo: 'Dónde va la tilde',
      icono: 'tildes',
      edadMin: 10,
      minutos: 4,
      resumen: 'Agudas, graves y esdrújulas.',
      juego: 'lengua/tildes',
      ejercicio: { juego: 'lengua/tildes', nivel: 'n2', cantidad: 5, consigna: 'Elegí cómo se escribe bien cada palabra: con tilde o sin tilde.' },
      reflexion: {"pregunta":"¿Por qué «camión» lleva tilde y «reloj» no, si las dos son agudas?","razones":["Porque camión termina en n, y reloj termina en j","Porque camión es más larga","Porque reloj es una palabra grave"],"correcta":0,"porque":"Las agudas llevan tilde sólo cuando terminan en n, s o vocal.","grande":"Explicale a un grande por qué «sofá» lleva tilde."},
      aprendiste: [
        'En cada palabra hay una sílaba que suena <b>más fuerte</b>.',
        '<b>Agudas</b> (la última): tilde si terminan en n, s o vocal. <b>Graves</b> (la anteúltima): tilde si no.',
        'Las <b>esdrújulas</b> llevan tilde <b>siempre</b>.'
      ],
      pasos: [
        {
          texto: 'Decí una palabra como si llamaras a alguien de lejos: ¡una parte suena <b>más fuerte</b>! Tocala.',
          interactivo: { tipo: 'tocar', silabas: true, rondas: [
            fuerte('camión', ['ca', 'mión'], 1, '¡Sí! ca-<b>MIÓN</b>.'),
            fuerte('árbol', ['ár', 'bol'], 0, '¡Eso! <b>ÁR</b>-bol.'),
            fuerte('música', ['mú', 'si', 'ca'], 0, '¡Muy bien! <b>MÚ</b>-si-ca.'),
            fuerte('reloj', ['re', 'loj'], 1, '¡Sí! re-<b>LOJ</b>. Y fijate: ésta no tiene tilde.'),
            fuerte('pelota', ['pe', 'lo', 'ta'], 1, '¡Perfecto! pe-<b>LO</b>-ta.')
          ] }
        },
        {
          texto: 'Si la fuerte es <b>la última</b>, la palabra es <b>aguda</b>. Llevan tilde si terminan en <b>n</b>, <b>s</b> o <b>vocal</b>: camión, compás, sofá.',
          visual: function () { return trozos(['ca', 'mión'], 1); },
          practica: { pregunta: 'Las tres son agudas. ¿Cuál necesita tilde?', opciones: ['cafe', 'reloj', 'papel'], correcta: 0, explicacion: 'Café termina en vocal, así que lleva tilde. Reloj termina en j, y papel en l: no llevan.', pista: '¿Cuál termina en n, en s o en vocal?' }
        },
        {
          texto: 'Si la fuerte es <b>la anteúltima</b>, es <b>grave</b>. Hacen lo contrario: llevan tilde si <b>no</b> terminan en n, s o vocal. Árbol, lápiz, fácil.',
          visual: function () { return trozos(['ár', 'bol'], 0); },
          truco: 'Agudas y graves hacen lo contrario: lo que a una le pide tilde, a la otra se la saca.',
          practica: { pregunta: 'Las tres son graves. ¿Cuál necesita tilde?', opciones: ['lapiz', 'mesa', 'examen'], correcta: 0, explicacion: 'Lápiz termina en z, que no es n, s ni vocal: lleva tilde. Mesa y examen, no.', pista: 'Las graves llevan tilde cuando <b>no</b> terminan en n, s o vocal.' }
        },
        {
          prediccion: {"pregunta":"En «pajaro», la sílaba fuerte es pa: la antepenúltima. ¿Te parece que lleva tilde?","opciones":["Sí, siempre","Sólo si termina en n, s o vocal","No, nunca"],"correcta":0,"explicacion":"Las esdrújulas llevan tilde siempre, sin excepción: pájaro.","sinDibujo":true},
          texto: 'Son las <b>esdrújulas</b>, ¡las más fáciles! Llevan tilde <b>siempre</b>: música, pájaro, teléfono.',
          visual: function () { return trozos(['pá', 'ja', 'ro'], 0); }
        }
      ]
    },

    /* ============ CIENCIAS ============ */
    {
      id: 'los-sonidos-de-los-animales',
      materia: 'ciencias',
      titulo: 'Los ruidos de los animales',
      icono: 'sonidos',
      edadMin: 4,
      minutos: 2,
      resumen: 'Cada animal hace su ruido.',
      juego: 'ciencias/sonidos',
      ejercicio: { juego: 'ciencias/sonidos', nivel: 'n1', cantidad: 5, consigna: 'Escuchá el ruido y tocá el animal que lo hace.' },
      aprendiste: [
        'Cada animal tiene <b>su propio ruido</b>.',
        'El perro hace <b>guau</b>, el gato <b>miau</b> y la vaca <b>muuu</b>.',
        'El gallo canta <b>quiquiriquí</b> bien temprano.'
      ],
      pasos: [
        {
          texto: '¡Vamos a la granja! Tocá cada animal y escuchá qué ruido hace.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐄'), nombre: 'la vaca', decir: 'La vaca hace: ¡muuu!' },
            { visual: emoji('🐶'), nombre: 'el perro', decir: 'El perro hace: ¡guau, guau!' },
            { visual: emoji('🐱'), nombre: 'el gato', decir: 'El gato hace: ¡miau!' },
            { visual: emoji('🐑'), nombre: 'la oveja', decir: 'La oveja hace: ¡beee!' },
            { visual: emoji('🐷'), nombre: 'el chancho', decir: 'El chancho hace: ¡oink, oink!' },
            { visual: emoji('🦆'), nombre: 'el pato', decir: 'El pato hace: ¡cuac, cuac!' }
          ] }
        },
        {
          texto: 'Si escuchás <b>«¡quiquiriquí!»</b> bien temprano, es el gallo, que despierta a todos.',
          gesto: 'festejo',
          visual: function () { return emoji('🐓'); },
          practica: { pregunta: '¿Quién hace <b>«¡guau, guau!»</b>?', opciones: ['🐶 El perro', '🐱 El gato', '🐄 La vaca'], correcta: 0, explicacion: 'El perro ladra: ¡guau, guau!', pista: 'Es el que mueve la cola cuando llegás a casa.' }
        },
        {
          texto: 'Los animales de afuera de la granja también hablan a su manera. ¡Escuchalos!',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🦁'), nombre: 'el león', decir: 'El león ruge: ¡grrrr!' },
            { visual: emoji('🐺'), nombre: 'el lobo', decir: 'El lobo aúlla: ¡auuuu!' },
            { visual: emoji('🦉'), nombre: 'el búho', decir: 'El búho hace: ¡uh, uh!' },
            { visual: emoji('🐸'), nombre: 'la rana', decir: 'La rana hace: ¡croac, croac!' }
          ] },
          practica: { pregunta: '¿Quién hace <b>«¡croac, croac!»</b>?', opciones: ['🐸 La rana', '🦁 El león', '🦉 El búho'], correcta: 0, explicacion: 'La rana: ¡croac, croac!', pista: 'Es verde, vive cerca del agua y salta mucho.' }
        }
      ]
    },

    {
      id: 'los-sentidos',
      materia: 'ciencias',
      titulo: 'Los cinco sentidos',
      icono: 'cuerpo',
      edadMin: 4,
      minutos: 2,
      resumen: 'Con qué vemos, oímos, olemos, probamos y tocamos.',
      juego: 'ciencias/cuerpo',
      ejercicio: { juego: 'ciencias/cuerpo', nivel: 'n1', cantidad: 5, consigna: 'Elegí la parte del cuerpo que usamos para cada cosa.' },
      aprendiste: [
        'Tenemos <b>cinco sentidos</b>: ver, oír, oler, el gusto y el tacto.',
        'Vemos con los <b>ojos</b>, oímos con las <b>orejas</b> y olemos con la <b>nariz</b>.',
        'Con la <b>lengua</b> sentimos el gusto, y con las <b>manos</b>, cómo son las cosas.'
      ],
      pasos: [
        {
          texto: 'Con el cuerpo sentimos todo lo que pasa alrededor. Tenemos <b>cinco sentidos</b>: tocá cada uno.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('👀'), nombre: 'ver', decir: 'Con los ojos, vemos.' },
            { visual: emoji('👂'), nombre: 'oír', decir: 'Con las orejas, escuchamos.' },
            { visual: emoji('👃'), nombre: 'oler', decir: 'Con la nariz, olemos.' },
            { visual: emoji('👅'), nombre: 'el gusto', decir: 'Con la lengua, sentimos el gusto.' },
            { visual: emoji('✋'), nombre: 'tocar', decir: 'Con las manos, tocamos.' }
          ] }
        },
        {
          texto: 'Cada parte del cuerpo hace lo suyo. Si te tapás los ojos no ves… ¡pero igual podés oler una flor!',
          visual: function () { return emoji('🌸'); },
          practica: { pregunta: '¿Con qué <b>olemos</b> una flor?', opciones: ['👃 La nariz', '👂 Las orejas', '✋ La mano'], correcta: 0, explicacion: 'Olemos con la nariz.', pista: 'Acercá la flor a la cara: ¿qué parte la huele?' }
        },
        {
          texto: '¿Con qué lo sentimos? Tocá cada cosa y llevala a su lugar.',
          gesto: 'festejo',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'ojos', nombre: 'Con los ojos', visual: '👀' },
              { id: 'orejas', nombre: 'Con las orejas', visual: '👂' },
              { id: 'lengua', nombre: 'Con la lengua', visual: '👅' }
            ],
            cosas: [
              { nombre: 'mirar el arcoíris', visual: '🌈', grupo: 'ojos', pista: 'El arcoíris no hace ruido: tiene colores. ¿Con qué se ven los colores?' },
              { nombre: 'escuchar música', visual: '🎵', grupo: 'orejas', pista: 'La música se escucha. ¿Con qué escuchamos?' },
              { nombre: 'probar un helado', visual: '🍦', grupo: 'lengua', pista: 'Para saber si el helado es rico, lo probamos. ¿Con qué sentimos el gusto?' },
              { nombre: 'oír el tambor', visual: '🥁', grupo: 'orejas', pista: '¡Pum, pum! El tambor suena. ¿Con qué lo oímos?' },
              { nombre: 'ver las estrellas', visual: '⭐', grupo: 'ojos', pista: 'Las estrellas brillan en el cielo. ¿Con qué las vemos?' },
              { nombre: 'probar un limón', visual: '🍋', grupo: 'lengua', pista: '¡Qué ácido! Eso se siente al probarlo. ¿Con qué?' }
            ],
            final: '¡Todo en su lugar! Ojos, orejas y lengua trabajan en equipo.'
          }
        }
      ]
    },

    {
      id: 'que-es-un-ser-vivo',
      materia: 'ciencias',
      titulo: 'Qué es un ser vivo',
      icono: 'vivos',
      edadMin: 6,
      minutos: 2,
      resumen: 'Nace, crece, se alimenta y tiene hijos.',
      juego: 'ciencias/vivos',
      ejercicio: { juego: 'ciencias/vivos', nivel: 'n2', cantidad: 5, consigna: 'En cada pregunta pensá: ¿nace, crece y se alimenta?' },
      aprendiste: [
        'Un <b>ser vivo</b> nace, crece, se alimenta y puede tener hijos.',
        'Las personas, los animales y las <b>plantas</b> están vivos.',
        'Moverse o tener cara no alcanza: un robot <b>no está vivo</b>.'
      ],
      pasos: [
        {
          texto: 'Un bebé, un perro y un árbol parecen muy distintos… pero tienen algo en común: ¡los tres están <b>vivos</b>!',
          visual: function () { return emojis(['👶', '🐶', '🌳']); }
        },
        {
          texto: 'Estar vivo es <b>nacer</b>, <b>crecer</b>, <b>alimentarse</b> y poder tener hijos. Mirá: de una semilla crece un árbol.',
          visual: function () { return cadena([['🌱', 'nace'], ['🌿', 'crece'], ['🌳', '¡árbol!']]); }
        },
        {
          prediccion: {"pregunta":"Un robot se mueve y habla. ¿Está vivo?","opciones":["No","Sí"],"correcta":0,"explicacion":"No nace, no crece ni come: lo fabricaron, y se mueve con pilas."},
          texto: 'Moverse no alcanza: hay que ver si <b>nace, crece y se alimenta</b>. Ahora ordená vos, que hay trampas.',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'vivo', nombre: 'Está vivo' },
              { id: 'no', nombre: 'No está vivo' }
            ],
            cosas: [
              { nombre: 'el perro', visual: '🐶', grupo: 'vivo', pista: 'El perro nace, crece y come: ¡está vivo!' },
              { nombre: 'el robot', visual: '🤖', grupo: 'no', bien: '¡Sí! Se mueve, pero no nace, ni crece, ni come.', pista: 'El robot se mueve, pero no nace ni crece: lo fabricaron.' },
              { nombre: 'el girasol', visual: '🌻', grupo: 'vivo', pista: 'El girasol nace de una semilla, crece y toma agua: está vivo.' },
              { nombre: 'la pelota', visual: '⚽', grupo: 'no', pista: 'La pelota rueda, pero no come ni crece: no está viva.' },
              { nombre: 'el pájaro', visual: '🐦', grupo: 'vivo', pista: 'El pájaro nace de un huevo, crece y come: está vivo.' },
              { nombre: 'el osito de peluche', visual: '🧸', grupo: 'no', bien: '¡Sí! Tiene cara, pero es un juguete.', pista: 'Tiene ojos y cara, pero no come ni crece: es un juguete.' },
              { nombre: 'el cactus', visual: '🌵', grupo: 'vivo', bien: '¡Sí! No se mueve, pero es una planta: está vivo.', pista: 'El cactus no se mueve, pero es una planta: nace, crece y toma agua.' },
              { nombre: 'el auto', visual: '🚗', grupo: 'no', pista: 'El auto anda, pero no nace ni crece: lo fabrican.' }
            ],
            final: '¡No te engañaron las trampas!'
          }
        }
      ]
    },

    {
      id: 'las-partes-de-la-planta',
      materia: 'ciencias',
      titulo: 'Las partes de la planta',
      icono: 'plantas',
      edadMin: 7,
      minutos: 2,
      resumen: 'Raíz, tallo, hojas, flor y fruto.',
      juego: 'ciencias/plantas',
      ejercicio: { juego: 'ciencias/plantas', nivel: 'n1', cantidad: 5, consigna: 'Contestá qué hace cada parte de la planta.' },
      aprendiste: [
        'La <b>raíz</b> toma el agua y el <b>tallo</b> la sube.',
        'Las <b>hojas</b> fabrican el alimento con la luz del sol.',
        'La <b>flor</b> se hace <b>fruto</b>, y adentro están las <b>semillas</b>.'
      ],
      pasos: [
        {
          texto: 'Una planta es un equipo. La <b>raíz</b>, bajo tierra, toma el agua; el <b>tallo</b> la sube, y las <b>hojas</b> fabrican comida con la luz del sol.',
          visual: planta
        },
        {
          texto: '¡Algunas partes de las plantas nos las comemos! Tocá cada una y descubrí cuál es.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🥕'), nombre: 'la zanahoria', decir: 'La zanahoria es una raíz: crece bajo tierra.' },
            { visual: emoji('🥬'), nombre: 'la lechuga', decir: 'La lechuga son hojas.' },
            { visual: emoji('🥦'), nombre: 'el brócoli', decir: 'El brócoli son flores, ¡antes de abrirse!' },
            { visual: emoji('🍎'), nombre: 'la manzana', decir: 'La manzana es un fruto, con semillas adentro.' }
          ] },
          practica: { pregunta: '¿Qué parte de la planta es la <b>zanahoria</b>?', opciones: ['La raíz', 'La flor', 'La hoja'], correcta: 0, explicacion: 'La zanahoria crece bajo tierra: es una raíz.', pista: '¿Dónde crece la zanahoria: arriba o bajo tierra?' }
        },
        {
          texto: 'La <b>flor</b> se convierte en <b>fruto</b>, y adentro del fruto están las <b>semillas</b>. ¡De cada una puede nacer una planta nueva!',
          gesto: 'festejo',
          visual: function () { return cadena([['🌸', 'flor'], ['🍎', 'fruto'], ['🌱', 'planta nueva']]); },
          practica: { pregunta: '¿Dónde están las <b>semillas</b>?', opciones: ['Adentro del fruto', 'En la raíz', 'En las hojas'], correcta: 0, explicacion: 'Las semillas están adentro del fruto: fijate en una manzana o en un tomate.', pista: 'Pensá en una manzana cortada: ¿qué tiene en el medio?' }
        }
      ]
    },

    {
      id: 'que-comen-los-animales',
      materia: 'ciencias',
      titulo: 'Qué comen los animales',
      icono: 'alimentacion',
      edadMin: 8,
      minutos: 3,
      resumen: 'Herbívoros, carnívoros y omnívoros.',
      juego: 'ciencias/alimentacion',
      ejercicio: { juego: 'ciencias/alimentacion', nivel: 'n1', cantidad: 5, consigna: 'Decí si cada animal es herbívoro o carnívoro.' },
      reflexion: {"pregunta":"¿Por qué el león tiene colmillos filosos y la vaca no?","razones":["Porque el león come carne y la vaca come pasto","Porque el león es más grande","Porque la vaca es más vieja"],"correcta":0,"porque":"Los dientes de cada animal son para lo que come: colmillos para cortar carne, muelas anchas para moler pasto.","grande":"Mirá con un grande qué come tu mascota o un animal del barrio."},
      aprendiste: [
        '<b>Herbívoros</b>: comen plantas. <b>Carnívoros</b>: comen otros animales.',
        '<b>Omnívoros</b>: comen de todo, como nosotros.',
        'Los dientes dan pistas: <b>colmillos</b> para la carne, <b>muelas anchas</b> para el pasto.'
      ],
      pasos: [
        {
          texto: 'La vaca come pasto, el león come carne y el oso… ¡come de todo! Tocá cada uno.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐄'), nombre: 'herbívoro', decir: 'La vaca come plantas: es herbívora.' },
            { visual: emoji('🦁'), nombre: 'carnívoro', decir: 'El león come otros animales: es carnívoro.' },
            { visual: emoji('🐻'), nombre: 'omnívoro', decir: 'El oso come frutas, miel y peces: es omnívoro.' }
          ] },
          truco: 'Herbívoro viene de «hierba», carnívoro de «carne», y omnívoro de «omni», que quiere decir «todo».'
        },
        {
          texto: 'Ahora ordená a estos animales según lo que comen.',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'herb', nombre: 'Herbívoros', visual: '🌿' },
              { id: 'carn', nombre: 'Carnívoros', visual: '🍖' },
              { id: 'omni', nombre: 'Omnívoros', visual: '🍽️' }
            ],
            cosas: [
              { nombre: 'el conejo', visual: '🐰', grupo: 'herb', pista: 'El conejo come pasto y zanahorias: ¡sólo plantas!' },
              { nombre: 'el tiburón', visual: '🦈', grupo: 'carn', pista: 'El tiburón caza peces: come otros animales.' },
              { nombre: 'la gallina', visual: '🐔', grupo: 'omni', bien: '¡Sí! Come semillas, ¡y también bichitos!', pista: 'La gallina come semillas, ¡pero también bichitos y gusanos! Come de todo.' },
              { nombre: 'la jirafa', visual: '🦒', grupo: 'herb', pista: 'La jirafa come hojas de los árboles altos: plantas.' },
              { nombre: 'el lobo', visual: '🐺', grupo: 'carn', pista: 'El lobo caza otros animales para comer.' },
              { nombre: 'el chancho', visual: '🐷', grupo: 'omni', pista: 'El chancho come de todo: frutas, verduras, ¡y hasta bichitos!' }
            ],
            final: '¡Muy bien! Y nosotros, que comemos de todo, somos omnívoros.'
          }
        },
        {
          texto: 'Los dientes dan pistas: los carnívoros tienen <b>colmillos</b> filosos para cortar carne. Los herbívoros, <b>muelas anchas</b> para moler pasto.',
          visual: function () { return emojis(['🦁', '🐄']); },
          practica: { pregunta: 'El koala come hojas de eucalipto, y nada más. ¿Qué es?', opciones: ['Herbívoro', 'Carnívoro', 'Omnívoro'], correcta: 0, explicacion: 'Come sólo plantas: es herbívoro.', pista: 'Las hojas, ¿son plantas o animales?' }
        }
      ]
    },

    {
      id: 'clases-de-animales',
      materia: 'ciencias',
      titulo: 'Mamíferos, aves, peces y más',
      icono: 'animales',
      edadMin: 8,
      minutos: 3,
      resumen: 'Cómo se agrupan los animales.',
      juego: 'ciencias/animales',
      ejercicio: { juego: 'ciencias/animales', nivel: 'n3', cantidad: 5, consigna: 'Decí de qué clase es cada animal.' },
      reflexion: {"pregunta":"¿Por qué el pingüino es un ave si no vuela?","razones":["Porque tiene plumas y nace de un huevo","Porque vive donde hace frío","Porque nada muy bien"],"correcta":0,"porque":"Lo que hace a un ave son las plumas, el pico y el huevo, no volar.","grande":"Contale a un grande por qué el delfín no es un pez."},
      aprendiste: [
        'Los <b>mamíferos</b> toman leche de bebés: el perro, ¡y también el delfín!',
        'Las <b>aves</b> tienen plumas y nacen de un huevo, aunque no vuelen.',
        'Los <b>peces</b> respiran bajo el agua, con branquias.'
      ],
      pasos: [
        {
          texto: 'Los animales se agrupan en familias grandes. Los <b>mamíferos</b> toman la leche de su mamá cuando son bebés, y casi todos tienen pelo.',
          visual: function () { return emojis(['🐶', '🐘', '🐱']); }
        },
        {
          prediccion: {"pregunta":"El delfín vive en el mar y nada. ¿Qué te parece que es?","opciones":["Un mamífero","Un pez"],"correcta":0,"explicacion":"Aunque nade, respira aire y de bebé toma leche: es un mamífero."},
          texto: 'El delfín sube a respirar aire, ¡como nosotros! Igual que la ballena, que también es un <b>mamífero</b>.',
          visual: function () { return emojis(['🐬', '🐳']); }
        },
        {
          texto: 'Las <b>aves</b> tienen plumas, pico, y nacen de un huevo. El pingüino no vuela… ¡pero tiene plumas, así que es un ave!',
          visual: function () { return emojis(['🐦', '🐧', '🦅']); }
        },
        {
          texto: 'Hay más familias. Tocá cada una y conocelas.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐟'), nombre: 'los peces', decir: 'Los peces respiran bajo el agua con branquias, y nadan con aletas.' },
            { visual: emoji('🐢'), nombre: 'los reptiles', decir: 'Los reptiles tienen escamas, como la tortuga y la víbora.' },
            { visual: emoji('🐸'), nombre: 'los anfibios', decir: 'Los anfibios, como la rana, nacen en el agua y de grandes viven también en la tierra.' },
            { visual: emoji('🐝'), nombre: 'los insectos', decir: 'Los insectos tienen seis patas, como la abeja. ¡La araña tiene ocho, así que no es un insecto!' }
          ] }
        },
        {
          texto: '¿Te animás a ordenarlos? Ojo, que hay trampas.',
          gesto: 'piensa',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'mam', nombre: 'Mamíferos', visual: '🐶' },
              { id: 'ave', nombre: 'Aves', visual: '🐦' },
              { id: 'pez', nombre: 'Peces', visual: '🐟' }
            ],
            cosas: [
              { nombre: 'el delfín', visual: '🐬', grupo: 'mam', bien: '¡Sí! Nada, pero es un mamífero: de bebé toma leche.', pista: 'Nada como un pez, pero respira aire y de bebé toma leche.' },
              { nombre: 'el pingüino', visual: '🐧', grupo: 'ave', bien: '¡Sí! No vuela, pero tiene plumas: es un ave.', pista: 'No vuela, pero tiene plumas y pico, y nace de un huevo.' },
              { nombre: 'el tiburón', visual: '🦈', grupo: 'pez', pista: 'Respira bajo el agua, con branquias: es un pez.' },
              { nombre: 'el murciélago', visual: '🦇', grupo: 'mam', bien: '¡Sí! Vuela, pero es un mamífero: tiene pelo y toma leche.', pista: 'Vuela, pero no tiene plumas: tiene pelo, y de bebé toma leche.' },
              { nombre: 'el búho', visual: '🦉', grupo: 'ave', pista: 'Tiene plumas y pico, y nace de un huevo.' },
              { nombre: 'el pez payaso', visual: '🐠', grupo: 'pez', pista: 'Vive bajo el agua y respira con branquias.' }
            ],
            final: '¡No caíste en ninguna trampa!'
          }
        }
      ]
    },

    {
      id: 'los-estados-del-agua',
      materia: 'ciencias',
      titulo: 'Sólido, líquido y gaseoso',
      icono: 'materia',
      edadMin: 8,
      minutos: 3,
      resumen: 'El hielo, el agua y el vapor son lo mismo.',
      juego: 'ciencias/materia',
      ejercicio: { juego: 'ciencias/materia', nivel: 'n1', cantidad: 5, consigna: 'Decí si cada cosa es sólida, líquida o un gas.' },
      reflexion: {"pregunta":"¿Por qué el hielo y el vapor son la misma agua?","razones":["Porque sólo cambió la temperatura, no lo que es","Porque tienen el mismo color","Porque los dos están fríos"],"correcta":0,"porque":"Al calentar o enfriar el agua cambia cómo está (sólida, líquida o gas), pero sigue siendo agua.","grande":"Pensá con un grande dónde viste agua sólida, líquida y gaseosa en tu casa."},
      aprendiste: [
        'El agua puede ser <b>sólida</b> (hielo), <b>líquida</b> o <b>gaseosa</b> (vapor).',
        'Lo que la hace cambiar es la <b>temperatura</b>.',
        'Se congela a los <b>0 °C</b> y hierve a los <b>100 °C</b>.'
      ],
      pasos: [
        {
          texto: 'Te muestro un truco de magia: la <b>misma agua</b> puede ser hielo, agua o vapor. Probá enfriarla y calentarla.',
          interactivo: { tipo: 'estados' }
        },
        {
          prediccion: {"pregunta":"Si ponés agua en un vaso con forma de estrella, ¿qué forma toma?","opciones":["La del vaso: una estrella","Sigue siendo redonda","No tiene ninguna forma"],"correcta":0,"explicacion":"Los líquidos toman la forma de lo que los contiene."},
          texto: 'Un <b>sólido</b> tiene su propia forma. Un <b>líquido</b> toma la del vaso. Y un <b>gas</b> se escapa y ocupa todo el lugar.',
          truco: 'Sólido: tiene forma. Líquido: toma la del vaso. Gas: se escapa.'
        },
        {
          texto: 'No sólo el agua: todo es sólido, líquido o gas. ¿Me ayudás a ordenar?',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'solido', nombre: 'Sólido', visual: '🧊' },
              { id: 'liquido', nombre: 'Líquido', visual: '💧' },
              { id: 'gas', nombre: 'Gas', visual: '💨' }
            ],
            cosas: [
              { nombre: 'el ladrillo', visual: '🧱', grupo: 'solido', pista: 'El ladrillo tiene su propia forma: no se derrama ni se escapa.' },
              { nombre: 'la leche', visual: '🥛', grupo: 'liquido', pista: 'La leche toma la forma del vaso, y se puede derramar.' },
              { nombre: 'el vapor de la pava', visual: '♨️', grupo: 'gas', pista: 'El vapor se escapa para arriba y ocupa todo el lugar.' },
              { nombre: 'la llave', visual: '🔑', grupo: 'solido', pista: 'La llave tiene su propia forma: no toma la del bolsillo.' },
              { nombre: 'el jugo', visual: '🧃', grupo: 'liquido', pista: 'El jugo toma la forma de la caja, y se toma con sorbete.' },
              { nombre: 'el aire del globo', visual: '🎈', grupo: 'gas', bien: '¡Sí! El globo es de goma, pero adentro tiene aire: un gas.', pista: 'El globo es de goma, pero lo de adentro es aire: si lo soltás, ¡se escapa!' }
            ],
            final: '¡Todo ordenado! Sólidos, líquidos y gases.'
          }
        },
        {
          texto: 'Cada cambio tiene su nombre: derretirse es la <b>fusión</b>; hacerse vapor, la <b>evaporación</b>; y volver a ser agua, la <b>condensación</b>.',
          visual: function () { return cadena([['🧊', 'hielo'], ['💧', 'agua'], ['♨️', 'vapor']]); },
          practica: { pregunta: 'Si servís agua bien fría en un vaso, aparecen gotitas afuera. ¿De dónde salen?', opciones: ['Del vapor del aire, que se hace agua', 'Del vaso, que transpira', 'Del agua, que atraviesa el vidrio'], correcta: 0, explicacion: 'El aire tiene vapor. Al tocar el vaso frío se enfría y vuelve a ser agua: es la condensación.', pista: 'El aire tiene vapor de agua. ¿Qué le pasa al vapor cuando se enfría?' }
        }
      ]
    },

    {
      id: 'el-sistema-solar',
      materia: 'ciencias',
      titulo: 'El sistema solar',
      icono: 'espacio',
      edadMin: 10,
      minutos: 3,
      resumen: 'El Sol, los ocho planetas y la Luna.',
      juego: 'ciencias/espacio',
      ejercicio: { juego: 'ciencias/espacio', nivel: 'n1', cantidad: 5, consigna: 'Contestá cinco preguntas sobre los planetas.' },
      reflexion: {"pregunta":"¿Por qué hay día y noche?","razones":["Porque la Tierra gira sobre sí misma","Porque el Sol se apaga a la noche","Porque la Luna tapa al Sol"],"correcta":0,"porque":"La Tierra da una vuelta sobre sí misma cada día: la parte que mira al Sol tiene día.","grande":"Con una linterna y una pelota, mostrale a un grande cómo se hacen el día y la noche."},
      aprendiste: [
        'El <b>Sol</b> es una estrella, y a su alrededor giran <b>ocho planetas</b>.',
        'La Tierra gira sobre sí misma: eso hace el <b>día y la noche</b>.',
        'Una vuelta al Sol es <b>un año</b>, y la <b>Luna</b> gira alrededor de la Tierra.'
      ],
      pasos: [
        {
          prediccion: {"pregunta":"¿El Sol te parece que es un planeta?","opciones":["No, es una estrella","Sí, el más grande de todos"],"correcta":0,"explicacion":"El Sol es una estrella, como las que se ven de noche. Los planetas giran a su alrededor."},
          texto: 'Es la estrella que tenemos más cerca: por eso se ve tan grande y nos da luz y calor. A su alrededor giran <b>ocho planetas</b>.',
          visual: function () { return emoji('☀️'); }
        },
        {
          texto: 'Acá están los ocho, del más cercano al Sol al más lejano. Tocá cada uno: ¡cada planeta tiene lo suyo!',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: planeta('mercurio'), nombre: 'Mercurio', decir: 'Mercurio: el más chiquito, y el más cerca del Sol.' },
            { visual: planeta('venus'), nombre: 'Venus', decir: 'Venus: el más caliente de todos, ¡más que Mercurio!' },
            { visual: planeta('tierra'), nombre: 'Tierra', decir: 'La Tierra: nuestra casa, el único planeta con vida que conocemos.' },
            { visual: planeta('marte'), nombre: 'Marte', decir: 'Marte: el planeta rojo, porque su suelo está oxidado.' },
            { visual: planeta('jupiter'), nombre: 'Júpiter', decir: 'Júpiter: el más grande. ¡Adentro entrarían más de mil Tierras!' },
            { visual: planeta('saturno'), nombre: 'Saturno', decir: 'Saturno: el de los anillos, hechos de hielo y piedras.' },
            { visual: planeta('urano'), nombre: 'Urano', decir: 'Urano: gira acostado, ¡como una pelota rodando!' },
            { visual: planeta('neptuno'), nombre: 'Neptuno', decir: 'Neptuno: el más lejano, con los vientos más fuertes.' }
          ] },
          truco: 'Mi Vieja Tía Marta Jamás Supo Usar Neptuno: la primera letra de cada palabra es un planeta, en orden.'
        },
        {
          texto: 'La Tierra da una vuelta <b>sobre sí misma</b> cada día. El lado que mira al Sol tiene <b>día</b>, y el otro, <b>noche</b>.',
          visual: diaNoche
        },
        {
          texto: 'Además, da una vuelta enorme <b>alrededor del Sol</b>: tarda <b>un año</b>. Y la <b>Luna</b> la acompaña, girando a su alrededor.',
          gesto: 'festejo',
          visual: function () { return emojis(['🌍', '🌙']); },
          practica: { pregunta: '¿Qué es la <b>Luna</b>?', opciones: ['Un satélite que gira alrededor de la Tierra', 'Una estrella', 'Un planeta'], correcta: 0, explicacion: 'La Luna es un satélite: gira alrededor de la Tierra, y brilla porque la ilumina el Sol.', pista: 'La Luna no tiene luz propia, y acompaña a la Tierra dando vueltas a su alrededor.' }
        }
      ]
    },

    /* ============ INGLÉS ============ */
    {
      id: 'los-colores-en-ingles',
      materia: 'ingles',
      titulo: 'Los colores en inglés',
      icono: 'personalizacion',
      edadMin: 4,
      minutos: 2,
      resumen: 'Red, blue, yellow y los demás.',
      juego: 'ingles/colores',
      ejercicio: { juego: 'ingles/colores', nivel: 'n1', cantidad: 5, consigna: 'Mirá cada color y elegí cómo se dice en inglés.' },
      reflexion: {"pregunta":"¿Por qué «orange» sirve para dos cosas?","razones":["Porque es el nombre de la fruta y también del color","Porque es una palabra muy larga","Porque es un color que no existe"],"correcta":0,"porque":"En inglés, orange es la naranja y también el color naranja.","grande":"Nombrá con un grande cosas de tu casa: ¿de qué color son, en inglés?"},
      aprendiste: [
        '<span lang="en">Red</span> es rojo, <span lang="en">blue</span> es azul y <span lang="en">yellow</span>, amarillo.',
        '<span lang="en">Orange</span> es la naranja, y también el color naranja.',
        '<span lang="en">White</span> es blanco y <span lang="en">black</span>, negro.'
      ],
      pasos: [
        {
          texto: '¡<span lang="en">Hello</span>! Hoy aprendemos los colores en inglés. Tocá cada color y repetilo conmigo.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#dc2626'), nombre: '<span lang="en">red</span>', decir: '<span lang="en">red</span>' },
            { visual: color('#2563eb'), nombre: '<span lang="en">blue</span>', decir: '<span lang="en">blue</span>' },
            { visual: color('#eab308'), nombre: '<span lang="en">yellow</span>', decir: '<span lang="en">yellow</span>' }
          ] }
        },
        {
          prediccion: {"pregunta":"¿Cómo te parece que se dice «naranja» en inglés? Suena parecido.","opciones":["<span lang=\"en\">orange</span>","<span lang=\"en\">green</span>","<span lang=\"en\">purple</span>"],"correcta":0,"explicacion":"<span lang=\"en\">Orange</span> se parece a «naranja», y sirve para la fruta y para el color."},
          texto: 'Y hay dos más: el verde es <b lang="en">green</b>, y el violeta, <b lang="en">purple</b>. ¡Tocalos!',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#16a34a'), nombre: '<span lang="en">green</span>', decir: '<span lang="en">green</span>' },
            { visual: color('#ea580c'), nombre: '<span lang="en">orange</span>', decir: '<span lang="en">orange</span>' },
            { visual: color('#7c3aed'), nombre: '<span lang="en">purple</span>', decir: '<span lang="en">purple</span>' }
          ] }
        },
        {
          texto: 'El blanco es <b lang="en">white</b>, el negro es <b lang="en">black</b>, y el rosa, <b lang="en">pink</b>.',
          gesto: 'festejo',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#f8fafc'), nombre: '<span lang="en">white</span>', decir: '<span lang="en">white</span>' },
            { visual: color('#111827'), nombre: '<span lang="en">black</span>', decir: '<span lang="en">black</span>' },
            { visual: color('#ec4899'), nombre: '<span lang="en">pink</span>', decir: '<span lang="en">pink</span>' }
          ] },
          practica: { pregunta: '¿Cómo se dice <b>negro</b> en inglés?', opciones: ['<span lang="en">black</span>', '<span lang="en">white</span>', '<span lang="en">blue</span>'], correcta: 0, explicacion: 'Negro es <span lang="en">black</span>, y blanco es <span lang="en">white</span>.', pista: 'Tocá otra vez las tarjetas de arriba y escuchá el negro.' }
        }
      ]
    },

    {
      id: 'contar-en-ingles',
      materia: 'ingles',
      titulo: 'Contar en inglés',
      icono: 'contar',
      edadMin: 5,
      minutos: 2,
      resumen: 'Del one al ten, de a poco.',
      juego: 'ingles/numeros-en',
      ejercicio: { juego: 'ingles/numeros-en', nivel: 'n2', cantidad: 5, consigna: 'Elegí cómo se dice cada número en inglés.' },
      reflexion: {"pregunta":"Si «five» es 5, ¿por qué «six» es 6?","razones":["Porque viene justo después de five","Porque tiene tres letras","Porque rima con five"],"correcta":0,"porque":"Los números van en orden, en inglés igual que en castellano: después de five viene six.","grande":"Contá con un grande hasta ten en inglés, levantando un dedo por número."},
      aprendiste: [
        '<span lang="en">One, two, three, four, five</span>: del 1 al 5.',
        '<span lang="en">Six, seven, eight, nine, ten</span>: del 6 al 10.'
      ],
      pasos: [
        {
          texto: 'Levantá una mano y contá conmigo en inglés, un dedo por número. Tocá cada uno.',
          interactivo: { tipo: 'escuchar', cosas: ['one', 'two', 'three', 'four', 'five'].map(function (n, i) {
            return { visual: '<div class="numero-grande">' + (i + 1) + '</div>', nombre: '<span lang="en">' + n + '</span>', decir: '<span lang="en">' + n + '</span>' };
          }) }
        },
        {
          prediccion: {"pregunta":"Ya sabés hasta five. ¿Qué te parece que viene después?","opciones":["<span lang=\"en\">six</span>","<span lang=\"en\">ten</span>","<span lang=\"en\">one</span>"],"correcta":0,"explicacion":"Después del cinco viene el seis: <span lang=\"en\">six</span>."},
          texto: '¡Ahora la otra mano! <b lang="en">Six, seven, eight, nine, ten</b>.',
          interactivo: { tipo: 'escuchar', cosas: ['six', 'seven', 'eight', 'nine', 'ten'].map(function (n, i) {
            return { visual: '<div class="numero-grande">' + (i + 6) + '</div>', nombre: '<span lang="en">' + n + '</span>', decir: '<span lang="en">' + n + '</span>' };
          }) },
          truco: 'Los diez seguidos son una canción: one, two, three… ¡ten!'
        },
        {
          texto: '¿Jugamos? Te digo un número en inglés y vos lo buscás.',
          gesto: 'festejo',
          interactivo: { tipo: 'tocar', rondas: [
            { consigna: '¿Cuál es el <b lang="en">seven</b>?', partes: ['6', '7', '9'], correcta: 1, bien: '¡Sí! <span lang="en">Seven</span> es 7.' },
            { consigna: '¿Y el <b lang="en">three</b>?', partes: ['3', '8', '5'], correcta: 0, bien: '¡Eso! <span lang="en">Three</span> es 3.' },
            { consigna: '¿Y el <b lang="en">ten</b>?', partes: ['2', '4', '10'], correcta: 2, bien: '¡Muy bien! <span lang="en">Ten</span> es 10.' }
          ] }
        }
      ]
    },

    {
      id: 'los-animales-en-ingles',
      materia: 'ingles',
      titulo: 'Los animales en inglés',
      icono: 'animales',
      edadMin: 5,
      minutos: 2,
      resumen: 'Dog, cat, bird, fish y mouse.',
      juego: 'ingles/animales-en',
      ejercicio: { juego: 'ingles/animales-en', nivel: 'n1', cantidad: 5, consigna: 'Escuchá y elegí cada animal.' },
      aprendiste: [
        '<span lang="en">Dog</span> es perro, y <span lang="en">cat</span>, gato.',
        '<span lang="en">Bird</span> es pájaro, <span lang="en">fish</span> es pez y <span lang="en">mouse</span>, ratón.'
      ],
      pasos: [
        {
          texto: 'Los animales de casa también tienen nombre en inglés. Tocá cada uno y repetilo.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐶'), nombre: '<span lang="en">dog</span>', decir: '<span lang="en">dog</span>. El perro.' },
            { visual: emoji('🐱'), nombre: '<span lang="en">cat</span>', decir: '<span lang="en">cat</span>. El gato.' },
            { visual: emoji('🐦'), nombre: '<span lang="en">bird</span>', decir: '<span lang="en">bird</span>. El pájaro.' },
            { visual: emoji('🐟'), nombre: '<span lang="en">fish</span>', decir: '<span lang="en">fish</span>. El pez.' },
            { visual: emoji('🐭'), nombre: '<span lang="en">mouse</span>', decir: '<span lang="en">mouse</span>. El ratón.' }
          ] }
        },
        {
          texto: '¡Que no se te mezclen! <b lang="en">Dog</b> es el perro y <b lang="en">cat</b> es el gato.',
          visual: function () { return emojis(['🐶', '🐱']); },
          practica: { pregunta: '¿Cómo se dice <b>el gato</b>?', opciones: ['<span lang="en">cat</span>', '<span lang="en">dog</span>', '<span lang="en">fish</span>'], correcta: 0, explicacion: 'El gato es <span lang="en">cat</span>.', pista: 'Dog es el perro. ¿Y el gato?' }
        },
        {
          texto: '¿Jugamos? Te digo un animal en inglés y vos lo buscás.',
          gesto: 'festejo',
          interactivo: { tipo: 'tocar', rondas: [
            { consigna: '¿Cuál es el <b lang="en">fish</b>?', partes: ['🐦', '🐟', '🐭'], correcta: 1, bien: '¡Sí! <span lang="en">Fish</span> es el pez.' },
            { consigna: '¿Y el <b lang="en">mouse</b>?', partes: ['🐭', '🐶', '🐦'], correcta: 0, bien: '¡Eso! <span lang="en">Mouse</span> es el ratón.' },
            { consigna: '¿Y el <b lang="en">bird</b>?', partes: ['🐱', '🐟', '🐦'], correcta: 2, bien: '¡Muy bien! <span lang="en">Bird</span> es el pájaro.' }
          ] }
        }
      ]
    },

    {
      id: 'la-comida-en-ingles',
      materia: 'ingles',
      titulo: 'Las frutas en inglés',
      icono: 'alimentacion',
      edadMin: 5,
      minutos: 2,
      resumen: 'Apple, banana, strawberry y orange.',
      juego: 'ingles/comida',
      ejercicio: { juego: 'ingles/comida', nivel: 'n1', cantidad: 5, consigna: 'Escuchá y elegí cada fruta.' },
      aprendiste: [
        '<span lang="en">Apple</span> es manzana y <span lang="en">strawberry</span>, frutilla.',
        '<span lang="en">Banana</span> se dice casi igual que en castellano.',
        '<span lang="en">Orange</span> es la naranja, y también el color.'
      ],
      pasos: [
        {
          texto: '¡Qué hambre! Tocá cada fruta para escucharla en inglés.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🍎'), nombre: '<span lang="en">apple</span>', decir: '<span lang="en">apple</span>. La manzana.' },
            { visual: emoji('🍌'), nombre: '<span lang="en">banana</span>', decir: '<span lang="en">banana</span>. La banana.' },
            { visual: emoji('🍓'), nombre: '<span lang="en">strawberry</span>', decir: '<span lang="en">strawberry</span>. La frutilla.' },
            { visual: emoji('🍊'), nombre: '<span lang="en">orange</span>', decir: '<span lang="en">orange</span>. La naranja.' }
          ] }
        },
        {
          texto: '<b lang="en">Orange</b> es una palabra doble: quiere decir <b>naranja</b>, la fruta, y también el color.',
          gesto: 'festejo',
          visual: function () { return emoji('🍊'); },
          practica: { pregunta: '¿Cómo se dice <b>la manzana</b>?', opciones: ['<span lang="en">apple</span>', '<span lang="en">orange</span>', '<span lang="en">banana</span>'], correcta: 0, explicacion: 'La manzana es <span lang="en">apple</span>.', pista: 'Orange es la naranja. ¿Y la manzana?' }
        }
      ]
    },

    {
      id: 'saludar-en-ingles',
      materia: 'ingles',
      titulo: 'Saludar en inglés',
      icono: 'saludo',
      edadMin: 7,
      minutos: 3,
      resumen: 'Hola, gracias y cómo estás.',
      juego: 'ingles/frases',
      ejercicio: { juego: 'ingles/frases', nivel: 'n2', cantidad: 5, consigna: 'Elegí qué quiere decir cada frase.' },
      reflexion: {"pregunta":"¿Por qué «good night» se dice a la noche y no a la mañana?","razones":["Porque night quiere decir noche","Porque good quiere decir chau","Porque es más corto"],"correcta":0,"porque":"Night es noche: good night es «buenas noches».","grande":"Saludá a un grande en inglés, según la hora que sea."},
      aprendiste: [
        '<span lang="en">Hello</span> es hola, y <span lang="en">goodbye</span>, adiós.',
        '<span lang="en">Good morning</span> es buen día, y <span lang="en">good night</span>, buenas noches.',
        '<span lang="en">Please</span> es por favor, y <span lang="en">thank you</span>, gracias.'
      ],
      pasos: [
        {
          texto: '<span lang="en">Hello!</span> Así se saluda en inglés. Tocá cada saludo y repetilo.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('👋'), nombre: '<span lang="en">hello</span>', decir: '<span lang="en">hello</span>. Hola.' },
            { visual: emoji('🙋'), nombre: '<span lang="en">hi</span>', decir: '<span lang="en">hi</span>. Hola, entre amigos.' },
            { visual: emoji('🚶'), nombre: '<span lang="en">goodbye</span>', decir: '<span lang="en">goodbye</span>. Adiós.' },
            { visual: emoji('✋'), nombre: '<span lang="en">bye</span>', decir: '<span lang="en">bye</span>. Chau.' }
          ] }
        },
        {
          prediccion: {"pregunta":"«Good» quiere decir «bueno», y «morning», «mañana». ¿Qué será «good morning»?","opciones":["Buen día","Buenas noches","Adiós"],"correcta":0,"explicacion":"<span lang=\"en\">Good morning</span> es, tal cual, «buena mañana»: buen día."},
          texto: 'Según la hora: <b lang="en">good morning</b> a la mañana, <b lang="en">good afternoon</b> a la tarde, y <b lang="en">good night</b> antes de dormir.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🌅'), nombre: '<span lang="en">good morning</span>', decir: '<span lang="en">good morning</span>. Buen día.' },
            { visual: emoji('☀️'), nombre: '<span lang="en">good afternoon</span>', decir: '<span lang="en">good afternoon</span>. Buenas tardes.' },
            { visual: emoji('🌙'), nombre: '<span lang="en">good night</span>', decir: '<span lang="en">good night</span>. Buenas noches.' }
          ] }
        },
        {
          texto: 'Las palabras mágicas: <b lang="en">please</b> es «por favor» y <b lang="en">thank you</b>, «gracias». Si te agradecen, contestás <b lang="en">you are welcome</b>.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🙏'), nombre: '<span lang="en">please</span>', decir: '<span lang="en">please</span>. Por favor.' },
            { visual: emoji('🎁'), nombre: '<span lang="en">thank you</span>', decir: '<span lang="en">thank you</span>. Gracias.' },
            { visual: emoji('😊'), nombre: '<span lang="en">you are welcome</span>', decir: '<span lang="en">you are welcome</span>. De nada.' }
          ] },
          practica: { pregunta: 'Te regalan algo. ¿Qué decís?', opciones: ['<span lang="en">Thank you</span>', '<span lang="en">Goodbye</span>', '<span lang="en">Good night</span>'], correcta: 0, explicacion: '<span lang="en">Thank you</span>: gracias.', pista: 'Cuando te regalan algo, das las gracias. ¿Cuál es «gracias»?' }
        },
        {
          texto: 'Para preguntar cómo está alguien: <b lang="en">How are you?</b> Y se contesta <b lang="en">I am fine, thank you</b>: «estoy bien, gracias».',
          gesto: 'festejo',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🙂'), nombre: '<span lang="en">How are you?</span>', decir: '<span lang="en">How are you?</span> ¿Cómo estás?' },
            { visual: emoji('👍'), nombre: '<span lang="en">I am fine, thank you</span>', decir: '<span lang="en">I am fine, thank you</span>. Estoy bien, gracias.' }
          ] },
          practica: { pregunta: 'Te preguntan <b lang="en">How are you?</b> ¿Qué contestás?', opciones: ['<span lang="en">I am fine, thank you</span>', '<span lang="en">Good morning</span>', '<span lang="en">Please</span>'], correcta: 0, explicacion: '<span lang="en">I am fine, thank you</span>: estoy bien, gracias.', pista: 'Te preguntan cómo estás. ¿Cuál dice «estoy bien»?' }
        }
      ]
    },

    {
      id: 'am-is-are',
      materia: 'ingles',
      titulo: 'am, is, are',
      icono: 'clases',
      edadMin: 10,
      minutos: 3,
      resumen: 'El verbo to be, que es «ser» y «estar».',
      juego: 'ingles/tobe',
      ejercicio: { juego: 'ingles/tobe', nivel: 'n2', cantidad: 5, consigna: 'Completá cada frase con am, is o are.' },
      reflexion: {"pregunta":"¿Por qué se dice «she is» y no «she are»?","razones":["Porque she es una sola persona, y con una va is","Porque she es una chica","Porque are es sólo para I"],"correcta":0,"porque":"Con he, she e it (uno solo) va is; con you, we y they va are; con I, am.","grande":"Decile a un grande una frase con am, una con is y una con are."},
      aprendiste: [
        '<span lang="en">To be</span> es «ser» y también «estar».',
        'Con <span lang="en">I</span> va <span lang="en">am</span>; con <span lang="en">he</span>, <span lang="en">she</span> e <span lang="en">it</span>, <span lang="en">is</span>.',
        'Con <span lang="en">you</span>, <span lang="en">we</span>, <span lang="en">they</span> y con varios, <span lang="en">are</span>.'
      ],
      pasos: [
        {
          texto: 'En castellano decimos «yo <b>soy</b>» y «yo <b>estoy</b>». En inglés las dos se dicen con un solo verbo: <b lang="en">to be</b>.',
          visual: function () {
            return listaEn([['I am happy', 'Estoy feliz'], ['I am a student', 'Soy estudiante']], true);
          }
        },
        {
          texto: 'Cambia según quién: con <b lang="en">I</b> va <b lang="en">am</b>; con <b lang="en">he</b>, <b lang="en">she</b> e <b lang="en">it</b>, <b lang="en">is</b>; con <b lang="en">you</b>, <b lang="en">we</b> y <b lang="en">they</b>, <b lang="en">are</b>.',
          visual: function () {
            return listaEn([['I am', 'Yo soy / estoy'], ['She is', 'Ella es / está'],
                            ['We are', 'Nosotros somos / estamos']], true);
          },
          truco: 'Am es la más fácil: va siempre con I, y con nada más.'
        },
        {
          prediccion: {"pregunta":"En «The dogs ___ big» hay varios perros. ¿Qué te parece que va?","opciones":["<span lang=\"en\">are</span>","<span lang=\"en\">is</span>","<span lang=\"en\">am</span>"],"correcta":0,"explicacion":"Con varios va <span lang=\"en\">are</span>; con uno solo, <span lang=\"en\">is</span>."},
          texto: 'Uno solo, <b lang="en">is</b>; varios, <b lang="en">are</b>. Mirá la diferencia:',
          visual: function () {
            return listaEn([['The dog is big', 'El perro es grande'],
                            ['The dogs are big', 'Los perros son grandes']], true);
          }
        },
        {
          texto: '¡A ordenar! Llevá cada palabra con su verbo.',
          gesto: 'festejo',
          interactivo: { tipo: 'clasificar',
            grupos: [
              { id: 'am', nombre: '<span lang="en">am</span>' },
              { id: 'is', nombre: '<span lang="en">is</span>' },
              { id: 'are', nombre: '<span lang="en">are</span>' }
            ],
            cosas: [
              { nombre: '<span lang="en">I</span>', grupo: 'am', bien: '¡Sí! <span lang="en">I am</span>.', pista: 'Con <span lang="en">I</span> va siempre <span lang="en">am</span>, y con nada más.' },
              { nombre: '<span lang="en">she</span>', grupo: 'is', bien: '¡Sí! <span lang="en">She is</span>.', pista: '<span lang="en">She</span> es una sola persona: con una sola va <span lang="en">is</span>.' },
              { nombre: '<span lang="en">we</span>', grupo: 'are', bien: '¡Sí! <span lang="en">We are</span>.', pista: '<span lang="en">We</span> somos varios: con varios va <span lang="en">are</span>.' },
              { nombre: '<span lang="en">it</span>', grupo: 'is', bien: '¡Sí! <span lang="en">It is</span>.', pista: '<span lang="en">It</span> es una sola cosa: va <span lang="en">is</span>.' },
              { nombre: '<span lang="en">they</span>', grupo: 'are', bien: '¡Sí! <span lang="en">They are</span>.', pista: '<span lang="en">They</span> son varios: va <span lang="en">are</span>.' },
              { nombre: '<span lang="en">you</span>', grupo: 'are', bien: '¡Sí! <span lang="en">You are</span>.', pista: '<span lang="en">You</span> va con <span lang="en">are</span>, aunque sea una sola persona.' },
              { nombre: '<span lang="en">the cats</span>', grupo: 'are', bien: '¡Sí! <span lang="en">The cats are</span>: son varios.', pista: '<span lang="en">The cats</span> son varios gatos: con varios va <span lang="en">are</span>.' },
              { nombre: '<span lang="en">my mom</span>', grupo: 'is', bien: '¡Sí! <span lang="en">My mom is</span>.', pista: '<span lang="en">My mom</span> es una sola persona, como <span lang="en">she</span>: va <span lang="en">is</span>.' }
            ],
            final: '¡Perfecto! Ya sabés cuándo va cada uno.'
          }
        }
      ]
    }
  ];

  function porId(id) {
    for (var i = 0; i < LECCIONES.length; i++) if (LECCIONES[i].id === id) return LECCIONES[i];
    return null;
  }

  function deMateria(materiaId) {
    return LECCIONES.filter(function (l) { return l.materia === materiaId; });
  }

  return { LECCIONES: LECCIONES, porId: porId, deMateria: deMateria };
})();
