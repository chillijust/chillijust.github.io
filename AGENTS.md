# Für James (ChatGPT) und andere Agenten

Du arbeitest an **Chillinal** («Chilli Journal»): eine Web-App zum An- und Abgewöhnen von
Gewohnheiten, offline, Daten nur auf dem Gerät, live unter https://chillijust.github.io/.

**Namen:** Hier heißt ChatGPT **James**, Claude (Claude Code) heißt **Jarvis**. So
schreibst du sie in Nachrichten, PRs und Commits. Hauptsächlich arbeitet Jarvis. Was du
machst, prüft Jarvis, bevor es live geht.

## So arbeitest du hier: auf einem Branch, mit PR

- **Arbeite nur auf einem eigenen Branch `chatgpt/<thema>`**, abgezweigt vom aktuellen
  `main`. Öffne für jede Änderung einen **Pull Request gegen `main`**.
- **Push nie auf `main`.** GitHub Pages liefert `main` sofort aus, und jeder Push dorthin
  ist sofort live. Den Merge macht Jarvis nach der Prüfung.
- **`backup/*` und fremde Branches fasst du nie an.** Kein Force-Push, kein
  History-Rewrite, kein Löschen von Branches.
- **`VERSION` änderst du nicht.** Die Version stempelt Jarvis beim Übernehmen
  (`T`-Schema, siehe `.claude/rules/auslieferung.md`).
- Ein PR enthält eine logische Änderung. Commits auf Deutsch, Betreff im Imperativ, im
  Rumpf das *Warum*.
- **Jeder Commit endet mit der Zeile `Agent: James`.** Deine Commits laufen unter dem
  Git-Namen des Nutzers; nur diese Zeile zeigt im Log, dass sie von dir stammen.

## Nachrichten: Branch `chatgpt/kommunikation`

Befunde, Fragen und Antworten zwischen dem Nutzer, Jarvis und dir stehen im Ordner
`kommunikation/`, und zwar **nur auf dem Branch `chatgpt/kommunikation`**. Auf `main` hat
der Ordner nichts zu suchen.

- Lies dort vor jeder Arbeit den Index `kommunikation/README.md` und die offenen
  Nachrichten an dich.
- Eine Nachricht committest und pushst du direkt auf `chatgpt/kommunikation`, ohne PR,
  und nur im Ordner `kommunikation/`.
- **Diesen Branch nie mit `main` zusammenführen**, in keine Richtung, und nie als PR gegen
  `main` öffnen. Deine Arbeitsbranches zweigen von `main` ab und enthalten keine
  Nachrichten.
- Beschlossen ist erst, was im Pflichtenheft oder in einem ADR steht.

## Das Regelwerk gilt auch für dich

Lies **`CLAUDE.md`**, bevor du etwas änderst. Es gilt vollständig, mit drei Ausnahmen,
die nur Jarvis betreffen: die Anrede und die Übergabe im Abschnitt «Umgang mit mir», die
Branch-Regel «immer auf `main`» (für dich gilt der Abschnitt oben) und der Push-Hook unter
`.claude/hooks/`, der bei dir nicht läuft.

Bei Jarvis laden die Regeldateien automatisch. **Du musst sie selbst lesen**, bevor du
eine passende Datei änderst:

| Du änderst | Lies vorher |
| --- | --- |
| `index.html` | `.claude/rules/oberflaeche.md`, `.claude/rules/logik.md` |
| `sw.js`, `tools/build.mjs` | `.claude/rules/auslieferung.md` |
| `tools/pruefstand/**` | `.claude/rules/pruefstand.md`, `tools/pruefstand/README.md` |
| `docs/**` | `.claude/rules/docs.md` |

Die Arbeitsabläufe stehen als Anleitungen in `.claude/skills/ticket/SKILL.md` (ein Fehler
oder Wunsch vom Befund bis zum PR) und `.claude/skills/pruefstand/SKILL.md` (eine Änderung
mit einer Prüfung absichern).

## Die harten Grenzen

Das Pflichtenheft ist `docs/chillinal-plan.md`. Wer davon abweicht, sagt es im PR.

- Ausgeliefert werden **zwei Dateien**: `index.html` und `sw.js`. Kein Framework, kein
  npm, kein Build-Schritt beim Ausliefern, kein `manifest.json`.
- **Nichts von außen**: keine CDNs, Fonts, Bilder, API-Aufrufe, Fremdadressen. Die CSP im
  `<head>` bleibt, wie sie ist.
- **Keine Emoji**, auch nicht in Texten der App. Symbole als Inline-SVG über `ICON`.
- **Nie ein Token, Passwort oder Schlüssel** in einer Datei. Das Repository ist öffentlich.
- Speicher nur `localStorage`, Schlüssel `chillinal_v1`, jeder Zugriff in `try/catch`.
- Eingebettetes (Schriften, Chili, Symbol) setzt `tools/build.mjs`, nie die Hand.
- `index.html` ist fast 500 KB groß. Lies sie nie am Stück, sondern suche mit `grep -n`.
  Daten-URIs stehen je auf einer sehr langen Zeile.

## Bevor du den PR öffnest

```sh
node tools/build.mjs --check      # Eingebettetes und Version auf Stand
node tools/pruefen.mjs            # DOCTYPE, Fremdadressen, CSP, Emoji, Syntax
node tools/pruefstand/lauf.mjs    # Prüfstand am echten DOM (braucht Chromium)
```

Alle drei müssen grün sein. GitHub fährt dieselben Schritte noch einmal
(`.github/workflows/pruefstand.yml`). **Wer `index.html` ändert, sichert die Änderung
mit einer Prüfung** unter `tools/pruefstand/suiten/` ab.

Schreib in den PR, **was** sich ändert, **warum**, und **welche Suite** es absichert.
Kannst du den Prüfstand nicht fahren, schreib das ausdrücklich in den PR.
