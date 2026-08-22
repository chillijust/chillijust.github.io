---
paths:
  - "index.html"
---

# Oberfläche · Chillingo

Gilt für `index.html`. Die Begründungen stehen in den genannten ADRs unter
`docs/decisions/` — hier steht nur die Regel.

## Maskottchen und Bewegung

- **Die Chili steht genau einmal im Dokument** (ADR 0012) als `#chiliFigur` in
  `#chiliBuehne`; Ansichten stellen mit `maskottchen(klasse)` nur einen Platzhalter auf,
  in den sie umgehängt wird. Nie ein zweites Mal einbetten, nie über Scroll-Rechnung
  positionieren — sie steht im Fluß. Freigestellt aus `docs/IMG_2942.png` mit
  `tools/freistellen.py`, abgelegt als `docs/maskottchen-freigestellt.png`.
- **Ein Klick ist eine Bewegung.** Wer mehr als ein Blatt auf einmal schließt, wickelt
  das in `chiliZusammen()` — sonst fliegt sie über einen Zwischenhalt und der zweite
  Flug bricht den ersten ab.
- **Eine Bewegung ist eine Aussage** (ADR 0071). Der Hüpfer hängt am Rückgabewert von
  `chiliFlug()` und läuft nur bei wirklich zurückgelegtem Weg — ein Renderlauf liefert
  den Platzhalter als *neuen* Knoten, und ohne diese Bedingung sprang sie bei jedem Chip
  auf der Stelle. Die Abfrage auf `prefers-reduced-motion` steht **hinter** der Messung.
- **Die Figur wirft keinen Schatten.** Jeder Filter wird in Safari an ihrem Kasten
  beschnitten und hinterläßt die gerade Kante, die dreimal gemeldet wurde.
- **Ein Zuhörer, dessen Funktion Argumente hat, wird eingepackt:**
  `addEventListener('click', tutStarten)` übergab das Ereignis als «ruhig».
- **Ein runder Knopf, in den sie springt**, braucht `overflow: visible` und
  `z-index: 40`; geblendet wird in einer Hülle darin.

## Blätter und runde Knöpfe

- **Nur ein Blatt liegt offen** (ADR 0090). Menü, Auswahl und Wissen schließen einander
  über `blaetterZu(ausser)` — **eine Frage statt vier Listen**. **Nur der Knopf, in dem
  die Figur steht, ist offen.** Solange ein Blatt offen ist, treten die runden Knöpfe
  daneben zurück (`opacity: 0; pointer-events: none`) — sie liegen mit `z-index: 40`
  sonst darüber. Die Regel traf bis ADR 0082 nur `.kachel-knopf`: **wer einen Knoten
  umhängt, erbt die Regeln nicht mit.**
- **Ein runder Knopf, in dem die Chili landen soll, steht genau einmal im Dokument** und
  wird umgehängt, nicht neu gebaut (ADR 0044). In einer Kachel: erst heimschicken, dann
  zeichnen, dann umhängen — `renderKopf()` läuft vor der Ansicht.
- **Die Menükarte mißt ihren Inhalt** (`#menuPanel { width: max-content }`, ADR 0076).
  Auswahl- und Wissensblatt behalten ihre 232 px: Chip-Reihen sollen umbrechen, nicht
  dehnen.
- **Ein aufklappendes Blatt trägt `--blatt`** (ADR 0042) — in «Dark» den Grund, in den
  hellen Schemata die Kachel. Wer die helle Leiter verschiebt, prüft `--dim`, `--gold`
  und `--good` mit.
- **Drei Türen, eine setzt zurück** (ADR 0072). Das **Menü** ruft `ansichtAnfang(ziel)`
  — Bilanz bei der Übersicht, Einstellungen bei «App». Der **Rückpfeil** behält, wo man
  war (`setTab(…, true)`, ADR 0036). Ein **gezielter Knopf** behält sein Ziel; deshalb
  steht das Zurücksetzen **nicht** in `setTab()`. Neue Ansicht mit Einstiegszustand →
  in `ansichtAnfang()` nachtragen.
- **Der Rückweg steht in `zurueckGehen()`** — Pfeil, Randwischgeste und die
  «Zurück»-Knöpfe teilen ihn sich. Die Geste schweigt bei offenem Blatt. Zurück heißt
  **dorthin, wo man herkam** (`ansichtStapel`), nicht nach Home (ADR 0036).

## Leiste, Tutorial, Scheinwerfer

- **Vier Tutorial-Spuren, ein Mechanismus** (ADR 0079). `data/tutorial.json` ist eine
  Sammlung: `home` (7 Schritte, ADR 0085) plus `lernsets`, `tippen`, `uebersetzen` (je 5).
  **Die Heimspur nennt keine einzelne Übung.** Die Begrüßung steht in `TUT_FRAGE.home`.
  Alles liest `tutSchritte()`, gestartet mit `tutStarten(spur)`. Angeboten beim ersten
  Betreten — nur wenn das Ziel des ersten Schritts sichtbar ist (**ein Scheinwerfer ohne
  Bühne wartet**) und das große Tutorial schon lief. `state.tutUebung` fällt beim
  **Fragen**; **die Heimspur wird nie angeboten** (ADR 0080).
- **Das Tutorial ist ein Scheinwerfer** (ADR 0051) — ein durchsichtiges `#tutLoch` mit
  `box-shadow: 0 0 0 9999px`. Die Schritte sind **Inhalt** (`[Ort, Ziel, Text]`); ein
  Wähler, der ins Leere zeigt, ist ein stiller Fehler — wer ein Ziel umbenennt, prüft
  die Suite `tutorial`. Ohne Ziel deckt der **Hof** ab, nicht das Loch. **Die Chili
  erzählt** — sie steht frei neben dem Angeleuchteten, der Zipfel zeigt auf **sie**; ihr
  Platzhalter `#tutChili` steht in `chiliPlatzhalter()` **vor** allem anderen, ihr Sprung
  wird in **Bildkoordinaten** gemessen (`tutChiliLage()`) — die einzige benannte Ausnahme
  zu ADR 0012.
- **Das Loch liegt genau auf dem Ziel** (ADR 0067) — keine Luft, harte Kante, Radius am
  Ziel **gemessen**. Ein fester Radius schnitte einem runden Knopf die Ecken auf.
- **Der Schein atmet** (ADR 0083): eine Fläche **innerhalb** des Ziels
  (`#tutLoch::after`, 5,6 s, Radius geerbt). Der `box-shadow` des Lochs wird **gar nicht
  angefaßt** — er ist eine **Liste**, und zwei Einträge lassen sich nicht gegen einen
  interpolieren: Der Browser schaltet hart um, und für einen Augenblick fehlt die
  Verdunklung. Deckung steht zweimal: `.12` auf dunklem Grund, `.35` auf hellen Kacheln.
- **Ein Scheinwerfer braucht eine Bühne** (ADR 0085): Der letzte Schritt zeigt auf
  `#tutRund`; solange der Schritt steht, ist er da, und `tutZeichnen()` zeichnet den Kopf
  **vor** dem Messen. Wer erst mißt und dann zeichnet, mißt die Vergangenheit.
- **Der Einstiegsknopf wechselt die Gestalt** (ADR 0080): goldenes Angebot ganz oben, bis
  das Tutorial **einmal ganz** lief, danach das Fragezeichen im Kopf — immer nur **eines**
  von beiden. Merker: `tutorialGesehen` (Angebot) und `tutorialFertig` (Platz); ein
  Abbruch setzt nur den ersten.
- **Alle sieben stehen im Tutorial im Baum** (ADR 0051). `kachelSichtbar()` und
  `homeWeitere()` fragen zuerst `tutOffen`. Der Scheinwerfer klappt selbst auf, wenn sein
  Ziel nicht **sichtbar** ist (`getClientRects()`, nicht `querySelector` — ein `[hidden]`
  findet der sehr wohl). `kachelHtml()` steht einmal für beide Listen. Eine neue Übung
  braucht einen Eintrag in `UEBUNG_GRUPPEN` **und** in `UEBUNGEN`.
- **Die Leiste `#uebLeiste` hat zwei Plätze** (ADR 0081/0082): in einer Übung mit
  Aufgabenkachel **im Inhalt, rechts über der Kachel** (10 px Abstand, Knöpfe 36 px),
  sonst **in der Kopfzeile** (44 px). Umgehängt wird wie der Wissensknopf —
  `leisteHeimschicken()` **vor jedem** `main.innerHTML`, `leisteUmhaengen()` danach.
  **Umgehängt wird in einer Hülle** (ADR 0084):
  `leisteRahmen(zeichnen)` schickt heim, zeichnet, holt zurück — alle **sieben** Übungen
  fahren hindurch, ihre Rümpfe heißen innen `…InhaltZeichnen`. Wer eine Übung mit Kachel
  hinzufügt und das Heimschicken vergißt, wirft Leiste, Blatt und Zuhörer weg.
- **Auf einer Faktkarte steht die Leiste gar nicht**: `faktKarteHtml()` setzt
  `data-ohne-leiste`, `leisteZeigen()` fragt danach — kein Verzeichnis im Code. Dazu
  `#uebLeiste[hidden] { display: none }`. **Leiste und Heimat tragen `display: contents`**
  — ein leerer Kasten zählt als Flex-Kind und bekommt seinen eigenen `gap`.
- **Beide Knöpfe tragen bei der Kachel `.klein`**: Kreis 36 px, Zeichen 20 px, antippbare
  Fläche über `::after` weiterhin **44 px** — dafür braucht `.klein` `overflow: visible`,
  sonst schneidet `.rundbtn` die Fläche ab und sie ist eine Behauptung.
  Der Wissensknopf zieht **nicht mehr einzeln** in die Übersetzen-Kachel (ändert ADR 0044).
- **Unter dem Bildschirm liegt noch Seite** (ADR 0087). Ein Hof mit `position: fixed;
  inset: 0` deckt nur den **Layout-Viewport**. Darum verdunkeln `body.tut-offen` und
  `body.jubel-offen` den Grund um dasselbe Maß. **Kein Bildschirmfoto findet das**, nur
  das Gerät.

## Kopf, Fortschritt, Fakt und Kommentar

- **Der Punkt hinter dem Namen ist die Statuslampe** (ADR 0061) — grün mit Netz, rot
  ohne, geführt aus `netzZeigen()`. Er steht **neben** `#kopfTitel`, nie darin. Auf Home
  steht das Wort daneben, unterwegs trägt der Punkt es allein (`aria-label`) — **die Farbe
  trägt nie allein**. Gefragt wird `navigator.onLine`; grün heißt «Netz da», nicht
  «Internet erreichbar». Punkt und Wort teilen sich **eine** Farbe, gesetzt an der Hülle.
- **Das Wort ist eine Nachricht, kein Etikett** (ADR 0063): Es klappt nach `NETZ_FRIST`
  ein und wird nur bei etwas Neuem wieder aufgeklappt. Ein Renderlauf allein ist kein
  Anlaß. `.eyebrow:empty` hält nur die Zeilenhöhe.
- **Was im Kopf erscheint, klappt auf — es schiebt nicht** (ADR 0071): Netzwort *und*
  `#saveNote` wachsen über `max-width` aus null. `display: none` ist dafür untauglich.
  **Ein Symbol aus `ICON` ist 20 px groß** — in einer 10-px-Zeile gibt man ihm die Höhe
  der Schrift.
- **Ein Anteil darf nicht runden, bis er lügt** (ADR 0074). `prozentText()`: unter einem
  Prozent «unter 1 %», 100 % nur bei wirklich allen. Die Serie sagt, was sie zählt
  («3 richtig in Folge»).
- **Jede Übung trägt ihren eigenen Balken** (ADR 0094): `uebungsFortschritt(id)` gibt
  `{ ist, soll }`, `fortschrittHtml()` zeichnet daraus — auf jeder Kachel und in der
  Empfehlung, dort für deren Ziel. Gezählt wird **gemeistert von allem**, nie «von dem,
  was freigeschaltet ist». Ohne eigenen Bestand kein Balken; **die Breite trägt nie
  allein** — die Zahl steht im `aria-label`.
- **Die Fortschrittsreihe brennt** (ADR 0046) — ein Zeichen je Wort, gebaut von
  `ppHtml(stufe)` und sonst nirgends: Stufe 0 ein Strich, ab Stufe 1 wächst eine Flamme.
  **Nur Gold flackert**; die Animation hängt an `.punkt` und `.pp.s4`, nicht an
  `.flamme-aussen` allein. **Die Endstufe
  trägt Glut** (ADR 0088): außen `--flamme`, innen `--flamme-kern`, 14 × 19 px.
  **Jedes Schema hat seine eigene Antwort** (ADR 0094): `flammeSchluessel()` wählt
  zwischen `settings.flammeDark` und `settings.flammeHell`, geführt über `data-flamme`.
  Der Schalter **zeigt beide Reihen** auf dem sichtbaren Grund, und in ihnen steht **jede
  Stufe genau einmal** (`[0, 1, 2, 3, 4]`).
- **Der Fakt hat überall dieselbe Gestalt, der Kommentar auch** (ADR 0049). Ein Fakt ist
  immer `faktKarteHtml()`, gefragt beim **Weitergehen** über `faktFaellig()`. Nach
  **jeder** Auflösung steht ein Kommentar (`kommentarSetzen()`), in allen Übungen außer
  «Buchstaben». Die Sätze sind **Inhalt** (`data/kommentare.json`); das Mischungsverhältnis
  ist eine Eigenschaft der Liste, keine Zahl im Code. **Ein fester Satz behauptet keine
  Zahl, die er nicht kennt** — wer eine nennt, nimmt `{n}`, `{f}` oder `{s}`. **Gelegt ist
  nicht geschrieben**: Lob für ё, Weichzeichen oder Wortlänge nur bei getippten Aufgaben.
- **Ein Fakt hört sich selbst zu, wenn er Kyrillisch trägt** (ADR 0095). `faktRussisch(text)`
  liest die russischen Abschnitte **an der Schrift**, nicht an «» — nicht jeder Fakt zäunt
  sein Wort damit ein. Derselbe `hoerknopf()` wie überall, an beiden Stellen, an denen ein
  Fakt zu lesen ist: Karte **und** Liste. Ohne Kyrillisch kein Knopf.
- **Die Chili sagt den Kommentar selbst** (ADR 0060) — `#chiliBlase`, geführt von
  `blaseAktualisieren()`, unter der Figur im Kopf, endet rechts am Inhaltsrand, wächst
  nach links. **Nicht** in `#chiliBuehne` (die wird umgehängt). Nur sichtbar, **solange
  die Figur auf `#chiliPlatz` steht**; der Zipfel wird **gemessen**. Geführt aus
  `chiliAktualisieren()` und sonst nirgends.

## Übersicht, Jubel, Einstellungen

- **Die Übersicht zeigt einen Weg, nicht das Angebot** (ADR 0065). Drei Zonen: Empfehlung,
  **«Meine Auswahl»** (`homeOben()`), **«Weitere Übungen»** (`homeWeitere()`) mit den
  Gruppen **Zeichen · Wörter · Sätze** — ihre Reihenfolge **ist** der Lernweg (ADR 0066).
  **«Weitere» heißt weitere**, und **nichts steht zweimal auf der Seite** (ADR 0075).
- **Die Übersicht wird eingerichtet, nicht nur ausgeräumt** (ADR 0075). Ansicht
  `einrichten` (Einstellungen → Darstellung), drei Rubriken zum Hineinziehen. Gespeichert
  wird **das Abweichende**: `settings.homeAus` und `settings.homeOben` — **`null` heißt
  automatisch** (`homeFaellig()`: höchstens drei, ohne `gesperrt`, ohne `leer`, ohne das
  Empfohlene), ein Array heißt «von Hand». **Von Hand hingezogen bleibt stehen**, die
  Höchstzahl gilt dann nicht. Beide stehen **nicht** im Sicherungscode. Beim Ziehen:
  `touch-action: none`, Schwelle acht Pixel, Zielrubrik an den **Kästen** gemessen (nicht
  `elementFromPoint`). Zwei Pfeile je Zeile bleiben als zweiter Weg.
- **Der Jubel ist ein Fenster für das Seltene** (ADR 0044) — sechs Anlässe, nur am
  Übergang, Ton ausgelost. Ein einzelnes gemeistertes Wort bekommt nur eine Zeile.
- **Eine Auszeichnung wird genau einmal gefeiert** (ADR 0047). Set, Thema, Alphabet und
  Grammatik hängen an einer *Sammlung*. Marken in `state.gefeiert`, gesetzt über
  `jubelEinmal()`, nachgetragen von `jubelNachtragen()` nach `load()` **und** nach dem
  Einspielen einer Sicherung. Der leere Topf im Power-Training bleibt wiederholbar.
- **Die Einstellungen haben Reiter** (ADR 0045): **App · Darstellung · Lernweg ·
  Antworten · Tastatur**, geöffnet beim **ersten** (`EINST_REITER[0].id`, ADR 0067). Was
  nur auf einem Reiter steht, ist beim Binden nicht immer da — vor `addEventListener`
  prüfen. `einstReiter` gehört in `ansichtenZuruecksetzen()`.
- **Neue Einstellung:** Vorgabe in `defaultSettings()`, Zeile in `renderEinstellungen()`,
  Abfrage an der wirksamen Stelle. Gespeicherte Stände über `mergeState()` auffüllen —
  `state.settings` nie als Ganzes aus dem Speicher übernehmen. Gliederung nach Fragen:
  **Lernweg**, **Abgabe**, **Eingabe**, **Darstellung und Ton**. Soll eine geänderte
  Vorgabe bestehende Geräte erreichen, den Schlüssel umbenennen — **ein Schlüssel, den
  die Vorgabe nicht mehr kennt, fällt in `mergeState()` ganz heraus**. **Einen Zähler
  gibt es nicht mehr** (ADR 0091) — mit dem Tagesmaß und der Auffrischfrist ist auch
  `ZAEHLER` samt Mechanik entfallen; wer wieder einen braucht, baut ihn neu, statt toten
  Code wiederzubeleben.
- **Neuer Ansichtszustand gehört in `ansichtenZuruecksetzen()`** (ADR 0017) — sonst zeigt
  die Rubrik nach dem Wiederherstellen einer Sicherung den alten Stand.
- **Ein Renderlauf ist kein Ereignis** (ADR 0077). Wer für ein einzelnes Zeichen die ganze
  Ansicht neu baut, setzt alles zurück, was einen Zustand über die Zeit trägt. Ein Stern
  schaltet über `sternSetzen()` **an Ort und Stelle** um. **Wer einen Renderlauf entfernt,
  erbt, was der nebenbei aufgeräumt hat** (`.blinkt`).

## Farben und Flächen

- **Ein Farbschema, keine zwei Achsen** (ADR 0039): `schema` mit Dark (Vorgabe), Classic,
  Grün, Blau, Rosa — `data-schema` am `<html>`, «dark» trägt keines. Vier sind hell.
  **`prefers-color-scheme` wird nicht ausgewertet** — ein Schema ist eine Wahl.
  Ein Stand von vor ADR 0039 wird über `schemaAusAchsen()` übersetzt — in `mergeState()`
  **und** in `decodeBackup()`.
- **Die Kachel liegt in jedem Schema über dem Grund**, die Kopfzeile nimmt den Grund. In
  «Dark» ist der Grund beinahe schwarz und warmneutral (ADR 0041). `--card-2` ist die
  Bedienfläche für Chips, Schalter und Tasten. Die dunkle Palette steht dreifach: `:root`,
  `SCHEMATA`, `theme-color` im `<head>`.
- **Ein Schema tönt nur die Flächen** (ADR 0039) — `--bg`, `--card`, `--card-2`, `--line`,
  `--glow`. Helle Gründe sind **satte Farben** (77 % Helligkeit), **die Kachel ist ein
  hellerer Ton derselben Farbe, kein Weiß** (89 % Helligkeit, 90 % der Sättigung, ADR 0063).
  **Wer die Leiter verschiebt, rechnet die Schrift nach** — gegen *jede* der vier Paletten;
  Rosa ist in der Leuchtdichte die dunkelste. Maßstab: «dim» hält überall AA (4,5),
  Signalfarben 3,0. Schrift und **Signal**farben stehen einmal für alle hellen Schemata.
- **Der Akzent gehört zum Schema** (ADR 0064) — `--akzent`, nicht `--gold`. Seine
  Helligkeit wird **gesucht, nicht gesetzt** (`palette.py`): der hellste Ton, der auf allen
  drei Flächen 4,5 hält. Er ist Zierde und darf wandern, «richtig» und «falsch» nicht.
  Ebenso `--figur-schatten`: in Dark kräftig und schwarz, in den hellen kurz und im Ton
  der Schrift. Neue Werte rechnet `tools/palette.py`.
- **Was `normalize()` übersieht, übersieht auch die Farbe** (ADR 0037). Die Prüfzeile
  färbt zeichenweise ein; Satzzeichen, Leerraum, Groß-/Kleinschreibung und ё/е kosten
  nichts. Die Farbe trägt nie allein: Falsches ist unterstrichen, eine Zeile zählt es in
  Worten. `pruefzeileHtml()` steht in **allen vier Schreibaufgaben** (drei Gestalten); die
  Kachelmodi bleiben draußen.
- **`display` sticht `[hidden]`.** Wer einem Element im Stil ein `display` gibt, macht
  `hidden` wirkungslos. Zu jedem solchen Element gehört `[hidden] { display: none; }`, und
  eine Prüfung fragt `getComputedStyle`.
- **Touch-Ziele und `:hover`.** Auf iOS bleibt ein Hover-Zustand nach dem Tippen hängen;
  Zustände über Klassen setzen.
- **Aufgaben sitzen auf zwei Dritteln der Höhe.** Der Körper trägt in den Übungen die
  Klasse `aufgabe`, zwei Streben in `#main` teilen den freien Raum 2:1 — das bringt
  «Prüfen» und «Weiter» in Daumenreichweite. Beide Streben haben Basis 0 und schrumpfen
  nicht. `min-height` steht dreifach: `100vh`, `svh`, `dvh`.

## Tastatur, Ton, Vorlesen, Update

- **Die Tastatur steht genau einmal im Code** (`tastaturHtml(attr)`), und **was eine Taste
  mit dem Text macht, ebenso**: `kbAnwenden(text, taste)` (ADR 0089). Sieben Ansichten
  binden sie; daß «BS» löscht, steht nur dort. Eine Prüfung fragt den Quelltext, ob jeder
  `dataset.…key`-Binder sie ruft — eine, die sechs Binder aufzählt, mißt über den siebten
  hinweg (und genau der war übersehen). Aufbau: drei Buchstabenreihen, Rücktaste
  rechts am Ende der dritten, Leerzeichen breit und mittig in einer vierten.
- **Die Abgabe steht unter der Tastatur** (ADR 0092) — in allen sechs Übungen mit
  eingebauter Tastatur gleich, und die Tastatur steht **neben der Kachel, nicht darin**:
  Innerhalb wird sie schmaler, und die oberste Reihe bricht um. Beides prüft `tastatur`
  D2/D3 **am Rechteck**; der Kachelfehler war im DOM unsichtbar.
- **Die eingebaute Tastatur kommt von selbst, wo Kyrillisch verlangt ist**
  (`tastaturVorgabe()`, Einstellung `tastaturAuto`). Die Sprache der *Geräte*tastatur kann
  eine Seite nicht wählen — `lang` ist kein Hebel.
- **Die Schreibmarke gehört ins Feld** (ADR 0068). Eine Taste schreibt über
  `feldSchreiben(id, text)` — Wert **und** Fokus **und** Marke ans Ende. Damit der Fokus
  nicht die Gerätetastatur aufklappt, trägt das Feld `inputmode="none"` (`kbFeldAttr()`) —
  **nur solange die eingebaute offen ist**. `preventScroll` beim Fokussieren.
- **Vorlesen nur über `hoerknopf(text, sprache)`** — der Text hängt als `data-say` am
  Knopf, ein einziger Zuhörer auf `#main` bedient alle. Was die Antwort wäre, schweigt bis
  zur Auflösung.
- **Klang nur über `ton(richtig)`** bzw. `meisterTon(richtig)`. In der Web Audio API
  erzeugt, nie als Datei, immer in `try/catch`, abschaltbar über `ton`. Kein Ablauf darf
  Ton voraussetzen. **Ein schlafender Kontext heißt `suspended` *oder* `interrupted`, und
  `resume()` ist asynchron** (ADR 0026). Auf iOS schweigt Webton beim Stummschalter,
  solange `navigator.audioSession.type` nicht `transient` ist, und ein Kontext gilt erst
  als freigegeben, wenn er **in einer Geste** einmal etwas ausgegeben hat (ADR 0027).
- **Ein Knopf, der ein Ergebnis meldet, muß es auch ausführen können** (ADR 0062). Der
  Knopf unter «App» sucht **und** lädt: `swKnopfTippen()` schaut auf `swStand.wartet`. Drei
  Lagen (`ruhe`, `sucht`, `laedt`) gehören nach ADR 0017 in `ansichtenZuruecksetzen()`.
  **Ein Ergebnis ist keine Beschriftung** — «Aktuell» und «Kein Netz» treten nach zwei
  Sekunden ab. **Die Größe wechselt nie**; `swUebernehmen()` nur auf einen Tipp.
  **Beide Wege warten gleich** (ADR 0063/0072) — derselbe goldene Ring mit hellem Ring am
  Knopf und in der Hinweiszeile. Der Ring trägt `flex: none`, die Knöpfe eine feste Breite — **wo eine Regel Kindern
  Wachstum gibt, wird aus dem Kreis eine Ellipse**, und `#swNeu span { flex: 1 }` traf ihn
  mit.
- **Ein Update lädt neu, aber verliert den Ort nicht** (ADR 0068). `swNeustart()` ist der
  einzige Weg zum `reload()` — es wartet `SW_LADEN_MIN` ab, `swOrtMerken()`/`swOrtHolen()`
  bringen Ansicht und Reiter wieder. Der Merker wird **immer** weggeräumt, gilt eine Minute
  und nur für eine Ansicht, die es noch gibt; `ansichtStapel` bekommt `home` als Boden.
- **Die App sagt, was sie über sich weiß** (ADR 0052): Statuslampe, `storage.persist()`
  beim Start in `try/catch`, Erinnerung an die Sicherung nach 30 Tagen (ab 60 Antworten),
  Tempo je Übung in der Bilanz. **`aufgabeBeginnt()` steht in den Aufgabenbauern, nicht im
  Renderlauf** — es stellt die Uhr **und löscht den Kommentar der Chili** (ADR 0063).
  `ansichtenZuruecksetzen()` hält die Uhr an. `state.tempo` und `state.gesichertAm` stehen
  **nicht** im Sicherungscode.

## Merkzettel und Tickets

- **Was sich merken läßt, merkt sich gleich** (ADR 0067). Stern an Sprachfakt, Regelkarte
  in «Grammatik» und «Schreibung» (`merkSternHtml()`, gebunden über `merkBinden()`). Flache
  Menge mit Präfix in `state.merk` — `g:` Baustein, `o:` Schreibregel —, gelesen über
  `gemerkteRegeln()`, gezeigt in **«Gemerkt»**. **Elftes Feld** im Sicherungscode:
  **angehängt, nicht eingeschoben**.
- **Tickets liegen in `chillingo_tickets_v1`**, nicht im Lernstand. Sie verlassen das Gerät
  nie von selbst: ein Knopf bündelt sie zu einem Text (ADR 0016), `ticketsLesen()` liest
  **genau diese Form** wieder ein (ADR 0069). **Gerät und Datum stehen nicht mehr darin**
  (ADR 0085) — in der App bleiben sie; der Leser versteht ältere Vorlagen weiterhin, denn
  *ein Leser darf mehr verstehen, als der Schreiber schreibt*: Was nicht paßt, wird
  übersprungen, nicht geraten, und Bekanntes nicht verdoppelt.
- **Der Bezug heißt Ort, nicht «Übung»** — er kann auch die Übersicht oder eine Menüansicht
  sein, und steht seit ADR 0074 in einem **Klappfeld aus Knöpfen**: zugeklappt trägt der
  Knopf die Wahl, eine Wahl schließt ihn. Dieselbe Gestalt wie «Alle Übungen» — **die App
  hat für das Aufklappen genau eine Form**. Ein **natives Auswahlfeld** bleibt verboten (auf
  iOS ein Rad über der halben Seite); die Suite `filter` liest den Quelltext danach ab und
  springt auch auf ein Vorkommen im Kommentar an.
- **Ort und Art sind zwei Felder** (ADR 0078): «Betrifft» sagt *wo*, «Art» *was* — je sechs
  Gründe, **eine eigene Liste je Ticketart** (ADR 0081); beim Umschalten fällt eine Wahl
  weg, die es in der neuen Liste nicht gibt. `tkZeileHtml()` steht einmal und dient
  Ticketansicht **und** Reiter «Bearbeiten». Im Zustand bleiben `meldeArt` und `meldeModus`
  **getrennt**; der Schreibteil wird nur verborgen, nicht ausgeräumt.
- **Ort und Art liegen hinter «Optionen»** (ADR 0082): Zugeklappt sieht man Überschrift und
  Textfeld. Geklappt mit der Mechanik des Menüs (Rasterzeile `0fr` → `1fr`), **dieselbe
  Kurve und Dauer wie das Blatt**. **Gefüllt heißt gesetzt** — «Betrifft» zählt nur, wenn
  etwas **anderes** gewählt wurde als die Seite, über der man steht. Wer ein vorhandenes
  Ticket ändert, bekommt die Optionen **offen**. Das Textfeld hat drei Zeilen und wächst um
  **höchstens drei**.
- **Ein Entwurf im Meldeblatt überlebt das Zuklappen** (ADR 0025). Nur «Abbrechen» wirft
  ihn weg; Ziehen und Danebentippen schließen bloß.
