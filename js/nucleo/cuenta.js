/* ============================================================
   La cuenta de la familia: entrar con el mail de un grande.

   Todos los chicos de un aparato van bajo el mismo mail. La cuenta no
   guarda el progreso en ningún lado (eso sigue en el aparato, en
   js/nucleo/almacen.js): sirve para dos cosas.

     1. Saber que del otro lado hay un grande con un mail de verdad, que
        es lo que acepta los términos y la política de privacidad.
     2. Recuperar el PIN del modo parental. Antes, «Olvidé el PIN» lo
        borraba sin pedir nada, así que cualquier chico que tocara ese
        botón entraba al panel. Ahora hace falta el código que llega a
        ese mail.

   Cómo se entra: se escribe el mail, llega un código de 6 números, se
   escribe el código. No hay contraseña que recordar. Lo hace Supabase
   (supabase.com): la app le habla directo a su servidor con fetch, sin
   librerías, así que no suma nada que bajar.

   Mientras CONFIG esté vacío, la cuenta está APAGADA y la app anda como
   antes, sin pedir mail. Es a propósito: publicar esto sin el servidor
   configurado dejaría a todo el mundo afuera, trabado en una pantalla
   que no puede mandar ningún código.

   La sesión se guarda aparte de los datos de la app (en su propia clave
   de localStorage), así nunca viaja en «Guardar una copia»: el archivo
   de la copia lo puede abrir cualquiera.
   ============================================================ */
window.Cuenta = (function () {
  'use strict';

  /* ---------------- lo que se configura ----------------
     Los dos datos están en Supabase → Project Settings → API. La clave
     es la «anon public»: es pública a propósito (va adentro de la app y
     cualquiera la puede ver). NUNCA poner acá la «service_role». */
  var CONFIG = {
    url: 'https://zgxlpssbmvpqehcqvxsn.supabase.co',
    clavePublica: ''     // la «anon public key»
  };

  var CLAVE = 'bichitoCurioso.sesion';

  function configurada() { return !!(CONFIG.url && CONFIG.clavePublica); }

  /* ---------------- la sesión guardada ---------------- */
  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; }
  }
  function escribir(s) {
    try {
      if (s) localStorage.setItem(CLAVE, JSON.stringify(s));
      else localStorage.removeItem(CLAVE);
    } catch (e) { /* sin almacenamiento, la sesión dura lo que la pestaña */ }
  }

  /** { email, id } del grande que entró, o null. */
  function sesion() {
    var s = leer();
    return s && s.email ? { email: s.email, id: s.id } : null;
  }

  /** ¿Hay que mostrar la pantalla de entrar? Sólo con la cuenta prendida. */
  function hayQueEntrar() { return configurada() && !sesion(); }

  /* ---------------- hablar con Supabase ---------------- */
  function pedir(ruta, cuerpo, token) {
    var cabeceras = { 'Content-Type': 'application/json', apikey: CONFIG.clavePublica };
    if (token) cabeceras.Authorization = 'Bearer ' + token;
    return fetch(CONFIG.url.replace(/\/$/, '') + ruta, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpo || {})
    }).then(function (r) {
      return r.text().then(function (t) {
        var datos = null;
        try { datos = t ? JSON.parse(t) : null; } catch (e) { datos = null; }
        if (!r.ok) throw error(r.status, datos);
        return datos;
      });
    }, function () {
      throw new Error('No hay conexión. Fijate que el teléfono tenga internet y probá de nuevo.');
    });
  }

  /* Lo que contesta Supabase, dicho en castellano y con qué hacer. */
  function error(estado, datos) {
    var cual = String((datos && (datos.error_code || datos.code || datos.msg || datos.error_description || datos.message)) || '');
    var texto;
    if (estado === 429 || /rate|seconds/i.test(cual)) {
      texto = 'Pediste muchos códigos seguidos. Esperá un minuto y probá de nuevo.';
    } else if (/expired|invalid|otp/i.test(cual) || estado === 403) {
      texto = 'Ese código no es, o ya venció. Revisá el último mail que te llegó o pedí otro.';
    } else if (/email/i.test(cual) && estado === 400) {
      texto = 'Ese mail no parece estar bien escrito.';
    } else {
      texto = 'No pudimos conectarnos con el servidor. Probá de nuevo en un rato.';
    }
    var e = new Error(texto);
    e.estado = estado;
    return e;
  }

  function mailValido(mail) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(mail || '').trim());
  }

  /** Manda el código de 6 números al mail. Si la cuenta no existe, la crea. */
  function pedirCodigo(mail) {
    mail = String(mail || '').trim().toLowerCase();
    if (!mailValido(mail)) return Promise.reject(new Error('Ese mail no parece estar bien escrito.'));
    return pedir('/auth/v1/otp', { email: mail, create_user: true });
  }

  /** Verifica el código. Si está bien, deja la sesión guardada. */
  function verificarCodigo(mail, codigo) {
    mail = String(mail || '').trim().toLowerCase();
    codigo = String(codigo || '').replace(/\D/g, '');
    if (codigo.length < 6) return Promise.reject(new Error('El código tiene 6 números.'));
    return pedir('/auth/v1/verify', { type: 'email', email: mail, token: codigo }).then(function (d) {
      if (!d || !d.access_token) throw new Error('No pudimos conectarnos con el servidor. Probá de nuevo en un rato.');
      escribir({
        email: (d.user && d.user.email) || mail,
        id: d.user && d.user.id,
        acceso: d.access_token,
        renovar: d.refresh_token,
        vence: Date.now() + (d.expires_in || 3600) * 1000
      });
      return sesion();
    });
  }

  /* El permiso para hablar con el servidor dura una hora; si venció, se
     pide otro con la llave de renovar. Sólo hace falta para borrar la
     cuenta: el resto de la app no le pide nada al servidor. */
  function acceso() {
    var s = leer();
    if (!s) return Promise.reject(new Error('No hay nadie adentro.'));
    if (s.acceso && s.vence && Date.now() < s.vence - 60000) return Promise.resolve(s.acceso);
    return pedir('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.renovar }).then(function (d) {
      s.acceso = d.access_token;
      s.renovar = d.refresh_token || s.renovar;
      s.vence = Date.now() + (d.expires_in || 3600) * 1000;
      escribir(s);
      return s.acceso;
    });
  }

  /** Sale de la cuenta en este aparato. Los datos de los chicos quedan. */
  function cerrarSesion() { escribir(null); }

  /**
   * Borra la cuenta en el servidor (el mail deja de existir allá) y sale.
   * Usa la función borrar_mi_cuenta de herramientas/supabase.sql, que
   * sólo puede borrar a quien la llama. Google Play exige que una app con
   * cuentas deje borrarlas desde adentro.
   */
  function borrarCuenta() {
    return acceso()
      .then(function (token) { return pedir('/rest/v1/rpc/borrar_mi_cuenta', {}, token); })
      .then(function () { escribir(null); });
  }

  /** «sebas@gmail.com» → «s•••s@gmail.com», para mostrar a dónde se mandó. */
  function mailTapado(mail) {
    var m = String(mail || '');
    var arroba = m.indexOf('@');
    if (arroba < 2) return m;
    var nombre = m.slice(0, arroba);
    var tapado = nombre.length <= 3 ? nombre[0] + '•••' : nombre[0] + '•••' + nombre[nombre.length - 1];
    return tapado + m.slice(arroba);
  }

  return {
    CONFIG: CONFIG,
    configurada: configurada,
    sesion: sesion,
    hayQueEntrar: hayQueEntrar,
    mailValido: mailValido,
    pedirCodigo: pedirCodigo,
    verificarCodigo: verificarCodigo,
    cerrarSesion: cerrarSesion,
    borrarCuenta: borrarCuenta,
    mailTapado: mailTapado
  };
})();
