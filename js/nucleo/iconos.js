/* ============================================================
   Los íconos de la app, dibujados a mano en SVG.

   Antes eran emoji. El problema del emoji no es que sea feo: es que lo
   dibuja el sistema operativo, así que el mismo 🌎 se ve de una forma
   en Android, de otra en iPhone y de otra en Windows. No se le puede
   cambiar el color, no se le puede ajustar el grosor, y la app termina
   viéndose distinta en cada teléfono.

   Estos son todos del mismo palo: grilla de 24, trazo redondeado y
   grueso (para que se lean chiquitos y combinen con los bordes gordos
   del resto), y dos tonos. El trazo usa `currentColor`, así que un
   ícono toma el color del texto que lo rodea; el relleno blando usa
   --ico-relleno, que por defecto es el mismo color con transparencia.

   Los emoji siguen existiendo donde son contenido y no interfaz: los
   avatares que elige el chico y los de la tienda. Ahí que los dibuje el
   teléfono está bien, son personajes, no botones.
   ============================================================ */
window.Iconos = (function () {
  'use strict';

  /* Cada ícono es una lista de formas. `b` es el relleno blando (va
     abajo, sin trazo) y `t` el trazo de encima. */
  var DIBUJOS = {

    /* ---- materias ---- */
    geografia: {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>',
          '<path d="M3 12h18"/>',
          '<path d="M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9Z"/>']
    },
    /* Una calculadora: pantallita arriba y cuatro teclas. La primera
       versión era un cuadrado con un más y un punto, y a 40 píxeles se
       leía como una carita de robot. */
    matematica: {
      b: ['<rect x="4.5" y="2.5" width="15" height="19" rx="4"/>'],
      t: ['<rect x="4.5" y="2.5" width="15" height="19" rx="4"/>',
          '<rect x="7.5" y="5.5" width="9" height="4" rx="1.4"/>',
          '<path d="M8.6 13.2h1.4M8.6 17.4h1.4M14 13.2h1.4M14 17.4h1.4" stroke-width="2.6"/>']
    },
    lengua: {
      b: ['<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z"/>'],
      t: ['<path d="M12 6.5C12 5 13.8 4 16 4h3.2c.4 0 .8.4.8.9v13.3c0 .5-.4.9-.9.8-2.6-.3-5 .2-6.6 1.3-.3.2-.7 0-.7-.4Z"/>',
          '<path d="M12 6.5C12 5 10.2 4 8 4H4.8c-.4 0-.8.4-.8.9v13.3c0 .5.4.9.9.8 2.6-.3 5 .2 6.6 1.3.3.2.7 0 .7-.4Z"/>']
    },
    ciencias: {
      b: ['<path d="M10 4h4v5.2l4.2 7.3A2 2 0 0 1 16.5 20h-9a2 2 0 0 1-1.7-3.5L10 9.2Z"/>'],
      t: ['<path d="M10 4h4v5.2l4.2 7.3A2 2 0 0 1 16.5 20h-9a2 2 0 0 1-1.7-3.5L10 9.2Z"/>',
          '<path d="M9 4h6"/>',
          '<path d="M7.6 15.5h8.8"/>']
    },

    /* ---- juegos de geografía ---- */
    paises: {
      b: ['<path d="M12 21s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z"/>'],
      t: ['<path d="M12 21s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z"/>',
          '<circle cx="12" cy="10.6" r="2.4"/>']
    },
    capitales: {
      b: ['<path d="M5 19h14v-8H5Z"/>'],
      t: ['<path d="M3.5 10.5 12 4.5l8.5 6"/>',
          '<path d="M5.5 10.5V19M18.5 10.5V19"/>',
          '<path d="M9.5 19v-4.5h5V19"/>',
          '<path d="M3.5 19.5h17"/>']
    },
    banderas: {
      b: ['<path d="M6 4.5c3.5-1.6 6.5 1.6 10 0V13c-3.5 1.6-6.5-1.6-10 0Z"/>'],
      t: ['<path d="M6 4.5c3.5-1.6 6.5 1.6 10 0V13c-3.5 1.6-6.5-1.6-10 0Z"/>',
          '<path d="M6 4.5V20.5"/>']
    },

    /* ---- juegos de matemática ---- */
    tablas: {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>',
          '<path d="M9 9l6 6M15 9l-6 6"/>']
    },
    cuentas: {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>',
          '<path d="M8.5 9.5h3.2M10.1 7.9v3.2"/>',
          '<path d="M12.8 15h3.2"/>']
    },
    reloj: {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>',
          '<path d="M12 7.2V12l3.2 2"/>']
    },

    /* ---- secciones y navegación ---- */
    aprender: {
      b: ['<path d="M3.6 5.4h5.2c1.7 0 3.2 1 3.2 2.3v11c0-1.3-1.5-2.3-3.2-2.3H3.6Z"/>'],
      t: ['<path d="M12 7.7c0-1.3 1.5-2.3 3.2-2.3h5.2v11h-5.2c-1.7 0-3.2 1-3.2 2.3Z"/>',
          '<path d="M12 7.7c0-1.3-1.5-2.3-3.2-2.3H3.6v11h5.2c1.7 0 3.2 1 3.2 2.3Z"/>']
    },
    jugar: {
      b: ['<path d="M7.5 8h9a4.5 4.5 0 0 1 4.4 5.4l-.6 3A2.6 2.6 0 0 1 16 17.4L14.6 16H9.4L8 17.4a2.6 2.6 0 0 1-4.3-1l-.6-3A4.5 4.5 0 0 1 7.5 8Z"/>'],
      t: ['<path d="M7.5 8h9a4.5 4.5 0 0 1 4.4 5.4l-.6 3A2.6 2.6 0 0 1 16 17.4L14.6 16H9.4L8 17.4a2.6 2.6 0 0 1-4.3-1l-.6-3A4.5 4.5 0 0 1 7.5 8Z"/>',
          '<path d="M7.6 11.3v2.2M6.5 12.4h2.2"/>',
          '<circle cx="16" cy="11.9" r="1" fill="currentColor" stroke="none"/>',
          '<circle cx="17.8" cy="13.7" r="1" fill="currentColor" stroke="none"/>']
    },
    examen: {
      b: ['<rect x="4.5" y="3.5" width="15" height="17" rx="3"/>'],
      t: ['<rect x="4.5" y="3.5" width="15" height="17" rx="3"/>',
          '<path d="M9 2.6h6c.6 0 1 .5 1 1v.8c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1v-.8c0-.5.4-1 1-1Z" fill="var(--papel)"/>',
          '<path d="M8.4 11.4l2 2 4.4-4.4"/>',
          '<path d="M8.4 17h7"/>']
    },
    repaso: {
      b: [],
      t: ['<path d="M20 12a8 8 0 1 1-2.6-5.9"/>',
          '<path d="M20.2 3.6v4.2H16"/>',
          '<circle cx="12" cy="12" r="2.4" fill="var(--ico-relleno)"/>']
    },

    /* ---- barra de arriba y marcador ---- */
    moneda: {
      b: ['<circle cx="12" cy="12" r="8.5"/>'],
      t: ['<circle cx="12" cy="12" r="8.5"/>',
          '<circle cx="12" cy="12" r="5"/>']
    },
    estrella: {
      b: ['<path d="m12 3.4 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.8Z"/>'],
      t: ['<path d="m12 3.4 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.6l5.9-.8Z"/>']
    },
    corazon: {
      b: ['<path d="M12 20.3S3.8 15.4 3.8 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.2 2.4c0 5.8-8.2 10.7-8.2 10.7Z"/>'],
      t: ['<path d="M12 20.3S3.8 15.4 3.8 9.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.2 2.4c0 5.8-8.2 10.7-8.2 10.7Z"/>']
    },
    trofeo: {
      b: ['<path d="M7.5 3.6h9v5.2a4.5 4.5 0 0 1-9 0Z"/>'],
      t: ['<path d="M7.5 3.6h9v5.2a4.5 4.5 0 0 1-9 0Z"/>',
          '<path d="M7.5 5.2H5a2 2 0 0 0 2.6 2.6"/>',
          '<path d="M16.5 5.2H19a2 2 0 0 1-2.6 2.6"/>',
          '<path d="M12 13.3v3.4"/>',
          '<path d="M8.6 20.4h6.8l-.9-3.7H9.5Z"/>']
    },
    sonido: {
      b: ['<path d="M4.5 9.6h3l4.3-3.6v12l-4.3-3.6h-3Z"/>'],
      t: ['<path d="M4.5 9.6h3l4.3-3.6v12l-4.3-3.6h-3Z"/>',
          '<path d="M15.3 9.2a4 4 0 0 1 0 5.6"/>',
          '<path d="M17.9 6.6a7.6 7.6 0 0 1 0 10.8"/>']
    },
    'sonido-no': {
      b: ['<path d="M4.5 9.6h3l4.3-3.6v12l-4.3-3.6h-3Z"/>'],
      t: ['<path d="M4.5 9.6h3l4.3-3.6v12l-4.3-3.6h-3Z"/>',
          '<path d="m15.4 9.8 4.4 4.4M19.8 9.8l-4.4 4.4"/>']
    },
    atras: {
      b: [],
      t: ['<path d="M15 4.5 7.5 12l7.5 7.5"/>']
    },
    flecha: {
      b: [],
      t: ['<path d="M4.5 12h15"/>', '<path d="m13.5 6 6 6-6 6"/>']
    },

    /* ---- menú del perfil ---- */
    perfil: {
      b: ['<circle cx="12" cy="8.4" r="3.7"/>'],
      t: ['<circle cx="12" cy="8.4" r="3.7"/>',
          '<path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"/>']
    },
    configuracion: {
      b: ['<circle cx="12" cy="12" r="3.2"/>'],
      t: ['<circle cx="12" cy="12" r="3.2"/>',
          '<path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7"/>']
    },
    personalizacion: {
      b: ['<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 2-.9 2-1.8 0-1.4-1-1.7-1-2.7 0-.8.7-1.4 1.6-1.4h1.6a4.3 4.3 0 0 0 4.3-4.3c0-3.7-3.6-6.8-8.5-6.8Z"/>'],
      t: ['<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 2-.9 2-1.8 0-1.4-1-1.7-1-2.7 0-.8.7-1.4 1.6-1.4h1.6a4.3 4.3 0 0 0 4.3-4.3c0-3.7-3.6-6.8-8.5-6.8Z"/>',
          '<circle cx="7.6" cy="11.6" r="1.1" fill="currentColor" stroke="none"/>',
          '<circle cx="10.4" cy="7.6" r="1.1" fill="currentColor" stroke="none"/>',
          '<circle cx="15" cy="8.2" r="1.1" fill="currentColor" stroke="none"/>']
    },
    tienda: {
      b: ['<path d="M5 9h14l-1 10.5H6Z"/>'],
      t: ['<path d="M5 9h14l-1 10.5H6Z"/>',
          '<path d="M8.8 9V7a3.2 3.2 0 0 1 6.4 0v2"/>']
    },
    candado: {
      b: ['<rect x="4.8" y="10.5" width="14.4" height="10" rx="3"/>'],
      t: ['<rect x="4.8" y="10.5" width="14.4" height="10" rx="3"/>',
          '<path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"/>']
    },
    instalar: {
      b: [],
      t: ['<path d="M12 3.5v11"/>', '<path d="m7.6 10.4 4.4 4.4 4.4-4.4"/>',
          '<path d="M4.5 16.5v1.8a2.2 2.2 0 0 0 2.2 2.2h10.6a2.2 2.2 0 0 0 2.2-2.2v-1.8"/>']
    },
    mas: {
      b: [],
      t: ['<path d="M12 5.5v13M5.5 12h13"/>']
    },
    // la marca de «éste está elegido», en la carita del chico que juega
    tilde: {
      b: [],
      t: ['<path d="m5.5 12.5 4.2 4.2 8.8-9.2" stroke-width="3"/>']
    },
    menos: {
      b: [],
      t: ['<path d="M5.5 12h13"/>']
    },

    /* Los cuatro niveles del reloj: el mismo reloj con las agujas en la
       hora que cada uno enseña, así se distinguen de un vistazo en vez de
       repetir cuatro veces el mismo dibujo. */
    /* Una sola aguja, la de los minutos, apuntando a lo que ese nivel
       enseña. Con dos agujas quedaban en línea y el ícono se leía como
       un círculo partido al medio o tachado. Con una sola, además, dice
       exactamente lo que hay que mirar: dónde cae el minutero. */
    'reloj-punto': {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 12V5.6"/>',
          '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>']
    },
    'reloj-media': {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 12v6.4"/>',
          '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>']
    },
    'reloj-cuarto': {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 12h6.4"/>',
          '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>']
    },
    'reloj-cinco': {
      b: ['<circle cx="12" cy="12" r="9"/>'],
      t: ['<circle cx="12" cy="12" r="9"/>', '<path d="m12 12 3.2-5.5"/>',
          '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>']
    },

    /* Los cuatro niveles de dificultad: barritas que crecen. Antes eran
       un pollito, un pato, un águila y un cohete, que en algunos celulares
       se ven casi iguales y no dicen en qué orden van. */
    'nivel-1': {
      b: [], t: ['<path d="M6 18.5v-2.5" stroke-width="3.4"/>',
                 '<path d="M12 18.5v-2.5M18 18.5v-2.5" stroke-width="3.4" opacity=".28"/>']
    },
    'nivel-2': {
      b: [], t: ['<path d="M6 18.5v-2.5M12 18.5v-6" stroke-width="3.4"/>',
                 '<path d="M18 18.5v-2.5" stroke-width="3.4" opacity=".28"/>']
    },
    'nivel-3': {
      b: [], t: ['<path d="M6 18.5v-2.5M12 18.5v-6M18 18.5v-9.5" stroke-width="3.4"/>']
    },
    'nivel-4': {
      b: ['<path d="m12 3 1.9 4 4.4.6-3.2 3 .8 4.3L12 12.9 8.1 15l.8-4.4-3.2-3 4.4-.6Z"/>'],
      t: ['<path d="m12 3 1.9 4 4.4.6-3.2 3 .8 4.3L12 12.9 8.1 15l.8-4.4-3.2-3 4.4-.6Z"/>',
          '<path d="M6 20.5h12" stroke-width="3"/>']
    },
    dado: {
      b: ['<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.5"/>'],
      t: ['<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.5"/>',
          '<circle cx="8.4" cy="8.4" r="1.3" fill="currentColor" stroke="none"/>',
          '<circle cx="15.6" cy="8.4" r="1.3" fill="currentColor" stroke="none"/>',
          '<circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>',
          '<circle cx="8.4" cy="15.6" r="1.3" fill="currentColor" stroke="none"/>',
          '<circle cx="15.6" cy="15.6" r="1.3" fill="currentColor" stroke="none"/>']
    },
    mapa: {
      b: ['<path d="M3.6 6.6 9 4.5l6 2.1 5.4-2.1v13L15 19.5l-6-2.1-5.4 2.1Z"/>'],
      t: ['<path d="M3.6 6.6 9 4.5l6 2.1 5.4-2.1v13L15 19.5l-6-2.1-5.4 2.1Z"/>',
          '<path d="M9 4.5v13M15 6.6v12.9"/>']
    },

    /* ---- juegos de matemática nuevos ---- */
    contar: {
      b: ['<rect x="3" y="5" width="18" height="14" rx="4"/>'],
      t: ['<rect x="3" y="5" width="18" height="14" rx="4"/>',
          '<circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/>',
          '<circle cx="12" cy="10" r="1.5" fill="currentColor" stroke="none"/>',
          '<circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/>',
          '<circle cx="10" cy="14.5" r="1.5" fill="currentColor" stroke="none"/>',
          '<circle cx="14" cy="14.5" r="1.5" fill="currentColor" stroke="none"/>']
    },
    figuras: {
      b: ['<circle cx="7.5" cy="7.5" r="4"/>', '<path d="M12 13.5 17 21H7Z"/>'],
      t: ['<circle cx="7.5" cy="7.5" r="4"/>',
          '<rect x="13" y="3.5" width="8" height="8" rx="1.2"/>',
          '<path d="M12 13.5 17 21H7Z"/>']
    },
    comparar: {
      b: [], t: ['<path d="M7 5.5 17 12 7 18.5" stroke-width="2.8"/>']
    },
    serie: {
      b: [], t: ['<path d="M4 19v-3M8.5 19v-6.5M13 19V9" stroke-width="3"/>',
                 '<path d="M16 7.5h5m-2.2-2.2L21 7.5l-2.2 2.2"/>']
    },
    dobles: {
      b: [], t: ['<text x="12" y="16.6" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" stroke="none">×2</text>']
    },
    posicion: {
      b: ['<rect x="2.5" y="7" width="19" height="10" rx="2.5"/>'],
      t: ['<rect x="2.5" y="7" width="19" height="10" rx="2.5"/>', '<path d="M8.8 7v10M15.2 7v10"/>']
    },
    division: {
      b: [], t: ['<path d="M5 12h14" stroke-width="2.8"/>',
                 '<circle cx="12" cy="6.3" r="1.9" fill="currentColor" stroke="none"/>',
                 '<circle cx="12" cy="17.7" r="1.9" fill="currentColor" stroke="none"/>']
    },
    problemas: {
      b: ['<path d="M5 4h14a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 19 17h-7l-4 3.5V17H5a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 5 4Z"/>'],
      t: ['<path d="M5 4h14a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 19 17h-7l-4 3.5V17H5a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 5 4Z"/>',
          '<text x="12" y="14.4" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor" stroke="none">?</text>']
    },
    fracciones: {
      b: [], t: ['<path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" opacity=".55"/>',
                 '<circle cx="12" cy="12" r="8.5"/>', '<path d="M12 3.5v17"/>']
    },

    /* ---- juegos de lengua ---- */
    letras: {
      b: [], t: ['<text x="12" y="16.8" text-anchor="middle" font-size="12.5" font-weight="800" fill="currentColor" stroke="none">Aa</text>']
    },
    vocales: {
      b: [], t: ['<text x="12" y="15.8" text-anchor="middle" font-size="9.5" font-weight="800" fill="currentColor" stroke="none">aei</text>',
                 '<path d="M5 19.5h14"/>']
    },
    rimas: {
      b: ['<circle cx="6.5" cy="17.5" r="2.5"/>', '<circle cx="16.5" cy="15.5" r="2.5"/>'],
      t: ['<path d="M9 17.5V5.5l10-2v12"/>',
          '<circle cx="6.5" cy="17.5" r="2.5"/>', '<circle cx="16.5" cy="15.5" r="2.5"/>']
    },
    contrarios: {
      b: [], t: ['<path d="M8 19V5M4.5 8.5 8 5l3.5 3.5"/>', '<path d="M16 5v14m-3.5-3.5L16 19l3.5-3.5"/>']
    },
    silabas: {
      b: ['<rect x="2.5" y="8.5" width="5" height="7" rx="2"/>', '<rect x="9.5" y="8.5" width="5" height="7" rx="2"/>',
          '<rect x="16.5" y="8.5" width="5" height="7" rx="2"/>'],
      t: ['<rect x="2.5" y="8.5" width="5" height="7" rx="2"/>', '<rect x="9.5" y="8.5" width="5" height="7" rx="2"/>',
          '<rect x="16.5" y="8.5" width="5" height="7" rx="2"/>']
    },
    plurales: {
      b: ['<rect x="13" y="4" width="7" height="7" rx="1.6"/>', '<rect x="13" y="13" width="7" height="7" rx="1.6"/>'],
      t: ['<rect x="4" y="13" width="7" height="7" rx="1.6"/>',
          '<rect x="13" y="4" width="7" height="7" rx="1.6"/>', '<rect x="13" y="13" width="7" height="7" rx="1.6"/>']
    },
    ortografia: {
      b: ['<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5Z"/>'],
      t: ['<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5Z"/>', '<path d="m13.5 7 3 3"/>']
    },
    sinonimos: {
      b: [], t: ['<path d="M5 9h14M5 15h14" stroke-width="2.8"/>']
    },
    tildes: {
      b: [], t: ['<text x="12" y="18" text-anchor="middle" font-size="17" font-weight="800" fill="currentColor" stroke="none">á</text>']
    },
    clases: {
      b: ['<path d="M3.5 12.5V5A1.5 1.5 0 0 1 5 3.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0Z"/>'],
      t: ['<path d="M3.5 12.5V5A1.5 1.5 0 0 1 5 3.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0Z"/>',
          '<circle cx="8" cy="8" r="1.6"/>']
    },

    /* ---- juegos de ciencias ---- */
    sonidos: {
      b: ['<ellipse cx="12" cy="15.5" rx="4.6" ry="3.9"/>'],
      t: ['<ellipse cx="12" cy="15.5" rx="4.6" ry="3.9"/>',
          '<circle cx="5.8" cy="9.8" r="1.9" fill="currentColor" stroke="none"/>',
          '<circle cx="9.8" cy="6.2" r="1.9" fill="currentColor" stroke="none"/>',
          '<circle cx="14.2" cy="6.2" r="1.9" fill="currentColor" stroke="none"/>',
          '<circle cx="18.2" cy="9.8" r="1.9" fill="currentColor" stroke="none"/>']
    },
    cuerpo: {
      b: ['<circle cx="12" cy="5.5" r="2.6"/>'],
      t: ['<circle cx="12" cy="5.5" r="2.6"/>', '<path d="M12 9v6.5M6.5 11.5h11M8.5 21l3.5-5.5 3.5 5.5"/>']
    },
    habitat: {
      b: ['<path d="M12 3 6 11h3l-3.5 5h13L15 11h3Z"/>'],
      t: ['<path d="M12 3 6 11h3l-3.5 5h13L15 11h3Z"/>', '<path d="M12 16v5"/>']
    },
    vivos: {
      b: ['<path d="M12 13c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5Z"/>', '<path d="M12 10.5c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5Z"/>'],
      t: ['<path d="M12 21v-10.5"/>', '<path d="M12 13c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5Z"/>',
          '<path d="M12 10.5c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5Z"/>', '<path d="M7.5 21h9"/>']
    },
    plantas: {
      b: ['<circle cx="12" cy="5.4" r="2.6"/>', '<circle cx="15.6" cy="9" r="2.6"/>', '<circle cx="8.4" cy="9" r="2.6"/>'],
      t: ['<circle cx="12" cy="5.4" r="2.6"/>', '<circle cx="15.6" cy="9" r="2.6"/>',
          '<circle cx="8.4" cy="9" r="2.6"/>', '<circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none"/>',
          '<path d="M12 11.5V21"/>', '<path d="M12 17.5c-2.6 0-4.3-1.6-4.3-3.8 2.6 0 4.3 1.6 4.3 3.8Z"/>']
    },
    alimentacion: {
      b: ['<path d="M12 7c-1.5-1.3-4.6-1.6-6.3.4-2 2.4-1.2 7 .8 9.8 1.4 2 3 3 4.2 2.3.8-.5 1.8-.5 2.6 0 1.2.7 2.8-.3 4.2-2.3 2-2.8 2.8-7.4.8-9.8C16.6 5.4 13.5 5.7 12 7Z"/>'],
      t: ['<path d="M12 7c-1.5-1.3-4.6-1.6-6.3.4-2 2.4-1.2 7 .8 9.8 1.4 2 3 3 4.2 2.3.8-.5 1.8-.5 2.6 0 1.2.7 2.8-.3 4.2-2.3 2-2.8 2.8-7.4.8-9.8C16.6 5.4 13.5 5.7 12 7Z"/>',
          '<path d="M12 7c0-2 .8-3.3 2.5-4"/>']
    },
    animales: {
      b: ['<path d="M3 12c3-4.5 8-6 12.5-3.5L20 5.5v13l-4.5-3C11 18 6 16.5 3 12Z"/>'],
      t: ['<path d="M3 12c3-4.5 8-6 12.5-3.5L20 5.5v13l-4.5-3C11 18 6 16.5 3 12Z"/>',
          '<circle cx="8.2" cy="11" r="1.1" fill="currentColor" stroke="none"/>']
    },
    materia: {
      b: ['<path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z"/>'],
      t: ['<path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11Z"/>', '<path d="M9 15a3 3 0 0 0 3 3"/>']
    },
    espacio: {
      b: ['<circle cx="12" cy="12" r="5.5"/>'],
      t: ['<circle cx="12" cy="12" r="5.5"/>',
          '<path d="M4.6 15c-2 1.8-2.6 3.3-1.6 3.9 1.8 1.1 7-1.3 11.6-5.4 4.6-4.1 7-8.3 5.3-9.4-1-.6-2.6-.1-4.6 1.3"/>']
    }
  };

  /**
   * Devuelve el <svg> de un ícono, listo para meter en el DOM.
   * `clase` se suma a la del svg, por si hay que darle un tamaño propio.
   */
  function crear(nombre, clase) {
    var d = DIBUJOS[nombre];
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'ico' + (clase ? ' ' + clase : ''));
    // decorativo: el nombre del juego siempre está escrito al lado
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (!d) return svg;                       // ícono que todavía no dibujé

    svg.innerHTML =
      (d.b.length ? '<g class="ico-blando">' + d.b.join('') + '</g>' : '') +
      '<g class="ico-trazo">' + d.t.join('') + '</g>';
    return svg;
  }

  /** El mismo ícono como texto, para armar HTML de una sola pasada. */
  function html(nombre, clase) {
    return crear(nombre, clase).outerHTML;
  }

  function existe(nombre) { return !!DIBUJOS[nombre]; }

  /**
   * Cambia por su dibujo todo elemento con data-ico="nombre".
   *
   * Es para el HTML fijo de index.html: así la marca queda
   * `<span data-ico="geografia"></span>` en vez de tener el SVG entero
   * pegado doce veces en el archivo.
   */
  function hidratar(raiz) {
    var nodos = (raiz || document).querySelectorAll('[data-ico]');
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      var nombre = el.getAttribute('data-ico');
      if (!existe(nombre)) continue;
      el.textContent = '';
      el.appendChild(crear(nombre));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hidratar(); });
  } else {
    hidratar();
  }

  return { crear: crear, html: html, existe: existe, hidratar: hidratar, DIBUJOS: DIBUJOS };
})();
