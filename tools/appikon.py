#!/usr/bin/env python3
"""Baut das App-Symbol aus dem Original — ohne Bildbibliothek, nur zlib und struct.

Das Original (docs/IMG_2942.png) hat einen türkisen Verlauf als Hintergrund. Für
ein Symbol in der Farbe des hellen Modus genügt es nicht, den Hintergrund
auszutauschen: Die Sprechblase ist cremeweiß und verschwände darin. Sie wird
darum umgedreht — dunkles Türkis als Fläche, Creme für das «Я». So bleibt die
Blase ein Gegenstand und das Symbol behält seine Farben.

Die Ränder sind weichgezeichnet, also Mischungen zweier Farben. Wer nur
Volltöne austauscht, lässt einen türkisen Saum stehen. Jeder Mischpixel wird
darum in seine zwei Anteile zerlegt, beide Anteile werden umgefärbt und wieder
gemischt — der Saum wandert dadurch mit.

Aufruf: appikon.py <quelle.png> <ziel.png> [kante] [#hintergrund]
"""
import struct
import sys
import zlib
from collections import deque

QUELLE = sys.argv[1]
ZIEL = sys.argv[2]
KANTE = int(sys.argv[3]) if len(sys.argv) > 3 else 180
NEU_BG = sys.argv[4] if len(sys.argv) > 4 else '#F4F2ED'

TOLERANZ = 26          # erlaubter Farbabstand beim Fluten
BLASE = (255, 246, 228)   # Fläche der Sprechblase im Original
YA = (11, 63, 68)         # das «Я» darin
BLASE_NEU = (15, 79, 83)  # die Blase wird dunkel …
YA_NEU = (255, 246, 228)  # … und das Zeichen hell


def farbwert(text):
    t = text.lstrip('#')
    return tuple(int(t[i:i + 2], 16) for i in (0, 2, 4))


def lies_png(pfad):
    roh = open(pfad, 'rb').read()
    assert roh[:8] == b'\x89PNG\r\n\x1a\n', 'kein PNG'
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
    assert tiefe == 8 and farbtyp in (2, 6), 'nur 8-Bit-Truecolor'
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
                vor = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                zeile[i] = (zeile[i] + vor) & 0xFF
        zeilen.append(zeile)
        vorherige = zeile
    return breite, hoehe, k, zeilen


B, H, K, zeilen = lies_png(QUELLE)


def farbe(x, y):
    i = x * K
    z = zeilen[y]
    return z[i], z[i + 1], z[i + 2]


# ── 1 · Hintergrund vom Rand her fluten ─────────────────────
# Derselbe Weg wie in freistellen.py: Der Verlauf ist glatt, also wächst die
# Fläche über kleine Farbunterschiede weiter. Die Bedingung «türkis» hält das
# Fluten aus der Figur heraus — die weichen Wangen-Ovale lockten es sonst hinein.
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

print('Hintergrund:', sum(hintergrund), 'von', B * H, 'Pixeln')

# ── 2 · Die Sprechblase als eigene Fläche finden ────────────
# Das Cremeweiß der Blase steht auch im Augenweiß der Chili. Wer nur nach der
# Farbe umfärbt, gibt der Figur türkise Augen. Die Blase ist aber eine eigene
# zusammenhängende Fläche: die zweitgrößte nach der Chili.
marke = bytearray(B * H)
groessen = {}
naechste = 0
for start in range(B * H):
    if hintergrund[start] or marke[start]:
        continue
    naechste += 1
    if naechste > 250:
        break
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
print('Flächen (die größten):', sortiert[:3])
assert len(sortiert) >= 2, 'Sprechblase nicht gefunden'
blase_nr = sortiert[1][0]

# ── 3 · Den Verlauf als Ebene beschreiben ───────────────────
# Für die Mischpixel am Rand muss die Hintergrundfarbe *an dieser Stelle*
# bekannt sein, nicht bloß irgendeine. Der Verlauf ist glatt, also genügt je
# Kanal eine Ebene a·x + b·y + c, kleinste Quadrate über die geflutete Fläche.
sxx = sxy = syy = sx = sy = sn = 0.0
sxz = [0.0, 0.0, 0.0]
syz = [0.0, 0.0, 0.0]
sz = [0.0, 0.0, 0.0]
for y in range(0, H, 3):
    for x in range(0, B, 3):
        if not hintergrund[y * B + x]:
            continue
        c = farbe(x, y)
        sxx += x * x
        sxy += x * y
        syy += y * y
        sx += x
        sy += y
        sn += 1
        for k in range(3):
            sxz[k] += x * c[k]
            syz[k] += y * c[k]
            sz[k] += c[k]


def loese3(m, v):
    # Gauß mit Spaltenpivot — drei Gleichungen, mehr braucht es nicht.
    a = [list(m[i]) + [v[i]] for i in range(3)]
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(a[r][i]))
        a[i], a[p] = a[p], a[i]
        for r in range(3):
            if r == i:
                continue
            f = a[r][i] / a[i][i]
            for c2 in range(i, 4):
                a[r][c2] -= f * a[i][c2]
    return [a[i][3] / a[i][i] for i in range(3)]


M = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, sn]]
ebene = [loese3(M, [sxz[k], syz[k], sz[k]]) for k in range(3)]


def bg_modell(x, y):
    return tuple(max(0, min(255, int(round(e[0] * x + e[1] * y + e[2])))) for e in ebene)


print('Verlauf: Ecke oben links %s, unten rechts %s' %
      (bg_modell(0, 0), bg_modell(B - 1, H - 1)))

# ── 4 · Umfärben, Mischpixel eingeschlossen ─────────────────
NEU = farbwert(NEU_BG)


def mische(a, b, t):
    return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))


def abstand2(a, b):
    return sum((a[k] - b[k]) ** 2 for k in range(3))


def zerlege(p, a, b):
    """Anteil t, mit dem p auf der Strecke a→b liegt, und der Restfehler."""
    ab = [b[k] - a[k] for k in range(3)]
    laenge = sum(v * v for v in ab)
    if laenge == 0:
        return 0.0, abstand2(p, a)
    t = sum((p[k] - a[k]) * ab[k] for k in range(3)) / laenge
    t = max(0.0, min(1.0, t))
    return t, abstand2(p, mische(a, b, t))


REST = 900          # erlaubter Restfehler einer Zerlegung (30 je Kanal)
neu_zeilen = []
for y in range(H):
    reihe = []
    for x in range(B):
        p = farbe(x, y)
        if hintergrund[y * B + x]:
            reihe.append(NEU)
            continue
        if marke[y * B + x] != blase_nr:
            reihe.append(p)      # die Chili bleibt, wie sie ist
            continue
        bg = bg_modell(x, y)
        # Die drei Paare, die am Rand der Blase tatsächlich vorkommen. Das
        # erste, das passt, gewinnt — sie liegen weit genug auseinander.
        for a, b, na, nb in ((BLASE, YA, BLASE_NEU, YA_NEU),
                             (bg, BLASE, NEU, BLASE_NEU),
                             (bg, YA, NEU, YA_NEU)):
            t, fehler = zerlege(p, a, b)
            if fehler <= REST:
                m = mische(na, nb, t)
                reihe.append(tuple(int(round(v)) for v in m))
                break
        else:
            reihe.append(p)
    neu_zeilen.append(reihe)

# Der Saum der Chili: Pixel, die nicht geflutet wurden, aber noch merklich
# türkis sind, liegen zwischen Figur und altem Hintergrund. Sie werden gegen
# die neue Farbe aufgehellt, statt als dunkler Rand stehen zu bleiben.
saum = 0
for y in range(H):
    for x in range(B):
        if hintergrund[y * B + x]:
            continue
        p = farbe(x, y)
        if not ist_tuerkis(*p):
            continue
        bg = bg_modell(x, y)
        if abstand2(p, bg) > 60 * 60:
            continue
        neu_zeilen[y][x] = NEU
        saum += 1
print('Saum aufgehellt:', saum, 'Pixel')

# ── 4 · Kastenweise auf Symbolgröße mitteln ─────────────────
ergebnis = []
for y in range(KANTE):
    y0 = y * H // KANTE
    y1 = max(y0 + 1, (y + 1) * H // KANTE)
    reihe = []
    for x in range(KANTE):
        x0 = x * B // KANTE
        x1 = max(x0 + 1, (x + 1) * B // KANTE)
        summe = [0, 0, 0]
        n = 0
        for yy in range(y0, y1):
            z = neu_zeilen[yy]
            for xx in range(x0, x1):
                p = z[xx]
                summe[0] += p[0]
                summe[1] += p[1]
                summe[2] += p[2]
                n += 1
        reihe.append([summe[k] // n for k in range(3)])
    ergebnis.append(reihe)

ausgabe = b''
for reihe in ergebnis:
    ausgabe += b'\x00' + bytes(w for pixel in reihe for w in pixel)


def chunk(typ, inhalt):
    return (struct.pack('>I', len(inhalt)) + typ + inhalt +
            struct.pack('>I', zlib.crc32(typ + inhalt) & 0xffffffff))


png = (b'\x89PNG\r\n\x1a\n' +
       chunk(b'IHDR', struct.pack('>IIBBBBB', KANTE, KANTE, 8, 2, 0, 0, 0)) +
       chunk(b'IDAT', zlib.compress(ausgabe, 9)) +
       chunk(b'IEND', b''))
open(ZIEL, 'wb').write(png)
print(f'{ZIEL}: {KANTE}×{KANTE} · {len(png)} Bytes · '
      f'{round(len(png) * 4 / 3 / 1024, 1)} KB als Daten-URI')
