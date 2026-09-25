---
name: Bichito Curioso
description: Juegos y lecciones de primaria para chicos de 4 a 12, sobre papel blanco y con juguetes de color.
colors:
  tinta: "#27304A"
  tinta-suave: "#5B6478"
  papel: "#FFFFFF"
  borde: "#E3E8F0"
  escalon: "#CFD7E3"
  pista: "#C9D3E1"
  seleccion: "#DDEEFC"
  cielo: "#1E90E0"
  cielo-fuerte: "#1672B8"
  primario: "#1673C4"
  primario-osc: "#0F5796"
  coral: "#E5533D"
  girasol: "#FFC93C"
  oro: "#D99A00"
  crema: "#FFF1C7"
  verde: "#2E9E4F"
  lila: "#7B5AE0"
  fuego: "#FF7A1A"
  exito: "#16A34A"
  exito-osc: "#15803D"
  exito-suave: "#DCF5E4"
  error: "#EF4444"
  error-osc: "#B91C1C"
  error-suave: "#FDE3E3"
typography:
  display:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 10vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 5vw, 2.3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  section:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Baloo 2, Trebuchet MS, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "0.03em"
rounded:
  s: "16px"
  m: "22px"
  s-chicos: "20px"
  m-chicos: "26px"
  pastilla: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "24px"
  escalon: "4px"
  escalon-chicos: "5px"
components:
  boton-principal:
    backgroundColor: "{colors.primario}"
    textColor: "{colors.papel}"
    rounded: "{rounded.s}"
    padding: "12px 34px"
    height: "56px"
  boton-principal-apagado:
    backgroundColor: "{colors.borde}"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.s}"
  boton-secundario:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.s}"
    padding: "10px 24px"
    height: "50px"
  ficha:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.m}"
    padding: "16px 12px 14px"
  respuesta:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.s}"
    padding: "12px"
  respuesta-correcta:
    backgroundColor: "{colors.exito-suave}"
    textColor: "#14532D"
    rounded: "{rounded.s}"
  respuesta-errada:
    backgroundColor: "{colors.error-suave}"
    textColor: "#7F1D1D"
    rounded: "{rounded.s}"
  tarjeta-proximo-paso:
    backgroundColor: "{colors.cielo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.m}"
    padding: "20px 22px"
  pastilla-monedas:
    backgroundColor: "{colors.crema}"
    textColor: "#6B4A00"
    rounded: "{rounded.pastilla}"
    padding: "4px 18px"
---

# Design System: Bichito Curioso

## Overview

**Creative North Star: "Juguetes sobre papel blanco"**

La app es una hoja blanca con cosas de juguete apoyadas encima. El papel no tiene color ni textura: el color lo traen las cosas —el dibujo de cada materia, la tarjeta grande del inicio, el círculo de cada juego— y por eso se ve de lejos. La tinta es azul marino, la misma del trazo de los dibujos y de la mascota, y todo lo escrito es Baloo 2, redonda y gorda. Las dos varas son las del rubro, elegidas por el dueño: Pok Pok para los de 4 a 7 (calma, objetos dibujados, casi sin palabras) y Duolingo para los de 8 a 12 (botones con escalón, barras gordas, un próximo paso por pantalla).

Cada pantalla tiene una sola cosa que manda: en el inicio, «Seguí con…» y su botón; en un juego, la pregunta; en los resultados, las estrellas. Lo demás baja de tamaño y de color. La densidad cambia con la edad del que juega, no con el aparato: el registro de los chicos (4 a 7) agranda la letra base, redondea más y saca las bajadas; el de los grandes (8 a 12) muestra más datos con la misma forma.

Lo que no es: ni de bebés (nada de pasteles lavados en todo, ni letras con sombra de dibujito animado), ni de escuela aburrida (nada de formularios grises), ni ruidoso (nada se mueve solo salvo el arranque y el anillo del nivel que toca).

**Key Characteristics:**
- Papel blanco, tinta azul marino y cinco primarios planos de juguete, sin degradados.
- Dibujos propios de trazo marino grueso (js/nucleo/dibujos.js), sobre manchas de color con forma de témpera.
- Lo que se aprieta tiene un escalón abajo y se hunde; lo que no, es plano.
- Dos registros por edad sobre el mismo sistema: más grande y con menos texto de 4 a 7.
- Movimiento calmo: un solo momento de autor (el arranque) y respuesta a lo que hace el chico.

## Colors

Blanco y azul marino de base; el color vive en objetos chicos y saturados, y cada uno significa algo.

### Primary
- **Azul de botón** (primario): el botón de la acción principal de cada pantalla, lo elegido (con el celeste de selección) y el anillo de la tilde del jugador. Tiene su tono oscuro (primario-osc) para el escalón. Lo pisa la ranura «botones» de la tienda.
- **Cielo de portada** (cielo, con cielo-fuerte para el botón blanco de adentro): la tarjeta grande del inicio y los carteles de los grandes (el plan). Es el único bloque grande de color pleno de la app. Lo pisa la ranura «portada» de la tienda.

### Secondary
- **Los primarios de juguete** (coral, girasol, verde, lila, más el cielo): los de los dibujos, las materias y las puertas del inicio. Coral es Matemática y la puerta de Jugar; girasol, Lengua, las estrellas, las monedas y las metas; verde, Ciencias; lila, Inglés y la puerta de Aprender; cielo, Geografía. No los pisa ningún tema: una estrella es amarilla aunque el chico se compre todo en verde.
- **Oro y fuego**: el trazo de las estrellas y las monedas (oro) y la llama de la racha (fuego).
- **Los colores de los juegos**: cada juego trae un color propio, escrito en su módulo (js/juegos/*.js), con su versión suave. Pinta sólo lo de ese juego: su círculo en la lista, los niveles de su camino, su cartel y su recomendación. Es identidad del juego, no de la interfaz, igual que los colores que son la pregunta misma («¿de qué color es?», las figuras, el reloj). Todos dan 3:1 o más contra el blanco del dibujo que llevan encima.

### Tertiary
- **Acertar y errar** (exito / exito-osc / exito-suave y error / error-osc / error-suave): sólo para respuestas, sellos y avisos. Nunca los usa otra cosa, así que un color de reposo no se lee como una respuesta ya contestada.
- **Crema** (crema, con letra #6B4A00 o #5A3B00): la pista de un juego, los trucos de las lecciones, las monedas ganadas y el cartel de la meta. Es ayuda, no reto.

### Neutral
- **Tinta** (tinta): todo el texto y el trazo de los dibujos. 12:1 contra el papel.
- **Tinta suave** (tinta-suave): bajadas, datos y leyendas. 5,9:1 contra el papel.
- **Papel** (papel): el fondo de todo y el relleno de las fichas.
- **Borde, escalón y riel** (borde, escalon, pista): el filo de 2px de todo, el escalón de abajo de lo que se aprieta, y los rieles vacíos de las barras y los interruptores.
- **Celeste de selección** (seleccion): el relleno de lo elegido y el anillo de un campo con foco.

### Named Rules
**La Regla del Papel Limpio.** El fondo es blanco y liso. El color va en las cosas de adelante, nunca atrás: una tarjeta pálida flotando en una pileta de color se ve lavada por más saturado que esté el fondo.

**La Regla de los Colores con Dueño.** Verde y rojo son de acertar y errar; girasol es de las metas y los premios; cada primario de juguete es de su materia. Un color nuevo necesita un trabajo, no un lugar libre.

**La Regla del 4,5.** Todo texto chico mide 4,5:1 o más; el blanco sobre el cielo (3,4:1) sólo lleva letra de 1,2rem en negrita para arriba. Cualquier combinación de la tienda pasa, porque cada ranura sólo ofrece tonos que aguantan su papel.

## Typography

**Display Font:** Baloo 2 (con Trebuchet MS, Segoe UI y la del sistema de respaldo)
**Body Font:** Baloo 2
**Label/Mono Font:** Baloo 2 en versalitas para las bandas de los números

**Character:** Una sola familia, redonda y variable (400 a 800), embebida en la app para que se vea igual sin internet. Los títulos y los botones van a 800, que es como se escribe el cartel de un juego; el texto corrido, a 400.

### Hierarchy
- **Display** (800, clamp(2.3rem, 10vw, 3.2rem), 1): el nombre de la app en la cortina de arranque. Sólo ahí.
- **Headline** (800, clamp(1.7rem, 5vw, 2.3rem), 1.1): el título de cada pantalla y la frase del próximo paso (que llega a 2,7rem en pantalla ancha).
- **Section** (800, 1.25rem, 1.2): el título de una sección adentro de la pantalla («Para hoy», «Cómo vas en cada materia»), escrito como frase y del color del texto.
- **Title** (800, 1.15rem, 1.15): el nombre de una materia, un juego, una lección o una puerta (1,4rem).
- **Body** (400, 1.0625rem, 1.45): bajadas, explicaciones, el texto de una lección (máximo 62ch).
- **Label** (800, 0.8rem, 0.03em, mayúsculas): sólo la banda de los recuadros de números de los resultados y del perfil.

### Named Rules
**La Regla de la Letra que Crece.** El registro de los chicos sube la letra base de 16 a 17px y con ella todo lo que está en rem. No se escribe un tamaño aparte para cada cosa: se cambia la raíz.

**La Regla de los Números Parejos.** Todo número que cambia (cuentas, puntajes, progreso, monedas) va en cifras tabulares, para que no baile.

## Layout

Una sola columna, como la de un teléfono, también en la tableta y en la compu: 720px de ancho máximo (820px en las grillas de materias y en la tienda). El juego es la excepción y usa todo el ancho por el mapa. Márgenes de 16px a los costados más el espacio seguro del notch.

El ritmo va de a 4: 4, 8, 12, 16 y 24px. Entre fichas con escalón hay 14px verticales (con menos, el escalón de arriba toca la de abajo). Las secciones del inicio se separan por 24px y el título de sección deja 12px abajo.

Las materias van de a dos en el celular y de a tres en la tableta, con la última fila centrada (nunca un hueco a la izquierda). Los juegos y las lecciones de una materia van en filas anchas: dibujo a la izquierda, nombre y avance al medio, flechita a la derecha. En el juego, la flecha de volver, la barra de avance, los intentos y el sonido comparten una sola fila.

A partir de 640px la tarjeta del próximo paso crece (la frase a 2,7rem, la mascota a 258px) y los dibujos de las puertas también, para que la columna ancha no quede con charcos vacíos.

## Elevation & Depth

La app es plana salvo por una cosa: lo que se aprieta tiene un escalón abajo, una sombra sin difuminar corrida 4px (5px para los chicos) del tono escalón o del tono oscuro de su color. Al apretarlo, el botón baja lo mismo que mide el escalón y el escalón desaparece: se hunde hasta apoyarse. Es el lenguaje de Duolingo y el contrato de diseño lo eligió a propósito.

Lo que no se aprieta (la tarjeta del próximo paso, las cabeceras de color, la pregunta, los globos, los carteles de nivel) no lleva escalón: es plano y sólo tiene su filo de 2px o su color.

Lo único que flota es lo que interrumpe (el cartel de confirmar, el globo del tutorial, la hoja de un nivel): esos llevan una sombra difusa y corrida para abajo.

### Shadow Vocabulary
- **Escalón** (`box-shadow: 0 4px 0 #CFD7E3`): toda ficha, botón o fila blanca que se aprieta.
- **Escalón de color** (`box-shadow: 0 4px 0 <tono oscuro>`): los botones plenos (primario sobre primario-osc), los círculos de los juegos y los niveles del camino (6px).
- **Flotante** (`box-shadow: 0 18px 36px -14px rgba(39, 48, 74, .38)`): sólo lo que tapa la pantalla.

### Named Rules
**La Regla del Escalón.** Escalón = se aprieta. Si algo tiene escalón y no hace nada al tocarlo, está mal; si algo se toca y es plano, también.

## Shapes

Redondo pero macizo: 22px de radio en fichas y carteles (26px para los chicos), 16px en botones, respuestas y campos (20px para los chicos), pastillas enteras para los datos chicos (monedas, edades, estados). Los círculos son para las cosas que son una sola unidad: la carita del chico, el ícono de un juego, un nivel del camino.

Los dibujos de las materias y de las puertas se apoyan sobre una mancha con forma de témpera (radio 57% 43% 52% 48% / 47% 56% 44% 53%): redonda pero no de compás. Los globos de la mascota tienen su punta hecha con un cuadradito girado del mismo filo.

## Components

### Buttons
- **Shape:** rectángulo redondeado (16px; 20px para los chicos), 56px de alto el principal y 50px el secundario (62px el principal para los chicos).
- **Primary:** azul de botón con letra blanca a 800, 1,3rem, con su escalón en el azul oscuro. Uno solo por pantalla.
- **Hover / Focus:** en la compu se aclara un poco; al apretar se hunde. El foco de teclado es un anillo de 3px en tinta, a 3px de distancia (blanco sobre la tarjeta del cielo).
- **Secondary:** blanco, filo de 2px y escalón gris; al pasar el mouse el filo se oscurece.
- **Disabled:** gris de borde con letra tinta suave (4,8:1).
- **De texto:** subrayado en tinta suave, para lo que casi no se usa («Cerrar», «Usar otro mail»).

### Chips
- **Style:** pastillas enteras sin filo: crema con letra marrón para monedas y premios, verde suave para lo hecho, celeste para lo que toca repasar, gris borde para los datos. Llevan su dibujito adelante (reloj, tilde, repaso), nunca un emoji.
- **State:** «Para chicos de 7» es blanca con filo; cuando ya está listo, se prende en verde oscuro con letra blanca.

### Cards / Containers
- **Corner Style:** 22px (26px para los chicos).
- **Background:** papel blanco.
- **Shadow Strategy:** escalón si se aprieta, nada si no (ver Elevation & Depth).
- **Border:** 2px en el tono borde; al pasar el mouse toma el color de lo que abre.
- **Internal Padding:** 16px arriba, 12px a los costados y 14px abajo en las fichas; 12 a 16px en las filas.

### Inputs / Fields
- **Style:** 56px de alto, filo de 2px en el tono riel, fondo blanco, letra a 1,2rem.
- **Focus:** el filo pasa al azul de botón y aparece un anillo de 4px en celeste de selección.
- **Error / Disabled:** el error va abajo, en rojo oscuro y negrita, diciendo qué falta.

### Navigation
- **Style:** no hay barra de pestañas. El inicio es el fondo de todo: una barra con la carita del chico, sus cuentas (racha, estrellas y monedas, que es la única que se toca) y el candado de los grandes, a la derecha. Cada pantalla tiene su flecha de volver redonda, pegada arriba al scrollear.

### La tarjeta del próximo paso
El cielo pleno con la mascota parada a la derecha sobre un sol girasol, el dibujo de la materia a sus pies, y a la izquierda: un globito blanco con el saludo («¡Buenas tardes, Sebas!», lo dice la mascota), la frase grande («Seguí con «Contar»», con el nivel para los grandes) y un botón blanco con el triángulo de empezar.

### El camino de niveles
Niveles redondos de 70px del color del juego con un escalón de 6px en su tono oscuro, unidos por un camino punteado; lo cerrado va en gris con candado; el que toca es más grande y tiene un anillo que respira despacio; arriba, la carita del chico. Los desafíos llevan filo girasol.

### Las respuestas
Fichas blancas iguales con la respuesta a 800. Al contestar se pintan: relleno suave, filo y escalón del color, y un sello dibujado en la esquina (tilde o cruz) para el que no distingue verde de rojo. Debajo, una banda del mismo color dice qué pasó, con su dibujito adelante (tilde, cruz, lamparita u ojo).

## Do's and Don'ts

### Do:
- **Do** poner el color en las cosas de adelante (dibujos, círculos, la tarjeta del cielo) y dejar el papel blanco.
- **Do** darle escalón (0 4px 0) a todo lo que se aprieta y hundirlo al apretarlo; nada más lo lleva.
- **Do** usar los dibujos de js/nucleo/dibujos.js (trazo marino de 3,2, rellenos planos) para lo grande, y los íconos de js/nucleo/iconos.js para lo chico.
- **Do** medir cada par de texto y fondo nuevo: 4,5:1 para la letra chica, 3:1 para la grande y los gráficos.
- **Do** mantener una sola cosa que mande por pantalla, con un solo botón azul.
- **Do** revisar las dos edades: con un perfil de 6 años y con uno de 10.

### Don't:
- **Don't** usar degradados, sombras de letra ni reflejos de caramelo: el mundo es plano.
- **Don't** poner emojis como íconos de la interfaz; los emojis quedan sólo donde son contenido (lo que se cuenta en un juego, los disfraces).
- **Don't** agregar animaciones que se repitan solas: nada respira, flota ni titila salvo el arranque y el anillo del nivel que toca.
- **Don't** usar verde o rojo para algo que no sea acertar o errar.
- **Don't** poner una etiqueta chiquita arriba de un título: si hace falta un saludo, lo dice la mascota en un globito.
- **Don't** llenar la pantalla de fichas pastel iguales: las materias van blancas, con su dibujo sobre una mancha de su color.
