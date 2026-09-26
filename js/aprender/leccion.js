/* ============================================================
   Visor de lecciones: muestra los pasos de a uno, con la barra de
   avance arriba y el botón para seguir abajo.

   Cada paso lo cuenta la mascota, desde un globito, con frases cortas
   (la voz las lee): una lección para chicos no puede ser un párrafo de
   manual. Abajo del globo va lo que se mira o se toca —el dibujo o la
   actividad—, y si hay, el truco y una pregunta para practicar. Es la
   misma forma que la pantalla de juego: la mascota pregunta, el chico hace.

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
  var practicadas = {};       // número de paso -> { bien, texto } cuando su práctica terminó

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
    practicadas = {};
    paso = estado && estado.fase ? total() : 0;
    Util.vaciar(Util.$('leccion-puntitos'));   // la barra de la lección anterior no se achica: se arma de nuevo
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

  /* Una barra que se llena, como la de los juegos: con los puntitos no
     se veía cuánto faltaba en una lección de siete pasos. */
  function pintarPuntitos() {
    var caja = Util.$('leccion-puntitos');
    var barra = caja.querySelector('.leccion-barra i');
    if (!barra) {
      Util.vaciar(caja);
      var riel = Util.crear('span', 'leccion-barra');
      riel.setAttribute('role', 'progressbar');
      riel.setAttribute('aria-valuemin', '0');
      barra = Util.crear('i');
      riel.appendChild(barra);
      caja.appendChild(riel);
    }
    var hechos = Math.min(paso, total());
    barra.parentNode.setAttribute('aria-valuemax', String(total()));
    barra.parentNode.setAttribute('aria-valuenow', String(hechos));
    requestAnimationFrame(function () {
      barra.style.transform = 'scaleX(' + (total() ? hechos / total() : 0) + ')';
    });
  }

  function pintarPaso(datos) {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta');
    /* Lecciones activas: si el paso trae una predicción, primero la
       mascota le pregunta al chico qué le parece, y recién después
       explica. Contestar antes de leer le da algo propio contra qué
       comparar lo que lee; tocar «Siguiente» no le da nada. */
    var preguntando = datos.prediccion && !respondidas[paso];
    var respuesta = datos.prediccion && respondidas[paso];
    var gesto = datos.gesto ||
      (preguntando ? 'piensa' : respuesta ? (respuesta.bien ? 'festejo' : 'hola') : paso === 0 ? 'hola' : 'normal');
    tarjeta.appendChild(narrador(preguntando ? datos.prediccion.pregunta : datos.texto, gesto, respuesta));

    // lo que se mira o se toca, abajo del globo
    if (datos.visual && !(preguntando && datos.prediccion.sinDibujo)) {
      var visual = Util.crear('div', 'paso-visual');
      visual.innerHTML = datos.visual();
      tarjeta.appendChild(visual);
    }
    if (datos.interactivo && !preguntando) {
      // una función cuando usa dibujos de un juego, que se cargan después
      Actividades.montar(tarjeta, typeof datos.interactivo === 'function' ? datos.interactivo() : datos.interactivo);
    }

    if (preguntando) {
      pintarPrediccion(caja, tarjeta, datos.prediccion);
      return;
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
      truco.appendChild(Util.crear('span', null, Util.cuentasEnteras(datos.truco)));
      tarjeta.appendChild(truco);
    }

    var falta = datos.practica && !practicadas[paso];
    if (datos.practica) pintarPractica(tarjeta, datos.practica);

    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = paso === 0;
    var siguiente = Util.$('btn-leccion-siguiente');
    var ultimo = paso === total() - 1;
    siguiente.textContent = !ultimo ? 'Siguiente'
      : (leccion.ejercicio && ganchos.alEjercitar ? '¡A practicar!' : '¡Terminé!');
    // con una práctica sin contestar, no se sigue: la gracia es probarlo
    siguiente.hidden = falta;
  }

  /**
   * La práctica: una pregunta después de la explicación, para usar lo que
   * se acaba de ver. A diferencia de la predicción, ésta hay que
   * contestarla bien para seguir; si sale mal se dice por qué y se prueba
   * otra vez, y al segundo error se muestra cuál era para no trabarse.
   * Antes llevaba un cartelito arriba, «¿Y vos?», que no decía nada: la
   * pregunta sola ya se entiende.
   */
  function pintarPractica(tarjeta, pr) {
    var bloque = Util.crear('div', 'paso-practica');
    var pregunta = Util.crear('p', 'paso-texto practica-pregunta');
    pregunta.innerHTML = Util.cuentasEnteras(pr.pregunta);
    bloque.appendChild(pregunta);
    var errores = 0;
    var aquiPaso = paso;
    var cartel = null;
    var opciones = opcionesDe(pr.opciones, pr.enOrden, function (i, elegida, todas) {
      if (practicadas[aquiPaso]) return;
      var bien = i === pr.correcta;
      if (cartel) cartel.remove();
      var mascota = tarjeta.querySelector('.narrador-mascota');
      if (mascota) Mascota.gesto(mascota, bien ? 'festejo' : 'animo');
      if (bien) {
        practicadas[aquiPaso] = { bien: true, texto: Util.otraDe(BIEN) + ' ' + (pr.explicacion || '') };
        Sonido.tocar('acierto');
        elegida.classList.add('elegida-bien');
        todas.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        cartel = cartelDeRespuesta(practicadas[aquiPaso]);
        bloque.appendChild(cartel);
        Util.$('btn-leccion-siguiente').hidden = false;
        traerALaVista(Util.$('btn-leccion-siguiente'));
        if (Voz.hay() && Almacen.vozActiva()) Voz.decir(cartel.innerHTML);
        return;
      }
      errores++;
      Sonido.tocar('error');
      elegida.classList.add('elegida-mal');
      elegida.disabled = true;
      if (errores >= 2) {
        // no se traba: se muestra cuál era y se puede seguir
        practicadas[aquiPaso] = { bien: false, texto: '¡No pasa nada! Era «' + pr.opciones[pr.correcta] + '». ' +
                                                      (pr.explicacion || '') + ' ¡Ahora ya lo sabés!' };
        marcarLaBuena(todas, pr.correcta);
        cartel = cartelDeRespuesta(practicadas[aquiPaso]);
        Util.$('btn-leccion-siguiente').hidden = false;
      } else {
        cartel = cartelDeRespuesta({ bien: false, texto: Util.otraDe(ANIMO) + ' ' +
                                                         (pr.pista ? pr.pista + ' ' + Util.otraDe(OTRA_VEZ)
                                                                   : 'Mirá otra vez con calma y probá de nuevo.') });
      }
      bloque.appendChild(cartel);
      traerALaVista(errores >= 2 ? Util.$('btn-leccion-siguiente') : cartel);
      // el HTML y no el texto: así la palabra en inglés se lee en inglés
      if (Voz.hay() && Almacen.vozActiva()) Voz.decir(cartel.innerHTML);
    });
    bloque.appendChild(opciones);
    // si vuelve a un paso que ya practicó, queda contestado como lo dejó
    var hecha = practicadas[paso];
    if (hecha) {
      marcarLaBuena(opciones, pr.correcta);
      bloque.appendChild(cartelDeRespuesta(hecha));
    }
    tarjeta.appendChild(bloque);
  }

  function marcarLaBuena(opciones, correcta) {
    var buena = opciones.querySelector('[data-i="' + correcta + '"]');
    if (buena) buena.classList.add('elegida-bien');
    opciones.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
  }

  /** La tarjeta de «ahora te toca a vos». */
  function pintarEjercicio() {
    var ej = leccion.ejercicio;
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final paso-ejercicio');
    tarjeta.appendChild(Mascota.crear(leccion.aprendiste ? 'festejo' : 'hola', 'final-mascota'));
    /* Antes del ejercicio, lo que aprendió, en dos o tres frases: cerrar
       con un resumen ayuda a que quede, y es lo que un grande le
       preguntaría («¿qué aprendiste?»). */
    if (leccion.aprendiste) {
      tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¡Aprendiste algo nuevo!'));
      var lista = Util.crear('ul', 'aprendiste');
      leccion.aprendiste.forEach(function (idea) {
        var item = Util.crear('li');
        item.appendChild(Iconos.crear('tilde', 'aprendiste-tilde'));
        var texto = Util.crear('span');
        texto.innerHTML = Util.cuentasEnteras(idea);
        item.appendChild(texto);
        lista.appendChild(item);
      });
      tarjeta.appendChild(lista);
      tarjeta.appendChild(Util.crear('h3', 'ejercicio-titulo', '¡Ahora te toca a vos!'));
    } else {
      tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¡Ahora te toca a vos!'));
    }
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

  /* Lo que dice la mascota cuando se contesta una pregunta de la lección:
     lo mismo que en los juegos (ver js/nucleo/motor.js), algo cálido
     primero y una invitación al final, nunca un reto. */
  var BIEN = ['¡Eso!', '¡Muy bien!', '¡Genial!', '¡Bien pensado!'];
  var ANIMO = ['¡Buen intento!', '¡Uy, esa no era!', '¡No pasa nada!'];
  var OTRA_VEZ = ['¡Probá otra vez!', '¡Dale, otra vez!', '¡Vos podés!'];

  /** Las opciones de una pregunta de la lección, mezcladas (o en su orden,
      si son categorías: herbívoro, carnívoro y omnívoro van siempre así). */
  function opcionesDe(textos, enOrden, alElegir) {
    var caja = Util.crear('div', 'leccion-opciones');
    var lista = textos.map(function (t, i) { return { texto: t, i: i }; });
    (enOrden ? lista : Util.mezclar(lista)).forEach(function (o) {
      var b = Util.crear('button', 'leccion-opcion');
      b.innerHTML = o.texto;              // el contenido es nuestro, no del usuario
      b.type = 'button';
      b.setAttribute('data-i', String(o.i));
      b.addEventListener('click', function () { alElegir(o.i, b, caja); });
      caja.appendChild(b);
    });
    return caja;
  }

  function cartelDeRespuesta(r) {
    var p = Util.crear('p', 'leccion-respuesta ' + (r.bien ? 'bien' : 'mal'));
    p.innerHTML = Util.cuentasEnteras(r.texto);   // el contenido es nuestro, no del usuario
    return p;
  }

  /** En el celular, lo que aparece abajo de las opciones queda fuera de la
      pantalla: se corre lo justo para que se vea. */
  function traerALaVista(el) {
    if (!el || !el.scrollIntoView) return;
    var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'nearest', behavior: quieto ? 'auto' : 'smooth' });
  }

  /** La mascota contando: ella a la izquierda y lo que dice en un globito.
      Después de una predicción, primero reacciona a lo que contestó el
      chico y recién después sigue: en ese orden se lee y lo dice la voz. */
  function narrador(html, gesto, respuesta) {
    var fila = Util.crear('div', 'narrador');
    fila.appendChild(Mascota.crear(gesto, 'narrador-mascota'));
    var globo = Util.crear('div', 'narrador-globo');
    if (respuesta) globo.appendChild(cartelDeRespuesta(respuesta));
    var texto = Util.crear('p', 'paso-texto');
    texto.innerHTML = Util.cuentasEnteras(html);  // el contenido es nuestro, no del usuario
    globo.appendChild(texto);
    fila.appendChild(globo);
    return fila;
  }

  /** Un paso con predicción, antes de contestarla: la pregunta ya está en el globo. */
  function pintarPrediccion(caja, tarjeta, pred) {
    tarjeta.appendChild(opcionesDe(pred.opciones, pred.enOrden, function (i) {
      var bien = i === pred.correcta;
      Sonido.tocar(bien ? 'acierto' : 'clic');
      /* Es una pregunta para pensar antes de saber: equivocarse acá es lo
         esperable, y se festeja que lo haya pensado. */
      respondidas[paso] = {
        bien: bien,
        texto: (bien ? Util.alAzar(['¡Bien pensado!', '¡Eso mismo!', '¡Muy bien pensado!']) + ' '
                     : '¡Buena idea! Pero era «' + pred.opciones[pred.correcta] + '». ') + pred.explicacion
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
    tarjeta.appendChild(opcionesDe(ref.razones, false, function (i, elegida, opciones) {
      var bien = i === ref.correcta;
      Sonido.tocar(bien ? 'acierto' : 'clic');
      opciones.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      elegida.classList.add(bien ? 'elegida-bien' : 'elegida-mal');
      if (!bien) opciones.querySelector('[data-i="' + ref.correcta + '"]').classList.add('elegida-bien');

      var respuesta = (bien ? Util.otraDe(BIEN) + ' ' : '¡Buena idea! Pero pensalo así: ') + ref.porque;
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
    tarjeta.appendChild(Mascota.crear(r.aprobado ? 'festejo' : 'animo', 'final-mascota'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo',
      r.aprobado ? '¡Completaste la lección!'
        : r.aciertos >= aprobarCon(leccion.ejercicio) - 1 ? '¡Casi!' : '¡Buen intento!'));

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
      var practica = p.practica && !practicadas[paso] ? [p.practica.pregunta] : [];
      // la consigna de «tocar la que es»: sin ella, el que no lee no sabe qué buscar
      var consigna = Util.$('leccion-cuerpo').querySelector('.act-consigna');
      return dicho.concat([p.texto, consigna && consigna.textContent ? consigna.innerHTML : null,
                           p.truco ? 'Un truco: ' + p.truco : null], practica);
    }
    return leerTarjeta();
  }

  /** Lo que está escrito en la tarjeta de ahora, en orden. */
  function leerTarjeta() {
    var partes = [];
    Util.$('leccion-cuerpo')
      .querySelectorAll('.paso-titulo, .aprendiste li, .ejercicio-titulo, .paso-texto, .resultado-cifra, .ejercicio-regla, .leccion-opcion')
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
