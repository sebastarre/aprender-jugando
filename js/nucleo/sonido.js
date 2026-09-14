/* Sonidos generados con Web Audio: no hacen falta archivos de audio.
   El navegador exige un gesto del usuario antes de sonar, así que el
   contexto se crea en el primer clic. */
window.Sonido = (function () {
  'use strict';

  var ctx = null;

  function contexto() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** Una nota simple. f = frecuencia en Hz, dur = segundos. */
  function nota(f, comienzo, dur, tipo, volumen) {
    var c = contexto();
    if (!c) return;
    var osc = c.createOscillator();
    var gan = c.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.setValueAtTime(f, c.currentTime + comienzo);
    gan.gain.setValueAtTime(0.0001, c.currentTime + comienzo);
    gan.gain.exponentialRampToValueAtTime(volumen || 0.18, c.currentTime + comienzo + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + comienzo + dur);
    osc.connect(gan).connect(c.destination);
    osc.start(c.currentTime + comienzo);
    osc.stop(c.currentTime + comienzo + dur + 0.02);
  }

  function tocar(nombre) {
    if (!Almacen.sonidoActivo()) return;
    try {
      switch (nombre) {
        case 'acierto':                       // arpegio ascendente alegre
          nota(660, 0, .12, 'triangle');
          nota(880, .09, .16, 'triangle');
          break;
        case 'error':                         // dos notas suaves: avisa, no reta
          nota(330, 0, .14, 'sine', .08);
          nota(294, .12, .2, 'sine', .08);
          break;
        case 'revelar':                       // "ahí estaba"
          nota(420, 0, .14, 'sine');
          nota(330, .13, .22, 'sine');
          break;
        case 'clic':
          nota(520, 0, .05, 'square', .07);
          break;
        /* El final y el récord suenan igual y bajito. Antes el récord
           tenía una fanfarria propia: hacía del puntaje el momento más
           importante de la partida. */
        case 'fin':
        case 'record':
          nota(523, 0, .14, 'sine', .1);
          nota(659, .12, .14, 'sine', .1);
          nota(784, .24, .26, 'sine', .1);
          break;
      }
    } catch (e) { /* si el audio falla, el juego sigue igual */ }
  }

  /** Prepara el contexto tras el primer gesto del usuario. */
  function despertar() { contexto(); }

  return { tocar: tocar, despertar: despertar };
})();
