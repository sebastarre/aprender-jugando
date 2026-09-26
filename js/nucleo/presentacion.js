/* ============================================================
   «Conocé lo nuevo»: lo que trae un nivel, antes de preguntarlo.

   Los niveles del camino presentan cosas nuevas —dos colores en inglés,
   tres animales de la granja, las primeras rimas— y antes las
   preguntaban de entrada: un chico que nunca había escuchado «yellow»
   tenía que adivinar cuál era entre cuatro. Adivinar no enseña.

   Ahora, la primera vez que se juega un nivel, primero aparece cada cosa
   nueva en una tarjeta: su dibujo, cómo se llama y el dato, leído en voz
   alta para los chicos. Recién después arrancan las preguntas. Se puede
   saltar, y al volver a jugar un nivel ya pasado no aparece.

   Cada juego dice cómo se presenta una cosa con presentar(item), que
   devuelve { visual, titulo, texto }; los juegos de lista lo sacan solos
   de su repaso (ver Tablero.banco).
   ============================================================ */
window.Presentacion = (function () {
  'use strict';

  var MAXIMO = 8;             // más de ocho cosas nuevas es una lección, no un nivel
  var cola = [];
  var juego = null;
  var paso = 0;
  var alTerminar = null;

  function esChico() { return document.documentElement.classList.contains('registro-chico'); }

  function mostrar(elJuego, items, luego) {
    juego = elJuego;
    cola = items.slice(0, MAXIMO);
    paso = 0;
    alTerminar = luego;
    Util.$('pantalla-juego').classList.add('presentando');
    Util.$('presenta').hidden = false;
    Util.$('presenta-titulo').textContent = cola.length === 1 ? '¡Algo nuevo!' : '¡Cosas nuevas!';
    pintar();
  }

  function pintar() {
    var d = juego.presentar(cola[paso]) || {};
    var visual = Util.$('presenta-visual');
    visual.innerHTML = d.visual || '';
    visual.hidden = !d.visual;
    Util.$('presenta-nombre').innerHTML = d.titulo || '';
    Util.$('presenta-dato').innerHTML = d.texto || '';

    var puntos = Util.$('presenta-puntos');
    Util.vaciar(puntos);
    if (cola.length > 1) {
      cola.forEach(function (x, i) {
        puntos.appendChild(Util.crear('span', i < paso ? 'hecho' : i === paso ? 'ahora' : ''));
      });
    }
    var ultimo = paso === cola.length - 1;
    Util.$('presenta-seguir').textContent = ultimo ? '¡A jugar!' : 'Siguiente';
    Util.$('presenta-saltar').hidden = ultimo;
    Util.$('presenta-escuchar').hidden = !Voz.hay();

    // la tarjeta entra de nuevo, como una página que pasa
    var tarjeta = Util.$('presenta-tarjeta');
    tarjeta.classList.remove('entra');
    void tarjeta.offsetWidth;
    tarjeta.classList.add('entra');

    if (esChico() && Almacen.vozActiva()) setTimeout(leer, 120);
  }

  function leer() {
    if (!Voz.hay() || Util.$('presenta').hidden) return;
    Voz.decir([Util.$('presenta-nombre').innerHTML, Util.$('presenta-dato').innerHTML]);
  }

  function siguiente() {
    Sonido.despertar();
    if (paso < cola.length - 1) {
      paso++;
      Sonido.tocar('clic');
      pintar();
    } else {
      terminar();
    }
  }

  function cerrar() {
    Util.$('presenta').hidden = true;
    Util.$('pantalla-juego').classList.remove('presentando');
    Voz.parar();
  }

  function terminar() {
    cerrar();
    var f = alTerminar;
    alTerminar = null;
    if (f) f();
  }

  /** Si se va de la pantalla a la mitad, no arranca nada. */
  function cortar() {
    if (Util.$('presenta') && !Util.$('presenta').hidden) cerrar();
    alTerminar = null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!Util.$('presenta')) return;
    Util.$('presenta-seguir').addEventListener('click', siguiente);
    Util.$('presenta-saltar').addEventListener('click', function () {
      Sonido.tocar('clic');
      terminar();
    });
    Util.$('presenta-escuchar').addEventListener('click', function () {
      Sonido.despertar();
      leer();
    });
    // tocar el dibujo también lo dice
    Util.$('presenta-visual').addEventListener('click', leer);
  });

  return { mostrar: mostrar, cortar: cortar };
})();
