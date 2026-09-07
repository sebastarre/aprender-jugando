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
        case 'error':                         // dos notas graves
          nota(200, 0, .13, 'sawtooth', .12);
          nota(150, .1, .18, 'sawtooth', .12);
          break;
        case 'revelar':                       // "ahí estaba"
          nota(420, 0, .14, 'sine');
          nota(330, .13, .22, 'sine');
          break;
        case 'clic':
          nota(520, 0, .05, 'square', .07);
          break;
        case 'fin':                           // fanfarria corta
          nota(523, 0, .14, 'triangle');
          nota(659, .13, .14, 'triangle');
          nota(784, .26, .14, 'triangle');
          nota(1046, .39, .32, 'triangle');
          break;
        case 'record':
          nota(784, 0, .1, 'square', .1);
          nota(988, .1, .1, 'square', .1);
          nota(1319, .2, .3, 'square', .1);
          break;
      }
    } catch (e) { /* si el audio falla, el juego sigue igual */ }
  }

  /** Prepara el contexto tras el primer gesto del usuario. */
  function despertar() { contexto(); }

  return { tocar: tocar, despertar: despertar };
})();
