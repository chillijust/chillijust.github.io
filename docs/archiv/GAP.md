# GAP — Plan gegen Bestand

Vergleich von **„Chillilingo — Didaktik- & Architekturplan", Version 1.1 (August 2026)**
mit dem Stand dieses Repos: **Chillingo 1.5.1**, `index.html` mit 10 262 Zeilen / 516 KB,
`data/*.json` mit 395 Vokabeln in 24 Themen, 55 Sätzen in 3 Stufen, 33 Buchstaben,
10 Grammatikbausteinen, 126 Sprachfakten; Prüfstand mit 32 Suiten und 1 645 Prüfungen.

Nur Analyse — es wurde keine Zeile Code geändert.

**Vorbemerkung zur Größenordnung.** Der Plan beschreibt nicht die nächste Ausbaustufe
dieser App, sondern ein anderes Produkt mit anderer Architektur. Der Bestand ist eine
**Ein-Datei-App mit `localStorage` und handgepflegtem Inhalt**; der Plan verlangt eine
**PWA mit Engine/Content/UI-Trennung, IndexedDB, FSRS-Scheduler, Generator-Architektur,
vorgerendertem Audio und einem Reader**. Die Überschneidung ist real, aber kleiner, als
die Themenliste vermuten lässt: Getroffen wird vor allem das *Was* (Buchstaben, Wörter,
Sätze, Kasus), kaum das *Wie*. Wer den Plan vollständig umsetzt, schreibt die App neu und
nimmt aus dem Bestand die Inhalte und einen Teil der Bedienlogik mit.

---

## 1 · Bereits vorhanden und plankonform

| Plan | Bestand | Anmerkung |
|---|---|---|
| §9 Eigene kyrillische Bildschirmtastatur statt Systemtastatur | `tastaturHtml()`, an genau einer Stelle im Code, in allen vier Schreibaufgaben | Erfüllt, samt der Begründung des Plans (kein iOS-Umschalten, keine Autokorrektur) |
| §9/§13.2 Layout **ЙЦУКЕН** als Vorgabe | `data/tastatur.json` ist exakt ЙЦУКЕН, drei Reihen | Die offene Frage 2 des Plans ist im Bestand bereits so entschieden, wie der Plan empfiehlt |
| §9 Tap-Ziele ≥ 44 pt | Harte Regel in `CLAUDE.md`, durchgängig umgesetzt | |
| §9 Safe-Area-Insets | `env(safe-area-inset-*)` durchgängig | |
| §9 Dark, ein Akzent, Rot/Grün nie allein bedeutungstragend | ADR 0039/0041; die Prüfzeile unterstreicht Falsches **zusätzlich** zur Farbe und zählt es in Worten (ADR 0037) | Wörtliche Übereinstimmung mit dem Plan, unabhängig davon entstanden |
| §9 Richtig-Rückmeldung dezent, kein Konfetti-Gewitter | ADR 0044: Jubel nur bei fünf seltenen Anlässen, ein gemeistertes Wort bekommt eine Zeile | |
| §9 Kein `alert()`/`prompt()` | Kommt in der Datei nicht vor | |
| §9 Zwischen Blöcken der Aha-Fakt | `faktFaellig()` alle fünf Antworten, 126 Fakten, eigene Sammlung | Der Plan sieht den Aha-Fakt als 5-%-Block am Sessionende — der Bestand streut ihn ein; Zweck identisch |
| §9 Jederzeit unterbrechbar, Zustand persistiert | `save()` nach jeder Antwort | |
| §9 Streak mit Kulanz gegen Streak-Angst | Serie vorhanden; Auffrischfrist frei wählbar (1–365 Tage), «Alle»-Stapel ohne Fristbindung (ADR 0048) | Nicht dieselbe Mechanik, aber dieselbe Absicht: Üben hängt nie an einem Datum |
| §6 Phase 0, Block 2 „Falsche Freunde" В Н Р С У Х | `ABC_TUECKISCH = 'внрсух'` — exakt dieselben sechs Buchstaben, eigene Kennzeichnung in der Übung, Distraktoren bevorzugt aus dieser Gruppe | Die auffälligste Übereinstimmung im ganzen Vergleich |
| §4 D1/D2 Laut → Zeichen und Umkehrung | «Buchstaben» kennt `zeichen`, `laut` und `kacheln`, Richtung wählbar | |
| §4 W1 RU → DE mit nahen Distraktoren | `buildQuestion()`, Ablenker bevorzugt aus demselben Thema | Nicht semantisch berechnet, aber themennah |
| §4 W2 DE → RU getippt, keine Auswahl | Übung «Tippen» | |
| §4 E5 Übersetzen & tippen | «Übersetzen», DE→RU getippt auf der oberen Stufe | Der Plan nennt sie „die härteste und wertvollste Übung" — im Bestand ist sie die Endstufe der Steigerung (ADR 0029) |
| §4 G1 Muster-Induktion: Beispiele → raten → **dann** Regelkarte | `data/grammatik.json` führt je Baustein `induktions`-Beispiele, `deutungen`, `richtig` und erst danach `regel` | Wörtlich der vom Plan verlangte Ablauf, inklusive der Reihenfolge |
| §4 G3 Formenbau: Lemma + Kasus → Form tippen | Grammatikübung, `grammForm()` | |
| §4 Reihenfolge erkennen → unterscheiden → produzieren | Kachelmodus ab Stufe 2, Tippen ab Stufe 3, Übersetzen RU→DE vor DE→RU | Durchgängiges Prinzip, in ADR 0029 begründet |
| §5.3 Interleaving | Vokabelauswahl mischt über Themen; die Übungen selbst wechseln die Aufgabenform je Stufe | Teilweise — siehe §2 |
| §5.4 „Aufholmodus" bei Rückstand | «Alle»-Stapel und Power-Training holen Rückstände auf | Andere Form, gleiche Funktion |
| §10 Determinismus & Tests | Prüfstand am echten DOM, 32 Suiten, blockierender Pre-Push-Hook, CI | Der Plan will Seed-Determinismus in einer Engine; der Bestand hat stattdessen einen DOM-Prüfstand. Zweck (reproduzierbar, ohne Handarbeit prüfbar) ist erfüllt |
| §12 „Was in die `CLAUDE.md` gehört" | `CLAUDE.md` existiert und ist ausführlich | Inhaltlich andere Regeln — siehe §2 |

---

## 2 · Vorhanden, aber vom Plan abweichend

Je Punkt eine Einschätzung, ob **Plan** oder **Bestand** nachgeben sollte.

### 2.1 Architektur: eine Datei gegen PWA mit Modulen

- **Plan:** Service Worker, `/engine` `/content` `/data` `/ui` `/dev`, lazy geladene Pakete.
- **Bestand:** genau eine `index.html`, alles inline, kein Build-Schritt im Auslieferungspfad
  (ADR 0001). Offline funktioniert sie nach dem ersten Laden — allerdings über den
  Browser-Cache, nicht über einen Service Worker.
- **Bewertung: der Plan sollte nachgeben, aber nur zur Hälfte.** Die Ein-Datei-Vorgabe ist
  die tragende Entscheidung dieses Projekts und hat sich über 51 ADRs bewährt. Die
  Modultrennung des Plans ist erst dann zwingend, wenn Generatoren und ein Scheduler
  hinzukommen — und die kann man auch als Abschnitte einer Datei sauber trennen.
  **Nicht nachgeben sollte der Plan beim Service Worker**: Ohne ihn ist „offline" eine
  Hoffnung, keine Zusage. `docs/architektur.md` führt diesen Zielkonflikt schon heute als
  bewusst offen (ADR 0001).

### 2.2 Wiederholungsplanung: Leitner gegen FSRS-6

- **Plan:** FSRS-6, Zielretention 0,90, vier Bewertungen, `stability`/`difficulty` je Item,
  Latenz > 4 s zählt als *Schwer*, „Aufdecken" zählt als *Nochmal*.
- **Bestand:** fünfstufiges Leitner-System, `INTERVALL = [0, 1, 3, 7, 21]` Tage, Endstufe
  über die Einstellung `auffrischen`. Keine Latenzmessung. „Aufdecken" stuft **zurück**
  (`updateBox(id, false)`) — strenger als der Plan.
- **Bewertung: der Bestand sollte nachgeben, aber nicht sofort.** FSRS ist bei 395 Wörtern
  kaum spürbar; sein Gewinn (20–30 % weniger Wiederholungen) skaliert mit der Itemzahl. Bei
  1 000 Lemmata × 2–3 Items wird er relevant. Die eigentliche Sperre ist nicht der
  Algorithmus, sondern das **Datenmodell**: Leitner speichert eine Zahl je Wort, FSRS
  braucht `stability`, `difficulty`, `reps`, `lapses`, `due`. Das ist ein
  Schemawechsel mit Migration — und der Sicherungscode (ADR 0017) müsste ein neues Format
  bekommen. Solange der Wortschatz bei 395 liegt, ist der Aufwand nicht gedeckt.
- **Sofort und billig übernehmbar:** die Latenzmessung. Sie kostet ein Feld und liefert
  Daten, die eine spätere FSRS-Umstellung überhaupt erst kalibrierbar machen.

### 2.3 Betonung

- **Plan:** „**Nicht verhandelbar:** Betonung wird an jeder Form gespeichert." Anzeige
  umschaltbar, über die Phasen ausgeblendet.
- **Bestand:** **kein einziges Betonungszeichen** in `vokabeln.json` oder `saetze.json`.
  Stattdessen eine deutsche Lautschrift je Wort (`"молоко" → "malako"`), die die Reduktion
  faktisch mitliefert, aber nicht die Betonungsstelle markiert.
- **Bewertung: der Plan hat recht, der Bestand sollte nachgeben.** Die Begründung des Plans
  ist stichhaltig und trifft den Bestand an einer empfindlichen Stelle: Ohne Betonungsangabe
  lässt sich die Prüfwort-Methode (§6 Phase 1) gar nicht bauen, und der Bestand hat mit
  «Grammatik» bereits einen Zweig, der auf Wortformen rechnet. Der Eingriff ist inhaltlich
  groß (395 Wörter + 55 Sätze nachtragen), technisch klein (ein Feld, eine Anzeigeoption).
  **Achtung Fallstrick:** Die Wortkennung im Lernstand *ist* das russische Wort
  (`CLAUDE.md`, „Bekannte Fallstricke"). Betonungszeichen in die Kennung zu schreiben würde
  jeden bestehenden Lernstand löschen — Betonung gehört in ein **eigenes Feld**, nicht in
  `ru`.

### 2.4 Ein Wort = mehrere Items

- **Plan:** `lexeme:erkennen`, `lexeme:produzieren`, `lexeme:orthographie` als unabhängig
  geplante Items; „Erkennen läuft dem Produzieren um Faktor 3 voraus".
- **Bestand:** **eine** Leitner-Stufe je Wort (`state.boxes[id]`). Die Steigerung
  erkennen → legen → tippen hängt an *derselben* Zahl.
- **Bewertung: der Plan hat recht.** Der Bestand hat das Problem bereits erkannt und
  umgangen — ADR 0033 („Gewertet wird nur, was der Nutzer behauptet hat") und der
  `wortFehler`/`patzer`-Mechanismus sind Behelfe für genau diesen Mangel. Mit getrennten
  Items wären sie überflüssig. Das ist derselbe Schemawechsel wie 2.2 und sollte mit ihm
  zusammen gemacht werden, nicht getrennt.

### 2.5 Übungen als Rubriken gegen Übungen als Generatoren

- **Plan:** „Inhalt und Übungsform strikt getrennt", ~20 Generatoren als reine Funktionen
  über einem gemeinsamen Itembestand, „keine Aufgabe hartkodieren".
- **Bestand:** sieben **Übungen** als eigenständige Ansichten mit eigenem Zustand
  (`renderUeben`, `renderTippen`, `renderUebersetzen`, `renderBuchstaben`,
  `renderGrammatik`, Power-Training). Die Aufgabenform ist Eigenschaft der Übung, nicht des
  Items.
- **Bewertung: unentschieden, und das ist der wichtigste Punkt dieser Analyse.** Der Plan
  hat strukturell recht — der Bestand zeigt die Kosten seines Ansatzes bereits: Ein Fehler
  im Jubel saß in vier Übungen (ADR 0047), ein Fehler in den Abstandsberechnungen in allen
  Fortschrittsreihen (ADR 0046). Genau davor warnt der Plan.
  **Aber:** Die Übungen sind für den Nutzer *Orte*, keine Aufgabentypen — „ich mache jetzt
  Tippen" ist die Einheit, in der er denkt, und die Home-Kacheln bauen darauf. Eine reine
  Generator-Architektur mit Session-Builder löst diese Orte auf.
  **Empfehlung: Bestand behält die Übungen als Oberfläche, Plan gewinnt darunter.** Die
  Aufgabenerzeugung wandert in benannte Generatorfunktionen mit Seed; die Übungen werden zu
  Filtern darüber („Tippen" = Generator W2 über einem Wortstapel). Das ist die einzige
  Variante, die beide Seiten behält, und sie ist schrittweise machbar.

### 2.6 Session-Builder gegen freies Üben

- **Plan:** 5–8 Minuten, feste Dramaturgie (10 % Warmlaufen / 45 % Fällig / 20 % Neu /
  20 % Anwendung / 5 % Fakt), Obergrenze 5–8 neue Items pro Tag.
- **Bestand:** keine Session. Der Nutzer wählt eine Übung und hört auf, wann er will. Es
  gibt eine **Empfehlung** auf Home (`empfehlung()`), die ihn zur sinnvollsten Übung
  schickt, und Lernsets zu je 12 Wörtern als Portionierung.
- **Bewertung: teils, teils.** Die Neu-Items-Obergrenze des Plans ist ein echtes Argument —
  der Bestand hat sie nicht, und die „Lawine in 3 Wochen" ist ein realer Effekt. Die feste
  Sessionlänge dagegen widerspricht dem Bedienkonzept des Bestands („Üben können hängt nie
  an einem Datum", ADR 0048) und dem ausdrücklichen Wunsch, Vokabeln grinden zu können.
  **Empfehlung: Plan gewinnt bei der Tagesobergrenze für neues Material, Bestand gewinnt
  bei der Sessionlänge.**

### 2.7 Fortschrittsring gegen Balken

- **Plan:** „Fortschrittsring statt Balken (Balken suggerieren Endlichkeit)".
- **Bestand:** `.kopf-rail` ist ein Balken; die Fortschrittsreihe je Lernset besteht aus
  Flammen (ADR 0046).
- **Bewertung: der Bestand sollte nachgeben — falls der Wortschatz auf 1 000 wächst.**
  Solange 395 Wörter das Ziel sind, ist der Bestand *tatsächlich* endlich, und ein Balken
  sagt die Wahrheit. Wird der Reader zum offenen Wachstumspfad, wird der Balken zur Lüge.
  Die Reihenfolge ist also: erst der Reader, dann der Ring.

### 2.8 Wortschatzumfang

- **Plan:** 1 000 kuratierte Lemmata, danach Reader.
- **Bestand:** 395 Vokabeln, 24 Themen, Reihenfolge = Lehrplan (ADR 0007).
- **Bewertung: der Plan hat recht, der Weg dorthin ist der eigentliche Punkt.** 395 → 1 000
  ist nicht „mehr vom Gleichen": Jede Vokabel braucht im Bestand eine Lautschrift von Hand,
  jeder Satz seine `benoetigt`-Liste, und die Nomen-/Verben-Ausnahmen werden gegen die blanke
  Regel geprüft (ADR 0030/0031). Handarbeit skaliert hier nicht auf 1 000.
  **Der Plan liefert die Antwort selbst** (§11): Import aus OpenRussian als **Build-Schritt**.
  Das passt exakt zur bestehenden `tools/build.mjs`-Pipeline und ist der billigste große
  Fortschritt in dieser ganzen Liste.

### 2.9 Persistenz

- **Plan:** IndexedDB für Items und Reviews, `localStorage` nur für Einstellungen.
- **Bestand:** alles in `localStorage`, zwei Schlüssel, plus Sicherungscode zum Abtippen.
- **Bewertung: der Bestand hält — vorerst.** Bei 395 Wörtern ist der Stand wenige Kilobyte
  groß. Das Limit ist nicht die Größe, sondern der `ReviewLog` des Plans: Eine
  Historie über tausende Antworten gehört nicht in `localStorage`. Der Wechsel ist also
  an FSRS gekoppelt (2.2), nicht eigenständig fällig.

### 2.10 Der Sicherungscode als Export

- **Plan:** „automatischen JSON-Export anbieten (wöchentliche Erinnerung, Datei in iCloud
  Drive)".
- **Bestand:** ein kompakter Textcode zum Kopieren (ADR 0017), an festen Stellen aufgebaut,
  mit Prüfsumme.
- **Bewertung: der Bestand ist hier besser als der Plan.** Ein Code, den man in eine
  Nachricht an sich selbst kopiert, überlebt einen Gerätewechsel zuverlässiger als eine
  Datei im iCloud-Ordner, und er funktioniert ohne Dateisystem-Dialoge auf iOS. **Was der
  Bestand vom Plan übernehmen sollte, ist die Erinnerung**, nicht das Format.

### 2.11 Verhältnis zur Systemtastatur

- **Plan:** „Umschalter zur Systemtastatur bleibt für Vielschreiber verfügbar."
- **Bestand:** Umschalter vorhanden, aber `CLAUDE.md` hält ausdrücklich fest, dass die
  *Sprache* der Gerätetastatur von einer Webseite nicht wählbar ist — iOS entscheidet das.
- **Bewertung: der Bestand hat die genauere Information.** Der Plan unterschätzt an dieser
  Stelle die Plattform; die Formulierung „Layout-Wahl bleibt bei Ihnen" gilt nur für die
  eigene Tastatur.

### 2.12 `ё`

- **Plan:** offene Frage 3 — im Lernmaterial konsequent `ё`, im Reader tolerieren.
- **Bestand:** bereits entschieden und umgesetzt: `normalize()` setzt `ё` auf `е` gleich,
  die Bewertung verzeiht es, und der Kommentar lobt, wer es trotzdem schreibt
  (Kommentar-Topf `jo`).
- **Bewertung: die offene Frage des Plans ist im Bestand beantwortet**, und zwar genau so,
  wie der Plan es andeutet. Übernehmen.

---

## 3 · Fehlt

Nach Größe des Eingriffs sortiert, mit Risiko.

### 3.1 Zwei Nutzertypen und der Kompetenzvektor (§1, §2)

**Fehlt vollständig.** Der Bestand kennt einen Weg: Buchstaben → Wörter → Sätze. Typ B
(spricht, schreibt nicht) hat keinen Einstieg — er müsste sich durch Vokabeln arbeiten,
die er längst kennt.

- **Eingriff: groß.** Fünf unabhängige Achsen statt einer Fortschrittszahl, ein
  Einstufungsmodul mit fünf Messungen, jede Achse einzeln korrigierbar.
- **Risiko: hoch, und zwar didaktisch, nicht technisch.** Der Plan sagt selbst:
  „Fehleinstufung ist der häufigste Abbruchgrund." Eine Diagnostik, die falsch misst, ist
  schlechter als keine. Das Hör-Diktat als Typ-A/B-Diskriminator setzt außerdem **Audio**
  voraus (3.3) — ohne das ist der Kern der Messung nicht baubar.
- **Vorbedingung:** getrennte Items je Kompetenz (2.4). Ohne die gibt es nichts, worauf ein
  Vektor zeigen könnte.

### 3.2 Der Reader (§7)

**Fehlt vollständig** — und ist laut Plan „kein Nebenmodul, sondern das Ziel".

- **Eingriff: sehr groß.** Tap-Gloss, Bekanntheits-Einfärbung, Tokenisierung,
  Lemmatisierung, Verständnisfragen, Extensiv-Modus, automatische Item-Aufnahme, dazu ein
  Wörterbuch-Paket „mehrerer zehntausend Einträge, komprimiert, lazy geladen".
- **Risiko: hoch — und hier bricht die Ein-Datei-Vorgabe.** Ein Wörterbuch dieser Größe
  passt nicht in eine HTML-Datei, die heute 516 KB hat. Das ist kein Detail, sondern der
  Punkt, an dem der Plan und ADR 0001 unvereinbar werden. Vor jeder Umsetzung zu klären.
- **Zweiter Fallstrick:** Russische Lemmatisierung ist kein Nachschlagen. `книгу → книга`
  geht über die Formentabelle, aber Homonymie (`стали` = Verb oder Nomen) braucht Kontext.
  Der Plan setzt das als gelöst voraus; es ist es nicht.

### 3.3 Audio als Pflichtmodul (§10, M7)

**Fehlt.** Der Bestand hat `hoerknopf()` über die Web Speech API — also genau das, was der
Plan als „für ein Pflichtmodul zu unzuverlässig" verwirft.

- **Eingriff: mittel in der App, groß außerhalb.** In der App: eine Abspielschicht mit
  Sprite-Offsets und Fallback auf TTS — überschaubar, weil `hoerknopf()` schon der einzige
  Einstiegspunkt ist (`CLAUDE.md`: „Vorlesen nur über `hoerknopf(text, sprache)`"). Außerhalb:
  Aufnahme oder Synthese von 1 000 Wörtern, ~600 Sätzen und 33 Lauten, Lizenzklärung,
  Sprite-Erzeugung.
- **Risiko: hoch, und es liegt im Auslieferungspfad.** 15–25 MB Audio widersprechen
  „keine externen Ressourcen" und der Ein-Datei-Vorgabe frontal. Als Base64 in der HTML-Datei
  ist das ausgeschlossen; als separate Dateien braucht es einen Service Worker, um offline zu
  bleiben. **Audio erzwingt die PWA** — die beiden Punkte sind nicht unabhängig.
- **Konsequenz für die Reihenfolge:** Der Plan zieht M7 vor M4, weil Diktate ohne Ton nicht
  spielbar sind. Das stimmt — und heißt, dass das Orthographiemodul (3.4) am Audio hängt.

### 3.4 Orthographie-Fundament und Prüfwort-Methode (§6 Phase 1)

**Fehlt vollständig.** Weder die neun Regeln noch die Prüfwort-Methode noch `OrthoRule` als
Entität. Der Bestand hat mit «Grammatik» eine verwandte Struktur (Regel als Karteikarte,
Induktion vor Erklärung), aber sie behandelt Formenbildung, nicht Schreibung.

- **Eingriff: mittel.** Die Struktur existiert bereits und ist übertragbar: `grammatik.json`
  ist beinahe schon ein `OrthoRule`-Schema (`frage`, `deutungen`, `richtig`, `regel`,
  `tabelle`, `stolpersteine` als `fussnote`). Neu wären das Feld `pruefwort` je Lexem und
  Generator E3.
- **Risiko: mittel.** `pruefwort` lässt sich nicht ableiten, es ist Wortwissen — 1 000
  Einträge Handarbeit oder ein Import, der es mitliefert. Und E1/E2 (Diktate) brauchen
  Audio.
- **Wert: hoch.** Das ist der Teil des Plans, der am wenigsten kostet und am meisten
  Neues bringt, sobald Audio steht.

### 3.5 Generatoren, die konzeptionell fehlen

| Generator | Status im Bestand |
|---|---|
| D3 Minimalpaar (`ш/щ`, `и/ы`) | fehlt; `ABC_TUECKISCH` ist die Vorstufe |
| D4 Silbenleiter | fehlt vollständig — Härte/Weichheit wird nirgends geübt |
| D5 Wort-Blitz (400–800 ms) | fehlt; der „Automatisierungs-Motor" des Plans |
| D6 Betonung setzen | fehlt, hängt an 2.3 |
| D7 Suchlauf | fehlt |
| E1/E2 Diktat | fehlt, hängt an Audio |
| E3 Orthographie-Falle | fehlt, siehe 3.4 |
| E4 Anagramm | **vorhanden** als Kachelmodus |
| E6 Fehlersuche | fehlt |
| W3 Kontext-Lücke | fehlt — und der Plan nennt sie den **Standardfall**, isolierte Vokabeln „nur als Notlösung". Der Bestand macht es genau umgekehrt |
| W4 Kollokation | fehlt |
| G2 Endungs-Tap | fehlt |
| G4 Transformation | fehlt |
| G5 Rektions-Wahl | fehlt |

- **Eingriff je Generator: klein bis mittel** — sobald 2.5 (Generatorschicht) steht.
  Ohne sie ist jeder einzelne eine neue Ansicht mit eigenem Zustand, und dann ist der
  Aufwand pro Stück drei- bis fünfmal so hoch.
- **Am schmerzhaftesten fehlt W3.** Der Bestand lernt Vokabeln isoliert und wendet sie in
  «Übersetzen» an; der Plan will sie von Anfang an im Satz. Das ist ein didaktischer
  Dissens, kein Feature-Lücke — und der Plan hat die Forschung auf seiner Seite.
  **Billig machbar:** Die 55 Sätze mit `formen`-Angaben sind bereits annotiert; eine
  Cloze-Aufgabe daraus ist wenig Arbeit.

### 3.6 Schreib-Layer (§8)

**Fehlt** bis auf Stufe 1 („gelenkt"): Lückentext gibt es nicht, Umformung nicht, Diktat
nicht. Freies Schreiben mit regelbasierter Prüfung fehlt ganz.

- **Eingriff: groß.** Die regelbasierte Prüfung braucht die vollständige Formentabelle des
  Wörterbuchs — also 2.8 und den Import.
- **Risiko: mittel.** Der Plan ist hier ehrlich über die Grenzen (keine Aspektwahl, keine
  Wortstellung) und schlägt die Selbstkorrektur-Checkliste vor. Das ist umsetzbar.

### 3.7 Phasen 5 und 6

Der Bestand endet inhaltlich etwa bei **Phase 3/4**: Präpositiv, Akkusativ, Genitiv, Dativ
fehlt, Instrumental fehlt, Adjektivdeklination als Übereinstimmung vorhanden, Präteritum
vorhanden, Aspekt fehlt, Verben der Bewegung fehlen, Futur fehlt. Imperativ, Konditional,
Partizipien, Zahlwörter + Kasus: alles nicht vorhanden.

- **Eingriff: mittel, aber langwierig.** Jeder Baustein ist Inhalt, kein Code — die
  Grammatikmaschine trägt ihn (ADR 0030). Der Bestand kann hier wachsen, ohne die
  Architektur anzufassen.
- **Risiko: gering, mit einer Ausnahme.** ADR 0043 („ein Baustein, der etwas über die Welt
  voraussetzt, nennt seine Wörter selbst") wird bei Instrumental und Dativ mehr Arbeit
  machen als bisher: `с мамой` ist sinnvoll, `с водой` nicht immer.

### 3.8 Kleinigkeiten mit gutem Verhältnis

| Fehlt | Aufwand | Nutzen |
|---|---|---|
| Latenzmessung je Antwort | sehr klein | Vorbedingung für FSRS, sofort als Statistik brauchbar |
| `navigator.storage.persist()` | sehr klein | schützt gegen Safaris 7-Tage-Löschung |
| Offline-Indikator | klein | der Plan nennt ihn, der Bestand hat ihn nicht |
| Erinnerung an die Sicherung | klein | schließt die echte Lücke aus 2.10 |
| `100dvh` statt `100vh` | sehr klein | `body.aufgabe` nutzt heute `100vh` — auf iOS falsch, sagt der Plan zu Recht |
| Fehlerprofil (womit verwechselt wurde) | klein | `state.leseFehler` und `wortFehler` sind die halbe Miete; gezielte Distraktoren wären der Rest |

---

## 4 · Im Bestand vorhanden, im Plan nicht vorgesehen

Nichts davon ist ein Fehler — es ist die Substanz, die eine Umsetzung des Plans **nicht**
verlieren darf.

| Bestand | Wert | Verhältnis zum Plan |
|---|---|---|
| **Das Maskottchen** — eine Chili, die von Ansicht zu Ansicht springt, erklärt und kommentiert (ADR 0010–0012, 0044, 0049, 0051) | Trägt den Ton der App. Der Plan spricht nur einmal von „Chili-Rot passt zum Maskottchen" — er kennt die Figur, aber nicht ihre Rolle | Ergänzt den Plan, widerspricht ihm nicht |
| **Kommentare nach jeder Auflösung** (ADR 0049, 94 Sätze in `data/kommentare.json`) | Der Plan verlangt bei Fehlern „ein erklärender Satz"; der Bestand tut das bei **jeder** Antwort und mischt trocken mit freundlich | Geht über den Plan hinaus. Achtung: Der Plan verlangt zusätzlich **erzwungene Rekonstruktion** nach Fehlern — die fehlt (gehört in §3) |
| **Sprachfakten als eigene Sammlung** (126 Stück, Favoriten, eigene Ansicht) | Der Plan kennt den Aha-Fakt nur als 5-%-Sessionblock | Der Bestand hat mehr daraus gemacht |
| **Tickets im Gerät** (ADR 0016, 0021, 0025) | Meldeblatt von überall, Entwurf überlebt das Zuklappen, Bündeln zum Kopieren | Im Plan nicht vorgesehen; für die Weiterentwicklung dieser App faktisch der Rückkanal |
| **Fünf Farbschemata** (ADR 0039) | Der Plan sagt „Dark, ein Akzent, sonst Graustufen" | **Direkter Widerspruch.** Der Bestand ist hier reicher; der Plan wäre eine Rücknahme. Kein Grund nachzugeben |
| **Das Tutorial als Scheinwerfer** (ADR 0051) | Zwölf Schritte über die echte Oberfläche, erklärt die Reihenfolge der Übungen | Der Plan hat ein *Einstufungs*-Onboarding, aber kein *Erklär*-Onboarding. Beides wird gebraucht — sie ersetzen einander nicht |
| **Power-Training** (ADR 0034) | Holt Wörter zurück, die dreimal hintereinander falsch geschrieben wurden | Der Plan hat den „Aufholmodus" für Terminrückstand, aber nichts für **inhaltliches** Zurückfallen |
| **Der Prüfstand** (32 Suiten, 1 645 Prüfungen, blockierender Hook, CI) | Prüft am echten DOM statt an einer headless Engine | Der Plan setzt auf Seed-Determinismus in reinen Funktionen. Beides zusammen wäre besser als jedes für sich — der Prüfstand darf nicht ersetzt werden |
| **51 ADRs** | Jede Entscheidung mit Begründung, viele mit dem Fehler, der zu ihr führte | Der Plan ist ein Zielbild; die ADRs sind das Gedächtnis. Bei jedem Konflikt in §2 sollte zuerst der zuständige ADR gelesen werden — mehrere der Plan-Vorschläge wurden hier schon einmal verworfen, mit Grund |
| **Freestyle**, **Lernsets**, **«Alle»-Stapel** als drei Zugänge zum selben Wortschatz | Zielgerichtet, frei, grindend | Der Plan kennt nur die vom Session-Builder gebaute Sitzung. Der Bestand lässt den Nutzer wählen — das war ein ausdrücklicher Wunsch (ADR 0048) |

---

## Einschätzung: Machbarkeit, Größe des Eingriffs, Risiken

### Gesamturteil

Der Plan ist **nicht inkrementell aus diesem Repo erreichbar.** Vier seiner Festlegungen —
PWA, IndexedDB, vorgerendertes Audio, Wörterbuch-Paket — brechen jeweils für sich die
Ein-Datei-Vorgabe, die das tragende Prinzip dieses Projekts ist (ADR 0001). Wer den Plan
ganz will, baut neu und übernimmt Inhalte, Bedienkonzept und Prüfstand.

Wer den Bestand behalten will, kann trotzdem **einen erheblichen Teil des Plans ernten** —
aber nur den Teil, der ohne Audio und ohne Wörterbuch auskommt. Das ist mehr, als es
zunächst aussieht.

### Was sich lohnt, in dieser Reihenfolge

| # | Schritt | Eingriff | Risiko | Warum zuerst |
|---|---|---|---|---|
| 1 | **Latenz messen**, `100dvh`, `storage.persist()`, Offline-Indikator, Sicherungs-Erinnerung | je < 1 Tag | sehr gering | Sofortnutzen, keine Vorbedingungen, keine Schemaänderung |
| 2 | **Betonung als eigenes Feld** in `vokabeln.json` und `saetze.json`, Anzeige umschaltbar | 1–2 Tage Code, viel Inhaltsarbeit | gering — **solange sie nicht in die Wortkennung wandert** | Vorbedingung für Prüfwort, D6, Aussprache; kostet nichts an Architektur |
| 3 | **W3 Kontext-Lücke** aus den vorhandenen `formen`-Annotationen | 1–2 Tage | gering | Der größte didaktische Gewinn zum kleinsten Preis; die Daten liegen schon da |
| 4 | **Import als Build-Schritt** (OpenRussian → `vokabeln.json`) auf 1 000 Lemmata | 3–5 Tage | mittel: CC-BY-SA-Share-Alike, Qualitätsprüfung der Übersetzungen | Handarbeit skaliert nicht; `tools/build.mjs` ist der richtige Ort dafür |
| 5 | **Generatorschicht unter den Übungen** (2.5), Aufgabenbau in benannte Funktionen mit Seed | 1–2 Wochen | mittel: Umbau am laufenden Motor, aber der Prüfstand deckt ihn ab | Danach kostet jeder neue Generator Tage statt Wochen |
| 6 | **Getrennte Items je Kompetenz + FSRS + IndexedDB + neuer Sicherungscode** | 2–4 Wochen | **hoch**: Schemawechsel mit Migration, Sicherungscode-Format, Lernstände Bestandsnutzer | Erst sinnvoll ab ~1 000 Wörtern; unbedingt als **ein** Schritt, nicht als drei |
| 7 | **Service Worker + Audio-Pipeline** | 2–3 Wochen plus Aufnahme/Lizenz | **hoch**: bricht ADR 0001, Offline-Zusage hängt daran | Vorbedingung für Diktate und damit für das Orthographiemodul |
| 8 | **Orthographie-Fundament** (§6 Phase 1, E3, Prüfwort) | 1–2 Wochen | mittel | Erst nach 7 vollständig spielbar, ohne Audio nur zur Hälfte |
| 9 | **Einstufung + Kompetenzvektor** | 1–2 Wochen | **hoch, didaktisch**: Fehleinstufung ist laut Plan der häufigste Abbruchgrund | Braucht 6 (Items je Achse) und 7 (Hör-Diktat) |
| 10 | **Reader** | 4–8 Wochen | **sehr hoch**: Wörterbuchgröße, Lemmatisierung, Homonymie | Das Ziel des Plans — und der Punkt, an dem dieses Repo endgültig eine andere App wird |

### Die drei Risiken, die vor jeder Umsetzung geklärt gehören

1. **ADR 0001 gegen den Plan.** Ein-Datei-App und PWA mit Audio und Wörterbuch schließen
   einander aus. Diese Entscheidung ist keine technische, sondern eine über den Charakter
   des Projekts — sie gehört dem Auftraggeber, nicht der Umsetzung. `docs/architektur.md`
   führt sie bis heute bewusst als offen.
2. **Die Wortkennung ist das russische Wort.** Jede Änderung an der Schreibweise einer
   Vokabel — auch ein hinzugefügtes Betonungszeichen — setzt deren Lernstand zurück
   (`CLAUDE.md`, „Bekannte Fallstricke"). Beim Sprung auf 1 000 Lemmata über einen Import
   ist das die wahrscheinlichste Ursache für stillen Datenverlust.
3. **Der Sicherungscode führt Inhalte über einen Hash des Textes.** Ein Import, der
   Übersetzungen normalisiert, ändert diese Kennungen — bestehende Sicherungscodes würden
   danach falsche oder gar keine Wörter treffen. Das ist ein Migrationsproblem, das im Plan
   nicht vorkommt, weil er von einem leeren Repo ausgeht.

### Was der Plan aus dem Bestand übernehmen sollte

Drei seiner offenen Fragen sind hier bereits beantwortet, und zwar gut: **ЙЦУКЕН** als
Tastaturvorgabe (Frage 2), der Umgang mit **`ё`** (Frage 3) und die Entscheidung, dass
Üben nie an einem Datum hängt. Dazu die Erkenntnis, dass die *Sprache* der Systemtastatur
von einer Webseite nicht steuerbar ist — der Plan formuliert an dieser Stelle zu
optimistisch.
