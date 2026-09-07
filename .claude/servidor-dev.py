"""Servidor estático sólo para desarrollo: sirve la carpeta del proyecto
sin caché, para ver los cambios al recargar. La página final no lo necesita.

Usa ThreadingHTTPServer a propósito: el navegador abre varias conexiones a la
vez (por ejemplo las banderas del quiz) y un servidor de un solo hilo las deja
esperando hasta que se cortan, lo que se ve como imágenes que no cargan.
"""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUERTO = 8123


class SinCache(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"          # permite reutilizar la conexión

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, formato, *args):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer.allow_reuse_address = True
    ThreadingHTTPServer.daemon_threads = True
    manejador = partial(SinCache, directory=RAIZ)
    with ThreadingHTTPServer(("127.0.0.1", PUERTO), manejador) as srv:
        print("Sirviendo", RAIZ, "en http://localhost:%d" % PUERTO)
        srv.serve_forever()
