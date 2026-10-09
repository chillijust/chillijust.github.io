# Stilvorlage · Chilli Journal

Der Stil von Chillinal («Chilli Journal»), herausgelöst, damit andere Apps ihn übernehmen
können — ChilliWeb zuerst. Stand 0.13.0 (2026-10-08). Unabhängig vom Technikstapel: Was
hier steht, gilt für ein einzelnes `index.html` genauso wie für Svelte oder React.

**Kernaussage:** warmes Papier statt Bildschirmgrau, eine Serifenschrift zum Lesen und eine
runde Groteske zum Bedienen, ein einziger Akzent (Chili), zwei Signalfarben mit fester
Bedeutung, Glas nur für Meldungen — und **nichts ploppt**: Was aufgeht, tropft aus dem, was
man angetippt hat, und fließt dorthin zurück.

Die Begründungen stehen in den ADRs unter `docs/decisions/`; in Klammern die Nummer.

---

## 1 · Farben

Nur über Tokens — keine Hexzahl außerhalb der Paletten-Blöcke. Hell und Dunkel, sonst
nichts. Ohne Wahl folgt die App `prefers-color-scheme`; ein Schalter legt fest.

| Token | Hell | Dunkel | Rolle |
| --- | --- | --- | --- |
| `--grund` | `#FAF9F5` | `#141413` | Seitengrund (Elfenbein / Fast-Schwarz) |
| `--text` | `#141413` | `#FAF9F5` | Schrift |
| `--text-2` | `#5E5D59` | `#B0AEA5` | Nebenschrift, Etiketten |
| `--flaeche` | `#F0EEE6` | `#1F1F1D` | Karten, Kacheln, runde Knöpfe |
| `--flaeche-2` | `#E8E6DC` | `#2B2B28` | Mulde (Schalter, Wahlleiste), Trennlinien |
| `--linie` | `#B0AEA5` | `#4A4945` | Ränder, leere Punkte |
| `--akzent` | `#D97757` | `#D97757` | Chili: Symbole, Fokus, Ring, Jubel |
| `--auf-akzent` | `#141413` | `#141413` | Schrift **auf** dem Akzent |
| `--erledigt` | `#788C5D` | `#9DB283` | Grün = erledigt, sonst nichts |
| `--termin` | `#6A9BCC` | `#8FB6DD` | Blau = Termin/Info, sonst nichts |
| `--knopf` | `#141413` | `#FAF9F5` | Hauptknopf-Grund |
| `--knopf-text` | `#FAF9F5` | `#141413` | Hauptknopf-Schrift |

Drei Regeln, die man leicht bricht:

- **Der Akzent ist kein Schriftgrund.** Weiß auf `#D97757` hat 3,1 : 1. Hauptknöpfe nehmen
  `--knopf` (Schwarz auf Hell, Elfenbein auf Dunkel). Wo doch einmal Schrift auf dem Akzent
  steht (Pille «Heute»), ist sie dunkel (0023).
- **Signalfarben tragen genau eine Bedeutung.** Grün heißt erledigt, Blau heißt Termin.
  Keine dritte, keine Dekoration damit.
- **Die dunkle Palette steht zweimal gleich** — unter `prefers-color-scheme: dark` für
  `:root:not([data-thema="hell"])` und unter `:root[data-thema="dunkel"]`. So stimmt die
  Farbe schon beim ersten Bild, bevor ein Skript läuft. `theme-color` zieht mit.

```css
:root {
  --grund: #FAF9F5; --text: #141413; --text-2: #5E5D59;
  --flaeche: #F0EEE6; --flaeche-2: #E8E6DC; --linie: #B0AEA5;
  --akzent: #D97757; --auf-akzent: #141413;
  --erledigt: #788C5D; --termin: #6A9BCC;
  --knopf: #141413; --knopf-text: #FAF9F5;
  --schatten: 0 1px 2px rgba(20,20,19,.06), 0 6px 20px rgba(20,20,19,.06);
  --glas: rgba(250,249,245,.42); --glas-kante: rgba(255,255,255,.75);
  --glas-licht: rgba(255,255,255,.95); --glas-schleier: rgba(20,20,19,.10);
  --glas-tropfen: rgba(250,249,245,.86); --glas-rand: rgba(20,20,19,.16);
  --rund: 20px;
  --serif: 'Lora', Georgia, 'Times New Roman', serif;
  --sans: 'Poppins', -apple-system, 'Helvetica Neue', Arial, sans-serif;
  color-scheme: light;
}
/* dieselben Werte zweimal: automatisch und ausdrücklich gewählt */
@media (prefers-color-scheme: dark) { :root:not([data-thema="hell"]) { /* DUNKEL */ } }
:root[data-thema="dunkel"] { /* DUNKEL */ }
/* DUNKEL =
  --grund: #141413; --text: #FAF9F5; --text-2: #B0AEA5;
  --flaeche: #1F1F1D; --flaeche-2: #2B2B28; --linie: #4A4945;
  --erledigt: #9DB283; --termin: #8FB6DD;
  --knopf: #FAF9F5; --knopf-text: #141413; --auf-akzent: #141413;
  --schatten: 0 1px 2px rgba(0,0,0,.3);
  --glas: rgba(43,43,40,.40); --glas-kante: rgba(255,255,255,.22);
  --glas-licht: rgba(255,255,255,.38); --glas-schleier: rgba(0,0,0,.38);
  --glas-tropfen: rgba(43,43,40,.9); --glas-rand: rgba(255,255,255,.2);
  color-scheme: dark; */
```

Die Palette lehnt sich an Anthropics Farben an — **nur Farben und Typografie, nie Name oder
Logo**.

## 2 · Schrift

| Schrift | Schnitte | wofür |
| --- | --- | --- |
| **Lora** (Serif) | 400, 400 kursiv, 600 | Fließtext, Eingabefelder, Datum (kursiv) |
| **Poppins** (Groteske) | 500, 600 | Überschriften, Knöpfe, Etiketten, Zahlen |

- Beide unter OFL, lateinische Teilmenge, **selbst ausgeliefert** (woff2) — nie Google Fonts.
- Grundtext `17px/1.55 Lora`, `-webkit-font-smoothing: antialiased`.
- Überschriften Poppins 600, `letter-spacing: -.01em`; Kopf 28 px, unterwegs 22 px,
  Kartentitel 17–18 px, Nebenschrift 13–15 px in `--text-2`.
- **Eingabefelder mindestens 16 px**, sonst zoomt iOS beim Tippen heran (0028). Bei uns 17 px
  Lora.
- Ziffern, die sich live ändern (Uhr, Zähler), bekommen `font-variant-numeric: tabular-nums`.

## 3 · Formen und Maße

| Element | Maß |
| --- | --- |
| Inhaltsspalte | `max-width: 560px`, Rand 16 px + `env(safe-area-inset-*)`, unten 88 px frei für den schwebenden Knopf |
| Karte / Kachel | `--flaeche`, Radius `--rund` (20 px), Innenabstand 20 px, `--schatten` |
| Hauptknopf `.knopf` | min. 48 px hoch, Pille (Radius 24 px), Poppins 600 16 px, `--knopf`; `:active` → `scale(.96)` |
| zarter Knopf `.knopf.zart` | wie oben, Grund `--flaeche-2`, Schrift `--text` |
| runder Knopf `.rund` | 44 × 44, Kreis, `--flaeche`, Symbol 22 px, `aria-label`; `:active` → `scale(.92)` |
| Wahlleiste `.wahl` (Segmente) | Mulde `--flaeche-2`, Radius 16, Innenabstand 4; Segment 44 px hoch, Radius 12; gewählt = `--grund` + Schatten |
| Eingabefeld | min. 50 px, Radius 14, Rand 1,5 px `--flaeche-2`, Fokus = Rand `--akzent` |
| Zähler | Mulde wie die Wahlleiste (`--flaeche-2`, Radius 16, Innenabstand 4), darin runde Knöpfe in `--grund` mit `--schatten`; der Wert Poppins 600, `tabular-nums` |
| Timer im Glas | Ring `min(56vw, 210px)`, Strich 2,2; **in** seiner Mitte die Restzeit (Poppins 600, 40 px, `tabular-nums`) und darunter der Pausenknopf 44 × 44 |
| abhakbare Zeile (Termin) | min. 52 px hoch, Radius 14; der Haken steht rechts **in** der Zeile, die ganze Zeile ist das Ziel |
| Gast des Menüknopfs | 44-px-Kreis in `--grund` mit eigenem Schatten, oben rechts unter der Safe-Area |
| Schalter (Sonne/Mond) | 84 × 44 Pille in `--flaeche-2`, Knauf 36 px in `--grund`, beide Symbole immer sichtbar |
| schwebender Knopf (Tickets) | 52 px Kreis, unten rechts, 16/18 px vom Rand + Safe-Area |
| Hinweis aus Glas | max. 340 px breit, Radius 18 |
| Fokus | `outline: 2px solid var(--akzent); outline-offset: 2px` |

Touch-Ziele nie unter 44 × 44, keine Bedienung nur per Hover,
`-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` auf Knöpfen.

## 4 · Glas

Glas gehört **Meldungen, Hinweisen, Fragen, dem Ticketblatt** — nicht Ansichten und nicht
Karten (0014, 0019, 0024).

```css
.glas {
  background: var(--glas);
  -webkit-backdrop-filter: blur(3px) saturate(190%);
  backdrop-filter: blur(3px) saturate(190%);
  box-shadow: inset 0 1px 0 var(--glas-licht), inset 0 0 0 1px var(--glas-kante),
    0 2px 6px rgba(20,20,19,.08), 0 18px 44px rgba(20,20,19,.20);
}
```

- **Kein Vorfahr von Glas blendet seine Deckkraft** (`opacity` am Elternteil), sonst sieht
  das Glas nur den Elternteil und wird matt.
- Unterwegs (im Tropfen) ist es dichter und gefaßt: `--glas-tropfen` plus `--glas-rand`;
  am Ziel blendet es zur normalen Tönung über (0032).
- Hinter einem fragenden Glas liegt ein Schleier `--glas-schleier`; ein Tipp daneben bricht
  ab (0026).

## 5 · Symbole

- Inline-SVG, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="2"`, runde Enden und Ecken, `aria-hidden="true"`. Ein gemeinsamer Satz
  (`ICON`), keine Bilddateien.
- **Keine Emoji** — iOS und Android zeichnen sie als farbige Grafik, jeder anders.
- **Zeichen bewegen sich einmal, wenn sie erscheinen** (0035): der Haken zeichnet sich,
  das «i» läßt den Punkt fallen, der Download-Pfeil fällt. Weich, fertig bevor die Meldung
  geht. Grün ist alles, was gelang; «i» bleibt neutral.

## 6 · Bewegung

Das ist der Teil, der den Stil ausmacht. Neun Regeln:

1. **Nichts ploppt** (0007). Was aufgeht, wächst aus dem Getippten; was geht, fließt
   dorthin zurück. Der Zustand wird **sofort** gezeichnet, die Bewegung legt sich nur
   darüber — nie den Zustand verzögern, um zu animieren.
2. **Was aus einem runden Knopf kommt, ist ein Tropfen** (0008, 0023): ein Kreis
   (`border-radius: 50%`) an der Knopfposition, der zur Zielfläche aufzieht und dabei die
   Ecken annimmt. Schließen ist Öffnen rückwärts. Kacheln und Zeilen zoomen statt dessen;
   beim langen Druck tropft es aus dem Fingerpunkt (0020).
3. **Eine Tropfen-Mechanik, nicht zwei.** Ansicht, Hinweis, Menü, Formularteil — alle
   nutzen dieselbe Funktion, nur mit anderer Dauer.
4. **Der Tropfen beginnt so groß wie seine Quelle** — also aus dem kleinsten runden Teil:
   der Scheibe einer Kachel, dem Plus, der Marke einer Zeile, nie aus der ganzen Kachel oder
   einem kartenbreiten Knopf. Aus 400 px wird kein Tropfen, sondern ein Sprung (0040, 0041).
   Ein Glas, das an einem Eintrag hängt, beginnt **und endet** in dessen Scheibe.
5. **Tropfen schwingen nicht über.** Alles andere darf federn.
6. **Was zusammen geht, geht in einem Takt** — gleiche Dauer, gleiche Kurve. Zwei Takte
   sehen aus wie Schnappen (0008).
7. **Ein Vorgang, eine Bewegung** (0041, 0042). Geht ein Fenster mit seiner Meldung, wird es
   selbst zur Meldung (§7); die Ansicht dahinter wächst dann nicht noch einmal aus dem Knopf,
   sie blendet nur weich ein.
8. **Was verschwindet, hinterläßt einen Geist**: ein Abbild, das ausblendet, während der
   echte Zustand schon weg ist; gelöschte Zeilen fallen so aus der Liste (0022).
9. **Animation nur, wo sie Rückmeldung gibt.** `prefers-reduced-motion: reduce` und ein
   Schalter «Bewegung aus» in den Einstellungen stellen **alles** still.

| Größe | Wert |
| --- | --- |
| Feder (Standard) | Dämpfung 0,7, ω₀ 8, als `linear()` mit 33 Stützpunkten; Ersatz `cubic-bezier(.3, 1.25, .5, 1)` |
| Tropfen | 416 ms, `cubic-bezier(.45, 0, .2, 1)` |
| Menü | 338 ms, klappt **unter seinem Knopf** auf, nie als Blatt von unten |
| Menüeinträge | nacheinander, je 70 ms versetzt, 460 ms je Zeile; jede wächst als Perle aus ihrem Symbol (0041) |
| Zeilen im Blatt (Tickets) | nacheinander, je 160 ms versetzt — enger beim Menü, weil man es oft öffnet |
| Hinweis | 166 ms auf, schließt früh als Tropfen |
| Gemeinsamer Takt (Raster/Karte/Liste) | 640 ms, `cubic-bezier(.45, 0, .25, 1)` |
| Druck auf Knopf | 150 ms `ease`, `scale(.92)` rund / `.96` Pille |
| Langer Druck | löst nach 500 ms aus; wer hält, sieht das Ziel einsinken: `scale(.95)` Scheibe, `.97` Zeile, 350 ms `ease` nach 150 ms |
| Farbwechsel | 300 ms `ease` |
| Hell ↔ Dunkel | 1560 ms View Transition: die neue Darstellung tropft als Kreis aus dem Schalter, Kontrast von 0 auf voll; der Knauf gleitet im ersten Drittel als eigene Ebene mit (0025, 0036, 0037) |

Der Feder-Generator, ohne Abhängigkeiten:

```js
var FEDER = (function () {
  var z = 0.7, w0 = 8, wd = w0 * Math.sqrt(1 - z * z), p = [];
  for (var i = 0; i <= 32; i++) {
    var t = i / 32;
    p.push(i === 32 ? 1 : Math.round((1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) +
      z * w0 / wd * Math.sin(wd * t))) * 1000) / 1000);
  }
  var f = 'linear(' + p.join(', ') + ')';
  try { if (CSS.supports('transition-timing-function', f)) return f; } catch (e) {}
  return 'cubic-bezier(.3, 1.25, .5, 1)';
}());
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
:root[data-bewegung="aus"] *, :root[data-bewegung="aus"] *::before,
:root[data-bewegung="aus"] *::after { animation: none !important; transition: none !important; }
```

## 7 · Bedienung

- **Start ist ein Dashboard.** Alles Weitere öffnet ein **runder Menüknopf** (drei Striche)
  oben rechts. Keine Reiterleiste.
- **Das Menü hängt immer an seinem Knopf** (0041–0043). Rollt die Seite bei offenem Menü,
  folgt das Blatt dem Knopf. Ist er ganz hinaus, fällt ein Gast mit seinem Symbol aus der
  Ecke oben rechts, das Blatt im selben Takt darunter; kehrt der Knopf zurück, ist der Gast
  wieder er. Solange der Gast da ist, ist der Knopf unsichtbar — **zwei Menüknöpfe gibt es
  nie**.
- **Die Kachel-Geste: antippen hakt ab, lange drücken öffnet.** Alles, was sich abhaken läßt,
  tut dasselbe — auch ein Termin von heute (0042). Eine Zeile, die anders reagiert als die
  Kachel darüber, muß man lernen. Wo es nichts abzuhaken gibt, öffnet schon das Antippen.
- **Der Kopf hat zwei Gestalten**: daheim Titel, Datum (kursiv), Sonne/Mond, Menü;
  unterwegs Rückweg und Titel. Die Überschrift führt immer zur Übersicht.
- **Vom linken Rand wischen = zurück** (nur aus den äußersten 26 px); vom rechten Rand
  nach links öffnet das Menü (0016, 0025).
- **Rückmeldungen im Glas, nie als Zeile unten** (0019):
  - *Bestätigung* («Gespeichert»): Glas mit sich zeichnendem grünem Haken, ohne «OK», geht
    von selbst und fließt ins Gespeicherte (0018).
  - *Meldung*: Glas mit Zeichen, geht nach zwei Sekunden.
  - *Hinweis*: Glas, wartet auf «OK» — nur, was man lesen muß.
  - *Frage*: Was löscht oder nicht zurückgeht, fragt im Glas, das aus dem Knopf tropft; was
    alles ersetzt, läßt sich zudem rückgängig machen. Keinen zweiten Tipp auf denselben Knopf
    — der läßt sich mit einem Doppeltipp überspringen (0041). Eine Frage beantwortet man mit
    «Ja» und **«Nein»**; nie dasselbe Wort für Gegenteiliges («Timer abbrechen?» —
    «Abbrechen») (0042). Eine *Wahl* trägt nur ihre Knöpfe — ab bricht, wer danebentippt
    (0044).
  - *Fenster wird Meldung*: Geht ein Fenster mit seiner Meldung, zieht es sich in der Mitte
    zum Tropfen zusammen, aus dem die Meldung quillt — eine Bewegung, nicht zwei (0041).
  - **Woher sie quillt**: aus dem zuletzt getippten Knopf (höchstens drei Sekunden alt und
    noch im Bild), erst dann aus dem Fokus — iOS gibt einem getippten Knopf keinen (0041).
- **Leerzustand = Wegweiser**: ein Satz, was fehlt, und ein Knopf, der hinführt. Kein
  Tutorial. Wer schon etwas hatte, wird nicht begrüßt wie beim ersten Start (0022).
- **Jubel sparsam**: nur an Wegmarken (50 %, 90 %, neuer Rekord), jeder Anlaß einmal.
- **Formularteile, die erscheinen, tropfen aus dem Knopf, der sie öffnet** (0032) — sie
  springen nicht ins Layout.
- **Schwebender Ticketknopf** unten rechts auf jeder Ansicht; das Blatt aus Glas legt sich
  darüber und ersetzt nichts. Nur «Verwerfen» wirft einen Entwurf weg (0020, 0024).
- **Die App duzt.**

## 8 · Die Chili

- Freigestelltes PNG, steht **genau einmal** im Dokument.
- Wippt ruhig; ein gesetzter Haken läßt sie **einmal aufflammen**, ein voller Tag läßt sie
  **lodern**. Zurücknehmen ist kein Jubel.
- App-Symbol: die Chili auf Elfenbein `#FAF9F5`.
- Schriftzug «Lodern»: «Chilli» vorn und am größten, die Flammen lodern dauerhaft, der Rest
  läuft einmal ab (0010). Beim Kaltstart schreibt er sich groß in der Mitte und wandert an
  seinen Platz, dann tropft die Übersicht Karte für Karte auf (0029). Was sich währenddessen
  meldet (eine neue Fassung), wartet und tropft mit (0044).

## 9 · Rahmen fürs iPhone

- `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style: black-translucent`,
  `theme-color` je Darstellung (`#FAF9F5` / `#141413`).
- Nichts darf über den Rand ragen, auch nicht während einer Bewegung — sonst wird die Seite
  breiter und iOS verkleinert die ganze Ansicht (0029).
- **Langer Druck markiert nichts**: am Ziel `-webkit-touch-callout: none` und
  `user-select: none`; nach dem Auslösen an der ganzen Seite, bis der Finger sich hebt — sonst
  markiert iOS in der neuen Ansicht das Wort unter dem noch liegenden Finger. Ein Zeitgeber
  räumt auf, falls das Heben nie ankommt (0043).
- `<!DOCTYPE html>` in Zeile 1 (sonst Quirks-Mode in Safari).

---

## Übertragen — Checkliste

1. Tokens aus §1 übernehmen, alte Farbnamen darauf abbilden, jede Hexzahl außerhalb der
   Paletten entfernen.
2. Lora und Poppins (woff2, OFL) selbst ausliefern; Serif für Text, Poppins für Bedienung.
3. Knöpfe, Karten, Wahlleiste, Eingabefeld nach §3.
4. Meldungen auf Glas umstellen (§4, §7) — Bestätigung, Meldung, Hinweis, Frage mit
   «Ja»/«Nein»; ein Fenster, das mit seiner Meldung geht, wird selbst zu ihr.
5. Feder und Tropfen (§6) als **eine** gemeinsame Funktion im Rahmen, nicht je Modul; jeder
   Tropfen aus dem kleinsten runden Teil seiner Quelle.
6. Kachel-Geste und langer Druck (§6, §7, §9): antippen hakt ab, lange drücken öffnet,
   nichts wird markiert.
7. Reduced Motion und Schalter «Bewegung aus».
8. Sonne/Mond-Schalter mit tropfendem Wechsel.
9. Am Gerät abnehmen, hell und dunkel.
