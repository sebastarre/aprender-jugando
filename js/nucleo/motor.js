/* ============================================================
   Motor de partidas, común a todas las materias.

   Se encarga de lo que se repite en cualquier juego: la ronda de
   preguntas, los 3 intentos, el puntaje, los corazones, la barra de
   progreso, los mensajes y el resultado final.

   Cada juego le pasa sólo lo que cambia: cómo se pinta la consigna,
   cómo se avisa que acertó o falló, y qué texto decir.

       Motor.jugar({
         items: [...],                 // las preguntas ya elegidas
         render: function (item) {},   // pintar consigna y respuestas
         esCorrecta: function (item, respuesta) {},
         alAcertar / alFallar / alRevelar: function (...) {},
         textoFallo / textoRevelado: function (...) { return '...'; },
         alTerminar: function (resultado) {}
       });

   Y desde el juego, cuando el chico contesta:  Motor.responder(respuesta)
   ============================================================ */
window.Motor = (function () {
  'use strict';

  var INTENTOS = 3;
  var PUNTOS_POR_INTENTO = [3, 2, 1];   // según en qué intento acierte
  var ESPERA_ACIERTO = 420;             // cuánto se ve el acierto
  var ESPERA_FALLO = 260;               // bloqueo cortito (evita el doble clic)
  var ESPERA_REVELAR = 1500;            // tiempo para mirar la respuesta correcta
  var ESPERA_MUDO = 320;                // en el examen no hay nada que leer

  var e = null;                         // estado de la partida en curso
  var temporizadores = [];

  function luego(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }
  function limpiarTiempos() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  /* ---------------------- cartel de mensajes ---------------------- */
  function aviso(texto, tipo) {
    var el = Util.$('aviso');
    el.textContent = texto;
    el.className = 'aviso ' + (tipo || '');
    el.style.animation = 'none';
    void el.offsetWidth;                // reinicia la animación de entrada
    el.style.animation = '';
  }

  function limpiarAviso() {
    var el = Util.$('aviso');
    el.textContent = '';
    el.className = 'aviso';
  }

  /* ---------------------- arranque ---------------------- */
  function jugar(config) {
    limpiarTiempos();
    limpiarAviso();

    e = {
      cfg: config,
      items: config.items,
      intentos: config.intentos || INTENTOS,
      // en modo examen no se dice si estuvo bien hasta el final
      mudo: config.mostrarResultado === false,
      indice: 0,
      intento: 0,
      puntos: 0,
      aciertos: 0,
      perfectos: 0,
      acertados: [],        // los ítems que respondió bien (para las monedas)
      errores: [],
      bloqueado: false
    };
    document.body.classList.toggle('rindiendo', e.mudo);
    mostrarRonda();
  }

  function actual() { return e ? e.items[e.indice] : null; }

  function mostrarRonda() {
    e.intento = 0;
    e.bloqueado = false;
    limpiarAviso();
    e.cfg.render(actual(), e.indice);
    pintarHUD();
  }

  function pintarHUD() {
    var total = e.items.length;
    Util.$('progreso-texto').textContent = (e.indice + 1) + ' / ' + total;
    Util.$('progreso-relleno').style.transform = 'scaleX(' + (e.indice / total) + ')';
    Util.$('marcador-puntos').textContent = e.puntos;

    var vidas = Util.$('vidas');
    Util.vaciar(vidas);
    if (e.intentos <= 1) return;      // con un solo intento no hay nada que mostrar
    for (var i = 0; i < e.intentos; i++) {
      vidas.appendChild(Util.crear('span', i < e.intento ? 'gastada' : '', '❤️'));
    }
  }

  /* ---------------------- respuesta ---------------------- */
  function esCorrecta(item, respuesta) {
    if (e.cfg.esCorrecta) return e.cfg.esCorrecta(item, respuesta);
    return item.id === respuesta;
  }

  /** Lo llama cada juego cuando el chico elige algo. */
  function responder(respuesta) {
    if (!e || e.bloqueado) return;
    Sonido.despertar();
    if (esCorrecta(actual(), respuesta)) acertar(respuesta);
    else fallar(respuesta);
  }

  function acertar(respuesta) {
    e.bloqueado = true;
    var item = actual();
    var ganados = PUNTOS_POR_INTENTO[e.intento] || 1;
    e.puntos += ganados;
    e.aciertos++;
    e.acertados.push(item);
    if (e.intento === 0) e.perfectos++;

    if (e.mudo) {
      // examen: se marca que quedó registrada, sin decir si estuvo bien
      if (e.cfg.alResponder) e.cfg.alResponder(item, respuesta);
      return luego(siguiente, ESPERA_MUDO);
    }

    if (e.cfg.alAcertar) e.cfg.alAcertar(item, respuesta);
    Sonido.tocar('acierto');

    Util.$('marcador-puntos').textContent = e.puntos;
    var caja = Util.$('marcador-puntos').parentNode;
    caja.classList.add('sube');
    luego(function () { caja.classList.remove('sube'); }, 400);

    aviso(festejo() + ' +' + ganados + (ganados === 1 ? ' punto' : ' puntos'), 'bien');
    luego(siguiente, ESPERA_ACIERTO);
  }

  function fallar(respuesta) {
    e.intento++;
    e.bloqueado = true;
    pintarHUD();

    var item = actual();
    var quedan = e.intentos - e.intento;

    if (e.mudo) {
      // examen: ni sonido ni color; si se le acabaron los intentos, pasa
      if (e.cfg.alResponder) e.cfg.alResponder(item, respuesta);
      if (e.intento >= e.intentos) {
        e.errores.push(item);
        return luego(siguiente, ESPERA_MUDO);
      }
      return luego(function () { if (e) e.bloqueado = false; }, ESPERA_FALLO);
    }

    Sonido.tocar('error');
    if (e.cfg.alFallar) e.cfg.alFallar(item, respuesta, quedan);

    if (e.intento >= e.intentos) {
      luego(revelar, 160);
      return;
    }

    var cola = 'Te ' + (quedan === 1 ? 'queda 1 intento' : 'quedan ' + quedan + ' intentos');
    var propio = e.cfg.textoFallo ? e.cfg.textoFallo(item, respuesta, quedan) : '';
    aviso((propio ? propio + ' ' : '¡Casi! ') + cola, 'mal');

    luego(function () { if (e) e.bloqueado = false; }, ESPERA_FALLO);
  }

  function revelar() {
    var item = actual();
    e.errores.push(item);
    Sonido.tocar('revelar');
    if (e.cfg.alRevelar) e.cfg.alRevelar(item);
    aviso(e.cfg.textoRevelado ? e.cfg.textoRevelado(item) : 'Era esta.', 'dato');
    luego(siguiente, ESPERA_REVELAR);
  }

  function festejo() {
    return Util.alAzar(['¡Muy bien! 🎉', '¡Excelente! ⭐', '¡Perfecto! 👏',
                        '¡Genial! 🙌', '¡Lo lograste! 🥳']);
  }

  /* ---------------------- avance y cierre ---------------------- */
  function siguiente() {
    limpiarTiempos();
    e.indice++;
    if (e.indice >= e.items.length) return finalizar();
    mostrarRonda();
  }

  function finalizar() {
    Util.$('progreso-relleno').style.transform = 'scaleX(1)';
    limpiarAviso();
    document.body.classList.remove('rindiendo');
    var total = e.items.length;
    var resultado = {
      total: total,
      puntos: e.puntos,
      aciertos: e.aciertos,
      perfectos: e.perfectos,
      maximo: total * PUNTOS_POR_INTENTO[0],
      precision: total ? Math.round(e.aciertos / total * 100) : 0,
      acertados: e.acertados.slice(),
      errores: e.errores.slice()
    };
    var alTerminar = e.cfg.alTerminar;
    e = null;
    if (alTerminar) alTerminar(resultado);
  }

  /** Corta la partida en curso (al tocar "Volver", por ejemplo). */
  function abandonar() {
    limpiarTiempos();
    limpiarAviso();
    document.body.classList.remove('rindiendo');
    e = null;
  }

  return {
    jugar: jugar,
    responder: responder,
    abandonar: abandonar,
    enJuego: function () { return e !== null; },
    intentoActual: function () { return e ? e.intento : 0; },
    aviso: aviso,
    INTENTOS: INTENTOS,
    PUNTOS_POR_INTENTO: PUNTOS_POR_INTENTO
  };
})();
