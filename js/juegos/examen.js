/* ============================================================
   Modo examen.

   No es otro juego: es la misma máquina con otras reglas.
     - un solo intento por pregunta,
     - no dice si estuvo bien hasta el final,
     - al final da una nota del 1 al 10.

   Puede mezclar juegos de distintas materias. Eso funciona porque cada
   juego sabe armar su tablero pregunta por pregunta (`montar`), así que
   el examen sólo tiene que mezclar los ítems y delegar.
   ============================================================ */
window.Examen = (function () {
  'use strict';

  var CANTIDADES = [10, 20, 30];

  /** Reparte `total` preguntas entre `cuantos` juegos, lo más parejo posible. */
  function repartir(total, cuantos) {
    var base = Math.floor(total / cuantos);
    var sobran = total % cuantos;
    var partes = [];
    for (var i = 0; i < cuantos; i++) partes.push(base + (i < sobran ? 1 : 0));
    return partes;
  }

  /**
   * Arma las preguntas.
   *   elegidos: [{ materia, juego }]
   *   comun:    { zona, cantidad }   lo que se eligió en la pantalla
   */
  function armarItems(elegidos, comun, edad) {
    var partes = repartir(comun.cantidad, elegidos.length);
    var items = [];

    elegidos.forEach(function (par, i) {
      if (!partes[i]) return;
      var sel = par.juego.examen ? par.juego.examen(comun, edad) : {};
      sel.cantidad = partes[i];

      par.juego.preguntas(sel).forEach(function (item) {
        item.__juego = par.juego;
        item.__materia = par.materia.id;
        items.push(item);
      });
    });

    return Util.mezclar(items);
  }

  /**
   * Corre el examen. `ganchos.alTerminar(resultado)` recibe el resultado.
   *
   * Mezclar preguntas de varios juegos lo hace js/nucleo/mezcla.js, que
   * comparte con el modo Repaso; acá sólo van las reglas del examen.
   * Con mostrarResultado en false, Mezcla no llama a alAcertar ni a
   * alFallar, así que el chico ve que su respuesta quedó anotada pero no
   * si estuvo bien.
   */
  function jugar(items, ganchos) {
    Mezcla.jugar(items, { intentos: 1, mostrarResultado: false }, ganchos);
  }

  /** La nota clásica: del 1 al 10. */
  function nota(aciertos, total) {
    if (!total) return 1;
    return Math.max(1, Math.round(aciertos / total * 10));
  }

  function comentario(n) {
    if (n === 10) return '¡Perfecto! No erraste ni una.';
    if (n >= 8) return '¡Muy bien! Estudiaste.';
    if (n >= 6) return 'Aprobado. Con un poco más de práctica sube.';
    if (n >= 4) return 'Te faltó poco. Repasá y probá de nuevo.';
    return 'Esta vez no salió. Pasá por Aprender y volvé a intentar.';
  }

  return {
    CANTIDADES: CANTIDADES,
    armarItems: armarItems,
    jugar: jugar,
    nota: nota,
    comentario: comentario
  };
})();
