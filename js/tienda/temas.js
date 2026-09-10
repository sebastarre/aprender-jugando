/* ============================================================
   Aplica los colores que el chico tenga puestos.

   Antes esto ponía una paleta entera. Ahora son cuatro colores
   independientes (la barra, el fondo, los botones, las letras) y cada
   uno pisa su propio grupo de variables de CSS. Se juntan todos y se
   escriben de una sola vez sobre la raíz del documento, así la app
   entera cambia sin tocar ninguna pantalla.
   ============================================================ */
window.Temas = (function () {
  'use strict';

  var raiz = document.documentElement;

  /** Qué color tiene puesto en una ranura (o el gratis por defecto). */
  function puesto(ranuraId) {
    var elegido = Almacen.equipado('color:' + ranuraId);
    return Catalogo.color(ranuraId, elegido);
  }

  /** Deja la app con los colores y el fondo que estén puestos. */
  function aplicar() {
    // primero se limpia lo anterior, si no quedarían mezclados
    Catalogo.VARIABLES.forEach(function (v) { raiz.style.removeProperty('--' + v); });

    var deDondeElDeco = null;
    Catalogo.RANURAS.forEach(function (r) {
      var c = puesto(r.id);
      if (!c) return;
      Object.keys(c.vars).forEach(function (v) {
        raiz.style.setProperty('--' + v, c.vars[v]);
      });
      if (c.deco) deDondeElDeco = c.deco;
    });

    // el fondo comprado le gana al que trae el color del fondo
    var fondo = Catalogo.fondo(Almacen.equipado('fondo'));
    var deco = (fondo && fondo.deco) || deDondeElDeco || null;
    if (deco) raiz.style.setProperty('--deco', deco);
    else raiz.style.removeProperty('--deco');

    /* La franja del sistema (el reloj, la batería) acompaña al papel,
       no a la portada. Antes la app tenía una barra de color pegada
       arriba de todo y lo natural era que siguieran siendo del mismo
       color; ahora arriba de todo está el papel, así que la barra del
       sistema tiene que desaparecer contra él en vez de dibujar una
       franja de otro color en el borde de la pantalla. */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      var fondo = puesto('fondo');
      meta.setAttribute('content', (fondo && fondo.vars.papel) || '#f3f7ff');
    }
  }

  return { aplicar: aplicar, puesto: puesto };
})();
