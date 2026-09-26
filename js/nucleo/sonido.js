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

  /** Un golpe de ruido corto y filtrado: suena a palmas. */
  function palmada(comienzo) {
    var c = contexto();
    if (!c) return;
    var largo = Math.floor(c.sampleRate * 0.09);
    var buffer = c.createBuffer(1, largo, c.sampleRate);
    var datos = buffer.getChannelData(0);
    for (var i = 0; i < largo; i++) datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 3);
    var fuente = c.createBufferSource();
    fuente.buffer = buffer;
    var filtro = c.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 1400;
    filtro.Q.value = 0.8;
    var gan = c.createGain();
    gan.gain.value = 0.5;
    fuente.connect(filtro).connect(gan).connect(c.destination);
    fuente.start(c.currentTime + (comienzo || 0));
  }

  /** Sube `pasos` semitonos: la misma melodía, más aguda. */
  function subir(f, pasos) { return f * Math.pow(2, pasos / 12); }

  /**
   * `n` cambia algunos sonidos: en 'acierto' es la racha (cada acierto
   * seguido suena un poco más agudo, como una escalera), en 'pop' el
   * número que se está contando.
   */
  function tocar(nombre, n) {
    if (!Almacen.sonidoActivo()) return;
    try {
      switch (nombre) {
        case 'acierto': {                     // arpegio ascendente alegre
          var escalon = Math.min(n || 0, 7);
          nota(subir(660, escalon), 0, .12, 'triangle');
          nota(subir(880, escalon), .09, .16, 'triangle');
          break;
        }
        case 'racha':                         // la fanfarria chiquita de una racha
          nota(784, 0, .1, 'triangle', .14);
          nota(988, .08, .1, 'triangle', .14);
          nota(1175, .16, .1, 'triangle', .14);
          nota(1568, .24, .22, 'triangle', .12);
          break;
        case 'pop': {                         // contar tocando: cada cosa un poco más aguda
          var k = Math.min(Math.max(n || 1, 1), 12) - 1;
          nota(subir(392, k * 2), 0, .09, 'sine', .16);
          break;
        }
        case 'ficha':                         // una ficha que se acomoda
          nota(600, 0, .06, 'triangle', .1);
          nota(760, .05, .07, 'triangle', .08);
          break;
        case 'aplauso':
          palmada(0);
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
