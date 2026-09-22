/* ============================================================
   Materia: Matemática.

   Doce juegos que se responden eligiendo entre tarjetas. Cada uno dice
   entre qué edades se muestra (edadMin–edadMax), tomado de en qué año
   de la primaria se enseña cada tema según el Diseño Curricular de la
   Provincia de Buenos Aires (2018) y los NAP:

     4–6    Contar            conteo de colecciones (Nivel Inicial)
     4–7    Figuras           figuras geométricas (Inicial y 1.º)
     5–8    Mayor y menor     ordenar números (Inicial; hasta 1000 en 2.º)
     5–10   Sumas y restas    agregar y quitar (Inicial), cuentas en 1.º
     6–10   Qué número sigue  regularidades de la serie numérica (1.º)
     7–9    La hora           «leer la hora en relojes de aguja» (2.º)
     7–9    Dobles y mitades  cálculo mental (2.º)
     7–9    Cuánto vale       unos, dieces y cienes (2.º)
     7–12   Problemas         suma y resta desde 1.º, las cuatro en 3.º
     8–12   Tablas            «la tabla pitagórica» (3.º)
     8–12   Divisiones        multiplicación y división (3.º)
     9–12   Fracciones        «fracciones de uso frecuente» (4.º)

   La edad máxima es para no mostrarle a un chico de once el juego de
   contar manzanitas: hasta ahí se sigue viendo, después se esconde.

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

  /* ---------------------- el mapa de niveles ----------------------

     En matemática las preguntas no son una lista: se generan. Así que el
     camino de cada juego está escrito a mano, nivel por nivel, como
     [nombre, de qué se trata, la selección, 'desafio'?]. La selección es
     la misma que arma el modo libre, más unos parámetros finos que sólo
     usa el mapa (desde y hasta, qué tablas, qué minutos del reloj…):
     los niveles del modo libre son tres o cuatro saltos grandes, y un
     mapa necesita escalones chicos.

     Cada cinco niveles hay un desafío, con lo de los cuatro anteriores. */
  function mapaDe(juego, lista) {
    return lista.map(function (x, i) {
      var test = x[3] === 'desafio';
      return {
        numero: i + 1,
        nombre: x[0],
        detalle: x[1],
        test: test,
        preguntas: function () {
          return juego.preguntas(Object.assign({ cantidad: test ? 10 : 8 }, x[2]));
        }
      };
    });
  }

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
  /* Dibujos propios, no emoji: el emoji lo dibuja cada teléfono a su
     manera, y contar doce manzanas que en un Android se ven de un color
     y en un iPhone de otro no ayuda. Están en assets/contar/, hechos
     todos con el mismo estilo (ver herramientas/preparar-dibujos.js).
     El nombre en plural va en el aria-label, para el lector de pantalla. */
  var COSAS = [
    { id: 'manzana', uno: 'manzana', muchos: 'manzanas' },
    { id: 'frutilla', uno: 'frutilla', muchos: 'frutillas' },
    { id: 'banana', uno: 'banana', muchos: 'bananas' },
    { id: 'pez', uno: 'pez', muchos: 'peces' },
    { id: 'globo', uno: 'globo', muchos: 'globos' },
    { id: 'mariquita', uno: 'mariquita', muchos: 'mariquitas' },
    { id: 'flor', uno: 'flor', muchos: 'flores' },
    { id: 'pollito', uno: 'pollito', muchos: 'pollitos' },
    { id: 'pelota', uno: 'pelota', muchos: 'pelotas' },
    { id: 'mariposa', uno: 'mariposa', muchos: 'mariposas' }
  ];

  function dibujoDe(cosa) { return 'assets/contar/' + cosa.id + '.png'; }
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
    edadMax: 6,

    opciones: function () {
      return [{ id: 'rango', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: RANGOS }];
    },
    /* De a uno o dos números nuevos por nivel, y cada nivel arranca un
       poco más arriba: contar 6 cuando ya se sabe contar 5 es el paso
       justo, y el que cuenta hasta 20 no necesita volver al 1. */
    mapa: function () {
      return mapaDe(CONTAR, [
        ['Hasta 3', 'Uno, dos, tres', { desde: 1, hasta: 3 }],
        ['Hasta 4', 'Uno más', { desde: 1, hasta: 4 }],
        ['Hasta 5', 'Una mano entera', { desde: 2, hasta: 5 }],
        ['Cuatro o cinco', 'Los que más se confunden', { desde: 3, hasta: 5 }],
        ['Desafío', 'Hasta 5', { desde: 1, hasta: 5 }, 'desafio'],
        ['Hasta 6', 'Cinco y uno más', { desde: 3, hasta: 6 }],
        ['Hasta 7', 'Cinco y dos más', { desde: 4, hasta: 7 }],
        ['Hasta 8', 'Cinco y tres más', { desde: 5, hasta: 8 }],
        ['Hasta 10', 'Las dos manos', { desde: 6, hasta: 10 }],
        ['Desafío', 'Hasta 10', { desde: 1, hasta: 10 }, 'desafio'],
        ['Hasta 12', 'Diez y unos más', { desde: 9, hasta: 12 }],
        ['Hasta 14', 'Contá de a cinco', { desde: 11, hasta: 14 }],
        ['Hasta 16', 'Tres filas', { desde: 13, hasta: 16 }],
        ['Hasta 20', 'De a muchos', { desde: 15, hasta: 20 }],
        ['Gran desafío', 'Del 1 al 20', { desde: 1, hasta: 20 }, 'desafio']
      ]);
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(RANGOS, sel.rango).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { rango: !edad || edad <= 5 ? 'hasta5' : edad <= 7 ? 'hasta10' : 'hasta20', sinPesar: true };
    },
    preguntas: function (sel) {
      // el mapa pide desde y hasta sueltos; el modo libre, uno de los tres rangos
      var r = sel.hasta ? { desde: sel.desde || 1, hasta: sel.hasta } : deLista(RANGOS, sel.rango);
      var pozo = [];
      for (var n = r.desde; n <= r.hasta; n++) pozo.push(itemContar(n));
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Cuántos hay?');
      /* De a cinco por fila, como en un ábaco: así 7 se ve como «cinco y
         dos» y no hay que contar de a uno cada vez. */
      var html = '<div class="contar" role="img" aria-label="' +
                 it.n + ' ' + (it.n === 1 ? it.cosa.uno : it.cosa.muchos) + '">';
      for (var i = 0; i < it.n; i++) {
        html += '<img src="' + dibujoDe(it.cosa) + '" alt="" draggable="false">';
      }
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
      return {
        imagen: dibujoDe(it.cosa), dibujo: true,
        nombre: 'Contar ' + it.n + ' ' + (it.n === 1 ? it.cosa.uno : it.cosa.muchos),
        dato: 'Eran ' + it.n
      };
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
    edadMax: 7,

    opciones: function () {
      return [{ id: 'grupo', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: [
        { id: 'basicas', nombre: 'Las cuatro primeras', icono: 'nivel-1', detalle: 'Círculo, cuadrado, triángulo y rectángulo' },
        { id: 'todas', nombre: 'Todas', icono: 'nivel-3', detalle: 'Con óvalo, rombo, pentágono y hexágono' }
      ] }];
    },
    /* Una o dos figuras nuevas por nivel, y siempre junto a la que más se
       le parece: el óvalo con el círculo, el rombo con el cuadrado. Así se
       aprende la diferencia y no sólo el nombre. */
    mapa: function () {
      return mapaDe(FIGURAS_JUEGO, [
        ['Círculo y cuadrado', 'Redondo o con cuatro lados iguales', { grupo: 'basicas', solo: ['circulo', 'cuadrado'] }],
        ['El triángulo', 'Tres lados, tres puntas', { grupo: 'basicas', solo: ['circulo', 'cuadrado', 'triangulo'] }],
        ['El rectángulo', 'Un cuadrado estirado', { grupo: 'basicas', solo: ['cuadrado', 'rectangulo', 'triangulo'] }],
        ['Las cuatro primeras', 'Todas juntas', { grupo: 'basicas' }],
        ['Desafío', 'Las cuatro primeras', { grupo: 'basicas' }, 'desafio'],
        ['El óvalo', 'Un círculo estirado', { grupo: 'todas', solo: ['circulo', 'ovalo', 'cuadrado'] }],
        ['El rombo', 'Un cuadrado parado en una punta', { grupo: 'todas', solo: ['cuadrado', 'rombo', 'rectangulo', 'triangulo'] }],
        ['Pentágono y hexágono', 'Cinco y seis lados', { grupo: 'todas', solo: ['pentagono', 'hexagono', 'triangulo', 'cuadrado'] }],
        ['Las ocho figuras', 'Todas mezcladas', { grupo: 'todas' }],
        ['Gran desafío', 'Las ocho figuras', { grupo: 'todas' }, 'desafio']
      ]);
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return (sel.grupo === 'todas' ? 'Todas las figuras' : 'Figuras básicas') + ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function (comun, edad) { return { grupo: edad && edad >= 6 ? 'todas' : 'basicas', sinPesar: true }; },
    preguntas: function (sel) {
      var todas = sel.grupo === 'todas';
      var pozo = FIGURAS.filter(function (f) {
        return sel.solo ? sel.solo.indexOf(f.id) >= 0 : (todas || f.basica);
      })
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
    var NUEVE = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    /* Los escalones finos del mapa. Cada uno obliga a mirar una sola
       cosa: con decenas distintas alcanza con la primera cifra; con la
       misma decena, hay que mirar la segunda. */
    if (nivel === 'mil-mezcla') nivel = Math.random() < 0.5 ? 'centenas' : 'hasta1000';
    if (nivel === 'hasta20') {
      while (lista.length < 4) sumar(entero(0, 20));
      return lista;
    }
    if (nivel === 'decenas') {
      Util.muestra(NUEVE, 4).forEach(function (d) { sumar(d * 10 + entero(0, 9)); });
      return lista;
    }
    if (nivel === 'misma') {
      var suDecena = entero(1, 9);
      while (lista.length < 4) sumar(suDecena * 10 + entero(0, 9));
      return lista;
    }
    if (nivel === 'centenas') {
      Util.muestra(NUEVE, 4).forEach(function (c) { sumar(c * 100 + entero(0, 99)); });
      return lista;
    }

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
    edadMax: 8,

    opciones: function () {
      return [{ id: 'nivel', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: RANGOS_COMPARAR }];
    },
    /* Primero una sola pregunta («el más grande»), después la otra, y
       recién ahí mezcladas: leer la consigna también se aprende. */
    mapa: function () {
      return mapaDe(COMPARAR, [
        ['El más grande', 'Números hasta 10', { nivel: 'hasta10', modo: 'mayor' }],
        ['El más chico', 'Números hasta 10', { nivel: 'hasta10', modo: 'menor' }],
        ['¿Grande o chico?', 'Leé bien la pregunta', { nivel: 'hasta10' }],
        ['Hasta 20', 'Aparecen los de dos cifras', { nivel: 'hasta20' }],
        ['Desafío', 'Hasta 20', { nivel: 'hasta20' }, 'desafio'],
        ['Decenas distintas', 'Mirá la primera cifra', { nivel: 'decenas' }],
        ['La misma decena', 'Ahora mirá la segunda', { nivel: 'misma' }],
        ['Hasta 100', 'Todo mezclado', { nivel: 'hasta100' }],
        ['Tres cifras', 'Mirá las centenas', { nivel: 'centenas' }],
        ['Desafío', 'Hasta 100 y más', { nivel: 'hasta100' }, 'desafio'],
        ['Las mismas cifras', '347, 374, 437…', { nivel: 'hasta1000' }],
        ['Gran desafío', 'Hasta 1000', { nivel: 'mil-mezcla' }, 'desafio']
      ]);
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(RANGOS_COMPARAR, sel.nivel).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { nivel: !edad || edad <= 6 ? 'hasta10' : edad <= 8 ? 'hasta100' : 'hasta1000' };
    },
    preguntas: function (sel) {
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        // el mapa puede pedir una sola de las dos preguntas
        var modo = sel.modo === 'mayor' || sel.modo === 'menor' ? sel.modo
                 : (Math.random() < 0.5 ? 'mayor' : 'menor');
        items.push(itemComparar(modo, numerosParaComparar(sel.nivel)));
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
  /* ---------------------- andamiaje de las cuentas ----------------------

     Las pistas y las explicaciones salen de los mismos números de la
     cuenta: no hay que escribirlas a mano, y dicen el paso que sirve para
     ESA cuenta (si hay que llevarse, si hay que pedir prestado). */
  function unidades(n) { return n % 10; }
  function decenas(n) { return Math.floor(n / 10); }

  function contarDesde(desde, cuantos, paso) {
    var lista = [];
    for (var i = 1; i <= Math.min(cuantos - 1, 3); i++) lista.push(desde + i * paso);
    return lista.join(', ');
  }

  /* Qué error parece ser. Los distractores de cada cuenta son justo los
     errores típicos (uno de más o de menos, diez de más o de menos, la
     operación contraria), así que se puede decir cuál fue. */
  function diagnosticoCuenta(it, r) {
    var suma = it.op === '+';
    var hayQueLlevar = suma && unidades(it.a) + unidades(it.b) >= 10;
    var hayQuePedir = !suma && unidades(it.a) < unidades(it.b);
    if (hayQueLlevar && r === it.resultado - 10) return 'Casi: te olvidaste de la que te llevabas.';
    if (hayQuePedir && r === it.resultado + 10) return 'Casi: te olvidaste de que pediste prestado.';
    // con números de una cifra no hay decenas que mirar
    if ((it.a >= 10 || it.b >= 10) && (r === it.resultado + 10 || r === it.resultado - 10)) {
      return 'Las unidades están bien; mirá las decenas.';
    }
    if (r === it.resultado + 1) return 'Muy cerca: te pasaste por uno.';
    if (r === it.resultado - 1) return 'Muy cerca: te faltó uno.';
    if (!suma && r === it.a + it.b) return 'Esa es la suma, y acá hay que restar.';
    if (suma && r === Math.abs(it.a - it.b)) return 'Esa es la resta, y acá hay que sumar.';
    return 'No es ' + r + '.';
  }

  function pistaCuenta(it, intento) {
    var a = it.a, b = it.b, suma = it.op === '+';
    if (b === 0) return (suma ? 'Sumar' : 'Restar') + ' 0 no cambia el número.';
    if (!suma && a === b) return 'Si le sacás todo lo que tiene, ¿cuánto queda?';

    // números chicos: se cuenta
    if (a < 10 && b < 10) {
      if (suma) {
        var mayor = Math.max(a, b), menor = Math.min(a, b);
        if (intento === 1) return 'Empezá en el ' + mayor + ' y contá ' + menor + ' más.';
        return menor === 1
          ? '¿Qué número viene después del ' + mayor + '?'
          : 'Contá desde el ' + mayor + ': ' + contarDesde(mayor, menor, 1) + '… ¿y el que sigue?';
      }
      if (intento === 1) return 'Empezá en el ' + a + ' y contá ' + b + ' para atrás.';
      return b === 1
        ? '¿Qué número viene antes del ' + a + '?'
        : 'Contá para atrás desde el ' + a + ': ' + contarDesde(a, b, -1) + '… ¿y el que sigue?';
    }

    // números grandes: se va por columnas
    var ua = unidades(a), ub = unidades(b);
    var grandes = a >= 100 || b >= 100;
    if (suma) {
      var su = ua + ub;
      if (intento === 1) {
        return 'Empezá por las unidades: ' + ua + ' + ' + ub + '.' +
               (su >= 10 ? ' Da más de 9: te vas a llevar una.' : '');
      }
      var sigue = grandes ? 'Después seguí igual con las decenas y las centenas.'
                          : 'Ahora las decenas: ' + decenas(a) + ' + ' + decenas(b) + (su >= 10 ? ' + 1.' : '.');
      return 'Unidades: ' + ua + ' + ' + ub + ' = ' + su +
             (su >= 10 ? ', escribís ' + (su % 10) + ' y te llevás 1. ' : '. ') + sigue;
    }
    if (intento === 1) {
      return ua < ub
        ? 'Empezá por las unidades: a ' + ua + ' no le podés sacar ' + ub + ', así que pedile prestado a las decenas.'
        : 'Empezá por las unidades: ' + ua + ' − ' + ub + '.';
    }
    var siguen = grandes ? ' Después seguí igual con las decenas y las centenas.'
                         : ' Ahora las decenas: ' + (ua < ub ? (decenas(a) - 1) + ' − ' + decenas(b) + ' (una menos, la que prestaste).'
                                                           : decenas(a) + ' − ' + decenas(b) + '.');
    return ua < ub
      ? 'Con la prestada son ' + (ua + 10) + ' − ' + ub + ' = ' + (ua + 10 - ub) + '.' + siguen
      : 'Unidades: ' + ua + ' − ' + ub + ' = ' + (ua - ub) + '.' + siguen;
  }

  /* La respuesta con el camino, no sólo el resultado. */
  function explicacionCuenta(it) {
    var base = it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.resultado;
    if ((it.a < 10 && it.b < 10) || it.a >= 100 || it.b >= 100) return base + '.';
    var ua = unidades(it.a), ub = unidades(it.b), da = decenas(it.a), db = decenas(it.b);
    if (it.op === '+') {
      var su = ua + ub;
      return su >= 10
        ? base + ': ' + ua + ' + ' + ub + ' = ' + su + ', escribís ' + (su % 10) + ' y te llevás 1; después ' + da + ' + ' + db + ' + 1 = ' + (da + db + 1) + '.'
        : base + ': ' + ua + ' + ' + ub + ' = ' + su + ' y ' + da + ' + ' + db + ' = ' + (da + db) + '.';
    }
    return ua < ub
      ? base + ': con la prestada, ' + (ua + 10) + ' − ' + ub + ' = ' + (ua + 10 - ub) + ', y ' + (da - 1) + ' − ' + db + ' = ' + (da - 1 - db) + '.'
      : base + ': ' + ua + ' − ' + ub + ' = ' + (ua - ub) + ' y ' + da + ' − ' + db + ' = ' + (da - db) + '.';
  }

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

  /**
   * Las cuentas de un nivel del mapa, con más control que los cuatro
   * niveles del modo libre:
   *   max      el resultado (en la suma) o el primer número (en la resta)
   *   min      el primer número, como mínimo
   *   dos      los dos números, como mínimo `min` (dos cifras de verdad)
   *   llevar   'no': sin llevarse ni pedir prestado; 'si': justo eso
   *   decenas  sólo decenas redondas (20 + 30)
   */
  function cuentaDeMapa(cfg, op) {
    var min = cfg.min || 1, max = cfg.max;
    for (var vuelta = 0; vuelta < 500; vuelta++) {
      var a, b;
      if (cfg.decenas) {
        a = entero(1, 9) * 10;
        b = entero(1, 9) * 10;
        if (op === '+' && a + b > max) continue;
        if (op === '−' && b >= a) continue;
      } else if (op === '+') {
        var menorB = cfg.dos ? min : 1;
        if (max - min < menorB) return cuenta({ max: max, acarreo: true }, op);
        a = entero(min, max - menorB);
        b = entero(menorB, max - a);
      } else {
        /* Los dos números sorteados parejo y descartando los que no
           sirven: así todas las restas posibles salen igual de seguido.
           Sorteando primero uno y después el otro «entre lo que queda»,
           los chicos salían mucho más (2 − 1 era una de cada cuatro). */
        var menor = cfg.dos ? min : 1;
        a = entero(Math.max(min, menor + 1), max);
        b = entero(menor, max);
        if (b >= a) continue;
      }
      var llevo = op === '+' ? unidades(a) + unidades(b) >= 10 : unidades(a) < unidades(b);
      if (cfg.llevar === 'no' && llevo) continue;
      if (cfg.llevar === 'si' && !llevo) continue;
      return { a: a, b: b, op: op, resultado: op === '+' ? a + b : a - b };
    }
    return cuenta({ max: max, acarreo: true }, op);
  }

  var CUENTAS = {
    id: 'cuentas',
    nombre: 'Sumas y restas',
    icono: 'cuentas',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Cuatro niveles',
    edadMin: 5,
    edadMax: 10,

    opciones: function () {
      return [
        { id: 'nivel', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: NIVELES },
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
    /* El salto de «hasta 10» a «hasta 20» es en realidad cuatro saltos:
       sumar sin pasar el 10, pasarlo, restar sin pedir y pedir prestado.
       Cada uno es un nivel, y lo mismo después con dos y tres cifras. */
    mapa: function () {
      return mapaDe(CUENTAS, [
        ['Sumas hasta 5', 'Juntar poquitos', { max: 5, operacion: 'suma' }],
        ['Sumas hasta 10', 'Como los dedos', { max: 10, operacion: 'suma' }],
        ['Restas hasta 5', 'Sacar poquitos', { max: 5, operacion: 'resta' }],
        ['Restas hasta 10', 'Contar para atrás', { max: 10, operacion: 'resta' }],
        ['Desafío', 'Sumas y restas hasta 10', { max: 10, operacion: 'ambas' }, 'desafio'],
        ['Sumas hasta 20', 'Sin pasar el 10: 12 + 5', { max: 20, min: 10, llevar: 'no', operacion: 'suma' }],
        ['Restas hasta 20', 'Sin pedir: 17 − 4', { max: 20, min: 10, llevar: 'no', operacion: 'resta' }],
        ['Pasar el 10', '8 + 5, 7 + 6…', { max: 20, llevar: 'si', operacion: 'suma' }],
        ['Restas pasando el 10', '13 − 5, 15 − 8…', { max: 20, min: 11, llevar: 'si', operacion: 'resta' }],
        ['Desafío', 'Todo hasta 20', { max: 20, operacion: 'ambas' }, 'desafio'],
        ['Decenas redondas', '20 + 30, 70 − 40', { max: 100, decenas: true, operacion: 'ambas' }],
        ['Sumas hasta 100', 'Sin llevarse: 34 + 25', { max: 100, min: 10, dos: true, llevar: 'no', operacion: 'suma' }],
        ['Restas hasta 100', 'Sin pedir: 68 − 23', { max: 100, min: 10, dos: true, llevar: 'no', operacion: 'resta' }],
        ['Llevándote', '27 + 15', { max: 100, min: 10, dos: true, llevar: 'si', operacion: 'suma' }],
        ['Desafío', 'Hasta 100', { max: 100, min: 10, operacion: 'ambas' }, 'desafio'],
        ['Pidiendo prestado', '42 − 17', { max: 100, min: 10, dos: true, llevar: 'si', operacion: 'resta' }],
        ['Sumas de tres cifras', '245 + 132', { max: 999, min: 100, dos: true, operacion: 'suma' }],
        ['Restas de tres cifras', '586 − 243', { max: 999, min: 100, dos: true, operacion: 'resta' }],
        ['Todo mezclado', 'Sumas y restas hasta 999', { max: 999, min: 10, operacion: 'ambas' }],
        ['Gran desafío', 'Hasta 999', { max: 999, min: 10, operacion: 'ambas' }, 'desafio']
      ]);
    },
    preguntas: function (sel) {
      // el mapa trae su propia forma de cuenta; el modo libre, uno de los cuatro niveles
      var nivel = sel.max ? null : deLista(NIVELES, sel.nivel);
      var modo = sel.operacion || 'ambas';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var op = modo === 'ambas' ? (Math.random() < 0.5 ? '+' : '−') : (modo === 'suma' ? '+' : '−');
        var c = nivel ? cuenta(nivel, op) : cuentaDeMapa(sel, op);
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
        fallo: diagnosticoCuenta,
        pista: pistaCuenta,
        revelado: explicacionCuenta
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
    edadMax: 10,

    opciones: function () {
      return [{ id: 'nivel', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: NIVELES_SERIE }];
    },
    /* Una regla nueva por nivel, y juntas recién cuando ya se conocen de
       a una: descubrir «de a 3» es otra cosa si todavía no se sabe si es
       de a 2, de a 3 o de a 5. */
    mapa: function () {
      var TODAS = ['+2', '+3', '+5', '+10', '-2', '-10', '+4', '+6', '+7', '+9', '-3', '-5', 'x2'];
      return mapaDe(SERIE, [
        ['De uno en uno', '1, 2, 3, 4…', { pasos: ['+1'] }],
        ['De dos en dos', '2, 4, 6, 8…', { pasos: ['+2'] }],
        ['Para atrás', '10, 9, 8, 7…', { pasos: ['-1'] }],
        ['Tres reglas', 'De a 1, de a 2 y para atrás', { pasos: ['+1', '+2', '-1'] }],
        ['Desafío', 'Las tres primeras reglas', { pasos: ['+1', '+2', '-1'] }, 'desafio'],
        ['De diez en diez', '10, 20, 30…', { pasos: ['+10'] }],
        ['De cinco en cinco', '5, 10, 15…', { pasos: ['+5'] }],
        ['De tres en tres', '3, 6, 9…', { pasos: ['+3'] }],
        ['Para atrás, de a mucho', 'De a 2 y de a 10', { pasos: ['-2', '-10'] }],
        ['Desafío', 'De a 3, de a 5 y de a 10', { pasos: ['+3', '+5', '+10', '-2', '-10'] }, 'desafio'],
        ['De a 4 y de a 6', 'Saltos más largos', { pasos: ['+4', '+6'] }],
        ['De a 7 y de a 9', 'Los saltos raros', { pasos: ['+7', '+9'] }],
        ['Para atrás, de a 3 y de a 5', '30, 27, 24…', { pasos: ['-3', '-5'] }],
        ['Los dobles', '1, 2, 4, 8…', { pasos: ['x2'] }],
        ['Gran desafío', 'Todas las reglas', { pasos: TODAS }, 'desafio']
      ]);
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return 'Nivel ' + deLista(NIVELES_SERIE, sel.nivel).nombre.toLowerCase() + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) {
      return { nivel: !edad || edad <= 7 ? 'facil' : edad <= 9 ? 'medio' : 'dificil' };
    },
    preguntas: function (sel) {
      var pasos = sel.pasos || deLista(NIVELES_SERIE, sel.nivel).pasos;
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
        pista: function (it, intento) {
          if (intento === 1) return 'Fijate cuánto cambia de un número al siguiente.';
          var m = it.muestra;
          var cambio = it.paso === 'x2' ? 'se duplica'
            : (it.paso.charAt(0) === '+' ? 'se suma ' : 'se resta ') + Math.abs(parseInt(it.paso, 10));
          return 'Del ' + m[2] + ' al ' + m[3] + ' ' + cambio + '. ¿Y después del ' + m[3] + '?';
        },
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
    edadMin: 7,
    edadMax: 9,

    opciones: function () {
      return [{ id: 'paso', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: PASOS }];
    },
    /* Un lugar nuevo de la aguja larga por nivel. «Menos cuarto» va solo
       porque es el que más cuesta: la aguja está en el 9 y hay que decir
       la hora de al lado. Al final, los de a 5 más engañosos: y cinco y
       menos cinco, donde la aguja corta ya casi está en otro número. */
    mapa: function () {
      var DE_A_CINCO = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
      return mapaDe(RELOJ, [
        ['En punto', 'La aguja larga en el 12', { minutos: [0] }],
        ['Y media', 'La aguja larga en el 6', { minutos: [30] }],
        ['En punto o y media', '¿Dónde está la aguja larga?', { minutos: [0, 30] }],
        ['Y cuarto', 'La aguja larga en el 3', { minutos: [15] }],
        ['Desafío', 'En punto, y cuarto, y media', { minutos: [0, 15, 30] }, 'desafio'],
        ['Menos cuarto', 'La aguja larga en el 9', { minutos: [45] }],
        ['Todos los cuartos', 'En punto, y cuarto, y media, menos cuarto', { minutos: [0, 15, 30, 45] }],
        ['De cinco en cinco', 'Y cinco, y diez, y veinte', { minutos: [5, 10, 20, 25] }],
        ['La otra mitad', 'Y treinta y cinco, y cuarenta…', { minutos: [35, 40, 50, 55] }],
        ['Desafío', 'Cualquier múltiplo de 5', { minutos: DE_A_CINCO }, 'desafio'],
        ['Los engañosos', 'Cerca de la hora y de la media', { minutos: [5, 25, 35, 55] }],
        ['Gran desafío', 'Cualquier hora', { minutos: DE_A_CINCO }, 'desafio']
      ]);
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return deLista(PASOS, sel.paso).nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function (comun, edad) { return { paso: pasoPorEdad(edad), sinPesar: true }; },
    preguntas: function (sel) {
      // el mapa dice qué minutos entran; el modo libre, de a cuánto
      var minutos = sel.minutos;
      if (!minutos) {
        var paso = deLista(PASOS, sel.paso).paso;
        minutos = [];
        for (var m = 0; m < 60; m += paso) minutos.push(m);
      }
      var pozo = [];
      for (var hora = 1; hora <= 12; hora++) {
        minutos.forEach(function (minuto) { pozo.push(horaDelReloj(hora, minuto)); });
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
        pista: function (it, intento) {
          if (intento === 1) return 'Mirá primero la aguja corta: es la que marca la hora.';
          return it.minuto === 0
            ? 'La aguja larga está arriba, en el 12: es en punto.'
            : 'La aguja larga está en el ' + (it.minuto / 5) + ': son ' + it.minuto + ' minutos.';
        },
        revelado: function (it) {
          return 'Eran las ' + it.texto + ': la aguja corta marca las ' + it.hora +
                 (it.minuto ? ' y la larga, ' + it.minuto + ' minutos.' : ' y la larga está en el 12.');
        }
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
    edadMin: 8,
    edadMax: 12,

    opciones: function () {
      // el ícono de cada tabla es su propio número: doce veces la misma
      // crucecita y un "2 × 1 … 2 × 10" abajo eran ruido, no información
      /* De la tabla del 2 a la del 12 y, al final, todas mezcladas: el
         orden de la lista es el orden de los niveles, así que lo más
         difícil va último. */
      var items = [];
      for (var t = 2; t <= 12; t++) {
        items.push({ id: String(t), nombre: 'Tabla del ' + t, icono: String(t), iconoNumero: true });
      }
      items.push({ id: 'mezcla', nombre: 'Todas mezcladas', icono: 'dado', detalle: 'Del 2 al 12' });
      return [{ id: 'tabla', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: items }];
    },
    /* En el orden en que se aprenden, no en el de los números: la del 2,
       la del 10 y la del 5 primero (son contar de a 2, de a 10, de a 5),
       y la del 7, la del 8 y la del 9 al final. Los desafíos juntan todo
       lo visto, y el último nivel antes del gran desafío repasa sólo las
       que más cuestan. */
    mapa: function () {
      function tabla(t, detalle) { return ['Tabla del ' + t, detalle, { tablas: [t] }]; }
      return mapaDe(TABLAS, [
        tabla(2, 'Contar de a 2'),
        tabla(10, 'Agregar un cero'),
        tabla(5, 'Contar de a 5'),
        tabla(3, 'Contar de a 3'),
        ['Desafío', 'Las del 2, 3, 5 y 10', { tablas: [2, 3, 5, 10] }, 'desafio'],
        tabla(4, 'El doble de la del 2'),
        tabla(6, 'El doble de la del 3'),
        tabla(7, 'La más rebelde'),
        tabla(8, 'El doble de la del 4'),
        ['Desafío', 'De la del 2 a la del 10', { tablas: [2, 3, 4, 5, 6, 7, 8, 10] }, 'desafio'],
        tabla(9, 'Las cifras suman 9'),
        tabla(11, 'Repetir el número'),
        tabla(12, 'La del 10 y la del 2 juntas'),
        ['Las difíciles', 'Las del 6, 7, 8, 9 y 12', { tablas: [6, 7, 8, 9, 12], sinFaciles: true }],
        ['Gran desafío', 'Todas las tablas', { tablas: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, 'desafio']
      ]);
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
      // el mapa pide tablas sueltas, que no siempre son seguidas
      var tablas = sel.tablas;
      if (!tablas) {
        tablas = [];
        for (var t = desde; t <= hasta; t++) tablas.push(t);
      }
      var pozo = [];
      tablas.forEach(function (a) {
        for (var b = 1; b <= 10; b++) {
          // por 1, por 2 y por 10 los sabe cualquiera: en «las difíciles» no van
          if (sel.sinFaciles && (b < 3 || b === 10)) continue;
          pozo.push(cuentaTabla(a, b));
        }
      });
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
        fallo: function (it, r) {
          // los distractores son la fila de al lado y la suma: se puede decir cuál fue
          if (r === it.resultado + it.a || r === it.resultado - it.a ||
              r === it.resultado + it.b || r === it.resultado - it.b) return 'Te corriste un lugar en la tabla.';
          if (r === it.a + it.b) return 'Esa es la suma, y acá hay que multiplicar.';
          return 'No, ' + r + ' no es.';
        },
        pista: function (it, intento) {
          if (it.b === 1) return 'Cualquier número por 1 da el mismo número.';
          if (it.b === 10) return 'Por 10, al número se le agrega un 0 al final.';
          if (intento === 1) return 'Es el ' + it.a + ' sumado ' + it.b + ' veces.';
          return it.a + ' × ' + (it.b - 1) + ' = ' + it.a * (it.b - 1) + '. Uno más: sumale ' + it.a + '.';
        },
        revelado: function (it) {
          var suma = it.b <= 5 && it.b > 1 ? ' (' + new Array(it.b + 1).join(it.a + ' + ').slice(0, -3) + ')' : '';
          return it.a + ' × ' + it.b + ' = ' + it.resultado + suma + '.';
        }
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
    edadMax: 9,

    opciones: function () {
      return [
        { id: 'tamano', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: TAMANOS },
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
    /* Primero el doble (sumar el mismo número dos veces), después la
       mitad, que es lo mismo al revés. Las decenas redondas van antes de
       los números grandes porque son las que enseñan a hacerlo por
       partes: el doble de 23 es el de 20 más el de 3. */
    mapa: function () {
      return mapaDe(DOBLES, [
        ['Dobles hasta 5', 'El doble de 3 es 3 + 3', { desde: 1, hasta: 5, modo: 'doble' }],
        ['Dobles hasta 10', 'El doble de 8', { desde: 1, hasta: 10, modo: 'doble' }],
        ['Mitades hasta 10', 'Repartir en dos', { desde: 1, hasta: 5, modo: 'mitad' }],
        ['Mitades hasta 20', 'La mitad de 14', { desde: 1, hasta: 10, modo: 'mitad' }],
        ['Desafío', 'Dobles y mitades chicos', { desde: 1, hasta: 10, modo: 'mezcla' }, 'desafio'],
        ['Dobles redondos', 'El doble de 20, de 30…', { bases: [10, 15, 20, 25, 30, 40, 50], modo: 'doble' }],
        ['Dobles hasta 25', 'Por partes: 23 es 20 y 3', { desde: 11, hasta: 25, modo: 'doble' }],
        ['Mitades hasta 50', 'La mitad de 36', { desde: 11, hasta: 25, modo: 'mitad' }],
        ['Dobles hasta 50', 'El doble de 37', { desde: 26, hasta: 50, modo: 'doble' }],
        ['Desafío', 'Dobles y mitades hasta 50', { desde: 11, hasta: 50, modo: 'mezcla' }, 'desafio'],
        ['Mitades hasta 100', 'La mitad de 84', { desde: 26, hasta: 50, modo: 'mitad' }],
        ['Gran desafío', 'Dobles y mitades', { desde: 1, hasta: 50, modo: 'mezcla' }, 'desafio']
      ]);
    },
    preguntas: function (sel) {
      // el mapa pide un rango suelto (o números justos); el modo libre, chicos o grandes
      var hasta = sel.hasta || deLista(TAMANOS, sel.tamano).hasta;
      var desde = sel.desde || (hasta === 10 ? 1 : 11);
      var modo = sel.modo || 'mezcla';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var m = modo === 'mezcla' ? (Math.random() < 0.5 ? 'doble' : 'mitad') : modo;
        var base = sel.bases ? Util.alAzar(sel.bases) : entero(desde, hasta);
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
        fallo: function (it, r) {
          if (it.modo === 'mitad' && r === it.n * 2) return 'Ese es el doble, y acá es la mitad.';
          return 'No es ' + r + '.';
        },
        pista: function (it, intento) {
          if (it.modo === 'doble') {
            if (intento === 1 || it.n < 10) return 'El doble es el mismo número dos veces: ' + it.n + ' + ' + it.n + '.';
            var d = decenas(it.n) * 10, u = unidades(it.n);
            return 'Por partes: el doble de ' + d + ' es ' + d * 2 + ', y el de ' + u + ' es ' + u * 2 + '.';
          }
          return intento === 1
            ? 'La mitad es repartir ' + it.n + ' en dos partes iguales.'
            : '¿Qué número, sumado dos veces, da ' + it.n + '?';
        },
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
    edadMax: 9,

    opciones: function () {
      return [{ id: 'largo', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: LARGOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(LARGOS, sel.largo).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) { return { largo: edad && edad >= 9 ? 'cuatro' : 'tres' }; },
    /* Un lugar a la vez: en 352 primero se pregunta sólo por el 3 (vale
       300), después sólo por el 5, y recién ahí por cualquiera. Cuando
       se preguntan todos juntos de entrada, se contesta mirando el largo
       del número y no el lugar de la cifra. */
    mapa: function () {
      return mapaDe(POSICION, [
        ['Dos cifras: la decena', 'En 47, el 4 vale 40', { cifras: 2, lugares: ['d'] }],
        ['Dos cifras', 'Decenas y unidades', { cifras: 2 }],
        ['Tres cifras: la centena', 'En 352, el 3 vale 300', { cifras: 3, lugares: ['c'] }],
        ['Tres cifras: la decena', 'En 352, el 5 vale 50', { cifras: 3, lugares: ['d'] }],
        ['Desafío', 'Dos y tres cifras', { cifras: 3 }, 'desafio'],
        ['Tres cifras', 'Cualquier lugar', { cifras: 3 }],
        ['Cuatro cifras: el mil', 'En 4215, el 4 vale 4000', { cifras: 4, lugares: ['m'] }],
        ['Cuatro cifras: el medio', 'Centenas y decenas', { cifras: 4, lugares: ['c', 'd'] }],
        ['Cuatro cifras', 'Cualquier lugar', { cifras: 4 }],
        ['Gran desafío', 'Hasta 9999', { cifras: 4 }, 'desafio']
      ]);
    },
    preguntas: function (sel) {
      var cifras = sel.cifras || deLista(LARGOS, sel.largo).cifras;
      var NOMBRES_LUGAR = ['u', 'd', 'c', 'm'];       // de derecha a izquierda
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var numero = numeroSinRepetir(cifras);
        var texto = String(numero);
        // se pregunta por una cifra que no sea 0: el 0 no «vale» nada
        var lugares = [];
        for (var p = 0; p < texto.length; p++) {
          if (texto.charAt(p) === '0') continue;
          if (sel.lugares && sel.lugares.indexOf(NOMBRES_LUGAR[texto.length - 1 - p]) < 0) continue;
          lugares.push(p);
        }
        if (!lugares.length) { i--; continue; }   // justo un 0 donde se preguntaba: otro número
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
        pista: function (it, intento) {
          if (intento === 1) return 'Contá los lugares desde la derecha: unidades, decenas, centenas…';
          return 'El ' + it.cifra + ' está en el lugar de las ' + nombres[it.respuesta / it.cifra] + '.';
        },
        revelado: function (it) {
          var lugar = it.respuesta / it.cifra;
          return 'Vale ' + it.respuesta + ': está en el lugar de las ' + nombres[lugar] + '.';
        }
      });
    },
    deClave: function (resto) {
      var m = /^(\d{2,4}):(\d)$/.exec(resto);
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
    edadMax: 12,

    opciones: function () {
      var items = [];
      for (var t = 2; t <= 10; t++) {
        items.push({ id: String(t), nombre: 'Dividir por ' + t, icono: String(t), iconoNumero: true });
      }
      items.push({ id: 'mezcla', nombre: 'Todas mezcladas', icono: 'dado', detalle: 'Del 2 al 10' });
      return [{ id: 'divisor', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: items }];
    },
    /* El mismo orden que las tablas, porque dividir es la tabla al revés:
       el que ya sabe la del 5 puede dividir por 5. */
    mapa: function () {
      function por(d, detalle) { return ['Dividir por ' + d, detalle, { divisores: [d] }]; }
      return mapaDe(DIVISION, [
        por(2, 'La mitad'),
        por(10, 'Sacar el cero'),
        por(5, 'La tabla del 5 al revés'),
        por(3, 'Repartir entre tres'),
        ['Desafío', 'Por 2, 3, 5 y 10', { divisores: [2, 3, 5, 10] }, 'desafio'],
        por(4, 'La mitad de la mitad'),
        por(6, 'La tabla del 6 al revés'),
        por(7, 'La tabla del 7 al revés'),
        por(8, 'La tabla del 8 al revés'),
        ['Desafío', 'Del 2 al 10', { divisores: [2, 3, 4, 5, 6, 7, 8, 10] }, 'desafio'],
        por(9, 'La tabla del 9 al revés'),
        ['Las difíciles', 'Por 6, 7, 8 y 9', { divisores: [6, 7, 8, 9] }],
        ['Gran desafío', 'Todas las divisiones', { divisores: [2, 3, 4, 5, 6, 7, 8, 9, 10] }, 'desafio']
      ]);
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
      var divisores = sel.divisores;
      if (!divisores) {
        divisores = [];
        for (var k = desde; k <= hasta; k++) divisores.push(k);
      }
      var pozo = [];
      divisores.forEach(function (d) {
        for (var q = 1; q <= 10; q++) pozo.push(itemDivision(d * q, d));
      });
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
        pista: function (it, intento) {
          if (intento === 1) return '¿Qué número por ' + it.d + ' da ' + it.a + '?';
          return 'Recorré la tabla del ' + it.d + ': ' + it.d + ', ' + it.d * 2 + ', ' + it.d * 3 + '… hasta llegar a ' + it.a + '.';
        },
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
    edadMin: 7,
    edadMax: 12,

    opciones: function () {
      return [{ id: 'tipo', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: [
        { id: 'sumas', nombre: 'Sumar y restar', icono: 'cuentas', detalle: 'Juntar, regalar, comparar' },
        { id: 'todas', nombre: 'Las cuatro cuentas', icono: 'dado', detalle: 'También multiplicar y repartir' }
      ] }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return (sel.tipo === 'todas' ? 'Las cuatro cuentas' : 'Sumar y restar') + ' · ' + sel.cantidad + ' preguntas';
    },
    examen: function (comun, edad) { return { tipo: edad && edad >= 9 ? 'todas' : 'sumas' }; },
    /* Un tipo de cuento por nivel, y después mezclados. Lo difícil de un
       problema no es la cuenta sino darse cuenta de cuál es: por eso cada
       dos o tres niveles nuevos viene uno de «¿qué cuenta va?». */
    mapa: function () {
      var TODAS = [0, 1, 2, 3, 4, 5, 6];
      return mapaDe(PROBLEMAS, [
        ['Juntar', 'Le regalan más', { plantillas: [0] }],
        ['Quitar', 'Regaló algunas', { plantillas: [1] }],
        ['El total', 'Dos cajas', { plantillas: [2] }],
        ['¿Juntar o quitar?', '¿Qué cuenta va?', { plantillas: [0, 1, 2] }],
        ['Desafío', 'Juntar y quitar', { plantillas: [0, 1, 2] }, 'desafio'],
        ['¿Cuántos más?', 'Comparar dos cantidades', { plantillas: [3] }],
        ['Sumar o restar', 'Los cuatro cuentos', { plantillas: [0, 1, 2, 3] }],
        ['Grupos iguales', 'Paquetes y mesas: multiplicar', { plantillas: [4, 6] }],
        ['Repartir', 'En partes iguales: dividir', { plantillas: [5] }],
        ['Desafío', 'Las cuatro cuentas', { plantillas: TODAS }, 'desafio'],
        ['¿Multiplicar o repartir?', '¿Qué cuenta va?', { plantillas: [4, 5, 6] }],
        ['Gran desafío', 'Todos los cuentos', { plantillas: TODAS }, 'desafio']
      ]);
    },
    preguntas: function (sel) {
      var plantillas = sel.plantillas || (sel.tipo === 'todas' ? [0, 1, 2, 3, 4, 5, 6] : DE_SUMAR);
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
    edadMax: 12,

    opciones: function () {
      return [{ id: 'tipo', esNivel: true, titulo: 'Elegí el nivel', tipo: 'grilla', items: TIPOS_FRACCION }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) { return deLista(TIPOS_FRACCION, sel.tipo).nombre + ' · ' + sel.cantidad + ' preguntas'; },
    examen: function (comun, edad) { return { tipo: edad && edad >= 10 ? 'todas' : 'faciles', sinPesar: true }; },
    /* De a un tipo de parte: los medios y los cuartos juntos (el cuarto
       es la mitad de la mitad), después los tercios, y más adelante
       quintos, sextos y octavos. Los séptimos van últimos: no hay forma
       de «verlos» partiendo por la mitad, hay que contar. */
    mapa: function () {
      function en(dens) { return { denominadores: dens }; }
      return mapaDe(FRACCIONES, [
        ['Medios y cuartos', 'La mitad y la mitad de la mitad', en([2, 4])],
        ['Cuartos', '1/4, 2/4, 3/4', en([4])],
        ['Tercios', 'En tres partes', en([3])],
        ['Medios, tercios y cuartos', 'Contá las partes', en([2, 3, 4])],
        ['Desafío', 'En 2, 3 o 4 partes', en([2, 3, 4]), 'desafio'],
        ['Quintos', 'En cinco partes', en([5])],
        ['Sextos', 'En seis partes', en([6])],
        ['Octavos', 'En ocho partes', en([8])],
        ['Hasta octavos', 'Todo mezclado', en([2, 3, 4, 5, 6, 8])],
        ['Desafío', 'Hasta octavos', en([2, 3, 4, 5, 6, 8]), 'desafio'],
        ['Séptimos', 'Los que hay que contar', en([7, 8])],
        ['Gran desafío', 'Todas las fracciones', en([2, 3, 4, 5, 6, 7, 8]), 'desafio']
      ]);
    },
    preguntas: function (sel) {
      var hasta = sel.denominadores ? 0 : deLista(TIPOS_FRACCION, sel.tipo).hasta;
      var denominadores = sel.denominadores || [];
      for (var k = 2; k <= hasta; k++) denominadores.push(k);
      var pozo = [];
      denominadores.forEach(function (d) {
        for (var n = 1; n < d; n++) pozo.push(itemFraccion(n, d, Math.random() < 0.5 ? 'torta' : 'barra'));
      });
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

  // en el orden de las edades, que es como se muestran
  var JUEGOS = [CONTAR, FIGURAS_JUEGO, COMPARAR, CUENTAS, SERIE, RELOJ,
                DOBLES, POSICION, PROBLEMAS, TABLAS, DIVISION, FRACCIONES];
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
