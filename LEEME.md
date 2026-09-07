# Aprender Jugando

Página de juegos didácticos para chicos. Arranca con **Geografía** (países,
capitales y banderas sobre un mapa interactivo) y está preparada para ir
sumando otras materias.

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
0,86 MB de la app en el teléfono.

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

Los tres juegos de geografía funcionan igual: aparece una consigna y hay
**3 intentos**. Si se fallan los tres, el mapa muestra dónde estaba la
respuesta antes de pasar a la siguiente pregunta.

| Juego | Consigna | Cómo se responde |
|---|---|---|
| Encontrá el país | «¿Dónde está Argentina?» | Clic en el país en el mapa |
| Capitales | «¿De qué país es capital Lima?» | Clic en el país en el mapa |
| Banderas | Muestra una bandera | Clic en el mapa, o eligiendo entre 4 banderas |

**Zonas:** todo el mundo, América, América del Sur, América del Norte (con
Centro y Caribe), Europa, África, Asia y Oceanía. Se elige también cuántas
preguntas tiene la partida.

**Puntaje:** 3 puntos si acierta al primer intento, 2 al segundo, 1 al tercero.
Al final se ganan hasta 3 estrellas según el porcentaje y se guarda el récord
de esa combinación de juego + zona + cantidad. Los países fallados aparecen
en «Para repasar» con su bandera y su capital.

Los países muy chiquitos (Malta, Nauru, el Vaticano, las islas del Caribe...)
no se ven como manchas en el mapa: se dibujan como un puntito clickeable. Si el
chico falla una vez con uno de ellos, el juego le avisa que busque el punto.

El progreso y el botón de sonido se guardan en el navegador (`localStorage`).

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
  nucleo/almacen.js        Récords y preferencias en localStorage
  nucleo/sonido.js         Sonidos generados con Web Audio (sin archivos)
  nucleo/pwa.js            Registra el service worker y el cartel de "Instalar"
  mapa.js                  Motor del mapa: proyección, dibujo, zoom y clics
  juegos/geografia.js      Los tres juegos de geografía
  app.js                   Materias, pantallas y navegación
assets/banderas/           Una imagen por país (ar.png, br.png, ...)
herramientas/              Scripts para regenerar los datos (no hacen falta para jugar)
.claude/                   Servidor local opcional para desarrollo
```

La navegación usa el `#` de la dirección (`#/materia/geografia`,
`#/juego/geografia/paises`), así que el botón «atrás» del navegador funciona.

## Agregar una materia nueva

1. Creá `js/juegos/<materia>.js` exponiendo un objeto global con la lista de
   juegos y una función `iniciar(config, ganchos)`, tal como hace
   `js/juegos/geografia.js`.
2. Sumá el `<script>` en `index.html` antes de `js/app.js`.
3. En `js/app.js`, dentro de `MATERIAS`, poné la materia en `disponible: true`
   y apuntá `juegos` a la lista del paso 1.

Las materias que todavía no existen (Matemática, Lengua, Ciencias) ya están
listadas con el cartel «Pronto»: alcanza con completarlas.

## Agregar un juego de geografía

En `js/juegos/geografia.js`, agregá una entrada a `JUEGOS` (id, nombre, ícono,
color y texto) y contemplá ese `id` en `mostrarPregunta()` para armar la
consigna. Todo el resto —intentos, puntaje, revelado, resultados— ya es común
a todos los juegos.

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
