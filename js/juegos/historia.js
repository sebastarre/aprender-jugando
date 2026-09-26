/* ============================================================
   Materia: Historia.

   Cuatro juegos de historia argentina. Las edades salen de cuándo se
   trabaja cada tema en la escuela: los símbolos y las efemérides desde
   el Nivel Inicial, la Revolución y la Independencia desde 1.º, y la
   sociedad colonial y los pueblos originarios en 4.º y 5.º (Diseño
   Curricular de la Provincia de Buenos Aires, 2018):

     6–10   Símbolos patrios   la bandera, la escarapela, el himno, el escudo
     7–12   Fechas patrias     qué recordamos el 25 de mayo, el 9 de julio…
     8–12   Los próceres       San Martín, Belgrano, Sarmiento, Juana Azurduy…
     9–12   Cómo se vivía      los pueblos originarios y la vida en la colonia

   Son listas escritas a mano, como las de Ciencias: cada pregunta con
   sus malas elegidas, una pista para pensar y un dato que la explica.
   Todo lo que se afirma es lo que enseñan los manuales de la escuela;
   donde los historiadores no se ponen de acuerdo (los paraguas del 25
   de mayo, las cintas de French y Beruti) no se pregunta.
   ============================================================ */
window.Historia = (function () {
  'use strict';

  var T = Tablero;
  var cuestionario = T.cuestionario;

  function soloEstas(ids) {
    return function (it) { return ids.indexOf(it.id.split(':')[1]) >= 0; };
  }

  /* ============================================================
     Símbolos patrios
     ============================================================ */
  var SIMBOLOS = cuestionario({
    id: 'simbolos',
    nombre: 'Símbolos patrios',
    icono: 'simbolos',
    color: '#0284c7',
    suave: '#e0f2fe',
    texto: 'La bandera, la escarapela y el himno',
    edadMin: 6,
    edadMax: 10,
    niveles: [
      { nombre: 'La bandera y la escarapela', hasta: 8 },
      { nombre: 'El himno y el escudo' }
    ],
    simbolo: '☀️'
  }, [
    ['colores', '¿De qué colores es la <b>bandera argentina</b>?', 'Celeste y blanca', ['Roja y blanca', 'Azul y amarilla', 'Verde y blanca'], 'Son los colores del cielo y de las nubes.', 'La bandera argentina es celeste y blanca, con el Sol de Mayo en el medio.'],
    ['creo', '¿Quién <b>creó</b> la bandera?', 'Manuel Belgrano', ['José de San Martín', 'Domingo Sarmiento', 'Cristóbal Colón'], 'Lo recordamos el Día de la Bandera, el 20 de junio.', 'Manuel Belgrano creó la bandera en 1812.'],
    ['izo', '¿Dónde se izó la bandera <b>por primera vez</b>?', 'En Rosario, a orillas del Paraná', ['En Buenos Aires, en la Plaza de Mayo', 'En Tucumán, en la Casa Histórica', 'En Mendoza, al pie de los Andes'], 'Hoy ahí está el Monumento a la Bandera.', 'Belgrano la izó el 27 de febrero de 1812 en Rosario, a orillas del río Paraná.'],
    ['sol', '¿Cómo se llama el sol que está <b>en el medio</b> de la bandera?', 'El Sol de Mayo', ['El Sol de Julio', 'El Sol de Rosario', 'El Sol del Norte'], 'Se llama como el mes de la Revolución de 1810.', 'Es el Sol de Mayo: recuerda la Revolución de Mayo.'],
    ['escarapela', '¿Qué nos ponemos en el pecho para las <b>fiestas patrias</b>?', 'La escarapela', ['Una medalla', 'Una bandera', 'Un moño de regalo'], 'Es redonda, celeste y blanca.', 'La escarapela es celeste y blanca, y se lleva del lado del corazón.'],
    ['dia-escarapela', '¿Qué día es el <b>Día de la Escarapela</b>?', 'El 18 de mayo', ['El 25 de mayo', 'El 9 de julio', 'El 20 de junio'], 'Es una semana antes del 25 de mayo.', 'El Día de la Escarapela es el 18 de mayo.'],
    ['dia-bandera', '¿Qué día es el <b>Día de la Bandera</b>?', 'El 20 de junio', ['El 25 de mayo', 'El 9 de julio', 'El 17 de agosto'], 'Es el día en que murió Manuel Belgrano.', 'El 20 de junio es el Día de la Bandera, en homenaje a Belgrano.'],
    ['primero', '¿Cuál fue el <b>primer</b> símbolo patrio?', 'La escarapela', ['La bandera', 'El himno', 'El escudo'], 'Se aprobó unos días antes que la bandera, en febrero de 1812.', 'La escarapela se aprobó el 18 de febrero de 1812, antes que la bandera.'],
    ['himno-letra', '¿Quién escribió la <b>letra</b> del Himno Nacional?', 'Vicente López y Planes', ['Blas Parera', 'Manuel Belgrano', 'José de San Martín'], 'La música la hizo otra persona: Blas Parera.', 'La letra del Himno es de Vicente López y Planes, y la música, de Blas Parera.'],
    ['himno-musica', '¿Quién compuso la <b>música</b> del Himno Nacional?', 'Blas Parera', ['Vicente López y Planes', 'Manuel Belgrano', 'Mariano Moreno'], 'La letra la escribió otra persona: Vicente López y Planes.', 'La música del Himno es de Blas Parera.'],
    ['himno-dia', '¿Qué día es el <b>Día del Himno Nacional</b>?', 'El 11 de mayo', ['El 25 de mayo', 'El 9 de julio', 'El 18 de mayo'], 'Se aprobó en 1813, unos días antes de que se cumplieran tres años de la Revolución de Mayo.', 'El 11 de mayo de 1813 se aprobó el Himno Nacional.'],
    ['himno-cuando', '¿Cuándo se canta el <b>Himno Nacional</b>?', 'En los actos patrios', ['Sólo en los cumpleaños', 'Sólo en Navidad', 'Nunca'], 'Pensá en los actos de la escuela.', 'El Himno se canta en los actos patrios, de pie y con respeto.'],
    ['escudo-manos', 'En el <b>escudo</b>, ¿qué quieren decir las dos manos que se dan la mano?', 'La unión', ['La pelea', 'Una despedida', 'El trabajo'], 'Pensá en dos amigos que se dan la mano.', 'Las manos entrelazadas son la unión de las provincias.'],
    ['escudo-gorro', 'En el escudo, el <b>gorro rojo</b> en la punta del palo quiere decir…', 'La libertad', ['El frío', 'La guerra', 'El rey'], 'Hace mucho, lo usaban las personas que dejaban de ser esclavas.', 'Es el gorro frigio: quiere decir libertad.'],
    ['escudo-laureles', 'Las <b>ramas de laurel</b> que rodean el escudo quieren decir…', 'La victoria', ['La primavera', 'El campo', 'La comida'], 'Antes se les ponía una corona de laurel a los que ganaban.', 'Los laureles quieren decir victoria.'],
    ['escudo-sol', 'El <b>sol</b> que asoma arriba del escudo es…', 'Un país que nace', ['Un atardecer', 'El verano', 'Un día de calor'], 'Es un sol que está saliendo, como a la mañana.', 'El sol que sale es la Argentina que empezaba a nacer.']
  ]);

  /* ============================================================
     Fechas patrias
     ============================================================ */
  var FECHAS = cuestionario({
    id: 'fechas',
    nombre: 'Fechas patrias',
    icono: 'fechas',
    color: '#db2777',
    suave: '#fce7f3',
    texto: 'El 25 de mayo, el 9 de julio y más',
    edadMin: 7,
    edadMax: 12,
    niveles: [
      { nombre: 'Las más importantes', filtro: soloEstas(['25-mayo', '9-julio', 'revolucion-anio', 'independencia-anio', 'independencia-donde', '20-junio', '17-agosto', '11-septiembre']) },
      { nombre: 'Todas las fechas' }
    ],
    simbolo: '📅'
  }, [
    ['25-mayo', '¿Qué recordamos el <b>25 de mayo</b>?', 'La Revolución de Mayo', ['La Declaración de la Independencia', 'La creación de la bandera', 'La llegada de Colón'], 'Ese día de 1810 se formó el primer gobierno patrio.', 'El 25 de mayo de 1810 se formó la Primera Junta: el primer gobierno patrio.'],
    ['9-julio', '¿Qué recordamos el <b>9 de julio</b>?', 'La Declaración de la Independencia', ['La Revolución de Mayo', 'El Día de la Bandera', 'El Día del Maestro'], 'Pasó en Tucumán, en 1816.', 'El 9 de julio de 1816, en Tucumán, se declaró la independencia.'],
    ['revolucion-anio', '¿En qué año fue la <b>Revolución de Mayo</b>?', 'En 1810', ['En 1816', 'En 1776', 'En 1492'], 'Fue seis años antes de la independencia.', 'La Revolución de Mayo fue en 1810.'],
    ['independencia-anio', '¿En qué año se declaró la <b>independencia</b>?', 'En 1816', ['En 1810', 'En 1812', 'En 1853'], 'Fue seis años después de la Revolución de Mayo.', 'La independencia se declaró el 9 de julio de 1816.'],
    ['independencia-donde', '¿En qué ciudad se declaró la <b>independencia</b>?', 'San Miguel de Tucumán', ['Buenos Aires', 'Rosario', 'Córdoba'], 'Es la capital de la provincia más chica del país.', 'Se declaró en San Miguel de Tucumán, en la casa que hoy se llama Casa Histórica.'],
    ['20-junio', '¿Qué se celebra el <b>20 de junio</b>?', 'El Día de la Bandera', ['El Día de la Independencia', 'El Día del Maestro', 'El Día de la Escarapela'], 'Ese día murió Manuel Belgrano.', 'El 20 de junio es el Día de la Bandera: recordamos a Belgrano.'],
    ['17-agosto', '¿A quién recordamos el <b>17 de agosto</b>?', 'Al general José de San Martín', ['A Manuel Belgrano', 'A Domingo Sarmiento', 'A Martín Miguel de Güemes'], 'Es el que cruzó la cordillera de los Andes.', 'El 17 de agosto recordamos a San Martín, que murió ese día de 1850.'],
    ['11-septiembre', '¿Qué se celebra el <b>11 de septiembre</b>?', 'El Día del Maestro', ['El Día de la Bandera', 'El Día del Estudiante', 'El Día de la Tradición'], 'Ese día murió Domingo Faustino Sarmiento.', 'El 11 de septiembre es el Día del Maestro, en homenaje a Sarmiento.'],
    ['primera-junta', '¿Qué se formó el <b>25 de mayo de 1810</b>?', 'La Primera Junta de gobierno', ['El Congreso de Tucumán', 'La Asamblea del Año XIII', 'El Ejército de los Andes'], 'Fue el primer gobierno patrio.', 'Se formó la Primera Junta, presidida por Cornelio Saavedra.'],
    ['17-junio', '¿A quién recordamos el <b>17 de junio</b>?', 'A Martín Miguel de Güemes', ['A José de San Martín', 'A Manuel Belgrano', 'A Guillermo Brown'], 'Defendió el norte del país con sus gauchos.', 'El 17 de junio recordamos a Güemes, que defendió el norte con sus gauchos.'],
    ['12-octubre', '¿Qué día se celebra el <b>Respeto a la Diversidad Cultural</b>?', 'El 12 de octubre', ['El 9 de julio', 'El 10 de noviembre', 'El 2 de abril'], 'Recuerda la llegada de Colón a América, en 1492.', 'El 12 de octubre recordamos 1492 y el respeto por todas las culturas, también las de los pueblos originarios.'],
    ['2-abril', '¿A quiénes recordamos el <b>2 de abril</b>?', 'A los veteranos y caídos en Malvinas', ['A los que hicieron la Revolución de Mayo', 'A los maestros', 'A los granaderos'], 'Tiene que ver con unas islas del sur.', 'El 2 de abril es el Día del Veterano y de los Caídos en la Guerra de Malvinas.'],
    ['24-marzo', '¿Qué día es el <b>Día de la Memoria</b>?', 'El 24 de marzo', ['El 2 de abril', 'El 25 de mayo', 'El 12 de octubre'], 'Es en marzo, cuando empiezan las clases.', 'El 24 de marzo es el Día de la Memoria por la Verdad y la Justicia: recordamos a las víctimas de la última dictadura, para que nunca más vuelva a pasar.'],
    ['10-noviembre', '¿Qué se celebra el <b>10 de noviembre</b>?', 'El Día de la Tradición', ['El Día de la Soberanía', 'El Día del Maestro', 'El Día de la Bandera'], 'Ese día nació José Hernández, el que escribió el Martín Fierro.', 'El 10 de noviembre es el Día de la Tradición: nació José Hernández, autor del Martín Fierro.'],
    ['20-noviembre', '¿Qué se recuerda el <b>20 de noviembre</b>?', 'El Día de la Soberanía Nacional', ['El Día de la Tradición', 'El Día de la Independencia', 'El Día del Maestro'], 'Recuerda una batalla en el río Paraná: la Vuelta de Obligado.', 'El 20 de noviembre recordamos la Vuelta de Obligado, de 1845, cuando se defendió el río Paraná.']
  ]);

  /* ============================================================
     Los próceres
     ============================================================ */
  var PROCERES = cuestionario({
    id: 'proceres',
    nombre: 'Los próceres',
    icono: 'proceres',
    color: '#7c3aed',
    suave: '#ede9fe',
    texto: 'San Martín, Belgrano, Juana Azurduy…',
    edadMin: 8,
    edadMax: 12,
    niveles: [
      { nombre: 'San Martín y Belgrano', hasta: 9 },
      { nombre: 'Más próceres' }
    ],
    simbolo: '🎖️'
  }, [
    ['andes', '¿Quién cruzó la <b>cordillera de los Andes</b> con su ejército?', 'José de San Martín', ['Manuel Belgrano', 'Domingo Sarmiento', 'Guillermo Brown'], 'Lo recordamos el 17 de agosto.', 'San Martín cruzó los Andes en 1817 con el Ejército de los Andes.'],
    ['libero', 'San Martín ayudó a liberar la Argentina, Chile y…', 'Perú', ['Brasil', 'Uruguay', 'México'], 'Queda al norte de Chile, sobre el océano Pacífico.', 'San Martín ayudó a liberar la Argentina, Chile y Perú.'],
    ['nacio', '¿Dónde nació San Martín?', 'En Yapeyú, Corrientes', ['En Buenos Aires', 'En Mendoza', 'En Rosario'], 'Es un pueblito a orillas del río Uruguay.', 'San Martín nació en Yapeyú, Corrientes, en 1778.'],
    ['granaderos', '¿Qué regimiento <b>creó</b> San Martín?', 'Los Granaderos a Caballo', ['Los Patricios', 'Los gauchos de Güemes', 'La Armada'], 'Hoy cuidan la Casa Rosada.', 'San Martín creó los Granaderos a Caballo, que hoy son la escolta del presidente.'],
    ['san-lorenzo', '¿Qué combate ganaron San Martín y los granaderos en 1813?', 'El de San Lorenzo', ['El de Tucumán', 'El de Salta', 'La Vuelta de Obligado'], 'Fue junto al río Paraná, al lado de un convento.', 'En San Lorenzo, en 1813, fue el primer combate de los granaderos.'],
    ['padre', '¿A quién le decimos <b>«el Padre de la Patria»</b>?', 'José de San Martín', ['Manuel Belgrano', 'Domingo Sarmiento', 'Mariano Moreno'], 'Es el Libertador que cruzó los Andes.', 'A San Martín le decimos el Padre de la Patria.'],
    ['bandera', '¿Qué prócer creó la <b>bandera</b>?', 'Manuel Belgrano', ['José de San Martín', 'Mariano Moreno', 'Cornelio Saavedra'], 'Lo recordamos el 20 de junio.', 'Manuel Belgrano creó la bandera en 1812, en Rosario.'],
    ['escuelas', 'Con el premio que le dieron por dos batallas, Belgrano pidió que se hicieran…', 'Escuelas', ['Palacios', 'Barcos', 'Estatuas suyas'], 'Él pensaba que aprender era lo más importante.', 'Belgrano donó su premio para hacer cuatro escuelas.'],
    ['exodo', 'Belgrano le pidió al pueblo de <b>Jujuy</b> que se fuera y no le dejara nada al enemigo. ¿Cómo se llama eso?', 'El Éxodo Jujeño', ['El Cruce de los Andes', 'La Revolución de Mayo', 'El Cabildo Abierto'], '«Éxodo» quiere decir que un pueblo entero se va de su lugar.', 'En el Éxodo Jujeño, en 1812, todo el pueblo se fue y quemó lo que no podía llevarse.'],
    ['sarmiento', '¿A quién le dicen <b>«el padre del aula»</b>?', 'Domingo Faustino Sarmiento', ['Manuel Belgrano', 'José de San Martín', 'Mariano Moreno'], 'Fue presidente y abrió muchísimas escuelas.', 'Sarmiento abrió escuelas y bibliotecas por todo el país.'],
    ['juana', '¿Quién fue <b>Juana Azurduy</b>?', 'Una patriota que luchó por la independencia', ['Una reina de España', 'La que escribió el Himno', 'La primera maestra del país'], 'Peleó a caballo en el Alto Perú, que hoy es Bolivia.', 'Juana Azurduy luchó por la independencia en el Alto Perú y llegó a teniente coronel.'],
    ['guemes', '¿Quién defendió el <b>norte</b> del país con sus gauchos?', 'Martín Miguel de Güemes', ['Guillermo Brown', 'Cornelio Saavedra', 'Vicente López y Planes'], 'Era de Salta.', 'Güemes y sus gauchos defendieron el norte de los ejércitos del rey.'],
    ['brown', '¿Quién fue el padre de la <b>Armada Argentina</b>?', 'Guillermo Brown', ['Martín Miguel de Güemes', 'José de San Martín', 'Manuel Belgrano'], 'Había nacido en Irlanda y era marino.', 'Guillermo Brown, nacido en Irlanda, comandó los barcos de la patria.'],
    ['moreno', '¿Quién fundó la <b>Gazeta de Buenos Ayres</b>, el diario de la Revolución?', 'Mariano Moreno', ['Cornelio Saavedra', 'Domingo Sarmiento', 'Guillermo Brown'], 'Era secretario de la Primera Junta.', 'Mariano Moreno fundó la Gazeta en 1810. Por eso el 7 de junio es el Día del Periodista.'],
    ['saavedra', '¿Quién fue el presidente de la <b>Primera Junta</b>?', 'Cornelio Saavedra', ['Mariano Moreno', 'Manuel Belgrano', 'José de San Martín'], 'Era el jefe del regimiento de Patricios.', 'Cornelio Saavedra presidió la Primera Junta, en 1810.']
  ]);

  /* ============================================================
     Cómo se vivía
     ============================================================ */
  var COLONIA = cuestionario({
    id: 'colonia',
    nombre: 'Cómo se vivía',
    icono: 'colonia',
    color: '#b45309',
    suave: '#fef3c7',
    texto: 'Los pueblos originarios y la colonia',
    edadMin: 9,
    edadMax: 12,
    niveles: [
      { nombre: 'Los pueblos originarios', hasta: 6 },
      { nombre: 'La vida en la colonia', hasta: 13 },
      { nombre: 'De colonia a país' }
    ],
    simbolo: '🏛️'
  }, [
    ['antes', 'Antes de que llegaran los españoles, en nuestro territorio vivían…', 'Muchos pueblos originarios', ['Nadie', 'Sólo animales', 'Los romanos'], 'Hacía miles de años que vivían acá.', 'Vivían muchos pueblos originarios, cada uno con su idioma y sus costumbres.'],
    ['terrazas', 'Los <b>diaguitas</b>, del noroeste, cultivaban en las montañas haciendo…', 'Terrazas, como escalones', ['Invernaderos de vidrio', 'Túneles', 'Canales de cemento'], 'Así el agua no se llevaba la tierra de la ladera.', 'Los diaguitas hacían terrazas en las laderas para cultivar maíz y papa.'],
    ['mate', 'De los <b>guaraníes</b>, del noreste, aprendimos a tomar…', 'Mate', ['Café', 'Té', 'Chocolate'], 'Se toma con bombilla.', 'Los guaraníes ya tomaban yerba mate antes de que llegaran los españoles.'],
    ['patagonia', '¿Qué pueblo vivía en la <b>Patagonia</b> cazando guanacos?', 'Los tehuelches', ['Los diaguitas', 'Los guaraníes', 'Los incas'], 'Vivían en el sur, donde hace frío y hay mucho viento.', 'Los tehuelches cazaban guanacos y ñandúes en la Patagonia.'],
    ['fuego', '¿Qué pueblo vivía en <b>Tierra del Fuego</b>?', 'Los selk’nam', ['Los guaraníes', 'Los diaguitas', 'Los comechingones'], 'Vivían en la isla más grande del sur, y se abrigaban con pieles de guanaco.', 'Los selk’nam, también llamados onas, vivían en Tierra del Fuego.'],
    ['hoy', '¿Hay <b>pueblos originarios</b> en la Argentina de hoy?', 'Sí, en todo el país', ['No, desaparecieron todos', 'Sólo en los museos', 'Sólo en otros países'], 'Hay chicos de pueblos originarios que van a la escuela, como vos.', 'Hoy viven en la Argentina qom, wichís, mapuches, guaraníes, kollas y muchos pueblos más.'],
    ['virreinato', 'En 1809, nuestro territorio era parte del…', 'Virreinato del Río de la Plata', ['Imperio Romano', 'Reino de Francia', 'Reino de Portugal'], 'Lo gobernaba un virrey, en nombre del rey de España.', 'Era el Virreinato del Río de la Plata: lo gobernaba un virrey que mandaba el rey de España.'],
    ['luz', 'En la colonia, ¿con qué se iluminaban las casas de noche?', 'Con velas', ['Con lamparitas', 'Con linternas', 'Con la tele'], 'Todavía no había electricidad.', 'Se iluminaban con velas, muchas hechas con grasa de vaca.'],
    ['agua', '¿Cómo llegaba el agua a las casas en la colonia?', 'La traía el aguatero en su carro', ['Por la canilla', 'En botellas del súper', 'Por un caño desde el río'], 'Todavía no había canillas.', 'El aguatero sacaba agua del río y la vendía casa por casa.'],
    ['viajar', '¿En qué se viajaba de una ciudad a otra en la colonia?', 'En carreta o a caballo', ['En tren', 'En auto', 'En avión'], 'Todavía no había motores.', 'Se viajaba en carretas tiradas por bueyes o a caballo: un viaje largo tardaba semanas.'],
    ['cabildo', '¿Qué era el <b>Cabildo</b>?', 'El edificio donde se gobernaba la ciudad', ['Una iglesia', 'Un mercado', 'Una escuela'], 'Está frente a la Plaza de Mayo, y tiene una torre y arcos.', 'En el Cabildo se gobernaba la ciudad. Ahí se hizo el Cabildo Abierto de 1810.'],
    ['mazamorrera', 'En la colonia, ¿quién vendía <b>mazamorra</b> por la calle?', 'La mazamorrera', ['El aguatero', 'El farolero', 'El sereno'], 'Se llama como lo que vendía.', 'La mazamorrera vendía mazamorra, un postre de maíz con leche.'],
    ['sereno', 'En la colonia, ¿quién recorría las calles de noche anunciando la hora?', 'El sereno', ['El aguatero', 'La mazamorrera', 'El lechero'], 'Decía cosas como «¡Las doce y sereno!».', 'El sereno cuidaba las calles de noche y anunciaba la hora y cómo estaba el tiempo.'],
    ['cabildo-abierto', 'El <b>22 de mayo de 1810</b>, los vecinos se reunieron en un…', 'Cabildo Abierto', ['Congreso', 'Partido de fútbol', 'Mercado'], 'Se llama como el edificio, pero «abierto» a los vecinos.', 'En el Cabildo Abierto del 22 de mayo se decidió sacar al virrey.'],
    ['asamblea', 'La <b>Asamblea del Año XIII</b> decidió que los hijos de las personas esclavizadas…', 'Nacerían libres', ['Serían soldados', 'No irían a la escuela', 'Serían del rey'], 'Se llamó «libertad de vientres».', 'En 1813 se decidió que los hijos de las personas esclavizadas nacerían libres.'],
    ['constitucion', '¿En qué año se aprobó la <b>Constitución Nacional</b>?', 'En 1853', ['En 1810', 'En 1816', 'En 1492'], 'Fue muchos años después de la independencia, en Santa Fe.', 'La Constitución Nacional se aprobó en 1853, en Santa Fe.']
  ]);

  var JUEGOS = [SIMBOLOS, FECHAS, PROCERES, COLONIA];

  return T.materia('historia', JUEGOS);
})();
