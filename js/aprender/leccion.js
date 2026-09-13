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
      truco.appendChild(Util.crear('span', 'truco-icono', '💡'));
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
    tarjeta.appendChild(Util.crear('div', 'final-icono', '✏️'));
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

  /** Cómo le fue en el ejercicio. */
  function pintarResultado() {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);
    var r = resultado;

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final paso-resultado' +
                                    (r.aprobado ? ' aprobado' : ''));
    tarjeta.appendChild(Util.crear('div', 'final-icono', r.aprobado ? '🎓' : '💪'));
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
    if (r.monedas) {
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
    tarjeta.appendChild(Util.crear('div', 'final-icono', '🎓'));
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
      return [p.titulo + '.', p.texto, p.truco ? 'Un truco: ' + p.truco : null];
    }
    var tarjeta = Util.$('leccion-cuerpo');
    var partes = [];
    tarjeta.querySelectorAll('.paso-titulo, .paso-texto, .resultado-cifra, .ejercicio-regla')
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
