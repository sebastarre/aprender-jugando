/* ============================================================
   Botonera de respuestas: las tarjetas entre las que se elige.

   La usan el quiz de banderas y los juegos de matemática. Cada uno
   decide qué va adentro del botón; acá vive lo repetido (armarlos,
   pintarlos de verde o rojo y bloquearlos al terminar la pregunta).

   Algunas preguntas no se contestan con tarjetas sino con otra cosa: el
   teclado de números (Tablero.teclado) o las fichas para armar una
   palabra (js/nucleo/fichas.js). Ésos se anotan con usar(control) y
   entonces marcar() y bloquear() les llegan a ellos: así los juegos y el
   motor siguen hablando siempre con Opciones, sin saber qué hay abajo.
   ============================================================ */
window.Opciones = (function () {
  'use strict';

  var control = null;         // el teclado o las fichas, si la pregunta los usa

  function zona() { return Util.$('zona-opciones'); }

  /* La pizarra sólo aparece en las preguntas que se hacen con cuentas:
     debajo de «¿con qué letra empieza?» era un cuadriculado vacío que
     empujaba todo para abajo. */
  function pizarra(si) { zona().setAttribute('data-pizarra', si ? 'si' : 'no'); }

  /* El control de la pregunta anterior se desarma antes de poner otro:
     el teclado escucha las teclas de la compu y tiene que dejar de hacerlo. */
  function soltar() {
    if (control && control.desarmar) control.desarmar();
    control = null;
  }

  /** La pregunta de ahora se contesta con otra cosa que tarjetas. */
  function usar(nuevo, conPizarra) {
    soltar();
    control = nuevo;
    pizarra(conPizarra);
  }

  /**
   * armar(lista, {
   *   contenido:  function (item, i) { return nodo o texto; },
   *   clase:      'texto',                              // opcional
   *   atributos:  function (item) { return {...}; },    // opcional
   *   alElegir:   function (item, boton) {},
   *   pizarra:    true                                  // opcional
   * })
   */
  function armar(lista, config) {
    soltar();
    var caja = zona();
    Util.vaciar(caja);
    caja.setAttribute('data-columnas', lista.length);
    caja.removeAttribute('data-forma');
    if (config.clase) caja.setAttribute('data-forma', config.clase.split(' ')[0]);
    pizarra(config.pizarra);

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
    if (control) return null;
    return zona().querySelector('[data-id="' + String(id).replace(/"/g, '\\"') + '"]');
  }

  function marcar(id, clase) {
    if (control) return control.marcar(id, clase);
    var b = boton(id);
    if (b) b.classList.add(clase);
  }

  function bloquear() {
    if (control) return control.bloquear();
    botones().forEach(function (b) { b.disabled = true; });
  }

  return {
    armar: armar, usar: usar, soltar: soltar, botones: botones, boton: boton,
    marcar: marcar, bloquear: bloquear, pizarra: pizarra
  };
})();
