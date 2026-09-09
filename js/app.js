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

  /* ---------------------- estado ---------------------- */
  var sel = { materia: null, juego: null, valores: {}, cantidad: 10 };
  var grupos = [];
  var ultimoResultado = null;
  var bienvenida = { nombre: '', edad: null, avatar: null, editando: null };
  var PANTALLAS = ['bienvenida', 'juegos', 'aprender', 'materia', 'lecciones', 'leccion',
                   'config', 'juego', 'fin', 'perfil', 'parental'];
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

  function pintarAvatares() {
    var caja = $('grilla-avatares');
    Util.vaciar(caja);
    Almacen.AVATARES.forEach(function (a, i) {
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

  function saludo() {
    var yo = Almacen.activo();
    return yo ? '¡Hola, ' + yo.nombre + '! ' : '';
  }

  /* ---------------------- sección Jugar ---------------------- */
  function pintarMateriasJuegos() {
    $('saludo-juegos').textContent = saludo() + 'Elegí una materia y practicá jugando.';
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
    $('titulo-materia').textContent = materia.icono + ' ' + materia.nombre;

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
        if (mejor > 0) b.appendChild(Util.crear('div', 'card-record', '🏆 Tu récord: ' + mejor));
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

    pintarDesbloqueos(trabadosAntes);
    pintarRepaso(materia, r.errores);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
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
      ['⭐ ' + est.estrellas, 'estrellas'],
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
      b.setAttribute('aria-pressed', activo && p.id === activo.id ? 'true' : 'false');
      b.appendChild(Util.crear('span', 'perfil-chip-avatar', p.avatar));
      var cuerpo = Util.crear('span', 'perfil-chip-cuerpo');
      cuerpo.appendChild(Util.crear('span', 'perfil-chip-nombre', p.nombre));
      if (p.edad) cuerpo.appendChild(Util.crear('span', 'perfil-chip-edad', p.edad + ' años'));
      b.appendChild(cuerpo);
      b.addEventListener('click', function () {
        Sonido.tocar('clic');
        Almacen.usar(p.id);
        pintarBarraSuperior();
        pintarPerfil();
      });
      caja.appendChild(b);
    });
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
    var hora = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    if (d.toDateString() === hoy.toDateString()) return 'hoy ' + hora;
    return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + hora;
  }

  /* ---------------------- barra superior ---------------------- */
  function pintarBarraSuperior() {
    $('chip-estrellas').querySelector('b').textContent = Almacen.estrellas();
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
    if (partes[0] === 'materia') return irA('#/juegos');
    if (partes[0] === 'lecciones') return irA('#/aprender');
    if (partes[0] === 'leccion') {
      var l = Leccion.actual();
      return irA(l ? '#/lecciones/' + l.materia : '#/aprender');
    }
    if (partes[0] === 'parental') return irA('#/perfil');
    irA('#/juegos');
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
    $('btn-otra-vez').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/jugar'); });
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
  pintarBarraSuperior();
  pintarBotonSonido();
  conectar();
  enrutar();
})();
