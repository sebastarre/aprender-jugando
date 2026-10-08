/* ============================================================
   Regenera js/datos/paises.js y js/datos/geografia.js.

   Uso:  node herramientas/generar-datos.js
   Necesita Node 18 o más nuevo (usa fetch) y conexión a internet la
   primera vez: descarga las fuentes a herramientas/cache/.

   Fuentes:
     - world-atlas (Natural Earth 110m): contornos de los países.
       world-atlas tiene licencia ISC y los contornos de Natural Earth
       son de dominio público.
     - world-countries: nombres en español, capitales y región. Sus
       datos están bajo la Open Database License (ODbL) 1.0, que pide
       avisarlo en la base derivada (js/datos/paises.js) y ofrecerla
       bajo la misma licencia: por eso paises.js sale con su propia
       cabecera, y la app lo nombra en los créditos.

   Los contornos no se usan tal cual vienen. Natural Earth dibuja las
   fronteras «de hecho»; acá se dibujan las que enseña la escuela
   argentina y reconoce la ONU (ver UNIONES, más abajo).
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache');
const OUT = RAIZ;

const FUENTES = {
  'countries-110m.json': 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
  'world-countries.json': 'https://cdn.jsdelivr.net/npm/world-countries@5.0.0/countries.json'
};

/* Territorios que Natural Earth dibuja aparte y acá van con su país. Las
   claves son las de world-atlas: el código numérico ISO 3166, o 'x' y el
   nombre para los que no tienen. `caja` ([lon mín, lon máx, lat mín,
   lat máx]) se lleva sólo los pedazos que caen adentro; sin caja, pasa
   el territorio entero. La frontera que comparten se borra, así el país
   queda de una pieza y se pinta entero al acertarlo.
   Los demás territorios que no son países miembros de la ONU (Taiwán,
   Palestina, el Sahara Occidental, Kosovo) y los que dependen de otro
   país (Groenlandia, Puerto Rico, Nueva Caledonia) siguen dibujándose
   aparte, en gris. Al Sahara Occidental, además, se le devuelve la costa
   que Natural Earth dibuja dentro de Marruecos (ver cortarSahara). */
const UNIONES = [
  // las Malvinas son argentinas: así las dibuja la cartografía oficial
  // (Ley 22.963) y así las enseña la escuela (Ley 26.651)
  { a: '032', de: '238' },
  // Crimea es de Ucrania para la ONU (resolución 68/262 de la Asamblea General)
  { a: '804', de: '643', caja: [32, 37, 44, 46.5] },
  // el norte de Chipre y Somalilandia: la ONU los cuenta como parte de
  // Chipre (resolución 541 del Consejo de Seguridad) y de Somalia
  { a: '196', de: 'xN. Cyprus' },
  { a: '706', de: 'xSomaliland' }
];

/* El Sahara Occidental, entero y aparte. Natural Earth 1:110m dibuja
   dentro de Marruecos toda la costa del Sahara Occidental (El Aaiún,
   Dajla), y como territorio aparte deja sólo la franja del este, detrás
   del muro. Para la ONU es un territorio no autónomo, sin país, y así
   tiene que verse: entero y en gris. No alcanza con UNIONES, porque lo
   que hay que mover no es un territorio sino un pedazo de Marruecos, y
   se hace con los puntos ya armados: Marruecos se corta en los 27° 40′
   (su frontera con el Sahara, que Natural Earth ya dibuja en el este) y
   la costa que queda al sur pasa al Sahara, en lugar del muro. Si una
   versión nueva de world-atlas cambia algo de esto, que se note acá. */
const CORTE_SAHARA = 27.6;

function cortarSahara(geomsById) {
  const cambio = () => new Error('el Sahara cambió: revisar el corte');
  const ma = geomsById['504'], sa = geomsById['732'];
  if (!ma || !sa || ma.polis.length !== 1 || sa.polis.length !== 1) throw cambio();
  const m = ma.polis[0], s = sa.polis[0];
  const igual = (p, q) => p[0] === q[0] && p[1] === q[1];
  const enSahara = p => s.some(q => igual(p, q));

  // en Marruecos, lo que queda al sur del corte es un solo tramo: el muro y la costa
  const sur = m.map((p, i) => (p[1] < CORTE_SAHARA ? i : -1)).filter(i => i >= 0);
  const i0 = sur[0], i1 = sur[sur.length - 1];
  if (!sur.length || i1 - i0 !== sur.length - 1 || i0 === 0 || i1 === m.length - 1) throw cambio();
  const tramo = m.slice(i0, i1 + 1);
  // el muro es lo que comparte con el Sahara; la costa, lo que sigue
  const k = tramo.findIndex(p => !enSahara(p));
  if (k < 1 || tramo.slice(k).some(enSahara)) throw cambio();
  const muro = tramo.slice(0, k), costa = tramo.slice(k);

  // en el Sahara, el muro está al revés: de donde arranca la costa hasta el norte
  const a = s.findIndex(p => igual(p, muro[muro.length - 1]));
  const b = a + muro.length - 1;
  if (a < 0 || b >= s.length || muro.some((p, j) => !igual(p, s[b - j]))) throw cambio();
  if (!igual(s[(b + 1) % s.length], m[i0 - 1])) throw cambio();

  sa.polis[0] = s.slice(0, a + 1).concat(costa, [m[i1 + 1]], s.slice(b + 1));
  ma.polis[0] = m.slice(0, i0).concat(m.slice(i1 + 1));
}

async function fuente(nombre) {
  fs.mkdirSync(CACHE, { recursive: true });
  const destino = path.join(CACHE, nombre);
  if (!fs.existsSync(destino)) {
    process.stdout.write('descargando ' + nombre + '... ');
    const r = await fetch(FUENTES[nombre]);
    if (!r.ok) throw new Error('no se pudo descargar ' + nombre + ' (HTTP ' + r.status + ')');
    fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
    console.log('listo');
  }
  return JSON.parse(fs.readFileSync(destino, 'utf8'));
}

async function principal() {
  const topo = await fuente('countries-110m.json');
  const wc = (await fuente('world-countries.json')).filter(c => c.independent && c.unMember);
  generar(topo, wc);
}

function generar(topo, wc) {
    /* ---------- 1. TopoJSON -> GeoJSON ---------- */
  const { scale, translate } = topo.transform;

  function decodeArc(arc) {
    let x = 0, y = 0;
    return arc.map(function (d) {
      x += d[0]; y += d[1];
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  }
  const ARCS = topo.arcs.map(decodeArc);

  function ringFrom(arcIdx) {
    const pts = [];
    for (const i of arcIdx) {
      const a = i < 0 ? ARCS[~i].slice().reverse() : ARCS[i];
      for (let k = (pts.length ? 1 : 0); k < a.length; k++) pts.push(a[k]);
    }
    return pts;
  }
  const r2 = n => Math.round(n * 100) / 100;

  function cleanRing(ring) {
    const out = [];
    for (const p of ring) {
      const q = [r2(p[0]), r2(p[1])];
      const last = out[out.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) out.push(q);
    }
    if (out.length > 1) {
      const a = out[0], b = out[out.length - 1];
      if (a[0] === b[0] && a[1] === b[1]) out.pop();
    }
    return out.length >= 3 ? out : null;
  }

  /* Un anillo que cruza el meridiano 180 (Rusia, Fiyi, Kiribati) llega con
     saltos de casi 360 grados. Se "desenrolla" para que quede continuo aunque
     las longitudes se pasen de +-180; el mapa dibuja copias desplazadas. */
  function unrollRing(r) {
    const out = [r[0]];
    for (let i = 1; i < r.length; i++) {
      let lon = r[i][0];
      const prev = out[i - 1][0];
      while (lon - prev > 180) lon -= 360;
      while (prev - lon > 180) lon += 360;
      out.push([Math.round(lon * 100) / 100, r[i][1]]);
    }
    return out;
  }

  function ringArea(r) {
    let s = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] * r[i][1] - r[i][0] * r[j][1]);
    return Math.abs(s / 2);
  }

  /* Todavía como listas de arcos (sólo el anillo de afuera de cada
     polígono): así dos territorios vecinos se pueden juntar borrando el
     arco que comparten, antes de pasarlos a puntos. */
  const anillosPorClave = {};
  const nombrePorClave = {};
  for (const g of topo.objects.countries.geometries) {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    let key;
    if (g.id !== undefined && !isNaN(+g.id)) key = String(+g.id).padStart(3, '0');
    else key = 'x' + g.properties.name;
    anillosPorClave[key] = polys.map(poly => poly[0]);
    nombrePorClave[key] = g.properties.name;
  }

  const arcoDe = i => (i < 0 ? ~i : i);
  const puntaDe = p => p[0] + ',' + p[1];
  const inicioDe = i => { const a = ARCS[arcoDe(i)]; return puntaDe(i < 0 ? a[a.length - 1] : a[0]); };
  const finDe = i => { const a = ARCS[arcoDe(i)]; return puntaDe(i < 0 ? a[0] : a[a.length - 1]); };

  /* Junta anillos vecinos: un arco que aparece dos veces (una en cada
     sentido) es la frontera entre los dos y se borra; los que quedan se
     vuelven a encadenar por sus puntas. Si no comparten nada (las
     Malvinas son islas) los anillos quedan como estaban. */
  function disolver(anillos) {
    const usos = {};
    anillos.forEach(r => r.forEach(i => { usos[arcoDe(i)] = (usos[arcoDe(i)] || 0) + 1; }));
    if (Object.keys(usos).every(k => usos[k] === 1)) return anillos;
    const sueltos = [];
    anillos.forEach(r => r.forEach(i => { if (usos[arcoDe(i)] === 1) sueltos.push(i); }));
    const porInicio = {};
    for (const i of sueltos) {
      if (porInicio[inicioDe(i)] !== undefined) throw new Error('dos arcos salen del mismo punto: no sé cómo unirlos');
      porInicio[inicioDe(i)] = i;
    }
    const usados = new Set();
    const salida = [];
    for (const i of sueltos) {
      if (usados.has(i)) continue;
      const anillo = [];
      for (let j = i; j !== undefined && !usados.has(j); j = porInicio[finDe(j)]) {
        usados.add(j);
        anillo.push(j);
      }
      if (finDe(anillo[anillo.length - 1]) !== inicioDe(anillo[0])) throw new Error('un anillo unido no cierra');
      salida.push(anillo);
    }
    return salida;
  }

  function dentroDe(anillo, caja) {
    return ringFrom(anillo).every(p => p[0] >= caja[0] && p[0] <= caja[1] && p[1] >= caja[2] && p[1] <= caja[3]);
  }

  for (const u of UNIONES) {
    const de = anillosPorClave[u.de];
    // si una versión nueva de world-atlas cambia algo, que se note acá y no en el mapa
    if (!de || !anillosPorClave[u.a]) throw new Error('para unir ' + u.de + ' a ' + u.a + ' falta ' + (de ? u.a : u.de));
    const pasan = u.caja ? de.filter(r => dentroDe(r, u.caja)) : de;
    if (!pasan.length) throw new Error('ningún pedazo de ' + u.de + ' cae en la caja para ' + u.a);
    anillosPorClave[u.a] = disolver(anillosPorClave[u.a].concat(pasan));
    const quedan = de.filter(r => pasan.indexOf(r) < 0);
    if (quedan.length) anillosPorClave[u.de] = quedan;
    else { delete anillosPorClave[u.de]; delete nombrePorClave[u.de]; }
  }

  const geomsById = {};
  for (const key of Object.keys(anillosPorClave)) {
    const out = [];
    for (const anillo of anillosPorClave[key]) {
      const ext = cleanRing(ringFrom(anillo));
      if (ext && ringArea(ext) > 0.015) out.push(unrollRing(ext));
    }
    if (!out.length) continue;
    geomsById[key] = { nombre: nombrePorClave[key], polis: out };
  }

  cortarSahara(geomsById);

  /* ---------- 2. Paises ---------- */

  const CONT = {
    'South America': 'america', 'Central America': 'america', 'Caribbean': 'america', 'North America': 'america',
    'Northern Europe': 'europa', 'Western Europe': 'europa', 'Southern Europe': 'europa',
    'Eastern Europe': 'europa', 'Central Europe': 'europa', 'Southeast Europe': 'europa',
    'Western Asia': 'asia', 'Central Asia': 'asia', 'Southern Asia': 'asia',
    'Eastern Asia': 'asia', 'South-Eastern Asia': 'asia',
    'Northern Africa': 'africa', 'Western Africa': 'africa', 'Middle Africa': 'africa',
    'Eastern Africa': 'africa', 'Southern Africa': 'africa',
    'Australia and New Zealand': 'oceania', 'Melanesia': 'oceania', 'Micronesia': 'oceania', 'Polynesia': 'oceania'
  };
  const SUBREG = {
    'South America': 'América del Sur', 'Central America': 'América Central', 'Caribbean': 'Caribe',
    'North America': 'América del Norte',
    'Northern Europe': 'Europa del Norte', 'Western Europe': 'Europa Occidental', 'Southern Europe': 'Europa del Sur',
    'Eastern Europe': 'Europa del Este', 'Central Europe': 'Europa Central', 'Southeast Europe': 'Europa Sudoriental',
    'Western Asia': 'Asia Occidental', 'Central Asia': 'Asia Central', 'Southern Asia': 'Asia del Sur',
    'Eastern Asia': 'Asia Oriental', 'South-Eastern Asia': 'Sudeste Asiático',
    'Northern Africa': 'África del Norte', 'Western Africa': 'África Occidental', 'Middle Africa': 'África Central',
    'Eastern Africa': 'África Oriental', 'Southern Africa': 'África Austral',
    'Australia and New Zealand': 'Australia y Nueva Zelanda', 'Melanesia': 'Melanesia',
    'Micronesia': 'Micronesia', 'Polynesia': 'Polinesia'
  };

  /* Nombres y capitales con la graf\u00eda que recomienda la RAE cuando la de
     world-countries viene en ingl\u00e9s o en la lengua del pa\u00eds. A prop\u00f3sito
     quedan Ngerulmud (no hay forma espa\u00f1ola), Ottawa, Abuja y Nueva Delhi,
     que son las que se ven en los mapas y libros de ac\u00e1. */
  const NOMBRE = {
    BD: 'Banglad\u00e9s', BH: 'Bar\u00e9in', BN: 'Brun\u00e9i', BW: 'Botsuana',
    CD: 'Rep\u00fablica Democr\u00e1tica del Congo', CG: 'Rep\u00fablica del Congo',
    CZ: 'Rep\u00fablica Checa', DJ: 'Yibuti', GD: 'Granada', IR: 'Ir\u00e1n', KG: 'Kirguist\u00e1n',
    LS: 'Lesoto', ML: 'Mal\u00ed', MW: 'Malaui', PW: 'Palaos',
    SK: 'Eslovaquia', SL: 'Sierra Leona', SZ: 'Esuatini', ZA: 'Sud\u00e1frica',
    RO: 'Rumania', SA: 'Arabia Saudita', GW: 'Guinea-Bis\u00e1u', TL: 'Timor Oriental',
    VC: 'San Vicente y las Granadinas', FM: 'Micronesia'
  };
  const CAPITAL = {
    AD: 'Andorra la Vieja', AE: 'Abu Dabi', AM: 'Erev\u00e1n', AT: 'Viena', AZ: 'Bak\u00fa',
    BD: 'Daca', BE: 'Bruselas', BF: 'Uagadug\u00fa', BG: 'Sof\u00eda', BR: 'Brasilia',
    BS: 'Nas\u00e1u', BT: 'Timbu', BZ: 'Belmop\u00e1n', CH: 'Berna', CI: 'Yamusukro',
    CL: 'Santiago de Chile', CM: 'Yaund\u00e9', CN: 'Pek\u00edn', CU: 'La Habana', CZ: 'Praga',
    DE: 'Berl\u00edn', DJ: 'Yibuti', DK: 'Copenhague', DZ: 'Argel', EE: 'Tallin', EG: 'El Cairo',
    ET: 'Ad\u00eds Abeba', FR: 'Par\u00eds', GB: 'Londres', GD: 'Saint George', GE: 'Tiflis',
    GH: 'Acra', GN: 'Conakri', GR: 'Atenas', GT: 'Ciudad de Guatemala', GW: 'Bis\u00e1u',
    // se mud\u00f3 por decreto en enero de 2026 (ver CAPITAL_ANTES)
    GQ: 'Ciudad de la Paz',
    HT: 'Puerto Pr\u00edncipe', ID: 'Yakarta', IE: 'Dubl\u00edn', KI: 'Tarawa Sur',
    IL: 'Jerusal\u00e9n', IN: 'Nueva Delhi', IQ: 'Bagdad', IR: 'Teher\u00e1n', IS: 'Reikiavik',
    IT: 'Roma', JO: 'Am\u00e1n', JP: 'Tokio', KG: 'Biskek', KH: 'Nom Pen', KP: 'Pionyang', KR: 'Se\u00fal',
    KW: 'Ciudad de Kuwait', KZ: 'Astan\u00e1', LA: 'Vienti\u00e1n', LT: 'Vilna', LU: 'Luxemburgo',
    LY: 'Tr\u00edpoli', MC: 'M\u00f3naco', MD: 'Chisin\u00e1u', MK: 'Skopie', MM: 'Naipyid\u00f3',
    MN: 'Ul\u00e1n Bator', MR: 'Nuakchot', MT: 'La Valeta', MW: 'Lilong\u00fce',
    MX: 'Ciudad de M\u00e9xico', NL: '\u00c1msterdam',
    NP: 'Katmand\u00fa', OM: 'Mascate',
    PA: 'Ciudad de Panam\u00e1', PL: 'Varsovia', PT: 'Lisboa', RO: 'Bucarest', RS: 'Belgrado',
    RU: 'Mosc\u00fa', SA: 'Riad', SD: 'Jartum', SE: 'Estocolmo', SG: 'Singapur',
    SI: 'Liubliana', SM: 'San Marino', SS: 'Yuba',
    SO: 'Mogadiscio', ST: 'Santo Tom\u00e9', SY: 'Damasco', SZ: 'Mbabane', TD: 'Yamena',
    TJ: 'Dusamb\u00e9', TM: 'Asjabad', TN: 'T\u00fanez', TO: 'Nukualofa', TT: 'Puerto Espa\u00f1a', UA: 'Kiev',
    US: 'Washington D. C.', UZ: 'Taskent', VA: 'Ciudad del Vaticano', VN: 'Han\u00f3i', YE: 'San\u00e1'
  };
  /* Capitales que cambiaron hace poco: en los libros y en muchos mapas
     todav\u00eda figura la de antes, as\u00ed que el juego lo aclara al acertarla.
     Queda en el pa\u00eds como `antes` (la capital vieja) y `hasta` (el a\u00f1o). */
  const CAPITAL_ANTES = { GQ: ['Malabo', 2026] };

  /* Dos pa\u00edses que no van en la subregi\u00f3n de world-countries. Sud\u00e1n del
     Sur va en \u00c1frica Oriental, como lo pone la ONU. Ir\u00e1n, en cambio, se
     aparta a prop\u00f3sito de la ONU (que lo pone en Asia del Sur): se lo
     ense\u00f1a como parte de Medio Oriente, y as\u00ed en el mapa sale en el mismo
     nivel que sus vecinos Irak, Turqu\u00eda y Arabia Saudita. */
  const SUBREGION = { SS: 'Eastern Africa', IR: 'Western Asia' };

  const paises = [];
  for (const c of wc) {
    const subregion = SUBREGION[c.cca2] || c.subregion;
    const cont = CONT[subregion];
    if (!cont) { console.warn('subregion sin continente:', subregion, c.cca2); continue; }
    const id = String(+c.ccn3).padStart(3, '0');
    const pais = {
      id: c.cca2,
      n3: id,
      nombre: NOMBRE[c.cca2] || c.translations.spa.common,
      capital: CAPITAL[c.cca2] || c.capital[0],
      cont: cont,
      sub: SUBREG[subregion],
      lat: c.latlng[0],
      lon: c.latlng[1],
      mini: geomsById[id] ? 0 : 1
    };
    if (CAPITAL_ANTES[c.cca2]) {
      pais.antes = CAPITAL_ANTES[c.cca2][0];
      pais.hasta = CAPITAL_ANTES[c.cca2][1];
    }
    paises.push(pais);
  }
  paises.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  /* ---------- 3. Geometria ---------- */
  const n3a2 = {};
  paises.forEach(p => { n3a2[p.n3] = p.id; });

  const geo = {};
  for (const key of Object.keys(geomsById)) {
    const g = geomsById[key];
    const clave = n3a2[key] ? n3a2[key] : '~' + key;
    geo[clave] = { n: g.nombre, p: g.polis };
  }

  /* ---------- 4. Escribir ---------- */
  fs.mkdirSync(path.join(OUT, 'js/datos'), { recursive: true });
  // cada archivo con su cabecera: la de paises.js es el aviso que pide la ODbL
  const cabezaPaises =
    '/* Generado por herramientas/generar-datos.js: los cambios se hacen allá.\n\n' +
    '   Contiene datos de world-countries (https://github.com/mledoze/countries),\n' +
    '   disponibles bajo la Open Database License (ODbL) 1.0\n' +
    '   (https://opendatacommons.org/licenses/odbl/1-0/). Es una versión\n' +
    '   adaptada (los 193 países miembros de la ONU y el Vaticano, con nombres,\n' +
    '   capitales y regiones retocados; ver herramientas/generar-datos.js), y\n' +
    '   se ofrece bajo la misma licencia. */\n';
  const cabezaGeo =
    '/* Generado por herramientas/generar-datos.js: los cambios se hacen allá.\n\n' +
    '   Contornos de world-atlas (https://github.com/topojson/world-atlas,\n' +
    '   licencia ISC), hechos con los de Natural Earth 1:110m, que son de\n' +
    '   dominio público. Las Malvinas van con la Argentina; Crimea, con\n' +
    '   Ucrania; el norte de Chipre, con Chipre, y Somalilandia, con Somalia.\n' +
    '   El Sahara Occidental va entero y aparte, con la costa que Natural\n' +
    '   Earth dibuja dentro de Marruecos.\n' +
    '   Las claves que empiezan con ~ son territorios que no son países de la\n' +
    '   lista: se dibujan en gris y no se juegan. */\n';
  fs.writeFileSync(path.join(OUT, 'js/datos/paises.js'),
    cabezaPaises + 'window.PAISES = ' + JSON.stringify(paises) + ';\n', 'utf8');
  fs.writeFileSync(path.join(OUT, 'js/datos/geografia.js'),
    cabezaGeo + 'window.GEO_MUNDO = ' + JSON.stringify(geo) + ';\n', 'utf8');

  const cuenta = {};
  paises.forEach(p => { cuenta[p.cont] = (cuenta[p.cont] || 0) + 1; });
  console.log('paises:', paises.length, cuenta);
  console.log('sin poligono:', paises.filter(p => p.mini).length);
  console.log('geometrias:', Object.keys(geo).length,
    '| jugables:', Object.keys(geo).filter(k => k[0] !== '~').length);
  console.log('KB:',
    Math.round(fs.statSync(path.join(OUT, 'js/datos/paises.js')).size / 1024),
    Math.round(fs.statSync(path.join(OUT, 'js/datos/geografia.js')).size / 1024));

}

principal().catch(e => { console.error('Error:', e.message); process.exit(1); });
