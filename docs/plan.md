# Plan: Home, Menü, Bilanz, Buchstaben — abgeschlossen

**Stand:** 2026-08-03 · **alle drei Etappen erledigt.**
Offen sind nur noch die Punkte unter «Danach zu prüfen».

Vereinbarte Begriffe: die fünf Lernbereiche heißen **Übungen** (nicht «Rubriken»).
Bilanz, Einstellungen und Tickets sind keine Übungen — sie stehen im **Menü**.

---

## Etappe 1 · Home und Menü — **erledigt** (ADR 0018, Commit `65764c8`)

- [x] Home als Startansicht: Kachel je Übung, jede mit ihrem Zustand
- [x] Empfehlungszeile («Als Nächstes») mit der Chili
- [x] Reiterleiste entfernt; unterwegs trägt der Kopf Rückweg und Namen und klebt
- [x] Menü hinter rundem Knopf mit drei Strichen · Bilanz, Einstellungen, Tickets
- [x] Striche wandern gestaffelt nach unten aus dem Kreis, Panel klappt auf
- [x] Begriffswechsel «Rubrik» → «Übung» in Text, Code und Doku

### Nachbesserungen aus dem ersten Gerätetest — **erledigt** (ADR 0019)

- [x] Menüpanel liegt als Ebene **über** dem Inhalt, statt ihn nach unten zu schieben
- [x] Panel nur so breit wie nötig, rechtsbündig unter dem Knopf
- [x] Nach der Auswahl bleiben die Striche verschwunden; die Chili springt in den Knopf
- [x] Auf Home keine Kante über «Chillingo.» — der Kopf lässt den Schein durch
- [x] Unterwegs sitzt die Chili neben dem Titel statt darüber (kollidierte mit
      «Einstellungen»)

### Nachbesserungen aus dem zweiten Gerätetest — **erledigt**

- [x] Schon beim **Aufklappen** springt die Chili in den Knopf, nicht erst nach der
      Auswahl — er ist ja ab dem Öffnen leer
- [x] Laufende Flüge werden abgebrochen, bevor ein neuer startet (überlagerten sich)
- [x] Der ruhende Punkt wird bei jedem Lauf neu bewertet, nicht nur beim Stationswechsel
- [x] Der Knopf clippt den Flug nicht mehr weg — geblendet wird in einer eigenen Hülle
- [x] Der Flug rechnet mit Mittelpunkten statt Ecken (`scale` wirkt um die Mitte)

### Nachbesserungen aus dem dritten Gerätetest — **erledigt** (ADR 0020)

- [x] Die App startete auf «Lernsets» statt auf Home (`currentTab` stand noch falsch)
- [x] Klappmenüs und Chip-Reihen in den Übungen durch **einen Auswahlknopf** ersetzt;
      dahinter dasselbe Aufklapp-Panel wie beim Menü
- [x] Der Knopf färbt sich golden, sobald etwas vom Regelfall abweicht

### Aus dem vierten Gerätetest — **erledigt** (ADR 0021)

- [x] Beim Neuladen sprang die Chili von der Kopfzeile auf die Empfehlung
      (erst zeichnen, dann platzieren)
- [x] **Meldeknopf** unten rechts, von jeder Ansicht aus erreichbar
- [x] Blatt von unten statt ganzer Ansicht; die Ansicht darunter bleibt sichtbar
- [x] Haken für den Ansichtsbezug, vorbelegt mit der Ansicht darunter
- [x] Das Blatt lässt sich schieben und federt zurück, ohne zu schließen

---

## Etappe 2 · Bilanz mit Tiefe — **erledigt** (ADR 0022)

- [x] Kacheln der Bilanz antippbar machen
- [x] Detailansichten mit Ringdiagrammen als Inline-SVG (`stroke-dasharray`)
  - [x] **Wörter** — Verteilung über die Leitner-Stufen
  - [x] **Sätze** — sitzt / offen / noch gesperrt, je Stufe
  - [x] **Beantwortet** — Trefferquote Tippen gegen Übersetzen
  - [x] **Serie** — aktuelle gegen beste
- [x] Themenliste nur für begonnene Themen
- [x] **Kein Leak:** nie eine Liste ungelernter Wörter oder Sätze; nur Aggregate und
      Inhalte, die schon begonnen wurden
- [x] Kopf und Zurück-Pfeil kennen die Detailansicht
- [x] Testreihe (34 Prüfungen), Doku, ADR 0022

---

## Etappe 3 · Übung «Buchstaben» — **erledigt** (ADR 0023)

Freiwillig: blockiert nichts, zählt nicht in den Lehrplan-Fortschritt.

- [x] `data/buchstaben.json` — 33 Buchstaben mit Laut, Transkription, Merkhilfe
- [x] Prüfung in `tools/build.mjs` (Vollständigkeit, Paare, Dubletten, Merkhilfen,
      Abgleich mit der Tastatur, eindeutige Kennungen)
- [x] **Alphabet-Tafel** zum Nachschlagen, mit Stufenbalken und aufklappbarer Merkhilfe
- [x] **Quiz**: Zeichen → Laut, Laut → Zeichen oder gemischt
- [x] Schwerpunkt auf den falschen Freunden: В=w, Н=n, Р=r, С=s, У=u, Х=ch — hervorgehoben
      und im Quiz als Ablenker gegeneinander
- [x] Eigener Lernstand, getrennt vom Wortschatz; keine Wirkung auf Serie und «beantwortet»
- [x] Fünfte Kachel auf Home, eine Zeile im Lernweg der Bilanz
- [x] Sicherungscode nimmt sie mit (achtes Feld, alte Codes bleiben lesbar)
- [x] Testreihe (51 Prüfungen), Doku, ADR 0023

### Nachtrag · Buchstaben wie Vokabeln abfragen — **erledigt** (ADR 0024)

- [x] Zwei Schwellen: «sitzt» ab Stufe 2, «gemeistert» ab Stufe 4
- [x] Fortschrittspunkte im Kopf, Leiter des Buchstabens auf der Karte
- [x] **Kachelmodus** ab Stufe 2 — den Laut aus lateinischen Kacheln zusammensetzen
- [x] **Aufdecken** wie in den anderen Übungen
- [x] Home-Kachel, Bilanz-Zeile, Leerzustand und Fußzeile nennen beide Zahlen
- [x] Testreihe von 51 auf 81 Prüfungen erweitert

---

## Nachtrag · Sechs Tickets vom Gerät — **erledigt** (ADR 0025)

- [x] **Buchstaben**: Üben ist der Einstieg, die Tafel liegt hinter einem eigenen Knopf
- [x] **Meldeblatt**: zieht nur nach unten, schließt ab 90 px oder beim Tippen daneben
- [x] Zuklappen behält den Entwurf; verworfen wird nur über «Abbrechen»
- [x] Ein liegen gebliebener Entwurf zeigt sich am schwebenden Knopf
- [x] **Tickets ändern**: Tipp auf die Zeile, «Sichern» heißt dann «Ändern»
- [x] **Fehler**: kein Aufblitzen der Chili beim Neuladen mehr
- [x] **Sicherung** als eigener Menüpunkt, samt Zurücksetzen
- [x] **Vorlesen** in allen Übungen, russisch und deutsch
- [x] Neue Testreihe `hoeren.mjs`; zusammen 602 Prüfungen

---

## Nachtrag · Gemeistert, Tippen, Klang — **erledigt** (ADR 0026)

- [x] **Gemeistert-Rückmeldung** für Wort, Satz und Buchstabe — goldene Zeile plus Klang
- [x] Nur der **Übergang** auf die Endstufe meldet, nicht das Auffrischen
- [x] **Übersetzen**: ab Stufe 2 und in der Auffrischung wird der Satz getippt
- [x] Kyrillische Lösungen bekommen die eingebaute Tastatur zum Einblenden
- [x] **Fehler**: `interrupted` weckt den Klang wieder; `resume()` wird abgewartet
- [x] Jeder Tipp und jede Rückkehr aus dem Hintergrund wecken den Kontext
- [x] Glasigerer Klang für «richtig» — Anschläge aus mehreren Teiltönen
- [x] Neue Testreihe `meister.mjs`; zusammen 645 Prüfungen

---

## Nachtrag · Stummschalter und Home-Bildschirm-App — **erledigt** (ADR 0027)

- [x] `navigator.audioSession.type = 'transient'` — klingt trotz Stummschalter, ohne
      laufende Musik anzuhalten
- [x] Freigabe beim ersten Tipp über einen unhörbaren Ein-Sample-Puffer
- [x] **«Ton prüfen»** in den Einstellungen: spielt und nennt darunter die Ursache
- [x] Testreihe `meister.mjs` auf 48 Prüfungen erweitert; zusammen 649

---

## Nachtrag · Alter Klang wieder — **erledigt** (ADR 0028)

- [x] «richtig» und «falsch» zurück auf den Stand vor ADR 0026
- [x] «gemeistert» im selben schlichten Sinus, als aufsteigender Vierklang
- [x] Die Reparaturen aus ADR 0026 und 0027 bleiben unberührt
- [x] 653 Prüfungen grün

---

## Danach zu prüfen

- Sicherungscode Format 2 auf dem Gerät (steht beim Betreiber noch aus)
- Meldeknopf und Blatt auf dem Gerät (steht ebenfalls noch aus)
- Ob die Empfehlung auf Home die richtigen Prioritäten setzt, sobald mehr Lernstand da ist
- Ob die Buchstaben-Tafel auf dem iPhone in vier Spalten passt oder enger gesetzt werden
  muss
- Ob der Kachelmodus bei «щ» (sieben Kacheln plus drei überzählige) auf dem Gerät noch
  angenehm zu treffen ist
- Ob vier runde Knöpfe im Kopf («Buchstaben»: zurück, Tafel, Auswahl, Menü) neben der
  Chili auf dem iPhone noch genug Luft haben
- Ob die Sprachausgabe auf dem Gerät die russischen Stimmen findet — sie kommen auf iOS
  verzögert und fehlen ohne geladenes Sprachpaket ganz
- **Ob der Ton auf dem Gerät wieder kommt** — das lässt sich hier nicht prüfen, Headless
  hat keinen Ton. Getestet ist, was die App plant, nicht wie es klingt. Was «Ton prüfen»
  in den Einstellungen anzeigt, sagt im Zweifel, woran es liegt
- Ob zwei getippte Runden je Satz sich richtig anfühlen oder eine reicht
