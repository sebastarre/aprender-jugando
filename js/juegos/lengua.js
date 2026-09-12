/* ============================================================
   Materia: Lengua.

   Diez juegos. Las edades salen de en qué año se enseña cada tema según
   el Diseño Curricular de la Provincia de Buenos Aires (2018):

     4–6    La primera letra     🍎 → M          (Nivel Inicial)
     5–7    La vocal que falta   c_sa            (Inicial y 1.º)
     5–7    Rimas                gato → pato     (Inicial y Unidad Pedagógica)
     6–9    Contrarios           grande → chico  (hay que leer: 1.º)
     6–9    Sílabas              ma-ri-po-sa     (Unidad Pedagógica, 1.º y 2.º)
     8–11   Plurales             lápiz → lápices («-z/-ces», 3.º)
     8–12   Ortografía           vaca, vaka…     (mb, nv, reglas sin excepción: 3.º)
     8–12   Sinónimos            contento → feliz (3.º)
     9–12   Tildes               camión, camion… («reglas generales de acentuación», 4.º)
    10–12   Clases de palabras   correr → verbo  (sustantivo, adjetivo, verbo en 3.º;
                                                  con adverbio, más adelante)

   Todos son listas escritas a mano, no preguntas generadas: en lengua
   las respuestas no se calculan. Cada lista está revisada para que
   ninguna respuesta mala sea, por accidente, otra respuesta correcta:
   que ninguna «mala» rime, que ningún «mal escrito» sea una palabra que
   existe (baso, bazo y lave existen, por eso no están), que ninguna
   variante de tilde sea otra palabra (numero, papa, mama y dibujó
   existen, por eso tampoco están).
   ============================================================ */
window.Lengua = (function () {
  'use strict';

  var T = Tablero;

  /* ============================================================
     La primera letra
     ============================================================ */

  /* Letras que suenan igual o se confunden de oído. Si la respuesta es
     V, la B no puede salir como mala: un chico que todavía no lee
     escucha «vaca» y no tiene cómo saber cuál de las dos es. */
  var SE_CONFUNDEN = {
    B: ['V'], V: ['B'],
    C: ['K', 'Q', 'S', 'Z'], K: ['C', 'Q'], Q: ['C', 'K'],
    S: ['C', 'Z', 'X'], Z: ['S', 'C'],
    G: ['J'], J: ['G'],
    I: ['Y'], Y: ['I', 'LL']
  };

  var LETRAS = ['A', 'E', 'I', 'O', 'U', 'M', 'P', 'T', 'L', 'R', 'S', 'N', 'D', 'F', 'B', 'G', 'C', 'J', 'V', 'Z'];

  /* Sin palabras que empiecen con H (no suena), ni con CH o LL (son dos
     letras), ni dibujos que tengan dos nombres comunes (🐸 es rana o
     sapo). */
  var PRIMERA = [
    ['manzana', '🍎', 'M'], ['gato', '🐱', 'G'], ['perro', '🐶', 'P'], ['luna', '🌙', 'L'],
    ['sol', '☀️', 'S'], ['raton', '🐭', 'R'], ['arbol', '🌳', 'A'], ['elefante', '🐘', 'E'],
    ['ojo', '👁️', 'O'], ['uva', '🍇', 'U'], ['pato', '🦆', 'P'], ['tortuga', '🐢', 'T'],
    ['leon', '🦁', 'L'], ['oso', '🐻', 'O'], ['flor', '🌼', 'F'], ['banana', '🍌', 'B'],
    ['zanahoria', '🥕', 'Z'], ['mariposa', '🦋', 'M'], ['estrella', '⭐', 'E'], ['globo', '🎈', 'G'],
    ['abeja', '🐝', 'A'], ['queso', '🧀', 'Q'], ['corona', '👑', 'C'], ['auto', '🚗', 'A'],
    ['zorro', '🦊', 'Z'], ['vaca', '🐮', 'V'], ['jirafa', '🦒', 'J'], ['limon', '🍋', 'L'],
    ['caballo', '🐴', 'C'], ['tiburon', '🦈', 'T'], ['pulpo', '🐙', 'P'], ['delfin', '🐬', 'D'],
    ['regalo', '🎁', 'R'], ['arcoiris', '🌈', 'A'], ['sandia', '🍉', 'S'], ['unicornio', '🦄', 'U'],
    ['tambor', '🥁', 'T'], ['ballena', '🐳', 'B'], ['silla', '🪑', 'S'], ['media', '🧦', 'M']
  ];

  var NOMBRES_PRIMERA = {
    raton: 'ratón', arbol: 'árbol', leon: 'león', limon: 'limón', tiburon: 'tiburón',
    delfin: 'delfín', arcoiris: 'arcoíris', sandia: 'sandía'
  };

  function escrita(id) { return NOMBRES_PRIMERA[id] || id; }

  var PRIMERA_LETRA = T.banco({
    id: 'letras',
    nombre: 'La primera letra',
    icono: 'letras',
    color: '#ea580c',
    suave: '#ffedd5',
    texto: '¿Con qué letra empieza?',
    edadMin: 4,
    edadMax: 6,
    niveles: [
      { nombre: 'Las vocales y las primeras letras', filtro: function (it) { return 'AEIOUMPLS'.indexOf(it.r) >= 0; } },
      { nombre: 'Unas cuantas más', filtro: function (it) { return 'AEIOUMPLSTRDFBGC'.indexOf(it.r) >= 0; } },
      { nombre: 'Todas las letras' }
    ],
    items: PRIMERA.map(function (x) { return { id: x[0], emoji: x[1], r: x[2] }; }),
    categorias: LETRAS,
    excluir: function (it) { return SE_CONFUNDEN[it.r] || []; },
    consigna: function () { return '¿Con qué letra empieza?'; },
    visual: function (it) {
      return '<div class="visual-emoji" role="img" aria-label="' + escrita(it.id.split(':')[1]) + '">' + it.emoji + '</div>';
    },
    textoFallo: function (it, r) { return 'No empieza con ' + r + '.'; },
    textoRevelado: function (it) {
      var p = escrita(it.id.split(':')[1]);
      return '«' + p.charAt(0).toUpperCase() + p.slice(1) + '» empieza con ' + it.r + '.';
    },
    repaso: function (it) {
      return { simbolo: it.emoji, nombre: escrita(it.id.split(':')[1]), dato: 'Empieza con ' + it.r };
    }
  });

  /* ============================================================
     La vocal que falta
     ============================================================ */

  /* [palabra, dibujo, lugar del hueco]. El hueco nunca cae en una vocal
     con tilde (sería una sexta respuesta posible) y el dibujo decide
     cuando la palabra con otra vocal también existe: «c_sa» puede ser
     casa o cosa, pero al lado hay una casa. */
  var VOCALES = [
    ['casa', '🏠', 1], ['pato', '🦆', 1], ['luna', '🌙', 1], ['sol', '☀️', 1],
    ['ratón', '🐭', 1], ['pez', '🐟', 1], ['uva', '🍇', 0], ['oso', '🐻', 0],
    ['león', '🦁', 1], ['gato', '🐱', 1], ['perro', '🐶', 1], ['manzana', '🍎', 1],
    ['árbol', '🌳', 3], ['tortuga', '🐢', 4], ['limón', '🍋', 1], ['mariposa', '🦋', 3],
    ['pizza', '🍕', 1], ['globo', '🎈', 2], ['corona', '👑', 1], ['leche', '🥛', 1],
    ['vaca', '🐮', 1], ['queso', '🧀', 2], ['zorro', '🦊', 1], ['banana', '🍌', 1],
    ['delfín', '🐬', 1], ['diente', '🦷', 1], ['sandía', '🍉', 1], ['regalo', '🎁', 1],
    ['camello', '🐪', 3], ['silla', '🪑', 1], ['tambor', '🥁', 1], ['tiburón', '🦈', 1],
    ['pulpo', '🐙', 1]
  ];

  /** «camión» → «camion». La ü también pierde los puntitos. */
  function sinTilde(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  var VOCAL_QUE_FALTA = T.banco({
    id: 'vocales',
    nombre: 'La vocal que falta',
    icono: 'vocales',
    color: '#db2777',
    suave: '#fce7f3',
    texto: 'Completá la palabra',
    edadMin: 5,
    edadMax: 7,
    niveles: [
      { nombre: 'Palabras cortas', filtro: function (it) { return it.palabra.length <= 4; } },
      { nombre: 'Todas las palabras' }
    ],
    items: VOCALES.map(function (x) {
      return { id: sinTilde(x[0]), palabra: x[0], emoji: x[1], hueco: x[2], r: x[0].charAt(x[2]) };
    }),
    categorias: ['a', 'e', 'i', 'o', 'u'],
    // una sola letra, para un chico de cinco: grande, como los números
    consigna: function () { return '¿Qué vocal falta?'; },
    visual: function (it) {
      var p = it.palabra;
      return '<div class="visual-con-palabra"><div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>' +
        '<div class="visual-palabra">' + p.slice(0, it.hueco) + '<span class="hueco">?</span>' +
        p.slice(it.hueco + 1) + '</div></div>';
    },
    textoFallo: function (it, r) { return 'Con «' + r + '» no se lee bien.'; },
    textoRevelado: function (it) { return 'Faltaba la «' + it.r + '»: ' + it.palabra + '.'; },
    repaso: function (it) {
      return { simbolo: it.emoji, nombre: it.palabra, dato: 'Faltaba la «' + it.r + '»' };
    }
  });

  /* ============================================================
     Rimas
     ============================================================ */

  /* Riman si suenan igual desde la vocal fuerte hasta el final. Las
     malas están elegidas para que ninguna rime con la palabra. */
  var RIMAS = [
    ['gato', 'pato', ['perro', 'luna', 'mesa']],
    ['sol', 'caracol', ['casa', 'mano', 'pelo']],
    ['luna', 'cuna', ['sapo', 'mesa', 'tren']],
    ['ratón', 'botón', ['silla', 'perro', 'luna']],
    ['casa', 'masa', ['perro', 'sol', 'mano']],
    ['flor', 'tambor', ['mesa', 'gato', 'luna']],
    ['mesa', 'fresa', ['gato', 'sol', 'tren']],
    ['pelo', 'cielo', ['mano', 'sol', 'casa']],
    ['mano', 'enano', ['pelo', 'luna', 'flor']],
    ['tren', 'sartén', ['gato', 'luna', 'casa']],
    ['oso', 'hermoso', ['gato', 'pan', 'luna']],
    ['pan', 'tucán', ['sol', 'mesa', 'perro']],
    ['queso', 'beso', ['gato', 'luna', 'flor']],
    ['vaca', 'hamaca', ['perro', 'sol', 'mesa']],
    ['limón', 'camión', ['gato', 'casa', 'luna']],
    ['perro', 'cerro', ['gato', 'luna', 'mano']],
    ['ola', 'cola', ['pan', 'mesa', 'tren']],
    ['rana', 'ventana', ['sol', 'pelo', 'perro']],
    ['foca', 'boca', ['gato', 'pan', 'sol']],
    ['nube', 'sube', ['mesa', 'pan', 'flor']],
    ['sapo', 'trapo', ['mesa', 'sol', 'luna']],
    ['tortuga', 'oruga', ['mesa', 'sol', 'pan']]
  ];

  var RIMAS_JUEGO = T.banco({
    id: 'rimas',
    nombre: 'Rimas',
    icono: 'rimas',
    color: '#7c3aed',
    suave: '#ede9fe',
    texto: 'Palabras que suenan igual',
    edadMin: 5,
    edadMax: 7,
    niveles: [
      { nombre: 'Las primeras rimas', hasta: 12 },
      { nombre: 'Todas las rimas' }
    ],
    items: RIMAS.map(function (x) { return { id: sinTilde(x[0]), palabra: x[0], r: x[1], m: x[2] }; }),
    forma: 'palabra',
    consigna: function (it) { return '¿Qué palabra rima con <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return '«' + r + '» no suena como «' + it.palabra + '».'; },
    textoRevelado: function (it) { return '«' + it.palabra + '» rima con «' + it.r + '».'; },
    repaso: function (it) { return { simbolo: '🎵', nombre: 'Rima con ' + it.palabra, dato: it.r }; }
  });

  /* ============================================================
     Contrarios
     ============================================================ */

  /* Las malas mezclan una palabra parecida (un sinónimo: «enorme» para
     «grande») con otras que no tienen nada que ver, para que haya que
     pensar qué quiere decir «contrario» y no sólo reconocer la palabra. */
  var CONTRARIOS = [
    ['grande', 'chico', ['enorme', 'alto', 'rojo']],
    ['alto', 'bajo', ['largo', 'grande', 'lindo']],
    ['día', 'noche', ['sol', 'tarde', 'mañana']],
    ['frío', 'caliente', ['helado', 'blanco', 'mojado']],
    ['rápido', 'lento', ['veloz', 'fuerte', 'corto']],
    ['arriba', 'abajo', ['encima', 'cerca', 'alto']],
    ['abierto', 'cerrado', ['roto', 'grande', 'nuevo']],
    ['lleno', 'vacío', ['repleto', 'grande', 'pesado']],
    ['feliz', 'triste', ['contento', 'alegre', 'cansado']],
    ['limpio', 'sucio', ['brillante', 'nuevo', 'lindo']],
    ['nuevo', 'viejo', ['moderno', 'lindo', 'grande']],
    ['mucho', 'poco', ['bastante', 'todo', 'más']],
    ['dulce', 'salado', ['rico', 'sabroso', 'suave']],
    ['pesado', 'liviano', ['grande', 'duro', 'lleno']],
    ['adentro', 'afuera', ['dentro', 'cerca', 'abajo']],
    ['claro', 'oscuro', ['blanco', 'brillante', 'limpio']],
    ['duro', 'blando', ['fuerte', 'pesado', 'frío']],
    ['cerca', 'lejos', ['pegado', 'adentro', 'arriba']],
    ['empezar', 'terminar', ['comenzar', 'seguir', 'jugar']],
    ['subir', 'bajar', ['trepar', 'saltar', 'correr']],
    ['ganar', 'perder', ['jugar', 'triunfar', 'correr']],
    ['entrar', 'salir', ['pasar', 'meterse', 'abrir']],
    ['mojado', 'seco', ['húmedo', 'frío', 'sucio']],
    ['fuerte', 'débil', ['forzudo', 'grande', 'duro']],
    ['temprano', 'tarde', ['pronto', 'antes', 'rápido']],
    ['largo', 'corto', ['extenso', 'alto', 'grande']],
    ['encender', 'apagar', ['prender', 'abrir', 'empezar']],
    ['sano', 'enfermo', ['fuerte', 'contento', 'limpio']],
    ['ruidoso', 'silencioso', ['fuerte', 'alegre', 'grande']],
    ['valiente', 'miedoso', ['fuerte', 'alto', 'contento']]
  ];

  var CONTRARIOS_JUEGO = T.banco({
    id: 'contrarios',
    nombre: 'Contrarios',
    icono: 'contrarios',
    color: '#0d9488',
    suave: '#ccfbf1',
    texto: 'Grande y chico, día y noche',
    edadMin: 6,
    edadMax: 9,
    niveles: [
      { nombre: 'Los más conocidos', hasta: 12 },
      { nombre: 'Todos los contrarios' }
    ],
    items: CONTRARIOS.map(function (x) { return { id: sinTilde(x[0]), palabra: x[0], r: x[1], m: x[2] }; }),
    forma: 'palabra',
    consigna: function (it) { return '¿Cuál es lo contrario de <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return '«' + r + '» no es lo contrario.'; },
    textoRevelado: function (it) { return 'Lo contrario de «' + it.palabra + '» es «' + it.r + '».'; },
    repaso: function (it) { return { simbolo: '↕️', nombre: 'Lo contrario de ' + it.palabra, dato: it.r }; }
  });

  /* ============================================================
     Sílabas
     ============================================================ */

  /* Cortadas como se enseña en la escuela: los diptongos van juntos
     (es-cue-la, di-no-sau-rio, mur-cié-la-go) y la LL, la RR y la CH
     no se separan. */
  var SILABAS = [
    'sol', 'pan', 'mar', 'flor', 'tren', 'luz', 'pez', 'sal', 'voz', 'gris',
    'ca-sa', 'pe-rro', 'me-sa', 'ga-to', 'lu-na', 'si-lla', 'nu-be', 'le-che',
    'li-bro', 'ár-bol', 'lá-piz', 'ti-gre', 'fre-sa', 'pla-ya', 'tam-bor', 'ra-tón',
    'pe-lo-ta', 'za-pa-to', 'man-za-na', 'ca-mi-sa', 'tor-tu-ga', 'ven-ta-na',
    'ca-ba-llo', 'co-ne-jo', 'pa-lo-ma', 'ga-lle-ta', 'es-cue-la', 'ji-ra-fa', 'cua-der-no',
    'ma-ri-po-sa', 'e-le-fan-te', 'bi-ci-cle-ta', 'ca-la-ba-za', 'cho-co-la-te',
    'co-co-dri-lo', 'te-lé-fo-no', 'mur-cié-la-go', 'di-no-sau-rio',
    'hi-po-pó-ta-mo', 'he-li-cóp-te-ro', 'com-pu-ta-do-ra', 're-fri-ge-ra-dor'
  ];

  var SILABAS_JUEGO = T.banco({
    id: 'silabas',
    nombre: 'Sílabas',
    icono: 'silabas',
    color: '#2563eb',
    suave: '#dbeafe',
    texto: 'Contá los golpes de voz',
    edadMin: 6,
    edadMax: 9,
    niveles: [
      { nombre: 'De una y de dos sílabas', filtro: function (it) { return it.r <= 2; } },
      { nombre: 'Hasta tres sílabas', filtro: function (it) { return it.r <= 3; } },
      { nombre: 'Todas, hasta cinco' }
    ],
    items: SILABAS.map(function (s) {
      var palabra = s.replace(/-/g, '');
      return { id: sinTilde(palabra), palabra: palabra, partes: s, r: s.split('-').length };
    }),
    categorias: [1, 2, 3, 4, 5],
    consigna: function (it) { return '¿Cuántas sílabas tiene <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return 'No son ' + r + '. Probá decirla aplaudiendo.'; },
    textoRevelado: function (it) {
      return 'Tiene ' + it.r + ': ' + it.partes.split('-').join(' · ') + '.';
    },
    repaso: function (it) {
      return { simbolo: '👏', nombre: it.palabra, dato: it.partes.split('-').join(' · ') };
    }
  });

  /* ============================================================
     Plurales
     ============================================================ */

  /* Las reglas de verdad: la z pasa a c (lápiz → lápices), la tilde se
     va o aparece (camión → camiones, joven → jóvenes), y algunas no
     cambian (el lunes, los lunes). Las malas son los errores reales:
     «lápizes», «camiónes», «jovenes». */
  var PLURALES = [
    ['lápiz', 'lápices', ['lápizes', 'lápizs', 'lapices']],
    ['pez', 'peces', ['pezes', 'pezs', 'peses']],
    ['luz', 'luces', ['luzes', 'luzs', 'luses']],
    ['voz', 'voces', ['vozes', 'vozs', 'boces']],
    ['nariz', 'narices', ['narizes', 'narizs', 'naríces']],
    ['cruz', 'cruces', ['cruzes', 'cruzs', 'cruses']],
    ['camión', 'camiones', ['camiónes', 'camións', 'camionez']],
    ['ratón', 'ratones', ['ratónes', 'ratóns', 'ratonez']],
    ['león', 'leones', ['leónes', 'leóns', 'leonez']],
    ['flor', 'flores', ['flors', 'floris', 'florez']],
    ['árbol', 'árboles', ['árbols', 'arboles', 'árbolez']],
    ['papel', 'papeles', ['papels', 'papelés', 'papelez']],
    ['reloj', 'relojes', ['relojs', 'relojez', 'relos']],
    ['mar', 'mares', ['mars', 'maris', 'marez']],
    ['tren', 'trenes', ['trens', 'trénes', 'trenez']],
    ['rey', 'reyes', ['reys', 'reies', 'reyez']],
    ['lunes', 'lunes', ['luneses', 'luness', 'lunés']],
    ['mamá', 'mamás', ['mamaes', 'mamases', 'mamáes']],
    ['sofá', 'sofás', ['sofaes', 'sofases', 'sofáses']],
    ['bebé', 'bebés', ['bebées', 'bebeses', 'bebéz']],
    ['examen', 'exámenes', ['examenes', 'exámens', 'examens']],
    ['joven', 'jóvenes', ['jovenes', 'jóvens', 'jovens']]
  ];

  var PLURALES_JUEGO = T.banco({
    id: 'plurales',
    nombre: 'Plurales',
    icono: 'plurales',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Uno, muchos',
    edadMin: 8,
    edadMax: 11,
    niveles: [
      { nombre: 'Los que terminan en -z', hasta: 6 },
      { nombre: 'Y los que suman -es', hasta: 15 },
      { nombre: 'Todos, con los difíciles' }
    ],
    items: PLURALES.map(function (x) { return { id: sinTilde(x[0]), palabra: x[0], r: x[1], m: x[2] }; }),
    forma: 'palabra',
    consigna: function (it) { return '¿Cuál es el plural de <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return '«' + r + '» no está bien escrito.'; },
    // no «un ...»: sería «un mamá», «un flor», «un luz»
    textoRevelado: function (it) { return 'El plural de «' + it.palabra + '» es «' + it.r + '».'; },
    repaso: function (it) { return { simbolo: '📚', nombre: 'El plural de ' + it.palabra, dato: it.r }; }
  });

  /* ============================================================
     Ortografía
     ============================================================ */

  /* Una palabra bien escrita y tres mal. Ninguna de las mal escritas es
     una palabra que exista: por eso no están «vaso» (baso y bazo
     existen), ni «llave» con «lave», ni «hielo» con «yelo», que la RAE
     también acepta. */
  var ORTOGRAFIA = [
    ['vaca', ['vaka', 'bacca', 'vacca']],
    ['ballena', ['vallena', 'ballenna', 'bayena']],
    ['hormiga', ['ormiga', 'hormija', 'ormija']],
    ['helado', ['elado', 'elao', 'jelado']],
    ['zapato', ['sapato', 'zapatto', 'sapatto']],
    ['cielo', ['sielo', 'zielo', 'cyelo']],
    ['lluvia', ['yuvia', 'lluvía', 'llubia']],
    ['llave', ['yave', 'llabe', 'yabe']],
    ['gente', ['jente', 'guente', 'gentte']],
    ['jirafa', ['girafa', 'jiraffa', 'hirafa']],
    ['guitarra', ['gitarra', 'guitara', 'gitara']],
    ['cereza', ['sereza', 'cerecha', 'zereza']],
    ['hueso', ['gueso', 'ueso', 'güeso']],
    ['abeja', ['aveja', 'abexa', 'abega']],
    ['bicicleta', ['vicicleta', 'bisicleta', 'bicicletta']],
    ['yogur', ['llogur', 'iogur', 'yogurr']],
    ['queso', ['keso', 'qeso', 'quesso']],
    ['cebolla', ['sebolla', 'ceboya', 'cevolla']],
    ['escoba', ['ezcoba', 'escova', 'excoba']],
    ['invierno', ['imvierno', 'inbierno', 'invierrno']],
    ['ambulancia', ['anbulancia', 'ambulansia', 'hambulancia']],
    ['caballo', ['cavallo', 'cabayo', 'kaballo']],
    ['gigante', ['jigante', 'gicante', 'gigantte']],
    ['zanahoria', ['sanahoria', 'zanaoria', 'zanahorya']]
  ];

  var ORTOGRAFIA_JUEGO = T.banco({
    id: 'ortografia',
    nombre: 'Ortografía',
    icono: 'ortografia',
    color: '#c2740a',
    suave: '#fef3c7',
    texto: 'B o V, C, S o Z, con H o sin H',
    edadMin: 8,
    edadMax: 12,
    niveles: [
      { nombre: 'Con B y con V', filtro: function (it) { return ['vaca', 'ballena', 'abeja', 'bicicleta', 'escoba', 'caballo'].indexOf(it.r) >= 0; } },
      { nombre: 'Con H, LL e Y', filtro: function (it) { return ['vaca', 'ballena', 'abeja', 'bicicleta', 'escoba', 'caballo', 'hormiga', 'helado', 'hueso', 'lluvia', 'llave', 'yogur'].indexOf(it.r) >= 0; } },
      { nombre: 'Todas las palabras' }
    ],
    items: ORTOGRAFIA.map(function (x) { return { id: x[0], r: x[0], m: x[1] }; }),
    forma: 'palabra',
    consigna: function () { return '¿Cuál está <b>bien escrita</b>?'; },
    textoFallo: function (it, r) { return '«' + r + '» tiene un error.'; },
    textoRevelado: function (it) { return 'Se escribe «' + it.r + '».'; },
    repaso: function (it) { return { simbolo: '✏️', nombre: 'Se escribe', dato: it.r }; }
  });

  /* ============================================================
     Sinónimos
     ============================================================ */
  var SINONIMOS = [
    ['contento', 'feliz', ['triste', 'enojado', 'cansado']],
    ['rápido', 'veloz', ['lento', 'pesado', 'tranquilo']],
    ['lindo', 'bonito', ['feo', 'sucio', 'viejo']],
    ['enojado', 'furioso', ['alegre', 'dormido', 'callado']],
    ['grande', 'enorme', ['chico', 'corto', 'bajo']],
    ['empezar', 'comenzar', ['terminar', 'parar', 'olvidar']],
    ['auto', 'coche', ['bicicleta', 'tren', 'avión']],
    ['mirar', 'observar', ['escuchar', 'dormir', 'correr']],
    ['hablar', 'conversar', ['callar', 'escribir', 'dormir']],
    ['ayudar', 'colaborar', ['molestar', 'esconder', 'perder']],
    ['asustado', 'miedoso', ['valiente', 'contento', 'tranquilo']],
    ['cansado', 'agotado', ['despierto', 'contento', 'rápido']],
    ['regalo', 'obsequio', ['juguete', 'fiesta', 'caja']],
    ['delgado', 'flaco', ['gordo', 'alto', 'fuerte']],
    ['difícil', 'complicado', ['fácil', 'rápido', 'lindo']],
    ['terminar', 'acabar', ['empezar', 'seguir', 'abrir']],
    ['tirar', 'lanzar', ['agarrar', 'guardar', 'atrapar']],
    ['barco', 'buque', ['avión', 'auto', 'tren']],
    ['rostro', 'cara', ['mano', 'pie', 'pelo']],
    ['alumno', 'estudiante', ['maestro', 'director', 'padre']],
    ['hermoso', 'bello', ['feo', 'grande', 'rápido']],
    ['tranquilo', 'calmado', ['nervioso', 'apurado', 'ruidoso']],
    ['caminar', 'andar', ['correr', 'saltar', 'nadar']],
    ['sencillo', 'fácil', ['difícil', 'largo', 'pesado']]
  ];

  var SINONIMOS_JUEGO = T.banco({
    id: 'sinonimos',
    nombre: 'Sinónimos',
    icono: 'sinonimos',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Palabras que dicen lo mismo',
    edadMin: 8,
    edadMax: 12,
    niveles: [
      { nombre: 'Los más usados', hasta: 12 },
      { nombre: 'Todos los sinónimos' }
    ],
    items: SINONIMOS.map(function (x) { return { id: sinTilde(x[0]), palabra: x[0], r: x[1], m: x[2] }; }),
    forma: 'palabra',
    consigna: function (it) { return '¿Qué palabra significa lo mismo que <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return '«' + r + '» quiere decir otra cosa.'; },
    textoRevelado: function (it) { return '«' + it.palabra + '» y «' + it.r + '» son sinónimos.'; },
    repaso: function (it) { return { simbolo: '🟰', nombre: 'Lo mismo que ' + it.palabra, dato: it.r }; }
  });

  /* ============================================================
     Tildes
     ============================================================ */

  /* Las variantes mal escritas no se escriben a mano: se sacan de la
     palabra, quitándole la tilde o poniéndosela en otra vocal. Así son
     correctas por construcción y cubren los errores de verdad: «camion»
     (se olvidó), «cámion» (la puso donde no va), «exámen» (la puso en
     una palabra que no lleva).

     Ninguna palabra de la lista tiene una variante que exista con otro
     significado: «número» no está porque «numero» es un verbo, y «dibujo»
     tampoco, porque «dibujó» es el pasado de dibujar. */
  var TILDES = [
    'camión', 'árbol', 'lápiz', 'música', 'teléfono', 'lámpara', 'avión',
    'corazón', 'pájaro', 'azúcar', 'fácil', 'sábado', 'miércoles', 'película',
    'murciélago', 'jardín', 'canción', 'pantalón', 'brújula', 'plátano',
    'rápido', 'océano', 'tiburón', 'balcón',
    // y las que no llevan, para que la respuesta no sea siempre «la que tiene tilde»
    'examen', 'joven', 'reloj', 'feliz', 'resumen', 'cantar', 'pared', 'papel'
  ];

  var CON_TILDE = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };

  function variantesDeTilde(palabra) {
    var plana = sinTilde(palabra);
    var salida = {};
    if (plana !== palabra) salida[plana] = true;
    for (var i = 0; i < plana.length; i++) {
      var letra = plana.charAt(i);
      if (!CON_TILDE[letra]) continue;
      // la u de «que», «qui», «gue», «gui» no suena: la tilde ahí no engaña a nadie
      if (letra === 'u' && /[qg]/.test(plana.charAt(i - 1)) && /[ei]/.test(plana.charAt(i + 1))) continue;
      var variante = plana.slice(0, i) + CON_TILDE[letra] + plana.slice(i + 1);
      if (variante !== palabra) salida[variante] = true;
    }
    return Object.keys(salida);
  }

  var TILDES_JUEGO = T.banco({
    id: 'tildes',
    nombre: 'Tildes',
    icono: 'tildes',
    color: '#e11d48',
    suave: '#ffe4e6',
    texto: '¿Lleva tilde? ¿Dónde?',
    edadMin: 9,
    edadMax: 12,
    niveles: [
      { nombre: 'Las que llevan tilde', filtro: function (it) { return /[áéíóú]/.test(it.r); } },
      { nombre: 'Todas, con las que no llevan' }
    ],
    items: TILDES.map(function (p) { return { id: sinTilde(p), r: p, m: variantesDeTilde(p) }; }),
    forma: 'palabra',
    consigna: function () { return '¿Cuál está <b>bien escrita</b>? Fijate en la tilde.'; },
    textoFallo: function (it, r) { return '«' + r + '» tiene la tilde mal.'; },
    textoRevelado: function (it) {
      return it.r === sinTilde(it.r) ? '«' + it.r + '» no lleva tilde.' : 'Se escribe «' + it.r + '».';
    },
    repaso: function (it) { return { simbolo: '´', nombre: 'Se escribe', dato: it.r }; }
  });

  /* ============================================================
     Clases de palabras
     ============================================================ */

  /* Sólo palabras que son de una sola clase. Muchas no: «canto» es
     sustantivo y verbo, «dulce» es adjetivo y sustantivo, «bien» es
     adverbio y sustantivo, «redondo» es también un corte de carne. Los verbos van en infinitivo, que no se
     confunde con nada. */
  var CLASES = [
    ['correr', 'verbo'], ['saltar', 'verbo'], ['escribir', 'verbo'], ['dormir', 'verbo'],
    ['comer', 'verbo'], ['pintar', 'verbo'], ['nadar', 'verbo'], ['leer', 'verbo'],
    ['abrir', 'verbo'], ['construir', 'verbo'],
    ['mesa', 'sustantivo'], ['perro', 'sustantivo'], ['montaña', 'sustantivo'], ['libro', 'sustantivo'],
    ['ciudad', 'sustantivo'], ['zapato', 'sustantivo'], ['río', 'sustantivo'], ['maestra', 'sustantivo'],
    ['ventana', 'sustantivo'], ['amistad', 'sustantivo'],
    ['feliz', 'adjetivo'], ['enorme', 'adjetivo'], ['valiente', 'adjetivo'], ['suave', 'adjetivo'],
    ['peludo', 'adjetivo'], ['peligroso', 'adjetivo'], ['inteligente', 'adjetivo'], ['divertido', 'adjetivo'],
    ['amable', 'adjetivo'], ['delicioso', 'adjetivo'],
    ['rápidamente', 'adverbio'], ['siempre', 'adverbio'], ['nunca', 'adverbio'], ['aquí', 'adverbio'],
    ['ayer', 'adverbio'], ['despacio', 'adverbio'], ['lejos', 'adverbio'], ['suavemente', 'adverbio'],
    ['todavía', 'adverbio'], ['allá', 'adverbio']
  ];

  var PISTAS_CLASE = {
    sustantivo: 'nombra algo',
    adjetivo: 'dice cómo es',
    verbo: 'es una acción',
    adverbio: 'dice cómo, cuándo o dónde'
  };

  /** El nombre de la clase y, abajo, qué hace: sirve para aprender, no sólo para elegir. */
  function claseConPista(clase) {
    var caja = Util.crear('span', 'opcion-con-pista');
    caja.appendChild(Util.crear('span', 'opcion-valor', clase.charAt(0).toUpperCase() + clase.slice(1)));
    caja.appendChild(Util.crear('small', 'opcion-pista', PISTAS_CLASE[clase]));
    return caja;
  }

  var CLASES_JUEGO = T.banco({
    id: 'clases',
    nombre: 'Clases de palabras',
    icono: 'clases',
    color: '#4f46e5',
    suave: '#e0e7ff',
    texto: 'Sustantivo, adjetivo, verbo…',
    edadMin: 10,
    edadMax: 12,
    niveles: [
      { nombre: 'Verbos y sustantivos', filtro: function (it) { return it.r === 'verbo' || it.r === 'sustantivo'; } },
      { nombre: 'Con los adjetivos', filtro: function (it) { return it.r !== 'adverbio'; } },
      { nombre: 'Todas, con los adverbios' }
    ],
    items: CLASES.map(function (x) { return { id: sinTilde(x[0]), palabra: x[0], r: x[1] }; }),
    categorias: ['sustantivo', 'adjetivo', 'verbo', 'adverbio'],
    forma: 'palabra',
    mostrar: claseConPista,
    consigna: function (it) { return '¿Qué clase de palabra es <b>' + it.palabra + '</b>?'; },
    textoFallo: function (it, r) { return '«' + it.palabra + '» no es un ' + r + '.'; },
    textoRevelado: function (it) {
      return '«' + it.palabra + '» es un ' + it.r + ': ' + PISTAS_CLASE[it.r] + '.';
    },
    repaso: function (it) { return { simbolo: '🏷️', nombre: it.palabra, dato: 'Es un ' + it.r }; }
  });

  var JUEGOS = [PRIMERA_LETRA, VOCAL_QUE_FALTA, RIMAS_JUEGO, CONTRARIOS_JUEGO, SILABAS_JUEGO,
                PLURALES_JUEGO, ORTOGRAFIA_JUEGO, SINONIMOS_JUEGO, TILDES_JUEGO, CLASES_JUEGO];

  var modulo = T.materia('lengua', JUEGOS);
  /** Para las pruebas. */
  modulo.variantesDeTilde = variantesDeTilde;
  return modulo;
})();
