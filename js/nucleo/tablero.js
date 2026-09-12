/* ============================================================
   El tablero de preguntas con tarjetas: lo que comparten todos los
   juegos que se responden eligiendo una opción entre varias.

   Antes vivía escondido adentro de js/juegos/matematica.js, porque
   matemática era la única materia que lo usaba. Con Lengua y Ciencias
   son tres materias con el mismo tablero, así que sale a un lugar
   común en vez de copiarse tres veces.

   Tiene tres partes:

     1. Ayudantes para pintar una pregunta: la consigna, un dibujo
        opcional, y la botonera de respuestas con sus ganchos.

     2. banco(def): arma un juego entero a partir de una lista de
        preguntas escritas a mano. Es lo que usan casi todos los juegos
        de Lengua y Ciencias, que no generan preguntas sino que las
        tienen en una lista.

     3. materia(id, juegos): arma el módulo de una materia (el que
        app.js, el examen y el repaso esperan) a partir de sus juegos.

   Las claves de las preguntas nuevas son siempre 'juego:resto' —por
   ejemplo 'rimas:gato' o 'contar:7'—, así una clave dice sola de qué
   juego es y el repaso la puede rearmar sin adivinar.
   ============================================================ */
window.Tablero = (function () {
  'use strict';

  /* ======================== 1. pintar ======================== */

  function entero(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * Completa la lista de distractores sin repetir ni salirse de rango.
   * Si los candidatos no alcanzan, completa con números cercanos.
   */
  function distractores(correcto, candidatos, cuantos, minimo) {
    var vistos = {};
    vistos[correcto] = true;
    var salida = [];
    Util.mezclar(candidatos).forEach(function (n) {
      if (salida.length >= cuantos) return;
      if (n === null || n === undefined || vistos[n]) return;
      if (minimo !== undefined && n < minimo) return;
      vistos[n] = true;
      salida.push(n);
    });
    var paso = 1;
    while (salida.length < cuantos && paso < 40) {
      [correcto - paso, correcto + paso].forEach(function (n) {
        if (salida.length >= cuantos || vistos[n]) return;
        if (minimo !== undefined && n < minimo) return;
        vistos[n] = true;
        salida.push(n);
      });
      paso++;
    }
    return salida;
  }

  /** Esconde el mapa y muestra la botonera. */
  function preparar() {
    Util.$('zona-mapa').hidden = true;
    Util.$('zona-opciones').hidden = false;
  }

  function consigna(html) { Util.$('pregunta-texto').innerHTML = html; }

  /** El dibujo de la pregunta. Sin nada, se esconde. */
  function visual(html) {
    var caja = Util.$('pregunta-visual');
    if (!html) {
      caja.hidden = true;
      Util.vaciar(caja);
      return;
    }
    caja.innerHTML = html;
    caja.hidden = false;
  }

  /**
   * La botonera: la respuesta correcta mezclada con las malas.
   *
   *   forma     la clase del botón: 'texto' (número grande), 'palabra',
   *             'frase' (una oración, a todo el ancho) o 'emoji'
   *   mostrar   cómo se escribe cada valor (texto o un nodo)
   *   etiqueta  lo que lee un lector de pantalla, si el valor es un
   *             emoji que solo no se entiende
   */
  function respuestas(correcta, malas, config) {
    config = config || {};
    var lista = Util.mezclar(malas.concat([correcta])).map(function (v) {
      return { id: v, valor: v };
    });
    Opciones.armar(lista, {
      clase: config.forma || 'texto',
      contenido: function (o) {
        return config.mostrar ? config.mostrar(o.valor) : String(o.valor);
      },
      atributos: config.etiqueta ? function (o) {
        return { 'aria-label': config.etiqueta(o.valor) };
      } : null,
      alElegir: function (o) { Motor.responder(o.valor); }
    });
  }

  /** Saca las etiquetas de un pedazo de HTML, para textos del repaso. */
  function plano(html) {
    return String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Los ganchos de un juego de botonera. `correcta(item)` dice cuál era,
   * porque cada juego la guarda distinto.
   */
  function ganchos(correcta, textos) {
    textos = textos || {};
    return {
      esCorrecta: function (it, respuesta) { return respuesta === correcta(it); },
      alAcertar: function (it, respuesta) {
        Opciones.marcar(respuesta, 'correcta');
        Opciones.bloquear();
      },
      alFallar: function (it, respuesta) {
        Opciones.marcar(respuesta, 'incorrecta');
        var b = Opciones.boton(respuesta);
        if (b) b.disabled = true;
      },
      alRevelar: function (it) {
        Opciones.bloquear();
        Opciones.marcar(correcta(it), 'correcta');
      },
      alResponder: function (it, respuesta) {
        Opciones.marcar(respuesta, 'elegida');
        Opciones.bloquear();
      },
      textoFallo: textos.fallo || function () { return 'No es esa.'; },
      textoRevelado: textos.revelado || function (it) {
        return 'Era «' + plano(correcta(it)) + '».';
      }
    };
  }

  /* ======================== sorteo ======================== */

  /**
   * Saca `cantidad` preguntas de un pozo finito, dándole prioridad a lo
   * que el chico viene fallando. Si se piden más preguntas que ítems
   * tiene el pozo, se dan vueltas: dentro de cada vuelta no se repite.
   *
   * `sinPesar` es para el examen, que mide y no enseña: ahí el sorteo
   * es parejo.
   */
  function sortear(materiaId, pozo, cantidad, sinPesar) {
    if (!pozo.length) return [];
    var n = cantidad === 'todos' ? pozo.length : cantidad;
    function vuelta(k) {
      return sinPesar
        ? Util.muestra(pozo, k)
        : Util.muestraPesada(pozo, k, function (it) {
            return Almacen.pesoDe(materiaId, it.id);
          });
    }
    var salida = [];
    while (salida.length < n) {
      salida = salida.concat(vuelta(Math.min(pozo.length, n - salida.length)));
    }
    // copias: el examen y el repaso les cuelgan cosas a los ítems
    return salida.map(function (it) { return Object.assign({}, it); });
  }

  function cantidadesFijas() {
    return { lista: [5, 10, 20, 30], total: null, unidad: 'preguntas' };
  }

  /** Para una lista cerrada: 5, 10 (si alcanzan) y todas. */
  function cantidadesDeBanco(total) {
    var lista = [5, 10].filter(function (n) { return n < total; });
    lista.push('todos');
    return { lista: lista, total: total, unidad: 'preguntas' };
  }

  function resumenDeCantidad(sel) {
    return sel.cantidad === 'todos' ? 'todas las preguntas' : sel.cantidad + ' preguntas';
  }

  /* ======================== 2. banco ======================== */

  /**
   * Un juego armado a partir de una lista de preguntas escritas a mano.
   *
   *   def.items      [{ id, r, m?, ...lo que use la consigna }]
   *                    r  la respuesta correcta
   *                    m  respuestas malas propias (si no, se usan las
   *                       correctas de las otras preguntas, o las
   *                       categorías)
   *   def.consigna   function (item) -> HTML
   *   def.visual     function (item) -> HTML, opcional
   *   def.categorias lista fija de respuestas posibles (¿mamífero, ave,
   *                  pez…?); las malas salen de ahí
   *   def.excluir    function (item) -> respuestas que no pueden salir
   *                  como malas porque confundirían (la boca cuando la
   *                  respuesta es la lengua)
   *   def.cuantas    cuántas opciones en total (4 si no dice)
   *   def.forma, def.mostrar, def.etiqueta   ver respuestas()
   *   def.repaso     function (item) -> { simbolo, nombre, dato }
   *   def.textoFallo, def.textoRevelado
   */
  function banco(def) {
    var items = def.items.map(function (x) {
      var it = Object.assign({}, x);
      it.juego = def.id;
      it.id = def.id + ':' + x.id;
      return it;
    });
    var porId = {};
    items.forEach(function (it) { porId[it.id] = it; });

    function correcta(it) { return it.r; }

    function malasDe(it) {
      var cuantas = (def.cuantas || 4) - 1;
      var fuera = def.excluir ? def.excluir(it) : [];
      var pozo = def.categorias ? def.categorias.slice()
               : it.m ? it.m.slice()
               : items.map(function (o) { return o.r; });
      var vistos = {};
      vistos[it.r] = true;
      fuera.forEach(function (f) { vistos[f] = true; });
      pozo = pozo.filter(function (v) {
        if (vistos[v]) return false;
        vistos[v] = true;
        return true;
      });
      return Util.muestra(pozo, cuantas);
    }

    /* ---------------------- niveles ----------------------

       Un banco no se juega entero de una: se juega por niveles, y cada
       nivel es un pedazo con nombre. El nivel 1 de «Los animales» son
       los de casa, el 2 suma los de la granja, el 3 los salvajes. Cada
       uno incluye a los anteriores, así que jugar el 3 también repasa
       lo de antes.

       Cada nivel dice qué preguntas entran, de una de dos maneras:
         hasta   los primeros N de la lista
         filtro  una función sobre el ítem (por la respuesta, por la
                 categoría, por lo que sea)
       Sin ninguna de las dos, entran todas.

       Antes de esto la pantalla previa preguntaba «¿cuántas preguntas?
       5, 10 o todas», que es una pregunta de máquina: no dice nada de
       lo que hay adentro y un chico de cinco no tiene cómo contestarla. */
    var TOPE_NIVEL = 12;      // preguntas por partida, aunque el nivel tenga más

    var niveles = (def.niveles && def.niveles.length
                   ? def.niveles
                   : [{ nombre: 'Todas las preguntas' }]).map(function (n, i) {
      var pozo = items.filter(function (it, j) {
        if (n.filtro) return n.filtro(it);
        if (n.hasta) return j < n.hasta;
        return true;
      });
      return { id: 'n' + (i + 1), numero: i + 1, nombre: n.nombre, pozo: pozo };
    });
    var porNivel = {};
    niveles.forEach(function (n) { porNivel[n.id] = n; });

    /** El nivel elegido; sin nada elegido, el último (que los tiene todos). */
    function nivelDe(sel) {
      return porNivel[sel && sel.nivel] || niveles[niveles.length - 1];
    }

    function cuantasDe(nivel) { return Math.min(TOPE_NIVEL, nivel.pozo.length); }

    var juego = {
      id: def.id,
      nombre: def.nombre,
      icono: def.icono,
      color: def.color,
      suave: def.suave,
      texto: def.texto,
      edadMin: def.edadMin,
      edadMax: def.edadMax,

      opciones: function () {
        return [{
          id: 'nivel',
          esNivel: true,
          titulo: 'Elegí el nivel',
          tipo: 'grilla',
          porDefecto: niveles[0].id,
          items: niveles.map(function (n) {
            return { id: n.id, numero: n.numero, nombre: n.nombre,
                     cantidad: cuantasDe(n) };
          })
        }];
      },
      NIVELES: niveles,
      /* El examen entra sin nivel elegido y se lleva el banco entero:
         mide todo lo que el juego sabe preguntar, no un pedazo. */
      examen: function () { return { sinPesar: true }; },
      preguntas: function (sel) {
        var nivel = nivelDe(sel);
        return sortear(juego.materia, nivel.pozo, sel.cantidad || cuantasDe(nivel), sel.sinPesar);
      },
      resumen: function (sel) {
        var nivel = nivelDe(sel);
        return 'Nivel ' + nivel.numero + ' · ' + nivel.nombre;
      },
      montar: function (it) {
        preparar();
        consigna(def.consigna(it));
        visual(def.visual ? def.visual(it) : null);
        respuestas(it.r, malasDe(it), {
          forma: def.forma, mostrar: def.mostrar, etiqueta: def.etiqueta
        });
      },
      ganchos: function () {
        return ganchos(correcta, { fallo: def.textoFallo, revelado: def.textoRevelado });
      },
      deClave: function (resto) {
        var it = porId[def.id + ':' + resto];
        return it ? Object.assign({}, it) : null;
      },
      repaso: function (it) {
        if (def.repaso) return def.repaso(it);
        return { simbolo: def.simbolo || '•', nombre: plano(def.consigna(it)),
                 dato: 'Era ' + plano(it.r) };
      },
      /** Para las pruebas: la lista entera, ya con sus claves. */
      ITEMS: items,
      malasDe: malasDe
    };
    return juego;
  }

  /* ======================== 3. materia ======================== */

  /** El jugar() de siempre: armar las preguntas y arrancar el motor. */
  function conJugar(juego) {
    if (juego.jugar) return;
    juego.jugar = function (sel, extra) {
      var items = juego.preguntas(sel);
      juego.montar(items[0]);
      Motor.jugar(Object.assign({
        items: items,
        render: function (item) { juego.montar(item); }
      }, juego.ganchos(), extra));
    };
  }

  /**
   * El módulo de una materia, con lo que esperan app.js, el examen y el
   * repaso: la lista de juegos y cómo ir y volver de una clave.
   */
  function materia(id, juegos) {
    var porId = {};
    juegos.forEach(function (j) {
      j.materia = id;
      porId[j.id] = j;
      conJugar(j);
    });

    function juegoDe(clave) {
      var p = String(clave).indexOf(':');
      return p > 0 ? porId[clave.slice(0, p)] || null : null;
    }

    return {
      id: id,
      JUEGOS: juegos,
      claveItem: function (item) { return item.id; },
      /* Cada pregunta la sabe dibujar un solo juego: una rima puesta en
         el tablero de sílabas no tendría sentido. Si ese juego está
         trabado, el repaso saltea la pregunta. */
      juegoDeClave: function (clave) {
        var j = juegoDe(clave);
        return j ? j.id : null;
      },
      itemDeClave: function (clave) {
        var j = juegoDe(clave);
        return j && j.deClave ? j.deClave(clave.slice(j.id.length + 1)) : null;
      },
      repaso: function (item) {
        var j = porId[item.juego] || juegoDe(item.id);
        return j ? j.repaso(item) : { simbolo: '•', nombre: String(item.id), dato: '' };
      },
      limpiar: function () {}
    };
  }

  return {
    entero: entero,
    distractores: distractores,
    preparar: preparar,
    consigna: consigna,
    visual: visual,
    respuestas: respuestas,
    ganchos: ganchos,
    plano: plano,
    sortear: sortear,
    cantidadesFijas: cantidadesFijas,
    cantidadesDeBanco: cantidadesDeBanco,
    resumenDeCantidad: resumenDeCantidad,
    banco: banco,
    conJugar: conJugar,
    materia: materia
  };
})();
