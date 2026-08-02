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

## Eigene Domain (geplant: chillingo.…)

Custom Domains gibt es auch im kostenlosen Tarif, solange das Repository öffentlich ist.
Der Ablauf, **bevor** etwas im Repository passiert:

1. **Domain kaufen** (beliebiger Anbieter). Erst danach lassen sich die Einträge setzen.
2. **DNS beim Anbieter setzen** — je nachdem, welche Form die Adresse haben soll:
   - `www.chillingo.de` → ein **CNAME**-Eintrag `www` mit dem Ziel `chillijust.github.io`
     (mit Punkt am Ende, falls der Anbieter das verlangt).
   - `chillingo.de` ohne „www" (Apex) → vier **A**-Einträge auf
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     und, wenn IPv6 unterstützt wird, vier **AAAA**-Einträge auf
     `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
     `2606:50c0:8003::153`. Manche Anbieter bieten stattdessen ALIAS/ANAME auf
     `chillijust.github.io` an — das ist die bequemere Variante.
   - **Die Adressen vor dem Eintragen in der GitHub-Dokumentation gegenprüfen**
     (`docs.github.com/de/pages` → „Apex-Domain konfigurieren"); GitHub hat sie in der
     Vergangenheit geändert.
3. **In GitHub eintragen:** Settings → Pages → Custom domain → Domain eintragen und
   speichern. GitHub legt dabei selbst eine Datei `CNAME` im Repository an — die gehört
   dorthin und darf nicht gelöscht werden.
4. **Warten**, bis die DNS-Prüfung durchläuft (Minuten bis Stunden), dann **Enforce
   HTTPS** aktivieren. Das Zertifikat stellt GitHub kostenlos aus; es kann bis zu 24
   Stunden dauern, bis der Haken setzbar ist.
5. Optional, aber sinnvoll: die Domain unter Settings → Pages → „Verify domain"
   bestätigen, damit sie niemand anderes für seine Seite beanspruchen kann.

**Wichtig für den Lernstand:** Der Fortschritt liegt im `localStorage` und hängt am
Ursprung der Seite. Unter einer neuen Domain ist die App zunächst leer. Vor dem Umzug
den Sicherungscode aus der Bilanz kopieren und auf der neuen Adresse wieder einspielen —
und die Home-Bildschirm-Verknüpfung neu anlegen.

Die alte Adresse `chillijust.github.io` leitet nach dem Eintragen automatisch auf die
neue Domain um.

## Einstellungen, die niemand aus dem Repository heraus sieht

Publishing-Quelle und ein eventuell in der Oberfläche gesetztes Theme stehen in den
Repository-Einstellungen, nicht in einer Datei. Wenn die Seite unerwartet wieder wie eine
gerenderte Markdown-Seite aussieht, dort zuerst nachsehen:
**Settings → Pages → Build and deployment**. Erwartet: Source „Deploy from a branch",
Branch `main`, Ordner `/ (root)`.
