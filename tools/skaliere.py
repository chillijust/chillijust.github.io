#!/usr/bin/env python3
"""Skaliert ein PNG auf Icon-Größe — ohne Bibliothek, nur zlib und struct.

Liest 8-Bit-Truecolor (mit oder ohne Alpha), macht die Zeilenfilter rückgängig,
mittelt kastenweise herunter und schreibt ein deckendes RGB-PNG.
"""
import struct
import sys
import zlib

QUELLE = sys.argv[1]
ZIEL = sys.argv[2]
KANTE = int(sys.argv[3]) if len(sys.argv) > 3 else 180

roh = open(QUELLE, 'rb').read()
assert roh[:8] == b'\x89PNG\r\n\x1a\n', 'kein PNG'

daten = b''
pos = 8
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

assert tiefe == 8, 'nur 8 Bit je Kanal'
assert farbtyp in (2, 6), 'nur Truecolor mit oder ohne Alpha'
kanaele = 3 if farbtyp == 2 else 4

entpackt = zlib.decompress(daten)
schritt = breite * kanaele
zeilen = []
vorherige = bytearray(schritt)
p = 0
for _ in range(hoehe):
    filt = entpackt[p]
    zeile = bytearray(entpackt[p + 1:p + 1 + schritt])
    p += 1 + schritt
    for i in range(schritt):
        a = zeile[i - kanaele] if i >= kanaele else 0
        b = vorherige[i]
        c = vorherige[i - kanaele] if i >= kanaele else 0
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

# kastenweise mitteln
ergebnis = []
for y in range(KANTE):
    y0, y1 = y * hoehe // KANTE, max(y * hoehe // KANTE + 1, (y + 1) * hoehe // KANTE)
    reihe = []
    for x in range(KANTE):
        x0, x1 = x * breite // KANTE, max(x * breite // KANTE + 1, (x + 1) * breite // KANTE)
        summe = [0, 0, 0]
        n = 0
        for yy in range(y0, y1):
            zeile = zeilen[yy]
            for xx in range(x0, x1):
                i = xx * kanaele
                summe[0] += zeile[i]
                summe[1] += zeile[i + 1]
                summe[2] += zeile[i + 2]
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
print(f'{breite}×{hoehe} → {KANTE}×{KANTE} · {len(png)} Bytes · '
      f'{round(len(png) * 4 / 3 / 1024, 1)} KB als Daten-URI')
