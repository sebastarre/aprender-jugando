# Aprender Jugando

App para chicos con dos mitades que se apoyan una en la otra:

- **Aprender** — cursitos cortos que explican algo con dibujos y ejemplos.
- **Jugar** — juegos para practicar eso mismo.

Cada lección termina ofreciendo el juego donde usar lo que se acaba de leer, y
cada juego tiene su lección al lado. Hoy hay **Geografía** (países, capitales y
banderas sobre un mapa interactivo) y **Matemática** (tablas, cuentas y la
hora), y está preparada para ir sumando materias.

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
1 MB de la app en el teléfono.

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

| Juego | Consigna | Cómo se responde |
|---|---|---|
| Encontrá el país | «¿Dónde está Argentina?» | Clic en el país en el mapa |
| Capitales | «¿De qué país es capital Lima?» | Clic en el país en el mapa |
| Banderas | Muestra una bandera | Clic en el mapa, o eligiendo entre 4 banderas |

Zonas: todo el mundo, América, América del Sur, América del Norte (con Centro
y Caribe), Europa, África, Asia y Oceanía.

**Matemática**

| Juego | Consigna | Opciones de partida |
|---|---|---|
| Tablas de multiplicar | «¿Cuánto es 7 × 8?» | Una tabla del 2 al 12, o mezcladas |
| Sumas y restas | «¿Cuánto es 34 − 17?» | Cuatro niveles; sumas, restas o mezcladas |
| La hora | Dibuja un reloj de agujas | En punto, y media, y cuarto, o de 5 en 5 |

Las preguntas de matemática se generan en cada partida, así que nunca sale dos
veces la misma ronda. Las tres respuestas incorrectas no son al azar: son los
errores típicos (correrse una fila de la tabla, cambiar la suma por la resta,
leer la aguja equivocada), para que acertar signifique algo.

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
cuenta: queda todo en el dispositivo). Con la edad decide qué mostrar:

- Los juegos y lecciones **de su edad** aparecen listos para usar.
- Los de hasta dos años más adelante se ven, pero con un candado que dice
  desde qué edad se abren. Sirve para que vea que hay más cosas esperándolo.
- Algunos juegos difíciles piden además **haber practicado el más fácil**: por
  ejemplo, las tablas de multiplicar se abren al juntar 3 ⭐ en sumas y restas.
  Cuando una partida destraba un juego, se avisa en la pantalla de resultados.

Las edades y los requisitos están declarados en cada juego (`edadMin` y
`requiere`, en `js/juegos/*.js`) y en cada lección (`edadMin`, en
`js/aprender/contenido.js`). Cambiarlos es cambiar un número.

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

## Monedas y tienda

Cada respuesta correcta da monedas, pero **rinde menos repetir lo que ya
sabés**: la primera vez que acertás algo paga 5 🪙, la segunda 3, después 2, y
de ahí en adelante 1. La idea es que aprender un país nuevo valga más que
volver a acertar el mismo cien veces. El piso es 1 y no 0 para que volver a tu
juego preferido siga dando algo.

Hay un tope de **30 🪙 por partida**. Sin tope quedaba desparejo: geografía
tiene 194 países (se agotan y decaen), pero las cuentas de nivel experto casi
nunca se repiten y pagarían 5 siempre.

Con esas monedas se compran, en la **tienda** (el chip de arriba a la derecha,
o el botón en el perfil): temas de color que cambian toda la app, fondos y
monigotes extra para el perfil. **Todo es cosmético a propósito**: no se
compran pistas, ni intentos, ni juegos.

Los temas funcionan pisando variables de CSS, así que agregar uno es agregar
una entrada a `js/tienda/catalogo.js`. Lo único que un tema no puede tocar es
`--exito` y `--error`: el verde de «acertaste» y el rojo de «erraste» son
iguales en todos los temas.

## Perfiles y modo parental

El botón de la esquina superior derecha abre el perfil. Ahí se ve cuántas
partidas jugó, su precisión, las estrellas y cómo va en cada materia. Pueden
convivir varios chicos en el mismo dispositivo: cada uno tiene su avatar y sus
datos separados, y se cambia de uno a otro con un toque.

Dentro del perfil está el **modo parental**, protegido con un PIN de 4 números
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
  nucleo/almacen.js        Perfiles, récords, historial y errores en localStorage
  nucleo/sonido.js         Sonidos generados con Web Audio (sin archivos)
  nucleo/opciones.js       La botonera de respuestas (tarjetas para elegir)
  nucleo/motor.js          El motor de partidas, común a todas las materias
  nucleo/pwa.js            Registra el service worker y el cartel de "Instalar"
  mapa.js                  Motor del mapa: proyección, dibujo, zoom y clics
  juegos/geografia.js      Los tres juegos de geografía
  juegos/matematica.js     Los tres juegos de matemática
  juegos/examen.js         Modo examen: mezcla juegos y pone la nota
  aprender/contenido.js    El texto y los dibujos de las lecciones
  aprender/leccion.js      Visor de lecciones (los pasos, de a uno)
  tienda/catalogo.js       Qué se puede comprar: temas, fondos y monigotes
  tienda/temas.js          Aplica el tema y el fondo equipados
  app.js                   Las dos secciones, las pantallas y la navegación
assets/banderas/           Una imagen por país (ar.png, br.png, ...)
herramientas/              Scripts para regenerar los datos (no hacen falta para jugar)
.claude/                   Servidor local opcional para desarrollo
```

La navegación usa el `#` de la dirección, así que el botón «atrás» del
navegador funciona:

| Dirección | Qué muestra |
|---|---|
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

`js/juegos/matematica.js` es el ejemplo más corto para copiar.

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

1. Creá `js/juegos/<materia>.js` con una lista `JUEGOS` como la de arriba, más
   `claveItem(item)` (con qué nombre se guardan sus errores), `repaso(item)`
   (cómo se muestra en la lista de repaso) y `limpiar()`.
2. Sumá su `<script>` en `index.html` antes de `js/app.js`.
3. Agregala en `MATERIAS`, dentro de `js/app.js`, con su `modulo`.

Lengua y Ciencias ya figuran ahí con el cartel «Pronto»: alcanza con darles un
módulo para que se activen solas.

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

Después de cualquiera de los tres, correr `node herramientas/generar-sw.js`.

## Créditos

- Contornos de los países: [Natural Earth](https://www.naturalearthdata.com/)
  (dominio público) vía `world-atlas`.
- Nombres, capitales y regiones: `world-countries`.
- Banderas: [flagcdn.com](https://flagcdn.com/).
