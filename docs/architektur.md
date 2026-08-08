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
- Die Fortschrittsleiste zeigt sich nur auf Home; unterwegs trägt der Kopf den Rückweg
  und den Namen der Ansicht (siehe «Navigation»).

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
| Empfehlung auf Home, links | 76 px | Grundzustand auf Home |
| Kopfzeile, zwischen Titel und Menüknopf | 34 px | in einer Übung ohne eigenen Platz |
| Menüknopf | 32 px | in Bilanz, Einstellungen, Tickets, Sprachfakten |
| Sprechblase der Faktenkarte | 76 px | alle fünf Antworten |
| Leerzustände (Tippen, Übersetzen, Faktensammlung) | 104 px | wenn nichts freigeschaltet ist |
| Jubelkarte | 104 px | wenn ein Lernset voll wird |

Der Platz im Kopf steht im Fluss, zwischen Titel und Menüknopf. Mittig über der Zeile
wäre er nur auf Home sichtbar — dort hat aber die Empfehlung immer Vorrang —, und
unterwegs liefe ein langer Name wie «Einstellungen» darunter hindurch.

`chiliPlatzhalter()` entscheidet in drei Stufen:

1. **Menü aufgeklappt** → der Knopf. Die Striche stehen dann unten, er wäre sonst ein
   leerer Kreis — auch auf Home, wo sonst die Empfehlung Vorrang hätte.
2. **Die Ansicht stellt einen Platz auf** (Karte, Empfehlung, Leerzustand) → dorthin.
3. Sonst: im Menübereich der Knopf, überall sonst der Kopf.

**Kein Nachrechnen.** Es gibt keine Positionsrechnung je Bild. Weil die Figur ein Kind
ihres Platzhalters ist, scrollt sie starr mit dem Inhalt (ADR 0012).

### Der Sprung

`chiliAktualisieren()` läuft über einen `MutationObserver` auf `#main`, merkt also jeden
Ansichtswechsel, ohne dass eine Renderfunktion daran denken muss. **Beim Start wird erst
gezeichnet, dann platziert** — sonst stünde die Figur kurz im Kopf (`#main` ist noch
leer) und spränge danach sichtbar auf ihren Platz in der Empfehlung.

Das allein genügt nicht: Das Markup hält die Figur im Kopf, und der Browser zeichnet den
Kopf, **bevor** das Skript am Ende des Body überhaupt läuft. Beim Neuladen blitzte sie
darum kurz neben dem Menüknopf auf. `#chiliBuehne` startet deshalb mit
`visibility: hidden`; sichtbar wird sie erst über `body.chili-steht`, die
`chiliAktualisieren()` beim ersten Platzieren setzt (ADR 0025). Der Sprung besteht aus
zwei Teilen auf zwei Elementen, die sich nicht ins Gehege kommen:

- **Die Figur** bekommt die Klasse `springt` (Keyframes `chiliSprung`, 0,23 s): ducken,
  Eigenhub, Rotation, federn. Ein Zeitgeber räumt die Klasse danach ab.
- **Die Hülle** fliegt über `chiliFlug()` von der alten zur neuen Lage — waagerecht
  gleichförmig, senkrecht eine Parabel darüber, dazu der Größenwechsel. Neun Stützstellen
  über `Element.animate()`, `linear`, 0,19 s nach 0,03 s Verzögerung: erst ducken, dann
  fliegen, am Ende federn.

Ein noch laufender Flug wird zu Beginn **abgebrochen**: zwei Animationen mit
`fill: 'backwards'` überlagerten sich sonst und stellten die Figur irgendwo dazwischen ab.

Die alte Lage kommt aus `chiliLage()` in **Dokumentkoordinaten** — die Figur steht im
Fluss und scrollt mit, ihre Lage im Dokument bleibt also gültig. Gemessen wird der
**Mittelpunkt**, nicht die Ecke: `scale` wirkt um die Mitte, und bei wechselnder Größe
(76 px in der Empfehlung, 30 px im Menüknopf) läge der Startpunkt sonst um die halbe
Differenz daneben. Hängt die alte Station
noch im Dokument (typisch: der Platz im Kopf), wird sie direkt gemessen; nach einem
Ansichtswechsel ist sie fort, dann trägt die gemerkte `chiliSpur`. Unter 8 px lohnt der
Flug nicht, über 900 px ist die alte Lage vermutlich veraltet — beides bleibt beim reinen
Hüpfer.

**Die Blase kommt kurz nach der Landung:** `.sprechblase` startet mit 0,26 s Verzögerung
und wächst über `blaseAuf` (0,6 s) herein, statt aufzuploppen. Unter
`prefers-reduced-motion: reduce` entfallen Sprung, Flug und Einblendung.

## Navigation: Home, Kopf, Menü

Die App hat sieben **Übungen** (Lernsets, Freestyle, Tippen, Übersetzen, Buchstaben,
Grammatik, Power-Training) und
vier Ansichten, die keine sind: Bilanz, Sicherung, Einstellungen, Tickets. Der Begriff
«Rubrik» ist hinfällig; im Nutzertext wie im Code heißt es **Übung**.

**Home** (`renderHome()`, Startansicht) ist kein Verzeichnis, sondern ein Lagebild. Jede
Kachel nennt über `uebungsStand()`, was dort ansteht — «Set 1 · 11 offen», «21 fällig»,
«noch gesperrt». Darüber steht `empfehlung()`: der eine Knopf, der immer richtig ist.
Seine Reihenfolge ist bewusst: **erst fortsetzen**, dann auffrischen (wenn fünf oder mehr
Dinge warten), dann das laufende Lernset, dann offene Sätze, dann Tippen, sonst Freestyle
als Kür.

**Fortsetzen geht vor.** Wer vor zwei Stunden noch in «Übersetzen» geantwortet hat, will
dorthin zurück und nicht in die Lernsets. `zuletztGeuebt(id)` merkt sich die Übung bei
jeder **abgegebenen Antwort** — Herumblättern zählt nicht —, `FORTSETZEN_FRIST` (zwei
Stunden) begrenzt das Gedächtnis. Danach kommt die Empfehlung wieder aus dem Lernstand.
Eine gesperrte Übung wird nie vorgeschlagen, und ein `state.zuletzt`, das auf eine Übung
zeigt, die es nicht mehr gibt, fällt in `mergeState()` weg.

**Zurück gibt es zweimal**: den Pfeil oben links und eine Wischgeste vom linken
Bildschirmrand zur Mitte. Beide rufen `zurueckGehen()`. Die Geste ist für das Vollbild
der Home-Bildschirm-Verknüpfung, wo die Zurück-Geste des Browsers fehlt: Sie beginnt nur
in den äußeren 26 px, verlangt 70 px waagerechten Weg bei höchstens 70 % davon senkrecht
(sonst war es Scrollen) und wirkt erst beim Loslassen — ein Tippen löst nichts aus. Ist
ein Blatt offen (Menü, Auswahl, Wissen, Meldeblatt), schweigt sie.

**Aufgaben sitzen tiefer als Listen.** In den sechs Übungen trägt der Körper die Klasse
`aufgabe`; `#main` wird dann zur Flexspalte, und zwei Streben (`::before` mit `flex: 2`,
`::after` mit `flex: 1`) teilen den freien Raum **2:1**. Der Aufgabenblock steht damit auf
zwei Dritteln der Höhe — tiefer als die Mitte, aber nicht am Boden geklebt. Der Grund ist
die Hand: «Prüfen» und «Weiter» liegen so dort, wo der Daumen ohnehin ist, und die
eingeblendete Tastatur schiebt sie nicht aus dem Bild.

Beide Streben haben **Basis 0 und kein Schrumpfen**. Wird der Inhalt höher als der Platz
(offene Regelkarte, eingeblendete Tastatur), fallen sie auf null, und die Seite scrollt
wie zuvor — anders als bei `justify-content: center` wird oben nichts abgeschnitten.
Listen und Menüansichten bleiben unberührt: Bilanz, Einstellungen und Tickets gehören
nach oben.

**Der Kopf wechselt seinen Inhalt**, statt dass es zwei gäbe (`renderKopf()`):

| | Home | unterwegs |
| --- | --- | --- |
| Augenbraue | `Русский · Тренажёр` | `Übung` oder `Menü` |
| Titel | `Chillingo.` | Name der Ansicht |
| links | — | Zurück-Pfeil |
| Fortschrittsleiste | ja | nein |
| Position | `relative`, scrollt mit | `sticky` |
| Hintergrund | durchsichtig | `--bg` |

Die Klasse `unterwegs` am `<body>` schaltet das um. Eine Reiterleiste gibt es nicht mehr
(ADR 0018) — und damit auch keine kompakte Zone, die den Streifen darüber füllen müsste.

**Auf Home ist der Kopf durchsichtig.** Ein eigener Grund deckte dort den radialen Schein
des Hintergrunds ab, und über «Chillingo.» stand eine sichtbare Kante. Unterwegs deckt er,
weil er dann klebt und Inhalt unter ihm durchläuft (ADR 0019).

**Das Menü** (`menuSetzen()`) sitzt hinter einem runden Knopf mit drei Strichen. Beim
Öffnen wandern die Striche **gestaffelt nach unten aus dem Kreis** — `overflow: hidden`
am Knopf sorgt dafür, dass nichts überragt; die `transition-delay` je Strich staffelt sie,
und beim Schließen laufen sie in umgekehrter Reihenfolge zurück.

Das Panel wächst über `grid-template-rows: 0fr → 1fr` von oben nach unten heraus. Das
braucht keine geratene Höhe und verzerrt den Inhalt nicht (anders als `scaleY`). Zwei
Fallstricke stecken darin:

- Ränder und Innenabstände der Menükarte liegen in einem **Zwischenbehälter**
  (`.menuwrap`, `min-height: 0`). Läge der Abstand auf der Rasterzeile selbst, bliebe
  zugeklappt ein Streifen von 26 px stehen.
- Das Panel liegt **über** der Seite (`position: absolute` unter dem Knopf, rechtsbündig,
  232 px breit). Im Fluss schöbe es beim Aufklappen den ganzen Inhalt nach unten.

**Der Knopf lässt überstehen.** Geblendet wird in einer eigenen Hülle
(`.striche`, `overflow: hidden`), nicht am Knopf selbst — sonst wäre die einfliegende
Chili bis zur Landung unsichtbar, weil sie den ganzen Flug über außerhalb des Kreises
liegt. `z-index: 40` hält den Knopf über dem Panel.

**Im Menübereich bleiben die Striche verschwunden.** Die Klasse `im-menu` am `<body>`
(gesetzt für Bilanz, Einstellungen, Tickets, Sprachfakten) hält sie unten und färbt den
Knopf golden. Statt ihrer trägt er die **Chili**, die per Flug hineinspringt und dabei auf
seine Größe schrumpft — die Platzwahl steht im Abschnitt «Maskottchen». Schon das
**Aufklappen** genügt dafür: ab da sind die Striche unten, der Knopf wäre sonst leer.

Braucht die Ansicht die Figur selbst (Leerzustand in Tickets oder Sprachfakten), tritt im
Knopf ein ruhender goldener Punkt an ihre Stelle. Die Klasse `mit-chili` schaltet zwischen
beiden um und wird bei **jedem** `chiliAktualisieren()` gesetzt, nicht nur beim
Stationswechsel — sonst bliebe sie stehen, wenn sich bloß der Inhalt der Ansicht ändert
(etwa wenn das erste Ticket den Leerzustand ablöst).

`menuSetzen()` ruft `chiliAktualisieren()` mit auf; `setTab()` schließt das Menü darum
**nach** `render()`, sonst liefe die Platzwahl noch über den Inhalt der alten Ansicht.

Geschlossen wird bei Auswahl, bei einem Tipp daneben, mit `Escape` oder erneutem Druck.
Zugeklappt bekommen die Einträge `tabindex="-1"`, damit der Fokus nicht in ein
unsichtbares Panel springt.

## Auswahl in den Übungen

Neben dem Menüknopf steht ein zweiter runder Knopf mit Trichter — die **Auswahl**. Er
erscheint nur in den fünf Übungen und öffnet dasselbe Aufklapp-Panel, nur breiter
(284 px) und mit scrollbarem Inhalt (`max-height: 62vh`).

Links daneben sitzt in «Buchstaben» ein **dritter** Knopf: der Weg zur Tafel
(`renderTafelKnopf()`). Er ist keine Einstellung, sondern ein zweiter Ort — darum steht
er nicht im Auswahlpanel und färbt sich eisblau statt golden: Er meldet nicht «etwas
weicht ab», sondern «hier stehen Sie».

| Übung | Gruppen im Panel |
| --- | --- |
| Lernsets | Auswahl (aktuelles Set · alles Freigeschaltete), einzelnes Set |
| Freestyle | Thema |
| Tippen | Stapel (Lernen · Wiederholung) |
| Übersetzen | Stufe, Richtung, Stapel |

`filterInhaltHtml()` baut die Gruppen, `filterWaehlen(gruppe, wert)` setzt den Wert,
schließt das Panel, zeichnet die Übung neu und zieht den Knopf nach. Die Chips tragen
`data-fw` (Gruppe) und `data-fv` (Wert) — mehr braucht die Verdrahtung nicht.

**Der Knopf färbt sich, wenn etwas vom Regelfall abweicht** (`filterAktiv()`): anderes
Set als das laufende, anderes Thema als «Alle», Wiederholungsstapel, andere Stufe oder
Richtung. Gold wie ein gesetzter Chip — damit sieht man auf einen Blick, dass die Ansicht
gefiltert ist, ohne die Auswahl offen zu haben.

Die Übungen selbst tragen keine Auswahlzeile mehr; sie nennen nur noch in einem
`.task-label`, was gerade gilt («Set 1 von 12», «Alle Themen», «Stufe 2»). Klappmenüs
(`<select>`) gibt es in der Datei überhaupt nicht mehr — auf iOS öffnen sie ein
systemeigenes Rad, das mit dem Rest der Oberfläche nichts zu tun hat (ADR 0020).

## Töne

`ton(richtig)` spielt nach jeder bewerteten Antwort einen kurzen Klang, `tonMeister()`
den längeren Dreiklang, wenn etwas fertig gelernt ist. Erzeugt wird alles in der Web
Audio API — Klangdateien verbieten sich in einer einzelnen Datei ohne externe Ressourcen.

**Der Klang ist schlicht:** `tonNote()` legt eine Note als ein Oszillator mit einer
Hüllkurve an (Anstieg 12 ms, exponentieller Abfall). Ein glasiger Glockenklang aus
mehreren Teiltönen wurde erprobt und wieder verworfen — er klang nach Benachrichtigung,
nicht nach Rückmeldung (ADR 0028).

| Anlass | Klang |
| --- | --- |
| richtig | A5, darüber E6 nach 90 ms — Sinus, 0,17 s |
| falsch | G3, darunter D♯3 nach 110 ms — Dreieck, 0,22 s |
| gemeistert | A5 · C♯6 · E6 · A6, je 75 ms versetzt — derselbe Sinus wie «richtig» |

### Warum der Ton verstummte

Zwei Fehler, beide auf iOS (ADR 0026):

1. **Safari kennt `interrupted`.** Nach einem Anruf, Siri oder dem Sperrbildschirm steht
   der Kontext nicht auf `suspended`, sondern auf `interrupted`. Wer nur auf `suspended`
   prüft, weckt ihn nie wieder — und hat für den Rest der Sitzung Ruhe. `tonSchlaeft()`
   kennt beide Zustände.
2. **`resume()` ist asynchron.** Wer sofort danach Noten plant, plant in eine stehende
   Zeit: Die ganze Hüllkurve liegt dann in der Vergangenheit, der Pegel steht am Endwert,
   man hört nichts. `ton()` spielt darum **im Callback** von `resume()`, und geplant wird
   immer mit 20 ms Vorlauf statt genau auf `currentTime`.

Dazu weckt jeder Tipp den Kontext (`pointerdown` auf `document`, in der Capture-Phase)
und jede Rückkehr aus dem Hintergrund (`visibilitychange`). Ein Aufwecken, das nichts zu
tun hat, kostet nichts — und die Antwort selbst käme zu spät, sie soll ja schon klingen.

### Der Stummschalter und die Home-Bildschirm-App

Ohne Zutun läuft Webton auf iOS in der Sitzungsart **`ambient`** — und die schweigt,
sobald der seitliche Schalter auf stumm steht. In der zum Home-Bildschirm gelegten App
(einem **Webclip**, der im **Standalone-Modus** läuft) fällt das doppelt auf: Man macht
sie oft auf, ohne vorher etwas gehört zu haben, und merkt darum nicht, dass das Gerät
stumm ist.

`tonSitzung()` setzt darum `navigator.audioSession.type` (Safari ab 16.4) auf
**`transient`** — die Art für kurze Rückmeldungen: Sie klingen trotz Stummschalter und
drängen laufende Musik nur für den Augenblick weg, statt sie anzuhalten. Kennt eine
Fassung `transient` nicht, bleibt der alte Wert stehen; dann greift `playback`.

`tonEntsperren()` läuft beim **ersten Tipp irgendwo in der App**: Sitzungsart setzen,
Kontext anlegen, wecken und einen unhörbaren Ein-Sample-Puffer abspielen. Erst dieses
Abspielen *innerhalb einer Geste* gibt iOS den Ton wirklich frei — ohne das steht der
Kontext zwar auf `running`, liefert aber nichts.

**Die App sagt selbst, woran es liegt.** `tonAuskunft()` steht unter «Ton prüfen» in den
Einstellungen und nennt Einstellung, Kontextzustand, Freigabe und Sitzungsart. Ohne sie
sähen «Schalter aus», «Kontext schlafend», «Stummschalter» und «keine Unterstützung» von
außen gleich aus — nämlich still (ADR 0027).

Ausgelöst wird der Klang an genau vier Stellen: `uebPruefen()` (Lernsets/Freestyle),
`trFinish()` (Übersetzen), `check()` in `renderTippen()` und `abcPruefen()`
(Buchstaben) — jeweils über `meisterTon()`, das zwischen «richtig» und «gemeistert»
entscheidet. «Aufdecken» bleibt still, weil das keine Antwort ist.

## Gemeistert — die Rückmeldung

Wenn ein Wort, ein Satz oder ein Buchstabe mit dieser Antwort `BOX_MAX` **erreicht**,
erscheint unter der Auflösung eine goldene Zeile: was gemeistert wurde und wie viele es
nun sind. Dazu klingt `tonMeister()` statt des gewöhnlichen «richtig».

`meisterPruefen(vorher, nachher, was, text, hinweis)` prüft ausdrücklich den **Übergang**:
`vorher < BOX_MAX && nachher >= BOX_MAX`. Wer ein schon gemeistertes Wort auffrischt, hat
es nicht noch einmal gemeistert — eine Meldung dafür wäre nach einer Woche nichts mehr
wert. `meisterMeldung` hält das Ergebnis bis zur nächsten Frage und wird überall dort
geleert, wo eine neue gebaut wird (`uebNext()`, `buildTransTask()`, `abcFrageBauen()`,
`next()` in «Tippen») sowie in `ansichtenZuruecksetzen()`.

**Eine Zeile, kein Zwischenbildschirm.** Gemeistert wird oft; jedes Mal wegtippen zu
müssen machte aus der Belohnung eine Hürde. Für ein ganzes Lernset gibt es weiter die
Jubelkarte — das ist der seltenere, größere Anlass (ADR 0026).

## Übersetzen: die Leiter aus Form und Richtung

Ein Satz durchläuft **vier verschiedene Aufgaben**, bevor er sitzt. Zwei Achsen steigern
sich dabei zugleich: die **Form** (`trArt()`) von der Vorlage zur freien Eingabe, und die
**Richtung** (`trRichtungFuer()`) vom Verstehen zum Produzieren.

| Stufe | Richtung | Form | was geprüft wird |
| --- | --- | --- | --- |
| 0 | RU → DE | Kacheln | verstehen |
| 1 | DE → RU | Kacheln | bauen |
| 2 | RU → DE | getippt | selbst formulieren |
| 3 | DE → RU | getippt | das Schwerste |
| 4 (Auffrischung) | DE → RU | getippt | die stärkste Behauptung |

**«Gemischt» ist der Regelfall und heißt nicht Zufall.** Würfelte die Richtung, hinge die
Stufe am Losglück: Ein Satz, den man nur versteht, käme über eine glückliche RU→DE-Runde
auf die Endstufe, ohne je auf Russisch geschrieben worden zu sein. Die feste Ordnung
verhindert das und trainiert trotzdem beide Seiten. Wer will, stellt im Auswahlpanel eine
Richtung fest ein — die schlägt dann die Staffelung.

Kacheln zeigen nur, dass man die Wörter wiedererkennt und ihre Reihenfolge kennt — die
Wörter stehen ja da. Erst das Schreiben prüft, ob der Satz wirklich sitzt. Zwei Runden,
weil eine ein Zufallstreffer sein kann.

**Die Richtung gehört zur Aufgabe, nicht zur Einstellung.** `trTask.dir` wird beim Bauen
festgelegt; das Zeichnen liest nur von dort. Sonst verschöbe sich mitten in einer Aufgabe
alles, wenn der Filter wechselt.

Verglichen wird **wortweise über `normalize()`**: Groß- und Kleinschreibung, Satzzeichen
und doppelte Leerzeichen sind egal. Wer den Inhalt trifft, hat den Satz.

**Deutsche Artikel zählen beim Schreiben nicht mit** (`trVergleichbar()`). Das Russische
hat keine — «Ich lese ein Buch» gegen «Ich lese das Buch» ist kein Übersetzungs-, sondern
ein Ratefehler. Im **Kachelmodus** gilt das nicht: Dort steht der richtige Artikel zur
Auswahl, man muss ihn also nicht erfinden. Im Russischen wird ohnehin jedes Wort
gewertet.

### Was genau war falsch? — Wortauswertung und Strafe

«Richtig oder falsch» ist eine dürftige Auskunft: Wer einen Buchstaben vertippt hat, hat
etwas anderes getan als wer das Wort nicht kennt (ADR 0033). Beim **Schreiben ins
Russische** wertet die App darum Wort für Wort aus.

`editAbstand(a, b)` ist Levenshtein in zwei Zeilen Tabelle. `trWortDiff()` ordnet jedem
Wort der Lösung das zu, das dafür geschrieben wurde — **gierig, nicht stellungstreu**:
das nächstliegende freie Wort, bei gleichem Abstand das mit der ähnlichsten Position. So
gilt ein vertauschtes Paar nicht als zwei unbekannte Wörter. `trVokabelZu()` führt eine
Form über `satz.formen` auf ihre Vokabel zurück; was der Lehrplan nicht führt, bleibt
ungewertet.

Daraus folgen zwei Dinge:

| | |
| --- | --- |
| **die Strafe** | `state.wortFehler` zählt je Wort die Serie. Richtig geschrieben löscht sie. Bei `WORT_STRAFE` (3) fällt das Wort auf `SATZ_STUFE - 1` — es kommt in «Lernsets» zurück, und der Satz schließt sich, weil ihm eine Voraussetzung fehlt. Wer schon darunter steht, fällt nicht weiter. |
| **der Ton** | `patzerSpruch()` staffelt nach Wörtern und Buchstaben: «Ein einziger Buchstabe. Aber wer schreibt, der bleibt.» bis «3 Wörter sind noch nicht da.» Beim zweiten Fehler warnt die Meldung vor — eine Strafe, die man kommen sieht, ist eine Ansage. |

**Drei Ausnahmen, alle aus demselben Grund:** Gewertet wird nur, was der Nutzer wirklich
behauptet hat.

- **Kacheln zählen nicht** — dort prüft die Aufgabe die Wortstellung, nicht die Schreibung.
- **Die deutsche Seite zählt nicht** — ein Tippfehler in «Buch» darf «книга» nicht treffen.
- **«Aufdecken» zählt nicht** (`trRevealed`) — aufgeben ist kein Verschreiben. Ohne diese
  Ausnahme zerlegte dreimal Aufdecken den halben Satz.

Die **eingebaute kyrillische Tastatur** (dieselben `KB_ROWS` wie in «Tippen») erscheint
nur, wenn die Lösung russisch ist — einen deutschen Satz schreibt man mit der
Gerätetastatur, einen kyrillischen oft nicht. Der geschriebene Text steht in `trEingabe`,
nicht nur im Feld: Zwischen zwei Renderläufen wäre er sonst weg. Beim Tippen wird darum
auch **nicht neu gezeichnet** — das nähme dem Feld mitten im Schreiben den Fokus; nur der
Abgabeknopf wird nachgeführt.

Beim Schreiben gibt es die Abgabe **immer**, unabhängig von der Einstellung
«Bestätigen»: Anders als bei den Kacheln gibt es keinen Augenblick, an dem die Antwort
erkennbar fertig ist.

## Power-Training — die Gefallenen zurückholen

Eine Strafe ohne Weg zurück ist bloß eine Strafe (ADR 0034). Wer ein Wort dreimal
verschrieben hat, sieht es zwar in den Lernsets wieder — aber verstreut zwischen zwanzig
anderen, in Wochen. Das Power-Training ist der kurze Weg: **nur die gefallenen Wörter,
drei auf einmal, bis sie sitzen.**

`state.patzer` (Wort → Zeitstempel) merkt sich, wen `patzerPruefen()` zurückgestuft hat.
Der Topf steht **bewusst nicht im Sicherungscode** — er ist eine Momentaufnahme, kein
Lernstand, und der Code soll schlank bleiben.

| | |
| --- | --- |
| **`ptPool()`** | räumt beim Nachsehen auf: Wer inzwischen wieder auf `SATZ_STUFE` steht, fällt aus dem Topf. Sortiert **zuletzt gefallen zuerst** — das frischeste Ärgernis ist das dringendste. |
| **`ptOffen()`** | ab `PT_MINDEST` (3) offen. Für zwei Wörter lohnt keine eigene Übung. |
| **`ptRundeStarten()`** | nimmt `PT_WOERTER` (3) aus dem Topf. Mehr wäre wieder eine Liste, nicht ein Training. |
| **`ptNaechstes()`** | wählt das Wort mit den **wenigsten Treffern**, nie zweimal dasselbe hintereinander — sonst tippt man es ab, statt es zu wissen. |
| **`ptStufe(treffer)`** | 0–1 Kacheln · 2–3 Tippen mit Umschrift · ab 4 Tippen blank. Dieselbe Leiter wie überall, nur auf fünf Runden zusammengezogen (`PT_RUNDEN`). |
| **`ptPruefen()`** | zählt den Treffer hoch, bei Fehler herunter (nie unter 0), und führt dabei `updateBox()` und `meisterPruefen()` regulär mit — **was hier gelernt wird, zählt auch draußen.** |

Wer alle drei Wörter durch `PT_RUNDEN` Treffer bringt, sieht `renderPowerFertig()`: eine
Zeile je Wort mit seinem neuen Stand, «wieder frei» in Grün für die, die den Topf
verlassen haben. Das ist der Punkt der Übung — nicht ein Punktestand, sondern ein
sichtbar geräumter Rückstand.

Zwei Leerzustände, und sie sagen Verschiedenes: **nichts gefallen** ist ein Lob, **zu
wenige gefallen** ist eine Auskunft («noch 2 fehlen»). Beide dürfen nicht wie ein Fehler
klingen.

Der Einstieg steht an drei Stellen: die Kachel auf Home, `#ptLos` in der Patzer-Meldung
(direkt nach der Rückstufung, wo der Ärger frisch ist) und `#ptLosFuss` unter
«Übersetzen» — dort, wo die Wörter gefallen sind.

## Fertig heißt raus — und einmal zurück

«Tippen» und «Übersetzen» teilen ihren Bestand in **zwei Stapel**, sichtbar als zwei
Kacheln mit ihren Beständen:

| Stapel | Wörter | Sätze |
| --- | --- | --- |
| **Lernen** | `tippenStufe <= box < BOX_MAX` | `satzBox < BOX_MAX` |
| **Wiederholung** | `box === BOX_MAX` **und** fällig | `satzBox === BOX_MAX` **und** fällig |
| *(ruhend, nicht sichtbar)* | `box === BOX_MAX`, noch nicht fällig | `satzBox === BOX_MAX`, noch nicht fällig |

Wer etwas fertig lernt, sieht es also **nicht mehr** — bis die Auffrischfrist um ist.
Dann kommt es einmal zur Sicherheit; richtig beantwortet ruht es wieder, falsch fällt es
eine Stufe zurück und steht damit von selbst im Lernstapel.

**Beim Lernen gilt keine Fälligkeit.** Wer üben will, soll üben dürfen, nicht auf den
nächsten Tag warten. Gefiltert wird erst auf der Endstufe — dort ist Warten der Sinn der
Sache.

`intervallFuer(box)` liefert für die Endstufe die Einstellung `auffrischen`
(7/14/21/30 Tage, Vorgabe 21), darunter die feste Leitner-Leiter `INTERVALL`.

**Umschalten geschieht von selbst:** Ist der gewählte Stapel leer und der andere nicht,
wechseln `renderTippen()` beziehungsweise `buildTransTask()` hinüber. Sind beide leer,
nennt der Leerzustand, wann das Nächste fällig wird (`naechsteAuffrischung()`,
`trNaechsteAuffrischung()`).

### Sätze führen dieselbe Leiter

Bis hierher kannte ein Satz nur `readSeen[ru] = true` — «wurde gezeigt». Das reicht für
eine Wiederholungslogik nicht: es fehlten Stufe und Zeitstempel. Sätze haben deshalb
jetzt `state.satzBox` und `state.satzSeen`, gebaut wie `boxes`/`lastSeen` bei Wörtern,
mit derselben Skala 0…`BOX_MAX` und denselben Intervallen. Kennung ist der russische
Satz.

`satzUpdate(satz, richtig)` schreibt beides, aufgerufen aus `trFinish()` — also auch beim
Aufdecken, das als «falsch» zählt.

**Migration:** Ein alter Stand mit `readSeen` wird beim Einlesen übernommen — jeder
gesehene Satz startet auf Stufe 1 mit Zeitstempel 0, gilt also als sofort fällig. Nichts
geht verloren, aber als sitzend wird auch nichts verbucht, was nie geprüft wurde.

`buildTransTask(vorgabe)` wählt ohne Argument über `waehleSatz()`: niedrigste Stufe
zuerst, bei Gleichstand das am längsten Zurückliegende, ausgelost aus den vordersten
vieren; der gerade gelöste Satz kommt nicht sofort wieder. Der frühere Laufindex `trIdx`
entfällt — eine feste Reihenfolge verträgt sich nicht mit zwei Stapeln.

## Sicherung als eigene Rubrik

Der Sicherungscode stand früher als Anhang unter der Bilanz. Er hat dort nichts zu
suchen: Wer seinen Stand sichern oder auf ein anderes Gerät holen will, sucht ihn nicht
unter Zahlen zum Lernfortschritt. Seit ADR 0025 ist er ein **eigener Menüpunkt**
(`renderSicherung()`), zwischen «Bilanz» und «Einstellungen».

Das **Zurücksetzen** steht dort mit — es ist die Kehrseite derselben Sache und gehört
neben den Code, der es auffangen kann. Die Bilanz behält nur einen Verweis dorthin.

`backupOpen`, `backupMsg` und `confirmReset` sind Ansichtszustand dieser Rubrik und
gehören nach der Regel aus ADR 0017 in `ansichtenZuruecksetzen()`.

## Sicherungscode

Format **2** (`CHG2~…`), eine einzige Zeile aus `A–Z a–z 0–9 . ~`:

```
CHG2~<Wörter>~<Sätze>~<Fakten>~<Zahlen>~<Einstellungen>~<Buchstaben>~<Regeln>~<Prüfsumme>
```

Ein Wort belegt zehn Zeichen: sechs für die **Kennung**, eines für die Stufe, drei für
das Alter in Tagen seit `BK_BEZUG` (1. Januar 2026). Sätze und Buchstaben genauso, Fakten
neun Zeichen (Kennung, Zähler, Favorit). Die Buchstaben stehen im achten Feld, der Grammatikstand im neunten; ältere
Codes tragen sieben oder acht, darum wird die Prüfsumme immer aus dem letzten Feld
gelesen. Der Grammatikstand führt **Regeln**, nicht Wörter — er bleibt darum winzig,
gleich wie viel gelernt wurde. Bei vollem Lernstand ergibt das rund **5 KB statt 35 KB** —
Format 1 war der ganze Zustand als JSON in Base64, mit 380 kyrillischen Schlüsseln und
Millisekunden-Zeitstempeln.

**Die Kennung ist ein Hash des Textes, nicht seine Position.** Eine Position wäre kürzer,
aber jede neue Vokabel würde alle folgenden verschieben und alte Codes still verfälschen.
`tools/build.mjs` prüft, dass keine zwei Vokabeln, Sätze oder Fakten dieselbe Kennung
tragen, und bricht sonst ab — die Wahrscheinlichkeit ist winzig, die Folge wäre lautlos.

**Tagesgenau reicht**, weil alle Fristen in Tagen rechnen (`INTERVALL`, `auffrischen`).

**Die Prüfsumme** über die ersten sechs Felder erkennt abgeschnittenes oder verändertes
Einfügen. Ohne sie hätte ein halb kopierter Code stillschweigend einen halben Lernstand
geladen. Fehler werden unterschieden: beschädigt, abgebrochen, oder gar kein Code dieser
App.

**Format 1 bleibt lesbar.** `decodeBackup()` erkennt am fehlenden Kopf, dass ein alter
Code vorliegt, und liest ihn wie bisher.

Unbekannte Kennungen — Inhalte, die es nicht mehr gibt — werden übersprungen, wie
`migriereIds()` es beim normalen Laden tut.

### Nach dem Wiederherstellen

`ansichtenZuruecksetzen()` stellt **jede Übung** auf Anfang: die laufende Frage, das
getippte Wort, den gelegten Satz, Stufe und Stapel in «Übersetzen», Filter und Aufklapper.
Ohne das zeigte eine Übung nach dem Einspielen weiter ihren alten Stand — jede hält
ihren eigenen Zustand in Modulvariablen, und `state` auszutauschen rührt die nicht an.
Dieselbe Funktion läuft beim Zurücksetzen des Fortschritts.

## Buchstaben — freiwillig und getrennt

Die fünfte Übung lehrt das kyrillische Alphabet. **Freiwillig** heißt hier wörtlich: Sie
blockiert nichts, schaltet nichts frei, und ihre Antworten zählen weder in die Serie noch
in «beantwortet». Wer das Alphabet schon kann, verpasst nichts.

Der Lernstand liegt in einem **eigenen Topf** (`state.abcBox`, `state.abcSeen`) mit
derselben Leiter und denselben Fristen wie Wörter und Sätze. Er taucht in der Bilanz nur
als eine Zeile im Lernweg auf, nicht in den Kacheln.

Zwei Teile. **Geübt wird ohne Umweg** — die Übung ist der Einstieg; die Tafel liegt
hinter dem runden Knopf links neben der Auswahl:

- **Üben** — derselbe Aufbau wie das Vokabeltraining (siehe unten).
- **Tafel** — alle 33 Buchstaben als Raster mit Groß-, Kleinform und Laut. Ein Balken am
  Fuß jeder Kachel zeigt die Stufe (dieselben Farben wie überall). Antippen klappt die
  Merkhilfe auf, samt Hörknopf. Ein Nachschlagewerk, keine Einstellung — darum ein
  eigener Ort und kein Eintrag im Auswahlpanel (ADR 0025).

### Sitzen und meistern — dieselbe Mechanik wie bei den Wörtern

Ein Buchstabe kennt **zwei Schwellen**, genau wie eine Vokabel:

| Schwelle | Stufe | Prüfung | Bedeutung |
| --- | --- | --- | --- |
| **sitzt** | ab `SATZ_STUFE` (2) | `abcSitzt()` | man erkennt ihn — er zählt in «x von 33 sitzen» |
| **gemeistert** | ab `BOX_MAX` (4) | `abcGemeistert()` | er verlässt den Stapel bis zur Auffrischfrist |

`abcPool()` fragt nach **gemeistert**, nicht nach «sitzt» — sonst fiele ein Buchstabe
schon auf Stufe 2 aus der Übung heraus, und zwischen Erkennen und Können läge nichts mehr.

Der Kopf über der Frage ist dasselbe **Paket** wie in «Lernsets» (`abcKopfHtml()`): ein
Punkt je Buchstabe, gefärbt nach seiner Stufe, darunter «x von 33 auf Stufe 2 · y
gemeistert · z fällig». Auf der Karte selbst stehen die **Fortschrittspunkte** des
gefragten Buchstabens (`.boxdots`) und rechts, ob es einer der falschen Freunde ist.

Drei Aufgabenformen, die Stufe entscheidet — wie `buildQuestion()` beim Wortschatz:

- **Zeichen → Laut** und **Laut → Zeichen** als Vierfachwahl, solange der Buchstabe noch
  nicht sitzt.
- **Kacheln** ab Stufe 2: Das Zeichen steht da, der **Laut wird aus lateinischen Kacheln
  zusammengesetzt** — `щ` also aus `s c h t s c h`, mit zwei bis drei überzähligen
  Kacheln. Das greift nur, wo der Laut mehr als ein Zeichen hat (`abcKachelbar()`, neun
  Buchstaben: е ё ж х ч ш щ ю я); Ъ und Ь tragen ein deutsches Wort statt einer
  Lautschrift und fallen heraus. Wer die Richtung fest auf «Laut → Zeichen» stellt,
  behält sie — das ist ohnehin schon die fordernde Seite.

**Aufdecken** gibt es hier wie überall: Es zeigt die Auflösung und zählt als Fehler.

**Die sechs falschen Freunde** (В=w, Н=n, Р=r, С=s, У=u, Х=ch) stehen als
`ABC_TUECKISCH` im Skript, nicht in den Daten: Dass В wie ein B aussieht, ist eine
Eigenschaft des *lateinischen* Alphabets, nicht des russischen. In der Tafel sind sie
hervorgehoben; im Quiz treten sie bevorzugt gegeneinander als Ablenker an — eine Frage,
bei der man raten kann, lehrt nichts.

`data/buchstaben.json` hält `[Groß, Klein, Laut, Merkhilfe]`. `tools/build.mjs` prüft:
genau 33 Einträge, Groß- und Kleinform passen zusammen, keine Dublette, jede Merkhilfe
mindestens 20 Zeichen — und dass Alphabet und Tastatur **dieselben** Zeichen führen.

Der Sicherungscode trägt die Buchstaben als achtes Feld. Ältere Codes haben sieben;
`decodeBackup()` liest die Prüfsumme darum immer aus dem letzten Feld und behandelt das
achte als optional.

## Vorlesen

`speak(text, sprache)` meldet einen Text bei der Sprachausgabe an — `ru-RU`, wenn nichts
anderes gesagt wird, sonst `de-DE`; russisch etwas langsamer, weil man es mitbuchstabiert
statt mitliest. Alles in `try/catch`: iOS braucht eine Nutzergeste, liefert Stimmen
verzögert und schweigt im Stummschalter-Modus. **Kein Ablauf darf Ton voraussetzen.**

Die Knöpfe erzeugt `hoerknopf(text, sprache)`; der Text hängt als `data-say` am Knopf.
Ein **einziger Zuhörer auf `#main`** fängt jeden Tipp ab — weil er am gleichbleibenden
Container hängt und nicht an den Knöpfen, überlebt er jeden Renderlauf, und keine Ansicht
muss ihre Knöpfe verdrahten.

`hoerzeile(ru, de)` setzt nach der Auflösung beide Seiten nebeneinander, **beschriftet**:
Zwei gleiche Lautsprecher sagen nicht, welcher welche Sprache spricht.

| Ort | Wann | Was |
| --- | --- | --- |
| Lernsets, Freestyle | an der Frage | die Frageseite, in ihrer Sprache |
| Lernsets, Freestyle | nach der Auflösung | Wort und Bedeutung |
| Tippen | an der Vorgabe | das deutsche Wort |
| Tippen | nach der Abgabe | beide Seiten |
| Übersetzen | am Satz | die Frageseite |
| Übersetzen | nach der Auflösung | beide Sätze |
| Buchstaben | nach der Auflösung | das Zeichen |
| Buchstaben | Merkhilfe in der Tafel | das Zeichen |

**Vor der Abgabe schweigt, was die Antwort wäre.** In «Tippen» ist das russische Wort
erst nach dem Prüfen zu hören, in «Buchstaben» der Laut erst nach der Auflösung — sonst
wäre der Hörknopf die halbe Lösung.

## Grammatik — verstehen statt auswendig

Eine Vokabel ist ein **Fakt**, eine Regel ist eine **Funktion**. Daraus folgt der ganze
Aufbau dieser Übung: **Die Karteikarte ist die Regel, nicht das Wort** (`state.gramBox`
führt Bausteine, nicht Vokabeln). Gemeistert ist eine Regel, wenn sie viermal auf
**verschiedene** Wörter gewirkt hat — und die Aufgabe verlangt ein bekanntes Wort in einer
**nie gesehenen Form**. Wer auswendig gelernt hat, scheitert daran; wer die Regel hat,
nicht. Das ist der einzige ehrliche Test (ADR 0030).

Freiwillig wie die Buchstaben: blockiert nichts, zählt weder in die Serie noch in
«beantwortet», eigener Topf.

### Die Formenmaschine und ihr Beweis

`grammForm(wort, art, rolle)` rechnet aus Grundform und Rolle die Form:
«книга» + `akk` → «книгу». Regeln, keine Tabelle — nur so lässt sich eine Regel auf ein
Wort anwenden, das nie in dieser Form dastand.

**Sie steht zweimal**: in `index.html` und in `tools/build.mjs`. Das ist kein Versehen —
der Build muss ohne die App laufen können, und weil beide Fassungen an denselben Formen
gemessen werden, fällt jede Abweichung sofort auf.

Der Beweis liegt in den Daten: `saetze.json` führt unter `formen` gebeugte Wörter auf
Grundform und Rolle zurück. **Der Build lässt die Maschine jede davon nachbauen und
bricht ab, wenn eine abweicht.** Die Grammatik ist damit nicht behauptet, sondern
nachgewiesen.

### Wortart und Geschlecht

Die Endung der Grundform verrät beides — bei 239 der 380 Wörter. Wo sie schweigt (`-ь`,
`-и`, `-ы`) oder irrt, trägt die Vokabel ein **viertes Feld**:

| Code | bedeutet |
| --- | --- |
| `m` · `w` · `s` | männlich · weiblich · sächlich |
| `mb` · `wb` · `sb` | dasselbe, dazu **belebt** (Lebewesen) |
| `pl` | nur in der Mehrzahl gebräuchlich |
| `v` · `a` | Verb · Adjektiv |
| `-` | keine Formenlehre (Adverb, Partikel, Zahlwort, Wendung) |

Der Build erzwingt beide Richtungen: Ein Wort ohne ableitbare Wortart **muss** das Feld
tragen, und ein Feld, das nur wiederholt, was die Endung ohnehin sagt, ist ein **Fehler**.
Sonst würde die Ausnahmeliste still zur zweiten Datenquelle und verdeckte die echten
Ausnahmen — `кровать` (Nomen trotz `-ть`), `кофе` (männlich), `время` (sächlich),
`папа`/`дедушка`/`дядя` (männlich trotz `-а/-я`).

Die Belebtheit war zunächst nur bei männlichen Nomen vermerkt, weil nur dort eine Form
davon abhing. Mit dem Präpositiv kam die Regel, die mehr brauchte — seither tragen auch
weibliche Lebewesen ihr Kürzel (siehe unten).

### Verben im Präsens

Die zweite Ausbaustufe und der größte Sprung: **36 der 110 fremden Formen in den Sätzen
sind Verbformen.** Zusammen mit dem Akkusativ erklärt die App damit 45 von 110 — statt
neun.

Zwei Reihen, sechs Personen, ein Sonderling:

| Reihe | Infinitiv | Stamm | я | ты | они |
| --- | --- | --- | --- | --- | --- |
| e | `-ать`, `-ять` | ohne `-ть` | `-ю` / `-у` | `-ешь` | `-ют` / `-ут` |
| i | `-ить`, `-еть` | ohne die letzten drei Zeichen | `-ю` / `-у` | `-ишь` | `-ят` / `-ат` |

`verbBau(ru)` liefert alle sechs Formen, `praesens(ru, person)` eine davon,
`grammForm(ru, 'v', 'praes3s')` ist die Tür von außen. Dazu `verbKlasse()` (welche
Reihe), `verbStamm()` (worauf die Endung trifft) und `verbIchWandel()` (kippt der Stamm
in der Ich-Form?).

Zwei Feinheiten, die der Beweis an den Sätzen aufgedeckt hat:

- **Weich heißt Vokal, `ь` oder `й`** (`weicherStamm()`). Ohne `ь` würde aus dem Stamm
  `пь-` ein «пьу» statt «пью».
- **Für die Ich-Form zählt der gewandelte Stamm.** `видеть` hat den Stamm `вид-`, gebildet
  wird aber auf `виж-` — also `вижу`, nicht «вижю». `endungenI()` fragt darum
  `nachZischlaut(stammIch(stamm))`, nicht `nachZischlaut(stamm)`.

**`data/verben.json` steht nur für das, was die Regel nicht trägt** — meist ein
abweichender Stamm (`писать` → `пиш-`), selten alle sechs Formen (`есть`, `хотеть`,
`мочь`, `бежать`). Ein Eintrag, der dasselbe liefert wie die blanke Regel, **lässt den
Build scheitern**: Er verlängert die Liste und verdeckt die echten Sonderfälle — dieselbe
Strenge wie beim vierten Feld der Vokabel.

**`быть` steht nicht darin.** Das Russische hat für «sein» keine Präsensform; `буду`,
`будет` sind Zukunft. Die Maschine liefert darum `null`, und `будет` bleibt in den Sätzen
vorerst unerklärt. Eine falsche Auskunft wäre schlimmer als keine.

**Wer einen eigenen Stamm hat, wird nicht abgefragt.** «`писать` → `пиш-`» kann man nicht
herleiten, nur wissen; die Aufgabe prüfte dann Gedächtnis statt Regel. Im Satz erklärt
«Wissen» solche Formen trotzdem — dasselbe Prinzip wie bei den belebten männlichen Nomen:
erklären ja, abfragen nein.

Drei Bausteine tragen das:

| Baustein | Aufgabe | fragt |
| --- | --- | --- |
| Präsens | `praes`, `klasse: e` | Infinitiv + Person → Form |
| Die zweite Reihe | `praes`, `klasse: i` | dasselbe, i-Verben |
| Die Ich-Form | `ichform` | **ты-Form** + `я` → Form |

Die Ich-Form gibt bewusst die **ты-Form** vor, nicht den Infinitiv: So liegt der Stamm
offen da, und gefragt ist allein, was mit ihm geschieht. Nur so dürfen auch Verben mit
eigenem Stamm mitspielen (`спишь → сплю`). Ihre Ablenker enthalten ausnahmsweise ein Wort,
das es nicht gibt — den ungewandelten Stamm mit der Endung («платю» neben «плачу»). Genau
das ist der Fehler, um den es geht.

### Der Präpositiv — und warum er ausgesuchte Wörter braucht

Der Ortsfall nach в und на. Die Regel ist die einfachste von allen: **fast alles endet
auf -е**, das Geschlecht spielt keine Rolle — genau der Gegensatz zum Akkusativ, wo nur
die weiblichen Wörter sich rühren.

| | | |
| --- | --- | --- |
| `-ия` · `-ий` · `-ие` | → `-ии` | Россия → в России |
| weiblich auf `-ь` | → `-и` | дверь → в двери |
| auf `-е` | bleibt | море → в море |
| alles andere | → `-е` | город → в городе, Москва → в Москве, окно → в окне |

`data/nomen.json` trägt, was die Regel nicht erreicht, in vier Gruppen:
flüchtige Vokale (`день` → `дне`, `палец` → `пальце`), eigene Stämme (`время` →
`времени`, `дочь` → `дочери`), der **Ortsfall auf -у** nach в/на (`год` → `году`, `лес` →
`лесу`, `аэропорт` → `аэропорту`) und unveränderliche Lehnwörter (`метро`, `пальто`).
Wie bei den Verben gilt: **ein Eintrag, der dasselbe liefert wie die Regel, bricht den
Build ab** — `кофе` flog genau daran heraus, es endet ohnehin auf `-е`.

**Der Präpositiv ist die einzige Rubrik mit ausgesuchten Wörtern.** «Wo?» verlangt einen
Ort, und ob ein Wort einer sein kann, sagt keine Endung: «в маме» wäre grammatisch
tadellos und Unsinn, «в утре» ebenso. Der Baustein nennt darum seine Wörter selbst; die
Übung nimmt daraus, was schon begonnen ist. Die **Regel** gilt trotzdem für jedes Nomen —
im Satz führt «Wissen» sie an allen vor.

### Belebtheit: eine eigene Eigenschaft, kein Geschlecht

Wortart, Geschlecht und Belebtheit sind drei Dinge. Die Endung verrät das Geschlecht, die
Belebtheit **nie** — sie steht immer in den Daten. Bis zum Präpositiv war sie nur bei
männlichen Nomen vermerkt, weil nur dort eine Form davon abhing (`брат` → `брата`). Der
Ortsfall brauchte mehr: Er muss Lebewesen aussperren, gleich welchen Geschlechts.

Darum tragen jetzt auch weibliche Lebewesen ein `wb` (18 Wörter: `мама`, `сестра`,
`кошка`, `лошадь` …), und der Code trennt die beiden Begriffe sauber:

```js
var GESCHLECHT_VON = { m: 'm', mb: 'm', w: 'w', wb: 'w', s: 's', sb: 's' };
function istNomen(art)    { return !!GESCHLECHT_VON[art]; }
function geschlecht(art)  { return GESCHLECHT_VON[art] || art; }
function belebt(art)      { return art === 'mb' || art === 'wb' || art === 'sb'; }
```

Wer nach dem Geschlecht fragt, fragt `geschlecht()`, nie das rohe Kürzel. Das war
vorher an zwei Stellen falsch: Der Baustein «Geschlecht» hätte `мама` als **Ausnahme**
ausgegeben, weil `wb ≠ w` — dabei sagt die Endung das Geschlecht völlig richtig, nur die
Belebtheit steht obendrauf.

### Der Ablauf eines Bausteins

1. **Entdecken.** Vier bekannte Wörter mit ihrer Form daneben, darunter drei Deutungen
   zur Wahl. Wer richtig wählt, hat die Regel selbst gefunden. Freie Eingabe wäre nicht
   bewertbar; die Wahl ist die bewertbare Form desselben Gedankens.
   **Die Gegenüberstellung muss kontrastieren** (`gramPaare()`) — worin, hängt an der
   Regel:

   | Baustein | links · rechts | der Gegensatz |
   | --- | --- | --- |
   | Geschlecht | Wort · Geschlecht | je eines pro Geschlecht |
   | Akkusativ | Grundform · Akkusativ | zwei, die sich ändern, eines, das bleibt |
   | Präpositiv | Grundform · в + Form | je eines pro Geschlecht — und dreimal dieselbe Endung |
   | Präsens (e) | ein Verb · vier Personen | die Endung wechselt, der Stamm nicht |
   | zweite Reihe | dieselbe Person, beide Reihen | drei `-ить/-еть`, eines `-ать` |
   | Ich-Form | ты-Form · я-Form | drei mit Wandel, **eines ohne** |

   Vier gleiche Fälle zeigen kein Muster, sondern vier Mal dasselbe. Und ohne das
   Gegenbeispiel sähe es aus, als wandle sich immer etwas.
2. **Die Regelkarte.** Ein Satz, eine Tabelle, ein Merksatz, eine Fußnote für die
   Ausnahmen. Später jederzeit über **«Mehr …»** wieder da — nicht über «Warum?». Der
   Knopf holt die ganze Karte zurück, nicht bloß eine Begründung; «Warum?» versprach
   weniger, als er liefert.
3. **Anwenden**, gestaffelt wie überall: bis Stufe 1 die Form aus vier wählen, ab
   `SATZ_STUFE` selbst tippen (kyrillische Tastatur einblendbar).

**Die Vorgabe steht in eigener Zeile** (`gramVorgabe()`, `.gram-vorgabe`): links die
Bedeutung, rechts nach einem Trenner in Gold, was verlangt ist — «hören · **я — ich**».
Vorher lief beides als ein Fließtext unter der Aufgabe mit und wurde überlesen; wer die
Person übersieht, beugt das richtige Verb in die falsche Form und hält die Regel für
schuld.

**Ein Baustein lässt sich gezielt wählen.** Die Auswahl (runder Knopf, `filterInhaltHtml()`)
führt in «Grammatik» die Gruppe **Baustein**: ein Chip je Regel mit ihrem Stand, dazu «Der
Reihe nach» als Vorgabe (`gramWahl === null`). Das ist der Weg zur **Wiederholung
gemeisterter Regeln** — ohne ihn schiebt `gramAktuell()` immer die dringendste vor, und
eine gemeisterte Regel kommt erst wieder, wenn sie fällig ist. Verschwindet die gewählte
Regel (Sicherung eingespielt), fällt `gramWahl` still auf `null` zurück.

Die Wörter kommen aus dem **begonnenen** Wortschatz — die Regel soll auf ein Wort wirken,
das man kennt, sonst prüft die Aufgabe zwei Dinge auf einmal. Ist noch nichts begonnen,
tun es die Beispiele des Bausteins. **Belebte männliche Nomen bleiben im Akkusativ
draußen**, bis ihr eigener Baustein dran ist: Die Übung fragt nie nach einer ungelernten
Regel, statt Falsches durchgehen zu lassen.

### «Wissen» — die Erklärung im Satz

In «Übersetzen» wird jedes Wort des russischen Satzes ein Knopf (`.satzwort`, zarter
Unterstrich — der Satz soll ein Satz bleiben). Antippen öffnet dasselbe Aufklapp-Panel wie
Menü und Auswahl; der runde Knopf `#wissenKnopf` zeigt darin den ganzen Satz.

| angetippt | Antwort |
| --- | --- |
| Grundform | Bedeutung, Umschrift, Geschlecht, Hörknopf |
| erklärte Nomenform | `книгу ← книга · weiblich · Akkusativ — wen? was? · а wird zu у` |
| erklärte Verbform | `пьёт ← пить · Präsens · он/она — er/sie · Stamm пь- + Endung -ёт` |
| erklärte Ortsform | `в России ← Россия · Präpositiv — wo? · Wörter auf -ия gehen auf -ии` |
| noch nicht erklärte Form | «Diese Form ist noch nicht erklärt — sie kommt mit einem späteren Baustein.» |

Der dritte Fall ist kein Mangel, sondern die ehrlichste Antwort, die die App geben kann.

**Erklärt wird nur die russische Seite, und nur wenn sie ohnehin dasteht.** In der
Richtung DE → RU schweigt das Fenster bis zur Auflösung — jede Erklärung wäre dort die
halbe Lösung.

Der Name ist mit Bedacht gewählt: **nicht «Tipp»**. Der Knopf «Hinweis» in «Tippen» zeigt
die Umschrift, ist also Lösungshilfe. Ein Tipp ist etwas, das man sich versagt — Wissen
soll man sich holen.

## Bilanz im Detail

Die sechs Kacheln der Bilanz sind **Knöpfe**; jede führt in eine Detailansicht mit einem
Ringdiagramm. `bilanzDetail` (`null`, `'woerter'`, `'saetze'`, `'antworten'`, `'serie'`)
hält den Zustand, `renderBilanz()` verzweigt darauf. Der Kopf trägt dann den Namen des
Details und «Bilanz» darüber, und der Zurück-Pfeil führt zunächst zur Bilanz statt nach
Home.

| Detail | Ring | darunter |
| --- | --- | --- |
| Wörter | fünf Leitner-Stufen | begonnene Themen mit Balken, Fälliges |
| Sätze | sitzt · offen · gesperrt | je Satzstufe eine Zeile |
| Antworten | zwei kleine Ringe: Tippen, Übersetzen | Gesamtzahl |
| Serie | laufende von bester | wie die Serie zählt |

**Die Ringe sind Inline-SVG ohne Bibliothek.** Ein Segment ist ein `<circle>`, dessen
Strich nur über einen Teil des Umfangs gezeichnet wird (`stroke-dasharray`) und der um
die schon belegte Strecke versetzt beginnt (`stroke-dashoffset`). Bei `r = 42` ist der
Umfang `2π·42 ≈ 263,9`; jedes Segment bekommt `anteil · Umfang`. Ein `rotate(-90deg)` auf
dem SVG lässt den Ring oben anfangen. Segmente mit Wert 0 werden weggelassen.

Die Farben stehen in `STUFEN_FARBE` und sind dieselben wie bei den Fortschrittspunkten
(`.pp.s0…s4`) — Stufe 3 sieht überall gleich aus. Weil SVG-Präsentationsattribute keine
CSS-Variablen auflösen, wird die Farbe über `style="stroke:…"` gesetzt.

**Kein Leak:** Gezeigt werden ausschließlich Zahlen, Anteile und Themennamen — nie eine
Liste von Wörtern oder Sätzen, die man noch nicht kennt. Die Themenliste zeigt nur
Themen, in denen schon etwas begonnen wurde.

**Konsistenz mit der Kachel:** Im Satz-Detail wird erst «sitzt» geprüft, dann «frei».
Andernfalls zählte ein gelernter Satz, dessen Wörter zwischenzeitlich zurückgefallen
sind, als gesperrt — und das Detail zeigte eine andere Zahl als die Kachel, die dorthin
führt.

## Tickets

Fehler und Wünsche werden in der App gesammelt und **bleiben auf dem Gerät**. Ein Knopf
bündelt sie zu einem Text, den man kopiert und Claude Code vorlegt. Nichts wird
verschickt, nichts geladen — die App braucht dafür weder Netz noch einen Zugangsschlüssel
(ADR 0016).

| Baustein | Aufgabe |
| --- | --- |
| `TICKET_KEY` | eigener `localStorage`-Schlüssel (`chillingo_tickets_v1`) |
| `ticketAnlegen()` | legt an, trimmt, begrenzt, ergänzt Ort, Stand und Gerät |
| `ticketAbschnitt()` | ein Ticket als Markdown-Abschnitt |
| `ticketsAlsText()` | bündelt eine Liste, älteste zuerst nummeriert |
| `datumLang()` | Ortszeit mit Versatz — der Text wird von Menschen gelesen |
| `inZwischenablage()` | Kopierversuch; scheitert er, bleibt der Text zum Markieren |
| `renderTickets()` | Liste, Formular, Ausgabe, Aufräumen |

Ein Ticket hält `id`, `art` (`bug`/`feature`), `titel`, `text`, `reiter`, `stand`,
`geraet`, `erstellt` und `uebergeben`. Der **eigene Speicherschlüssel** hält den
Sicherungscode schlank: Tickets gehören nicht zum Lernstand.

**`erstellt` ist streng steigend.** Zwei Tickets in derselben Millisekunde wären in der
Reihenfolge nicht mehr zu unterscheiden; `ticketAnlegen()` rückt den Zeitstempel darum
notfalls um eins vor. Damit ist die Nummerierung im gebündelten Text eindeutig.

**Ein Ticket lässt sich ändern.** Ein Tipp auf die Zeile holt es ins Blatt zurück
(`meldeBearbeiten()`); «Sichern» heißt dann «Ändern» und ruft `ticketAendern()` statt
`ticketAnlegen()`. `erstellt` bleibt stehen — die Reihenfolge soll sich beim Nachbessern
nicht verschieben —, `geaendert` kommt dazu und steht im gebündelten Text. **Ein
geändertes Ticket ist wieder offen:** Was übergeben wurde, stimmt so nicht mehr, und die
neue Fassung soll beim nächsten Bündeln mitgehen.

**Der Bezug heißt «Ort», nicht «Übung».** Er kann auch die Übersicht oder eine
Menüansicht sein, und «Übung: Übersicht» wäre schlicht falsch. Aus demselben Grund steht
die Zeit als **Ortszeit mit Versatz** (`2026-08-06 20:52 (UTC+02)`) statt in UTC — sie
wird von jemandem gelesen, der zu dieser Stunde vor dem Gerät saß.

**Der App-Stand steht in der Fußzeile, solange er für alle Tickets gleich ist.** Vier
Tickets desselben Tages nennen ihn sonst viermal. Unterscheiden sie sich, wandert er an
jedes Ticket zurück — dann sagt er etwas, nämlich gegen welche Fassung sich die Meldung
richtet.

**Bündeln heißt übergeben.** Wer «offene kopieren» tippt, bekommt den Text *und* setzt
damit `uebergeben` auf allen betroffenen Tickets — sonst müsste man den Zustand zweimal
pflegen und wüsste beim nächsten Mal nicht, was neu ist. «Alle kopieren» nimmt auch
Übergebene mit, ohne etwas zu ändern; «Übergebene löschen» räumt auf.

Der Text ist Markdown: ein Kopf mit der Anzahl, je Ticket ein Abschnitt mit Überschrift,
Beschreibung und den drei Metazeilen, am Ende einmal das Gerät.

`APP_STAND` ist das Datum der ausgelieferten Datei. `tools/build.mjs` stempelt es bei
jedem Schreiblauf; `--check` vergleicht bewusst *ohne* diesen Wert, sonst wäre die Datei
jeden Tag «nicht auf Stand».

### Melden von überall

Neue Tickets entstehen nicht in der Ticket-Ansicht, sondern über einen **schwebenden
Knopf unten rechts**, der über jeder Ansicht liegt. Er öffnet ein **Blatt von unten**
(`#meldeBlatt`), das nur den unteren Teil des Bildschirms einnimmt — man sieht weiter,
worüber man gerade redet. Der Fußabstand des `<body>` (96 px) hält dem Knopf Platz frei,
damit er nie über einer Knopfzeile liegt.

Im Blatt: Art (Fehler/Wunsch), Titel, Beschreibung und ein **Haken für den
Ansichtsbezug**, vorbelegt mit der Ansicht darunter. Abgehakt bleibt `reiter` leer, und
der gebündelte Text lässt die Zeile weg, statt «null» zu behaupten.

**Das Blatt folgt dem Finger — nach unten.** `meldeZiehenBinden()` hängt an
Pointer-Ereignissen: beim Ziehen folgt es gedämpft (`d^0,72 · 1,6` — je weiter, desto
zäher), nach oben gibt es gar nicht nach; dorthin führt kein Weg. Ab
`MELDE_SCHWELLE` (90 px) gilt das Loslassen als «zu», darunter federt es zurück. Auf
Eingabefeldern und Knöpfen greift das Ziehen nicht, sonst käme man nicht ins Textfeld.

**Zuklappen wirft nichts weg.** Weder das Ziehen noch ein Tipp auf den Hof neben dem
Blatt löscht den Entwurf — er steht beim nächsten Öffnen wieder da, und der schwebende
Knopf trägt so lange einen goldenen Punkt (`hat-entwurf`). Verworfen wird ausschließlich
über «Abbrechen»; ein halb geschriebenes Ticket durch eine Handbewegung zu verlieren wäre
der schlechtere Tausch (ADR 0025).

Erreichbar über **Menü → Tickets**. `letzterTab` hält die Übung, aus der man kam — die
ist gemeint, wenn ein Fehler gemeldet wird, nicht «Menü».

## Absicherung

Die ausgelieferte Datei ist öffentlich lesbar. Daraus folgen drei Regeln, die
`tools/pruefen.mjs` prüft statt sie nur zu behaupten:

1. **Kein Geheimnis in der Datei.** Kein Token, kein Passwort, kein Schlüssel — Prüfung
   auf die bekannten GitHub-Tokenformen und auf `Authorization:`/`Bearer`.
2. **Keine Fremdadresse.** Die Datei verweist nirgendwohin und lädt nichts.
3. **Content-Security-Policy als `<meta>`**:
   `default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`.
   Damit ist «keine externen Ressourcen» für den Browser erzwingbar statt nur
   verabredet: Käme je fremder Code in die Seite, könnte er nichts nachladen und nichts
   nach außen senden.

Ticketeingaben laufen wie alle Ausgaben durch `esc()`.

**Dass die Seite öffentlich ist, spielt für die Daten keine Rolle.** Lernstand und
Tickets liegen im `localStorage` des Geräts, nicht auf dem Server. Ein fremder Besucher
sieht seinen eigenen, leeren Speicher — es gibt nichts, worauf er zugreifen könnte, und
nichts, was er anlegen könnte. Eine Zugangsabfrage wäre darum nicht nur wirkungslos
(der Quelltext ist lesbar, jede Prüfung darin umgehbar), sondern gegenstandslos.

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
| `wortFehler` | Serie falscher Schreibungen je Wort — bei `WORT_STRAFE` fällt das Wort zurück |
| `patzer` | zurückgestufte Wörter mit dem Zeitpunkt ihres Falls — der Topf des Power-Trainings |
| `settings` | Einstellungen des Nutzers, siehe unten |

`wortFehler` und `patzer` stehen bewusst **nicht** im Sicherungscode: Beides sind
Momentaufnahmen, kein Lernstand.

Daneben existieren pro Übung einige Modulvariablen (`uebQ`, `uebPhase`, `trTask`,
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
eine Zeile in `renderEinstellungen()` und — falls sie das Verhalten einer Übung
ändert — eine Abfrage an der betreffenden Stelle. `mergeState()` sorgt dafür, dass
bestehende Lernstände die neue Einstellung mit ihrem Vorgabewert bekommen; deshalb darf
`state.settings` nie als Ganzes aus dem gespeicherten Stand übernommen werden.

Einstellungen sind kein Fortschritt: „Fortschritt zurücksetzen" in der Bilanz lässt sie
stehen. Eine wiederhergestellte Sicherung bringt dagegen die dort gespeicherten
Einstellungen mit, weil `mergeState()` auch auf dem Sicherungscode arbeitet.

Erreichbar sind sie über den Reglerknopf in der Kopfzeile, nicht über einen eigenen Tab —
Home trägt bereits vier Kacheln.

## Lernweg: Lernsets, Freestyle, Fälligkeit

Alle Übungsrubriken ziehen aus demselben Bestand (`ALL_VOCAB`) und schreiben in denselben
Leitner-Stand (`state.boxes`). Unterschiedlich ist nur, *welchen Ausschnitt* sie sehen:

| Übung | Ausschnitt |
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
- Beide Übungen teilen sich Fragelogik und Zustand; `uebModus` entscheidet über
  Wortvorrat und Kopfzeile, `render()` setzt beim Wechsel die Frage zurück.
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
Teilaktualisierung: eine Ansicht wird immer vollständig neu gezeichnet.

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
