---
paths:
  - "index.html"
---

# Oberfläche · Chillinal

Gilt für `index.html`. Hier steht nur, was beim Ändern gilt — über welche Funktion etwas
geht und welche Falle schon einmal zugeschnappt ist. Wie eine Ansicht im Einzelnen
aussieht und warum, steht im ADR (Index `docs/decisions/README.md`); die Suiten halten es
fest.

## Farben und Schrift

- **Farben nur über Tokens** (`--grund`, `--text`, `--flaeche`, `--akzent`, `--knopf`,
  `--erledigt`, `--termin`, `--glas…` usw.). Keine Hexzahl außerhalb der drei
  Paletten-Blöcke und `GRUND` im Skript.
- **Erhöhtes ist in Dunkel heller als der Grund** (`--erhoben`, `--marke`, `--spur`,
  Rand `--rand-hell`; ADR 0055) — ein Schatten trägt dort nicht. Das Flüssige zeigt im
  Fließen seinen Saum (`--fl-rand`, `--fl-hebung`), in Ruhe ist es das Teil.
- **Die dunkle Palette steht zweimal gleich**: unter `prefers-color-scheme: dark` für
  `:root:not([data-thema="hell"])` und unter `:root[data-thema="dunkel"]` — wer einen Wert
  ändert, ändert beide (Suite `thema`); den Grund zusätzlich in `GRUND`.
- **Ohne Wahl entscheidet das Stylesheet**; `themaAnwenden()` setzt nur das Attribut und
  `theme-color`.
- **Die Statusleiste** steht auf `black-translucent`; ihre Grundfarbe ist `theme-color`. Wie
  iOS die Schrift darin färbt, zeigt nur das Gerät.
- **Der Akzent ist kein Schriftgrund** (3,1 : 1). Hauptknöpfe nehmen `--knopf`, Schrift
  auf Akzent `--auf-akzent`.
- **Grün heißt erledigt, Blau heißt Termin** — sonst nichts.
- **Lora** 400, 400 kursiv, 600; **Poppins** 500, 600. Ein weiterer Schnitt nur über
  `SCHRIFTEN` in `tools/build.mjs`. Live-Ziffern bekommen `tabular-nums`.

## Aufbau

- **Kopf in zwei Gestalten** (Dashboard, unterwegs), keine Reiterleiste; nur die
  Einstellungen trennen Allgemein | Flüssig (`esReiter`, ADR 0053). Die Überschrift führt
  immer zur Übersicht.
- **Runde Knöpfe** (`.rund`) sind 44 × 44, Symbol aus `ICON`, mit `aria-label`.
- **Eine neue Ansicht** ist ein Eintrag in `ANSICHTEN`, ihre Ereignisse hängen in
  `bindeAnsicht()`. Das Menü folgt dem Pflichtenheft; ein Eintrag ohne `ziel` trägt «bald».
- **Die Kachel kennt zwei Gesten**: tippen hakt ab, lange drücken (`langDruecken`) öffnet.
  Ein zweites Ziel gibt es nicht, außer dem «−» des Zählers. Nach einem langen Druck ist
  nichts markierbar, bis der Finger sich hebt (`langHalten`).
- **Der Rückweg geht nur über `zurueckGehen()`** — Kopf und Wisch vom Rand
  (`wischBeginnen`/`wischEnden`) rufen es.
- **Was live läuft, schreibt `takt()` an Ort und Stelle** — kein `render()` im Sekundentakt.
- **Was im Fluß steht, rückt nie über den Rand** — sonst wird die Seite breiter, und iOS
  verkleinert die ganze Ansicht (ADR 0029).
- **Das Ticketblatt legt sich über die Ansicht, ersetzt sie nie**; nur «Verwerfen» wirft
  den Entwurf weg. Darin rollt nur `.tk-rolle`, nie die Karte — sonst schiebt sich der
  Inhalt über die Glaskante (ADR 0031).

## Bewegung

- **Nichts ploppt, nichts wartet** (ADR 0007): gezeichnet wird sofort, die Bewegung legt
  sich darüber. Was verschwindet, zeigt `geist(el)`; eine Zeile geht über
  `zeileGeht(el, liste, ersatz)`.
- **Es gibt eine Tropfen-Mechanik**: `tropfenAuf`/`tropfenZu` mit `tropfenQuelle` — rund,
  ohne Spitze, ohne Überschwingen. Was ein Knopf öffnet, tropft aus ihm und in ihn zurück;
  ist die Herkunft fort, in den Menüknopf. Nach langem Druck aus dem Fingerpunkt
  (`punktFlaeche`).
- **Standard ist die Chilli-Bewegung; iOS-Flüssig gilt je Stelle** (ADR 0054): Wer an einer
  Stelle bewegt, fragt `flIos(stelle)` und nimmt dann `fluessigTakt`/`fliessen`. Feste
  Dauern setzt nur `flDauernSetzen` — keine Zahl von Hand. Auf iOS ersetzt das Flüssige
  die Chilli-Bewegung, es legt sich nicht darunter (`teilFliesst`); `fliessen` malt nur
  Hals und Rest, nie das Teil. Was zurückfließt, blendet kein Vorfahr aus (am Menü nur
  der Schleier); wer fremde Bewegung abwartet, fragt `eigeneBewegung` — der Übergang vom
  Drücken zählt nicht.
- **Teile über `teilZeigen(el, an, quelle)`, Knöpfe über `teilTropfen(el, an)`**, nie
  `el.hidden = …`. Ein Teil mit eigenem `display` braucht `[hidden] { display: none; }`.
  Eine neue `.wahl` bekommt ihre Marke von `wahlenSetzen()`.
- **Glas** (`.glas`, im Tropfen `glas` im `opt`) haben Hinweis, Meldung, Ticketblatt und
  Fenster, keine Ansicht. **Kein Vorfahr von Glas blendet seine Deckkraft** — sonst bleibt
  es matt (ADR 0014). Glas an einer Gewohnheit beginnt und endet in ihrer Scheibe
  (`scheibeVon`).
- **Rückmeldung** — immer im Glas:
  - gespeichert oder angelegt: `bestaetigen()` (ohne Speichern mit `'hinweis'`, nie Haken);
  - alles andere: `melden(text, zeichen)`, `'haken'` nur bei Erfolg, `'warnung'` bei einem
    Fehlschlag (ADR 0051), sonst das neutrale «i»;
  - was man lesen muß: `hinweisZeigen` (wartet auf «OK»);
  - geht das Fenster mit: `bestaetigenUndGehen`/`meldenUndGehen` — es wird selbst zur Meldung.
- **Was ersetzt oder löscht, fragt im Glas** (`hinweisZeigen` mit `frage`, Einzelnes über
  `loeschenFragen`), verneint mit «Nein», ist bis zum Neuladen rückgängig (`rueckgaengig`).
  Kein zweiter Tipp auf denselben Knopf. Eine Wahl trägt kein «Abbrechen» — ab bricht, wer
  danebentippt.
- **Das Menü klappt unter seinem Knopf auf** (`menueOeffnen`); Schließen ist Öffnen
  rückwärts. Zwei Menüknöpfe sind nie zugleich sichtbar (`menueAnker`, `menueMitrollen`).
- **Hell/Dunkel geht über `themaSetzen(wert, quelle, traeger)`**. `aria-checked` setzt erst
  das Neuzeichnen; `thema-tropft` nimmt ein Zeitgeber wieder weg, aber nur der des letzten
  Drucks (`themaLauf`, ADR 0030, 0037).
- **Bewegt wird über `bewegt()` mit der `FEDER`**, CSS nimmt `var(--feder, ease)`. Was
  zusammen geht, geht in einem Takt (`KAL_TAKT`, `heldTakt`). Zeichen bewegen sich einmal
  über `zeichenZeichnen`.
- **Bewegung aus** (`prefers-reduced-motion` oder `data-bewegung`): alles steht still;
  wer auf das Ende einer Animation wartet, fragt `bewegungAus()`.
- **Der Kaltstart** läuft über `auftritt`; `#swNeu` tropft darin mit (`perleAuf`).

## Chili

- `#chiliFigur` steht **genau einmal** im Dokument; das Bild ist nur `CHILI_BILD`. Im offenen
  Timer sitzt sie dort, nicht im Tagesring (`chiliImTimer`, `chiliZurueck`).
- Ein Haken läßt sie flammen (`chiliFlammt`), ein voller Tag lodern (`lodert`);
  Zurücknehmen ist kein Jubel. Wegmarken jubeln über `jubeln`, jeder Anlaß einmal.
- **Ein Leerzustand ist ein Wegweiser** (`.kachel.leer`): ein Satz, was fehlt, ein Knopf
  dorthin.

## Speicher

- Alles im Zustand `state`, gespeichert über `speichern()` unter `chillinal_v1`. Neue
  Felder: Vorgabe in `grundStand()`, Prüfung in `stand()`.
