/* ============================================================
   Mapa interactivo en SVG.

   - Proyección Mercator calculada en el momento para la zona pedida.
   - Un <path> por país (el navegador se encarga de detectar el clic).
   - Los países sin polígono visible (Malta, Nauru, Vaticano...) se
     dibujan como un punto clickeable.
   - Zoom con rueda / pellizco / botones y arrastre para moverse.
   ============================================================ */
window.Mapa = (function () {
  'use strict';

  var ANCHO = 1000;          // ancho del viewBox; el alto se calcula por proporción
  var ZOOM_MAX = 14;         // cuánto se puede acercar respecto de la vista completa
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* -------- zonas jugables: recorte del mundo + qué países entran -------- */
  var ZONAS = {
    mundo:          { nombre: 'Todo el mundo',        icono: '🌍', vista: [-180, 180, -56, 79] },
    america:        { nombre: 'América',              icono: '🌎', vista: [-170, -32, -56, 73] },
    'america-sur':  { nombre: 'América del Sur',      icono: '🦙', vista: [-83, -33, -56, 14] },
    'america-norte':{ nombre: 'América del Norte', icono: '🍁', nota: 'con Centro y Caribe', vista: [-170, -51, 5, 75] },
    europa:         { nombre: 'Europa',               icono: '🏰', vista: [-26, 46, 34, 72] },
    africa:         { nombre: 'África',               icono: '🦁', vista: [-27, 61, -37, 39] },
    asia:           { nombre: 'Asia',                 icono: '🐘', vista: [24, 152, -11, 57] },
    oceania:        { nombre: 'Oceanía',              icono: '🦘', vista: [110, 210, -50, 22] }
  };

  /** Devuelve los países que se juegan en una zona. */
  function paisesDeZona(zonaId, paises) {
    paises = paises || window.PAISES;
    switch (zonaId) {
      case 'mundo':          return paises.slice();
      case 'america-sur':    return paises.filter(function (p) { return p.sub === 'América del Sur'; });
      case 'america-norte':  return paises.filter(function (p) {
        return p.sub === 'América del Norte' || p.sub === 'América Central' || p.sub === 'Caribe';
      });
      default:               return paises.filter(function (p) { return p.cont === zonaId; });
    }
  }

  function listaZonas() {
    return Object.keys(ZONAS).map(function (id) {
      return { id: id, nombre: ZONAS[id].nombre, icono: ZONAS[id].icono, nota: ZONAS[id].nota,
               cantidad: paisesDeZona(id).length };
    });
  }

  /* ---------------------- proyección ---------------------- */
  function mercY(lat) {
    var l = lat < -85 ? -85 : (lat > 85 ? 85 : lat);
    return Math.log(Math.tan(Math.PI / 4 + l * Math.PI / 360));
  }

  function crearProyeccion(vista) {
    var lon0 = vista[0], lon1 = vista[1], lat0 = vista[2], lat1 = vista[3];
    var x0 = lon0 * Math.PI / 180;
    var escala = ANCHO / (lon1 * Math.PI / 180 - x0);
    var yArriba = mercY(lat1);
    var alto = (yArriba - mercY(lat0)) * escala;

    function proy(lon, lat) {
      return [(lon * Math.PI / 180 - x0) * escala, (yArriba - mercY(lat)) * escala];
    }

    /** Lleva una longitud suelta (una capital, un punto) al tramo visible. */
    proy.enVista = function (lon) {
      while (lon < lon0 - 180) lon += 360;
      while (lon > lon1 + 180) lon -= 360;
      if (lon < lon0 && lon + 360 <= lon1) lon += 360;
      if (lon > lon1 && lon - 360 >= lon0) lon -= 360;
      return lon;
    };
    proy.punto = function (lon, lat) { return proy(proy.enVista(lon), lat); };
    proy.alto = alto;
    return proy;
  }

  /* ---------------------- construcción del SVG ---------------------- */
  /* Los anillos vienen "desenrollados": los países que cruzan el meridiano 180
     pueden tener longitudes fuera de ±180. Por eso cada anillo se prueba en
     tres posiciones (tal cual, una vuelta a la izquierda y otra a la derecha) y
     se queda con las que caen dentro del recorte. */
  var VUELTAS = [0, -360, 360];

  function anilloAPath(anillo, proy, alto, vuelta) {
    var d = '', minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    var px = null, py = null;
    for (var i = 0; i < anillo.length; i++) {
      var p = proy(anillo[i][0] + vuelta, anillo[i][1]);
      var x = Math.round(p[0] * 10) / 10, y = Math.round(p[1] * 10) / 10;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x === px && y === py) continue;        // saltea puntos repetidos tras redondear
      d += (d ? 'L' : 'M') + x + ' ' + y;
      px = x; py = y;
    }
    var margen = 60;
    var fuera = maxX < -margen || minX > ANCHO + margen || maxY < -margen || minY > alto + margen;
    if (fuera || d.length < 12) return '';
    return d + 'Z';
  }

  function geometriaAPath(polis, proy, alto) {
    var d = '';
    for (var i = 0; i < polis.length; i++) {
      for (var v = 0; v < VUELTAS.length; v++) {
        d += anilloAPath(polis[i], proy, alto, VUELTAS[v]);
      }
    }
    return d;
  }

  function construirSVG(opciones) {
    var zona = ZONAS[opciones.zona] || ZONAS.mundo;
    var proy = crearProyeccion(zona.vista);
    var alto = proy.alto;
    var jugables = {};
    (opciones.jugables || []).forEach(function (id) { jugables[id] = true; });

    var tierras = '';
    Object.keys(window.GEO_MUNDO).forEach(function (clave) {
      var geo = window.GEO_MUNDO[clave];
      var d = geometriaAPath(geo.p, proy, alto);
      if (!d) return;
      var esJugable = jugables[clave] === true;
      tierras += '<path class="pais' + (esJugable ? ' jugable' : '') + '"' +
                 (clave.charAt(0) === '~' ? '' : ' data-id="' + clave + '"') +
                 ' d="' + d + '"></path>';
    });

    // Puntos para los países demasiado chicos para verse en el mapa. Sólo se
    // dibujan los de la zona: los de afuera serían ruido y no se juegan.
    var puntos = '';
    (opciones.paises || window.PAISES).forEach(function (p) {
      if (!p.mini || !jugables[p.id]) return;
      var xy = proy.punto(p.lon, p.lat);
      if (xy[0] < -20 || xy[0] > ANCHO + 20 || xy[1] < -20 || xy[1] > alto + 20) return;
      puntos += '<circle class="punto jugable"' +
                ' data-id="' + p.id + '" cx="' + xy[0].toFixed(1) + '" cy="' + xy[1].toFixed(1) +
                '" r="6"></circle>';
    });

    var svg = '<svg viewBox="0 0 ' + ANCHO + ' ' + Math.round(alto) + '" ' +
              'preserveAspectRatio="xMidYMid meet" role="img" ' +
              'aria-label="Mapa de ' + zona.nombre + '">' +
              '<g class="capa-tierras">' + tierras + '</g>' +
              '<g class="capa-puntos">' + puntos + '</g>' +
              '<g class="capa-etiquetas"></g></svg>';

    return { svg: svg, alto: alto, proy: proy };
  }

  /* ---------------------- instancia ---------------------- */
  var listenerResize = null;    // sólo el mapa vivo escucha el resize

  function crear(contenedor, opciones) {
    opciones = opciones || {};
    var armado = construirSVG(opciones);
    contenedor.innerHTML = armado.svg;

    var svg = contenedor.querySelector('svg');
    var capaEtiquetas = svg.querySelector('.capa-etiquetas');
    var proy = armado.proy;
    var ALTO = armado.alto;
    var base = { x: 0, y: 0, w: ANCHO, h: ALTO };
    var vb = { x: 0, y: 0, w: ANCHO, h: ALTO };

    /* ---- viewBox ---- */

    /** Cuántas unidades del viewBox mide algo que en pantalla ocupa `px`. */
    function enUnidades(px) {
      var r = svg.getBoundingClientRect();
      var escala = Math.min(r.width / vb.w, r.height / vb.h);
      if (!escala || !isFinite(escala)) escala = r.width ? r.width / vb.w : (400 / vb.w);
      return px / escala;
    }

    function aplicar() {
      svg.setAttribute('viewBox', vb.x.toFixed(1) + ' ' + vb.y.toFixed(1) + ' ' +
                                  vb.w.toFixed(1) + ' ' + vb.h.toFixed(1));
      // puntos y etiquetas conservan su tamaño real en pantalla a cualquier zoom
      var radio = enUnidades(7).toFixed(2);
      svg.querySelectorAll('.punto').forEach(function (c) { c.setAttribute('r', radio); });
      var cuerpo = enUnidades(17).toFixed(2);
      var contorno = enUnidades(3.5).toFixed(2);
      capaEtiquetas.querySelectorAll('text').forEach(function (t) {
        t.setAttribute('font-size', cuerpo);
        t.style.strokeWidth = contorno + 'px';
      });
    }

    function encuadrar(nx, ny, nw) {
      var minW = ANCHO / ZOOM_MAX;
      vb.w = Util.limitar(nw, minW, base.w);
      vb.h = vb.w * base.h / base.w;
      vb.x = Util.limitar(nx, base.x - vb.w * .12, base.x + base.w - vb.w * .88);
      vb.y = Util.limitar(ny, base.y - vb.h * .12, base.y + base.h - vb.h * .88);
      aplicar();
    }

    /** Acerca o aleja manteniendo fijo un punto del viewBox (por defecto el centro). */
    function zoom(factor, cx, cy) {
      if (cx == null) { cx = vb.x + vb.w / 2; cy = vb.y + vb.h / 2; }
      var nw = Util.limitar(vb.w / factor, ANCHO / ZOOM_MAX, base.w);
      var r = nw / vb.w;
      encuadrar(cx - (cx - vb.x) * r, cy - (cy - vb.y) * r, nw);
    }

    function reiniciarVista() { encuadrar(0, 0, base.w); }

    /** Convierte coordenadas de pantalla a coordenadas del viewBox. */
    function aViewBox(clienteX, clienteY) {
      var r = svg.getBoundingClientRect();
      // preserveAspectRatio="meet": puede haber franjas a los costados
      var escala = Math.min(r.width / vb.w, r.height / vb.h);
      var anchoDib = vb.w * escala, altoDib = vb.h * escala;
      var offX = r.left + (r.width - anchoDib) / 2;
      var offY = r.top + (r.height - altoDib) / 2;
      return [vb.x + (clienteX - offX) / escala, vb.y + (clienteY - offY) / escala];
    }

    /* ---- arrastre, rueda y pellizco ---- */
    var punteros = new Map();
    var arrastro = null;
    var moviObastante = false;
    var distanciaPellizco = 0;

    svg.addEventListener('pointerdown', function (e) {
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (punteros.size === 1) {
        arrastro = { x: e.clientX, y: e.clientY, vbx: vb.x, vby: vb.y };
        moviObastante = false;
        svg.setPointerCapture(e.pointerId);
      } else if (punteros.size === 2) {
        var p = Array.from(punteros.values());
        distanciaPellizco = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        arrastro = null;
        moviObastante = true;
      }
    });

    svg.addEventListener('pointermove', function (e) {
      if (!punteros.has(e.pointerId)) return;
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (punteros.size === 2 && distanciaPellizco) {
        var p = Array.from(punteros.values());
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        if (d > 0) {
          var centro = aViewBox((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
          zoom(d / distanciaPellizco, centro[0], centro[1]);
          distanciaPellizco = d;
        }
        return;
      }
      if (!arrastro) return;
      var dx = e.clientX - arrastro.x, dy = e.clientY - arrastro.y;
      if (!moviObastante && Math.hypot(dx, dy) < 7) return;      // todavía puede ser un clic
      moviObastante = true;
      svg.classList.add('arrastrando');
      var r = svg.getBoundingClientRect();
      var escala = Math.min(r.width / vb.w, r.height / vb.h);
      encuadrar(arrastro.vbx - dx / escala, arrastro.vby - dy / escala, vb.w);
    });

    function soltar(e) {
      punteros.delete(e.pointerId);
      if (punteros.size < 2) distanciaPellizco = 0;
      if (punteros.size === 0) { arrastro = null; svg.classList.remove('arrastrando'); }
    }

    /* El toque se resuelve acá y no con un listener de "click": como el SVG
       captura el puntero para poder arrastrar, el navegador dispara el click
       sobre el <svg> y no sobre el país. */
    svg.addEventListener('pointerup', function (ev) {
      var eraArrastre = moviObastante;
      var eraUnico = punteros.size === 1;
      soltar(ev);
      if (eraArrastre || !eraUnico || ev.button > 0 || !opciones.onClic) {
        moviObastante = false;
        return;
      }
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      el = el && el.closest ? el.closest('[data-id]') : null;
      if (el && svg.contains(el)) {
        opciones.onClic(el.getAttribute('data-id'), el.classList.contains('jugable'), el);
      }
    });
    svg.addEventListener('pointercancel', soltar);
    svg.addEventListener('pointerleave', soltar);

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var c = aViewBox(e.clientX, e.clientY);
      zoom(Math.pow(1.0018, -e.deltaY), c[0], c[1]);
    }, { passive: false });

    /* ---- marcado y etiquetas ---- */
    function elementos(id) {
      return svg.querySelectorAll('[data-id="' + id + '"]');
    }

    function marcar(id, clase) {
      elementos(id).forEach(function (el) {
        el.classList.add(clase);
        el.parentNode.appendChild(el);         // lo trae al frente para que se vea el borde
      });
    }

    function desmarcar(id, clase) {
      elementos(id).forEach(function (el) { el.classList.remove(clase); });
    }

    function limpiarMarcas() {
      svg.querySelectorAll('.correcto, .fallo, .revelado').forEach(function (el) {
        el.classList.remove('correcto', 'fallo', 'revelado');
      });
      Util.vaciar(capaEtiquetas);
    }

    /** Punto del país dentro de la vista (recortado para que nunca quede afuera). */
    function puntoDe(pais) {
      var xy = proy.punto(pais.lon, pais.lat);
      return [Util.limitar(xy[0], 60, ANCHO - 60), Util.limitar(xy[1], 26, ALTO - 20)];
    }

    function etiqueta(pais, texto) {
      var xy = puntoDe(pais);
      var t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('class', 'etiqueta-mapa');
      t.setAttribute('x', xy[0].toFixed(1));
      t.setAttribute('y', xy[1].toFixed(1));
      t.textContent = texto;
      capaEtiquetas.appendChild(t);
      aplicar();
      return t;
    }

    /** Acerca la vista a un país (para que se vean los más chiquitos). */
    function enfocar(pais, zoomDeseado) {
      var xy = puntoDe(pais);
      var nw = base.w / (zoomDeseado || 6);
      var nh = nw * base.h / base.w;
      encuadrar(xy[0] - nw / 2, xy[1] - nh / 2, nw);
    }

    /** ¿El país cae dentro del recorte de esta zona? */
    function estaEnVista(pais) {
      var xy = proy.punto(pais.lon, pais.lat);
      return xy[0] >= 0 && xy[0] <= ANCHO && xy[1] >= 0 && xy[1] <= ALTO;
    }

    /* El panel se angosta para los mapas altos (Sudamérica, América) así el
       dibujo aprovecha toda la altura disponible en vez de quedar chiquito
       con océano a los costados. */
    var panel = contenedor.closest('.zona-mapa') || contenedor;
    function ajustarPanel() {
      // Altura realmente disponible: lo que hay arriba del mapa (encabezado y
      // pregunta) y lo que va abajo (márgenes, pie) se descuentan, así la
      // partida entra en la pantalla y la página no necesita scrollear.
      var caja = panel.getBoundingClientRect();
      var arriba = caja.top + (window.scrollY || 0);
      var contenedor = panel.closest('#app') || document.body;
      var pie = document.querySelector('.pie');
      // lo que va debajo del mapa: el margen del contenedor y el pie (si se ve)
      var abajo = Math.max(0, contenedor.getBoundingClientRect().bottom - caja.bottom) +
                  (pie ? pie.getBoundingClientRect().height : 0);
      var libre = window.innerHeight - arriba - abajo - 8;
      var altoMax = Math.max(240, Math.min(libre, 700));
      panel.style.maxWidth = Math.round(altoMax * ANCHO / ALTO) + 'px';
    }
    function recalcular() { ajustarPanel(); aplicar(); }
    recalcular();
    if (listenerResize) window.removeEventListener('resize', listenerResize);
    listenerResize = recalcular;
    window.addEventListener('resize', listenerResize);
    // el panel recién tiene medidas reales después del primer pintado
    requestAnimationFrame(recalcular);

    return {
      svg: svg,
      ajustarPanel: recalcular,
      zoom: zoom,
      reiniciar: reiniciarVista,
      marcar: marcar,
      desmarcar: desmarcar,
      limpiarMarcas: limpiarMarcas,
      etiqueta: etiqueta,
      enfocar: enfocar,
      estaEnVista: estaEnVista,
      nivelZoom: function () { return base.w / vb.w; }
    };
  }

  return {
    crear: crear,
    zonas: listaZonas,
    paisesDeZona: paisesDeZona,
    ZONAS: ZONAS
  };
})();
