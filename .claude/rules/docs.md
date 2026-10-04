---
paths:
  - "docs/**"
---

# Unterlagen · Chillinal

- **Ein ADR ist kurz und fortlaufend numeriert**, Dateiname `NNNN-kurzer-titel.md` unter
  `docs/decisions/`. Aufbau: **Ausgangslage** (was nicht stimmte), **Entscheidung**,
  **Begründung**, **Folgen**. Die Zählung begann mit Chillinal neu bei 0001.
- **Wer einen älteren Eintrag ablöst, schreibt es in beide Köpfe** und trägt es im Index
  `docs/decisions/README.md` nach — ein überholter Eintrag ohne Vermerk ist eine Falle für
  den Nächsten.
- **Eine Regel, an die man sich später halten muß**, kommt zusätzlich als **ein Satz** in
  `CLAUDE.md` oder die passende Datei unter `.claude/rules/`.
- **Weicht ein Abschnitt vom Pflichtenheft ab**, steht die Abweichung im ADR — das
  Pflichtenheft selbst bleibt, wie es beschlossen wurde.
- Berührt die Änderung Zustand oder Renderzyklus, gehört sie in `docs/architektur.md`;
  Pages, Cache und Version in `docs/deploy.md`.
