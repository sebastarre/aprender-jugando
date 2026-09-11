/* ============================================================
   Armado de la app: las pantallas y la navegación.

   Todo cuelga del menú de inicio (#/): cinco destinos, y de cada uno se
   vuelve con la flecha. No hay barra fija ni pestañas arriba.

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

  /* ---------------------- catálogo de materias ---------------------- */

  /**
   * Una materia o un juego, para una ficha, sin la oración de abajo.
   *
   * En la ficha de una materia que ya está, abajo del nombre va cuántos
   * juegos (o cuántas lecciones) tiene, que es el dato que sirve para
   * decidir. Si además va la descripción, quedan tres renglones de
   * texto chico apretados abajo de un dibujo, y a esta edad la
   * recomendación es al revés: cuanto menos texto, mejor. La
   * descripción se queda sólo en las que dicen "Pronto", donde no hay
   * ningún número que mostrar y sirve para saber qué va a venir.
   */
  function sinBajada(m) {
    var copia = {};
    Object.keys(m).forEach(function (k) { if (k !== 'texto') copia[k] = m[k]; });
    return copia;
  }

  var MATERIAS = [
    {
      id: 'geografia', nombre: 'Geografía', icono: 'geografia',
      color: '#16a34a', suave: '#dcfce7',
      texto: 'Países, capitales y banderas',
      modulo: Geografia
    },
    {
      id: 'matematica', nombre: 'Matemática', icono: 'matematica',
      color: '#2563eb', suave: '#dbeafe',
      texto: 'Contar, cuentas, la hora y más',
      modulo: Matematica
    },
    {
      id: 'lengua', nombre: 'Lengua', icono: 'lengua',
      color: '#c2740a', suave: '#fef3c7',
      texto: 'Letras, palabras y ortografía', modulo: Lengua
    },
    {
      id: 'ciencias', nombre: 'Ciencias', icono: 'ciencias',
      color: '#8b5cf6', suave: '#ede9fe',
      texto: 'Animales, cuerpo, plantas y espacio', modulo: Ciencias
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

  /* ============================================================
     Edades y niveles

     Cada juego dice entre qué edades tiene sentido (edadMin, edadMax),
     y cada materia tiene su propio NIVEL: la edad hasta la que el chico
     tiene los juegos abiertos. El nivel arranca en su edad, y juntando
     PUNTOS_PARA_ABRIR puntos jugando esa materia se abren los juegos de
     la edad siguiente que tenga juegos. Es por materia: un chico de 7
     que vuela en matemática puede tener abiertos los de 9 ahí y seguir
     en los de 7 en lengua.

     Se ven tres cosas:
       - los juegos abiertos, salvo los que ya le quedan chicos (los de
         edadMax menor a su edad: a los once no se muestra «contar
         manzanitas»);
       - los de la edad siguiente, con candado y cuántos puntos faltan;
       - nada más. Los de dos o más edades adelante no se muestran: con
         doce juegos en matemática, mostrar todos era una pantalla llena
         de candados.

     Antes había un segundo tipo de candado, «juntá 3 estrellas en tal
     juego». Se fue: el nivel por puntos hace lo mismo con una sola regla.
     ============================================================ */
  var PUNTOS_PARA_ABRIR = 100;    // una partida de 10 preguntas da hasta 30
  var MARGEN_LECCIONES = 2;       // las lecciones se pueden leer un poco antes

  /** Hasta qué edad tiene abiertos los juegos de esta materia. */
  function nivelDe(materia) {
    var edad = Almacen.edad();
    if (!edad) return Infinity;          // sin edad cargada, todo abierto
    return Math.max(edad, Almacen.nivelGanado(materia.id));
  }

  /** La próxima edad que tiene juegos en esta materia, o null si ya abrió todo. */
  function siguienteNivel(materia) {
    var nivel = nivelDe(materia);
    var proximas = materia.juegos
      .map(function (j) { return j.edadMin || 0; })
      .filter(function (e) { return e > nivel; });
    return proximas.length ? Math.min.apply(null, proximas) : null;
  }

  /** ¿Hay algún juego de esta materia que ya pueda jugar? */
  function tieneAbiertos(materia) {
    var nivel = nivelDe(materia);
    return materia.juegos.some(function (j) { return (j.edadMin || 0) <= nivel; });
  }

  function faltanPuntos(materia) {
    return Math.max(0, PUNTOS_PARA_ABRIR - Almacen.progresoNivel(materia.id));
  }

  /**
   * Suma los puntos de una partida a la materia y abre la edad siguiente
   * si le alcanzan. Devuelve las edades que se abrieron (casi siempre
   * ninguna o una).
   */
  function sumarAlNivel(materia, puntos) {
    var abiertas = [];
    var progreso = Almacen.progresoNivel(materia.id) + (puntos || 0);
    var siguiente = siguienteNivel(materia);
    while (siguiente && progreso >= PUNTOS_PARA_ABRIR) {
      progreso -= PUNTOS_PARA_ABRIR;
      Almacen.guardarNivel(materia.id, siguiente, progreso);
      abiertas.push(siguiente);
      siguiente = siguienteNivel(materia);
    }
    Almacen.guardarNivel(materia.id, 0, progreso);
    return abiertas;
  }

  /** ¿Se puede jugar? Y si no, por qué. */
  function estadoDeJuego(materia, juego) {
    if (!juego.edadMin || juego.edadMin <= nivelDe(materia)) return { jugable: true };
    /* Una sola frase, corta y con el número adelante: es lo que va en la
       tarjeta, abajo del nombre del juego. */
    if (juego.edadMin === siguienteNivel(materia) && tieneAbiertos(materia)) {
      var faltan = faltanPuntos(materia);
      return { jugable: false, tipo: 'nivel', faltan: faltan,
               motivo: (faltan === 1 ? 'Falta ' : 'Faltan ') + Util.plural(faltan, 'punto') };
    }
    // si en esta materia todavía no tiene nada abierto, no hay puntos que
    // juntar: se abre sola cuando cumpla la edad
    return { jugable: false, tipo: 'edad', motivo: 'Desde los ' + juego.edadMin + ' años' };
  }

  /** Los juegos que se le muestran: los abiertos y los de la edad siguiente. */
  function juegosVisibles(materia) {
    var edad = Almacen.edad();
    var lista = materia.juegos.slice();
    if (edad) {
      var nivel = nivelDe(materia);
      var siguiente = siguienteNivel(materia);
      lista = lista.filter(function (j) {
        var min = j.edadMin || 0;
        if (min <= nivel) return (j.edadMax || 99) >= edad;   // salvo los que le quedan chicos
        return min === siguiente;                             // la próxima edad, con candado
      });
    }
    // de la edad más chica a la más grande: los candados quedan al final
    return lista.sort(function (a, b) { return (a.edadMin || 0) - (b.edadMin || 0); });
  }

  function leccionesVisibles(materiaId) {
    var materia = materiaPorId(materiaId);
    var nivel = materia ? nivelDe(materia) : Infinity;
    return leccionesDe(materiaId).filter(function (l) {
      return !l.edadMin || l.edadMin <= nivel + MARGEN_LECCIONES;
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
  var PANTALLAS = ['bienvenida', 'inicio', 'juegos', 'aprender', 'materia', 'lecciones', 'leccion',
                   'config', 'juego', 'fin', 'perfil', 'tienda', 'parental',
                   'examen', 'nota', 'configuracion', 'personalizacion'];

  function mostrar(nombre) {
    PANTALLAS.forEach(function (p) { $('pantalla-' + p).hidden = (p !== nombre); });
    /* La única pantalla sin flecha de volver es el inicio, porque es el
       fondo de todo; la bienvenida tampoco, porque todavía no hay a
       dónde volver. */
    $('btn-atras').hidden = (nombre === 'inicio' || nombre === 'bienvenida');
    document.body.classList.toggle('jugando', nombre === 'juego');
    document.body.classList.toggle('sin-perfil', nombre === 'bienvenida');
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
    /* Al inicio, no a Aprender: lo primero que ve alguien que recién se
       hizo el perfil tiene que ser el menú con todo lo que hay, no una
       de las cinco pantallas ya metido adentro. */
    irA('#/');
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

  /**
   * Una tarjeta de materia, juego o lección.
   *
   * El ícono va grande y a la izquierda, y el texto al lado. Antes era
   * todo apilado —ícono, título, una oración entera, el récord— y cada
   * tarjeta medía 200 píxeles: tres juegos ocupaban la pantalla entera
   * y las tres se veían iguales. Así entran casi el doble y lo primero
   * que se ve de cada una es su dibujo, que es lo que un chico
   * reconoce sin leer.
   *
   * Lo que se le cuelgue después (el récord, los minutos de una lección)
   * va en `b.cuerpo`, y lo que va encima del dibujo —el candado de un
   * juego trabado— en `b.icono`. Ninguno de los dos en el botón.
   */
  function tarjeta(datos, alTocar) {
    var b = Util.crear('button', 'card');
    b.type = 'button';
    b.style.setProperty('--card-color', datos.color);
    b.style.setProperty('--card-suave', datos.suave);
    /* el escalón de abajo del círculo: el mismo color, más oscuro */
    b.style.setProperty('--card-borde', Util.oscurecer(datos.color));
    var icono = ponerIcono(Util.crear('span', 'card-icono'), datos.icono);
    b.appendChild(icono);
    b.icono = icono;

    var cuerpo = Util.crear('span', 'card-cuerpo');
    cuerpo.appendChild(Util.crear('span', 'card-titulo', datos.nombre));
    if (datos.texto) cuerpo.appendChild(Util.crear('span', 'card-texto', datos.texto));
    b.appendChild(cuerpo);
    b.cuerpo = cuerpo;

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

  /* ---------------------- inicio ---------------------- */

  /** Una de las dos pastillas de la portada: un dibujito y un número. */
  function cuentaDePortada(caja, icono, cuanto) {
    Util.vaciar(caja);
    caja.appendChild(Iconos.crear(icono));
    caja.appendChild(Util.crear('span', null, String(cuanto)));
  }

  function pintarInicio() {
    var yo = Almacen.activo();
    $('inicio-nombre').textContent = yo ? yo.nombre : 'Jugador';

    cuentaDePortada($('portada-estrellas'), 'estrella', Almacen.estrellas());
    cuentaDePortada($('portada-monedas'), 'moneda', Almacen.monedas());

    /* La bajada de cada botón dice qué hay adentro, no qué es: "3
       materias" sirve más que "practicá lo que aprendiste", que es lo
       mismo que ya dice el título. */
    var conJuegos = MATERIAS.filter(function (m) { return m.disponible; }).length;
    $('menu-jugar-detalle').textContent =
      Util.plural(conJuegos, 'materia') + ' para practicar';

    var conLecciones = MATERIAS.filter(function (m) {
      return leccionesVisibles(m.id).length;
    }).length;
    $('menu-aprender-detalle').textContent = conLecciones
      ? Util.plural(conLecciones, 'materia') + ' con cursitos'
      : 'Explicaciones cortas, con dibujos';

    Mascota.refrescar();
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
      var b = tarjeta(m.disponible ? sinBajada(m) : m,
                      function () { irA('#/materia/' + m.id); });
      b.disabled = !m.disponible;
      if (m.disponible) {
        // cuántos puede jugar ya, no cuántos se ven: los de candado no cuentan
        var abiertos = juegosVisibles(m).filter(function (j) { return estadoDeJuego(m, j).jugable; }).length;
        var siguiente = siguienteNivel(m);
        b.cuerpo.appendChild(Util.crear('span', 'card-texto', abiertos
          ? Util.plural(abiertos, 'juego')
          : 'Desde los ' + siguiente + ' años'));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  /**
   * El cartel de arriba de los juegos de una materia: hasta qué edad los
   * tiene abiertos y cuánto le falta para la siguiente. Es lo que explica
   * los candados de abajo; sin él, un candado que dice «faltan 40 puntos»
   * no dice ni de qué ni para qué.
   */
  function pintarNivel(caja, materia, conPuntos) {
    Util.vaciar(caja);
    caja.hidden = !Almacen.edad();
    if (caja.hidden) return;

    var siguiente = siguienteNivel(materia);
    var nombre = materia.nombre;
    var titulo, texto, progreso = null;

    if (!tieneAbiertos(materia)) {
      titulo = nombre + ' empieza a los ' + siguiente + ' años';
      texto = 'Mientras tanto, probá las otras materias.';
    } else if (!siguiente) {
      titulo = '¡Tenés abiertos todos los juegos de ' + nombre + '!';
      texto = 'No queda ninguno por abrir.';
    } else {
      var faltan = faltanPuntos(materia);
      titulo = conPuntos ? '+' + Util.plural(conPuntos, 'punto') + ' en ' + nombre
                         : 'Próximo nivel: juegos de ' + siguiente + ' años';
      texto = 'Te ' + (faltan === 1 ? 'falta ' : 'faltan ') + Util.plural(faltan, 'punto') +
              ' jugando ' + nombre.toLowerCase() + ' para abrir los juegos de ' + siguiente + ' años.';
      progreso = Almacen.progresoNivel(materia.id) / PUNTOS_PARA_ABRIR;
    }

    caja.appendChild(Util.crear('b', 'nivel-titulo', titulo));
    if (progreso !== null) {
      var barra = Util.crear('div', 'nivel-barra');
      barra.setAttribute('role', 'progressbar');
      barra.setAttribute('aria-valuemin', '0');
      barra.setAttribute('aria-valuemax', String(PUNTOS_PARA_ABRIR));
      barra.setAttribute('aria-valuenow', String(Almacen.progresoNivel(materia.id)));
      var relleno = Util.crear('i');
      relleno.style.transform = 'scaleX(' + Math.min(1, progreso) + ')';
      barra.appendChild(relleno);
      caja.appendChild(barra);
    }
    caja.appendChild(Util.crear('span', 'nivel-texto', texto));
  }

  function pintarJuegos(materia) {
    tituloConIcono($('titulo-materia'), materia.icono, materia.nombre);
    pintarNivel($('nivel-materia'), materia);

    var sub = $('subtitulo-materia');
    Util.vaciar(sub);
    sub.appendChild(document.createTextNode('Elegí un juego para practicar. '));
    if (leccionesVisibles(materia.id).length) {
      var link = Util.crear('a', 'enlace-cruzado');
      link.appendChild(Iconos.crear('aprender'));
      link.appendChild(Util.crear('span', null, ' Aprender ' + materia.nombre.toLowerCase()));
      link.href = '#/lecciones/' + materia.id;
      sub.appendChild(link);
    }

    var cont = $('grilla-juegos');
    Util.vaciar(cont);
    juegosVisibles(materia).forEach(function (j) {
      var estado = estadoDeJuego(materia, j);
      /* Al juego trabado se le saca la bajada: en su lugar va el
         requisito, que es la única línea que importa mientras esté
         cerrado. Con las dos, una ficha de 169px de ancho terminaba con
         cinco renglones de texto abajo del dibujo. */
      var b = tarjeta(estado.jugable ? j : sinBajada(j), function () {
        if (!estado.jugable) return;
        irA('#/juego/' + materia.id + '/' + j.id);
      });

      if (estado.jugable) {
        var mejor = Almacen.mejorDeJuego(materia.id + '/' + j.id);
        if (mejor > 0) {
          var r = Util.crear('div', 'card-record');
          r.appendChild(Iconos.crear('trofeo'));
          r.appendChild(Util.crear('span', null, ' Tu récord: ' + mejor));
          b.cuerpo.appendChild(r);
        }
      } else {
        b.classList.add('trabada');
        b.setAttribute('aria-disabled', 'true');
        /* El candado va encima del dibujo del juego, como en el ícono de
           una app bloqueada: se entiende sin leer nada. */
        b.icono.appendChild(Util.crear('span', 'card-cerrojo'))
          .appendChild(Iconos.crear('candado'));
        var traba = Util.crear('div', 'card-traba');
        // el trofeo es el ícono de los puntos en toda la app
        traba.appendChild(Iconos.crear(estado.tipo === 'nivel' ? 'trofeo' : 'perfil'));
        traba.appendChild(Util.crear('span', 'traba-texto', estado.motivo));
        b.cuerpo.appendChild(traba);
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
      var todas = leccionesDe(m.id);
      var b = tarjeta(lista.length || todas.length ? sinBajada(m) : m,
                      function () { irA('#/lecciones/' + m.id); });
      b.disabled = lista.length === 0;
      if (lista.length) {
        var leidas = lista.filter(function (l) { return Almacen.leccionVista(l.id); }).length;
        b.cuerpo.appendChild(Util.crear('span', 'card-texto',
          Util.plural(lista.length, 'lección', 'lecciones') +
          (leidas ? ' · ' + leidas + ' leída' + (leidas === 1 ? '' : 's') : '')));
      } else if (todas.length) {
        /* Tiene lecciones, pero todavía no para su edad. «Pronto» le
           decía que no existían; lo que pasa es que son para más grandes. */
        var primera = Math.min.apply(null, todas.map(function (l) { return l.edadMin || 0; }));
        b.cuerpo.appendChild(Util.crear('span', 'card-texto',
          'Desde los ' + (primera - MARGEN_LECCIONES) + ' años'));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  function pintarLecciones(materia) {
    tituloConIcono($('titulo-lecciones'), 'aprender', materia.nombre);

    var sub = $('subtitulo-lecciones');
    Util.vaciar(sub);
    sub.appendChild(document.createTextNode('Leelas en el orden que quieras. '));
    if (materia.disponible) {
      var link = Util.crear('a', 'enlace-cruzado');
      link.appendChild(Iconos.crear('jugar'));
      link.appendChild(Util.crear('span', null, ' Jugar a ' + materia.nombre.toLowerCase()));
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
      b.cuerpo.appendChild(pie);
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
    // los puntos de la partida van al nivel de la materia; si alcanzan,
    // se abren los juegos de la edad siguiente
    var abiertas = sumarAlNivel(materia, r.puntos);
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

    // La mascota, con el disfraz que el chico tenga puesto. Ya no cambia
    // de cara según el resultado: las ilustraciones son fijas, así que
    // eso lo cuentan las estrellas y el texto de abajo.
    Mascota.gesto($('mascota-fin'));

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

    pintarNivel($('progreso-nivel'), materia, r.puntos);
    // si se abrió una edad, lo cuenta el cartel de desbloqueo, que es más grande
    if (abiertas.length) $('progreso-nivel').hidden = true;
    pintarDesbloqueos(trabadosAntes, materia, abiertas);
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
  function pintarDesbloqueos(trabadosAntes, materia, abiertas) {
    var caja = $('desbloqueo');
    Util.vaciar(caja);
    var ahora = trabadosAhora();
    var nuevos = trabadosAntes.filter(function (c) { return ahora.indexOf(c) === -1; });
    caja.hidden = nuevos.length === 0;
    if (!nuevos.length) return;

    if (abiertas && abiertas.length) {
      caja.appendChild(Util.crear('b', 'desbloqueo-titulo',
        '¡Abriste los juegos de ' + abiertas[abiertas.length - 1] + ' años de ' + materia.nombre + '!'));
    }

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
      'Tenés ' + Util.plural(Repaso.cuantosPendientes(), 'cosa', 'cosas') + ' para repasar';
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

    // La mascota, con el disfraz que el chico tenga puesto. Ya no cambia
    // de cara según el resultado: las ilustraciones son fijas, así que
    // eso lo cuentan las estrellas y el texto de abajo.
    Mascota.gesto($('mascota-fin'));

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
    $('progreso-nivel').hidden = true;        // mezcla materias: no suma a ningún nivel
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

  /* ---------------------- configuración ---------------------- */
  /* La versión sale del nombre de la caché del service worker, que es lo
     que de verdad está corriendo en el teléfono. Sirve para contestar
     "¿tengo lo último?" sin tener que abrir la consola. */
  function pintarVersion() {
    var caja = $('version-app');
    if (!caja || !window.PWA) return;
    PWA.version().then(function (v) {
      caja.textContent = v ? 'Versión ' + v : 'Versión — (sin guardar para usar sin internet)';
    });
  }

  function pintarConfiguracion() {
    pintarVersion();
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

      var mini = Util.crear('span', 'mascota-mini');
      mini.innerHTML = Mascota.vista(id, Almacen.equipado('disfraz'));
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

      var mini = Util.crear('span', 'mascota-mini');
      mini.innerHTML = Mascota.vista(animal, d.id);
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
        var mini = Util.crear('span', 'mascota-mini');
        mini.innerHTML = Mascota.vista(animal, item.id);
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

  /**
   * El cartel de "¿seguro?", propio de la app.
   *
   * Antes esto era window.confirm(), y ahí estaba el bug de la tienda:
   * los navegadores pueden silenciar los diálogos del sistema (Chrome
   * ofrece un "no permitir más diálogos en esta página" y a partir de
   * ahí confirm() devuelve false sin mostrar nada). Cuando le pasaba
   * eso a alguien, tocar comprar no hacía absolutamente nada y no había
   * manera de darse cuenta de por qué.
   *
   * `opciones` puede traer: titulo, texto, vista (HTML de la muestra),
   * si (el texto del botón que acepta) y soloAceptar.
   */
  function preguntar(opciones, alAceptar) {
    var caja = $('dialogo');
    var vista = $('dialogo-vista');
    var si = $('dialogo-si');
    var no = $('dialogo-no');

    Util.vaciar(vista);
    vista.hidden = !opciones.vista;
    if (opciones.vista) vista.innerHTML = opciones.vista;

    $('dialogo-titulo').textContent = opciones.titulo || '';
    $('dialogo-texto').textContent = opciones.texto || '';
    si.textContent = opciones.si || 'Sí, comprar';
    no.hidden = !!opciones.soloAceptar;

    function cerrar() {
      si.onclick = null;
      no.onclick = null;
      caja.close();
    }
    si.onclick = function () {
      cerrar();
      if (alAceptar) alAceptar();
    };
    no.onclick = cerrar;

    caja.showModal();
    // el foco arranca en el botón seguro: que un toque de más no compre
    (opciones.soloAceptar ? si : no).focus();
  }

  function manejarCompra(tipo, item, idCompra, tiene, esAvatar) {
    if (tiene) {
      Sonido.tocar('clic');
      return ponerEnUso(tipo, item, esAvatar);
    }

    var faltan = item.precio - Almacen.monedas();
    if (faltan > 0) {
      Sonido.tocar('error');
      return preguntar({
        titulo: 'Te faltan monedas',
        texto: 'Para ' + item.nombre + ' te ' +
               (faltan === 1 ? 'falta 1 moneda' : 'faltan ' + faltan + ' monedas') +
               '. ¡Seguí jugando y las juntás!',
        si: 'Bueno', soloAceptar: true
      });
    }

    preguntar({
      titulo: '¿Lo comprás?',
      texto: item.nombre + ' cuesta ' + Util.plural(item.precio, 'moneda') +
             '. Te quedarían ' + Util.plural(Almacen.monedas() - item.precio, 'moneda') + '.',
      vista: vistaDeCompra(tipo, item)
    }, function () {
      if (!Almacen.comprar(idCompra, item.precio)) return;
      Sonido.tocar('record');
      ponerEnUso(tipo, item, esAvatar);
    });
  }

  /** La muestra que se ve en el cartel: la mascota, el color o el monigote. */
  function vistaDeCompra(tipo, item) {
    if (tipo === 'disfraz') {
      return '<span class="mascota-mini">' +
             Mascota.vista(Almacen.equipado('mascota'), item.id) + '</span>';
    }
    if (tipo.indexOf('color:') === 0) {
      return '<span class="muestra-color-grande" style="background:' +
             Util.escapar(item.muestra) + '"></span>';
    }
    if (item.emoji) return '<span class="avatar-muestra">' + item.emoji + '</span>';
    return '';
  }

  function ponerEnUso(tipo, item, esAvatar) {
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

  /* Antes esto pintaba la barra de arriba (las monedas y el avatar).
     Ahora esos datos viven en la portada del inicio, así que lo único
     que hace falta es repintarla si está a la vista. */
  function pintarBarraSuperior() {
    if (!$('pantalla-inicio').hidden) pintarInicio();
  }

  function pintarBotonSonido() {
    var b = $('btn-sonido');
    var activo = Almacen.sonidoActivo();
    // el parlante dibujado, no el emoji: cada teléfono dibuja 🔇 a su manera
    Util.vaciar(b);
    b.appendChild(Iconos.crear(activo ? 'sonido' : 'sonido-no'));
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

    if (partes[0] === 'juegos') {
      cortarPartida();
      pintarMateriasJuegos();
      return mostrar('juegos');
    }

    if (partes[0] === 'aprender') {
      cortarPartida();
      pintarMateriasAprender();
      return mostrar('aprender');
    }

    if (partes[0] === 'lecciones' && partes[1]) {
      var mat1 = materiaPorId(partes[1]);
      if (!mat1 || !leccionesVisibles(mat1.id).length) return irA('#/aprender');
      cortarPartida();
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
    pintarInicio();
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
    /* La configuración y la personalización se abren desde el menú de
       inicio, así que la flecha vuelve ahí. Antes colgaban del perfil,
       que era el único lugar desde donde se llegaba. */
    if (partes[0] === 'configuracion' || partes[0] === 'personalizacion') return irA('#/');
    irA('#/');
  }

  /* ---------------------- eventos ---------------------- */
  function conectar() {
    $('btn-atras').addEventListener('click', volverAtras);
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
    /* dicen «Menú principal» y llevaban a la lista de materias; ahora
       hay un menú principal de verdad */
    $('btn-al-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });

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
    $('btn-actualizar').addEventListener('click', function () {
      Sonido.tocar('clic');
      var caja = $('version-app');
      caja.textContent = 'Buscando…';
      if (window.PWA) PWA.buscarActualizacion();
      // si había algo nuevo, la app se recarga sola; si no, vuelve la versión
      setTimeout(pintarVersion, 2500);
    });
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
    $('btn-nota-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });
    $('btn-parental').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/parental'); });

    /* modo parental */
    $('btn-pin').addEventListener('click', intentarPin);
    $('campo-pin').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') intentarPin();
    });
    $('btn-olvide-pin').addEventListener('click', function () {
      preguntar({
        titulo: '¿Empezamos de nuevo?',
        texto: 'Para poder entrar hay que borrar el PIN actual y crear uno nuevo.',
        si: 'Sí, borrar el PIN'
      }, function () {
        Almacen.setPin(null);
        pintarParental();
      });
    });
    $('btn-cambiar-pin').addEventListener('click', function () {
      Almacen.setPin(null);
      pintarParental();
    });
    $('btn-borrar-progreso').addEventListener('click', function () {
      var yo = Almacen.activo();
      preguntar({
        titulo: '¿Borrar todo el progreso?',
        texto: 'Se borra todo lo de ' + (yo ? yo.nombre : '') +
               ': partidas, estrellas, monedas y lo comprado. Esto no se puede deshacer.',
        si: 'Sí, borrar todo'
      }, function () {
        Almacen.borrarProgreso();
        pintarBarraSuperior();
        abrirParental();
      });
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
