# Architektur

`index.html` enthält alles: Markup, Stile und Logik. Rund 1400 Zeilen, aufgeteilt in
drei Abschnitte — `<style>`, statisches Grundgerüst im `<body>`, ein einzelner
`<script>`-Block.

## Grundgerüst

Im Body stehen nur die Teile, die immer sichtbar sind: Kopfzeile mit Titel und
Statusabzeichen, die Tab-Leiste (`#tabs`) und ein leerer Container `#main`. Alles
Weitere erzeugt JavaScript.

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

## Symbole

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
| `boxes` | Leitner-Stufe je Vokabel-ID (`Thema::русское слово`), 0 bis `BOX_MAX` |
| `typingStats`, `transStats` | Zähler für Tippen und Übersetzen |
| `readSeen` | bereits gezeigte Vokabeln |
| `streak`, `bestStreak` | laufende und beste Antwortserie |
| `answered` | Gesamtzahl beantworteter Fragen |
| `factIdx` | Position im Fakten-Karussell |
| `settings` | Einstellungen des Nutzers, siehe unten |

Daneben existieren pro Rubrik einige Modulvariablen (`uebQ`, `uebPhase`, `trTask`,
`tWord` …). Sie beschreiben die aktuelle Frage und sind bewusst **nicht** Teil von
`state` — sie überleben einen Neustart nicht und sollen es auch nicht.

## Einstellungen

`state.settings` enthält ausschließlich Wahrheitswerte und liegt im selben
`localStorage`-Eintrag wie der Fortschritt:

| Schalter | Vorgabe | Wirkung |
| --- | --- | --- |
| `confirmUeben` | an | In „Üben" wird eine Antwort erst gewählt und dann über „Bestätigen" abgegeben. Aus: Der erste Tipp zählt sofort. |
| `confirmUebersetzen` | an | In „Übersetzen" wird der Satz erst gelegt und dann bestätigt. Aus: Der Satz zählt, sobald das letzte Wort liegt. |
| `requireComplete` | aus | „Bestätigen" ist erst möglich, wenn die Lösung vollständig ist. Verrät dadurch deren Länge. |

Eine neue Einstellung braucht drei Dinge: einen Vorgabewert in `defaultSettings()`,
eine Zeile in `renderEinstellungen()` und — falls sie das Verhalten einer Rubrik
ändert — eine Abfrage an der betreffenden Stelle. `mergeState()` sorgt dafür, dass
bestehende Lernstände die neue Einstellung mit ihrem Vorgabewert bekommen; deshalb darf
`state.settings` nie als Ganzes aus dem gespeicherten Stand übernommen werden.

Einstellungen sind kein Fortschritt: „Fortschritt zurücksetzen" in der Bilanz lässt sie
stehen. Eine wiederhergestellte Sicherung bringt dagegen die dort gespeicherten
Einstellungen mit, weil `mergeState()` auch auf dem Sicherungscode arbeitet.

Erreichbar sind sie über das Zahnrad in der Kopfzeile. Es ist bewusst kein fünfter Tab:
Die Tab-Leiste ist auf dem iPhone bereits voll, ein fünfter Eintrag läge außerhalb des
Sichtbereichs.

## Lernweg: Päckchen, Fälligkeit, Freischaltung

Alle drei Übungsrubriken ziehen aus demselben Bestand (`ALL_VOCAB`) und schreiben in
denselben Leitner-Stand (`state.boxes`). Unterschiedlich ist nur, *welchen Ausschnitt*
sie sehen:

| Rubrik | Ausschnitt |
| --- | --- |
| Üben | das laufende Päckchen (12 Wörter), wahlweise ein früheres oder alle freigeschalteten |
| Tippen | nur Wörter ab `settings.tippenAbStufe` (Vorgabe 4, also gemeistert) |
| Übersetzen | nur Sätze, deren Voraussetzungen alle mindestens `SATZ_STUFE` (2) haben |

- **Päckchen** sind fortlaufende Abschnitte von `PAKET_GROESSE` (12) Wörtern in der
  Reihenfolge der Daten. `aktuellesPaket()` ist das erste, in dem noch nicht jedes Wort
  `PAKET_STUFE` (3) erreicht hat. Spätere Päckchen sind gesperrt, solange
  `settings.paketSperre` gilt.
- **Fälligkeit** steckt in `state.lastSeen[id]` (Zeitstempel) und `INTERVALL`
  (neu · 1 · 3 · 7 · 21 Tage je Leitner-Stufe). `faellig()` entscheidet, ob ein Wort zur
  Wiedervorlage ansteht.
- **`waehleWort(pool, nurWiederholen)`** wählt in drei Stufen: fällige Wiederholungen,
  dann noch nie gesehene Wörter, dann — innerhalb einer Sitzung der Regelfall — das am
  längsten zurückliegende Wort mit der niedrigsten Stufe. Mit `nurWiederholen` (Ansicht
  „Wiederholung") zählt allein das Alter: bereits Begonnenes, ältestes zuerst.
- **Tippen** ist gesperrt, bis Wörter die Schwelle erreichen; der Leerzustand nennt die
  drei Wörter, die am nächsten dran sind. Während der Rückmeldung bleibt das Wort stehen,
  auch wenn ein Fehler es unter die Schwelle geworfen hat.

- **Übersetzen** hängt am selben Lernstand: `satzFrei()` prüft die Liste `benoetigt`
  eines Satzes gegen `state.boxes`. Die Stufenleiste zeigt je Stufe, wie viele Sätze
  offen sind (`3/20`); ist keiner frei, nennt der Leerzustand die fehlenden Wörter des
  am nächsten liegenden Satzes. Geübte Sätze merkt sich `state.readSeen` unter ihrem
  russischen Text — nicht unter einer Nummer, die sich beim Umsortieren verschiebt.

Die Wort-Kennung ist seit dieser Fassung **das russische Wort selbst**, nicht mehr
`Thema::wort`. Damit überlebt der Lernstand jede Umbenennung und jede Umsortierung der
Themen. `migriereIds()` schreibt alte Stände beim Laden um.

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

`render()` verzweigt anhand von `currentTab` in `renderUeben()`, `renderUebersetzen()`,
`renderTippen()`, `renderEinstellungen()` oder `renderBilanz()`. Den Wechsel übernimmt
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
