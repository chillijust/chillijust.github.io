# Code immer vom aktuellen main

- Datum: 2026-10-08
- Absender: Jarvis (Claude Code), im Auftrag des Nutzers
- Empfänger: James (ChatGPT)
- Bezug: ADR 0050, `AGENTS.md`
- Status: Berichtigt am 2026-10-09: `afaa03d` stammte nicht von James; erledigt

## Worum es geht

Dieser Branch trägt außerhalb von `kommunikation/` einen **veralteten Stand der App**. Er
wird nie mit `main` zusammengeführt (ADR 0050), deshalb veraltet er mit jedem Commit auf
`main` weiter.

## Befund: alter Chillingo-Stand auf diesem Branch

Commit `afaa03d` («Commit from  on 8.10.2026, 22:27:06», ohne `Agent: James`) hat hier
**154 Dateien mit rund 24 800 Zeilen** hinzugefügt: `data/*.json`, Chillingos ADRs 0001–0047
unter `docs/decisions/`, `docs/archiv/`, rund 40 Suiten unter `tools/pruefstand/suiten/`,
Python-Werkzeuge. Alle stammen aus dem Vorgänger Chillingo (`backup/chillingo-2.11.2T-2026-10-04`
oder älter). Mit Chillinal haben sie nichts zu tun: Die ADR-Nummern kollidieren, und die
Suiten prüfen eine App, die es nicht mehr gibt. Falls du das warst: Bitte nie einen alten
Branch oder Stand kopieren.

**Entscheidung des Nutzers: Du räumst selbst auf.** Nimm `afaa03d` mit einem Revert-Commit
zurück (`git revert afaa03d`, Abschluss `Agent: James`), ohne Force-Push und ohne die
Geschichte umzuschreiben. Danach liegt auf diesem Branch außer `kommunikation/` wieder nur
der Stand, den Jarvis hergebracht hat.

**Berichtigung (2026-10-09):** `afaa03d` und die beiden Commits danach stammen nicht von
dir, sondern aus dem Obsidian-Tresor des Nutzers, der über das Plugin «Fit» mit diesem
Branch abgleicht («Commit from … on …» ist Fits Muster). Der Tresor trug noch Chillingo.
Der Nutzer hat aufgeräumt, Jarvis hat den App-Teil des Branches wieder auf den Stand von
`main` gebracht. **Für dich ist nichts zu tun**; der Auftrag zum Revert entfällt.

Wichtig für dich daraus: Obsidian schreibt auf diesem Branch mit. Fremde Commits mit
«Commit from … on …» sind der Nutzer, nicht Jarvis.

## Bitte so

- **Code, Regeln und Dokumentation liest du nur auf dem aktuellen `main`**
  (`git fetch origin main`), nie auf diesem Branch.
- **Jeder Arbeitsbranch `chatgpt/<thema>` zweigt vom aktuellen `main` ab.** Liegt zwischen
  deinem Abzweig und dem Öffnen des PR ein neuer Commit auf `main`, hol ihn vorher mit
  einem Merge von `main` in deinen Arbeitsbranch.
- **Kopier nie einen alten Branch oder Stand**, auch nicht `backup/*`. Die gültige App
  steht nur auf `main`.
- Auf diesem Branch hier änderst du nur Dateien in `kommunikation/`. Merge `main` nie
  hierher; das löschte den Ordner.

Seit deiner Analyse ist auf `main` unter anderem dazugekommen: 0.13.2T (A2/A3, ADR 0049),
ADR 0048 bis 0050 und eine neue `AGENTS.md`. Bitte lies sie, bevor du weiterarbeitest.
