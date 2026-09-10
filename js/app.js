/* ============================================================
   Armado de la página: las dos secciones (Aprender y Jugar),
   las pantallas y la navegación.

   La app tiene dos mitades que se apoyan una en la otra:
     Aprender  cursitos cortos que explican algo (js/aprender/)
     Jugar     juegos para practicar eso mismo   (js/juegos/)

   Para sumar una materia nueva:
     1. crear js/juegos/<materia>.js como geografia.js (lista JUEGOS
        más claveItem / repaso / limpiar),
     2. sumar su <script> en index.html,
     3. agregarla acá abajo en MATERIAS.
   Las lecciones se agregan en js/aprender/contenido.js.
   ============================================================ */
(function () {
  'use strict';

  var $ = Util.$;
  var EDADES = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  var MARGEN_EDAD = 2;        // cuántos años más adelante se muestran (bloqueados)

  /* ---------------------- catálogo de materias ---------------------- */
  var MATERIAS = [
    {
      id: 'geografia', nombre: 'Geografía', icono: 'geografia',
      color: '#16a34a', suave: '#dcfce7',
      texto: 'Países, capitales y banderas de todo el mundo.',
      modulo: Geografia
    },
    {
      id: 'matematica', nombre: 'Matemática', icono: 'matematica',
      color: '#2563eb', suave: '#dbeafe',
      texto: 'Tablas, sumas, restas y la hora del reloj.',
      modulo: Matematica
    },
    {
      id: 'lengua', nombre: 'Lengua', icono: 'lengua',
      color: '#f59e0b', suave: '#fef3c7',
      texto: 'Ortografía, sinónimos y lectura.', modulo: null
    },
    {
      id: 'ciencias', nombre: 'Ciencias', icono: 'ciencias',
      color: '#8b5cf6', suave: '#ede9fe',
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

  /** Busca por clave 'materia/juego'. */
  function porClave(clave) {
    var partes = String(clave).split('/');
    var materia = materiaPorId(partes[0]);
    return { materia: materia, juego: juegoPorId(materia, partes[1]) };
  }

  function leccionesDe(materiaId) {
    return window.Lecciones ? Lecciones.deMateria(materiaId) : [];
  }

  /* ---------------------- edad y desbloqueos ---------------------- */

  /** ¿Se puede jugar? Y si no, por qué. */
  function estadoDeJuego(materia, juego) {
    var edad = Almacen.edad();
    if (edad && juego.edadMin && edad < juego.edadMin) {
      return { jugable: false, tipo: 'edad', motivo: 'A partir de los ' + juego.edadMin + ' años' };
    }
    if (juego.requiere) {
      var tiene = Almacen.estrellasDeJuego(juego.requiere.juego);
      if (tiene < juego.requiere.estrellas) {
        var otro = porClave(juego.requiere.juego).juego;
        return {
          jugable: false, tipo: 'requisito',
          motivo: 'Juntá ' + juego.requiere.estrellas + ' ⭐ en «' + (otro ? otro.nombre : '…') + '»',
          progreso: tiene + ' de ' + juego.requiere.estrellas
        };
      }
    }
    return { jugable: true };
  }

  /** Los juegos que tiene sentido mostrarle: los de su edad y los que vienen. */
  function juegosVisibles(materia) {
    var edad = Almacen.edad();
    return materia.juegos.filter(function (j) {
      if (!edad || !j.edadMin) return true;
      return j.edadMin <= edad + MARGEN_EDAD;
    });
  }

  function leccionesVisibles(materiaId) {
    var edad = Almacen.edad();
    return leccionesDe(materiaId).filter(function (l) {
      if (!edad || !l.edadMin) return true;
      return l.edadMin <= edad + MARGEN_EDAD;
    });
  }

  /** Foto de qué juegos están trabados, para detectar desbloqueos después. */
  function trabadosAhora() {
    var lista = [];
    MATERIAS.forEach(function (m) {
      m.juegos.forEach(function (j) {
        if (!estadoDeJuego(m, j).jugable) lista.push(m.id + '/' + j.id);
      });
    });
    return lista;
  }

  /* ---------------------- monedas ---------------------- */
  /* Repetir lo que ya sabés rinde menos: acertar algo por primera vez paga 5,
     la segunda 3, después 2, y de ahí en adelante 1. El piso es 1 y no 0 para
     que volver a tu juego preferido siga dando algo, aunque sea poco. */
  var MONEDAS_POR_NOVEDAD = [5, 3, 2, 1];
  var TOPE_MONEDAS = 30;      // por partida; empareja los juegos que generan
                              // preguntas nuevas siempre (las cuentas difíciles)

  /** `claves` viene como 'materia:item', así sirve igual para un examen mezclado. */
  function calcularMonedas(claves) {
    var repetidosAca = {};    // si el mismo ítem sale dos veces, la segunda ya decae
    var total = 0, nuevos = 0, repasados = 0;

    claves.forEach(function (clave) {
      var previas = Almacen.aciertosDe(clave) + (repetidosAca[clave] || 0);
      repetidosAca[clave] = (repetidosAca[clave] || 0) + 1;
      total += MONEDAS_POR_NOVEDAD[Math.min(previas, MONEDAS_POR_NOVEDAD.length - 1)];
      if (previas === 0) nuevos++; else repasados++;
    });

    return {
      total: Math.min(total, TOPE_MONEDAS),
      topeAlcanzado: total > TOPE_MONEDAS,
      nuevos: nuevos,
      repasados: repasados
    };
  }

  /* ---------------------- estado ---------------------- */
  var sel = { materia: null, juego: null, valores: {}, cantidad: 10 };
  var grupos = [];
  var ultimoResultado = null;
  var bienvenida = { nombre: '', edad: null, avatar: null, editando: null };
  var PANTALLAS = ['bienvenida', 'juegos', 'aprender', 'materia', 'lecciones', 'leccion',
                   'config', 'juego', 'fin', 'perfil', 'tienda', 'parental',
                   'examen', 'nota', 'configuracion', 'personalizacion'];
  var CON_SECCIONES = ['juegos', 'aprender', 'materia', 'lecciones'];

  function mostrar(nombre) {
    PANTALLAS.forEach(function (p) { $('pantalla-' + p).hidden = (p !== nombre); });
    $('btn-atras').hidden = (nombre === 'juegos' || nombre === 'aprender' || nombre === 'bienvenida');
    $('secciones').hidden = CON_SECCIONES.indexOf(nombre) === -1;
    document.body.classList.toggle('jugando', nombre === 'juego');
    document.body.classList.toggle('sin-perfil', nombre === 'bienvenida');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function marcarSeccion(cual) {
    $('tab-juegos').setAttribute('aria-current', cual === 'juegos' ? 'page' : 'false');
    $('tab-aprender').setAttribute('aria-current', cual === 'aprender' ? 'page' : 'false');
  }

  function irA(hash) {
    if (location.hash === hash) enrutar();
    else location.hash = hash;
  }

  function cortarPartida() {
    Motor.abandonar();
    MATERIAS.forEach(function (m) { if (m.modulo && m.modulo.limpiar) m.modulo.limpiar(); });
  }

  /* ---------------------- bienvenida ---------------------- */
  function empezarBienvenida() {
    var yo = Almacen.activo();
    bienvenida = {
      nombre: yo ? yo.nombre : '',
      edad: null,
      avatar: yo ? yo.avatar : null,
      editando: yo ? yo.id : null
    };
    $('campo-nombre').value = (yo && yo.nombre !== 'Jugador') ? yo.nombre : '';
    $('error-nombre').hidden = true;
    pasoBienvenida('nombre');
    pintarEdades();
    pintarAvatares();
  }

  function pasoBienvenida(cual) {
    ['nombre', 'edad', 'avatar'].forEach(function (p) {
      $('bien-paso-' + p).hidden = (p !== cual);
    });
    if (cual === 'nombre') setTimeout(function () { $('campo-nombre').focus(); }, 120);
  }

  function pintarEdades() {
    var caja = $('grilla-edades');
    Util.vaciar(caja);
    EDADES.forEach(function (n) {
      var b = Util.crear('button', 'boton-edad');
      b.type = 'button';
      b.appendChild(Util.crear('b', null, String(n)));
      b.appendChild(Util.crear('span', null, 'años'));
      b.addEventListener('click', function () {
        bienvenida.edad = n;
        Sonido.despertar(); Sonido.tocar('clic');
        caja.querySelectorAll('.boton-edad').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
        setTimeout(function () { pasoBienvenida('avatar'); }, 180);
      });
      b.setAttribute('aria-pressed', 'false');
      caja.appendChild(b);
    });
  }

  /** Los 12 de siempre, mas los que haya comprado en la tienda. */
  function avataresDisponibles() {
    var comprados = Catalogo.AVATARES
      .filter(function (a) { return Almacen.tieneComprado(a.id); })
      .map(function (a) { return a.emoji; });
    return Almacen.AVATARES.concat(comprados);
  }

  function pintarAvatares() {
    var caja = $('grilla-avatares');
    Util.vaciar(caja);
    avataresDisponibles().forEach(function (a, i) {
      var b = Util.crear('button', 'boton-avatar', a);
      b.type = 'button';
      b.setAttribute('aria-label', 'Monigote ' + (i + 1));
      b.setAttribute('aria-pressed', bienvenida.avatar === a ? 'true' : 'false');
      b.addEventListener('click', function () {
        bienvenida.avatar = a;
        Sonido.tocar('clic');
        caja.querySelectorAll('.boton-avatar').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
      });
      caja.appendChild(b);
    });
  }

  function terminarBienvenida() {
    if (!bienvenida.avatar) bienvenida.avatar = Util.alAzar(Almacen.AVATARES);
    if (bienvenida.editando) {
      Almacen.actualizarPerfil(bienvenida.editando, {
        nombre: bienvenida.nombre, avatar: bienvenida.avatar, edad: bienvenida.edad
      });
    } else {
      Almacen.crearPerfil(bienvenida.nombre, bienvenida.avatar, bienvenida.edad);
    }
    Sonido.tocar('record');
    pintarBarraSuperior();
    irA('#/aprender');
  }

  /* ---------------------- tarjetas ---------------------- */
  /**
   * Mete un ícono en una caja. Si el nombre es uno de los que dibujamos
   * (js/nucleo/iconos.js) entra el SVG; si no, se escribe tal cual, que
   * es lo que pasa con los avatares y los emoji de las lecciones: ahí el
   * emoji es contenido, no interfaz, y está bien que lo dibuje el celular.
   */
  function ponerIcono(caja, nombre) {
    if (Iconos.existe(nombre)) caja.appendChild(Iconos.crear(nombre));
    else caja.textContent = nombre;
    return caja;
  }

  /** Un título de pantalla con su ícono adelante. */
  function tituloConIcono(caja, nombre, texto) {
    Util.vaciar(caja);
    if (Iconos.existe(nombre)) caja.appendChild(Iconos.crear(nombre, 'ico-titulo'));
    else if (nombre) caja.appendChild(Util.crear('span', null, nombre + ' '));
    caja.appendChild(Util.crear('span', null, texto));
  }

  function tarjeta(datos, alTocar) {
    var b = Util.crear('button', 'card');
    b.type = 'button';
    b.style.setProperty('--card-color', datos.color);
    b.style.setProperty('--card-suave', datos.suave);
    b.appendChild(ponerIcono(Util.crear('div', 'card-icono'), datos.icono));
    b.appendChild(Util.crear('div', 'card-titulo', datos.nombre));
    b.appendChild(Util.crear('div', 'card-texto', datos.texto));
    b.addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      alTocar();
    });
    return b;
  }

  function saludo() {
    var yo = Almacen.activo();
    return yo ? '¡Hola, ' + yo.nombre + '! ' : '';
  }

  /* ---------------------- sección Jugar ---------------------- */
  function pintarMateriasJuegos() {
    $('saludo-juegos').textContent = saludo() + 'Elegí una materia y practicá jugando.';
    // el examen sólo tiene sentido si ya hay algo desbloqueado para rendir
    $('btn-examen').hidden = juegosParaExamen().length === 0;
    pintarTarjetaRepaso();

    var cont = $('grilla-materias');
    Util.vaciar(cont);
    MATERIAS.forEach(function (m) {
      var b = tarjeta(m, function () { irA('#/materia/' + m.id); });
      b.disabled = !m.disponible;
      if (m.disponible) {
        b.appendChild(Util.crear('div', 'card-texto', Util.plural(juegosVisibles(m).length, 'juego')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  function pintarJuegos(materia) {
    tituloConIcono($('titulo-materia'), materia.icono, materia.nombre);

    var sub = $('subtitulo-materia');
    Util.vaciar(sub);
    sub.appendChild(document.createTextNode('Elegí un juego para practicar. '));
    if (leccionesVisibles(materia.id).length) {
      var link = Util.crear('a', 'enlace-cruzado', '📚 Aprender ' + materia.nombre.toLowerCase());
      link.href = '#/lecciones/' + materia.id;
      sub.appendChild(link);
    }

    var cont = $('grilla-juegos');
    Util.vaciar(cont);
    juegosVisibles(materia).forEach(function (j) {
      var estado = estadoDeJuego(materia, j);
      var b = tarjeta(j, function () {
        if (!estado.jugable) return;
        irA('#/juego/' + materia.id + '/' + j.id);
      });

      if (estado.jugable) {
        var mejor = Almacen.mejorDeJuego(materia.id + '/' + j.id);
        if (mejor > 0) {
          var r = Util.crear('div', 'card-record');
          r.appendChild(Iconos.crear('trofeo'));
          r.appendChild(Util.crear('span', null, ' Tu récord: ' + mejor));
          b.appendChild(r);
        }
      } else {
        b.classList.add('trabada');
        b.setAttribute('aria-disabled', 'true');
        var candado = Util.crear('div', 'card-candado');
        candado.appendChild(Util.crear('span', 'candado-icono', estado.tipo === 'edad' ? '🎂' : '🔒'));
        var texto = Util.crear('span', 'candado-texto');
        texto.appendChild(Util.crear('b', null, estado.motivo));
        if (estado.progreso) texto.appendChild(Util.crear('span', null, 'Llevás ' + estado.progreso));
        candado.appendChild(texto);
        b.appendChild(candado);
      }
      cont.appendChild(b);
    });
  }

  /* ---------------------- sección Aprender ---------------------- */
  function pintarMateriasAprender() {
    $('saludo-aprender').textContent = saludo() + 'Explicaciones cortas, con dibujos y ejemplos.';
    var cont = $('grilla-materias-aprender');
    Util.vaciar(cont);
    MATERIAS.forEach(function (m) {
      var lista = leccionesVisibles(m.id);
      var b = tarjeta(m, function () { irA('#/lecciones/' + m.id); });
      b.disabled = lista.length === 0;
      if (lista.length) {
        var leidas = lista.filter(function (l) { return Almacen.leccionVista(l.id); }).length;
        b.appendChild(Util.crear('div', 'card-texto',
          Util.plural(lista.length, 'lección', 'lecciones') +
          (leidas ? ' · ' + leidas + ' leída' + (leidas === 1 ? '' : 's') : '')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  function pintarLecciones(materia) {
    $('titulo-lecciones').textContent = '📚 ' + materia.nombre;

    var sub = $('subtitulo-lecciones');
    Util.vaciar(sub);
    sub.appendChild(document.createTextNode('Leelas en el orden que quieras. '));
    if (materia.disponible) {
      var link = Util.crear('a', 'enlace-cruzado', '🎮 Jugar a ' + materia.nombre.toLowerCase());
      link.href = '#/materia/' + materia.id;
      sub.appendChild(link);
    }

    var cont = $('grilla-lecciones');
    Util.vaciar(cont);
    leccionesVisibles(materia.id).forEach(function (l) {
      var vista = Almacen.leccionVista(l.id);
      var b = tarjeta({
        icono: l.icono, nombre: l.titulo, texto: l.resumen,
        color: materia.color, suave: materia.suave
      }, function () { irA('#/leccion/' + l.id); });

      var pie = Util.crear('div', 'card-pie');
      pie.appendChild(Util.crear('span', 'card-minutos', '⏱️ ' + l.minutos + ' min'));
      if (vista) pie.appendChild(Util.crear('span', 'card-leida', '✅ Leída'));
      b.appendChild(pie);
      cont.appendChild(b);
    });
  }

  /* ---------------------- configurar la partida ---------------------- */
  function pintarConfig(materia, juego) {
    tituloConIcono($('titulo-config'), juego.icono, juego.nombre);
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
      var b = botonOpcion(item.icono, item.nombre, item.detalle,
                          juego.color, juego.suave, item.iconoNumero);
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

  /**
   * `iconoNumero` es para cuando el ícono no es un dibujo sino un número
   * (las tablas de multiplicar): va grande y en el color de la materia, para
   * que se lea de un vistazo y no parezca parte del texto.
   */
  function botonOpcion(icono, nombre, detalle, color, suave, iconoNumero) {
    var b = Util.crear('button', 'opcion');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    if (color) { b.style.setProperty('--op-color', color); b.style.setProperty('--op-suave', suave); }
    b.appendChild(ponerIcono(
      Util.crear('span', 'opcion-icono' + (iconoNumero ? ' numero' : '')), icono));
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
    $('resumen-partida').textContent =
      juego.resumen(datosSeleccion()) + ' · ' + Motor.INTENTOS + ' intentos por pregunta';
  }

  /* ---------------------- jugar ---------------------- */
  function arrancarPartida() {
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    if (!materia || !juego) return irA('#/juegos');
    juego.jugar(datosSeleccion(), { alTerminar: terminarPartida });
  }

  /* ---------------------- resultados ---------------------- */
  function terminarPartida(r) {
    ultimoResultado = r;
    tipoUltimaPartida = 'juego';
    $('btn-cambiar-zona').hidden = false;    // el repaso lo esconde
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    var trabadosAntes = trabadosAhora();

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
      return {
        clave: materia.modulo.claveItem(item),
        nombre: materia.modulo.repaso(item).nombre,
        juego: juego.id                     // para que Repaso sepa qué tablero armar
      };
    }));

    // las monedas se calculan ANTES de anotar los aciertos, si no lo recién
    // acertado ya contaría como repetido
    var acertados = r.acertados || [];
    var claves = acertados.map(function (item) { return materia.modulo.claveItem(item); });
    var premio = calcularMonedas(claves.map(function (c) { return materia.id + ':' + c; }));
    Almacen.registrarAciertos(materia.id, claves);
    Almacen.sumarMonedas(premio.total);
    pintarPremio($('premio-monedas'), premio);
    pintarBarraSuperior();

    // Pipo cambia de cara según cómo le fue: no es sólo decoración, es
    // la primera lectura del resultado antes de mirar los números.
    Mascota.gesto($('mascota-fin'), estrellas >= 2 ? 'festejo' : estrellas === 1 ? 'hola' : 'ups');

    var cont = $('estrellas-fin');
    Util.vaciar(cont);
    for (var i = 0; i < 3; i++) {
      var e = Util.crear('span', i < estrellas ? '' : 'apagada');
      e.appendChild(Iconos.crear('estrella'));
      cont.appendChild(e);
    }

    $('titulo-fin').textContent = esRecord && r.puntos > 0 ? '¡Récord nuevo! 🏅' : tituloSegun(estrellas);
    $('subtitulo-fin').textContent = comentario(r, estrellas);
    $('stat-puntos').textContent = r.puntos;
    $('stat-aciertos').textContent = r.aciertos + '/' + r.total;
    $('stat-precision').textContent = r.precision + '%';
    $('stat-record').textContent = Almacen.record(clave).puntos;

    pintarDesbloqueos(trabadosAntes);
    pintarRepaso(materia, r.errores);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
  }

  /** Cuántas monedas dejó la partida, y por qué. */
  function pintarPremio(caja, premio) {
    Util.vaciar(caja);
    caja.hidden = premio.total === 0;
    if (!premio.total) return;

    var cifra = Util.crear('b', 'premio-cifra', '+' + premio.total + ' ');
    cifra.appendChild(Iconos.crear('moneda'));
    caja.appendChild(cifra);
    var partes = [];
    if (premio.nuevos) partes.push(Util.plural(premio.nuevos, 'nuevo'));
    if (premio.repasados) partes.push(Util.plural(premio.repasados, 'repasado'));
    if (premio.topeAlcanzado) partes.push('tope de la partida');
    if (partes.length) caja.appendChild(Util.crear('span', 'premio-detalle', partes.join(' · ')));
  }

  /** Si esta partida destrabó algún juego, se avisa acá. */
  function pintarDesbloqueos(trabadosAntes) {
    var caja = $('desbloqueo');
    Util.vaciar(caja);
    var ahora = trabadosAhora();
    var nuevos = trabadosAntes.filter(function (c) { return ahora.indexOf(c) === -1; });
    caja.hidden = nuevos.length === 0;
    if (!nuevos.length) return;

    nuevos.forEach(function (clave) {
      var enc = porClave(clave);
      if (!enc.juego) return;
      var fila = Util.crear('div', 'desbloqueo-item');
      fila.appendChild(Util.crear('span', 'desbloqueo-icono', '🔓'));
      var cuerpo = Util.crear('div');
      cuerpo.appendChild(Util.crear('b', null, '¡Desbloqueaste ' + enc.juego.nombre + '!'));
      cuerpo.appendChild(Util.crear('div', 'ir-dato', enc.juego.texto));
      fila.appendChild(cuerpo);
      var btn = Util.crear('button', 'btn-secundario', 'Probarlo');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        Sonido.tocar('clic');
        irA('#/juego/' + clave);
      });
      fila.appendChild(btn);
      caja.appendChild(fila);
    });
    Sonido.tocar('record');
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

  /**
   * La lista de "para repasar" del final de una partida. `materia` puede ser
   * null: en el repaso y el examen los ítems son de varias materias y cada
   * uno se trae la suya en `__materia`.
   */
  function pintarRepaso(materia, errores) {
    var caja = $('repaso');
    var lista = $('lista-repaso');
    Util.vaciar(lista);
    caja.hidden = errores.length === 0;
    errores.forEach(function (item) {
      var m = materia || materiaPorId(item.__materia);
      if (m) lista.appendChild(itemRepaso(m.modulo.repaso(item)));
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

  /* ---------------------- repaso ---------------------- */
  /**
   * Con qué juego se vuelve a preguntar algo que se falló.
   *
   * Hay dos casos. En matemática la pregunta sólo la sabe dibujar un juego:
   * una tabla puesta en el tablero de sumas sale "7 undefined 8". Esas
   * materias avisan cuál es con `juegoDeClave`, y si está trabado la
   * pregunta se saltea. En geografía, en cambio, cualquier juego sabe
   * preguntar por cualquier país, así que se prefiere el que la generó y
   * si no se puede, sirve otro.
   */
  function juegoParaRepasar(materiaId, juegoId, clave) {
    var materia = materiaPorId(materiaId);
    if (!materia || !materia.disponible || !materia.modulo.itemDeClave) return null;

    var exigido = materia.modulo.juegoDeClave ? materia.modulo.juegoDeClave(clave) : null;
    var candidatos = exigido
      ? [juegoPorId(materia, exigido)]
      : [juegoPorId(materia, juegoId)].concat(juegosVisibles(materia));

    var elegido = candidatos.filter(function (j) {
      return j && estadoDeJuego(materia, j).jugable;
    })[0];
    return elegido ? { materia: materia, juego: elegido } : null;
  }

  function pintarTarjetaRepaso() {
    var boton = $('btn-repaso');
    boton.hidden = !Repaso.hayParaRepasar();
    if (boton.hidden) return;
    $('repaso-detalle').textContent =
      'Volvemos sobre las preguntas que te costaron. Tenés ' +
      Util.plural(Repaso.cuantosPendientes(), 'cosa', 'cosas') + ' para repasar.';
  }

  function arrancarRepaso() {
    var items = Repaso.armarItems(juegoParaRepasar);
    if (!items.length) return irA('#/juegos');
    itemsDelRepaso = items;
    Repaso.jugar(items, { alTerminar: terminarRepaso });
  }

  var itemsDelRepaso = [];
  /* Para que "Jugar de nuevo" sepa si repetir la partida o el repaso. */
  var tipoUltimaPartida = 'juego';

  function terminarRepaso(r) {
    ultimoResultado = r;
    tipoUltimaPartida = 'repaso';
    var acertados = r.acertados || [];

    // lo acertado baja de la lista de errores: dos aciertos y sale
    acertados.forEach(function (item) {
      Almacen.descontarError(item.__materia, item.__clave);
    });

    // lo que volvió a fallar suma de nuevo, así sigue siendo prioritario
    var porMateria = {};
    r.errores.forEach(function (item) {
      var m = materiaPorId(item.__materia);
      if (!porMateria[item.__materia]) porMateria[item.__materia] = [];
      porMateria[item.__materia].push({
        clave: item.__clave, nombre: m.modulo.repaso(item).nombre, juego: item.__juego.id
      });
    });
    Object.keys(porMateria).forEach(function (mid) {
      Almacen.registrarErrores(mid, porMateria[mid]);
    });

    // monedas: mismo cálculo que en cualquier partida, agrupando por materia
    var aciertosPorMateria = {};
    acertados.forEach(function (item) {
      if (!aciertosPorMateria[item.__materia]) aciertosPorMateria[item.__materia] = [];
      aciertosPorMateria[item.__materia].push(item.__clave);
    });
    var todas = [];
    Object.keys(aciertosPorMateria).forEach(function (mid) {
      aciertosPorMateria[mid].forEach(function (c) { todas.push(mid + ':' + c); });
    });
    var premio = calcularMonedas(todas);
    Object.keys(aciertosPorMateria).forEach(function (mid) {
      Almacen.registrarAciertos(mid, aciertosPorMateria[mid]);
    });
    Almacen.sumarMonedas(premio.total);

    var proporcion = r.maximo ? r.puntos / r.maximo : 0;
    var estrellas = proporcion >= 0.9 ? 3 : proporcion >= 0.7 ? 2 : proporcion >= 0.4 ? 1 : 0;
    if (estrellas > 0) Almacen.sumarEstrellas(estrellas);

    var clave = 'repaso/repaso:' + itemsDelRepaso.length + ' preguntas';
    var esRecord = Almacen.anotar(clave, r.puntos, r.aciertos, r.total);
    Almacen.registrarPartida({
      materia: 'repaso', juego: 'repaso', tipo: 'repaso',
      detalle: 'Repaso · ' + Util.plural(itemsDelRepaso.length, 'pregunta'),
      puntos: r.puntos, maximo: r.maximo,
      aciertos: r.aciertos, total: r.total, estrellas: estrellas
    });

    pintarPremio($('premio-monedas'), premio);
    pintarBarraSuperior();

    // Pipo cambia de cara según cómo le fue: no es sólo decoración, es
    // la primera lectura del resultado antes de mirar los números.
    Mascota.gesto($('mascota-fin'), estrellas >= 2 ? 'festejo' : estrellas === 1 ? 'hola' : 'ups');

    var cont = $('estrellas-fin');
    Util.vaciar(cont);
    for (var i = 0; i < 3; i++) {
      var e = Util.crear('span', i < estrellas ? '' : 'apagada');
      e.appendChild(Iconos.crear('estrella'));
      cont.appendChild(e);
    }

    $('titulo-fin').textContent = r.aciertos === r.total ? '¡Te las sacaste todas! 🔁' : 'Repaso terminado';
    $('subtitulo-fin').textContent = r.aciertos
      ? 'Sacaste ' + Util.plural(r.aciertos, 'cosa', 'cosas') + ' de tu lista de repaso.'
      : 'No salió ninguna esta vez. Quedan para el próximo repaso.';
    $('stat-puntos').textContent = r.puntos;
    $('stat-aciertos').textContent = r.aciertos + '/' + r.total;
    $('stat-precision').textContent = r.precision + '%';
    $('stat-record').textContent = Almacen.record(clave).puntos;

    $('desbloqueo').hidden = true;
    $('btn-cambiar-zona').hidden = true;      // el repaso no tiene opciones que cambiar
    pintarRepaso(null, r.errores);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
  }

  /* ---------------------- examen ---------------------- */
  var selExamen = { juegos: [], zona: null, cantidad: 10 };

  /** Los juegos que puede rendir: los que ya tiene desbloqueados. */
  function juegosParaExamen() {
    var lista = [];
    MATERIAS.forEach(function (m) {
      if (!m.disponible) return;
      juegosVisibles(m).forEach(function (j) {
        if (estadoDeJuego(m, j).jugable) lista.push({ materia: m, juego: j });
      });
    });
    return lista;
  }

  function hayGeografia() {
    return selExamen.juegos.some(function (c) { return c.indexOf('geografia/') === 0; });
  }

  function pintarExamen() {
    var caja = $('bloques-examen');
    Util.vaciar(caja);
    var disponibles = juegosParaExamen();

    // sólo quedan elegidos los que siguen estando disponibles
    selExamen.juegos = selExamen.juegos.filter(function (c) {
      return disponibles.some(function (d) { return d.materia.id + '/' + d.juego.id === c; });
    });

    /* 1. qué entra */
    var b1 = Util.crear('div', 'bloque-config');
    b1.appendChild(Util.crear('h2', 'etiqueta-grupo', '1. Elegí qué entra'));
    var grilla = Util.crear('div', 'grilla-continentes');
    disponibles.forEach(function (d) {
      var clave = d.materia.id + '/' + d.juego.id;
      var b = botonOpcion(d.juego.icono, d.juego.nombre, d.materia.nombre,
                          d.juego.color, d.juego.suave);
      b.classList.add('opcion-multiple');
      if (selExamen.juegos.indexOf(clave) !== -1) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        var i = selExamen.juegos.indexOf(clave);
        if (i === -1) selExamen.juegos.push(clave);
        else selExamen.juegos.splice(i, 1);
        Sonido.despertar(); Sonido.tocar('clic');
        pintarExamen();        // se repinta porque la zona aparece o desaparece
      });
      grilla.appendChild(b);
    });
    b1.appendChild(grilla);
    caja.appendChild(b1);

    var numero = 2;

    /* 2. zona, sólo si entró algo de geografía */
    if (hayGeografia()) {
      var b2 = Util.crear('div', 'bloque-config');
      b2.appendChild(Util.crear('h2', 'etiqueta-grupo', (numero++) + '. ¿De qué zona?'));
      var gz = Util.crear('div', 'grilla-continentes');
      Mapa.zonas().forEach(function (z) {
        var b = botonOpcion(z.icono, z.nombre, z.cantidad + ' países', '#16a34a', '#dcfce7');
        if (selExamen.zona === z.id) b.setAttribute('aria-pressed', 'true');
        b.addEventListener('click', function () {
          selExamen.zona = z.id;
          marcarElegido(gz, b);
          actualizarResumenExamen();
        });
        gz.appendChild(b);
      });
      b2.appendChild(gz);
      caja.appendChild(b2);
    }

    /* 3. cuántas preguntas */
    var b3 = Util.crear('div', 'bloque-config');
    b3.appendChild(Util.crear('h2', 'etiqueta-grupo', numero + '. ¿Cuántas preguntas?'));
    var fila = Util.crear('div', 'fila-opciones');
    Examen.CANTIDADES.forEach(function (n) {
      var b = botonOpcion(String(n), n + ' preguntas', null, '#7c3aed', '#ede9fe');
      if (selExamen.cantidad === n) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        selExamen.cantidad = n;
        marcarElegido(fila, b);
        actualizarResumenExamen();
      });
      fila.appendChild(b);
    });
    b3.appendChild(fila);
    caja.appendChild(b3);

    actualizarResumenExamen();
  }

  function faltaParaExamen() {
    if (!selExamen.juegos.length) return 'Elegí al menos un juego';
    if (hayGeografia() && !selExamen.zona) return 'Elegí la zona del mapa';
    return null;
  }

  function actualizarResumenExamen() {
    var falta = faltaParaExamen();
    $('btn-rendir').disabled = !!falta;
    $('resumen-examen').textContent = falta
      ? falta + ' para poder rendir.'
      : Util.plural(selExamen.juegos.length, 'juego') + ' · ' +
        selExamen.cantidad + ' preguntas · 1 intento por pregunta';
  }

  function rendirExamen() {
    if (faltaParaExamen()) return irA('#/examen');
    var elegidos = selExamen.juegos.map(porClave).filter(function (x) { return x.juego; });
    var items = Examen.armarItems(elegidos, {
      zona: selExamen.zona,
      cantidad: selExamen.cantidad
    }, Almacen.edad());

    if (!items.length) return irA('#/examen');
    Examen.jugar(items, { alTerminar: terminarExamen });
  }

  function terminarExamen(r) {
    ultimoResultado = r;
    var nota = Examen.nota(r.aciertos, r.total);

    // monedas: los ítems son de varias materias, así que se agrupan
    var porMateria = {};
    (r.acertados || []).forEach(function (item) {
      if (!porMateria[item.__materia]) porMateria[item.__materia] = [];
      porMateria[item.__materia].push(materiaPorId(item.__materia).modulo.claveItem(item));
    });
    var todas = [];
    Object.keys(porMateria).forEach(function (mid) {
      porMateria[mid].forEach(function (c) { todas.push(mid + ':' + c); });
    });
    var premio = calcularMonedas(todas);
    Object.keys(porMateria).forEach(function (mid) {
      Almacen.registrarAciertos(mid, porMateria[mid]);
    });
    Almacen.sumarMonedas(premio.total);

    // los errores, para el modo parental
    var erroresPorMateria = {};
    r.errores.forEach(function (item) {
      var m = materiaPorId(item.__materia);
      if (!erroresPorMateria[item.__materia]) erroresPorMateria[item.__materia] = [];
      erroresPorMateria[item.__materia].push({
        clave: m.modulo.claveItem(item), nombre: m.modulo.repaso(item).nombre,
        juego: item.__juego.id
      });
    });
    Object.keys(erroresPorMateria).forEach(function (mid) {
      Almacen.registrarErrores(mid, erroresPorMateria[mid]);
    });

    Almacen.registrarPartida({
      materia: 'examen', juego: 'examen', tipo: 'examen',
      detalle: 'Examen · ' + Util.plural(selExamen.juegos.length, 'juego'),
      puntos: r.puntos, maximo: r.maximo,
      aciertos: r.aciertos, total: r.total, estrellas: 0
    });
    pintarBarraSuperior();

    $('nota-grande').textContent = nota;
    $('nota-grande').className = 'nota-grande ' + (nota >= 6 ? 'aprobado' : 'desaprobado');
    $('titulo-nota').textContent = nota >= 6 ? '¡Aprobaste!' : 'No alcanzó';
    $('subtitulo-nota').textContent = Examen.comentario(nota);

    var stats = $('nota-stats');
    Util.vaciar(stats);
    [
      [r.aciertos + '/' + r.total, 'respuestas bien'],
      [r.precision + '%', 'de aciertos'],
      [String(selExamen.juegos.length), 'juegos que entraron']
    ].forEach(function (par) {
      var d = Util.crear('div', 'stat');
      d.appendChild(Util.crear('b', null, par[0]));
      d.appendChild(Util.crear('span', null, par[1]));
      stats.appendChild(d);
    });

    pintarPremio($('premio-examen'), premio);

    var caja = $('repaso-examen');
    var lista = $('lista-repaso-examen');
    Util.vaciar(lista);
    caja.hidden = r.errores.length === 0;
    r.errores.forEach(function (item) {
      lista.appendChild(itemRepaso(materiaPorId(item.__materia).modulo.repaso(item)));
    });

    Sonido.tocar(nota >= 6 ? 'record' : 'fin');
    irA('#/nota');
  }

  /* ---------------------- perfil ---------------------- */
  function pintarPerfil() {
    var yo = Almacen.activo();
    if (!yo) return irA('#/');
    var est = Almacen.estadisticas();

    $('perfil-avatar').textContent = yo.avatar;
    $('perfil-nombre').textContent = yo.nombre;
    var partes = [];
    if (yo.edad) partes.push(yo.edad + ' años');
    partes.push(est.partidas === 0 ? 'todavía sin partidas'
                                   : Util.plural(est.partidas, 'partida jugada', 'partidas jugadas'));
    if (est.racha > 1) partes.push('🔥 ' + est.racha + ' días seguidos');
    $('perfil-desde').textContent = partes.join(' · ');

    var stats = $('perfil-stats');
    Util.vaciar(stats);
    [
      [String(est.estrellas), 'estrellas'],
      [est.precision + '%', 'precisión'],
      [est.aciertos + '/' + est.preguntas, 'aciertos'],
      [String(Almacen.cuantasLecciones()), 'lecciones leídas']
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
      fila.appendChild(ponerIcono(Util.crear('span', 'fila-icono'), m.icono));
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

  }

  /* ---------------------- menú del perfil ---------------------- */
  function abrirMenu(abierto) {
    $('menu-perfil').hidden = !abierto;
    $('btn-perfil').setAttribute('aria-expanded', abierto ? 'true' : 'false');
  }

  function menuAbierto() { return !$('menu-perfil').hidden; }

  /* ---------------------- configuración ---------------------- */
  function pintarConfiguracion() {
    var yo = Almacen.activo();
    if (!yo) return irA('#/');

    pintarInterruptorSonido();
    $('ajuste-nombre').value = yo.nombre;
    $('aviso-guardado').hidden = true;

    var caja = $('ajuste-edad');
    Util.vaciar(caja);
    EDADES.forEach(function (n) {
      var b = Util.crear('button', 'boton-edad');
      b.type = 'button';
      b.appendChild(Util.crear('b', null, String(n)));
      b.appendChild(Util.crear('span', null, 'años'));
      b.setAttribute('aria-pressed', yo.edad === n ? 'true' : 'false');
      b.addEventListener('click', function () {
        Sonido.despertar(); Sonido.tocar('clic');
        caja.querySelectorAll('.boton-edad').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
      });
      caja.appendChild(b);
    });

    pintarPerfilesEn($('config-perfiles'), pintarConfiguracion);
  }

  function pintarInterruptorSonido() {
    var sw = $('ajuste-sonido');
    if (sw) sw.setAttribute('aria-checked', Almacen.sonidoActivo() ? 'true' : 'false');
  }

  function guardarDatos() {
    var yo = Almacen.activo();
    if (!yo) return;
    var nombre = $('ajuste-nombre').value.trim();
    var elegida = $('ajuste-edad').querySelector('.boton-edad[aria-pressed="true"]');
    var edad = elegida ? parseInt(elegida.querySelector('b').textContent, 10) : yo.edad;

    if (!nombre) { $('ajuste-nombre').focus(); return; }
    Almacen.actualizarPerfil(yo.id, { nombre: nombre, edad: edad });
    Sonido.tocar('record');
    pintarBarraSuperior();
    $('aviso-guardado').hidden = false;
  }

  /** El selector de jugadores, que se usa en más de una pantalla. */
  function pintarPerfilesEn(caja, alCambiar) {
    Util.vaciar(caja);
    var activo = Almacen.activo();
    Almacen.perfiles().forEach(function (p) {
      var b = Util.crear('button', 'perfil-chip');
      b.type = 'button';
      b.setAttribute('aria-pressed', activo && p.id === activo.id ? 'true' : 'false');
      b.appendChild(Util.crear('span', 'perfil-chip-avatar', p.avatar));
      var cuerpo = Util.crear('span', 'perfil-chip-cuerpo');
      cuerpo.appendChild(Util.crear('span', 'perfil-chip-nombre', p.nombre));
      if (p.edad) cuerpo.appendChild(Util.crear('span', 'perfil-chip-edad', p.edad + ' años'));
      b.appendChild(cuerpo);
      b.addEventListener('click', function () {
        Sonido.tocar('clic');
        Almacen.usar(p.id);
        Temas.aplicar();          // cada jugador tiene su propia paleta
        pintarBarraSuperior();
        if (alCambiar) alCambiar();
      });
      caja.appendChild(b);
    });
  }

  /* ---------------------- personalización ---------------------- */
  function pintarPersonalizacion() {
    pintarEleccionAnimal();
    pintarDisfraces();
    pintarCombos();
    pintarRanurasDeColor();

    var faltan = 0, total = 0;
    Catalogo.RANURAS.forEach(function (r) {
      Catalogo.coloresDeTienda(r.id).forEach(function (c) {
        total++;
        if (!Almacen.tieneComprado('color:' + Catalogo.claveColor(r.id, c.id))) faltan++;
      });
    });
    $('nota-tienda').textContent = faltan
      ? 'Hay ' + Util.plural(faltan, 'color') + ' más para comprar en la tienda.'
      : 'Ya tenés los ' + total + ' colores. No queda ninguno por comprar.';
  }

  /** Gato o perro. No se compra: es de quién es la mascota. */
  function pintarEleccionAnimal() {
    var caja = $('eleccion-animal');
    Util.vaciar(caja);
    var puesto = Almacen.equipado('mascota') || 'gato';

    Object.keys(Mascota.BASES).forEach(function (id) {
      var b = Util.crear('button', 'card-tienda card-animal');
      b.type = 'button';
      b.setAttribute('aria-pressed', puesto === id ? 'true' : 'false');

      var mini = Util.crear('span', 'mascota mascota-mini');
      mini.innerHTML = Mascota.vista(id, 'ninguno', 'hola');
      b.appendChild(mini);
      b.appendChild(Util.crear('b', 'tienda-nombre', Mascota.BASES[id].nombre));

      b.addEventListener('click', function () {
        Sonido.despertar(); Sonido.tocar('clic');
        Almacen.equipar('mascota', id);
        Mascota.refrescar();
        pintarPersonalizacion();
      });
      caja.appendChild(b);
    });
  }

  function pintarDisfraces() {
    var caja = $('disfraces');
    Util.vaciar(caja);
    var animal = Almacen.equipado('mascota') || 'gato';
    var puesto = Almacen.equipado('disfraz') || 'ninguno';
    var mios = 0;

    Catalogo.DISFRACES.forEach(function (d) {
      var tiene = !d.precio || Almacen.tieneComprado('disfraz:' + d.id);
      if (!tiene) return;                       // los que faltan están en la tienda
      mios++;

      var b = Util.crear('button', 'card-tienda card-animal');
      b.type = 'button';
      b.setAttribute('aria-pressed', puesto === d.id ? 'true' : 'false');

      var mini = Util.crear('span', 'mascota mascota-mini');
      mini.innerHTML = Mascota.vista(animal, d.id, 'hola');
      b.appendChild(mini);
      b.appendChild(Util.crear('b', 'tienda-nombre', d.nombre));

      b.addEventListener('click', function () {
        Sonido.despertar(); Sonido.tocar('clic');
        Almacen.equipar('disfraz', d.id);
        Mascota.refrescar();
        pintarPersonalizacion();
      });
      caja.appendChild(b);
    });

    var faltan = Catalogo.disfracesDeTienda().length - (mios - Catalogo.disfracesGratis().length);
    $('nota-disfraces').textContent = faltan > 0
      ? 'Hay ' + Util.plural(faltan, 'disfraz', 'disfraces') + ' más en la tienda.'
      : 'Ya los tenés todos.';
  }

  /**
   * Las combinaciones armadas: ponen los cuatro colores de una familia
   * de un saque. Es un atajo, no algo que se compre — y sólo aparece si
   * el chico tiene los cuatro colores de esa familia.
   */
  function pintarCombos() {
    var caja = $('combos');
    Util.vaciar(caja);

    Catalogo.COMBOS.forEach(function (combo) {
      var completo = Catalogo.RANURAS.every(function (r) {
        var c = Catalogo.color(r.id, combo.color);
        return c && (!c.precio || Almacen.tieneComprado('color:' + Catalogo.claveColor(r.id, c.id)));
      });
      if (!completo) return;

      var puesto = Catalogo.RANURAS.every(function (r) {
        return (Almacen.equipado('color:' + r.id) || 'azul') === combo.color;
      });

      var b = Util.crear('button', 'card-tienda');
      b.type = 'button';
      b.setAttribute('aria-pressed', puesto ? 'true' : 'false');

      var muestra = Util.crear('span', 'muestra-tema');
      Catalogo.RANURAS.forEach(function (r) {
        var punto = Util.crear('span', 'muestra-punto');
        punto.style.background = Catalogo.color(r.id, combo.color).muestra;
        muestra.appendChild(punto);
      });
      b.appendChild(muestra);
      b.appendChild(Util.crear('b', 'tienda-nombre', combo.nombre));

      var pie = Util.crear('span', 'tienda-pie');
      if (puesto) pie.appendChild(Util.crear('span', 'etiqueta-puesta', 'En uso'));
      b.appendChild(pie);

      b.addEventListener('click', function () {
        Sonido.despertar(); Sonido.tocar('clic');
        Catalogo.RANURAS.forEach(function (r) {
          Almacen.equipar('color:' + r.id, combo.color);
        });
        Temas.aplicar();
        pintarPersonalizacion();
      });
      caja.appendChild(b);
    });
  }

  /** Una fila de colores por cada cosa que se puede pintar. */
  function pintarRanurasDeColor() {
    var caja = $('ranuras-color');
    Util.vaciar(caja);

    Catalogo.RANURAS.forEach(function (r) {
      var bloque = Util.crear('div', 'bloque-ranura');
      bloque.appendChild(Util.crear('h3', 'titulo-ranura', r.nombre));
      bloque.appendChild(Util.crear('p', 'nota-ranura', r.texto));

      var fila = Util.crear('div', 'fila-colores');
      var puesto = Almacen.equipado('color:' + r.id) || 'azul';

      r.colores.forEach(function (c) {
        var tiene = !c.precio || Almacen.tieneComprado('color:' + Catalogo.claveColor(r.id, c.id));
        if (!tiene) return;                     // los que faltan están en la tienda

        var b = Util.crear('button', 'pastilla-color');
        b.type = 'button';
        b.setAttribute('aria-pressed', puesto === c.id ? 'true' : 'false');
        b.setAttribute('aria-label', c.nombre + ' para ' + r.nombre);
        b.title = c.nombre;
        b.style.setProperty('--muestra', c.muestra);
        b.appendChild(Util.crear('span', 'pastilla-tinta'));
        b.appendChild(Util.crear('span', 'pastilla-nombre', c.nombre));

        b.addEventListener('click', function () {
          Sonido.despertar(); Sonido.tocar('clic');
          Almacen.equipar('color:' + r.id, c.id);
          Temas.aplicar();
          pintarPersonalizacion();
        });
        fila.appendChild(b);
      });

      bloque.appendChild(fila);
      caja.appendChild(bloque);
    });
  }

  /* ---------------------- tienda ---------------------- */
  function pintarTienda() {
    $('tienda-saldo').textContent = 'Tenés ' + Util.plural(Almacen.monedas(), 'moneda') +
      ' para gastar. Se ganan jugando.';

    var animal = Almacen.equipado('mascota') || 'gato';
    pintarSeccionTienda($('tienda-disfraces'), 'disfraz',
      Catalogo.disfracesDeTienda(), function (item) {
        var mini = Util.crear('span', 'mascota mascota-mini');
        mini.innerHTML = Mascota.vista(animal, item.id, 'hola');
        return mini;
      });

    /* Los colores se venden agrupados por lo que pintan, no todos
       juntos: comprar "verde" sin saber si es para el fondo o para las
       letras no querría decir nada. */
    var caja = $('tienda-colores');
    Util.vaciar(caja);
    Catalogo.RANURAS.forEach(function (r) {
      var pendientes = Catalogo.coloresDeTienda(r.id).filter(function (c) {
        return !Almacen.tieneComprado('color:' + Catalogo.claveColor(r.id, c.id));
      });
      if (!pendientes.length) return;

      var bloque = Util.crear('div', 'bloque-ranura');
      bloque.appendChild(Util.crear('h3', 'titulo-ranura', r.nombre));
      var grilla = Util.crear('div', 'grilla-tienda');
      bloque.appendChild(grilla);
      caja.appendChild(bloque);

      pintarSeccionTienda(grilla, 'color:' + r.id, pendientes, function (item) {
        var muestra = Util.crear('span', 'muestra-color-grande');
        muestra.style.background = item.muestra;
        return muestra;
      });
    });
    if (!caja.children.length) {
      caja.appendChild(Util.crear('p', 'vacio', 'Ya tenés todos los colores.'));
    }

    pintarSeccionTienda($('tienda-fondos'), 'fondo', Catalogo.FONDOS, function (item) {
      var muestra = Util.crear('span', 'muestra-fondo');
      if (item.deco) muestra.style.background = item.deco;
      return muestra;
    });

    pintarSeccionTienda($('tienda-avatares'), 'avatar', Catalogo.AVATARES, null, true);
  }

  /**
   * Una sección de la tienda. `tipo` es lo que se equipa ('tema', 'fondo',
   * 'avatar'); `vistaPrevia` devuelve el dibujito de cada tarjeta.
   */
  function pintarSeccionTienda(caja, tipo, items, vistaPrevia, esAvatar) {
    Util.vaciar(caja);
    items.forEach(function (item) {
      var idCompra = tipo === 'avatar' ? item.id : tipo + ':' + item.id;
      var tiene = item.precio === 0 || Almacen.tieneComprado(idCompra);
      var puesto = esAvatar
        ? (Almacen.activo() && Almacen.activo().avatar === item.emoji)
        : Almacen.equipado(tipo) === item.id ||
          (!Almacen.equipado(tipo) && item.precio === 0);

      var b = Util.crear('button', 'card-tienda' + (esAvatar ? ' card-avatar' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', puesto ? 'true' : 'false');

      if (vistaPrevia) b.appendChild(vistaPrevia(item));
      else b.appendChild(Util.crear('span', 'avatar-muestra', item.icono));

      if (!esAvatar) {
        b.appendChild(Util.crear('b', 'tienda-nombre', item.nombre));
        if (item.texto) b.appendChild(Util.crear('span', 'tienda-texto', item.texto));
      }

      var pie = Util.crear('span', 'tienda-pie');
      if (puesto) pie.appendChild(Util.crear('span', 'etiqueta-puesta', 'En uso'));
      else if (tiene) pie.appendChild(Util.crear('span', 'etiqueta-tuya', 'Tuyo'));
      else {
        var precio = Util.crear('span', 'etiqueta-precio', item.precio + ' ');
        precio.appendChild(Iconos.crear('moneda'));
        if (Almacen.monedas() < item.precio) precio.classList.add('no-alcanza');
        pie.appendChild(precio);
      }
      b.appendChild(pie);

      b.addEventListener('click', function () {
        manejarCompra(tipo, item, idCompra, tiene, esAvatar);
      });
      caja.appendChild(b);
    });
  }

  function manejarCompra(tipo, item, idCompra, tiene, esAvatar) {
    if (!tiene) {
      if (Almacen.monedas() < item.precio) {
        Sonido.tocar('error');
        window.alert('Te faltan ' + (item.precio - Almacen.monedas()) +
                     ' monedas para eso. ¡Seguí jugando!');
        return;
      }
      if (!window.confirm('¿Comprar ' + item.nombre + ' por ' + item.precio + ' monedas?')) return;
      if (!Almacen.comprar(idCompra, item.precio)) return;
      Sonido.tocar('record');
    } else {
      Sonido.tocar('clic');
    }

    // comprado o ya comprado: se pone en uso
    if (esAvatar) {
      var yo = Almacen.activo();
      if (yo) Almacen.actualizarPerfil(yo.id, { avatar: item.emoji });
    } else {
      Almacen.equipar(tipo, item.id);
      Temas.aplicar();
      if (tipo === 'disfraz') Mascota.refrescar();
    }
    pintarBarraSuperior();
    pintarTienda();
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
    $('parental-sub').textContent = 'Datos de ' + (yo ? yo.nombre : '') + ' · ' +
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
      // exámenes y repasos se distinguen de las partidas sueltas
      var icono = p.tipo === 'examen' ? '📝'
                : p.tipo === 'repaso' ? '🔁'
                : (materia ? materia.icono : '•');
      fila.appendChild(ponerIcono(Util.crear('span', 'fila-icono'), icono));
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
    var hora = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (d.toDateString() === hoy.toDateString()) return 'hoy ' + hora;
    return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + hora;
  }

  /* ---------------------- barra superior ---------------------- */
  function pintarBarraSuperior() {
    $('chip-monedas').querySelector('b').textContent = Almacen.monedas();
    var yo = Almacen.activo();
    $('btn-perfil').textContent = yo ? yo.avatar : '🙂';
    $('btn-perfil').setAttribute('aria-label', yo ? 'Perfil de ' + yo.nombre : 'Perfil');
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

    // sin perfil o sin edad, lo primero es la bienvenida
    if (Almacen.necesitaBienvenida() && partes[0] !== 'bienvenida') {
      return irA('#/bienvenida');
    }

    if (partes[0] === 'bienvenida') {
      cortarPartida();
      empezarBienvenida();
      return mostrar('bienvenida');
    }

    if (partes[0] === 'aprender') {
      cortarPartida();
      marcarSeccion('aprender');
      pintarMateriasAprender();
      return mostrar('aprender');
    }

    if (partes[0] === 'lecciones' && partes[1]) {
      var mat1 = materiaPorId(partes[1]);
      if (!mat1 || !leccionesVisibles(mat1.id).length) return irA('#/aprender');
      cortarPartida();
      marcarSeccion('aprender');
      pintarLecciones(mat1);
      return mostrar('lecciones');
    }

    if (partes[0] === 'leccion' && partes[1]) {
      cortarPartida();
      var abierta = Leccion.abrir(partes[1], {
        alJugar: function (clave) { irA('#/juego/' + clave); }
      });
      if (!abierta) return irA('#/aprender');
      return mostrar('leccion');
    }

    if (partes[0] === 'materia' && partes[1]) {
      var m = materiaPorId(partes[1]);
      if (!m || !m.disponible) return irA('#/juegos');
      cortarPartida();
      marcarSeccion('juegos');
      pintarJuegos(m);
      return mostrar('materia');
    }

    if (partes[0] === 'juego' && partes[1] && partes[2]) {
      var mat = materiaPorId(partes[1]);
      var jg = juegoPorId(mat, partes[2]);
      if (!mat || !jg) return irA('#/juegos');
      if (!estadoDeJuego(mat, jg).jugable) return irA('#/materia/' + mat.id);
      cortarPartida();
      pintarConfig(mat, jg);
      return mostrar('config');
    }

    if (partes[0] === 'jugar') {
      if (!sel.juego || faltaElegir()) return irA('#/juegos');
      mostrar('juego');
      return arrancarPartida();
    }

    if (partes[0] === 'fin') {
      if (!ultimoResultado) return irA('#/juegos');
      return mostrar('fin');
    }

    if (partes[0] === 'perfil') {
      cortarPartida();
      pintarPerfil();
      return mostrar('perfil');
    }

    if (partes[0] === 'repasando') {
      if (!Repaso.hayParaRepasar()) return irA('#/juegos');
      cortarPartida();
      mostrar('juego');
      return arrancarRepaso();
    }

    if (partes[0] === 'examen') {
      cortarPartida();
      marcarSeccion('juegos');
      pintarExamen();
      return mostrar('examen');
    }

    if (partes[0] === 'rindiendo') {
      if (faltaParaExamen()) return irA('#/examen');
      mostrar('juego');
      return rendirExamen();
    }

    if (partes[0] === 'nota') {
      if (!ultimoResultado) return irA('#/juegos');
      return mostrar('nota');
    }

    if (partes[0] === 'configuracion') {
      cortarPartida();
      pintarConfiguracion();
      return mostrar('configuracion');
    }

    if (partes[0] === 'personalizacion') {
      cortarPartida();
      pintarPersonalizacion();
      return mostrar('personalizacion');
    }

    if (partes[0] === 'tienda') {
      cortarPartida();
      pintarTienda();
      return mostrar('tienda');
    }

    if (partes[0] === 'parental') {
      cortarPartida();
      pintarParental();
      return mostrar('parental');
    }

    cortarPartida();
    marcarSeccion('juegos');
    pintarMateriasJuegos();
    mostrar('juegos');
  }

  function volverAtras() {
    var partes = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    Sonido.tocar('clic');
    if (partes[0] === 'jugar' || partes[0] === 'fin') {
      cortarPartida();
      return irA('#/juego/' + sel.materia + '/' + sel.juego);
    }
    if (partes[0] === 'juego') return irA('#/materia/' + partes[1]);
    if (partes[0] === 'materia' || partes[0] === 'examen') return irA('#/juegos');
    if (partes[0] === 'rindiendo' || partes[0] === 'nota') {
      cortarPartida();
      return irA('#/examen');
    }
    if (partes[0] === 'lecciones') return irA('#/aprender');
    if (partes[0] === 'leccion') {
      var l = Leccion.actual();
      return irA(l ? '#/lecciones/' + l.materia : '#/aprender');
    }
    if (partes[0] === 'parental') return irA('#/configuracion');
    if (partes[0] === 'tienda') return irA('#/personalizacion');
    if (partes[0] === 'configuracion' || partes[0] === 'personalizacion') return irA('#/perfil');
    irA('#/juegos');
  }

  /* ---------------------- eventos ---------------------- */
  function conectar() {
    $('btn-atras').addEventListener('click', volverAtras);
    $('btn-perfil').addEventListener('click', function (ev) {
      ev.stopPropagation();
      Sonido.despertar(); Sonido.tocar('clic');
      abrirMenu(!menuAbierto());
    });
    // el menú se cierra al elegir algo, al tocar afuera o con Escape
    $('menu-perfil').addEventListener('click', function () { abrirMenu(false); });
    document.addEventListener('click', function () { if (menuAbierto()) abrirMenu(false); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menuAbierto()) { abrirMenu(false); $('btn-perfil').focus(); }
    });

    $('btn-sonido').addEventListener('click', function () {
      Almacen.setSonido(!Almacen.sonidoActivo());
      pintarBotonSonido();
      pintarInterruptorSonido();
      Sonido.despertar();
      Sonido.tocar('clic');
    });

    /* bienvenida */
    $('btn-bien-nombre').addEventListener('click', function () {
      var nombre = $('campo-nombre').value.trim();
      if (!nombre) { $('error-nombre').hidden = false; return; }
      $('error-nombre').hidden = true;
      bienvenida.nombre = nombre;
      Sonido.despertar(); Sonido.tocar('clic');
      pasoBienvenida('edad');
    });
    $('campo-nombre').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') $('btn-bien-nombre').click();
    });
    $('btn-bien-listo').addEventListener('click', terminarBienvenida);

    /* lecciones */
    $('btn-leccion-siguiente').addEventListener('click', function () { Leccion.siguiente(); });
    $('btn-leccion-atras').addEventListener('click', function () { Leccion.atras(); });

    /* partida */
    $('btn-empezar').addEventListener('click', function () {
      if (faltaElegir()) return;
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/jugar');
    });
    $('btn-otra-vez').addEventListener('click', function () {
      Sonido.tocar('clic');
      irA(tipoUltimaPartida === 'repaso' ? '#/repasando' : '#/jugar');
    });
    $('btn-cambiar-zona').addEventListener('click', function () {
      Sonido.tocar('clic');
      irA('#/juego/' + sel.materia + '/' + sel.juego);
    });
    $('btn-al-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/juegos'); });

    /* perfil */
    $('btn-nuevo-perfil').addEventListener('click', function () {
      Sonido.tocar('clic');
      bienvenida = { nombre: '', edad: null, avatar: null, editando: null };
      $('campo-nombre').value = '';
      pasoBienvenida('nombre');
      pintarEdades();
      pintarAvatares();
      mostrar('bienvenida');
    });
    $('btn-tienda').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/tienda'); });
    $('btn-ir-config').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/configuracion'); });
    $('btn-guardar-datos').addEventListener('click', guardarDatos);
    $('ajuste-sonido').addEventListener('click', function () {
      Almacen.setSonido(!Almacen.sonidoActivo());
      pintarInterruptorSonido();
      pintarBotonSonido();
      Sonido.despertar(); Sonido.tocar('clic');
    });
    $('btn-repaso').addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/repasando');
    });
    $('btn-examen').addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/examen');
    });
    $('btn-rendir').addEventListener('click', function () {
      if (faltaParaExamen()) return;
      Sonido.despertar(); Sonido.tocar('clic');
      irA('#/rindiendo');
    });
    $('btn-otro-examen').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/examen'); });
    $('btn-nota-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/juegos'); });
    $('btn-parental').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/parental'); });

    /* modo parental */
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
      if (!window.confirm('Se borra todo el progreso de ' + (yo ? yo.nombre : '') +
                          '. Esto no se puede deshacer. ¿Borrar?')) return;
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
  Temas.aplicar();              // antes de pintar, para que no parpadee
  pintarBarraSuperior();
  pintarBotonSonido();
  conectar();
  enrutar();
})();
