/* ============================================================
   La mensualidad: prueba gratis y después, suscripción de Google Play.

   Cómo se cobra. La app se publica en Google Play como una «TWA» (la
   misma página web, empaquetada como app de Android) y la suscripción
   es un producto de Play Console. Desde la página se habla con Google
   por dos puertas del navegador, que sólo existen adentro de esa app:
     - la Digital Goods API, que dice el precio y si la suscripción
       está activa;
     - la Payment Request API, que abre la hoja de pago de Google.
   Google cobra, renueva cada mes y maneja las cancelaciones. La app
   nunca ve una tarjeta.

   Dónde se cobra. Sólo adentro de la app de Google Play, que es el
   único lugar donde se puede pagar. En la web (y en iPhone) no hay
   cómo, así que ahí no se bloquea nada: sería dejar a un chico afuera
   sin darle al grande ninguna forma de pagar. Si algún día se quiere
   cobrar también en la web, está CONFIG.soloEnLaAppDePlay.

   Lo que sabe la app vive en este aparato (Almacen.plan()), no en un
   servidor. Alcanza para que funcione, pero quien sepa borrar los datos
   del navegador puede volver a empezar la prueba. Para algo a prueba de
   eso hace falta un servidor que valide las compras con Google.
   ============================================================ */
window.Suscripcion = (function () {
  'use strict';

  /* ---------------- lo que se configura ----------------

     Todo lo que hay que cambiar para ponerla en marcha está acá. */
  var CONFIG = {
    // el ID de la suscripción tal cual se creó en Play Console
    producto: 'bichito_mensual',
    /* El precio lo pone Google: se configura en Play Console y la app lo
       lee de ahí. Éste es el que se muestra cuando no se puede leer (en
       la web, o sin internet). Tiene que coincidir con el de Play. */
    precioDeReferencia: '$ 4.000',
    diasDePrueba: 7,
    // la ficha en Google Play, para el botón «Descargar» de la web; vacía, no se muestra
    fichaDePlay: '',
    // true: sólo se cobra adentro de la app de Play; en la web todo sigue abierto
    soloEnLaAppDePlay: true
  };

  var METODO = 'https://play.google.com/billing';
  var DIA = 24 * 60 * 60 * 1000;
  /* Si no se puede preguntarle a Google (sin internet), se confía en la
     última respuesta durante este tiempo: una suscripción mensual no se
     cae de un día para el otro, y un chico en un auto sin señal tiene
     que poder seguir jugando. */
  var CONFIANZA_SIN_CONEXION = 35 * DIA;

  var servicio = null;
  var precioLeido = null;

  /* ---------------- dónde estamos ---------------- */

  /** ¿Estamos adentro de la app de Google Play? */
  function enLaAppDePlay() {
    var p = Almacen.plan();
    if (p.enPlay) return true;
    /* La TWA abre la página con un referrer «android-app://». Sólo viene
       en la primera carga, así que se anota para las siguientes. */
    var desdePlay = 'getDigitalGoodsService' in window ||
                    String(document.referrer).indexOf('android-app://') === 0;
    if (desdePlay) Almacen.guardarPlan({ enPlay: true });
    return desdePlay;
  }

  /** ¿En este aparato se cobra? */
  function cobra() {
    return !CONFIG.soloEnLaAppDePlay || enLaAppDePlay();
  }

  /* ---------------- el estado ---------------- */

  function pruebaDesde() {
    var p = Almacen.plan();
    if (!p.pruebaDesde) {
      Almacen.guardarPlan({ pruebaDesde: Date.now() });
      return Date.now();
    }
    return p.pruebaDesde;
  }

  function diasDePruebaQueQuedan() {
    var pasados = Math.floor((Date.now() - pruebaDesde()) / DIA);
    return Math.max(0, CONFIG.diasDePrueba - pasados);
  }

  function activa() {
    var p = Almacen.plan();
    return !!(p.activa && p.verificada && Date.now() - p.verificada < CONFIANZA_SIN_CONEXION);
  }

  /**
   * Cómo está el plan en este aparato:
   *   'libre'    acá no se cobra (la web)
   *   'activa'   pagó
   *   'prueba'   todavía está en los días gratis
   *   'vencida'  terminó la prueba y no hay suscripción
   */
  function estado() {
    var dias = diasDePruebaQueQuedan();
    var tipo = !cobra() ? 'libre' : activa() ? 'activa' : dias > 0 ? 'prueba' : 'vencida';
    return { tipo: tipo, dias: dias };
  }

  /** ¿Hay que frenar a un chico que quiere empezar a jugar? */
  function bloquea() { return estado().tipo === 'vencida'; }

  /* ---------------- hablar con Google ---------------- */

  function conectar() {
    if (servicio) return Promise.resolve(servicio);
    if (!('getDigitalGoodsService' in window)) return Promise.resolve(null);
    return window.getDigitalGoodsService(METODO)
      .then(function (s) { servicio = s; return s; })
      .catch(function () { return null; });
  }

  function formatear(precio) {
    try {
      var valor = Number(precio.value);
      // «$ 4.500», no «$ 4.500,00»: los centavos sólo si los hay
      return new Intl.NumberFormat('es-AR', {
        style: 'currency', currency: precio.currency,
        minimumFractionDigits: valor % 1 ? 2 : 0
      }).format(valor);
    } catch (e) {
      return precio.currency + ' ' + precio.value;
    }
  }

  /** El precio por mes, como lo dice Google; o el de referencia. */
  function precio() {
    if (precioLeido) return Promise.resolve(precioLeido);
    return conectar().then(function (s) {
      if (!s) return CONFIG.precioDeReferencia;
      return s.getDetails([CONFIG.producto]).then(function (lista) {
        precioLeido = lista && lista[0] ? formatear(lista[0].price) : CONFIG.precioDeReferencia;
        return precioLeido;
      });
    }).catch(function () { return CONFIG.precioDeReferencia; });
  }

  /**
   * Le pregunta a Google si la suscripción está activa y lo anota. Se
   * llama al abrir la app, después de pagar y con «Ya pagué». Sin
   * conexión con Google no cambia nada: queda la última respuesta.
   * Devuelve el estado nuevo.
   */
  function revisar() {
    return conectar().then(function (s) {
      if (!s) return estado();
      return s.listPurchases().then(function (compras) {
        var hay = (compras || []).some(function (c) { return c.itemId === CONFIG.producto; });
        Almacen.guardarPlan({ activa: hay, verificada: Date.now() });
        return estado();
      });
    }).catch(function () { return estado(); });
  }

  /**
   * Abre la hoja de pago de Google. Se resuelve con el estado nuevo, o
   * se rechaza con un Error cuyo `motivo` es 'sin-play' (no estamos en
   * la app de Play), 'cancelado' (cerró la hoja) u 'otro'.
   */
  function comprar() {
    function fallo(motivo, mensaje) {
      var e = new Error(mensaje || motivo);
      e.motivo = motivo;
      return Promise.reject(e);
    }
    if (!window.PaymentRequest) return fallo('sin-play');
    return conectar().then(function (s) {
      if (!s) return fallo('sin-play');
      var pedido = new PaymentRequest(
        [{ supportedMethods: METODO, data: { sku: CONFIG.producto } }],
        // el monto lo pone Google; la API pide uno igual
        { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } }
      );
      return pedido.show().then(function (respuesta) {
        return respuesta.complete('success').then(revisar);
      }, function (error) {
        return fallo(error && error.name === 'AbortError' ? 'cancelado' : 'otro',
                     error && error.message);
      });
    });
  }

  return {
    CONFIG: CONFIG,
    cobra: cobra,
    enLaAppDePlay: enLaAppDePlay,
    estado: estado,
    bloquea: bloquea,
    precio: precio,
    revisar: revisar,
    comprar: comprar
  };
})();
