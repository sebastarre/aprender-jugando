/* ============================================================
   Las fichas: armar algo tocando pedazos en orden.

   Es la mecánica de «Armá la palabra»: arriba los huecos, abajo las
   fichas mezcladas (sílabas o letras). Tocar una ficha la manda al
   primer hueco libre; tocar un hueco la devuelve. Cuando están todos
   llenos, se contesta sola.

   Si está mal, las fichas que estaban en su lugar quedan fijas, en
   verde, y vuelven sólo las otras: el chico ve qué parte ya le salió y
   sigue desde ahí, en vez de empezar de cero cada vez.

   Contesta con Motor.responder(lo armado) y se anota en Opciones como
   el control de la pregunta, así los ganchos de siempre (marcar como
   correcta, incorrecta, mostrar la que era) le llegan a ella.
   ============================================================ */
window.Fichas = (function () {
  'use strict';

  /** Mezcla hasta que no quede en el orden correcto (si se puede). */
  function mezclarDistinto(lista) {
    var salida = lista.slice();
    for (var i = 0; i < 12; i++) {
      salida = Util.mezclar(lista);
      if (salida.some(function (x, k) { return x.texto !== lista[k].texto; })) break;
    }
    return salida;
  }

  /**
   * armar({
   *   piezas:  ['ma', 'ri', 'po', 'sa'],   // en el orden correcto
   *   unir:    '',                          // cómo se juntan para contestar
   *   hablar:  true,                        // la voz dice cada ficha al tocarla
   *   clase:   'silabas' | 'letras'
   * })
   */
  function armar(config) {
    var piezas = config.piezas.slice();
    var unir = config.unir || '';
    var n = piezas.length;
    var fichas = mezclarDistinto(piezas.map(function (t, i) { return { texto: t, id: i }; }));
    var huecos = [];            // en cada hueco, la ficha que tiene (o null)
    var fijos = [];             // los huecos que ya quedaron bien
    for (var k = 0; k < n; k++) { huecos.push(null); fijos.push(false); }
    var bloqueado = false;
    var esperando = null;

    var caja = Util.crear('div', 'fichas fichas-' + (config.clase || 'silabas'));
    var filaHuecos = Util.crear('div', 'fichas-huecos');
    var mazo = Util.crear('div', 'fichas-mazo');
    caja.appendChild(filaHuecos);
    caja.appendChild(mazo);

    var botonesHueco = huecos.map(function (h, i) {
      var b = Util.crear('button', 'hueco');
      b.type = 'button';
      b.setAttribute('aria-label', 'Lugar ' + (i + 1) + ', vacío');
      b.addEventListener('click', function () { devolver(i); });
      filaHuecos.appendChild(b);
      return b;
    });

    var botonesFicha = fichas.map(function (f) {
      var b = Util.crear('button', 'ficha', f.texto);
      b.type = 'button';
      b.addEventListener('click', function () { poner(f, b); });
      mazo.appendChild(b);
      return b;
    });

    var zona = Util.$('zona-opciones');
    Util.vaciar(zona);
    zona.setAttribute('data-columnas', '1');
    zona.setAttribute('data-forma', 'fichas');
    zona.appendChild(caja);

    function botonDe(f) { return botonesFicha[fichas.indexOf(f)]; }

    function pintar() {
      huecos.forEach(function (f, i) {
        var b = botonesHueco[i];
        b.textContent = f ? f.texto : '';
        b.classList.toggle('lleno', !!f);
        b.classList.toggle('fijo', fijos[i]);
        b.disabled = bloqueado || fijos[i] || !f;
        b.setAttribute('aria-label', 'Lugar ' + (i + 1) + ', ' + (f ? f.texto : 'vacío'));
      });
      fichas.forEach(function (f) {
        var b = botonDe(f);
        var usada = huecos.indexOf(f) >= 0;
        b.classList.toggle('usada', usada);
        b.disabled = bloqueado || usada;
      });
    }

    function poner(f, boton) {
      if (bloqueado || !Motor.libre() || huecos.indexOf(f) >= 0) return;
      var libre = huecos.indexOf(null);
      if (libre < 0) return;
      huecos[libre] = f;
      Sonido.tocar('ficha');
      if (config.hablar && Voz.hay() && Almacen.vozActiva()) Voz.decir(f.texto);
      pintar();
      boton.blur();
      if (huecos.indexOf(null) < 0) {
        clearTimeout(esperando);
        esperando = setTimeout(contestar, 350);
      }
    }

    function devolver(i) {
      if (bloqueado || fijos[i] || !huecos[i]) return;
      clearTimeout(esperando);
      huecos[i] = null;
      Sonido.tocar('clic');
      pintar();
    }

    function armado() {
      return huecos.map(function (f) { return f ? f.texto : ''; }).join(unir);
    }

    function contestar() {
      if (bloqueado || huecos.indexOf(null) >= 0) return;
      Motor.responder(armado());
    }

    Opciones.usar({
      marcar: function (id, clase) {
        clearTimeout(esperando);
        if (clase === 'correcta') {
          // al mostrar la que era, las fichas se acomodan solas en su lugar
          var libres = fichas.slice();
          piezas.forEach(function (t, i) {
            var f = libres.filter(function (x) { return x.texto === t; })[0];
            libres.splice(libres.indexOf(f), 1);
            huecos[i] = f;
          });
          botonesHueco.forEach(function (b) { b.classList.remove('mal'); b.classList.add('bien'); });
          caja.classList.add('armada');
          pintar();
          return;
        }
        if (clase === 'incorrecta') {
          huecos.forEach(function (f, i) {
            var bien = f && f.texto === piezas[i];
            botonesHueco[i].classList.toggle('bien', !!bien);
            botonesHueco[i].classList.toggle('mal', !bien);
            if (bien) fijos[i] = true;
          });
          caja.classList.remove('sacudida');
          void caja.offsetWidth;
          caja.classList.add('sacudida');
          pintar();
          // las que no iban ahí vuelven abajo
          setTimeout(function () {
            if (bloqueado) return;
            huecos.forEach(function (f, i) {
              if (!fijos[i]) { huecos[i] = null; botonesHueco[i].classList.remove('mal'); }
            });
            pintar();
          }, 750);
          return;
        }
        // en el examen: quedó anotada, sin decir si está bien
        botonesHueco.forEach(function (b) { b.classList.add('elegida'); });
      },
      bloquear: function () {
        bloqueado = true;
        pintar();
      },
      desarmar: function () { clearTimeout(esperando); }
    }, false);
    pintar();
  }

  return { armar: armar };
})();
