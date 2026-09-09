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
                   'rosa-osc', 'papel', 'tarjeta', 'borde', 'tinta', 'tinta-suave', 'agua',
                   'barra', 'barra-borde', 'sobre-barra', 'marca-acento', 'seleccion'];

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
        'barra': '#9d174d', 'barra-borde': '#6d132f', 'sobre-barra': '#ffffff',
        'marca-acento': '#fbcfe8', 'seleccion': '#fcd5e8',
        'violeta': '#8b5cf6', 'rosa': '#f59e0b', 'rosa-osc': '#b45309',
        'papel': '#ffe3f1', 'tarjeta': '#fff8fc', 'borde': '#f9a8d4',
        'tinta': '#4a0725', 'tinta-suave': '#8a3d61', 'agua': '#ddd6fe'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #f9a8d4 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #c4b5fd 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fcd34d 0%, transparent 58%)'
    },
    {
      id: 'mandarina', nombre: 'Mandarina', icono: '🍊', precio: 0,
      texto: 'Naranja y azul, bien cálida.',
      colores: {
        'primario': '#ea580c', 'primario-osc': '#c2410c',
        // sobre naranja el texto va oscuro: en blanco no se leería
        'sobre-primario': '#3a1105',
        'barra': '#9a3412', 'barra-borde': '#6b2410', 'sobre-barra': '#ffffff',
        'marca-acento': '#fed7aa', 'seleccion': '#ffdcb0',
        'violeta': '#2563eb', 'rosa': '#f59e0b', 'rosa-osc': '#b45309',
        'papel': '#ffe6c9', 'tarjeta': '#fffaf2', 'borde': '#fdba74',
        'tinta': '#431407', 'tinta-suave': '#7c4a2c', 'agua': '#a8cffa'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #fdba74 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #93c5fd 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fde047 0%, transparent 58%)'
    },
    {
      id: 'selva', nombre: 'Selva', icono: '🌿', precio: 120,
      texto: 'Verdes de bosque.',
      colores: {
        'primario': '#15803d', 'primario-osc': '#14532d', 'sobre-primario': '#ffffff',
        'barra': '#166534', 'barra-borde': '#0f3d20', 'sobre-barra': '#ffffff',
        'marca-acento': '#fde047', 'seleccion': '#c3eed3',
        'violeta': '#65a30d', 'rosa': '#f97316', 'rosa-osc': '#c2410c',
        'papel': '#d7f5e1', 'tarjeta': '#f7fffa', 'borde': '#86efac',
        'tinta': '#14532d', 'tinta-suave': '#3f6b50', 'agua': '#a7dfc4'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #bef264 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #6ee7b7 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #fde047 0%, transparent 58%)'
    },
    {
      id: 'oceano', nombre: 'Océano', icono: '🌊', precio: 120,
      texto: 'Azules de agua honda.',
      colores: {
        'primario': '#0369a1', 'primario-osc': '#075985', 'sobre-primario': '#ffffff',
        'barra': '#075985', 'barra-borde': '#053b58', 'sobre-barra': '#ffffff',
        'marca-acento': '#7dd3fc', 'seleccion': '#c0e3f8',
        'violeta': '#6366f1', 'rosa': '#06b6d4', 'rosa-osc': '#0e7490',
        'papel': '#d3ecfb', 'tarjeta': '#f5fbff', 'borde': '#7dd3fc',
        'tinta': '#0c4a6e', 'tinta-suave': '#3d6c88', 'agua': '#8ecdf3'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #7dd3fc 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #67e8f9 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #a5b4fc 0%, transparent 58%)'
    },
    {
      id: 'uva', nombre: 'Uva', icono: '🍇', precio: 150,
      texto: 'Violetas profundos.',
      colores: {
        'primario': '#7c3aed', 'primario-osc': '#6d28d9', 'sobre-primario': '#ffffff',
        'barra': '#5b21b6', 'barra-borde': '#3f1580', 'sobre-barra': '#ffffff',
        'marca-acento': '#f5d0fe', 'seleccion': '#ddc9fb',
        'violeta': '#a855f7', 'rosa': '#ec4899', 'rosa-osc': '#be185d',
        'papel': '#e9dcfd', 'tarjeta': '#fbf7ff', 'borde': '#c4b5fd',
        'tinta': '#3b0764', 'tinta-suave': '#6b4e93', 'agua': '#bfdbfe'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #d8b4fe 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #a5b4fc 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #f9a8d4 0%, transparent 58%)'
    },
    {
      id: 'menta', nombre: 'Menta', icono: '🧊', precio: 180,
      texto: 'Turquesa fresquito.',
      colores: {
        'primario': '#0f766e', 'primario-osc': '#115e59', 'sobre-primario': '#ffffff',
        'barra': '#115e59', 'barra-borde': '#0b3f3c', 'sobre-barra': '#ffffff',
        'marca-acento': '#fef08a', 'seleccion': '#b9ece2',
        'violeta': '#7c3aed', 'rosa': '#f43f5e', 'rosa-osc': '#be123c',
        'papel': '#cdf3ec', 'tarjeta': '#f4fffd', 'borde': '#5eead4',
        'tinta': '#134e4a', 'tinta-suave': '#3d6f6a', 'agua': '#a5e8e0'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #5eead4 0%, transparent 58%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #93c5fd 0%, transparent 60%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #c4b5fd 0%, transparent 58%)'
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
