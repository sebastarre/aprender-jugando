# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(PWA instalable. Se va a publicar también en Google Play envuelta como TWA, que
sigue siendo la misma página: el lenguaje de diseño es web, no nativo.)

## Users

- **Chicos de 4 a 12 años**, separados por edades: la app muestra y ordena los
  juegos y las lecciones según la edad de cada chico (la edad recomienda, no
  prohíbe). Un chico de 4 todavía no lee; uno de 12 lee de corrido. Muchas
  veces juega solo, con el teléfono o la tablet de un grande.
- **Los grandes (madre, padre, adulto a cargo)**: instalan la app, arman el
  perfil de cada hijo, eligen la meta del día y los límites, miran el panel
  para padres (estadísticas, detrás de un PIN) y deciden la suscripción.
- Varios hermanos pueden compartir el mismo aparato, cada uno con su perfil.
- **Dos registros según la edad** (confirmado por el dueño): los de **4 a 7**
  ven todo más grande, con más dibujo y menos texto; los de **8 a 12**, algo
  más «de grandes». Ninguno de los dos puede parecer de bebés ni de escuela
  aburrida.

## Product Purpose

Que los chicos aprendan y practiquen lo de la primaria jugando. Tiene dos mitades
que se apoyan una en la otra: **Aprender** (lecciones cortas con dibujos,
leídas en voz alta, que terminan en un ejercicio) y **Jugar** (juegos para
practicar lo mismo). Éxito: el chico vuelve solo al día siguiente y de verdad
sabe más; el grande ve en el panel qué aprendió y qué le cuesta.

## Positioning

Confirmado por el dueño como lo que la distingue:

- **Sin publicidad y sin datos afuera**: nada de anuncios ni seguimiento; todo
  lo de los chicos queda en el aparato.
- **Repite lo que les cuesta**: lo que fallan vuelve a aparecer en el repaso
  (1, 3, 7 y 14 días) hasta que lo saben.
- **Camino de niveles**: cada juego es un mapa de 10 a 20 niveles con estrellas,
  un desafío cada cinco y un gran desafío al final; al terminar, recomienda el
  próximo juego o la próxima lección.

## Operating Context

- Se usa **en celular y en tablet por igual**; tiene que quedar igual de bien en
  los dos. También abre en la compu.
- **Funciona sin internet** una vez instalada (en el auto, en la casa sin wifi).
- Sesiones cortas: una partida, una lección, el repaso del día. Racha y meta
  diaria de respuestas correctas.
- Los que no leen se apoyan en dibujos, colores, la mascota y la voz (lectura en
  voz alta con las voces del aparato).
- El grande entra de vez en cuando al panel (botón «Padres» con candado).

## Capabilities and Constraints

- **Contenido**: 5 materias (Geografía, Matemática, Lengua, Ciencias, Inglés),
  48 juegos, lecciones con voz y ejercicio, modo examen, repaso espaciado,
  pizarra para hacer cuentas, pistas que crecen con cada intento.
- **Perfiles** por chico (nombre, edad, nene/nena opcional, foto opcional);
  bienvenida que pregunta si quien la usa es adulto o chico; tutorial opcional
  y salteable.
- **Modo parental** con PIN: estadísticas de todo, límites de tiempo, materias
  ocultas, tienda apagable, borrar datos.
- **Monedas y tienda, sólo cosméticas**: disfraces de la mascota, fondos y
  colores por ranura (portada, fondo, botones, letras). Las claves de compra y
  las variables de CSS de las ranuras (`--barra`, `--papel`, `--primario`,
  `--tinta`…) no se pueden renombrar sin borrarle compras a quien las pagó.
- **Colores con significado fijo**: `--exito` (acertaste) y `--error` (erraste)
  nunca los pisa un tema; cada materia tiene su color fijo.
- **Suscripción** mensual por Google Play, 7 días de prueba gratis (sólo cobra
  adentro de la app de Play).
- **Cuenta con mail** (Supabase) construida pero **apagada** por ahora.
- **Técnico**: JavaScript y CSS sin frameworks ni paso de build; sin
  dependencias externas en tiempo de ejecución (todo offline, fuentes
  embebidas); service worker que se regenera con `node herramientas/generar-sw.js`;
  claves de `localStorage`, `id` del manifiesto y prefijo de caché fijos (con
  el nombre viejo `aprender-jugando`).

## Brand Commitments

El dueño delegó el resto («hacé lo que te parezca»): la mascota, el ícono y los
colores comprables son material existente, no obligaciones.

- **Referencias elegidas por el dueño** (septiembre de 2026): para los de
  **4 a 7**, **Pok Pok**; para los de **8 a 12**, **Duolingo**. Son la vara de
  calidad y de lenguaje: el diseño tiene que poder estar al lado de esas dos
  apps. Referencias de otros rubros (señalética, cine, discos) quedaron
  descartadas explícitamente: lo que manda es cómo se ven las apps infantiles.
- Nombre: **Bichito Curioso** (antes «Aprender Jugando»).
- **La mascota**: un gato o un perro (lo elige el chico) disfrazado de león,
  zorro, dino, abeja, pingüino, tiburón o dragón. Ilustraciones propias en
  `assets/mascotas/`. El gato disfrazado de león es la cara del ícono.
- Voz: castellano rioplatense, de vos, cálido. El error avisa, no reta. Los
  premios no ocupan el centro: mientras se juega no hay puntos.

## Evidence on Hand

- Ilustraciones de la mascota: `assets/mascotas/` (14 WebP, gato y perro × 7
  disfraces).
- Dibujos para contar: `assets/contar/` (10 PNG).
- Banderas (194) y mapa del mundo propios, dentro del proyecto.
- Íconos propios en `js/nucleo/iconos.js`.
- Ícono de la app, tarjeta para compartir y gráficos de Play:
  `assets/icono-*.png`, `assets/compartir.png`, `herramientas/play/`.
- No hay testimonios, usuarios reales, reseñas ni premios: no inventarlos.

## Product Principles

1. **El contenido va en el centro**; los premios van al costado y chicos.
2. **Equivocarse no se castiga**: el error avisa y ayuda, nunca reta.
3. **La edad recomienda, no prohíbe**: todo se puede jugar; la app ordena y sugiere.
4. **Nada sale del aparato** y no hay publicidad.
5. **Un chico que no lee tiene que poder usarla** con dibujos, color y voz.

## Accessibility & Inclusion

- Contraste de texto medido de al menos 4,5:1 (3:1 para dibujos y texto grande).
- «Reducir movimiento» del sistema respetado en todas las animaciones.
- Blancos de toque de 44px o más, pensados para dedos chicos.
- Lectura en voz alta para los que no leen; etiquetas para lectores de pantalla.
- Verde y rojo nunca son la única pista de acierto o error.
