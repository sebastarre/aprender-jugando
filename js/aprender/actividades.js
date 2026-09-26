/* ============================================================
   Las actividades de las lecciones: aprender tocando.

   Una lección era leer y apretar «Siguiente». Para un chico de cuatro,
   leer no es aprender: aprender es contar las manzanas con el dedo,
   juntar dos montoncitos y ver que son cinco, mover la aguja del reloj y
   ver qué hora queda. Cada paso de una lección puede traer una de éstas:

     interactivo: { tipo: 'escuchar', cosas: [{ visual, decir, nombre }] }
                  tarjetas que se tocan para escucharlas (los colores en
                  inglés, las vocales, los sonidos de los animales)
     interactivo: { tipo: 'contar', cosa: 'manzana', n: 5 }
                  tocar cada cosa para contarla; al final, cuántas son
     interactivo: { tipo: 'sumar', a: 2, b: 3, cosa }
                  dos montoncitos que se juntan con un botón
     interactivo: { tipo: 'restar', a: 5, b: 2, cosa }
                  un montoncito del que se sacan algunas
     interactivo: { tipo: 'reloj', hora: 3, minuto: 0 }
                  un reloj con botones para mover las agujas
     interactivo: { tipo: 'multiplicar', filas: 3, columnas: 4 }
                  filas de puntitos que se agregan y se sacan
     interactivo: { tipo: 'silabas', palabras: ['ca-sa', 'ma-ri-po-sa'] }
                  palabras que se tocan para escucharlas sílaba por sílaba
     interactivo: { tipo: 'fraccion', partes: 4 }
                  una torta cortada en partes que se pintan tocándolas
     interactivo: { tipo: 'clasificar', grupos: [{ id, nombre, visual }],
                    cosas: [{ nombre, visual, grupo, bien, pista }] }
                  llevar cada cosa a su grupo: vivo o no vivo, herbívoro
                  o carnívoro, sustantivo o verbo
     interactivo: { tipo: 'tocar', rondas: [{ consigna, partes, correcta, bien, pistas }] }
                  tocar la palabra (o la sílaba, con silabas: true) que se pide
     interactivo: { tipo: 'repartir', n: 6, platos: 2, cosa }
                  repartir de a una, por turno, en platos
     interactivo: { tipo: 'bloques', a: 27, b: 15, op: '+' }
                  barras de diez y cubitos: por qué «me llevo una» (o, con
                  op: '-', por qué se pide prestado)
     interactivo: { tipo: 'estados' }
                  enfriar y calentar el agua: hielo, agua y vapor
     interactivo: { tipo: 'mapa', modo: 'continentes' | 'rumbos' | 'capitales' }
                  un mapa quieto para tocar

   Nada de esto se corrige ni suma puntos: es para probar. Lo que se
   corrige está en la práctica del paso y en el ejercicio del final.
   ============================================================ */
window.Actividades = (function () {
  'use strict';

  function vozActiva() { return Voz.hay() && Almacen.vozActiva(); }

  // cuando algo no va ahí: primero algo cálido, como en los juegos (ver js/nucleo/motor.js)
  var ANIMO = ['¡Buen intento!', '¡Ups!', '¡No pasa nada!'];
  function decir(texto, opciones) { if (Voz.hay()) Voz.decir(texto, opciones); }

  function dibujoDe(cosa) { return 'assets/contar/' + (cosa || 'manzana') + '.png'; }

  function boton(clase, texto, alTocar) {
    var b = Util.crear('button', clase, texto);
    b.type = 'button';
    b.addEventListener('click', function () { Sonido.despertar(); alTocar(b); });
    return b;
  }

  /** Una fila de cosas iguales (manzanas, peces…). */
  function fila(cosa, n, clase) {
    var caja = Util.crear('div', 'act-fila' + (clase ? ' ' + clase : ''));
    for (var i = 0; i < n; i++) {
      var img = Util.crear('img', 'act-cosa');
      img.src = dibujoDe(cosa);
      img.alt = '';
      img.draggable = false;
      caja.appendChild(img);
    }
    return caja;
  }

  /** El cartelito de abajo de cada actividad, que dice lo que pasó. */
  function cartel(caja) {
    var c = Util.crear('p', 'act-cartel');
    c.setAttribute('aria-live', 'polite');
    caja.appendChild(c);
    return function (html, hablar) {
      c.innerHTML = Util.cuentasEnteras(html);
      c.classList.remove('nuevo');
      void c.offsetWidth;
      c.classList.add('nuevo');
      if (hablar && Voz.hay()) Voz.decir(html);
    };
  }

  /* ---------------------- escuchar ---------------------- */
  function escuchar(caja, def) {
    var grilla = Util.crear('div', 'act-escuchar');
    def.cosas.forEach(function (c) {
      var b = boton('act-tarjeta', null, function () {
        decir(c.decir || c.nombre);
        b.classList.add('oida');
        b.classList.remove('salta');
        void b.offsetWidth;
        b.classList.add('salta');
      });
      b.setAttribute('aria-label', 'Escuchar ' + Tablero.plano(c.nombre || c.decir));
      var v = Util.crear('span', 'act-tarjeta-visual');
      v.innerHTML = c.visual;
      b.appendChild(v);
      if (c.nombre) {
        var n = Util.crear('span', 'act-tarjeta-nombre');
        n.innerHTML = c.nombre;
        b.appendChild(n);
      }
      var parlante = Util.crear('span', 'act-parlante');
      parlante.appendChild(Iconos.crear('sonido'));
      b.appendChild(parlante);
      grilla.appendChild(b);
    });
    caja.appendChild(grilla);
  }

  /* ---------------------- contar ---------------------- */
  function contar(caja, def) {
    var grupo = Util.crear('div', 'act-contar contar');
    var cuenta = 0;
    var avisar;
    for (var i = 0; i < def.n; i++) {
      (function () {
        var b = boton('contar-cosa', null, function () {
          if (b.classList.contains('contada')) return;
          cuenta++;
          b.classList.add('contada');
          b.setAttribute('data-n', cuenta);
          Sonido.tocar('pop', cuenta);
          if (cuenta === def.n) {
            grupo.classList.add('todas');
            avisar('¡Son <b>' + def.n + '</b>! El último número que dijiste es cuántas hay.', true);
          } else {
            decir(String(cuenta));
            avisar('Llevás <b>' + cuenta + '</b>.');
          }
        });
        b.setAttribute('aria-label', 'Contar');
        var img = Util.crear('img');
        img.src = dibujoDe(def.cosa);
        img.alt = '';
        img.draggable = false;
        b.appendChild(img);
        grupo.appendChild(b);
      })();
    }
    caja.appendChild(grupo);
    avisar = cartel(caja);
    avisar('Tocá cada una para contarla.');
  }

  /* ---------------------- sumar y restar ---------------------- */
  function sumar(caja, def) {
    var escena = Util.crear('div', 'act-suma');
    escena.style.setProperty('--n', def.a + def.b);
    var izq = fila(def.cosa, def.a, 'act-grupo');
    var signo = Util.crear('span', 'act-signo', '+');
    var der = fila(def.cosa, def.b, 'act-grupo');
    escena.appendChild(izq);
    escena.appendChild(signo);
    escena.appendChild(der);
    caja.appendChild(escena);
    var avisar;
    var b = boton('btn-secundario act-boton', '¡Juntar!', function () {
      if (escena.classList.contains('juntos')) {
        escena.classList.remove('juntos');
        b.textContent = '¡Juntar!';
        avisar(def.a + ' y ' + def.b + '. ¿Cuántas van a ser?');
        return;
      }
      // lo que hay entre los dos montoncitos, para que cada uno se corra la mitad
      var hueco = der.getBoundingClientRect().left - izq.getBoundingClientRect().right;
      escena.style.setProperty('--junta', Math.max(0, hueco / 2) + 'px');
      escena.classList.add('juntos');
      b.textContent = 'Separar';
      Sonido.tocar('acierto');
      avisar('<b>' + def.a + ' + ' + def.b + ' = ' + (def.a + def.b) + '</b>. Juntas son ' + (def.a + def.b) + '.', true);
    });
    caja.appendChild(b);
    avisar = cartel(caja);
    avisar(def.a + ' y ' + def.b + '. ¿Cuántas van a ser?');
  }

  function restar(caja, def) {
    var grupo = fila(def.cosa, def.a, 'act-grupo act-resta');
    grupo.style.setProperty('--n', def.a);
    var cosas = grupo.querySelectorAll('.act-cosa');
    caja.appendChild(grupo);
    var avisar;
    var b = boton('btn-secundario act-boton', 'Sacar ' + def.b, function () {
      var sacadas = grupo.classList.toggle('sacadas');
      Array.prototype.forEach.call(cosas, function (c, i) {
        c.classList.toggle('se-va', sacadas && i >= def.a - def.b);
      });
      b.textContent = sacadas ? 'Devolver' : 'Sacar ' + def.b;
      if (sacadas) {
        Sonido.tocar('ficha');
        avisar('<b>' + def.a + ' − ' + def.b + ' = ' + (def.a - def.b) + '</b>. Quedan ' + (def.a - def.b) + '.', true);
      } else {
        avisar('Hay ' + def.a + '. Si sacamos ' + def.b + ', ¿cuántas quedan?');
      }
    });
    caja.appendChild(b);
    avisar = cartel(caja);
    avisar('Hay ' + def.a + '. Si sacamos ' + def.b + ', ¿cuántas quedan?');
  }

  /* ---------------------- el reloj ---------------------- */
  var NUMEROS = ['doce', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];

  /** «Son las tres y cuarto», como se dice acá. */
  function frase(hora, minuto) {
    var h = hora % 12 === 0 ? 12 : hora % 12;
    var siguiente = h % 12 + 1;
    var las = function (x) { return (x === 1 ? 'Es la ' : 'Son las ') + NUMEROS[x]; };
    if (minuto === 0) return las(h) + ' en punto';
    if (minuto === 15) return las(h) + ' y cuarto';
    if (minuto === 30) return las(h) + ' y media';
    if (minuto === 45) return las(siguiente) + ' menos cuarto';
    return las(h) + ' y ' + minuto;
  }

  function reloj(caja, def) {
    var hora = def.hora || 3, minuto = def.minuto || 0;
    var dibujo = Util.crear('div', 'act-reloj');
    caja.appendChild(dibujo);
    var digital = Util.crear('p', 'act-reloj-digital');
    caja.appendChild(digital);
    var avisar;
    function pintar(hablar) {
      dibujo.innerHTML = Matematica.dibujarReloj(hora, minuto);
      digital.textContent = hora + ':' + (minuto < 10 ? '0' : '') + minuto;
      if (avisar) avisar(frase(hora, minuto) + '.', hablar);
    }
    var botones = Util.crear('div', 'act-botones');
    [['− 5 minutos', -5], ['+ 5 minutos', 5], ['+ 1 hora', 60]].forEach(function (x) {
      botones.appendChild(boton('btn-secundario btn-chico', x[0], function () {
        var total = (hora * 60 + minuto + x[1] + 720) % 720;
        hora = Math.floor(total / 60) || 12;
        minuto = total % 60;
        Sonido.tocar('clic');
        pintar(true);
      }));
    });
    caja.appendChild(botones);
    avisar = cartel(caja);
    pintar(false);
  }

  /* ---------------------- multiplicar ---------------------- */

  /** «Filas − 3 +»: un número que se sube y se baja entre min y max. */
  function contador(nombre, valor, min, max, alCambiar) {
    var caja = Util.crear('div', 'act-control');
    caja.appendChild(Util.crear('span', 'act-control-nombre', nombre));
    var menos = boton('act-control-boton', '−', function () { cambiar(-1); });
    var numero = Util.crear('span', 'act-control-valor');
    var mas = boton('act-control-boton', '+', function () { cambiar(1); });
    menos.setAttribute('aria-label', nombre + ': uno menos');
    mas.setAttribute('aria-label', nombre + ': uno más');
    caja.appendChild(menos);
    caja.appendChild(numero);
    caja.appendChild(mas);
    function pintar() {
      numero.textContent = valor;
      menos.disabled = valor <= min;
      mas.disabled = valor >= max;
    }
    function cambiar(d) {
      valor = Math.min(max, Math.max(min, valor + d));
      Sonido.tocar('clic');
      pintar();
      alCambiar(valor);
    }
    pintar();
    return caja;
  }

  function multiplicar(caja, def) {
    var filas = def.filas || 3, columnas = def.columnas || 4;
    var puntos = Util.crear('div', 'act-puntos');
    caja.appendChild(puntos);
    var avisar;
    function pintar(hablar) {
      Util.vaciar(puntos);
      for (var f = 0; f < filas; f++) {
        var linea = Util.crear('div', 'act-puntos-fila');
        for (var c = 0; c < columnas; c++) linea.appendChild(Util.crear('span', 'punto-bola'));
        puntos.appendChild(linea);
      }
      var suma = [];
      for (var k = 0; k < filas; k++) suma.push(columnas);
      avisar(filas + (filas === 1 ? ' fila' : ' filas') + ' de ' + columnas + ': ' + suma.join(' + ') +
             ' = <b>' + (filas * columnas) + '</b>. O sea, <b>' + columnas + ' × ' + filas + ' = ' + (filas * columnas) + '</b>.', hablar);
    }
    var controles = Util.crear('div', 'act-controles');
    controles.appendChild(contador('Filas', filas, 1, 5, function (v) { filas = v; pintar(true); }));
    controles.appendChild(contador('Columnas', columnas, 1, 6, function (v) { columnas = v; pintar(true); }));
    caja.appendChild(controles);
    avisar = cartel(caja);
    pintar(false);
  }

  /* ---------------------- sílabas ---------------------- */
  function silabas(caja, def) {
    var lista = Util.crear('div', 'act-silabas');
    var avisar;
    def.palabras.forEach(function (p) {
      var partes = p.split('-');
      var fichaPalabra = boton('act-palabra', null, function () {
        var chips = fichaPalabra.querySelectorAll('.act-silaba');
        fichaPalabra.classList.add('abierta');
        decir(partes, {
          pausa: 0.35,
          alEmpezarParte: function (i) {
            Array.prototype.forEach.call(chips, function (c, k) { c.classList.toggle('suena', k === i); });
            Sonido.tocar('aplauso');
          },
          alTerminar: function () {
            Array.prototype.forEach.call(chips, function (c) { c.classList.remove('suena'); });
          }
        });
        avisar('«' + partes.join('') + '» tiene <b>' + partes.length + (partes.length === 1 ? ' sílaba' : ' sílabas') + '</b>: ' + partes.join(' · ') + '.');
      });
      fichaPalabra.setAttribute('aria-label', 'Escuchar ' + partes.join(''));
      partes.forEach(function (s) { fichaPalabra.appendChild(Util.crear('span', 'act-silaba', s)); });
      lista.appendChild(fichaPalabra);
    });
    caja.appendChild(lista);
    avisar = cartel(caja);
    avisar('Tocá una palabra y aplaudí con cada golpe de voz.');
  }

  /* ---------------------- fracciones ---------------------- */
  function fraccion(caja, def) {
    var d = def.partes || 4;
    var pintadas = [];
    for (var k = 0; k < d; k++) pintadas.push(false);
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('class', 'act-torta');
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Una torta cortada en ' + d + ' partes');
    var C = 60, R = 52;
    var avisar;
    for (var i = 0; i < d; i++) {
      (function (i) {
        var a1 = (-90 + i * 360 / d) * Math.PI / 180;
        var a2 = (-90 + (i + 1) * 360 / d) * Math.PI / 180;
        var p = document.createElementNS(svgNS, 'path');
        p.setAttribute('d', 'M' + C + ' ' + C +
          ' L' + (C + R * Math.cos(a1)).toFixed(2) + ' ' + (C + R * Math.sin(a1)).toFixed(2) +
          ' A' + R + ' ' + R + ' 0 ' + (360 / d > 180 ? 1 : 0) + ' 1 ' +
          (C + R * Math.cos(a2)).toFixed(2) + ' ' + (C + R * Math.sin(a2)).toFixed(2) + ' Z');
        p.setAttribute('class', 'act-porcion');
        p.setAttribute('tabindex', '0');
        p.setAttribute('role', 'button');
        p.setAttribute('aria-label', 'Parte ' + (i + 1));
        function tocar() {
          pintadas[i] = !pintadas[i];
          p.classList.toggle('pintada', pintadas[i]);
          Sonido.tocar('ficha');
          contarPintadas(true);
        }
        p.addEventListener('click', tocar);
        p.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tocar(); }
        });
        svg.appendChild(p);
      })(i);
    }
    caja.appendChild(svg);
    avisar = cartel(caja);
    function contarPintadas(hablar) {
      var n = pintadas.filter(Boolean).length;
      var extra = n * 2 === d ? ' Es la mitad.' : n === d ? ' Es la torta entera.' : '';
      avisar(n ? 'Pintaste <b>' + n + ' de ' + d + '</b>: se escribe <b>' + n + '/' + d + '</b>.' + extra
               : 'La torta tiene ' + d + ' partes iguales. Tocá algunas para pintarlas.', hablar);
    }
    contarPintadas(false);
  }

  /* ---------------------- clasificar ----------------------
     Llevar cada cosa a su grupo: se toca la cosa y después el grupo. Con
     el dedo es más fácil que arrastrar (a los cuatro años arrastrar es
     difícil), y anda igual con el teclado. Si va a otro grupo, no pasa
     nada: se dice por qué y se prueba de nuevo. */
  function clasificar(caja, def) {
    var cajones = Util.crear('div', 'act-cajones');
    var pila = Util.crear('div', 'act-pila');
    var elegida = null;
    var quedan = def.cosas.length;
    var avisar;
    var adentro = {};

    function soltar() {
      if (elegida) {
        elegida.classList.remove('elegida');
        elegida.setAttribute('aria-pressed', 'false');
      }
      elegida = null;
      cajones.classList.remove('esperando');
    }

    def.grupos.forEach(function (g) {
      var b = boton('act-cajon', null, function () { llevar(g, b); });
      var cabeza = Util.crear('span', 'act-cajon-cabeza');
      if (g.visual) {
        var v = Util.crear('span', 'act-cajon-dibujo');
        v.innerHTML = g.visual;
        cabeza.appendChild(v);
      }
      var nombre = Util.crear('span', 'act-cajon-nombre');
      nombre.innerHTML = g.nombre;
      cabeza.appendChild(nombre);
      b.appendChild(cabeza);
      adentro[g.id] = Util.crear('span', 'act-cajon-adentro');
      b.appendChild(adentro[g.id]);
      b.setAttribute('aria-label', 'Poner en ' + Tablero.plano(g.nombre));
      cajones.appendChild(b);
    });

    Util.mezclar(def.cosas.slice()).forEach(function (c) {
      var ficha = boton('act-ficha', null, function () {
        if (ficha.classList.contains('puesta')) return;
        var era = elegida === ficha;
        soltar();
        if (era) return;                    // tocarla de nuevo la suelta
        elegida = ficha;
        ficha.classList.add('elegida');
        ficha.setAttribute('aria-pressed', 'true');
        cajones.classList.add('esperando');
        Sonido.tocar('clic');
        decir(c.nombre);
      });
      ficha.cosa = c;
      ficha.setAttribute('aria-pressed', 'false');
      if (c.visual) {
        var v = Util.crear('span', 'act-ficha-dibujo');
        v.innerHTML = c.visual;
        ficha.appendChild(v);
      }
      var n = Util.crear('span', 'act-ficha-nombre');
      n.innerHTML = c.nombre;
      ficha.appendChild(n);
      pila.appendChild(ficha);
    });

    function llevar(g, cajon) {
      if (!elegida) {
        avisar(def.consigna || 'Primero tocá una cosa, y después el grupo donde va.', true);
        return;
      }
      var c = elegida.cosa;
      if (c.grupo === g.id) {
        var chip = Util.crear('span', 'act-cajon-cosa');
        chip.innerHTML = c.visual || c.nombre;
        adentro[g.id].appendChild(chip);
        elegida.classList.add('puesta');
        elegida.disabled = true;
        soltar();
        quedan--;
        Sonido.tocar(quedan ? 'ficha' : 'racha');
        var bien = c.bien || ('¡Sí! ' + mayuscula(Tablero.plano(c.nombre)) + ' va en «' + Tablero.plano(g.nombre) + '».');
        avisar(quedan ? bien : bien + ' ' + (def.final || '¡Todo en su lugar!'), true);
        return;
      }
      Sonido.tocar('error');
      cajon.classList.remove('sacude');
      void cajon.offsetWidth;
      cajon.classList.add('sacude');
      var pista = c.pista || (mayuscula(Tablero.plano(c.nombre)) + ' va en otro grupo.');
      // si la pista ya pregunta algo («¿Dónde hay muchas calles?»), eso ya invita a probar
      avisar(Util.otraDe(ANIMO) + ' ' + pista + (/\?$/.test(Tablero.plano(pista)) ? '' : ' ¡Probá con otro grupo!'), true);
    }

    caja.appendChild(cajones);
    caja.appendChild(pila);
    avisar = cartel(caja);
    avisar(def.consigna || 'Tocá una cosa y después el grupo donde va.');
  }

  function mayuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------------------- tocar la que es ----------------------
     Una fila de palabras (o de sílabas) y hay que tocar la que se pide:
     el verbo de la oración, la sílaba que suena más fuerte. Puede traer
     varias rondas, una detrás de la otra. */
  function tocar(caja, def) {
    var rondas = def.rondas || [def];
    var i = 0;
    var consigna = Util.crear('p', 'act-consigna');
    var fila = Util.crear('div', 'act-tocar' + (def.silabas ? ' act-tocar-silabas' : ''));
    caja.appendChild(consigna);
    caja.appendChild(fila);
    var avisar = cartel(caja);
    // la consigna nueva se dice: el que todavía no lee también tiene que saber qué buscar
    var otra = boton('btn-secundario act-boton', 'Otra', function () { i++; pintar(); decir(consigna.innerHTML); });
    otra.hidden = true;
    caja.appendChild(otra);

    function pintar() {
      var r = rondas[i];
      consigna.innerHTML = r.consigna || def.consigna || '';
      Util.vaciar(fila);
      otra.hidden = true;
      var resuelta = false;
      r.partes.forEach(function (parte, k) {
        var b = boton('act-trozo', null, function () {
          if (resuelta) return;
          if (k === r.correcta) {
            resuelta = true;
            b.classList.add('bien');
            Sonido.tocar('acierto');
            avisar(r.bien || '¡Eso!', true);
            if (i < rondas.length - 1) otra.hidden = false;
            return;
          }
          b.classList.remove('sacude');
          void b.offsetWidth;
          b.classList.add('sacude');
          Sonido.tocar('error');
          avisar(Util.otraDe(ANIMO) + ' ' + ((r.pistas && r.pistas[k]) || '¡Probá otra!'), true);
        });
        b.innerHTML = parte;
        fila.appendChild(b);
      });
      avisar(r.ayuda || '');
    }
    pintar();
  }

  /* ---------------------- repartir ----------------------
     Una por turno a cada plato, hasta que no queda ninguna: dividir es
     eso, antes que la tabla al revés. */
  function repartir(caja, def) {
    var n = def.n || 6, k = def.platos || 2;
    var pila = fila(def.cosa, n, 'act-repartir-pila');
    var platos = Util.crear('div', 'act-platos');
    var enPlato = [];
    for (var p = 0; p < k; p++) {
      var plato = Util.crear('div', 'act-plato');
      platos.appendChild(plato);
      enPlato.push(plato);
    }
    caja.appendChild(pila);
    caja.appendChild(platos);
    var dadas = 0;
    var avisar;
    var b = boton('btn-secundario act-boton', 'Repartir una', function () {
      if (dadas >= n) {
        dadas = 0;
        pila.querySelectorAll('.act-cosa').forEach(function (c) { c.classList.remove('dada'); });
        enPlato.forEach(function (pl) { Util.vaciar(pl); });
        b.textContent = 'Repartir una';
        avisar('Tocá el botón: una para cada uno, por turno.');
        return;
      }
      var quedan = pila.querySelectorAll('.act-cosa:not(.dada)');
      var ultima = quedan[quedan.length - 1];
      ultima.classList.add('dada');
      var copia = ultima.cloneNode(false);
      copia.classList.remove('dada');
      enPlato[dadas % k].appendChild(copia);
      dadas++;
      Sonido.tocar('pop', dadas);
      if (dadas === n) {
        b.textContent = 'Otra vez';
        avisar('Cada uno tiene <b>' + (n / k) + '</b>: ' + n + ' repartidas entre ' + k + ' son ' + (n / k) +
               ' para cada uno. <b>' + n + ' ÷ ' + k + ' = ' + (n / k) + '</b>.', true);
      } else {
        avisar('Van ' + dadas + '. Una para cada uno, por turno…');
      }
    });
    caja.appendChild(b);
    avisar = cartel(caja);
    avisar('Tocá el botón: una para cada uno, por turno.');
  }

  /* ---------------------- los bloques de diez ----------------------
     Barras de diez y cubitos sueltos, para ver por qué «me llevo una» y
     «le pido prestado al de al lado»: diez cubitos se cambian por una
     barra, y una barra se desarma en diez cubitos. Va de a un paso por
     toque, y el cartel cuenta cada uno. */
  var TINTA = '#27304A';
  function barraSvg(clase) {
    var rayas = '';
    for (var k = 1; k < 10; k++) rayas += '<path d="M2 ' + (2 + k * 9.8).toFixed(1) + ' H16" stroke="' + TINTA + '" stroke-width="1.4"/>';
    return '<svg class="bloque-barra' + (clase ? ' ' + clase : '') + '" viewBox="0 0 18 102" aria-hidden="true">' +
      '<rect x="2" y="2" width="14" height="98" rx="3" fill="#3AA3E8" stroke="' + TINTA + '" stroke-width="2"/>' + rayas + '</svg>';
  }
  function cuboSvg(clase) {
    return '<svg class="bloque-cubo' + (clase ? ' ' + clase : '') + '" viewBox="0 0 18 18" aria-hidden="true">' +
      '<rect x="2" y="2" width="14" height="14" rx="3" fill="#FFC93C" stroke="' + TINTA + '" stroke-width="2"/></svg>';
  }
  /** Un montón: las barras paradas y los cubitos de a cinco por fila. */
  function monton(etiqueta, barras, cubos, marcas) {
    marcas = marcas || {};
    var caja = Util.crear('div', 'bloques-monton' + (marcas.resalta ? ' resalta' : ''));
    if (etiqueta !== null) caja.appendChild(Util.crear('span', 'bloques-etiqueta', etiqueta));
    var dibujo = Util.crear('div', 'bloques-dibujo');
    var b = '', c = '';
    for (var i = 0; i < barras; i++) b += barraSvg(i >= barras - (marcas.barrasNuevas || 0) ? 'nuevo' : '');
    for (var j = 0; j < cubos; j++) {
      var clase = j >= cubos - (marcas.cubosNuevos || 0) ? 'nuevo' : j >= cubos - (marcas.cubosSeVan || 0) ? 'se-va' : '';
      c += cuboSvg(clase);
    }
    if (barras) dibujo.insertAdjacentHTML('beforeend', '<div class="bloques-barras">' + b + '</div>');
    if (cubos) dibujo.insertAdjacentHTML('beforeend', '<div class="bloques-cubos">' + c + '</div>');
    caja.appendChild(dibujo);
    return caja;
  }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function bloques(caja, def) {
    var a = def.a, b = def.b, suma = def.op !== '-';
    var da = Math.floor(a / 10), ua = a % 10, db = Math.floor(b / 10), ub = b % 10;
    var etapas = [];

    if (suma) {
      var u = ua + ub, lleva = u >= 10 ? 1 : 0;
      etapas.push({
        pinta: function () { return [monton(String(a), da, ua), monton(String(b), db, ub)]; },
        dice: a + ' son ' + plural(da, 'barra', 'barras') + ' de diez y ' + plural(ua, 'cubito', 'cubitos') + '. ' +
              b + ' son ' + plural(db, 'barra', 'barras') + ' y ' + plural(ub, 'cubito', 'cubitos') + '.',
        boton: 'Juntar los cubitos'
      });
      etapas.push({
        pinta: function () { return [monton('Barras', da + db, 0), monton('Cubitos', 0, u, { resalta: true })]; },
        dice: ua + ' + ' + ub + ' = <b>' + u + ' cubitos</b>.' + (lleva ? ' ¡Son más de diez!' : ' No llegan a diez.'),
        boton: lleva ? 'Cambiar 10 cubitos por una barra' : 'Juntar las barras'
      });
      if (lleva) {
        etapas.push({
          pinta: function () { return [monton('Barras', da + db, 0), monton('¡Te llevás una!', 1, 0, { resalta: true, barrasNuevas: 1 }), monton('Cubitos', 0, u - 10)]; },
          dice: 'Diez cubitos son una barra: <b>es la que te llevás</b>. Quedan ' + plural(u - 10, 'cubito', 'cubitos') + ' sueltos.',
          boton: 'Juntar las barras'
        });
      }
      etapas.push({
        pinta: function () { return [monton('= ' + (a + b), da + db + lleva, u % 10, { resalta: true })]; },
        dice: da + ' + ' + db + (lleva ? ' + 1' : '') + ' = ' + plural(da + db + lleva, 'barra', 'barras') + ', y ' +
              plural(u % 10, 'cubito', 'cubitos') + ': <b>' + a + ' + ' + b + ' = ' + (a + b) + '</b>.',
        boton: 'Otra vez'
      });
    } else {
      var falta = ua < ub;
      var cubos = falta ? ua + 10 : ua, barras = falta ? da - 1 : da;
      etapas.push({
        pinta: function () { return [monton(String(a), da, ua)]; },
        dice: 'Tenés ' + a + ': ' + plural(da, 'barra', 'barras') + ' y ' + plural(ua, 'cubito', 'cubitos') + '. Hay que sacar ' + b +
              ': ' + plural(db, 'barra', 'barras') + ' y ' + plural(ub, 'cubito', 'cubitos') + '.',
        boton: 'Sacar ' + plural(ub, 'cubito', 'cubitos')
      });
      if (falta) {
        etapas.push({
          pinta: function () { return [monton(String(a), da, ua, { resalta: true })]; },
          dice: 'Hay ' + plural(ua, 'cubito', 'cubitos') + ' y hay que sacar ' + ub + ': <b>¡no alcanzan!</b> Hay que desarmar una barra.',
          boton: 'Desarmar una barra'
        });
        etapas.push({
          pinta: function () { return [monton(null, barras, cubos, { cubosNuevos: 10 })]; },
          dice: 'Una barra son <b>10 cubitos</b>: ahora hay ' + plural(barras, 'barra', 'barras') + ' y ' + cubos + ' cubitos.',
          boton: 'Sacar ' + plural(ub, 'cubito', 'cubitos')
        });
      }
      etapas.push({
        pinta: function () { return [monton(null, barras, cubos, { cubosSeVan: ub })]; },
        dice: cubos + ' − ' + ub + ' = <b>' + plural(cubos - ub, 'cubito', 'cubitos') + '</b>.',
        boton: db ? 'Sacar ' + plural(db, 'barra', 'barras') : 'Ver cuánto quedó'
      });
      etapas.push({
        pinta: function () { return [monton('= ' + (a - b), barras - db, cubos - ub, { resalta: true })]; },
        dice: 'Quedan ' + plural(barras - db, 'barra', 'barras') + ' y ' + plural(cubos - ub, 'cubito', 'cubitos') +
              ': <b>' + a + ' − ' + b + ' = ' + (a - b) + '</b>.',
        boton: 'Otra vez'
      });
    }

    var mesa = Util.crear('div', 'act-bloques');
    caja.appendChild(mesa);
    var etapa = 0;
    var avisar;
    var accion = boton('btn-secundario act-boton', '', function () {
      etapa = (etapa + 1) % etapas.length;
      Sonido.tocar(etapa ? 'ficha' : 'clic');
      pintar(etapa > 0);
    });
    caja.appendChild(accion);
    avisar = cartel(caja);
    function pintar(hablar) {
      var e = etapas[etapa];
      Util.vaciar(mesa);
      e.pinta().forEach(function (m) { mesa.appendChild(m); });
      accion.textContent = e.boton;
      avisar(e.dice, hablar);
    }
    pintar(false);
  }

  /* ---------------------- los estados del agua ----------------------
     Enfriar y calentar la misma agua, y ver cómo cambia: hielo, agua,
     vapor. Cada cambio dice su nombre. */
  var ESTADOS = [
    { nombre: 'Sólido', temp: '−5 °C', nivel: 18,
      dibujo: '<svg viewBox="0 0 120 100" aria-hidden="true">' +
        '<rect x="18" y="38" width="44" height="44" rx="8" fill="#C7EBFD" stroke="#27304A" stroke-width="3.2"/>' +
        '<rect x="58" y="24" width="44" height="44" rx="8" fill="#C7EBFD" stroke="#27304A" stroke-width="3.2"/>' +
        '<path d="M26 48 L34 48 M66 34 L74 34" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
      dice: 'Es <b>hielo</b>: agua <b>sólida</b>. Tiene su propia forma.' },
    { nombre: 'Líquido', temp: '20 °C', nivel: 50,
      dibujo: '<svg viewBox="0 0 120 100" aria-hidden="true">' +
        '<path d="M34 34 L40 90 L80 90 L86 34" fill="#3AA3E8" stroke="none"/>' +
        '<path d="M30 14 L38 92 L82 92 L90 14" fill="none" stroke="#27304A" stroke-width="3.2" stroke-linejoin="round"/>' +
        '<path d="M33 34 Q46 28 60 34 T87 34" fill="none" stroke="#27304A" stroke-width="2.4"/></svg>',
      dice: 'Es <b>agua líquida</b>: toma la forma del vaso donde la pongas.' },
    { nombre: 'Gaseoso', temp: '100 °C', nivel: 90,
      dibujo: '<svg viewBox="0 0 120 100" aria-hidden="true">' +
        '<path d="M22 58 H98 L92 92 H28 Z" fill="#8C94A6" stroke="#27304A" stroke-width="3.2" stroke-linejoin="round"/>' +
        '<path d="M16 58 H104" stroke="#27304A" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M42 48 C34 40 50 34 42 24 M60 48 C52 40 68 34 60 22 M78 48 C70 40 86 34 78 24" fill="none" stroke="#8C94A6" stroke-width="3.6" stroke-linecap="round"/></svg>',
      dice: 'Es <b>vapor</b>: agua <b>gaseosa</b>. Se escapa y ocupa todo el lugar.' }
  ];
  var CAMBIOS = {
    '0>1': 'El hielo se derrite: eso es la <b>fusión</b>.',
    '1>2': 'El agua hierve a los 100 °C y se hace vapor: la <b>evaporación</b>.',
    '2>1': 'El vapor se enfría y vuelve a ser agua, como las gotitas en un vidrio frío: la <b>condensación</b>.',
    '1>0': 'El agua se congela a los 0 °C: la <b>solidificación</b>.'
  };
  function estados(caja) {
    var i = 1;
    var escena = Util.crear('div', 'act-estados');
    var dibujo = Util.crear('div', 'estados-dibujo');
    var termo = Util.crear('div', 'estados-termo');
    escena.appendChild(dibujo);
    escena.appendChild(termo);
    caja.appendChild(escena);
    var botones = Util.crear('div', 'act-botones');
    var enfriar = boton('btn-secundario btn-chico', 'Enfriar', function () { cambiar(-1); });
    var calentar = boton('btn-secundario btn-chico', 'Calentar', function () { cambiar(1); });
    botones.appendChild(enfriar);
    botones.appendChild(calentar);
    caja.appendChild(botones);
    var avisar = cartel(caja);

    // el termómetro se arma una vez: al cambiar sólo sube o baja
    var tubo = Util.crear('span', 'termo-tubo');
    var nivel = Util.crear('i');
    tubo.appendChild(nivel);
    termo.appendChild(tubo);
    var grados = Util.crear('b', 'termo-grados');
    var estado = Util.crear('span', 'termo-estado');
    termo.appendChild(grados);
    termo.appendChild(estado);

    function pintar() {
      var e = ESTADOS[i];
      dibujo.innerHTML = e.dibujo;
      nivel.style.transform = 'scaleY(' + (e.nivel / 100) + ')';
      grados.textContent = e.temp;
      estado.textContent = e.nombre;
      enfriar.disabled = i === 0;
      calentar.disabled = i === ESTADOS.length - 1;
    }
    function cambiar(d) {
      var antes = i;
      i = Math.max(0, Math.min(ESTADOS.length - 1, i + d));
      if (i === antes) return;
      Sonido.tocar('ficha');
      pintar();
      avisar(CAMBIOS[antes + '>' + i] + ' ' + ESTADOS[i].dice, true);
    }
    pintar();
    avisar(ESTADOS[i].dice);
  }

  /* ---------------------- el mapa ----------------------
     Un mapa quieto para tocar (el de los juegos tiene zoom y arrastre,
     que acá sobran):
       continentes  el mundo pintado por continente; al tocar uno se
                    marca y se dice cómo se llama
       rumbos       América del Sur: se toca norte, sur, este u oeste y se
                    ve qué hay de la Argentina para ese lado
       capitales    América del Sur: se toca un país y se dice su capital */
  var CONTINENTES = {
    america: { nombre: 'América', dato: 'Ahí vivimos nosotros: la Argentina está en la parte de abajo, América del Sur.' },
    europa:  { nombre: 'Europa', dato: 'Es chico, pero tiene muchos países.' },
    africa:  { nombre: 'África', dato: 'Es enorme, y ahí está el desierto más grande: el Sahara.' },
    asia:    { nombre: 'Asia', dato: 'Es el más grande de todos y el que tiene más gente.' },
    oceania: { nombre: 'Oceanía', dato: 'Es Australia y muchísimas islas.' }
  };
  var RUMBOS = {
    norte: { ids: ['BO', 'PY'], dice: 'Al <b>norte</b> de la Argentina están <b>Bolivia</b> y <b>Paraguay</b>.' },
    sur:   { ids: [], dice: 'Al <b>sur</b> está el mar… y, más lejos, la Antártida, toda de hielo.' },
    este:  { ids: ['UY', 'BR'], dice: 'Al <b>este</b> están <b>Uruguay</b> y <b>Brasil</b>, y el océano Atlántico.' },
    oeste: { ids: ['CL'], dice: 'Al <b>oeste</b> está <b>Chile</b>, del otro lado de la cordillera de los Andes.' }
  };

  function mapa(caja, def) {
    var modo = def.modo || 'continentes';
    var porId = {};
    (window.PAISES || []).forEach(function (p) { porId[p.id] = p; });
    var marco = Util.crear('div', 'act-mapa act-mapa-' + modo);
    marco.innerHTML = Mapa.svgDe({ zona: modo === 'continentes' ? 'mundo' : 'america-sur', jugables: [] }).svg;
    var dibujo = marco.querySelector('svg');
    dibujo.removeAttribute('role');
    dibujo.setAttribute('aria-hidden', 'true');
    var paises = Array.prototype.slice.call(dibujo.querySelectorAll('path[data-id]'));
    paises.forEach(function (p) {
      var pais = porId[p.getAttribute('data-id')];
      if (pais) p.setAttribute('data-cont', pais.cont);
    });
    caja.appendChild(marco);
    var botones = Util.crear('div', 'act-botones act-mapa-botones');
    caja.appendChild(botones);
    var avisar = cartel(caja);

    function marcar(ids) {
      paises.forEach(function (p) { p.classList.toggle('marcado', ids.indexOf(p.getAttribute('data-id')) >= 0); });
    }

    if (modo === 'continentes') {
      var cuenta = {};
      (window.PAISES || []).forEach(function (p) { cuenta[p.cont] = (cuenta[p.cont] || 0) + 1; });
      var elegir = function (id) {
        marco.setAttribute('data-elegido', id);
        botones.querySelectorAll('button').forEach(function (b) { b.classList.toggle('elegido', b.getAttribute('data-cont') === id); });
        Sonido.tocar('ficha');
        avisar('<b>' + CONTINENTES[id].nombre + '</b>, con ' + cuenta[id] + ' países. ' + CONTINENTES[id].dato, true);
      };
      Object.keys(CONTINENTES).forEach(function (id) {
        var b = boton('act-mapa-boton', null, function () { elegir(id); });
        b.setAttribute('data-cont', id);
        var punto = Util.crear('span', 'act-mapa-punto');
        punto.setAttribute('data-cont', id);     // el color lo pone el CSS, el mismo del mapa
        b.appendChild(punto);
        b.appendChild(Util.crear('span', null, CONTINENTES[id].nombre));
        botones.appendChild(b);
      });
      dibujo.addEventListener('click', function (ev) {
        var p = ev.target.closest && ev.target.closest('path[data-cont]');
        if (p) elegir(p.getAttribute('data-cont'));
      });
      avisar('Tocá un continente, en el mapa o acá abajo.');
      return;
    }

    if (modo === 'rumbos') {
      paises.forEach(function (p) { if (p.getAttribute('data-id') === 'AR') p.classList.add('casa'); });
      marco.insertAdjacentHTML('beforeend', '<span class="act-mapa-norte" aria-hidden="true">N</span>');
      ['norte', 'sur', 'este', 'oeste'].forEach(function (r) {
        var b = boton('btn-secundario btn-chico', r.charAt(0).toUpperCase() + r.slice(1), function () {
          botones.querySelectorAll('button').forEach(function (x) { x.classList.toggle('elegido', x === b); });
          marcar(RUMBOS[r].ids);
          Sonido.tocar('ficha');
          avisar(RUMBOS[r].dice, true);
        });
        botones.appendChild(b);
      });
      avisar('La Argentina está en amarillo. Tocá una dirección y mirá qué hay para ese lado.');
      return;
    }

    // capitales
    dibujo.addEventListener('click', function (ev) {
      var p = ev.target.closest && ev.target.closest('path[data-id]');
      var pais = p && porId[p.getAttribute('data-id')];
      if (!pais || pais.sub !== 'América del Sur') return;
      marcar([pais.id]);
      Sonido.tocar('ficha');
      avisar('<b>' + pais.nombre + '</b>: su capital es <b>' + pais.capital + '</b>.', true);
    });
    botones.hidden = true;
    avisar('Tocá un país de América del Sur y te digo su capital.');
  }

  var TIPOS = {
    escuchar: escuchar, contar: contar, sumar: sumar, restar: restar,
    reloj: reloj, multiplicar: multiplicar, silabas: silabas, fraccion: fraccion,
    clasificar: clasificar, tocar: tocar, repartir: repartir, bloques: bloques,
    estados: estados, mapa: mapa
  };

  /** Arma la actividad de un paso adentro de `caja`. */
  function montar(caja, def) {
    var hacer = TIPOS[def.tipo];
    if (!hacer) return false;
    var marco = Util.crear('div', 'actividad actividad-' + def.tipo);
    caja.appendChild(marco);
    hacer(marco, def);
    return true;
  }

  return { montar: montar, frase: frase, vozActiva: vozActiva };
})();
