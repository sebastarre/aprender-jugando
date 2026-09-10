/* ============================================================
   Catálogo de la tienda: todo lo que se puede comprar con monedas.

   Es puro cosmético a propósito. Nada de lo que está acá hace falta
   para aprender ni para jugar: no se compran pistas, ni intentos, ni
   juegos. Sólo cómo se ve la app y cómo se viste la mascota.

   ------------------------------------------------------------
   Los colores se compran de a uno, por elemento
   ------------------------------------------------------------

   Hay cuatro RANURAS (la barra, el fondo, los botones, las letras) y
   cada una tiene su propia lista de colores. El chico arma la
   combinación que quiera: barra verde con fondo rosa y letras violetas,
   si se le canta.

   La gracia está en que **no puede armar algo ilegible**. No hay una
   lista única de colores para todo: la ranura del fondo sólo ofrece
   tonos claros, la de las letras sólo tonos oscuros, y la de los
   botones sólo colores que aguantan texto encima (cada uno se trae su
   propio `sobre-primario`). Cualquier combinación de las cuatro listas
   pasa el contraste mínimo, así que no hace falta deshabilitar
   opciones ni mostrarle carteles de error a un chico de siete años.

   Cada color pisa varias variables de CSS de una vez, porque cambiar
   "el fondo" en realidad es cambiar el papel, las tarjetas, los bordes
   y el relleno de lo elegido, todo junto y combinado.

   Lo que NUNCA se pisa es --exito y --error: el verde de "acertaste" y
   el rojo de "erraste" tienen que significar lo mismo siempre.
   ============================================================ */
window.Catalogo = (function () {
  'use strict';

  /* Las familias vienen de las paletas que la app tenía antes. Se
     conservan los mismos tonos porque estaban medidos uno por uno:
     los siete pasaban 4.5:1 en todos los pares de texto y fondo. */
  var RANURAS = [
    {
      id: 'barra',
      nombre: 'La barra de arriba',
      texto: 'La franja de color que está siempre arriba de todo.',
      colores: [
        { id: 'azul', nombre: 'Azul', precio: 0, muestra: '#1d4ed8',
          vars: { 'barra': '#1d4ed8', 'sobre-barra': '#ffffff', 'marca-acento': '#fcd34d' } },
        { id: 'frutilla', nombre: 'Frutilla', precio: 0, muestra: '#9d174d',
          vars: { 'barra': '#9d174d', 'sobre-barra': '#ffffff', 'marca-acento': '#fbcfe8' } },
        { id: 'naranja', nombre: 'Naranja', precio: 0, muestra: '#9a3412',
          vars: { 'barra': '#9a3412', 'sobre-barra': '#ffffff', 'marca-acento': '#fed7aa' } },
        { id: 'selva', nombre: 'Selva', precio: 50, muestra: '#166534',
          vars: { 'barra': '#166534', 'sobre-barra': '#ffffff', 'marca-acento': '#fde047' } },
        { id: 'oceano', nombre: 'Océano', precio: 50, muestra: '#075985',
          vars: { 'barra': '#075985', 'sobre-barra': '#ffffff', 'marca-acento': '#7dd3fc' } },
        { id: 'uva', nombre: 'Uva', precio: 60, muestra: '#5b21b6',
          vars: { 'barra': '#5b21b6', 'sobre-barra': '#ffffff', 'marca-acento': '#f5d0fe' } },
        { id: 'menta', nombre: 'Menta', precio: 60, muestra: '#115e59',
          vars: { 'barra': '#115e59', 'sobre-barra': '#ffffff', 'marca-acento': '#fef08a' } }
      ]
    },

    {
      id: 'fondo',
      nombre: 'El fondo',
      texto: 'El color de atrás de todo, con sus tarjetas y sus bordes.',
      /* Cada familia trae una escalerita de cinco tonos, del más claro
         al más oscuro, y cada uno tiene un trabajo:

           tarjeta      lo que está adelante: blanco, siempre
           papel        el fondo de la pantalla: casi blanco
           borde        el filo de 2px que le da el canto a una tarjeta
           sombra-clay  el escalón de 4px de abajo, el que se hunde
           pista        rieles de barras, interruptores apagados, botones

         El fondo es casi blanco a propósito. Antes era un color pleno
         —un celeste bien celeste— con las tarjetas blancas encima, y
         eso es al revés de como lo hacen las apps de chicos que
         funcionan: Duolingo tiene el fondo blanco (#ffffff) y mete
         TODO el color en los objetos de adelante. Con el color atrás,
         cada tarjeta es una mancha pálida flotando en una pileta de
         color y la pantalla entera se ve deslavada, por más saturado
         que esté el fondo.

         Que el papel sea casi blanco no borra la paleta: la paleta se
         ve en la barra, en los botones, en los dibujos de cada juego y
         en el escalón de cada tarjeta. Se nota más, no menos, porque
         ahora tiene contra qué recortarse. */
      colores: [
        { id: 'azul', nombre: 'Cielo', precio: 0, muestra: '#dfeafe',
          vars: { 'papel': '#f3f7ff', 'tarjeta': '#ffffff', 'borde': '#dde5f5',
                  'sombra-clay': '#c9d6ee', 'pista': '#b6c8e8',
                  'seleccion': '#dbe8ff', 'agua': '#a8cffa' } },
        { id: 'frutilla', nombre: 'Frutilla', precio: 0, muestra: '#ffe3f1',
          vars: { 'papel': '#fff5fa', 'tarjeta': '#ffffff', 'borde': '#f8dde9',
                  'sombra-clay': '#f2c6db', 'pista': '#eeb0cd',
                  'seleccion': '#ffdfee', 'agua': '#ddd6fe' } },
        { id: 'naranja', nombre: 'Durazno', precio: 0, muestra: '#ffe6c9',
          vars: { 'papel': '#fff8ef', 'tarjeta': '#ffffff', 'borde': '#fae3ca',
                  'sombra-clay': '#f5cfa6', 'pista': '#f0bb85',
                  'seleccion': '#ffe8cd', 'agua': '#a8cffa' } },
        { id: 'selva', nombre: 'Selva', precio: 50, muestra: '#d7f5e1',
          vars: { 'papel': '#f2fbf5', 'tarjeta': '#ffffff', 'borde': '#d6ecdd',
                  'sombra-clay': '#b8dfc6', 'pista': '#9bd0af',
                  'seleccion': '#d8f3e2', 'agua': '#a7dfc4' } },
        { id: 'oceano', nombre: 'Océano', precio: 50, muestra: '#d3ecfb',
          vars: { 'papel': '#f1f9ff', 'tarjeta': '#ffffff', 'borde': '#d5e9f7',
                  'sombra-clay': '#b7d9f0', 'pista': '#98c8e8',
                  'seleccion': '#d7ecfb', 'agua': '#8ecdf3' } },
        /* la pista va un toque más clara que el resto de la familia: es
           el fondo de la pastilla "PRONTO", y con las letras selva
           encima daba 4.37:1, apenas abajo del mínimo de 4.5 */
        { id: 'uva', nombre: 'Uva', precio: 60, muestra: '#e9dcfd',
          vars: { 'papel': '#f8f4ff', 'tarjeta': '#ffffff', 'borde': '#e5dcf8',
                  'sombra-clay': '#d2c2f1', 'pista': '#c3aeea',
                  'seleccion': '#eae0fd', 'agua': '#bfdbfe' } },
        { id: 'menta', nombre: 'Menta', precio: 60, muestra: '#cdf3ec',
          vars: { 'papel': '#f0fbf9', 'tarjeta': '#ffffff', 'borde': '#d2ebe6',
                  'sombra-clay': '#b2ddd5', 'pista': '#93cfc4',
                  'seleccion': '#d5f0eb', 'agua': '#a5e8e0' } }
      ]
    },

    {
      id: 'botones',
      nombre: 'Los botones',
      texto: 'El color de los botones grandes y de lo que está elegido.',
      colores: [
        { id: 'azul', nombre: 'Azul', precio: 0, muestra: '#2563eb',
          vars: { 'primario': '#2563eb', 'primario-osc': '#1d4ed8', 'sobre-primario': '#ffffff',
                  'violeta': '#7c3aed', 'rosa': '#ec4899', 'rosa-osc': '#be185d' } },
        { id: 'frutilla', nombre: 'Frutilla', precio: 0, muestra: '#db2777',
          vars: { 'primario': '#db2777', 'primario-osc': '#9d174d', 'sobre-primario': '#ffffff',
                  'violeta': '#8b5cf6', 'rosa': '#f59e0b', 'rosa-osc': '#b45309' } },
        /* el naranja lleva texto oscuro encima: en blanco daría 2.80:1 */
        { id: 'naranja', nombre: 'Naranja', precio: 0, muestra: '#ea580c',
          vars: { 'primario': '#ea580c', 'primario-osc': '#c2410c', 'sobre-primario': '#3a1105',
                  'violeta': '#2563eb', 'rosa': '#f59e0b', 'rosa-osc': '#b45309' } },
        { id: 'selva', nombre: 'Selva', precio: 50, muestra: '#15803d',
          vars: { 'primario': '#15803d', 'primario-osc': '#14532d', 'sobre-primario': '#ffffff',
                  'violeta': '#65a30d', 'rosa': '#f97316', 'rosa-osc': '#c2410c' } },
        { id: 'oceano', nombre: 'Océano', precio: 50, muestra: '#0369a1',
          vars: { 'primario': '#0369a1', 'primario-osc': '#075985', 'sobre-primario': '#ffffff',
                  'violeta': '#6366f1', 'rosa': '#06b6d4', 'rosa-osc': '#0e7490' } },
        { id: 'uva', nombre: 'Uva', precio: 60, muestra: '#7c3aed',
          vars: { 'primario': '#7c3aed', 'primario-osc': '#6d28d9', 'sobre-primario': '#ffffff',
                  'violeta': '#a855f7', 'rosa': '#ec4899', 'rosa-osc': '#be185d' } },
        { id: 'menta', nombre: 'Menta', precio: 60, muestra: '#0f766e',
          vars: { 'primario': '#0f766e', 'primario-osc': '#115e59', 'sobre-primario': '#ffffff',
                  'violeta': '#7c3aed', 'rosa': '#f43f5e', 'rosa-osc': '#be123c' } }
      ]
    },

    {
      id: 'letras',
      nombre: 'Las letras',
      texto: 'El color del texto. Todos son oscuros, para que se lea.',
      colores: [
        { id: 'azul', nombre: 'Tinta', precio: 0, muestra: '#0f172a',
          vars: { 'tinta': '#0f172a', 'tinta-suave': '#475569' } },
        { id: 'frutilla', nombre: 'Frutilla', precio: 0, muestra: '#4a0725',
          vars: { 'tinta': '#4a0725', 'tinta-suave': '#8a3d61' } },
        { id: 'naranja', nombre: 'Chocolate', precio: 0, muestra: '#431407',
          vars: { 'tinta': '#431407', 'tinta-suave': '#7c4a2c' } },
        { id: 'selva', nombre: 'Selva', precio: 40, muestra: '#14532d',
          vars: { 'tinta': '#14532d', 'tinta-suave': '#3f6b50' } },
        { id: 'oceano', nombre: 'Océano', precio: 40, muestra: '#0c4a6e',
          vars: { 'tinta': '#0c4a6e', 'tinta-suave': '#3b6883' } },
        { id: 'uva', nombre: 'Uva', precio: 50, muestra: '#3b0764',
          vars: { 'tinta': '#3b0764', 'tinta-suave': '#6b4e93' } },
        { id: 'menta', nombre: 'Menta', precio: 50, muestra: '#134e4a',
          vars: { 'tinta': '#134e4a', 'tinta-suave': '#3b6b66' } }
      ]
    }
  ];

  /* Las combinaciones armadas de antes. No se compran: son un atajo
     para el que no tiene ganas de elegir cuatro colores, y sólo pueden
     usar colores que el chico ya tenga. */
  var COMBOS = [
    { id: 'aula', nombre: 'Aula', color: 'azul' },
    { id: 'recreo', nombre: 'Recreo', color: 'frutilla' },
    { id: 'mandarina', nombre: 'Mandarina', color: 'naranja' }
  ];

  /** Todas las variables que puede pisar un color, para limpiarlas. */
  var VARIABLES = (function () {
    var vistas = {};
    RANURAS.forEach(function (r) {
      r.colores.forEach(function (c) {
        Object.keys(c.vars).forEach(function (v) { vistas[v] = true; });
      });
    });
    return Object.keys(vistas);
  })();

  /* Los fondos decorados: sólo cambian el dibujo de atrás. Si hay uno
     equipado, le gana al que trae el color del fondo. */
  var FONDOS = [
    { id: 'del-tema', nombre: 'Liso', icono: '🖼️', precio: 0,
      texto: 'Sin dibujos: el color del fondo y nada más.', deco: null },
    { id: 'burbujas', nombre: 'Burbujas', icono: '🫧', precio: 100,
      texto: 'Pompas flotando.',
      deco: 'radial-gradient(9rem 9rem at 12% 18%, rgba(120,180,255,.30) 0%, transparent 70%),' +
            'radial-gradient(6rem 6rem at 78% 12%, rgba(150,220,255,.32) 0%, transparent 70%),' +
            'radial-gradient(12rem 12rem at 88% 62%, rgba(120,200,255,.24) 0%, transparent 70%),' +
            'radial-gradient(7rem 7rem at 26% 74%, rgba(170,210,255,.30) 0%, transparent 70%),' +
            'radial-gradient(5rem 5rem at 55% 40%, rgba(140,200,255,.26) 0%, transparent 70%)' },
    { id: 'estrellitas', nombre: 'Estrellitas', icono: '✨', precio: 100,
      texto: 'Un cielo con brillos.',
      deco: 'radial-gradient(circle, rgba(255,205,90,.55) 1.6px, transparent 2px) 0 0 / 46px 46px,' +
            'radial-gradient(circle, rgba(140,170,255,.45) 1.2px, transparent 2px) 23px 23px / 46px 46px,' +
            'radial-gradient(30rem 24rem at 50% 0%, #e8eeff 0%, transparent 65%)' },
    { id: 'nubes', nombre: 'Nubes', icono: '☁️', precio: 100,
      texto: 'Un día despejado.',
      deco: 'radial-gradient(14rem 6rem at 18% 22%, rgba(255,255,255,.95) 0%, transparent 70%),' +
            'radial-gradient(10rem 5rem at 70% 14%, rgba(255,255,255,.9) 0%, transparent 70%),' +
            'radial-gradient(16rem 7rem at 84% 66%, rgba(255,255,255,.85) 0%, transparent 70%),' +
            'linear-gradient(180deg, #cfe6ff 0%, #eef6ff 55%, #ffffff 100%)' },
    { id: 'arcoiris', nombre: 'Arcoíris', icono: '🌈', precio: 130,
      texto: 'Todos los colores juntos.',
      deco: 'radial-gradient(30rem 22rem at 10% 0%, rgba(255,180,180,.5) 0%, transparent 62%),' +
            'radial-gradient(30rem 22rem at 42% -4%, rgba(255,225,160,.5) 0%, transparent 62%),' +
            'radial-gradient(30rem 22rem at 74% 0%, rgba(180,235,190,.5) 0%, transparent 62%),' +
            'radial-gradient(32rem 24rem at 96% 8%, rgba(180,200,255,.5) 0%, transparent 62%),' +
            'radial-gradient(34rem 26rem at 50% 108%, rgba(225,190,255,.45) 0%, transparent 60%)' }
  ];

  /* Los disfraces de la mascota. La lista y los dibujos viven en
     js/nucleo/mascota.js; acá sólo se les pone precio. */
  var DISFRACES = Object.keys(Mascota.DISFRACES).map(function (id) {
    var d = Mascota.DISFRACES[id];
    return { id: id, nombre: d.nombre, precio: d.precio, disfraz: id };
  });

  /* Monigotes que se suman a los 12 gratis del perfil. */
  var AVATARES = [
    { emoji: '🐲', precio: 50 }, { emoji: '🦕', precio: 50 },
    { emoji: '🦩', precio: 50 }, { emoji: '🐳', precio: 50 },
    { emoji: '🦥', precio: 60 }, { emoji: '🦔', precio: 60 },
    { emoji: '🐺', precio: 60 }, { emoji: '🦚', precio: 70 },
    { emoji: '🤖', precio: 80 }, { emoji: '👽', precio: 80 },
    { emoji: '🧙', precio: 90 }, { emoji: '🦸', precio: 90 }
  ].map(function (a) {
    return { id: 'avatar:' + a.emoji, nombre: a.emoji, icono: a.emoji,
             precio: a.precio, emoji: a.emoji };
  });

  function buscar(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  function ranura(id) { return buscar(RANURAS, id); }

  /** Un color concreto de una ranura. Si no existe, el primero (gratis). */
  function color(ranuraId, colorId) {
    var r = ranura(ranuraId);
    if (!r) return null;
    return buscar(r.colores, colorId) || r.colores[0];
  }

  /** La clave con la que se guarda una compra de color. */
  function claveColor(ranuraId, colorId) { return ranuraId + ':' + colorId; }

  return {
    RANURAS: RANURAS,
    COMBOS: COMBOS,
    VARIABLES: VARIABLES,
    FONDOS: FONDOS,
    DISFRACES: DISFRACES,
    AVATARES: AVATARES,
    ranura: ranura,
    color: color,
    claveColor: claveColor,
    coloresGratis: function (ranuraId) {
      var r = ranura(ranuraId);
      return r ? r.colores.filter(function (c) { return !c.precio; }) : [];
    },
    coloresDeTienda: function (ranuraId) {
      var r = ranura(ranuraId);
      return r ? r.colores.filter(function (c) { return c.precio > 0; }) : [];
    },
    disfraz: function (id) { return buscar(DISFRACES, id); },
    disfracesGratis: function () { return DISFRACES.filter(function (d) { return !d.precio; }); },
    disfracesDeTienda: function () { return DISFRACES.filter(function (d) { return d.precio > 0; }); },
    fondo: function (id) { return buscar(FONDOS, id); },
    avatar: function (id) { return buscar(AVATARES, id); },
    /** Precio de cualquier cosa comprable, por su tipo e id. */
    precio: function (tipo, id) {
      if (tipo === 'color') {
        var partes = String(id).split(':');
        var c = color(partes[0], partes[1]);
        return c ? c.precio : 0;
      }
      var item = tipo === 'fondo' ? buscar(FONDOS, id)
               : tipo === 'disfraz' ? buscar(DISFRACES, id)
               : buscar(AVATARES, id);
      return item ? item.precio : 0;
    }
  };
})();
