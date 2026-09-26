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
    es: ['es-ar', 'es-uy', 'es-419', 'es-us', 'es-mx', 'es-co', 'es-cl', 'es-es', 'es'],
    en: ['en-us', 'en-gb', 'en']
  };

  /* ------------------------------------------------------------
     Cuál voz elegir

     Antes se usaba la primera voz en castellano que apareciera, y en
     Windows la primera suele ser «Raúl»: un varón robótico y grave que,
     leyendo una lección para chicos, sonaba tétrico. Ahora cada voz del
     aparato recibe un puntaje y gana la más alta:

       natural   las voces «Natural», «Neural», «Online», «Premium»,
                 «Mejorada», las de Google y Siri, y en general las que
                 no son del aparato. Son las que suenan a persona y no a
                 contestador. Pesan más que todo lo demás.
       mujer     a los chicos chicos les llegan mejor las voces de mujer,
                 que es lo que usan casi todas las apps y dibujos para
                 esta edad. El nombre no siempre lo dice, así que se
                 reconocen los nombres de las voces que traen Windows,
                 Edge, Chrome, Android, iPhone y Mac; un varón reconocido
                 resta.
       acento    Argentina primero, después el resto de Latinoamérica y
                 España al final. Cuenta, pero menos que las dos de arriba:
                 una voz natural de mujer mexicana es mejor que un robot
                 argentino.
       internet  las naturales casi siempre necesitan conexión. Sin
                 internet se descartan, y si una falla a mitad de camino
                 queda anotada como rota y se repite todo con otra.

     El padre puede elegir otra en Configuración; lo elegido gana sobre
     el puntaje mientras esa voz exista en el aparato.
     ------------------------------------------------------------ */
  var NATURAL = /natural|neural|online|premium|enhanced|mejorada|google|siri/i;

  var MUJERES = ('elena dalia paloma sabina helena laura elvira salome salomé catalina ' +
    'camila valentina paulina monica mónica marisol luciana isabela lupe penelope ' +
    'penélope conchita lucia lucía ximena renata beatriz francisca karla andrea ' +
    'belkys estrella irene abril arabella elsa lia marta nuria sofia sofía tania ' +
    'teresa vera yolanda carlota candela maria maría ana carmen emilia luisa silvia ' +
    'soledad alba julieta susana tatiana angelica esperanza ' +
    'aria jenny ava emma michelle samantha zira susan hazel libby sonia karen moira ' +
    'tessa serena allison joanna kendra kimberly salli ivy amy olivia catherine ' +
    'natasha clara fiona victoria jane nancy sara sarah female mujer').split(' ');

  var VARONES = ('raul raúl tomas tomás jorge pablo alvaro álvaro gonzalo diego juan ' +
    'carlos andres andrés lorenzo emilio gerardo federico mateo alonso enrique miguel ' +
    'arnau dario darío elias saul saúl sergio cecilio jose josé luis manuel rodrigo ' +
    'victor víctor yago alex mark david guy christopher eric ryan daniel fred tom ' +
    'oliver george james brian joey justin matthew rishi male hombre').split(' ');

  var rotas = {};   // voces de internet que fallaron en esta sesión

  function palabras(nombre) {
    return String(nombre).toLowerCase().split(/[^a-záéíóúñü]+/);
  }

  /** true si es voz de mujer, false si es de varón, null si no se sabe. */
  function esMujer(v) {
    var p = palabras(v.name);
    if (p.some(function (x) { return VARONES.indexOf(x) >= 0; })) return false;
    // las de Google en castellano son todas de mujer y no lo dicen
    if (/^google/i.test(v.name) && /^es/i.test(v.lang)) return true;
    if (p.some(function (x) { return MUJERES.indexOf(x) >= 0; })) return true;
    return null;
  }

  function esNatural(v) { return NATURAL.test(v.name) || !v.localService; }

  function idiomaDe(v) { return String(v.lang).toLowerCase().replace('_', '-'); }

  function puntaje(v, idioma) {
    var lista = PREFERIDAS[idioma] || PREFERIDAS.es;
    var lang = idiomaDe(v);
    var lugar = -1;
    for (var i = 0; i < lista.length; i++) {
      if (lang.indexOf(lista[i]) === 0) { lugar = i; break; }
    }
    if (lugar < 0 || rotas[v.name]) return -Infinity;
    if (navigator.onLine === false && !v.localService) return -Infinity;

    var p = (lista.length - lugar) * 4;              // el acento: de 4 a 36
    if (esNatural(v)) p += 100;
    var mujer = esMujer(v);
    if (mujer === true) p += 60;
    if (mujer === false) p -= 60;
    if (v.localService) p += 2;                      // desempate: anda sin red
    return p;
  }

  /** Las voces de un idioma, de la mejor a la peor. */
  function ordenadas(idioma) {
    return voces
      .map(function (v) { return { v: v, p: puntaje(v, idioma) }; })
      .filter(function (x) { return x.p > -Infinity; })
      .sort(function (a, b) { return b.p - a.p; })
      .map(function (x) { return x.v; });
  }

  function vozPara(idioma) {
    var lista = ordenadas(idioma);
    if (idioma === 'es' && window.Almacen && Almacen.vozElegida) {
      var nombre = Almacen.vozElegida();
      var esa = nombre && lista.filter(function (v) { return v.name === nombre; })[0];
      if (esa) return esa;
    }
    return lista[0] || null;
  }

  /* Para Configuración: cada voz en castellano con un nombre que se
     entienda. Los nombres crudos son cosas como «Microsoft Elena Online
     (Natural) - Spanish (Argentina)» o, en Android, «es-us-x-sfb-local». */
  var PAISES = {
    ar: 'Argentina', uy: 'Uruguay', cl: 'Chile', mx: 'México', us: 'Estados Unidos',
    co: 'Colombia', pe: 'Perú', ve: 'Venezuela', es: 'España', '419': 'Latinoamérica',
    bo: 'Bolivia', py: 'Paraguay', ec: 'Ecuador', cr: 'Costa Rica', pr: 'Puerto Rico'
  };

  function nombreLindo(v, n) {
    var crudo = String(v.name);
    if (/^[a-z]{2,3}[-_][a-z0-9]{2,3}[-_]x[-_]/i.test(crudo) || /-language$/i.test(crudo)) return 'Voz ' + n;
    if (/^google/i.test(crudo)) return 'Google';
    var limpio = crudo.split(' - ')[0]
      .replace(/microsoft|online|\(natural\)|desktop|premium|enhanced|mejorada/gi, '')
      .replace(/\s+/g, ' ').trim();
    return limpio || ('Voz ' + n);
  }

  function opciones() {
    cargarVoces();
    return ordenadas('es').map(function (v, i) {
      return {
        id: v.name,
        nombre: nombreLindo(v, i + 1),
        pais: PAISES[idiomaDe(v).split('-')[1]] || '',
        natural: esNatural(v),
        mujer: esMujer(v),
        conRed: !v.localService
      };
    });
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
   * `opciones.alEmpezarParte(i)` se llama cuando empieza a decir el
   * pedazo número i de la lista: es lo que usa el juego para marcar cada
   * respuesta mientras la lee.
   * `opciones.pausa` (en segundos, sólo con alEmpezarParte) deja un
   * silencio corto entre pedazo y pedazo.
   */
  function decir(html, opciones) {
    opciones = opciones || {};
    if (!sintesis) return false;
    parar();
    var mio = turno;

    var frases = [];
    [].concat(html).forEach(function (h, parte) {
      if (!h) return;
      var primera = true;
      tramos(h).forEach(function (t) {
        oraciones(t.texto).forEach(function (o) {
          if (!o.trim()) return;
          frases.push({ texto: o.trim(), idioma: t.idioma, parte: parte, empieza: primera });
          primera = false;
        });
      });
    });
    if (!frases.length) return false;

    frases.forEach(function (f, i) {
      if (opciones.alEmpezarParte && f.empieza && i > 0 && opciones.pausa) {
        /* Un silencio: una frase vacía con volumen cero no suena en todos
           los aparatos, así que va una coma, que las voces leen como pausa. */
        var silencio = new SpeechSynthesisUtterance(',');
        silencio.volume = 0;
        silencio.rate = 0.6;
        sintesis.speak(silencio);
      }
      var u = new SpeechSynthesisUtterance(f.texto);
      var voz = vozPara(f.idioma);
      if (voz) u.voice = voz;
      u.lang = voz ? voz.lang : (f.idioma === 'en' ? 'en-US' : 'es-AR');
      // un poco más despacio que lo normal: la escuchan chicos
      u.rate = f.idioma === 'en' ? 0.85 : 0.95;
      /* A las voces naturales no se les toca el tono: subidas de tono
         desafinan, como una grabación acelerada. A las robóticas un
         poquito más agudo las hace sonar menos serias. */
      u.pitch = voz && esNatural(voz) ? 1 : 1.08;
      if (opciones.alEmpezarParte && f.empieza) {
        u.onstart = function () {
          if (mio === turno) opciones.alEmpezarParte(f.parte);
        };
      }
      /* Si una voz de internet falla (se cortó la conexión, el servidor
         no contestó), se anota como rota y se dice todo de nuevo con la
         siguiente. Cortar a propósito también dispara el error, pero con
         otro código y con el turno ya cambiado. */
      u.onerror = function (ev) {
        var motivo = ev && ev.error;
        if (mio !== turno || motivo === 'interrupted' || motivo === 'canceled') return;
        if (voz && !voz.localService && !rotas[voz.name]) {
          rotas[voz.name] = true;
          decir(html, opciones);
        }
      };
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
    opciones: opciones,
    tramos: tramos        // para las pruebas
  };
})();
