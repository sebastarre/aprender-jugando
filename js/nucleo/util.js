/* Utilidades chiquitas compartidas por toda la página. */
window.Util = (function () {
  'use strict';

  /** Mezcla una copia del arreglo (Fisher-Yates). */
  function mezclar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** Toma n elementos al azar, sin repetir. */
  function muestra(arr, n) {
    return mezclar(arr).slice(0, Math.min(n, arr.length));
  }

  function alAzar(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function limitar(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  /** Elige un elemento de la lista con una probabilidad fija. */
  function unaDe(lista) { return alAzar(lista); }

  /** document.getElementById abreviado. */
  function $(id) { return document.getElementById(id); }

  /** Crea un elemento con clase, texto y atributos. */
  function crear(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  /** Vacía un contenedor. */
  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  /** Escapa texto para insertarlo dentro de HTML. */
  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Ruta al archivo de bandera de un país (código ISO de 2 letras). */
  function bandera(id) {
    return 'assets/banderas/' + String(id).toLowerCase() + '.png';
  }

  /** "1 partida" / "3 partidas", sin tener que repetirlo en cada pantalla. */
  function plural(n, singular, plural_) {
    return n + ' ' + (n === 1 ? singular : (plural_ || singular + 's'));
  }

  /** Promesa que se resuelve después de ms milisegundos. */
  function esperar(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  return {
    mezclar: mezclar, muestra: muestra, alAzar: alAzar, unaDe: unaDe,
    limitar: limitar, $: $, crear: crear, vaciar: vaciar,
    escapar: escapar, bandera: bandera, esperar: esperar, plural: plural
  };
})();
