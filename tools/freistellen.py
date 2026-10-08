#!/usr/bin/env python3
"""Stellt das Maskottchen aus dem Icon frei — ohne Bildbibliothek.

Weg: Hintergrund vom Bildrand her fluten (der Verlauf ist glatt, also wächst die
Fläche über kleine Farbunterschiede weiter), danach die verbleibenden Flächen in
Zusammenhangskomponenten zerlegen und nur die größte behalten — das ist die
Chili; die Sprechblase fällt damit weg. Am Rand wird die Deckkraft weich
ausgeblendet, sonst treppt die Kante.

Aufruf: freistellen.py <quelle.png> <ziel.png> [kante]
"""
import struct
import sys
import zlib
from collections import deque

QUELLE, ZIEL = sys.argv[1], sys.argv[2]
KANTE = int(sys.argv[3]) if len(sys.argv) > 3 else 0
TOLERANZ = 26      # erlaubter Farbabstand beim Fluten
RAND = 3           # Pixel, über die die Kante weich wird


def lies_png(pfad):
    roh = open(pfad, 'rb').read()
    assert roh[:8] == b'\x89PNG\r\n\x1a\n'
    daten, pos = b'', 8
    breite = hoehe = tiefe = farbtyp = None
    while pos < len(roh):
        laenge = struct.unpack('>I', roh[pos:pos + 4])[0]
        typ = roh[pos + 4:pos + 8]
        inhalt = roh[pos + 8:pos + 8 + laenge]
        if typ == b'IHDR':
            breite, hoehe, tiefe, farbtyp = struct.unpack('>IIBB', inhalt[:10])
        elif typ == b'IDAT':
            daten += inhalt
        elif typ == b'IEND':
            break
        pos += 12 + laenge
    assert tiefe == 8 and farbtyp in (2, 6)
    k = 3 if farbtyp == 2 else 4
    entpackt = zlib.decompress(daten)
    schritt = breite * k
    zeilen, vorherige, p = [], bytearray(schritt), 0
    for _ in range(hoehe):
        filt = entpackt[p]
        zeile = bytearray(entpackt[p + 1:p + 1 + schritt])
        p += 1 + schritt
        for i in range(schritt):
            a = zeile[i - k] if i >= k else 0
            b = vorherige[i]
            c = vorherige[i - k] if i >= k else 0
            if filt == 1:
                zeile[i] = (zeile[i] + a) & 0xFF
            elif filt == 2:
                zeile[i] = (zeile[i] + b) & 0xFF
            elif filt == 3:
                zeile[i] = (zeile[i] + (a + b) // 2) & 0xFF
            elif filt == 4:
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                zeile[i] = (zeile[i] + (a if (pa <= pb and pa <= pc) else (b if pb <= pc else c))) & 0xFF
        zeilen.append(zeile)
        vorherige = zeile
    return breite, hoehe, k, zeilen


B, H, K, zeilen = lies_png(QUELLE)


def farbe(x, y):
    i = x * K
    z = zeilen[y]
    return z[i], z[i + 1], z[i + 2]


# ── 1 · Hintergrund vom Rand her fluten ─────────────────────
# Reines Wachsen über Farbabstände lief über die weichen Wangen-Ovale in die
# Figur hinein. Der Hintergrund ist aber eindeutig türkis: Grün und Blau liegen
# deutlich über Rot. Nur solche Pixel dürfen geflutet werden.
def ist_tuerkis(r, g, b):
    return g > r * 1.25 and b > r * 1.15 and g > 25

hintergrund = bytearray(B * H)
schlange = deque()
def saee(x, y):
    i = y * B + x
    if not hintergrund[i] and ist_tuerkis(*farbe(x, y)):
        hintergrund[i] = 1
        schlange.append((x, y))


for x in range(B):
    saee(x, 0)
    saee(x, H - 1)
for y in range(H):
    saee(0, y)
    saee(B - 1, y)

while schlange:
    x, y = schlange.popleft()
    r, g, b = farbe(x, y)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < B and 0 <= ny < H and not hintergrund[ny * B + nx]:
            r2, g2, b2 = farbe(nx, ny)
            if ist_tuerkis(r2, g2, b2) and abs(r - r2) + abs(g - g2) + abs(b - b2) <= TOLERANZ:
                hintergrund[ny * B + nx] = 1
                schlange.append((nx, ny))

# ── 2 · Zusammenhängende Vordergrundflächen finden ──────────
marke = [0] * (B * H)
groessen = {}
naechste = 0
for start in range(B * H):
    if hintergrund[start] or marke[start]:
        continue
    naechste += 1
    marke[start] = naechste
    stapel = [start]
    n = 0
    while stapel:
        i = stapel.pop()
        n += 1
        x, y = i % B, i // B
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < B and 0 <= ny < H:
                j = ny * B + nx
                if not hintergrund[j] and not marke[j]:
                    marke[j] = naechste
                    stapel.append(j)
    groessen[naechste] = n

sortiert = sorted(groessen.items(), key=lambda t: -t[1])
print('Flächen (die größten):', [(nr, n) for nr, n in sortiert[:4]])
chili = sortiert[0][0]

# ── 3 · Deckkraft: innen voll, am Rand weich ────────────────
alpha = bytearray(B * H)
for i in range(B * H):
    if marke[i] == chili:
        alpha[i] = 255

for _ in range(RAND):
    weich = bytearray(alpha)
    for y in range(1, H - 1):
        for x in range(1, B - 1):
            i = y * B + x
            if alpha[i] == 0:
                nachbarn = [alpha[i - 1], alpha[i + 1], alpha[i - B], alpha[i + B]]
                hoch = max(nachbarn)
                if hoch > 60:
                    weich[i] = hoch // 3
    alpha = weich

# ── 4 · Zuschneiden ─────────────────────────────────────────
x0, y0, x1, y1 = B, H, 0, 0
for y in range(H):
    for x in range(B):
        if alpha[y * B + x]:
            x0, y0 = min(x0, x), min(y0, y)
            x1, y1 = max(x1, x), max(y1, y)
rand = 6
x0, y0 = max(0, x0 - rand), max(0, y0 - rand)
x1, y1 = min(B - 1, x1 + rand), min(H - 1, y1 + rand)
bb, bh = x1 - x0 + 1, y1 - y0 + 1
# quadratisch machen, damit die Figur beim Skalieren nicht verzerrt
seite = max(bb, bh)
ox, oy = x0 - (seite - bb) // 2, y0 - (seite - bh) // 2
print('Zuschnitt:', bb, '×', bh, '→ Quadrat', seite)


def hole(x, y):
    if 0 <= x < B and 0 <= y < H:
        r, g, b = farbe(x, y)
        return r, g, b, alpha[y * B + x]
    return 0, 0, 0, 0


ziel_kante = KANTE if KANTE else seite
bild = []
for zy in range(ziel_kante):
    reihe = []
    for zx in range(ziel_kante):
        qx0 = ox + zx * seite // ziel_kante
        qx1 = max(qx0 + 1, ox + (zx + 1) * seite // ziel_kante)
        qy0 = oy + zy * seite // ziel_kante
        qy1 = max(qy0 + 1, oy + (zy + 1) * seite // ziel_kante)
        sr = sg = sb = sa = n = 0
        for yy in range(qy0, qy1):
            for xx in range(qx0, qx1):
                r, g, b, a = hole(xx, yy)
                sr += r * a
                sg += g * a
                sb += b * a
                sa += a
                n += 1
        if sa:
            reihe.append([sr // sa, sg // sa, sb // sa, sa // n])
        else:
            reihe.append([0, 0, 0, 0])
    bild.append(reihe)

ausgabe = b''
for reihe in bild:
    ausgabe += b'\x00' + bytes(w for pixel in reihe for w in pixel)


def chunk(typ, inhalt):
    return (struct.pack('>I', len(inhalt)) + typ + inhalt +
            struct.pack('>I', zlib.crc32(typ + inhalt) & 0xffffffff))


png = (b'\x89PNG\r\n\x1a\n' +
       chunk(b'IHDR', struct.pack('>IIBBBBB', ziel_kante, ziel_kante, 8, 6, 0, 0, 0)) +
       chunk(b'IDAT', zlib.compress(ausgabe, 9)) +
       chunk(b'IEND', b''))
open(ZIEL, 'wb').write(png)
print(f'{ZIEL}: {ziel_kante}×{ziel_kante} · {len(png)} Bytes · '
      f'{round(len(png) * 4 / 3 / 1024, 1)} KB als Daten-URI')
