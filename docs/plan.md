# Plan: Home, Menü, Bilanz, Buchstaben

**Stand:** 2026-08-02 · wird fortgeschrieben, bis alle Etappen erledigt sind.
Zuletzt: Nachbesserungen aus dem ersten Gerätetest (ADR 0019).

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

---

## Etappe 2 · Bilanz mit Tiefe — **offen**

- [ ] Kacheln der Bilanz antippbar machen
- [ ] Detailansichten mit Donut-Diagrammen als Inline-SVG (`stroke-dasharray`)
  - [ ] **Wörter** — Verteilung über die Leitner-Stufen
  - [ ] **Sätze** — sitzt / offen / noch gesperrt, je Stufe
  - [ ] **Beantwortet** — Trefferquote Tippen gegen Übersetzen
  - [ ] **Serie** — aktuelle gegen beste
- [ ] Themenliste nur für begonnene Themen
- [ ] **Kein Leak:** nie eine Liste ungelernter Wörter oder Sätze; nur Aggregate und
      Inhalte, die schon begonnen wurden
- [ ] Testreihe, Doku, ADR

---

## Etappe 3 · Übung «Buchstaben» — **offen**

Freiwillig: blockiert nichts, zählt nicht in den Lehrplan-Fortschritt.

- [ ] `data/buchstaben.json` — 33 Buchstaben mit Laut, Transkription, Merkhilfe
- [ ] Prüfung in `tools/build.mjs` (Vollständigkeit, eindeutige Kennungen)
- [ ] **Alphabet-Tafel** zum Nachschlagen
- [ ] **Quiz**: Buchstabe → Laut und zurück
- [ ] Schwerpunkt auf den falschen Freunden: В=w, Н=n, Р=r, С=s, У=u, Х=ch
- [ ] Eigener Lernstand, getrennt vom Wortschatz
- [ ] Fünfte Kachel auf Home
- [ ] Testreihe, Doku, ADR

---

## Danach zu prüfen

- Sicherungscode Format 2 auf dem Gerät (steht beim Betreiber noch aus)
- Ob die Empfehlung auf Home die richtigen Prioritäten setzt, sobald mehr Lernstand da ist
