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
  var VARIABLES = ['primario', 'primario-osc', 'violeta', 'papel', 'tarjeta',
                   'borde', 'tinta', 'tinta-suave', 'agua'];

  var TEMAS = [
    {
      id: 'clasico', nombre: 'Clásico', icono: '🎨', precio: 0,
      texto: 'Con el que viene la app.',
      colores: null                       // sin pisar nada: los del CSS
    },
    {
      id: 'selva', nombre: 'Selva', icono: '🌿', precio: 120,
      texto: 'Verdes de bosque.',
      colores: {
        'primario': '#2f9e57', 'primario-osc': '#217a41', 'violeta': '#7f9e2f',
        'papel': '#f1faf3', 'tarjeta': '#ffffff', 'borde': '#d3e9d8',
        'tinta': '#1c3a26', 'tinta-suave': '#517d61', 'agua': '#cbe7dc'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #d8f0c0 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #c9ecd8 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #eaf7c8 0%, transparent 60%)'
    },
    {
      id: 'oceano', nombre: 'Océano', icono: '🌊', precio: 120,
      texto: 'Azules de agua honda.',
      colores: {
        'primario': '#1b8fc4', 'primario-osc': '#126890', 'violeta': '#4a6bd6',
        'papel': '#eef8fd', 'tarjeta': '#ffffff', 'borde': '#cde5f2',
        'tinta': '#123549', 'tinta-suave': '#4a7891', 'agua': '#bde2f5'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #c9e9fb 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #bfe0f7 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #d3f2ee 0%, transparent 60%)'
    },
    {
      id: 'atardecer', nombre: 'Atardecer', icono: '🌅', precio: 150,
      texto: 'Naranjas de cielo de tarde.',
      colores: {
        'primario': '#e2622c', 'primario-osc': '#b0481c', 'violeta': '#d64a86',
        'papel': '#fff4ee', 'tarjeta': '#ffffff', 'borde': '#ffdbc8',
        'tinta': '#4a2418', 'tinta-suave': '#8c5f4a', 'agua': '#f7dcc6'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #ffd9b0 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #ffcfd6 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #ffe9c2 0%, transparent 60%)'
    },
    {
      id: 'chicle', nombre: 'Chicle', icono: '🍬', precio: 150,
      texto: 'Rosas de golosina.',
      colores: {
        'primario': '#d6489e', 'primario-osc': '#a52f79', 'violeta': '#8b5cf6',
        'papel': '#fff2fa', 'tarjeta': '#ffffff', 'borde': '#ffd3ec',
        'tinta': '#4a1836', 'tinta-suave': '#8d4c72', 'agua': '#ffd8f0'
      },
      deco: 'radial-gradient(38rem 28rem at 8% -6%, #ffd4ec 0%, transparent 60%),' +
            'radial-gradient(34rem 26rem at 98% 4%, #e2d4ff 0%, transparent 62%),' +
            'radial-gradient(40rem 30rem at 50% 108%, #ffe0f0 0%, transparent 60%)'
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
