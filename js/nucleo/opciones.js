/* ============================================================
   Botonera de respuestas: las tarjetas entre las que se elige.

   La usan el quiz de banderas y los juegos de matemática. Cada uno
   decide qué va adentro del botón; acá vive lo repetido (armarlos,
   pintarlos de verde o rojo y bloquearlos al terminar la pregunta).
   ============================================================ */
window.Opciones = (function () {
  'use strict';

  function zona() { return Util.$('zona-opciones'); }

  /**
   * armar(lista, {
   *   contenido:  function (item, i) { return nodo o texto; },
   *   clase:      'texto',                              // opcional
   *   atributos:  function (item) { return {...}; },    // opcional
   *   alElegir:   function (item, boton) {}
   * })
   */
  function armar(lista, config) {
    var caja = zona();
    Util.vaciar(caja);
    caja.setAttribute('data-columnas', lista.length);

    lista.forEach(function (item, i) {
      var btn = Util.crear('button', 'btn-opcion' + (config.clase ? ' ' + config.clase : ''));
      btn.type = 'button';
      btn.setAttribute('data-id', String(item.id));

      if (config.atributos) {
        var extra = config.atributos(item);
        Object.keys(extra).forEach(function (k) { btn.setAttribute(k, extra[k]); });
      }

      var dentro = config.contenido(item, i);
      if (typeof dentro === 'string') btn.appendChild(Util.crear('span', 'opcion-valor', dentro));
      else btn.appendChild(dentro);

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        config.alElegir(item, btn);
      });
      caja.appendChild(btn);
    });
  }

  function botones() {
    return Array.prototype.slice.call(zona().querySelectorAll('.btn-opcion'));
  }

  function boton(id) {
    return zona().querySelector('[data-id="' + String(id).replace(/"/g, '\\"') + '"]');
  }

  function marcar(id, clase) {
    var b = boton(id);
    if (b) b.classList.add(clase);
  }

  function bloquear() {
    botones().forEach(function (b) { b.disabled = true; });
  }

  return { armar: armar, botones: botones, boton: boton, marcar: marcar, bloquear: bloquear };
})();
