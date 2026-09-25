/* ============================================================
   Visor de lecciones: muestra los pasos de a uno, con los puntitos
   de progreso arriba y el botón para avanzar abajo.

   Una lección tiene tres partes:
     1. los pasos, que la voz va leyendo;
     2. el ejercicio: unas preguntas de un juego, elegidas para lo que se
        acaba de explicar, que el chico tiene que hacer para terminarla;
     3. el resultado del ejercicio: completada, o «probá de nuevo».

   Antes terminaba en «¡Listo!» y un botón opcional para ir a jugar. La
   lección se daba por leída con sólo llegar al final, y nadie sabía si
   se había entendido algo.
   ============================================================ */
window.Leccion = (function () {
  'use strict';

  var leccion = null;
  var paso = 0;
  var ganchos = {};
  var resultado = null;       // lo que dejó el ejercicio, si se vuelve de él
  var respondidas = {};       // número de paso -> { bien, texto } de su predicción

  /**
   * Abre una lección. `estado` sirve para volver a una parte:
   *   { fase: 'ejercicio' }             directo a la tarjeta del ejercicio
   *   { fase: 'resultado', resultado }  al resultado del ejercicio
   */
  function abrir(id, nuevosGanchos, estado) {
    leccion = Lecciones.porId(id);
    if (!leccion) return false;
    ganchos = nuevosGanchos || {};
    resultado = estado && estado.fase === 'resultado' ? estado.resultado : null;
    respondidas = {};
    paso = estado && estado.fase ? total() : 0;
    pintar();
    return true;
  }

  function total() { return leccion.pasos.length; }
  function enElFinal() { return paso >= total(); }

  function pintar() {
    /* El ícono es el nombre de un dibujo, no un emoji: pegado con un +
       el título salía «silabas Qué es una sílaba», con el nombre del
       archivo adelante. */
    var titulo = Util.$('leccion-titulo');
    Util.vaciar(titulo);
    if (Iconos.existe(leccion.icono)) {
      titulo.appendChild(Iconos.crear(leccion.icono, 'ico-titulo'));
    } else if (leccion.icono) {
      titulo.appendChild(Util.crear('span', null, leccion.icono + ' '));
    }
    titulo.appendChild(Util.crear('span', null, leccion.titulo));
    pintarPuntitos();
    if (!enElFinal()) pintarPaso(leccion.pasos[paso]);
    // el «¿por qué?» va cuando le salió: si no, primero tiene que volver a probar
    else if (resultado && resultado.aprobado && leccion.reflexion && !resultado.reflexionada) pintarReflexion();
    else if (resultado) pintarResultado();
    else if (leccion.ejercicio && ganchos.alEjercitar) pintarEjercicio();
    else pintarFinal();
    Util.$('leccion-avance').textContent = enElFinal()
      ? '' : 'Paso ' + (paso + 1) + ' de ' + total();
    pintarBotonVoz();
    leerSiCorresponde();
  }

  function pintarPuntitos() {
    var caja = Util.$('leccion-puntitos');
    Util.vaciar(caja);
    for (var i = 0; i <= total(); i++) {
      var p = Util.crear('span', 'puntito' + (i < paso ? ' hecho' : (i === paso ? ' actual' : '')));
      caja.appendChild(p);
    }
  }

  function pintarPaso(datos) {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta');
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo', datos.titulo));

    /* Lecciones activas: si el paso trae una predicción, primero se le
       pregunta al chico qué le parece, y recién después se muestra la
       explicación. Contestar antes de leer le da algo propio contra qué
       comparar lo que lee; tocar «Siguiente» no le da nada. */
    if (datos.prediccion && !respondidas[paso]) {
      pintarPrediccion(caja, tarjeta, datos.prediccion);
      return;
    }
    if (datos.prediccion) tarjeta.appendChild(cartelDeRespuesta(respondidas[paso]));

    var texto = Util.crear('p', 'paso-texto');
    texto.innerHTML = datos.texto;          // el contenido es nuestro, no del usuario
    tarjeta.appendChild(texto);

    if (datos.visual) {
      var visual = Util.crear('div', 'paso-visual');
      visual.innerHTML = datos.visual();
      tarjeta.appendChild(visual);
    }

    if (datos.video) {
      var marco = Util.crear('div', 'paso-video');
      var iframe = document.createElement('iframe');
      iframe.src = datos.video;
      iframe.title = datos.titulo;
      iframe.loading = 'lazy';
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');
      marco.appendChild(iframe);
      marco.appendChild(Util.crear('p', 'paso-nota', 'Este video necesita internet.'));
      tarjeta.appendChild(marco);
    }

    if (datos.truco) {
      var truco = Util.crear('div', 'paso-truco');
      truco.appendChild(Iconos.crear('lamparita', 'truco-icono'));
      truco.appendChild(Util.crear('span', null, datos.truco));
      tarjeta.appendChild(truco);
    }

    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = paso === 0;
    var siguiente = Util.$('btn-leccion-siguiente');
    var ultimo = paso === total() - 1;
    siguiente.textContent = !ultimo ? 'Siguiente'
      : (leccion.ejercicio && ganchos.alEjercitar ? '¡A practicar!' : '¡Terminé!');
    siguiente.hidden = false;
  }

  /** La tarjeta de «ahora te toca a vos». */
  function pintarEjercicio() {
    var ej = leccion.ejercicio;
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final paso-ejercicio');
    tarjeta.appendChild(Mascota.crear('hola', 'final-mascota'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¡Ahora te toca a vos!'));
    tarjeta.appendChild(Util.crear('p', 'paso-texto', ej.consigna));
    tarjeta.appendChild(Util.crear('p', 'ejercicio-regla',
      Util.plural(ej.cantidad || 5, 'pregunta') + ' · Para completar la lección tenés que acertar ' +
      aprobarCon(ej) + '.'));

    var btn = Util.crear('button', 'btn-gigante', 'Empezar el ejercicio');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      Sonido.tocar('clic');
      ganchos.alEjercitar(leccion);
    });
    tarjeta.appendChild(btn);
    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = false;
    Util.$('btn-leccion-siguiente').hidden = true;
  }

  /** Cuántas hay que acertar: cuatro de cinco, el 80%. */
  function aprobarCon(ej) {
    return Math.ceil((ej.cantidad || 5) * 0.8);
  }

  /* ---------------------- pensar, no sólo leer ---------------------- */

  /** Las opciones de una pregunta de la lección, mezcladas. */
  function opcionesDe(textos, alElegir) {
    var caja = Util.crear('div', 'leccion-opciones');
    Util.mezclar(textos.map(function (t, i) { return { texto: t, i: i }; })).forEach(function (o) {
      var b = Util.crear('button', 'leccion-opcion', o.texto);
      b.type = 'button';
      b.setAttribute('data-i', String(o.i));
      b.addEventListener('click', function () { alElegir(o.i, b, caja); });
      caja.appendChild(b);
    });
    return caja;
  }

  function cartelDeRespuesta(r) {
    return Util.crear('p', 'leccion-respuesta ' + (r.bien ? 'bien' : 'mal'), r.texto);
  }

  /** Un paso con predicción, antes de contestarla. */
  function pintarPrediccion(caja, tarjeta, pred) {
    tarjeta.appendChild(Util.crear('p', 'paso-texto prediccion-pregunta', pred.pregunta));
    tarjeta.appendChild(opcionesDe(pred.opciones, function (i) {
      var bien = i === pred.correcta;
      Sonido.tocar(bien ? 'acierto' : 'clic');
      respondidas[paso] = {
        bien: bien,
        texto: (bien ? '¡Bien pensado! ' : 'Era «' + pred.opciones[pred.correcta] + '». ') + pred.explicacion
      };
      pintar();
    }));
    caja.appendChild(tarjeta);
    Util.$('btn-leccion-atras').hidden = paso === 0;
    // hasta que no contesta, no hay «Siguiente»: la gracia es pensarlo antes
    Util.$('btn-leccion-siguiente').hidden = true;
  }

  /**
   * «¿Por qué?» después del ejercicio. Andamiaje: hacer bien las cuentas
   * no alcanza, hay que poder decir por qué se hacen así. Se elige la
   * razón entre tres, porque hay chicos de cuatro años que todavía no
   * escriben; y se propone contárselo a un grande, que es la parte social
   * que un chico solo con una pantalla no tiene.
   */
  function pintarReflexion() {
    var ref = leccion.reflexion;
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final paso-reflexion');
    tarjeta.appendChild(Mascota.crear('piensa', 'final-mascota'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¿Por qué?'));
    tarjeta.appendChild(Util.crear('p', 'paso-texto reflexion-pregunta', ref.pregunta));
    tarjeta.appendChild(opcionesDe(ref.razones, function (i, elegida, opciones) {
      var bien = i === ref.correcta;
      Sonido.tocar(bien ? 'acierto' : 'clic');
      opciones.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      elegida.classList.add(bien ? 'elegida-bien' : 'elegida-mal');
      if (!bien) opciones.querySelector('[data-i="' + ref.correcta + '"]').classList.add('elegida-bien');

      var respuesta = (bien ? '¡Eso! ' : 'No es por eso. ') + ref.porque;
      tarjeta.appendChild(cartelDeRespuesta({ bien: bien, texto: respuesta }));
      if (ref.grande) tarjeta.appendChild(Util.crear('p', 'reflexion-grande', ref.grande));
      tarjeta.appendChild(boton('btn-gigante', 'Ver cómo me fue', function () {
        resultado.reflexionada = true;
        pintar();
      }));
      if (Voz.hay() && Almacen.vozActiva()) Voz.decir([respuesta, ref.grande]);
    }));
    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = true;
    Util.$('btn-leccion-siguiente').hidden = true;
  }

  /** Cómo le fue en el ejercicio. */
  function pintarResultado() {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);
    var r = resultado;

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final paso-resultado' +
                                    (r.aprobado ? ' aprobado' : ''));
    tarjeta.appendChild(Mascota.crear('hola', 'final-mascota'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo',
      r.aprobado ? '¡Completaste la lección!' : '¡Casi!'));

    var cifra = Util.crear('p', 'resultado-cifra');
    cifra.appendChild(Util.crear('b', null, String(r.aciertos)));
    cifra.appendChild(document.createTextNode(' de ' + r.total));
    tarjeta.appendChild(cifra);

    tarjeta.appendChild(Util.crear('p', 'paso-texto', r.aprobado
      ? 'Ya sabés ' + leccion.titulo.toLowerCase() + '. Ahora seguí practicando jugando.'
      : r.aciertos >= aprobarCon(leccion.ejercicio) - 1
        ? 'Te faltó una sola. Probá de nuevo, que sale.'
        : 'Mirá la lección otra vez y después probá de nuevo: vas a ver que sale.'));
    if (r.monedas && Almacen.control().tienda) {
      tarjeta.appendChild(Util.crear('p', 'resultado-monedas', '+' + r.monedas + ' monedas'));
    }

    var botones = Util.crear('div', 'resultado-botones');
    if (r.aprobado) {
      if (leccion.juego && ganchos.alJugar) {
        botones.appendChild(boton('btn-gigante',
          'Jugar a ' + (ganchos.nombreDelJuego ? ganchos.nombreDelJuego(leccion.juego) : 'este juego'),
          function () { ganchos.alJugar(leccion.juego); }));
      }
      if (ganchos.alVolver) {
        botones.appendChild(boton('btn-secundario', 'Más lecciones',
          function () { ganchos.alVolver(leccion); }));
      }
    } else {
      botones.appendChild(boton('btn-gigante', 'Probar de nuevo',
        function () { ganchos.alEjercitar(leccion); }));
      botones.appendChild(boton('btn-secundario', 'Leer la lección otra vez', function () {
        resultado = null;
        paso = 0;
        pintar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }));
    }
    tarjeta.appendChild(botones);
    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = true;
    Util.$('btn-leccion-siguiente').hidden = true;
  }

  function boton(clase, texto, alTocar) {
    var b = Util.crear('button', clase, texto);
    b.type = 'button';
    b.addEventListener('click', function () {
      Sonido.tocar('clic');
      alTocar();
    });
    return b;
  }

  /** Para las lecciones que no tienen ejercicio: se terminan leyendo. */
  function pintarFinal() {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final');
    tarjeta.appendChild(Mascota.crear('hola', 'final-mascota'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¡Listo!'));
    tarjeta.appendChild(Util.crear('p', 'paso-texto',
      'Ya sabés ' + leccion.titulo.toLowerCase() + '. La mejor manera de que no se te olvide es usarlo.'));

    if (leccion.juego && ganchos.alJugar) {
      tarjeta.appendChild(boton('btn-gigante', 'Practicar jugando',
        function () { ganchos.alJugar(leccion.juego); }));
    }
    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = false;
    Util.$('btn-leccion-siguiente').hidden = true;
    Almacen.marcarLeccion(leccion.id);
  }

  /* ---------------------- la voz ---------------------- */

  /** Lo que hay para decir en la pantalla de ahora, como HTML. */
  function textoParaLeer() {
    if (!enElFinal()) {
      var p = leccion.pasos[paso];
      // con la predicción sin contestar se leen la pregunta y las opciones,
      // en el orden de la pantalla; la explicación todavía no
      if (p.prediccion && !respondidas[paso]) return leerTarjeta();
      var dicho = p.prediccion ? [respondidas[paso].texto] : [];
      return [p.titulo + '.'].concat(dicho, [p.texto, p.truco ? 'Un truco: ' + p.truco : null]);
    }
    return leerTarjeta();
  }

  /** Lo que está escrito en la tarjeta de ahora, en orden. */
  function leerTarjeta() {
    var partes = [];
    Util.$('leccion-cuerpo')
      .querySelectorAll('.paso-titulo, .paso-texto, .resultado-cifra, .ejercicio-regla, .leccion-opcion')
      .forEach(function (e) { partes.push(e.textContent + '.'); });
    return partes;
  }

  function leer() {
    Voz.decir(textoParaLeer(), { alTerminar: pintarBotonVoz });
    pintarBotonVoz(true);
  }

  /* Se lee sola al aparecer. Va con una demora de un pestañeo porque la
     pantalla se muestra justo después de armarse, y mostrar una pantalla
     corta cualquier voz que venga de la anterior. */
  function leerSiCorresponde() {
    if (!Voz.hay() || !Almacen.vozActiva()) return;
    setTimeout(function () {
      if (Util.$('pantalla-leccion').hidden) return;
      leer();
    }, 60);
  }

  function pintarBotonVoz(hablando) {
    var b = Util.$('btn-leccion-voz');
    if (!b) return;
    b.hidden = !Voz.hay();
    var activo = hablando === true || (hablando !== false && Voz.leyendo());
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    Util.$('btn-leccion-voz-texto').textContent = activo ? 'Callar' : 'Escuchar';
  }

  function alternarVoz() {
    if (Voz.leyendo()) {
      Voz.parar();
      pintarBotonVoz(false);
    } else {
      leer();
    }
  }

  function siguiente() {
    if (enElFinal()) return;
    paso++;
    Sonido.tocar('clic');
    pintar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function atras() {
    if (paso === 0) return;
    paso--;
    Sonido.tocar('clic');
    pintar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return {
    abrir: abrir,
    siguiente: siguiente,
    atras: atras,
    alternarVoz: alternarVoz,
    aprobarCon: aprobarCon,
    actual: function () { return leccion; }
  };
})();
