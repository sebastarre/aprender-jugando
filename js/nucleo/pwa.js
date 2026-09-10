/* ============================================================
   Convierte la página en app instalable:
     - registra el service worker (sw.js), que guarda todo para
       que funcione sin internet;
     - muestra el cartel de "Instalar" cuando el navegador lo permite,
       o las instrucciones en iPhone, donde no existe ese botón.
   Si algo de esto falla, la página sigue andando igual.
   ============================================================ */
(function () {
  'use strict';

  var $ = Util.$;

  /* ---------------------- service worker ----------------------

     Registrar y esperar no alcanza. Una app instalada casi nunca vuelve
     a "navegar": el chico la abre desde el ícono, el sistema le devuelve
     la página que ya estaba en memoria, no se dispara `load` y el
     navegador nunca se entera de que hay una versión nueva. Resultado:
     la app se queda clavada en la copia vieja para siempre.

     Por eso se le pide la actualización a mano, cada vez que la app
     vuelve a la pantalla. */
  var recargando = false;
  var registro = null;
  var ultimaBusqueda = 0;
  var ESPERA = 30000;          // no más de una búsqueda cada 30 segundos

  function buscarActualizacion() {
    var ahora = Date.now();
    if (!registro || ahora - ultimaBusqueda < ESPERA) return;
    ultimaBusqueda = ahora;
    try { registro.update(); } catch (error) { /* sin conexión, será la próxima */ }
  }

  /* Recargar en medio de una partida sería robarle la ronda al chico:
     si está jugando, se espera a que termine y cambie de pantalla. */
  function recargarCuandoSePueda() {
    if (recargando) return;
    if (window.Motor && Motor.enJuego()) {
      window.addEventListener('hashchange', recargarCuandoSePueda, { once: true });
      return;
    }
    recargando = true;
    location.reload();
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        registro = reg;
        ultimaBusqueda = Date.now();
        reg.update();
      }).catch(function () {
        /* sin service worker la app funciona, pero sólo con conexión */
      });
    });

    // cada vez que la app vuelve a la pantalla, se fija si hay algo nuevo
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) buscarActualizacion();
    });
    window.addEventListener('focus', buscarActualizacion);

    // cuando se instala una versión nueva, se recarga una sola vez
    navigator.serviceWorker.addEventListener('controllerchange', recargarCuandoSePueda);
  }

  /** Qué versión está corriendo, para poder mirarlo en Configuración. */
  function version() {
    return new Promise(function (resolver) {
      if (!('caches' in window)) return resolver(null);
      caches.keys().then(function (nombres) {
        var mia = nombres.filter(function (n) { return n.indexOf('aprender-jugando-') === 0; })[0];
        resolver(mia ? mia.replace('aprender-jugando-', '') : null);
      }).catch(function () { resolver(null); });
    });
  }

  /* ---------------------- cartel de instalación ---------------------- */
  var invitacion = null;              // el evento que guarda el navegador

  function esIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function yaInstalada() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
  }

  function mostrarCartel(modo) {
    var caja = $('instalar');
    if (!caja || yaInstalada()) return;
    caja.hidden = false;
    caja.setAttribute('data-modo', modo);
  }

  function ocultarCartel() {
    var caja = $('instalar');
    if (caja) caja.hidden = true;
  }

  window.addEventListener('beforeinstallprompt', function (evento) {
    evento.preventDefault();          // usamos nuestro propio botón
    invitacion = evento;
    mostrarCartel('boton');
  });

  window.addEventListener('appinstalled', function () {
    invitacion = null;
    ocultarCartel();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var boton = $('btn-instalar');
    if (boton) {
      boton.addEventListener('click', function () {
        if (!invitacion) return;
        invitacion.prompt();
        invitacion.userChoice.then(function (r) {
          if (r.outcome === 'accepted') ocultarCartel();
        });
        invitacion = null;
      });
    }
    // en iPhone no hay evento ni botón: se explica cómo hacerlo a mano
    if (esIOS()) mostrarCartel('ios');
  });

  window.PWA = { version: version, buscarActualizacion: buscarActualizacion };
})();
