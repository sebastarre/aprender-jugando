/* ============================================================
   Armado de la página: materias, pantallas y navegación.

   Para sumar una materia nueva:
     1. crear js/juegos/<materia>.js con la misma forma que geografia.js
        (una lista JUEGOS y las funciones claveItem / repaso / limpiar),
     2. sumar su <script> en index.html,
     3. agregarla acá abajo en MATERIAS.
   Las rondas, el puntaje y los intentos ya los pone js/nucleo/motor.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = Util.$;

  /* ---------------------- catálogo de materias ---------------------- */
  var MATERIAS = [
    {
      id: 'geografia', nombre: 'Geografía', icono: '🌎',
      color: '#21b573', suave: '#e3f8ee',
      texto: 'Países, capitales y banderas de todo el mundo.',
      modulo: Geografia
    },
    {
      id: 'matematica', nombre: 'Matemática', icono: '➗',
      color: '#4c6ef5', suave: '#e8edff',
      texto: 'Tablas, sumas, restas y la hora del reloj.',
      modulo: Matematica
    },
    {
      id: 'lengua', nombre: 'Lengua', icono: '📚',
      color: '#f5a524', suave: '#fff3dc',
      texto: 'Ortografía, sinónimos y lectura.', modulo: null
    },
    {
      id: 'ciencias', nombre: 'Ciencias', icono: '🔬',
      color: '#8b5cf6', suave: '#f1ebff',
      texto: 'El cuerpo, los animales y el espacio.', modulo: null
    }
  ];

  MATERIAS.forEach(function (m) {
    m.disponible = !!m.modulo;
    m.juegos = m.modulo ? m.modulo.JUEGOS : [];
  });

  function materiaPorId(id) {
    for (var i = 0; i < MATERIAS.length; i++) if (MATERIAS[i].id === id) return MATERIAS[i];
    return null;
  }

  function juegoPorId(materia, id) {
    if (!materia || !materia.juegos) return null;
    for (var i = 0; i < materia.juegos.length; i++) {
      if (materia.juegos[i].id === id) return materia.juegos[i];
    }
    return null;
  }

  /* ---------------------- estado ---------------------- */
  var sel = { materia: null, juego: null, valores: {}, cantidad: 10 };
  var grupos = [];               // los bloques de opciones del juego actual
  var ultimoResultado = null;
  var PANTALLAS = ['inicio', 'materia', 'config', 'juego', 'fin', 'perfil', 'parental'];

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

  function cortarPartida() {
    Motor.abandonar();
    MATERIAS.forEach(function (m) { if (m.modulo && m.modulo.limpiar) m.modulo.limpiar(); });
  }

  /* ---------------------- inicio ---------------------- */
  function pintarMaterias() {
    var yo = Almacen.activo();
    $('saludo-inicio').textContent = '¡Hola, ' + yo.nombre + '! Elegí una materia y empezá a jugar.';

    var cont = $('grilla-materias');
    Util.vaciar(cont);
    MATERIAS.forEach(function (m) {
      var b = tarjeta(m, function () { irA('#/materia/' + m.id); });
      b.disabled = !m.disponible;
      if (m.disponible) {
        b.appendChild(Util.crear('div', 'card-texto', Util.plural(m.juegos.length, 'juego')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  function tarjeta(datos, alTocar) {
    var b = Util.crear('button', 'card');
    b.type = 'button';
    b.style.setProperty('--card-color', datos.color);
    b.style.setProperty('--card-suave', datos.suave);
    b.appendChild(Util.crear('div', 'card-icono', datos.icono));
    b.appendChild(Util.crear('div', 'card-titulo', datos.nombre));
    b.appendChild(Util.crear('div', 'card-texto', datos.texto));
    b.addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      alTocar();
    });
    return b;
  }

  /* ---------------------- juegos de una materia ---------------------- */
  function pintarJuegos(materia) {
    $('titulo-materia').textContent = materia.icono + ' ' + materia.nombre;
    $('subtitulo-materia').textContent = 'Elegí un juego para empezar.';

    var cont = $('grilla-juegos');
    Util.vaciar(cont);
    materia.juegos.forEach(function (j) {
      var b = tarjeta(j, function () { irA('#/juego/' + materia.id + '/' + j.id); });
      var mejor = Almacen.mejorDeJuego(materia.id + '/' + j.id);
      if (mejor > 0) b.appendChild(Util.crear('div', 'card-record', '🏆 Tu récord: ' + mejor));
      cont.appendChild(b);
    });
  }

  /* ---------------------- configurar la partida ---------------------- */
  function pintarConfig(materia, juego) {
    $('titulo-config').textContent = juego.icono + ' ' + juego.nombre;
    $('subtitulo-config').textContent = juego.texto;

    sel.materia = materia.id;
    sel.juego = juego.id;
    sel.valores = {};
    sel.cantidad = 10;

    grupos = juego.opciones();
    grupos.forEach(function (g) {
      if (g.porDefecto) sel.valores[g.id] = g.porDefecto;
    });

    var caja = $('bloques-opciones');
    Util.vaciar(caja);

    grupos.forEach(function (grupo, i) {
      caja.appendChild(bloqueDeOpciones(grupo, i + 1, juego));
    });

    // el último bloque, común a todos los juegos: cuántas preguntas
    var bloqueCantidad = Util.crear('div', 'bloque-config');
    bloqueCantidad.id = 'bloque-cantidad';
    bloqueCantidad.appendChild(
      Util.crear('h2', 'etiqueta-grupo', (grupos.length + 1) + '. ¿Cuántas preguntas?'));
    var fila = Util.crear('div', 'fila-opciones');
    fila.id = 'fila-cantidad';
    bloqueCantidad.appendChild(fila);
    caja.appendChild(bloqueCantidad);

    pintarCantidades(juego);
    actualizarResumen(juego);
  }

  function bloqueDeOpciones(grupo, numero, juego) {
    var bloque = Util.crear('div', 'bloque-config');
    bloque.appendChild(Util.crear('h2', 'etiqueta-grupo', numero + '. ' + grupo.titulo));

    var caja = Util.crear('div', grupo.tipo === 'fila' ? 'fila-opciones' : 'grilla-continentes');
    grupo.items.forEach(function (item) {
      var b = botonOpcion(item.icono, item.nombre, item.detalle, juego.color, juego.suave);
      if (sel.valores[grupo.id] === item.id) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        sel.valores[grupo.id] = item.id;
        marcarElegido(caja, b);
        pintarCantidades(juego);
        actualizarResumen(juego);
      });
      caja.appendChild(b);
    });

    bloque.appendChild(caja);
    return bloque;
  }

  function pintarCantidades(juego) {
    var fila = $('fila-cantidad');
    if (!fila) return;
    Util.vaciar(fila);

    var info = juego.cantidades(datosSeleccion());
    var lista = info.lista;
    if (lista.indexOf(sel.cantidad) === -1) {
      sel.cantidad = lista.indexOf(10) !== -1 ? 10 : lista[0];
    }

    lista.forEach(function (n) {
      var esTodos = n === 'todos';
      var b = botonOpcion(
        esTodos ? '∞' : String(n),
        esTodos ? 'Todas' : n + ' preguntas',
        esTodos ? (info.total ? info.total + ' ' + info.unidad : null) : null,
        juego.color, juego.suave);
      if (n === sel.cantidad) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        sel.cantidad = n;
        marcarElegido(fila, b);
        actualizarResumen(juego);
      });
      fila.appendChild(b);
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

  /** Lo que se le pasa al juego: las opciones elegidas, en plano. */
  function datosSeleccion() {
    var d = { cantidad: sel.cantidad };
    Object.keys(sel.valores).forEach(function (k) { d[k] = sel.valores[k]; });
    return d;
  }

  function faltaElegir() {
    for (var i = 0; i < grupos.length; i++) {
      if (!sel.valores[grupos[i].id]) return grupos[i];
    }
    return null;
  }

  function actualizarResumen(juego) {
    var falta = faltaElegir();
    $('btn-empezar').disabled = !!falta;
    if (falta) {
      $('resumen-partida').textContent = falta.titulo + ' para continuar.';
      return;
    }
    var texto = juego.resumen(datosSeleccion());
    $('resumen-partida').textContent = texto + ' · ' + Motor.INTENTOS + ' intentos por pregunta';
  }

  /* ---------------------- jugar ---------------------- */
  function arrancarPartida() {
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    if (!materia || !juego) return irA('#/');
    juego.jugar(datosSeleccion(), { alTerminar: terminarPartida });
  }

  /* ---------------------- resultados ---------------------- */
  function terminarPartida(r) {
    ultimoResultado = r;
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);

    var proporcion = r.maximo ? r.puntos / r.maximo : 0;
    var estrellas = proporcion >= 0.9 ? 3 : proporcion >= 0.7 ? 2 : proporcion >= 0.4 ? 1 : 0;

    var detalle = juego.resumen(datosSeleccion());
    var clave = materia.id + '/' + juego.id + ':' + detalle;
    var esRecord = Almacen.anotar(clave, r.puntos, r.aciertos, r.total);
    if (estrellas > 0) Almacen.sumarEstrellas(estrellas);

    Almacen.registrarPartida({
      materia: materia.id, juego: juego.id, detalle: detalle,
      puntos: r.puntos, maximo: r.maximo,
      aciertos: r.aciertos, total: r.total, estrellas: estrellas
    });
    Almacen.registrarErrores(materia.id, r.errores.map(function (item) {
      return { clave: materia.modulo.claveItem(item), nombre: materia.modulo.repaso(item).nombre };
    }));
    pintarBarraSuperior();

    var cont = $('estrellas-fin');
    Util.vaciar(cont);
    for (var i = 0; i < 3; i++) cont.appendChild(Util.crear('span', i < estrellas ? '' : 'apagada', '⭐'));

    $('titulo-fin').textContent = esRecord && r.puntos > 0 ? '¡Récord nuevo! 🏅' : tituloSegun(estrellas);
    $('subtitulo-fin').textContent = comentario(r, estrellas);
    $('stat-puntos').textContent = r.puntos;
    $('stat-aciertos').textContent = r.aciertos + '/' + r.total;
    $('stat-precision').textContent = r.precision + '%';
    $('stat-record').textContent = Almacen.record(clave).puntos;

    pintarRepaso(materia, r.errores);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
  }

  function tituloSegun(estrellas) {
    return ['¡Seguí practicando! 💪', '¡Bien ahí! 👍', '¡Muy bien! 🎉', '¡Sos un crack! 🏆'][estrellas];
  }

  function comentario(r, estrellas) {
    if (r.errores.length === 0) return '¡No fallaste ni una! Increíble.';
    if (estrellas === 3) return 'Acertaste ' + r.aciertos + ' de ' + r.total + '. ¡Casi perfecto!';
    if (estrellas === 2) return 'Vas muy bien: repasá lo de abajo y probá de nuevo.';
    return 'Mirá lo de abajo antes de volver a jugar. ¡Vas a mejorar!';
  }

  function pintarRepaso(materia, errores) {
    var caja = $('repaso');
    var lista = $('lista-repaso');
    Util.vaciar(lista);
    caja.hidden = errores.length === 0;
    errores.forEach(function (item) {
      lista.appendChild(itemRepaso(materia.modulo.repaso(item)));
    });
  }

  function itemRepaso(datos) {
    var item = Util.crear('div', 'item-repaso');
    if (datos.imagen) {
      var img = new Image();
      img.src = datos.imagen;
      img.alt = '';
      img.loading = 'lazy';
      item.appendChild(img);
    } else {
      item.appendChild(Util.crear('span', 'item-simbolo', datos.simbolo || '•'));
    }
    var cuerpo = Util.crear('div');
    cuerpo.appendChild(Util.crear('div', 'ir-nombre', datos.nombre));
    if (datos.dato) cuerpo.appendChild(Util.crear('div', 'ir-dato', datos.dato));
    item.appendChild(cuerpo);
    return item;
  }

  /* ---------------------- perfil ---------------------- */
  function pintarPerfil() {
    var yo = Almacen.activo();
    var est = Almacen.estadisticas();

    $('perfil-avatar').textContent = yo.avatar;
    $('perfil-nombre').textContent = yo.nombre;
    $('perfil-desde').textContent = est.partidas === 0
      ? 'Todavía no jugaste ninguna partida.'
      : Util.plural(est.partidas, 'partida jugada', 'partidas jugadas') +
        (est.racha > 1 ? ' · 🔥 ' + est.racha + ' días seguidos' : '');

    var stats = $('perfil-stats');
    Util.vaciar(stats);
    [
      ['⭐ ' + est.estrellas, 'estrellas'],
      [est.precision + '%', 'precisión'],
      [est.aciertos + '/' + est.preguntas, 'aciertos'],
      [String(est.puntos), 'puntos en total']
    ].forEach(function (par) {
      var d = Util.crear('div', 'stat');
      d.appendChild(Util.crear('b', null, par[0]));
      d.appendChild(Util.crear('span', null, par[1]));
      stats.appendChild(d);
    });

    var lista = $('perfil-materias');
    Util.vaciar(lista);
    var conDatos = MATERIAS.filter(function (m) { return est.porMateria[m.id]; });
    if (!conDatos.length) {
      lista.appendChild(Util.crear('p', 'vacio', 'Jugá una partida y acá vas a ver cómo te fue.'));
    }
    conDatos.forEach(function (m) {
      var d = est.porMateria[m.id];
      var pct = d.total ? Math.round(d.aciertos / d.total * 100) : 0;
      var fila = Util.crear('div', 'fila-materia');
      fila.appendChild(Util.crear('span', 'fila-icono', m.icono));
      var cuerpo = Util.crear('div', 'fila-cuerpo');
      cuerpo.appendChild(Util.crear('div', 'fila-nombre', m.nombre));
      var barra = Util.crear('div', 'barra-progreso');
      var relleno = Util.crear('i');
      relleno.style.width = pct + '%';
      relleno.style.background = m.color;
      barra.appendChild(relleno);
      cuerpo.appendChild(barra);
      fila.appendChild(cuerpo);
      fila.appendChild(Util.crear('span', 'fila-dato', pct + '%'));
      lista.appendChild(fila);
    });

    pintarListaPerfiles();
  }

  function pintarListaPerfiles() {
    var caja = $('grilla-perfiles');
    Util.vaciar(caja);
    var activo = Almacen.activo();
    Almacen.perfiles().forEach(function (p) {
      var b = Util.crear('button', 'perfil-chip');
      b.type = 'button';
      b.setAttribute('aria-pressed', p.id === activo.id ? 'true' : 'false');
      b.appendChild(Util.crear('span', 'perfil-chip-avatar', p.avatar));
      b.appendChild(Util.crear('span', 'perfil-chip-nombre', p.nombre));
      b.addEventListener('click', function () {
        Sonido.tocar('clic');
        Almacen.usar(p.id);
        pintarBarraSuperior();
        pintarPerfil();
      });
      caja.appendChild(b);
    });
  }

  function nuevoPerfil() {
    var nombre = window.prompt('¿Cómo se llama el jugador nuevo?');
    if (nombre === null) return;
    nombre = nombre.trim();
    if (!nombre) return;
    var usados = Almacen.perfiles().map(function (p) { return p.avatar; });
    var libres = Almacen.AVATARES.filter(function (a) { return usados.indexOf(a) === -1; });
    Almacen.crearPerfil(nombre, libres.length ? libres[0] : Util.alAzar(Almacen.AVATARES));
    pintarBarraSuperior();
    pintarPerfil();
  }

  /* ---------------------- modo parental ---------------------- */
  function pintarParental() {
    $('caja-parental').hidden = true;
    $('caja-pin').hidden = false;
    $('error-pin').hidden = true;
    $('campo-pin').value = '';
    var primeraVez = !Almacen.hayPin();
    $('texto-pin').textContent = primeraVez
      ? 'Elegí un PIN de 4 números para proteger esta sección.'
      : 'Ingresá el PIN para ver el detalle.';
    $('btn-pin').textContent = primeraVez ? 'Crear PIN' : 'Entrar';
    $('btn-olvide-pin').hidden = primeraVez;
  }

  function intentarPin() {
    var valor = $('campo-pin').value.trim();
    if (!/^\d{4}$/.test(valor)) {
      $('error-pin').textContent = 'Tienen que ser 4 números.';
      $('error-pin').hidden = false;
      return;
    }
    if (!Almacen.hayPin()) {
      Almacen.setPin(valor);
      return abrirParental();
    }
    if (!Almacen.pinCorrecto(valor)) {
      $('error-pin').textContent = 'PIN incorrecto.';
      $('error-pin').hidden = false;
      $('campo-pin').value = '';
      return;
    }
    abrirParental();
  }

  function abrirParental() {
    $('caja-pin').hidden = true;
    $('caja-parental').hidden = false;

    var yo = Almacen.activo();
    var est = Almacen.estadisticas();
    $('parental-sub').textContent = 'Datos de ' + yo.nombre + ' · ' +
      Util.plural(est.partidas, 'partida') + ' · ' + est.precision + '% de aciertos';

    var fallos = $('parental-fallos');
    Util.vaciar(fallos);
    var lista = Almacen.masFallados(10);
    if (!lista.length) {
      fallos.appendChild(Util.crear('p', 'vacio', 'Todavía no hay errores registrados.'));
    }
    lista.forEach(function (f) {
      var materia = materiaPorId(f.materia);
      fallos.appendChild(itemRepaso({
        simbolo: materia ? materia.icono : '•',
        nombre: f.nombre,
        dato: 'Falló ' + Util.plural(f.veces, 'vez', 'veces')
      }));
    });

    var tabla = $('parental-partidas');
    Util.vaciar(tabla);
    if (!est.ultimas.length) {
      tabla.appendChild(Util.crear('p', 'vacio', 'Sin partidas todavía.'));
    }
    est.ultimas.forEach(function (p) {
      var materia = materiaPorId(p.materia);
      var fila = Util.crear('div', 'fila-partida');
      fila.appendChild(Util.crear('span', 'fila-icono', materia ? materia.icono : '•'));
      var cuerpo = Util.crear('div', 'fila-cuerpo');
      cuerpo.appendChild(Util.crear('div', 'fila-nombre', p.detalle || p.juego));
      cuerpo.appendChild(Util.crear('div', 'ir-dato', fechaCorta(p.fecha)));
      fila.appendChild(cuerpo);
      fila.appendChild(Util.crear('span', 'fila-dato', p.aciertos + '/' + p.total));
      tabla.appendChild(fila);
    });
  }

  function fechaCorta(ms) {
    var d = new Date(ms);
    var hoy = new Date();
    var mismoDia = d.toDateString() === hoy.toDateString();
    var hora = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (mismoDia) return 'hoy ' + hora;
    return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + hora;
  }

  /* ---------------------- barra superior ---------------------- */
  function pintarBarraSuperior() {
    $('chip-estrellas').querySelector('b').textContent = Almacen.estrellas();
    var yo = Almacen.activo();
    $('btn-perfil').textContent = yo.avatar;
    $('btn-perfil').setAttribute('aria-label', 'Perfil de ' + yo.nombre);
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
      cortarPartida();
      pintarJuegos(m);
      return mostrar('materia');
    }

    if (partes[0] === 'juego' && partes[1] && partes[2]) {
      var mat = materiaPorId(partes[1]);
      var jg = juegoPorId(mat, partes[2]);
      if (!mat || !jg) return irA('#/');
      cortarPartida();
      pintarConfig(mat, jg);
      return mostrar('config');
    }

    if (partes[0] === 'jugar') {
      if (!sel.juego || faltaElegir()) return irA('#/');
      mostrar('juego');
      return arrancarPartida();
    }

    if (partes[0] === 'fin') {
      if (!ultimoResultado) return irA('#/');
      return mostrar('fin');
    }

    if (partes[0] === 'perfil') {
      cortarPartida();
      pintarPerfil();
      return mostrar('perfil');
    }

    if (partes[0] === 'parental') {
      cortarPartida();
      pintarParental();
      return mostrar('parental');
    }

    cortarPartida();
    pintarMaterias();
    mostrar('inicio');
  }

  function volverAtras() {
    var partes = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    Sonido.tocar('clic');
    if (partes[0] === 'jugar' || partes[0] === 'fin') {
      cortarPartida();
      return irA('#/juego/' + sel.materia + '/' + sel.juego);
    }
    if (partes[0] === 'juego') return irA('#/materia/' + partes[1]);
    if (partes[0] === 'parental') return irA('#/perfil');
    irA('#/');
  }

  /* ---------------------- eventos ---------------------- */
  function conectar() {
    $('btn-atras').addEventListener('click', volverAtras);
    $('btn-perfil').addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/perfil');
    });

    $('btn-sonido').addEventListener('click', function () {
      Almacen.setSonido(!Almacen.sonidoActivo());
      pintarBotonSonido();
      Sonido.despertar();
      Sonido.tocar('clic');
    });

    $('btn-empezar').addEventListener('click', function () {
      if (faltaElegir()) return;
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/jugar');
    });

    $('btn-otra-vez').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/jugar'); });
    $('btn-cambiar-zona').addEventListener('click', function () {
      Sonido.tocar('clic');
      irA('#/juego/' + sel.materia + '/' + sel.juego);
    });
    $('btn-al-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });

    $('btn-nuevo-perfil').addEventListener('click', nuevoPerfil);
    $('btn-parental').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/parental'); });

    $('btn-pin').addEventListener('click', intentarPin);
    $('campo-pin').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') intentarPin();
    });
    $('btn-olvide-pin').addEventListener('click', function () {
      if (window.confirm('Para poder entrar hay que borrar el PIN actual y crear uno nuevo. ¿Seguimos?')) {
        Almacen.setPin(null);
        pintarParental();
      }
    });
    $('btn-cambiar-pin').addEventListener('click', function () {
      Almacen.setPin(null);
      pintarParental();
    });
    $('btn-borrar-progreso').addEventListener('click', function () {
      var yo = Almacen.activo();
      if (!window.confirm('Se borra todo el progreso de ' + yo.nombre + '. Esto no se puede deshacer. ¿Borrar?')) return;
      Almacen.borrarProgreso();
      pintarBarraSuperior();
      abrirParental();
    });

    document.querySelectorAll('[data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = Geografia.mapaActual();
        if (!m) return;
        var accion = b.getAttribute('data-zoom');
        if (accion === 'mas') m.zoom(1.6);
        else if (accion === 'menos') m.zoom(1 / 1.6);
        else m.reiniciar();
      });
    });

    window.addEventListener('hashchange', enrutar);
  }

  /* ---------------------- arranque ---------------------- */
  pintarBarraSuperior();
  pintarBotonSonido();
  conectar();
  enrutar();
})();
