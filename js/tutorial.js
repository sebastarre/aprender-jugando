/* ============================================================
   El tutorial: la mascota muestra la app, cosa por cosa.

   Se ofrece al terminar de armar un perfil y se puede volver a ver
   desde Configuración. Es opcional dos veces: se puede decir que no al
   empezar, y en CUALQUIER paso hay un «Saltar» a la vista (y la tecla
   Escape hace lo mismo). Un tutorial que no se puede cortar es un
   peaje, y un chico que ya entendió se aburre y abandona.

   Cómo se ve: la pantalla se oscurece y queda un agujero iluminado
   sobre la cosa de la que se habla (el botón de jugar, las monedas…).
   Al lado, un globo con la mascota, el título, dos renglones, los
   puntitos de cuánto falta y los botones. La oscuridad es una capa con
   un agujero recortado con clip-path, y encima un recuadro pone el aro
   amarillo, que viaja de un lugar a otro con una transición. (Al
   principio la oscuridad era una sombra gigante alrededor del recuadro,
   pero hay navegadores que no pintan sombras de miles de píxeles.)

   Cada paso se lee en voz alta si la voz está prendida: los chicos de
   cuatro y cinco no leen todavía, y el tutorial es justamente para ellos.

   Uso:
     Tutorial.empezar(pasos, { alTerminar: function (completo) {} })
   donde cada paso es { donde: '#selector' o null, titulo, texto }.
   Los pasos cuyo lugar no está en pantalla (por ejemplo, la meta de
   hoy cuando está escondida) se saltean solos.
   ============================================================ */
window.Tutorial = (function () {
  'use strict';

  var capa = null;
  var pasos = [];
  var indice = 0;
  var opciones = {};
  var focoAntes = null;

  function visible(sel) {
    if (!sel) return true;
    var el = document.querySelector(sel);
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !el.closest('[hidden]');
  }

  function crear(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function armarCapa() {
    capa = crear('div', 'tuto');
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-labelledby', 'tuto-titulo');
    capa.setAttribute('aria-describedby', 'tuto-texto');

    capa.appendChild(crear('div', 'tuto-sombra'));
    capa.appendChild(crear('div', 'tuto-foco'));

    var globo = crear('div', 'tuto-globo');
    var cara = crear('div', 'tuto-cara');
    if (window.Mascota) cara.appendChild(Mascota.crear(null, 'tuto-mascota'));
    globo.appendChild(cara);

    var cuerpo = crear('div', 'tuto-cuerpo');
    var titulo = crear('h2', 'tuto-titulo');
    titulo.id = 'tuto-titulo';
    var texto = crear('p', 'tuto-texto');
    texto.id = 'tuto-texto';
    texto.setAttribute('aria-live', 'polite');
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(texto);
    cuerpo.appendChild(crear('div', 'tuto-puntos'));
    globo.appendChild(cuerpo);

    var botones = crear('div', 'tuto-botones');
    var saltar = crear('button', 'tuto-saltar', 'Saltar');
    saltar.type = 'button';
    saltar.setAttribute('aria-label', 'Saltar el tutorial');
    var atras = crear('button', 'tuto-atras', 'Atrás');
    atras.type = 'button';
    var seguir = crear('button', 'btn-gigante tuto-seguir', 'Siguiente');
    seguir.type = 'button';
    botones.appendChild(saltar);
    botones.appendChild(atras);
    botones.appendChild(seguir);
    globo.appendChild(botones);
    capa.appendChild(globo);

    saltar.addEventListener('click', function () { terminar(false); });
    atras.addEventListener('click', function () { ir(indice - 1); });
    seguir.addEventListener('click', function () {
      if (indice >= pasos.length - 1) terminar(true);
      else ir(indice + 1);
    });
    // tocar lo oscuro no hace nada: un toque de más no tiene que cortar el tutorial
    capa.addEventListener('click', function (ev) { ev.stopPropagation(); });

    document.body.appendChild(capa);
    document.addEventListener('keydown', teclas, true);
    window.addEventListener('resize', ubicar);
    window.addEventListener('scroll', ubicar, true);
  }

  function teclas(ev) {
    if (!capa) return;
    if (ev.key === 'Escape') { ev.preventDefault(); terminar(false); return; }
    if (ev.key === 'ArrowRight') { ev.preventDefault(); capa.querySelector('.tuto-seguir').click(); return; }
    if (ev.key === 'ArrowLeft' && indice > 0) { ev.preventDefault(); ir(indice - 1); return; }
    // el foco no se escapa del globo mientras dure el tutorial
    if (ev.key === 'Tab') {
      var todos = capa.querySelectorAll('button:not([hidden])');
      var primero = todos[0], ultimo = todos[todos.length - 1];
      if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
      else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
    }
  }

  function ir(n) {
    if (n < 0 || n >= pasos.length) return;
    indice = n;
    var paso = pasos[n];
    var ultimo = n === pasos.length - 1;

    capa.querySelector('.tuto-titulo').textContent = paso.titulo;
    capa.querySelector('.tuto-texto').textContent = paso.texto;
    capa.querySelector('.tuto-atras').hidden = n === 0;
    capa.querySelector('.tuto-saltar').hidden = ultimo;
    capa.querySelector('.tuto-seguir').textContent = ultimo ? (opciones.fin || '¡A jugar!') : 'Siguiente';

    var puntos = capa.querySelector('.tuto-puntos');
    puntos.textContent = '';
    puntos.setAttribute('role', 'img');
    puntos.setAttribute('aria-label', 'Paso ' + (n + 1) + ' de ' + pasos.length);
    for (var i = 0; i < pasos.length; i++) {
      puntos.appendChild(crear('span', i < n ? 'hecho' : (i === n ? 'ahora' : '')));
    }

    var globo = capa.querySelector('.tuto-globo');
    globo.classList.remove('entra');
    void globo.offsetWidth;            // reinicia la animación de entrada
    globo.classList.add('entra');

    var el = paso.donde && document.querySelector(paso.donde);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(ubicar, 380);
    }
    ubicar();

    if (window.Voz && window.Almacen && Voz.hay() && Almacen.vozActiva()) {
      Voz.decir(paso.titulo + '. ' + paso.texto);
    }
    capa.querySelector('.tuto-seguir').focus({ preventScroll: true });
  }

  /* Pone el agujero sobre lo que se está mostrando y el globo del lado
     donde hay lugar: abajo si la cosa está en la mitad de arriba de la
     pantalla, arriba si está en la de abajo. Sin lugar señalado, el
     globo va al medio y no hay agujero. */
  function ubicar() {
    if (!capa) return;
    var paso = pasos[indice];
    var foco = capa.querySelector('.tuto-foco');
    var globo = capa.querySelector('.tuto-globo');
    var el = paso && paso.donde && document.querySelector(paso.donde);

    if (!el) {
      capa.classList.add('sin-foco');
      capa.querySelector('.tuto-sombra').style.clipPath = '';
      globo.style.top = '';
      globo.style.bottom = '';
      globo.classList.add('al-medio');
      return;
    }
    capa.classList.remove('sin-foco');
    globo.classList.remove('al-medio');

    var r = el.getBoundingClientRect();
    var aire = 8;
    var x = r.left - aire, y = r.top - aire, w = r.width + aire * 2, h = r.height + aire * 2;
    foco.style.left = x + 'px';
    foco.style.top = y + 'px';
    foco.style.width = w + 'px';
    foco.style.height = h + 'px';
    recortar(capa.querySelector('.tuto-sombra'), x, y, w, h);

    var alto = window.innerHeight;
    if (r.top + r.height / 2 < alto / 2) {
      globo.style.top = Math.min(r.bottom + aire + 14, alto - globo.offsetHeight - 12) + 'px';
      globo.style.bottom = '';
    } else {
      globo.style.top = '';
      globo.style.bottom = Math.min(alto - r.top + aire + 14, alto - globo.offsetHeight - 12) + 'px';
    }
  }

  /* La capa oscura con un agujero de esquinas redondas: el rectángulo
     de toda la pantalla y adentro el del agujero, y la regla «evenodd»
     hace que lo que queda adentro de los dos no se pinte. */
  function recortar(sombra, x, y, w, h) {
    var W = window.innerWidth, H = window.innerHeight;
    var r = Math.min(26, w / 2, h / 2);
    var d = 'M0 0H' + W + 'V' + H + 'H0Z' +
      'M' + (x + r) + ' ' + y + 'H' + (x + w - r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) +
      'V' + (y + h - r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
      'H' + (x + r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) +
      'V' + (y + r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
    sombra.style.clipPath = 'path(evenodd, "' + d + '")';
  }

  function empezar(lista, opc) {
    if (capa) terminar(false);
    opciones = opc || {};
    pasos = (lista || []).filter(function (p) { return visible(p.donde); });
    if (!pasos.length) return;
    focoAntes = document.activeElement;
    document.body.classList.add('con-tutorial');
    armarCapa();
    ir(0);
  }

  /** `completo`: true si llegó al final, false si lo saltó. */
  function terminar(completo) {
    if (!capa) return;
    if (window.Voz) Voz.parar();
    document.removeEventListener('keydown', teclas, true);
    window.removeEventListener('resize', ubicar);
    window.removeEventListener('scroll', ubicar, true);
    capa.parentNode.removeChild(capa);
    capa = null;
    document.body.classList.remove('con-tutorial');
    if (focoAntes && focoAntes.focus) { try { focoAntes.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
    var alTerminar = opciones.alTerminar;
    opciones = {};
    if (alTerminar) alTerminar(!!completo);
  }

  function activo() { return !!capa; }

  return { empezar: empezar, terminar: terminar, activo: activo };
})();
