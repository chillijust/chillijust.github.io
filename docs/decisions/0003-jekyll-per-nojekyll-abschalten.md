# 0003 · Jekyll per `.nojekyll` abschalten statt per `_config.yml` zu zähmen

**Status:** angenommen · 2026-08-01

## Kontext

Die veröffentlichte Seite zeigte den Benutzernamen als Überschrift und darunter
`<!DOCTYPE html>` als sichtbaren Text. Ursache: Die App lag in `README.md`; GitHub Pages
schickte sie durch Jekyll, das Markdown rendert und das Ergebnis in ein Theme-Layout
verpackt. Ein früherer Versuch, das zu beheben, entfernte die DOCTYPE-Zeile — das war das
Symptom, nicht die Ursache, und hätte Safari zusätzlich in den Quirks-Mode geschickt.

## Entscheidung

1. Der Trainer liegt als `index.html` im Repository-Root; `README.md` ist wieder
   Dokumentation für Menschen.
2. Eine leere `.nojekyll` im Root schaltet die Jekyll-Verarbeitung ganz ab.
3. `<!DOCTYPE html>` steht wieder in Zeile 1.
4. Kein `_config.yml` — es gibt nichts zu konfigurieren, wenn nichts läuft.

## Begründung

`.nojekyll` beseitigt eine ganze Fehlerklasse statt eines Einzelfalls: kein
Theme-Layout, keine Liquid-Auswertung von `{{ … }}` oder `{% … %}` im Quelltext, keine
Sonderbehandlung von Dateien und Ordnern mit führendem Unterstrich. Mit einem
`_config.yml` bliebe Jekyll im Pfad und damit jede dieser Fallen offen.

## Folgen

- `.nojekyll` darf nie gelöscht werden; `tools/pruefen.mjs` bricht ab, wenn sie fehlt.
- Markdown im Repository wird nicht mehr zu Seiten gerendert. Das ist gewollt — `/docs`
  ist zum Lesen im Editor und auf GitHub da, nicht zum Veröffentlichen.
- Die Publishing-Quelle selbst steht in den Repository-Einstellungen, nicht im
  Repository. Bleibt eine Änderung unerwartet aus, dort zuerst nachsehen (siehe
  `docs/deploy.md`).
