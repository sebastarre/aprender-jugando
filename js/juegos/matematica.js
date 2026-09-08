/* ============================================================
   Materia: Matemática.

   Tres juegos que se responden eligiendo entre cuatro tarjetas:
   tablas de multiplicar, cuentas de sumar y restar, y leer la hora
   en un reloj de agujas dibujado al momento.

   Las preguntas se generan cada partida (no hay lista fija), así que
   nunca sale dos veces la misma ronda. Los distractores no son al azar:
   son los errores típicos, para que elegir bien signifique algo.
   ============================================================ */
window.Matematica = (function () {
  'use strict';

  var COLOR = '#4c6ef5';

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

  /* ---------------------- respuestas numéricas ---------------------- */
  function armarNumeros(correcto, malos, alResponder) {
    var lista = Util.mezclar(malos.concat([correcto])).map(function (n) {
      return { id: n, valor: n };
    });
    Opciones.armar(lista, {
      clase: 'texto',
      contenido: function (o) { return String(o.valor); },
      alElegir: function (o, btn) {
        if (o.valor !== correcto) { btn.classList.add('incorrecta'); btn.disabled = true; }
        else btn.classList.add('correcta');
        alResponder(o.valor);
      }
    });
  }

  function prepararTablero() {
    Util.$('zona-mapa').hidden = true;
    Util.$('zona-opciones').hidden = false;
    Util.$('pregunta-visual').hidden = true;
    Util.vaciar(Util.$('pregunta-visual'));
  }

  function consigna(html) { Util.$('pregunta-texto').innerHTML = html; }

  function cantidadesFijas() {
    return { lista: [5, 10, 20, 30], total: null, unidad: 'preguntas' };
  }

  /* ============================================================
     1. Tablas de multiplicar
     ============================================================ */
  var TABLAS = {
    id: 'tablas',
    nombre: 'Tablas de multiplicar',
    icono: '✖️',
    color: COLOR,
    suave: '#e8edff',
    texto: 'Practicá las tablas del 2 al 12, de a una o mezcladas.',

    opciones: function () {
      var items = [{ id: 'mezcla', nombre: 'Mezcladas', icono: '🎲', detalle: 'Todas las tablas' }];
      for (var t = 2; t <= 12; t++) {
        items.push({ id: String(t), nombre: 'Tabla del ' + t, icono: '✖️', detalle: t + ' × 1 … ' + t + ' × 10' });
      }
      return [{ id: 'tabla', titulo: 'Elegí la tabla', tipo: 'grilla', items: items }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      var nombre = sel.tabla === 'mezcla' ? 'Tablas mezcladas' : 'Tabla del ' + sel.tabla;
      return nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    jugar: function (sel, ganchos) {
      var cuantas = sel.cantidad;
      var items = [];
      for (var i = 0; i < cuantas; i++) {
        var a = sel.tabla === 'mezcla' ? entero(2, 12) : parseInt(sel.tabla, 10);
        var b = entero(1, 10);
        items.push({ id: a + 'x' + b, a: a, b: b, resultado: a * b });
      }
      prepararTablero();

      Motor.jugar(Object.assign({
        items: items,
        esCorrecta: function (it, respuesta) { return respuesta === it.resultado; },
        render: function (it) {
          consigna('¿Cuánto es <b>' + it.a + ' × ' + it.b + '</b>?');
          // errores típicos: correrse una fila de la tabla o sumar en vez de multiplicar
          var malos = distractores(it.resultado, [
            it.a * (it.b + 1), it.a * (it.b - 1),
            (it.a + 1) * it.b, (it.a - 1) * it.b,
            it.resultado + it.a, it.resultado - it.a, it.a + it.b
          ], 3, 0);
          armarNumeros(it.resultado, malos, function (v) { Motor.responder(v); });
        },
        alAcertar: function () { Opciones.bloquear(); },
        alRevelar: function (it) { Opciones.bloquear(); Opciones.marcar(it.resultado, 'correcta'); },
        textoFallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        textoRevelado: function (it) {
          return it.a + ' × ' + it.b + ' = ' + it.resultado;
        }
      }, ganchos));
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
    color: '#21b573',
    suave: '#e3f8ee',
    texto: 'Cuentas de sumar y restar, en cuatro niveles.',

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

    jugar: function (sel, ganchos) {
      var nivel = nivelPorId(sel.nivel);
      var modo = sel.operacion || 'ambas';
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var op = modo === 'ambas' ? (Math.random() < 0.5 ? '+' : '−') : (modo === 'suma' ? '+' : '−');
        var c = cuenta(nivel, op);
        c.id = c.a + c.op + c.b;
        items.push(c);
      }
      prepararTablero();

      Motor.jugar(Object.assign({
        items: items,
        esCorrecta: function (it, respuesta) { return respuesta === it.resultado; },
        render: function (it) {
          consigna('¿Cuánto es <b>' + it.a + ' ' + it.op + ' ' + it.b + '</b>?');
          // errores típicos: contarse uno, olvidarse de llevar, o cambiar la operación
          var malos = distractores(it.resultado, [
            it.resultado + 1, it.resultado - 1,
            it.resultado + 10, it.resultado - 10,
            it.op === '+' ? it.a - it.b : it.a + it.b
          ], 3, 0);
          armarNumeros(it.resultado, malos, function (v) { Motor.responder(v); });
        },
        alAcertar: function () { Opciones.bloquear(); },
        alRevelar: function (it) { Opciones.bloquear(); Opciones.marcar(it.resultado, 'correcta'); },
        textoFallo: function (it, respuesta) { return 'No, ' + respuesta + ' no es.'; },
        textoRevelado: function (it) {
          return it.a + ' ' + it.op + ' ' + it.b + ' = ' + it.resultado;
        }
      }, ganchos));
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
    color: '#8b5cf6',
    suave: '#f1ebff',
    texto: 'Mirá el reloj de agujas y decí qué hora es.',

    opciones: function () {
      return [{ id: 'paso', titulo: 'Elegí la dificultad', tipo: 'grilla', items: PASOS }];
    },
    cantidades: cantidadesFijas,
    resumen: function (sel) {
      return pasoPorId(sel.paso).nombre + ' · ' + sel.cantidad + ' preguntas';
    },

    jugar: function (sel, ganchos) {
      var paso = pasoPorId(sel.paso).paso;
      var items = [];
      for (var i = 0; i < sel.cantidad; i++) {
        var hora = entero(1, 12);
        var minuto = (entero(0, Math.floor(59 / paso)) * paso) % 60;
        items.push({
          id: 'h' + hora + '_' + minuto,
          hora: hora, minuto: minuto,
          texto: comoTexto(hora, minuto)
        });
      }
      prepararTablero();

      Motor.jugar(Object.assign({
        items: items,
        esCorrecta: function (it, respuesta) { return respuesta === it.texto; },
        render: function (it) {
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
          ].filter(function (t) { return t !== it.texto; });

          var malos = Util.muestra(candidatos.filter(function (t, i, a) { return a.indexOf(t) === i; }), 3);
          var lista = Util.mezclar(malos.concat([it.texto])).map(function (t) {
            return { id: t, valor: t };
          });
          Opciones.armar(lista, {
            clase: 'texto',
            contenido: function (o) { return o.valor; },
            alElegir: function (o, btn) {
              if (o.valor !== it.texto) { btn.classList.add('incorrecta'); btn.disabled = true; }
              else btn.classList.add('correcta');
              Motor.responder(o.valor);
            }
          });
        },
        alAcertar: function () { Opciones.bloquear(); },
        alRevelar: function (it) { Opciones.bloquear(); Opciones.marcar(it.texto, 'correcta'); },
        textoFallo: function (it, respuesta) { return 'No son las ' + respuesta + '.'; },
        textoRevelado: function (it) { return 'Eran las ' + it.texto; }
      }, ganchos));
    }
  };

  return {
    id: 'matematica',
    JUEGOS: [TABLAS, CUENTAS, RELOJ],
    claveItem: function (item) { return item.id; },
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
