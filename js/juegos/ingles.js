/* ============================================================
   Materia: Inglés.

   Diez juegos, todos listas escritas a mano. Las edades siguen lo que
   se enseña en la escuela argentina: inglés arranca como vocabulario
   suelto y de a poco aparece la frase entera.

     4–6    Los colores         🟥 → red
     4–7    Los números         7 → seven
     5–7    Los animales        🐶 → dog
     5–8    La comida           🍎 → apple
     6–9    La familia          la madre → mother
     6–9    El cuerpo           la mano → hand
     7–10   La escuela          el lápiz → pencil
     8–11   Las acciones        correr → run
     8–12   Frases              Thank you → Gracias
    10–12   am, is, are         I ___ happy → am

   Cada lista está revisada para que ninguna respuesta mala sea, por
   accidente, otra respuesta correcta. Por eso no están las palabras
   que en castellano tienen dos traducciones igual de buenas (hablar es
   talk y speak, mirar es look y watch, mamá es mother y mom): con
   cuatro botones en la pantalla, una segunda respuesta correcta es un
   error del juego, no del chico.

   Las palabras en inglés van marcadas con lang="en" para que un lector
   de pantalla las pronuncie en inglés y no en castellano.
   ============================================================ */
window.Ingles = (function () {
  'use strict';

  var T = Tablero;

  /** Una palabra en inglés, marcada como tal. */
  function en(palabra) {
    var s = Util.crear('span', 'palabra-en', palabra);
    s.lang = 'en';
    return s;
  }

  /* Los juegos de vocabulario preguntan todos lo mismo, así que la
     consigna y los textos se escriben una sola vez. */
  function vocabulario(def) {
    return T.banco(Object.assign({
      forma: 'palabra',
      mostrar: en,
      consigna: function (it) { return '¿Cómo se dice <b>' + it.que + '</b>?'; },
      textoFallo: function () { return 'Esa no es.'; },
      textoRevelado: function (it) {
        return '<b>' + it.que + '</b> se dice <span lang="en">' + it.r + '</span>.';
      },
      repaso: function (it) {
        return { simbolo: it.emoji || '🔤', nombre: it.que, dato: 'En inglés: ' + it.r };
      }
    }, def));
  }

  /* ============================================================
     Los colores
     ============================================================ */
  var COLORES = [
    ['rojo', 'red', '#dc2626'], ['azul', 'blue', '#2563eb'],
    ['amarillo', 'yellow', '#eab308'], ['verde', 'green', '#16a34a'],
    ['naranja', 'orange', '#ea580c'], ['violeta', 'purple', '#7c3aed'],
    ['rosa', 'pink', '#ec4899'], ['marrón', 'brown', '#92400e'],
    ['negro', 'black', '#111827'], ['blanco', 'white', '#f8fafc']
  ];

  var COLORES_JUEGO = vocabulario({
    id: 'colores',
    nombre: 'Los colores',
    icono: 'personalizacion',
    color: '#db2777',
    suave: '#fce7f3',
    texto: 'Red, blue, yellow…',
    edadMin: 4,
    edadMax: 6,
    niveles: [
      { nombre: 'Los básicos', filtro: function (it) { return ['red', 'blue', 'yellow', 'green', 'black', 'white'].indexOf(it.r) >= 0; } },
      { nombre: 'Todos los colores' }
    ],
    items: COLORES.map(function (c) {
      return { id: c[1], que: c[0], r: c[1], tinta: c[2] };
    }),
    /* El color se muestra, no se escribe: un chico de cuatro todavía no
       lee «amarillo», pero el amarillo lo ve. */
    visual: function (it) {
      return '<div class="visual-color" role="img" aria-label="' + it.que +
             '" style="background:' + it.tinta + '"></div>';
    },
    consigna: function () { return '¿De qué color es?'; },
    textoRevelado: function (it) {
      return 'Ese color se dice <span lang="en">' + it.r + '</span>.';
    },
    repaso: function (it) {
      return { simbolo: '🎨', nombre: it.que, dato: 'En inglés: ' + it.r };
    }
  });

  /* ============================================================
     Los números
     ============================================================ */
  var NUMEROS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
                 'nine', 'ten', 'eleven', 'twelve'];

  var NUMEROS_JUEGO = vocabulario({
    id: 'numeros-en',
    nombre: 'Los números',
    icono: 'contar',
    color: '#2563eb',
    suave: '#dbeafe',
    texto: 'One, two, three…',
    edadMin: 4,
    edadMax: 7,
    niveles: [
      { nombre: 'Del one al five', filtro: function (it) { return +it.que <= 5; } },
      { nombre: 'Hasta el ten', filtro: function (it) { return +it.que <= 10; } },
      { nombre: 'Hasta el twelve' }
    ],
    items: NUMEROS.map(function (n, i) {
      return { id: String(i + 1), que: String(i + 1), r: n };
    }),
    visual: function (it) { return '<div class="numero-grande">' + it.que + '</div>'; },
    consigna: function () { return '¿Cómo se dice este número?'; },
    repaso: function (it) {
      return { simbolo: it.que, nombre: 'El ' + it.que, dato: 'En inglés: ' + it.r };
    }
  });

  /* ============================================================
     Los animales
     ============================================================ */
  /* Sin animales que en inglés tengan dos nombres de uso común (conejo
     es rabbit y bunny) ni dibujos que en castellano tengan dos nombres
     (🐸 es rana o sapo). */
  var ANIMALES = [
    ['el perro', 'dog', '🐶'], ['el gato', 'cat', '🐱'], ['el pájaro', 'bird', '🐦'],
    ['el pez', 'fish', '🐟'], ['el caballo', 'horse', '🐴'], ['la vaca', 'cow', '🐮'],
    ['el chancho', 'pig', '🐷'], ['la oveja', 'sheep', '🐑'], ['el ratón', 'mouse', '🐭'],
    ['el oso', 'bear', '🐻'], ['el león', 'lion', '🦁'], ['el elefante', 'elephant', '🐘'],
    ['la tortuga', 'turtle', '🐢'], ['el pato', 'duck', '🦆'], ['la abeja', 'bee', '🐝'],
    ['la mariposa', 'butterfly', '🦋'], ['la serpiente', 'snake', '🐍'],
    ['el pingüino', 'penguin', '🐧'], ['el mono', 'monkey', '🐵'], ['la araña', 'spider', '🕷️']
  ];

  var ANIMALES_JUEGO = vocabulario({
    id: 'animales-en',
    nombre: 'Los animales',
    icono: 'animales',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Dog, cat, bird…',
    edadMin: 5,
    edadMax: 7,
    niveles: [
      { nombre: 'Los de casa', filtro: function (it) { return ['dog', 'cat', 'bird', 'fish', 'mouse'].indexOf(it.r) >= 0; } },
      { nombre: 'Y los de la granja', filtro: function (it) { return ['dog', 'cat', 'bird', 'fish', 'mouse', 'horse', 'cow', 'pig', 'sheep', 'duck'].indexOf(it.r) >= 0; } },
      { nombre: 'Y los salvajes', filtro: function (it) { return ['bee', 'butterfly', 'spider'].indexOf(it.r) < 0; } },
      { nombre: 'Todos, con los bichos' }
    ],
    items: ANIMALES.map(function (a) {
      return { id: a[1], que: a[0], r: a[1], emoji: a[2] };
    }),
    visual: function (it) {
      return '<div class="visual-emoji" role="img" aria-label="' + it.que + '">' + it.emoji + '</div>';
    },
    consigna: function () { return '¿Cómo se dice este animal?'; }
  });

  /* ============================================================
     La comida
     ============================================================ */
  var COMIDA = [
    ['la manzana', 'apple', '🍎'], ['la banana', 'banana', '🍌'],
    ['la frutilla', 'strawberry', '🍓'], ['el pan', 'bread', '🍞'],
    ['el queso', 'cheese', '🧀'], ['la leche', 'milk', '🥛'],
    ['el agua', 'water', '💧'], ['el huevo', 'egg', '🥚'],
    ['el arroz', 'rice', '🍚'], ['la torta', 'cake', '🍰'],
    ['la galletita', 'cookie', '🍪'], ['la naranja', 'orange', '🍊'],
    ['la zanahoria', 'carrot', '🥕'], ['el tomate', 'tomato', '🍅'],
    ['la miel', 'honey', '🍯'], ['la sopa', 'soup', '🍲'],
    ['la ensalada', 'salad', '🥗'], ['el helado', 'ice cream', '🍨']
  ];

  var COMIDA_JUEGO = vocabulario({
    id: 'comida',
    nombre: 'La comida',
    icono: 'alimentacion',
    color: '#ea580c',
    suave: '#ffedd5',
    texto: 'Apple, bread, milk…',
    edadMin: 5,
    edadMax: 8,
    niveles: [
      { nombre: 'Las frutas', filtro: function (it) { return ['apple', 'banana', 'strawberry', 'orange'].indexOf(it.r) >= 0; } },
      { nombre: 'Lo de todos los días', filtro: function (it) { return ['apple', 'banana', 'strawberry', 'orange', 'bread', 'cheese', 'milk', 'water', 'egg', 'rice'].indexOf(it.r) >= 0; } },
      { nombre: 'Toda la comida' }
    ],
    items: COMIDA.map(function (c) {
      return { id: c[1].replace(' ', '-'), que: c[0], r: c[1], emoji: c[2] };
    }),
    visual: function (it) {
      return '<div class="visual-emoji" role="img" aria-label="' + it.que + '">' + it.emoji + '</div>';
    }
  });

  /* ============================================================
     La familia
     ============================================================ */
  /* «Mamá» es mother y mom, «papá» es father y dad: van con el nombre
     de parentesco para que la respuesta sea una sola. */
  var FAMILIA = [
    ['la madre', 'mother'], ['el padre', 'father'], ['el hermano', 'brother'],
    ['la hermana', 'sister'], ['la abuela', 'grandmother'], ['el abuelo', 'grandfather'],
    ['el hijo', 'son'], ['la hija', 'daughter'], ['el bebé', 'baby'],
    ['la familia', 'family'], ['el tío', 'uncle'], ['la tía', 'aunt'],
    ['el primo', 'cousin'], ['el amigo', 'friend']
  ];

  var FAMILIA_JUEGO = vocabulario({
    id: 'familia',
    nombre: 'La familia',
    icono: 'perfil',
    color: '#7c3aed',
    suave: '#ede9fe',
    texto: 'Mother, father, sister…',
    edadMin: 6,
    edadMax: 9,
    niveles: [
      { nombre: 'En casa', filtro: function (it) { return ['mother', 'father', 'brother', 'sister'].indexOf(it.r) >= 0; } },
      { nombre: 'Con los abuelos', filtro: function (it) { return ['uncle', 'aunt', 'cousin', 'friend'].indexOf(it.r) < 0; } },
      { nombre: 'Toda la familia' }
    ],
    items: FAMILIA.map(function (f) { return { id: f[1], que: f[0], r: f[1] }; })
  });

  /* ============================================================
     El cuerpo
     ============================================================ */
  var CUERPO = [
    ['la cabeza', 'head'], ['la mano', 'hand'], ['el pie', 'foot'],
    ['el ojo', 'eye'], ['la oreja', 'ear'], ['la nariz', 'nose'],
    ['la boca', 'mouth'], ['el pelo', 'hair'], ['el brazo', 'arm'],
    ['la pierna', 'leg'], ['el dedo', 'finger'], ['el diente', 'tooth'],
    ['la cara', 'face'], ['la rodilla', 'knee'], ['la lengua', 'tongue']
  ];

  var CUERPO_JUEGO = vocabulario({
    id: 'cuerpo-en',
    nombre: 'El cuerpo',
    icono: 'cuerpo',
    color: '#e11d48',
    suave: '#ffe4e6',
    texto: 'Head, hand, eye…',
    edadMin: 6,
    edadMax: 9,
    niveles: [
      { nombre: 'La cara', filtro: function (it) { return ['eye', 'ear', 'nose', 'mouth', 'face', 'hair', 'tongue', 'tooth'].indexOf(it.r) >= 0; } },
      { nombre: 'Todo el cuerpo' }
    ],
    items: CUERPO.map(function (c) { return { id: c[1], que: c[0], r: c[1] }; })
  });

  /* ============================================================
     La escuela
     ============================================================ */
  var ESCUELA = [
    ['el libro', 'book'], ['el lápiz', 'pencil'], ['la lapicera', 'pen'],
    ['la silla', 'chair'], ['la mesa', 'table'], ['la puerta', 'door'],
    ['la ventana', 'window'], ['la maestra', 'teacher'], ['la escuela', 'school'],
    ['la mochila', 'backpack'], ['el papel', 'paper'], ['la tijera', 'scissors'],
    ['la regla', 'ruler'], ['el cuaderno', 'notebook'], ['la goma', 'eraser'],
    ['el pizarrón', 'blackboard'], ['la clase', 'class']
  ];

  var ESCUELA_JUEGO = vocabulario({
    id: 'escuela',
    nombre: 'La escuela',
    icono: 'aprender',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Book, pencil, chair…',
    edadMin: 7,
    edadMax: 10,
    niveles: [
      { nombre: 'Los útiles', filtro: function (it) { return ['book', 'pencil', 'pen', 'notebook', 'eraser', 'backpack', 'paper', 'ruler', 'scissors'].indexOf(it.r) >= 0; } },
      { nombre: 'Toda la escuela' }
    ],
    items: ESCUELA.map(function (e) { return { id: e[1], que: e[0], r: e[1] }; })
  });

  /* ============================================================
     Las acciones
     ============================================================ */
  /* Sin los verbos que en inglés tienen dos traducciones de uso común:
     hablar (talk, speak), mirar (look, watch), agarrar (take, grab). */
  var ACCIONES = [
    ['correr', 'run'], ['comer', 'eat'], ['dormir', 'sleep'], ['tomar', 'drink'],
    ['jugar', 'play'], ['leer', 'read'], ['escribir', 'write'], ['cantar', 'sing'],
    ['bailar', 'dance'], ['saltar', 'jump'], ['caminar', 'walk'], ['nadar', 'swim'],
    ['ver', 'see'], ['abrir', 'open'], ['cerrar', 'close'], ['estudiar', 'study'],
    ['escuchar', 'listen'], ['comprar', 'buy'], ['volar', 'fly'], ['reír', 'laugh'],
    ['llorar', 'cry'], ['dibujar', 'draw']
  ];

  var ACCIONES_JUEGO = vocabulario({
    id: 'acciones',
    nombre: 'Las acciones',
    icono: 'jugar',
    color: '#c2740a',
    suave: '#fef3c7',
    texto: 'Run, eat, play…',
    edadMin: 8,
    edadMax: 11,
    niveles: [
      { nombre: 'Todos los días', filtro: function (it) { return ['run', 'eat', 'sleep', 'drink', 'play', 'walk'].indexOf(it.r) >= 0; } },
      { nombre: 'En la escuela', filtro: function (it) { return ['run', 'eat', 'sleep', 'drink', 'play', 'walk', 'read', 'write', 'study', 'draw', 'listen', 'see'].indexOf(it.r) >= 0; } },
      { nombre: 'Todas las acciones' }
    ],
    items: ACCIONES.map(function (a) { return { id: a[1], que: a[0], r: a[1] }; }),
    repaso: function (it) {
      return { simbolo: '🏃', nombre: it.que, dato: 'En inglés: ' + it.r };
    }
  });

  /* ============================================================
     Frases
     ============================================================ */
  var FRASES = [
    ['Good morning', 'Buen día'], ['Thank you', 'Gracias'],
    ['How are you?', '¿Cómo estás?'], ['What is your name?', '¿Cómo te llamás?'],
    ['See you later', 'Hasta luego'], ['I am sorry', 'Perdón'],
    ['You are welcome', 'De nada'], ['Please', 'Por favor'],
    ['Goodbye', 'Adiós'], ['Good night', 'Buenas noches'],
    ['Nice to meet you', 'Mucho gusto'], ['How old are you?', '¿Cuántos años tenés?'],
    ['Where are you from?', '¿De dónde sos?'], ['I do not know', 'No sé'],
    ['I am hungry', 'Tengo hambre'], ['Happy birthday', 'Feliz cumpleaños'],
    ['See you tomorrow', 'Hasta mañana'], ['My favourite colour', 'Mi color preferido']
  ];

  var FRASES_JUEGO = T.banco({
    id: 'frases',
    nombre: 'Frases',
    icono: 'saludo',
    color: '#4f46e5',
    suave: '#e0e7ff',
    texto: 'Thank you, good morning…',
    edadMin: 8,
    edadMax: 12,
    niveles: [
      { nombre: 'Saludos', filtro: function (it) { return ['Good morning', 'Good night', 'Goodbye', 'See you later', 'See you tomorrow', 'Nice to meet you'].indexOf(it.ingles) >= 0; } },
      { nombre: 'Ser amable', filtro: function (it) { return ['Good morning', 'Good night', 'Goodbye', 'See you later', 'See you tomorrow', 'Nice to meet you', 'Please', 'Thank you', 'You are welcome', 'I am sorry'].indexOf(it.ingles) >= 0; } },
      { nombre: 'Todas las frases' }
    ],
    items: FRASES.map(function (f) {
      return { id: f[0].toLowerCase().replace(/[^a-z]+/g, '-'), ingles: f[0], r: f[1] };
    }),
    forma: 'frase',
    consigna: function (it) {
      return '¿Qué quiere decir <b lang="en">' + it.ingles + '</b>?';
    },
    textoFallo: function () { return 'No quiere decir eso.'; },
    textoRevelado: function (it) {
      return '<span lang="en">' + it.ingles + '</span> quiere decir «' + it.r + '».';
    },
    repaso: function (it) {
      return { simbolo: '💬', nombre: it.ingles, dato: 'Quiere decir: ' + it.r };
    }
  });

  /* ============================================================
     am, is, are
     ============================================================ */
  var SER = [
    ['I ___ happy', 'am', 'Con <span lang="en">I</span> siempre va <span lang="en">am</span>.'],
    ['She ___ my sister', 'is', 'Con <span lang="en">she</span>, <span lang="en">he</span> y <span lang="en">it</span> va <span lang="en">is</span>.'],
    ['They ___ at school', 'are', 'Con <span lang="en">they</span> va <span lang="en">are</span>.'],
    ['We ___ friends', 'are', 'Con <span lang="en">we</span> va <span lang="en">are</span>.'],
    ['You ___ tall', 'are', 'Con <span lang="en">you</span> va <span lang="en">are</span>.'],
    ['He ___ eight years old', 'is', 'Con <span lang="en">he</span> va <span lang="en">is</span>.'],
    ['It ___ a dog', 'is', 'Con <span lang="en">it</span> va <span lang="en">is</span>.'],
    ['The cats ___ black', 'are', 'Son varios gatos, así que va <span lang="en">are</span>.'],
    ['My name ___ Ana', 'is', 'Es uno solo, así que va <span lang="en">is</span>.'],
    ['I ___ from Argentina', 'am', 'Con <span lang="en">I</span> siempre va <span lang="en">am</span>.'],
    ['My brothers ___ here', 'are', 'Son varios, así que va <span lang="en">are</span>.'],
    ['The dog ___ big', 'is', 'Es uno solo, así que va <span lang="en">is</span>.']
  ];

  var SER_JUEGO = T.banco({
    id: 'tobe',
    nombre: 'am, is, are',
    icono: 'clases',
    color: '#0f766e',
    suave: '#ccfbf1',
    texto: 'El verbo to be',
    edadMin: 10,
    edadMax: 12,
    niveles: [
      { nombre: 'am y is', filtro: function (it) { return it.r !== 'are'; } },
      { nombre: 'También are' }
    ],
    items: SER.map(function (s) {
      return { id: s[0].toLowerCase().replace(/[^a-z]+/g, '-'), frase: s[0], r: s[1], pista: s[2] };
    }),
    categorias: ['am', 'is', 'are'],
    cuantas: 3,
    forma: 'palabra',
    mostrar: en,
    consigna: function (it) {
      return '¿Qué falta?<br><span class="frase-en" lang="en">' +
             it.frase.replace('___', '<b class="hueco">___</b>') + '</span>';
    },
    textoFallo: function () { return 'Ahí no va esa.'; },
    textoRevelado: function (it) { return it.pista; },
    repaso: function (it) {
      return { simbolo: '🔤', nombre: it.frase.replace('___', it.r), dato: T.plano(it.pista) };
    }
  });

  var JUEGOS = [COLORES_JUEGO, NUMEROS_JUEGO, ANIMALES_JUEGO, COMIDA_JUEGO, FAMILIA_JUEGO,
                CUERPO_JUEGO, ESCUELA_JUEGO, ACCIONES_JUEGO, FRASES_JUEGO, SER_JUEGO];

  return T.materia('ingles', JUEGOS);
})();
