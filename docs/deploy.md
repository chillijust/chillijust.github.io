# Deployment

GitHub Pages liefert dieses Repository unter https://chillijust.github.io/ aus. Bei einem
Benutzer-Repository (`<name>.github.io`) ist die Quelle standardmäßig der Branch `main`,
Verzeichnis `/` — ein Push genügt, es gibt keine Pipeline.

## Warum `.nojekyll`

Ohne diese Datei schickt Pages jeden Push durch Jekyll. Jekyll rendert dann Markdown,
verpackt das Ergebnis in ein Theme-Layout und interpretiert `{{ … }}` und `{% … %}` in
den Dateien. Genau das war der ursprüngliche Fehlerzustand: Die App lag in `README.md`,
Jekyll machte daraus eine Themenseite mit dem Benutzernamen als Überschrift und dem
HTML-Quelltext als sichtbarem Absatz.

`.nojekyll` ist leer und schaltet die Verarbeitung ab; Pages kopiert die Dateien dann
unverändert. **Die Datei darf nie gelöscht werden** — auch nicht „aufräumenderweise",
weil sie leer aussieht.

Zweiter Grund für dieselbe Klasse von Fehlern: YAML-Front-Matter. Beginnt eine Datei mit
`---`, behandelt Jekyll sie als Template. In `index.html` darf am Anfang nur
`<!DOCTYPE html>` stehen. `tools/pruefen.mjs` prüft beides.

## Ablauf für eine Änderung

```sh
node tools/build.mjs --check     # /data und index.html sind synchron
node tools/pruefen.mjs           # DOCTYPE, Front-Matter, externe Ressourcen, JS-Syntax
python3 -m http.server 8000      # lokal ansehen
git push origin main
```

Nach dem Push dauert es typischerweise ein bis drei Minuten, bis die Seite neu gebaut
ist. Den Status zeigt der Reiter **Actions** („pages build and deployment") oder
**Settings → Pages**.

## Nach dem Deploy prüfen

1. https://chillijust.github.io/ **hart neu laden** (Safari: Verlauf und Websitedaten für
   die Seite löschen, oder in einem privaten Tab öffnen). Pages liefert mit
   `Cache-Control: max-age=600`, ein normales Neuladen zeigt also bis zu zehn Minuten
   lang den alten Stand.
2. Erwartet: die App erscheint sofort — kein Benutzername als Überschrift, kein
   sichtbarer HTML-Text, keine Theme-Leiste.
3. Auf dem iPhone: Eine bereits abgelegte Home-Bildschirm-Verknüpfung hält ihren eigenen
   Cache. Zeigt sie noch die alte Seite, die Verknüpfung löschen und neu anlegen. Der
   Lernstand bleibt dabei erhalten, weil er am Ursprung (`chillijust.github.io`) hängt
   und nicht an der Verknüpfung — sicherheitshalber vorher trotzdem den Sicherungscode
   aus der Bilanz notieren.

## Einstellungen, die niemand aus dem Repository heraus sieht

Publishing-Quelle und ein eventuell in der Oberfläche gesetztes Theme stehen in den
Repository-Einstellungen, nicht in einer Datei. Wenn die Seite unerwartet wieder wie eine
gerenderte Markdown-Seite aussieht, dort zuerst nachsehen:
**Settings → Pages → Build and deployment**. Erwartet: Source „Deploy from a branch",
Branch `main`, Ordner `/ (root)`.
