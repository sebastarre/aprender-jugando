/* ============================================================
   Aplica lo que el chico tenga equipado: el tema de colores y el
   fondo. Los temas funcionan pisando las variables de CSS que ya usa
   la hoja de estilos, así que no hay que tocar nada más para que la
   app entera cambie de color.
   ============================================================ */
window.Temas = (function () {
  'use strict';

  var raiz = document.documentElement;

  /** Deja la app con el tema y el fondo que estén equipados. */
  function aplicar() {
    var tema = Catalogo.tema(Almacen.equipado('tema'));

    // primero se limpia lo del tema anterior, si no quedarían mezclados
    Catalogo.VARIABLES.forEach(function (v) { raiz.style.removeProperty('--' + v); });
    if (tema.colores) {
      Object.keys(tema.colores).forEach(function (v) {
        raiz.style.setProperty('--' + v, tema.colores[v]);
      });
    }

    // el fondo comprado le gana al que trae el tema
    var fondo = Catalogo.fondo(Almacen.equipado('fondo'));
    var deco = (fondo && fondo.deco) || tema.deco || null;
    if (deco) raiz.style.setProperty('--deco', deco);
    else raiz.style.removeProperty('--deco');

    // la barra del navegador en el celular acompaña al tema
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content',
        (tema.colores && tema.colores.primario) || '#4c6ef5');
    }
  }

  return { aplicar: aplicar };
})();
