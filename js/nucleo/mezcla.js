/* ============================================================
   Correr una partida con preguntas de varios juegos mezclados.

   Lo usan el examen y el repaso, que son las dos cosas que sacan
   preguntas de más de una materia a la vez. Funciona porque cada juego
   sabe armar su tablero pregunta por pregunta (`montar`), así que acá
   sólo hay que preguntarle a cada ítem de qué juego salió y delegarle.

   Cada ítem tiene que venir con:
     __juego    el juego que lo armó (el objeto, no el id)
     __materia  el id de la materia, para los puntajes
   ============================================================ */
window.Mezcla = (function () {
  'use strict';

  /**
   * `reglas` es lo que cambia entre un examen y un repaso:
   *   intentos          cuántas veces puede probar
   *   mostrarResultado  si le dice en el momento si estuvo bien
   */
  function jugar(items, reglas, ganchos) {
    var cache = {};                    // los ganchos de cada juego, una sola vez

    function deJuego(item) {
      var clave = item.__materia + '/' + item.__juego.id;
      if (!cache[clave]) cache[clave] = item.__juego.ganchos();
      return cache[clave];
    }

    /** Le pasa la llamada al gancho del juego del que salió esta pregunta. */
    function delegar(nombre) {
      return function (item) {
        var g = deJuego(item);
        if (g[nombre]) return g[nombre].apply(null, arguments);
        return undefined;
      };
    }

    Motor.jugar({
      items: items,
      intentos: reglas.intentos,
      mostrarResultado: reglas.mostrarResultado,
      render: function (item) { item.__juego.montar(item); },
      esCorrecta: function (item, respuesta) {
        var g = deJuego(item);
        return g.esCorrecta ? g.esCorrecta(item, respuesta) : item.id === respuesta;
      },
      alAcertar: delegar('alAcertar'),
      alFallar: delegar('alFallar'),
      alRevelar: delegar('alRevelar'),
      alResponder: delegar('alResponder'),
      textoFallo: delegar('textoFallo'),
      textoRevelado: delegar('textoRevelado'),
      alTerminar: ganchos.alTerminar
    });
  }

  return { jugar: jugar };
})();
