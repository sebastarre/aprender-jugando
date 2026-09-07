/* ============================================================
   Armado de la página: materias, pantallas y navegación.

   Para sumar una materia nueva alcanza con agregarla a MATERIAS y
   darle una lista de juegos (ver js/juegos/geografia.js como modelo).
   ============================================================ */
(function () {
  'use strict';

  var $ = Util.$;

  /* ---------------------- catálogo de materias ---------------------- */
  var MATERIAS = [
    {
      id: 'geografia',
      nombre: 'Geografía',
      icono: '🌎',
      color: '#21b573',
      suave: '#e3f8ee',
      texto: 'Países, capitales y banderas de todo el mundo.',
      juegos: Geografia.JUEGOS,
      disponible: true
    },
    {
      id: 'matematicas', nombre: 'Matemática', icono: '➗', color: '#4c6ef5', suave: '#e8edff',
      texto: 'Sumas, restas, tablas y problemas.', juegos: [], disponible: false
    },
    {
      id: 'lengua', nombre: 'Lengua', icono: '📚', color: '#f5a524', suave: '#fff3dc',
      texto: 'Ortografía, sinónimos y lectura.', juegos: [], disponible: false
    },
    {
      id: 'ciencias', nombre: 'Ciencias', icono: '🔬', color: '#8b5cf6', suave: '#f1ebff',
      texto: 'El cuerpo, los animales y el espacio.', juegos: [], disponible: false
    }
  ];

  function materiaPorId(id) {
    for (var i = 0; i < MATERIAS.length; i++) if (MATERIAS[i].id === id) return MATERIAS[i];
    return null;
  }

  /* ---------------------- estado de navegación ---------------------- */
  var seleccion = { materia: null, juego: null, zona: null, modo: null, cantidad: 10 };
  var ultimoResultado = null;
  var PANTALLAS = ['inicio', 'materia', 'config', 'juego', 'fin'];

  function mostrar(nombre) {
    PANTALLAS.forEach(function (p) { $('pantalla-' + p).hidden = (p !== nombre); });
    $('btn-atras').hidden = (nombre === 'inicio');
    document.body.classList.toggle('jugando', nombre === 'juego');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function irA(hash) {
    if (location.hash === hash) enrutar();
    else location.hash = hash;
  }

  /* ---------------------- pantalla: materias ---------------------- */
  function pintarMaterias() {
    var cont = $('grilla-materias');
    Util.vaciar(cont);
    MATERIAS.forEach(function (m) {
      var b = Util.crear('button', 'card');
      b.type = 'button';
      b.style.setProperty('--card-color', m.color);
      b.style.setProperty('--card-suave', m.suave);
      b.disabled = !m.disponible;

      b.appendChild(Util.crear('div', 'card-icono', m.icono));
      b.appendChild(Util.crear('div', 'card-titulo', m.nombre));
      b.appendChild(Util.crear('div', 'card-texto', m.texto));
      if (m.disponible) {
        b.appendChild(Util.crear('div', 'card-texto',
          m.juegos.length + (m.juegos.length === 1 ? ' juego' : ' juegos')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      b.addEventListener('click', function () {
        Sonido.despertar(); Sonido.tocar('clic');
        irA('#/materia/' + m.id);
      });
      cont.appendChild(b);
    });
  }

  /* ---------------------- pantalla: juegos de la materia ---------------------- */
  function pintarJuegos(materia) {
    $('titulo-materia').textContent = materia.icono + ' ' + materia.nombre;
    $('subtitulo-materia').textContent = 'Elegí un juego para empezar.';

    var cont = $('grilla-juegos');
    Util.vaciar(cont);
    materia.juegos.forEach(function (j) {
      var b = Util.crear('button', 'card');
      b.type = 'button';
      b.style.setProperty('--card-color', j.color);
      b.style.setProperty('--card-suave', j.suave);
      b.appendChild(Util.crear('div', 'card-icono', j.icono));
      b.appendChild(Util.crear('div', 'card-titulo', j.nombre));
      b.appendChild(Util.crear('div', 'card-texto', j.texto));

      var mejor = Almacen.mejorDeJuego(j.id);
      if (mejor > 0) b.appendChild(Util.crear('div', 'card-record', '🏆 Tu récord: ' + mejor));

      b.addEventListener('click', function () {
        Sonido.tocar('clic');
        irA('#/juego/' + materia.id + '/' + j.id);
      });
      cont.appendChild(b);
    });
  }

  /* ---------------------- pantalla: configurar partida ---------------------- */
  function pintarConfig(materia, juego) {
    $('titulo-config').textContent = juego.icono + ' ' + juego.nombre;
    $('subtitulo-config').textContent = juego.texto;

    seleccion.materia = materia.id;
    seleccion.juego = juego.id;
    seleccion.zona = null;
    seleccion.modo = juego.modos ? juego.modos[0].id : null;
    seleccion.cantidad = 10;

    /* zonas */
    var gz = $('grilla-continentes');
    Util.vaciar(gz);
    Mapa.zonas().forEach(function (z) {
      var detalle = z.cantidad + ' países' + (z.nota ? ' · ' + z.nota : '');
      var b = botonOpcion(z.icono, z.nombre, detalle, juego.color, juego.suave);
      b.addEventListener('click', function () {
        seleccion.zona = z.id;
        marcarElegido(gz, b);
        pintarCantidades(z.cantidad, juego);
        actualizarResumen();
      });
      gz.appendChild(b);
    });

    /* modos (solo algunos juegos los tienen) */
    var bloqueModo = $('bloque-modo');
    var fm = $('fila-modo');
    Util.vaciar(fm);
    if (juego.modos) {
      bloqueModo.hidden = false;
      juego.modos.forEach(function (m, i) {
        var b = botonOpcion(m.icono, m.nombre, m.detalle, juego.color, juego.suave);
        if (i === 0) b.setAttribute('aria-pressed', 'true');
        b.addEventListener('click', function () {
          seleccion.modo = m.id;
          marcarElegido(fm, b);
          actualizarResumen();
        });
        fm.appendChild(b);
      });
      $('titulo-cantidad').textContent = '3. ¿Cuántas preguntas?';
    } else {
      bloqueModo.hidden = true;
      $('titulo-cantidad').textContent = '2. ¿Cuántas preguntas?';
    }

    pintarCantidades(0, juego);
    actualizarResumen();
  }

  function pintarCantidades(disponibles, juego) {
    var fc = $('fila-cantidad');
    Util.vaciar(fc);
    var opciones = [5, 10, 20, 40].filter(function (n) { return !disponibles || n < disponibles; });
    opciones.push('todos');

    if (opciones.indexOf(seleccion.cantidad) === -1) seleccion.cantidad = opciones[0];

    opciones.forEach(function (n) {
      var esTodos = n === 'todos';
      var b = botonOpcion(esTodos ? '∞' : '' + n,
        esTodos ? 'Todos' : n + ' preguntas',
        esTodos ? (disponibles ? disponibles + ' países' : 'todos los países') : null,
        juego.color, juego.suave);
      if (n === seleccion.cantidad) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        seleccion.cantidad = n;
        marcarElegido(fc, b);
        actualizarResumen();
      });
      fc.appendChild(b);
    });
  }

  function botonOpcion(icono, nombre, detalle, color, suave) {
    var b = Util.crear('button', 'opcion');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    if (color) { b.style.setProperty('--op-color', color); b.style.setProperty('--op-suave', suave); }
    b.appendChild(Util.crear('span', 'opcion-icono', icono));
    var cuerpo = Util.crear('span', 'opcion-cuerpo');
    cuerpo.appendChild(Util.crear('span', 'opcion-nombre', nombre));
    if (detalle) cuerpo.appendChild(Util.crear('span', 'opcion-detalle', detalle));
    b.appendChild(cuerpo);
    return b;
  }

  function marcarElegido(contenedor, boton) {
    Sonido.despertar(); Sonido.tocar('clic');
    contenedor.querySelectorAll('.opcion').forEach(function (o) {
      o.setAttribute('aria-pressed', o === boton ? 'true' : 'false');
    });
  }

  function actualizarResumen() {
    var listo = !!seleccion.zona;
    $('btn-empezar').disabled = !listo;
    if (!listo) {
      $('resumen-partida').textContent = 'Elegí una zona del mapa para continuar.';
      return;
    }
    var zona = Mapa.ZONAS[seleccion.zona].nombre;
    var cant = seleccion.cantidad === 'todos'
      ? Mapa.paisesDeZona(seleccion.zona).length
      : seleccion.cantidad;
    $('resumen-partida').textContent = zona + ' · ' + cant + ' preguntas · ' +
      Geografia.INTENTOS + ' intentos por pregunta';
  }

  /* ---------------------- pantalla: juego ---------------------- */
  function arrancarPartida() {
    Geografia.iniciar({
      juego: seleccion.juego,
      zona: seleccion.zona,
      modo: seleccion.modo,
      cantidad: seleccion.cantidad
    }, { alTerminar: terminarPartida });
  }

  /* ---------------------- pantalla: resultados ---------------------- */
  function terminarPartida(r) {
    ultimoResultado = r;

    var proporcion = r.maximo ? r.puntos / r.maximo : 0;
    var estrellas = proporcion >= 0.9 ? 3 : proporcion >= 0.7 ? 2 : proporcion >= 0.4 ? 1 : 0;

    var clave = r.juego.id + ':' + (r.modo || '-') + ':' + r.zona + ':' + r.total;
    var esRecord = Almacen.anotar(clave, r.puntos, r.aciertos, r.total);
    if (estrellas > 0) Almacen.sumarEstrellas(estrellas);
    pintarEstrellasBarra();

    var cont = $('estrellas-fin');
    Util.vaciar(cont);
    for (var i = 0; i < 3; i++) cont.appendChild(Util.crear('span', i < estrellas ? '' : 'apagada', '⭐'));

    $('titulo-fin').textContent = esRecord && r.puntos > 0 ? '¡Récord nuevo! 🏅' : tituloSegun(estrellas);
    $('subtitulo-fin').textContent = comentario(r, estrellas);

    $('stat-puntos').textContent = r.puntos;
    $('stat-aciertos').textContent = r.aciertos + '/' + r.total;
    $('stat-precision').textContent = r.precision + '%';
    $('stat-record').textContent = Almacen.record(clave).puntos;

    pintarRepaso(r.errores);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
  }

  function tituloSegun(estrellas) {
    return ['¡Seguí practicando! 💪', '¡Bien ahí! 👍', '¡Muy bien! 🎉', '¡Sos un crack! 🏆'][estrellas];
  }

  function comentario(r, estrellas) {
    if (r.errores.length === 0) return '¡No fallaste ni una! Increíble.';
    if (estrellas === 3) return 'Acertaste ' + r.aciertos + ' de ' + r.total + '. ¡Casi perfecto!';
    if (estrellas === 2) return 'Vas muy bien: repasá los de abajo y probá de nuevo.';
    return 'Mirá los países de abajo antes de volver a jugar. ¡Vas a mejorar!';
  }

  function pintarRepaso(errores) {
    var caja = $('repaso');
    var lista = $('lista-repaso');
    Util.vaciar(lista);
    caja.hidden = errores.length === 0;

    errores.forEach(function (p) {
      var item = Util.crear('div', 'item-repaso');
      var img = new Image();
      img.src = Util.bandera(p.id);
      img.alt = 'Bandera de ' + p.nombre;
      img.loading = 'lazy';
      item.appendChild(img);
      var cuerpo = Util.crear('div');
      cuerpo.appendChild(Util.crear('div', 'ir-nombre', p.nombre));
      cuerpo.appendChild(Util.crear('div', 'ir-dato', 'Capital: ' + p.capital + ' · ' + p.sub));
      item.appendChild(cuerpo);
      lista.appendChild(item);
    });
  }

  /* ---------------------- barra superior ---------------------- */
  function pintarEstrellasBarra() {
    $('chip-estrellas').querySelector('b').textContent = Almacen.estrellas();
  }

  function pintarBotonSonido() {
    var b = $('btn-sonido');
    var activo = Almacen.sonidoActivo();
    b.textContent = activo ? '🔊' : '🔇';
    b.classList.toggle('apagado', !activo);
    b.setAttribute('aria-label', activo ? 'Silenciar sonido' : 'Activar sonido');
  }

  /* ---------------------- ruteo ---------------------- */
  function enrutar() {
    var partes = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);

    if (partes[0] === 'materia' && partes[1]) {
      var m = materiaPorId(partes[1]);
      if (!m || !m.disponible) return irA('#/');
      Geografia.abandonar();
      pintarJuegos(m);
      return mostrar('materia');
    }

    if (partes[0] === 'juego' && partes[1] && partes[2]) {
      var mat = materiaPorId(partes[1]);
      var jg = mat && Geografia.juegoPorId(partes[2]);
      if (!mat || !jg) return irA('#/');
      Geografia.abandonar();
      pintarConfig(mat, jg);
      return mostrar('config');
    }

    if (partes[0] === 'jugar') {
      if (!seleccion.zona || !seleccion.juego) return irA('#/');
      mostrar('juego');
      return arrancarPartida();
    }

    if (partes[0] === 'fin') {
      if (!ultimoResultado) return irA('#/');
      return mostrar('fin');
    }

    Geografia.abandonar();
    pintarMaterias();
    mostrar('inicio');
  }

  function volverAtras() {
    var partes = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    Sonido.tocar('clic');
    if (partes[0] === 'jugar' || partes[0] === 'fin') {
      Geografia.abandonar();
      return irA('#/juego/' + seleccion.materia + '/' + seleccion.juego);
    }
    if (partes[0] === 'juego') return irA('#/materia/' + partes[1]);
    irA('#/');
  }

  /* ---------------------- eventos ---------------------- */
  function conectar() {
    $('btn-atras').addEventListener('click', volverAtras);

    $('btn-sonido').addEventListener('click', function () {
      Almacen.setSonido(!Almacen.sonidoActivo());
      pintarBotonSonido();
      Sonido.despertar();
      Sonido.tocar('clic');
    });

    $('btn-empezar').addEventListener('click', function () {
      if (!seleccion.zona) return;
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/jugar');
    });

    $('btn-otra-vez').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/jugar'); });
    $('btn-cambiar-zona').addEventListener('click', function () {
      Sonido.tocar('clic');
      irA('#/juego/' + seleccion.materia + '/' + seleccion.juego);
    });
    $('btn-al-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });

    document.querySelectorAll('[data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var svg = $('mapa').querySelector('svg');
        var m = Geografia.mapaActual();
        if (!svg || !m) return;
        var accion = b.getAttribute('data-zoom');
        if (accion === 'mas') m.zoom(1.6);
        else if (accion === 'menos') m.zoom(1 / 1.6);
        else m.reiniciar();
      });
    });

    window.addEventListener('hashchange', enrutar);
  }

  /* ---------------------- arranque ---------------------- */
  pintarEstrellasBarra();
  pintarBotonSonido();
  conectar();
  enrutar();
})();
