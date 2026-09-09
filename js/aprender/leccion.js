/* ============================================================
   Visor de lecciones: muestra los pasos de a uno, con los puntitos
   de progreso arriba y el botón para avanzar abajo. Al terminar
   ofrece el juego donde practicar lo que se acaba de leer.
   ============================================================ */
window.Leccion = (function () {
  'use strict';

  var leccion = null;
  var paso = 0;
  var alJugar = null;         // qué hacer cuando toca "practicar jugando"

  function abrir(id, ganchos) {
    leccion = Lecciones.porId(id);
    if (!leccion) return false;
    paso = 0;
    alJugar = ganchos && ganchos.alJugar;
    pintar();
    return true;
  }

  function total() { return leccion.pasos.length; }
  function enElFinal() { return paso >= total(); }

  function pintar() {
    Util.$('leccion-titulo').textContent = leccion.icono + ' ' + leccion.titulo;
    pintarPuntitos();
    if (enElFinal()) pintarFinal();
    else pintarPaso(leccion.pasos[paso]);
    Util.$('leccion-avance').textContent = enElFinal()
      ? '' : 'Paso ' + (paso + 1) + ' de ' + total();
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
    siguiente.textContent = paso === total() - 1 ? '¡Terminé!' : 'Siguiente';
    siguiente.hidden = false;
  }

  function pintarFinal() {
    var caja = Util.$('leccion-cuerpo');
    Util.vaciar(caja);

    var tarjeta = Util.crear('div', 'paso-tarjeta paso-final');
    tarjeta.appendChild(Util.crear('div', 'final-icono', '🎓'));
    tarjeta.appendChild(Util.crear('h2', 'paso-titulo', '¡Listo!'));
    tarjeta.appendChild(Util.crear('p', 'paso-texto',
      'Ya sabés ' + leccion.titulo.toLowerCase() + '. La mejor manera de que no se te olvide es usarlo.'));

    if (leccion.juego && alJugar) {
      var btn = Util.crear('button', 'btn-gigante', 'Practicar jugando');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        Sonido.tocar('clic');
        alJugar(leccion.juego);
      });
      tarjeta.appendChild(btn);
    }
    caja.appendChild(tarjeta);

    Util.$('btn-leccion-atras').hidden = false;
    Util.$('btn-leccion-siguiente').hidden = true;
    Almacen.marcarLeccion(leccion.id);
  }

  function siguiente() {
    if (enElFinal()) return;
    paso++;
    Sonido.tocar('clic');
    if (enElFinal()) Sonido.tocar('fin');
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
    actual: function () { return leccion; }
  };
})();
