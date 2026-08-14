# Arbeitsanweisung

## Umgang mit mir

Antworte auf Deutsch, sprich mich mit „Sir" an, Sie-Form. Direkt und knapp, proaktiv
Vorschläge machen. Vor Force-Push, Löschen von Dateien und History-Rewrite meine
ausdrückliche Zustimmung einholen. Bei Zielkonflikten zwischen meinen Vorgaben: sag es
mir, statt still eine Seite zu wählen.

## Projekt

**Chillingo** — Web-App zum Russischlernen (Kyrillisch lesen, schreiben, übersetzen) als
**eine einzelne, offline lauffähige HTML-Datei**. Gehostet über GitHub Pages unter
https://chillijust.github.io/. Zielgerät: iPhone 15 Pro Max (iOS 26.5.2), installiert über
„Zum Home-Bildschirm" als PWA im Vollbild.

Einstieg ist **Home**: Empfehlung plus eine Kachel je Übung. Der Begriff ist **Übung**,
nicht «Rubrik». In dieser Reihenfolge:
**Lernsets** (zielgerichtet: die Wörter der nächsten Sätze, schaltet «Übersetzen» frei),
**Freestyle** (freies Vokabeltraining nach Thema, ohne Sperren),
**Tippen** (Eingabequiz mit kyrillischer Tastatur, ab Leitner-Stufe 3),
**Übersetzen** (nur Sätze, deren Wörter sitzen; Form und Richtung steigern sich mit der
Stufe — Kacheln vor Tippen, RU→DE vor DE→RU),
**Buchstaben** (das kyrillische Alphabet — freiwillig, eigener Lernstand, zählt nicht in
Serie und Fortschritt; Einstieg ist das Üben, die Tafel liegt hinter einem eigenen Knopf),
**Schreibung** (warum man nicht schreibt, was man hört — eine Regel je Karteikarte,
zählt mit),
**Grammatik** (warum ein Wort so dasteht — freiwillig, entdecken statt belehren),
**Power-Training** (die zurückgefallenen Wörter zurückholen — drei auf einmal, ab drei
gefallenen offen).
Keine Übungen, sondern **im Menü** (runder Knopf, drei Striche): **Bilanz**,
**Sicherung**, **Einstellungen**, **Tickets**. Dazu **Sprachfakten** aus der Faktenkarte oder der
Bilanz. Eine Reiterleiste gibt es nicht — der Kopf trägt unterwegs den Rückweg.

Maskottchen ist die Chili — freigestellt aus `docs/IMG_2942.png` mit
`tools/freistellen.py`, abgelegt als `docs/maskottchen-freigestellt.png`. In der App gibt es sie
genau einmal als `#chiliFigur` in der Hülle `#chiliBuehne`; Ansichten stellen mit
`maskottchen(klasse)` nur einen Platzhalter auf, in den sie umgehängt wird. Nie ein
zweites Mal einbetten, und nie über Scroll-Rechnung positionieren — sie steht im Fluss
(ADR 0012). **Ein Klick ist eine Bewegung:** Wer mehr als ein Blatt auf einmal schließt,
wickelt das in `chiliZusammen()` — sonst fliegt sie über einen Zwischenhalt, und der
zweite Flug bricht den ersten ab. Ein runder Knopf, in den sie springt, braucht
`overflow: visible` und `z-index: 40`; geblendet wird in einer Hülle darin.

## Harte Rahmenbedingungen — nicht verhandelbar

- Kein React, kein JSX, kein Build-Schritt, keine npm-Toolchain im Auslieferungspfad.
- Keine externen Ressourcen: keine CDNs, keine Google Fonts, keine externen Bilder, keine
  API-Aufrufe. Alles inline. Symbole als Inline-SVG über `ICON` — **keine Emoji-Zeichen**,
  iOS rendert sie als farbige Grafik. `tools/pruefen.mjs` bricht darüber ab. Die
  Content-Security-Policy im `<head>` macht die Regel für den Browser erzwingbar; sie
  bleibt drin.
- **Die ausgelieferte Datei ist öffentlich lesbar.** Nie ein Token, ein Passwort oder
  einen Schlüssel hineinschreiben — auch nicht verschleiert, auch nicht «nur zum Testen».
  `pruefen.mjs` sucht nach tokenähnlichem Text und bricht bei **jeder** Fremdadresse ab —
  die Datei verweist nirgendwohin und lädt nichts. Dass die Seite öffentlich ist, ist für
  die Daten belanglos: Lernstand und Tickets liegen im `localStorage` des Geräts, ein
  fremder Besucher sieht seinen eigenen, leeren Speicher.
- Persistenz ausschließlich über `localStorage`, jeder Zugriff in `try/catch`.
- Mobile-first: Touch-Ziele ≥ 44 × 44 px, keine Hover-abhängige Bedienung,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)` für Notch und
  Home-Indicator.
- **Ein runder Knopf, in dem die Chili landen soll**, steht genau einmal im Dokument und
  wird umgehängt, nicht neu gebaut (ADR 0044). Wer ihn in eine Kachel setzt: erst nach
  Hause schicken, dann zeichnen, dann umhängen — `renderKopf()` läuft vor der Ansicht.
- **Die App duzt** (ADR 0050). Jeder Text, der den Nutzer anspricht, sagt «du» — auch
  Kommentare und Jubel. **Der Lehrstoff bleibt davon unberührt:** «вы» heißt weiterhin
  «ihr / Sie», «Sie schreibt einen Brief» ist она пишет, und eine Grammatikerklärung darf
  «sie» über Wörter sagen. Die Suite `anrede` liest den gerenderten Text jeder Ansicht und
  führt die Ausnahmen namentlich — wer eine hinzufügt, begründet sie dort.
- **Der Fakt hat überall dieselbe Gestalt, der Kommentar auch** (ADR 0049). Ein Fakt ist
  immer die Karte mit Sprechblase und Chili (`faktKarteHtml()`), gefragt beim
  **Weitergehen** über `faktFaellig()` — der Streifen unter der Auflösung ist weg. In
  seiner Zeile steht jetzt nach **jeder** Auflösung ein Kommentar (`kommentarSetzen()`,
  `kommentarHtml()`), in allen Übungen außer «Buchstaben». Die Sätze sind **Inhalt** und
  stehen in `data/kommentare.json`; das Mischungsverhältnis von trocken zu freundlich ist
  eine Eigenschaft der Liste, keine Zahl im Code. **Ein fester Satz behauptet keine Zahl,
  die er nicht kennt** — wer eine nennt, nimmt `{n}`, `{f}` oder `{s}`. Und **gelegt ist
  nicht geschrieben**: Lob für ё, Weichzeichen oder Wortlänge gibt es nur bei getippten
  Aufgaben.
- **Drei Strengen, drei Schalter** (ADR 0056). **Die Nachschrift** (`reko`,
  `rekoVerlangen/Html/Fertig/Binden`, geteilt von allen fünf Schreibaufgaben) hält nach
  einem Schreibfehler den «Weiter»-Knopf zu, **bewertet aber nichts** — sonst tippte man
  sich aus dem Fehler heraus. Nur bei Getipptem, nur bei Kyrillisch, Sätze nur auf
  ausdrückliche Ansage. **Das Tagesmaß** bremst an genau einer Stelle (`uebVorrat()` in
  `waehleWort()`) und **nur Neues** — Wiederholen bleibt unbegrenzt (ADR 0048); der Tag
  kommt aus `heuteNr()`, dem Kalender des Geräts. **Das Fehlerprofil** (`state.verwechselt`)
  liefert höchstens **zwei** der drei Ablenker; drei wären eine Wiedervorlage.
  `verwechselt` und `neuHeute` gehören zum Gerät und stehen **nicht** im Sicherungscode.
- **Die Lücke ist ein Paar, keine Zahl** (ADR 0055). Eine Aufgabe in «Schreibung» nennt
  beide Schreibweisen — die richtige (`ist`) und die nach Gehör (`klingt`); wo sie sich
  unterscheiden, ist die Lücke. Eine Zahl kann danebenliegen, ohne dass es jemand merkt —
  vierzehn taten es. Build und Suite rechnen jede Aufgabe nach. Eine **leere** Stelle ist
  ein gültiger Fall («ь oder nichts»). `hoerbar: false` heißt: Beide Schreibweisen klingen
  gleich, dort behauptet die Übung keine Lautung. **Kein Kyrillisch in `name` und `kurz`**
  — beide stehen in Versalien-Etiketten.
- **Der Jubel ist ein Fenster für das Seltene** (ADR 0044) — sechs Anlässe, ausgelöst nur
  am Übergang, Ton ausgelost. Ein einzelnes gemeistertes Wort bekommt weiter nur eine
  Zeile: Was oft passiert, darf keine Hürde werden.
- **Eine Auszeichnung wird genau einmal gefeiert** (ADR 0047). Set, Thema, Alphabet und
  Grammatik hängen an einer *Sammlung* und wären sonst beliebig oft auslösbar — ein
  zurückgefallenes Wort zurückzuholen macht das Set ein zweites Mal voll. Die Marken
  stehen in `state.gefeiert`, gesetzt über `jubelEinmal()`, nachgetragen von
  `jubelNachtragen()` nach `load()` **und** nach dem Einspielen einer Sicherung. Der
  leere Topf im Power-Training bleibt wiederholbar — er ist eine Aufgabe, keine
  Auszeichnung.
- **Die Fortschrittsreihe brennt** (ADR 0046) — ein Zeichen je Wort, gebaut von
  `ppHtml(stufe)` und sonst nirgends: Stufe 0 bleibt ein Strich, ab Stufe 1 wächst eine
  Flamme mit. **Nur Gold flackert**; die Animation hängt an `.punkt` und `.pp.s4`, nicht
  an `.flamme-aussen` allein. Die Farben der Stufen sind unverändert — die Gestalt trägt
  die Aussage, die Farbe bestätigt sie.
- **Die Übersicht ordnet in drei Gruppen** (ADR 0045): Wörter · Sätze · Freiwillig. Eine
  neue Übung braucht einen Eintrag in `UEBUNG_GRUPPEN` **und** in `UEBUNGEN`.
- **Das Tutorial ist ein Scheinwerfer** (ADR 0051) — ein durchsichtiges `#tutLoch` mit
  `box-shadow: 0 0 0 9999px`, das die echte Oberfläche anleuchtet. Die zwölf Schritte
  sind **Inhalt** und stehen in `data/tutorial.json` (`[Ort, Ziel, Text]`); ein Schritt
  ist ein Absatz, und zusammen sagen sie, **in welcher Reihenfolge** man übt. **Ein
  Wähler, der ins Leere zeigt, ist ein stiller Fehler** — wer ein Ziel umbenennt, prüft
  die Suite `tutorial`. Ohne Ziel deckt der **Hof** ab, nicht das Loch; außerhalb des
  Bildes endet die Streuung genau am Bildrand. **Die Chili erzählt** — sie steht frei
  neben dem Angeleuchteten, der Text kommt als Sprechblase aus ihr heraus, und der Zipfel
  zeigt auf **sie**. Keine Karte, in der beides säße. Ihr Platzhalter `#tutChili` steht in
  `chiliPlatzhalter()` **vor** allem anderen; ihr Sprung wird in **Bildkoordinaten**
  gemessen (`tutChiliLage()`) — die eine benannte Ausnahme zu ADR 0012. **Der weiche Rand
  des Lochs braucht dieselbe Deckung wie der äußere Schatten** — sonst bleibt die Linie
  blass stehen. **Der Einstiegsknopf wandert**: goldenes Angebot ganz oben,
  bis das Tutorial **einmal ganz** lief, danach ruhig ganz unten — aber immer nur
  **einmal** im Dokument. Zwei Merker: `tutorialGesehen` (fällt beim Öffnen, steuert das
  automatische Angebot) und `tutorialFertig` (fällt nach dem letzten Schritt, steuert den
  Platz). Ein Abbruch setzt nur den ersten.
- **Die Einstellungen haben Reiter** (ADR 0045). Was nur auf einem Reiter steht, ist beim
  Binden nicht immer da — vor `addEventListener` prüfen. `einstReiter` gehört in
  `ansichtenZuruecksetzen()`.
- **Ein Farbschema, keine zwei Achsen** (ADR 0039): die Einstellung `schema` mit den
  Werten Dark (Vorgabe), Classic, Grün, Blau, Rosa — `data-schema` am `<html>`-Element,
  «dark» trägt keines. Vier davon sind hell; die Farben gibt es nicht in einer dunklen
  Fassung. **`prefers-color-scheme` wird nicht ausgewertet** — ein Schema ist eine Wahl,
  keine Umgebungsbedingung.
- Die App muss offline funktionieren, nachdem sie einmal geladen wurde.

## Verzeichnisse

```
index.html                die App — genau diese Datei wird ausgeliefert
.nojekyll                 schaltet Jekyll ab, niemals löschen
data/*.json               Lerninhalte, einzige Quelle für Vokabeln/Sätze/Fakten/
                          Tastatur/Buchstaben/Grammatik/Verben/Nomen/Kommentare/
                          Tutorial/Betonung/Schreibregeln
tools/build.mjs           /data prüfen und in index.html einbetten (--check = nur prüfen)
tools/pruefen.mjs         Vor-Push-Prüfung von index.html
tools/pruefstand/         Prüfstand: lauf.mjs, suiten/*.mjs, bild.mjs (siehe README dort)
.claude/skills/           Abläufe für Claude: pruefstand, ticket
.claude/hooks/            vor-dem-push.mjs — hält den Push an, wenn etwas rot ist
tools/freistellen.py      Maskottchen aus einem Bild freistellen (ohne Bildbibliothek)
tools/skaliere.py         PNG auf Icon-Größe bringen (ohne Bildbibliothek)
tools/appikon.py          App-Symbol bauen: Grund tauschen, Sprechblase umdrehen
tools/palette.py          getönte Paletten aus dem neutralen Grundton rechnen
docs/                     Architektur, Datenmodell, Deploy, Entscheidungen (ADRs)
docs/decisions/           kurze ADRs, fortlaufend nummeriert
```

Vor inhaltlicher Arbeit lesen: `docs/architektur.md` (Zustand, Render-Zyklus),
`docs/datenmodell.md` (Format der Inhalte), `docs/deploy.md` (Pages, Cache).

## Konventionen

- **Code-Stil in `index.html`:** ES5-nah — `var`, klassische `function`-Ausdrücke, keine
  Klassen, keine Module, kein `async`, `'use strict'` am Skriptanfang. Bewusst so; neue
  Abschnitte folgen demselben Stil. Zwei Leerzeichen Einrückung, einfache
  Anführungszeichen. Gliederung über Kommentarbalken.
- **Alle Ausgaben durch `esc()`**, Ereignisbehandler nach dem Setzen von `innerHTML`
  anhängen, nie als `onclick`-Attribut.
- **Die Betonung ist eine Zahl** (ADR 0054), keine zweite Schreibweise: `data/betonung.json`
  sagt, der wievielte Vokal sie trägt. **Nie ins Wort schreiben** — die Kennung im
  Lernstand *ist* das russische Wort, und ein Tippfehler darin löscht einen Lernstand.
  Angezeigt **nur** über `ruAnzeige()`/`betontesWort()`; verglichen wird nie mit ihr
  (`normalize()` wirft U+0301 weg), gesprochen auch nicht. Die Einstellung `betonung`
  blendet sie ab Stufe 3 aus — im Druck steht keine.
- **Das Wort steht im Satz** (ADR 0053). «Lernsets» und «Freestyle» haben eine vierte
  Aufgabenform: die **Kontext-Lücke**. Ab `SATZ_STUFE` und nur in einem **freigeschalteten**
  Satz — ein Satz voller unbekannter Wörter erklärt nichts. Die Ablenker sind andere
  **Formen desselben Wortes** aus `grammForm()`; unter zwei davon gibt es keine Lücke
  (Pronomen haben keine). **Der Hörknopf schweigt, solange die Lücke offen ist** — er läse
  die Antwort vor. Wer eine Aufgabenform hinzufügt, prüft `meister` und `hoeren` mit: Beide
  gingen von drei aus und wurden davon flatterhaft.
- **Die App sagt, was sie über sich weiß** (ADR 0052): Offline-Anzeige im Kopf,
  `storage.persist()` beim Start in `try/catch`, Erinnerung an die Sicherung nach 30 Tagen
  (erst ab 60 Antworten), Tempo je Übung in der Bilanz. **Die Uhr (`uhrStellen()`) steht
  in den Aufgabenbauern, nicht im Renderlauf** — sonst misst sie das Tippen statt das
  Denken —, und `ansichtenZuruecksetzen()` hält sie an. `state.tempo` und
  `state.gesichertAm` gehören zum Gerät und stehen **nicht** im Sicherungscode.
  `min-height` steht dreifach: `100vh` als Rückfall, dann `svh`, dann `dvh`.
- **Neue Einstellung:** Vorgabe in `defaultSettings()`, Zeile in `renderEinstellungen()`,
  Abfrage an der wirksamen Stelle. Gespeicherte Stände werden über `mergeState()`
  aufgefüllt — `state.settings` nie als Ganzes aus dem Speicher übernehmen. Die
  Einstellungen sind nach Fragen gegliedert: **Lernweg**, **Abgabe**, **Eingabe**,
  **Darstellung und Ton**. Eine **Frist ist ein Zähler**, keine Chip-Reihe (ADR 0015):
  Grenzen und Vorgabe je Schlüssel in `ZAEHLER`/`zaehlerGrenzen()`, Gedrückthalten zählt
  weiter, und er zeichnet **an Ort und Stelle** nach — ein Renderlauf würde die gehaltene
  Taste wegwerfen. Was im Feld steht, sagt `zaehlerAnzeige()`: Beim Tagesmaß heißt Null
  «ohne Grenze», nicht «null neue Wörter». Soll eine geänderte Vorgabe auch bestehende Geräte
  erreichen, den Schlüssel umbenennen — der alte Wert fällt in `mergeState()` weg.
- **Vorlesen nur über `hoerknopf(text, sprache)`** — der Text hängt als `data-say` am
  Knopf, ein einziger Zuhörer auf `#main` bedient alle. Nie einen eigenen Zuhörer je
  Knopf anhängen. Was die Antwort wäre, schweigt bis zur Auflösung.
- **Klang nur über `ton(richtig)`** beziehungsweise `meisterTon(richtig)`. Erzeugt in der
  Web Audio API, nie als Datei, immer in `try/catch`, abschaltbar über die Einstellung
  `ton`. Kein Ablauf darf Ton voraussetzen. **Ein schlafender Kontext heißt `suspended`
  *oder* `interrupted`, und `resume()` ist asynchron** — wer sofort danach Noten plant,
  plant ins Leere (ADR 0026). Auf iOS schweigt Webton außerdem beim Stummschalter, solange
  `navigator.audioSession.type` nicht auf `transient` steht, und ein Kontext gilt erst als
  freigegeben, wenn er **in einer Geste** einmal etwas ausgegeben hat (ADR 0027).
- **Der Datenblock zwischen `DATEN:START` und `DATEN:ENDE` ist generiert.** Inhalte
  ausschließlich in `/data` ändern, danach `node tools/build.mjs`.
- **Die Version steht in `VERSION`**, sonst nirgends von Hand (siehe `docs/deploy.md`):
  erste Ziffer = der Lernstand wird anders gelesen, zweite = etwas kommt dazu, dritte =
  alles Übrige (Oberfläche und Fehler). `tools/build.mjs` stempelt sie als `APP_VERSION`.
- **`APP_STAND` setzt `tools/build.mjs`**, nicht die Hand. Der Wert geht in jedes Ticket
  ein. `--check` vergleicht ohne ihn, sonst wäre die Datei jeden Tag «nicht auf Stand».
- **Ein Entwurf im Meldeblatt überlebt das Zuklappen.** Nur «Abbrechen» wirft ihn weg;
  Ziehen und Danebentippen schließen bloß. Wer das ändert, nimmt dem Blatt seinen Sinn
  (ADR 0025).
- **Tickets liegen in `chillingo_tickets_v1`**, nicht im Lernstand — der Sicherungscode
  soll schlank bleiben. Sie verlassen das Gerät nie von selbst: ein Knopf bündelt sie zu
  einem Text zum Kopieren (ADR 0016). Der Bezug heißt **Ort**, nicht «Übung» — er kann
  auch die Übersicht oder eine Menüansicht sein. Vom Blatt führt eine Zeile in die Liste;
  sie klappt nur zu, sie leert nicht.
- **Die Kachel liegt in jedem Schema über dem Grund**, die Kopfzeile nimmt überall den
  Grund. In «Dark» ist der Grund beinahe schwarz und warmneutral, die Kachel deutlich
  abgesetzt (ADR 0041). `--card-2` ist die Bedienfläche für Chips, Schalter und Tasten —
  in «Dark» über der Kachel, in den hellen darunter. Die dunkle Palette steht dreifach:
  `:root`, `SCHEMATA`, `theme-color` im `<head>`.
- **Ein aufklappendes Blatt trägt `--blatt`** (ADR 0042) — in «Dark» den Grund, in den
  hellen Schemata die Kachel. Wer die helle Leiter verschiebt, prüft `--dim`, `--gold`
  und `--good` mit: Sie hängen daran, und unter der Leiter liegt keine Grenze mehr.
- **Ein Schema tönt nur die Flächen** (ADR 0039) — `--bg`, `--card`, `--card-2`,
  `--line`, `--glow`. Schrift, Gold und die Signalfarben stehen einmal für alle hellen
  Schemata, sonst hieße «richtig» auf Rosa etwas anderes als auf Grün. Neue Werte rechnet
  `tools/palette.py`: Alle hellen Schemata teilen dieselbe Staffelung der Helligkeit, nur
  Farbton und Sättigung wandern. Ein Stand von vor ADR 0039 wird über `schemaAusAchsen()`
  übersetzt — in `mergeState()` **und** in `decodeBackup()`.
- **Was `normalize()` übersieht, übersieht auch die Farbe** (ADR 0037). Die Prüfzeile
  färbt das Getippte zeichenweise ein; Satzzeichen, Leerraum, Groß-/Kleinschreibung und
  ё/е kosten nichts — sonst stünde eine als richtig gewertete Antwort rot da. Die Farbe
  trägt nie allein: Falsches ist zusätzlich unterstrichen, und eine Zeile zählt es in
  Worten. Sie steht in **allen vier Schreibaufgaben** (`pruefzeileHtml()`, drei Gestalten
  je nach Feld); die Kachelmodi bleiben draußen — gelegt ist nicht geschrieben.
- **Die eingebaute Tastatur kommt von selbst, wo Kyrillisch verlangt ist**
  (`tastaturVorgabe()`, Einstellung `tastaturAuto`). Die Sprache der *Geräte*tastatur
  kann eine Seite nicht wählen — iOS entscheidet das, `lang` ist kein Hebel. Nichts
  vortäuschen, was das Betriebssystem nicht hergibt.
- **Die Tastatur steht genau einmal im Code** (`tastaturHtml(attr)`, alle vier
  Schreibaufgaben). Ihr Aufbau folgt der gewohnten: drei Buchstabenreihen, Rücktaste
  rechts am Ende der dritten, Leerzeichen breit und mittig in einer vierten.
- **Die Schalter im Sicherungscode stehen an festen Stellen** (`BK_SETTINGS`). Eine
  Einstellung, die es nicht mehr gibt, hinterlässt ein `null` als Platzhalter; was ein
  Code nicht führt, behält seine Vorgabe.
- **Gewertet wird nur, was der Nutzer behauptet hat** (ADR 0033). Die Wortauswertung in
  «Übersetzen» greift nur beim Schreiben ins Russische; Kacheln, die deutsche Seite und
  «Aufdecken» bleiben draußen. Wer aufgibt, hat nichts falsch geschrieben.
- **Aufgaben sitzen auf zwei Dritteln der Höhe**, nicht oben: Der Körper trägt in den
  Übungen die Klasse `aufgabe`, zwei Streben in `#main` teilen den freien Raum 2:1. Das
  bringt «Prüfen» und «Weiter» in Daumenreichweite. Beide Streben haben Basis 0 und
  schrumpfen nicht — bei hohem Inhalt fallen sie weg, statt oben abzuschneiden.
- **Der Rückweg steht in `zurueckGehen()`** — Pfeil, Randwischgeste und die
  «Zurück»-Knöpfe der Menüansichten teilen ihn sich. Die Geste schweigt, solange ein
  Blatt offen ist. Zurück heißt **dorthin, wo man herkam** (`ansichtStapel`), nicht nach
  Home; Home räumt den Stapel, und wer umkehrt, nimmt den Schritt zurück, statt einen
  zweiten daraufzusetzen (ADR 0036).
- **Ein Baustein, der etwas über die Welt voraussetzt, nennt seine Wörter selbst** —
  Präpositiv, Mehrzahl, Genitiv und Übereinstimmung (ADR 0043). «в маме», «zwei Wasser»,
  «нет музыки», «тёмный папа» sind alle tadellos gebeugt und trotzdem Unsinn. Die
  Übereinstimmung nennt dafür in `partner` die Nomen, nach denen sich ein Adjektiv
  richten darf.
- **Grammatik ist eine Funktion, kein Fakt** (ADR 0030). Die Karteikarte ist die **Regel**,
  nicht das Wort, und die Aufgabe verlangt ein bekanntes Wort in einer nie gesehenen Form —
  sonst prüft sie Auswendiglernen. Formen rechnet `grammForm()`; sie steht doppelt (App und
  Build) und wird an den vermerkten Formen der Sätze gemessen. Elf Bausteine, fünf Formen
  je Nomen (`akk`, `praep`, `gen`, `dat`, `plural`); in `data/nomen.json` wird **jede Angabe für
  sich** gegen die blanke Regel geprüft, nicht der Eintrag als Ganzes. **Eine Wortart-Angabe, die
  nur wiederholt, was die Endung sagt, lässt den Build scheitern** — sonst verdeckt die
  Liste die echten Ausnahmen. Dasselbe gilt für `data/verben.json`: **ein Eintrag, der
  dasselbe liefert wie die blanke Regel, bricht den Build ab** (ADR 0031).
- **Erklären und abfragen sind zwei Dinge.** Was sich nicht herleiten lässt, erklärt
  «Wissen» im Satz, aber die Übung fragt nicht danach — belebte männliche Nomen im
  Akkusativ, Verben mit eigenem Stamm (`писать` → `пиш-`), `быть` im Präsens (das es
  nicht gibt: `буду` ist Zukunft), der Ortsfall auf `-у` (`в году`, `в лесу`). Lieber
  schweigen als danebenliegen.
- **Geschlecht und Belebtheit sind zwei Dinge** (ADR 0032). Nie das rohe Kürzel für das
  Geschlecht halten — immer `geschlecht(art)` fragen, sonst gilt `мама` als Ausnahme und
  `мышь` wird zu «мыше». `belebt(art)` sagt, ob ein Lebewesen gemeint ist.
- **Eine richtige Form kann trotzdem Unsinn sein.** «в маме» ist grammatisch tadellos —
  in einer Mutter ist niemand. Wo eine Regel etwas über die Welt voraussetzt und nicht
  nur über die Sprache, nennt der Baustein seine Wörter selbst (bisher nur Präpositiv).
- **Kein Kyrillisch in Versalien-Etiketten** (`.task-label`, `kurz` der Bausteine):
  «в на» liest sich als «B HA». `.cyr` ist von `text-transform` ausgenommen — im
  Datenfeld hilft das aber nicht, dort gehört gar kein Kyrillisch hin.
- **Die Sätze tragen den Lehrplan** (ADR 0057). Ein Wort ohne Satz liegt in keinem Set
  und ist nur über «Freestyle» und «Tippen» erreichbar — mehr Vokabeln allein bringen
  darum nichts, mehr Sätze alles. `data/saetze.json` steht **nach Stufe und Reifegrad
  sortiert**. **Nichts Bestehendes umformulieren:** Die Kennung eines Satzes im
  Sicherungscode ist sein Text. Schneidet der Zuwachs die Lernsets neu, wird
  `state.setSchnitt` ungültig, und `setSchnittPruefen()` wirft die `set:*`-Marken weg —
  sonst meint «set:7» etwas anderes als vorher. **Der Dativ verlangt Lebewesen**
  («книге нравится» ist Unsinn), der Präpositiv umgekehrt Orte.
- **Die Reihenfolge in `data/vokabeln.json` ist der Lehrplan.** Aus ihr und den
  Satzvoraussetzungen bauen sich die Lernsets (`SET_MAX`, `SATZ_STUFE`); Ergänzungen ans
  Ende des passenden Themas.
- **Jeder Satz nennt in `benoetigt` seine Voraussetzungen als Grundformen** («книгу» →
  `книга`). Ein Satz mit unbekanntem Wort lässt den Build scheitern — das Wort gehört
  zuerst in den Lehrplan.
- **Commits:** einer je logischer Änderung, Nachricht auf Deutsch, Betreffzeile im
  Imperativ. Im Rumpf steht, *warum*.
- **Branches:** neue Branches nur auf meine ausdrückliche Ansage. Direkte Arbeit auf
  `main` nur, wenn ich es für den jeweiligen Vorgang freigegeben habe.

## Prüfstand und Push

Die App wird am **echten DOM** geprüft: Die ausgelieferte Datei bekommt ein Skript
angehängt, ein kopfloser Browser lädt sie, das Skript prüft und schreibt sein Urteil in
den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs   # alle Suiten, ~16 s
node tools/pruefstand/lauf.mjs -q jubel flammen
```

**Der Push ist abgesichert.** `.claude/hooks/vor-dem-push.mjs` fährt vor jedem
`git push` `build.mjs --check`, `pruefen.mjs` und den Prüfstand und hält an, wenn etwas
rot ist. Notausgang, wenn es wirklich raus muss: `PRUEFSTAND=aus` vor den Befehl. Ein
GitHub-Lauf (`.github/workflows/pruefstand.yml`) prüft dasselbe noch einmal unabhängig
von jeder Sitzung.

**Eine Suite bricht mit `throw` ab, nie mit `process.exit()`** — ein Ausstieg beim Bauen
beendet den Läufer selbst, ohne Ausgabe und ohne Grund.

**Wer index.html anfasst, sichert die Änderung mit einer Prüfung ab** — der Prüfstand
ist das Gedächtnis für jeden Fehler, der schon einmal da war. Wie eine Suite entsteht:
Skill `pruefstand` und `tools/pruefstand/README.md`.

Nach dem Push: bestätigen, dass die Live-Seite tatsächlich aktualisiert wurde — Pages
braucht ein bis drei Minuten, der Cache bis zu zehn.

**Für einen ganzen Vorgang** — vom gemeldeten Befund bis zur bestätigten Auslieferung —
gibt es den Skill `ticket`.

## Bekannte Fallstricke

- **Jekyll.** Ohne `.nojekyll` rendert Pages Markdown und packt alles in ein
  Theme-Layout — genau der Fehler, der die Seite ursprünglich unbrauchbar machte
  (ADR 0003). Datei nie löschen. Kein YAML-Front-Matter in `index.html`.
- **Fehlendes DOCTYPE.** Ohne `<!DOCTYPE html>` in Zeile 1 rendert Safari im
  Quirks-Mode; Flexbox und Viewport verhalten sich anders. War schon einmal versehentlich
  entfernt.
- **iOS-Quick-Look** (Vorschau aus Dateien/Mail) zeigt HTML anders als Safari und
  speichert nichts dauerhaft. Testen immer in Safari oder in der
  Home-Bildschirm-Verknüpfung.
- **`localStorage`** wirft im privaten Modus und bei vollem Kontingent. Jeder Zugriff in
  `try/catch`; schlägt das Schreiben fehl, Hinweis auf den Sicherungscode zeigen.
  Schlüssel: `russisch_trainer_v1` — Schemawechsel nur mit neuem Schlüssel und Migration.
- **`speechSynthesis`** braucht auf iOS eine Nutzergeste, liefert Stimmen erst
  verzögert und schweigt im Stummschalter-Modus. Nie in einen Ablauf einbauen, der ohne
  Sprachausgabe nicht funktioniert; Aufrufe in `try/catch`.
- **Safari-Cache.** Eine bestehende Home-Bildschirm-Verknüpfung hält ihren eigenen
  Cache. Zeigt sie nach einem Deploy noch den alten Stand: Verknüpfung löschen und neu
  anlegen.
- **Touch-Ziele und `:hover`.** Auf iOS bleibt ein Hover-Zustand nach dem Tippen hängen;
  Zustände deshalb über Klassen setzen, nicht über `:hover`.
- **Wörter, die dreimal hintereinander falsch geschrieben werden**, fallen auf
  `SATZ_STUFE - 1` zurück und schließen damit ihren Satz (ADR 0033). Der Zähler steht in
  `state.wortFehler`, die Gefallenen in `state.patzer`; richtig geschrieben löscht beides.
  Beides steht bewusst **nicht** im Sicherungscode — es sind Momentaufnahmen, kein
  Lernstand.
- **Ein Wort ist lesbar, wenn alle seine Buchstaben *gemeistert* sind** (ADR 0035) —
  nicht, wenn sie «sitzen». Der Lesemodus in «Freestyle» (`uebLesen`) schneidet quer
  durch die Themen. Sein Leerzustand braucht **zwei Ausgänge**: Ein gefallener Buchstabe
  kann den Vorrat wegschmelzen lassen, und ein Modus ohne Ausgang wäre eine Falle.
- **Das App-Symbol lässt sich zur Laufzeit nicht wechseln.** iOS liest
  `apple-touch-icon` einmal, beim Anlegen der Verknüpfung — keine Medienabfrage, keine
  Schnittstelle dafür. Ein Umschalter in den Einstellungen wäre eine Attrappe. Gebaut
  wird das Symbol mit `tools/appikon.py`; wer die Farben ändert, denkt an die
  Sprechblase, die sonst im hellen Grund verschwindet.
- **Das Power-Training zählt regulär mit** (ADR 0034). `ptPruefen()` ruft `updateBox()`
  und `meisterPruefen()` wie jede andere Übung; ein zweiter, abgekoppelter Lernstand wäre
  eine Lüge über den eigenen Fortschritt. `ptPool()` räumt beim Nachsehen auf — wer wieder
  auf `SATZ_STUFE` steht, verlässt den Topf, auch ohne dort geübt zu haben.
- **Neuer Ansichtszustand** (eine Variable, die eine Rubrik zwischen zwei Renderläufen
  hält) gehört in `ansichtenZuruecksetzen()`. Sonst zeigt die Rubrik nach dem
  Wiederherstellen einer Sicherung weiter den alten Stand — genau dieser Fehler war da
  (ADR 0017).
- **Der Sicherungscode führt Inhalte über eine Kennung** (Hash des Textes, sechs
  Zeichen). `tools/build.mjs` bricht ab, wenn zwei Vokabeln, Sätze oder Fakten dieselbe
  tragen; dann einen der Texte ändern.
- **Wort umbenennen** setzt dessen Leitner-Stand zurück — die Kennung ist das russische
  Wort. Themen umzubenennen ist dagegen folgenlos. **Einen Satz umzuformulieren** setzt
  genauso seinen Stand in `satzBox`/`satzSeen` zurück; die Kennung ist der russische Satz.
- **Buchstaben kennen zwei Schwellen** wie Wörter (ADR 0024): «sitzt» ab `SATZ_STUFE`,
  «gemeistert» ab `BOX_MAX`. `abcPool()` fragt nach **gemeistert** — wer das auf «sitzt»
  umstellt, wirft die Buchstaben schon auf Stufe 2 aus der Übung und überspringt damit
  genau den Kachelmodus, der das Können prüft.
- **In «Übersetzen» hängt die Richtung an der Stufe** (ADR 0029), nicht am Zufall — sonst
  käme ein Satz über Losglück auf die Endstufe, ohne je geschrieben worden zu sein. Die
  Richtung steht in `trTask.dir`, nie beim Zeichnen aus `trDir` gelesen.
- **Gemeistert meldet nur der Übergang** auf `BOX_MAX` (ADR 0026). Wer `meisterPruefen()`
  auch beim Auffrischen auslösen lässt, macht aus der Meldung Rauschen.
- **Eine Übung ohne Arbeit wird nie empfohlen.** `uebungsStand()` gibt `gesperrt` («geht
  noch nicht») und `leer` («gerade nichts zu tun») zurück; `empfehlung()` überspringt
  beide. Sonst schickt «Weiter mit …» genau im Augenblick des Erfolgs in eine Schleife.
- **Home zählt über alle Satzstufen, «Übersetzen» zeigt eine.** Wer seine Stufe fertig
  hat, muss von dort zur nächsten finden (`trStufeMitArbeit()`) — sonst widersprechen
  sich Kachel und Übung. Angeboten, nicht genommen: Die Stufe ist eine Wahl des Nutzers.
- **Üben können hängt nie an einem Datum** (ADR 0048). «Tippen» und «Buchstaben» haben
  den Stapel **«Alle»** — alles Begonnene beziehungsweise alle 33 Zeichen, ohne Rücksicht
  auf Stufe und Auffrischfrist; die Leerzustände tragen ihn als Knopf mit. «Tippen» hat
  dazu einen **Vorrat** (`tippenSet`): der ganze Wortschatz oder ein einzelnes Lernset,
  und **ein gewähltes Set sticht die Stufenschwelle**. Beide Achsen liefert
  `tippenWoerter(setNr, modus)` — dieselbe Funktion rechnet die Zahlen in der Auswahl,
  sonst verspräche ein Chip etwas anderes, als sein Antippen liefert. «Übersetzen» bleibt
  bewusst bei drei Achsen.
- **«Tippen» und «Übersetzen» sind zweigeteilt** (ADR 0015): Lernen und Wiederholung.
  Fertig Gelerntes verlässt beide Stapel, bis die Frist `auffrischen` um ist. Wer dort
  etwas ändert, muss beide Stapel und die drei Leerzustände mitdenken — «noch nichts
  freigeschaltet», «alles gelernt», «gerade nichts fällig» fühlen sich verschieden an
  und sagen Verschiedenes. **«Übersetzen» hat einen dritten Stapel «Alle»** — ohne ihn
  lässt sich Gemeistertes vor Ablauf der Frist nicht wiederholen.

## Offen

- Service Worker und Manifest stehen im Zielkonflikt mit der Ein-Datei-Vorgabe
  (ADR 0001). Bewusst unentschieden — vor einer Umsetzung mit mir klären.
- `apple-mobile-web-app-capable` gilt als veraltet zugunsten von
  `mobile-web-app-capable`. Safari braucht weiterhin die alte Variante; beide zu setzen
  wäre die saubere Lösung, ist aber noch nicht umgesetzt.
- Eigene Skills unter `.claude/skills/` (github-pages, ios-webapp,
  vanilla-app-architecture, offline-pwa, lerninhalt-pflege) sind vorgesehen, aber noch
  nicht angelegt — siehe `docs/uebergabe-prompt.md`.
