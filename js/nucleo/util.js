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

  /**
   * Como muestra(), pero los que pesan más salen más seguido.
   * `peso(item)` devuelve un número mayor que cero; se sortea sin repetir,
   * así que una partida nunca trae dos veces la misma pregunta.
   *
   * Se usa para que lo que el chico falla vuelva a aparecer antes que lo que
   * ya sabe. Ningún peso puede ser 0: hasta lo más sabido tiene que poder
   * salir, si no un país aprendido no se vuelve a ver nunca.
   */
  function muestraPesada(arr, n, peso) {
    var quedan = arr.slice();
    var pesos = quedan.map(function (x) { return Math.max(0.0001, peso(x)); });
    var total = pesos.reduce(function (a, b) { return a + b; }, 0);
    var salida = [];
    var cuantos = Math.min(n, quedan.length);

    for (var k = 0; k < cuantos; k++) {
      var dardo = Math.random() * total;
      var i = 0;
      while (i < quedan.length - 1 && dardo > pesos[i]) { dardo -= pesos[i]; i++; }
      salida.push(quedan[i]);
      total -= pesos[i];
      quedan.splice(i, 1);
      pesos.splice(i, 1);
    }
    return salida;
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

  /**
   * Un tono más oscuro del mismo color, para el escaloncito de abajo.
   *
   * Cada juego trae un color propio escrito a mano; el escalón tiene que
   * ser ese mismo color pero más oscuro, no un gris. Calcularlo acá
   * evita tener que escribir dos colores por juego y que se
   * desincronicen cuando alguien cambia uno solo.
   *
   * `cuanto` es cuánto queda del original: .78 es un escalón que se ve
   * sin ensuciar.
   */
  function oscurecer(hex, cuanto) {
    var c = String(hex).replace('#', '');
    if (c.length !== 6) return hex;
    var f = cuanto == null ? 0.78 : cuanto;
    var p = [0, 2, 4].map(function (i) {
      return Math.round(parseInt(c.substr(i, 2), 16) * f);
    });
    return '#' + p.map(function (x) {
      return Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0');
    }).join('');
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
    mezclar: mezclar, muestra: muestra, muestraPesada: muestraPesada,
    alAzar: alAzar, unaDe: unaDe,
    limitar: limitar, $: $, crear: crear, vaciar: vaciar, oscurecer: oscurecer,
    escapar: escapar, bandera: bandera, esperar: esperar, plural: plural
  };
})();
