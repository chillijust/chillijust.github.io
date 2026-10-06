---
paths:
  - "index.html"
---

# Oberfläche · Chillinal

Gilt für `index.html`. Begründungen in ADR 0001 und im Pflichtenheft `docs/chillinal-plan.md`.

## Farben und Darstellung

- **Farben nur über Tokens** (`--grund`, `--text`, `--text-2`, `--flaeche`, `--flaeche-2`,
  `--linie`, `--akzent`, `--auf-akzent`, `--erledigt`, `--termin`, `--knopf`, `--knopf-text`, für Glas
  `--glas`, `--glas-kante`, `--glas-licht`, `--glas-schleier`). Keine Hexzahl
  außerhalb der drei Paletten-Blöcke und `GRUND` im Skript.
- **Die dunkle Palette steht zweimal gleich**: unter `prefers-color-scheme: dark` für
  `:root:not([data-thema="hell"])` und unter `:root[data-thema="dunkel"]`. Wer einen Wert
  ändert, ändert beide — die Suite `thema` vergleicht sie. Den Grund zusätzlich in `GRUND`
  (für `theme-color`).
- **Ohne Wahl entscheidet das Stylesheet**, nicht das Skript — `themaAnwenden()` setzt nur
  das Attribut und `theme-color`. Der Sonne/Mond-Schalter legt fest; zurück zu
  «Automatisch» nur über die Einstellungen.
- **Akzent (Chili, `#D97757`) ist kein Schriftgrund** — weiße Schrift darauf hat 3,1 : 1.
  Hauptknöpfe nehmen `--knopf`. Der Akzent gehört Symbolen, Fokus, Ring und Jubel — und, auf
  Wunsch, der Pille «Heute» und dem Kreis um den heutigen Tag; Schrift darin `--auf-akzent` (ADR 0023).
- **Grün heißt erledigt, Blau heißt Termin** — die beiden Signalfarben tragen keine
  andere Bedeutung.

## Schrift

- **Lora** für Fließtext (400, 400 kursiv, 600), **Poppins** für Überschriften, Knöpfe und
  Etiketten (500, 600). Andere Schnitte gibt es nicht; wer einen braucht, nimmt ihn in
  `SCHRIFTEN` in `tools/build.mjs` auf und legt die woff2 nach `tools/schriften/`.
- Ziffern, die sich live ändern (Uhr, «frei seit»), bekommen `font-variant-numeric:
  tabular-nums`, damit nichts springt.

## Kopf, Menü, Ansichten

- **Der Kopf hat zwei Gestalten**: Dashboard (Titel, Datum, Sonne/Mond, Menüknopf) und
  unterwegs (Rückweg, Titel). Keine Reiterleiste.
- **Die Überschrift führt zur Übersicht** (`#titelHeim`, `#markeKnopf`), immer — auch wo der
  Rückweg zum Export geht. Der Schriftzug «Lodern» kommt aus `zeichneMarke`, «Chilli» steht
  vorn und am größten; Ablauf nur mit `wm-los`, einmal — nur die Flammen lodern immer (ADR 0010).
- **Runde Knöpfe** (`.rund`) sind 44 × 44 und tragen ein Symbol aus `ICON` mit `aria-label`.
- **Der Sonne/Mond-Schalter ist ein Schieber** (`.thema-schalter`, `role="switch"`,
  `aria-checked` = dunkel): Sonne links, Mond rechts, beide immer sichtbar, der Knauf liegt
  unter dem, was gilt. Mit dem Druck tropft die neue Darstellung als runde Scheibe aus ihm
  (`themaSetzen(wert, quelle)`, `startViewTransition`, 910 ms); der Knauf gleitet derweil
  im neuen Bild hinüber (`knaufGleiten`, ADR 0025, 0026).
- **Das Menü** folgt dem Pflichtenheft in Reihenfolge und Wortlaut. Ein Eintrag ohne `ziel`
  trägt «bald»; wer ihn baut, setzt `ziel` und trägt die Ansicht in `ANSICHTEN` ein.
- **Die Kachel kennt zwei Gesten**: kurz tippen hakt ab, lange drücken (`langDruecken`)
  öffnet die Gewohnheit. Ein zweites Ziel auf der Kachel gibt es nicht (ADR 0003).
- **Die Abgewöhnen-Kachel** hat nichts abzuhaken: Antippen oder lange drücken öffnet sie;
  *Drang* und *Rückfall* sind eigene Knöpfe darunter (ADR 0004).
- **Ein Termin ist eine Zeile mit blauem Strich** (`zeichneTerminZeile`), auf dem
  Dashboard wie in der Tagesliste; im Kalender trägt sein Tag **einen** blauen Punkt, vorn
  (ADR 0006). Die Tagesansicht ist die Liste unter dem Kalender, keine eigene Ansicht. Ein
  kommender Tag zeigt dort, was dran ist, ohne Haken; «Hinzufügen» fragt in einem Fenster
  aus Glas — Termin, Gewohnheit, Abgewöhnen (`opt.wahl`, ADR 0025); ein Tipp daneben bricht
  ab wie «Abbrechen» (ADR 0026). Im Monat läuft über jeder Woche ein Strich quer bis an den
  Kartenrand, die KW links außen darauf; eine KW-Spalte gibt es nicht.
- **Der Kalender-Export** hat einen Weg, «Als Datei laden» — Teilen kam am Gerät nicht im
  Kalender an (ADR 0013); eine Gewohnheit trägt dort einen grauen Strich, keinen blauen. Was aus dem Export geöffnet
  wird, kehrt über `rueckZiel` dorthin zurück (ADR 0009).
- **Was schon im Kalender steht, tritt zurück** (`.ex-alt`) und geht nur über «Bearbeiten»
  noch einmal hinaus; Neues geht immer mit, Geändertes trägt einen Vermerk (ADR 0011).
- **Was live läuft, schreibt `takt()` an Ort und Stelle** (`[data-frei]`,
  `[data-wellerest]`, der Ring der Welle) — kein `render()` im Sekundentakt.
- **Der Rückblick** (`zeichneHeatmap`) steht über «Stand» in der Gewohnheit und im Abgewöhnen:
  26 Wochen, getönt nach dem Zustand des Tages. Das Raster wählt nur die Woche, die Tage
  stehen darunter groß; ein Tag nennt sich und ändert nichts (ADR 0015).
- **Vom linken Rand wischen ist der Rückweg** (`wischBeginnen`/`wischEnden`): nur aus den
  äußersten 26 px, wirkt beim Loslassen über `zurueckGehen()`, schweigt bei offenem Menü
  oder Hinweis (ADR 0016). Wer den Rückweg ändert, ändert `zurueckGehen()`. Auf dem
  Dashboard öffnet derselbe Wisch das Menü (ADR 0023); vom **rechten** Rand nach links
  öffnet er es überall (ADR 0025).
- **Die Wochenreflexion steht nur sonntags auf dem Dashboard**, unter den fälligen
  Gewohnheiten; geschrieben wird außerdem jederzeit über das Journal, auch für vergangene
  Wochen, nie für eine kommende (ADR 0017, 0018). Fertiges öffnet zum Lesen (`data-lesen`),
  geändert und gelöscht wird erst über «Bearbeiten».
- **Eine neue Ansicht** ist ein Eintrag in `ANSICHTEN` (`titel`, `zeichnen`), ihre Ereignisse
  hängen in `bindeAnsicht()` — nie als Attribut.
- **Der Ticketknopf schwebt unten rechts auf jeder Ansicht; das Ticketblatt legt sich darüber,
  es ersetzt sie nie** — ein halbes Formular darunter bleibt stehen. Nur «Verwerfen» wirft
  einen Entwurf weg (ADR 0020). `#app` hält dem Knopf unten Platz frei. Das Blatt steht
  **unten** und rückt mit der Tastatur hoch (`ticketTastatur`); «Alle Tickets» im Kopf
  zeigt die Liste im selben Blatt, mit Zurück, ohne den Entwurf zu verlieren; ihre Zeilen
  tropfen sichtbar nacheinander auf, je 110 ms später (ADR 0021, 0025, 0026). Der Fließtext
  ist leer so hoch wie der Titel und wächst bis drei Zeilen. Es ist aus Glas, wie Hinweis
  und Meldung, auch im Tropfen (ADR 0024).
- **Was alles ersetzt oder löscht, fragt im Glas** (`hinweisZeigen` mit `frage`) und läßt
  sich bis zum Neuladen rückgängig machen (`rueckgaengig`); Einzelnes fragt mit zweitem Tipp
  (`.frage`).

## Chili

- `#chiliFigur` steht **genau einmal** im Dokument. Das Bild ist `CHILI_BILD`, eingebettet
  von `build.mjs` — nie eine zweite Kopie als Daten-URI von Hand.
- **Ein gesetzter Haken läßt sie einmal aufflammen** (`chiliFlammt`, Klasse `flammt`) —
  auf der Kachel wie beim Nachtragen; Zurücknehmen ist kein Jubel. Macht der Haken den Tag
  voll, **lodert** sie statt dessen (`lodert`). Danach wippt sie weiter.
- **Wegmarken jubeln im Glas** (`jubeln`, ADR 0022): Stärke 50 % und 90 % nach der Anzeige
  (`hakenJubel`, die Chili lodert), «Nicht zweimal» (sie flammt), ein neuer Rekord beim
  Abgewöhnen (`rekordFeiern`, nur auf dem Dashboard). Jeder Anlaß nur einmal — kein Jubel
  für jede Zahl.
- **Ein Leerzustand ist ein Wegweiser**: ein Satz, was fehlt, und ein Knopf, der hinführt
  (`.kachel.leer`); wer schon etwas hatte, wird nicht begrüßt wie beim ersten Start.

## Bewegung

- **Nichts ploppt** (ADR 0007). Was aufgeht, wächst aus dem Getippten, was geht, fließt
  zurück — gezeichnet wird trotzdem sofort, die Bewegung legt sich darüber. Was
  verschwindet, zeigt `geist(el)`; nie den Zustand verzögern, um zu animieren. Eine Zeile,
  die aus einer Liste gelöscht wird, geht über `zeileGeht(el, liste, ersatz)` (ADR 0022).
- **Formularteile über `teilZeigen(el, an)`**, nie `el.hidden = …`; eine neue `.wahl`
  bekommt ihre Marke von `wahlenSetzen()`, nach Änderung an Ort und Stelle aufrufen.
- **Knöpfe, die kommen und gehen, über `teilTropfen(el, an)`** (ADR 0012). Ein Teil mit
  eigenem `display` braucht `[hidden] { display: none; }`, sonst bleibt es sichtbar.
- **Gespeichert und Angelegt bestätigt `bestaetigen()`**, nie `melden()`: der Hinweis aus Glas
  mit Haken, ohne «OK», geht von selbst und fließt ins Gespeicherte (ADR 0018). Wurde nichts
  gespeichert, dasselbe Glas mit neutralem Zeichen (`'hinweis'`), nie der grüne Haken.
- **Jede andere Meldung über `melden(text, zeichen)`** — auch sie erscheint im Glas, eine
  Zeile unten gibt es nicht mehr; `'haken'` nur, wenn etwas gelang (ADR 0019).
- **Was man lesen muß, bevor es weitergeht, ist ein Hinweis** (`hinweisZeigen`, wartet auf
  «OK»), keine Meldung — die geht nach zwei Sekunden. Er tropft mit `tropfenAuf`/`tropfenZu`
  wie eine Ansicht, nur mit `HINWEIS_DAUER` (60 % schneller) und beim Schließen früh als
  Tropfen (`frueh`); **eine zweite Tropfen-Mechanik gibt es nicht** (ADR 0013). Er ist aus
  Glas (`.glas`), auch im Tropfen (`glas` im `opt`); Ansichten nicht. **Kein Vorfahr von
  Glas blendet seine Deckkraft** — sonst sieht es nur ihn und bleibt matt (ADR 0014).
- **Bewegt wird über `bewegt()` mit der `FEDER`**; CSS nimmt `var(--feder, ease)`. Ausnahme: Tropfen
  schwingen nicht über (ADR 0008).
- **Was aus einem runden Knopf kommt oder in ihn geht, ist ein Tropfen** (`tropfenAuf`,
  `tropfenZu`, `tropfenQuelle`) — rund (`TROPFEN`), ohne Spitze; zurück fließt er, ist die
  Herkunft fort, in den Menüknopf (ADR 0023). Kacheln und Zeilen zoomen —
  außer beim langen Druck: dann tropft es aus dem Fingerpunkt (`punktFlaeche`, ADR 0020).
- **Das Menü klappt unter seinem Knopf auf** (`menueOeffnen`, `blattLegen`), nie als Blatt
  von unten. Schließen ist Öffnen rückwärts — gleiche Dauer, gespiegelte Bilder.
- **Was zusammen geht, geht in einem Takt**: Wer Raster, Karte und Liste zugleich bewegt,
  gibt allen dieselbe Dauer und Kurve (`KAL_TAKT`, `heldTakt`) — zwei Takte sehen aus wie
  Schnappen (ADR 0008).
- Animation nur, wo sie Rückmeldung gibt (Abhaken, Ring, Schalter, Blatt). Unter
  `prefers-reduced-motion: reduce` steht alles still, ebenso mit `bewegung: 'aus'` aus den
  Einstellungen (`data-bewegung`); Abläufe, die auf das Ende einer Animation warten, fragen
  `bewegungAus()`.

## Speicher

- Alles im Zustand `state`, gespeichert über `speichern()` unter `chillinal_v1`. Neue
  Felder: Vorgabe in `grundStand()`, Prüfung in `stand()`.
