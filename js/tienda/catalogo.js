/* ============================================================
   Catálogo de la tienda: todo lo que se puede comprar con monedas.

   Es puro cosmético a propósito. Nada de lo que está acá hace falta
   para aprender ni para jugar: no se compran pistas, ni intentos, ni
   juegos. Sólo cómo se ve la app.

   Los temas pisan variables de CSS (las que ya usa css/estilos.css),
   así que agregar uno nuevo es agregar una entrada más a esta lista.
   Los que NO se pisan nunca son --exito y --error: el verde de
   "acertaste" y el rojo de "erraste" tienen que seguir siendo los
   mismos en todos los temas.
   ============================================================ */
window.Catalogo = (function () {
  'use strict';

  /* Las únicas variables que un tema puede cambiar. */
  var VARIABLES = ['primario', 'primario-osc', 'sobre-primario', 'violeta', 'rosa',
                   'rosa-osc', 'papel', 'tarjeta', 'borde', 'tinta', 'tinta-suave', 'agua'];

  /* Las tres primeras son gratis: son las paletas base que se eligen desde
     Personalización. Las de abajo se compran en la tienda. */
  var TEMAS = [
    {
      id: 'clasico', nombre: 'Aula', icono: '🎨', precio: 0,
      texto: 'La que viene con la app: azul, amarillo y rosa.',
      colores: null                       // sin pisar nada: los del CSS
    },
    {
      id: 'recreo', nombre: 'Recreo', icono: '🍭', precio: 0,
      texto: 'Rosa y violeta de golosina.',
      colores: {
        'primario': '#db2777', 'primario-osc': '#9d174d', 'sobre-primario': '#ffffff',
        'violeta': '#8b5cf6', 'rosa': '#f59e0b', 'rosa-osc': '#b45309',
        'papel': '#fdf2f8', 'tarjeta': '#ffffff', 'borde': '#fbcfe8',
        'tinta': '#500724', 'tinta-suave': '#8f4f6f', 'agua': '#bfdbfe'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #fbcfe8 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #ddd6fe 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fde68a 0%, transparent 60%)'
    },
    {
      id: 'mandarina', nombre: 'Mandarina', icono: '🍊', precio: 0,
      texto: 'Naranja y azul, bien cálida.',
      colores: {
        'primario': '#ea580c', 'primario-osc': '#c2410c',
        // sobre naranja el texto va oscuro: en blanco no se leería
        'sobre-primario': '#3a1105',
        'violeta': '#2563eb', 'rosa': '#0891b2', 'rosa-osc': '#0e7490',
        'papel': '#fff7ed', 'tarjeta': '#ffffff', 'borde': '#fed7aa',
        'tinta': '#431407', 'tinta-suave': '#8a5a44', 'agua': '#bfdbfe'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #fed7aa 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #bfdbfe 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fef08a 0%, transparent 60%)'
    },
    {
      id: 'selva', nombre: 'Selva', icono: '🌿', precio: 120,
      texto: 'Verdes de bosque.',
      colores: {
        'primario': '#16a34a', 'primario-osc': '#15803d', 'sobre-primario': '#ffffff',
        'violeta': '#65a30d', 'rosa': '#f97316', 'rosa-osc': '#c2410c',
        'papel': '#f0fdf4', 'tarjeta': '#ffffff', 'borde': '#bbf7d0',
        'tinta': '#14532d', 'tinta-suave': '#4d7c5f', 'agua': '#a7dfc4'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #d9f99d 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #a7f3d0 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fef08a 0%, transparent 60%)'
    },
    {
      id: 'oceano', nombre: 'Océano', icono: '🌊', precio: 120,
      texto: 'Azules de agua honda.',
      colores: {
        'primario': '#0284c7', 'primario-osc': '#0369a1', 'sobre-primario': '#ffffff',
        'violeta': '#6366f1', 'rosa': '#06b6d4', 'rosa-osc': '#0e7490',
        'papel': '#f0f9ff', 'tarjeta': '#ffffff', 'borde': '#bae6fd',
        'tinta': '#0c4a6e', 'tinta-suave': '#47708c', 'agua': '#a5dcf7'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #bae6fd 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #a5f3fc 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #c7d2fe 0%, transparent 60%)'
    },
    {
      id: 'uva', nombre: 'Uva', icono: '🍇', precio: 150,
      texto: 'Violetas profundos.',
      colores: {
        'primario': '#7c3aed', 'primario-osc': '#6d28d9', 'sobre-primario': '#ffffff',
        'violeta': '#a855f7', 'rosa': '#ec4899', 'rosa-osc': '#be185d',
        'papel': '#faf5ff', 'tarjeta': '#ffffff', 'borde': '#e9d5ff',
        'tinta': '#3b0764', 'tinta-suave': '#75569b', 'agua': '#bfdbfe'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #e9d5ff 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #c7d2fe 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fbcfe8 0%, transparent 60%)'
    },
    {
      id: 'menta', nombre: 'Menta', icono: '🧊', precio: 180,
      texto: 'Turquesa fresquito.',
      colores: {
        'primario': '#0d9488', 'primario-osc': '#0f766e', 'sobre-primario': '#ffffff',
        'violeta': '#7c3aed', 'rosa': '#f43f5e', 'rosa-osc': '#be123c',
        'papel': '#f0fdfa', 'tarjeta': '#ffffff', 'borde': '#99f6e4',
        'tinta': '#134e4a', 'tinta-suave': '#4a7c76', 'agua': '#a5e8e0'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #99f6e4 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #bfdbfe 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #ddd6fe 0%, transparent 60%)'
    }
  ];

  /* Los fondos sólo cambian el dibujo de atrás; si hay uno equipado,
     le gana al que trae el tema. */
  var FONDOS = [
    {
      id: 'del-tema', nombre: 'El del tema', icono: '🖼️', precio: 0,
      texto: 'El que trae cada tema.',
      deco: null
    },
    {
      id: 'burbujas', nombre: 'Burbujas', icono: '🫧', precio: 100,
      texto: 'Pompas flotando.',
      deco: 'radial-gradient(9rem 9rem at 12% 18%, rgba(120,180,255,.30) 0%, transparent 70%),' +
            'radial-gradient(6rem 6rem at 78% 12%, rgba(150,220,255,.32) 0%, transparent 70%),' +
            'radial-gradient(12rem 12rem at 88% 62%, rgba(120,200,255,.24) 0%, transparent 70%),' +
            'radial-gradient(7rem 7rem at 26% 74%, rgba(170,210,255,.30) 0%, transparent 70%),' +
            'radial-gradient(5rem 5rem at 55% 40%, rgba(140,200,255,.26) 0%, transparent 70%)'
    },
    {
      id: 'estrellitas', nombre: 'Estrellitas', icono: '✨', precio: 100,
      texto: 'Un cielo con brillos.',
      deco: 'radial-gradient(circle, rgba(255,205,90,.55) 1.6px, transparent 2px) 0 0 / 46px 46px,' +
            'radial-gradient(circle, rgba(140,170,255,.45) 1.2px, transparent 2px) 23px 23px / 46px 46px,' +
            'radial-gradient(30rem 24rem at 50% 0%, #e8eeff 0%, transparent 65%)'
    },
    {
      id: 'nubes', nombre: 'Nubes', icono: '☁️', precio: 100,
      texto: 'Un día despejado.',
      deco: 'radial-gradient(14rem 6rem at 18% 22%, rgba(255,255,255,.95) 0%, transparent 70%),' +
            'radial-gradient(10rem 5rem at 70% 14%, rgba(255,255,255,.9) 0%, transparent 70%),' +
            'radial-gradient(16rem 7rem at 84% 66%, rgba(255,255,255,.85) 0%, transparent 70%),' +
            'linear-gradient(180deg, #cfe6ff 0%, #eef6ff 55%, #ffffff 100%)'
    },
    {
      id: 'arcoiris', nombre: 'Arcoíris', icono: '🌈', precio: 130,
      texto: 'Todos los colores juntos.',
      deco: 'radial-gradient(30rem 22rem at 10% 0%, rgba(255,180,180,.5) 0%, transparent 62%),' +
            'radial-gradient(30rem 22rem at 42% -4%, rgba(255,225,160,.5) 0%, transparent 62%),' +
            'radial-gradient(30rem 22rem at 74% 0%, rgba(180,235,190,.5) 0%, transparent 62%),' +
            'radial-gradient(32rem 24rem at 96% 8%, rgba(180,200,255,.5) 0%, transparent 62%),' +
            'radial-gradient(34rem 26rem at 50% 108%, rgba(225,190,255,.45) 0%, transparent 60%)'
    }
  ];

  /* Monigotes que se suman a los 12 gratis del perfil. */
  var AVATARES = [
    { emoji: '🐲', precio: 50 }, { emoji: '🦕', precio: 50 },
    { emoji: '🦩', precio: 50 }, { emoji: '🐳', precio: 50 },
    { emoji: '🦥', precio: 60 }, { emoji: '🦔', precio: 60 },
    { emoji: '🐺', precio: 60 }, { emoji: '🦚', precio: 70 },
    { emoji: '🤖', precio: 80 }, { emoji: '👽', precio: 80 },
    { emoji: '🧙', precio: 90 }, { emoji: '🦸', precio: 90 }
  ].map(function (a) {
    return {
      id: 'avatar:' + a.emoji,
      nombre: a.emoji,
      icono: a.emoji,
      precio: a.precio,
      emoji: a.emoji
    };
  });

  function buscar(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  return {
    VARIABLES: VARIABLES,
    TEMAS: TEMAS,
    FONDOS: FONDOS,
    AVATARES: AVATARES,
    tema: function (id) { return buscar(TEMAS, id) || TEMAS[0]; },
    /** Las paletas base, que no hay que comprar. */
    temasGratis: function () { return TEMAS.filter(function (t) { return !t.precio; }); },
    temasDeTienda: function () { return TEMAS.filter(function (t) { return t.precio > 0; }); },
    fondo: function (id) { return buscar(FONDOS, id); },
    avatar: function (id) { return buscar(AVATARES, id); },
    /** Precio de cualquier cosa comprable, por su id de compra. */
    precio: function (tipo, id) {
      var item = tipo === 'tema' ? buscar(TEMAS, id)
               : tipo === 'fondo' ? buscar(FONDOS, id)
               : buscar(AVATARES, id);
      return item ? item.precio : 0;
    }
  };
})();
