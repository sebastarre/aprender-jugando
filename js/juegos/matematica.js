/* ============================================================
   Materia: Matemática.

   Doce juegos que se responden eligiendo entre tarjetas, ordenados por
   la edad desde la que tienen sentido:

     4   Contar            ¿cuántos hay?
     4   Figuras           círculo, cuadrado, triángulo…
     5   Mayor y menor     cuál es el más grande o el más chico
     5   Sumas y restas
     6   Qué número sigue  2, 4, 6, 8, …
     6   La hora           el reloj de agujas
     7   Tablas de multiplicar
     7   Dobles y mitades
     7   Cuánto vale       el 5 de 356 vale 50
     8   Divisiones
     8   Problemas         cuentas escondidas en un cuento
     9   Fracciones        qué parte está pintada

   Las preguntas se generan cada partida (no hay lista fija), así que
   nunca sale dos veces la misma ronda. Los distractores no son al azar:
   son los errores típicos, para que elegir bien signifique algo.

   Cada juego separa `preguntas()` de `montar()`, para que el examen
   pueda intercalar una pregunta de acá con una de mapa. El botón
   elegido no se pinta solo: eso lo decide el motor, que en el examen no
   pinta nada para no delatar la respuesta.

   Las claves: los tres juegos de siempre usan las viejas ('7x8',
   'h3_30', '12+5'), porque ya están guardadas en los errores de chicos
   que jugaron antes. Los nuevos usan 'juego:resto', como Lengua y
   Ciencias.
   ============================================================ */
window.Matematica = (function () {
  'use strict';

  var T = Tablero;
  var COLOR = '#7c3aed';
  var entero = T.entero;
  var distractores = T.distractores;

  function prepararTablero() { T.preparar(); }
  function ocultarVisual() { T.visual(null); }
  function consigna(html) { T.consigna(html); }
  function armarRespuestas(correcta, malas, config) { T.respuestas(correcta, malas, config); }
  function sortearDelPozo(pozo, cantidad, sinPesar) {
    return T.sortear('matematica', pozo, cantidad, sinPesar);
  }
  var cantidadesFijas = T.cantidadesFijas;

  /* Para el examen no hay pantalla de opciones: se elige por edad, para que
     un chico de 6 no rinda cuentas de tres cifras. */
  function nivelPorEdad(edad) {
    if (!edad || edad <= 6) return 'facil';
    if (edad <= 8) return 'medio';
    if (edad <= 10) return 'dificil';
    return 'experto';
  }

  function pasoPorEdad(edad) {
    if (!edad || edad <= 6) return 'punto';
    if (edad === 7) return 'media';
    if (edad === 8) return 'cuarto';
    return 'cinco';
  }

  /** Busca por id en una lista de niveles; si no está, el primero. */
  function deLista(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return lista[0];
  }

  /* Las fábricas de ítems de los juegos viejos, sueltas para que las pueda
     usar también itemDeClave() cuando el modo Repaso rearma una pregunta. */
  function cuentaTabla(a, b) {
    return { id: a + 'x' + b, a: a, b: b, resultado: a * b };
  }

  function horaDelReloj(hora, minuto) {
    return { id: 'h' + hora + '_' + minuto, hora: hora, minuto: minuto,
             texto: comoTexto(hora, minuto) };
  }

  /* ============================================================
     Contar
     ============================================================ */
  var COSAS = ['🍎', '🐟', '⭐', '🎈', '🐞', '🌸', '🍓', '🐥', '⚽', '🦋'];
  var RANGOS = [
    { id: 'hasta5', nombre: 'Hasta 5', icono: '5', iconoNumero: true, detalle: 'Para empezar', desde: 1, hasta: 5 },
    { id: 'hasta10', nombre: 'Hasta 10', icono: '10', iconoNumero: true, detalle: 'Como los dedos', desde: 1, hasta: 10 },
    { id: 'hasta20', nombre: 'Hasta 20', icono: '20', iconoNumero: true, detalle: 'De a muchos', desde: 6, hasta: 20 }
  ];

  function itemContar(n) {
    return { id: 'contar:' + n, juego: 'contar', n: n, cosa: Util.alAzar(COSAS) };
  }

  var CONTAR = {
    id: 'contar',
    nombre: 'Contar',
    icono: 'contar',
    color: '#ea580c',
    suave: '#ffedd5',
    texto: '¿Cuántos hay?',
    edadMin: 4,

    opciones: function () {
      return [{ id: 'rango', titulo: 'Elegí hasta cuánto', tipo: 'grilla', items: RANGOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(RANGOS, sel.rango).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { rango: !edad || edad <= 5 ? 'hasta5' : edad <= 7 ? 'hasta10' : 'hasta20', sinPesar: true };
    },
    preguntas: function (sel) {
      var r = deLista(RANGOS, sel.rango);
      var pozo = [];
      for (var n = r.desde; n <= r.hasta; n++) pozo.push(itemContar(n));
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Cuántos hay?');
      /* De a cinco por fila, como en un ábaco: así 7 se ve como «cinco y
         dos» y no hay que contar de a uno cada vez. */
      var html = '<div class="contar" role="img" aria-label="' + it.n + ' dibujos">';
      for (var i = 0; i < it.n; i++) html += '<span>' + it.cosa + '</span>';
      T.visual(html + '</div>');
      // el error de contar: pasarse uno o quedarse corto
      armarRespuestas(it.n, distractores(it.n, [it.n - 1, it.n + 1, it.n - 2, it.n + 2], 3, 1));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.n; }, {
        fallo: function (it, r) { return 'No son ' + r + '.'; },
        revelado: function (it) { return 'Eran ' + it.n + '.'; }
      });
    },
    deClave: function (resto) {
      var n = parseInt(resto, 10);
      return n > 0 && n <= 30 ? itemContar(n) : null;
    },
    repaso: function (it) {
      return { simbolo: it.cosa, nombre: 'Contar ' + it.n + ' dibujos', dato: 'Eran ' + it.n };
    }
  };

  /* ============================================================
     Figuras
     ============================================================ */
  var FIGURAS = [
    { id: 'circulo', nombre: 'Círculo', basica: true },
    { id: 'cuadrado', nombre: 'Cuadrado', basica: true },
    { id: 'triangulo', nombre: 'Triángulo', basica: true },
    { id: 'rectangulo', nombre: 'Rectángulo', basica: true },
    { id: 'ovalo', nombre: 'Óvalo' },
    { id: 'rombo', nombre: 'Rombo' },
    { id: 'pentagono', nombre: 'Pentágono' },
    { id: 'hexagono', nombre: 'Hexágono' }
  ];
  var PINTURAS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4'];

  /** Los vértices de un polígono regular, con uno apuntando arriba. */
  function regular(lados, radio) {
    var puntos = [];
    for (var i = 0; i < lados; i++) {
      var a = (-90 + i * 360 / lados) * Math.PI / 180;
      puntos.push((60 + Math.cos(a) * radio).toFixed(1) + ',' + (62 + Math.sin(a) * radio).toFixed(1));
    }
    return puntos.join(' ');
  }

  function dibujarFigura(id, color) {
    var borde = Util.oscurecer(color, 0.72);
    var estilo = ' fill="' + color + '" stroke="' + borde + '" stroke-width="4" stroke-linejoin="round"';
    var forma = {
      circulo: '<circle cx="60" cy="60" r="46"' + estilo + '/>',
      cuadrado: '<rect x="18" y="18" width="84" height="84"' + estilo + '/>',
      rectangulo: '<rect x="8" y="32" width="104" height="56"' + estilo + '/>',
      triangulo: '<polygon points="60,12 110,104 10,104"' + estilo + '/>',
      ovalo: '<ellipse cx="60" cy="60" rx="54" ry="34"' + estilo + '/>',
      /* Más alto que ancho a propósito: un cuadrado girado también es un
         rombo, pero a esta edad se aprende como «el cuadrado de costado»
         y la pregunta tendría dos respuestas. */
      rombo: '<polygon points="60,6 100,60 60,114 20,60"' + estilo + '/>',
      pentagono: '<polygon points="' + regular(5, 52) + '"' + estilo + '/>',
      hexagono: '<polygon points="' + regular(6, 52) + '"' + estilo + '/>'
    }[id];
    return '<svg class="figura" viewBox="0 0 120 120" role="img" aria-label="Una figura">' + forma + '</svg>';
  }

  function itemFigura(id, todas) {
    return { id: 'figuras:' + id, juego: 'figuras', figura: id, todas: !!todas,
             pintura: Util.alAzar(PINTURAS) };
  }

  function nombreFigura(id) { return deLista(FIGURAS, id).nombre; }

  var FIGURAS_JUEGO = {
    id: 'figuras',
    nombre: 'Figuras',
    icono: 'figuras',
    color: '#db2777',
    suave: '#fce7f3',
    texto: '¿Cómo se llama?',
    edadMin: 4,

    opciones: function () {
      return [{ id: 'grupo', titulo: 'Elegí qué figuras', tipo: 'grilla', items: [
        { id: 'basicas', nombre: 'Las cuatro primeras', icono: 'nivel-1', detalle: 'Círculo, cuadrado, triángulo y rectángulo' },
        { id: 'todas', nombre: 'Todas', icono: 'nivel-3', detalle: 'Con óvalo, rombo, pentágono y hexágono' }
      ] }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return (sel.grupo === 'todas' ? 'Todas las figuras' : 'Figuras básicas') + ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function (comun, edad) { return { grupo: edad && edad >= 6 ? 'todas' : 'basicas', sinPesar: true }; },
    preguntas: function (sel) {
      var todas = sel.grupo === 'todas';
      var pozo = FIGURAS.filter(function (f) { return todas || f.basica; })
        .map(function (f) { return itemFigura(f.id, todas); });
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Qué figura es?');
      T.visual(dibujarFigura(it.figura, it.pintura));
      var pozo = FIGURAS.filter(function (f) { return (it.todas || f.basica) && f.id !== it.figura; })
        .map(function (f) { return f.nombre; });
      armarRespuestas(nombreFigura(it.figura), Util.muestra(pozo, 3), { forma: 'palabra' });
    },
    ganchos: function () {
      return T.ganchos(function (it) { return nombreFigura(it.figura); }, {
        fallo: function (it, r) { return 'No es un ' + r.toLowerCase() + '.'; },
        revelado: function (it) { return 'Es un ' + nombreFigura(it.figura).toLowerCase() + '.'; }
      });
    },
    deClave: function (resto) {
      var f = FIGURAS.filter(function (x) { return x.id === resto; })[0];
      return f ? itemFigura(f.id, !f.basica) : null;
    },
    repaso: function (it) {
      return { simbolo: '🔷', nombre: 'La figura', dato: 'Era un ' + nombreFigura(it.figura).toLowerCase() };
    }
  };

  /* ============================================================
     Mayor y menor
     ============================================================ */
  var RANGOS_COMPARAR = [
    { id: 'hasta10', nombre: 'Hasta 10', icono: 'nivel-1', detalle: 'Números de una cifra' },
    { id: 'hasta100', nombre: 'Hasta 100', icono: 'nivel-2', detalle: 'Muchos con la misma decena' },
    { id: 'hasta1000', nombre: 'Hasta 1000', icono: 'nivel-3', detalle: 'Las mismas cifras en otro orden' }
  ];

  /** Cuatro números distintos, según el nivel. */
  function numerosParaComparar(nivel) {
    var vistos = {}, lista = [];
    function sumar(n) { if (!vistos[n]) { vistos[n] = true; lista.push(n); } }

    if (nivel === 'hasta1000') {
      /* 347, 374, 437, 473: las mismas tres cifras en otro orden. Es la
         única manera de que la respuesta dependa de mirar la posición de
         cada cifra y no de ver cuál número es «más largo». */
      var cifras = Util.muestra([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      var c = cifras;
      Util.muestra([
        [c[0], c[1], c[2]], [c[0], c[2], c[1]], [c[1], c[0], c[2]],
        [c[1], c[2], c[0]], [c[2], c[0], c[1]], [c[2], c[1], c[0]]
      ], 4).forEach(function (p) { sumar(p[0] * 100 + p[1] * 10 + p[2]); });
      return lista;
    }
    if (nivel === 'hasta100') {
      // la mitad de las veces, todos de la misma decena: 42, 47, 45, 49
      var decena = entero(1, 9);
      var misma = Math.random() < 0.5;
      while (lista.length < 4) sumar(misma ? decena * 10 + entero(0, 9) : entero(10, 99));
      return lista;
    }
    while (lista.length < 4) sumar(entero(0, 10));
    return lista;
  }

  function itemComparar(modo, numeros) {
    var orden = numeros.slice().sort(function (a, b) { return a - b; });
    return {
      id: 'comparar:' + modo + ':' + orden.join('-'), juego: 'comparar',
      modo: modo, numeros: numeros,
      respuesta: modo === 'mayor' ? orden[orden.length - 1] : orden[0]
    };
  }

  var COMPARAR = {
    id: 'comparar',
    nombre: 'Mayor y menor',
    icono: 'comparar',
    color: '#0d9488',
    suave: '#ccfbf1',
    texto: 'El más grande o el más chico',
    edadMin: 5,

    opciones: function () {
      return [{ id: 'nivel', titulo: 'Elegí los números', tipo: 'grilla', items: RANGOS_COMPARAR }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(RANGOS_COMPARAR, sel.nivel).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { nivel: !edad || edad <= 6 ? 'hasta10' : edad <= 8 ? 'hasta100' : 'hasta1000' };
    },
    preguntas: function (sel) {
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        items.push(itemComparar(Math.random() < 0.5 ? 'mayor' : 'menor', numerosParaComparar(sel.nivel)));
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuál es el número <b>' + (it.modo === 'mayor' ? 'más grande' : 'más chico') + '</b>?');
      armarRespuestas(it.respuesta, it.numeros.filter(function (n) { return n !== it.respuesta; }));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) {
          return it.modo === 'mayor' ? 'Hay uno más grande que ' + r + '.' : 'Hay uno más chico que ' + r + '.';
        },
        revelado: function (it) {
          return 'El ' + (it.modo === 'mayor' ? 'más grande' : 'más chico') + ' era ' + it.respuesta + '.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(mayor|menor):(\d+(?:-\d+){3})$/.exec(resto);
      if (!m) return null;
      var numeros = m[2].split('-').map(Number);
      return itemComparar(m[1], Util.mezclar(numeros));
    },
    repaso: function (it) {
      return { simbolo: '⚖️', nombre: 'El ' + (it.modo === 'mayor' ? 'más grande' : 'más chico') +
               ' de ' + it.numeros.join(', '), dato: 'Era ' + it.respuesta };
    }
  };

  /* ============================================================
     Sumas y restas
     ============================================================ */
  var NIVELES = [
    { id: 'facil', nombre: 'Fácil', icono: 'nivel-1', detalle: 'Hasta 10, sin llevarse nada', max: 10, acarreo: false },
    { id: 'medio', nombre: 'Medio', icono: 'nivel-2', detalle: 'Hasta 20', max: 20, acarreo: true },
    { id: 'dificil', nombre: 'Difícil', icono: 'nivel-3', detalle: 'Hasta 100', max: 100, acarreo: true },
    { id: 'experto', nombre: 'Experto', icono: 'nivel-4', detalle: 'Hasta 999', max: 999, acarreo: true }
  ];

  /** Arma una cuenta que da un resultado válido (nunca negativo). */
  function cuenta(nivel, operacion) {
    var a, b;
    if (operacion === '+') {
      if (nivel.acarreo) {
        a = entero(1, nivel.max);
        b = entero(1, Math.max(1, nivel.max - a));
      } else {
        a = entero(1, nivel.max - 1);
        b = entero(1, nivel.max - a);
      }
      return { a: a, b: b, op: '+', resultado: a + b };
    }
    a = entero(2, nivel.max);
    b = entero(1, a);                       // así la resta nunca da negativo
    return { a: a, b: b, op: '−', resultado: a - b };
  }

  var CUENTAS = {
    id: 'cuentas',
    nombre: 'Sumas y restas',
    icono: 'cuentas',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Cuatro niveles',
    edadMin: 5,

    opciones: function () {
      return [
        { id: 'nivel', titulo: 'Elegí el nivel', tipo: 'grilla', items: NIVELES },
        {
          id: 'operacion', titulo: 'Elegí las cuentas', tipo: 'fila', porDefecto: 'ambas',
          items: [
            { id: 'ambas', nombre: 'Mezcladas', icono: 'dado', detalle: 'Sumas y restas' },
            { id: 'suma', nombre: 'Sumar', icono: 'mas', detalle: 'Solo sumas' },
            { id: 'resta', nombre: 'Restar', icono: 'menos', detalle: 'Solo restas' }
          ]
        }
      ];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var n = deLista(NIVELES, sel.nivel);
      var q = { ambas: 'sumas y restas', suma: 'sumas', resta: 'restas' }[sel.operacion || 'ambas'];
      return 'Nivel ' + n.nombre.toLowerCase() + ' · ' + q + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function (comun, edad) { return { nivel: nivelPorEdad(edad), operacion: 'ambas' }; },
    preguntas: function (sel) {
      var nivel = deLista(NIVELES, sel.nivel);
      var modo = sel.operacion || 'ambas';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var op = modo === 'ambas' ? (Math.random() < 0.5 ? '+' : '−') : (modo === 'suma' ? '+' : '−');
        var c = cuenta(nivel, op);
        c.id = c.a + c.op + c.b;
        items.push(c);
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuánto es <b>' + it.a + ' ' + it.op + ' ' + it.b + '</b>?');
      // errores típicos: contarse uno, olvidarse de llevar, o cambiar la operación
      armarRespuestas(it.resultado, distractores(it.resultado, [
        it.resultado + 1, it.resultado - 1,
        it.resultado + 10, it.resultado - 10,
        it.op === '+' ? it.a - it.b : it.a + it.b
      ], 3, 0));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.resultado; }, {
        fallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        revelado: function (it) { return it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.resultado; }
      });
    }
  };

  /* ============================================================
     Qué número sigue
     ============================================================ */
  var NIVELES_SERIE = [
    { id: 'facil', nombre: 'Fácil', icono: 'nivel-1', detalle: 'De a 1 y de a 2', pasos: ['+1', '+2', '-1'] },
    { id: 'medio', nombre: 'Medio', icono: 'nivel-2', detalle: 'De a 3, de a 5, de a 10', pasos: ['+3', '+5', '+10', '-2', '-10'] },
    { id: 'dificil', nombre: 'Difícil', icono: 'nivel-3', detalle: 'Saltos raros y dobles', pasos: ['+4', '+6', '+7', '+9', '-3', '-5', 'x2'] }
  ];

  function aplicarPaso(n, paso) {
    if (paso === 'x2') return n * 2;
    return n + parseInt(paso, 10);
  }

  /** Cuatro números de la serie y el quinto, que es la respuesta. */
  function itemSerie(inicio, paso) {
    var terminos = [inicio];
    for (var i = 0; i < 4; i++) terminos.push(aplicarPaso(terminos[i], paso));
    return {
      id: 'serie:' + inicio + ':' + paso, juego: 'serie', inicio: inicio, paso: paso,
      muestra: terminos.slice(0, 4), respuesta: terminos[4]
    };
  }

  /** Un comienzo que no deja la serie en negativo ni con números enormes. */
  function inicioPara(paso) {
    if (paso === 'x2') return entero(1, 5);
    var d = parseInt(paso, 10);
    if (d < 0) return entero(-d * 4, -d * 4 + 20);
    return entero(0, d >= 5 ? 50 : 20);
  }

  var SERIE = {
    id: 'serie',
    nombre: 'Qué número sigue',
    icono: 'serie',
    color: '#4f46e5',
    suave: '#e0e7ff',
    texto: 'Descubrí la regla',
    edadMin: 6,

    opciones: function () {
      return [{ id: 'nivel', titulo: 'Elegí el nivel', tipo: 'grilla', items: NIVELES_SERIE }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return 'Nivel ' + deLista(NIVELES_SERIE, sel.nivel).nombre.toLowerCase() + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { nivel: !edad || edad <= 7 ? 'facil' : edad <= 9 ? 'medio' : 'dificil' };
    },
    preguntas: function (sel) {
      var pasos = deLista(NIVELES_SERIE, sel.nivel).pasos;
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var paso = Util.alAzar(pasos);
        items.push(itemSerie(inicioPara(paso), paso));
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Qué número sigue?');
      T.visual('<div class="serie">' + it.muestra.map(function (n) {
        return '<span>' + n + '</span>';
      }).join('') + '<span class="serie-falta">?</span></div>');

      var ultimo = it.muestra[3], antes = it.muestra[2];
      var salto = ultimo - antes;
      /* Los errores de una serie: equivocarse por uno, saltearse un paso,
         repetir el último, o —en los dobles— sumar en vez de multiplicar
         (1, 2, 4, 8 → 12 en vez de 16). */
      // ultimo + salto es la respuesta en una serie de sumar, y el error
      // de seguir sumando en una de dobles; si coincide, se descarta solo
      armarRespuestas(it.respuesta, distractores(it.respuesta, [
        it.respuesta + 1, it.respuesta - 1, it.respuesta + salto, ultimo, ultimo + salto
      ], 3, 0));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No va el ' + r + '.'; },
        revelado: function (it) {
          var regla = it.paso === 'x2' ? 'cada uno es el doble del anterior'
            : (it.paso.charAt(0) === '+' ? 'se suma ' : 'se resta ') + Math.abs(parseInt(it.paso, 10));
          return 'Seguía el ' + it.respuesta + ': ' + regla + '.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(\d+):([+-]\d+|x2)$/.exec(resto);
      return m ? itemSerie(parseInt(m[1], 10), m[2]) : null;
    },
    repaso: function (it) {
      return { simbolo: '➡️', nombre: it.muestra.join(', ') + ', …', dato: 'Seguía el ' + it.respuesta };
    }
  };

  /* ============================================================
     La hora
     ============================================================ */
  var PASOS = [
    { id: 'punto', nombre: 'En punto', icono: 'reloj-punto', detalle: 'Las 3, las 8…', paso: 60 },
    { id: 'media', nombre: 'Y media', icono: 'reloj-media', detalle: 'También 3:30', paso: 30 },
    { id: 'cuarto', nombre: 'Y cuarto', icono: 'reloj-cuarto', detalle: 'También 3:15 y 3:45', paso: 15 },
    { id: 'cinco', nombre: 'De 5 en 5', icono: 'reloj-cinco', detalle: 'Cualquier múltiplo de 5', paso: 5 }
  ];

  function comoTexto(hora, minuto) {
    return hora + ':' + (minuto < 10 ? '0' + minuto : minuto);
  }

  /** Dibuja un reloj de agujas con la hora pedida. */
  function dibujarReloj(hora, minuto) {
    var R = 100, C = 110;
    var marcas = '';
    for (var i = 0; i < 60; i++) {
      var ang = (i * 6 - 90) * Math.PI / 180;
      var largo = (i % 5 === 0) ? 10 : 4;
      var grosor = (i % 5 === 0) ? 3 : 1.5;
      marcas += '<line x1="' + (C + Math.cos(ang) * (R - largo)).toFixed(1) +
                '" y1="' + (C + Math.sin(ang) * (R - largo)).toFixed(1) +
                '" x2="' + (C + Math.cos(ang) * R).toFixed(1) +
                '" y2="' + (C + Math.sin(ang) * R).toFixed(1) +
                '" stroke="#5a6b8c" stroke-width="' + grosor + '" stroke-linecap="round"/>';
    }

    var numeros = '';
    for (var n = 1; n <= 12; n++) {
      var a = (n * 30 - 90) * Math.PI / 180;
      numeros += '<text x="' + (C + Math.cos(a) * (R - 26)).toFixed(1) +
                 '" y="' + (C + Math.sin(a) * (R - 26) + 7).toFixed(1) +
                 '" text-anchor="middle" font-size="21" font-weight="700" fill="#1d2b4a">' + n + '</text>';
    }

    var angMin = (minuto * 6 - 90) * Math.PI / 180;
    var angHora = ((hora % 12) * 30 + minuto * 0.5 - 90) * Math.PI / 180;

    function aguja(ang, largo, grosor, color) {
      return '<line x1="' + C + '" y1="' + C +
             '" x2="' + (C + Math.cos(ang) * largo).toFixed(1) +
             '" y2="' + (C + Math.sin(ang) * largo).toFixed(1) +
             '" stroke="' + color + '" stroke-width="' + grosor + '" stroke-linecap="round"/>';
    }

    return '<svg class="reloj" viewBox="0 0 220 220" role="img" aria-label="Reloj de agujas">' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + (R + 6) + '" fill="#ffffff" stroke="#dfe6f7" stroke-width="4"/>' +
      marcas + numeros +
      aguja(angHora, 52, 8, '#1d2b4a') +
      aguja(angMin, 78, 5, '#4c6ef5') +
      '<circle cx="' + C + '" cy="' + C + '" r="7" fill="#1d2b4a"/>' +
      '</svg>';
  }

  var RELOJ = {
    id: 'reloj',
    nombre: 'La hora',
    icono: 'reloj',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Leé el reloj de agujas',
    edadMin: 6,

    opciones: function () {
      return [{ id: 'paso', titulo: 'Elegí la dificultad', tipo: 'grilla', items: PASOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return deLista(PASOS, sel.paso).nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function (comun, edad) { return { paso: pasoPorEdad(edad), sinPesar: true }; },
    preguntas: function (sel) {
      var paso = deLista(PASOS, sel.paso).paso;
      var pozo = [];
      for (var hora = 1; hora <= 12; hora++) {
        for (var minuto = 0; minuto < 60; minuto += paso) pozo.push(horaDelReloj(hora, minuto));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Qué hora marca el reloj?');
      T.visual(dibujarReloj(it.hora, it.minuto));

      // confusiones típicas: leer la aguja al revés, o pasarse una hora
      var otraHora = it.hora === 12 ? 1 : it.hora + 1;
      var horaAntes = it.hora === 1 ? 12 : it.hora - 1;
      var candidatos = [
        comoTexto(otraHora, it.minuto),
        comoTexto(horaAntes, it.minuto),
        comoTexto(it.hora, (it.minuto + 30) % 60),
        comoTexto(it.hora, (it.minuto + 15) % 60),
        comoTexto(it.hora, (it.minuto + 45) % 60)
      ].filter(function (t, i, a) { return t !== it.texto && a.indexOf(t) === i; });

      armarRespuestas(it.texto, Util.muestra(candidatos, 3));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.texto; }, {
        fallo: function (it, respuesta) { return 'No son las ' + respuesta + '.'; },
        revelado: function (it) { return 'Eran las ' + it.texto; }
      });
    }
  };

  /* ============================================================
     Tablas de multiplicar
     ============================================================ */
  var TABLAS = {
    id: 'tablas',
    nombre: 'Tablas de multiplicar',
    icono: 'tablas',
    color: COLOR,
    suave: '#ede9fe',
    texto: 'Del 2 al 12',
    edadMin: 7,
    requiere: { juego: 'matematica/cuentas', estrellas: 3 },

    opciones: function () {
      // el ícono de cada tabla es su propio número: doce veces la misma
      // crucecita y un "2 × 1 … 2 × 10" abajo eran ruido, no información
      var items = [{ id: 'mezcla', nombre: 'Mezcladas', icono: 'dado' }];
      for (var t = 2; t <= 12; t++) {
        items.push({ id: String(t), nombre: 'Tabla del ' + t, icono: String(t), iconoNumero: true });
      }
      return [{ id: 'tabla', titulo: 'Elegí la tabla', tipo: 'grilla', items: items }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var nombre = sel.tabla === 'mezcla' ? 'Tablas mezcladas' : 'Tabla del ' + sel.tabla;
      return nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function () { return { tabla: 'mezcla', sinPesar: true }; },
    preguntas: function (sel) {
      var mezcla = !sel.tabla || sel.tabla === 'mezcla';
      var desde = mezcla ? 2 : parseInt(sel.tabla, 10);
      var hasta = mezcla ? 12 : desde;
      var pozo = [];
      for (var a = desde; a <= hasta; a++) {
        for (var b = 1; b <= 10; b++) pozo.push(cuentaTabla(a, b));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuánto es <b>' + it.a + ' × ' + it.b + '</b>?');
      // errores típicos: correrse una fila de la tabla o sumar en vez de multiplicar
      armarRespuestas(it.resultado, distractores(it.resultado, [
        it.a * (it.b + 1), it.a * (it.b - 1),
        (it.a + 1) * it.b, (it.a - 1) * it.b,
        it.resultado + it.a, it.resultado - it.a, it.a + it.b
      ], 3, 0));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.resultado; }, {
        fallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        revelado: function (it) { return it.a + ' × ' + it.b + ' = ' + it.resultado; }
      });
    }
  };

  /* ============================================================
     Dobles y mitades
     ============================================================ */
  var TAMANOS = [
    { id: 'chicos', nombre: 'Números chicos', icono: 'nivel-1', detalle: 'El doble hasta 10, la mitad hasta 20', hasta: 10 },
    { id: 'grandes', nombre: 'Números grandes', icono: 'nivel-3', detalle: 'El doble hasta 50, la mitad hasta 100', hasta: 50 }
  ];

  function itemDoble(modo, n) {
    return { id: 'dobles:' + modo + ':' + n, juego: 'dobles', modo: modo, n: n,
             respuesta: modo === 'doble' ? n * 2 : n / 2 };
  }

  var DOBLES = {
    id: 'dobles',
    nombre: 'Dobles y mitades',
    icono: 'dobles',
    color: '#c026d3',
    suave: '#fae8ff',
    texto: 'El doble de 8, la mitad de 14',
    edadMin: 7,

    opciones: function () {
      return [
        { id: 'tamano', titulo: 'Elegí los números', tipo: 'grilla', items: TAMANOS },
        { id: 'modo', titulo: 'Elegí qué preguntar', tipo: 'fila', porDefecto: 'mezcla', items: [
          { id: 'mezcla', nombre: 'Mezclado', icono: 'dado', detalle: 'Dobles y mitades' },
          { id: 'doble', nombre: 'Dobles', icono: 'mas', detalle: 'Solo dobles' },
          { id: 'mitad', nombre: 'Mitades', icono: 'menos', detalle: 'Solo mitades' }
        ] }
      ];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var q = { mezcla: 'dobles y mitades', doble: 'dobles', mitad: 'mitades' }[sel.modo || 'mezcla'];
      return deLista(TAMANOS, sel.tamano).nombre + ' · ' + q + ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function (comun, edad) { return { tamano: edad && edad >= 9 ? 'grandes' : 'chicos', modo: 'mezcla' }; },
    preguntas: function (sel) {
      var hasta = deLista(TAMANOS, sel.tamano).hasta;
      var desde = hasta === 10 ? 1 : 11;
      var modo = sel.modo || 'mezcla';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var m = modo === 'mezcla' ? (Math.random() < 0.5 ? 'doble' : 'mitad') : modo;
        var base = entero(desde, hasta);
        items.push(itemDoble(m, m === 'doble' ? base : base * 2));
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      var r = it.respuesta;
      if (it.modo === 'doble') {
        consigna('¿Cuál es el <b>doble</b> de ' + it.n + '?');
        // errores: devolver el mismo número, sumarle 2, errarle por uno
        armarRespuestas(r, distractores(r, [it.n, it.n + 2, r + 1, r - 1, r + 2, r - 2], 3, 0));
      } else {
        consigna('¿Cuál es la <b>mitad</b> de ' + it.n + '?');
        // el error clásico: calcular el doble en vez de la mitad
        armarRespuestas(r, distractores(r, [it.n * 2, it.n - 2, r + 1, r - 1, r + 2], 3, 1));
      }
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No es ' + r + '.'; },
        revelado: function (it) {
          return it.modo === 'doble'
            ? 'El doble de ' + it.n + ' es ' + it.respuesta + ' (' + it.n + ' + ' + it.n + ').'
            : 'La mitad de ' + it.n + ' es ' + it.respuesta + ' (' + it.respuesta + ' + ' + it.respuesta + ' = ' + it.n + ').';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(doble|mitad):(\d+)$/.exec(resto);
      if (!m) return null;
      var n = parseInt(m[2], 10);
      if (m[1] === 'mitad' && n % 2) return null;
      return itemDoble(m[1], n);
    },
    repaso: function (it) {
      return { simbolo: '✌️', nombre: (it.modo === 'doble' ? 'El doble de ' : 'La mitad de ') + it.n,
               dato: 'Es ' + it.respuesta };
    }
  };

  /* ============================================================
     Cuánto vale cada cifra
     ============================================================ */
  var LARGOS = [
    { id: 'tres', nombre: 'Tres cifras', icono: '3', iconoNumero: true, detalle: 'Hasta 999', cifras: 3 },
    { id: 'cuatro', nombre: 'Cuatro cifras', icono: '4', iconoNumero: true, detalle: 'Hasta 9999', cifras: 4 }
  ];

  function itemPosicion(numero, lugar) {
    var texto = String(numero);
    var cifra = parseInt(texto.charAt(lugar), 10);
    return {
      id: 'posicion:' + numero + ':' + lugar, juego: 'posicion',
      numero: numero, lugar: lugar, cifra: cifra,
      respuesta: cifra * Math.pow(10, texto.length - 1 - lugar)
    };
  }

  /** Un número de cifras todas distintas, así «el 5» es uno solo. */
  function numeroSinRepetir(cifras) {
    var primera = entero(1, 9);
    var resto = Util.muestra([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (d) { return d !== primera; }), cifras - 1);
    return parseInt([primera].concat(resto).join(''), 10);
  }

  var POSICION = {
    id: 'posicion',
    nombre: 'Cuánto vale',
    icono: 'posicion',
    color: '#b45309',
    suave: '#fef3c7',
    texto: 'Unidades, decenas y centenas',
    edadMin: 7,

    opciones: function () {
      return [{ id: 'largo', titulo: 'Elegí los números', tipo: 'grilla', items: LARGOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(LARGOS, sel.largo).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) { return { largo: edad && edad >= 9 ? 'cuatro' : 'tres' }; },
    preguntas: function (sel) {
      var cifras = deLista(LARGOS, sel.largo).cifras;
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var numero = numeroSinRepetir(cifras);
        var texto = String(numero);
        // se pregunta por una cifra que no sea 0: el 0 no «vale» nada
        var lugares = [];
        for (var p = 0; p < texto.length; p++) if (texto.charAt(p) !== '0') lugares.push(p);
        items.push(itemPosicion(numero, Util.alAzar(lugares)));
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      var texto = String(it.numero);
      consigna('¿Cuánto vale el <b>' + it.cifra + '</b>?');
      T.visual('<div class="numero-grande">' + texto.split('').map(function (d, i) {
        return i === it.lugar ? '<b>' + d + '</b>' : '<span>' + d + '</span>';
      }).join('') + '</div>');
      // las cuatro lecturas posibles de una cifra: 5, 50, 500 y 5000
      var todas = [1, 10, 100, 1000].map(function (m) { return it.cifra * m; });
      armarRespuestas(it.respuesta, todas.filter(function (v) { return v !== it.respuesta; }));
    },
    ganchos: function () {
      var nombres = { 1: 'unidades', 10: 'decenas', 100: 'centenas', 1000: 'unidades de mil' };
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No vale ' + r + '.'; },
        revelado: function (it) {
          var lugar = it.respuesta / it.cifra;
          return 'Vale ' + it.respuesta + ': está en el lugar de las ' + nombres[lugar] + '.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(\d{3,4}):(\d)$/.exec(resto);
      if (!m) return null;
      var lugar = parseInt(m[2], 10);
      if (lugar >= m[1].length || m[1].charAt(lugar) === '0') return null;
      return itemPosicion(parseInt(m[1], 10), lugar);
    },
    repaso: function (it) {
      return { simbolo: '🔢', nombre: 'En ' + it.numero + ', el ' + it.cifra, dato: 'Vale ' + it.respuesta };
    }
  };

  /* ============================================================
     Divisiones
     ============================================================ */
  function itemDivision(dividendo, divisor) {
    return { id: 'division:' + dividendo + ':' + divisor, juego: 'division',
             a: dividendo, d: divisor, respuesta: dividendo / divisor };
  }

  var DIVISION = {
    id: 'division',
    nombre: 'Divisiones',
    icono: 'division',
    color: '#0369a1',
    suave: '#e0f2fe',
    texto: 'Las tablas al revés',
    edadMin: 8,

    opciones: function () {
      var items = [{ id: 'mezcla', nombre: 'Mezcladas', icono: 'dado' }];
      for (var t = 2; t <= 10; t++) {
        items.push({ id: String(t), nombre: 'Dividir por ' + t, icono: String(t), iconoNumero: true });
      }
      return [{ id: 'divisor', titulo: 'Elegí por cuánto dividir', tipo: 'grilla', items: items }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return (sel.divisor === 'mezcla' ? 'Divisiones mezcladas' : 'Dividir por ' + sel.divisor) +
        ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function () { return { divisor: 'mezcla', sinPesar: true }; },
    preguntas: function (sel) {
      var mezcla = !sel.divisor || sel.divisor === 'mezcla';
      var desde = mezcla ? 2 : parseInt(sel.divisor, 10);
      var hasta = mezcla ? 10 : desde;
      var pozo = [];
      for (var d = desde; d <= hasta; d++) {
        for (var q = 1; q <= 10; q++) pozo.push(itemDivision(d * q, d));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuánto es <b>' + it.a + ' ÷ ' + it.d + '</b>?');
      // errores: correrse una fila de la tabla, o contestar con el divisor
      armarRespuestas(it.respuesta, distractores(it.respuesta, [
        it.respuesta + 1, it.respuesta - 1, it.d, it.respuesta + 2, it.respuesta - 2
      ], 3, 1));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No: ' + r + ' × ' + it.d + ' no da ' + it.a + '.'; },
        revelado: function (it) {
          return it.a + ' ÷ ' + it.d + ' = ' + it.respuesta + ', porque ' + it.respuesta + ' × ' + it.d + ' = ' + it.a + '.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(\d+):(\d+)$/.exec(resto);
      if (!m) return null;
      var a = parseInt(m[1], 10), d = parseInt(m[2], 10);
      return d > 0 && a % d === 0 ? itemDivision(a, d) : null;
    },
    repaso: function (it) {
      return { simbolo: '➗', nombre: it.a + ' ÷ ' + it.d, dato: 'Da ' + it.respuesta };
    }
  };

  /* ============================================================
     Problemas: cuentas escondidas en un cuento
     ============================================================ */
  var NOMBRES = ['Sofía', 'Mateo', 'Valentina', 'Benjamín', 'Martina', 'Joaquín',
                 'Emma', 'Thiago', 'Catalina', 'Lautaro', 'Mora', 'Bautista'];
  /* Con el género, para concordar: «¿cuántas figuritas?», «¿cuántos
     caramelos?», «las reparte», «los reparte». */
  var OBJETOS = [
    { pl: 'figuritas', f: true }, { pl: 'caramelos', f: false },
    { pl: 'bolitas', f: true }, { pl: 'lápices', f: false },
    { pl: 'galletitas', f: true }, { pl: 'autitos', f: false },
    { pl: 'flores', f: true }, { pl: 'libros', f: false }
  ];

  function cuantos(o) { return o.f ? 'cuántas' : 'cuántos'; }
  function Cuantos(o) { return o.f ? 'Cuántas' : 'Cuántos'; }

  /* Cada plantilla sabe armar sus números (para que la cuenta dé justo),
     escribir el cuento y decir la cuenta que lo resuelve. */
  var PLANTILLAS = [
    { op: '+', numeros: function () { return [entero(3, 30), entero(2, 20)]; },
      texto: function (a, b, n, n2, o) { return n + ' tiene ' + a + ' ' + o.pl + '. Le regalan ' + b + ' más. ¿' + Cuantos(o) + ' tiene ahora?'; } },
    { op: '−', numeros: function () { var a = entero(8, 40); return [a, entero(2, a - 1)]; },
      texto: function (a, b, n, n2, o) { return n + ' tenía ' + a + ' ' + o.pl + ' y regaló ' + b + '. ¿' + Cuantos(o) + ' le quedan?'; } },
    { op: '+', numeros: function () { return [entero(5, 40), entero(5, 40)]; },
      texto: function (a, b, n, n2, o) { return 'En una caja hay ' + a + ' ' + o.pl + ' y en otra hay ' + b + '. ¿' + Cuantos(o) + ' hay en total?'; } },
    { op: '−', numeros: function () { var a = entero(10, 50); return [a, entero(2, a - 1)]; },
      texto: function (a, b, n, n2, o) { return n + ' tiene ' + a + ' ' + o.pl + ' y ' + n2 + ' tiene ' + b + '. ¿' + Cuantos(o) + ' más tiene ' + n + '?'; } },
    { op: '×', numeros: function () { return [entero(2, 6), entero(2, 10)]; },
      texto: function (a, b, n, n2, o) { return n + ' compra ' + a + ' paquetes con ' + b + ' ' + o.pl + ' cada uno. ¿' + Cuantos(o) + ' ' + o.pl + ' compró en total?'; } },
    { op: '÷', numeros: function () { var b = entero(2, 6); return [b * entero(2, 8), b]; },
      texto: function (a, b, n, n2, o) { return n + ' tiene ' + a + ' ' + o.pl + ' y ' + (o.f ? 'las' : 'los') + ' reparte en partes iguales entre ' + b + ' amigos. ¿' + Cuantos(o) + ' le tocan a cada uno?'; } },
    { op: '×', numeros: function () { return [entero(2, 8), entero(2, 6)]; },
      texto: function (a, b) { return 'En el aula hay ' + a + ' mesas y en cada mesa se sientan ' + b + ' chicos. ¿Cuántos chicos hay en total?'; } }
  ];
  var DE_SUMAR = [0, 1, 2, 3];              // las plantillas de solo sumar y restar

  function resolver(op, a, b) {
    return op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;
  }

  function itemProblema(t, a, b, n1, n2, o) {
    var p = PLANTILLAS[t];
    return {
      id: 'problemas:' + [t, a, b, n1, n2, o].join(':'), juego: 'problemas',
      t: t, a: a, b: b, op: p.op,
      texto: p.texto(a, b, NOMBRES[n1], NOMBRES[n2], OBJETOS[o]),
      respuesta: resolver(p.op, a, b)
    };
  }

  function problemaNuevo(plantillas) {
    var t = Util.alAzar(plantillas);
    var nums = PLANTILLAS[t].numeros();
    var n1 = entero(0, NOMBRES.length - 1);
    var n2 = (n1 + entero(1, NOMBRES.length - 1)) % NOMBRES.length;
    return itemProblema(t, nums[0], nums[1], n1, n2, entero(0, OBJETOS.length - 1));
  }

  var PROBLEMAS = {
    id: 'problemas',
    nombre: 'Problemas',
    icono: 'problemas',
    color: '#9333ea',
    suave: '#f3e8ff',
    texto: 'Cuentas escondidas en un cuento',
    edadMin: 8,

    opciones: function () {
      return [{ id: 'tipo', titulo: 'Elegí los problemas', tipo: 'grilla', items: [
        { id: 'sumas', nombre: 'Sumar y restar', icono: 'cuentas', detalle: 'Juntar, regalar, comparar' },
        { id: 'todas', nombre: 'Las cuatro cuentas', icono: 'dado', detalle: 'También multiplicar y repartir' }
      ] }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return (sel.tipo === 'todas' ? 'Las cuatro cuentas' : 'Sumar y restar') + ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function (comun, edad) { return { tipo: edad && edad >= 9 ? 'todas' : 'sumas' }; },
    preguntas: function (sel) {
      var plantillas = sel.tipo === 'todas' ? [0, 1, 2, 3, 4, 5, 6] : DE_SUMAR;
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) items.push(problemaNuevo(plantillas));
      return items;
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('<span class="consigna-larga">' + it.texto + '</span>');
      var r = it.respuesta;
      /* El error de un problema casi nunca es de cuenta: es elegir mal la
         cuenta. Por eso las malas son lo que da cada otra operación con
         los mismos números. */
      var otras = ['+', '−', '×'].filter(function (op) { return op !== it.op; })
        .map(function (op) { return resolver(op, it.a, it.b); });
      armarRespuestas(r, distractores(r, otras.concat([r + 1, r - 1, r + 2]), 3, 0));
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No da ' + r + '. ¿Qué cuenta hay que hacer?'; },
        revelado: function (it) {
          return 'Era ' + it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.respuesta + '.';
        }
      });
    },
    deClave: function (resto) {
      var p = resto.split(':').map(Number);
      if (p.length !== 6 || p.some(isNaN) || !PLANTILLAS[p[0]]) return null;
      if (p[3] >= NOMBRES.length || p[4] >= NOMBRES.length || p[5] >= OBJETOS.length) return null;
      return itemProblema(p[0], p[1], p[2], p[3], p[4], p[5]);
    },
    repaso: function (it) {
      return { simbolo: '📖', nombre: it.texto, dato: it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.respuesta };
    }
  };

  /* ============================================================
     Fracciones
     ============================================================ */
  var TIPOS_FRACCION = [
    { id: 'faciles', nombre: 'Medios, tercios y cuartos', icono: 'nivel-1', detalle: 'En 2, 3 o 4 partes', hasta: 4 },
    { id: 'todas', nombre: 'Hasta octavos', icono: 'nivel-3', detalle: 'En hasta 8 partes', hasta: 8 }
  ];

  function itemFraccion(n, d, forma) {
    return { id: 'fracciones:' + n + ':' + d + ':' + forma, juego: 'fracciones',
             n: n, d: d, forma: forma, respuesta: n + '/' + d };
  }

  function dibujarFraccion(n, d, forma) {
    var lleno = '#fb7185', vacio = '#ffffff', linea = '#9f1239';
    var partes = '';
    if (forma === 'barra') {
      var ancho = 200 / d;
      for (var i = 0; i < d; i++) {
        partes += '<rect x="' + (10 + i * ancho).toFixed(2) + '" y="30" width="' + ancho.toFixed(2) +
                  '" height="60" fill="' + (i < n ? lleno : vacio) + '" stroke="' + linea + '" stroke-width="3"/>';
      }
      return '<svg class="figura figura-ancha" viewBox="0 0 220 120" role="img" aria-label="Una barra dividida en ' + d + ' partes">' + partes + '</svg>';
    }
    var C = 60, R = 50;
    for (var k = 0; k < d; k++) {
      var a1 = (-90 + k * 360 / d) * Math.PI / 180;
      var a2 = (-90 + (k + 1) * 360 / d) * Math.PI / 180;
      partes += '<path d="M' + C + ' ' + C +
        ' L' + (C + R * Math.cos(a1)).toFixed(2) + ' ' + (C + R * Math.sin(a1)).toFixed(2) +
        ' A' + R + ' ' + R + ' 0 ' + (360 / d > 180 ? 1 : 0) + ' 1 ' +
        (C + R * Math.cos(a2)).toFixed(2) + ' ' + (C + R * Math.sin(a2)).toFixed(2) +
        ' Z" fill="' + (k < n ? lleno : vacio) + '" stroke="' + linea + '" stroke-width="3" stroke-linejoin="round"/>';
    }
    return '<svg class="figura" viewBox="0 0 120 120" role="img" aria-label="Una torta dividida en ' + d + ' partes">' + partes + '</svg>';
  }

  /** Una fracción escrita como se escribe a mano: un número arriba del otro. */
  function fraccionEscrita(texto) {
    var p = String(texto).split('/');
    var caja = Util.crear('span', 'fraccion-escrita');
    caja.appendChild(Util.crear('span', null, p[0]));
    caja.appendChild(Util.crear('span', null, p[1]));
    return caja;
  }

  /**
   * Los errores con fracciones: darla vuelta (4/3), contar las partes sin
   * pintar (1/4 en vez de 3/4), o comparar pintadas contra sin pintar
   * (3/1). Nunca sale una equivalente a la correcta: con 2/4 en pantalla,
   * 1/2 también estaría bien y la pregunta tendría dos respuestas.
   */
  function malasDeFraccion(n, d) {
    var candidatos = [[d, n], [d - n, d], [n, d - n], [n, d + 1], [n + 1, d], [n, d - 1]];
    var vistos = {};
    vistos[n + '/' + d] = true;
    var salida = [];
    candidatos.forEach(function (c) {
      if (salida.length >= 3) return;
      var a = c[0], b = c[1];
      if (a < 1 || b < 1) return;
      if (a * d === n * b) return;               // equivalente a la correcta
      var t = a + '/' + b;
      if (vistos[t]) return;
      vistos[t] = true;
      salida.push(t);
    });
    return salida;
  }

  var FRACCIONES = {
    id: 'fracciones',
    nombre: 'Fracciones',
    icono: 'fracciones',
    color: '#e11d48',
    suave: '#ffe4e6',
    texto: '¿Qué parte está pintada?',
    edadMin: 9,

    opciones: function () {
      return [{ id: 'tipo', titulo: 'Elegí las fracciones', tipo: 'grilla', items: TIPOS_FRACCION }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(TIPOS_FRACCION, sel.tipo).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) { return { tipo: edad && edad >= 10 ? 'todas' : 'faciles', sinPesar: true }; },
    preguntas: function (sel) {
      var hasta = deLista(TIPOS_FRACCION, sel.tipo).hasta;
      var pozo = [];
      for (var d = 2; d <= hasta; d++) {
        for (var n = 1; n < d; n++) pozo.push(itemFraccion(n, d, Math.random() < 0.5 ? 'torta' : 'barra'));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Qué parte está <b>pintada</b>?');
      T.visual(dibujarFraccion(it.n, it.d, it.forma));
      armarRespuestas(it.respuesta, malasDeFraccion(it.n, it.d), {
        forma: 'fraccion', mostrar: fraccionEscrita,
        etiqueta: function (v) { var p = v.split('/'); return p[0] + ' de ' + p[1]; }
      });
    },
    ganchos: function () {
      return T.ganchos(function (it) { return it.respuesta; }, {
        fallo: function (it, r) { return 'No es ' + r + '. Contá las partes pintadas y las partes en total.'; },
        revelado: function (it) {
          return 'Era ' + it.respuesta + ': ' + it.n + ' pintadas de ' + it.d + ' partes iguales.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(\d+):(\d+):(torta|barra)$/.exec(resto);
      if (!m) return null;
      var n = parseInt(m[1], 10), d = parseInt(m[2], 10);
      return n >= 1 && n < d && d <= 10 ? itemFraccion(n, d, m[3]) : null;
    },
    repaso: function (it) {
      return { simbolo: '🍕', nombre: 'Una ' + it.forma + ' en ' + it.d + ' partes, ' + it.n + ' pintadas',
               dato: 'Era ' + it.respuesta };
    }
  };

  /* ============================================================ */

  var JUEGOS = [CONTAR, FIGURAS_JUEGO, COMPARAR, CUENTAS, SERIE, RELOJ,
                TABLAS, DOBLES, POSICION, DIVISION, PROBLEMAS, FRACCIONES];
  var NUEVOS = {};
  JUEGOS.forEach(function (j) {
    Tablero.conJugar(j);
    if (j.deClave) NUEVOS[j.id] = j;
  });

  /** El juego nuevo de una clave 'juego:resto', o null si es una vieja. */
  function nuevoDe(clave) {
    var p = String(clave).indexOf(':');
    return p > 0 ? NUEVOS[clave.slice(0, p)] || null : null;
  }

  return {
    id: 'matematica',
    JUEGOS: JUEGOS,
    /** Lo usa también la lección sobre el reloj, en la sección Aprender. */
    dibujarReloj: dibujarReloj,
    claveItem: function (item) { return item.id; },
    /**
     * Qué juego sabe dibujar esta pregunta. Acá es obligatorio: una tabla
     * mostrada por el tablero de sumas sale "7 undefined 8". Si ese juego
     * está trabado, el repaso saltea la pregunta en vez de romperla.
     */
    juegoDeClave: function (clave) {
      var nuevo = nuevoDe(clave);
      if (nuevo) return nuevo.id;
      if (/^\d+x\d+$/.test(clave)) return 'tablas';
      if (/^h\d+_\d+$/.test(clave)) return 'reloj';
      return 'cuentas';
    },
    /**
     * Rearma una pregunta a partir de su clave, para el modo Repaso.
     * Las viejas dicen solas de qué juego son: '7x8' es una tabla,
     * 'h3_30' es el reloj, '12+5' es una cuenta.
     */
    itemDeClave: function (clave) {
      var nuevo = nuevoDe(clave);
      if (nuevo) return nuevo.deClave(clave.slice(nuevo.id.length + 1));

      var m = /^(\d+)x(\d+)$/.exec(clave);
      if (m) return cuentaTabla(+m[1], +m[2]);

      m = /^h(\d+)_(\d+)$/.exec(clave);
      if (m) return horaDelReloj(+m[1], +m[2]);

      m = /^(\d+)([+−])(\d+)$/.exec(clave);
      if (m) {
        var a = +m[1], op = m[2], b = +m[3];
        return { id: clave, a: a, op: op, b: b, resultado: op === '+' ? a + b : a - b };
      }
      return null;
    },
    repaso: function (item) {
      // los nuevos se reconocen por el juego; va primero porque una
      // división también tiene a, b y resultado y pasaría por una tabla
      if (item.juego && NUEVOS[item.juego]) return NUEVOS[item.juego].repaso(item);
      if (item.op) {
        return { simbolo: '➕', nombre: item.a + ' ' + item.op + ' ' + item.b, dato: 'Da ' + item.resultado };
      }
      if (item.hora !== undefined) {
        return { simbolo: '🕒', nombre: 'El reloj marcaba', dato: 'Las ' + item.texto };
      }
      return { simbolo: '✖️', nombre: item.a + ' × ' + item.b, dato: 'Da ' + item.resultado };
    },
    limpiar: function () {}
  };
})();
