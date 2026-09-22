# Bichito Curioso

> Antes se llamaba **Aprender Jugando**. El nombre cambió en todo lo que se ve
> (la cortina de arranque, la bienvenida, el título y el nombre al instalarla),
> pero no en lo de adentro: el repositorio y la dirección siguen siendo
> `aprender-jugando`, y también las claves del `localStorage`, la marca de las
> copias (`app: 'aprender-jugando'`), el prefijo de la caché y el `id` del
> manifiesto. Cambiar cualquiera de esas cosas haría que el celular crea que es
> otra app, o que se pierdan el progreso y las copias viejas.

App para chicos con dos mitades que se apoyan una en la otra:

- **Aprender** — cursitos cortos que explican algo con dibujos y ejemplos.
- **Jugar** — juegos para practicar eso mismo.

Cada lección termina ofreciendo el juego donde usar lo que se acaba de leer, y
cada juego tiene su lección al lado. Hay cinco materias con 48 juegos entre
todas: **Geografía** (6, de reconocer una montaña a las capitales del mundo en
un mapa interactivo), **Matemática** (12, de contar a fracciones), **Lengua**
(10, de la primera letra a las tildes), **Ciencias** (10, de los ruidos de los
animales al sistema solar) e **Inglés** (10, de los colores al verbo *to be*).
Cada materia tiene juegos para cada edad de 4 a 12 años, ordenados de menor a
mayor, y ninguno está cerrado: la edad recomienda, no prohíbe.

## Cómo usarla

**En la computadora:** doble clic en `index.html`. No hace falta instalar nada
ni tener internet: el mapa, los 194 países y las 194 banderas están dentro de
la carpeta.

**En el celular (como app):** está publicada en

**https://sebastarre.github.io/aprender-jugando/**

- **Android (Chrome):** entrás y tocás *Instalar* en el cartel de arriba, o el
  menú ⋮ → *Instalar aplicación*.
- **iPhone (Safari):** entrás, tocás *Compartir* y después *Agregar a inicio*.

Queda con su propio ícono, se abre a pantalla completa sin barra del navegador
y, una vez instalada, **funciona sin internet**: la primera visita guarda los
1,5 MB de la app en el teléfono.

## Publicar cambios

La página vive en el repositorio `sebastarre/aprender-jugando`, rama `main`,
servida por GitHub Pages. Para que los cambios lleguen al celular:

```bash
node herramientas/generar-sw.js
```

```bash
git add -A && git commit -m "lo que cambiaste" && git push
```

El primer comando es importante: `sw.js` guarda la lista de archivos y una
versión sacada del contenido. Si no se regenera, los celulares que ya tienen
la app siguen usando la copia vieja. Con la versión nueva, la app se actualiza
sola la próxima vez que se abre con internet.

## Los juegos

Todos funcionan igual: aparece una consigna y hay **3 intentos**. Si se fallan
los tres, se muestra la respuesta correcta antes de pasar a la siguiente.

**Geografía**

| Edad | Juego | Consigna | Cómo se responde |
|---|---|---|---|
| 4–7 | Los lugares | Un dibujo: «¿Qué lugar es este?» | Eligiendo entre 4 |
| 5–8 | Dónde se ve | «¿Dónde se ve la vaca?» | La ciudad, el campo o el mar |
| 6–9 | Los continentes | Una bandera: «¿En qué continente está Chile?» | Eligiendo entre 4 |
| 7–12 | Banderas | Muestra una bandera | Clic en el mapa, o eligiendo entre 4 banderas |
| 8–12 | Encontrá el país | «¿Dónde está Argentina?» | Clic en el país en el mapa |
| 10–12 | Capitales | «¿De qué país es capital Lima?» | Clic en el país en el mapa |

Los tres primeros no usan el mapa: geografía para un chico de cuatro no es el
planisferio, es reconocer una montaña y un río y saber dónde se ve cada cosa.

En los tres del mapa, los niveles son las zonas, de la más chica a la más
grande: América del Sur, América del Norte, América, Europa, África, Asia,
Oceanía y, al final, todo el mundo.

**Matemática**

| Edad | Juego | Consigna | Niveles |
|---|---|---|---|
| 4–6 | Contar | Dibujitos de a cinco por fila: «¿Cuántos hay?» | Hasta 5, hasta 10, hasta 20 |
| 4–7 | Figuras | Dibuja una figura: «¿Qué figura es?» | Las cuatro básicas, o también óvalo, rombo, pentágono y hexágono |
| 5–8 | Mayor y menor | «¿Cuál es el número más grande?» | Hasta 10, hasta 100, o las mismas tres cifras en otro orden |
| 5–10 | Sumas y restas | «¿Cuánto es 34 − 17?» | Cuatro niveles; sumas, restas o mezcladas |
| 6–10 | Qué número sigue | «2, 4, 6, 8, ?» | De a 1 y 2; de a 3, 5 y 10; saltos raros y dobles |
| 7–9 | La hora | Dibuja un reloj de agujas | En punto, y media, y cuarto, o de 5 en 5 |
| 7–9 | Dobles y mitades | «¿Cuál es la mitad de 14?» | Números chicos o grandes; dobles, mitades o mezclado |
| 7–9 | Cuánto vale | «En 356, ¿cuánto vale el 5?» | Tres o cuatro cifras |
| 7–12 | Problemas | Un cuento corto con una cuenta adentro | Sumar y restar, o las cuatro cuentas |
| 8–12 | Tablas de multiplicar | «¿Cuánto es 7 × 8?» | Una tabla del 2 al 12, o mezcladas |
| 8–12 | Divisiones | «¿Cuánto es 56 ÷ 7?» | Dividir por 2 a 10, o mezcladas |
| 9–12 | Fracciones | Dibuja una torta o una barra: «¿Qué parte está pintada?» | Hasta cuartos, o hasta octavos |

Las preguntas de matemática se generan en cada partida, así que nunca sale dos
veces la misma ronda. Las respuestas incorrectas no son al azar: son los
errores típicos (correrse una fila de la tabla, cambiar la suma por la resta,
leer la aguja equivocada, dar vuelta una fracción, sumar en vez de multiplicar
en una serie de dobles), para que acertar signifique algo. En los problemas,
las malas son lo que da cada *otra* cuenta con los mismos números: el error de
un problema casi nunca es de cálculo, es elegir mal la cuenta.

**Lengua**

| Edad | Juego | Consigna |
|---|---|---|
| 4–6 | La primera letra | Un dibujo: «¿Con qué letra empieza?» |
| 5–7 | La vocal que falta | Un dibujo y «c ? sa» |
| 5–7 | Rimas | «¿Qué palabra rima con gato?» |
| 6–9 | Contrarios | «¿Cuál es lo contrario de grande?» |
| 6–9 | Sílabas | «¿Cuántas sílabas tiene mariposa?» |
| 8–11 | Plurales | «¿Cuál es el plural de lápiz?» |
| 8–12 | Ortografía | Cuatro maneras de escribir una palabra: «¿Cuál está bien?» |
| 8–12 | Sinónimos | «¿Qué palabra significa lo mismo que contento?» |
| 9–12 | Tildes | «¿Cuál está bien escrita?» camión, camion, cámion… |
| 10–12 | Clases de palabras | «¿Qué clase de palabra es correr?» |

**Ciencias**

| Edad | Juego | Consigna |
|---|---|---|
| 4–6 | ¿Quién hace…? | «¿Quién hace “¡Muuu!”?» y cuatro animales |
| 4–7 | Mi cuerpo | «¿Con qué olemos?» y cuatro partes del cuerpo |
| 5–8 | ¿Dónde vive? | Un animal: en el mar, la selva, la granja, el polo o el desierto |
| 6–9 | ¿Está vivo? | «¿Cuál es un ser vivo?» (el robot se mueve y no lo es) |
| 7–10 | Las plantas | Raíz, tallo, hojas, flor y fruto |
| 8–11 | ¿Qué come? | Herbívoro, carnívoro u omnívoro |
| 9–12 | Clases de animales | Mamífero, ave, pez, reptil, anfibio o insecto |
| 9–12 | El cuerpo por dentro | El corazón, los pulmones, los huesos |
| 10–12 | El agua y la materia | Sólido, líquido y gaseoso |
| 10–12 | El sistema solar | Los planetas, el Sol y la Luna |

**Inglés**

| Edad | Juego | Consigna |
|---|---|---|
| 4–6 | Los colores | Un cuadrado de color: «¿De qué color es?» → *red* |
| 4–7 | Los números | Un número grande: «¿Cómo se dice?» → *seven* |
| 5–7 | Los animales | Un dibujo: «¿Cómo se dice este animal?» → *dog* |
| 5–8 | La comida | Un dibujo: «¿Cómo se dice?» → *apple* |
| 6–9 | La familia | «¿Cómo se dice la hermana?» → *sister* |
| 6–9 | El cuerpo | «¿Cómo se dice la mano?» → *hand* |
| 7–10 | La escuela | «¿Cómo se dice el lápiz?» → *pencil* |
| 8–11 | Las acciones | «¿Cómo se dice correr?» → *run* |
| 8–12 | Frases | «¿Qué quiere decir *thank you*?» → Gracias |
| 10–12 | am, is, are | «*The cats ___ black*» → *are* |

Las listas de inglés no tienen ninguna palabra que en castellano tenga dos
traducciones igual de buenas: hablar es *talk* y *speak*, mirar es *look* y
*watch*, mamá es *mother* y *mom*. Con cuatro botones en la pantalla, una
segunda respuesta correcta es un error del juego, no del chico. Las palabras
en inglés van marcadas con `lang="en"` para que un lector de pantalla las
pronuncie en inglés.

Los de Lengua, Ciencias e Inglés son listas escritas a mano, y cada una está revisada
para que ninguna respuesta mala sea también correcta: ninguna «mala» rima,
ningún «mal escrito» es una palabra que existe (por eso no está «vaso»: *baso*
y *bazo* existen), ninguna variante de tilde es otra palabra (por eso no está
«dibujo»: *dibujó* existe), y si la respuesta es «en el polo» para el
pingüino, «en el mar» no sale como mala, porque también vive en el mar.

Varias preguntas tienen trampa a propósito, que son las que más enseñan: el
delfín es mamífero y el tiburón es pez, el pingüino es un ave aunque no vuele,
Venus es más caliente que Mercurio aunque esté más lejos del Sol.

**Cada juego se juega por niveles.** Antes de empezar hay una sola pregunta:
qué nivel. Son 1, 2, 3… y cada uno tiene un nombre que dice qué entra —«Los
de casa», «Y los de la granja», «Tabla del 7», «Las que llevan tilde»—. Cada
nivel incluye a los anteriores, así que jugar el 3 también repasa lo de antes,
y cada uno guarda su propio récord.

Antes de los niveles, la pantalla previa preguntaba «¿cuántas preguntas: 5, 10
o todas?». Era una pregunta de máquina: no decía nada de lo que había adentro
y un chico de cinco no tenía cómo contestarla. Entre los 48 juegos hay 154
niveles.

En los juegos de lista, el nivel dice qué preguntas entran: los primeros N de
la lista (`hasta`) o las que cumplan algo (`filtro`, por ejemplo «las de una y
dos sílabas» o «los herbívoros y carnívoros»). En los que generan preguntas
nuevas cada vez —las cuentas, el reloj, las tablas— los niveles son la
dificultad que ya tenían: Fácil, Medio, Difícil, Experto; Tabla del 2 a Tabla
del 12 y todas mezcladas al final.

**Puntaje:** 3 puntos si acierta al primer intento, 2 al segundo, 1 al tercero.
Al final se ganan hasta 3 estrellas según el porcentaje y se guarda el récord
de esa combinación de juego y opciones. Lo que se falló aparece al final en
«Para repasar».

Los países muy chiquitos (Malta, Nauru, el Vaticano, las islas del Caribe...)
no se ven como manchas en el mapa: se dibujan como un puntito clickeable. Si el
chico falla una vez con uno de ellos, el juego le avisa que busque el punto.

## Cómo se adapta a cada chico

La primera vez que se abre, la app pide **nombre y edad** (no hay registro ni
cuenta: queda todo en el dispositivo). Con la edad decide qué mostrar.

**Cada juego tiene una edad desde y una hasta** (`edadMin` y `edadMax`). Las
edades salen de en qué año de la primaria se enseña cada tema, según el
[Diseño Curricular de la Provincia de Buenos Aires (2018)](http://servicios.abc.gov.ar/lainstitucion/organismos/consejogeneral/disenioscurriculares/primaria/2018/dis-curricular-PBA-completo.pdf)
y los NAP. Algunos ejemplos de dónde salió cada número:

| Tema | Año | Edad |
|---|---|---|
| Leer la hora «en relojes de aguja» | 2.º | 7 |
| Unos, dieces y cienes (valor posicional) | 2.º | 7 |
| La tabla pitagórica, multiplicación y división | 3.º | 8 |
| Plurales con «-z/-ces», sinónimos y antónimos | 3.º | 8 |
| Herbívoros, carnívoros y omnívoros | 3.º | 8 |
| El planisferio y los continentes | 3.º y 4.º | 8 |
| «Fracciones de uso frecuente» | 4.º | 9 |
| «Reglas generales de acentuación» (las tildes) | 4.º | 9 |
| Vertebrados: mamíferos, aves, peces… | 4.º | 9 |
| Cambios de estado, rotación y traslación | 5.º | 10 |
| Capitales | 5.º | 10 |

La edad máxima es para no mostrarle a un chico de once el juego de contar
manzanitas: hasta esa edad el juego se ve, después se esconde.

**Ningún juego está cerrado.** La edad ordena y recomienda, no prohíbe. En
cada materia se ven todos los juegos, del más chico al más grande: arriba los
de su edad, abajo los de los más grandes. Los de abajo se pueden jugar igual,
siempre; lo único que pasa es que la ficha avisa para qué edad es, y si
todavía no está listo, al entrar pregunta «este es para chicos de 6, ¿jugás
igual?» —con «Jugar igual» como respuesta principal—.

**Estar listo se gana dominando.** Un juego está *dominado* cuando el chico
terminó una partida con todas las respuestas bien (el 100% de precisión que
ya le muestra la pantalla de resultados). Cuando domina todos los juegos de
su edad en una materia, la app le avisa: «ya estás listo para los juegos de 5
años». La ficha de cada juego más grande tiene una barra que muestra cuánto
le falta, y arriba de todo hay un cartel con el mismo número en grande.

Es por materia: un chico de 7 que vuela en matemática puede estar listo para
los de 9 ahí y seguir juntando los de 7 en lengua.

**Las lecciones funcionan igual**: se ven todas, ordenadas por edad, y las de
más arriba de su edad avisan para quién son y cuántas de las suyas le faltan
leer. Se pueden abrir igual.

Antes esto era un candado: los juegos de la edad siguiente pedían 100 puntos
en la materia y hasta entonces no se podían tocar. Trababa por la razón
equivocada. Un chico de seis que se sabe las tablas no tiene por qué esperar
a juntar puntos, y uno de diez que quiere contar manzanitas un rato no le
hace mal a nadie.

Lo dominado se guarda por perfil y no se pierde si después se le cambia la
edad. Las edades están en cada juego (`js/juegos/*.js`) y en cada lección
(`js/aprender/contenido.js`); la cuenta de quién está listo, en `js/app.js`
(`listoPara`, `consejoDeJuego`).

## Las lecciones se escuchan y terminan con un ejercicio

**La voz.** Cada paso de una lección se lee en voz alta al aparecer, y hay un
botón para volver a escucharlo o para callarlo. Usa la voz del propio aparato
(`speechSynthesis`, en `js/nucleo/voz.js`): no hay audios que bajar ni nada que
salga del teléfono. Lo que está marcado con `lang="en"` se lee con voz en
inglés, así *red* no suena como la red de pescar. Se apaga en Configuración →
«Leer en voz alta»; si el aparato no tiene voz en castellano, ese interruptor
queda apagado y lo dice.

**El ejercicio.** Al terminar de leer no dice «¡Listo!»: dice «¡Ahora te toca a
vos!» y arma cinco preguntas de un juego, del nivel que mejor ejercita lo que
se acaba de explicar. La de multiplicar termina con la tabla del 2, la de las
sílabas con palabras de una y dos sílabas, la de los colores en inglés con los
colores básicos. Mientras dura, la voz lee cada pregunta.

Se juega en la pantalla de juego de siempre, con el mismo motor, y cuenta como
jugado: lo que se falla va al repaso, da monedas y puede dominar el juego. Con
4 de 5 bien **la lección queda completada**; si no, «Probar de nuevo» o «Leer
la lección otra vez». Antes una lección se daba por leída con sólo llegar al
final.

El ejercicio de cada lección está en `js/aprender/contenido.js`, en el campo
`ejercicio` (juego, nivel, cuántas preguntas y la consigna).

**Pensar, no sólo leer.** Tocar «Siguiente» no enseña nada. Cada lección tiene
dos momentos en que el chico tiene que pensar:

- **Una predicción** en uno de los pasos: antes de ver la explicación, la
  pregunta («Hay 3 filas de 4 puntitos. ¿Cuántos son?»). Hasta que contesta no
  aparece «Siguiente»; después se ve si pensó bien y, si no, por qué era la
  otra. Contestar antes de leer le da algo propio contra qué comparar.
  Campo `prediccion` del paso: `{ pregunta, opciones, correcta, explicacion }`.
- **Un «¿por qué?»** al aprobar el ejercicio, antes del resultado: elige la
  razón entre tres (no se escribe: hay chicos de cuatro años), ve la
  explicación y una propuesta para hacer con un grande («Mostrale a un grande
  con puntitos por qué 2 × 5 es lo mismo que 5 × 2»). Hacer bien las cuentas
  no alcanza: hay que poder decir por qué se hacen así.
  Campo `reflexion` de la lección: `{ pregunta, razones, correcta, porque, grande }`.

La voz lee las dos, con las opciones en el orden en que están en pantalla.

## Racha y meta del día

En el cartel del inicio hay una llamita con **los días seguidos** que jugó.
Si hoy todavía no jugó, la llama se apaga un poco pero la racha no se pierde
hasta que termina el día: a la mañana tiene que ver su racha de 3, no un 0.

Abajo del menú está la **meta de hoy**: cuántas respuestas bien lleva, contra
las que pide (10 de fábrica). Cuenta cualquier cosa que se juegue —partidas,
exámenes, repasos y los ejercicios de las lecciones— y al cumplirla paga 5
monedas, una sola vez por día. Se cambia en Configuración (un ratito, una
partida, dos partidas, sin meta o **personalizada**) y es de cada chico.

«Personalizada» abre un − y un + para elegir cualquier número entre 1 y 100
respuestas bien; dejando apretado, cambia de a cinco. No se guarda aparte:
cualquier meta que no sea 5, 10, 20 o 0 se muestra como personalizada, y al
volver a Configuración aparece elegida con su número.

No hay retos: ni «perdiste tu racha» ni avisos de que no cumplió. Es para
saber si ya jugó hoy, no para que la app lo haga sentir mal.

La racha se cuenta con los días anotados aparte (`dias`, en el perfil) y ya
no con el historial, que guarda las últimas 300 partidas: un chico que jugaba
mucho perdía los días viejos de la cuenta.

## El mapa de niveles

Cada juego tiene su **camino de niveles**, como en los juegos de mapa: al tocar
un juego se entra al mapa, y no a una pantalla de opciones. Son **656 niveles**
en los 48 juegos, entre 10 y 20 por juego según cuánto hay para aprender.

**Cómo se juega**

- Los niveles se juegan en orden: pasar uno abre el siguiente.
- Cada nivel da de **1 a 3 estrellas**; con una se pasa. Las de un nivel común
  salen de los puntos (acertar al primer intento vale más que al tercero) y
  con la mitad se pasa: el mapa es para avanzar, y para las tres estrellas
  está el volver a jugarlo.
- **Cada cinco niveles hay un desafío** (el trofeo): diez preguntas con todo lo
  visto hasta ahí, **una sola oportunidad** por pregunta y sin pistas. Se pasa
  con 7 de 10. El último nivel de cada juego es el gran desafío. A diferencia
  del examen, dice si cada respuesta estuvo bien: es para chicos, y la
  respuesta enseña aunque ya no sume.
- Al pasar un nivel, las estrellas salen de a una con su sonido. «Siguiente
  nivel» vuelve al mapa: la cara del chico camina hasta el nivel nuevo, que se
  abre con un saltito, y su hoja sube sola para jugarlo.
- Al **terminar un juego** se recomienda qué seguir: el próximo juego de la
  materia que no terminó (en el orden de edades) y una lección que no hizo,
  mejor si es la que explica ese juego. Sólo lecciones de su edad: al que
  terminó Contar a los 4 no se le ofrece «sumar llevándose una».
- En el mapa: la cara del chico sobre el nivel que le toca, el anillo que late,
  las estrellas de cada nivel pasado, candados en los que faltan, el nombre de
  cada etapa al costado («Y los de la granja») y la lección del juego arriba.

**El modo libre** sigue estando (botón «Modo libre» en el mapa): es la pantalla
de antes, donde se elige todo a mano y se juega sin mapa. Los ejercicios de las
lecciones también la usan.

**Cómo está armado cada mapa.** Todo juego tiene `mapa()`, que devuelve la
lista de niveles (`{ numero, nombre, detalle, test, preguntas() }`).

- **Los de lista fija** (Lengua, Ciencias, Inglés y tres de Geografía) lo arman
  solos en `Tablero.banco` (`js/nucleo/tablero.js`) a partir de sus etapas: cada
  nivel presenta de 2 a 4 cosas nuevas, en el orden del juego, y el resto de
  las preguntas repasa lo anterior. Cuántos niveles: 10 hasta 12 cosas, 12
  hasta 16, 14 hasta 24, 16 hasta 35 y 18 más allá. Si a una etapa le sobran
  niveles, son repasos de esa etapa.
- **Matemática** tiene cada camino escrito a mano en `js/juegos/matematica.js`,
  porque sus preguntas se generan y los niveles del modo libre eran saltos
  grandes. Por ejemplo:

| Juego | Niveles | Cómo avanza |
|---|---|---|
| Contar | 15 | hasta 3, 4, 5… de a uno o dos números, hasta 20 |
| Figuras | 10 | de a una figura, junto a la que más se le parece |
| Mayor y menor | 12 | primero «el más grande», después «el más chico», después mezclado; decenas, la misma decena, centenas |
| Sumas y restas | 20 | pasar el 10, llevarse y pedir prestado tienen cada uno su nivel; decenas redondas antes de dos cifras |
| Qué número sigue | 15 | una regla nueva por nivel; los dobles al final |
| La hora | 12 | en punto, y media, y cuarto, menos cuarto, de a 5, y los engañosos |
| Tablas | 15 | en el orden en que se aprenden (2, 10, 5, 3…), no en el de los números |
| Dobles y mitades | 12 | primero dobles, después mitades; las decenas redondas enseñan a hacerlo por partes |
| Cuánto vale | 10 | un lugar a la vez: la decena, la centena, el mil |
| Divisiones | 13 | el mismo orden que las tablas |
| Problemas | 12 | un tipo de cuento por nivel y después «¿qué cuenta va?» |
| Fracciones | 12 | medios y cuartos, tercios, quintos… los séptimos al final |

- **Los del mapa del mundo** (países, capitales, banderas) comparten un camino
  de 18 niveles por subregiones (`CAMINO`, en `js/juegos/geografia.js`):
  Argentina y sus vecinos, toda América, Europa de a regiones, los diminutos
  aparte, África, Asia, Oceanía y el mundo. En cada nivel sólo se pueden tocar
  los países de esa región. Banderas se juega eligiendo entre cuatro.

Las estrellas se guardan por chico en `mapas` (`js/nucleo/almacen.js`), y el
dibujo del mapa está en `js/camino.js`.

## Una copia de todo

Todo vive en el navegador del aparato: si se borran sus datos o se cambia de
celular, se pierde. En Configuración → «Una copia de todo» se guarda un archivo
con todos los jugadores, sus partidas, monedas, compras y fotos (en el celular
se comparte, para dejarlo en Drive o mandarlo por WhatsApp; en la compu se
baja) y con «Recuperar una copia» se trae en cualquier aparato, avisando antes
qué jugadores trae y que reemplaza lo que haya. El PIN del modo parental no
viaja en la copia: el archivo lo puede abrir cualquiera.

## La pizarra

Abajo de las respuestas, en todos los juegos de tarjetas, hay una pizarra
cuadriculada para hacer la cuenta a mano: una suma de dos cifras no se hace
de memoria a los siete años, y sin papel el chico elegía al azar entre cuatro
números. Tiene lápiz negro, azul y rojo, goma, deshacer y borrar todo. Se
borra sola en cada pregunta nueva, y en los juegos del mapa no aparece.
Funciona con el dedo, con un lápiz de tableta y con el mouse.

## Los dibujos de contar

El juego de contar usaba emoji (🍎, 🦋). El problema no es que sean feos: los
dibuja el sistema operativo, así que las mismas doce manzanas se ven de un
color en Android, de otro en iPhone y de otro en la compu.

Ahora son **dibujos propios**, en `assets/contar/`: manzana, frutilla, banana,
pez, globo, mariquita, flor, pollito, pelota y mariposa. Los generamos con IA
(higgsfield, modelo `gpt_image_2_5`), todos pedidos con el mismo estilo:
contorno grueso, colores planos y fondo blanco.

`herramientas/preparar-dibujos.js` los deja listos para la app, con Chrome o
Edge headless y sin instalar nada:

1. les saca el fondo **desde los bordes hacia adentro**, como un balde de
   pintura. Borrar todo lo blanco era más simple, pero le comía los gajos
   blancos a la pelota de fútbol: un blanco rodeado de contorno es dibujo;
2. los recorta al dibujo y los centra, así doce manzanas y doce mariposas se
   ven del mismo tamaño;
3. los achica a 256×256, de ~900 KB a unos 45 KB cada uno. La app se guarda
   entera para usarla sin internet, así que el peso importa: los diez juntos
   suman menos de medio mega.

La pelota es de colores y no la clásica blanca y negra, justamente porque casi
toda blanca no sobrevivía al recorte. Las direcciones de los originales quedan
anotadas en el mismo archivo, para poder rehacerlos.

## Pistas: cada intento fallado trae más ayuda

Con tres intentos y cuatro opciones se acertaba por descarte el 75% de las
veces sin saber. Ahora, en los juegos que tienen pistas, cada fallo trae más
ayuda que el anterior (andamiaje):

1. **Primer fallo:** qué tipo de error parece ser y una pista para pensar.
   «Casi: te olvidaste de la que te llevabas. Empezá por las unidades: 7 + 5.»
2. **Segundo fallo:** una pista con el paso concreto, sin decir la respuesta.
   «Unidades: 7 + 5 = 12, escribís 2 y te llevás 1. Ahora las decenas: 2 + 1 + 1.»
3. **Tercer fallo:** la respuesta con su explicación, no sólo el resultado.
   «27 + 15 = 42: 7 + 5 = 12, escribís 2 y te llevás 1; después 2 + 1 + 1 = 4.»

Tienen pistas: sumas y restas, tablas, divisiones, la hora, qué número sigue,
dobles y mitades, cuánto vale una cifra, sílabas y ortografía. Las de
matemática salen de los números de cada cuenta y no están escritas a mano. En
el examen no hay pistas: ahí se mide.

Un juego agrega pistas con `pista: function (item, intento)` en sus ganchos
(`Tablero.ganchos`) o en su banco (`Tablero.banco`). Sin pista, el aviso de
fallo es el de siempre.

## Modo examen

Aparte de los juegos hay un **examen**, que no es otro juego sino la misma
máquina con otras reglas:

- **un solo intento** por pregunta,
- **no dice si estuvo bien** hasta que termina (tampoco se ve el puntaje ni
  los corazones: verlos subir sería saber que acertaste),
- al final da una **nota del 1 al 10**, el porcentaje y la lista de lo que
  erró con la respuesta correcta.

Lo arma el chico: elige **qué juegos entran** (puede mezclar geografía con
matemática), de qué zona si entró algo de geografía, y cuántas preguntas.
El nivel de las cuentas y del reloj sale de su edad, para que un chico de 6 no
termine rindiendo cuentas de tres cifras.

Que se puedan mezclar materias es lo que obligó a que cada juego sepa armar su
tablero **pregunta por pregunta** (`montar(item)`), en vez de una sola vez al
empezar. Por eso un examen puede pasar de una pregunta de mapa a una de
tarjetas de números sin despeinarse. El mapa se reusa si la zona no cambió,
para no redibujar 177 países en cada pregunta.

En el modo parental los exámenes se listan con 📝 para distinguirlos de las
partidas sueltas.

## Repaso: lo que fallaste vuelve

La app anota cada error, y eso se usa para dos cosas.

**Las preguntas no salen al azar parejo.** Practicando, lo que viene fallando
aparece más seguido que lo que ya sabe: un país que erró y nunca acertó pesa
6, uno que nunca vio pesa 3, y uno que acierta siempre pesa 1. Ningún peso es
0 a propósito: si lo fuera, un país ya aprendido no se vuelve a ver nunca.
Medido sobre Sudamérica, lo flojo sale unas cinco veces más que lo sabido.

**El examen no hace nada de esto.** Ahí se mide, y un sorteo cargado hacia lo
flojo daría una nota más baja que lo que el chico realmente sabe. Los juegos
reciben `sinPesar: true` cuando la partida es un examen.

Las cuentas de sumar y restar quedan afuera del pesado: su pozo es enorme
(hasta 999 + 999) y casi nunca se repite una cuenta, así que priorizar no
cambiaría nada. Sí entran las tablas y el reloj, que son pozos chicos y de
memorizar.

**Lo aprendido también vuelve, espaciado.** Aprender algo una vez no alcanza:
se olvida si no vuelve a aparecer, y se recuerda mejor si vuelve con días de
por medio. Cada cosa contestada está en una **caja**:

| Pasa esto | Vuelve a salir |
|---|---|
| La falla | mañana (caja 0) |
| La acierta cuando le tocaba | en 1, 3, 7 y 14 días, según la caja |
| La acierta de nuevo el mismo día | no cambia: diez aciertos una tarde no son dos semanas |

Lo que ya le toca volver a ver pesa 5 en el sorteo de las partidas (casi como
lo fallado). Las lecciones aprobadas vuelven a la semana, y si se aprueban
otra vez, al doble de tiempo, hasta un mes. Todo se guarda en el perfil
(`cajas` y `repasoLecciones`, en `js/nucleo/almacen.js`).

Hay una tarjeta **Repasar hoy** en el inicio y arriba de todo en Jugar, que
arma una partida con lo fallado y lo que toca volver a ver (al menos tres
lugares para esto último, así lo aprendido no queda tapado por los errores),
o lleva a la lección que toca repasar. Aparece con 5 errores juntados o con 3
cosas para hoy, y si no hay nada, no está. Reglas normales: tres intentos y
te dice en el momento si acertaste, porque esto es para aprender.

Dos detalles que importan:

- **Acertar no borra el error de una.** Baja el contador, así que hacen falta
  tantos aciertos como fallos para sacarlo de la lista. Acertar una vez de
  casualidad no lo da por aprendido.
- **El mapa se achica a la zona justa.** Si las preguntas del repaso son todas
  sudamericanas, se juega sobre Sudamérica y no sobre el planisferio, donde
  Ecuador mide nueve píxeles. Sólo si el repaso cruza continentes se abre al
  mundo entero.

Una pregunta la dibuja el juego del que salió. En matemática eso es
obligatorio: una tabla puesta en el tablero de sumas saldría «7 undefined 8»,
así que si ese juego está trabado la pregunta se saltea. En geografía no, que
cualquier juego sabe preguntar por cualquier país.

## Qué ocupa el centro

Los premios compiten con el contenido por la atención del chico. Siguen
existiendo, pero fuera del medio:

- **Mientras se juega** no hay contador de puntos. El acierto dice «¡Muy
  bien!» o «Te salió al segundo intento», no «+3 puntos».
- **El error suena suave**: avisa, no reta. El final y el récord suenan
  igual y bajito; el récord ya no tiene fanfarria propia.
- **La pantalla de fin** muestra estrellas, aciertos y precisión, y lo que
  falló con cuándo vuelve («la tenés abajo, y va a volver a salir en el
  repaso de mañana»). No muestra puntos ni récord, y las monedas y la meta
  van al final, chicas.

## Monedas y tienda

Cada respuesta correcta da monedas, pero **rinde menos repetir lo que ya
sabés**: la primera vez que acertás algo paga 5 🪙, la segunda 3, después 2, y
de ahí en adelante 1. La idea es que aprender un país nuevo valga más que
volver a acertar el mismo cien veces. El piso es 1 y no 0 para que volver a tu
juego preferido siga dando algo.

Hay un tope de **30 🪙 por partida**. Sin tope quedaba desparejo: geografía
tiene 194 países (se agotan y decaen), pero las cuentas de nivel experto casi
nunca se repiten y pagarían 5 siempre.

Comprar abre un **cartel propio** de la app, no el del navegador. No es
sólo cuestión de que se vea mejor: los navegadores pueden silenciar los
diálogos del sistema (Chrome ofrece un «no permitir más diálogos en esta
página») y a partir de ahí window.confirm() devuelve «no» sin mostrar nada.
Cuando le pasaba eso a alguien, tocar comprar no hacía absolutamente nada y
no había forma de darse cuenta de por qué. Lo mismo vale para borrar el
progreso y para reponer el PIN en el modo parental.

Con esas monedas se compran, en la **tienda** (el chip de arriba a la derecha,
o el botón en Personalización): colores sueltos para cada parte de la app,
disfraces para la mascota, fondos y monigotes extra para el perfil. **Todo es
cosmético a propósito**: no se compran pistas, ni intentos, ni juegos.

Los colores funcionan pisando variables de CSS, así que agregar uno es agregar
una entrada a `js/tienda/catalogo.js`. Lo único que un color no puede tocar es
`--exito` y `--error`: el verde de «acertaste» y el rojo de «erraste» tienen
que significar lo mismo siempre, se ponga lo que se ponga.

Cada una de las cuatro ranuras pisa su propio grupo de variables, y por eso
un solo color cambia varias cosas a la vez:

- **La portada** — `--barra`, más `--barra-fuerte` (el escalón de abajo),
  `--sobre-barra` (el texto que va encima) y `--marca-acento`. Es el cartel de
  color del inicio, con la mascota, el nombre y las dos cuentas. Se sigue
  llamando `--barra` porque antes pintaba la barra fija de arriba de todo, y la
  clave con la que se guarda la compra es ésa: renombrarla le borraría la
  compra a quien ya la tenga paga. Es el único bloque de color pleno que queda
  en la app, así que es lo que muestra de un vistazo qué paleta está puesta.
- **El fondo** — `--papel`, y con él `--tarjeta` y `--borde` (las tarjetas,
  apenas teñidas para que no queden como recortes blancos pegados encima),
  `--seleccion` (el relleno de lo elegido) y `--agua` (el mar del mapa).
  Es un color **liso**: no hay degradados. Antes había tres manchas de color
  dibujadas encima del papel, y además de ensuciar la pantalla hacían que el
  contraste real dependiera de dónde cayera el texto — el gris sobre el papel
  da 6.26:1, pero sobre el centro de la mancha azul daba 4.17 y sobre la rosa
  4.30, las dos por debajo del mínimo. Liso, lo medido es lo que se ve.
- **Los botones** — `--primario` y `--sobre-primario`, más los acentos
  `--violeta` y `--rosa`.
- **Las letras** — `--tinta` y `--tinta-suave`.

Los colores de cada materia (Geografía azul, Matemática violeta) **no** salen
de acá: son fijos a propósito, para que una materia se reconozca por su color
tenga los colores que tenga la app.

Si agregás un color de botón claro (naranja, amarillo), acordate de ponerle
también `sobre-primario` oscuro: el texto blanco sobre esos tonos no llega al
contraste mínimo. El naranja es el ejemplo, con 4.67:1 en marrón oscuro contra
2.80:1 que daría en blanco.

## Cómo se ve

Tres decisiones sostienen el aspecto de la app. Las tres apuntan a lo mismo:
que un chico la quiera abrir y que un padre la vea seria.

**La tipografía es Baloo 2**, redonda y gordita, y está **embebida** en
`assets/fuentes/` (32 KB, una sola fuente variable que cubre de 400 a 800).
No se pide a Google a propósito: la app tiene que verse igual sin internet.
Para actualizarla, `node herramientas/bajar-fuente.js`. Licencia OFL 1.1.

**Las tarjetas van en fila**: el ícono grande a la izquierda y el texto al
lado, con una línea corta debajo del título. Antes iba todo apilado —ícono,
título, una oración entera, el récord— y cada tarjeta medía 200 píxeles: tres
juegos llenaban la pantalla y las tres se veían iguales. Ahora miden 96 y lo
primero que se ve de cada una es su dibujo, que es lo que un chico reconoce
sin leer. Los textos son de tres o cuatro palabras: la explicación larga la
sigue teniendo la pantalla de configurar la partida.

**Los íconos son propios**, dibujados en `js/nucleo/iconos.js`: grilla de 24,
trazo redondeado y grueso, dos tonos, y el color lo toman del texto de al lado.
Antes eran emoji, y el problema del emoji no es que sea feo: lo dibuja el
sistema operativo, así que el mismo 🌎 sale distinto en Android, en iPhone y en
Windows, no se le puede cambiar el color ni el grosor, y la app termina
viéndose distinta en cada teléfono.

Siguen siendo emoji los que son **contenido y no interfaz**: los avatares que
elige el chico y los de la tienda. Ahí son personajes, no botones, y que los
dibuje el celular está bien.

**El volumen es de plastilina** (lo que en diseño llaman *claymorphism*, y que
es el estilo que corresponde a una app educativa infantil): bordes gruesos,
esquinas de 26px y tres capas de sombra — el escaloncito de abajo, una sombra
difusa que despega la tarjeta del fondo, y una luz interna arriba. Al apretar
se hunde hasta apoyarse. Todo lo que se mueve usa la misma curva de rebote
(`--rebote`), que es la que da sensación de juguete en vez de formulario.

### La pantalla de juegos de una materia

Arriba, una **cabecera del color de la materia** (el mismo relieve que la
portada del inicio) con su dibujo, cuántos juegos tiene y un botón a sus
lecciones. El color va un poco oscurecido: tal cual, el blanco chico no
llegaba a 4,5:1 sobre el naranja de Lengua ni el violeta de Ciencias.

Abajo, **un juego por fila**: dibujo, nombre, bajada y lo que lleva hecho
(«2/5 niveles hechos», o «Empezá por el nivel 1»), con una flechita que dice
que se toca. Antes era una grilla de fichas blancas iguales que dejaba un
hueco con juegos impares y mostraba el récord como único dato. El cartel de
edad sólo aparece si todavía quedan juegos de más grandes.

## La mascota

Un **gato o un perro**, lo elige el chico en Personalización y no se
compra: es de quién es la mascota. Aparece en la bienvenida y al terminar
una partida.

Encima lleva siempre un **disfraz de otro animal**. Vienen tres gratis
(león, zorro y dinosaurio) y hay cuatro en la tienda: abeja (90), pingüino
(100), tiburón (120) y dragón (150).

Son **ilustraciones**, no dibujos en código: una por cada combinación de
animal y disfraz, 2 × 7 = 14 archivos en `assets/mascotas/`. El animal
tiene sus colores propios y no sigue la paleta que el chico arme —un gato
que a veces es verde deja de ser un personaje—, y los disfraces traen los
suyos, que para eso son disfraces.

**Lo que se perdió al pasar a ilustraciones:** antes la mascota estaba
dibujada en SVG y cambiaba de cara según cómo le había ido (festejaba con
dos o tres estrellas, saludaba con una, ponía cara de «ups» con ninguna).
Con imágenes fijas eso ya no pasa: el resultado lo cuentan las estrellas y
el texto. Recuperarlo significaría las mismas 14 imágenes por cada gesto.

### Cómo se agrega un disfraz

Las imágenes originales son PNG de 1024×1024 con fondo blanco y pesan más
de un mega cada una: 16,5 MB las catorce, cuando la app entera pesa 1,46.
No van al repositorio. Se procesan con:

```bash
node herramientas/preparar-mascotas.js "<carpeta con los PNG>"
```

Eso hace tres cosas con cada una: le saca el fondo blanco, la recorta a lo
que ocupa el dibujo y la guarda en WebP. Los catorce quedan en **367 KB**,
45 veces menos.

El fondo no se saca borrando «todo lo blanco»: la panza, las patitas y los
ojos también son blancos y quedarían agujereados. Se hace una inundación
desde los bordes que se frena contra el contorno negro del dibujo, así que
sólo desaparece el blanco de afuera.

La correspondencia entre el nombre del archivo original y qué es cada uno
está en la tabla `QUE_ES` de esa herramienta, porque los nombres que larga
el generador de imágenes no dicen nada. Si se regeneran las imágenes hay
que actualizar esa tabla. Después, los nombres y precios van en
`js/nucleo/mascota.js`.

## Los colores se compran de a uno

Hay cuatro **ranuras** —la portada, el fondo, los botones y las letras— y
cada una tiene su propia lista de siete colores. El chico arma la
combinación que quiera: portada verde con fondo rosa, botones naranjas y
letras azules, si se le canta. Tres colores de cada ranura son gratis y los
otros cuatro se compran sueltos, entre 40 y 60 monedas.

Antes se compraban paletas enteras. Al que ya tenía una comprada se le
convirtió en los cuatro colores sueltos que la formaban, así que nadie
perdió lo que había pagado (la migración está en `pasarAColoresSueltos`,
en `js/nucleo/almacen.js`).

**Lo importante: no se puede armar algo ilegible.** No hay una lista única
de colores para todo. La ranura del fondo sólo ofrece tonos claros, la de
las letras sólo tonos oscuros, y la de los botones sólo colores que aguantan
texto encima (cada uno se trae su propio `sobre-primario`). Están medidos
los 217 pares que se pueden formar y todos pasan 4.5:1; el más ajustado da
4.54. Por eso no hace falta deshabilitar opciones ni mostrarle carteles de
error a un chico de siete años.

Si se agrega un color nuevo hay que volver a correr esa medición, porque un
tono que anda bien con seis fondos puede no andar con el séptimo. Así
aparecieron dos que fallaban: el gris de Océano y el de Menta sobre el fondo
Uva daban 4.36 y 4.38, combinaciones que con paletas enteras no existían.

Arriba de todo quedan las **combinaciones armadas** (Aula, Recreo,
Mandarina), que ponen los cuatro colores de un saque. No se compran: son un
atajo para el que no tiene ganas de elegir de a uno, y sólo aparecen si ya
tiene los cuatro colores de esa familia.

## La paleta de casa

La paleta base es azul (#2563eb) + amarillo (#f59e0b) + rosa (#ec4899), con la
portada en azul pleno (#1d4ed8) sobre un fondo casi blanco. Sale de una
paleta de referencia para apps de aprendizaje infantil, y está elegida para que
el texto llegue a 4.5:1 de contraste en todos lados.

Además de esa, hay otras dos paletas gratis que se eligen en
**Personalización**: Recreo (rosa y violeta) y Mandarina (naranja y azul). Las
tres están armadas con el mismo criterio de contraste, así que cambiar de una a
otra no rompe la legibilidad en ninguna pantalla. Las siete paletas (las tres
gratis y las cuatro de la tienda) se midieron una por una: el par más ajustado
da 4.54:1.

Donde va texto blanco encima de un color fuerte se usan las variantes oscuras
(`--exito-osc`, `--error-osc`, `--rosa-osc`): en el tono vivo el blanco queda
por debajo del mínimo legible. Los tonos vivos se usan para rellenos —el país
correcto en el mapa, el borde de una tarjeta— donde no llevan texto encima.

## La mensualidad

**Prueba gratis y después suscripción mensual de Google Play.** Todo el código
está en `js/nucleo/suscripcion.js`; la pantalla es `#/plan` («Tu plan», en
Configuración).

### Cómo funciona

- Los primeros **7 días** está todo abierto, sin tarjeta.
- Terminada la prueba, los chicos pueden seguir mirando la app, pero para
  **empezar** un juego, una lección, un repaso o un examen hace falta la
  suscripción. Lo que ya hicieron no se pierde nunca.
- Un grande toca «Suscribirme con Google Play». Antes se pide el **PIN del modo
  parental** (si no hay, se crea ahí): es una app para chicos y un chico no
  puede suscribirse solo. Google cobra, renueva cada mes y maneja las
  cancelaciones; la app nunca ve una tarjeta.
- Al abrir la app se le pregunta a Google si la suscripción sigue activa. Sin
  internet se confía en la última respuesta durante 35 días.
- La suscripción es **del aparato**, no de cada chico: cubre a todos los
  hermanos que jueguen en ese celular. No viaja en la copia de seguridad.
- En el inicio, un cartel avisa sólo en los **últimos 3 días** de prueba y
  cuando terminó. Antes no: un «te quedan 7 días» todos los días le habla de
  plata al chico, y la app es para él.

**Sólo se cobra adentro de la app de Google Play**, que es el único lugar
donde se puede pagar. En la página web (y en iPhone) todo sigue abierto: si
no, un chico quedaría bloqueado sin que el grande tenga cómo pagar. Hasta que
la app esté publicada en Google Play, nada cambia para nadie.

### Lo que se configura

Arriba de todo en `js/nucleo/suscripcion.js`, en `CONFIG`:

| Campo | Qué es |
|---|---|
| `producto` | El ID de la suscripción en Play Console (`bichito_mensual`) |
| `precioDeReferencia` | El precio que se muestra si no se puede leer el de Google. **El precio real lo pone Google** desde Play Console, y la app lo lee de ahí |
| `diasDePrueba` | Los días gratis (7) |
| `fichaDePlay` | El link a la ficha de Google Play, para el botón «Descargar» de la web |
| `soloEnLaAppDePlay` | `true`: en la web no se cobra. `false`: se cobra en todos lados |

### Para ponerla en marcha (lo hace el dueño de la app)

1. **Cuenta de desarrollador de Google Play** (pago único de USD 25).
2. **Empaquetar la app para Android** como TWA con Bubblewrap:
   `npx @bubblewrap/cli init --manifest https://sebastarre.github.io/aprender-jugando/manifest.json`.
   En `twa-manifest.json`, activar la facturación:
   `"features": { "playBilling": { "enabled": true } }`.
3. **Digital Asset Links.** Google tiene que comprobar que la página es tuya:
   un archivo `assetlinks.json` en `https://sebastarre.github.io/.well-known/`.
   Ojo: va en la raíz del dominio, no en `/aprender-jugando/`, así que hay que
   crear el repositorio `sebastarre.github.io` para alojarlo (o pasar la app a
   un dominio propio).
4. **Crear la suscripción** en Play Console → Monetizar → Suscripciones, con el
   ID `bichito_mensual`, período mensual y el precio. **Sin prueba gratis en
   Play**: la prueba ya la da la app, y con las dos se sumarían.
5. **La app es para chicos**: completar el programa «Diseñado para familias»
   de Google Play. El pago detrás del PIN parental ya cumple con que un chico no
   pueda comprar solo.
6. **Probar con cuentas de prueba** (Play Console → Configuración → Pruebas de
   licencia): compran sin que se cobre.

### Lo que falta y conviene saber

- **Sin servidor.** La app le pregunta a Google desde el celular. Alcanza para
  que funcione, pero quien sepa borrar los datos del navegador puede volver a
  empezar la prueba. Para cerrarlo hace falta un servidor que valide las
  compras con la API de Google Play.
- **El reconocimiento de la compra.** Google devuelve la plata de una
  suscripción que no se «reconoce» en 3 días. Con la facturación de Play
  activada en la TWA, la documentación de Chrome indica que se reconoce sola,
  pero **hay que confirmarlo con una compra de prueba** antes de publicar: si a
  los 3 días Google la reembolsa, hay que reconocerla desde un servidor.
- La compra y el precio de Google se probaron con una imitación de Google Play
  en el navegador (el recorrido completo: prueba vencida, freno, PIN, pago,
  cancelación y activación). Con Google Play de verdad todavía no se probó,
  porque la app no está publicada.

## Perfiles y modo parental

El botón de la esquina superior derecha abre un menú con tres opciones: **ver
mi perfil**, **configuración** y **personalización**. Está pensado para que se
le puedan ir sumando entradas sin rehacer nada.

En el **perfil** se ve cuántas partidas jugó, su precisión, las estrellas y cómo
va en cada materia.

En **configuración** están los ajustes generales: prender y apagar los sonidos,
cambiar el nombre y la edad (la edad decide qué juegos y lecciones aparecen), y
elegir quién juega. Pueden convivir varios chicos en el mismo dispositivo: cada
uno tiene su avatar y sus datos separados, y se cambia de uno a otro con un
toque.

En **personalización** están las paletas de colores: las tres gratis y las que
se compran con monedas.

Dentro de configuración está el **modo parental**, protegido con un PIN de 4 números
que se elige la primera vez que se entra. Es un panel para el grande:

- **De quién.** Con más de un chico en el aparato, arriba se elige de quién ver
  y ajustar. Al cerrar el panel vuelve a quedar elegido el que estaba jugando.

Es mucho para mirar, así que va en **cuatro pestañas**:

- **Resumen**
  - *Desde que empezó*: tiempo jugando, partidas, preguntas, porcentaje de
    aciertos, días jugados, la racha más larga, niveles del mapa, juegos
    terminados, estrellas, lecciones, nota promedio de los exámenes y juegos
    dominados.
  - *Actividad* de los últimos **7 o 30 días**: cuatro números y dos gráficos
    (respuestas bien y minutos jugando por día).
  - *Cuándo juega*: a la mañana, a la tarde o a la noche, y qué días.
  - *Para hacer juntos*: de las últimas lecciones que completó, la propuesta
    «contale a un grande» de su «¿por qué?».
- **Aprendizaje**
  - *Cómo va mejorando*: el porcentaje de respuestas bien de cada una de las
    últimas 8 semanas, con una frase que lo dice («pasó de 54% a 84%»).
  - *Por materia*: precisión, partidas, tiempo, niveles del mapa, lecciones y
    juegos dominados.
  - *Su memoria*: todo lo que contestó alguna vez, según qué tan firme lo tiene
    (aprendiendo, afianzando o ya lo sabe), sacado de las cajas del repaso
    espaciado, y cuánto le toca repasar hoy.
  - *Lo que le cuesta* y *lo que mejor le sale*, con su materia.
  - *Lecciones*: las 17, completada, para repasar o sin hacer.
- **Juegos**
  - *Juego por juego*, agrupado por materia: en qué nivel del mapa va, sus
    estrellas, partidas, porcentaje de aciertos, tiempo y cuándo jugó por
    última vez.
  - *Exámenes*, con la nota de cada uno, y las últimas partidas.
- **Límites**, de cada chico:
  - **Tiempo por día** (sin límite, 15, 30, 45 o 60 minutos). Cuenta el tiempo
    con la app a la vista y un juego o una lección en pantalla. No corta nada a
    la mitad: cumplido el tiempo, lo que no deja es *empezar* una partida, una
    lección, un repaso o un examen, y muestra «¡Por hoy alcanza!». Desde el
    panel se pueden dar 15 minutos más, sólo por ese día.
  - **Materias que ve.** Una materia oculta no aparece en Jugar, Aprender, el
    examen ni el repaso, y no se abre ni con el enlace. Tiene que quedar una.
  - **Monedas y tienda.** Apagadas, las monedas se siguen juntando pero no se
    ven en ningún lado y la tienda no se abre.
  - Cambiar el PIN y borrar el progreso (los límites no se borran: son del
    grande, no progreso).

Cada partida guarda cuánto duró (`segundos`, con un tope de media hora por si
quedó abierta), y de ahí sale el tiempo por juego y por materia.

El tiempo se guarda por día en el perfil (`tiempo`, los últimos 60 días) y los
límites en `control` (`js/nucleo/almacen.js`).

Todo se guarda en el navegador (`localStorage`), en el dispositivo: no viaja a
ningún servidor.

## Estructura

```
index.html                 Todas las pantallas (se muestran de a una)
manifest.json              Datos de la app instalable: nombre, ícono, colores
sw.js                      Service worker: guarda la app para usarla sin internet
                           (generado — ver herramientas/generar-sw.js)
css/estilos.css            Estilos
js/
  datos/paises.js          194 países: nombre, capital, continente, coordenadas
  datos/geografia.js       Contornos de los países para dibujar el mapa
  nucleo/util.js           Utilidades chicas (mezclar, crear elementos, etc.)
  nucleo/iconos.js         Los íconos de la app, dibujados en SVG
  nucleo/mascota.js        La mascota: qué animal y qué disfraz están puestos
  nucleo/almacen.js        Perfiles, récords, historial y errores en localStorage
  nucleo/foto.js           Achica y recorta la foto que el chico elige de la galería
  nucleo/sonido.js         Sonidos generados con Web Audio (sin archivos)
  nucleo/opciones.js       La botonera de respuestas (tarjetas para elegir)
  nucleo/motor.js          El motor de partidas, común a todas las materias
  nucleo/mezcla.js         Partidas con preguntas de varias materias mezcladas
  nucleo/pizarra.js        La pizarra de abajo de las respuestas, para hacer cuentas a mano
  nucleo/tablero.js        Lo común a los juegos de tarjetas: la botonera, el
                           sorteo, y banco() para armar un juego de una lista
  nucleo/pwa.js            Registra el service worker y el cartel de "Instalar"
  nucleo/arranque.js       La cortina del nombre al abrir la app
  mapa.js                  Motor del mapa: proyección, dibujo, zoom y clics
  juegos/geografia.js      Los tres juegos de geografía
  juegos/matematica.js     Los doce juegos de matemática
  juegos/lengua.js         Los diez juegos de lengua
  juegos/ciencias.js       Los diez juegos de ciencias
  juegos/ingles.js         Los diez juegos de inglés
  juegos/examen.js         Modo examen: mezcla juegos y pone la nota
  juegos/repaso.js         Modo repaso: rearma las preguntas que se fallaron
  aprender/contenido.js    El texto y los dibujos de las lecciones
  aprender/leccion.js      Visor de lecciones (los pasos, de a uno)
  tienda/catalogo.js       Los colores de cada ranura, disfraces, fondos y monigotes
  tienda/temas.js          Junta los colores puestos y los escribe en el CSS
  app.js                   Las dos secciones, las pantallas y la navegación
assets/banderas/           Una imagen por país (ar.png, br.png, ...)
herramientas/              Scripts para regenerar los datos (no hacen falta para jugar)
.claude/                   Servidor local opcional para desarrollo
```

La navegación usa el `#` de la dirección, así que el botón «atrás» del
navegador funciona:

No hay barra fija ni pestañas arriba: todo cuelga del menú de `#/`, y de cada
pantalla se vuelve con la flecha, que es lo único que quedó de la barra.

| Dirección | Qué muestra |
|---|---|
| `#/` | El menú de inicio: la portada y los cuatro destinos |
| `#/aprender` · `#/juegos` | Las dos secciones |
| `#/lecciones/matematica` | Las lecciones de una materia |
| `#/leccion/sumar-llevando` | Una lección |
| `#/materia/geografia` | Los juegos de una materia |
| `#/juego/geografia/paises` | Configurar la partida |
| `#/examen` · `#/nota` | Armar un examen y su nota |
| `#/perfil` · `#/tienda` · `#/parental` | Perfil, tienda y modo parental |

## Cómo se agrega un juego o una materia

Las rondas, los 3 intentos, el puntaje, los corazones, los mensajes y la
pantalla de resultados ya los maneja `js/nucleo/motor.js`. Un juego nuevo sólo
define **qué se pregunta** y **cómo se responde**:

```js
{
  id: 'mi-juego', nombre: '...', icono: '🎯', color: '#4c6ef5', suave: '#e8edff',
  texto: 'Una línea explicando de qué se trata.',
  opciones:   function ()    { return [ /* grupos de botones de configuración */ ]; },
  cantidades: function (sel) { return { lista: [5, 10, 20], total: null, unidad: '' }; },
  resumen:    function (sel) { return 'lo elegido, en una línea'; },
  jugar:      function (sel, ganchos) { Motor.jugar({ items, render, ... }); }
}
```

`js/juegos/matematica.js` tiene los ejemplos de juegos que generan sus
preguntas.

**Si las preguntas son una lista escrita a mano** (casi todo Lengua y
Ciencias), no hace falta escribir nada de eso: `Tablero.banco()` arma el juego
entero a partir de la lista.

```js
Tablero.banco({
  id: 'rimas', nombre: 'Rimas', icono: 'rimas', color: '#7c3aed', suave: '#ede9fe',
  texto: 'Palabras que suenan igual', edadMin: 5, edadMax: 7,
  items: [
    { id: 'gato', palabra: 'gato', r: 'pato', m: ['perro', 'luna', 'mesa'] },
    // r es la correcta; m son las malas (si no están, se usan las
    // correctas de las otras preguntas, o `categorias`)
  ],
  consigna: function (it) { return '¿Qué palabra rima con <b>' + it.palabra + '</b>?'; },
  forma: 'palabra'      // 'texto' (grande), 'palabra', 'frase' o 'emoji'
});
```

Y `Tablero.materia('lengua', JUEGOS)` arma el módulo de la materia con todo lo
que esperan el examen y el repaso. Las claves de las preguntas quedan como
`'rimas:gato'`: dicen solas de qué juego son, así el repaso sabe con qué
tablero rearmar cada una.

Cada juego tiene que tener `edadMin` y `edadMax`: entre qué edades se muestra.

**Para agregar una lección** (sección Aprender), copiá una de
`js/aprender/contenido.js` y sumala a `LECCIONES`:

```js
{
  id: 'mi-leccion', materia: 'matematica', titulo: '...', icono: '➕',
  edadMin: 6, minutos: 3, resumen: 'Una línea.',
  juego: 'matematica/cuentas',            // el juego para practicar al final
  pasos: [
    { titulo: '...', texto: 'Admite <b>negrita</b>.',
      visual: function () { return '<svg>...</svg>'; },   // opcional
      truco: 'El atajo para acordarse.',                  // opcional
      video: 'https://...' }                              // opcional (pide internet)
  ]
}
```

**Para una materia nueva:**

1. Creá `js/juegos/<materia>.js` con su lista de juegos y devolvé
   `Tablero.materia('<materia>', JUEGOS)` (mirá `js/juegos/ciencias.js`).
2. Sumá su `<script>` en `index.html` antes de `js/app.js`.
3. Agregala en `MATERIAS`, dentro de `js/app.js`, con su `modulo`.
4. Dibujale un ícono a cada juego en `js/nucleo/iconos.js`.

## Regenerar los datos (opcional)

Sólo si querés actualizar países, capitales o banderas. Hace falta Node 18+ e
internet:

```bash
node herramientas/generar-datos.js
```

```bash
node herramientas/bajar-banderas.js
```

Para rehacer los íconos de la app (usa Chrome o Edge en segundo plano):

```bash
node herramientas/generar-iconos.js
```

Para volver a bajar la tipografía (sólo hace falta si sale una versión nueva
de Baloo 2, o si se quiere sumar otro alfabeto):

```bash
node herramientas/bajar-fuente.js
```

Después de cualquiera de los cuatro, correr `node herramientas/generar-sw.js`.

## Créditos

- Contornos de los países: [Natural Earth](https://www.naturalearthdata.com/)
  (dominio público) vía `world-atlas`.
- Nombres, capitales y regiones: `world-countries`.
- Banderas: [flagcdn.com](https://flagcdn.com/).
