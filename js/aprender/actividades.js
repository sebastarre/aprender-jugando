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

   Nada de esto se corrige ni suma puntos: es para probar. Lo que se
   corrige está en la práctica del paso y en el ejercicio del final.
   ============================================================ */
window.Actividades = (function () {
  'use strict';

  function vozActiva() { return Voz.hay() && Almacen.vozActiva(); }
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
      c.innerHTML = html;
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

  var TIPOS = {
    escuchar: escuchar, contar: contar, sumar: sumar, restar: restar,
    reloj: reloj, multiplicar: multiplicar, silabas: silabas, fraccion: fraccion
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
