/* ============================================================
   Materia: Ciencias.

   Diez juegos. Las edades salen de en qué año se enseña cada tema según
   el Diseño Curricular de la Provincia de Buenos Aires (2018):

     4–6    ¿Quién hace…?         «¡Muuu!» → 🐄           (Nivel Inicial)
     4–7    Mi cuerpo             ¿con qué olemos? → 👃   (Nivel Inicial)
     5–8    ¿Dónde vive?          el delfín → en el mar   (Inicial y 1.º)
     6–9    ¿Está vivo?           el árbol sí, la piedra no
     7–10   Las plantas           raíz, tallo, hojas      (1.º y 2.º; hay que leer frases)
     8–11   ¿Qué come?            herbívoros, carnívoros  («da ejemplos de…», 3.º)
     9–12   Clases de animales    el delfín es mamífero   (vertebrados, 4.º)
     9–12   El cuerpo por dentro  corazón, pulmones       (órganos en 3.º, sistemas en 5.º y 6.º)
    10–12   El agua y la materia  sólido, líquido, gas    (cambios de estado, 5.º)
    10–12   El sistema solar      los planetas y la Luna  (rotación y traslación, 5.º)

   Como en Lengua, son listas escritas a mano. Las malas de cada
   pregunta están elegidas para que no haya dos respuestas correctas:
   si la respuesta es «en el polo» para el pingüino, «en el mar» no
   puede salir, porque el pingüino también vive en el mar.

   A propósito hay preguntas con trampa, las que más enseñan: el delfín
   no es un pez, el tiburón sí; el robot se mueve y no está vivo;
   Venus es más caliente que Mercurio aunque esté más lejos del Sol.
   ============================================================ */
window.Ciencias = (function () {
  'use strict';

  var T = Tablero;

  /** Una respuesta que es una categoría, con una línea abajo que la explica. */
  function conPista(pistas) {
    return function (valor) {
      var caja = Util.crear('span', 'opcion-con-pista');
      caja.appendChild(Util.crear('span', 'opcion-valor', valor.charAt(0).toUpperCase() + valor.slice(1)));
      caja.appendChild(Util.crear('small', 'opcion-pista', pistas[valor]));
      return caja;
    };
  }

  /**
   * Un juego de pregunta y respuesta escrita, con las malas a mano. Cada
   * fila trae además una pista para pensar (sale al equivocarse) y un
   * dato que explica la respuesta (sale al acertar y al mostrar la que
   * era): antes, al errar sólo decía «¡Buen intento!», sin enseñar nada.
   *   [id, pregunta, respuesta, malas, pista, dato]
   */
  function cuestionario(def, filas) {
    return T.banco(Object.assign({
      items: filas.map(function (f) { return { id: f[0], p: f[1], r: f[2], m: f[3], pista: f[4], dato: f[5] }; }),
      forma: 'frase',
      consigna: function (it) { return it.p; },
      pista: function (it) { return it.pista || ''; },
      textoAcierto: function (it) { return it.dato || ''; },
      textoRevelado: function (it) { return 'Era «' + it.r + '».' + (it.dato ? ' ' + it.dato : ''); },
      repaso: function (it) { return { simbolo: def.simbolo, nombre: T.plano(it.p), dato: it.r }; }
    }, def));
  }

  /* ============================================================
     ¿Quién hace…?
     ============================================================ */
  var SONIDOS = [
    ['vaca', '🐄', 'la vaca', '¡Muuu!'],
    ['perro', '🐶', 'el perro', '¡Guau, guau!'],
    ['gato', '🐱', 'el gato', '¡Miau!'],
    ['oveja', '🐑', 'la oveja', '¡Beee!'],
    ['chancho', '🐷', 'el chancho', '¡Oink, oink!'],
    ['gallo', '🐓', 'el gallo', '¡Quiquiriquí!'],
    ['pato', '🦆', 'el pato', '¡Cuac, cuac!'],
    ['rana', '🐸', 'la rana', '¡Croac!'],
    ['leon', '🦁', 'el león', '¡Roaaar!'],
    ['caballo', '🐴', 'el caballo', '¡Hiiiii!'],
    ['abeja', '🐝', 'la abeja', '¡Bzzz!'],
    ['vibora', '🐍', 'la víbora', '¡Sssss!'],
    ['buho', '🦉', 'el búho', '¡Uh, uh!'],
    ['lobo', '🐺', 'el lobo', '¡Auuuu!'],
    ['pajaro', '🐦', 'el pajarito', '¡Pío, pío!']
  ];
  var NOMBRE_DE = {}, RUIDO_DE = {};
  SONIDOS.forEach(function (s) { NOMBRE_DE[s[1]] = s[2]; RUIDO_DE[s[1]] = s[3]; });

  function mayuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var QUIEN_HACE = T.banco({
    id: 'sonidos',
    nombre: '¿Quién hace…?',
    icono: 'sonidos',
    color: '#ea580c',
    suave: '#ffedd5',
    texto: 'Los ruidos de los animales',
    edadMin: 4,
    edadMax: 6,
    niveles: [
      { nombre: 'Los de la granja', filtro: function (it) { return ['vaca', 'perro', 'gato', 'oveja', 'chancho', 'gallo', 'pato', 'caballo'].indexOf(it.id.split(':')[1]) >= 0; } },
      { nombre: 'Todos los animales' }
    ],
    items: SONIDOS.map(function (s) { return { id: s[0], r: s[1], quien: s[2], sonido: s[3] }; }),
    forma: 'emoji',
    etiqueta: function (v) { return NOMBRE_DE[v] || v; },
    consigna: function (it) { return '¿Quién hace <b>«' + it.sonido + '»</b>?'; },
    // lo que hace el que eligió: se equivocó, pero aprendió otro ruido
    textoFallo: function (it, r) {
      return NOMBRE_DE[r] ? mayuscula(NOMBRE_DE[r]) + ' hace «' + RUIDO_DE[r] + '».' : '';
    },
    textoRevelado: function (it) { return mayuscula(it.quien) + ' hace «' + it.sonido + '».'; },
    textoAcierto: function (it) { return mayuscula(it.quien) + ' hace «' + it.sonido + '».'; },
    repaso: function (it) { return { simbolo: it.r, nombre: mayuscula(it.quien), dato: 'Hace «' + it.sonido + '»' }; }
  });

  /* ============================================================
     Mi cuerpo
     ============================================================ */
  var CUERPO = [
    ['olemos', '¿Con qué <b>olemos</b>?', '👃', 'la nariz'],
    ['vemos', '¿Con qué <b>vemos</b>?', '👀', 'los ojos'],
    ['escuchamos', '¿Con qué <b>escuchamos</b>?', '👂', 'las orejas'],
    ['gusto', '¿Con qué sentimos el <b>gusto</b> de la comida?', '👅', 'la lengua'],
    ['beso', '¿Con qué damos un <b>beso</b>?', '👄', 'la boca'],
    ['agarramos', '¿Con qué <b>agarramos</b> las cosas?', '✋', 'la mano'],
    ['caminamos', '¿Con qué <b>caminamos</b>?', '🦶', 'los pies'],
    ['pensamos', '¿Con qué <b>pensamos</b>?', '🧠', 'el cerebro'],
    ['masticamos', '¿Con qué <b>masticamos</b> la comida?', '🦷', 'los dientes'],
    ['late', '¿Qué <b>late</b> adentro del pecho?', '❤️', 'el corazón']
  ];
  var PARTE = {};
  CUERPO.forEach(function (c) { PARTE[c[2]] = c[3]; });
  /* La boca, la lengua y los dientes están todos en la boca: si la
     pregunta es por el gusto, la boca no puede salir como mala. */
  var LA_BOCA = ['👄', '👅', '🦷'];

  var MI_CUERPO = T.banco({
    id: 'cuerpo',
    nombre: 'Mi cuerpo',
    icono: 'cuerpo',
    color: '#db2777',
    suave: '#fce7f3',
    texto: 'Para qué sirve cada parte',
    edadMin: 4,
    edadMax: 7,
    niveles: [
      { nombre: 'La cara', filtro: function (it) { return ['olemos', 'vemos', 'escuchamos', 'gusto', 'beso', 'masticamos'].indexOf(it.id.split(':')[1]) >= 0; } },
      { nombre: 'Todo el cuerpo' }
    ],
    items: CUERPO.map(function (c) { return { id: c[0], p: c[1], r: c[2] }; }),
    forma: 'emoji',
    etiqueta: function (v) { return PARTE[v] || v; },
    excluir: function (it) { return LA_BOCA.indexOf(it.r) >= 0 ? LA_BOCA : []; },
    consigna: function (it) { return it.p; },
    textoFallo: function (it, r) {
      var parte = PARTE[r];
      if (!parte) return '';
      return 'Pensá: ¿para qué ' + (/^(los|las) /.test(parte) ? 'sirven ' : 'sirve ') + parte + '?';
    },
    textoRevelado: function (it) { return '¡' + mayuscula(PARTE[it.r]) + '!'; },
    textoAcierto: function (it) { return mayuscula(PARTE[it.r]) + '.'; },
    repaso: function (it) { return { simbolo: it.r, nombre: T.plano(it.p), dato: mayuscula(PARTE[it.r]) }; }
  });

  /* ============================================================
     ¿Dónde vive?
     ============================================================ */
  var MAR = '🌊 En el mar', SELVA = '🌴 En la selva', GRANJA = '🚜 En la granja',
      POLO = '🧊 En el polo', DESIERTO = '🏜️ En el desierto';
  var HABITATS = [
    ['delfin', '🐬', 'el delfín', MAR], ['tiburon', '🦈', 'el tiburón', MAR],
    ['pulpo', '🐙', 'el pulpo', MAR], ['ballena', '🐳', 'la ballena', MAR],
    ['cangrejo', '🦀', 'el cangrejo', MAR],
    ['mono', '🐒', 'el mono', SELVA], ['loro', '🦜', 'el loro', SELVA],
    ['tigre', '🐯', 'el tigre', SELVA], ['perezoso', '🦥', 'el perezoso', SELVA],
    ['yaguarete', '🐆', 'el yaguareté', SELVA],
    ['vaca', '🐄', 'la vaca', GRANJA], ['chancho', '🐷', 'el chancho', GRANJA],
    ['gallina', '🐔', 'la gallina', GRANJA], ['oveja', '🐑', 'la oveja', GRANJA],
    ['caballo', '🐴', 'el caballo', GRANJA],
    ['pinguino', '🐧', 'el pingüino', POLO], ['foca', '🦭', 'la foca', POLO],
    ['camello', '🐪', 'el camello', DESIERTO], ['escorpion', '🦂', 'el escorpión', DESIERTO]
  ];

  /** «🌊 En el mar» → «en el mar» */
  function lugarDe(r) { return r.replace(/^\S+ /, '').toLowerCase(); }

  var DONDE_VIVE = T.banco({
    id: 'habitat',
    nombre: '¿Dónde vive?',
    icono: 'habitat',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Mar, selva, granja, polo, desierto',
    edadMin: 5,
    edadMax: 8,
    niveles: [
      { nombre: 'El mar y la selva', filtro: function (it) { return /mar|selva/.test(it.r); } },
      { nombre: 'También la granja', filtro: function (it) { return /mar|selva|granja/.test(it.r); } },
      { nombre: 'Todos los lugares' }
    ],
    items: HABITATS.map(function (h) { return { id: h[0], emoji: h[1], quien: h[2], r: h[3] }; }),
    categorias: [MAR, SELVA, GRANJA, POLO, DESIERTO],
    // el pingüino y la foca también viven en el mar: esa no puede ser «mala»
    excluir: function (it) { return it.r === POLO ? [MAR] : []; },
    forma: 'palabra',
    consigna: function (it) { return '¿Dónde vive <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    textoFallo: function (it, r) {
      var otros = HABITATS.filter(function (h) { return h[3] === r && h[2] !== it.quien; })
        .map(function (h) { return h[2]; });
      if (!otros.length) return '';
      otros = Util.mezclar(otros).slice(0, 2);
      return mayuscula(r.replace(/^\S+ /, '').toLowerCase()) + (otros.length > 1 ? ' viven ' : ' vive ') +
             otros.join(' y ') + '.';
    },
    textoRevelado: function (it) { return mayuscula(it.quien) + ' vive ' + lugarDe(it.r) + '.'; },
    textoAcierto: function (it) { return mayuscula(it.quien) + ' vive ' + lugarDe(it.r) + '.'; },
    alReves: {
      consigna: function (it) { return '¿Quién vive <b>' + lugarDe(it.r) + '</b>?'; },
      fallo: function (it, r, otro) { return mayuscula(otro.quien) + ' vive ' + lugarDe(r) + '.'; },
      // el pingüino y la foca también nadan en el mar: no pueden estar juntos con uno del mar
      excluir: function (it) { return it.r === MAR ? [POLO] : it.r === POLO ? [MAR] : []; },
      nombre: function (it) { return it.quien; }
    },
    repaso: function (it) { return { simbolo: it.emoji, nombre: mayuscula(it.quien), dato: 'Vive ' + lugarDe(it.r) }; }
  });

  /* ============================================================
     ¿Está vivo?
     ============================================================ */
  var VIVOS = [
    ['arbol', '🌳', 'el árbol'], ['perro', '🐶', 'el perro'], ['girasol', '🌻', 'el girasol'],
    ['pez', '🐟', 'el pez'], ['hongo', '🍄', 'el hongo'], ['oruga', '🐛', 'la oruga'],
    ['cactus', '🌵', 'el cactus'], ['pajaro', '🐦', 'el pájaro'], ['bebe', '👶', 'el bebé'],
    ['vaquita', '🐞', 'la vaquita de San Antonio']
  ];
  /* El robot y el osito son las trampas buenas: uno se mueve y el otro
     tiene cara, y ninguno está vivo. */
  var NO_VIVOS = [
    ['piedra', '🪨', 'la piedra'], ['auto', '🚗', 'el auto'], ['pelota', '⚽', 'la pelota'],
    ['casa', '🏠', 'la casa'], ['lapiz', '✏️', 'el lápiz'], ['agua', '💧', 'el agua'],
    ['sol', '☀️', 'el Sol'], ['globo', '🎈', 'el globo'], ['osito', '🧸', 'el osito de peluche'],
    ['robot', '🤖', 'el robot']
  ];
  var QUE_ES = {};
  VIVOS.concat(NO_VIVOS).forEach(function (x) { QUE_ES[x[1]] = x[2]; });

  var ESTA_VIVO = T.banco({
    id: 'vivos',
    nombre: '¿Está vivo?',
    icono: 'vivos',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Seres vivos y cosas',
    edadMin: 6,
    edadMax: 9,
    niveles: [
      { nombre: 'Los que están vivos', filtro: function (it) { return it.vivo; } },
      { nombre: 'También los que no' }
    ],
    items: VIVOS.map(function (v) {
      return { id: 'si-' + v[0], vivo: true, r: v[1], m: NO_VIVOS.map(function (n) { return n[1]; }) };
    }).concat(NO_VIVOS.map(function (n) {
      return { id: 'no-' + n[0], vivo: false, r: n[1], m: VIVOS.map(function (v) { return v[1]; }) };
    })),
    forma: 'emoji',
    etiqueta: function (v) { return QUE_ES[v] || v; },
    consigna: function (it) {
      return it.vivo ? '¿Cuál es un <b>ser vivo</b>?' : '¿Cuál <b>no</b> es un ser vivo?';
    },
    // «es un ser vivo» y no «está vivo»: «la piedra no está vivo» no concuerda
    textoFallo: function (it, r) {
      return mayuscula(QUE_ES[r]) + (it.vivo ? ' no es un ser vivo: no nace ni crece.' : ' sí es un ser vivo: nace y crece.');
    },
    textoRevelado: function (it) {
      return it.vivo
        ? mayuscula(QUE_ES[it.r]) + ' es un ser vivo: nace, crece, se alimenta y se reproduce.'
        : mayuscula(QUE_ES[it.r]) + ' no es un ser vivo: no nace, no crece ni se alimenta.';
    },
    textoAcierto: function (it) {
      return mayuscula(QUE_ES[it.r]) + (it.vivo ? ' es un ser vivo: nace y crece.' : ' no es un ser vivo.');
    },
    repaso: function (it) {
      return { simbolo: it.r, nombre: mayuscula(QUE_ES[it.r]), dato: it.vivo ? 'Es un ser vivo' : 'No es un ser vivo' };
    }
  });

  /* ============================================================
     Las plantas
     ============================================================ */
  var PLANTAS = cuestionario({
    id: 'plantas',
    nombre: 'Las plantas',
    icono: 'plantas',
    color: '#65a30d',
    suave: '#dcfce7',
    texto: 'Raíz, tallo, hojas, flor y fruto',
    edadMin: 7,
    edadMax: 10,
    niveles: [
      { nombre: 'Las partes de la planta', filtro: function (it) { return ['agua', 'sostiene', 'alimento', 'abejas', 'manzana', 'zanahoria', 'lechuga', 'tronco'].indexOf(it.id.split(':')[1]) >= 0; } },
      { nombre: 'Todo sobre las plantas' }
    ],
    simbolo: '🌱'
  }, [
    ['agua', '¿Por dónde toma el <b>agua</b> una planta?', 'Por la raíz', ['Por las hojas', 'Por la flor', 'Por el fruto'], 'Pensá en la parte que está bajo tierra.', 'La raíz está bajo tierra y chupa el agua.'],
    ['sostiene', '¿Qué parte <b>sostiene</b> a la planta y lleva el agua hacia arriba?', 'El tallo', ['La raíz', 'La flor', 'La semilla'], 'Es la parte larga que va de la raíz a las hojas.', 'El tallo sostiene la planta y sube el agua.'],
    ['alimento', '¿Qué parte fabrica el <b>alimento</b> de la planta con la luz del sol?', 'Las hojas', ['La raíz', 'El tallo', 'La semilla'], 'Es la parte verde que recibe la luz del sol.', 'Las hojas fabrican el alimento con la luz del sol.'],
    ['nace', '¿De dónde <b>nace</b> una planta nueva?', 'De una semilla', ['De una piedra', 'Del viento', 'De la luz'], 'Pensá en lo que hay adentro de una fruta.', 'De cada semilla puede nacer una planta nueva.'],
    ['necesita', '¿Qué <b>necesita</b> una planta para vivir?', 'Agua, luz y aire', ['Solo tierra', 'Solo agua', 'Oscuridad'], 'Es más de una cosa: pensá en lo que le das a una planta en una maceta.', 'Las plantas necesitan agua, luz y aire para vivir.'],
    ['abejas', '¿Qué parte de la planta atrae a las <b>abejas</b>?', 'La flor', ['La raíz', 'El tallo', 'La hoja'], 'Es la parte de colores, con perfume.', 'Las abejas van a las flores a buscar néctar.'],
    ['manzana', 'La <b>manzana</b> es… de la planta', 'El fruto', ['La raíz', 'La hoja', 'El tallo'], 'Adentro tiene semillas.', 'La manzana es el fruto: adentro guarda las semillas.'],
    ['zanahoria', 'La <b>zanahoria</b> que comemos es…', 'La raíz', ['El fruto', 'La flor', 'La hoja'], '¿La zanahoria crece arriba o bajo tierra?', 'La zanahoria crece bajo tierra: es una raíz.'],
    ['lechuga', 'La <b>lechuga</b> que comemos son…', 'Las hojas', ['La raíz', 'El fruto', 'Las semillas'], 'Es la parte verde y finita de la planta.', 'De la lechuga comemos las hojas.'],
    ['tronco', 'El <b>tronco</b> de un árbol es su…', 'Tallo', ['Raíz', 'Hoja', 'Fruto'], 'Es lo que sostiene al árbol, desde el piso hasta las ramas.', 'El tronco es el tallo de los árboles: grueso y duro.'],
    ['oxigeno', '¿Qué gas largan las plantas que nosotros necesitamos para <b>respirar</b>?', 'Oxígeno', ['Humo', 'Polvo', 'Dióxido de carbono'], 'Es el mismo gas que respiramos todos.', 'Las plantas largan oxígeno, que es lo que respiramos.'],
    ['germinar', '¿Cómo se dice cuando una semilla empieza a <b>crecer</b>?', 'Germinar', ['Florecer', 'Madurar', 'Podar'], 'Empieza con «ger»…', 'Cuando una semilla empieza a crecer, germina.'],
    ['cactus', 'Los <b>cactus</b> viven en lugares…', 'Secos, con poca lluvia', ['Muy mojados', 'Bajo el mar', 'Sin nada de luz'], '¿En los lugares donde hay cactus llueve mucho?', 'Los cactus guardan agua adentro para vivir donde casi no llueve.']
  ]);

  /* ============================================================
     ¿Qué come?
     ============================================================ */
  var DIETAS = [
    ['vaca', '🐄', 'la vaca', 'herbívoro'], ['oveja', '🐑', 'la oveja', 'herbívoro'],
    ['caballo', '🐴', 'el caballo', 'herbívoro'], ['jirafa', '🦒', 'la jirafa', 'herbívoro'],
    ['elefante', '🐘', 'el elefante', 'herbívoro'], ['conejo', '🐰', 'el conejo', 'herbívoro'],
    ['cebra', '🦓', 'la cebra', 'herbívoro'],
    ['leon', '🦁', 'el león', 'carnívoro'], ['tigre', '🐯', 'el tigre', 'carnívoro'],
    ['tiburon', '🦈', 'el tiburón', 'carnívoro'], ['lobo', '🐺', 'el lobo', 'carnívoro'],
    ['aguila', '🦅', 'el águila', 'carnívoro'], ['cocodrilo', '🐊', 'el cocodrilo', 'carnívoro'],
    ['oso', '🐻', 'el oso', 'omnívoro'], ['chancho', '🐷', 'el chancho', 'omnívoro'],
    ['gallina', '🐔', 'la gallina', 'omnívoro'], ['mono', '🐒', 'el mono', 'omnívoro'],
    ['raton', '🐭', 'el ratón', 'omnívoro'], ['personas', '🧒', 'las personas', 'omnívoro']
  ];
  var PISTAS_DIETA = { 'herbívoro': 'come plantas', 'carnívoro': 'come carne', 'omnívoro': 'come de todo' };

  var QUE_COME = T.banco({
    id: 'alimentacion',
    nombre: '¿Qué come?',
    icono: 'alimentacion',
    color: '#d97706',
    suave: '#fef3c7',
    texto: 'Herbívoros, carnívoros y omnívoros',
    edadMin: 8,
    edadMax: 11,
    niveles: [
      { nombre: 'Herbívoros y carnívoros', filtro: function (it) { return it.r !== 'omnívoro'; } },
      { nombre: 'Todos, con los omnívoros' }
    ],
    items: DIETAS.map(function (d) { return { id: d[0], emoji: d[1], quien: d[2], r: d[3] }; }),
    categorias: ['herbívoro', 'carnívoro', 'omnívoro'],
    cuantas: 3,
    forma: 'palabra',
    mostrar: conPista(PISTAS_DIETA),
    consigna: function (it) { return '¿Qué es <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    textoFallo: function (it) { return 'Pensá: ¿qué come ' + it.quien + '?'; },
    /* Dicho al revés para no tener que concordar: «la vaca es herbívora»
       pero «el león es carnívoro» y «el águila es carnívora», y eso
       habría que anotarlo animal por animal. */
    textoRevelado: function (it) {
      return 'Los que ' + PISTAS_DIETA[it.r].replace('come', 'comen') + ' son ' + it.r + 's, como ' + it.quien + '.';
    },
    // «las personas comen de todo», «el león come carne»
    textoAcierto: function (it) { return mayuscula(it.quien) + ' ' + comeDe(it.quien, it.r) + '.'; },
    alReves: {
      consigna: function (it) { return '¿Cuál <b>' + PISTAS_DIETA[it.r] + '</b>?'; },
      fallo: function (it, r, otro) { return mayuscula(otro.quien) + ' ' + comeDe(otro.quien, r) + '.'; },
      // el oso come carne y plantas: con «¿cuál come carne?» serían dos las buenas
      excluir: function (it) { return it.r === 'omnívoro' ? [] : ['omnívoro']; },
      nombre: function (it) { return it.quien; }
    },
    repaso: function (it) { return { simbolo: it.emoji, nombre: mayuscula(it.quien), dato: mayuscula(it.r) }; }
  });

  /** «come carne», o «comen de todo» si son varios (las personas). */
  function comeDe(quien, r) {
    var dice = PISTAS_DIETA[r];
    return /^(los|las) /.test(quien) ? dice.replace('come', 'comen') : dice;
  }

  /* ============================================================
     Clases de animales
     ============================================================ */
  var CLASES = [
    ['delfin', '🐬', 'el delfín', 'mamífero'], ['ballena', '🐳', 'la ballena', 'mamífero'],
    ['murcielago', '🦇', 'el murciélago', 'mamífero'], ['perro', '🐶', 'el perro', 'mamífero'],
    ['elefante', '🐘', 'el elefante', 'mamífero'],
    ['pinguino', '🐧', 'el pingüino', 'ave'], ['aguila', '🦅', 'el águila', 'ave'],
    ['gallina', '🐔', 'la gallina', 'ave'], ['buho', '🦉', 'el búho', 'ave'], ['loro', '🦜', 'el loro', 'ave'],
    ['tiburon', '🦈', 'el tiburón', 'pez'], ['payaso', '🐠', 'el pez payaso', 'pez'],
    ['globo', '🐡', 'el pez globo', 'pez'],
    ['tortuga', '🐢', 'la tortuga', 'reptil'], ['vibora', '🐍', 'la víbora', 'reptil'],
    ['cocodrilo', '🐊', 'el cocodrilo', 'reptil'], ['lagartija', '🦎', 'la lagartija', 'reptil'],
    ['rana', '🐸', 'la rana', 'anfibio'],
    ['abeja', '🐝', 'la abeja', 'insecto'], ['mariposa', '🦋', 'la mariposa', 'insecto'],
    ['vaquita', '🐞', 'la vaquita de San Antonio', 'insecto'], ['hormiga', '🐜', 'la hormiga', 'insecto']
  ];
  var PISTAS_CLASE = {
    'mamífero': 'de bebé toma leche',
    'ave': 'tiene plumas',
    'pez': 'respira con branquias',
    'reptil': 'tiene escamas',
    'anfibio': 'vive en el agua y en la tierra',
    'insecto': 'tiene seis patas'
  };

  var CLASES_ANIMALES = T.banco({
    id: 'animales',
    nombre: 'Clases de animales',
    icono: 'animales',
    color: '#7c3aed',
    suave: '#ede9fe',
    texto: 'Mamíferos, aves, peces…',
    edadMin: 9,
    edadMax: 12,
    niveles: [
      { nombre: 'Mamíferos y aves', filtro: function (it) { return it.r === 'mamífero' || it.r === 'ave'; } },
      { nombre: 'Con peces y reptiles', filtro: function (it) { return ['mamífero', 'ave', 'pez', 'reptil'].indexOf(it.r) >= 0; } },
      { nombre: 'Todas las clases' }
    ],
    items: CLASES.map(function (c) { return { id: c[0], emoji: c[1], quien: c[2], r: c[3] }; }),
    categorias: ['mamífero', 'ave', 'pez', 'reptil', 'anfibio', 'insecto'],
    forma: 'palabra',
    mostrar: conPista(PISTAS_CLASE),
    consigna: function (it) { return '¿Qué es <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    // «Un pez respira con branquias: ¿el delfín también?»
    textoFallo: function (it, r) {
      return PISTAS_CLASE[r] ? 'Un ' + r + ' ' + PISTAS_CLASE[r] + ': ¿' + it.quien + ' también?' : '';
    },
    textoRevelado: function (it) {
      // «un ave», como «un águila»: la a del principio lleva la fuerza
      return mayuscula(it.quien) + ' es un ' + it.r + ': ' + PISTAS_CLASE[it.r] + '.';
    },
    // «la gallina tiene plumas», «el delfín toma leche de bebé»
    textoAcierto: function (it) {
      return mayuscula(it.quien) + (it.r === 'mamífero' ? ' toma leche de bebé.' : ' ' + PISTAS_CLASE[it.r] + '.');
    },
    alReves: {
      consigna: function (it) { return '¿Cuál es un <b>' + it.r + '</b>?'; },
      fallo: function (it, r, otro) { return mayuscula(otro.quien) + ' es un ' + r + ': ' + PISTAS_CLASE[r] + '.'; },
      nombre: function (it) { return it.quien; }
    },
    repaso: function (it) { return { simbolo: it.emoji, nombre: mayuscula(it.quien), dato: mayuscula(it.r) }; }
  });

  /* ============================================================
     El agua y la materia
     ============================================================ */
  var MATERIA = cuestionario({
    id: 'materia',
    nombre: 'El agua y la materia',
    icono: 'materia',
    color: '#0284c7',
    suave: '#e0f2fe',
    texto: 'Sólido, líquido y gaseoso',
    edadMin: 10,
    edadMax: 12,
    niveles: [
      { nombre: 'Sólido, líquido y gas', filtro: function (it) { return ['Sólido', 'Líquido', 'Gaseoso', 'Gas'].indexOf(it.r) >= 0; } },
      { nombre: 'Los cambios de estado' }
    ],
    simbolo: '💧'
  }, [
    ['hielo', 'El <b>hielo</b> es agua en estado…', 'Sólido', ['Líquido', 'Gaseoso'], 'El hielo tiene su propia forma, y se puede agarrar.', 'El hielo es agua sólida: tiene su propia forma.'],
    ['vapor', 'El <b>vapor</b> que sale de la pava es agua en estado…', 'Gaseoso', ['Sólido', 'Líquido'], 'El vapor se escapa para arriba y no se puede agarrar.', 'El vapor es agua en estado gaseoso.'],
    ['canilla', 'El agua que sale de la <b>canilla</b> está en estado…', 'Líquido', ['Sólido', 'Gaseoso'], 'Toma la forma del vaso donde la pongas.', 'El agua de la canilla es líquida: toma la forma del recipiente.'],
    ['derrite', 'Cuando el hielo <b>se derrite</b>, se convierte en…', 'Agua líquida', ['Vapor', 'Más hielo'], 'Pensá en un cubito que se deja afuera de la heladera.', 'El hielo, al derretirse, vuelve a ser agua líquida.'],
    ['congela', '¿Cómo se llama cuando el agua se <b>convierte en hielo</b>?', 'Solidificación', ['Evaporación', 'Fusión', 'Condensación'], 'Se hace sólida: la palabra se parece a «sólido».', 'Cuando el agua se hace hielo, se solidifica.'],
    ['evapora', 'Cuando el agua se calienta y <b>se hace vapor</b>, se llama…', 'Evaporación', ['Fusión', 'Solidificación', 'Condensación'], 'Se hace vapor: la palabra se parece a «vapor».', 'Cuando el agua se hace vapor, se evapora.'],
    ['gotitas', 'Las <b>gotitas</b> que aparecen afuera de un vaso con agua fría vienen de…', 'El vapor que hay en el aire', ['El vidrio del vaso', 'El agua que se escapa del vaso', 'La lluvia'], 'El aire tiene agua que no se ve.', 'El vapor del aire se enfría al tocar el vaso y se hace gotitas: es la condensación.'],
    ['hierve', '¿A qué temperatura <b>hierve</b> el agua?', 'A 100 °C', ['A 0 °C', 'A 50 °C', 'A 200 °C'], 'Es un número redondo y grande.', 'El agua hierve a los 100 °C.'],
    ['congela-temp', '¿A qué temperatura se <b>congela</b> el agua?', 'A 0 °C', ['A 100 °C', 'A 10 °C', 'A 50 °C'], 'Es el número más chico de todos los que hay.', 'El agua se congela a los 0 °C.'],
    ['piedra', 'Una <b>piedra</b> es un…', 'Sólido', ['Líquido', 'Gas'], 'Tiene su propia forma y no se derrama.', 'La piedra es un sólido: tiene su propia forma.'],
    ['aire', 'El <b>aire</b> es un…', 'Gas', ['Sólido', 'Líquido'], 'No se ve y ocupa todo el lugar.', 'El aire es un gas: no se ve y ocupa todo el lugar.'],
    ['leche', 'La <b>leche</b> es un…', 'Líquido', ['Sólido', 'Gas'], 'Se sirve en un vaso, y si se vuelca se derrama.', 'La leche es un líquido: toma la forma del vaso.'],
    ['manteca', '¿Qué le pasa a la <b>manteca</b> si la dejás al sol?', 'Se derrite', ['Se congela', 'Se endurece', 'Se hace vapor'], 'Pensá en un helado al sol.', 'Con el calor, la manteca se derrite.'],
    ['nubes', 'Las <b>nubes</b> están hechas de…', 'Gotitas de agua', ['Humo', 'Algodón', 'Polvo'], 'Pensá de dónde sale la lluvia.', 'Las nubes son millones de gotitas de agua.']
  ]);

  /* ============================================================
     El cuerpo por dentro
     ============================================================ */
  var ORGANOS = cuestionario({
    id: 'organos',
    nombre: 'El cuerpo por dentro',
    icono: 'corazon',
    color: '#e11d48',
    suave: '#ffe4e6',
    texto: 'Corazón, pulmones, huesos…',
    edadMin: 9,
    edadMax: 12,
    niveles: [
      { nombre: 'Los más conocidos', hasta: 6 },
      { nombre: 'Todo el cuerpo por dentro' }
    ],
    simbolo: '🫀'
  }, [
    ['bombea', '¿Qué órgano <b>bombea la sangre</b> por todo el cuerpo?', 'El corazón', ['Los pulmones', 'El estómago', 'El cerebro'], 'Late todo el tiempo, y lo sentís en el pecho.', 'El corazón bombea la sangre a todo el cuerpo.'],
    ['respiramos', '¿Con qué órganos <b>respiramos</b>?', 'Los pulmones', ['El corazón', 'El hígado', 'Los riñones'], 'Se llenan de aire cuando respirás hondo.', 'Los pulmones se llenan de aire cuando respiramos.'],
    ['tragar', '¿Adónde va la comida después de <b>tragarla</b>?', 'Al estómago', ['A los pulmones', 'Al corazón', 'Al cerebro'], 'Es donde se junta la comida después de comer.', 'La comida baja al estómago, que la empieza a deshacer.'],
    ['manda', '¿Qué órgano <b>manda</b> sobre todo el cuerpo?', 'El cerebro', ['El corazón', 'El estómago', 'Los pulmones'], 'Está adentro de la cabeza.', 'El cerebro está en la cabeza y manda sobre todo el cuerpo.'],
    ['forma', '¿Qué sostiene el cuerpo y le da <b>forma</b>?', 'El esqueleto', ['Los músculos', 'La piel', 'La sangre'], 'Está hecho de huesos.', 'El esqueleto son todos los huesos juntos: sostiene el cuerpo.'],
    ['grande', '¿Cuál es el órgano <b>más grande</b> del cuerpo?', 'La piel', ['El hígado', 'El corazón', 'El cerebro'], 'Cubre todo el cuerpo, por afuera.', 'La piel es el órgano más grande: cubre todo el cuerpo.'],
    ['rinones', '¿Qué limpian los <b>riñones</b>?', 'La sangre', ['El aire', 'La comida', 'Los huesos'], 'Es lo que el corazón manda por todo el cuerpo.', 'Los riñones limpian la sangre y hacen el pis.'],
    ['mover', '¿Qué nos permite <b>mover</b> los huesos?', 'Los músculos', ['La piel', 'El pelo', 'Las uñas'], 'Se ponen duros cuando hacés fuerza.', 'Los músculos mueven los huesos.'],
    ['sangre', '¿Por dónde viaja la <b>sangre</b>?', 'Por las venas y las arterias', ['Por los huesos', 'Por el estómago', 'Por los nervios'], 'Son como caños finitos por todo el cuerpo.', 'La sangre viaja por las venas y las arterias.'],
    ['gas', '¿Qué gas del aire <b>necesita</b> el cuerpo?', 'El oxígeno', ['El dióxido de carbono', 'El humo', 'El helio'], 'Es el mismo gas que largan las plantas.', 'Respiramos para tomar el oxígeno del aire.'],
    ['huesos', '¿Cuántos <b>huesos</b> tiene una persona grande, más o menos?', 'Unos 200', ['Unos 20', 'Unos 1000', 'Unos 50'], 'Son muchos, pero no mil.', 'Una persona grande tiene unos 206 huesos.'],
    ['iris', '¿Cómo se llama la parte del ojo que tiene <b>color</b>?', 'El iris', ['La pupila', 'La pestaña', 'La ceja'], 'Se llama como una flor… y como el arcoíris.', 'El iris es la parte de color del ojo.'],
    ['leche', 'Cuando se caen los <b>dientes de leche</b>, salen…', 'Los dientes definitivos', ['Otros dientes de leche', 'Dientes postizos', 'Nada'], 'Son los que quedan para toda la vida.', 'Después de los de leche salen los definitivos, que son para siempre.']
  ]);

  /* ============================================================
     El sistema solar
     ============================================================ */
  var ESPACIO = cuestionario({
    id: 'espacio',
    nombre: 'El sistema solar',
    icono: 'espacio',
    color: '#4f46e5',
    suave: '#e0e7ff',
    texto: 'Los planetas, el Sol y la Luna',
    edadMin: 10,
    edadMax: 12,
    niveles: [
      { nombre: 'Los planetas', filtro: function (it) { return ['cerca', 'grande', 'anillos', 'rojo', 'cuantos', 'caliente', 'lejos', 'pluton'].indexOf(it.id.split(':')[1]) >= 0; } },
      { nombre: 'Todo el espacio' }
    ],
    simbolo: '🪐'
  }, [
    ['cerca', '¿Qué planeta está <b>más cerca</b> del Sol?', 'Mercurio', ['Venus', 'La Tierra', 'Marte'], 'Es el primero de la lista: «Mi Vieja Tía…».', 'Mercurio es el más cercano al Sol.'],
    ['grande', '¿Cuál es el planeta <b>más grande</b>?', 'Júpiter', ['Saturno', 'La Tierra', 'Neptuno'], 'Es un gigante de gas: el quinto planeta.', 'Júpiter es el más grande: adentro entrarían más de mil Tierras.'],
    // todos los gigantes tienen anillos, pero sólo los de Saturno se ven: las malas son planetas de roca
    ['anillos', '¿Qué planeta tiene unos <b>anillos</b> enormes que se ven con un telescopio?', 'Saturno', ['Marte', 'Mercurio', 'Venus'], 'Es el sexto planeta.', 'Los anillos de Saturno son de hielo y piedras.'],
    ['rojo', '¿A qué planeta le dicen <b>el planeta rojo</b>?', 'Marte', ['Júpiter', 'Venus', 'Neptuno'], 'Es el cuarto planeta, justo después de la Tierra.', 'Marte es rojo porque su suelo está oxidado.'],
    ['sol', '¿Qué es el <b>Sol</b>?', 'Una estrella', ['Un planeta', 'Una luna', 'Un cometa'], 'Brilla con luz propia, como las que se ven de noche.', 'El Sol es una estrella: la más cercana a nosotros.'],
    ['cuantos', '¿Cuántos <b>planetas</b> tiene el sistema solar?', '8', ['9', '7', '10'], 'Contá: Mercurio, Venus, Tierra, Marte…', 'Son 8: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.'],
    ['luna', '¿Qué es la <b>Luna</b>?', 'Un satélite de la Tierra', ['Un planeta', 'Una estrella', 'Un cometa'], 'Gira alrededor de la Tierra.', 'La Luna es un satélite: gira alrededor de la Tierra.'],
    ['anio', '¿Cuánto tarda la Tierra en dar <b>una vuelta alrededor del Sol</b>?', 'Un año', ['Un día', 'Un mes', 'Una semana'], 'Es mucho más que un mes.', 'La Tierra tarda un año en dar la vuelta al Sol.'],
    // la mala más tentadora es la otra vuelta de la Tierra: ésa hace los años, no los días
    ['dia', '¿Por qué hay <b>día y noche</b>?', 'Porque la Tierra gira sobre sí misma', ['Porque el Sol se apaga', 'Porque la Luna tapa al Sol', 'Porque la Tierra gira alrededor del Sol'], 'Pensá en una pelota que gira delante de una linterna.', 'La Tierra gira sobre sí misma: el lado que mira al Sol tiene día.'],
    // Mercurio está más cerca, pero Venus tiene una atmósfera que guarda el calor
    ['caliente', '¿Cuál es el planeta <b>más caliente</b>?', 'Venus', ['Mercurio', 'Marte', 'La Tierra'], 'No es el más cercano al Sol: tiene un aire espeso que guarda el calor.', 'Venus es el más caliente: su aire espeso guarda el calor.'],
    ['lejos', '¿Qué planeta está <b>más lejos</b> del Sol?', 'Neptuno', ['Urano', 'Saturno', 'Plutón'], 'Es el último de la lista: «…Usar Neptuno».', 'Neptuno es el más lejano. Plutón ya no se cuenta como planeta.'],
    ['pluton', '¿Qué es <b>Plutón</b> hoy?', 'Un planeta enano', ['Un planeta', 'Una estrella', 'Un satélite'], 'Antes era un planeta, pero es muy chiquito.', 'Plutón es un planeta enano: es muy chico para ser planeta.'],
    ['galaxia', '¿Cómo se llama nuestra <b>galaxia</b>?', 'La Vía Láctea', ['Andrómeda', 'La Osa Mayor', 'El Sistema Solar'], 'Se llama como algo que se toma en el desayuno.', 'Nuestra galaxia es la Vía Láctea.']
  ]);

  var JUEGOS = [QUIEN_HACE, MI_CUERPO, DONDE_VIVE, ESTA_VIVO, PLANTAS, QUE_COME,
                CLASES_ANIMALES, ORGANOS, MATERIA, ESPACIO];

  return T.materia('ciencias', JUEGOS);
})();
