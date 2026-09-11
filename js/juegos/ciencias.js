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

  /** Un juego de pregunta y respuesta escrita, con las malas a mano. */
  function cuestionario(def, filas) {
    return T.banco(Object.assign({
      items: filas.map(function (f) { return { id: f[0], p: f[1], r: f[2], m: f[3] }; }),
      forma: 'frase',
      consigna: function (it) { return it.p; },
      textoFallo: function () { return 'No es esa.'; },
      textoRevelado: function (it) { return 'Era «' + it.r + '».'; },
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
  var NOMBRE_DE = {};
  SONIDOS.forEach(function (s) { NOMBRE_DE[s[1]] = s[2]; });

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
    items: SONIDOS.map(function (s) { return { id: s[0], r: s[1], quien: s[2], sonido: s[3] }; }),
    forma: 'emoji',
    etiqueta: function (v) { return NOMBRE_DE[v] || v; },
    consigna: function (it) { return '¿Quién hace <b>«' + it.sonido + '»</b>?'; },
    textoFallo: function (it, r) { return mayuscula(NOMBRE_DE[r] || 'Ése') + ' no hace así.'; },
    textoRevelado: function (it) { return mayuscula(it.quien) + ' hace «' + it.sonido + '».'; },
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
    items: CUERPO.map(function (c) { return { id: c[0], p: c[1], r: c[2] }; }),
    forma: 'emoji',
    etiqueta: function (v) { return PARTE[v] || v; },
    excluir: function (it) { return LA_BOCA.indexOf(it.r) >= 0 ? LA_BOCA : []; },
    consigna: function (it) { return it.p; },
    textoFallo: function (it, r) { return 'No, ' + (PARTE[r] || 'eso') + ' no.'; },
    textoRevelado: function (it) { return '¡' + mayuscula(PARTE[it.r]) + '!'; },
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

  var DONDE_VIVE = T.banco({
    id: 'habitat',
    nombre: '¿Dónde vive?',
    icono: 'habitat',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Mar, selva, granja, polo, desierto',
    edadMin: 5,
    edadMax: 8,
    items: HABITATS.map(function (h) { return { id: h[0], emoji: h[1], quien: h[2], r: h[3] }; }),
    categorias: [MAR, SELVA, GRANJA, POLO, DESIERTO],
    // el pingüino y la foca también viven en el mar: esa no puede ser «mala»
    excluir: function (it) { return it.r === POLO ? [MAR] : []; },
    forma: 'palabra',
    consigna: function (it) { return '¿Dónde vive <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    textoFallo: function () { return 'Ahí no vive.'; },
    textoRevelado: function (it) { return mayuscula(it.quien) + ' vive ' + it.r.replace(/^\S+ /, '').toLowerCase() + '.'; },
    repaso: function (it) { return { simbolo: it.emoji, nombre: mayuscula(it.quien), dato: 'Vive ' + it.r.replace(/^\S+ /, '').toLowerCase() }; }
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
      return mayuscula(QUE_ES[r]) + (it.vivo ? ' no es un ser vivo.' : ' sí es un ser vivo.');
    },
    textoRevelado: function (it) {
      return it.vivo
        ? mayuscula(QUE_ES[it.r]) + ' es un ser vivo: nace, crece, se alimenta y se reproduce.'
        : mayuscula(QUE_ES[it.r]) + ' no es un ser vivo: no nace, no crece ni se alimenta.';
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
    color: '#15803d',
    suave: '#dcfce7',
    texto: 'Raíz, tallo, hojas, flor y fruto',
    edadMin: 7,
    edadMax: 10,
    simbolo: '🌱'
  }, [
    ['agua', '¿Por dónde toma el <b>agua</b> una planta?', 'Por la raíz', ['Por las hojas', 'Por la flor', 'Por el fruto']],
    ['sostiene', '¿Qué parte <b>sostiene</b> a la planta y lleva el agua hacia arriba?', 'El tallo', ['La raíz', 'La flor', 'La semilla']],
    ['alimento', '¿Qué parte fabrica el <b>alimento</b> de la planta con la luz del sol?', 'Las hojas', ['La raíz', 'El tallo', 'La semilla']],
    ['nace', '¿De dónde <b>nace</b> una planta nueva?', 'De una semilla', ['De una piedra', 'Del viento', 'De la luz']],
    ['necesita', '¿Qué <b>necesita</b> una planta para vivir?', 'Agua, luz y aire', ['Solo tierra', 'Solo agua', 'Oscuridad']],
    ['abejas', '¿Qué parte de la planta atrae a las <b>abejas</b>?', 'La flor', ['La raíz', 'El tallo', 'La hoja']],
    ['manzana', 'La <b>manzana</b> es… de la planta', 'El fruto', ['La raíz', 'La hoja', 'El tallo']],
    ['zanahoria', 'La <b>zanahoria</b> que comemos es…', 'La raíz', ['El fruto', 'La flor', 'La hoja']],
    ['lechuga', 'La <b>lechuga</b> que comemos son…', 'Las hojas', ['La raíz', 'El fruto', 'Las semillas']],
    ['tronco', 'El <b>tronco</b> de un árbol es su…', 'Tallo', ['Raíz', 'Hoja', 'Fruto']],
    ['oxigeno', '¿Qué gas largan las plantas que nosotros necesitamos para <b>respirar</b>?', 'Oxígeno', ['Humo', 'Polvo', 'Dióxido de carbono']],
    ['germinar', '¿Cómo se dice cuando una semilla empieza a <b>crecer</b>?', 'Germinar', ['Florecer', 'Madurar', 'Podar']],
    ['cactus', 'Los <b>cactus</b> viven en lugares…', 'Secos, con poca lluvia', ['Muy mojados', 'Bajo el mar', 'Sin nada de luz']]
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
    color: '#c2740a',
    suave: '#fef3c7',
    texto: 'Herbívoros, carnívoros y omnívoros',
    edadMin: 8,
    edadMax: 11,
    items: DIETAS.map(function (d) { return { id: d[0], emoji: d[1], quien: d[2], r: d[3] }; }),
    categorias: ['herbívoro', 'carnívoro', 'omnívoro'],
    cuantas: 3,
    forma: 'palabra',
    mostrar: conPista(PISTAS_DIETA),
    consigna: function (it) { return '¿Qué es <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    textoFallo: function () { return 'No, pensá qué come.'; },
    /* Dicho al revés para no tener que concordar: «la vaca es herbívora»
       pero «el león es carnívoro» y «el águila es carnívora», y eso
       habría que anotarlo animal por animal. */
    textoRevelado: function (it) {
      return 'Los que ' + PISTAS_DIETA[it.r].replace('come', 'comen') + ' son ' + it.r + 's, como ' + it.quien + '.';
    },
    repaso: function (it) { return { simbolo: it.emoji, nombre: mayuscula(it.quien), dato: mayuscula(it.r) }; }
  });

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
    items: CLASES.map(function (c) { return { id: c[0], emoji: c[1], quien: c[2], r: c[3] }; }),
    categorias: ['mamífero', 'ave', 'pez', 'reptil', 'anfibio', 'insecto'],
    forma: 'palabra',
    mostrar: conPista(PISTAS_CLASE),
    consigna: function (it) { return '¿Qué es <b>' + it.quien + '</b>?'; },
    visual: function (it) { return '<div class="visual-emoji" aria-hidden="true">' + it.emoji + '</div>'; },
    textoFallo: function (it, r) { return 'No es un ' + r + '.'; },
    textoRevelado: function (it) {
      // «un ave», como «un águila»: la a del principio lleva la fuerza
      return mayuscula(it.quien) + ' es un ' + it.r + ': ' + PISTAS_CLASE[it.r] + '.';
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
    color: '#0369a1',
    suave: '#e0f2fe',
    texto: 'Sólido, líquido y gaseoso',
    edadMin: 10,
    edadMax: 12,
    simbolo: '💧'
  }, [
    ['hielo', 'El <b>hielo</b> es agua en estado…', 'Sólido', ['Líquido', 'Gaseoso']],
    ['vapor', 'El <b>vapor</b> que sale de la pava es agua en estado…', 'Gaseoso', ['Sólido', 'Líquido']],
    ['canilla', 'El agua que sale de la <b>canilla</b> está en estado…', 'Líquido', ['Sólido', 'Gaseoso']],
    ['derrite', 'Cuando el hielo <b>se derrite</b>, se convierte en…', 'Agua líquida', ['Vapor', 'Más hielo']],
    ['congela', '¿Cómo se llama cuando el agua se <b>convierte en hielo</b>?', 'Solidificación', ['Evaporación', 'Fusión', 'Condensación']],
    ['evapora', 'Cuando el agua se calienta y <b>se hace vapor</b>, se llama…', 'Evaporación', ['Fusión', 'Solidificación', 'Condensación']],
    ['gotitas', 'Las <b>gotitas</b> que aparecen afuera de un vaso con agua fría vienen de…', 'El vapor que hay en el aire', ['El vidrio del vaso', 'El agua que se escapa del vaso', 'La lluvia']],
    ['hierve', '¿A qué temperatura <b>hierve</b> el agua?', 'A 100 °C', ['A 0 °C', 'A 50 °C', 'A 200 °C']],
    ['congela-temp', '¿A qué temperatura se <b>congela</b> el agua?', 'A 0 °C', ['A 100 °C', 'A 10 °C', 'A 50 °C']],
    ['piedra', 'Una <b>piedra</b> es un…', 'Sólido', ['Líquido', 'Gas']],
    ['aire', 'El <b>aire</b> es un…', 'Gas', ['Sólido', 'Líquido']],
    ['leche', 'La <b>leche</b> es un…', 'Líquido', ['Sólido', 'Gas']],
    ['manteca', '¿Qué le pasa a la <b>manteca</b> si la dejás al sol?', 'Se derrite', ['Se congela', 'Se endurece', 'Se hace vapor']],
    ['nubes', 'Las <b>nubes</b> están hechas de…', 'Gotitas de agua', ['Humo', 'Algodón', 'Polvo']]
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
    simbolo: '🫀'
  }, [
    ['bombea', '¿Qué órgano <b>bombea la sangre</b> por todo el cuerpo?', 'El corazón', ['Los pulmones', 'El estómago', 'El cerebro']],
    ['respiramos', '¿Con qué órganos <b>respiramos</b>?', 'Los pulmones', ['El corazón', 'El hígado', 'Los riñones']],
    ['tragar', '¿Adónde va la comida después de <b>tragarla</b>?', 'Al estómago', ['A los pulmones', 'Al corazón', 'Al cerebro']],
    ['manda', '¿Qué órgano <b>manda</b> sobre todo el cuerpo?', 'El cerebro', ['El corazón', 'El estómago', 'Los pulmones']],
    ['forma', '¿Qué sostiene el cuerpo y le da <b>forma</b>?', 'El esqueleto', ['Los músculos', 'La piel', 'La sangre']],
    ['grande', '¿Cuál es el órgano <b>más grande</b> del cuerpo?', 'La piel', ['El hígado', 'El corazón', 'El cerebro']],
    ['rinones', '¿Qué limpian los <b>riñones</b>?', 'La sangre', ['El aire', 'La comida', 'Los huesos']],
    ['mover', '¿Qué nos permite <b>mover</b> los huesos?', 'Los músculos', ['La piel', 'El pelo', 'Las uñas']],
    ['sangre', '¿Por dónde viaja la <b>sangre</b>?', 'Por las venas y las arterias', ['Por los huesos', 'Por el estómago', 'Por los nervios']],
    ['gas', '¿Qué gas del aire <b>necesita</b> el cuerpo?', 'El oxígeno', ['El dióxido de carbono', 'El humo', 'El helio']],
    ['huesos', '¿Cuántos <b>huesos</b> tiene una persona grande, más o menos?', 'Unos 200', ['Unos 20', 'Unos 1000', 'Unos 50']],
    ['iris', '¿Cómo se llama la parte del ojo que tiene <b>color</b>?', 'El iris', ['La pupila', 'La pestaña', 'La ceja']],
    ['leche', 'Cuando se caen los <b>dientes de leche</b>, salen…', 'Los dientes definitivos', ['Otros dientes de leche', 'Dientes postizos', 'Nada']]
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
    simbolo: '🪐'
  }, [
    ['cerca', '¿Qué planeta está <b>más cerca</b> del Sol?', 'Mercurio', ['Venus', 'La Tierra', 'Marte']],
    ['grande', '¿Cuál es el planeta <b>más grande</b>?', 'Júpiter', ['Saturno', 'La Tierra', 'Neptuno']],
    // todos los gigantes tienen anillos, pero sólo los de Saturno se ven: las malas son planetas de roca
    ['anillos', '¿Qué planeta tiene unos <b>anillos</b> enormes que se ven con un telescopio?', 'Saturno', ['Marte', 'Mercurio', 'Venus']],
    ['rojo', '¿A qué planeta le dicen <b>el planeta rojo</b>?', 'Marte', ['Júpiter', 'Venus', 'Neptuno']],
    ['sol', '¿Qué es el <b>Sol</b>?', 'Una estrella', ['Un planeta', 'Una luna', 'Un cometa']],
    ['cuantos', '¿Cuántos <b>planetas</b> tiene el sistema solar?', '8', ['9', '7', '10']],
    ['luna', '¿Qué es la <b>Luna</b>?', 'Un satélite de la Tierra', ['Un planeta', 'Una estrella', 'Un cometa']],
    ['anio', '¿Cuánto tarda la Tierra en dar <b>una vuelta alrededor del Sol</b>?', 'Un año', ['Un día', 'Un mes', 'Una semana']],
    // la mala más tentadora es la otra vuelta de la Tierra: ésa hace los años, no los días
    ['dia', '¿Por qué hay <b>día y noche</b>?', 'Porque la Tierra gira sobre sí misma', ['Porque el Sol se apaga', 'Porque la Luna tapa al Sol', 'Porque la Tierra gira alrededor del Sol']],
    // Mercurio está más cerca, pero Venus tiene una atmósfera que guarda el calor
    ['caliente', '¿Cuál es el planeta <b>más caliente</b>?', 'Venus', ['Mercurio', 'Marte', 'La Tierra']],
    ['lejos', '¿Qué planeta está <b>más lejos</b> del Sol?', 'Neptuno', ['Urano', 'Saturno', 'Plutón']],
    ['pluton', '¿Qué es <b>Plutón</b> hoy?', 'Un planeta enano', ['Un planeta', 'Una estrella', 'Un satélite']],
    ['galaxia', '¿Cómo se llama nuestra <b>galaxia</b>?', 'La Vía Láctea', ['Andrómeda', 'La Osa Mayor', 'El Sistema Solar']]
  ]);

  var JUEGOS = [QUIEN_HACE, MI_CUERPO, DONDE_VIVE, ESTA_VIVO, PLANTAS, QUE_COME,
                CLASES_ANIMALES, ORGANOS, MATERIA, ESPACIO];

  return T.materia('ciencias', JUEGOS);
})();
