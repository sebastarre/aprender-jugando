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

  /**
   * El mismo color pero lavado hacia el blanco, para los fondos.
   *
   * Es el gemelo de `oscurecer`: uno baja hacia el negro para el
   * escaloncito y el otro sube hacia el blanco para el relleno. Con los
   * dos, un juego sigue trayendo un solo color escrito a mano y de ahí
   * salen el círculo pleno, el fondo pastel de la ficha, su filo y su
   * escalón, todos de la misma familia.
   *
   * `cuanto` es cuánto blanco se le mete: .86 es un pastel bien suave
   * (la ficha entera), .70 un filo que se nota, .52 un escalón.
   */
  function aclarar(hex, cuanto) {
    var c = String(hex).replace('#', '');
    if (c.length !== 6) return hex;
    var f = cuanto == null ? 0.86 : cuanto;
    var p = [0, 2, 4].map(function (i) {
      var v = parseInt(c.substr(i, 2), 16);
      return Math.round(v + (255 - v) * f);
    });
    return '#' + p.map(function (x) {
      return Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0');
    }).join('');
  }

  /* La claridad de un color como la mide la norma de accesibilidad, y
     la relación de contraste entre dos. Es la cuenta de WCAG tal cual:
     se deshace la corrección gamma de cada canal, se pesan según lo que
     ve el ojo (el verde mucho, el azul poco) y se comparan las dos
     claridades con el más 0,05 que evita dividir por cero. */
  function claridad(hex) {
    var c = String(hex).replace('#', '');
    var p = [0, 2, 4].map(function (i) {
      var v = parseInt(c.substr(i, 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  }

  function contraste(a, b) {
    var la = claridad(a), lb = claridad(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /**
   * Los tres tonos del cartel grande de un juego, sacados de su color.
   *
   * El problema: el cartel lleva texto, y el texto pide 4,5:1. Durante
   * mucho tiempo se resolvía oscureciendo el color hasta que aguantara
   * letra blanca, pero oscurecer un naranja da marrón y los juegos de
   * Lengua abrían con un cartel color barro. Al revés funciona mejor:
   * el cartel va del tono VIVO y la letra va oscura encima.
   *
   * Cuánto aclarar no se puede poner a ojo igual para los quince
   * colores de juego que hay: un índigo aguanta mucho menos que un
   * amarillo. Así que se prueba de a poco, del más saturado al más
   * lavado, y se corta en el primero que llega a 4,6:1 contra su propia
   * letra. Cada color queda lo más vivo que su letra le permite.
   *
   *   vivo   el fondo del cartel
   *   claro  el arranque del degradado, arriba (nunca es el más oscuro:
   *          si el cartel se oscureciera hacia abajo, el renglón de
   *          abajo perdería justo el contraste que se midió)
   *   tinta  la letra
   */
  function cartel(hex) {
    var tinta = oscurecer(hex, 0.26);
    for (var f = 0.06; f <= 0.5; f += 0.02) {
      var vivo = aclarar(hex, f);
      if (contraste(vivo, tinta) >= 4.6) {
        return { vivo: vivo, claro: aclarar(hex, Math.min(f + 0.18, 0.62)), tinta: tinta };
      }
    }
    return { vivo: aclarar(hex, 0.5), claro: aclarar(hex, 0.66), tinta: tinta };
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

  /** Que una cuenta no se parta entre dos renglones: «12 − 7 = 5» va
      entera, con espacios que no cortan alrededor de cada signo. */
  function cuentasEnteras(texto) {
    return String(texto).replace(/(\d)\s([+\u2212\u00d7\u00f7=])\s(?=\d)/g, '$1\u00a0$2\u00a0');
  }

  return {
    mezclar: mezclar, muestra: muestra, muestraPesada: muestraPesada,
    alAzar: alAzar, unaDe: unaDe,
    limitar: limitar, $: $, crear: crear, vaciar: vaciar,
    oscurecer: oscurecer, aclarar: aclarar,
    contraste: contraste, cartel: cartel,
    escapar: escapar, bandera: bandera, esperar: esperar, plural: plural,
    cuentasEnteras: cuentasEnteras
  };
})();
