# 0047 · Fremde Agenten arbeiten über einen PR; Claude prüft

*2026-10-08 · nach 0.13.1 · ohne neue Fassung · ergänzt durch 0048*

## Ausgangslage

Der Nutzer will ChatGPT Zugriff auf das Repository geben. Das Regelwerk war nur für
Claude geschrieben: `CLAUDE.md` und `.claude/rules/` lädt ChatGPT nicht von selbst, und
der Push-Hook `.claude/hooks/vor-dem-push.mjs` greift nur in einer Claude-Sitzung. Nach
der Branch-Regel wird «immer auf `main`» gearbeitet, und `main` geht über GitHub Pages
sofort live. Ein fremder Agent hätte also ungeprüft und ohne Kenntnis der Regeln
ausgeliefert.

## Entscheidung

- Fremde Agenten arbeiten auf **`chatgpt/<thema>`** und öffnen einen **PR gegen `main`**.
  Sie pushen nie auf `main`, fassen `backup/*` nicht an und ändern `VERSION` nicht.
- Ihre Anleitung ist **`AGENTS.md`** im Wurzelverzeichnis (die Datei, die Codex von selbst
  liest). Sie verweist auf `CLAUDE.md`, sagt, welche Regeldatei vor welcher Änderung zu
  lesen ist, und nennt die harten Grenzen. Die README verweist an sie.
- **Claude prüft jeden solchen PR**: Diff gegen Pflichtenheft und Regelwerk,
  `build.mjs --check`, `pruefen.mjs`, Prüfstand. Erst danach stempelt Claude die Version
  und bringt die Änderung nach `main`.

## Begründung

Der Hook ist der eigentliche Schutz vor einem roten Push und fehlt einem fremden Agenten.
Der Lauf auf GitHub fängt Fehler erst nach dem Push ab, auf `main` also erst, wenn sie
schon live sind. Ein PR verlegt die Prüfung vor die Auslieferung. Die Version stempelt nur
einer, damit sich zwei Agenten nicht um `VERSION` streiten.

## Folgen

- Die Branch-Regel in `CLAUDE.md` hat eine Ausnahme für `chatgpt/*`.
- `AGENTS.md` muss mitgezogen werden, wenn sich eine harte Grenze oder die Lage der
  Regeldateien ändert.
- Die Ausnahme ist ein Test. Entfällt sie, werden `AGENTS.md`, der README-Abschnitt und
  dieser Eintrag abgelöst.
