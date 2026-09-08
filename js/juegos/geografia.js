/* ============================================================
   Materia: Geografía.

   Sólo se ocupa de lo propio del mapa y las banderas; la ronda, los
   intentos y el puntaje los maneja js/nucleo/motor.js.

   Cada juego declara:
     opciones()   los grupos de botones de la pantalla de configuración
     cantidades() cuántas preguntas se pueden pedir
     resumen()    la línea que describe la partida elegida
     jugar()      arma las preguntas y arranca el motor
   ============================================================ */
window.Geografia = (function () {
  'use strict';

  var MARCA_FALLO = 520;      // cuánto queda pintado en rojo el país equivocado
  var mapa = null;            // mapa de la partida en curso
  var partida = null;         // datos que necesitan los callbacks del motor

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

  /* ---------------------- armado del tablero ---------------------- */
  function prepararMapa(sel, candidatos) {
    Util.$('zona-mapa').hidden = false;
    Util.$('zona-opciones').hidden = true;
    mapa = Mapa.crear(Util.$('mapa'), {
      zona: sel.zona,
      jugables: candidatos.map(function (p) { return p.id; }),
      onClic: function (id) { Motor.responder(id); }
    });
    var pista = Util.$('pista-mapa');
    pista.textContent = ('ontouchstart' in window)
      ? 'Arrastrá para mover · pellizcá para acercar'
      : 'Arrastrá para mover · rueda para acercar';
    pista.style.opacity = '1';
    setTimeout(function () { pista.style.opacity = '0'; }, 5000);
  }

  function prepararOpciones() {
    Util.$('zona-mapa').hidden = true;
    Util.$('zona-opciones').hidden = false;
    mapa = null;
  }

  function elegirPreguntas(sel) {
    var candidatos = Mapa.paisesDeZona(sel.zona);
    var cantidad = sel.cantidad === 'todos'
      ? candidatos.length
      : Math.min(sel.cantidad, candidatos.length);
    return { candidatos: candidatos, preguntas: Util.muestra(candidatos, cantidad) };
  }

  function nombreDe(id) {
    for (var i = 0; i < window.PAISES.length; i++) {
      if (window.PAISES[i].id === id) return window.PAISES[i].nombre;
    }
    return null;
  }

  /* ---------------------- callbacks del motor (sobre el mapa) ---------------------- */
  function aciertoEnMapa(pais) {
    mapa.marcar(pais.id, 'correcto');
    mapa.etiqueta(pais, pais.nombre);
  }

  function falloEnMapa(pais, idClickeado) {
    if (!idClickeado) return;
    mapa.marcar(idClickeado, 'fallo');
    setTimeout(function () { if (mapa) mapa.desmarcar(idClickeado, 'fallo'); }, MARCA_FALLO);
  }

  function textoFalloEnMapa(pais, idClickeado) {
    var nombre = nombreDe(idClickeado);
    var texto = (nombre && nombre !== pais.nombre) ? 'Ese es ' + nombre + '.' : '¡Casi!';
    // si el país es diminuto, la pista va en el mismo aviso
    if (pais.mini && !partida.pistaDada) {
      partida.pistaDada = true;
      texto += ' Es muy chiquito: buscá el puntito 🔍 ·';
    }
    return texto;
  }

  function revelarEnMapa(pais) {
    mapa.limpiarMarcas();
    mapa.marcar(pais.id, 'revelado');
    if (pais.mini || !mapa.estaEnVista(pais)) mapa.enfocar(pais, pais.mini ? 7 : 3);
    mapa.etiqueta(pais, pais.nombre);
  }

  /* ---------------------- callbacks del quiz de banderas ---------------------- */
  /** Al terminar la pregunta se muestra de quién era cada bandera. */
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
      alElegir: function (p, btn) {
        if (p.id !== correcto.id) { btn.classList.add('incorrecta'); btn.disabled = true; }
        else btn.classList.add('correcta');
        Motor.responder(p.id);
      }
    });
  }

  /* ---------------------- los tres juegos ---------------------- */
  function consigna(html) { Util.$('pregunta-texto').innerHTML = html; }

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

  function ganchosDeMapa(extra) {
    var base = {
      alAcertar: function (pais) { aciertoEnMapa(pais); },
      alFallar: function (pais, id) { falloEnMapa(pais, id); },
      textoFallo: function (pais, id) { return textoFalloEnMapa(pais, id); },
      alRevelar: function (pais) { revelarEnMapa(pais); }
    };
    Object.keys(extra || {}).forEach(function (k) { base[k] = extra[k]; });
    return base;
  }

  var JUEGOS = [
    {
      id: 'paises',
      nombre: 'Encontrá el país',
      icono: '🗺️',
      color: '#4c6ef5',
      suave: '#e8edff',
      texto: 'Te decimos un país y lo buscás en el mapa.',
      opciones: function () { return [opcionesZona()]; },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,
      jugar: function (sel, ganchos) {
        var elegidas = elegirPreguntas(sel);
        partida = { pistaDada: false };
        prepararMapa(sel, elegidas.candidatos);
        Motor.jugar(Object.assign(ganchosDeMapa({
          items: elegidas.preguntas,
          render: function (pais) {
            Util.$('pregunta-visual').hidden = true;
            consigna('¿Dónde está <b>' + Util.escapar(pais.nombre) + '</b>?');
            mapa.limpiarMarcas();
            mapa.reiniciar();
            partida.pistaDada = false;
          },
          textoRevelado: function (pais) {
            return 'Era ' + pais.nombre + '. ¡Ahora ya sabés dónde queda!';
          }
        }), ganchos));
      }
    },

    {
      id: 'capitales',
      nombre: 'Capitales',
      icono: '🏛️',
      color: '#f5a524',
      suave: '#fff3dc',
      texto: 'Te mostramos una capital: marcá a qué país pertenece.',
      opciones: function () { return [opcionesZona()]; },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,
      jugar: function (sel, ganchos) {
        var elegidas = elegirPreguntas(sel);
        partida = { pistaDada: false };
        prepararMapa(sel, elegidas.candidatos);
        Motor.jugar(Object.assign(ganchosDeMapa({
          items: elegidas.preguntas,
          render: function (pais) {
            Util.$('pregunta-visual').hidden = true;
            consigna('¿De qué país es capital <b>' + Util.escapar(pais.capital) + '</b>?');
            mapa.limpiarMarcas();
            mapa.reiniciar();
            partida.pistaDada = false;
          },
          textoRevelado: function (pais) {
            return 'Era ' + pais.nombre + ': ahí está ' + pais.capital;
          }
        }), ganchos));
      }
    },

    {
      id: 'banderas',
      nombre: 'Banderas',
      icono: '🚩',
      color: '#ef4a5e',
      suave: '#ffe9ec',
      texto: 'Reconocé las banderas del mundo, en el mapa o eligiendo.',
      opciones: function () {
        return [opcionesZona(), {
          id: 'modo',
          titulo: 'Elegí cómo jugar',
          tipo: 'fila',
          porDefecto: 'mapa',
          items: [
            { id: 'mapa', nombre: 'En el mapa', icono: '🗺️', detalle: 'Buscá el país de la bandera' },
            { id: 'quiz', nombre: 'Elegir bandera', icono: '🎯', detalle: 'Cuatro banderas, una correcta' }
          ]
        }];
      },
      cantidades: cantidadesDeZona,
      resumen: resumenZona,
      jugar: function (sel, ganchos) {
        var elegidas = elegirPreguntas(sel);
        partida = { pistaDada: false };

        if (sel.modo === 'quiz') {
          prepararOpciones();
          return Motor.jugar(Object.assign({
            items: elegidas.preguntas,
            render: function (pais) {
              Util.$('pregunta-visual').hidden = true;
              consigna('¿Cuál es la bandera de <b>' + Util.escapar(pais.nombre) + '</b>?');
              armarOpcionesBanderas(pais, elegidas.candidatos);
            },
            alAcertar: function () {
              Util.$('zona-opciones').querySelectorAll('.btn-opcion')
                .forEach(function (b) { b.disabled = true; });
              mostrarNombresOpciones();
            },
            alRevelar: function (pais) {
              Util.$('zona-opciones').querySelectorAll('.btn-opcion').forEach(function (b) {
                b.disabled = true;
                if (b.getAttribute('data-id') === pais.id) b.classList.add('correcta');
              });
              mostrarNombresOpciones();
            },
            textoRevelado: function (pais) {
              return 'Era ' + pais.nombre + '. ¡Mirá bien su bandera!';
            }
          }, ganchos));
        }

        prepararMapa(sel, elegidas.candidatos);
        Motor.jugar(Object.assign(ganchosDeMapa({
          items: elegidas.preguntas,
          render: function (pais) {
            consigna('¿De qué país es esta bandera?');
            mostrarBandera(pais);
            mapa.limpiarMarcas();
            mapa.reiniciar();
            partida.pistaDada = false;
          },
          textoRevelado: function (pais) {
            return 'Era ' + pais.nombre + '. ¡Ahora ya sabés dónde queda!';
          }
        }), ganchos));
      }
    }
  ];

  return {
    id: 'geografia',
    JUEGOS: JUEGOS,
    /** Clave con la que se guardan los errores de esta materia. */
    claveItem: function (pais) { return pais.id; },
    /** Cómo se dibuja un error en la lista de repaso. */
    repaso: function (pais) {
      return {
        imagen: Util.bandera(pais.id),
        nombre: pais.nombre,
        dato: 'Capital: ' + pais.capital + ' · ' + pais.sub
      };
    },
    mapaActual: function () { return mapa; },
    limpiar: function () { mapa = null; partida = null; }
  };
})();
