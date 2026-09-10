/* ============================================================
   La mascota de la app: un gato o un perro, siempre disfrazado.

   Aparece donde hace falta una cara: la bienvenida, el final de una
   partida y las pantallas vacías. Una app para chicos sin un personaje
   se siente como un formulario con colores.

   Antes estaba dibujada en SVG acá adentro. Ahora son ilustraciones
   hechas aparte, en assets/mascotas/, una por cada combinación de
   animal y disfraz: 2 × 7 = 14 archivos. Se procesan con
   herramientas/preparar-mascotas.js, que les saca el fondo blanco y las
   deja en WebP (367 KB los catorce, contra 16,5 MB los originales).

   Dos cosas se eligen y son independientes:

     base     'gato' o 'perro'. Lo elige el chico y no se compra.
     disfraz  el animal que tiene puesto. Tres son gratis y cuatro se
              compran en la tienda.

   Ojo con una cosa: como cada combinación es una imagen fija, la
   mascota ya NO cambia de cara según cómo le fue en la partida. Antes
   festejaba, saludaba o ponía cara de "ups". Si en algún momento se
   quieren recuperar los gestos, hacen falta las mismas 14 imágenes por
   cada gesto.
   ============================================================ */
window.Mascota = (function () {
  'use strict';

  var CARPETA = 'assets/mascotas/';

  var BASES = {
    gato:  { nombre: 'Gato' },
    perro: { nombre: 'Perro' }
  };

  /* El orden es el que se ve en Personalización: primero los gratis. */
  var DISFRACES = {
    leon:     { nombre: 'León',        precio: 0 },
    zorro:    { nombre: 'Zorro',       precio: 0 },
    dino:     { nombre: 'Dinosaurio',  precio: 0 },
    abeja:    { nombre: 'Abeja',       precio: 90 },
    pinguino: { nombre: 'Pingüino',    precio: 100 },
    tiburon:  { nombre: 'Tiburón',     precio: 120 },
    dragon:   { nombre: 'Dragón',      precio: 150 }
  };

  var BASE_POR_DEFECTO = 'gato';
  var DISFRAZ_POR_DEFECTO = 'leon';

  function existeBase(id) { return !!BASES[id]; }
  function existeDisfraz(id) { return !!DISFRACES[id]; }

  function archivo(baseId, disfrazId) {
    var b = existeBase(baseId) ? baseId : BASE_POR_DEFECTO;
    var d = existeDisfraz(disfrazId) ? disfrazId : DISFRAZ_POR_DEFECTO;
    return CARPETA + b + '-' + d + '.webp';
  }

  function comoTexto(baseId, disfrazId) {
    var b = BASES[baseId] || BASES[BASE_POR_DEFECTO];
    var d = DISFRACES[disfrazId] || DISFRACES[DISFRAZ_POR_DEFECTO];
    return b.nombre + ' disfrazado de ' + d.nombre.toLowerCase();
  }

  /* ---------------------- lo que está puesto ---------------------- */
  function baseElegida() {
    var id = window.Almacen && Almacen.equipado ? Almacen.equipado('mascota') : null;
    return existeBase(id) ? id : BASE_POR_DEFECTO;
  }

  function disfrazElegido() {
    var id = window.Almacen && Almacen.equipado ? Almacen.equipado('disfraz') : null;
    return existeDisfraz(id) ? id : DISFRAZ_POR_DEFECTO;
  }

  /* ---------------------- dibujar ---------------------- */
  function etiqueta(baseId, disfrazId) {
    var img = new Image();
    img.className = 'mascota-img';
    img.src = archivo(baseId, disfrazId);
    // decorativa: al lado siempre hay un texto que dice lo mismo
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.draggable = false;
    return img;
  }

  function pintar(caja, baseId, disfrazId) {
    if (!caja) return;
    var img = caja.querySelector('.mascota-img');
    var ruta = archivo(baseId, disfrazId);
    // si ya está la misma imagen no se toca: cambiar el src la haría
    // parpadear cada vez que se repinta la pantalla
    if (img) {
      if (img.getAttribute('src') !== ruta) img.setAttribute('src', ruta);
      return;
    }
    caja.textContent = '';
    caja.appendChild(etiqueta(baseId, disfrazId));
  }

  /** La mascota lista para meter en el DOM, con lo que el chico tenga puesto. */
  function crear(_gesto, clase) {
    var caja = document.createElement('div');
    caja.className = 'mascota' + (clase ? ' ' + clase : '');
    caja.appendChild(etiqueta(baseElegida(), disfrazElegido()));
    return caja;
  }

  /* Queda para no romper a quien la llame: antes cambiaba la cara según
     el resultado y ahora las imágenes son fijas. Se limita a asegurarse
     de que la mascota dibujada sea la que el chico tiene puesta. */
  function gesto(caja) {
    pintar(caja, baseElegida(), disfrazElegido());
  }

  /** Para las vistas previas: un animal y un disfraz sueltos. */
  function vista(baseId, disfrazId) {
    return etiqueta(baseId, disfrazId).outerHTML;
  }

  /** Vuelve a dibujar todas las mascotas que haya en pantalla. */
  function refrescar() {
    var nodos = document.querySelectorAll('.mascota');
    for (var i = 0; i < nodos.length; i++) {
      pintar(nodos[i], baseElegida(), disfrazElegido());
    }
  }

  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-mascota]');
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].classList.add('mascota');
      pintar(nodos[i], baseElegida(), disfrazElegido());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return {
    crear: crear, gesto: gesto, vista: vista, refrescar: refrescar,
    hidratar: hidratar, archivo: archivo, comoTexto: comoTexto,
    BASES: BASES, DISFRACES: DISFRACES,
    BASE_POR_DEFECTO: BASE_POR_DEFECTO,
    DISFRAZ_POR_DEFECTO: DISFRAZ_POR_DEFECTO
  };
})();
