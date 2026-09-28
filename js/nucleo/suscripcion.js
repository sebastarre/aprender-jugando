/* ============================================================
   La mensualidad: la suscripción de Google Play, con su prueba gratis.

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

   La prueba gratis es la de Google Play: una oferta de la suscripción
   (ver LEEME, «La mensualidad»). El grande la empieza desde la hoja de
   pago de Google, con su cuenta; mientras dura, Google dice que la
   suscripción está activa, y al terminar cobra, salvo que la haya
   cancelado. La app no cuenta días: antes contaba siete desde que se
   abría, y quien borraba los datos volvía a empezar. Ahora quién tiene
   derecho a la prueba lo decide Google (una vez por cuenta).

   Lo que sabe la app vive en este aparato (Almacen.plan()), no en un
   servidor: la última respuesta de Google, para poder jugar sin señal.
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
    /* Los días de prueba también los pone Google (la oferta de Play
       Console); éstos se muestran cuando no se pueden leer. Tienen que
       coincidir con los de la oferta. */
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
  var diasLeidos = null;       // los de la oferta de prueba, como los dice Google

  /* ---------------- dónde estamos ---------------- */

  /**
   * ¿Estamos adentro de la app de Google Play? Sí, sólo si Google Play
   * contestó alguna vez (conectar()); se anota para las cargas siguientes.
   *
   * No alcanza con otras señales, y las dos fallaron:
   *   - que exista getDigitalGoodsService: Edge de escritorio la trae,
   *     pero Google Play no le contesta;
   *   - un referrer «android-app://»: lo trae cualquier link abierto desde
   *     una app de Android (Gmail, la de Google, WhatsApp), no sólo la
   *     nuestra.
   * Con cualquiera de las dos, la web frenaba a los chicos frente a un plan
   * que ahí no se puede pagar. Por eso el dato es `playConfirmado`: los
   * `enPlay` y `play` de antes pudieron quedar mal anotados.
   */
  function enLaAppDePlay() {
    return !!Almacen.plan().playConfirmado;
  }

  /** ¿En este aparato se cobra? */
  function cobra() {
    return !CONFIG.soloEnLaAppDePlay || enLaAppDePlay();
  }

  /* ---------------- el estado ---------------- */

  function activa() {
    var p = Almacen.plan();
    return !!(p.activa && p.verificada && Date.now() - p.verificada < CONFIANZA_SIN_CONEXION);
  }

  /**
   * Cómo está el plan en este aparato:
   *   'libre'    acá no se cobra (la web)
   *   'activa'   hay suscripción: pagada, o en los días de prueba de Google
   *   'nueva'    todavía no empezó la prueba gratis
   *   'vencida'  tuvo la suscripción y ya no la tiene (canceló, o no se pudo cobrar)
   * `dias` son los de la prueba gratis, para mostrarlos.
   */
  function estado() {
    var tipo = !cobra() ? 'libre' : activa() ? 'activa' : Almacen.plan().tuvo ? 'vencida' : 'nueva';
    return { tipo: tipo, dias: diasLeidos || CONFIG.diasDePrueba };
  }

  /** ¿Hay que frenar a un chico que quiere empezar a jugar? */
  function bloquea() {
    var t = estado().tipo;
    return t === 'nueva' || t === 'vencida';
  }

  /* ---------------- hablar con Google ---------------- */

  function conectar() {
    if (servicio) return Promise.resolve(servicio);
    if (!('getDigitalGoodsService' in window)) return Promise.resolve(null);
    return window.getDigitalGoodsService(METODO)
      .then(function (s) {
        servicio = s;
        // contestó Google Play: estamos en su app
        if (s && !Almacen.plan().playConfirmado) Almacen.guardarPlan({ playConfirmado: true });
        return s;
      })
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

  /** «P7D» → 7, «P1W» → 7, «P1M» → 30: la duración de la prueba, en días. */
  function aDias(periodo) {
    var m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(String(periodo || ''));
    if (!m) return null;
    var dias = (+m[1] || 0) * 365 + (+m[2] || 0) * 30 + (+m[3] || 0) * 7 + (+m[4] || 0);
    return dias || null;
  }

  /** El precio por mes, como lo dice Google; o el de referencia. De paso, los días de prueba. */
  function precio() {
    if (precioLeido) return Promise.resolve(precioLeido);
    return conectar().then(function (s) {
      if (!s) return CONFIG.precioDeReferencia;
      return s.getDetails([CONFIG.producto]).then(function (lista) {
        var item = lista && lista[0];
        precioLeido = item ? formatear(item.price) : CONFIG.precioDeReferencia;
        if (item) diasLeidos = aDias(item.freeTrialPeriod);
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
        var cambio = { activa: hay, verificada: Date.now() };
        // la tuvo alguna vez: si se corta, ya no es «nueva» sino «vencida»
        if (hay) cambio.tuvo = true;
        Almacen.guardarPlan(cambio);
        return estado();
      });
    }).catch(function () { return estado(); });
  }

  /**
   * Abre la hoja de pago de Google, que ofrece sola la prueba gratis a
   * quien le corresponde (la oferta de Play Console). Se resuelve con el estado nuevo, o
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
    aDias: aDias,           // para las pruebas
    revisar: revisar,
    comprar: comprar
  };
})();
