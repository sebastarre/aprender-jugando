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
    /* Las cuentas de los más grandes se escriben en vez de elegirse (una
       sí y una no, y todas en los desafíos): elegir entre cuatro números
       deja adivinar por descarte, escribir obliga a hacer la cuenta. */
    if (config.numerico && usarTeclado()) return teclado(correcta, config);
    var lista = Util.mezclar(malas.concat([correcta])).map(function (v) {
      return { id: v, valor: v };
    });
    Opciones.armar(lista, {
      clase: config.forma || 'texto',
      pizarra: config.pizarra,
      contenido: function (o) {
        return config.mostrar ? config.mostrar(o.valor) : String(o.valor);
      },
      atributos: config.etiqueta ? function (o) {
        return { 'aria-label': config.etiqueta(o.valor) };
      } : null,
      alElegir: function (o) { Motor.responder(o.valor); }
    });
  }

  /* ---------------------- el teclado de números ----------------------

     Cuándo se escribe la respuesta lo decide app.js al arrancar cada
     partida, según la edad del que juega:
       'nunca'    de 4 a 7: con tarjetas, como siempre
       'alterno'  de 8 a 12: una pregunta con tarjetas y la otra escrita
       'siempre'  de 8 a 12, en los desafíos
     Se decide por el número de pregunta y no con un contador, porque la
     primera pregunta se arma dos veces (antes y al arrancar el motor). */
  var modoTeclado = 'nunca';

  function elegirTeclado(modo) { modoTeclado = modo || 'nunca'; }

  function usarTeclado() {
    if (modoTeclado === 'siempre') return true;
    if (modoTeclado === 'alterno') return Motor.indiceActual() % 2 === 1;
    return false;
  }

  function teclado(correcta, config) {
    var largo = Math.min(5, String(correcta).length + 1);
    var escrito = '';
    var estado = '';          // '', 'correcta', 'incorrecta', 'elegida'
    var bloqueado = false;

    var caja = Util.crear('div', 'teclado');
    caja.setAttribute('role', 'group');
    caja.setAttribute('aria-label', 'Escribí la respuesta');
    var pantalla = Util.crear('div', 'teclado-pantalla');
    pantalla.setAttribute('aria-live', 'polite');
    var numero = Util.crear('span', 'teclado-numero');
    pantalla.appendChild(numero);
    caja.appendChild(pantalla);

    var teclas = Util.crear('div', 'teclado-teclas');
    var listo;
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'borrar', '0', 'listo'].forEach(function (t) {
      var b = Util.crear('button', 'tecla' + (t === 'listo' ? ' tecla-listo' : t === 'borrar' ? ' tecla-borrar' : ''));
      b.type = 'button';
      if (t === 'borrar') {
        b.setAttribute('aria-label', 'Borrar');
        b.appendChild(Iconos.crear('retroceso'));
      } else if (t === 'listo') {
        b.setAttribute('aria-label', 'Listo, contestar');
        b.appendChild(Iconos.crear('tilde'));
        listo = b;
      } else {
        b.textContent = t;
      }
      b.addEventListener('click', function () { apretar(t); });
      teclas.appendChild(b);
    });
    caja.appendChild(teclas);

    var zona = Util.$('zona-opciones');
    Util.vaciar(zona);
    zona.setAttribute('data-columnas', '1');
    zona.setAttribute('data-forma', 'teclado');
    zona.appendChild(caja);

    function pintar() {
      numero.textContent = escrito || '?';
      pantalla.className = 'teclado-pantalla' + (estado ? ' ' + estado : '') + (escrito ? '' : ' vacia');
      listo.disabled = bloqueado || !escrito || estado === 'correcta';
    }

    function apretar(t) {
      if (bloqueado || !Motor.libre()) return;
      // después de un error, lo próximo que escribe empieza de cero
      if (estado === 'incorrecta') { escrito = ''; estado = ''; }
      if (t === 'borrar') escrito = escrito.slice(0, -1);
      else if (t === 'listo') {
        if (!escrito) return;
        return Motor.responder(parseInt(escrito, 10));
      } else if (escrito.length < largo) {
        escrito = escrito === '0' ? t : escrito + t;
      }
      Sonido.tocar('clic');
      pintar();
    }

    /* También con el teclado de la compu: los números, borrar y Enter. */
    function conTeclas(ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (/^[0-9]$/.test(ev.key)) apretar(ev.key);
      else if (ev.key === 'Backspace') apretar('borrar');
      else if (ev.key === 'Enter') apretar('listo');
      else return;
      ev.preventDefault();
    }
    document.addEventListener('keydown', conTeclas);

    Opciones.usar({
      marcar: function (id, clase) {
        // al acertar y al mostrar la que era se ve el número correcto
        if (clase === 'correcta') escrito = String(id);
        estado = clase;
        pintar();
      },
      bloquear: function () {
        bloqueado = true;
        teclas.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        pintar();
      },
      desarmar: function () { document.removeEventListener('keydown', conTeclas); }
    }, config.pizarra);
    pintar();
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
      // la ayuda de cada intento fallado; sin pista, el aviso de siempre
      pista: textos.pista || null,
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

  /* ---------------------- el mapa: piezas comunes ---------------------- */

  /**
   * Dónde van los desafíos en un mapa de `largo` niveles: cada cinco, y
   * siempre el último. Si el último cae pegado a uno de los de cada cinco
   * (el 15 de un mapa de 16), ése se saca: dos desafíos seguidos no.
   */
  function posicionesDeDesafio(largo) {
    var lista = [];
    for (var k = 5; k < largo; k += 5) if (largo - k >= 3) lista.push(k);
    lista.push(largo);
    return lista;
  }

  /** Reparte `n` lugares según los pesos, con uno por lo menos para cada uno. */
  function repartir(n, pesos) {
    var cupos = pesos.map(function () { return 1; });
    var resto = n - pesos.length;
    var suma = pesos.reduce(function (a, b) { return a + b; }, 0) || 1;
    var ideales = pesos.map(function (p) { return p / suma * resto; });
    cupos = cupos.map(function (c, i) { return c + Math.floor(ideales[i]); });
    var faltan = n - cupos.reduce(function (a, b) { return a + b; }, 0);
    // lo que falta va a los que más cerca quedaron del próximo entero
    var orden = ideales.map(function (v, i) { return { i: i, r: v - Math.floor(v) }; })
      .sort(function (a, b) { return b.r - a.r; });
    for (var k = 0; k < faltan; k++) cupos[orden[k % orden.length].i]++;
    return cupos;
  }

  /** Corta una lista en `partes` pedazos seguidos, lo más parejos posible. */
  function partir(lista, partes) {
    var salida = [], desde = 0;
    for (var p = 0; p < partes; p++) {
      var tam = Math.floor((lista.length - desde) / (partes - p));
      salida.push(lista.slice(desde, desde + tam));
      desde += tam;
    }
    return salida.filter(function (s) { return s.length; });
  }

  /** «rojo, azul y verde»; con muchos, los tres primeros y «…». */
  function resumirNombres(nombres) {
    var limpios = nombres.map(function (n) { return plano(n); });
    if (limpios.length > 4) return limpios.slice(0, 3).join(', ') + '…';
    if (limpios.length < 2) return limpios.join('');
    return limpios.slice(0, -1).join(', ') + ' y ' + limpios[limpios.length - 1];
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
   *   def.pista      function (item, intento) -> la ayuda de ese intento (1 o 2)
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

    /* ---------------------- el mapa de niveles ----------------------

       El camino de niveles, como en los juegos de mapa: cada nivel
       presenta unas pocas cosas nuevas (dos, tres, cuatro) y repasa lo
       anterior, y cada cinco niveles hay un desafío con todo lo visto.

       Sale de las etapas de arriba (los animales de casa, después los de
       la granja…): el orden de lo que se enseña lo decide cada juego, y
       el mapa sólo lo corta en pedazos del tamaño de un nivel. Cuántos
       niveles tiene depende de cuánto hay para aprender: un juego de diez
       palabras no puede tener veinte niveles sin repetirse, y uno de
       cincuenta no entra en diez sin que cada nivel sea una montaña. */
    var mapaArmado = null;

    function nombreDe(it) {
      if (def.repaso) return def.repaso(it).nombre;
      return plano(it.r);
    }

    /* Cómo se nombra lo que trae un nivel. Casi siempre, como en el
       repaso («el perro», «rima con gato»); pero cuando eso es la
       pregunta entera («¿Con qué sentimos el gusto de la comida?») o es
       igual para todos («Se escribe»), no dice nada, y va la respuesta. */
    function nombresDe(lista) {
      var nombres = lista.map(function (it) { return plano(nombreDe(it)); });
      var repetidos = nombres.some(function (n, i) { return nombres.indexOf(n) !== i; });
      var largos = nombres.some(function (n) { return n.length > 24; });
      return repetidos || largos ? lista.map(function (it) { return plano(it.r); }) : nombres;
    }

    function armarMapa() {
      if (mapaArmado) return mapaArmado;
      var op = def.mapa || {};

      // lo nuevo de cada etapa: cada nivel del banco incluye a los anteriores
      var vistos = {};
      var etapas = niveles.map(function (n) {
        var nuevos = n.pozo.filter(function (it) {
          if (vistos[it.id]) return false;
          vistos[it.id] = true;
          return true;
        });
        return { nombre: n.nombre, nuevos: nuevos };
      }).filter(function (e) { return e.nuevos.length; });

      var total = items.length;
      var largo = op.niveles || (total <= 12 ? 10 : total <= 16 ? 12 : total <= 24 ? 14 : total <= 35 ? 16 : 18);
      var tests = posicionesDeDesafio(largo);
      var aprender = largo - tests.length;

      /* Los niveles de aprender se reparten entre las etapas según cuánto
         trae cada una, con uno por lo menos. */
      var cupos = repartir(aprender, etapas.map(function (e) { return e.nuevos.length; }));
      var TAMANO_MINIMO = op.minimo || 2;

      var pasos = [];                       // los niveles de aprender, en orden
      var presentados = [];                 // lo visto hasta cada nivel
      etapas.forEach(function (etapa, k) {
        var cupo = cupos[k];
        var partes = Math.max(1, Math.min(cupo, Math.floor(etapa.nuevos.length / TAMANO_MINIMO)));
        var trozos = partir(etapa.nuevos, partes);
        trozos.forEach(function (trozo, j) {
          presentados = presentados.concat(trozo);
          pasos.push({
            etapa: etapa.nombre,
            nombre: trozos.length > 1 ? etapa.nombre + ' · ' + (j + 1) : etapa.nombre,
            nuevos: trozo,
            vistos: presentados.slice()
          });
        });
        // si sobran niveles para esta etapa, son repasos de lo que trajo
        for (var r = partes; r < cupo; r++) {
          pasos.push({
            etapa: etapa.nombre,
            nombre: 'Repaso: ' + etapa.nombre.charAt(0).toLowerCase() + etapa.nombre.slice(1),
            nuevos: [],
            repasa: etapa.nuevos.slice(),
            vistos: presentados.slice()
          });
        }
      });

      var lista = [];
      var i = 0;
      for (var numero = 1; numero <= largo; numero++) {
        if (tests.indexOf(numero) >= 0 || i >= pasos.length) {
          var hasta = lista.length ? lista[lista.length - 1].vistos : pasos[0].vistos;
          var esFinal = numero === largo;
          lista.push(nivelDeDesafio(numero, esFinal, hasta));
        } else {
          lista.push(nivelDeAprender(numero, pasos[i]));
          i++;
        }
      }
      mapaArmado = lista;
      return lista;
    }

    function nivelDeAprender(numero, paso) {
      var nombres = nombresDe(paso.nuevos.length ? paso.nuevos : paso.repasa);
      return {
        numero: numero,
        nombre: paso.nombre,
        etapa: paso.etapa,
        detalle: paso.nuevos.length
          ? 'Nuevo: ' + resumirNombres(nombres)
          : 'Repasar: ' + resumirNombres(nombres),
        test: false,
        vistos: paso.vistos,
        nuevos: paso.nuevos,
        preguntas: function () {
          /* Todo lo nuevo sale, y el resto del nivel es repaso de lo de
             antes (cargado hacia lo que le cuesta). Un nivel de pocas cosas
             las repite: el primero de todos tiene que durar algo. */
          var cantidad = Math.min(8, Math.max(6, paso.nuevos.length + 3));
          var base = paso.nuevos.length ? paso.nuevos : paso.repasa;
          var viejos = paso.vistos.filter(function (it) { return base.indexOf(it) < 0; });
          // lo nuevo sale entero; un repaso de una etapa grande, hasta completar el nivel
          var salen = sortear(juego.materia, base, Math.min(base.length, cantidad), !paso.repasa);
          if (viejos.length) {
            salen = salen.concat(sortear(juego.materia, viejos, Math.max(0, cantidad - salen.length)));
          }
          if (salen.length < cantidad) {
            salen = salen.concat(sortear(juego.materia, base, cantidad - salen.length));
          }
          return Util.mezclar(salen);
        }
      };
    }

    function nivelDeDesafio(numero, esFinal, hasta) {
      return {
        numero: numero,
        nombre: esFinal ? 'Gran desafío' : 'Desafío',
        etapa: null,
        detalle: esFinal ? 'Todo lo del juego' : 'Todo lo que viste hasta acá',
        test: true,
        vistos: hasta,
        preguntas: function () {
          return sortear(juego.materia, hasta, Math.min(10, Math.max(6, hasta.length)), true);
        }
      };
    }

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
      mapa: armarMapa,
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
      /* Un juego puede armar la pregunta a su manera (def.montar recibe
         la manera de siempre como `base`, por si la quiere usar) y colgarle
         cosas después (def.alMontar): así Inglés alterna entre «¿cómo se
         dice?» y «¿dónde está?», y Sílabas suma las palmas. */
      montar: function (it) {
        preparar();
        consigna(def.consigna(it));
        visual(def.visual ? def.visual(it) : null);
        function base() {
          respuestas(it.r, malasDe(it), {
            forma: def.forma, mostrar: def.mostrar, etiqueta: def.etiqueta
          });
        }
        if (def.montar) def.montar(it, base, juego);
        else base();
        if (def.alMontar) def.alMontar(it);
      },
      ganchos: function () {
        return ganchos(correcta, { fallo: def.textoFallo, revelado: def.textoRevelado, pista: def.pista });
      },
      /* La tarjeta con que se presenta algo nuevo antes de preguntarlo
         (ver js/nucleo/presentacion.js). Si el juego no dice cómo, sale
         del repaso: el dibujo, el nombre y el dato. */
      presentar: function (it) {
        if (def.presentar) return def.presentar(it);
        var r = juego.repaso(it);
        /* El dibujo va sólo si es la cosa misma: el de la pregunta, o el
           del repaso cuando las respuestas son dibujos (la vaca, la nariz).
           Los símbolos de adorno del repaso (una nota musical para las
           rimas) no dicen nada de lo que hay que aprender. */
        var visual = def.visual ? def.visual(it)
                   : def.forma === 'emoji' && r.simbolo ? '<div class="visual-emoji" aria-hidden="true">' + r.simbolo + '</div>'
                   : '';
        return { visual: visual, titulo: r.nombre, texto: r.dato };
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
    teclado: teclado,
    elegirTeclado: elegirTeclado,
    ganchos: ganchos,
    plano: plano,
    sortear: sortear,
    cantidadesFijas: cantidadesFijas,
    cantidadesDeBanco: cantidadesDeBanco,
    resumenDeCantidad: resumenDeCantidad,
    banco: banco,
    posicionesDeDesafio: posicionesDeDesafio,
    conJugar: conJugar,
    materia: materia
  };
})();
