/* Guarda récords y preferencias en el navegador (localStorage).
   Si el navegador lo bloquea, todo sigue funcionando en memoria. */
window.Almacen = (function () {
  'use strict';

  var CLAVE = 'aprenderJugando.v1';
  var datos = { records: {}, estrellas: 0, sonido: true };

  try {
    var crudo = localStorage.getItem(CLAVE);
    if (crudo) {
      var leido = JSON.parse(crudo);
      if (leido && typeof leido === 'object') {
        datos.records   = leido.records   || {};
        datos.estrellas = leido.estrellas || 0;
        datos.sonido    = leido.sonido !== false;
      }
    }
  } catch (e) { /* modo incógnito o storage deshabilitado: seguimos en memoria */ }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* sin persistencia */ }
  }

  /** Récord guardado para una partida concreta (juego + zona + cantidad). */
  function record(clave) {
    return datos.records[clave] || { puntos: 0, aciertos: 0, total: 0, partidas: 0 };
  }

  /** Guarda el resultado; devuelve true si es un récord nuevo. */
  function anotar(clave, puntos, aciertos, total) {
    var previo = record(clave);
    var esRecord = puntos > previo.puntos;
    datos.records[clave] = {
      puntos:   Math.max(puntos, previo.puntos),
      aciertos: esRecord ? aciertos : previo.aciertos,
      total:    esRecord ? total : previo.total,
      partidas: previo.partidas + 1
    };
    guardar();
    return esRecord;
  }

  function estrellas() { return datos.estrellas; }

  function sumarEstrellas(n) {
    datos.estrellas += n;
    guardar();
    return datos.estrellas;
  }

  function sonidoActivo() { return datos.sonido; }

  function setSonido(v) { datos.sonido = !!v; guardar(); }

  /** Mejor puntaje de cualquier partida de un juego, para mostrar en la tarjeta. */
  function mejorDeJuego(juegoId) {
    var mejor = 0;
    Object.keys(datos.records).forEach(function (k) {
      if (k.indexOf(juegoId + ':') === 0) mejor = Math.max(mejor, datos.records[k].puntos);
    });
    return mejor;
  }

  function borrarTodo() {
    datos = { records: {}, estrellas: 0, sonido: datos.sonido };
    guardar();
  }

  return {
    record: record, anotar: anotar, estrellas: estrellas, sumarEstrellas: sumarEstrellas,
    sonidoActivo: sonidoActivo, setSonido: setSonido, mejorDeJuego: mejorDeJuego,
    borrarTodo: borrarTodo
  };
})();
