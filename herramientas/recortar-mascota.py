"""Saca el fondo blanco de una mascota, la recorta y la achica.

Lo llama herramientas/preparar-mascotas.js, que es el que sabe qué es
cada archivo. Uso suelto:

    python herramientas/recortar-mascota.py entrada.png salida.webp 420 82

El fondo NO se saca borrando "todo lo blanco": la panza, las patitas y
los ojos también son blancos y quedarían agujereados. Se hace una
inundación (flood fill) desde los cuatro bordes, que avanza por el
blanco de afuera y se frena contra el contorno negro del dibujo.
"""
import sys
from collections import deque
from PIL import Image

UMBRAL = 232      # qué tan claro tiene que ser un píxel para contar como fondo
BORDE = 2         # píxeles de margen que se dejan al recortar


def es_fondo(px):
    r, g, b = px[0], px[1], px[2]
    return r >= UMBRAL and g >= UMBRAL and b >= UMBRAL


def sacar_fondo(im):
    """Transparenta el blanco que se toca con el borde de la imagen."""
    im = im.convert('RGBA')
    ancho, alto = im.size
    px = im.load()

    visto = bytearray(ancho * alto)
    cola = deque()

    def sembrar(x, y):
        if not visto[y * ancho + x] and es_fondo(px[x, y]):
            visto[y * ancho + x] = 1
            cola.append((x, y))

    for x in range(ancho):
        sembrar(x, 0)
        sembrar(x, alto - 1)
    for y in range(alto):
        sembrar(0, y)
        sembrar(ancho - 1, y)

    while cola:
        x, y = cola.popleft()
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < ancho and 0 <= ny < alto:
                sembrar(nx, ny)
    return im


def main():
    entrada, salida = sys.argv[1], sys.argv[2]
    alto_final = int(sys.argv[3]) if len(sys.argv) > 3 else 420
    calidad = int(sys.argv[4]) if len(sys.argv) > 4 else 82

    im = Image.open(entrada)
    im = sacar_fondo(im)

    caja = im.getbbox()
    if caja:
        x0, y0, x1, y1 = caja
        im = im.crop((max(0, x0 - BORDE), max(0, y0 - BORDE),
                      min(im.width, x1 + BORDE), min(im.height, y1 + BORDE)))

    escala = alto_final / im.height
    im = im.resize((max(1, round(im.width * escala)), alto_final), Image.LANCZOS)
    im.save(salida, 'WEBP', quality=calidad, method=6)

    import os
    print('  %-16s %4dx%-4d %5.1f KB' % (
        os.path.basename(salida), im.width, im.height,
        os.path.getsize(salida) / 1024))


main()
