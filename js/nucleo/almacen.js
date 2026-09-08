/* ============================================================
   Guarda todo en el navegador (localStorage), separado por perfil:
   récords, estrellas, historial de partidas y cuántas veces se falló
   cada cosa. De ahí salen las estadísticas y el modo parental.

   Si el navegador bloquea el almacenamiento, la app sigue andando:
   los datos viven en memoria hasta que se cierre la pestaña.
   ============================================================ */
window.Almacen = (function () {
  'use strict';

  var CLAVE = 'aprenderJugando.v2';
  var CLAVE_VIEJA = 'aprenderJugando.v1';
  var TOPE_HISTORIAL = 300;          // partidas guardadas por perfil

  var AVATARES = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🦄', '🐙', '🐧', '🦖', '🐝', '🦉'];

  var datos = null;

  /* ---------------------- carga y guardado ---------------------- */
  function perfilVacio() {
    return { estrellas: 0, records: {}, historial: [], errores: {} };
  }

  function nuevoId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function crearBase() {
    var id = nuevoId();
    return {
      version: 2,
      perfiles: [{ id: id, nombre: 'Jugador', avatar: AVATARES[0], creado: Date.now() }],
      activo: id,
      datos: (function () { var d = {}; d[id] = perfilVacio(); return d; })(),
      ajustes: { sonido: true, pin: null }
    };
  }

  function cargar() {
    try {
      var crudo = localStorage.getItem(CLAVE);
      if (crudo) {
        var leido = JSON.parse(crudo);
        if (leido && leido.perfiles && leido.perfiles.length) return leido;
      }
      // primera vez con la versión nueva: se traen los datos de la anterior
      var viejo = localStorage.getItem(CLAVE_VIEJA);
      var base = crearBase();
      if (viejo) {
        var v = JSON.parse(viejo);
        var id = base.activo;
        base.datos[id].records = v.records || {};
        base.datos[id].estrellas = v.estrellas || 0;
        base.ajustes.sonido = v.sonido !== false;
      }
      return base;
    } catch (error) {
      return crearBase();
    }
  }

  datos = cargar();

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (error) { /* sin persistencia */ }
  }

  function mio() {
    if (!datos.datos[datos.activo]) datos.datos[datos.activo] = perfilVacio();
    return datos.datos[datos.activo];
  }

  /* ---------------------- perfiles ---------------------- */
  function perfiles() { return datos.perfiles.slice(); }

  function activo() {
    for (var i = 0; i < datos.perfiles.length; i++) {
      if (datos.perfiles[i].id === datos.activo) return datos.perfiles[i];
    }
    return datos.perfiles[0];
  }

  function usar(id) {
    if (!datos.datos[id]) return false;
    datos.activo = id;
    guardar();
    return true;
  }

  function crearPerfil(nombre, avatar) {
    var id = nuevoId();
    datos.perfiles.push({
      id: id,
      nombre: (nombre || 'Jugador').slice(0, 18),
      avatar: avatar || Util.alAzar(AVATARES),
      creado: Date.now()
    });
    datos.datos[id] = perfilVacio();
    datos.activo = id;
    guardar();
    return id;
  }

  function renombrar(id, nombre, avatar) {
    datos.perfiles.forEach(function (p) {
      if (p.id !== id) return;
      if (nombre) p.nombre = nombre.slice(0, 18);
      if (avatar) p.avatar = avatar;
    });
    guardar();
  }

  function borrarPerfil(id) {
    if (datos.perfiles.length <= 1) return false;      // siempre queda uno
    datos.perfiles = datos.perfiles.filter(function (p) { return p.id !== id; });
    delete datos.datos[id];
    if (datos.activo === id) datos.activo = datos.perfiles[0].id;
    guardar();
    return true;
  }

  /* ---------------------- récords y estrellas ---------------------- */
  function record(clave) {
    return mio().records[clave] || { puntos: 0, aciertos: 0, total: 0, partidas: 0 };
  }

  function anotar(clave, puntos, aciertos, total) {
    var previo = record(clave);
    var esRecord = puntos > previo.puntos;
    mio().records[clave] = {
      puntos: Math.max(puntos, previo.puntos),
      aciertos: esRecord ? aciertos : previo.aciertos,
      total: esRecord ? total : previo.total,
      partidas: previo.partidas + 1
    };
    guardar();
    return esRecord;
  }

  function estrellas() { return mio().estrellas; }

  function sumarEstrellas(n) {
    mio().estrellas += n;
    guardar();
    return mio().estrellas;
  }

  function mejorDeJuego(juegoId) {
    var mejor = 0;
    var r = mio().records;
    Object.keys(r).forEach(function (k) {
      if (k.indexOf(juegoId + ':') === 0) mejor = Math.max(mejor, r[k].puntos);
    });
    return mejor;
  }

  /* ---------------------- historial y errores ---------------------- */
  /** Guarda el resumen de una partida terminada. */
  function registrarPartida(p) {
    var h = mio().historial;
    h.push({
      fecha: Date.now(),
      materia: p.materia,
      juego: p.juego,
      detalle: p.detalle || '',
      puntos: p.puntos,
      maximo: p.maximo,
      aciertos: p.aciertos,
      total: p.total,
      estrellas: p.estrellas
    });
    if (h.length > TOPE_HISTORIAL) h.splice(0, h.length - TOPE_HISTORIAL);
    guardar();
  }

  /** Suma uno al contador de cada cosa que se falló. */
  function registrarErrores(materia, lista) {
    var e = mio().errores;
    lista.forEach(function (item) {
      var clave = materia + ':' + item.clave;
      if (!e[clave]) e[clave] = { materia: materia, nombre: item.nombre, veces: 0 };
      e[clave].nombre = item.nombre;
      e[clave].veces++;
    });
    guardar();
  }

  /** Lo que más se falla, de mayor a menor. */
  function masFallados(cuantos, materia) {
    var e = mio().errores;
    return Object.keys(e)
      .map(function (k) { return e[k]; })
      .filter(function (x) { return !materia || x.materia === materia; })
      .sort(function (a, b) { return b.veces - a.veces; })
      .slice(0, cuantos || 8);
  }

  /** Días seguidos jugando, contando hasta hoy. */
  function racha() {
    var h = mio().historial;
    if (!h.length) return 0;
    var dias = {};
    h.forEach(function (p) { dias[new Date(p.fecha).toDateString()] = true; });
    var cuenta = 0;
    var cursor = new Date();
    while (dias[cursor.toDateString()]) {
      cuenta++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return cuenta;
  }

  function estadisticas() {
    var h = mio().historial;
    var total = 0, aciertos = 0, puntos = 0;
    var porMateria = {};

    h.forEach(function (p) {
      total += p.total;
      aciertos += p.aciertos;
      puntos += p.puntos;
      if (!porMateria[p.materia]) porMateria[p.materia] = { partidas: 0, aciertos: 0, total: 0 };
      var m = porMateria[p.materia];
      m.partidas++;
      m.aciertos += p.aciertos;
      m.total += p.total;
    });

    return {
      partidas: h.length,
      preguntas: total,
      aciertos: aciertos,
      puntos: puntos,
      precision: total ? Math.round(aciertos / total * 100) : 0,
      estrellas: mio().estrellas,
      racha: racha(),
      porMateria: porMateria,
      ultimas: h.slice(-12).reverse()
    };
  }

  function borrarProgreso() {
    datos.datos[datos.activo] = perfilVacio();
    guardar();
  }

  /* ---------------------- ajustes ---------------------- */
  function sonidoActivo() { return datos.ajustes.sonido !== false; }
  function setSonido(v) { datos.ajustes.sonido = !!v; guardar(); }

  function hayPin() { return !!datos.ajustes.pin; }
  function pinCorrecto(pin) { return datos.ajustes.pin === String(pin); }
  function setPin(pin) {
    datos.ajustes.pin = pin ? String(pin) : null;
    guardar();
  }

  return {
    AVATARES: AVATARES,
    perfiles: perfiles, activo: activo, usar: usar, crearPerfil: crearPerfil,
    renombrar: renombrar, borrarPerfil: borrarPerfil,
    record: record, anotar: anotar, estrellas: estrellas, sumarEstrellas: sumarEstrellas,
    mejorDeJuego: mejorDeJuego,
    registrarPartida: registrarPartida, registrarErrores: registrarErrores,
    masFallados: masFallados, estadisticas: estadisticas, borrarProgreso: borrarProgreso,
    sonidoActivo: sonidoActivo, setSonido: setSonido,
    hayPin: hayPin, pinCorrecto: pinCorrecto, setPin: setPin
  };
})();
