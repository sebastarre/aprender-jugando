/* ============================================================
   Regenera js/datos/paises.js y js/datos/geografia.js.

   Uso:  node herramientas/generar-datos.js
   Necesita Node 18 o más nuevo (usa fetch) y conexión a internet la
   primera vez: descarga las fuentes a herramientas/cache/.

   Fuentes:
     - world-atlas (Natural Earth 110m): contornos de los países.
     - world-countries: nombres en español, capitales y región.
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

  const geomsById = {};
  for (const g of topo.objects.countries.geometries) {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
    const out = [];
    for (const poly of polys) {
      const ext = cleanRing(ringFrom(poly[0]));
      if (ext && ringArea(ext) > 0.015) out.push(unrollRing(ext));
    }
    if (!out.length) continue;
    let key;
    if (g.id !== undefined && !isNaN(+g.id)) key = String(+g.id).padStart(3, '0');
    else key = 'x' + g.properties.name;
    geomsById[key] = { nombre: g.properties.name, polis: out };
  }

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

  const NOMBRE = {
    BH: 'Bar\u00e9in', CD: 'Rep\u00fablica Democr\u00e1tica del Congo', CG: 'Rep\u00fablica del Congo',
    CZ: 'Rep\u00fablica Checa', DJ: 'Yibuti', GD: 'Granada', IR: 'Ir\u00e1n', KG: 'Kirguist\u00e1n',
    ML: 'Mal\u00ed', SK: 'Eslovaquia', SL: 'Sierra Leona', SZ: 'Esuatini', ZA: 'Sud\u00e1frica',
    RO: 'Rumania', SA: 'Arabia Saudita', GW: 'Guinea-Bis\u00e1u', TL: 'Timor Oriental',
    VC: 'San Vicente y las Granadinas', FM: 'Micronesia'
  };
  const CAPITAL = {
    AD: 'Andorra la Vieja', AE: 'Abu Dabi', AM: 'Erev\u00e1n', AT: 'Viena', AZ: 'Bak\u00fa',
    BE: 'Bruselas', BF: 'Uagadug\u00fa', BG: 'Sof\u00eda', BR: 'Brasilia', BT: 'Timbu',
    BZ: 'Belmop\u00e1n', CH: 'Berna',
    CL: 'Santiago de Chile', CM: 'Yaund\u00e9', CN: 'Pek\u00edn', CU: 'La Habana', CZ: 'Praga',
    DE: 'Berl\u00edn', DJ: 'Yibuti', DK: 'Copenhague', DZ: 'Argel', EE: 'Tallin', EG: 'El Cairo',
    ET: 'Ad\u00eds Abeba', FR: 'Par\u00eds', GB: 'Londres', GD: 'Saint George', GE: 'Tiflis',
    GN: 'Conakri', GR: 'Atenas', GT: 'Ciudad de Guatemala', GW: 'Bis\u00e1u',
    HT: 'Puerto Pr\u00edncipe', ID: 'Yakarta', IE: 'Dubl\u00edn', KI: 'Tarawa Sur',
    IL: 'Jerusal\u00e9n', IN: 'Nueva Delhi', IQ: 'Bagdad', IR: 'Teher\u00e1n', IS: 'Reikiavik',
    IT: 'Roma', JO: 'Am\u00e1n', JP: 'Tokio', KG: 'Biskek', KP: 'Pionyang', KR: 'Se\u00fal',
    KW: 'Ciudad de Kuwait', KZ: 'Astan\u00e1', LA: 'Vienti\u00e1n', LT: 'Vilna', LU: 'Luxemburgo',
    LY: 'Tr\u00edpoli', MC: 'M\u00f3naco', MD: 'Chisin\u00e1u', MM: 'Naipyid\u00f3', MN: 'Ul\u00e1n Bator',
    MR: 'Nuakchot', MT: 'La Valeta', MX: 'Ciudad de M\u00e9xico', NL: '\u00c1msterdam',
    NP: 'Katmand\u00fa', OM: 'Mascate',
    PA: 'Ciudad de Panam\u00e1', PL: 'Varsovia', PT: 'Lisboa', RO: 'Bucarest', RS: 'Belgrado',
    RU: 'Mosc\u00fa', SA: 'Riad', SD: 'Jartum', SE: 'Estocolmo', SG: 'Singapur',
    SI: 'Liubliana', SM: 'San Marino',
    SO: 'Mogadiscio', ST: 'Santo Tom\u00e9', SY: 'Damasco', SZ: 'Mbabane', TD: 'Yamena',
    TJ: 'Dusamb\u00e9', TM: 'Asjabad', TN: 'T\u00fanez', TT: 'Puerto Espa\u00f1a', UA: 'Kiev',
    US: 'Washington D. C.', UZ: 'Taskent', VA: 'Ciudad del Vaticano', VN: 'Han\u00f3i', YE: 'San\u00e1'
  };

  const paises = [];
  for (const c of wc) {
    const cont = CONT[c.subregion];
    if (!cont) { console.warn('subregion sin continente:', c.subregion, c.cca2); continue; }
    const id = String(+c.ccn3).padStart(3, '0');
    paises.push({
      id: c.cca2,
      n3: id,
      nombre: NOMBRE[c.cca2] || c.translations.spa.common,
      capital: CAPITAL[c.cca2] || c.capital[0],
      cont: cont,
      sub: SUBREG[c.subregion],
      lat: c.latlng[0],
      lon: c.latlng[1],
      mini: geomsById[id] ? 0 : 1
    });
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
  const head = '/* Generado automaticamente por scripts de construccion.\n' +
    '   Fuentes: world-atlas (Natural Earth 110m) y world-countries. */\n';
  fs.writeFileSync(path.join(OUT, 'js/datos/paises.js'),
    head + 'window.PAISES = ' + JSON.stringify(paises) + ';\n', 'utf8');
  fs.writeFileSync(path.join(OUT, 'js/datos/geografia.js'),
    head + 'window.GEO_MUNDO = ' + JSON.stringify(geo) + ';\n', 'utf8');

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
