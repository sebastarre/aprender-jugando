/* ============================================================
   Juegos de geografía.

   Los tres juegos comparten el mismo motor: se plantea una pregunta,
   el chico tiene 3 intentos y, si falla los tres, el mapa muestra
   solo la respuesta correcta antes de pasar a la siguiente.
   ============================================================ */
window.Geografia = (function () {
  'use strict';

  var INTENTOS = 3;
  var PUNTOS_POR_INTENTO = [3, 2, 1];       // según en qué intento acierte
  var ESPERA_ACIERTO = 420;    // cuánto se ve el acierto antes de la próxima pregunta
  var ESPERA_FALLO = 260;      // bloqueo cortito tras un error (evita el doble clic)
  var MARCA_FALLO = 520;       // cuánto queda pintado en rojo el país equivocado
  var ESPERA_REVELAR = 1500;   // tiempo para mirar dónde estaba la respuesta

  /* ---------------------- catálogo de juegos ---------------------- */
  var JUEGOS = [
    {
      id: 'paises',
      nombre: 'Encontrá el país',
      icono: '🗺️',
      color: '#4c6ef5',
      suave: '#e8edff',
      texto: 'Te decimos un país y lo buscás en el mapa.',
      usaMapa: true
    },
    {
      id: 'capitales',
      nombre: 'Capitales',
      icono: '🏛️',
      color: '#f5a524',
      suave: '#fff3dc',
      texto: 'Te mostramos una capital: marcá a qué país pertenece.',
      usaMapa: true
    },
    {
      id: 'banderas',
      nombre: 'Banderas',
      icono: '🚩',
      color: '#ef4a5e',
      suave: '#ffe9ec',
      texto: 'Reconocé las banderas del mundo, en el mapa o eligiendo.',
      usaMapa: true,
      modos: [
        { id: 'mapa', nombre: 'En el mapa', icono: '🗺️', detalle: 'Buscá el país de la bandera' },
        { id: 'quiz', nombre: 'Elegir bandera', icono: '🎯', detalle: 'Cuatro banderas, una correcta' }
      ]
    }
  ];

  function juegoPorId(id) {
    for (var i = 0; i < JUEGOS.length; i++) if (JUEGOS[i].id === id) return JUEGOS[i];
    return null;
  }

  /* ---------------------- estado de la partida ---------------------- */
  var e = null;          // estado actual
  var mapa = null;
  var alTerminar = null;
  var temporizadores = [];

  function luego(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }
  function limpiarTiempos() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  /* ---------------------- avisos flotantes ---------------------- */
  function aviso(texto, tipo) {
    var el = Util.$('aviso');
    el.textContent = texto;
    el.className = 'aviso ' + (tipo || '');
    el.hidden = false;
    // reinicia la animación de entrada
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }
  function ocultarAviso() { Util.$('aviso').hidden = true; }

  /* ---------------------- arranque ---------------------- */
  function iniciar(config, ganchos) {
    limpiarTiempos();
    ocultarAviso();
    alTerminar = ganchos.alTerminar;

    var juego = juegoPorId(config.juego);
    var candidatos = Mapa.paisesDeZona(config.zona);
    var cantidad = config.cantidad === 'todos'
      ? candidatos.length
      : Math.min(config.cantidad, candidatos.length);

    e = {
      juego: juego,
      modo: config.modo || 'mapa',
      zona: config.zona,
      preguntas: Util.muestra(candidatos, cantidad),
      candidatos: candidatos,
      indice: 0,
      intento: 0,
      puntos: 0,
      aciertos: 0,
      perfectos: 0,
      errores: [],
      bloqueado: false,
      pistaDada: false
    };

    var conMapa = !(e.juego.id === 'banderas' && e.modo === 'quiz');
    Util.$('zona-mapa').hidden = !conMapa;
    Util.$('zona-opciones').hidden = conMapa;

    if (conMapa) {
      mapa = Mapa.crear(Util.$('mapa'), {
        zona: config.zona,
        jugables: candidatos.map(function (p) { return p.id; }),
        onClic: manejarClicMapa
      });
      var pista = Util.$('pista-mapa');
      pista.textContent = ('ontouchstart' in window)
        ? 'Arrastrá para mover · pellizcá para acercar'
        : 'Arrastrá para mover · rueda para acercar';
      pista.style.opacity = '1';
      luego(function () { pista.style.opacity = '0'; }, 5000);
    } else {
      mapa = null;
    }

    mostrarPregunta();
  }

  function actual() { return e.preguntas[e.indice]; }

  /* ---------------------- pintar la pregunta ---------------------- */
  function mostrarPregunta() {
    e.intento = 0;
    e.bloqueado = false;
    e.pistaDada = false;
    ocultarAviso();
    if (mapa) { mapa.limpiarMarcas(); mapa.reiniciar(); }

    var p = actual();
    var texto = Util.$('pregunta-texto');
    var img = Util.$('pregunta-bandera');
    img.hidden = true;

    if (e.juego.id === 'paises') {
      texto.innerHTML = '¿Dónde está <b>' + Util.escapar(p.nombre) + '</b>?';
    } else if (e.juego.id === 'capitales') {
      texto.innerHTML = '¿De qué país es capital <b>' + Util.escapar(p.capital) + '</b>?';
    } else if (e.modo === 'quiz') {
      texto.innerHTML = '¿Cuál es la bandera de <b>' + Util.escapar(p.nombre) + '</b>?';
      armarOpciones(p);
    } else {
      texto.innerHTML = '¿De qué país es esta bandera?';
      img.onload = function () { if (mapa) mapa.ajustarPanel(); };
      img.src = Util.bandera(p.id);
      img.alt = 'Bandera del país que hay que encontrar';
      img.hidden = false;
    }

    pintarHUD();
  }

  function pintarHUD() {
    var total = e.preguntas.length;
    Util.$('progreso-texto').textContent = (e.indice + 1) + ' / ' + total;
    Util.$('progreso-relleno').style.transform = 'scaleX(' + (e.indice / total) + ')';
    Util.$('marcador-puntos').textContent = e.puntos;

    var vidas = Util.$('vidas');
    Util.vaciar(vidas);
    for (var i = 0; i < INTENTOS; i++) {
      var s = Util.crear('span', i < e.intento ? 'gastada' : '', '❤️');
      vidas.appendChild(s);
    }
  }

  /* ---------------------- opciones del quiz de banderas ---------------------- */
  function armarOpciones(correcto) {
    var zona = Util.$('zona-opciones');
    Util.vaciar(zona);

    var otros = e.candidatos.filter(function (p) { return p.id !== correcto.id; });
    var mismos = otros.filter(function (p) { return p.sub === correcto.sub; });
    var elegidos = Util.muestra(mismos.length >= 3 ? mismos : otros, 3);
    if (elegidos.length < 3) elegidos = Util.muestra(otros, 3);

    Util.mezclar(elegidos.concat([correcto])).forEach(function (p, i) {
      var btn = Util.crear('button', 'btn-opcion');
      btn.type = 'button';
      var img = new Image();
      img.src = Util.bandera(p.id);
      img.alt = 'Bandera número ' + (i + 1);   // el nombre se revela recién al responder
      btn.appendChild(img);
      btn.appendChild(Util.crear('span', 'nombre-opcion', ''));
      btn.setAttribute('data-id', p.id);
      btn.setAttribute('data-nombre', p.nombre);
      btn.addEventListener('click', function () { manejarClicOpcion(p.id, btn); });
      zona.appendChild(btn);
    });
  }

  /** Al terminar la pregunta se muestra de quién era cada bandera. */
  function mostrarNombresOpciones() {
    Util.$('zona-opciones').querySelectorAll('.btn-opcion').forEach(function (b) {
      b.querySelector('.nombre-opcion').textContent = b.getAttribute('data-nombre');
    });
  }

  /* ---------------------- respuestas ---------------------- */
  function manejarClicMapa(id) {
    if (!e || e.bloqueado) return;
    Sonido.despertar();
    if (id === actual().id) return acertar();
    fallar(id);
  }

  function manejarClicOpcion(id, btn) {
    if (!e || e.bloqueado) return;
    Sonido.despertar();
    if (id === actual().id) {
      btn.classList.add('correcta');
      return acertar();
    }
    btn.classList.add('incorrecta');
    btn.disabled = true;
    fallar(id);
  }

  function nombreDe(id) {
    for (var i = 0; i < window.PAISES.length; i++) if (window.PAISES[i].id === id) return window.PAISES[i].nombre;
    return null;
  }

  function acertar() {
    e.bloqueado = true;
    var p = actual();
    var ganados = PUNTOS_POR_INTENTO[e.intento] || 1;
    e.puntos += ganados;
    e.aciertos++;
    if (e.intento === 0) e.perfectos++;

    if (mapa) {
      mapa.marcar(p.id, 'correcto');
      mapa.etiqueta(p, p.nombre);
    } else {
      Util.$('zona-opciones').querySelectorAll('.btn-opcion').forEach(function (b) { b.disabled = true; });
      mostrarNombresOpciones();
    }
    Sonido.tocar('acierto');

    Util.$('marcador-puntos').textContent = e.puntos;
    var caja = Util.$('marcador-puntos').parentNode;
    caja.classList.add('sube');
    luego(function () { caja.classList.remove('sube'); }, 400);

    aviso(festejo() + ' +' + ganados + (ganados === 1 ? ' punto' : ' puntos'), 'bien');
    luego(siguiente, ESPERA_ACIERTO);
  }

  function fallar(idClickeado) {
    e.intento++;
    e.bloqueado = true;
    pintarHUD();
    Sonido.tocar('error');

    var p = actual();
    var nombre = nombreDe(idClickeado);

    if (mapa && idClickeado) {
      mapa.marcar(idClickeado, 'fallo');
      luego(function () { mapa.desmarcar(idClickeado, 'fallo'); }, MARCA_FALLO);
    }

    if (e.intento >= INTENTOS) {
      luego(revelar, 160);
      return;
    }

    var quedan = INTENTOS - e.intento;
    var base = nombre && nombre !== p.nombre ? 'Ese es ' + nombre + '. ' : '¡Casi! ';
    var texto = base + 'Te ' + (quedan === 1 ? 'queda 1 intento' : 'quedan ' + quedan + ' intentos');

    // si el país es diminuto, la pista va en el mismo aviso (no en uno aparte:
    // con los tiempos cortos el segundo cartel no llegaría a leerse)
    if (mapa && p.mini && !e.pistaDada) {
      e.pistaDada = true;
      texto += ' · Es muy chiquito: buscá el puntito 🔍';
    }
    aviso(texto, 'mal');

    luego(function () { e.bloqueado = false; }, ESPERA_FALLO);
  }

  function revelar() {
    var p = actual();
    e.errores.push(p);
    Sonido.tocar('revelar');

    if (mapa) {
      mapa.limpiarMarcas();
      mapa.marcar(p.id, 'revelado');
      if (p.mini || !mapa.estaEnVista(p)) mapa.enfocar(p, p.mini ? 7 : 3);
      mapa.etiqueta(p, p.nombre);
    } else {
      Util.$('zona-opciones').querySelectorAll('.btn-opcion').forEach(function (b) {
        b.disabled = true;
        if (b.getAttribute('data-id') === p.id) b.classList.add('correcta');
      });
      mostrarNombresOpciones();
    }

    var mensaje;
    if (!mapa) mensaje = 'Era ' + p.nombre + '. ¡Mirá bien su bandera!';
    else if (e.juego.id === 'capitales') mensaje = 'Era ' + p.nombre + ': ahí está ' + p.capital;
    else mensaje = 'Era ' + p.nombre + '. ¡Ahora ya sabés dónde queda!';
    aviso(mensaje, 'dato');
    luego(siguiente, ESPERA_REVELAR);
  }

  function festejo() {
    return Util.alAzar(['¡Muy bien! 🎉', '¡Excelente! ⭐', '¡Perfecto! 👏', '¡Genial! 🙌', '¡Lo lograste! 🥳']);
  }

  /* ---------------------- avance ---------------------- */
  function siguiente() {
    limpiarTiempos();
    e.indice++;
    if (e.indice >= e.preguntas.length) return finalizar();
    mostrarPregunta();
  }

  function finalizar() {
    Util.$('progreso-relleno').style.transform = 'scaleX(1)';
    ocultarAviso();
    var total = e.preguntas.length;
    var resultado = {
      juego: e.juego,
      modo: e.modo,
      zona: e.zona,
      total: total,
      puntos: e.puntos,
      aciertos: e.aciertos,
      perfectos: e.perfectos,
      maximo: total * PUNTOS_POR_INTENTO[0],
      precision: total ? Math.round(e.aciertos / total * 100) : 0,
      errores: e.errores.slice()
    };
    e = null;
    if (alTerminar) alTerminar(resultado);
  }

  /** Corta la partida en curso (por ejemplo al tocar "Volver"). */
  function abandonar() {
    limpiarTiempos();
    ocultarAviso();
    e = null;
    mapa = null;
  }

  return {
    JUEGOS: JUEGOS,
    juegoPorId: juegoPorId,
    iniciar: iniciar,
    mapaActual: function () { return mapa; },
    abandonar: abandonar,
    INTENTOS: INTENTOS
  };
})();
