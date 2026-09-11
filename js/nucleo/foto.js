/* ============================================================
   La foto del jugador

   Toma el archivo que el chico eligió de la galería y devuelve una
   foto chiquita, cuadrada y lista para guardar.

   Por qué achicar y no guardar el archivo tal cual: una foto de un
   celular de hoy pesa entre 2 y 6 MB, y todo lo que la app guarda vive
   en localStorage, que tiene unos 5 MB en total para TODO —perfiles,
   partidas, errores, compras—. Una sola foto sin tocar lo llena y la
   app deja de poder guardar nada más. Recortada al cuadrado del medio
   y llevada a 240 píxeles, la misma foto queda en unos 15 KB.

   El recorte es del centro y no un encogido: una foto apaisada metida
   a la fuerza en un círculo deja la cara aplastada.

   La foto no sale del teléfono. No se sube a ningún lado, no viaja por
   internet y no la ve nadie más: queda guardada en el navegador del
   aparato, igual que las estrellas y las monedas.
   ============================================================ */
window.Foto = (function () {
  'use strict';

  var LADO = 240;        // píxeles del cuadrado final
  var CALIDAD = 0.82;    // jpeg: de acá para arriba no se nota y pesa el doble
  var PESO_MAXIMO = 12 * 1024 * 1024;

  /**
   * Convierte un archivo de imagen en una foto cuadrada chica.
   * @param archivo  el File que eligió el chico
   * @param listo    recibe la foto como texto (data URL) para guardar
   * @param fallo    recibe un motivo en castellano si no se pudo
   */
  function preparar(archivo, listo, fallo) {
    fallo = fallo || function () {};
    if (!archivo) return fallo('No elegiste ninguna foto.');
    if (archivo.type && archivo.type.indexOf('image/') !== 0) {
      return fallo('Eso no es una foto. Tiene que ser una imagen.');
    }
    /* Un archivo enorme no es un problema de tamaño final —lo achicamos
       igual— sino de memoria mientras se lo dibuja. Mejor decir que no. */
    if (archivo.size > PESO_MAXIMO) return fallo('Esa foto es demasiado grande.');

    var lector = new FileReader();
    lector.onerror = function () { fallo('No se pudo leer la foto.'); };
    lector.onload = function () {
      var img = new Image();
      img.onerror = function () { fallo('No se pudo abrir la foto.'); };
      img.onload = function () {
        try { listo(recortar(img)); }
        catch (error) { fallo('No se pudo preparar la foto.'); }
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  }

  /** El cuadrado del medio de la imagen, llevado a LADO x LADO. */
  function recortar(img) {
    var lado = Math.min(img.naturalWidth, img.naturalHeight);
    var x = (img.naturalWidth - lado) / 2;
    var y = (img.naturalHeight - lado) / 2;

    var lienzo = document.createElement('canvas');
    lienzo.width = LADO;
    lienzo.height = LADO;
    var pincel = lienzo.getContext('2d');
    pincel.drawImage(img, x, y, lado, lado, 0, 0, LADO, LADO);
    return lienzo.toDataURL('image/jpeg', CALIDAD);
  }

  return { preparar: preparar, LADO: LADO };
})();
