# Bichito Curioso

> Antes se llamaba **Aprender Jugando**. El nombre cambió en todo lo que se ve
> (la cortina de arranque, la bienvenida, el título y el nombre al instalarla),
> pero no en lo de adentro: el repositorio y la dirección siguen siendo
> `aprender-jugando`, y también las claves del `localStorage`, la marca de las
> copias (`app: 'aprender-jugando'`), el prefijo de la caché y el `id` del
> manifiesto. Cambiar cualquiera de esas cosas haría que el celular crea que es
> otra app, o que se pierdan el progreso y las copias viejas.

App para chicos con dos mitades que se apoyan una en la otra:

- **Aprender** — cursitos cortos que cuenta la mascota, con dibujos y cosas para tocar.
- **Jugar** — juegos para practicar eso mismo.

Cada lección termina ofreciendo el juego donde usar lo que se acaba de leer, y
cada juego tiene su lección al lado. Hay cinco materias con 49 juegos entre
todas: **Geografía** (6, de reconocer una montaña a las capitales del mundo en
un mapa interactivo), **Matemática** (12, de contar a fracciones), **Lengua**
(11, de la primera letra a las tildes), **Ciencias** (10, de los ruidos de los
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
| 5–8 | Armá la palabra | Un dibujo y la palabra en fichas mezcladas (sílabas, y letras en el último nivel) que se ponen en orden |
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
y un chico de cinco no tenía cómo contestarla. Entre los 49 juegos hay 158
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

## Jugar no es sólo elegir entre cuatro

Con cuatro botones y «¿cuál es?» se aprende a reconocer, y también se puede
adivinar. Cada juego pide ahora lo que su tema necesita:

- **Contar tocando.** En Contar cada dibujito es un botón: al tocarlo se marca
  con su número, suena un «pop» un poco más agudo cada vez y la voz dice el
  número. Con todos contados, los números se ponen verdes. Es contar con el
  dedo, que es como se aprende a contar; después se elige cuántos son.
- **Escribir la cuenta.** De 8 a 12, las preguntas de cuentas (sumas y restas,
  tablas, divisiones, dobles, problemas, qué número sigue, cuánto vale) se
  contestan una con opciones y la siguiente con un teclado de números, porque
  con opciones se puede adivinar o descartar. En los desafíos y en el examen
  se escriben todas. Anda también con el teclado de la compu, y la pizarra
  aparece abajo para hacer la cuenta a mano. De 4 a 7 siempre hay opciones
  (`Tablero.teclado`).
- **Armar la palabra.** En «Armá la palabra» la palabra viene en fichas
  mezcladas y se arma tocándolas en orden. Si sale mal, lo que estaba en su
  lugar queda fijo, en verde, y vuelve sólo lo otro: se sigue desde lo que ya
  salió, en vez de empezar de cero (`js/nucleo/fichas.js`).
- **Aplaudir las sílabas.** En Sílabas hay un botón «¡Plas!» para aplaudir cada
  golpe de voz, con un puntito por palmada, antes de contestar cuántas son.
- **Escuchar en inglés.** En los juegos de palabras de inglés aparece también
  la pregunta al revés: se escucha la palabra y se toca el dibujo («¿Dónde
  está *apple*?»). Primero se entiende lo que se oye, como con el idioma
  propio. De 4 a 7 es una sí y una no; de 8 a 12, una de cada tres.
- **La voz, para los que todavía no leen.** De 4 a 7 cada pregunta se lee
  sola, y si las respuestas son palabras se lee cada una mientras su botón se
  ilumina, para saber cuál es cuál. Tocar una respuesta corta la voz. De 8 a
  12 no se lee sola: el parlantito de al lado de la pregunta la lee cuando se
  lo toca (`js/nucleo/lector.js`).
- **Conocer lo nuevo antes.** La primera vez que se juega un nivel, antes de
  preguntar, la mascota presenta lo que trae: cada cosa nueva en una tarjeta,
  con su dibujo, su nombre y un dato, leída en voz alta. Antes, un chico que
  nunca había oído *yellow* tenía que adivinar cuál era entre cuatro. Se puede
  saltar, y en un nivel ya pasado no aparece (`js/nucleo/presentacion.js`).
- **La racha.** Desde la segunda bien seguida al primer intento aparece un
  fueguito con la cuenta al lado de la barra; el sonido del acierto sube un
  poquito con cada una, y a las 3, 5, 10… hay un festejo y la barra se pone
  naranja. Un error la corta, sin castigo. Al final del nivel se ve la mejor
  de la partida («8 seguidas a la primera»). Es la sensación de ir embalado,
  que es lo que hace querer seguir.

## Preguntas que no se repiten

Antes, un nivel con pocas cosas estiraba la partida repitiéndolas: contar hasta
3 eran ocho preguntas, y «¿cuántos hay?» con los mismos tres pollitos salía
tres veces, a veces seguidas. Ahora (`js/nucleo/tablero.js`):

- **Nunca la misma pregunta dos veces seguidas**, y cada una sale dos veces
  como mucho por partida. Si ni así alcanza, la partida es más corta: el primer
  nivel de un juego puede tener cuatro preguntas (`Tablero.sortear`,
  `Tablero.espaciar`).
- **Si se repite, se ve distinta:** el mismo número con otra cosa para contar,
  la misma figura de otro color, la misma fracción en torta y en barra.
- **La misma respuesta tampoco sale seguida**, si se puede. Los niveles de los
  juegos de categorías se arman intercalándolas (antes el primer nivel de
  «¿Qué come?» eran dos herbívoros: cuatro preguntas y siempre el mismo botón)
  y se completan con lo de antes, parejo entre las respuestas.
- **Las cuentas que se inventan** (sumas, series, dobles, «el más grande») no
  se repiten en una partida, y el mismo resultado sale dos veces como mucho
  (`Tablero.variadas`). «El más grande» hasta 10 ya no es casi siempre el 10:
  primero se elige la respuesta y después los otros números.
- **Otra manera de preguntar lo mismo.** En los juegos de lista con dibujos
  (los lugares, dónde se ve, dónde vive, qué come, clases de animales, la
  primera letra) una pregunta de cada dos (de 4 a 7) o de cada tres (de 8 a
  12) va al revés: en vez de «¿Qué es la vaca?» con las categorías abajo,
  «¿Cuál come plantas?» con los dibujos abajo. Así los niveles cortos se
  practican más sin repetir, y el que todavía no lee contesta mirando. Nunca
  quedan dos respuestas buenas: en «¿Cuál come carne?» no sale el oso (es
  omnívoro y también come carne), y el río no sale junto al puente, que tiene
  agua abajo (`def.alReves` en `Tablero.banco`).
- **Cuando las respuestas son categorías fijas** (herbívoro, carnívoro y
  omnívoro; sustantivo, adjetivo y verbo; en la ciudad, en el campo y en el
  mar), los botones van siempre en el mismo orden, y las letras por abecedario:
  el chico las encuentra donde las dejó (`def.categorias` y `def.orden` en
  `Tablero.banco`).

Se revisó generando más de 19.000 partidas de todos los juegos y niveles:
ninguna pregunta salió dos veces seguidas ni tres veces en la misma partida, y
la misma respuesta tres veces seguidas quedó en casos contados (un nivel de
«am, is, are» que es casi todo «is»).

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

**Qué voz.** Antes se usaba la primera voz en castellano del aparato, y en
Windows la primera suele ser «Raúl», un varón robótico que sonaba tétrico.
Ahora cada voz recibe un puntaje y gana la más alta: pesa más que sea
**natural** (las «Natural», «Online», Google, Siri, «Mejorada»), después que sea
**de mujer** (se reconoce por el nombre: Elena, Dalia, Sabina, Paulina, Mónica…;
un varón conocido resta) y por último el **acento** (Argentina primero, España
al final). En Edge gana «Elena», natural y argentina; en Chrome, la de Google;
en un Windows pelado, «Sabina». En inglés pasa lo mismo: Zira en vez de Mark.

Las naturales casi siempre necesitan internet. Sin conexión se saltean, y si
una falla a mitad de una frase queda anotada como rota y se repite todo con la
siguiente. A las naturales no se les sube el tono (desafinan); a las robóticas
un poquito, para que suenen menos serias.

En Configuración, debajo del interruptor, está la lista de voces del aparato
para **elegir otra**: tocar una la elige y dice una frase de prueba. «Automática»
deja que la app elija sola. Lo elegido es del aparato, como el sonido.

La voz depende de lo que traiga cada teléfono. Para que suene igual de bien en
todos habría que grabar las lecciones con una voz generada y guardarlas como
audio (el texto de las lecciones es fijo, así que se puede); las preguntas de
los juegos se arman al azar y seguirían con la voz del aparato.

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

**Aprender tocando.** Leer no es aprender, y menos a los cuatro años. Un paso
puede traer, en vez de un dibujo quieto, algo para tocar (campo `interactivo`
del paso; las actividades están en `js/aprender/actividades.js`):

| Actividad | Qué se hace | Por ejemplo en |
|---|---|---|
| Escuchar | Tarjetas que se tocan y dicen su nombre | Las vocales, los ruidos de los animales, los colores en inglés |
| Contar | Tocar cada cosa para contarla | Contar de a uno |
| Juntar | Dos montoncitos que se juntan con un botón: 2 + 3 | Sumar es juntar |
| Sacar | Un montoncito del que se van algunas: 5 − 2 | Restar es sacar |
| El reloj | Botones que mueven las agujas y dicen la hora | Leer el reloj |
| Filas y columnas | Puntitos con «Filas − 3 +» y «Columnas − 4 +», y la cuenta al lado | Qué es multiplicar |
| Sílabas | Palabras que se escuchan de a golpes, iluminando cada sílaba | Qué es una sílaba, Armar palabras |
| La torta | Porciones que se pintan tocándolas: 3/4, «es la mitad» | Las fracciones |
| Ordenar | Tocar una cosa y después el grupo donde va; si no va ahí, dice por qué | Qué es un ser vivo, La ciudad, el campo y el mar, am/is/are |
| Tocar la que es | Una fila de palabras, letras o sílabas y hay que tocar la que se pide, en varias rondas | Las vocales, Clases de palabras, Dónde va la tilde |
| Repartir | Una para cada plato, por turno, hasta que no queda ninguna: 6 ÷ 2 | Dividir es repartir |
| Los bloques | Barras de diez y cubitos: diez cubitos se cambian por una barra (la que «te llevás») y una barra se desarma para prestar | Sumar llevándose una, Restar pidiendo prestado |
| El agua | Enfriar y calentar la misma agua: hielo, agua y vapor, con el termómetro y el nombre de cada cambio | Sólido, líquido y gaseoso |
| El mapa | Un mapa quieto para tocar: los continentes, los países de alrededor según el rumbo, la capital de cada país | Qué es un continente, Cómo se lee un mapa, Qué es una capital |

Nada de esto se corrige: es para probar. Lo que se corrige es la práctica
**pregunta de práctica** del final de algunos pasos: una pregunta sobre lo que se acaba de
ver, que hay que contestar bien para seguir. Si sale mal dice por qué y se
prueba de nuevo; al segundo error muestra cuál era, para no trabarse. Campo
`practica` del paso: `{ pregunta, opciones, correcta, explicacion, pista }`.

**La mascota cuenta la lección.** Cada paso lo dice la mascota desde un
globito, con una o dos frases cortas, como le hablaría un grande a un chico
(la voz las lee), y abajo va lo que se mira o se toca. Antes cada paso tenía un
título arriba y un párrafo de manual; los títulos, además, delataban la
respuesta de la pregunta que venía abajo. La mascota cambia de cara según lo
que pasa: saluda al empezar, piensa cuando pregunta, festeja cuando se acierta
y da ánimo cuando no. Después de una predicción primero reacciona a lo que
contestó el chico y recién después sigue contando. Arriba, una barra que se
llena como la de los juegos dice cuánto falta.

**Lo que aprendió.** Antes del ejercicio, la lección cierra con «¡Aprendiste
algo nuevo!» y dos o tres frases con lo importante (campo `aprendiste` de la
lección). Es lo que un grande le preguntaría, y repasarlo al final ayuda a que
quede.

Cómo se escribe una lección nueva está al principio de
`js/aprender/contenido.js`: arrancar con algo para mirar o tocar y no con una
definición, frases de veinte palabras o menos, y pistas que enseñan y animan.

**Lecciones para los más chicos.** Había 17 lecciones y sólo dos eran para
menos de 6 años. Ahora son 37: de las 20 nuevas, 17 son de 4 a 7 (contar de a
uno, las figuras, sumar es juntar, restar es sacar, dónde hay más, las
vocales, palabras que riman, armar palabras, los contrarios, los ruidos de los
animales, los cinco sentidos, qué es un ser vivo, las partes de la planta, los
lugares de la Tierra, la ciudad, el campo y el mar, y los animales y las frutas
en inglés) y tres para los más grandes (dividir es repartir, las fracciones y
qué comen los animales). Son cortas, con poco texto y mucho para tocar. El «¿No sabés cómo se hace?» de cada juego lleva a la
lección de su edad: la de sumar juntando a los de 5, la de llevarse una a los
de 7.

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
un juego se entra al mapa, y no a una pantalla de opciones. Son **674 niveles**
en los 49 juegos, entre 10 y 20 por juego según cuánto hay para aprender.

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
(`Tablero.ganchos`) o en su banco (`Tablero.banco`). Sin pista, el cartel dice
algo amable y una invitación a probar otra vez (ver «Cuando se equivoca»).

## Cuando se equivoca

Equivocarse es parte de aprender, y la app lo trata así. Antes, un error era
una banda roja con una cruz: «No son 5. Te quedan 2 intentos». Arrancaba con
«No», contaba para atrás como una amenaza y, para el que todavía no lee, era
mudo. Ahora:

- **El botón elegido** se marca en rojo suave con su cruz y la mascota duda:
  con eso alcanza para saber que no era ésa.
- **El cartel no reta, anima.** Es crema, como las pistas, con una flecha de
  «otra vez» en lugar de la cruz. Siempre arranca con algo cálido («¡Buen
  intento!», «¡Uy, esa no era!», «¡No pasa nada!»; «¡Casi!» sólo cuando de
  verdad estuvo cerca), después lo que enseña el juego o una pista, y al final
  una invitación: «¡Probá otra vez!», «¡Vos podés!». Antes, si el juego traía
  su propio texto, el cartel arrancaba de una con él, y algunos sonaban a reto
  («¿Seguro que son 3?», «Mirá bien: se escribe distinto»). Nunca «mal» ni «te
  queda 1 intento»: los corazones ya lo muestran.
- **Los cuestionarios de Ciencias** (las plantas, el cuerpo por dentro, la
  materia, el sistema solar) traen en cada pregunta una pista para pensar
  («Pensá en la parte que está bajo tierra») y un dato que explica la
  respuesta («La raíz está bajo tierra y chupa el agua»). Antes, al errar sólo
  decían «¡Buen intento!». En Contar, el segundo error trae la regla de oro:
  «Tocá cada uno una sola vez. El último número que digas es cuántos hay».
- **Lo que eligió también enseña.** Cada juego dice qué es: «El gato hace
  «¡Miau!»», «Cat es el gato», «En el mar viven el delfín y el pulpo»,
  «Probá: 6 × 7 da 42, y buscamos 56». O hace una pregunta para pensar: «Un pez
  respira con branquias: ¿el delfín también?», «Pensá: ¿para qué sirve la
  nariz?».
- **Al acertar, además, repite lo aprendido:** «¡Genial! Son 5 pelotas»,
  «¡Muy bien! 6 × 7 = 42», «¡Eso es! La vaca come plantas», «¡Bravo! Cat es el
  gato». Escucharlo otra vez es lo que hace que quede. A los chicos se lo dice
  la voz, y el juego espera a que termine antes de pasar (`textoAcierto` de
  cada juego).
- **Al acertar se festeja de verdad**, cada vez distinto («¡Genial!»,
  «¡Bravo!», «¡Lo sabías!»…) y una de cada tres veces con su nombre («¡Muy
  bien, Sofi!»). Nunca la misma frase dos veces seguidas, y el festejo queda
  un poco más a la vista antes de pasar. Ya no dice «¡Correcto!», que suena a
  máquina de corregir.
- **Si le sale después de errar**, se festeja eso: «¡Eso! Probaste otra vez y
  lo lograste», «¡Lo lograste! Qué bueno que no te rendiste».
- **Al mostrar la que era**, primero tranquilidad y al final lo que ganó:
  «¡No pasa nada! Eran 3 pelotas. ¡Ahora ya lo sabés!». Si la explicación es
  larga queda más tiempo, y si la voz la está leyendo, se la espera antes de
  pasar.
- **De 4 a 7, la voz lo dice**, como lo diría un grande al lado.
- **Los finales tampoco retan:** «¡Buen intento!» en vez de «¡A practicar un
  poco más!» o «No alcanzó», «Para repasar» en vez de «Lo que erraste», y
  siempre con qué hacer ahora. La lista de repaso no repite una pregunta que
  se erró dos veces.

En las lecciones pasa lo mismo: «¡Uy, esa no era! Levantá 3 dedos, después 1
más, y contalos todos. ¡Probá otra vez!», y en la predicción, que se contesta
antes de saber, «¡Buena idea! Pero era…».

Los textos generales están en `js/nucleo/motor.js` (`BIEN`, `BIEN_CON_NOMBRE`,
`ANIMO`, `OTRA_VEZ`, `UNA_MAS`, `REVELAR`, `CONSUELO`) y los de cada juego en
su `textoFallo`. Las frases se eligen con `Util.otraDe`, que nunca repite la de
la vez anterior.

## Modo examen

Aparte de los juegos hay un **examen**, que no es otro juego sino la misma
máquina con otras reglas:

- **un solo intento** por pregunta,
- **no dice si estuvo bien** hasta que termina (tampoco se ve el puntaje ni
  los corazones: verlos subir sería saber que acertaste),
- al final da una **nota del 1 al 10**, el porcentaje y la lista de lo que
  erró con la respuesta correcta,
- de 8 a 12, **las cuentas se escriben** todas con el teclado de números: con
  opciones se puede adivinar, y en un examen eso no mide nada.

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

Con esas monedas se compran, en la **tienda** (las monedas de la barra del inicio,
o el botón en Personalización): colores sueltos para cada parte de la app,
disfraces para la mascota y fondos. **Todo es
cosmético a propósito**: no se compran pistas, ni intentos, ni juegos.

Los colores funcionan pisando variables de CSS, así que agregar uno es agregar
una entrada a `js/tienda/catalogo.js`. Lo único que un color no puede tocar es
`--exito` y `--error`: el verde de «acertaste» y el rojo de «erraste» tienen
que significar lo mismo siempre, se ponga lo que se ponga.

Cada una de las cuatro ranuras pisa su propio grupo de variables, y por eso
un solo color cambia varias cosas a la vez:

- **La portada** — `--barra`, más `--barra-fuerte` (el escalón de abajo),
  `--sobre-barra` (el texto que va encima) y `--marca-acento` (el sol de atrás
  de la mascota). Es la tarjeta del próximo paso del inicio. Se sigue
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

El sistema entero —colores, letra, formas, componentes y reglas— está escrito
en `DESIGN.md`. Lo corto:

**Juguetes sobre papel blanco.** El fondo es blanco y liso, la letra es azul
marino (#27304A) y el color lo ponen las cosas: el dibujo de cada materia, la
tarjeta grande del inicio, el círculo de cada juego. Son cinco primarios planos
de juguete —cielo, coral, girasol, verde y violeta—, sin degradados. Las varas
las eligió el dueño: **Pok Pok** para los de 4 a 7 (calma, objetos dibujados,
casi sin palabras) y **Duolingo** para los de 8 a 12 (botones con escalón,
barras gordas, un próximo paso por pantalla).

**Dos registros según la edad.** `pintarRegistro()` (js/app.js) le pone a
`<html>` la clase `registro-chico` (menos de 8 años, o todavía sin perfil) o
`registro-grande`. El de los chicos sube la letra base de 16 a 17px —y con ella
todo lo que está en rem—, redondea más, hace más hondo el escalón, agranda los
dibujos y saca las bajadas («5 materias», «12 juegos»). El de los grandes
muestra esos datos y el nivel en el próximo paso («Seguí con «Contar», nivel 2
de 15»). Va en `<html>` y no en `<body>` justamente por las medidas en rem.

**Lo que se aprieta tiene escalón.** Un borde de 4px abajo (5px para los
chicos), un tono más oscuro, que desaparece al apretar: el botón se hunde hasta
apoyarse. Lo que no se aprieta —la tarjeta del próximo paso, las cabeceras de
color, la pregunta, los globos— es plano. Así se sabe qué se toca sin probar.

**Los dibujos son propios**, en `js/nucleo/dibujos.js`: trazo marino grueso,
como la mascota, y rellenos planos, sin ids (se pueden repetir en la misma
pantalla). Hay uno por materia y uno por cada lugar grande: jugar, aprender, la
meta, el repaso, la tienda, los ajustes, el candado y las caritas de la
bienvenida. También los lugares cuyos emojis confundían, dibujados como
fotos en un recuadro: el río (🏞️ era un parque con un lago), la cueva (🕳️ era
un agujero), el puente (🌉 estaba de noche), el bosque (🌲 era un solo pino),
el campo (🌾 era una espiga, ahora con alambrado y molino) y el granero (🏚️
era una casa abandonada). `Dibujos.url` los da como imagen, para el repaso.
Se ponen con `data-dibujo="geografia"` o con
`Dibujos.poner(el, 'geografia')`, y `herramientas/dibujos.html` los muestra
todos juntos para revisarlos al agregar uno. **Los íconos chicos** siguen en
`js/nucleo/iconos.js` (grilla de 24, trazo redondeado, dos tonos). En la
interfaz no hay emoji: los que quedan son contenido (las cosas que se cuentan
en un juego, los disfraces de la tienda).

**La tipografía es Baloo 2**, redonda y gordita, y está **embebida** en
`assets/fuentes/` (32 KB, una sola fuente variable que cubre de 400 a 800).
No se pide a Google a propósito: la app tiene que verse igual sin internet.
Para actualizarla, `node herramientas/bajar-fuente.js`. Licencia OFL 1.1.

**Una columna de teléfono**, también en la tableta y en la compu: 720px de
ancho máximo (820 en las grillas de materias y en la tienda). El juego usa todo
el ancho por el mapa.

### El inicio: un solo próximo paso

Arriba, una barra como la de Duolingo: la carita del chico (lleva al perfil),
la racha, las estrellas, las monedas —la única cuenta que se toca: lleva a la
tienda— y el candado de los padres, a la derecha (en un celular angosto queda
el candado solo).

En el medio, lo que manda: la **tarjeta del próximo paso**, del color de la
portada que el chico eligió en la tienda. La mascota está parada al lado del
dibujo de la materia, con un sol atrás; el saludo lo dice ella en un globito
(«¡Buenas tardes, Sebas!»), y al lado va la frase grande y su botón. La frase
la arma `pasoDelInicio()`: el juego que venía jugando, en el nivel que le toca;
si ese camino ya lo terminó, el que se le recomienda después; si nunca jugó, el
más avanzado de su edad que todavía no terminó.

Abajo, **las dos puertas** (Jugar y Aprender), cada una con su dibujo sobre una
mancha de color; **Para hoy** (la meta, el repaso y la prueba gratis, que se
esconde entera si no hay ninguna de las tres); y chico lo que se usa menos: la
mascota y los ajustes.

### Los carteles grandes van del tono vivo con la letra oscura

Un cartel grande (el de una materia, el de un juego en el mapa) lleva texto
encima, y el texto pide 4,5:1. La forma vieja de conseguirlo era oscurecer el
color hasta que aguantara letra blanca — y oscurecer un naranja da marrón, así
que Lengua abría con un cartel color barro y Contar con uno color ladrillo.

Al revés funciona mejor: **el cartel va del tono más vivo y la letra va oscura
encima**. Las cinco materias tienen su par medido a mano (`alegre` y `tinta` en
`MATERIAS`, de 6,1:1 a 7,8:1). Los cincuenta y pico de juegos lo sacan solos
con `Util.cartel(color)`, que prueba tonos del más saturado al más lavado y
corta en el primero que llega a 4,6:1 contra su propia letra. El cartel es
plano y el dibujo va en un círculo blanco, para que no se pierda contra su
propio color.

### Las respuestas

Fichas blancas iguales, con la respuesta grande. Antes eran de cuatro colores
distintos y la pantalla de juego era la más ruidosa de la app; ahora lo único
de color es lo que pasó. Al contestar, la respuesta se pinta —relleno suave,
filo y escalón verde o rojo— y lleva un **sello dibujado** en la esquina
(tilde o cruz): el color solo no alcanza para un chico que no distingue verde
de rojo. Debajo, una banda del mismo color dice qué pasó, con su dibujito
adelante: tilde, cruz, una lamparita para la pista (crema, porque es ayuda y
no reto) y un ojo para el «era ésta».

### Papelitos al pasar un nivel

`js/nucleo/papelitos.js`. Veinticuatro papelitos de colores que caen, giran y
se van en poco más de dos segundos. Salen al **pasar un nivel** del mapa y al
sacar **las tres estrellas** de una partida suelta; con dos o menos no, porque
un festejo que sale siempre deja de querer decir algo.

Van en una capa fija que **no recibe toques**: se puede apretar «Siguiente
nivel» mientras todavía están cayendo. Con «reducir movimiento» puesto no se
dibuja ninguno.

### La mascota presenta las pantallas

«¿A qué querés jugar?» y «¿Qué querés aprender?» abren con la mascota diciendo
el título desde un **globo de historieta** (`.cartel-bichito`). Son el mismo
`h1` y la misma bajada, así que el lector de pantalla lee lo de siempre, pero
la pantalla empieza con un personaje y no con un encabezado. La mascota
también saluda en el inicio, festeja al final de una partida y aparece al
terminar una lección.

### Lo que se mueve

Poco y con sentido. La **cortina de arranque** —la mascota que aparece sobre
su sol y el nombre armándose letra por letra— es el único momento de autor.
Después, sólo lo que le responde al chico: el botón que se hunde, la respuesta
acertada que salta y la errada que tiembla, el corazón que se apaga, las
estrellas que salen al terminar, el nivel que se abre y el anillo que respira
en el nivel que toca. Nada titila, flota ni respira por su cuenta. Con
«reducir movimiento» puesto, todo queda quieto.

### Las pantallas de una materia

Arriba, una **cabecera del color de la materia** con su dibujo, cuántos juegos
tiene y un botón a sus lecciones. Abajo, **un juego por fila**: su círculo,
nombre, bajada y lo que lleva hecho («2/5 niveles», o «15 niveles · empezá por
el 1»), con una flechita que dice que se toca. Las lecciones van igual, con el
dibujo de la materia en el título y sus pastillas (minutos, leída, toca
repasarla) con su dibujito. El cartel de edad sólo aparece si todavía quedan
juegos de más grandes.

## La mascota

Un **gato o un perro**, lo elige el chico en Personalización y no se
compra: es de quién es la mascota. Aparece en la bienvenida, en la tarjeta
del inicio, en el globo de la pregunta (de 4 a 7), en las lecciones, en el
mapa y al terminar una partida.

Encima lleva siempre un **disfraz de otro animal**. Vienen tres gratis
(león, zorro y dinosaurio) y hay cuatro en la tienda: abeja (90), pingüino
(100), tiburón (120) y dragón (150).

**Está dibujada en código**, en SVG (`js/nucleo/mascota.js`), con el mismo
idioma que los dibujos de la app: trazo azul marino grueso y redondo y
rellenos planos de juguete. Proporciones de cachorro —la cabeza casi tan
grande como el cuerpo, ojos grandes y bajos, cachetes rosados—, que es lo
que hace tierno a un personaje, y en tamaño chico se sigue leyendo. El
animal tiene sus colores propios y no sigue la paleta que el chico arme: un
gato que a veces es verde deja de ser un personaje. Los disfraces traen los
suyos, que para eso son disfraces.

**Tiene gestos**, según lo que pasa:

| Gesto | Cómo es | Dónde |
|---|---|---|
| `normal` | Parada, sonriendo | El globo de la pregunta, el mapa, las vistas de la tienda |
| `hola` | Saluda con la mano | La bienvenida, el inicio, las lecciones |
| `festejo` | Los brazos arriba y los ojos felices | Al acertar, al pasar con dos o tres estrellas, al completar una lección |
| `piensa` | La mano en el mentón | El «¿por qué?» de las lecciones, la bienvenida |
| `animo` | El puño arriba: «¡vamos!» | Al errar, al terminar sin estrellas, al no aprobar un ejercicio |

Nunca pone cara triste: cuando algo no sale, da ánimo. En el juego, la del
globo cambia de cara un ratito con cada respuesta (`Motor`, `reaccionar`).

Se pide con `Mascota.crear(gesto, clase)`, se le cambia la cara con
`Mascota.gesto(caja, gesto)`, y en el HTML basta con
`<div data-mascota="hola"></div>`. `Mascota.svg(animal, disfraz, gesto)`
devuelve el dibujo suelto: lo usan el ícono (`herramientas/icono.html`) y la
cortina del arranque, que está escrita en `index.html` porque aparece antes
de que carguen los scripts.

Antes fueron ilustraciones: 14 imágenes WebP, una por combinación de animal
y disfraz, sin gestos. Quedan en la historia de git (hasta el commit
12ef46a), junto con la herramienta que las preparaba.

### Cómo se agrega un disfraz

En `js/nucleo/mascota.js`: los colores y el precio en `DISFRACES` (traje,
el ribete de la capucha un tono más oscuro, la panza y lo que haga falta),
y lo que lo distingue en las funciones de las partes: `adornosAtras` (lo que
asoma por arriba de la capucha: orejas, púas, antenas), `adornosAdelante`
(lo que va sobre la cara), `cola` y `alas`. Todo en el lienzo de 200 × 250,
sin ids, para que se pueda repetir en la misma pantalla. Para verlo junto a
los demás, `herramientas/dibujos.html`.

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

La de fábrica es la del rediseño (ver `DESIGN.md`): papel blanco, letra azul
marino (#27304A), botones azules (#1673C4) y la portada en cielo (#1E90E0) con
el sol girasol (#FFC93C) atrás de la mascota. Todos los pares de texto y fondo
llegan a 4,5:1; el blanco sobre el cielo da 3,4:1 y por eso en la portada sólo
va letra grande y gorda.

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
  - *Lecciones*: todas, completada, para repasar o sin hacer.
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

## La cuenta: entrar con el mail de un grande

`js/nucleo/cuenta.js`. Antes de todo, una sola vez por aparato, un grande
entra con **su mail**: le llega un **código de 6 números** y lo escribe en la
app. No hay contraseña. Es **una cuenta para toda la familia**: todos los
chicos del aparato van bajo ese mail. Los perfiles y el progreso **siguen
guardados en el teléfono**, como siempre; en el servidor queda sólo el mail.

La cuenta sirve para:

- **Recuperar el PIN de los padres.** «Olvidé el PIN» manda un código al mail
  de la cuenta; con el código bien escrito se borra el PIN y se elige uno
  nuevo. Antes ese botón borraba el PIN sin pedir nada, así que cualquier chico
  que lo tocara entraba al panel.
- **Aceptar los términos**: la pantalla del mail dice que al seguir se aceptan
  los términos y la política de privacidad, con los enlaces.

En el panel para padres, «La cuenta» muestra el mail y tiene **«Cerrar
sesión»** (los chicos quedan en el aparato; hay que volver a entrar) y **«Borrar
la cuenta»** (borra el mail del servidor y todos los datos del aparato; Google
Play exige que una app con cuentas lo permita desde adentro).

La sesión se guarda en su propia clave (`bichitoCurioso.sesion`), aparte de los
datos: nunca viaja en «Guardar una copia».

### Por ahora está apagada

**Hoy la cuenta está apagada** (`CONFIG.prendida: false` en
`js/nucleo/cuenta.js`): la app **no pide mail** y anda como antes. El proyecto
de Supabase ya existe y la dirección y la clave pública están cargadas, pero
falta el servicio de envío de mails: el que trae Supabase de fábrica sólo le
manda mails al dueño del proyecto, 2 por hora, y con un link en vez del código.
Para prenderla: los pasos 3 y 4 de abajo (plantillas y SMTP) y después
`prendida: true`.

Mientras esté apagada, «Olvidé el PIN» hace lo de antes: borra el PIN
preguntando nada más, porque sin servidor no hay a dónde mandar un código.

Con `prendida: false`, o sin la dirección o la clave, la app **no pide mail**.

Al prenderla hay que volver a poner en `privacidad.html` y `terminos.html` las
partes de la cuenta (que el mail del adulto se guarda en Supabase, para qué se
usa y cómo se borra). Se sacaron al apagarla y están en el historial de git:
`git show a5f543d -- privacidad.html terminos.html`. Y en la ficha de Play,
declarar el mail en «Seguridad de los datos». Es a propósito: publicar la pantalla
del mail sin el servidor dejaría a todo el mundo trabado sin poder recibir
ningún código.

### Cómo ponerla en marcha (lo hace el dueño de la app)

1. **Crear el proyecto** en [supabase.com](https://supabase.com) (gratis).
   Elegí la región **São Paulo** (la más cerca de Argentina).
2. **Authentication → Sign In / Providers → Email**: que esté prendido.
3. **Authentication → Emails → Templates**: en **«Magic Link»** y en
   **«Confirm signup»**, cambiar el texto para que mande el **código** y no un
   link. Por ejemplo:
   - Asunto: `Tu código de Bichito Curioso`
   - Cuerpo: `<h2>Tu código es {{ .Token }}</h2><p>Escribilo en la app. Vence en una hora.</p><p>Si no lo pediste, ignorá este mail.</p>`

   `{{ .Token }}` es el código de 6 números.
4. **Mails de verdad**: el envío que trae Supabase de fábrica sirve para
   probar, pero manda muy pocos mails por hora. Para lanzar hay que conectar
   un servicio de envío en **Authentication → Emails → SMTP Settings**; por
   ejemplo [Resend](https://resend.com), que tiene un plan gratis.
5. **SQL Editor**: pegar y correr `herramientas/supabase.sql`. Es la función
   del botón «Borrar la cuenta».
6. **Project Settings → API Keys**: copiar la **Project URL** y la clave
   **publishable** (`sb_publishable_…`) en `CONFIG` de `js/nucleo/cuenta.js`.
   Es pública a propósito; **nunca** pongas la «secret» ni la «service_role».
7. `node herramientas/generar-sw.js`, commit y push.

Para borrar la cuenta de alguien que ya no tiene la app (la política de
privacidad dice que se puede pedir por mail): Supabase → Authentication →
Users → buscar el mail → Delete user.

## La bienvenida: ¿quién está usando la app?

Lo primero que pregunta la app al armar un perfil es **quién está del otro
lado**: «Soy mamá, papá o un adulto», «Soy un nene» o «Soy una nena».

- **El chico** sigue como siempre: su nombre y su edad, todo de
  «vos». Ya dijo si es nene o nena en el primer paso. Son tres pasos.
- **El grande** arma el perfil del chico, y se le habla en tercera persona:
  «¿Cómo se llama?», «¿Cuántos años tiene Mora?». Tiene
  un paso más, «¿Es nene o nena?», que se puede no contestar («Prefiero no
  decirlo»). Son cuatro pasos.

Si es nene o nena se guarda en el perfil (`genero`) y sirve **sólo** para
escribirle «¡Estás listo!» o «¡Estás lista!» (la función `listo()` de
`js/app.js`). Sin respuesta queda «listo». Quién armó el perfil queda en los
ajustes del aparato (`quienUsa`), y decide qué tutorial se ofrece después
desde Configuración.

## El tutorial

`js/tutorial.js`. Al terminar de armar un perfil, la mascota pregunta
«¿Te muestro cómo funciona?», con «Sí, mostrame» o «Ahora no». Si dice que sí,
recorre el inicio cosa por cosa: la pantalla se oscurece, queda un agujero de
luz con un aro amarillo sobre lo que se explica, y al lado un globo con la
mascota, el texto, los puntitos de cuánto falta y los botones.

- **Se puede saltar en cualquier paso**: «Saltar» está siempre a la vista, y
  Escape hace lo mismo. Cambiar de pantalla también lo corta.
- **Se lee en voz alta** si la voz está prendida: los chicos de cuatro y cinco
  todavía no leen.
- **Dos recorridos**: el del chico (8 pasos, de vos: su perfil, jugar,
  aprender, la meta, la tienda, personalizar) y el del grande (8 pasos: además,
  Configuración, el panel para padres con el PIN y los hermanos).
- Los pasos cuyo lugar no está en pantalla se saltean solos.
- Se puede volver a ver desde **Configuración → «Ver cómo se usa la app»**.

Los textos de cada paso están en `pasosDelTutorial()` de `js/app.js`.

## La carita de cada chico y la puerta de los padres

**Ya no hay monigotes.** Antes cada chico elegía un emoji de animal al armar
su perfil (y se vendían más en la tienda). Ahora su carita es **su foto**, si
un grande le puso una, o **la inicial de su nombre** en su círculo de color:
la letra va en el tono oscuro del mismo color («la M de Mora» en bordó sobre
rosa). Es `ponerCarita()` de `js/app.js`, y se usa en «¿Quién juega?», en el
perfil, en los selectores de jugador y en el panel para padres. En el mapa de
niveles, sin foto, el que camina de nivel en nivel es la **mascota**.

Los que habían comprado monigotes con monedas no las pierden: al abrir la app,
`Almacen.devolverCompras('avatar:', …)` les devuelve lo que pagaron, una sola
vez.

**El modo parental tiene su puerta en el inicio**: un botón chico con candado,
«Padres», arriba a la derecha. Es donde las apps para chicos ponen el rincón de
los grandes (la izquierda es de la flecha de volver en las otras pantallas), y
va sin color para que la encuentre un grande que la busca sin llamarle la
atención a un chico. Adentro pide el PIN, como siempre. Sigue estando también
en Configuración. El tutorial de los grandes la señala.

## Borrar los datos

En el panel para padres (detrás del PIN), «Borrar datos» tiene **«Borrar a
este jugador»** (su perfil entero, con foto) y **«Borrar todos los datos de la
app»** (todos los chicos, ajustes y PIN: queda como recién instalada). Los dos
preguntan antes. Lo pide la política de privacidad: un adulto tiene que poder
borrar los datos del chico cuando quiera, y como todo vive en el aparato,
borrarlo ahí es borrarlo del todo.

## Lanzamiento

### Lo que ya está listo

- **Ícono nuevo** con la mascota (el globo terráqueo era del nombre viejo), en
  todos los tamaños y en la bienvenida y la pantalla de la mensualidad. Es la
  escena de la tarjeta del inicio: la mascota sobre el cielo plano de la
  portada, con el sol girasol asomado arriba a la derecha (sin degradados).
  Se dibuja en `herramientas/icono.html` y se regenera con
  `node herramientas/generar-iconos.js`, que también saca la tarjeta para
  compartir y los gráficos de Play. Los que ya lo tienen en Google Play hay
  que subirlos a mano en Play Console.
- **Política de privacidad** (`privacidad.html`) y **términos y suscripción**
  (`terminos.html`), enlazados desde el panel para padres y desde la pantalla
  de la mensualidad. Van guardados en el celular como el resto de la app.
- **Tarjeta para compartir el link** (`assets/compartir.png` y las etiquetas
  `og:` del `index.html`): lo que muestran WhatsApp y las redes.
- **Manifiesto**: idioma `es-AR`, descripción nueva y atajos a Jugar y
  Aprender (mantener apretado el ícono en Android).
- **Favicon** propio (era un emoji de globo).
- **Gráficos para la ficha de Play** en `herramientas/play/`: el ícono de
  512×512 cuadrado y el gráfico destacado de 1024×500.
- **Arreglo del service worker**: antes, cualquier página que se abría desde la
  app instalada devolvía la app, así que la política de privacidad no se
  podía leer.

### Lo que tenés que hacer vos

1. **Un correo de contacto.** Las páginas legales dicen que se escriba «al
   correo que figura en la ficha de Google Play». Hace falta ponerlo ahí (Play
   lo exige) y conviene escribirlo también en `privacidad.html` y
   `terminos.html`, para la gente que llega por la web.
2. **El dominio.** Para publicar en Play como app (TWA), Google verifica que la
   app y la página son del mismo dueño con un archivo
   `/.well-known/assetlinks.json` en la **raíz** del dominio. En
   `sebastarre.github.io/aprender-jugando/` la raíz no es de este proyecto.
   Dos salidas:
   - **un dominio propio** (lo recomendable, por ejemplo `bichitocurioso.com.ar`
     en nic.ar), configurado en GitHub Pages; o
   - crear el repositorio `sebastarre.github.io` con la carpeta `.well-known`
     y un archivo `.nojekyll` (sin él, GitHub Pages esconde las carpetas que
     empiezan con punto).

   Si cambia la dirección, hay que actualizar `og:url` y `og:image` en
   `index.html`. El `id` del manifiesto **no** hay que tocarlo.
3. **Empaquetar la app para Android** con Bubblewrap o PWABuilder, a partir de
   `manifest.json`. Ahí se genera la huella SHA-256 que va en `assetlinks.json`.
4. **Play Console**:
   - la ficha: nombre, descripciones, el ícono y el gráfico de
     `herramientas/play/`, y capturas de pantalla del celular;
   - **Público objetivo**: menores de 13, lo que activa la política de
     familias. La app no tiene publicidad, ni estadísticas, ni pide permisos;
   - **Seguridad de los datos**: mientras la cuenta con mail esté apagada,
     «no se recopilan datos» y «no se comparten datos», porque todo queda en
     el aparato. Si se prende, hay que declarar **la dirección de mail** del
     adulto, para **administrar la cuenta**;
   - el cuestionario de **clasificación del contenido**;
   - la URL de la **política de privacidad**: `…/privacidad.html`;
   - la **suscripción** `bichito_mensual`, con el precio de
     `CONFIG.precioDeReferencia` (`js/nucleo/suscripcion.js`).
5. **La cuenta con mail**: seguir «Cómo ponerla en marcha» de la sección «La
   cuenta». Sin eso la app no pide mail.
6. **Después de publicar**: poner el link de la ficha en
   `CONFIG.fichaDePlay` (`js/nucleo/suscripcion.js`), para que la web muestre
   «Descargar de Google Play».

### Recomendable, no obligatorio

- **Validar la suscripción en un servidor.** Hoy la app confía en lo que le
  dice Google en el aparato. Alcanza para arrancar, pero quien borre los datos
  puede volver a empezar la prueba gratis.
- **Grabar las lecciones con una voz generada**, para que suenen igual de
  naturales en todos los teléfonos (ver «Qué voz», más arriba).

## Estructura

```
index.html                 Todas las pantallas (se muestran de a una)
manifest.json              Datos de la app instalable: nombre, ícono, colores
privacidad.html            La política de privacidad (página suelta)
terminos.html              Los términos de uso y de la suscripción
sw.js                      Service worker: guarda la app para usarla sin internet
                           (generado — ver herramientas/generar-sw.js)
css/estilos.css            Estilos
PRODUCT.md                 Para quién es la app y qué la distingue (lo lee el diseño)
DESIGN.md                  El sistema de diseño: colores, letra, formas y reglas
js/
  datos/paises.js          194 países: nombre, capital, continente, coordenadas
  datos/geografia.js       Contornos de los países para dibujar el mapa
  nucleo/util.js           Utilidades chicas (mezclar, crear elementos, etc.)
  nucleo/iconos.js         Los íconos de la app, dibujados en SVG
  nucleo/dibujos.js        Los dibujos grandes: uno por materia y por lugar del inicio
  nucleo/mascota.js        La mascota dibujada: el gato o el perro, sus disfraces y sus gestos
  nucleo/almacen.js        Perfiles, récords, historial y errores en localStorage
  nucleo/foto.js           Achica y recorta la foto que el chico elige de la galería
  nucleo/sonido.js         Sonidos generados con Web Audio (sin archivos)
  nucleo/opciones.js       La botonera de respuestas (tarjetas para elegir)
  nucleo/motor.js          El motor de partidas, común a todas las materias
  nucleo/mezcla.js         Partidas con preguntas de varias materias mezcladas
  nucleo/pizarra.js        La pizarra de abajo de las respuestas, para hacer cuentas a mano
  nucleo/papelitos.js      Los papelitos de colores que caen al pasar un nivel
  nucleo/cuenta.js         La cuenta de la familia: entrar con mail y código (Supabase)
  nucleo/tablero.js        Lo común a los juegos de tarjetas: la botonera, el
                           sorteo, el teclado de números, y banco() para armar
                           un juego de una lista
  nucleo/fichas.js         Armar una palabra tocando fichas en orden
  nucleo/lector.js         La voz que lee las preguntas y las respuestas (4 a 7)
  nucleo/presentacion.js   «Conocé lo nuevo»: lo que trae un nivel, antes de jugarlo
  nucleo/pwa.js            Registra el service worker y el cartel de "Instalar"
  nucleo/arranque.js       La cortina del nombre al abrir la app
  mapa.js                  Motor del mapa: proyección, dibujo, zoom y clics
  juegos/geografia.js      Los seis juegos de geografía
  juegos/matematica.js     Los doce juegos de matemática
  juegos/lengua.js         Los once juegos de lengua
  juegos/ciencias.js       Los diez juegos de ciencias
  juegos/ingles.js         Los diez juegos de inglés
  juegos/examen.js         Modo examen: mezcla juegos y pone la nota
  juegos/repaso.js         Modo repaso: rearma las preguntas que se fallaron
  aprender/contenido.js    El texto y los dibujos de las lecciones
  aprender/leccion.js      Visor de lecciones (los pasos, de a uno)
  aprender/actividades.js  Lo que se toca en una lección: contar, juntar, el reloj…
  tienda/catalogo.js       Los colores de cada ranura, disfraces y fondos
  tienda/temas.js          Junta los colores puestos y los escribe en el CSS
  app.js                   Las dos secciones, las pantallas y la navegación
  tutorial.js              El recorrido guiado con la mascota (se puede saltar)
assets/banderas/           Una imagen por país (ar.png, br.png, ...)
herramientas/              Scripts para regenerar los datos (no hacen falta para jugar)
herramientas/dibujos.html  Muestrario de todos los dibujos, para revisarlos
.claude/                   Servidor local opcional para desarrollo
```

La navegación usa el `#` de la dirección, así que el botón «atrás» del
navegador funciona:

No hay barra fija ni pestañas arriba: todo cuelga del menú de `#/`, y de cada
pantalla se vuelve con la flecha, que es lo único que quedó de la barra.

| Dirección | Qué muestra |
|---|---|
| `#/` | El inicio: el próximo paso, las dos puertas y lo de hoy |
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
