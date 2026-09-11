# Aprender Jugando

App para chicos con dos mitades que se apoyan una en la otra:

- **Aprender** — cursitos cortos que explican algo con dibujos y ejemplos.
- **Jugar** — juegos para practicar eso mismo.

Cada lección termina ofreciendo el juego donde usar lo que se acaba de leer, y
cada juego tiene su lección al lado. Hay cuatro materias con 35 juegos entre
todas: **Geografía** (países, capitales y banderas sobre un mapa interactivo),
**Matemática** (12 juegos, de contar a fracciones), **Lengua** (10, de la
primera letra a las tildes) y **Ciencias** (10, de los ruidos de los animales
al sistema solar). Cada juego dice desde qué edad tiene sentido, y hay juegos
para cada edad de 4 a 12 años.

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
| 7–12 | Banderas | Muestra una bandera | Clic en el mapa, o eligiendo entre 4 banderas |
| 8–12 | Encontrá el país | «¿Dónde está Argentina?» | Clic en el país en el mapa |
| 10–12 | Capitales | «¿De qué país es capital Lima?» | Clic en el país en el mapa |

Zonas: todo el mundo, América, América del Sur, América del Norte (con Centro
y Caribe), Europa, África, Asia y Oceanía.

**Matemática**

| Edad | Juego | Consigna | Opciones de partida |
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

Los de Lengua y Ciencias son listas escritas a mano, y cada una está revisada
para que ninguna respuesta mala sea también correcta: ninguna «mala» rima,
ningún «mal escrito» es una palabra que existe (por eso no está «vaso»: *baso*
y *bazo* existen), ninguna variante de tilde es otra palabra (por eso no está
«dibujo»: *dibujó* existe), y si la respuesta es «en el polo» para el
pingüino, «en el mar» no sale como mala, porque también vive en el mar.

Varias preguntas tienen trampa a propósito, que son las que más enseñan: el
delfín es mamífero y el tiburón es pez, el pingüino es un ave aunque no vuele,
Venus es más caliente que Mercurio aunque esté más lejos del Sol.

En los dos casos se elige también cuántas preguntas tiene la partida.

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

**Cada materia tiene su nivel.** Arranca en la edad del chico, y juntando
**100 puntos** jugando esa materia se abren los juegos de la edad siguiente
(una partida de 10 preguntas da hasta 30). Es por materia: un chico de 7 que
vuela en matemática puede tener abiertos los juegos de 9 ahí y seguir en los
de 7 en lengua. En cada materia se ve:

- los juegos abiertos, salvo los que ya le quedan chicos;
- los de la edad siguiente, con candado y cuántos puntos faltan;
- arriba de todo, un cartel con una barra que dice cuánto le falta.

Al terminar una partida se muestra cuántos puntos sumó y cuánto le falta; y si
abrió una edad nueva, un cartel lo anuncia con los juegos que se abrieron.

Si una materia no tiene ningún juego para su edad (Geografía empieza a los 7),
no hay puntos que juntar: se abre sola cuando cumpla la edad. Los puntos del
examen y del repaso no suman al nivel, porque mezclan materias.

Lo que se abrió jugando no se pierde si después se le cambia la edad al
perfil. Los puntos que hacen falta están en `PUNTOS_PARA_ABRIR`, en
`js/app.js`; las edades, en cada juego (`js/juegos/*.js`) y en cada lección
(`js/aprender/contenido.js`).

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

Además hay una tarjeta **Repasar lo que fallaste** arriba de todo en Jugar,
que arma una partida sólo con eso. Aparece recién con 5 errores juntados
(con menos quedaría una partida de dos preguntas). Reglas normales: tres
intentos y te dice en el momento si acertaste, porque esto es para aprender.

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
que se elige la primera vez que se entra. Muestra en qué está flojo (lo que más
falla, ordenado por cantidad de veces) y las últimas partidas con fecha y
resultado. También permite borrar el progreso de un jugador.

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
  nucleo/sonido.js         Sonidos generados con Web Audio (sin archivos)
  nucleo/opciones.js       La botonera de respuestas (tarjetas para elegir)
  nucleo/motor.js          El motor de partidas, común a todas las materias
  nucleo/mezcla.js         Partidas con preguntas de varias materias mezcladas
  nucleo/tablero.js        Lo común a los juegos de tarjetas: la botonera, el
                           sorteo, y banco() para armar un juego de una lista
  nucleo/pwa.js            Registra el service worker y el cartel de "Instalar"
  nucleo/arranque.js       La cortina del nombre al abrir la app
  mapa.js                  Motor del mapa: proyección, dibujo, zoom y clics
  juegos/geografia.js      Los tres juegos de geografía
  juegos/matematica.js     Los doce juegos de matemática
  juegos/lengua.js         Los diez juegos de lengua
  juegos/ciencias.js       Los diez juegos de ciencias
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
