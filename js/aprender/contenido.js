/* ============================================================
   Contenido de la sección Aprender: cursitos cortos.

   Una lección es una lista de pasos que se leen de a uno. Cada paso
   tiene un título, un texto y, si ayuda, un dibujo. Al final siempre
   se ofrece el juego donde practicar lo que se acaba de leer: esa es
   la idea de toda la app, aprender algo y después usarlo.

   Para agregar una lección, copiá una de estas y sumala a LECCIONES.
   Un paso puede tener:
     titulo, texto        (el texto admite <b> para resaltar)
     visual: function ()  devuelve HTML (normalmente un SVG dibujado acá)
     truco:  'texto'      un recuadro con el atajo para acordarse
     video:  'url'        muestra un video embebido (necesita internet)
   ============================================================ */
window.Lecciones = (function () {
  'use strict';

  /* ---------------------- dibujos reutilizables ---------------------- */

  /** Una cuenta en columna, con el acarreo opcional arriba. */
  function columna(arriba, abajo, signo, resultado, llevo, resaltar) {
    function fila(n, clase) {
      var texto = String(n);
      var celdas = texto.split('').map(function (d, i) {
        var esUltima = i === texto.length - 1;
        var marca = (resaltar === 'unidades' && esUltima) ||
                    (resaltar === 'decenas' && !esUltima);
        return '<span class="cd' + (marca ? ' cd-marca' : '') + '">' + d + '</span>';
      }).join('');
      return '<div class="cuenta-fila ' + (clase || '') + '">' + celdas + '</div>';
    }

    var html = '<div class="cuenta-columna">';
    if (llevo) {
      html += '<div class="cuenta-fila cuenta-llevo"><span class="cd cd-llevo">' +
              llevo + '</span><span class="cd"></span></div>';
    }
    html += fila(arriba);
    html += '<div class="cuenta-fila cuenta-signo"><span class="cd cd-op">' + signo +
            '</span>' + String(abajo).split('').map(function (d) {
              return '<span class="cd">' + d + '</span>';
            }).join('') + '</div>';
    html += '<div class="cuenta-raya"></div>';
    html += fila(resultado === null ? '' : resultado, 'cuenta-resultado');
    html += '</div>';
    return html;
  }

  /** Filas y columnas de puntitos, para ver la multiplicación. */
  function puntitos(filas, columnas) {
    var html = '<div class="puntitos">';
    for (var f = 0; f < filas; f++) {
      html += '<div class="puntitos-fila">';
      for (var c = 0; c < columnas; c++) html += '<span class="punto-bola"></span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /**
   * Una palabra cortada en pedacitos (ma · ri · po · sa), o cualquier
   * lista en fila. `fuerte` es el lugar del pedacito que va resaltado:
   * la sílaba que suena más fuerte, en la lección de la tilde.
   */
  function trozos(partes, fuerte) {
    return '<div class="trozos">' + partes.map(function (p, i) {
      return '<span' + (i === fuerte ? ' class="trozo-fuerte"' : '') + '>' + p + '</span>';
    }).join('') + '</div>';
  }

  /** Rosa de los vientos. */
  function brujula() {
    return '<svg class="dibujo-svg" viewBox="0 0 200 200" role="img" aria-label="Los cuatro puntos cardinales">' +
      '<circle cx="100" cy="100" r="78" fill="#ffffff" stroke="#dfe6f7" stroke-width="4"/>' +
      '<polygon points="100,28 112,100 100,88 88,100" fill="#ef4a5e"/>' +
      '<polygon points="100,172 112,100 100,112 88,100" fill="#4c6ef5"/>' +
      '<polygon points="172,100 100,112 112,100 100,88" fill="#8b5cf6"/>' +
      '<polygon points="28,100 100,112 88,100 100,88" fill="#21b573"/>' +
      '<circle cx="100" cy="100" r="7" fill="#1d2b4a"/>' +
      '<text x="100" y="18" text-anchor="middle" font-size="20" font-weight="700" fill="#1d2b4a">N</text>' +
      '<text x="100" y="196" text-anchor="middle" font-size="20" font-weight="700" fill="#1d2b4a">S</text>' +
      '<text x="190" y="107" text-anchor="middle" font-size="20" font-weight="700" fill="#1d2b4a">E</text>' +
      '<text x="10" y="107" text-anchor="middle" font-size="20" font-weight="700" fill="#1d2b4a">O</text>' +
      '</svg>';
  }

  /** Los continentes con cuántos países tiene cada uno (sale de los datos). */
  function continentes() {
    var nombres = {
      america: ['🌎', 'América'], europa: ['🏰', 'Europa'], africa: ['🦁', 'África'],
      asia: ['🐘', 'Asia'], oceania: ['🦘', 'Oceanía']
    };
    var cuenta = {};
    (window.PAISES || []).forEach(function (p) { cuenta[p.cont] = (cuenta[p.cont] || 0) + 1; });
    return '<div class="tarjetitas">' + Object.keys(nombres).map(function (id) {
      return '<div class="tarjetita"><span class="tarjetita-icono">' + nombres[id][0] + '</span>' +
             '<b>' + nombres[id][1] + '</b><span>' + (cuenta[id] || 0) + ' países</span></div>';
    }).join('') + '</div>';
  }

  /** País → capital, con la bandera. */
  function paisCapital(codigos) {
    var porId = {};
    (window.PAISES || []).forEach(function (p) { porId[p.id] = p; });
    return '<div class="tarjetitas">' + codigos.map(function (id) {
      var p = porId[id];
      if (!p) return '';
      return '<div class="tarjetita"><img src="' + Util.bandera(id) + '" alt="" class="tarjetita-bandera">' +
             '<b>' + p.nombre + '</b><span>' + p.capital + '</span></div>';
    }).join('') + '</div>';
  }

  function reloj(hora, minuto) {
    return window.Matematica ? Matematica.dibujarReloj(hora, minuto) : '';
  }

  /* ---------------------- las lecciones ---------------------- */
  var LECCIONES = [
    /* ============ MATEMÁTICA ============ */
    {
      id: 'sumar-llevando',
      materia: 'matematica',
      titulo: 'Sumar llevándose una',
      icono: '➕',
      edadMin: 6,
      minutos: 3,
      resumen: 'Qué hacer cuando una columna se pasa de 9.',
      juego: 'matematica/cuentas',
      pasos: [
        {
          titulo: 'Cada número en su lugar',
          texto: 'Para sumar números grandes los ponemos <b>uno arriba del otro</b>, bien alineados a la derecha. Así las unidades quedan con las unidades y las decenas con las decenas.',
          visual: function () { return columna(27, 15, '+', null); }
        },
        {
          titulo: 'Empezamos por la derecha',
          texto: 'Sumamos primero la columna de la derecha: <b>7 + 5 = 12</b>. Pero en cada columna entra un solo número… y 12 son dos.',
          visual: function () { return columna(27, 15, '+', null, null, 'unidades'); }
        },
        {
          titulo: 'Escribís uno y te llevás el otro',
          texto: 'Del 12 escribimos abajo el <b>2</b>, y el <b>1</b> se va arriba de la columna siguiente. Eso es «llevarse una».',
          visual: function () { return columna(27, 15, '+', 2, 1, 'unidades'); },
          truco: 'Lo que te llevás siempre es un 1, nunca más que eso.'
        },
        {
          titulo: 'Y ahora la otra columna',
          texto: 'Sumamos la columna de la izquierda sin olvidarnos del 1 que subió: <b>2 + 1 + 1 = 4</b>. La cuenta da <b>42</b>.',
          visual: function () { return columna(27, 15, '+', 42, 1, 'decenas'); }
        }
      ]
    },

    {
      id: 'restar-prestando',
      materia: 'matematica',
      titulo: 'Restar pidiendo prestado',
      icono: '➖',
      edadMin: 7,
      minutos: 3,
      resumen: 'Cuando el de arriba es más chico que el de abajo.',
      juego: 'matematica/cuentas',
      pasos: [
        {
          titulo: 'El mismo orden que la suma',
          texto: 'También se acomodan uno arriba del otro y se empieza por la <b>derecha</b>. Probemos con <b>42 − 17</b>.',
          visual: function () { return columna(42, 17, '−', null); }
        },
        {
          titulo: 'Uy: 2 menos 7 no se puede',
          texto: 'Arriba hay un <b>2</b> y abajo un <b>7</b>. Al 2 no le alcanza. Entonces le pedimos prestado al número de al lado.',
          visual: function () { return columna(42, 17, '−', null, null, 'unidades'); }
        },
        {
          titulo: 'El vecino presta diez',
          texto: 'El <b>4</b> de la izquierda presta uno y se queda en <b>3</b>. Ese uno vale <b>diez</b>, así que arriba ya no hay 2 sino <b>12</b>. Y ahora sí: <b>12 − 7 = 5</b>.',
          truco: 'El de al lado se achica en 1, y el tuyo crece en 10.'
        },
        {
          titulo: 'Terminamos la cuenta',
          texto: 'Queda la columna de la izquierda: <b>3 − 1 = 2</b>. El resultado es <b>25</b>.',
          visual: function () { return columna(42, 17, '−', 25, null, 'decenas'); }
        }
      ]
    },

    {
      id: 'que-es-multiplicar',
      materia: 'matematica',
      titulo: 'Qué es multiplicar',
      icono: '✖️',
      edadMin: 7,
      minutos: 2,
      resumen: 'Multiplicar es sumar muchas veces lo mismo.',
      juego: 'matematica/tablas',
      pasos: [
        {
          titulo: 'Es una suma repetida',
          texto: 'Multiplicar es una manera corta de sumar el <b>mismo número muchas veces</b>. En vez de escribir 4 + 4 + 4, escribimos <b>4 × 3</b>.',
          visual: function () { return puntitos(3, 4); }
        },
        {
          titulo: 'Filas y columnas',
          texto: 'Mirá los puntitos: hay <b>3 filas</b> de <b>4</b> cada una. Contálos: son <b>12</b>. Eso es 4 × 3.'
        },
        {
          titulo: 'El orden no importa',
          texto: 'Si lo das vuelta y ponés <b>4 filas de 3</b>, siguen siendo 12 puntitos. Por eso <b>4 × 3 y 3 × 4 dan lo mismo</b>.',
          visual: function () { return puntitos(4, 3); },
          truco: 'Con esto aprendés la mitad de las tablas de una: si sabés 7 × 3, ya sabés 3 × 7.'
        }
      ]
    },

    {
      id: 'leer-el-reloj',
      materia: 'matematica',
      titulo: 'Leer el reloj de agujas',
      icono: '🕒',
      edadMin: 6,
      minutos: 3,
      resumen: 'Cuál aguja es cuál y qué significa cada número.',
      juego: 'matematica/reloj',
      pasos: [
        {
          titulo: 'Dos agujas, dos trabajos',
          texto: 'La aguja <b>corta y gorda</b> marca la <b>hora</b>. La <b>larga y fina</b> marca los <b>minutos</b>. Acá la corta está en el 3 y la larga en el 12: son las <b>3 en punto</b>.',
          visual: function () { return reloj(3, 0); }
        },
        {
          titulo: 'Los números valen distinto',
          texto: 'Para la aguja larga, cada número son <b>5 minutos</b>. El 1 son 5 minutos, el 2 son 10, el 3 son 15… Acá la larga está en el 3: son las <b>3 y cuarto</b>.',
          visual: function () { return reloj(3, 15); },
          truco: 'Contá de a 5 en 5 mientras vas de número en número.'
        },
        {
          titulo: 'Y media es abajo de todo',
          texto: 'Cuando la aguja larga llega al <b>6</b>, pasó media vuelta: son <b>30 minutos</b>, o sea «y media». Fijate que la corta ya está entre dos números.',
          visual: function () { return reloj(3, 30); }
        }
      ]
    },

    /* ============ GEOGRAFÍA ============ */
    {
      id: 'que-es-un-continente',
      materia: 'geografia',
      titulo: 'Qué es un continente',
      icono: '🌍',
      edadMin: 6,
      minutos: 2,
      resumen: 'Los pedazos grandes de tierra donde vivimos.',
      juego: 'geografia/paises',
      pasos: [
        {
          titulo: 'Tierra y agua',
          texto: 'Casi toda la Tierra es <b>agua</b>: los océanos. Lo que sobresale es la tierra firme, y los pedazos más grandes se llaman <b>continentes</b>.'
        },
        {
          titulo: 'Son cinco (con gente)',
          texto: 'América, Europa, África, Asia y Oceanía. Hay un sexto, la <b>Antártida</b>, pero es de hielo y no vive nadie ahí de forma permanente.',
          visual: continentes
        },
        {
          titulo: 'Adentro hay países',
          texto: 'Cada continente está dividido en <b>países</b>, y cada país tiene su nombre, su bandera y su capital. En total hay <b>194</b> países en el mundo.',
          truco: 'Nosotros estamos en América, en el pedazo de abajo: América del Sur.'
        }
      ]
    },

    {
      id: 'que-es-una-capital',
      materia: 'geografia',
      titulo: 'Qué es una capital',
      icono: '🏛️',
      edadMin: 7,
      minutos: 2,
      resumen: 'La ciudad principal de cada país (no siempre la más grande).',
      juego: 'geografia/capitales',
      pasos: [
        {
          titulo: 'La ciudad donde se decide',
          texto: 'La <b>capital</b> es la ciudad donde está el gobierno de un país: donde se toman las decisiones que valen para todos.',
          visual: function () { return paisCapital(['AR', 'FR', 'JP']); }
        },
        {
          titulo: 'Ojo: no siempre es la más grande',
          texto: 'Mucha gente cree que la capital es la ciudad más grande, pero no. En <b>Brasil</b> la capital es Brasilia, aunque São Paulo y Río sean más grandes. En <b>Estados Unidos</b> es Washington, no Nueva York.',
          visual: function () { return paisCapital(['BR', 'US', 'AU']); },
          truco: 'Cuando dudes entre dos ciudades famosas, la capital suele ser la menos famosa.'
        }
      ]
    },

    {
      id: 'leer-un-mapa',
      materia: 'geografia',
      titulo: 'Cómo se lee un mapa',
      icono: '🧭',
      edadMin: 6,
      minutos: 2,
      resumen: 'Norte, sur, este, oeste y qué significan los colores.',
      juego: 'geografia/paises',
      pasos: [
        {
          titulo: 'Arriba es el norte',
          texto: 'En casi todos los mapas, <b>arriba es el norte</b> y abajo el <b>sur</b>. A la derecha queda el <b>este</b> y a la izquierda el <b>oeste</b>.',
          visual: brujula,
          truco: 'Para acordarte de las cuatro, empezá arriba y girá como el reloj: Norte, Este, Sur, Oeste.'
        },
        {
          titulo: 'Los colores cuentan algo',
          texto: 'El <b>azul</b> es siempre agua: océanos, mares, ríos y lagos. La tierra se pinta de otro color, y las <b>líneas</b> que la cruzan son los límites entre países.'
        },
        {
          titulo: 'Los países chiquitos casi no se ven',
          texto: 'Algunos países son tan chiquitos que en un mapa del mundo quedan más chicos que un puntito: Malta, Nauru, el Vaticano. Por eso en el juego los dibujamos como <b>un punto</b> para que los puedas tocar.'
        }
      ]
    },

    /* ============ LENGUA ============ */
    {
      id: 'que-es-una-silaba',
      materia: 'lengua',
      titulo: 'Qué es una sílaba',
      icono: 'silabas',
      edadMin: 7,
      minutos: 2,
      resumen: 'Cómo se corta una palabra en pedacitos.',
      juego: 'lengua/silabas',
      pasos: [
        {
          titulo: 'Las palabras tienen pedacitos',
          texto: 'Si decís una palabra despacio, vas a notar que sale en <b>golpes de voz</b>. Cada golpe es una <b>sílaba</b>.',
          visual: function () { return trozos(['ma', 'ri', 'po', 'sa']); }
        },
        {
          titulo: 'Contalas aplaudiendo',
          texto: '«Ma-ri-po-sa» son <b>cuatro</b> aplausos: tiene cuatro sílabas. «Sol» es un solo aplauso: tiene una. «Ca-sa» tiene dos.',
          visual: function () { return trozos(['ca', 'sa']); },
          truco: 'Decí la palabra despacio y aplaudí con cada golpe: cada aplauso es una sílaba.'
        },
        {
          titulo: 'Siempre hay una vocal',
          texto: 'Toda sílaba tiene por lo menos una vocal. A veces van dos juntas en el mismo golpe, como en «es-<b>cue</b>-la»: la <b>ue</b> se dice de una sola vez.',
          visual: function () { return trozos(['es', 'cue', 'la']); }
        }
      ]
    },

    {
      id: 'clases-de-palabras',
      materia: 'lengua',
      titulo: 'Sustantivos, adjetivos y verbos',
      icono: 'clases',
      edadMin: 9,
      minutos: 3,
      resumen: 'Para qué sirve cada clase de palabra.',
      juego: 'lengua/clases',
      pasos: [
        {
          titulo: 'Los sustantivos nombran',
          texto: 'Un <b>sustantivo</b> es el nombre de algo: una persona, un animal, una cosa, un lugar o una idea. <b>Perro</b>, <b>mesa</b>, <b>ciudad</b>, <b>amistad</b>.'
        },
        {
          titulo: 'Los adjetivos dicen cómo es',
          texto: 'Un <b>adjetivo</b> acompaña al sustantivo y cuenta cómo es: el perro <b>valiente</b>, la mesa <b>redonda</b>, una ciudad <b>enorme</b>.'
        },
        {
          titulo: 'Los verbos son acciones',
          texto: 'Un <b>verbo</b> dice lo que alguien hace: el perro <b>corre</b>, <b>come</b>, <b>duerme</b>. Cuando no dice quién lo hace, termina en -ar, -er o -ir: <b>saltar</b>, <b>correr</b>, <b>escribir</b>.',
          truco: 'Para encontrar el verbo, preguntá «¿qué hace?». El perro… corre.'
        },
        {
          titulo: 'Los adverbios dicen cómo, cuándo o dónde',
          texto: 'Un <b>adverbio</b> cuenta cómo, cuándo o dónde pasa algo: el perro corre <b>rápidamente</b>, llegó <b>ayer</b>, vive <b>aquí</b>. Muchos terminan en <b>-mente</b>.'
        }
      ]
    },

    {
      id: 'donde-va-la-tilde',
      materia: 'lengua',
      titulo: 'Dónde va la tilde',
      icono: 'tildes',
      edadMin: 10,
      minutos: 4,
      resumen: 'Agudas, graves y esdrújulas.',
      juego: 'lengua/tildes',
      pasos: [
        {
          titulo: 'Hay una sílaba que suena más fuerte',
          texto: 'En cada palabra hay una sílaba que se dice con más fuerza. Decí «ca-<b>mión</b>», «<b>ár</b>-bol», «<b>mú</b>-si-ca» y fijate cuál suena más.',
          visual: function () { return trozos(['ca', 'mión'], 1); }
        },
        {
          titulo: 'Agudas: la fuerte es la última',
          texto: 'Si la sílaba fuerte es <b>la última</b>, la palabra es <b>aguda</b>. Llevan tilde cuando terminan en <b>n</b>, <b>s</b> o <b>vocal</b>: camión, compás, sofá. <b>Reloj</b> no lleva, porque termina en j.',
          visual: function () { return trozos(['ca', 'mión'], 1); }
        },
        {
          titulo: 'Graves: la fuerte es la anteúltima',
          texto: 'Si es <b>la anteúltima</b>, la palabra es <b>grave</b>. Llevan tilde cuando <b>no</b> terminan en n, s o vocal: árbol, lápiz, fácil. <b>Examen</b> no lleva, porque termina en n.',
          visual: function () { return trozos(['ár', 'bol'], 0); },
          truco: 'Las agudas y las graves hacen lo contrario: lo que a una le pide tilde, a la otra se la saca.'
        },
        {
          titulo: 'Esdrújulas: siempre llevan',
          texto: 'Si la fuerte es <b>la antepenúltima</b>, la palabra es <b>esdrújula</b>, y ésas llevan tilde <b>siempre</b>, sin excepción: música, pájaro, teléfono.',
          visual: function () { return trozos(['mú', 'si', 'ca'], 0); }
        }
      ]
    },

    /* ============ CIENCIAS ============ */
    {
      id: 'clases-de-animales',
      materia: 'ciencias',
      titulo: 'Mamíferos, aves, peces y más',
      icono: 'animales',
      edadMin: 8,
      minutos: 3,
      resumen: 'Cómo se agrupan los animales.',
      juego: 'ciencias/animales',
      pasos: [
        {
          titulo: 'Los mamíferos toman leche',
          texto: 'Los <b>mamíferos</b> de bebés toman la leche de su mamá, y casi todos tienen pelo. El perro, el elefante… y también <b>el delfín y la ballena</b>, aunque vivan en el mar.',
          truco: 'El delfín nada como un pez, pero respira aire y toma leche: es un mamífero.'
        },
        {
          titulo: 'Las aves tienen plumas',
          texto: 'Las <b>aves</b> tienen plumas, pico y nacen de un huevo. El <b>pingüino</b> es un ave aunque no vuele: tiene plumas.'
        },
        {
          titulo: 'Los peces respiran bajo el agua',
          texto: 'Los <b>peces</b> respiran con <b>branquias</b>, que sacan el aire del agua, y nadan con aletas. El <b>tiburón</b> es un pez.'
        },
        {
          titulo: 'Reptiles, anfibios e insectos',
          texto: 'Los <b>reptiles</b> tienen escamas, como la tortuga y la víbora. Los <b>anfibios</b>, como la rana, nacen en el agua y de grandes viven también en la tierra. Los <b>insectos</b> tienen seis patas: la abeja, la hormiga. La araña tiene ocho, así que no es un insecto.'
        }
      ]
    },

    {
      id: 'los-estados-del-agua',
      materia: 'ciencias',
      titulo: 'Sólido, líquido y gaseoso',
      icono: 'materia',
      edadMin: 8,
      minutos: 3,
      resumen: 'El hielo, el agua y el vapor son lo mismo.',
      juego: 'ciencias/materia',
      pasos: [
        {
          titulo: 'Tres maneras de estar',
          texto: 'El agua puede ser <b>sólida</b> (el hielo), <b>líquida</b> (la de la canilla) o <b>gaseosa</b> (el vapor de la pava). Es siempre la misma agua: lo que cambia es la temperatura.',
          visual: function () { return trozos(['🧊 sólido', '💧 líquido', '♨️ gaseoso']); }
        },
        {
          titulo: 'Cómo es cada una',
          texto: 'Un <b>sólido</b> tiene su propia forma. Un <b>líquido</b> toma la forma del vaso donde lo pongas. Un <b>gas</b> se escapa y ocupa todo el lugar que encuentra.',
          truco: 'Sólido tiene forma, líquido toma la forma del vaso, gas se escapa.'
        },
        {
          titulo: 'Los cambios tienen nombre',
          texto: 'Cuando el hielo se derrite es la <b>fusión</b>. Cuando el agua se congela, la <b>solidificación</b>: pasa a los <b>0 °C</b>. Cuando se hace vapor, la <b>evaporación</b>; hierve a los <b>100 °C</b>.'
        }
      ]
    },

    {
      id: 'el-sistema-solar',
      materia: 'ciencias',
      titulo: 'El sistema solar',
      icono: 'espacio',
      edadMin: 10,
      minutos: 3,
      resumen: 'El Sol, los ocho planetas y la Luna.',
      juego: 'ciencias/espacio',
      pasos: [
        {
          titulo: 'El Sol es una estrella',
          texto: 'El <b>Sol</b> no es un planeta: es una <b>estrella</b>, como las que se ven de noche, sólo que está mucho más cerca. Alrededor de él giran ocho planetas.'
        },
        {
          titulo: 'Los ocho planetas, en orden',
          texto: 'Del más cercano al más lejano: <b>Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno</b>. Plutón era el noveno, pero hoy se lo llama <b>planeta enano</b>.',
          visual: function () { return trozos(['Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno']); },
          truco: 'Mi Vieja Tía Marta Jamás Supo Usar Neptuno: la primera letra de cada palabra es un planeta.'
        },
        {
          titulo: 'Los días y los años',
          texto: 'La Tierra da <b>una vuelta sobre sí misma</b> cada día: eso hace el día y la noche. Y da <b>una vuelta alrededor del Sol</b> cada año. La <b>Luna</b> es un satélite: gira alrededor de la Tierra.'
        }
      ]
    }
  ];

  function porId(id) {
    for (var i = 0; i < LECCIONES.length; i++) if (LECCIONES[i].id === id) return LECCIONES[i];
    return null;
  }

  function deMateria(materiaId) {
    return LECCIONES.filter(function (l) { return l.materia === materiaId; });
  }

  return { LECCIONES: LECCIONES, porId: porId, deMateria: deMateria };
})();
