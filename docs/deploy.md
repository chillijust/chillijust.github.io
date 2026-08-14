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
3. Auf dem iPhone: **Seit 2.4.0 erledigt das der Service Worker** (ADR 0059). Die
   abgelegte App startet aus ihrem eigenen Speicher, sieht im Hintergrund nach und meldet
   sich mit «Eine neue Fassung liegt bereit — jetzt laden». Wer nicht warten will, findet
   unter **Einstellungen → App** den Knopf «Nachsehen». Er sagt danach, woran er war:
   «Aktuell», «Neue Fassung bereit» oder — wenn die Anfrage gar nicht durchkam —
   «Kein Netz». Bis 2.4.0 meldete er auch im Funkloch «Aktuell» und behauptete damit
   etwas über einen Stand, den er nie gesehen hatte.

   Der frühere Rat — Verknüpfung löschen und neu anlegen — ist damit hinfällig. Klemmt
   trotzdem etwas, steht am selben Ort der Notausgang «Speicher der App leeren»: Er meldet
   den Worker ab und lädt neu. Der Lernstand bleibt dabei unberührt, er hängt am Ursprung
   (`chillijust.github.io`) und nicht am Worker — sicherheitshalber vorher trotzdem den
   Sicherungscode aus der Bilanz notieren.
4. **Zwei Dateien gehören zum Stand**, `index.html` und `sw.js`. Beide werden von
   `build.mjs` mit derselben Version gestempelt; steht in `sw.js` eine andere, legt ein
   neuer Stand keinen neuen Speicher an und kommt beim Nutzer nie an. `pruefen.mjs`
   bricht darüber ab.

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

## Version

Drei Zahlen in der Datei `VERSION` im Wurzelverzeichnis — die **einzige** Stelle, an der
sie von Hand steht. `tools/build.mjs` stempelt sie als `APP_VERSION` nach `index.html`,
wie es den Stand als `APP_STAND` stempelt. Von dort geht sie in jedes Ticket und steht
unten in den Einstellungen.

| Ziffer | wird größer, wenn … | Beispiel |
| --- | --- | --- |
| **erste** | sich etwas Grundlegendes ändert: der Lernstand, das Format des Sicherungscodes, der Aufbau des Lernwegs. Kurz: wenn ein Stand von vorher **anders gelesen** wird. | 1.x.x → 2.0.0 |
| **zweite** | etwas **dazukommt**: eine Übung, ein Grammatikbaustein, neue Vokabeln, ein neues Farbschema. | 1.2.0 → 1.3.0 |
| **dritte** | alles Übrige: Oberfläche, Texte, Fehlerbehebungen. | 1.3.0 → 1.3.1 |

Die dritte Ziffer ist bewusst weiter gefasst als «Oberfläche»: Sonst hätte eine reine
Fehlerbehebung keinen Platz, und die kommt häufiger vor als eine neue Übung.

**Version und Stand sind zwei Dinge.** Die Version sagt, welche Fassung gemeint ist, der
Stand, von wann sie war. Im Ticket stehen beide: `App-Stand: 1.0.0 · 2026-08-09`. Tickets
von vor der Zählung führen nur den Stand.

**Der Sicherungscode hat seine eigene Zählung** (`CHG2`) und hat mit der Version nichts zu
tun. Sie darf sich zehnmal ändern, ohne dass ein Code veraltet — und wenn sich das Format
doch ändert, ist das genau der Fall, in dem die erste Ziffer steigt.

### Eine Version festhalten

Jede gezählte Fassung bekommt einen **Zweig** `version/X.Y.Z`, der auf den Commit zeigt,
mit dem `VERSION` auf diese Zahl gesetzt wurde:

```sh
git branch version/1.0.0 <commit>
git push -u origin version/1.0.0
```

**Warum ein Zweig und kein Tag.** Ein Tag wäre das richtige Werkzeug — die
Arbeitsumgebung darf aber nur `refs/heads/*` schreiben; ein `git push origin v1.0.0`
endet dort mit `HTTP 403`. Der Zweig leistet dasselbe: Er hält den Commit fest, taucht
in der Zweigliste auf und lässt sich jederzeit auschecken. Dieselbe Bauart tragen die
Momentaufnahmen unter `backup/`.

Von Hand — auf einem Rechner mit vollen Rechten — geht der Tag natürlich weiterhin:

```sh
git tag -a v1.0.0 <commit> -m "Chillingo 1.0.0"
git push origin v1.0.0
```
