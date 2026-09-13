/* ============================================================
   La voz: lee en voz alta las lecciones y las consignas.

   Usa la síntesis de voz del propio aparato (speechSynthesis), así que
   no hay archivos de audio que bajar ni nada que mandar a ningún lado.
   La contra es que la voz depende del aparato: un Android trae voces en
   castellano casi siempre; una compu sin el idioma instalado puede no
   traer ninguna. Si no hay síntesis, todo esto queda mudo y la app
   funciona igual.

   Lo que está marcado con lang="en" se lee con voz en inglés. Sin eso,
   la voz castellana lee «red» como «red» de pescar, que en una lección
   de inglés es enseñar mal.
   ============================================================ */
window.Voz = (function () {
  'use strict';

  var sintesis = window.speechSynthesis || null;
  var voces = [];
  var turno = 0;              // cada decir() nuevo deja sin efecto al anterior

  function cargarVoces() {
    try { voces = sintesis.getVoices() || []; } catch (e) { voces = []; }
  }
  if (sintesis) {
    cargarVoces();
    // en Chrome las voces llegan un rato después de cargar la página
    if (sintesis.addEventListener) sintesis.addEventListener('voiceschanged', cargarVoces);
  }

  /* El orden es de preferencia. Para castellano, primero el de acá y
     después los latinoamericanos, que suenan más cerca que el de España. */
  var PREFERIDAS = {
    es: ['es-ar', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl', 'es-es', 'es'],
    en: ['en-us', 'en-gb', 'en']
  };

  function vozPara(idioma) {
    var lista = PREFERIDAS[idioma] || PREFERIDAS.es;
    for (var i = 0; i < lista.length; i++) {
      var candidatas = voces.filter(function (v) {
        return String(v.lang).toLowerCase().replace('_', '-').indexOf(lista[i]) === 0;
      });
      if (candidatas.length) {
        // las del aparato andan sin internet, que es como se usa la app
        return candidatas.filter(function (v) { return v.localService; })[0] || candidatas[0];
      }
    }
    return null;
  }

  function hay() { return !!sintesis; }

  /** ¿Hay una voz en castellano instalada? Sin voces cargadas, no se sabe. */
  function tieneCastellano() {
    if (!sintesis) return false;
    cargarVoces();
    return !voces.length || !!vozPara('es');
  }

  /* Lo que no se tiene que decir: los dibujitos (una voz lee 🍎 como
     «manzana roja» y se pisa con la palabra de al lado), las comillas y
     los signos que en voz alta tienen nombre. */
  function limpiar(texto) {
    return String(texto)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/[«»"“”]/g, '')
      .replace(/_{2,}/g, ' … ')
      .replace(/(\d)\s*\+\s*(\d)/g, '$1 más $2')
      .replace(/(\d)\s*[−-]\s*(\d)/g, '$1 menos $2')
      .replace(/(\d)\s*[×x]\s*(\d)/g, '$1 por $2')
      .replace(/(\d)\s*÷\s*(\d)/g, '$1 dividido $2')
      .replace(/\s*=\s*/g, ' es igual a ')
      .replace(/→/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parte un pedazo de HTML en tramos de un mismo idioma. Sólo se usa
   * con el contenido de la app, nunca con algo que haya escrito alguien.
   */
  function tramos(html) {
    var caja = document.createElement('div');
    caja.innerHTML = html;
    var salida = [];

    function sumar(texto, idioma) {
      var ultimo = salida[salida.length - 1];
      if (ultimo && ultimo.idioma === idioma) ultimo.texto += texto;
      else salida.push({ texto: texto, idioma: idioma });
    }

    function recorrer(nodo, idioma) {
      if (nodo.nodeType === 3) return sumar(nodo.nodeValue, idioma);
      if (nodo.nodeType !== 1) return;
      var propio = nodo.getAttribute('lang');
      if (propio) idioma = propio.slice(0, 2).toLowerCase();
      if (nodo.tagName === 'BR') sumar('. ', idioma);
      Array.prototype.forEach.call(nodo.childNodes, function (h) { recorrer(h, idioma); });
    }

    recorrer(caja, 'es');
    return salida
      .map(function (t) { return { texto: limpiar(t.texto), idioma: t.idioma }; })
      .filter(function (t) { return /[0-9a-záéíóúñü]/i.test(t.texto); });
  }

  /* De a una oración por vez. Chrome de escritorio corta los textos que
     duran más de unos quince segundos, y una oración nunca llega. */
  function oraciones(texto) {
    return texto.match(/[^.!?;:]+[.!?;:]*/g) || [texto];
  }

  /** Corta lo que se esté diciendo. */
  function parar() {
    turno++;
    if (sintesis) { try { sintesis.cancel(); } catch (e) { /* nada */ } }
  }

  /**
   * Dice uno o varios pedazos de HTML, en orden.
   * `opciones.alTerminar` se llama cuando termina de hablar, salvo que
   * antes lo hayan cortado.
   */
  function decir(html, opciones) {
    opciones = opciones || {};
    if (!sintesis) return false;
    parar();
    var mio = turno;

    var frases = [];
    [].concat(html).forEach(function (h) {
      if (!h) return;
      tramos(h).forEach(function (t) {
        oraciones(t.texto).forEach(function (o) {
          if (o.trim()) frases.push({ texto: o.trim(), idioma: t.idioma });
        });
      });
    });
    if (!frases.length) return false;

    frases.forEach(function (f, i) {
      var u = new SpeechSynthesisUtterance(f.texto);
      var voz = vozPara(f.idioma);
      if (voz) u.voice = voz;
      u.lang = voz ? voz.lang : (f.idioma === 'en' ? 'en-US' : 'es-AR');
      // un poco más despacio que lo normal: la escuchan chicos
      u.rate = f.idioma === 'en' ? 0.85 : 0.95;
      u.pitch = 1.05;
      if (i === frases.length - 1) {
        u.onend = function () {
          if (mio === turno && opciones.alTerminar) opciones.alTerminar();
        };
      }
      sintesis.speak(u);
    });
    return true;
  }

  function leyendo() {
    return !!(sintesis && (sintesis.speaking || sintesis.pending));
  }

  /* En iPhone la primera frase tiene que salir de un toque del chico;
     la que sale de un cambio de pantalla no suena. Una frase vacía
     dicha en el primer toque destraba las siguientes. */
  function despertar() {
    if (!sintesis) return;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      sintesis.speak(u);
    } catch (e) { /* nada */ }
  }
  document.addEventListener('pointerdown', despertar, { once: true });

  return {
    hay: hay,
    tieneCastellano: tieneCastellano,
    decir: decir,
    parar: parar,
    leyendo: leyendo,
    tramos: tramos        // para las pruebas
  };
})();
