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
    return {
      estrellas: 0,
      records: {},
      historial: [],
      errores: {},
      estrellasPorJuego: {},   // para saber qué juegos ya se desbloquearon
      lecciones: {},           // lecciones de la sección Aprender ya leídas
      aciertosPorItem: {},     // cuántas veces acertó cada cosa (rinde menos repetir)
      monedas: 0,              // saldo para gastar en la tienda
      monedasTotales: 0,       // cuántas juntó en total, para el perfil
      comprado: {},            // 'tema:selva' -> true
      equipado: {}             // 'tema' -> 'selva'
    };
  }

  function nuevoId() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* Arranca sin ningún perfil: la primera pantalla que se ve es la
     bienvenida, que pregunta el nombre y la edad. */
  function crearBase() {
    return {
      version: 5,
      perfiles: [],
      activo: null,
      datos: {},
      ajustes: { sonido: true, pin: null }
    };
  }

  /* Las paletas viejas se compraban enteras; ahora los colores se
     compran de a uno, por elemento. Cada paleta tenía exactamente un
     color por ranura, así que la que ya estaba comprada se convierte en
     los cuatro colores sueltos que la formaban. Nadie pierde nada de lo
     que había pagado, y el que tenía una paleta puesta la sigue viendo
     igual. */
  var RANURAS_VIEJAS = ['barra', 'fondo', 'botones', 'letras'];
  var PALETAS_VIEJAS = {
    clasico: 'azul', recreo: 'frutilla', mandarina: 'naranja',
    selva: 'selva', oceano: 'oceano', uva: 'uva', menta: 'menta'
  };

  function pasarAColoresSueltos(base) {
    if (base.version >= 4) return base;

    Object.keys(base.datos || {}).forEach(function (id) {
      var d = base.datos[id];
      if (!d) return;
      d.comprado = d.comprado || {};
      d.equipado = d.equipado || {};

      Object.keys(d.comprado).forEach(function (clave) {
        if (clave.indexOf('tema:') !== 0) return;
        var familia = PALETAS_VIEJAS[clave.slice(5)];
        if (!familia) return;
        RANURAS_VIEJAS.forEach(function (r) {
          d.comprado['color:' + r + ':' + familia] = true;
        });
        delete d.comprado[clave];
      });

      var puesta = PALETAS_VIEJAS[d.equipado.tema];
      if (puesta) {
        RANURAS_VIEJAS.forEach(function (r) { d.equipado['color:' + r] = puesta; });
      }
      delete d.equipado.tema;
    });

    base.version = 4;
    return base;
  }

  /* Los disfraces de la mascota eran ocho dibujados a mano y pasaron a
     ser siete ilustrados. Tres sobrevivieron con el mismo nombre; a los
     otros se les asigna el más parecido, así el que había pagado uno se
     queda con algo equivalente en vez de perderlo. */
  var DISFRACES_VIEJOS = {
    ninguno: 'leon',        // ahora la mascota siempre lleva algo puesto
    conejo: 'zorro',        // los dos son el de orejas de mamífero
    rana: 'dino',           // los dos verdes
    panda: 'pinguino',      // los dos blanco y negro
    unicornio: 'dragon',    // los dos el fantástico con cuernos
    leon: 'leon', dino: 'dino', tiburon: 'tiburon', abeja: 'abeja'
  };

  function pasarADisfracesIlustrados(base) {
    if (base.version >= 5) return base;

    Object.keys(base.datos || {}).forEach(function (id) {
      var d = base.datos[id];
      if (!d) return;
      d.comprado = d.comprado || {};
      d.equipado = d.equipado || {};

      Object.keys(d.comprado).forEach(function (clave) {
        if (clave.indexOf('disfraz:') !== 0) return;
        var nuevo = DISFRACES_VIEJOS[clave.slice(8)];
        delete d.comprado[clave];
        if (nuevo) d.comprado['disfraz:' + nuevo] = true;
      });

      var puesto = DISFRACES_VIEJOS[d.equipado.disfraz];
      if (d.equipado.disfraz) d.equipado.disfraz = puesto || 'leon';
    });

    base.version = 5;
    return base;
  }

  function cargar() {
    try {
      var crudo = localStorage.getItem(CLAVE);
      if (crudo) {
        var leido = JSON.parse(crudo);
        if (leido && leido.perfiles && leido.perfiles.length) {
          return pasarADisfracesIlustrados(pasarAColoresSueltos(leido));
        }
      }
      // primera vez con la versión nueva: se traen los datos de la anterior
      var viejo = localStorage.getItem(CLAVE_VIEJA);
      var base = crearBase();
      if (viejo) {
        // había datos de la versión anterior: se conservan en un perfil,
        // al que la pantalla de bienvenida le va a pedir nombre y edad
        var v = JSON.parse(viejo);
        var id = nuevoId();
        base.perfiles.push({ id: id, nombre: 'Jugador', avatar: AVATARES[0], creado: Date.now() });
        base.activo = id;
        base.datos[id] = perfilVacio();
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
  /* La conversión de paletas a colores sueltos se escribe en el acto: si
     no, se rehace en cada arranque y el chico ve la app cambiar de color
     cada vez que la abre. */
  guardar();

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (error) { /* sin persistencia */ }
  }

  /* Datos del perfil activo. Si todavía no hay ninguno (primera vez) devuelve
     uno de descarte, para que nada explote antes de la bienvenida. */
  var descarte = perfilVacio();
  function mio() {
    if (!datos.activo) return descarte;
    if (!datos.datos[datos.activo]) datos.datos[datos.activo] = perfilVacio();
    return datos.datos[datos.activo];
  }

  /* ---------------------- perfiles ---------------------- */
  function perfiles() { return datos.perfiles.slice(); }

  function activo() {
    for (var i = 0; i < datos.perfiles.length; i++) {
      if (datos.perfiles[i].id === datos.activo) return datos.perfiles[i];
    }
    return datos.perfiles[0] || null;
  }

  /** ¿Hay que mostrar la bienvenida? (sin perfil, o sin edad cargada) */
  function necesitaBienvenida() {
    var yo = activo();
    return !yo || !yo.edad;
  }

  function edad() {
    var yo = activo();
    return yo && yo.edad ? yo.edad : null;
  }

  function usar(id) {
    if (!datos.datos[id]) return false;
    datos.activo = id;
    guardar();
    return true;
  }

  function crearPerfil(nombre, avatar, edadAnios) {
    var id = nuevoId();
    datos.perfiles.push({
      id: id,
      nombre: (nombre || 'Jugador').slice(0, 18),
      avatar: avatar || Util.alAzar(AVATARES),
      edad: edadAnios || null,
      creado: Date.now()
    });
    datos.datos[id] = perfilVacio();
    datos.activo = id;
    guardar();
    return id;
  }

  function actualizarPerfil(id, cambios) {
    datos.perfiles.forEach(function (p) {
      if (p.id !== id) return;
      if (cambios.nombre) p.nombre = cambios.nombre.slice(0, 18);
      if (cambios.avatar) p.avatar = cambios.avatar;
      if (cambios.edad) p.edad = cambios.edad;
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
  /** Estrellas juntadas en un juego concreto, ej. 'matematica/tablas'. */
  function estrellasDeJuego(clave) {
    return mio().estrellasPorJuego[clave] || 0;
  }

  /** Guarda el resumen de una partida terminada. */
  function registrarPartida(p) {
    var yo = mio();
    var clave = p.materia + '/' + p.juego;
    if (!yo.estrellasPorJuego) yo.estrellasPorJuego = {};
    yo.estrellasPorJuego[clave] = (yo.estrellasPorJuego[clave] || 0) + (p.estrellas || 0);

    var h = yo.historial;
    h.push({
      fecha: Date.now(),
      materia: p.materia,
      juego: p.juego,
      // 'examen' o 'repaso'; el modo parental los lista con otro ícono
      tipo: p.tipo || null,
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
      // de qué juego salió, para que Repaso sepa qué tablero armar
      if (item.juego) e[clave].juego = item.juego;
      e[clave].veces++;
    });
    guardar();
  }

  /**
   * Baja el contador de un error porque lo volvió a acertar. No lo borra de
   * una: hacen falta tantos aciertos como fallos para sacarlo de la lista,
   * así que acertar una vez de casualidad no lo da por aprendido.
   */
  function descontarError(materia, clave) {
    var e = mio().errores;
    var k = materia + ':' + clave;
    if (!e[k]) return;
    e[k].veces--;
    if (e[k].veces <= 0) delete e[k];
    guardar();
  }

  /** Cuántas veces ya acertó esta misma cosa. */
  function aciertosDe(clave) {
    return mio().aciertosPorItem[clave] || 0;
  }

  /**
   * Cuánto conviene que esta pregunta vuelva a salir. Cuanto más alto, más
   * seguido aparece en el sorteo de una partida.
   *
   * La idea es simple: lo que falla mucho y acierta poco tiene que volver
   * pronto; lo que ya acierta siempre, de vez en cuando. Nunca cero, para
   * que nada desaparezca del todo.
   */
  function pesoDe(materia, clave) {
    var k = materia + ':' + clave;
    var err = mio().errores[k];
    var fallos = err ? err.veces : 0;
    var aciertos = aciertosDe(k);

    if (!fallos) return aciertos ? 1 : 3;   // nunca lo falló: sabido, o sin ver
    if (!aciertos) return 6;                // lo falló y nunca le salió
    return fallos > aciertos ? 4 : 2;
  }

  /** Suma uno al contador de cada cosa que acertó. */
  function registrarAciertos(materia, claves) {
    var a = mio().aciertosPorItem;
    claves.forEach(function (clave) {
      var k = materia + ':' + clave;
      a[k] = (a[k] || 0) + 1;
    });
    guardar();
  }

  /* ---------------------- monedas ---------------------- */
  function monedas() { return mio().monedas || 0; }
  function monedasTotales() { return mio().monedasTotales || 0; }

  function sumarMonedas(n) {
    if (!n) return monedas();
    mio().monedas = monedas() + n;
    mio().monedasTotales = monedasTotales() + n;
    guardar();
    return mio().monedas;
  }

  /** Descuenta si alcanza; devuelve si se pudo. */
  function gastarMonedas(n) {
    if (monedas() < n) return false;
    mio().monedas = monedas() - n;
    guardar();
    return true;
  }

  /* ---------------------- tienda ---------------------- */
  function tieneComprado(id) {
    return !!(mio().comprado && mio().comprado[id]);
  }

  /** Compra si alcanza la plata y no lo tenía. Devuelve si se pudo. */
  function comprar(id, precio) {
    if (tieneComprado(id)) return true;
    if (!gastarMonedas(precio)) return false;
    if (!mio().comprado) mio().comprado = {};
    mio().comprado[id] = true;
    guardar();
    return true;
  }

  function equipar(tipo, id) {
    if (!mio().equipado) mio().equipado = {};
    mio().equipado[tipo] = id;
    guardar();
  }

  function equipado(tipo) {
    return (mio().equipado && mio().equipado[tipo]) || null;
  }

  /** Lo que más se falla, de mayor a menor. */
  function masFallados(cuantos, materia) {
    var e = mio().errores;
    return Object.keys(e)
      .map(function (k) {
        // la clave del ítem va en el nombre de la propiedad ('geografia:AR');
        // se devuelve suelta para que Repaso pueda rearmar la pregunta
        var x = e[k];
        return Object.assign({ clave: k.slice(k.indexOf(':') + 1) }, x);
      })
      .filter(function (x) { return !materia || x.materia === materia; })
      .sort(function (a, b) { return b.veces - a.veces; })
      .slice(0, cuantos || 8);
  }

  /** Cuántas cosas distintas tiene pendientes de repasar. */
  function cuantosErrores() {
    return Object.keys(mio().errores).length;
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

  /* ---------------------- lecciones de la sección Aprender ---------------------- */
  function marcarLeccion(id) {
    if (!mio().lecciones) mio().lecciones = {};
    mio().lecciones[id] = Date.now();
    guardar();
  }

  function leccionVista(id) {
    return !!(mio().lecciones && mio().lecciones[id]);
  }

  function cuantasLecciones() {
    return mio().lecciones ? Object.keys(mio().lecciones).length : 0;
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
    actualizarPerfil: actualizarPerfil, borrarPerfil: borrarPerfil,
    necesitaBienvenida: necesitaBienvenida, edad: edad,
    record: record, anotar: anotar, estrellas: estrellas, sumarEstrellas: sumarEstrellas,
    mejorDeJuego: mejorDeJuego,
    registrarPartida: registrarPartida, registrarErrores: registrarErrores,
    descontarError: descontarError, cuantosErrores: cuantosErrores,
    estrellasDeJuego: estrellasDeJuego,
    aciertosDe: aciertosDe, registrarAciertos: registrarAciertos, pesoDe: pesoDe,
    monedas: monedas, monedasTotales: monedasTotales,
    sumarMonedas: sumarMonedas, gastarMonedas: gastarMonedas,
    comprar: comprar, tieneComprado: tieneComprado,
    equipar: equipar, equipado: equipado,
    marcarLeccion: marcarLeccion, leccionVista: leccionVista, cuantasLecciones: cuantasLecciones,
    masFallados: masFallados, estadisticas: estadisticas, borrarProgreso: borrarProgreso,
    sonidoActivo: sonidoActivo, setSonido: setSonido,
    hayPin: hayPin, pinCorrecto: pinCorrecto, setPin: setPin
  };
})();
