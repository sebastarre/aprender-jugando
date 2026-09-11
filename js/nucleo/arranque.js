/* ============================================================
   La cortina de arranque

   Lo primero que se ve al abrir la app es el nombre armándose letra
   por letra sobre el color de la portada, y recién después el inicio,
   que entra en cascada por abajo.

   El dibujo de la cortina está escrito a mano en el index.html y no lo
   arma este archivo, a propósito: entre que se toca el ícono y que
   terminan de cargar los veinte archivos de la app hay un momento de
   papel en blanco, que es justo la sensación seca que la cortina viene
   a tapar. Escrita en el HTML, la animación empieza con la primera
   pintada; armada acá, empezaría después de todo lo demás.

   Acá sólo está el cuándo se va. Se lleva el mérito el CSS.
   ============================================================ */
window.Arranque = (function () {
  'use strict';

  /* Cuánto se queda. Un segundo largo alcanza para leer el nombre y no
     para que un chico de seis años se impaciente; y la app se abre
     muchas veces por día, así que cada décima de más se paga muchas
     veces. */
  var CORTINA = 1150;
  var SALIDA  = 450;   // tiene que coincidir con .arranque-sale del CSS

  var yaFue = false;

  function pidieronQuieto() {
    return !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /** Levanta la cortina y le avisa al inicio que puede entrar. */
  function sacar() {
    if (yaFue) return;
    yaFue = true;

    /* La clase va en el body y no en la pantalla porque la entrada
       escalonada del inicio la dispara el CSS con esta clase: hasta que
       no está, el inicio se dibuja quieto debajo de la cortina. */
    document.body.classList.add('arrancado');

    var caja = document.getElementById('arranque');
    if (!caja) return;
    caja.classList.add('arranque-sale');
    setTimeout(function () {
      if (caja.parentNode) caja.parentNode.removeChild(caja);
    }, SALIDA);
  }

  function empezar() {
    var caja = document.getElementById('arranque');
    if (!caja) { sacar(); return; }

    /* Tocar la pantalla la saltea. El que ya se sabe el nombre de la
       app de memoria no tiene por qué esperarla. */
    caja.addEventListener('pointerdown', sacar);

    // Con el sistema en "menos movimiento" no hay animación que mostrar.
    setTimeout(sacar, pidieronQuieto() ? 150 : CORTINA);
  }

  return { empezar: empezar, saltear: sacar };
})();
