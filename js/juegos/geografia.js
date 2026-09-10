/* ============================================================
   Materia: Geografía.

   Sólo se ocupa de lo propio del mapa y las banderas; la ronda, los
   intentos y el puntaje los maneja js/nucleo/motor.js.

   Cada juego declara:
     opciones()   los grupos de botones de la pantalla de configuración
     cantidades() cuántas preguntas se pueden pedir
     resumen()    la línea que describe la partida elegida
     preguntas()  arma la lista de ítems
     montar()     prepara el tablero y pinta UN ítem
     jugar()      junta las dos anteriores y arranca el motor

   `montar` se banca que lo llamen ítem por ítem, y cada ítem se lleva
   su contexto adentro (`__ctx`). Eso es lo que permite que el examen
   mezcle una pregunta de mapa con una de matemática: el tablero se
   arma en cada pregunta, no una sola vez al empezar.
   ============================================================ */
window.Geografia = (function () {
  'use strict';

  var MARCA_FALLO = 520;      // cuánto queda pintado en rojo el país equivocado
  var mapa = null;            // mapa vivo
  var zonaDelMapa = null;     // de qué zona es, para no rehacerlo al pedo
  var pistaDada = false;

  /* ---------------------- opciones compartidas ---------------------- */
  function opcionesZona() {
    return {
      id: 'zona',
      titulo: 'Elegí la zona',
      tipo: 'grilla',
      items: Mapa.zonas().map(function (z) {
        return {
          id: z.id,
          nombre: z.nombre,
          icono: z.icono,
          detalle: z.cantidad + ' países' + (z.nota ? ' · ' + z.nota : '')
        };
      })
    };
  }

  function cantidadesDeZona(sel) {
    // antes de elegir zona se muestran las cantidades del mundo entero,
    // así la opción por defecto no se pierde al pintar la pantalla
    var total = Mapa.paisesDeZona(sel.zona || 'mundo').length;
    var lista = [5, 10, 20, 40].filter(function (n) { return n < total; });
    lista.push('todos');
    return { lista: lista, total: total, unidad: 'países' };
  }

  function resumenZona(sel) {
    var zona = Mapa.ZONAS[sel.zona];
    if (!zona) return null;
    var cant = sel.cantidad === 'todos' ? Mapa.paisesDeZona(sel.zona).length : sel.cantidad;
    return zona.nombre + ' · ' + cant + ' preguntas';
  }

  /** Los ítems de una partida, cada uno con el contexto que necesita. */
  function elegirPreguntas(sel, modo) {
    var candidatos = Mapa.paisesDeZona(sel.zona);
    var cantidad = sel.cantidad === 'todos'
      ? candidatos.length
      : Math.min(sel.cantidad, candidatos.length);
    var ctx = { zona: sel.zona, candidatos: candidatos, modo: modo || sel.modo || 'mapa' };

    // Practicando, los países que viene fallando salen más seguido. En el
    // examen no: ahí se mide, y un sorteo cargado hacia lo flojo daría una
    // nota más baja que lo que el chico realmente sabe.
    var sorteados = sel.sinPesar
      ? Util.muestra(candidatos, cantidad)
      : Util.muestraPesada(candidatos, cantidad, function (pais) {
          return Almacen.pesoDe('geografia', pais.id);
        });

    return sorteados.map(function (pais) {
      // se copia el país para no ensuciar la lista global de PAISES
      var item = Object.assign({}, pais);
      item.__ctx = ctx;
      return item;
    });
  }

  /* ---------------------- tableros ---------------------- */
  /** Deja el mapa listo para esa zona, reusándolo si ya era la misma. */
  function asegurarMapa(ctx) {
    Util.$('zona-mapa').hidden = false;
    Util.$('zona-opciones').hidden = true;

    if (mapa && zonaDelMapa === ctx.zona) {
      mapa.limpiarMarcas();
      mapa.reiniciar();
      return mapa;
    }

    mapa = Mapa.crear(Util.$('mapa'), {
      zona: ctx.zona,
      jugables: ctx.candidatos.map(function (p) { return p.id; }),
      onClic: function (id) { Motor.responder(id); }
    });
    zonaDelMapa = ctx.zona;

    var pista = Util.$('pista-mapa');
    pista.textContent = ('ontouchstart' in window)
      ? 'Arrastrá para mover · pellizcá para acercar'
      : 'Arrastrá para mover · rueda para acercar';
    pista.style.opacity = '1';
    setTimeout(function () { pista.style.opacity = '0'; }, 5000);
    return mapa;
  }

  function prepararBotonera() {
    Util.$('zona-mapa').hidden = true;
    Util.$('zona-opciones').hidden = false;
  }

  function consigna(html) { Util.$('pregunta-texto').innerHTML = html; }

  function ocultarVisual() {
    var visual = Util.$('pregunta-visual');
    visual.hidden = true;
    Util.vaciar(visual);
  }

  function mostrarBandera(pais) {
    var visual = Util.$('pregunta-visual');
    Util.vaciar(visual);
    var img = new Image();
    img.className = 'pregunta-bandera';
    img.alt = 'Bandera del país que hay que encontrar';
    img.onload = function () { if (mapa) mapa.ajustarPanel(); };
    img.src = Util.bandera(pais.id);
    visual.appendChild(img);
    visual.hidden = false;
  }

  function nombreDe(id) {
    for (var i = 0; i < window.PAISES.length; i++) {
      if (window.PAISES[i].id === id) return window.PAISES[i].nombre;
    }
    return null;
  }

  /* ---------------------- ganchos sobre el mapa ---------------------- */
  var ganchosMapa = {
    alAcertar: function (pais) {
      if (!mapa) return;
      mapa.marcar(pais.id, 'correcto');
      mapa.etiqueta(pais, pais.nombre);
    },
    alFallar: function (pais, idClickeado) {
      if (!mapa || !idClickeado) return;
      mapa.marcar(idClickeado, 'fallo');
      setTimeout(function () { if (mapa) mapa.desmarcar(idClickeado, 'fallo'); }, MARCA_FALLO);
    },
    textoFallo: function (pais, idClickeado) {
      var nombre = nombreDe(idClickeado);
      var texto = (nombre && nombre !== pais.nombre) ? 'Ese es ' + nombre + '.' : '¡Casi!';
      if (pais.mini && !pistaDada) {
        pistaDada = true;
        texto += ' Es muy chiquito: buscá el puntito 🔍 ·';
      }
      return texto;
    },
    alRevelar: function (pais) {
      if (!mapa) return;
      mapa.limpiarMarcas();
      mapa.marcar(pais.id, 'revelado');
      if (pais.mini || !mapa.estaEnVista(pais)) mapa.enfocar(pais, pais.mini ? 7 : 3);
      mapa.etiqueta(pais, pais.nombre);
    },
    // en el examen: se marca que quedó registrada, sin decir si estuvo bien
    alResponder: function (pais, idClickeado) {
      if (mapa && idClickeado) mapa.marcar(idClickeado, 'elegida');
    }
  };

  /* ---------------------- botonera de banderas ---------------------- */
  function mostrarNombresOpciones() {
    Opciones.botones().forEach(function (b) {
      b.querySelector('.nombre-opcion').textContent = b.getAttribute('data-nombre');
    });
  }

  function armarOpcionesBanderas(correcto, candidatos) {
    var otros = candidatos.filter(function (p) { return p.id !== correcto.id; });
    var mismos = otros.filter(function (p) { return p.sub === correcto.sub; });
    var elegidos = Util.muestra(mismos.length >= 3 ? mismos : otros, 3);
    if (elegidos.length < 3) elegidos = Util.muestra(otros, 3);

    Opciones.armar(Util.mezclar(elegidos.concat([correcto])), {
      // el nombre viaja en el botón pero se muestra recién al responder
      atributos: function (p) { return { 'data-nombre': p.nombre }; },
      contenido: function (p, i) {
        var caja = Util.crear('span', 'opcion-bandera');
        var img = new Image();
        img.src = Util.bandera(p.id);
        img.alt = 'Bandera número ' + (i + 1);
        caja.appendChild(img);
        caja.appendChild(Util.crear('span', 'nombre-opcion', ''));
        return caja;
      },
      // el botón sólo avisa; pintarlo es cosa del motor, que en el examen
      // no pinta nada para no delatar la respuesta
      alElegir: function (p) { Motor.responder(p.id); }
    });
  }

  var ganchosBanderas = {
    alAcertar: function (pais) {
      Opciones.marcar(pais.id, 'correcta');
      Opciones.bloquear();
      mostrarNombresOpciones();
    },
    alFallar: function (pais, elegida) {
      Opciones.marcar(elegida, 'incorrecta');
      var b = Opciones.boton(elegida);
      if (b) b.disabled = true;
    },
    alRevelar: function (pais) {
      Opciones.bloquear();
      Opciones.marcar(pais.id, 'correcta');
      mostrarNombresOpciones();
    },
    alResponder: function (pais, elegida) {
      Opciones.marcar(elegida, 'elegida');
      Opciones.bloquear();
    },
    textoRevelado: function (pais) {
      return 'Era ' + pais.nombre + '. ¡Mirá bien su bandera!';
    }
  };

  /** Junta los ganchos de un tablero con los que trae quien llama. */
  function con(base, extra, ganchos) {
    return Object.assign({}, base, extra, ganchos || {});
  }

  /* ---------------------- los tres juegos ---------------------- */
  var JUEGOS = [
    {
      id: 'paises',
      nombre: 'Encontrá el país',
      icono: 'paises',
      color: '#2563eb',
      suave: '#dbeafe',
      texto: 'Buscalo en el mapa',
      edadMin: 6,
      opciones: function () { return [opcionesZona()]; },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,

      examen: function (comun) { return { zona: comun.zona, sinPesar: true }; },
      preguntas: function (sel) { return elegirPreguntas(sel, 'mapa'); },
      montar: function (pais) {
        asegurarMapa(pais.__ctx);
        ocultarVisual();
        consigna('¿Dónde está <b>' + Util.escapar(pais.nombre) + '</b>?');
        pistaDada = false;
      },
      ganchos: function () {
        return con(ganchosMapa, {
          textoRevelado: function (pais) {
            return 'Era ' + pais.nombre + '. ¡Ahora ya sabés dónde queda!';
          }
        });
      }
    },

    {
      id: 'capitales',
      nombre: 'Capitales',
      icono: 'capitales',
      color: '#c2740a',
      suave: '#fef3c7',
      texto: 'De qué país es cada capital',
      edadMin: 8,
      requiere: { juego: 'geografia/paises', estrellas: 3 },
      opciones: function () { return [opcionesZona()]; },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,

      examen: function (comun) { return { zona: comun.zona, sinPesar: true }; },
      preguntas: function (sel) { return elegirPreguntas(sel, 'mapa'); },
      montar: function (pais) {
        asegurarMapa(pais.__ctx);
        ocultarVisual();
        consigna('¿De qué país es capital <b>' + Util.escapar(pais.capital) + '</b>?');
        pistaDada = false;
      },
      ganchos: function () {
        return con(ganchosMapa, {
          textoRevelado: function (pais) {
            return 'Era ' + pais.nombre + ': ahí está ' + pais.capital;
          }
        });
      }
    },

    {
      id: 'banderas',
      nombre: 'Banderas',
      icono: 'banderas',
      color: '#ec4899',
      suave: '#fce7f3',
      texto: 'Reconocé las banderas',
      edadMin: 7,
      opciones: function () {
        return [opcionesZona(), {
          id: 'modo',
          titulo: 'Elegí cómo jugar',
          tipo: 'fila',
          porDefecto: 'mapa',
          items: [
            { id: 'mapa', nombre: 'En el mapa', icono: 'paises', detalle: 'Buscá el país de la bandera' },
            { id: 'quiz', nombre: 'Elegir bandera', icono: '🎯', detalle: 'Cuatro banderas, una correcta' }
          ]
        }];
      },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,

      // en el examen las banderas siempre van sobre el mapa
      examen: function (comun) { return { zona: comun.zona, modo: 'mapa', sinPesar: true }; },
      preguntas: function (sel) { return elegirPreguntas(sel); },
      montar: function (pais) {
        if (pais.__ctx.modo === 'quiz') {
          prepararBotonera();
          ocultarVisual();
          consigna('¿Cuál es la bandera de <b>' + Util.escapar(pais.nombre) + '</b>?');
          armarOpcionesBanderas(pais, pais.__ctx.candidatos);
          return;
        }
        asegurarMapa(pais.__ctx);
        consigna('¿De qué país es esta bandera?');
        mostrarBandera(pais);
        pistaDada = false;
      },
      /* Este juego tiene dos tableros, así que los ganchos dependen del ítem:
         el motor recibe unos que preguntan por el modo antes de actuar. */
      ganchos: function () {
        function segunModo(nombre) {
          return function (item) {
            var set = item.__ctx.modo === 'quiz' ? ganchosBanderas : ganchosMapa;
            if (set[nombre]) return set[nombre].apply(null, arguments);
            return undefined;
          };
        }
        return {
          alAcertar: segunModo('alAcertar'),
          alFallar: segunModo('alFallar'),
          alRevelar: segunModo('alRevelar'),
          alResponder: segunModo('alResponder'),
          textoFallo: segunModo('textoFallo'),
          textoRevelado: function (pais) {
            return pais.__ctx.modo === 'quiz'
              ? 'Era ' + pais.nombre + '. ¡Mirá bien su bandera!'
              : 'Era ' + pais.nombre + '. ¡Ahora ya sabés dónde queda!';
          }
        };
      }
    }
  ];

  // jugar() es igual para los tres: armar preguntas y arrancar el motor
  JUEGOS.forEach(function (juego) {
    juego.jugar = function (sel, ganchos) {
      var items = juego.preguntas(sel);
      pistaDada = false;
      juego.montar(items[0]);       // deja el tablero listo antes de arrancar
      Motor.jugar(Object.assign({
        items: items,
        render: function (item) { juego.montar(item); }
      }, juego.ganchos(), ganchos));
    };
  });

  return {
    id: 'geografia',
    JUEGOS: JUEGOS,
    /** Clave con la que se guardan aciertos y errores de esta materia. */
    claveItem: function (pais) { return pais.id; },
    /**
     * Rearma una pregunta a partir de su clave. Lo usa el modo Repaso, que
     * sólo guarda la clave del país que se falló, no la pregunta entera.
     * Va siempre sobre el planisferio: un repaso mezcla países de cualquier
     * continente, y como la zona no cambia entre preguntas, el mapa se reusa.
     */
    itemDeClave: function (clave, juegoId) {
      var pais = null;
      for (var i = 0; i < window.PAISES.length; i++) {
        if (window.PAISES[i].id === clave) { pais = window.PAISES[i]; break; }
      }
      if (!pais) return null;
      var item = Object.assign({}, pais);
      item.__ctx = {
        zona: 'mundo',
        candidatos: window.PAISES,
        // repasando banderas se eligen entre cuatro: buscar un país chiquito
        // en el planisferio de un celular es demasiado castigo para un repaso
        modo: juegoId === 'banderas' ? 'quiz' : 'mapa'
      };
      return item;
    },
    /**
     * Con todas las preguntas del repaso ya armadas, achica el mapa a la
     * zona más chica que las contenga a todas.
     *
     * Sin esto el repaso va al planisferio, donde Ecuador mide nueve
     * píxeles: encontrarlo ahí no es repasar, es pelearse con el mapa.
     * Si el repaso cruza continentes no queda otra que el mundo entero.
     */
    ajustarContexto: function (items) {
      if (!items.length) return;
      var ids = items.map(function (it) { return it.id; });

      var zonas = Mapa.zonas().slice().sort(function (a, b) {
        return a.cantidad - b.cantidad;          // de la más chica a la más grande
      });
      var elegida = null;
      for (var i = 0; i < zonas.length && !elegida; i++) {
        var enZona = {};
        Mapa.paisesDeZona(zonas[i].id).forEach(function (p) { enZona[p.id] = true; });
        if (ids.every(function (id) { return enZona[id]; })) elegida = zonas[i].id;
      }
      if (!elegida) elegida = 'mundo';

      var candidatos = Mapa.paisesDeZona(elegida);
      items.forEach(function (it) {
        it.__ctx = Object.assign({}, it.__ctx, { zona: elegida, candidatos: candidatos });
      });
    },
    /** Cómo se dibuja en la lista de repaso. */
    repaso: function (pais) {
      return {
        imagen: Util.bandera(pais.id),
        nombre: pais.nombre,
        dato: 'Capital: ' + pais.capital + ' · ' + pais.sub
      };
    },
    mapaActual: function () { return mapa; },
    limpiar: function () { mapa = null; zonaDelMapa = null; pistaDada = false; }
  };
})();
