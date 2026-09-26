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
         pista: function (item, intento, respuesta) { return '...'; },
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

  /* ---------------------- lo que se dice al errar ----------------------

     Equivocarse es parte de aprender, y el cartel lo tiene que decir así.
     Nunca «mal», ni una cuenta regresiva de intentos («te queda 1»: los
     corazones ya lo muestran, y dicho suena a amenaza). Primero algo amable
     y verdadero —«¡Casi!» sólo lo dice cada juego cuando de verdad estuvo
     cerca—, si se puede algo que enseñe, y al final una invitación a
     probar otra vez. Van variando, como cuando lo dice una persona. */
  var ANIMO = ['¡Buen intento!', 'Todavía no.', 'Mmm, esa no era.'];
  var OTRA_VEZ = ['¡Probá otra vez!', '¡Otra vez, sin apuro!', '¡Dale, que vos podés!'];
  var UNA_MAS = ['¡Una vez más, vos podés!', '¡Una más, con calma!', '¡Dale, que ya casi!'];
  // si el juego ya invita a hacer algo («Contá…», «Pensá…»), no hace falta otra invitación
  var YA_INVITA = /(?:^|[\s¿¡])(?:Contá|Tocá|Decí|Pensá|Mirá|Leé|Escuchá|Probá|Fijate)(?=[\s:,.])/;
  // cuando al final se muestra la que era: lo que se aprendió, no lo que se perdió
  var CONSUELO = ['¡Ahora ya lo sabés!', 'La próxima te sale.', 'Así se aprende.'];

  /* ---------------------- cartel de mensajes ---------------------- */
  function aviso(texto, tipo) {
    var el = Util.$('aviso');
    /* Con sus marcas: <b> y las palabras en inglés con <span lang>, así la
       voz las lee en inglés. El texto es de los juegos, no del usuario;
       por las dudas, cualquier otra etiqueta se saca. Va todo en un solo
       renglón de texto: el cartel es flex, y suelto cada <b> sería un
       pedazo aparte. */
    Util.vaciar(el);
    var renglon = Util.crear('span', 'aviso-texto');
    renglon.innerHTML = String(texto).replace(/<(?!\/?(?:b|span)\b)[^>]*>/g, '');
    el.appendChild(renglon);
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
      racha: 0,             // aciertos seguidos al primer intento
      mejorRacha: 0,
      bloqueado: false,
      inicio: Date.now()    // para saber cuánto duró
    };
    document.body.classList.toggle('rindiendo', e.mudo);
    pintarRacha();
    mostrarRonda();
  }

  function actual() { return e ? e.items[e.indice] : null; }

  function mostrarRonda() {
    e.intento = 0;
    e.bloqueado = false;
    limpiarAviso();
    e.cfg.render(actual(), e.indice);
    pintarHUD();
    entrar();
  }

  /* Cada pregunta nueva entra deslizándose: sin esto, el cambio de una a
     la otra era un parpadeo y no se notaba que había pasado algo. */
  var finDeEntrada = null;
  function entrar() {
    ['pregunta', 'zona-opciones'].forEach(function (id) {
      var el = Util.$(id);
      if (!el) return;
      el.classList.remove('entra');
      void el.offsetWidth;
      el.classList.add('entra');
    });
    /* La clase se va al terminar de entrar: si se quedara, le ganaría a
       la animación del botón que se acierta o se erra. */
    clearTimeout(finDeEntrada);
    finDeEntrada = setTimeout(function () {
      ['pregunta', 'zona-opciones'].forEach(function (id) {
        var el = Util.$(id);
        if (el) el.classList.remove('entra');
      });
    }, 560);
  }

  /* La pantalla reacciona: la mascota salta con un acierto y duda con un
     error. El motor avisa con una clase (el movimiento lo pone el CSS) y le
     cambia la cara a la mascota del globo. */
  var reaccionEnCurso = null, caraEnCurso = null;
  function reaccionar(clase) {
    var pantalla = Util.$('pantalla-juego');
    if (!pantalla) return;
    pantalla.classList.remove('reaccion-bien', 'reaccion-mal');
    void pantalla.offsetWidth;
    pantalla.classList.add(clase);
    clearTimeout(reaccionEnCurso);
    reaccionEnCurso = setTimeout(function () { pantalla.classList.remove(clase); }, 900);
    /* Y le cambia la cara un ratito: festeja el acierto y, si no salió,
       levanta el puño para darle ánimo (nunca una cara triste). */
    var mascota = pantalla.querySelector('.pregunta-mascota');
    if (mascota && window.Mascota) {
      Mascota.gesto(mascota, clase === 'reaccion-bien' ? 'festejo' : 'animo');
      clearTimeout(caraEnCurso);
      caraEnCurso = setTimeout(function () { Mascota.gesto(mascota, 'normal'); }, 1100);
    }
  }

  /* La racha: cuántas seguidas bien al primer intento. Con tres o más la
     barra se prende del color del fuego y aparece el cartelito; se corta
     con el primer error. En el examen no hay racha: no se dice nada. */
  var HITOS = [3, 5, 10, 15, 20, 25, 30];
  function pintarRacha() {
    var chip = Util.$('racha-juego');
    var hud = document.querySelector('.hud');
    var n = e && !e.mudo ? e.racha : 0;
    if (hud) hud.classList.toggle('en-racha', n >= 3);
    if (!chip) return;
    chip.hidden = n < 2;
    if (n < 2) return;
    Util.vaciar(chip);
    chip.appendChild(Iconos.crear('fuego'));
    chip.appendChild(Util.crear('b', null, String(n)));
    chip.setAttribute('aria-label', n + ' seguidas');
    chip.classList.remove('sube');
    void chip.offsetWidth;
    chip.classList.add('sube');
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
      var v = Util.crear('span', i < e.intento ? 'gastada' : '');
      v.appendChild(Iconos.crear('corazon'));
      vidas.appendChild(v);
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

    if (e.intento === 0) {
      e.racha++;
      e.mejorRacha = Math.max(e.mejorRacha, e.racha);
    } else {
      e.racha = 0;
    }
    var hito = e.intento === 0 && HITOS.indexOf(e.racha) >= 0;

    if (e.cfg.alAcertar) e.cfg.alAcertar(item, respuesta);
    Sonido.tocar('acierto', e.racha);
    if (hito) luego(function () { Sonido.tocar('racha'); }, 180);
    reaccionar('reaccion-bien');
    pintarRacha();

    Util.$('marcador-puntos').textContent = e.puntos;
    var caja = Util.$('marcador-puntos').parentNode;
    caja.classList.add('sube');
    luego(function () { caja.classList.remove('sube'); }, 400);

    /* El acierto dice qué pasó, no cuántos puntos dio: los puntos
       compiten con el contenido en vez de reforzarlo. Si salió después de
       errar, se festeja eso: que lo pensó otra vez y no se rindió.
       Y si con éste llegó a una racha redonda, se festeja la racha. */
    aviso(hito ? '¡' + Util.plural(e.racha, 'seguida', 'seguidas').replace(/^\d+/, numeroEnLetras(e.racha)) + '!'
      : e.intento === 0 ? festejo()
      : e.intento === 1 ? '¡Bien! Lo pensaste otra vez y te salió.'
      : '¡Eso! No te rendiste, y te salió.', 'bien');
    luego(siguiente, hito ? ESPERA_ACIERTO + 350 : ESPERA_ACIERTO);
  }

  function numeroEnLetras(n) {
    return { 3: 'Tres', 5: 'Cinco', 10: 'Diez', 15: 'Quince', 20: 'Veinte', 25: 'Veinticinco', 30: 'Treinta' }[n] || String(n);
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
    e.racha = 0;
    pintarRacha();
    reaccionar('reaccion-mal');
    if (e.cfg.alFallar) e.cfg.alFallar(item, respuesta, quedan);

    if (e.intento >= e.intentos) {
      luego(revelar, 160);
      return;
    }

    // lo que dice el juego de esa respuesta («El gato hace «¡Miau!»»), o algo amable
    var propio = (e.cfg.textoFallo && e.cfg.textoFallo(item, respuesta, quedan)) || Util.alAzar(ANIMO);

    /* Andamiaje: cada intento que falla trae más ayuda que el anterior.
       Primero una pista para pensar («empezá por las unidades»), después
       una con el paso concreto, y recién al tercero la respuesta con su
       explicación. Sin esto, los intentos 2 y 3 eran sólo otra chance de
       tocar un botón, y con cuatro opciones se acertaba por descarte. */
    var pista = e.cfg.pista ? e.cfg.pista(item, e.intento, respuesta) : '';
    // el dibujito lo pone el cartel (la lamparita o la flecha de «otra vez»), no va escrito
    if (pista) aviso(propio + ' ' + pista, 'pista');
    else if (YA_INVITA.test(propio)) aviso(propio, 'mal');
    else aviso(propio + ' ' + Util.alAzar(quedan === 1 ? UNA_MAS : OTRA_VEZ), 'mal');

    luego(function () { if (e) e.bloqueado = false; }, ESPERA_FALLO);
  }

  function revelar() {
    var item = actual();
    e.errores.push(item);
    Sonido.tocar('revelar');
    if (e.cfg.alRevelar) e.cfg.alRevelar(item);
    var texto = e.cfg.textoRevelado ? e.cfg.textoRevelado(item) : 'Era esta.';
    // un cierre amable, salvo que el juego ya traiga el suyo («¡Ahora ya sabés dónde queda!»)
    var plano = String(texto).replace(/<[^>]*>/g, '').trim();
    if (!/!$/.test(plano)) {
      if (!/[.?…»)]$/.test(plano)) texto += '.';
      texto += ' ' + Util.alAzar(CONSUELO);
    }
    aviso(texto, 'dato');
    // una explicación larga necesita más tiempo para leerla
    var largo = String(texto).replace(/<[^>]*>/g, '').length;
    luego(pasarCuandoCalle, Math.min(4000, Math.max(ESPERA_REVELAR, largo * 45)));
  }

  /* Si la voz está leyendo la que era (de 4 a 7 se lee sola), se la
     espera antes de pasar: la pregunta siguiente la cortaba justo en la
     explicación, que es lo que había que aprender. Con un tope, por si
     la voz se queda colgada. */
  function pasarCuandoCalle() {
    var hasta = Date.now() + 5000;
    (function mirar() {
      if (!e) return;
      if (window.Voz && Voz.leyendo() && Date.now() < hasta) return luego(mirar, 200);
      siguiente();
    })();
  }

  function festejo() {
    return Util.alAzar(['¡Muy bien!', '¡Eso es!', '¡Bien pensado!', '¡Correcto!']);
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
      errores: e.errores.slice(),
      mejorRacha: e.mudo ? 0 : e.mejorRacha,
      // con un tope: una partida dejada abierta una hora no es una hora jugando
      segundos: Math.min(1800, Math.round((Date.now() - e.inicio) / 1000))
    };
    var alTerminar = e.cfg.alTerminar;
    e = null;
    pintarRacha();
    if (window.Opciones) Opciones.soltar();
    if (alTerminar) alTerminar(resultado);
  }

  /** Corta la partida en curso (al tocar "Volver", por ejemplo). */
  function abandonar() {
    limpiarTiempos();
    limpiarAviso();
    document.body.classList.remove('rindiendo');
    e = null;
    pintarRacha();
    if (window.Opciones) Opciones.soltar();
  }

  return {
    jugar: jugar,
    responder: responder,
    abandonar: abandonar,
    enJuego: function () { return e !== null; },
    intentoActual: function () { return e ? e.intento : 0; },
    /** El número de la pregunta de ahora (0 antes de arrancar). */
    indiceActual: function () { return e ? e.indice : 0; },
    /** ¿Se puede contestar ahora? (no mientras se muestra un acierto o un error) */
    libre: function () { return !!e && !e.bloqueado; },
    /** El examen no dice nada: los juegos lo usan para no delatar la respuesta. */
    mudo: function () { return !!e && e.mudo; },
    aviso: aviso,
    INTENTOS: INTENTOS,
    PUNTOS_POR_INTENTO: PUNTOS_POR_INTENTO
  };
})();
