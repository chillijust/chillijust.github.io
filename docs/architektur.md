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

Die Chili ist aus dem Icon freigestellt (`tools/freistellen.py`) und existiert **genau
einmal**: als `#chiliFigur` in der Hülle `#chiliBuehne`
(`position: absolute; inset: 0; pointer-events: none`). Die Hülle steht **im Fluss** —
sie steckt immer in genau einem Platzhalter und füllt ihn aus.

Ansichten zeichnen die Figur nicht, sie stellen nur einen **Platzhalter** auf:
`maskottchen(klasse)` liefert ein leeres `div.chili-platz[data-chili]`
(`position: relative`) in der gewünschten Größe. `chiliAktualisieren()` sucht den
Platzhalter in `#main` — fehlt er, gilt der im Kopf — und hängt die Bühne per
`appendChild` dorthin um.

| Station | Größe | Anlass |
| --- | --- | --- |
| Kopfzeile, mittig zwischen Titel und Reglerknopf | 52 px | Grundzustand |
| Kompakte Zone über den Reitern, links | 30 px | wenn die Kopfzeile weggescrollt ist |
| Sprechblase der Faktenkarte | 76 px | alle fünf Antworten |
| Leerzustände (Tippen, Übersetzen, Faktensammlung) | 104 px | wenn nichts freigeschaltet ist |
| Jubelkarte | 104 px | wenn ein Lernset voll wird |

Der Platz im Kopf hängt über `position: absolute; left: 50%` mittig an der Kopfzeile —
unabhängig davon, wie breit Titel und Reglerknopf gerade sind.

Ein Platzhalter in `#main` geht immer vor: steht die Figur in einer Karte, gehört sie
dorthin — auch beim Scrollen. Nur wenn die Ansicht keinen aufstellt, entscheidet der
Scrollzustand zwischen kompakter Zone und Kopfzeile.

**Kein Nachrechnen.** Es gibt keine Positionsrechnung je Bild. Weil die Figur ein Kind
ihres Platzhalters ist, scrollt sie starr mit dem Inhalt (ADR 0012). Der einzige
Scroll-Horcher schaltet eine Klasse um, mehr nicht.

## Kopfzeile und kompakte Zone

Die Reiterleiste (`#navbar`) klebt **nicht** am Viewport-Rand, sondern
`--kompakt-hoehe` darunter (`calc(env(safe-area-inset-top) + 14px + 46px)`). Genau
diesen Platz füllt `#kompakt`: ein festes Element am oberen Rand mit der Chili links und
einem zweiten Reglerknopf rechts.

`kompaktPruefen()` vergleicht `navbar.getBoundingClientRect().top` mit dem gesetzten
`top` — sind sie gleich, klebt die Leiste, also ist die Kopfzeile weg. Dann bekommt
`<body>` die Klasse `kompakt`, die Zone wird von `display: none` auf `flex` geschaltet
und die Chili dorthin umgehängt (ohne Sprung). Der Horcher ist über
`requestAnimationFrame` gedrosselt und rechnet keine Position.

Die Zone selbst schaltet **hart**; nur ihr Inhalt blendet über `kompaktAuf` weich ein.
Ein Übergang auf der Zone ließe den durchlaufenden Inhalt kurz durchschimmern.

Beide Reglerknöpfe tragen `data-regler`: `setTab()` setzt die Klasse `active` auf allen,
Klick und Symbol hängen ebenfalls an allen. Ein dritter Knopf würde ohne Codeänderung
mitlaufen.

**Warum die Leiste keinen festen Innenabstand mehr trägt:** Früher hielt
`padding-top: var(--pad-oben)` den Streifen dauerhaft frei. Im Browser fiel das kaum auf
(`env(safe-area-inset-top)` ist dort 0), im Vollbild vom Home-Bildschirm stand dort eine
Lücke von rund 73 px zwischen Kopfzeile und Reitern (ADR 0013).

**Springen.** `chiliAktualisieren()` läuft über einen `MutationObserver` auf `#main`,
merkt also jeden Ansichtswechsel, ohne dass eine Renderfunktion daran denken muss. Der
Sprung besteht aus zwei Teilen auf zwei Elementen, die sich nicht ins Gehege kommen:

- **Die Figur** bekommt die Klasse `springt` (Keyframes `chiliSprung`, 0,23 s): ducken,
  Eigenhub, Rotation, federn. Ein Zeitgeber räumt die Klasse danach ab.
- **Die Hülle** fliegt über `chiliFlug()` von der alten zur neuen Lage — waagerecht
  gleichförmig, senkrecht eine Parabel darüber, dazu der Größenwechsel. Neun Stützstellen
  über `Element.animate()`, `linear`, 0,19 s nach 0,03 s Verzögerung: erst ducken, dann
  fliegen, am Ende federn.

Die alte Lage kommt aus `chiliLage()` in **Dokumentkoordinaten** — die Figur steht im
Fluss und scrollt mit, ihre Lage im Dokument bleibt also gültig. Hängt die alte Station
noch im Dokument (typisch: der Platz im Kopf), wird sie direkt gemessen; nach einem
Ansichtswechsel ist sie fort, dann trägt die gemerkte `chiliSpur`. Unter 8 px lohnt der
Flug nicht, über 900 px ist die alte Lage vermutlich veraltet — beides bleibt beim reinen
Hüpfer.

**Die Blase kommt kurz nach der Landung:** `.sprechblase` startet mit 0,26 s Verzögerung
und wächst über `blaseAuf` (0,6 s) herein, statt aufzuploppen. Unter
`prefers-reduced-motion: reduce` entfallen Sprung, Flug und Einblendung.

## Töne

`ton(richtig)` spielt nach jeder bewerteten Antwort einen kurzen Klang: eine aufsteigende
Terz (A5 → E6, Sinus) für richtig, einen fallenden tiefen Ton (G3 → D♯3, Dreieck) für
falsch. Erzeugt wird er in der Web Audio API — Klangdateien verbieten sich in einer
einzelnen Datei ohne externe Ressourcen.

`tonBereit()` kapselt alles Heikle: Einstellung `ton` aus, kein `AudioContext`, ein
angehaltener Kontext. Der Kontext wird einmal angelegt und danach wiederverwendet; iOS
gibt ihn erst nach einer Nutzergeste frei, was hier von selbst passt, weil der erste Ton
auf einen Tipp folgt. Alles steht in `try/catch` — der Ton begleitet, er trägt nie.

Ausgelöst wird er an genau drei Stellen: `uebPruefen()` (Lernsets/Freestyle),
`trFinish()` (Übersetzen) und `check()` in `renderTippen()`. «Aufdecken» bleibt still,
weil das keine Antwort ist.

## Tickets

Fehler und Wünsche werden in der App **geschrieben und aufbewahrt**, nicht verschickt.
Der Knopf «Senden» ist ein gewöhnlicher Verweis auf ein vorausgefülltes GitHub-Formular:

```
https://github.com/chillijust/chillingo-tickets/issues/new?title=…&labels=…&body=…
```

Abgeschickt wird dort, nicht hier. Das hat zwei Folgen, die den Ausschlag gaben: Die App
braucht **keinen Zugangsschlüssel** — es gibt kein Geheimnis, das in einer öffentlich
lesbaren Datei liegen müsste — und die Zugangskontrolle macht GitHub. Ein Issue im
privaten Zielrepo kann nur anlegen, wer dort angemeldet und berechtigt ist (ADR 0014).

| Baustein | Aufgabe |
| --- | --- |
| `TICKET_REPO` | Zielrepo, privat, getrennt von der öffentlichen App |
| `TICKET_KEY` | eigener `localStorage`-Schlüssel (`chillingo_tickets_v1`) |
| `ticketAnlegen()` | legt an, trimmt, begrenzt, ergänzt Rubrik, Stand und Gerät |
| `ticketRumpf()` | baut den Issue-Text, kürzt bei `TICKET_MAX` Zeichen |
| `ticketUrl()` | baut die Adresse, alles über `encodeURIComponent` |
| `renderTickets()` | Liste, Formular, Löschen, «Alle als Text kopieren» |

Ein Ticket hält `id`, `art` (`bug`/`feature`), `titel`, `text`, `reiter`, `stand`,
`geraet`, `erstellt` und `gesendet`. Der **eigene Speicherschlüssel** hält den
Sicherungscode schlank: Tickets gehören nicht zum Lernstand und sollen ihn nicht
aufblähen.

`APP_STAND` ist das Datum der ausgelieferten Datei. `tools/build.mjs` stempelt es bei
jedem Schreiblauf; `--check` vergleicht bewusst *ohne* diesen Wert, sonst wäre die Datei
jeden Tag «nicht auf Stand».

Erreichbar über **Einstellungen → Rückmeldung → Tickets**. `tkHerkunft` merkt sich die
Rubrik, aus der man kam — die ist gemeint, wenn ein Fehler gemeldet wird, nicht
«Einstellungen».

## Absicherung

Die ausgelieferte Datei ist öffentlich lesbar. Daraus folgen drei Regeln, die
`tools/pruefen.mjs` prüft statt sie nur zu behaupten:

1. **Kein Geheimnis in der Datei.** Kein Token, kein Passwort, kein Schlüssel — Prüfung
   auf die bekannten GitHub-Tokenformen und auf `Authorization:`/`Bearer`.
2. **Genau eine Fremdadresse**, `https://github.com/`, und die wird nicht *geladen*,
   sondern angetippt.
3. **Content-Security-Policy als `<meta>`**:
   `default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`.
   Damit ist «keine externen Ressourcen» für den Browser erzwingbar statt nur
   verabredet: Käme je fremder Code in die Seite, könnte er nichts nachladen und nichts
   nach außen senden. Verweise, die man antippt, bleiben unberührt — CSP regelt geladene
   Ressourcen und Formularziele, nicht Navigation über `<a>`.

Ticketeingaben laufen wie alle Ausgaben durch `esc()`; die Zieladresse wird per
`a.href = …` gesetzt, nie als Attribut in eine Zeichenkette gebaut. Der Verweis trägt
`rel="noopener noreferrer"`.

Was **nicht** geschützt ist und auch nicht sein kann: Eine Abfrage im Client wäre eine
Türklingel, kein Schloss — der Quelltext ist öffentlich, jede Prüfung darin lässt sich
umgehen. Deshalb liegt die Kontrolle bei GitHub und nicht bei uns.

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
