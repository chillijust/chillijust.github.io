---
paths:
  - "docs/**"
---

# Unterlagen · Chillingo

- **Ein ADR ist kurz und fortlaufend numeriert**, Dateiname `NNNN-kurzer-titel.md` unter
  `docs/decisions/`. Aufbau: **Ausgangslage** (was nicht stimmte), **Entscheidung**,
  **Begründung**, **Folgen**.
- **Wer einen älteren Eintrag ablöst, schreibt es in beide Köpfe** und trägt es im Index
  `docs/decisions/README.md` nach — ein überholter Eintrag ohne Vermerk ist eine Falle für
  den Nächsten.
- **Eine Regel, an die man sich später halten muß**, kommt zusätzlich als **ein Satz** in
  `CLAUDE.md` oder die passende Datei unter `.claude/rules/`.
- Berührt die Änderung Zustand oder Renderzyklus, gehört sie in `docs/architektur.md`;
  Format der Inhalte in `docs/datenmodell.md`, Pages und Cache in `docs/deploy.md`.
- **`docs/archiv/` ist abgearbeitet.** Nichts davon ist offen, nichts wird nachgeführt. Wo es
  einer heutigen Regel widerspricht, ist es überholt.
