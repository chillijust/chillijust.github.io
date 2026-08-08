#!/usr/bin/env python3
"""Rechnet die Flächen der hellen Farbschemata aus.

Ein Schema ist ein Farbton plus eine feste Staffelung der Helligkeit. Die
Staffelung ist für alle Schemata dieselbe — nur Farbton und Sättigung wandern.
Dadurch steht die Kachel überall gleich weit vom Grund ab, und der Kontrast zur
Schrift bleibt vergleichbar.

Der Abstand zwischen Grund (91) und Kachel (99,5) ist bewusst doppelt so groß
wie in der ersten Fassung: Die Kachel soll eine eigene Fläche sein, nicht ein
heller Hauch auf dem Grund.
"""
import colorsys

def hsl2hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#%02X%02X%02X' % tuple(round(x * 255) for x in (r, g, b))

# Helligkeit und Sättigungsanteil je Fläche. `anteil` bezieht sich auf die
# Sättigung des Schemas: Die hellen Flächen tragen nur einen Hauch davon,
# sonst wirkten sie schmutzig statt cremig.
FLAECHEN = [
    ('bg',     91.0, 1.00),
    ('card',   98.6, 0.70),
    ('card-2', 86.0, 1.00),
    ('line',   78.0, 0.90),
    ('glow',   98.6, 0.70),
]

# Farbton und Sättigung je Schema. «classic» ist der warme Cremeton, den die
# App von Anfang an hatte — nur der Grund rückt etwas tiefer, damit die Kachel
# darüber steht.
SCHEMATA = {
    'classic': {'h': 43, 's': 24},
    'gruen':   {'h': 150, 's': 32},
    'blau':    {'h': 208, 's': 38},
    'rosa':    {'h': 344, 's': 38},
}

if __name__ == '__main__':
    for name, t in SCHEMATA.items():
        werte = ['--%s: %s;' % (k, hsl2hex(t['h'], t['s'] * anteil, l))
                 for k, l, anteil in FLAECHEN]
        print(':root[data-schema="%s"] {' % name)
        for w in werte:
            print('  ' + w)
        print('}')
