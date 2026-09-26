/* ============================================================
   Contenido de la sección Aprender: cursitos cortos.

   Una lección es una lista de pasos que se leen de a uno. Cada paso
   tiene un título, un texto y, si ayuda, un dibujo. Al final siempre
   se ofrece el juego donde practicar lo que se acaba de leer: esa es
   la idea de toda la app, aprender algo y después usarlo.

   Para agregar una lección, copiá una de estas y sumala a LECCIONES.
   Un paso puede tener:
     titulo, texto        (el texto admite <b> para resaltar)
     visual: function ()  devuelve HTML (normalmente un SVG dibujado acá)
     truco:  'texto'      un recuadro con el atajo para acordarse
     video:  'url'        muestra un video embebido (necesita internet)
     interactivo: {...}   una actividad para tocar y probar: contar, juntar,
                          mover el reloj… (ver js/aprender/actividades.js).
                          Puede ser una función que la devuelva, si usa
                          dibujos de un juego.
     practica: { pregunta, opciones, correcta, explicacion, pista }
                          «¿Y vos?» después de la explicación: hay que
                          contestarla bien para seguir

   Y la lección entera puede tener un `ejercicio`: unas preguntas de un
   juego que el chico tiene que hacer para terminarla.
     juego      'materia/juego'
     nivel      el id del nivel de ese juego (el que mejor ejercita lo
                que explica la lección)
     valores    otras opciones del juego, si tiene (sumas o restas)
     cantidad   cuántas preguntas (5)
     consigna   lo que se le dice antes de empezar; también lo lee la voz
   Con el 80% bien la lección queda completada; si no, se vuelve a probar.

   Y dos momentos para pensar, no sólo leer:
     prediccion (en un paso)  { pregunta, opciones, correcta, explicacion }
                              se contesta ANTES de ver la explicación
     reflexion (en la lección) { pregunta, razones, correcta, porque, grande }
                              «¿por qué?» después del ejercicio, eligiendo
                              la razón; «grande» propone contárselo a un adulto
   ============================================================ */
window.Lecciones = (function () {
  'use strict';

  /* ---------------------- dibujos reutilizables ---------------------- */

  /** Cuadraditos de color con su nombre en inglés debajo. */
  function muestrario(colores) {
    return '<div class="muestrario">' + colores.map(function (c) {
      return '<div class="muestra-color"><span style="background:' + c[0] + '"></span>' +
             '<b lang="en">' + c[1] + '</b></div>';
    }).join('') + '</div>';
  }

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
   * lista en fila. `fuerte` es el lugar del pedacito que va resaltado:
   * la sílaba que suena más fuerte, en la lección de la tilde.
   */
  function trozos(partes, fuerte) {
    return '<div class="trozos">' + partes.map(function (p, i) {
      return '<span' + (i === fuerte ? ' class="trozo-fuerte"' : '') + '>' + p + '</span>';
    }).join('') + '</div>';
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

  /** Los continentes con cuántos países tiene cada uno (sale de los datos). */
  function continentes() {
    var nombres = {
      america: ['🌎', 'América'], europa: ['🏰', 'Europa'], africa: ['🦁', 'África'],
      asia: ['🐘', 'Asia'], oceania: ['🦘', 'Oceanía']
    };
    var cuenta = {};
    (window.PAISES || []).forEach(function (p) { cuenta[p.cont] = (cuenta[p.cont] || 0) + 1; });
    return '<div class="tarjetitas">' + Object.keys(nombres).map(function (id) {
      return '<div class="tarjetita"><span class="tarjetita-icono">' + nombres[id][0] + '</span>' +
             '<b>' + nombres[id][1] + '</b><span>' + (cuenta[id] || 0) + ' países</span></div>';
    }).join('') + '</div>';
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

  /* ---------------------- las lecciones ---------------------- */
  var LECCIONES = [
    /* ============ MATEMÁTICA ============ */
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
      pasos: [
        {
          titulo: 'Cada número en su lugar',
          texto: 'Para sumar números grandes los ponemos <b>uno arriba del otro</b>, bien alineados a la derecha. Así las unidades quedan con las unidades y las decenas con las decenas.',
          visual: function () { return columna(27, 15, '+', null); }
        },
        {
          titulo: 'Empezamos por la derecha',
          prediccion: {"pregunta":"Para hacer 27 + 15, ¿con qué columna empezarías?","opciones":["Con la de la derecha: 7 + 5","Con la de la izquierda: 2 + 1"],"correcta":0,"explicacion":"Se empieza por las unidades, a la derecha, porque lo que sobre ahí pasa a la columna siguiente."},
          texto: 'Sumamos primero la columna de la derecha: <b>7 + 5 = 12</b>. Pero en cada columna entra un solo número… y 12 son dos.',
          visual: function () { return columna(27, 15, '+', null, null, 'unidades'); }
        },
        {
          titulo: 'Escribís uno y te llevás el otro',
          texto: 'Del 12 escribimos abajo el <b>2</b>, y el <b>1</b> se va arriba de la columna siguiente. Eso es «llevarse una».',
          visual: function () { return columna(27, 15, '+', 2, 1, 'unidades'); },
          truco: 'Lo que te llevás siempre es un 1, nunca más que eso.'
        },
        {
          titulo: 'Y ahora la otra columna',
          texto: 'Sumamos la columna de la izquierda sin olvidarnos del 1 que subió: <b>2 + 1 + 1 = 4</b>. La cuenta da <b>42</b>.',
          visual: function () { return columna(27, 15, '+', 42, 1, 'decenas'); }
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
      pasos: [
        {
          titulo: 'El mismo orden que la suma',
          texto: 'También se acomodan uno arriba del otro y se empieza por la <b>derecha</b>. Probemos con <b>42 − 17</b>.',
          visual: function () { return columna(42, 17, '−', null); }
        },
        {
          titulo: 'Uy: 2 menos 7 no se puede',
          prediccion: {"pregunta":"En 42 − 17, arriba hay un 2 y abajo un 7. ¿Qué te parece que hay que hacer?","opciones":["Pedirle prestado al 4","Dar vuelta la cuenta: 7 − 2","Poner un 0 y seguir"],"correcta":0,"explicacion":"La cuenta no se da vuelta: el de arriba va siempre primero. Si no alcanza, se le pide prestado al de al lado."},
          texto: 'Arriba hay un <b>2</b> y abajo un <b>7</b>. Al 2 no le alcanza. Entonces le pedimos prestado al número de al lado.',
          visual: function () { return columna(42, 17, '−', null, null, 'unidades'); }
        },
        {
          titulo: 'El vecino presta diez',
          texto: 'El <b>4</b> de la izquierda presta uno y se queda en <b>3</b>. Ese uno vale <b>diez</b>, así que arriba ya no hay 2 sino <b>12</b>. Y ahora sí: <b>12 − 7 = 5</b>.',
          truco: 'El de al lado se achica en 1, y el tuyo crece en 10.'
        },
        {
          titulo: 'Terminamos la cuenta',
          texto: 'Queda la columna de la izquierda: <b>3 − 1 = 2</b>. El resultado es <b>25</b>.',
          visual: function () { return columna(42, 17, '−', 25, null, 'decenas'); }
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
      pasos: [
        {
          titulo: 'Es una suma repetida',
          texto: 'Multiplicar es una manera corta de sumar el <b>mismo número muchas veces</b>. En vez de escribir 4 + 4 + 4, escribimos <b>4 × 3</b>. Cambiá las filas y las columnas, y mirá cómo cambia la cuenta.',
          interactivo: { tipo: 'multiplicar', filas: 3, columnas: 4 }
        },
        {
          titulo: 'Filas y columnas',
          prediccion: {"pregunta":"Hay 3 filas de 4 puntitos. ¿Cuántos puntitos son?","opciones":["12","7","34"],"correcta":0,"explicacion":"Son 4 + 4 + 4 = 12. El 7 sería 3 + 4, que es otra cuenta."},
          texto: 'Mirá los puntitos: hay <b>3 filas</b> de <b>4</b> cada una. Contalos: son <b>12</b>. Eso es 4 × 3.',
          visual: function () { return puntitos(3, 4); }
        },
        {
          titulo: 'El orden no importa',
          texto: 'Si lo das vuelta y ponés <b>4 filas de 3</b>, siguen siendo 12 puntitos. Por eso <b>4 × 3 y 3 × 4 dan lo mismo</b>.',
          visual: function () { return puntitos(4, 3); },
          truco: 'Con esto aprendés la mitad de las tablas de una: si sabés 7 × 3, ya sabés 3 × 7.'
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
      pasos: [
        {
          titulo: 'Dos agujas, dos trabajos',
          texto: 'La aguja <b>corta y gorda</b> marca la <b>hora</b>. La <b>larga y fina</b> marca los <b>minutos</b>. Acá la corta está en el 3 y la larga en el 12: son las <b>3 en punto</b>.',
          visual: function () { return reloj(3, 0); }
        },
        {
          titulo: 'Los números valen distinto',
          prediccion: {"pregunta":"La aguja larga está en el 3. ¿Cuántos minutos te parece que son?","opciones":["15 minutos","3 minutos","30 minutos"],"correcta":0,"explicacion":"Para la aguja larga cada número vale 5 minutos: 5, 10, 15."},
          texto: 'Para la aguja larga, cada número son <b>5 minutos</b>. El 1 son 5 minutos, el 2 son 10, el 3 son 15… Acá la larga está en el 3: son las <b>3 y cuarto</b>.',
          visual: function () { return reloj(3, 15); },
          truco: 'Contá de a 5 en 5 mientras vas de número en número.'
        },
        {
          titulo: 'Y media es abajo de todo',
          texto: 'Cuando la aguja larga llega al <b>6</b>, pasó media vuelta: son <b>30 minutos</b>, o sea «y media». Fijate que la corta ya está entre dos números.',
          visual: function () { return reloj(3, 30); }
        },
        {
          titulo: 'Movelo vos',
          texto: 'Tocá los botones y mirá cómo se mueven las agujas: la larga da la vuelta y la corta avanza despacito.',
          interactivo: { tipo: 'reloj', hora: 3, minuto: 0 },
          practica: { pregunta: 'La aguja corta está en el 8 y la larga en el 12. ¿Qué hora es?', opciones: ['Las 8 en punto', 'Las 12 y 8', 'Las 8 y media'], correcta: 0, explicacion: 'La larga en el 12 es «en punto», y la corta dice la hora: las 8.' }
        }
      ]
    },

    /* ============ GEOGRAFÍA ============ */
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
      pasos: [
        {
          titulo: 'Tierra y agua',
          texto: 'Casi toda la Tierra es <b>agua</b>: los océanos. Lo que sobresale es la tierra firme, y los pedazos más grandes se llaman <b>continentes</b>.'
        },
        {
          titulo: 'Son cinco (con gente)',
          prediccion: {"pregunta":"¿Cuántos continentes con gente te parece que hay?","opciones":["5","2","194"],"correcta":0,"explicacion":"194 son los países. Los continentes son pedazos mucho más grandes, y con gente hay 5."},
          texto: 'América, Europa, África, Asia y Oceanía. Hay un sexto, la <b>Antártida</b>, pero es de hielo y no vive nadie ahí de forma permanente.',
          visual: continentes
        },
        {
          titulo: 'Adentro hay países',
          texto: 'Cada continente está dividido en <b>países</b>, y cada país tiene su nombre, su bandera y su capital. En total hay <b>194</b> países en el mundo.',
          truco: 'Nosotros estamos en América, en el pedazo de abajo: América del Sur.'
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
      pasos: [
        {
          titulo: 'La ciudad donde se decide',
          texto: 'La <b>capital</b> es la ciudad donde está el gobierno de un país: donde se toman las decisiones que valen para todos.',
          visual: function () { return paisCapital(['AR', 'FR', 'JP']); }
        },
        {
          titulo: 'Ojo: no siempre es la más grande',
          prediccion: {"pregunta":"¿La capital de Brasil te parece que es su ciudad más grande?","opciones":["No, es otra ciudad","Sí, la capital siempre es la más grande"],"correcta":0,"explicacion":"La capital es donde está el gobierno. En Brasil es Brasilia, aunque São Paulo sea más grande."},
          texto: 'Mucha gente cree que la capital es la ciudad más grande, pero no. En <b>Brasil</b> la capital es Brasilia, aunque São Paulo y Río sean más grandes. En <b>Estados Unidos</b> es Washington, no Nueva York.',
          visual: function () { return paisCapital(['BR', 'US', 'AU']); },
          truco: 'Cuando dudes entre dos ciudades famosas, la capital suele ser la menos famosa.'
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
      pasos: [
        {
          titulo: 'Arriba es el norte',
          texto: 'En casi todos los mapas, <b>arriba es el norte</b> y abajo el <b>sur</b>. A la derecha queda el <b>este</b> y a la izquierda el <b>oeste</b>.',
          visual: brujula,
          truco: 'Para acordarte de las cuatro, empezá arriba y girá como el reloj: Norte, Este, Sur, Oeste.'
        },
        {
          titulo: 'Los colores cuentan algo',
          prediccion: {"pregunta":"En un mapa, ¿qué te parece que es lo que está pintado de azul?","opciones":["Agua: mares, ríos y lagos","Los países más fríos","El cielo"],"correcta":0,"explicacion":"El azul es siempre agua. La tierra se pinta de otros colores."},
          texto: 'El <b>azul</b> es siempre agua: océanos, mares, ríos y lagos. La tierra se pinta de otro color, y las <b>líneas</b> que la cruzan son los límites entre países.'
        },
        {
          titulo: 'Los países chiquitos casi no se ven',
          texto: 'Algunos países son tan chiquitos que en un mapa del mundo quedan más chicos que un puntito: Malta, Nauru, el Vaticano. Por eso en el juego los dibujamos como <b>un punto</b> para que los puedas tocar.'
        }
      ]
    },

    /* ============ LENGUA ============ */
    {
      id: 'que-es-una-silaba',
      materia: 'lengua',
      titulo: 'Qué es una sílaba',
      icono: 'silabas',
      edadMin: 7,
      minutos: 2,
      resumen: 'Cómo se corta una palabra en pedacitos.',
      juego: 'lengua/silabas',
      ejercicio: { juego: 'lengua/silabas', nivel: 'n1', cantidad: 5, consigna: 'Contá cuántas sílabas tiene cada palabra. Aplaudí si te ayuda.' },
      reflexion: {"pregunta":"¿Por qué «sol» tiene una sola sílaba si tiene tres letras?","razones":["Porque se dice en un solo golpe de voz","Porque las sílabas son las vocales","Porque las palabras cortas no se cortan"],"correcta":0,"porque":"Las sílabas se cuentan por golpes de voz: «sol» sale de una vez.","grande":"Aplaudí con un grande los nombres de toda tu familia."},
      pasos: [
        {
          titulo: 'Las palabras tienen pedacitos',
          texto: 'Si decís una palabra despacio, vas a notar que sale en <b>golpes de voz</b>. Cada golpe es una <b>sílaba</b>. Tocá las palabras y aplaudí con cada golpe.',
          interactivo: { tipo: 'silabas', palabras: ['ma-ri-po-sa', 'sol', 'ca-sa', 'e-le-fan-te'] }
        },
        {
          titulo: 'Contalas aplaudiendo',
          prediccion: {"pregunta":"Decí «mariposa» aplaudiendo. ¿Cuántos aplausos son?","opciones":["4","8","2"],"correcta":0,"explicacion":"Ma-ri-po-sa: cuatro golpes de voz. Letras tiene 8, pero las sílabas se cuentan por golpes, no por letras."},
          texto: '«Ma-ri-po-sa» son <b>cuatro</b> aplausos: tiene cuatro sílabas. «Sol» es un solo aplauso: tiene una. «Ca-sa» tiene dos.',
          visual: function () { return trozos(['ca', 'sa']); },
          truco: 'Decí la palabra despacio y aplaudí con cada golpe: cada aplauso es una sílaba.'
        },
        {
          titulo: 'Siempre hay una vocal',
          texto: 'Toda sílaba tiene por lo menos una vocal. A veces van dos juntas en el mismo golpe, como en «es-<b>cue</b>-la»: la <b>ue</b> se dice de una sola vez.',
          visual: function () { return trozos(['es', 'cue', 'la']); }
        }
      ]
    },

    {
      id: 'clases-de-palabras',
      materia: 'lengua',
      titulo: 'Sustantivos, adjetivos y verbos',
      icono: 'clases',
      edadMin: 9,
      minutos: 3,
      resumen: 'Para qué sirve cada clase de palabra.',
      juego: 'lengua/clases',
      ejercicio: { juego: 'lengua/clases', nivel: 'n2', cantidad: 5, consigna: 'Decí si cada palabra es un sustantivo, un adjetivo o un verbo.' },
      reflexion: {"pregunta":"¿Por qué «correr» es un verbo?","razones":["Porque dice una acción, algo que se hace","Porque es una palabra larga","Porque nombra una cosa"],"correcta":0,"porque":"Los verbos dicen lo que alguien hace. Los sustantivos nombran y los adjetivos dicen cómo es algo.","grande":"Decile a un grande tres verbos de cosas que hiciste hoy."},
      pasos: [
        {
          titulo: 'Los sustantivos nombran',
          texto: 'Un <b>sustantivo</b> es el nombre de algo: una persona, un animal, una cosa, un lugar o una idea. <b>Perro</b>, <b>mesa</b>, <b>ciudad</b>, <b>amistad</b>.'
        },
        {
          titulo: 'Los adjetivos dicen cómo es',
          texto: 'Un <b>adjetivo</b> acompaña al sustantivo y cuenta cómo es: el perro <b>valiente</b>, la mesa <b>redonda</b>, una ciudad <b>enorme</b>.'
        },
        {
          titulo: 'Los verbos son acciones',
          prediccion: {"pregunta":"En «el perro corre», ¿cuál palabra dice lo que hace?","opciones":["corre","perro","el"],"correcta":0,"explicacion":"«Perro» nombra quién es; «corre» cuenta qué hace. La que dice qué hace es el verbo."},
          texto: 'Un <b>verbo</b> dice lo que alguien hace: el perro <b>corre</b>, <b>come</b>, <b>duerme</b>. Cuando no dice quién lo hace, termina en -ar, -er o -ir: <b>saltar</b>, <b>correr</b>, <b>escribir</b>.',
          truco: 'Para encontrar el verbo, preguntá «¿qué hace?». El perro… corre.'
        },
        {
          titulo: 'Los adverbios dicen cómo, cuándo o dónde',
          texto: 'Un <b>adverbio</b> cuenta cómo, cuándo o dónde pasa algo: el perro corre <b>rápidamente</b>, llegó <b>ayer</b>, vive <b>aquí</b>. Muchos terminan en <b>-mente</b>.'
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
      pasos: [
        {
          titulo: 'Hay una sílaba que suena más fuerte',
          texto: 'En cada palabra hay una sílaba que se dice con más fuerza. Decí «ca-<b>mión</b>», «<b>ár</b>-bol», «<b>mú</b>-si-ca» y fijate cuál suena más.',
          visual: function () { return trozos(['ca', 'mión'], 1); }
        },
        {
          titulo: 'Agudas: la fuerte es la última',
          prediccion: {"pregunta":"Decí «camión» despacio. ¿Qué parte suena más fuerte?","opciones":["mión","ca"],"correcta":0,"explicacion":"Ca-MIÓN: la fuerte es la última sílaba. Por eso es una palabra aguda."},
          texto: 'Si la sílaba fuerte es <b>la última</b>, la palabra es <b>aguda</b>. Llevan tilde cuando terminan en <b>n</b>, <b>s</b> o <b>vocal</b>: camión, compás, sofá. <b>Reloj</b> no lleva, porque termina en j.',
          visual: function () { return trozos(['ca', 'mión'], 1); }
        },
        {
          titulo: 'Graves: la fuerte es la anteúltima',
          texto: 'Si es <b>la anteúltima</b>, la palabra es <b>grave</b>. Llevan tilde cuando <b>no</b> terminan en n, s o vocal: árbol, lápiz, fácil. <b>Examen</b> no lleva, porque termina en n.',
          visual: function () { return trozos(['ár', 'bol'], 0); },
          truco: 'Las agudas y las graves hacen lo contrario: lo que a una le pide tilde, a la otra se la saca.'
        },
        {
          titulo: 'Esdrújulas: siempre llevan',
          texto: 'Si la fuerte es <b>la antepenúltima</b>, la palabra es <b>esdrújula</b>, y ésas llevan tilde <b>siempre</b>, sin excepción: música, pájaro, teléfono.',
          visual: function () { return trozos(['mú', 'si', 'ca'], 0); }
        }
      ]
    },

    /* ============ CIENCIAS ============ */
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
      pasos: [
        {
          titulo: 'Los mamíferos toman leche',
          prediccion: {"pregunta":"El delfín vive en el mar y nada. ¿Qué te parece que es?","opciones":["Un mamífero","Un pez"],"correcta":0,"explicacion":"Aunque nade, respira aire y de bebé toma leche: eso lo hace un mamífero."},
          texto: 'Los <b>mamíferos</b> de bebés toman la leche de su mamá, y casi todos tienen pelo. El perro, el elefante… y también <b>el delfín y la ballena</b>, aunque vivan en el mar.',
          truco: 'El delfín nada como un pez, pero respira aire y toma leche: es un mamífero.'
        },
        {
          titulo: 'Las aves tienen plumas',
          texto: 'Las <b>aves</b> tienen plumas, pico y nacen de un huevo. El <b>pingüino</b> es un ave aunque no vuele: tiene plumas.'
        },
        {
          titulo: 'Los peces respiran bajo el agua',
          texto: 'Los <b>peces</b> respiran con <b>branquias</b>, que sacan el aire del agua, y nadan con aletas. El <b>tiburón</b> es un pez.'
        },
        {
          titulo: 'Reptiles, anfibios e insectos',
          texto: 'Los <b>reptiles</b> tienen escamas, como la tortuga y la víbora. Los <b>anfibios</b>, como la rana, nacen en el agua y de grandes viven también en la tierra. Los <b>insectos</b> tienen seis patas: la abeja, la hormiga. La araña tiene ocho, así que no es un insecto.'
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
      pasos: [
        {
          titulo: 'Tres maneras de estar',
          texto: 'El agua puede ser <b>sólida</b> (el hielo), <b>líquida</b> (la de la canilla) o <b>gaseosa</b> (el vapor de la pava). Es siempre la misma agua: lo que cambia es la temperatura.',
          visual: function () { return trozos(['🧊 sólido', '💧 líquido', '♨️ gaseoso']); }
        },
        {
          titulo: 'Cómo es cada una',
          prediccion: {"pregunta":"Si ponés agua en un vaso con forma de estrella, ¿qué forma toma?","opciones":["La del vaso: una estrella","Sigue siendo redonda","No tiene ninguna forma"],"correcta":0,"explicacion":"Los líquidos toman la forma de lo que los contiene. Los sólidos tienen la suya."},
          texto: 'Un <b>sólido</b> tiene su propia forma. Un <b>líquido</b> toma la forma del vaso donde lo pongas. Un <b>gas</b> se escapa y ocupa todo el lugar que encuentra.',
          truco: 'Sólido tiene forma, líquido toma la forma del vaso, gas se escapa.'
        },
        {
          titulo: 'Los cambios tienen nombre',
          texto: 'Cuando el hielo se derrite es la <b>fusión</b>. Cuando el agua se congela, la <b>solidificación</b>: pasa a los <b>0 °C</b>. Cuando se hace vapor, la <b>evaporación</b>; hierve a los <b>100 °C</b>.'
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
      pasos: [
        {
          titulo: 'El Sol es una estrella',
          prediccion: {"pregunta":"¿El Sol te parece que es un planeta?","opciones":["No, es una estrella","Sí, el más grande de todos"],"correcta":0,"explicacion":"El Sol es una estrella, como las que se ven de noche. Los planetas giran a su alrededor."},
          texto: 'El <b>Sol</b> no es un planeta: es una <b>estrella</b>, como las que se ven de noche, sólo que está mucho más cerca. Alrededor de él giran ocho planetas.'
        },
        {
          titulo: 'Los ocho planetas, en orden',
          texto: 'Del más cercano al más lejano: <b>Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno</b>. Plutón era el noveno, pero hoy se lo llama <b>planeta enano</b>.',
          visual: function () { return trozos(['Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno']); },
          truco: 'Mi Vieja Tía Marta Jamás Supo Usar Neptuno: la primera letra de cada palabra es un planeta.'
        },
        {
          titulo: 'Los días y los años',
          texto: 'La Tierra da <b>una vuelta sobre sí misma</b> cada día: eso hace el día y la noche. Y da <b>una vuelta alrededor del Sol</b> cada año. La <b>Luna</b> es un satélite: gira alrededor de la Tierra.'
        }
      ]
    },

    /* ---------------------- Inglés ---------------------- */
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
      pasos: [
        {
          titulo: 'Los tres primeros',
          texto: 'En inglés el <b>rojo</b> es <b lang="en">red</b>, el <b>azul</b> es <b lang="en">blue</b> y el <b>amarillo</b> es <b lang="en">yellow</b>. Tocá cada color para escucharlo.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#dc2626'), nombre: '<span lang="en">red</span>', decir: '<span lang="en">red</span>' },
            { visual: color('#2563eb'), nombre: '<span lang="en">blue</span>', decir: '<span lang="en">blue</span>' },
            { visual: color('#eab308'), nombre: '<span lang="en">yellow</span>', decir: '<span lang="en">yellow</span>' }
          ] }
        },
        {
          titulo: 'Tres más',
          prediccion: {"pregunta":"¿Cómo te parece que se dice «naranja» en inglés? Suena parecido.","opciones":["orange","green","purple"],"correcta":0,"explicacion":"Orange: se parece a «naranja», y sirve para la fruta y para el color."},
          texto: 'El <b>verde</b> es <b lang="en">green</b>, el <b>naranja</b> es <b lang="en">orange</b> (igual que la fruta) y el <b>violeta</b> es <b lang="en">purple</b>.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#16a34a'), nombre: '<span lang="en">green</span>', decir: '<span lang="en">green</span>' },
            { visual: color('#ea580c'), nombre: '<span lang="en">orange</span>', decir: '<span lang="en">orange</span>' },
            { visual: color('#7c3aed'), nombre: '<span lang="en">purple</span>', decir: '<span lang="en">purple</span>' }
          ] },
          truco: 'Orange es la naranja y el color naranja: la misma palabra para las dos cosas.'
        },
        {
          titulo: 'El blanco y el negro',
          texto: 'El <b>blanco</b> es <b lang="en">white</b> y el <b>negro</b> es <b lang="en">black</b>. Y el <b>rosa</b> es <b lang="en">pink</b>.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: color('#f8fafc'), nombre: '<span lang="en">white</span>', decir: '<span lang="en">white</span>' },
            { visual: color('#111827'), nombre: '<span lang="en">black</span>', decir: '<span lang="en">black</span>' },
            { visual: color('#ec4899'), nombre: '<span lang="en">pink</span>', decir: '<span lang="en">pink</span>' }
          ] },
          practica: { pregunta: '¿Cómo se dice <b>negro</b> en inglés?', opciones: ['<span lang="en">black</span>', '<span lang="en">white</span>', '<span lang="en">blue</span>'], correcta: 0, explicacion: 'Negro es <span lang="en">black</span>, y blanco es <span lang="en">white</span>.' }
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
      pasos: [
        {
          titulo: 'Del uno al cinco',
          texto: '<b lang="en">One, two, three, four, five</b>. Tocá cada número para escucharlo y contá con los dedos de una mano.',
          interactivo: { tipo: 'escuchar', cosas: ['one', 'two', 'three', 'four', 'five'].map(function (n, i) {
            return { visual: '<div class="numero-grande">' + (i + 1) + '</div>', nombre: '<span lang="en">' + n + '</span>', decir: '<span lang="en">' + n + '</span>' };
          }) }
        },
        {
          titulo: 'Del seis al diez',
          prediccion: {"pregunta":"Ya sabés one, two, three, four, five. ¿Qué te parece que viene después de five?","opciones":["six","ten","one"],"correcta":0,"explicacion":"Después del cinco viene el seis: six."},
          texto: '<b lang="en">Six, seven, eight, nine, ten</b>. Con la otra mano.',
          visual: function () {
            return listaEn([['6', 'six'], ['7', 'seven'], ['8', 'eight'], ['9', 'nine'], ['10', 'ten']]);
          },
          truco: 'Los diez seguidos son una canción: one, two, three, four, five, six, seven, eight, nine, ten.'
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
      pasos: [
        {
          titulo: 'Hola y chau',
          texto: '<b lang="en">Hello</b> es «hola» y <b lang="en">goodbye</b> es «adiós». Entre amigos alcanza con <b lang="en">hi</b> y <b lang="en">bye</b>.',
          visual: function () {
            return listaEn([['Hello', 'Hola'], ['Goodbye', 'Adiós']], true);
          }
        },
        {
          titulo: 'Según la hora',
          prediccion: {"pregunta":"«Good» quiere decir «bueno» y «morning», «mañana». ¿Qué te parece que es «good morning»?","opciones":["Buen día","Buenas noches","Adiós"],"correcta":0,"explicacion":"Good morning es, tal cual, «buena mañana»: buen día."},
          texto: 'A la mañana se dice <b lang="en">good morning</b>, a la tarde <b lang="en">good afternoon</b> y a la noche <b lang="en">good night</b>.',
          visual: function () {
            return listaEn([['Good morning', 'Buen día'], ['Good afternoon', 'Buenas tardes'],
                            ['Good night', 'Buenas noches']], true);
          },
          truco: 'Good quiere decir «bueno». Good morning es, tal cual, «buena mañana».'
        },
        {
          titulo: 'Ser amable',
          texto: '<b lang="en">Please</b> es «por favor» y <b lang="en">thank you</b> es «gracias». Si te dan las gracias, se contesta <b lang="en">you are welcome</b>: «de nada».',
          visual: function () {
            return listaEn([['Please', 'Por favor'], ['Thank you', 'Gracias'],
                            ['You are welcome', 'De nada']], true);
          }
        },
        {
          titulo: 'Cómo estás',
          texto: '<b lang="en">How are you?</b> es «¿cómo estás?». Se contesta <b lang="en">I am fine, thank you</b>: «estoy bien, gracias».',
          visual: function () {
            return listaEn([['How are you?', '¿Cómo estás?'], ['I am fine', 'Estoy bien']], true);
          }
        }
      ]
    },

    /* ============ PARA LOS MÁS CHICOS: MATEMÁTICA ============ */
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
      pasos: [
        {
          titulo: 'Contamos de a una',
          texto: 'A cada manzana le toca <b>un número</b>: uno, dos, tres. Decilos en voz alta mientras las tocás.',
          interactivo: { tipo: 'contar', cosa: 'manzana', n: 3 }
        },
        {
          titulo: 'El último número dice cuántas hay',
          texto: 'Si contaste <b>uno, dos, tres, cuatro, cinco</b>, hay <b>cinco</b>. No hace falta volver a contar.',
          interactivo: { tipo: 'contar', cosa: 'pez', n: 5 },
          practica: { pregunta: 'Contaste «uno, dos, tres, cuatro». ¿Cuántos hay?', opciones: ['4', '1', '5'], correcta: 0, explicacion: 'El último número que dijiste es cuántos hay: cuatro.' }
        },
        {
          titulo: 'Sin saltearse ninguna',
          texto: 'Para no perderte, tocá cada una <b>una sola vez</b>. Probá con muchos pollitos.',
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
      pasos: [
        {
          titulo: 'Cuatro figuras',
          texto: 'Tocá cada figura para escuchar cómo se llama.',
          interactivo: function () {
            return { tipo: 'escuchar', cosas: [
              { visual: Matematica.dibujarFigura('circulo', '#3AA3E8'), nombre: 'círculo', decir: 'El círculo' },
              { visual: Matematica.dibujarFigura('cuadrado', '#FFC93C'), nombre: 'cuadrado', decir: 'El cuadrado' },
              { visual: Matematica.dibujarFigura('triangulo', '#4DBF6B'), nombre: 'triángulo', decir: 'El triángulo' },
              { visual: Matematica.dibujarFigura('rectangulo', '#F2644E'), nombre: 'rectángulo', decir: 'El rectángulo' }
            ] };
          }
        },
        {
          titulo: 'Redonda o con puntas',
          texto: 'El <b>círculo</b> es redondo: no tiene puntas. El <b>cuadrado</b> tiene 4 lados iguales. El <b>triángulo</b> tiene 3 lados y 3 puntas.',
          visual: function () { return figuras([['circulo', '#3AA3E8'], ['cuadrado', '#FFC93C'], ['triangulo', '#4DBF6B']]); },
          practica: { pregunta: '¿Cuál tiene <b>3 puntas</b>?', opciones: ['El triángulo', 'El círculo', 'El cuadrado'], correcta: 0, explicacion: 'El triángulo tiene 3 lados y 3 puntas.' }
        },
        {
          titulo: 'Un cuadrado estirado',
          texto: 'El <b>rectángulo</b> también tiene 4 lados, pero dos son largos y dos son cortos. Es como un cuadrado estirado.',
          visual: function () { return figuras([['cuadrado', '#FFC93C'], ['rectangulo', '#F2644E']]); },
          practica: { pregunta: '¿Cuántos lados tiene el <b>rectángulo</b>?', opciones: ['4', '3', '2'], correcta: 0, explicacion: 'Tiene 4, como el cuadrado: dos largos y dos cortos.' }
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
      pasos: [
        {
          titulo: 'Juntamos',
          texto: 'Hay <b>2</b> manzanas y <b>3</b> manzanas. Tocá «¡Juntar!» y contá todas.',
          interactivo: { tipo: 'sumar', a: 2, b: 3, cosa: 'manzana' }
        },
        {
          titulo: 'El signo más',
          texto: 'Juntar se escribe con el signo <b>+</b>, que se lee «más». <b>4 + 2 = 6</b> se lee «cuatro más dos es igual a seis».',
          interactivo: { tipo: 'sumar', a: 4, b: 2, cosa: 'frutilla' },
          practica: { pregunta: '¿Cuánto es <b>3 + 1</b>?', opciones: ['4', '2', '31'], correcta: 0, explicacion: 'Tres y uno más son cuatro.' }
        },
        {
          titulo: 'Con los dedos',
          texto: 'Si no tenés manzanas, usá los dedos: levantá <b>3</b> en una mano y <b>2</b> en la otra, y contalos todos: son <b>5</b>.',
          truco: 'Empezá por el número más grande y seguí contando: tres… cuatro, cinco.'
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
      pasos: [
        {
          titulo: 'Sacamos',
          texto: 'Hay <b>5</b> globos. Tocá el botón para sacar <b>2</b> y mirá cuántos quedan.',
          interactivo: { tipo: 'restar', a: 5, b: 2, cosa: 'globo' }
        },
        {
          titulo: 'El signo menos',
          texto: 'Sacar se escribe con el signo <b>−</b>, que se lee «menos». <b>6 − 3 = 3</b>.',
          interactivo: { tipo: 'restar', a: 6, b: 3, cosa: 'pelota' },
          practica: { pregunta: 'Tenés <b>4</b> pelotas y regalás <b>1</b>. ¿Cuántas te quedan?', opciones: ['3', '5', '4'], correcta: 0, explicacion: '4 − 1 = 3: si sacás una, quedan tres.' }
        },
        {
          titulo: 'Restar achica',
          texto: 'Cuando restás, el número <b>se achica</b>: siempre queda menos de lo que había.',
          truco: 'Contá para atrás: si tenés 5 y sacás 2, decí «cuatro, tres». Quedan 3.'
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
      pasos: [
        {
          titulo: 'Contá las dos filas',
          texto: 'Arriba hay <b>3</b> flores y abajo hay <b>5</b>. Hay <b>más</b> abajo: 5 es más que 3.',
          visual: function () { return dosFilas('flor', 3, 5); },
          practica: { pregunta: '¿Qué es más: <b>2</b> o <b>6</b>?', opciones: ['6', '2'], correcta: 0, explicacion: 'Seis es más que dos: si contás, el 6 viene después.' }
        },
        {
          titulo: 'El que viene después es más',
          texto: 'Cuando contás <b>1, 2, 3, 4, 5…</b>, cada número es <b>uno más</b> que el anterior. Por eso el que viene después es el más grande.',
          visual: function () { return trozos(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']); },
          practica: { pregunta: '¿Cuál es el <b>más chico</b>: 7, 4 o 9?', opciones: ['4', '7', '9'], correcta: 0, explicacion: 'El 4 viene antes que el 7 y que el 9 cuando contás.' }
        }
      ]
    },

    /* ============ MATEMÁTICA: PARA LOS MÁS GRANDES ============ */
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
      pasos: [
        {
          titulo: 'Repartir en partes iguales',
          texto: 'Hay <b>6</b> frutillas para <b>2</b> amigos. Si a cada uno le damos lo mismo, cada uno recibe <b>3</b>. Eso es <b>6 ÷ 2 = 3</b>.',
          visual: function () { return repartir('frutilla', 3, 2); }
        },
        {
          titulo: 'Es la tabla al revés',
          prediccion: {"pregunta":"Si 2 × 4 = 8, ¿cuánto te parece que es 8 ÷ 2?","opciones":["4","16","6"],"correcta":0,"explicacion":"Dividir es preguntarse qué número por 2 da 8: es el 4."},
          texto: 'Si sabés que <b>2 × 3 = 6</b>, ya sabés que <b>6 ÷ 2 = 3</b>. Dividir es preguntarse: ¿qué número por 2 da 6?',
          practica: { pregunta: '¿Cuánto es <b>10 ÷ 2</b>?', opciones: ['5', '8', '20'], correcta: 0, explicacion: 'Porque 2 × 5 = 10.' }
        },
        {
          titulo: 'Cómo comprobarlo',
          texto: 'Para saber si una división está bien, se multiplica: si <b>12 ÷ 3 = 4</b>, entonces <b>4 × 3</b> tiene que dar <b>12</b>.',
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
      pasos: [
        {
          titulo: 'Partes iguales',
          texto: 'Una fracción es una parte de algo que se cortó en <b>partes iguales</b>. Esta torta está cortada en 4: tocá las partes para pintarlas.',
          interactivo: { tipo: 'fraccion', partes: 4 }
        },
        {
          titulo: 'Cómo se escribe',
          texto: 'Abajo va en <b>cuántas partes</b> se cortó, y arriba <b>cuántas se pintaron</b>. Ésta es <b>3/4</b>, que se lee «tres cuartos».',
          visual: function () { return torta(3, 4); },
          practica: { pregunta: 'Una pizza en <b>8</b> porciones: comiste <b>3</b>. ¿Qué parte comiste?', opciones: ['3/8', '8/3', '3/5'], correcta: 0, explicacion: 'Abajo el total de porciones (8) y arriba las que comiste (3).' }
        },
        {
          titulo: 'La mitad',
          texto: 'Si se corta en 2 y se pinta 1, es <b>un medio</b>: la mitad. Probá: pintá la mitad de esta torta de 6.',
          interactivo: { tipo: 'fraccion', partes: 6 },
          truco: 'La mitad de 6 son 3: 3/6 también es la mitad.'
        }
      ]
    },

    /* ============ PARA LOS MÁS CHICOS: LENGUA ============ */
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
      pasos: [
        {
          titulo: 'Las cinco vocales',
          texto: 'Las vocales son <b>A, E, I, O, U</b>. Tocá cada una para escucharla.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐝'), nombre: '<b>A</b> de abeja', decir: 'A. A de abeja.' },
            { visual: emoji('🐘'), nombre: '<b>E</b> de elefante', decir: 'E. E de elefante.' },
            { visual: emoji('🏝️'), nombre: '<b>I</b> de isla', decir: 'I. I de isla.' },
            { visual: emoji('🐻'), nombre: '<b>O</b> de oso', decir: 'O. O de oso.' },
            { visual: emoji('🍇'), nombre: '<b>U</b> de uva', decir: 'U. U de uva.' }
          ] }
        },
        {
          titulo: 'Se dicen largas',
          texto: 'Las vocales se pueden estirar: <b>aaaa, eeee, iiii, oooo, uuuu</b>. Todas las palabras tienen alguna.',
          visual: function () { return emoji('🐻'); },
          practica: { pregunta: '¿Con qué vocal empieza <b>oso</b>?', opciones: ['O', 'A', 'U'], correcta: 0, explicacion: 'Oooo-so: empieza con O.' }
        },
        {
          titulo: 'Escuchá la primera',
          texto: 'Decí despacio <b>uuuu-va</b>. ¿Qué suena primero?',
          visual: function () { return emoji('🍇'); },
          practica: { pregunta: '¿Con qué vocal empieza <b>uva</b>?', opciones: ['U', 'O', 'E'], correcta: 0, explicacion: 'Uuuu-va: empieza con U.' }
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
      pasos: [
        {
          titulo: 'Suenan igual al final',
          texto: 'Escuchá: <b>gato</b> y <b>pato</b>. Terminan igual, con <b>-ato</b>. Por eso riman.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐱'), nombre: 'g<b>ato</b>', decir: 'gato' },
            { visual: emoji('🦆'), nombre: 'p<b>ato</b>', decir: 'pato' }
          ] }
        },
        {
          titulo: 'Más rimas',
          texto: 'Tocá cada pareja y escuchá cómo terminan igual.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emojis(['🌸', '🥁']), nombre: 'fl<b>or</b> y tamb<b>or</b>', decir: 'flor, tambor' },
            { visual: emojis(['🍋', '🚚']), nombre: 'lim<b>ón</b> y cami<b>ón</b>', decir: 'limón, camión' },
            { visual: emojis(['🧀', '💋']), nombre: 'qu<b>eso</b> y b<b>eso</b>', decir: 'queso, beso' }
          ] },
          practica: { pregunta: '¿Qué palabra rima con <b>sol</b>?', opciones: ['caracol', 'casa', 'mano'], correcta: 0, explicacion: 'Sol y caracol terminan igual: -ol.' }
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
      pasos: [
        {
          titulo: 'Pedacitos de palabra',
          texto: 'Si decís <b>ca-sa</b> despacio, la palabra se parte en dos pedacitos: <b>ca</b> y <b>sa</b>. Se llaman <b>sílabas</b>. Tocá las palabras para escucharlas.',
          interactivo: { tipo: 'silabas', palabras: ['ca-sa', 'lu-na', 'ga-to'] }
        },
        {
          titulo: 'Con las manos',
          texto: 'Aplaudí una vez por cada sílaba: <b>ma-ri-po-sa</b> son cuatro palmas.',
          interactivo: { tipo: 'silabas', palabras: ['ma-ri-po-sa', 'to-ma-te', 'sol'] },
          practica: { pregunta: '¿Cuántas sílabas tiene <b>pe-lo-ta</b>?', opciones: ['3', '2', '4'], correcta: 0, explicacion: 'Pe-lo-ta: tres palmas.' }
        },
        {
          titulo: 'En orden',
          texto: 'Para armar una palabra, las sílabas van <b>en orden</b>. Si las das vuelta dice otra cosa: <b>ca-sa</b> al revés es <b>sa-ca</b>.',
          truco: 'Decí la palabra despacio y poné primero la sílaba que suena primero.'
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
      pasos: [
        {
          titulo: 'Lo opuesto',
          texto: 'Dos palabras son <b>contrarias</b> cuando dicen lo opuesto: <b>grande</b> y <b>chico</b>, <b>día</b> y <b>noche</b>.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐘'), nombre: 'grande', decir: 'grande' },
            { visual: emoji('🐭'), nombre: 'chico', decir: 'chico' },
            { visual: emoji('☀️'), nombre: 'día', decir: 'día' },
            { visual: emoji('🌙'), nombre: 'noche', decir: 'noche' }
          ] }
        },
        {
          titulo: 'Ojo con los parecidos',
          texto: '<b>Enorme</b> no es el contrario de grande: dice casi lo mismo. El contrario tiene que decir <b>lo opuesto</b>.',
          practica: { pregunta: '¿Cuál es el contrario de <b>frío</b>?', opciones: ['caliente', 'helado', 'blanco'], correcta: 0, explicacion: 'Caliente es lo opuesto de frío. Helado dice casi lo mismo.' }
        }
      ]
    },

    /* ============ PARA LOS MÁS CHICOS: CIENCIAS ============ */
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
      pasos: [
        {
          titulo: 'Los de la granja',
          texto: 'Tocá cada animal para escuchar qué ruido hace.',
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
          titulo: 'Adiviná quién es',
          texto: 'Si escuchás <b>«¡quiquiriquí!»</b> muy temprano, es el gallo que se despierta.',
          visual: function () { return emoji('🐓'); },
          practica: { pregunta: '¿Quién hace <b>«¡guau, guau!»</b>?', opciones: ['🐶 El perro', '🐱 El gato', '🐄 La vaca'], correcta: 0, explicacion: 'El perro ladra: ¡guau, guau!' }
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
      pasos: [
        {
          titulo: 'Cinco maneras de sentir',
          texto: 'Con el cuerpo sentimos lo que pasa alrededor. Tocá cada uno.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('👀'), nombre: 'ver', decir: 'Con los ojos, vemos.' },
            { visual: emoji('👂'), nombre: 'oír', decir: 'Con las orejas, escuchamos.' },
            { visual: emoji('👃'), nombre: 'oler', decir: 'Con la nariz, olemos.' },
            { visual: emoji('👅'), nombre: 'el gusto', decir: 'Con la lengua, sentimos el gusto.' },
            { visual: emoji('✋'), nombre: 'tocar', decir: 'Con las manos, tocamos.' }
          ] }
        },
        {
          titulo: 'Cada uno con lo suyo',
          texto: 'Si te tapás los ojos no ves, pero igual podés oír, oler y tocar.',
          practica: { pregunta: '¿Con qué <b>olemos</b> una flor?', opciones: ['👃 La nariz', '👂 Las orejas', '✋ La mano'], correcta: 0, explicacion: 'Olemos con la nariz.' }
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
      pasos: [
        {
          titulo: 'Qué tienen los seres vivos',
          texto: 'Un <b>ser vivo</b> nace, crece, se alimenta y tiene hijos. Las personas, los animales y las plantas son seres vivos.',
          visual: function () { return emojis(['👶', '🐶', '🌳']); }
        },
        {
          titulo: 'Cosas que no están vivas',
          texto: 'Una <b>piedra</b> no nace ni crece. Un <b>robot</b> se mueve, pero no come ni crece: tampoco está vivo.',
          visual: function () { return emojis(['🪨', '🤖']); },
          practica: { pregunta: '¿Cuál es un <b>ser vivo</b>?', opciones: ['🌻 La flor', '⚽ La pelota', '🚗 El auto'], correcta: 0, explicacion: 'La flor nace de una semilla, crece y toma agua: está viva.' }
        },
        {
          titulo: 'La trampa',
          prediccion: {"pregunta":"Un osito de peluche tiene ojos y cara. ¿Está vivo?","opciones":["No","Sí"],"correcta":0,"explicacion":"No nace, no crece ni come: es un juguete."},
          texto: 'Que algo tenga cara o se mueva no alcanza: hay que ver si <b>nace, crece y se alimenta</b>.'
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
      pasos: [
        {
          titulo: 'De abajo para arriba',
          texto: 'La <b>raíz</b> está bajo tierra y toma el agua. El <b>tallo</b> la sostiene y lleva el agua hacia arriba. Las <b>hojas</b> fabrican el alimento con la luz del sol.',
          visual: planta
        },
        {
          titulo: 'Flores y frutos',
          texto: 'De la <b>flor</b> sale el <b>fruto</b>, y adentro del fruto están las <b>semillas</b>: de cada una puede nacer una planta nueva.',
          visual: function () { return trozos(['🌸 flor', '🍎 fruto', '🌱 planta nueva']); },
          practica: { pregunta: '¿Qué parte toma el agua de la tierra?', opciones: ['La raíz', 'La flor', 'La hoja'], correcta: 0, explicacion: 'La raíz está bajo tierra y toma el agua.' }
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
      pasos: [
        {
          titulo: 'Tres maneras de comer',
          texto: 'Los <b>herbívoros</b> comen plantas. Los <b>carnívoros</b> comen otros animales. Los <b>omnívoros</b> comen de todo.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐄'), nombre: 'herbívoro', decir: 'La vaca come pasto: es herbívora.' },
            { visual: emoji('🦁'), nombre: 'carnívoro', decir: 'El león come otros animales: es carnívoro.' },
            { visual: emoji('🐻'), nombre: 'omnívoro', decir: 'El oso come frutas, miel y peces: es omnívoro.' }
          ] }
        },
        {
          titulo: 'Pistas en los dientes',
          texto: 'Los carnívoros tienen <b>colmillos</b> filosos para cortar la carne. Los herbívoros tienen muelas <b>anchas</b> para moler el pasto.',
          practica: { pregunta: 'La jirafa come hojas de los árboles. ¿Qué es?', opciones: ['Herbívora', 'Carnívora', 'Omnívora'], correcta: 0, explicacion: 'Come plantas: es herbívora.' }
        },
        {
          titulo: 'Y nosotros',
          texto: 'Las personas comemos frutas, verduras, carne y huevos: somos <b>omnívoros</b>.'
        }
      ]
    },

    /* ============ INGLÉS PARA LOS MÁS CHICOS ============ */
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
      pasos: [
        {
          titulo: 'Los de casa',
          texto: 'Tocá cada animal para escuchar cómo se dice en inglés.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🐶'), nombre: '<span lang="en">dog</span>', decir: '<span lang="en">dog</span>. El perro.' },
            { visual: emoji('🐱'), nombre: '<span lang="en">cat</span>', decir: '<span lang="en">cat</span>. El gato.' },
            { visual: emoji('🐦'), nombre: '<span lang="en">bird</span>', decir: '<span lang="en">bird</span>. El pájaro.' },
            { visual: emoji('🐟'), nombre: '<span lang="en">fish</span>', decir: '<span lang="en">fish</span>. El pez.' },
            { visual: emoji('🐭'), nombre: '<span lang="en">mouse</span>', decir: '<span lang="en">mouse</span>. El ratón.' }
          ] }
        },
        {
          titulo: 'No se confundan',
          texto: 'En inglés, <b lang="en">dog</b> es el perro y <b lang="en">cat</b> es el gato.',
          visual: function () { return emojis(['🐶', '🐱']); },
          practica: { pregunta: '¿Cómo se dice <b>el gato</b>?', opciones: ['<span lang="en">cat</span>', '<span lang="en">dog</span>', '<span lang="en">fish</span>'], correcta: 0, explicacion: 'El gato es <span lang="en">cat</span>.' }
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
      pasos: [
        {
          titulo: 'Las frutas',
          texto: 'Tocá cada fruta para escucharla en inglés.',
          interactivo: { tipo: 'escuchar', cosas: [
            { visual: emoji('🍎'), nombre: '<span lang="en">apple</span>', decir: '<span lang="en">apple</span>. La manzana.' },
            { visual: emoji('🍌'), nombre: '<span lang="en">banana</span>', decir: '<span lang="en">banana</span>. La banana.' },
            { visual: emoji('🍓'), nombre: '<span lang="en">strawberry</span>', decir: '<span lang="en">strawberry</span>. La frutilla.' },
            { visual: emoji('🍊'), nombre: '<span lang="en">orange</span>', decir: '<span lang="en">orange</span>. La naranja.' }
          ] }
        },
        {
          titulo: 'Una palabra, dos cosas',
          texto: '<b lang="en">Orange</b> quiere decir <b>naranja</b>: la fruta y también el color.',
          visual: function () { return emoji('🍊'); },
          practica: { pregunta: '¿Cómo se dice <b>la manzana</b>?', opciones: ['<span lang="en">apple</span>', '<span lang="en">orange</span>', '<span lang="en">banana</span>'], correcta: 0, explicacion: 'La manzana es <span lang="en">apple</span>.' }
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
      pasos: [
        {
          titulo: 'Un verbo para dos cosas',
          texto: 'En castellano decimos «yo <b>soy</b>» y «yo <b>estoy</b>». En inglés las dos son el mismo verbo: <b lang="en">to be</b>. Lo que cambia es de quién estamos hablando.'
        },
        {
          titulo: 'Am, is, are',
          texto: 'Con <b lang="en">I</b> va <b lang="en">am</b>. Con <b lang="en">he</b>, <b lang="en">she</b> y <b lang="en">it</b> va <b lang="en">is</b>. Con <b lang="en">you</b>, <b lang="en">we</b> y <b lang="en">they</b> va <b lang="en">are</b>.',
          visual: function () {
            return listaEn([['I am', 'Yo soy / estoy'], ['He is', 'Él es / está'],
                            ['We are', 'Nosotros somos / estamos']], true);
          },
          truco: 'Am es una sola: siempre va con I, y nunca con otra cosa.'
        },
        {
          titulo: 'Uno o varios',
          prediccion: {"pregunta":"En «The dogs ___ big» hay varios perros. ¿Qué te parece que va?","opciones":["are","is","am"],"correcta":0,"explicacion":"Con varios va are; con uno solo, is."},
          texto: 'Si es <b>uno solo</b> va <b lang="en">is</b>: <b lang="en">the dog is big</b>. Si son <b>varios</b> va <b lang="en">are</b>: <b lang="en">the dogs are big</b>.',
          visual: function () {
            return listaEn([['The dog is big', 'El perro es grande'],
                            ['The dogs are big', 'Los perros son grandes']], true);
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
