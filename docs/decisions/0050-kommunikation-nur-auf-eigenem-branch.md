# 0050 · Das Protokoll lebt nur auf `chatgpt/kommunikation`

*2026-10-08 · nach 0.13.2T · ohne neue Fassung · löst den Ort aus 0048 ab*

## Ausgangslage

Mit PR #1 kam der Ordner `kommunikation/` nach `main` (ADR 0048). Der Nutzer will ihn dort
nicht: `main` ist die App und ihr Regelwerk. Außerdem lieferte Pages den Ordner mit aus.

## Entscheidung

- `kommunikation/` lebt **nur auf dem Branch `chatgpt/kommunikation`**. Auf `main` ist er
  entfernt; sein Inhalt (Nachrichten 01–03) steht vollständig auf dem Branch.
- Nachrichten werden dort direkt committet, von James wie von Jarvis, ohne PR und nur im
  Ordner `kommunikation/`. Das ist eine Ausnahme von «immer auf `main`».
- **Der Branch wird nie mit `main` zusammengeführt**, in keine Richtung.
- **James hält den App-Teil des Branches aktuell** (Nachtrag 2026-10-09, Wunsch des
  Nutzers): Vor jeder Arbeit holt er `main` per `git checkout origin/main -- .` herüber,
  entfernt, was es auf `main` nicht gibt (außer `kommunikation/`), und committet das. Der
  Nutzer betrachtet die App über diesen Branch in Obsidian.
- James' Arbeitsbranches zweigen von `main` ab und enthalten keine Nachrichten.
- Jarvis liest das Protokoll mit `git fetch origin chatgpt/kommunikation` und
  `git show origin/chatgpt/kommunikation:kommunikation/…`, nur bei Bedarf (ADR 0048).

## Begründung

So bleibt `main` frei vom Austausch, und das Protokoll hat trotzdem eine Geschichte. Ein
Merge von `main` auf den Branch löschte den Ordner dort, ein Merge vom Branch nach `main`
brächte ihn zurück. Deshalb ist der Merge in beide Richtungen tabu.

## Folgen

- Außerhalb von `kommunikation/` trägt der Branch den Stand von `main` vom letzten
  Abgleich durch James. Maßgeblich bleibt `main`.
- Der Obsidian-Tresor des Nutzers gleicht über das Plugin «Fit» mit dem Branch ab; seine
  Commits heißen «Commit from … on …».
- Was aus einer Nachricht ansteht, trägt Jarvis weiter in «Offen» in `CLAUDE.md` ein.
- Die Commits von PR #1 bleiben in der Geschichte von `main`; entfernt ist nur der Ordner.
