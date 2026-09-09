/* ============================================================
   Materia: Matemática.

   Tres juegos que se responden eligiendo entre cuatro tarjetas:
   tablas de multiplicar, cuentas de sumar y restar, y leer la hora
   en un reloj de agujas dibujado al momento.

   Las preguntas se generan cada partida (no hay lista fija), así que
   nunca sale dos veces la misma ronda. Los distractores no son al azar:
   son los errores típicos, para que elegir bien signifique algo.

   Igual que geografía, cada juego separa `preguntas()` de `montar()`,
   para que el examen pueda intercalar una pregunta de acá con una de
   mapa. El botón elegido no se pinta solo: eso lo decide el motor, que
   en el examen no pinta nada para no delatar la respuesta.
   ============================================================ */
window.Matematica = (function () {
  'use strict';

  var COLOR = '#7c3aed';

  function entero(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /** Completa la lista de distractores sin repetir ni salirse de rango. */
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
    // si faltan, se completan con números cercanos
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

  /* ---------------------- tablero ---------------------- */
  function prepararTablero() {
    Util.$('zona-mapa').hidden = true;
    Util.$('zona-opciones').hidden = false;
  }

  function ocultarVisual() {
    var visual = Util.$('pregunta-visual');
    visual.hidden = true;
    Util.vaciar(visual);
  }

  function consigna(html) { Util.$('pregunta-texto').innerHTML = html; }

  function cantidadesFijas() {
    return { lista: [5, 10, 20, 30], total: null, unidad: 'preguntas' };
  }

  /** Cuatro tarjetas con la respuesta correcta y tres distractores. */
  function armarRespuestas(correcta, malas) {
    var lista = Util.mezclar(malas.concat([correcta])).map(function (v) {
      return { id: v, valor: v };
    });
    Opciones.armar(lista, {
      clase: 'texto',
      contenido: function (o) { return String(o.valor); },
      alElegir: function (o) { Motor.responder(o.valor); }
    });
  }

  /* Ganchos comunes: los tres juegos se responden con la misma botonera.
     `correcta(item)` dice cuál era, porque cada juego la guarda distinto. */
  function ganchosDeBotonera(correcta) {
    return {
      alAcertar: function (item, respuesta) {
        Opciones.marcar(respuesta, 'correcta');
        Opciones.bloquear();
      },
      alFallar: function (item, respuesta) {
        Opciones.marcar(respuesta, 'incorrecta');
        var b = Opciones.boton(respuesta);
        if (b) b.disabled = true;
      },
      alRevelar: function (item) {
        Opciones.bloquear();
        Opciones.marcar(correcta(item), 'correcta');
      },
      alResponder: function (item, respuesta) {
        Opciones.marcar(respuesta, 'elegida');
        Opciones.bloquear();
      }
    };
  }

  /* Para el examen no hay pantalla de opciones: se elige por edad, para que
     un chico de 6 no rinda cuentas de tres cifras. */
  function nivelPorEdad(edad) {
    if (!edad || edad <= 6) return 'facil';
    if (edad <= 8) return 'medio';
    if (edad <= 10) return 'dificil';
    return 'experto';
  }

  function pasoPorEdad(edad) {
    if (!edad || edad <= 6) return 'punto';
    if (edad === 7) return 'media';
    if (edad === 8) return 'cuarto';
    return 'cinco';
  }

  /**
   * Saca `cantidad` preguntas de un pozo finito, dándole prioridad a lo que
   * el chico viene fallando. Si se piden más preguntas que ítems tiene el
   * pozo (por ejemplo 20 preguntas de la tabla del 7, que sólo tiene 10),
   * se dan vueltas sucesivas: dentro de cada vuelta no se repite nada.
   *
   * Las cuentas de sumar y restar no pasan por acá: su pozo es enorme
   * (hasta 999 + 999) y casi nunca se repite una, así que pesar no cambiaría
   * nada y costaría armar cien mil ítems para tirar veinte.
   */
  /* Las tres fábricas de ítems, sueltas para que las pueda usar también
     itemDeClave() cuando el modo Repaso rearma una pregunta vieja. */
  function cuentaTabla(a, b) {
    return { id: a + 'x' + b, a: a, b: b, resultado: a * b };
  }

  function horaDelReloj(hora, minuto) {
    return { id: 'h' + hora + '_' + minuto, hora: hora, minuto: minuto,
             texto: comoTexto(hora, minuto) };
  }

  function sortearDelPozo(pozo, cantidad, sinPesar) {
    function vuelta(n) {
      return sinPesar
        ? Util.muestra(pozo, n)
        : Util.muestraPesada(pozo, n, function (it) {
            return Almacen.pesoDe('matematica', it.id);
          });
    }
    var salida = [];
    while (salida.length < cantidad) {
      salida = salida.concat(vuelta(Math.min(pozo.length, cantidad - salida.length)));
    }
    return salida;
  }

  /* ============================================================
     1. Tablas de multiplicar
     ============================================================ */
  var TABLAS = {
    id: 'tablas',
    nombre: 'Tablas de multiplicar',
    icono: '✖️',
    color: COLOR,
    suave: '#ede9fe',
    texto: 'Practicá las tablas del 2 al 12, de a una o mezcladas.',
    edadMin: 7,
    requiere: { juego: 'matematica/cuentas', estrellas: 3 },

    opciones: function () {
      // el ícono de cada tabla es su propio número: doce veces la misma
      // crucecita y un "2 × 1 … 2 × 10" abajo eran ruido, no información
      var items = [{ id: 'mezcla', nombre: 'Mezcladas', icono: '🎲' }];
      for (var t = 2; t <= 12; t++) {
        items.push({ id: String(t), nombre: 'Tabla del ' + t, icono: String(t), iconoNumero: true });
      }
      return [{ id: 'tabla', titulo: 'Elegí la tabla', tipo: 'grilla', items: items }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var nombre = sel.tabla === 'mezcla' ? 'Tablas mezcladas' : 'Tabla del ' + sel.tabla;
      return nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function () { return { tabla: 'mezcla', sinPesar: true }; },
    preguntas: function (sel) {
      var mezcla = !sel.tabla || sel.tabla === 'mezcla';
      var desde = mezcla ? 2 : parseInt(sel.tabla, 10);
      var hasta = mezcla ? 12 : desde;
      var pozo = [];
      for (var a = desde; a <= hasta; a++) {
        for (var b = 1; b <= 10; b++) pozo.push(cuentaTabla(a, b));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuánto es <b>' + it.a + ' × ' + it.b + '</b>?');
      // errores típicos: correrse una fila de la tabla o sumar en vez de multiplicar
      armarRespuestas(it.resultado, distractores(it.resultado, [
        it.a * (it.b + 1), it.a * (it.b - 1),
        (it.a + 1) * it.b, (it.a - 1) * it.b,
        it.resultado + it.a, it.resultado - it.a, it.a + it.b
      ], 3, 0));
    },
    ganchos: function () {
      return Object.assign(ganchosDeBotonera(function (it) { return it.resultado; }), {
        esCorrecta: function (it, respuesta) { return respuesta === it.resultado; },
        textoFallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        textoRevelado: function (it) { return it.a + ' × ' + it.b + ' = ' + it.resultado; }
      });
    }
  };

  /* ============================================================
     2. Sumas y restas
     ============================================================ */
  var NIVELES = [
    { id: 'facil', nombre: 'Fácil', icono: '🐣', detalle: 'Hasta 10, sin llevarse nada', max: 10, acarreo: false },
    { id: 'medio', nombre: 'Medio', icono: '🐤', detalle: 'Hasta 20', max: 20, acarreo: true },
    { id: 'dificil', nombre: 'Difícil', icono: '🦅', detalle: 'Hasta 100', max: 100, acarreo: true },
    { id: 'experto', nombre: 'Experto', icono: '🚀', detalle: 'Hasta 999', max: 999, acarreo: true }
  ];

  function nivelPorId(id) {
    for (var i = 0; i < NIVELES.length; i++) if (NIVELES[i].id === id) return NIVELES[i];
    return NIVELES[0];
  }

  /** Arma una cuenta que da un resultado válido (nunca negativo). */
  function cuenta(nivel, operacion) {
    var a, b;
    if (operacion === '+') {
      if (nivel.acarreo) {
        a = entero(1, nivel.max);
        b = entero(1, Math.max(1, nivel.max - a));
      } else {
        a = entero(1, nivel.max - 1);
        b = entero(1, nivel.max - a);
      }
      return { a: a, b: b, op: '+', resultado: a + b };
    }
    a = entero(2, nivel.max);
    b = entero(1, a);                       // así la resta nunca da negativo
    return { a: a, b: b, op: '−', resultado: a - b };
  }

  var CUENTAS = {
    id: 'cuentas',
    nombre: 'Sumas y restas',
    icono: '➕',
    color: '#16a34a',
    suave: '#dcfce7',
    texto: 'Cuentas de sumar y restar, en cuatro niveles.',
    edadMin: 5,

    opciones: function () {
      return [
        { id: 'nivel', titulo: 'Elegí el nivel', tipo: 'grilla', items: NIVELES },
        {
          id: 'operacion', titulo: 'Elegí las cuentas', tipo: 'fila', porDefecto: 'ambas',
          items: [
            { id: 'ambas', nombre: 'Mezcladas', icono: '🎲', detalle: 'Sumas y restas' },
            { id: 'suma', nombre: 'Sumar', icono: '➕', detalle: 'Solo sumas' },
            { id: 'resta', nombre: 'Restar', icono: '➖', detalle: 'Solo restas' }
          ]
        }
      ];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var n = nivelPorId(sel.nivel);
      var q = { ambas: 'sumas y restas', suma: 'sumas', resta: 'restas' }[sel.operacion || 'ambas'];
      return 'Nivel ' + n.nombre.toLowerCase() + ' · ' + q + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function (comun, edad) { return { nivel: nivelPorEdad(edad), operacion: 'ambas' }; },
    preguntas: function (sel) {
      var nivel = nivelPorId(sel.nivel);
      var modo = sel.operacion || 'ambas';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var op = modo === 'ambas' ? (Math.random() < 0.5 ? '+' : '−') : (modo === 'suma' ? '+' : '−');
        var c = cuenta(nivel, op);
        c.id = c.a + c.op + c.b;
        items.push(c);
      }
      return items;
    },
    montar: function (it) {
      prepararTablero();
      ocultarVisual();
      consigna('¿Cuánto es <b>' + it.a + ' ' + it.op + ' ' + it.b + '</b>?');
      // errores típicos: contarse uno, olvidarse de llevar, o cambiar la operación
      armarRespuestas(it.resultado, distractores(it.resultado, [
        it.resultado + 1, it.resultado - 1,
        it.resultado + 10, it.resultado - 10,
        it.op === '+' ? it.a - it.b : it.a + it.b
      ], 3, 0));
    },
    ganchos: function () {
      return Object.assign(ganchosDeBotonera(function (it) { return it.resultado; }), {
        esCorrecta: function (it, respuesta) { return respuesta === it.resultado; },
        textoFallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        textoRevelado: function (it) {
          return it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.resultado;
        }
      });
    }
  };

  /* ============================================================
     3. El reloj
     ============================================================ */
  var PASOS = [
    { id: 'punto', nombre: 'En punto', icono: '🕐', detalle: 'Las 3, las 8…', paso: 60 },
    { id: 'media', nombre: 'Y media', icono: '🕜', detalle: 'También 3:30', paso: 30 },
    { id: 'cuarto', nombre: 'Y cuarto', icono: '🕝', detalle: 'También 3:15 y 3:45', paso: 15 },
    { id: 'cinco', nombre: 'De 5 en 5', icono: '⏱️', detalle: 'Cualquier múltiplo de 5', paso: 5 }
  ];

  function pasoPorId(id) {
    for (var i = 0; i < PASOS.length; i++) if (PASOS[i].id === id) return PASOS[i];
    return PASOS[0];
  }

  function comoTexto(hora, minuto) {
    return hora + ':' + (minuto < 10 ? '0' + minuto : minuto);
  }

  /** Dibuja un reloj de agujas con la hora pedida. */
  function dibujarReloj(hora, minuto) {
    var R = 100, C = 110;
    var marcas = '';
    for (var i = 0; i < 60; i++) {
      var ang = (i * 6 - 90) * Math.PI / 180;
      var largo = (i % 5 === 0) ? 10 : 4;
      var grosor = (i % 5 === 0) ? 3 : 1.5;
      marcas += '<line x1="' + (C + Math.cos(ang) * (R - largo)).toFixed(1) +
                '" y1="' + (C + Math.sin(ang) * (R - largo)).toFixed(1) +
                '" x2="' + (C + Math.cos(ang) * R).toFixed(1) +
                '" y2="' + (C + Math.sin(ang) * R).toFixed(1) +
                '" stroke="#5a6b8c" stroke-width="' + grosor + '" stroke-linecap="round"/>';
    }

    var numeros = '';
    for (var n = 1; n <= 12; n++) {
      var a = (n * 30 - 90) * Math.PI / 180;
      numeros += '<text x="' + (C + Math.cos(a) * (R - 26)).toFixed(1) +
                 '" y="' + (C + Math.sin(a) * (R - 26) + 7).toFixed(1) +
                 '" text-anchor="middle" font-size="21" font-weight="700" fill="#1d2b4a">' + n + '</text>';
    }

    var angMin = (minuto * 6 - 90) * Math.PI / 180;
    var angHora = ((hora % 12) * 30 + minuto * 0.5 - 90) * Math.PI / 180;

    function aguja(ang, largo, grosor, color) {
      return '<line x1="' + C + '" y1="' + C +
             '" x2="' + (C + Math.cos(ang) * largo).toFixed(1) +
             '" y2="' + (C + Math.sin(ang) * largo).toFixed(1) +
             '" stroke="' + color + '" stroke-width="' + grosor + '" stroke-linecap="round"/>';
    }

    return '<svg class="reloj" viewBox="0 0 220 220" role="img" aria-label="Reloj de agujas">' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + (R + 6) + '" fill="#ffffff" stroke="#dfe6f7" stroke-width="4"/>' +
      marcas + numeros +
      aguja(angHora, 52, 8, '#1d2b4a') +
      aguja(angMin, 78, 5, '#4c6ef5') +
      '<circle cx="' + C + '" cy="' + C + '" r="7" fill="#1d2b4a"/>' +
      '</svg>';
  }

  var RELOJ = {
    id: 'reloj',
    nombre: 'La hora',
    icono: '🕒',
    color: '#0891b2',
    suave: '#cffafe',
    texto: 'Mirá el reloj de agujas y decí qué hora es.',
    edadMin: 6,

    opciones: function () {
      return [{ id: 'paso', titulo: 'Elegí la dificultad', tipo: 'grilla', items: PASOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return pasoPorId(sel.paso).nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    examen: function (comun, edad) { return { paso: pasoPorEdad(edad), sinPesar: true }; },
    preguntas: function (sel) {
      var paso = pasoPorId(sel.paso).paso;
      var pozo = [];
      for (var hora = 1; hora <= 12; hora++) {
        for (var minuto = 0; minuto < 60; minuto += paso) pozo.push(horaDelReloj(hora, minuto));
      }
      return sortearDelPozo(pozo, sel.cantidad, sel.sinPesar);
    },
    montar: function (it) {
      prepararTablero();
      consigna('¿Qué hora marca el reloj?');
      var visual = Util.$('pregunta-visual');
      visual.innerHTML = dibujarReloj(it.hora, it.minuto);
      visual.hidden = false;

      // confusiones típicas: leer la aguja al revés, o pasarse una hora
      var otraHora = it.hora === 12 ? 1 : it.hora + 1;
      var horaAntes = it.hora === 1 ? 12 : it.hora - 1;
      var candidatos = [
        comoTexto(otraHora, it.minuto),
        comoTexto(horaAntes, it.minuto),
        comoTexto(it.hora, (it.minuto + 30) % 60),
        comoTexto(it.hora, (it.minuto + 15) % 60),
        comoTexto(it.hora, (it.minuto + 45) % 60)
      ].filter(function (t, i, a) { return t !== it.texto && a.indexOf(t) === i; });

      armarRespuestas(it.texto, Util.muestra(candidatos, 3));
    },
    ganchos: function () {
      return Object.assign(ganchosDeBotonera(function (it) { return it.texto; }), {
        esCorrecta: function (it, respuesta) { return respuesta === it.texto; },
        textoFallo: function (it, respuesta) { return 'No son las ' + respuesta + '.'; },
        textoRevelado: function (it) { return 'Eran las ' + it.texto; }
      });
    }
  };

  var JUEGOS = [TABLAS, CUENTAS, RELOJ];

  // jugar() es igual para los tres: armar preguntas y arrancar el motor
  JUEGOS.forEach(function (juego) {
    juego.jugar = function (sel, ganchos) {
      var items = juego.preguntas(sel);
      juego.montar(items[0]);
      Motor.jugar(Object.assign({
        items: items,
        render: function (item) { juego.montar(item); }
      }, juego.ganchos(), ganchos));
    };
  });

  return {
    id: 'matematica',
    JUEGOS: JUEGOS,
    /** Lo usa también la lección sobre el reloj, en la sección Aprender. */
    dibujarReloj: dibujarReloj,
    claveItem: function (item) { return item.id; },
    /**
     * Rearma una pregunta a partir de su clave, para el modo Repaso.
     * Las claves dicen solas de qué juego son: '7x8' es una tabla,
     * 'h3_30' es el reloj, '12+5' es una cuenta.
     */
    /**
     * Qué juego sabe dibujar esta pregunta. Acá es obligatorio: una tabla
     * mostrada por el tablero de sumas sale "7 undefined 8". Si ese juego
     * está trabado, el repaso saltea la pregunta en vez de romperla.
     */
    juegoDeClave: function (clave) {
      if (/^\d+x\d+$/.test(clave)) return 'tablas';
      if (/^h\d+_\d+$/.test(clave)) return 'reloj';
      return 'cuentas';
    },
    itemDeClave: function (clave) {
      var m = /^(\d+)x(\d+)$/.exec(clave);
      if (m) return cuentaTabla(+m[1], +m[2]);

      m = /^h(\d+)_(\d+)$/.exec(clave);
      if (m) return horaDelReloj(+m[1], +m[2]);

      m = /^(\d+)([+−])(\d+)$/.exec(clave);
      if (m) {
        var a = +m[1], op = m[2], b = +m[3];
        return { id: clave, a: a, op: op, b: b, resultado: op === '+' ? a + b : a - b };
      }
      return null;
    },
    repaso: function (item) {
      if (item.op) {
        return { simbolo: '➕', nombre: item.a + ' ' + item.op + ' ' + item.b, dato: 'Da ' + item.resultado };
      }
      if (item.hora !== undefined) {
        return { simbolo: '🕒', nombre: 'El reloj marcaba', dato: 'Las ' + item.texto };
      }
      return { simbolo: '✖️', nombre: item.a + ' × ' + item.b, dato: 'Da ' + item.resultado };
    },
    limpiar: function () {}
  };
})();
