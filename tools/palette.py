#!/usr/bin/env python3
"""Rechnet die Flächen der hellen Farbschemata aus.

Ein Schema ist ein Farbton plus eine feste Staffelung der Helligkeit. Die
Staffelung ist für alle Schemata dieselbe — nur Farbton und Sättigung wandern.
Dadurch steht die Kachel überall gleich weit vom Grund ab, und der Kontrast zur
Schrift bleibt vergleichbar.

Der Abstand zwischen Grund und Kachel ist bewusst doppelt so groß wie in der
ersten Fassung: Die Kachel soll eine eigene Fläche sein, nicht ein heller Hauch
auf dem Grund.

Die ganze Leiter steht dabei um dreieinhalb Punkte tiefer als zuerst gerechnet
(Grund 91 → 87,5, Kachel 98,6 → 95,2). Auf dem Gerät waren die Farben sonst
grell — und das Weiß der Kachel zieht die Gesamthelligkeit mit hoch, es musste
also mit.
"""
import colorsys

def hsl2hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#%02X%02X%02X' % tuple(round(x * 255) for x in (r, g, b))

# Helligkeit und Sättigungsanteil je Fläche. `anteil` bezieht sich auf die
# Sättigung des Schemas.
#
# **Die Kachel ist ein hellerer Ton derselben Farbe, kein Weiß.** Bis 2.4.4 trug
# sie nur 42 Prozent der Sättigung und war damit praktisch weiß — sie sah aus
# wie ein Blatt Papier, das jemand auf eine Farbe gelegt hat, statt wie eine
# Fläche desselben Materials. Jetzt trägt sie 90 Prozent: derselbe Ton, nur
# heller. Der Abstand zum Grund fällt dadurch von 1,36 auf 1,21 — das ist
# gewollt und liegt weiterhin über der Grenze aus ADR 0041 (1,15).
FLAECHEN = [
    ('bg',     77.0, 1.00),
    ('card',   89.0, 0.90),
    ('card-2', 82.0, 1.00),
    ('line',   68.0, 0.95),
    ('glow',   89.0, 0.90),
]

# Farbton und Sättigung je Schema. «classic» ist der warme Cremeton, den die
# App von Anfang an hatte — nur der Grund rückt etwas tiefer, damit die Kachel
# darüber steht.
SCHEMATA = {
    'classic': {'h': 43, 's': 42},
    'gruen':   {'h': 152, 's': 52},
    'blau':    {'h': 205, 's': 50},
    'rosa':    {'h': 318, 's': 50},
}

if __name__ == '__main__':
    for name, t in SCHEMATA.items():
        werte = ['--%s: %s;' % (k, hsl2hex(t['h'], t['s'] * anteil, l))
                 for k, l, anteil in FLAECHEN]
        print(':root[data-schema="%s"] {' % name)
        for w in werte:
            print('  ' + w)
        print('}')
