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
      equipado: {},            // 'tema' -> 'selva'
      dominados: {},           // 'matematica/tablas' -> true: lo ganó sin errores
      nivelesHechos: {},       // 'matematica/tablas#7' -> true: ese nivel, con todas bien
      mapas: {},               // 'matematica/tablas' -> { '3': 2 }: estrellas de cada nivel del camino
      cajas: {},               // 'matematica:7x8' -> { caja, proximo }: cuándo vuelve a salir
      repasoLecciones: {},     // 'que-es-multiplicar' -> { dias, proximo }: cuándo repasarla
      dias: {},                // '2026-09-13' -> respuestas bien ese día
      meta: 10,                // respuestas bien por día que pide la meta; 0 es sin meta
      metaCobrada: null,       // el día en que se pagó el premio de la meta
      mejorRacha: 0,
      tiempo: {},              // '2026-09-13' -> segundos jugando o en lecciones
      control: {}              // lo que decide el grande: { minutos, ocultas, tienda, extra }
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

  /* Devuelve si pudo guardar. Casi nadie mira la respuesta, pero la foto
     del jugador sí: es lo único que puede no entrar en localStorage, y
     guardar en silencio una foto que no se guardó es peor que avisar. */
  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
      return true;
    } catch (error) {
      return false;                                 // sin persistencia, o lleno
    }
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

  /* `genero` es 'nene', 'nena' o null (no se sabe o no se quiso decir).
     Sirve sólo para escribirle «listo» o «lista». */
  function crearPerfil(nombre, avatar, edadAnios, genero) {
    var id = nuevoId();
    datos.perfiles.push({
      id: id,
      nombre: (nombre || 'Jugador').slice(0, 18),
      avatar: avatar || Util.alAzar(AVATARES),
      edad: edadAnios || null,
      genero: genero || null,
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
      if ('genero' in cambios) p.genero = cambios.genero || null;
    });
    guardar();
  }

  /* ---------------------- la foto del jugador ----------------------

     Va en la ficha del perfil y no en sus datos de juego porque la
     pantalla de inicio muestra la carita de cada hermano sin abrir los
     datos de ninguno. Es un texto (data URL) de unos 15 KB; la prepara
     js/nucleo/foto.js y nunca sale del aparato. */
  function foto(id) {
    var p = id ? perfilPorId(id) : activo();
    return (p && p.foto) || null;
  }

  function perfilPorId(id) {
    for (var i = 0; i < datos.perfiles.length; i++) {
      if (datos.perfiles[i].id === id) return datos.perfiles[i];
    }
    return null;
  }

  /** Pone o saca la foto del jugador activo. Devuelve si se pudo guardar. */
  function guardarFoto(dataUrl) {
    var p = activo();
    if (!p) return false;
    var antes = p.foto || null;
    if (dataUrl) p.foto = dataUrl;
    else delete p.foto;
    if (guardar()) return true;
    /* No entró: se deja el perfil como estaba, si no queda una foto
       puesta en la pantalla que al recargar no va a estar. */
    if (antes) p.foto = antes; else delete p.foto;
    guardar();
    return false;
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
      estrellas: p.estrellas,
      segundos: p.segundos || 0      // cuánto duró, para las estadísticas del panel
    });
    if (h.length > TOPE_HISTORIAL) h.splice(0, h.length - TOPE_HISTORIAL);

    // el día: cuántas respuestas bien, para la racha y para la meta
    if (!yo.dias) yo.dias = {};
    var hoy = claveDia(new Date());
    yo.dias[hoy] = (yo.dias[hoy] || 0) + (p.aciertos || 0);
    var llaves = Object.keys(yo.dias).sort();
    if (llaves.length > 400) llaves.slice(0, llaves.length - 400).forEach(function (k) { delete yo.dias[k]; });

    /* El premio de la meta se paga una sola vez por día, en la partida
       que la cruza. Sirve cualquier partida: juego, examen, repaso o el
       ejercicio de una lección. */
    var meta = metaDiaria();
    var cumplidaAhora = meta > 0 && yo.dias[hoy] >= meta && yo.metaCobrada !== hoy;
    if (cumplidaAhora) {
      yo.metaCobrada = hoy;
      yo.monedas = (yo.monedas || 0) + PREMIO_META;
      yo.monedasTotales = (yo.monedasTotales || 0) + PREMIO_META;
    }
    var r = racha();
    if (r > (yo.mejorRacha || 0)) yo.mejorRacha = r;
    guardar();
    return { metaCumplida: cumplidaAhora, premio: cumplidaAhora ? PREMIO_META : 0, racha: r };
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
      ponerEnCaja(clave, 0);
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

    // nunca lo falló: sabido (salvo que ya le toque volver a verlo), o sin ver
    if (!fallos) return aciertos ? (estaVencido(k) ? 5 : 1) : 3;
    if (!aciertos) return 6;                // lo falló y nunca le salió
    return fallos > aciertos ? 4 : 2;
  }

  /* ---------------------- repaso espaciado ----------------------

     Aprender algo una vez no alcanza: se olvida si no vuelve a aparecer,
     y vuelve mejor si vuelve espaciado (Wouters et al. 2013). Cada cosa
     que el chico contesta está en una «caja»: cada acierto la sube y la
     aleja (vuelve en 1, 3, 7 y 14 días); cada fallo la baja a la primera
     (vuelve mañana).

     Antes el sorteo sólo miraba cuántas veces se falló o acertó algo, no
     cuándo: lo acertado quedaba con el peso más bajo para siempre y lo
     aprendido nunca volvía a salir a propósito. */
  var INTERVALOS = [1, 3, 7, 14];

  function diaDentroDe(dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    return claveDia(d);
  }

  function cajas() {
    var yo = mio();
    if (!yo.cajas) yo.cajas = {};
    return yo.cajas;
  }

  /** Lo fallado vuelve a la caja de abajo: sale de nuevo mañana. */
  function ponerEnCaja(k, caja) {
    cajas()[k] = { caja: caja, proximo: diaDentroDe(1) };
  }

  /** Lo acertado sube de caja y se aleja: 1, 3, 7 y 14 días. */
  function subirDeCaja(k) {
    var actual = cajas()[k];
    // acertarlo diez veces la misma tarde no lo manda a dentro de dos
    // semanas: sólo sube cuando ya le tocaba volver a verlo
    if (actual && actual.proximo > claveDia(new Date())) return;
    var caja = Math.min(INTERVALOS.length, (actual ? actual.caja : 0) + 1);
    cajas()[k] = { caja: caja, proximo: diaDentroDe(INTERVALOS[caja - 1]) };
  }

  function estaVencido(k) {
    var c = cajas()[k];
    return !!(c && c.proximo <= claveDia(new Date()));
  }

  /**
   * Lo que ya sabía y hoy le toca volver a ver, del más atrasado al
   * menos. Lo que está en la lista de errores no entra: eso ya lo junta
   * el repaso de siempre.
   */
  function vencidos(cuantos) {
    var e = mio().errores;
    var hoy = claveDia(new Date());
    var todas = cajas();
    return Object.keys(todas)
      .filter(function (k) { return todas[k].proximo <= hoy && !e[k]; })
      .sort(function (a, b) { return todas[a].proximo < todas[b].proximo ? -1 : 1; })
      .slice(0, cuantos || 1000)
      .map(function (k) {
        var p = k.indexOf(':');
        return { materia: k.slice(0, p), clave: k.slice(p + 1), juego: null, veces: 1, vencido: true };
      });
  }

  function cuantosVencidos() { return vencidos().length; }

  /* Una lección completada vuelve a la semana; si se la aprueba otra vez,
     al doble de tiempo, hasta un mes. */
  function programarLeccion(id) {
    var yo = mio();
    if (!yo.repasoLecciones) yo.repasoLecciones = {};
    var antes = yo.repasoLecciones[id];
    var dias = antes ? Math.min(30, antes.dias * 2) : 7;
    yo.repasoLecciones[id] = { dias: dias, proximo: diaDentroDe(dias) };
    guardar();
  }

  function leccionesParaRepasar() {
    var r = mio().repasoLecciones || {};
    var hoy = claveDia(new Date());
    return Object.keys(r).filter(function (id) { return r[id].proximo <= hoy; });
  }

  /** Suma uno al contador de cada cosa que acertó. */
  function registrarAciertos(materia, claves) {
    var a = mio().aciertosPorItem;
    claves.forEach(function (clave) {
      var k = materia + ':' + clave;
      a[k] = (a[k] || 0) + 1;
      subirDeCaja(k);
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

  /* ---------------------- niveles por materia ----------------------
     Cada materia arranca con los juegos de la edad del chico. Juntando
     puntos en esa materia se abren los de la edad siguiente, de a una.
     Acá sólo se guarda: la cuenta de cuántos puntos hacen falta y cuál
     es la edad siguiente la hace app.js, que es quien conoce los juegos.

     `niveles` guarda la edad abierta sólo si se ganó jugando, no la edad
     del chico: si un papá corrige la edad de 9 a 7, el chico vuelve a ver
     los juegos de 7, salvo que haya abierto otros jugando. */
  /* ---------------------- juegos dominados ----------------------

     Un juego está dominado cuando el chico terminó alguna partida con
     todas las respuestas bien: el 100% de precisión, que es el número
     que ya le muestra la pantalla de resultados. Es lo que la pantalla
     de una materia usa para decirle cuándo está listo para los juegos
     de la edad siguiente.

     Acá vivían `niveles` y `progresoNivel`, del sistema viejo: los
     juegos de la edad siguiente estaban cerrados hasta juntar 100
     puntos en la materia. Ya no se traba nada, así que se fueron. Los
     perfiles viejos siguen teniendo esos dos campos guardados y no
     molestan a nadie. */
  function dominado(clave) {
    var d = mio().dominados;
    return !!(d && d[clave]);
  }

  /** Marca un juego como dominado. Devuelve si es la primera vez. */
  function marcarDominado(clave) {
    var yo = mio();
    if (!yo.dominados) yo.dominados = {};
    if (yo.dominados[clave]) return false;
    yo.dominados[clave] = true;
    guardar();
    return true;
  }

  /* Un nivel está hecho cuando se lo terminó con todas bien. Va aparte de
     los récords porque el récord guarda la partida con más puntos, y una
     partida con todas bien pero con segundos intentos puede tener menos
     puntos que otra con un error. */
  function nivelHecho(clave) {
    var d = mio().nivelesHechos;
    return !!(d && d[clave]);
  }

  function marcarNivel(clave) {
    var yo = mio();
    if (!yo.nivelesHechos) yo.nivelesHechos = {};
    yo.nivelesHechos[clave] = true;
    guardar();
  }

  /** Cuántos juegos domina, para el perfil. */
  function cuantosDominados() {
    var d = mio().dominados;
    return d ? Object.keys(d).length : 0;
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

  /* Devuelve las monedas de lo que se sacó de la tienda, a todos los
     chicos del aparato, y lo borra de sus compras. Se llama al arrancar:
     la segunda vez ya no encuentra nada que devolver. Se usó cuando se
     sacaron los monigotes (septiembre de 2026): un chico que había
     juntado 90 monedas para el mago no tenía por qué perderlas.
     `precioDe(clave)` dice cuánto había costado cada cosa. */
  function devolverCompras(prefijo, precioDe) {
    var devuelto = 0;
    Object.keys(datos.datos).forEach(function (id) {
      var d = datos.datos[id];
      if (!d || !d.comprado) return;
      Object.keys(d.comprado).forEach(function (clave) {
        if (clave.indexOf(prefijo) !== 0) return;
        var precio = precioDe(clave) || 0;
        d.monedas = (d.monedas || 0) + precio;
        devuelto += precio;
        delete d.comprado[clave];
      });
    });
    if (devuelto) guardar();
    return devuelto;
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
  /* ---------------------- racha y meta del día ----------------------

     La racha se contaba mirando las fechas del historial, que guarda las
     últimas 300 partidas: un chico que juega mucho perdía los días viejos
     de la cuenta. Ahora cada día jugado queda anotado aparte (`dias`), con
     cuántas respuestas bien dio ese día, que es también lo que mide la
     meta. Las fechas del historial se siguen sumando, para los perfiles
     que ya jugaban antes de que existiera `dias`. */
  var PREMIO_META = 5;

  function claveDia(fecha) {
    function dos(n) { return (n < 10 ? '0' : '') + n; }
    return fecha.getFullYear() + '-' + dos(fecha.getMonth() + 1) + '-' + dos(fecha.getDate());
  }

  function diasJugados() {
    var yo = mio();
    var dias = {};
    Object.keys(yo.dias || {}).forEach(function (d) { dias[d] = true; });
    yo.historial.forEach(function (p) { dias[claveDia(new Date(p.fecha))] = true; });
    return dias;
  }

  /* Si hoy todavía no jugó, la racha se cuenta desde ayer: a la mañana
     tiene que ver su racha de 3 días, no un 0 que parece que la perdió. */
  function racha() {
    var dias = diasJugados();
    var cursor = new Date();
    if (!dias[claveDia(cursor)]) cursor.setDate(cursor.getDate() - 1);
    var cuenta = 0;
    while (dias[claveDia(cursor)]) {
      cuenta++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return cuenta;
  }

  function jugoHoy() { return !!diasJugados()[claveDia(new Date())]; }

  function mejorRacha() { return Math.max(mio().mejorRacha || 0, racha()); }

  function aciertosDeHoy() {
    var d = mio().dias;
    return (d && d[claveDia(new Date())]) || 0;
  }

  function metaDiaria() {
    var m = mio().meta;
    return typeof m === 'number' ? m : 10;
  }

  function setMeta(n) {
    mio().meta = Math.max(0, n | 0);
    guardar();
  }

  function metaCumplidaHoy() {
    var meta = metaDiaria();
    return meta > 0 && aciertosDeHoy() >= meta;
  }

  /* ---------------------- control parental ----------------------

     Es de cada chico: un hermano de 5 y otro de 11 no necesitan el mismo
     tiempo ni las mismas materias. Los minutos extra valen sólo el día
     en que se dieron. */
  function control() {
    var c = mio().control || {};
    return {
      minutos: typeof c.minutos === 'number' ? c.minutos : 0,
      ocultas: c.ocultas || {},
      tienda: c.tienda !== false,
      extra: c.extra && c.extra.dia === claveDia(new Date()) ? c.extra.minutos : 0
    };
  }

  function setControl(cambios) {
    var yo = mio();
    if (!yo.control) yo.control = {};
    Object.keys(cambios).forEach(function (k) { yo.control[k] = cambios[k]; });
    guardar();
  }

  function darMinutosHoy(n) {
    setControl({ extra: { dia: claveDia(new Date()), minutos: control().extra + n } });
  }

  /** Suma tiempo al día de hoy. Se guardan los últimos 60 días. */
  function sumarTiempo(segundos) {
    var yo = mio();
    if (!yo.tiempo) yo.tiempo = {};
    var hoy = claveDia(new Date());
    yo.tiempo[hoy] = (yo.tiempo[hoy] || 0) + segundos;
    var llaves = Object.keys(yo.tiempo).sort();
    if (llaves.length > 60) llaves.slice(0, llaves.length - 60).forEach(function (k) { delete yo.tiempo[k]; });
    guardar();
  }

  function segundosDeHoy() {
    var t = mio().tiempo;
    return (t && t[claveDia(new Date())]) || 0;
  }

  /** Los últimos `n` días, del más viejo a hoy: respuestas bien y tiempo. */
  function ultimosDias(n) {
    var yo = mio();
    var lista = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var k = claveDia(d);
      lista.push({
        fecha: d,
        aciertos: (yo.dias && yo.dias[k]) || 0,
        segundos: (yo.tiempo && yo.tiempo[k]) || 0
      });
    }
    return lista;
  }

  function historialDesde(ms) {
    return mio().historial.filter(function (p) { return p.fecha >= ms; });
  }

  /* ---------------------- para las estadísticas del panel ---------------------- */

  /** Las últimas partidas (hasta 300), de la más vieja a la más nueva. */
  function historial() { return mio().historial.slice(); }

  /** Segundos jugados en total, en los días que se guardan (los últimos 60). */
  function tiempoTotal() {
    var t = mio().tiempo || {};
    return Object.keys(t).reduce(function (s, k) { return s + t[k]; }, 0);
  }

  /** Lo que más veces contestó bien: [{ materia, clave, veces }]. */
  function masAcertados(cuantos) {
    var a = mio().aciertosPorItem || {};
    return Object.keys(a).map(function (k) {
      var p = k.indexOf(':');
      return { materia: k.slice(0, p), clave: k.slice(p + 1), veces: a[k] };
    }).sort(function (x, y) { return y.veces - x.veces; }).slice(0, cuantos || 8);
  }

  /**
   * Qué tan firme tiene lo que contestó alguna vez, según las cajas del
   * repaso espaciado: en la 0 y la 1 lo está aprendiendo (lo falló hace
   * poco, o lo acertó una vez), en la 2 y la 3 lo está afianzando, y en
   * la última ya lo sabe (vuelve recién a las dos semanas).
   */
  function resumenDeMemoria() {
    var c = mio().cajas || {};
    var hoy = claveDia(new Date());
    var r = { aprendiendo: 0, afianzando: 0, sabidas: 0, paraHoy: 0 };
    Object.keys(c).forEach(function (k) {
      var x = c[k];
      if (x.caja <= 1) r.aprendiendo++;
      else if (x.caja < INTERVALOS.length) r.afianzando++;
      else r.sabidas++;
      if (x.proximo <= hoy) r.paraHoy++;
    });
    return r;
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

  /* ---------------------- la copia ----------------------

     Todo lo que la app sabe vive en el navegador de este aparato. Si se
     borran los datos del navegador, o se cambia de celular, se pierde
     todo: años de partidas, las monedas, lo comprado, las fotos. La copia
     es un archivo con todo eso adentro, que se guarda donde se quiera y
     se recupera en cualquier aparato.

     El PIN del modo parental no viaja en la copia: el archivo lo puede
     abrir cualquiera, y un PIN escrito ahí adentro dejaría de servir. */
  function exportar() {
    var copia = JSON.parse(JSON.stringify(datos));
    if (copia.ajustes) {
      copia.ajustes.pin = null;
      /* El plan tampoco: es de este aparato. Si viajara, una copia de un
         celular con la suscripción paga la activaría en cualquier otro. */
      delete copia.ajustes.plan;
    }
    return JSON.stringify({
      app: 'aprender-jugando',
      guardada: new Date().toISOString(),
      datos: copia
    });
  }

  /** Lee un archivo de copia. Devuelve los datos si sirve, o null. */
  function leerCopia(texto) {
    try {
      var leido = JSON.parse(texto);
      var d = leido && leido.app === 'aprender-jugando' ? leido.datos : null;
      if (!d || !Array.isArray(d.perfiles) || !d.perfiles.length) return null;
      if (!d.datos || typeof d.datos !== 'object') return null;
      return d;
    } catch (e) {
      return null;
    }
  }

  /** Reemplaza todo lo guardado por una copia. Hay que recargar después. */
  function restaurar(d) {
    var pinDeAhora = datos.ajustes && datos.ajustes.pin;
    if (!d.ajustes) d.ajustes = {};
    // el PIN que ya había en este aparato se queda: la copia no trae ninguno
    if (!d.ajustes.pin && pinDeAhora) d.ajustes.pin = pinDeAhora;
    // y el plan también es el de este aparato, venga lo que venga en la copia
    if (datos.ajustes && datos.ajustes.plan) d.ajustes.plan = datos.ajustes.plan;
    else delete d.ajustes.plan;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(d));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* Borra TODO lo de la app en este aparato: los chicos, sus partidas,
     sus fotos, los ajustes y el PIN. Es lo que pide la política de
     privacidad (que un adulto pueda borrar los datos del chico cuando
     quiera) y lo que hace falta para darle el aparato a otra familia.
     Después hay que recargar: lo que está en memoria es lo de antes. */
  function borrarTodo() {
    try {
      localStorage.removeItem(CLAVE);
      localStorage.removeItem(CLAVE_VIEJA);
    } catch (e) { /* sin almacenamiento no hay nada que borrar */ }
  }

  function borrarProgreso() {
    // lo que decidió el grande (límites, materias, tienda) no es progreso: se queda
    var control = mio().control;
    datos.datos[datos.activo] = perfilVacio();
    if (control) datos.datos[datos.activo].control = control;
    guardar();
  }

  /* ---------------------- ajustes ---------------------- */
  function sonidoActivo() { return datos.ajustes.sonido !== false; }
  function setSonido(v) { datos.ajustes.sonido = !!v; guardar(); }

  /* Leer en voz alta: prendido de fábrica. Es un ajuste del aparato y no
     de cada chico, igual que el sonido. */
  function vozActiva() { return datos.ajustes.voz !== false; }
  function setVoz(v) { datos.ajustes.voz = !!v; guardar(); }
  /* Cuál voz: el nombre de la que eligió el padre, o null para que la
     app elija sola. También es del aparato: las voces instaladas son de
     cada teléfono, y en otro esa voz puede no existir (entonces la app
     elige sola). */
  /* Quién armó el último perfil en este aparato: 'adulto' o 'chico'.
     Decide cuál tutorial se ofrece desde Configuración. */
  function quienUsa() { return datos.ajustes.quienUsa || 'chico'; }
  function setQuienUsa(q) { datos.ajustes.quienUsa = q === 'adulto' ? 'adulto' : 'chico'; guardar(); }

  function vozElegida() { return datos.ajustes.vozElegida || null; }
  function setVozElegida(nombre) { datos.ajustes.vozElegida = nombre || null; guardar(); }

  function hayPin() { return !!datos.ajustes.pin; }
  function pinCorrecto(pin) { return datos.ajustes.pin === String(pin); }
  function setPin(pin) {
    datos.ajustes.pin = pin ? String(pin) : null;
    guardar();
  }

  /* La mensualidad (js/nucleo/suscripcion.js). Es del aparato y no de
     cada chico: la suscripción de Google Play es de la cuenta del
     celular, y cubre a todos los hermanos que jueguen en él.
       pruebaDesde  cuándo empezó la prueba gratis
       activa       si la última vez Google dijo que estaba pagada
       verificada   cuándo fue esa última vez
       enPlay       si alguna vez se abrió desde la app de Google Play */
  /* ---------------------- el camino de niveles ----------------------

     Las estrellas de cada nivel del mapa de cada juego, la mejor vez. Un
     nivel está pasado con una estrella o más, y eso abre el siguiente. */
  function mapaDe(clave) {
    var yo = mio();
    if (!yo.mapas) yo.mapas = {};
    return yo.mapas[clave] || {};
  }

  function estrellasDeNivel(clave, numero) {
    return mapaDe(clave)[numero] || 0;
  }

  /** Anota las estrellas de un nivel si mejoró. Devuelve las de antes. */
  function anotarNivelDelMapa(clave, numero, estrellas) {
    var yo = mio();
    if (!yo.mapas) yo.mapas = {};
    if (!yo.mapas[clave]) yo.mapas[clave] = {};
    var antes = yo.mapas[clave][numero] || 0;
    if (estrellas > antes) {
      yo.mapas[clave][numero] = estrellas;
      guardar();
    }
    return antes;
  }

  function plan() {
    if (!datos.ajustes.plan) datos.ajustes.plan = {};
    return datos.ajustes.plan;
  }
  function guardarPlan(cambios) {
    var p = plan();
    Object.keys(cambios).forEach(function (k) { p[k] = cambios[k]; });
    guardar();
  }

  return {
    AVATARES: AVATARES,
    perfiles: perfiles, activo: activo, usar: usar, crearPerfil: crearPerfil,
    actualizarPerfil: actualizarPerfil, borrarPerfil: borrarPerfil, borrarTodo: borrarTodo,
    foto: foto, guardarFoto: guardarFoto,
    necesitaBienvenida: necesitaBienvenida, edad: edad,
    record: record, anotar: anotar, estrellas: estrellas, sumarEstrellas: sumarEstrellas,
    mejorDeJuego: mejorDeJuego,
    registrarPartida: registrarPartida, registrarErrores: registrarErrores,
    descontarError: descontarError, cuantosErrores: cuantosErrores,
    estrellasDeJuego: estrellasDeJuego,
    aciertosDe: aciertosDe, registrarAciertos: registrarAciertos, pesoDe: pesoDe,
    vencidos: vencidos, cuantosVencidos: cuantosVencidos,
    programarLeccion: programarLeccion, leccionesParaRepasar: leccionesParaRepasar,
    monedas: monedas, monedasTotales: monedasTotales,
    dominado: dominado, marcarDominado: marcarDominado, cuantosDominados: cuantosDominados,
    sumarMonedas: sumarMonedas, gastarMonedas: gastarMonedas,
    comprar: comprar, tieneComprado: tieneComprado, devolverCompras: devolverCompras,
    equipar: equipar, equipado: equipado,
    marcarLeccion: marcarLeccion, leccionVista: leccionVista, cuantasLecciones: cuantasLecciones,
    masFallados: masFallados, estadisticas: estadisticas, borrarProgreso: borrarProgreso,
    sonidoActivo: sonidoActivo, setSonido: setSonido,
    racha: racha, mejorRacha: mejorRacha, jugoHoy: jugoHoy,
    aciertosDeHoy: aciertosDeHoy, metaDiaria: metaDiaria, setMeta: setMeta,
    metaCumplidaHoy: metaCumplidaHoy, PREMIO_META: PREMIO_META,
    control: control, setControl: setControl, darMinutosHoy: darMinutosHoy,
    sumarTiempo: sumarTiempo, segundosDeHoy: segundosDeHoy,
    ultimosDias: ultimosDias, historialDesde: historialDesde,
    historial: historial, tiempoTotal: tiempoTotal,
    masAcertados: masAcertados, resumenDeMemoria: resumenDeMemoria,
    nivelHecho: nivelHecho, marcarNivel: marcarNivel,
    exportar: exportar, leerCopia: leerCopia, restaurar: restaurar,
    plan: plan, guardarPlan: guardarPlan,
    mapaDe: mapaDe, estrellasDeNivel: estrellasDeNivel, anotarNivelDelMapa: anotarNivelDelMapa,
    vozActiva: vozActiva, setVoz: setVoz,
    vozElegida: vozElegida, setVozElegida: setVozElegida,
    quienUsa: quienUsa, setQuienUsa: setQuienUsa,
    hayPin: hayPin, pinCorrecto: pinCorrecto, setPin: setPin
  };
})();
