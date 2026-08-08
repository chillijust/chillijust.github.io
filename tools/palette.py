#!/usr/bin/env python3
"""Erzeugt die getönten Paletten aus dem neutralen Vorbild.

Die Helligkeit jeder Fläche bleibt, nur Farbton und Sättigung wandern. So
bleibt der Kontrast zum Text überall derselbe wie im neutralen Grundton.
"""
import colorsys

def hex2hsl(h):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    return hh * 360, ss * 100, ll * 100

def hsl2hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return '#%02X%02X%02X' % tuple(round(x * 255) for x in (r, g, b))

# Das neutrale Vorbild — daraus kommt die Helligkeit.
DUNKEL = {'bg': '#101418', 'card': '#171C23', 'card-2': '#1D232C',
          'line': '#262E39', 'glow': '#1C242F'}
HELL = {'bg': '#F4F2ED', 'card': '#FFFFFF', 'card-2': '#EDEAE2',
        'line': '#D8D4C9', 'glow': '#FFFFFF'}

# Farbton und Sättigung je Stimmung. Cremig heißt: gedämpft, nicht blass.
TOENE = {
    'gruen': {'h': 152, 's_dunkel': 22, 's_hell': 26},
    # Blau muss sich vom kühlen Grundton absetzen — der ist selbst blaugrau.
    'blau':  {'h': 212, 's_dunkel': 46, 's_hell': 34},
    # Zu wenig Sättigung, und Rosa wird im Dunkeln zu Braun.
    'rosa':  {'h': 342, 's_dunkel': 30, 's_hell': 32},
}

for name, t in TOENE.items():
    print('/* %s */' % name)
    for kennung, tafel, s in (('dunkel', DUNKEL, t['s_dunkel']), ('hell', HELL, t['s_hell'])):
        werte = []
        for k, v in tafel.items():
            _, _, l = hex2hsl(v)
            # Reines Weiß bekommt einen Hauch Farbe, sonst zeigt sich der Ton
            # nur im Grund und die Karten schwimmen darüber.
            ziel_l = min(l, 98.5) if l > 99 else l
            werte.append('--%s: %s;' % (k, hsl2hex(t['h'], s, ziel_l)))
        print('  %-7s %s' % (kennung, ' '.join(werte)))
    print()
