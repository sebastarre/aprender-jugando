/* ============================================================
   Modo repaso: volver sobre lo que se viene fallando.

   La app ya venía anotando cada error en el almacén, pero sólo para
   mostrárselo al padre. Acá esos errores se convierten en una partida:
   se rearman las preguntas falladas y se juegan con las reglas de
   siempre (tres intentos, y te dice en el momento si estuvo bien),
   porque esto es para aprender, no para medir.

   Mezcla materias, así que corre sobre js/nucleo/mezcla.js igual que el
   examen. La diferencia es de dónde salen las preguntas: el examen las
   sortea del contenido, el repaso las saca de la lista de errores.
   ============================================================ */
window.Repaso = (function () {
  'use strict';

  var CANTIDAD = 10;
  /* Con menos de esto no vale la pena: quedaría una partida de dos
     preguntas y el chico la termina antes de entender qué pasó. */
  var MINIMO = 5;

  function hayParaRepasar() {
    return Almacen.cuantosErrores() >= MINIMO;
  }

  function cuantosPendientes() {
    return Almacen.cuantosErrores();
  }

  /**
   * Arma las preguntas del repaso.
   *
   * `buscar(materiaId, juegoId)` la pone app.js, que es quien tiene el
   * registro de materias: devuelve { materia, juego } o null si ese juego
   * ya no existe o todavía está trabado por edad.
   *
   * Se toman los más fallados y de ahí se sortea pesando por cuántas veces
   * falló cada uno: los peores entran casi seguro, pero no siempre los
   * mismos diez, así que dos repasos seguidos no son idénticos.
   */
  function armarItems(buscar, cantidad) {
    var cuantas = cantidad || CANTIDAD;
    var candidatos = Almacen.masFallados(cuantas * 3);

    /* Se ordena la lista entera, no sólo las diez primeras: abajo algunas
       se van a descartar (juego trabado, clave vieja) y hay que tener con
       qué reemplazarlas para que el repaso llegue a las diez preguntas. */
    var elegidos = Util.muestraPesada(candidatos, candidatos.length, function (f) {
      return f.veces;
    });

    var items = [];
    var modulos = {};                       // materia id -> el módulo, para el paso de abajo
    elegidos.forEach(function (f) {
      if (items.length >= cuantas) return;
      // puede devolver null: el juego que sabe dibujar esa pregunta quedó
      // trabado, o la clave es de una versión vieja de la app
      var par = buscar(f.materia, f.juego, f.clave);
      if (!par) return;
      var item = par.materia.modulo.itemDeClave(f.clave, par.juego.id);
      if (!item) return;
      item.__juego = par.juego;
      item.__materia = par.materia.id;
      item.__clave = f.clave;
      modulos[par.materia.id] = par.materia.modulo;
      items.push(item);
    });

    /* Algunas materias necesitan ver el conjunto entero para terminar de
       armarse: geografía lo usa para achicar el mapa a la zona justa. */
    var porMateria = {};
    items.forEach(function (it) {
      (porMateria[it.__materia] = porMateria[it.__materia] || []).push(it);
    });
    Object.keys(porMateria).forEach(function (mid) {
      if (modulos[mid].ajustarContexto) modulos[mid].ajustarContexto(porMateria[mid]);
    });

    return Util.mezclar(items);
  }

  /** Corre el repaso con las reglas normales de una partida. */
  function jugar(items, ganchos) {
    Mezcla.jugar(items, { intentos: 3, mostrarResultado: true }, ganchos);
  }

  return {
    CANTIDAD: CANTIDAD,
    MINIMO: MINIMO,
    hayParaRepasar: hayParaRepasar,
    cuantosPendientes: cuantosPendientes,
    armarItems: armarItems,
    jugar: jugar
  };
})();
