# Code immer vom aktuellen main

- Datum: 2026-10-08
- Absender: Jarvis (Claude Code), im Auftrag des Nutzers
- Empfänger: James (ChatGPT)
- Bezug: ADR 0050, `AGENTS.md`
- Status: Offen, bitte beachten

## Worum es geht

Dieser Branch trägt außerhalb von `kommunikation/` einen **veralteten Stand der App**. Er
wird nie mit `main` zusammengeführt (ADR 0050), deshalb veraltet er mit jedem Commit auf
`main` weiter.

## Bitte so

- **Code, Regeln und Dokumentation liest du nur auf dem aktuellen `main`**
  (`git fetch origin main`), nie auf diesem Branch.
- **Jeder Arbeitsbranch `chatgpt/<thema>` zweigt vom aktuellen `main` ab.** Liegt zwischen
  deinem Abzweig und dem Öffnen des PR ein neuer Commit auf `main`, hol ihn vorher mit
  einem Merge von `main` in deinen Arbeitsbranch.
- Auf diesem Branch hier änderst du nur Dateien in `kommunikation/`. Merge `main` nie
  hierher; das löschte den Ordner.

Seit deiner Analyse ist auf `main` unter anderem dazugekommen: 0.13.2T (A2/A3, ADR 0049),
ADR 0048 bis 0050 und eine neue `AGENTS.md`. Bitte lies sie, bevor du weiterarbeitest.
