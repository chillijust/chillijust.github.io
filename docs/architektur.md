# Architektur

`index.html` enthält alles: Markup, Stile und Logik. Rund 2200 Zeilen, aufgeteilt in
drei Abschnitte — `<style>`, statisches Grundgerüst im `<body>`, ein einzelner
`<script>`-Block.

## Grundgerüst

Im Body stehen nur die Teile, die immer sichtbar sind: Kopfzeile mit Titel und
Statuszeile, die Tab-Leiste und ein leerer Container `#main`. Alles Weitere erzeugt
JavaScript.

Die Tab-Leiste steckt in einem eigenen Rahmen `#navbar`: Der Rahmen klebt beim Scrollen
(`position: sticky`), trägt den Hintergrund und zieht sich über die Innenabstände des
Body bis unter die Notch. Die eigentliche Leiste `#tabs` darf waagerecht scrollen. Läge
der Hintergrund auf `#tabs`, würde `overflow-x` ihn oben abschneiden — dann scrollt der
Inhalt sichtbar durch den Streifen über den Reitern.

## Kopfbereich

Der Kopf ist kein reines Logo, sondern Statusanzeige:

- `updateKopf()` füllt die Fortschrittsleiste (Anteil gemeisterter Wörter, also
  `state.boxes[id] >= BOX_MAX` gegen `ALL_VOCAB.length`) und schreibt das Label
  darunter. Die Serie erscheint erst ab drei richtigen Antworten in Folge. Aufgerufen
  wird die Funktion am Ende von `render()`, nach `updateBox()` und beim Start — sie ist
  billig genug, um bei jedem Zeichnen mitzulaufen.
- `zeigeStatus(art, text)` bespielt die Statuszeile rechts daneben. `'ok'` blendet
  „gespeichert" mit Haken ein und nach zwei Sekunden wieder aus, `'err'` bleibt stehen.
  Die Zeile ist `role="status"` mit `aria-live="polite"`, damit VoiceOver sie vorliest,
  ohne die Bedienung zu unterbrechen.
- Die Einstellungen hängen am Reglerknopf oben rechts, nicht an einem fünften Reiter —
  siehe ADR 0005.

## Sprachfakten

Nach je fünf Antworten erscheint ein Fakt (`naechsterFakt()` bevorzugt Ungesehenes, dann
das am seltensten Gezeigte). Gemerkt wird er unter `faktId()` — einem kurzen Hash über den
Text statt des Textes selbst, damit der Sicherungscode nicht aufbläht und ein Umsortieren
der Datei nichts zerstört. `saubereFakten()` wirft beim Laden Einträge weg, zu denen es
keinen Fakt mehr gibt.

Die Sammlung (`renderFakten()`) ist eine eigene Ansicht ohne Reiter — erreichbar über die
Faktenkarte und über die Bilanz, zurück über `letzterTab`. Sie filtert nach Gesehenem,
Favoriten oder allen und zeigt je Fakt, wie oft er dran war.

## Darstellung

Dunkel ist die Grundeinstellung im `:root`. Die helle Palette hängt an zwei Stellen:
`@media (prefers-color-scheme: light)` greift nur, solange **kein** `data-theme` gesetzt
ist (`:root:not([data-theme])`), und `:root[data-theme="hell"]` setzt sie ausdrücklich.
`updateDarstellung()` schreibt das Attribut und färbt `meta[name=theme-color]` nach, damit
die Statusleiste auf dem iPhone passt.

## Maskottchen

Die Chili aus dem App-Symbol tritt in der App an vier Stellen auf, immer über
`maskottchen(klasse)`. Die Funktion liest das Bild aus dem `<link
rel="apple-touch-icon">` — so liegt es **genau einmal** in der Datei, statt für jeden
Auftritt neu eingebettet zu werden:

| Ort | Größe | Zweck |
| --- | --- | --- |
| Faktenkarte | 38 px | die Chili erzählt den Sprachfakt |
| Leerzustände (Tippen, Übersetzen, Faktensammlung) | 96 px | nimmt der Sperre die Härte |
| Jubelkarte nach einem geschafften Lernset | 96 px | der Moment, auf den das Lernen zuläuft |

Die Jubelkarte (`uebPhase === 'setfertig'`) erscheint, sobald eine Antwort das laufende
Set vollmacht — allerdings erst beim nächsten «Weiter», damit sie nicht die Auflösung
verdeckt. Sie nennt die freigeschalteten Sätze und führt mit einem Knopf direkt nach
„Übersetzen". `uebZuruecksetzen()` räumt die Frage dabei auf; ohne das stünde „Üben" bei
der Rückkehr noch in der Jubelphase und zeigte eine Frage ohne Knöpfe.

## Symbole

Das App-Symbol für „Zum Home-Bildschirm" liegt als PNG-Daten-URI im `<link
rel="apple-touch-icon">`: das Maskottchen — eine Chili mit «Я»-Sprechblase — aus
`docs/IMG_2942.png`, auf 180 px verkleinert. Ein 32-px-Zwilling dient als Symbol im
Browser-Reiter. Damit bleibt die ausgelieferte Datei allein, ohne dass ein Bild
danebenliegen muss. Das Original bleibt in `docs/` als Quelle für spätere Größen.

`ICON` (am Anfang des Skripts) hält alle Symbole als Inline-SVG, gezeichnet mit
`stroke="currentColor"`, also immer in der Farbe des umgebenden Elements. **Keine
Emoji-Zeichen im Auslieferungspfad:** iOS rendert Zeichen aus dem Emoji-Bereich als
farbige Grafik, die in einer sonst einfarbigen Oberfläche wie aufgeklebt wirkt.
`tools/pruefen.mjs` bricht ab, wenn ein solches Zeichen in `index.html` auftaucht.

Typografische Zeichen wie `→` oder `␣` bleiben Text — sie sind keine Emoji und werden
überall gleich dargestellt.

## Zustand

Ein einziges Objekt `state` hält den gesamten Lernstand:

| Feld | Bedeutung |
| --- | --- |
| `boxes` | Leitner-Stufe je Wort (Kennung = das russische Wort), 0 bis `BOX_MAX` |
| `lastSeen` | Zeitstempel je Wort — Grundlage der Wiedervorlage |
| `typingStats`, `transStats` | Zähler für Tippen und Übersetzen |
| `readSeen` | bereits geübte Sätze, unter ihrem russischen Text |
| `streak`, `bestStreak` | laufende und beste Antwortserie |
| `answered` | Gesamtzahl beantworteter Fragen |
| `factIdx` | Zähler der gezeigten Fakten |
| `fakten` | je Sprachfakt `{ n: wie oft gezeigt, f: Favorit }`, unter einer kurzen Kennung |
| `settings` | Einstellungen des Nutzers, siehe unten |

Daneben existieren pro Rubrik einige Modulvariablen (`uebQ`, `uebPhase`, `trTask`,
`tWord` …). Sie beschreiben die aktuelle Frage und sind bewusst **nicht** Teil von
`state` — sie überleben einen Neustart nicht und sollen es auch nicht.

## Einstellungen

`state.settings` liegt im selben `localStorage`-Eintrag wie der Fortschritt. `mergeState()`
übernimmt nur Werte, deren Typ zur Vorgabe passt — und prüft `tippenAbStufe` zusätzlich
auf einen sinnvollen Bereich:

| Schalter | Vorgabe | Wirkung |
| --- | --- | --- |
| `confirmUeben` | an | Beim Vokabeltraining wird eine Antwort erst gewählt und dann über „Bestätigen" abgegeben. Aus: Der erste Tipp zählt sofort. |
| `confirmUebersetzen` | an | In „Übersetzen" wird der Satz erst gelegt und dann bestätigt. Aus: Der Satz zählt, sobald das letzte Wort liegt. |
| `requireComplete` | aus | „Bestätigen" ist erst möglich, wenn die Lösung vollständig ist. Verrät dadurch deren Länge. |
| `tippenAbStufe` | 4 | Ab welcher Leitner-Stufe ein Wort in „Tippen" erscheint (2, 3 oder 4). |
| `tastaturAn` | aus | Zeigt die eingebaute Tastatur in „Tippen" gleich beim Öffnen. |
| `darstellung` | `system` | `system`, `dunkel` oder `hell`. Steuert `data-theme` am `<html>`-Element. |

Eine neue Einstellung braucht drei Dinge: einen Vorgabewert in `defaultSettings()`,
eine Zeile in `renderEinstellungen()` und — falls sie das Verhalten einer Rubrik
ändert — eine Abfrage an der betreffenden Stelle. `mergeState()` sorgt dafür, dass
bestehende Lernstände die neue Einstellung mit ihrem Vorgabewert bekommen; deshalb darf
`state.settings` nie als Ganzes aus dem gespeicherten Stand übernommen werden.

Einstellungen sind kein Fortschritt: „Fortschritt zurücksetzen" in der Bilanz lässt sie
stehen. Eine wiederhergestellte Sicherung bringt dagegen die dort gespeicherten
Einstellungen mit, weil `mergeState()` auch auf dem Sicherungscode arbeitet.

Erreichbar sind sie über den Reglerknopf in der Kopfzeile, nicht über einen eigenen Tab —
die Tab-Leiste trägt bereits fünf Rubriken.

## Lernweg: Lernsets, Freestyle, Fälligkeit

Alle Übungsrubriken ziehen aus demselben Bestand (`ALL_VOCAB`) und schreiben in denselben
Leitner-Stand (`state.boxes`). Unterschiedlich ist nur, *welchen Ausschnitt* sie sehen:

| Rubrik | Ausschnitt |
| --- | --- |
| Lernsets | das laufende Set, wahlweise ein früheres oder alle freigeschalteten |
| Freestyle | ein Thema freier Wahl oder der ganze Bestand, ohne Sperre |
| Tippen | nur Wörter ab `settings.tippenAbStufe` (Vorgabe 4, also gemeistert) |
| Übersetzen | nur Sätze, deren Voraussetzungen alle mindestens `SATZ_STUFE` (2) haben |

- **Lernsets** entstehen beim Start aus den Sätzen (`LERNSETS`): Die Sätze werden nach
  ihrem im Lehrplan spätesten Wort sortiert; ihre noch unbekannten Voraussetzungen füllen
  ein Set, bis `SET_MAX` (12) erreicht ist. Jedes Set kennt damit die Sätze, die es
  freischaltet — das ist der kurze Weg vom Vokabeltraining zum ganzen Satz. Aktuell:
  12 Sets, 133 Wörter; die übrigen 247 sind Freestyle-Material.
- Ein Set gilt als geschafft, wenn jedes seiner Wörter `SATZ_STUFE` erreicht hat — genau
  die Schwelle, ab der auch die Sätze erscheinen. `aktuellesSet()` ist das erste
  ungeschaffte; spätere sind gesperrt.
- **Freestyle** kennt keine Sperre: Thema wählen (oder „Alle") und üben. Es ist der Ort
  für die Wörter, die kein Satz braucht.
- Beide Rubriken teilen sich Fragelogik und Zustand; `uebModus` entscheidet über
  Wortvorrat und Kopfzeile, `render()` setzt beim Rubrikwechsel die Frage zurück.
- **Fälligkeit** steckt in `state.lastSeen[id]` und `INTERVALL` (neu · 1 · 3 · 7 · 21 Tage
  je Leitner-Stufe). `waehleWort(pool, nurWiederholen)` wählt in drei Stufen: fällige
  Wiederholungen, dann noch nie gesehene Wörter, dann das am längsten zurückliegende Wort
  mit der niedrigsten Stufe. Mit `nurWiederholen` zählt allein das Alter.
- **Tippen** ist gesperrt, bis Wörter die Schwelle erreichen; der Leerzustand nennt die
  drei Wörter, die am nächsten dran sind. Während der Rückmeldung bleibt das Wort stehen,
  auch wenn ein Fehler es unter die Schwelle geworfen hat.
- **Übersetzen** prüft `benoetigt` gegen `state.boxes`; die Stufenleiste zeigt je Stufe,
  wie viele Sätze offen sind. Geübte Sätze merkt sich `state.readSeen` unter ihrem
  russischen Text.
- **Buchstaben-Kacheln** liegen in Überzahl aus: `zusatzBuchstaben()` legt zwei bis drei
  Zeichen dazu, die nicht im Wort vorkommen. `q.laenge` ist die Zahl der Felder — nicht
  die Zahl der Kacheln.

Die Wort-Kennung ist das russische Wort selbst, nicht `Thema::wort`. Damit überlebt der
Lernstand jede Umbenennung und Umsortierung der Themen; `migriereIds()` schreibt alte
Stände beim Laden um.

## Persistenz

`load()` und `save()` sprechen `localStorage` unter dem Schlüssel
`russisch_trainer_v1` an, beide in `try/catch`. `save()` ist um 400 ms entprellt,
damit schnelle Klickfolgen nicht bei jedem Tastendruck schreiben. Schlägt das
Schreiben fehl (privater Modus, volles Kontingent), erscheint ein Hinweis auf den
Sicherungscode in der Bilanz statt eines stillen Datenverlusts.

Ein Schemawechsel braucht einen neuen Schlüssel (`…_v2`) plus Migration in `load()` —
sonst verlieren bestehende Nutzer ihren Stand.

## Render-Zyklus

```
Ereignis → Zustand ändern → save() → render()
```

`render()` verzweigt anhand von `currentTab`: `lernsets` und `freestyle` führen beide in
`renderUeben()` (mit gesetztem `uebModus`), dazu `renderTippen()`, `renderUebersetzen()`,
`renderEinstellungen()` und `renderBilanz()`. Den Wechsel übernimmt
immer `setTab()` — es merkt sich in `letzterTab` den Rückweg aus den Einstellungen und
hält die Markierungen in Tab-Leiste und Zahnrad in Einklang. Jede dieser Funktionen baut eine
HTML-Zeichenkette, setzt sie als `innerHTML` von `#main` und hängt anschließend die
Ereignisbehandler an die frisch erzeugten Knoten. Es gibt kein virtuelles DOM und keine
Teilaktualisierung: eine Rubrik wird immer vollständig neu gezeichnet.

Daraus folgen zwei Regeln:

1. Jede eingebettete Zeichenkette läuft durch `esc()`. Die Lerninhalte sind zwar
   vertrauenswürdig, aber der Sicherungscode kommt aus einer Eingabe des Nutzers.
2. Ereignisbehandler werden **nach** dem Setzen von `innerHTML` gesetzt, niemals als
   `onclick`-Attribut.

## Stil-Konventionen im Skript

Die Datei ist durchgehend in ES5-naher Schreibweise gehalten: `var`, klassische
`function`-Ausdrücke, keine Module, keine Klassen, kein `async`. Das ist Absicht — die
Datei soll ohne Transpilation überall laufen und für jemanden lesbar bleiben, der sie in
einem Jahr zum ersten Mal wieder aufmacht. Neue Abschnitte folgen demselben Stil, damit
die Datei nicht in zwei Dialekten geschrieben ist.

Gliederung im Skript über Kommentarbalken (`// ── DATEN ───…`). Der Datenblock zwischen
`DATEN:START` und `DATEN:ENDE` wird generiert und darf nicht von Hand bearbeitet werden
(siehe [`datenmodell.md`](datenmodell.md)).
