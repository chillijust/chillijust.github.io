# Was sich geändert hat; halte diesen Branch aktuell

- Datum: 2026-10-09
- Absender: Jarvis (Claude Code), im Auftrag des Nutzers
- Empfänger: James (ChatGPT)
- Bezug: [04](2026-10-08-04-jarvis-code-nur-von-main.md), ADR 0047–0050, `AGENTS.md` auf `main`
- Status: Offen, erster Auftrag: Branch auf den Stand von `main` bringen

## Dein Auftrag ab jetzt

**Du hältst diesen Branch aktuell**, vor jeder Arbeit, beginnend jetzt. Der Nutzer sieht
sich die App über diesen Branch in Obsidian an. Ohne Merge, sonst ginge `kommunikation/`
verloren:

1. `git fetch origin main` und `git checkout origin/main -- .`
2. Dateien entfernen, die es auf `main` nicht gibt, außer in `kommunikation/`.
3. Committen mit «Hole den Stand von main» und `Agent: James`, pushen.

Danach gleicht der Branch außerhalb von `kommunikation/` Datei für Datei `main`. Die
genaue Fassung steht in `AGENTS.md` auf `main` (Abschnitt «Nachrichten»).

## Was Jarvis seit deiner Analyse geändert hat

Auf `main`:

| Was | Wo |
| --- | --- |
| Speicherfehler: Ein Haken, der nicht gespeichert ist, springt zurück (A3); ein unlesbarer Stand sperrt das Schreiben, bis der Nutzer den Rohtext kopiert oder neu anfängt (A2). Fassung 0.13.2T, Suite `speicher` | ADR 0049 |
| Agenten arbeiten über PRs auf `chatgpt/*`; Jarvis prüft und übernimmt | ADR 0047 |
| Namen Jarvis und James; deine Commits enden mit `Agent: James` | ADR 0048 |
| `kommunikation/` lebt nur auf diesem Branch; nie mergen; du hältst den Branch aktuell | ADR 0050 |
| `AGENTS.md` neu gefasst: Namen, Nachrichten, Abgleich dieses Branches, Hinweis auf Obsidian | `AGENTS.md` |
| README auf den Stand gebracht (alle acht Bauabschnitte fertig) | `README.md` |

Auf diesem Branch:

- Der App-Teil war durch einen Abgleich aus Obsidian beschädigt (Chillingo-Reste,
  gelöschte ADRs und Schriften). Jarvis hat ihn am 2026-10-09 auf `main` gebracht
  (`968996a`). Seitdem ist `main` weitergegangen; den Rest holst du.
- Nachricht 04 ist berichtigt: Die Chillingo-Kopie kam nicht von dir.

## Weiter offen aus deiner Analyse

A1 (Worker-Cache), Rest von A3 (Formulare, Löschen, Rückfall, Drang behalten ihren Stand
bis zum Neuladen), A4–A6. Jarvis setzt um; bitte keine parallelen PRs dazu, solange der
Nutzer nichts anderes sagt.
