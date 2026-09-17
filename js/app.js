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
    },
    {
      id: 'ingles', nombre: 'Inglés', icono: 'ingles',
      color: '#0f766e', suave: '#ccfbf1',
      texto: 'Palabras y frases en inglés', modulo: Ingles
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
     Edades: recomendar, no trabar

     Cada juego dice entre qué edades tiene sentido (edadMin, edadMax) y
     la pantalla los ordena de menor a mayor: arriba los del chico,
     abajo los de los más grandes.

     Ninguno está cerrado. Los de más arriba de su edad se pueden jugar
     igual, siempre; lo único que pasa es que la ficha avisa para qué
     edad es y cuánto le falta para estar listo.

     Qué es «estar listo»: haber DOMINADO los juegos de su edad, o sea
     haber terminado alguna partida de cada uno con todas las respuestas
     bien. Cuando los domina todos, la app le avisa —«ya estás listo
     para los de 5 años»— y él decide.

     Antes esto era un candado: los juegos de la edad siguiente pedían
     100 puntos y hasta entonces no se podían tocar. Trababa por la
     razón equivocada. Un chico de seis que se sabe las tablas no tiene
     por qué esperar a juntar puntos, y uno de diez que quiere contar
     manzanitas un rato tampoco molesta a nadie. La edad sirve para
     ordenar y para recomendar, no para prohibir.
     ============================================================ */
  /* Preguntas mínimas para que una partida perfecta cuente como
     dominar el juego. Cuatro es el nivel más chico que hay (Las frutas,
     En casa): con cinco, ganar ese nivel sin errores no contaba y no
     había manera de saber por qué. */
  var MINIMO_PARA_DOMINAR = 4;

  function edadDelChico() { return Almacen.edad() || 0; }

  /** Las edades en las que arranca algún juego de la materia, de menor a mayor. */
  function pasosDe(materia) {
    var vistos = {};
    materia.juegos.forEach(function (j) { vistos[j.edadMin || 0] = true; });
    return Object.keys(vistos).map(Number).sort(function (a, b) { return a - b; });
  }

  /** En qué escalón está: el más alto de los que ya le corresponden. */
  function pasoDelChico(materia) {
    var pasos = pasosDe(materia);
    var edad = edadDelChico();
    if (!pasos.length) return 0;
    if (!edad) return pasos[0];
    var suyo = pasos[0];
    pasos.forEach(function (p) { if (p <= edad) suyo = p; });
    return suyo;
  }

  /** El próximo escalón que todavía le queda grande, o null si no hay. */
  function proximoPaso(materia) {
    var edad = edadDelChico();
    if (!edad) return null;
    var mayores = pasosDe(materia).filter(function (p) { return p > edad; });
    return mayores.length ? mayores[0] : null;
  }

  /** ¿Este juego es para más grandes que él? */
  function esParaMasGrandes(materia, juego) {
    return !!edadDelChico() && (juego.edadMin || 0) > edadDelChico();
  }

  function dominado(materia, juego) {
    return Almacen.dominado(materia.id + '/' + juego.id);
  }

  /**
   * Los juegos que hay que dominar para estar listo para cierta edad:
   * los de más abajo que ésa, salvo los que ya le quedan chicos.
   *
   * Ese «salvo los que le quedan chicos» es lo que hace que la cuenta
   * sea justa a cualquier edad: a los nueve, los juegos de cuatro no
   * están en la lista porque ya no se le muestran. Y es la misma
   * condición con la que se arma la pantalla, así que los juegos que
   * cuentan son exactamente los que ve sin etiqueta de edad: no hay
   * ninguno escondido que le falte dominar.
   */
  function previosA(materia, edadPaso) {
    var edad = edadDelChico();
    return materia.juegos.filter(function (j) {
      var min = j.edadMin || 0;
      return min < edadPaso && (j.edadMax || 99) >= edad;
    });
  }

  /** Cuánto le falta para estar listo para los juegos de esa edad. */
  function listoPara(materia, edadPaso) {
    var previos = previosA(materia, edadPaso);
    var hechos = previos.filter(function (j) { return dominado(materia, j); }).length;
    return {
      total: previos.length,
      hechos: hechos,
      faltan: Math.max(0, previos.length - hechos),
      listo: hechos >= previos.length
    };
  }

  /** Lo que la ficha de un juego tiene que contar, además de su nombre. */
  function consejoDeJuego(materia, juego) {
    if (!esParaMasGrandes(materia, juego)) return null;
    var avance = listoPara(materia, juego.edadMin);
    return {
      edad: juego.edadMin,
      listo: avance.listo,
      avance: avance,
      /* Dos frases cortas: para quién es, y cómo viene. La ficha mide
         169px de ancho, así que no entra nada más largo. */
      titulo: 'Para chicos de ' + juego.edadMin,
      texto: avance.listo
        ? '¡Ya estás listo!'
        : 'Te ' + (avance.faltan === 1 ? 'falta ' : 'faltan ') +
          Util.plural(avance.faltan, 'juego') + ' para estar listo'
    };
  }

  /**
   * Los juegos que se le muestran: todos, menos los que ya le quedan
   * chicos (a los once no hace falta ofrecerle contar manzanitas), y de
   * la edad más chica a la más grande.
   */
  function juegosVisibles(materia) {
    var edad = edadDelChico();
    return materia.juegos.filter(function (j) {
      return !edad || (j.edadMax || 99) >= edad;
    }).sort(function (a, b) { return (a.edadMin || 0) - (b.edadMin || 0); });
  }

  /**
   * Las lecciones, con el mismo criterio que los juegos: todas, de la
   * más chica a la más grande. Antes se escondían las de más arriba de
   * su edad y una materia entera podía aparecer vacía.
   */
  function leccionesVisibles(materiaId) {
    return leccionesDe(materiaId).slice().sort(function (a, b) {
      return (a.edadMin || 0) - (b.edadMin || 0);
    });
  }

  /** Foto de qué juegos todavía no domina, para festejar los nuevos después. */
  function sinDominarAhora() {
    var lista = [];
    MATERIAS.forEach(function (m) {
      m.juegos.forEach(function (j) {
        if (!dominado(m, j)) lista.push(m.id + '/' + j.id);
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
                   'config', 'juego', 'fin', 'perfil', 'tienda', 'parental', 'descanso',
                   'examen', 'nota', 'configuracion', 'personalizacion'];

  function mostrar(nombre) {
    // lo que se estaba leyendo era de la pantalla de antes
    Voz.parar();
    PANTALLAS.forEach(function (p) { $('pantalla-' + p).hidden = (p !== nombre); });
    pantallaActual = nombre;
    /* La única pantalla sin flecha de volver es el inicio, porque es el
       fondo de todo; la bienvenida tampoco, porque todavía no hay a
       dónde volver. */
    $('btn-atras').hidden = (nombre === 'inicio' || nombre === 'bienvenida');
    document.body.classList.toggle('jugando', nombre === 'juego');
    document.body.classList.toggle('en-bienvenida', nombre === 'bienvenida');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function irA(hash) {
    if (location.hash === hash) enrutar();
    else location.hash = hash;
  }

  function cortarPartida() {
    dejarDeLeerPreguntas();
    ejercicioActual = null;
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

  var PASOS_BIENVENIDA = ['nombre', 'edad', 'avatar'];

  function pasoBienvenida(cual) {
    bienvenida.paso = cual;
    PASOS_BIENVENIDA.forEach(function (p) {
      $('bien-paso-' + p).hidden = (p !== cual);
    });
    pintarPasos(cual);
    pintarFlechaBienvenida();
    if (cual === 'nombre') setTimeout(function () { $('campo-nombre').focus(); }, 120);
  }

  /**
   * La flecha de volver, mientras se arma un perfil. En el segundo y el
   * tercer paso vuelve al anterior: el que se equivocó de edad tiene que
   * poder corregirla sin empezar de cero. En el primero aparece sólo
   * cuando se está sumando otro chico, que ya tiene un inicio al que
   * volver; la primera vez de todas no hay a dónde.
   */
  function puedeVolverEnBienvenida() {
    if (PASOS_BIENVENIDA.indexOf(bienvenida.paso) > 0) return true;
    return location.hash === '#/nuevo-jugador' && Almacen.perfiles().length > 0;
  }

  function pintarFlechaBienvenida() {
    if ($('pantalla-bienvenida').hidden) return;
    $('btn-atras').hidden = !puedeVolverEnBienvenida();
  }

  function volverEnBienvenida() {
    var i = PASOS_BIENVENIDA.indexOf(bienvenida.paso);
    if (i > 0) return pasoBienvenida(PASOS_BIENVENIDA[i - 1]);
    if (puedeVolverEnBienvenida()) irA('#/');
  }

  /* Los tres puntitos de arriba de la tarjeta. Saber cuánto falta es
     la mitad de la paciencia: sin esto, el que llena el nombre no tiene
     idea de si le quedan dos preguntas o veinte. */
  function pintarPasos(cual) {
    var voy = PASOS_BIENVENIDA.indexOf(cual);
    var caja = $('bien-pasos');
    caja.setAttribute('aria-label', 'Paso ' + (voy + 1) + ' de ' + PASOS_BIENVENIDA.length);
    caja.querySelectorAll('span').forEach(function (p, i) {
      p.className = i < voy ? 'hecho' : (i === voy ? 'ahora' : '');
    });
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
  /* Las dos cuentas del cartel del inicio. Las monedas llevan a la
     tienda y las estrellas no llevan a ningún lado, así que las monedas
     terminan en una flechita: son dos cosas distintas y antes se veían
     iguales. */
  function cuentaDePortada(caja, icono, cuanto, conFlecha) {
    Util.vaciar(caja);
    caja.appendChild(Iconos.crear(icono));
    caja.appendChild(Util.crear('span', null, String(cuanto)));
    if (conFlecha) caja.appendChild(Iconos.crear('derecha', 'portada-flechita'));
  }

  /**
   * La fila de «¿Quién juega?»: una carita por chico y un botón para sumar
   * otro. Tocar otra carita cambia de jugador ahí mismo; cada uno tiene
   * sus puntos, sus niveles y sus colores.
   */
  /* El color de la carita de cada chico. Sale de su id y no del orden en
     la lista, así cada uno tiene siempre el mismo aunque se agreguen o se
     borren hermanos: el color termina siendo «el de Mora». */
  var COLORES_DE_CARA = ['#ffedd5', '#fce7f3', '#dcfce7', '#dbeafe', '#ede9fe', '#cffafe', '#fef3c7', '#ffe4e6'];

  function colorDeCara(id) {
    var suma = 0;
    for (var i = 0; i < id.length; i++) suma = (suma * 31 + id.charCodeAt(i)) % 997;
    return COLORES_DE_CARA[suma % COLORES_DE_CARA.length];
  }

  function pintarJugadores() {
    var caja = $('inicio-jugadores');
    Util.vaciar(caja);
    var yo = Almacen.activo();

    Almacen.perfiles().forEach(function (p) {
      var esYo = yo && p.id === yo.id;
      var b = Util.crear('button', 'jugador');
      b.type = 'button';
      b.setAttribute('aria-pressed', esYo ? 'true' : 'false');
      var edad = p.edad ? p.edad + ' años' : '';
      b.setAttribute('aria-label', p.nombre + (edad ? ', ' + edad : '') +
                                   (esYo ? ', está jugando' : '. Tocá para jugar con este perfil'));
      var cara = Util.crear('span', 'jugador-cara', p.foto ? '' : p.avatar);
      cara.style.background = colorDeCara(p.id);
      if (p.foto) {
        var suFoto = Util.crear('img', 'jugador-foto');
        suFoto.src = p.foto;
        suFoto.alt = '';
        cara.appendChild(suFoto);
      }
      if (esYo) cara.appendChild(Util.crear('span', 'jugador-marca')).appendChild(Iconos.crear('tilde'));
      b.appendChild(cara);
      b.appendChild(Util.crear('span', 'jugador-nombre', p.nombre));
      if (edad) b.appendChild(Util.crear('span', 'jugador-edad', edad));
      b.addEventListener('click', function () {
        if (esYo) return;
        Sonido.tocar('clic');
        Almacen.usar(p.id);
        Temas.aplicar();          // cada jugador tiene su propia paleta
        pintarInicio();
      });
      caja.appendChild(b);
    });

    var nuevo = Util.crear('a', 'jugador jugador-nuevo');
    nuevo.href = '#/nuevo-jugador';
    var mas = Util.crear('span', 'jugador-cara');
    mas.appendChild(Iconos.crear('mas'));
    nuevo.appendChild(mas);
    nuevo.appendChild(Util.crear('span', 'jugador-nombre', 'Nuevo'));
    nuevo.appendChild(Util.crear('span', 'jugador-edad', 'Sumar otro'));
    nuevo.setAttribute('aria-label', 'Agregar un chico nuevo');
    caja.appendChild(nuevo);
  }

  /** El alta de un chico nuevo: la misma bienvenida, pero empezando de cero. */
  function empezarJugadorNuevo() {
    bienvenida = { nombre: '', edad: null, avatar: null, editando: null };
    $('campo-nombre').value = '';
    $('error-nombre').hidden = true;
    pasoBienvenida('nombre');
    pintarEdades();
    pintarAvatares();
  }

  /** «¡Buen día!», «¡Buenas tardes!» o «¡Buenas noches!», según la hora. */
  function saludoDeLaHora() {
    var h = new Date().getHours();
    if (h >= 5 && h < 13) return '¡Buen día!';
    if (h >= 13 && h < 20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  function pintarInicio() {
    var yo = Almacen.activo();
    $('inicio-saludo').textContent = saludoDeLaHora();
    $('inicio-nombre').textContent = yo ? yo.nombre : 'Jugador';
    var edad = $('inicio-edad');
    edad.hidden = !(yo && yo.edad);
    edad.textContent = yo && yo.edad ? yo.edad + ' años' : '';
    pintarJugadores();
    pintarFotoDePortada();
    pintarRachaYMeta();
    pintarRepasoHoy();

    cuentaDePortada($('portada-estrellas'), 'estrella', Almacen.estrellas());
    cuentaDePortada($('portada-monedas'), 'moneda', Almacen.monedas(), true);
    $('portada-monedas').hidden = !Almacen.control().tienda;

    /* La bajada de cada botón dice qué hay adentro, no qué es: "3
       materias" sirve más que "practicá lo que aprendiste", que es lo
       mismo que ya dice el título. */
    var conJuegos = materiasVisibles().filter(function (m) { return m.disponible; }).length;
    $('menu-jugar-detalle').textContent =
      Util.plural(conJuegos, 'materia') + ' para practicar';

    var conLecciones = materiasVisibles().filter(function (m) {
      return leccionesVisibles(m.id).length;
    }).length;
    $('menu-aprender-detalle').textContent = conLecciones
      ? Util.plural(conLecciones, 'materia') + ' con cursitos'
      : 'Explicaciones cortas, con dibujos';

    Mascota.refrescar();
  }

  /* ---------------------- la foto del jugador ----------------------

     La carita del cartel del inicio es la foto que el chico eligió de
     la galería. Mientras no haya ninguna va una silueta: una silueta
     vacía se lee como «acá va tu cara» mejor que cualquier dibujo, que
     parecería que ya está puesto lo que tiene que estar.

     La foto no sale del aparato. Ver js/nucleo/foto.js. */
  function pintarFotoDePortada() {
    var foto = Almacen.foto();
    ponerLaFoto($('btn-foto'), 'portada-foto-img', foto);
    $('portada-silueta').hidden = !!foto;
    $('btn-foto').setAttribute('aria-label', foto ? 'Cambiar tu foto' : 'Poner una foto tuya');
  }

  /* Mete (o saca) la foto adentro de un botón redondo. La imagen se arma
     acá y no está escrita en el index porque una <img> sin foto es una
     imagen rota esperando que alguien se olvide de esconderla; las
     fichitas de «¿Quién juega?» ya lo hacían así. */
  function ponerLaFoto(caja, clase, foto) {
    var vieja = caja.querySelector('.' + clase);
    if (vieja) caja.removeChild(vieja);
    if (!foto) return;
    var img = Util.crear('img', clase);
    img.src = foto;
    img.alt = '';
    caja.insertBefore(img, caja.firstChild);
  }

  /* A quién hay que repintar cuando vuelva la foto: el inicio y el
     perfil la muestran, y el que pide la foto es el que se repinta. */
  var alVolverLaFoto = null;

  function pedirFoto(repintar) {
    alVolverLaFoto = repintar;
    var campo = $('campo-foto');
    /* Sin vaciarlo, elegir dos veces la misma foto no dispara nada: el
       navegador ve el mismo archivo y no considera que haya cambiado. */
    campo.value = '';
    Sonido.despertar(); Sonido.tocar('clic');
    campo.click();
  }

  function fotoElegida(archivo) {
    Foto.preparar(archivo, function (foto) {
      if (!Almacen.guardarFoto(foto)) {
        avisoDeFoto('No entró la foto',
          'Este aparato no tiene más lugar guardado. Probá con otra foto, o borrá el progreso de algún jugador que ya no juegue.');
        return;
      }
      Sonido.tocar('acierto');
      /* El inicio es el que siempre está: si la foto llegó sin que
         nadie la pidiera desde una pantalla, al menos que se vea ahí. */
      (alVolverLaFoto || pintarInicio)();
    }, function (motivo) {
      avisoDeFoto('No se pudo poner la foto', motivo);
    });
  }

  function avisoDeFoto(titulo, texto) {
    preguntar({ titulo: titulo, texto: texto, si: 'Listo', soloAceptar: true });
  }

  /* ---------------------- racha y meta del día ---------------------- */

  /** La llamita del cartel y la tarjeta de la meta, en el inicio. */
  function pintarRachaYMeta() {
    var racha = Almacen.racha();
    var chip = $('portada-racha');
    chip.hidden = racha < 1;
    if (racha >= 1) {
      cuentaDePortada(chip, 'fuego', racha);
      chip.setAttribute('aria-label', Util.plural(racha, 'día seguido', 'días seguidos') + ' jugando');
      // la llama se apaga, no desaparece, si hoy todavía no jugó
      chip.classList.toggle('racha-pendiente', !Almacen.jugoHoy());
    }

    var meta = Almacen.metaDiaria();
    var tarjeta = $('meta-hoy');
    tarjeta.hidden = meta <= 0;
    if (meta <= 0) return;
    var llevo = Almacen.aciertosDeHoy();
    var cumplida = llevo >= meta;
    tarjeta.classList.toggle('cumplida', cumplida);
    $('meta-hoy-titulo').textContent = cumplida ? '¡Meta de hoy cumplida!' : 'Meta de hoy';
    var barra = $('meta-hoy-barra');
    barra.setAttribute('aria-valuemax', String(meta));
    barra.setAttribute('aria-valuenow', String(Math.min(llevo, meta)));
    barra.querySelector('i').style.transform = 'scaleX(' + Math.min(1, llevo / meta) + ')';
    $('meta-hoy-texto').textContent = cumplida
      ? Util.plural(llevo, 'respuesta bien', 'respuestas bien') + ' hoy. Mañana, otra.'
      : llevo + ' de ' + meta + ' respuestas bien' +
        (llevo ? '' : ' · ¡Jugá una partida!');
  }

  /* ---------------------- repasar hoy ---------------------- */

  function textoRepasoHoy() {
    var errores = Almacen.cuantosErrores(), vencidos = Almacen.cuantosVencidos();
    var partes = [];
    if (errores) partes.push(Util.plural(errores, 'cosa que te costó', 'cosas que te costaron'));
    if (vencidos) partes.push(Util.plural(vencidos, 'cosa que ya sabías', 'cosas que ya sabías') + ' y toca volver a ver');
    return partes.join(' y ') || 'Nada para repasar hoy';
  }

  /* La tarjeta del inicio. Aparece sólo si hay algo: una ronda de repaso
     o una lección que le toca repasar. */
  function pintarRepasoHoy() {
    var tarjeta = $('repaso-hoy');
    if (!tarjeta) return;
    var lecciones = Almacen.leccionesParaRepasar()
      .map(function (id) { return window.Lecciones ? Lecciones.porId(id) : null; })
      .filter(function (l) { return l && l.ejercicio; });
    var hayRonda = Repaso.hayParaRepasar();
    tarjeta.hidden = !hayRonda && !lecciones.length;
    if (tarjeta.hidden) return;
    var texto = hayRonda ? textoRepasoHoy() : '';
    if (lecciones.length) {
      texto += (texto ? '. ' : '') + 'Toca repasar la lección «' + lecciones[0].titulo + '»';
    }
    $('repaso-hoy-texto').textContent = texto;
    tarjeta.href = hayRonda ? '#/repasando' : '#/ejercicio/' + lecciones[0].id;
  }

  /** El cartelito del final de la partida que cruzó la meta. */
  function pintarMetaCumplida(delDia) {
    var caja = $('meta-cumplida');
    caja.hidden = !(delDia && delDia.metaCumplida);
    if (caja.hidden) return;
    caja.textContent = '🏆 ¡Cumpliste la meta de hoy!' + (Almacen.control().tienda ? ' +' + delDia.premio + ' monedas' : '');
  }

  var METAS = [
    { n: 5, nombre: 'Un ratito', detalle: '5 respuestas bien' },
    { n: 10, nombre: 'Una partida', detalle: '10 respuestas bien' },
    { n: 20, nombre: 'Dos partidas', detalle: '20 respuestas bien' },
    { n: 0, nombre: 'Sin meta', detalle: 'Jugar cuando quiera' }
  ];

  /* La meta propia va de 1 a 100 respuestas bien. No hace falta guardarla
     aparte: cualquier número que no sea una de las fijas es personalizada. */
  var META_MINIMA = 1, META_MAXIMA = 100, META_PERSONAL_INICIAL = 15;

  function pintarAjusteMeta() {
    var caja = $('ajuste-meta');
    if (!caja) return;
    Util.vaciar(caja);
    $('premio-meta').textContent = String(Almacen.PREMIO_META);
    var actual = Almacen.metaDiaria();
    var esFija = METAS.some(function (m) { return m.n === actual; });
    var personal = esFija ? META_PERSONAL_INICIAL : actual;
    var panel = $('meta-personal');

    METAS.forEach(function (m) {
      var b = botonOpcion(m.n ? String(m.n) : '—', m.nombre, m.detalle, null, null, true);
      b.setAttribute('aria-pressed', m.n === actual ? 'true' : 'false');
      b.addEventListener('click', function () {
        Almacen.setMeta(m.n);
        marcarElegido(caja, b);
        panel.hidden = true;
      });
      caja.appendChild(b);
    });

    var propia = botonOpcion(String(personal), 'Personalizada', 'Elegí cuántas', null, null, true);
    propia.setAttribute('aria-pressed', esFija ? 'false' : 'true');
    propia.setAttribute('aria-controls', 'meta-personal');
    propia.addEventListener('click', function () {
      Almacen.setMeta(personal);
      marcarElegido(caja, propia);
      panel.hidden = false;
      pintarNumero();
    });
    caja.appendChild(propia);

    function pintarNumero() {
      propia.querySelector('.opcion-icono').textContent = String(personal);
      $('meta-personal-numero').textContent = String(personal);
      $('meta-personal-texto').textContent = (personal === 1 ? 'respuesta bien' : 'respuestas bien') + ' por día';
      $('meta-menos').disabled = personal <= META_MINIMA;
      $('meta-mas').disabled = personal >= META_MAXIMA;
    }

    /* De a uno, y de a cinco si se deja apretado: llegar de 15 a 60
       tocando 45 veces no es para un chico. */
    function paso(delta) {
      personal = Math.max(META_MINIMA, Math.min(META_MAXIMA, personal + delta));
      Almacen.setMeta(personal);
      pintarNumero();
    }
    function conRepeticion(boton, delta) {
      var espera = null, repite = null;
      function parar() { clearTimeout(espera); clearInterval(repite); espera = repite = null; }
      boton.onpointerdown = function () {
        parar();
        espera = setTimeout(function () {
          repite = setInterval(function () { paso(delta * 5); }, 180);
        }, 450);
      };
      boton.onpointerup = boton.onpointerleave = boton.onpointercancel = function () {
        // si llegó a repetir, el clic de al soltar no suma uno más
        boton.dataset.repitio = repite ? '1' : '';
        parar();
      };
      boton.onclick = function () {
        if (boton.dataset.repitio) { boton.dataset.repitio = ''; return; }
        Sonido.despertar(); Sonido.tocar('clic');
        paso(delta);
      };
    }
    conRepeticion($('meta-menos'), -1);
    conRepeticion($('meta-mas'), 1);

    panel.hidden = esFija;
    pintarNumero();
  }

  /* ---------------------- la copia del progreso ---------------------- */

  function guardarCopia() {
    var texto = Almacen.exportar();
    var hoy = new Date();
    var nombre = 'bichito-curioso-' + hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() + '.json';
    var archivo = new Blob([texto], { type: 'application/json' });

    /* En el celular, compartir: abre el menú de guardar en Drive, mandarlo
       por WhatsApp o dejarlo en Archivos, que es donde lo va a buscar un
       grande. En la compu, bajarlo a la carpeta de siempre. */
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    try {
      var paraCompartir = new File([archivo], nombre, { type: 'application/json' });
      if (tactil && navigator.canShare && navigator.canShare({ files: [paraCompartir] })) {
        navigator.share({ files: [paraCompartir], title: 'Copia de Bichito Curioso' })
          .catch(function () { /* lo cerró sin elegir: no pasa nada */ });
        return;
      }
    } catch (e) { /* sin File o sin share: se baja */ }

    var enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    setTimeout(function () {
      URL.revokeObjectURL(enlace.href);
      enlace.remove();
    }, 1500);
  }

  function copiaElegida(archivo) {
    var lector = new FileReader();
    lector.onload = function () {
      var copia = Almacen.leerCopia(lector.result);
      if (!copia) {
        return preguntar({
          titulo: 'Ese archivo no es una copia',
          texto: 'Tiene que ser un archivo guardado con «Guardar una copia».',
          si: 'Listo', soloAceptar: true
        });
      }
      preguntar({
        titulo: '¿Recuperar esta copia?',
        texto: 'Trae ' + Util.plural(copia.perfiles.length, 'jugador', 'jugadores') + ': ' +
               copia.perfiles.map(function (p) { return p.nombre; }).join(', ') +
               '. Todo lo que hay ahora en este aparato se reemplaza por la copia.',
        si: 'Sí, recuperar'
      }, function () {
        if (Almacen.restaurar(copia)) location.reload();
        else preguntar({ titulo: 'No se pudo recuperar', texto: 'Este aparato no tiene lugar para guardarla.', si: 'Listo', soloAceptar: true });
      });
    };
    lector.readAsText(archivo);
  }

  /* ---------------------- la lección de un juego ---------------------- */

  /* En la pantalla de un juego, la lección que lo explica. Es el camino
     de vuelta: la lección ya termina ofreciendo el juego, y ahora el
     juego ofrece la lección al que no sabe cómo se hace. */
  function pintarEnlaceLeccion(materia, juego) {
    var caja = $('enlace-leccion');
    Util.vaciar(caja);
    var clave = materia.id + '/' + juego.id;
    var leccion = (window.Lecciones ? Lecciones.LECCIONES : []).filter(function (l) {
      return l.juego === clave || (l.ejercicio && l.ejercicio.juego === clave);
    })[0];
    caja.hidden = !leccion;
    if (!leccion) return;
    var enlace = Util.crear('a', 'enlace-cruzado');
    enlace.href = '#/leccion/' + leccion.id;
    enlace.appendChild(Iconos.crear('aprender'));
    enlace.appendChild(Util.crear('span', null,
      Almacen.leccionVista(leccion.id)
        ? ' Repasá la lección «' + leccion.titulo + '»'
        : ' ¿No sabés cómo se hace? Mirá la lección «' + leccion.titulo + '»'));
    caja.appendChild(enlace);
  }

  /* ---------------------- sección Jugar ---------------------- */
  function pintarMateriasJuegos() {
    $('saludo-juegos').textContent = saludo() + 'Elegí una materia y practicá jugando.';
    // el examen sólo tiene sentido si ya hay algo desbloqueado para rendir
    $('btn-examen').hidden = juegosParaExamen().length === 0;
    pintarTarjetaRepaso();

    var cont = $('grilla-materias');
    Util.vaciar(cont);
    materiasVisibles().forEach(function (m) {
      var b = tarjeta(m.disponible ? sinBajada(m) : m,
                      function () { irA('#/materia/' + m.id); });
      b.disabled = !m.disponible;
      if (m.disponible) {
        /* Todos los que se le muestran, porque todos se pueden jugar.
           Antes contaba sólo los abiertos, que era el número que
           importaba cuando había candados. */
        var cuantos = juegosVisibles(m).length;
        b.cuerpo.appendChild(Util.crear('span', 'card-texto', Util.plural(cuantos, 'juego')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  /**
   * El cartel de arriba de los juegos de una materia: en qué edad está
   * y cuánto le falta para que le digamos que ya está listo para la
   * siguiente. Es lo que explica las barritas de las fichas de abajo.
   *
   * `reciente` lo usa la pantalla de resultados, que muestra el mismo
   * cartel pero contando la partida que acaba de terminar.
   */
  function pintarNivel(caja, materia, reciente) {
    Util.vaciar(caja);
    caja.hidden = !Almacen.edad();
    if (caja.hidden) return;

    var siguiente = proximoPaso(materia);
    var titulo, texto, avance = null;

    if (!siguiente) {
      titulo = 'Todos los juegos de ' + materia.nombre + ' son para vos';
      texto = 'No queda ninguno más grande: jugá el que quieras.';
    } else {
      avance = listoPara(materia, siguiente);
      if (avance.listo) {
        titulo = '¡Estás listo para los juegos de ' + siguiente + ' años!';
        texto = 'Están más abajo, con la barra llena. Probalos cuando quieras.';
      } else {
        titulo = reciente ? 'Seguís en los juegos de ' + pasoDelChico(materia) + ' años'
                          : 'Estás en los juegos de ' + pasoDelChico(materia) + ' años';
        texto = 'Terminá una partida con todas bien en ' +
                (avance.faltan === 1 ? 'el juego que te falta' : 'los ' + avance.faltan + ' juegos que te faltan') +
                ' y te avisamos que ya estás listo para los de ' + siguiente + '.';
      }
    }

    caja.appendChild(Util.crear('b', 'nivel-titulo', titulo));
    if (avance && avance.total) {
      caja.appendChild(barraDeAvance(avance, 'juego dominado', 'juegos dominados'));
    }
    caja.appendChild(Util.crear('span', 'nivel-texto', texto));
  }

  /** La barra de «cuánto llevás», con su número al lado. */
  function barraDeAvance(avance, uno, varios) {
    var caja = Util.crear('div', 'avance');
    var barra = Util.crear('div', 'nivel-barra');
    barra.setAttribute('role', 'progressbar');
    barra.setAttribute('aria-valuemin', '0');
    barra.setAttribute('aria-valuemax', String(avance.total));
    barra.setAttribute('aria-valuenow', String(avance.hechos));
    barra.setAttribute('aria-label', avance.hechos + ' de ' + avance.total + ' ' + varios);
    var relleno = Util.crear('i');
    relleno.style.transform = 'scaleX(' + (avance.total ? avance.hechos / avance.total : 0) + ')';
    barra.appendChild(relleno);
    caja.appendChild(barra);
    caja.appendChild(Util.crear('span', 'avance-cuenta',
      avance.hechos + '/' + avance.total + ' ' + (avance.total === 1 ? uno : varios)));
    return caja;
  }

  /**
   * Cuántos niveles de un juego terminó con todas bien. null si el juego
   * no tiene niveles (los de geografía se eligen por zona).
   */
  function nivelesDeJuego(materia, juego) {
    var grupo = (juego.opciones() || []).filter(function (g) { return g.esNivel; })[0];
    if (!grupo || !grupo.items.length) return null;
    var hechos = grupo.items.filter(function (it) {
      return Almacen.nivelHecho(claveDeNivel(materia, juego, it.id));
    }).length;
    return { hechos: hechos, total: grupo.items.length };
  }

  function pintarJuegos(materia) {
    var juegos = juegosVisibles(materia);

    var cabecera = $('materia-cabecera');
    /* un poco más oscuro que el color de la materia: el texto blanco
       chico no llega a 4,5:1 sobre el naranja de Lengua ni el violeta
       de Ciencias tal cual */
    cabecera.style.setProperty('--materia-color', Util.oscurecer(materia.color, 0.8));
    cabecera.style.setProperty('--materia-fuerte', Util.oscurecer(materia.color, 0.6));
    var icono = $('materia-icono');
    Util.vaciar(icono);
    ponerIcono(icono, materia.icono);
    $('titulo-materia').textContent = materia.nombre;
    $('subtitulo-materia').textContent = Util.plural(juegos.length, 'juego') + ' para practicar';

    var aprender = $('materia-aprender');
    aprender.hidden = !leccionesVisibles(materia.id).length;
    if (!aprender.hidden) {
      Util.vaciar(aprender);
      aprender.appendChild(Iconos.crear('aprender'));
      aprender.appendChild(Util.crear('span', null, 'Aprender ' + materia.nombre.toLowerCase()));
      aprender.href = '#/lecciones/' + materia.id;
    }

    /* El cartel de nivel sólo cuando dice algo: si ya no quedan juegos
       de más grandes, decía «todos son para vos» y ocupaba lugar. */
    pintarNivel($('nivel-materia'), materia);
    if (!proximoPaso(materia)) $('nivel-materia').hidden = true;

    var cont = $('grilla-juegos');
    Util.vaciar(cont);
    juegos.forEach(function (j) {
      cont.appendChild(filaDeJuego(materia, j));
    });
  }

  /**
   * Una fila por juego: el dibujo, el nombre con su bajada y, abajo,
   * cuánto lleva. Antes era una grilla de fichas blancas iguales, con un
   * hueco si los juegos eran impares y el récord como único dato: ahora
   * lo que se ve es el progreso de niveles, que dice qué le falta.
   */
  function filaDeJuego(materia, j) {
    var consejo = consejoDeJuego(materia, j);
    var b = tarjeta(j, function () { irAlJuego(materia, j, consejo); });
    b.classList.add('card-fila');

    // el nombre, con la edad al lado si es para más grandes
    var titulo = b.cuerpo.querySelector('.card-titulo');
    var linea = Util.crear('span', 'card-fila-linea');
    b.cuerpo.insertBefore(linea, titulo);
    linea.appendChild(titulo);

    if (consejo) {
      b.classList.add('mas-grande');
      var cinta = Util.crear('span', 'card-edad', consejo.titulo);
      if (consejo.listo) cinta.classList.add('card-edad-listo');
      linea.appendChild(cinta);

      var caja = Util.crear('div', 'card-consejo');
      if (consejo.listo) {
        caja.classList.add('card-consejo-listo');
        caja.appendChild(Iconos.crear('tilde'));
      } else {
        caja.appendChild(barraDeAvance(consejo.avance, 'juego', 'juegos'));
      }
      caja.appendChild(Util.crear('span', 'traba-texto', consejo.texto));
      b.cuerpo.appendChild(caja);
    } else {
      var niveles = nivelesDeJuego(materia, j);
      if (niveles && niveles.hechos) {
        b.cuerpo.appendChild(barraDeAvance(niveles, 'nivel hecho', 'niveles hechos'));
      } else if (niveles) {
        b.cuerpo.appendChild(Util.crear('span', 'card-empezar', 'Empezá por el nivel 1'));
      }
      if (dominado(materia, j)) {
        var d = Util.crear('div', 'card-dominado');
        d.appendChild(Iconos.crear('tilde'));
        d.appendChild(Util.crear('span', null, ' Lo dominás'));
        b.cuerpo.appendChild(d);
      }
    }

    var flecha = Util.crear('span', 'card-flecha', '›');
    flecha.setAttribute('aria-hidden', 'true');
    b.appendChild(flecha);
    return b;
  }

  /**
   * Entrar a un juego. Si es para más grandes y todavía no está listo,
   * primero se lo avisa; pero la respuesta de arriba es «sí, probalo»,
   * porque la idea es recomendar y no frenar. Si ya está listo no
   * pregunta nada: ya se lo dijimos cuando lo estuvo.
   */
  function irAlJuego(materia, juego, consejo) {
    var destino = '#/juego/' + materia.id + '/' + juego.id;
    if (!consejo || consejo.listo) return irA(destino);
    preguntar({
      titulo: 'Este es para chicos de ' + consejo.edad,
      texto: 'Tenés ' + edadDelChico() + ', así que te puede resultar difícil. Podés jugarlo igual.',
      si: 'Jugar igual'
    }, function () { irA(destino); });
  }

  /* ---------------------- sección Aprender ---------------------- */
  function pintarMateriasAprender() {
    $('saludo-aprender').textContent = saludo() + 'Explicaciones cortas, con dibujos y ejemplos.';
    var cont = $('grilla-materias-aprender');
    Util.vaciar(cont);
    materiasVisibles().forEach(function (m) {
      var lista = leccionesVisibles(m.id);
      var b = tarjeta(lista.length ? sinBajada(m) : m,
                      function () { irA('#/lecciones/' + m.id); });
      b.disabled = lista.length === 0;
      if (lista.length) {
        var leidas = lista.filter(function (l) { return Almacen.leccionVista(l.id); }).length;
        b.cuerpo.appendChild(Util.crear('span', 'card-texto',
          Util.plural(lista.length, 'lección', 'lecciones') +
          (leidas ? ' · ' + leidas + ' leída' + (leidas === 1 ? '' : 's') : '')));
      } else {
        b.appendChild(Util.crear('span', 'card-cinta', 'Pronto'));
      }
      cont.appendChild(b);
    });
  }

  /**
   * Lo mismo que con los juegos, pero leyendo: una lección de más
   * arriba de su edad se puede abrir igual, y la ficha le cuenta
   * cuántas de las de antes ya leyó. Acá «estar listo» es haberlas
   * leído, que es todo lo que se le puede pedir a una lección.
   */
  function consejoDeLeccion(lecciones, leccion) {
    var edad = edadDelChico();
    var suya = leccion.edadMin || 0;
    if (!edad || suya <= edad) return null;

    var previas = lecciones.filter(function (l) {
      return (l.edadMin || 0) <= edad;
    });
    var leidas = previas.filter(function (l) { return Almacen.leccionVista(l.id); }).length;
    var avance = { total: previas.length, hechos: leidas,
                   faltan: Math.max(0, previas.length - leidas) };
    avance.listo = avance.faltan === 0;
    return {
      edad: suya,
      listo: avance.listo,
      avance: avance,
      titulo: 'Para chicos de ' + suya,
      texto: avance.listo
        ? '¡Ya estás listo!'
        : 'Te ' + (avance.faltan === 1 ? 'falta ' : 'faltan ') +
          Util.plural(avance.faltan, 'lección', 'lecciones') + ' de tu edad'
    };
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
    var lecciones = leccionesVisibles(materia.id);
    lecciones.forEach(function (l) {
      var vista = Almacen.leccionVista(l.id);
      var consejo = consejoDeLeccion(lecciones, l);
      var b = tarjeta({
        icono: l.icono, nombre: l.titulo, texto: l.resumen,
        color: materia.color, suave: materia.suave
      }, function () { irA('#/leccion/' + l.id); });

      /* Igual que los juegos: la de más grandes se puede leer igual, y
         lo único que cambia es que la ficha avisa para quién es y
         cuántas de las de antes lleva leídas. */
      if (consejo) {
        b.classList.add('mas-grande');
        var cinta = Util.crear('span', 'card-edad', consejo.titulo);
        if (consejo.listo) cinta.classList.add('card-edad-listo');
        b.icono.appendChild(cinta);
        var caja = Util.crear('div', 'card-consejo');
        if (consejo.listo) {
          caja.classList.add('card-consejo-listo');
          caja.appendChild(Iconos.crear('tilde'));
          caja.appendChild(Util.crear('span', 'traba-texto', consejo.texto));
        } else {
          caja.appendChild(barraDeAvance(consejo.avance, 'lección', 'lecciones'));
          caja.appendChild(Util.crear('span', 'traba-texto', consejo.texto));
        }
        b.cuerpo.appendChild(caja);
      }

      var pie = Util.crear('div', 'card-pie');
      pie.appendChild(Util.crear('span', 'card-minutos', '⏱️ ' + l.minutos + ' min'));
      if (vista) pie.appendChild(Util.crear('span', 'card-leida', l.ejercicio ? '✅ Completada' : '✅ Leída'));
      if (Almacen.leccionesParaRepasar().indexOf(l.id) >= 0) {
        pie.appendChild(Util.crear('span', 'card-repasar', '🔁 Toca repasarla'));
      }
      b.cuerpo.appendChild(pie);
      cont.appendChild(b);
    });
  }

  /* ---------------------- configurar la partida ---------------------- */
  function pintarConfig(materia, juego) {
    tituloConIcono($('titulo-config'), juego.icono, juego.nombre);
    $('subtitulo-config').textContent = juego.texto;
    pintarEnlaceLeccion(materia, juego);

    sel.materia = materia.id;
    sel.juego = juego.id;
    sel.valores = {};
    sel.cantidad = 10;

    grupos = juego.opciones();
    grupos.forEach(function (g) {
      /* El nivel arranca en el primero: es el más fácil, y es de donde
         se empieza. Los demás grupos, en lo que diga el juego. */
      if (g.esNivel) sel.valores[g.id] = nivelSugerido(materia, juego, g);
      else if (g.porDefecto) sel.valores[g.id] = g.porDefecto;
    });

    var caja = $('bloques-opciones');
    Util.vaciar(caja);
    grupos.forEach(function (grupo, i) {
      caja.appendChild(grupo.esNivel
        ? bloqueDeNiveles(grupo, i + 1, juego, materia)
        : bloqueDeOpciones(grupo, i + 1, juego));
    });

    actualizarResumen(juego);
  }

  /**
   * Los niveles de un juego: 1, 2, 3… cada uno con su nombre.
   *
   * Reemplazó a la pregunta «¿cuántas preguntas: 5, 10 o todas?», que
   * era una pregunta de máquina. No decía nada de lo que había adentro
   * y un chico de cinco no tenía cómo contestarla; el nivel, en cambio,
   * dice qué entra («Los de la granja», «Tabla del 7») y en qué orden
   * conviene hacerlos.
   *
   * Cada nivel guarda su propio récord, así que la ficha muestra el
   * mejor puntaje de ese nivel y no el del juego entero.
   */
  /** La clave con la que se anota que un nivel está hecho. */
  function claveDeNivel(materia, juego, nivelId) {
    return materia.id + '/' + juego.id + '#' + nivelId;
  }

  /* El nivel que se elige solo al entrar: el primero que todavía no hizo
     con todas bien. Antes arrancaba siempre en el 1, y el que ya iba por
     la tabla del 7 tenía que bajar la lista cada vez. Si los hizo todos,
     el último. */
  function nivelSugerido(materia, juego, grupo) {
    for (var i = 0; i < grupo.items.length; i++) {
      if (!Almacen.nivelHecho(claveDeNivel(materia, juego, grupo.items[i].id))) return grupo.items[i].id;
    }
    return grupo.items.length ? grupo.items[grupo.items.length - 1].id : null;
  }

  /** Anota como hecho el nivel que se acaba de jugar con todas bien. */
  function marcarNivelHecho(materia, juego) {
    (juego.opciones() || []).forEach(function (g) {
      if (g.esNivel && sel.valores[g.id]) Almacen.marcarNivel(claveDeNivel(materia, juego, sel.valores[g.id]));
    });
  }

  /**
   * Al terminar una partida bien, el botón para pasar al nivel que sigue.
   * Con el 80% bien: el mismo corte con el que se completa una lección.
   */
  function pintarSiguienteNivel(materia, juego, r) {
    var btn = $('btn-siguiente-nivel');
    var otraVez = $('btn-otra-vez');
    btn.hidden = true;
    otraVez.className = 'btn-gigante';
    var grupo = (juego.opciones() || []).filter(function (g) { return g.esNivel; })[0];
    if (!grupo || !r.total || r.aciertos / r.total < 0.8) return;
    var i = -1;
    grupo.items.forEach(function (it, j) { if (it.id === sel.valores[grupo.id]) i = j; });
    if (i < 0 || i >= grupo.items.length - 1) return;
    var siguiente = grupo.items[i + 1];
    btn.textContent = 'Pasar al nivel ' + (siguiente.numero || i + 2) + ': ' + siguiente.nombre;
    btn.onclick = function () {
      Sonido.tocar('clic');
      sel.valores[grupo.id] = siguiente.id;
      irA('#/jugar');
    };
    btn.hidden = false;
    // jugar de nuevo pasa a segundo plano: lo que se recomienda es avanzar
    otraVez.className = 'btn-secundario';
  }

  function bloqueDeNiveles(grupo, numero, juego, materia) {
    var bloque = Util.crear('div', 'bloque-config');
    bloque.appendChild(Util.crear('h2', 'etiqueta-grupo', numero + '. ' + grupo.titulo));

    var caja = Util.crear('div', 'grilla-niveles');
    grupo.items.forEach(function (item, i) {
      var b = Util.crear('button', 'nivel-opcion');
      b.type = 'button';
      b.setAttribute('aria-pressed', sel.valores[grupo.id] === item.id ? 'true' : 'false');
      b.style.setProperty('--op-color', juego.color);
      b.style.setProperty('--op-suave', juego.suave);

      b.appendChild(Util.crear('span', 'nivel-numero', String(item.numero || i + 1)));
      var cuerpo = Util.crear('span', 'nivel-cuerpo');
      cuerpo.appendChild(Util.crear('span', 'nivel-nombre', item.nombre));
      var abajo = [];
      if (item.detalle) abajo.push(item.detalle);
      if (item.cantidad) abajo.push(Util.plural(item.cantidad, 'pregunta'));
      /* El récord se busca con la misma clave con la que se guarda, que
         incluye las otras opciones elegidas (sumas o restas): con sólo el
         nombre del nivel, en «Sumas y restas» no aparecía nunca. */
      var valoresAntes = sel.valores[grupo.id];
      sel.valores[grupo.id] = item.id;
      var mejor = Almacen.record(materia.id + '/' + juego.id + ':' + resumenDePartida(juego)).puntos;
      sel.valores[grupo.id] = valoresAntes;
      if (mejor > 0) abajo.push('Tu récord: ' + mejor);
      if (Almacen.nivelHecho(claveDeNivel(materia, juego, item.id))) {
        b.classList.add('nivel-hecho');
        b.setAttribute('aria-label', 'Nivel ' + (item.numero || i + 1) + ', ' + item.nombre + ', hecho');
        var sello = Util.crear('span', 'nivel-sello');
        sello.appendChild(Iconos.crear('tilde'));
        b.appendChild(sello);
      }
      if (abajo.length) cuerpo.appendChild(Util.crear('span', 'nivel-detalle', abajo.join(' · ')));
      b.appendChild(cuerpo);

      b.addEventListener('click', function () {
        sel.valores[grupo.id] = item.id;
        marcarElegido(caja, b);
        actualizarResumen(juego);
      });
      caja.appendChild(b);
    });

    bloque.appendChild(caja);
    return bloque;
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
        actualizarResumen(juego);
      });
      caja.appendChild(b);
    });

    bloque.appendChild(caja);
    return bloque;
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
    var d = { cantidad: cantidadDelNivel() };
    Object.keys(sel.valores).forEach(function (k) { d[k] = sel.valores[k]; });
    return d;
  }

  /** El nivel elegido, o null si el juego no tiene niveles. */
  function nivelElegido(juego) {
    var elegido = null;
    (juego.opciones() || []).forEach(function (g) {
      if (!g.esNivel) return;
      g.items.forEach(function (it, i) {
        if (it.id === sel.valores[g.id]) elegido = { item: it, numero: it.numero || i + 1 };
      });
    });
    return elegido;
  }

  /* Cuántas preguntas trae el nivel. Los bancos lo dicen (tienen una
     lista finita); los que generan preguntas nuevas cada vez, no, y ahí
     van diez, que es la partida de siempre. */
  function cantidadDelNivel() {
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    if (!juego) return 10;
    var n = nivelElegido(juego);
    return (n && n.item.cantidad) || 10;
  }

  /**
   * Cómo se llama la partida elegida: «Nivel 3 · Tabla del 4». Es lo
   * que se muestra abajo del botón de empezar y, además, la clave con
   * la que se guarda el récord, así que cada nivel tiene el suyo.
   */
  function resumenDePartida(juego) {
    var partes = [];
    (juego.opciones() || []).forEach(function (g) {
      g.items.forEach(function (it, i) {
        if (it.id !== sel.valores[g.id]) return;
        partes.push(g.esNivel ? 'Nivel ' + (it.numero || i + 1) + ' · ' + it.nombre : it.nombre);
      });
    });
    return partes.length ? partes.join(' · ') : juego.resumen(datosSeleccion());
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
      resumenDePartida(juego) + ' · ' + Util.plural(cantidadDelNivel(), 'pregunta') +
      ' · ' + Motor.INTENTOS + ' intentos por pregunta';
  }

  /* ---------------------- jugar ---------------------- */
  function arrancarPartida() {
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    if (!materia || !juego) return irA('#/juegos');
    juego.jugar(datosSeleccion(), { alTerminar: terminarPartida });
  }

  /* ---------------------- el ejercicio de una lección ----------------------

     Unas preguntas de un juego elegidas para lo que explica la lección:
     la de multiplicar termina con la tabla del 2, la de los colores en
     inglés con el nivel de los colores básicos. Se juegan en la pantalla
     de juego de siempre y cuentan como jugadas (errores para repasar,
     monedas, juegos dominados), pero el final no es el de una partida
     sino el de la lección: completada con el 80% bien, o probá de nuevo. */
  var APROBAR_EJERCICIO = 0.8;
  var ejercicioActual = null;
  var resultadoEjercicio = null;

  function arrancarEjercicio(leccion) {
    var ej = leccion.ejercicio;
    var enc = porClave(ej.juego);
    if (!enc.materia || !enc.juego) return irA('#/leccion/' + leccion.id);

    ejercicioActual = leccion;
    sel.materia = enc.materia.id;
    sel.juego = enc.juego.id;
    sel.valores = {};
    (enc.juego.opciones() || []).forEach(function (g) {
      if (g.esNivel) sel.valores[g.id] = ej.nivel || (g.items[0] && g.items[0].id);
      else if (g.porDefecto) sel.valores[g.id] = g.porDefecto;
      else if (g.items[0]) sel.valores[g.id] = g.items[0].id;
    });
    Object.keys(ej.valores || {}).forEach(function (k) { sel.valores[k] = ej.valores[k]; });

    var datos = datosSeleccion();
    datos.cantidad = ej.cantidad || 5;
    leerPreguntas();
    enc.juego.jugar(datos, { alTerminar: terminarEjercicio });
  }

  function terminarEjercicio(r) {
    dejarDeLeerPreguntas();
    var leccion = ejercicioActual;
    ejercicioActual = null;
    if (!leccion) return irA('#/aprender');

    var enc = porClave(leccion.ejercicio.juego);
    var materia = enc.materia, juego = enc.juego;
    var aprobado = r.total > 0 && r.aciertos / r.total >= APROBAR_EJERCICIO;

    Almacen.registrarPartida({
      materia: materia.id, juego: juego.id, tipo: 'leccion',
      detalle: 'Ejercicio de «' + leccion.titulo + '»',
      puntos: r.puntos, maximo: r.maximo,
      aciertos: r.aciertos, total: r.total, estrellas: 0
    });
    Almacen.registrarErrores(materia.id, r.errores.map(function (item) {
      return {
        clave: materia.modulo.claveItem(item),
        nombre: materia.modulo.repaso(item).nombre,
        juego: juego.id
      };
    }));
    var claves = (r.acertados || []).map(function (item) { return materia.modulo.claveItem(item); });
    var premio = calcularMonedas(claves.map(function (clave) { return materia.id + ':' + clave; }));
    Almacen.registrarAciertos(materia.id, claves);
    Almacen.sumarMonedas(premio.total);
    if (r.total >= MINIMO_PARA_DOMINAR && r.aciertos === r.total) {
      Almacen.marcarDominado(materia.id + '/' + juego.id);
    }
    if (r.total && r.aciertos === r.total) marcarNivelHecho(materia, juego);
    // la lección queda completada recién acá, y no al llegar al final
    if (aprobado) {
      Almacen.marcarLeccion(leccion.id);
      // vuelve en una semana, y si la aprueba otra vez, cada vez más lejos
      Almacen.programarLeccion(leccion.id);
    }
    pintarBarraSuperior();

    resultadoEjercicio = {
      leccion: leccion.id, aciertos: r.aciertos, total: r.total,
      aprobado: aprobado, monedas: premio.total
    };
    Sonido.tocar(aprobado ? 'fin' : 'revelar');
    irA('#/leccion/' + leccion.id + '/resultado');
  }

  /* Mientras dura el ejercicio, la voz lee cada consigna. Se escucha el
     cartel de la pregunta en vez de pedirle el texto a cada juego: así
     sirve para los 48 juegos sin tocar ninguno. */
  var observadorDePreguntas = null;
  var esperaDeLectura = null;

  function leerPreguntas() {
    dejarDeLeerPreguntas();
    if (!Voz.hay() || !Almacen.vozActiva() || !window.MutationObserver) return;
    var cartel = $('pregunta-texto');
    observadorDePreguntas = new MutationObserver(function () {
      clearTimeout(esperaDeLectura);
      esperaDeLectura = setTimeout(function () {
        if (cartel.textContent.trim()) Voz.decir(cartel.innerHTML);
      }, 80);
    });
    observadorDePreguntas.observe(cartel, { childList: true, characterData: true, subtree: true });
  }

  function dejarDeLeerPreguntas() {
    clearTimeout(esperaDeLectura);
    if (observadorDePreguntas) observadorDePreguntas.disconnect();
    observadorDePreguntas = null;
  }

  /* ---------------------- resultados ---------------------- */
  function terminarPartida(r) {
    ultimoResultado = r;
    tipoUltimaPartida = 'juego';
    $('btn-cambiar-zona').hidden = false;    // el repaso lo esconde
    var materia = materiaPorId(sel.materia);
    var juego = juegoPorId(materia, sel.juego);
    var sinDominarAntes = sinDominarAhora();

    var proporcion = r.maximo ? r.puntos / r.maximo : 0;
    var estrellas = proporcion >= 0.9 ? 3 : proporcion >= 0.7 ? 2 : proporcion >= 0.4 ? 1 : 0;

    var detalle = resumenDePartida(juego);
    var clave = materia.id + '/' + juego.id + ':' + detalle;
    var esRecord = Almacen.anotar(clave, r.puntos, r.aciertos, r.total);
    if (estrellas > 0) Almacen.sumarEstrellas(estrellas);

    var delDia = Almacen.registrarPartida({
      materia: materia.id, juego: juego.id, detalle: detalle,
      puntos: r.puntos, maximo: r.maximo,
      aciertos: r.aciertos, total: r.total, estrellas: estrellas
    });
    /* Una partida entera sin errores quiere decir que ya se lo sabe.
       Se pide un mínimo de preguntas para que no valga con una sola
       partida de cinco... que es justo el mínimo: con menos de cinco no
       hay partida que pedir. */
    if (r.total >= MINIMO_PARA_DOMINAR && r.aciertos === r.total) {
      Almacen.marcarDominado(materia.id + '/' + juego.id);
    }
    if (r.total && r.aciertos === r.total) marcarNivelHecho(materia, juego);
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

    $('titulo-fin').textContent = tituloSegun(estrellas);
    $('subtitulo-fin').textContent = comentario(r, estrellas);
    $('stat-puntos').textContent = r.puntos;
    $('stat-aciertos').textContent = r.aciertos + '/' + r.total;
    $('stat-precision').textContent = r.precision + '%';
    $('stat-record').textContent = Almacen.record(clave).puntos;

    var listoAhora = pintarListo(sinDominarAntes, materia);
    pintarNivel($('progreso-nivel'), materia, true);
    // si pasó de edad, lo cuenta el cartel grande y el chico no se repite
    if (listoAhora) $('progreso-nivel').hidden = true;
    pintarRepaso(materia, r.errores);
    pintarMetaCumplida(delDia);
    pintarSiguienteNivel(materia, juego, r);
    Sonido.tocar(esRecord && r.puntos > 0 ? 'record' : 'fin');
    irA('#/fin');
  }

  /** Cuántas monedas dejó la partida, y por qué. */
  function pintarPremio(caja, premio) {
    Util.vaciar(caja);
    caja.hidden = premio.total === 0 || !Almacen.control().tienda;
    if (caja.hidden) return;

    var cifra = Util.crear('b', 'premio-cifra', '+' + premio.total + ' ');
    cifra.appendChild(Iconos.crear('moneda'));
    caja.appendChild(cifra);
    var partes = [];
    if (premio.nuevos) partes.push(Util.plural(premio.nuevos, 'nuevo'));
    if (premio.repasados) partes.push(Util.plural(premio.repasados, 'repasado'));
    if (premio.topeAlcanzado) partes.push('tope de la partida');
    if (partes.length) caja.appendChild(Util.crear('span', 'premio-detalle', partes.join(' · ')));
  }

  /**
   * Lo que la partida dejó: los juegos que recién se dominan y, si con
   * eso alcanzó, el aviso de que ya está listo para la edad siguiente.
   * Devuelve si hubo aviso de edad, para no repetir el cartel chico.
   */
  function pintarListo(sinDominarAntes, materia) {
    var caja = $('desbloqueo');
    Util.vaciar(caja);

    var nuevos = sinDominarAntes.filter(function (clave) {
      var enc = porClave(clave);
      return enc.materia && enc.juego && dominado(enc.materia, enc.juego);
    });

    var siguiente = proximoPaso(materia);
    var avance = siguiente ? listoPara(materia, siguiente) : null;
    /* «Listo» sólo si lo logró recién: si ya lo estaba desde antes, el
       cartel aparecería en todas las partidas para siempre. */
    var recienListo = !!(avance && avance.listo && nuevos.length);

    caja.hidden = !nuevos.length;
    if (caja.hidden) return false;

    if (recienListo) {
      caja.appendChild(Util.crear('b', 'desbloqueo-titulo',
        '¡Ya estás listo para los juegos de ' + siguiente + ' años!'));
    }

    nuevos.forEach(function (clave) {
      var enc = porClave(clave);
      var fila = Util.crear('div', 'desbloqueo-item');
      fila.appendChild(Util.crear('span', 'desbloqueo-icono', '🏅'));
      var cuerpo = Util.crear('div');
      cuerpo.appendChild(Util.crear('b', null, '¡Dominaste ' + enc.juego.nombre + '!'));
      cuerpo.appendChild(Util.crear('div', 'ir-dato', 'Una partida con todas bien'));
      fila.appendChild(cuerpo);
      caja.appendChild(fila);
    });

    if (recienListo) {
      var btn = Util.crear('button', 'btn-secundario', 'Ver los de ' + siguiente + ' años');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        Sonido.tocar('clic');
        irA('#/materia/' + materia.id);
      });
      caja.appendChild(btn);
    }
    Sonido.tocar('record');
    return recienListo;
  }

  function tituloSegun(estrellas) {
    return ['Seguí practicando', '¡Bien!', '¡Muy bien!', '¡Excelente!'][estrellas];
  }

  /* Lo que se le dice al terminar habla de qué salió y qué falta, no de
     puntos. Lo que falló ya quedó anotado para el repaso de los próximos
     días, y se lo cuenta: el error tiene un lugar a donde ir. */
  function comentario(r, estrellas) {
    var n = r.errores.length;
    if (!n) return 'Todas bien. Ya podés probar el nivel siguiente.';
    if (n === 1) return 'Te costó una: la tenés abajo, y va a volver a salir en el repaso de mañana.';
    return 'Te costaron ' + n + ': las tenés abajo, y van a volver a salir en el repaso de los próximos días.';
  }

  /**
   * La lista de «para repasar» del final de una partida. `materia` puede
   * ser null: en el repaso y el examen los ítems son de varias materias
   * y cada uno se trae la suya en `__materia`.
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
      /* Una bandera es un rectángulo y se recorta; un dibujo suelto
         (las manzanas de contar) es cuadrado y tiene que entrar entero. */
      if (datos.dibujo) img.className = 'ir-dibujo';
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
    if (!materia || !materia.disponible || materiaOculta(materia) || !materia.modulo.itemDeClave) return null;

    var exigido = materia.modulo.juegoDeClave ? materia.modulo.juegoDeClave(clave) : null;
    var candidatos = exigido
      ? [juegoPorId(materia, exigido)]
      : [juegoPorId(materia, juegoId)].concat(juegosVisibles(materia));

    var elegido = candidatos.filter(function (j) { return !!j; })[0];
    return elegido ? { materia: materia, juego: elegido } : null;
  }

  function pintarTarjetaRepaso() {
    var boton = $('btn-repaso');
    boton.hidden = !Repaso.hayParaRepasar();
    if (boton.hidden) return;
    $('repaso-detalle').textContent = textoRepasoHoy();
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
    $('btn-siguiente-nivel').hidden = true;
    $('btn-otra-vez').className = 'btn-gigante';
    $('meta-cumplida').hidden = true;
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
      if (!m.disponible || materiaOculta(m)) return;
      juegosVisibles(m).forEach(function (j) { lista.push({ materia: m, juego: j }); });
    });
    return lista;
  }

  /**
   * ¿Entró algún juego que se responde sobre el mapa? Sólo ésos hacen
   * falta elegir zona. No alcanza con mirar si el juego es de
   * geografía: los tres de los más chicos (los lugares, dónde se ve,
   * los continentes) son de geografía y no usan el mapa, y pedirles
   * una zona dejaba el botón de Rendir apagado para siempre.
   */
  function hayMapa() {
    return selExamen.juegos.some(function (clave) {
      var enc = porClave(clave);
      return !!(enc.juego && enc.juego.opciones &&
                enc.juego.opciones().some(function (g) { return g.id === 'zona'; }));
    });
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
    if (hayMapa()) {
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
    if (hayMapa() && !selExamen.zona) return 'Elegí la zona del mapa';
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

    var foto = Almacen.foto();
    ponerLaFoto($('perfil-avatar'), 'avatar-foto', foto);
    var emoji = $('perfil-avatar-emoji');
    emoji.hidden = !!foto;
    emoji.textContent = yo.avatar;
    $('btn-sacar-foto').hidden = !foto;
    $('perfil-avatar').setAttribute('aria-label', foto ? 'Cambiar tu foto' : 'Poner una foto tuya');
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
    pintarInterruptorVoz();
    pintarAjusteMeta();
  }

  /* Si el aparato no tiene voz, el interruptor queda apagado y lo dice:
     prenderlo y que no pase nada es peor que no poder prenderlo. */
  function pintarInterruptorVoz() {
    var sw = $('ajuste-voz');
    if (!sw) return;
    var hay = Voz.hay() && Voz.tieneCastellano();
    sw.disabled = !hay;
    sw.setAttribute('aria-checked', hay && Almacen.vozActiva() ? 'true' : 'false');
    $('dato-voz').textContent = hay
      ? 'Las lecciones y las preguntas de sus ejercicios se escuchan.'
      : 'Este aparato no tiene una voz en castellano instalada.';
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
      var carita = Util.crear('span', 'perfil-chip-avatar', p.foto ? '' : p.avatar);
      if (p.foto) {
        var suFoto = Util.crear('img', 'perfil-chip-foto');
        suFoto.src = p.foto;
        suFoto.alt = '';
        carita.appendChild(suFoto);
      }
      b.appendChild(carita);
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
    pintarEleccionMonigote();
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

  /**
   * El monigote del chico: la carita que se ve en «¿Quién juega?», en
   * el perfil y en el cartel del inicio cuando no hay foto puesta.
   *
   * Se elegía en la bienvenida y ahí quedaba: para cambiarlo había que
   * borrar el perfil y hacerlo de nuevo. Es la misma grilla que la de
   * la bienvenida, con los que vengan de fábrica más los comprados en
   * la tienda.
   */
  function pintarEleccionMonigote() {
    var caja = $('eleccion-monigote');
    var yo = Almacen.activo();
    Util.vaciar(caja);
    if (!yo) return;

    avataresDisponibles().forEach(function (a, i) {
      var b = Util.crear('button', 'boton-avatar', a);
      b.type = 'button';
      b.setAttribute('aria-label', 'Monigote ' + (i + 1));
      b.setAttribute('aria-pressed', yo.avatar === a ? 'true' : 'false');
      b.addEventListener('click', function () {
        Almacen.actualizarPerfil(yo.id, { avatar: a });
        Sonido.despertar(); Sonido.tocar('clic');
        caja.querySelectorAll('.boton-avatar').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
        /* El inicio muestra la carita de cada chico: si no se repinta,
           al volver sigue estando la de antes. */
        pintarInicio();
      });
      caja.appendChild(b);
    });

    var foto = Almacen.foto();
    $('nota-monigote').textContent = foto
      ? 'Ahora se ve tu foto. El monigote vuelve si la sacás.'
      : 'Es tu carita en «¿Quién juega?» y en tu perfil.';
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

  /* ---------------------- límites del modo parental ---------------------- */

  var activoAntesDelPanel = null;   // el chico que jugaba antes de entrar al panel
  var pantallaActual = null;
  var RUTAS_CON_TIEMPO = ['jugar', 'ejercicio', 'repasando', 'rindiendo', 'leccion'];
  var TICK_TIEMPO = 30;             // segundos
  var OPCIONES_TIEMPO = [
    { n: 0, nombre: 'Sin límite', detalle: 'Cuando quiera' },
    { n: 15, nombre: '15 minutos', detalle: 'Un ratito' },
    { n: 30, nombre: '30 minutos', detalle: 'Media hora' },
    { n: 45, nombre: '45 minutos', detalle: 'Tres cuartos' },
    { n: 60, nombre: '1 hora', detalle: 'Una hora' }
  ];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function materiaOculta(m) { return !!(m && Almacen.control().ocultas[m.id]); }
  function materiasVisibles() { return MATERIAS.filter(function (m) { return !materiaOculta(m); }); }

  /** La materia de la que es la pantalla pedida, si es de alguna. */
  function materiaDeLaRuta(partes) {
    if (['materia', 'juego', 'lecciones'].indexOf(partes[0]) >= 0) return materiaPorId(partes[1]);
    if (partes[0] === 'jugar') return materiaPorId(sel.materia);
    if ((partes[0] === 'leccion' || partes[0] === 'ejercicio') && window.Lecciones) {
      var l = Lecciones.porId(partes[1]);
      return l ? materiaPorId(l.materia) : null;
    }
    return null;
  }

  function minutosPermitidosHoy() {
    var c = Almacen.control();
    return c.minutos ? c.minutos + c.extra : 0;
  }

  function tiempoAgotado() {
    var permitidos = minutosPermitidosHoy();
    return permitidos > 0 && Almacen.segundosDeHoy() >= permitidos * 60;
  }

  /* Se cuenta el tiempo con la app a la vista y un juego o una lección en
     pantalla: dejarla abierta en el menú no suma. No corta nada a la
     mitad; eso lo decide el ruteo, que no deja empezar otra cosa. */
  function contarTiempo() {
    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      if (pantallaActual !== 'juego' && pantallaActual !== 'leccion') return;
      if (!Almacen.activo()) return;
      Almacen.sumarTiempo(TICK_TIEMPO);
    }, TICK_TIEMPO * 1000);
  }

  function textoDeTiempo(segundos) {
    var min = Math.round(segundos / 60);
    if (min < 60) return Util.plural(min, 'minuto');
    var h = Math.floor(min / 60), resto = min % 60;
    return h + (h === 1 ? ' hora' : ' horas') + (resto ? ' y ' + resto + ' min' : '');
  }

  function pintarDescanso() {
    var yo = Almacen.activo();
    $('descanso-texto').textContent = (yo ? yo.nombre + ', hoy' : 'Hoy') + ' ya jugaste ' +
      textoDeTiempo(Almacen.segundosDeHoy()) + '. Mañana seguimos.';
  }

  /* ---------------------- modo parental ---------------------- */
  function pintarParental() {
    if (!activoAntesDelPanel && Almacen.activo()) activoAntesDelPanel = Almacen.activo().id;
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
    pintarChicosDelPanel(yo);
    var partes = [];
    if (yo && yo.edad) partes.push(yo.edad + ' años');
    partes.push(Util.plural(est.partidas, 'partida') + ' en total');
    if (est.racha > 1) partes.push(est.racha + ' días seguidos jugando');
    $('parental-sub').textContent = (yo ? yo.nombre + ' · ' : '') + partes.join(' · ');

    pintarSemana();
    pintarMateriasDelPanel(est);
    pintarFallosDelPanel();
    pintarJuntos();
    pintarLimites();
    pintarPartidasDelPanel(est);
  }

  /* Con más de un chico, se elige de quién ver y ajustar. Al salir del
     panel vuelve a quedar elegido el que estaba jugando (ver enrutar). */
  function pintarChicosDelPanel(yo) {
    var caja = $('parental-chicos');
    Util.vaciar(caja);
    var todos = Almacen.perfiles();
    caja.hidden = todos.length < 2;
    todos.forEach(function (p) {
      var b = Util.crear('button', 'chico-panel');
      b.type = 'button';
      b.setAttribute('aria-pressed', yo && p.id === yo.id ? 'true' : 'false');
      b.appendChild(Util.crear('span', 'chico-panel-avatar', p.avatar || '🙂'));
      b.appendChild(Util.crear('span', null, p.nombre));
      b.addEventListener('click', function () {
        Sonido.tocar('clic');
        Almacen.usar(p.id);
        abrirParental();
      });
      caja.appendChild(b);
    });
  }

  /** Cuatro números de la semana y las respuestas bien de cada día. */
  function pintarSemana() {
    var dias = Almacen.ultimosDias(7);
    var desde = new Date();
    desde.setHours(0, 0, 0, 0);
    desde.setDate(desde.getDate() - 6);
    var aciertos = 0, total = 0;
    Almacen.historialDesde(desde.getTime()).forEach(function (p) {
      aciertos += p.aciertos;
      total += p.total;
    });
    var jugados = dias.filter(function (d) { return d.aciertos || d.segundos; }).length;
    var bien = dias.reduce(function (s, d) { return s + d.aciertos; }, 0);
    var segundos = dias.reduce(function (s, d) { return s + d.segundos; }, 0);

    var stats = $('parental-stats');
    Util.vaciar(stats);
    [
      [jugados + '/7', 'días jugados'],
      [String(bien), 'respuestas bien'],
      [total ? Math.round(aciertos / total * 100) + '%' : '—', 'de aciertos'],
      [textoDeTiempo(segundos).replace(' minutos', ' min').replace(' minuto', ' min'), 'jugando']
    ].forEach(function (par) {
      var d = Util.crear('div', 'stat');
      d.appendChild(Util.crear('b', null, par[0]));
      d.appendChild(Util.crear('span', null, par[1]));
      stats.appendChild(d);
    });

    var grafico = $('parental-semana');
    Util.vaciar(grafico);
    var maximo = Math.max.apply(null, dias.map(function (d) { return d.aciertos; })) || 1;
    grafico.setAttribute('aria-label', 'Respuestas bien por día: ' + dias.map(function (d) {
      return DIAS[d.fecha.getDay()] + ' ' + d.aciertos;
    }).join(', '));
    dias.forEach(function (d, i) {
      var col = Util.crear('div', 'semana-dia' + (i === dias.length - 1 ? ' hoy' : ''));
      col.appendChild(Util.crear('span', 'semana-cifra', d.aciertos ? String(d.aciertos) : ''));
      var pozo = Util.crear('div', 'semana-pozo');
      var barra = Util.crear('i', 'semana-barra' + (d.aciertos ? '' : ' vacia'));
      barra.style.height = (d.aciertos ? Math.max(6, d.aciertos / maximo * 100) : 0) + '%';
      pozo.appendChild(barra);
      col.appendChild(pozo);
      col.appendChild(Util.crear('span', 'semana-nombre', i === dias.length - 1 ? 'Hoy' : DIAS[d.fecha.getDay()].slice(0, 3)));
      grafico.appendChild(col);
    });
  }

  /** Cómo va en cada materia: precisión, lecciones y juegos dominados. */
  function pintarMateriasDelPanel(est) {
    var caja = $('parental-materias');
    Util.vaciar(caja);
    MATERIAS.filter(function (m) { return m.disponible; }).forEach(function (m) {
      var d = est.porMateria[m.id];
      var pct = d && d.total ? Math.round(d.aciertos / d.total * 100) : 0;
      var lecciones = leccionesDe(m.id);
      var leidas = lecciones.filter(function (l) { return Almacen.leccionVista(l.id); }).length;
      var dominados = m.juegos.filter(function (j) { return dominado(m, j); }).length;

      var fila = Util.crear('div', 'fila-materia');
      fila.appendChild(ponerIcono(Util.crear('span', 'fila-icono'), m.icono));
      var cuerpo = Util.crear('div', 'fila-cuerpo');
      var nombre = Util.crear('div', 'fila-nombre', m.nombre);
      if (materiaOculta(m)) nombre.appendChild(Util.crear('span', 'etiqueta-oculta', 'Oculta'));
      cuerpo.appendChild(nombre);
      var barra = Util.crear('div', 'barra-progreso');
      var relleno = Util.crear('i');
      relleno.style.width = pct + '%';
      relleno.style.background = m.color;
      barra.appendChild(relleno);
      cuerpo.appendChild(barra);
      var detalle = [d ? Util.plural(d.partidas, 'partida') : 'Sin partidas'];
      if (lecciones.length) detalle.push(leidas + '/' + lecciones.length + ' lecciones');
      detalle.push(dominados + '/' + m.juegos.length + ' juegos dominados');
      cuerpo.appendChild(Util.crear('div', 'ir-dato', detalle.join(' · ')));
      fila.appendChild(cuerpo);
      fila.appendChild(Util.crear('span', 'fila-dato', d ? pct + '%' : '—'));
      caja.appendChild(fila);
    });
  }

  function pintarFallosDelPanel() {
    var caja = $('parental-fallos');
    Util.vaciar(caja);
    var lista = Almacen.masFallados(8);
    if (!lista.length) caja.appendChild(Util.crear('p', 'vacio', 'Todavía no hay errores registrados.'));
    lista.forEach(function (f) {
      var materia = materiaPorId(f.materia);
      var item = itemRepaso({
        simbolo: '•',
        nombre: f.nombre,
        dato: (materia ? materia.nombre + ' · ' : '') + 'falló ' + Util.plural(f.veces, 'vez', 'veces')
      });
      // el dibujo de la materia, no su nombre escrito como símbolo
      var simbolo = item.querySelector('.item-simbolo');
      if (simbolo && materia) { simbolo.textContent = ''; ponerIcono(simbolo, materia.icono); }
      caja.appendChild(item);
    });
  }

  /* Las propuestas de «contale a un grande» de las lecciones que completó:
     es la parte social del aprendizaje, y el panel es donde el grande
     las ve. Las tres más nuevas en el orden de las lecciones. */
  function pintarJuntos() {
    var caja = $('parental-juntos');
    Util.vaciar(caja);
    var lista = (window.Lecciones ? Lecciones.LECCIONES : []).filter(function (l) {
      return l.reflexion && l.reflexion.grande && Almacen.leccionVista(l.id) &&
             !materiaOculta(materiaPorId(l.materia));
    }).slice(-3).reverse();
    if (!lista.length) {
      caja.appendChild(Util.crear('p', 'vacio', 'Cuando complete lecciones, acá van a aparecer ideas para hacer juntos lo que aprendió.'));
    }
    lista.forEach(function (l) {
      var idea = Util.crear('div', 'idea-juntos');
      idea.appendChild(Util.crear('b', null, 'Aprendió «' + l.titulo + '»'));
      idea.appendChild(Util.crear('p', null, l.reflexion.grande));
      caja.appendChild(idea);
    });
  }

  function pintarLimites() {
    var c = Almacen.control();

    var tiempo = $('parental-tiempo');
    Util.vaciar(tiempo);
    OPCIONES_TIEMPO.forEach(function (o) {
      var b = botonOpcion(o.n ? String(o.n) : '—', o.nombre, o.detalle, null, null, true);
      b.setAttribute('aria-pressed', o.n === c.minutos ? 'true' : 'false');
      b.addEventListener('click', function () {
        Almacen.setControl({ minutos: o.n });
        marcarElegido(tiempo, b);
        pintarTiempoHoy();
      });
      tiempo.appendChild(b);
    });
    pintarTiempoHoy();

    var materias = $('parental-materias-control');
    Util.vaciar(materias);
    MATERIAS.filter(function (m) { return m.disponible; }).forEach(function (m) {
      var fila = Util.crear('div', 'fila-ajuste');
      fila.appendChild(ponerIcono(Util.crear('span', 'ajuste-icono'), m.icono));
      var cuerpo = Util.crear('div', 'fila-cuerpo');
      cuerpo.appendChild(Util.crear('div', 'fila-nombre', m.nombre));
      var dato = Util.crear('div', 'ir-dato');
      cuerpo.appendChild(dato);
      fila.appendChild(cuerpo);
      var llave = Util.crear('button', 'interruptor');
      llave.type = 'button';
      llave.setAttribute('role', 'switch');
      llave.setAttribute('aria-label', 'Mostrar ' + m.nombre);
      llave.appendChild(Util.crear('span'));
      function pintarLlave() {
        var visible = !materiaOculta(m);
        llave.setAttribute('aria-checked', visible ? 'true' : 'false');
        dato.textContent = visible ? 'Se ve en Jugar y en Aprender' : 'Oculta: no aparece en ningún lado';
      }
      llave.addEventListener('click', function () {
        var ocultas = Object.assign({}, Almacen.control().ocultas);
        if (!ocultas[m.id] && materiasVisibles().length <= 1) {
          return preguntar({
            titulo: 'Tiene que quedar una',
            texto: 'Si se ocultan todas las materias no queda nada para jugar.',
            si: 'Entendido',
            soloAceptar: true
          }, function () {});
        }
        Sonido.tocar('clic');
        if (ocultas[m.id]) delete ocultas[m.id]; else ocultas[m.id] = true;
        Almacen.setControl({ ocultas: ocultas });
        pintarLlave();
        pintarMateriasDelPanel(Almacen.estadisticas());
        pintarJuntos();
      });
      pintarLlave();
      fila.appendChild(llave);
      materias.appendChild(fila);
    });

    $('ajuste-tienda').setAttribute('aria-checked', c.tienda ? 'true' : 'false');
  }

  function pintarTiempoHoy() {
    var c = Almacen.control();
    var texto = 'Hoy lleva ' + textoDeTiempo(Almacen.segundosDeHoy());
    if (c.minutos) {
      texto += ' de ' + textoDeTiempo(minutosPermitidosHoy() * 60) +
        (c.extra ? ' (con ' + c.extra + ' extra)' : '');
    }
    $('parental-tiempo-hoy').textContent = texto + '.';
    $('btn-mas-tiempo').hidden = !c.minutos;
  }

  function pintarPartidasDelPanel(est) {
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
                : p.tipo === 'leccion' ? '🎓'
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

    // al salir del panel, vuelve a quedar elegido el chico que estaba jugando
    if (activoAntesDelPanel && partes[0] !== 'parental') {
      Almacen.usar(activoAntesDelPanel);
      activoAntesDelPanel = null;
    }

    // sin perfil o sin edad, lo primero es la bienvenida
    if (Almacen.necesitaBienvenida() && partes[0] !== 'bienvenida') {
      return irA('#/bienvenida');
    }

    if (partes[0] === 'bienvenida') {
      cortarPartida();
      empezarBienvenida();
      mostrar('bienvenida');
      return pintarFlechaBienvenida();
    }

    /* Sumar otro chico. Es la misma bienvenida que la primera vez, pero
       con la flecha de volver: si fue sin querer, tiene que poder
       arrepentirse. La primera vez no la tiene porque no hay a dónde. */
    if (partes[0] === 'nuevo-jugador') {
      cortarPartida();
      empezarJugadorNuevo();
      mostrar('bienvenida');
      pintarFlechaBienvenida();
      return;
    }

    /* Los límites del modo parental. Una materia oculta no se abre ni
       con el enlace; sin tienda, la tienda lleva a Personalización; con
       el tiempo del día cumplido, no se empieza nada nuevo. */
    if (materiaOculta(materiaDeLaRuta(partes))) return irA('#/');
    if (partes[0] === 'tienda' && !Almacen.control().tienda) return irA('#/personalizacion');
    if (RUTAS_CON_TIEMPO.indexOf(partes[0]) >= 0 && tiempoAgotado()) {
      cortarPartida();
      pintarDescanso();
      return mostrar('descanso');
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
      var estado = null;
      if (partes[2] === 'resultado' && resultadoEjercicio && resultadoEjercicio.leccion === partes[1]) {
        estado = { fase: 'resultado', resultado: resultadoEjercicio };
      } else if (partes[2] === 'ejercicio') {
        estado = { fase: 'ejercicio' };
      }
      var abierta = Leccion.abrir(partes[1], {
        alJugar: function (clave) { irA('#/juego/' + clave); },
        alEjercitar: function (l) { irA('#/ejercicio/' + l.id); },
        alVolver: function (l) { irA('#/lecciones/' + l.materia); },
        nombreDelJuego: function (clave) {
          var enc = porClave(clave);
          return enc.juego ? enc.juego.nombre.toLowerCase() : 'este juego';
        }
      }, estado);
      if (!abierta) return irA('#/aprender');
      return mostrar('leccion');
    }

    /* El ejercicio de una lección se juega en la pantalla de siempre,
       con el motor de siempre: es un juego de verdad, no un cuestionario
       aparte que haya que mantener. */
    if (partes[0] === 'ejercicio' && partes[1]) {
      var deLeccion = window.Lecciones ? Lecciones.porId(partes[1]) : null;
      if (!deLeccion || !deLeccion.ejercicio) return irA('#/aprender');
      cortarPartida();
      mostrar('juego');
      return arrancarEjercicio(deLeccion);
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
      var conTienda = Almacen.control().tienda;
      $('btn-tienda').hidden = !conTienda;
      $('nota-tienda').hidden = !conTienda;
      $('nota-disfraces').hidden = !conTienda;
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
    if (partes[0] === 'bienvenida' || partes[0] === 'nuevo-jugador') return volverEnBienvenida();
    if (partes[0] === 'ejercicio') {
      cortarPartida();
      return irA('#/leccion/' + partes[1] + '/ejercicio');
    }
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

    /* la foto: la piden dos pantallas y el campo de archivo es uno solo */
    $('btn-foto').addEventListener('click', function () { pedirFoto(pintarInicio); });
    $('perfil-avatar').addEventListener('click', function () { pedirFoto(pintarPerfil); });
    $('campo-foto').addEventListener('change', function () {
      var archivo = this.files && this.files[0];
      if (archivo) fotoElegida(archivo);
    });
    $('btn-sacar-foto').addEventListener('click', function () {
      preguntar({
        titulo: '¿Sacamos la foto?',
        texto: 'Vuelve la silueta. Podés volver a poner otra cuando quieras.',
        si: 'Sí, sacarla'
      }, function () {
        Almacen.guardarFoto(null);
        Sonido.tocar('clic');
        pintarPerfil();
      });
    });

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
    $('btn-guardar-copia').addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      guardarCopia();
    });
    $('btn-recuperar-copia').addEventListener('click', function () {
      Sonido.despertar(); Sonido.tocar('clic');
      $('campo-copia').value = '';
      $('campo-copia').click();
    });
    $('campo-copia').addEventListener('change', function () {
      var archivo = this.files && this.files[0];
      if (archivo) copiaElegida(archivo);
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
      irA('#/nuevo-jugador');
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
    $('ajuste-voz').addEventListener('click', function () {
      Almacen.setVoz(!Almacen.vozActiva());
      if (!Almacen.vozActiva()) Voz.parar();
      pintarInterruptorVoz();
      Sonido.despertar(); Sonido.tocar('clic');
    });
    $('btn-leccion-voz').addEventListener('click', function () { Leccion.alternarVoz(); });
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
    $('ajuste-tienda').addEventListener('click', function () {
      Sonido.tocar('clic');
      Almacen.setControl({ tienda: !Almacen.control().tienda });
      pintarLimites();
    });
    $('btn-mas-tiempo').addEventListener('click', function () {
      Sonido.tocar('clic');
      Almacen.darMinutosHoy(15);
      pintarTiempoHoy();
    });
    $('btn-cerrar-parental').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });
    $('btn-descanso-inicio').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/'); });
    $('btn-descanso-grande').addEventListener('click', function () { Sonido.tocar('clic'); irA('#/parental'); });
    contarTiempo();

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
  Arranque.empezar();   // levanta la cortina del nombre y larga el inicio
})();
