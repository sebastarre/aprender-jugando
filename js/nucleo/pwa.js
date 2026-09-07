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

  /* ---------------------- service worker ---------------------- */
  var recargando = false;

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        /* sin service worker la app funciona, pero sólo con conexión */
      });
    });

    // cuando se instala una versión nueva, se recarga una sola vez
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (recargando) return;
      recargando = true;
      location.reload();
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
})();
