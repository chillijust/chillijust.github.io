# 0002 · Lerninhalte in `/data`, eingebettet durch `tools/build.mjs`

**Status:** angenommen · 2026-08-01

## Kontext

Vokabeln, Sätze und Sprachfakten wachsen stark, der Code kaum. Lagen beide im selben
`<script>`-Block, war jede Inhaltsänderung ein Diff mitten in der Programmdatei, und
Dubletten oder falsch geformte Einträge fielen erst im Betrieb auf. Die
Ein-Datei-Auslieferung (ADR 0001) steht aber nicht zur Disposition.

## Entscheidung

Die Inhalte liegen als JSON in `/data`. `tools/build.mjs` prüft sie und schreibt sie
zwischen zwei Markerzeilen in `index.html`:

```
/* == DATEN:START — generiert aus /data durch tools/build.mjs, nicht von Hand ändern == */
/* == DATEN:ENDE == */
```

`index.html` bleibt vollständig committet und ausgeliefert. Der Build läuft nur lokal
und ist ein Autorenwerkzeug, kein Deploy-Schritt.

## Verworfene Alternativen

- **Inhalte per `fetch` aus JSON laden:** bricht Offline-Betrieb und die
  Ein-Datei-Vorgabe, scheitert zudem über `file://` an CORS.
- **Build in einer GitHub Action:** macht den Auslieferungsstand von einer Pipeline
  abhängig. Fällt die Action aus oder ändert sich ihre Umgebung, ist die Seite kaputt —
  genau die Abhängigkeit, die ADR 0001 vermeidet.
- **Alles von Hand in `index.html`:** der Ausgangszustand. Keine Validierung, keine
  Dublettenprüfung, unübersichtliche Diffs.

## Folgen

- Zwei Quellen können auseinanderlaufen. Dagegen `node tools/build.mjs --check`
  (Exit-Code 1 bei Abweichung) vor jedem Push.
- Der generierte Block ist deterministisch formatiert, ein Eintrag je Zeile: eine neue
  Vokabel ist genau eine hinzugefügte Zeile im Diff.
- Wer Inhalte ändert, braucht Node. Für reine Code-Änderungen gilt das nicht.
