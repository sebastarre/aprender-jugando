/* ============================================================
   Deja las mascotas listas para la app.

   Uso:  node herramientas/preparar-mascotas.js "<carpeta con los PNG>"
         (por defecto busca en el Escritorio, en "FOTOS DE ANIMALES")

   Los originales son PNG de 1024×1024 con fondo blanco y pesan más de
   un mega cada uno: 16,5 MB los catorce, cuando la app entera pesa 1,1.
   Meterlos así rompería la promesa de que se instala y anda sin
   internet. Esta herramienta hace tres cosas con cada uno:

     1. Le saca el fondo blanco. No borra "todo lo blanco": eso comería
        la panza y las patitas. Hace una inundación desde los bordes,
        que se frena en el contorno negro del dibujo, así que sólo
        desaparece el blanco de afuera.
     2. Lo recorta a lo que ocupa el dibujo y lo achica.
     3. Lo guarda en WebP, que para dibujos planos pesa una fracción.

   Los originales NO van al repositorio: son el material de trabajo y
   viven fuera. Lo que se versiona es la salida, en assets/mascotas/.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets', 'mascotas');

/* De qué es cada archivo. Los nombres que largó el generador no dicen
   nada, así que la correspondencia va acá. Si se regeneran las
   imágenes, hay que actualizar esta tabla: la clave es el pedazo del
   nombre que alcanza para distinguirlo. */
const QUE_ES = {
  '3460db31': 'perro-zorro',
  '802dcbf5': 'perro-abeja',
  '93171baf': 'perro-dragon',
  'dbc1e6df': 'perro-pinguino',
  '18624288': 'perro-leon',
  '9f128ff5': 'perro-dino',
  'fbf312af': 'perro-tiburon',
  '01ed54e7': 'gato-leon',
  '2b3836c9': 'gato-abeja',
  '421cb875': 'gato-zorro',
  '943a1f0a': 'gato-tiburon',
  'a130720b': 'gato-dino',
  'a3947b99': 'gato-dragon',
  'a6cc7997': 'gato-pinguino'
};

const ALTO = 420;          // alto final: se ve a 130 px, con lugar para pantallas densas
const CALIDAD = 82;

function main() {
  const origen = process.argv[2] ||
    path.join(process.env.USERPROFILE || process.env.HOME,
              'OneDrive', 'Desktop', 'FOTOS DE ANIMALES');

  if (!fs.existsSync(origen)) {
    console.error('No encuentro la carpeta: ' + origen);
    process.exit(1);
  }
  fs.mkdirSync(DESTINO, { recursive: true });

  const archivos = fs.readdirSync(origen).filter(f => /\.png$/i.test(f));
  const guion = path.join(__dirname, 'recortar-mascota.py');
  let hechos = 0, bytes = 0;
  const faltan = new Set(Object.values(QUE_ES));

  for (const archivo of archivos) {
    const clave = Object.keys(QUE_ES).find(k => archivo.includes(k));
    if (!clave) {
      console.warn('  (salteado, no está en la tabla) ' + archivo);
      continue;
    }
    const nombre = QUE_ES[clave];
    const salida = path.join(DESTINO, nombre + '.webp');
    execFileSync('python', [guion, path.join(origen, archivo), salida,
                            String(ALTO), String(CALIDAD)], { stdio: 'inherit' });
    faltan.delete(nombre);
    hechos++;
    bytes += fs.statSync(salida).size;
  }

  console.log('\n' + hechos + ' mascotas · ' + (bytes / 1024).toFixed(0) + ' KB en total');
  if (faltan.size) console.warn('Faltaron: ' + [...faltan].join(', '));
  console.log('Acordate de correr node herramientas/generar-sw.js');
}

main();
