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
node tools/build.mjs             # Schriften, Chili, Symbol einbetten; Version stempeln
node tools/pruefen.mjs           # DOCTYPE, Front-Matter, Fremdadressen, CSP, JS-Syntax
node tools/pruefstand/lauf.mjs   # Prüfstand
python3 -m http.server 8000      # lokal ansehen (der Worker braucht http, nicht file://)
git push origin main
```

Nach dem Push dauert es typischerweise ein bis drei Minuten, bis die Seite neu gebaut
ist. Den Status zeigt der Reiter **Actions** („pages build and deployment") oder
**Settings → Pages**.

## Nach dem Deploy prüfen

1. Pages liefert mit `Cache-Control: max-age=600`; ein normales Neuladen im Browser zeigt
   bis zu zehn Minuten lang den alten Stand.
2. **Auf dem iPhone erledigt das der Service Worker.** Die abgelegte App startet aus ihrem
   eigenen Speicher, sieht im Hintergrund nach und meldet sich mit «Eine neue Fassung ist
   da · Jetzt laden». Wer nicht warten will: **Menü → Einstellungen → Nach Aktualisierung
   suchen**. Der Knopf sagt danach, woran er war: «Aktuell», «Kein Netz» oder «Neue
   Fassung laden».
3. Klemmt etwas, steht am selben Ort der Notausgang **«App neu einrichten»**: Er meldet den
   Worker ab, leert dessen Speicher und lädt neu. Die Daten im `localStorage` bleiben.
4. **Zwei Dateien gehören zum Stand**, `index.html` und `sw.js`. Beide werden von
   `build.mjs` mit derselben Version gestempelt; steht in `sw.js` eine andere, legt ein
   neuer Stand keinen neuen Speicher an und kommt beim Nutzer nie an. `pruefen.mjs` und die
   Suite `offline` brechen darüber ab.

## Der Übergang von Chillingo (einmalig, 0.1.0T)

Auf dem Gerät läuft Chillingos Worker. Er findet beim Nachsehen ein neues `sw.js`, das neue
wartet, und Chillingo zeigt seinen Hinweis. Ein Tipp auf «Jetzt laden» schickt
`uebernehmen` — **dasselbe Wort, das Chillinals Worker versteht** —, der neue Worker
übernimmt, räumt Chillingos Cache ab, und die Seite lädt als Chillinal neu.

- **Name und Symbol der Verknüpfung** bleiben «Chillingo» mit der alten Chili, bis die
  Verknüpfung neu angelegt wird. iOS liest beides nur beim Anlegen.
- **Vorsicht beim Neuanlegen:** Eine Home-Bildschirm-App hat auf iOS ihren eigenen
  Speicher. Wird die alte Verknüpfung gelöscht, geht Chillingos Lernstand auf dem Gerät mit
  — und, sobald es welche gibt, Chillinals Daten. Der Chillingo-Stand liegt als
  Sicherungscode auf `backup/chillingo-2.11.2T-2026-10-04` (`docs/ChilliSicherung`).
  Am billigsten ist das Neuanlegen, solange Chillinal noch leer ist.

## Einstellungen, die niemand aus dem Repository heraus sieht

Publishing-Quelle und ein eventuell in der Oberfläche gesetztes Theme stehen in den
Repository-Einstellungen, nicht in einer Datei. Wenn die Seite unerwartet wieder wie eine
gerenderte Markdown-Seite aussieht, dort zuerst nachsehen:
**Settings → Pages → Build and deployment**. Erwartet: Source „Deploy from a branch",
Branch `main`, Ordner `/ (root)`.

## Version

Drei Zahlen in der Datei `VERSION` im Wurzelverzeichnis — die **einzige** Stelle, an der
sie von Hand steht. **Dahinter darf ein `T` stehen** (`0.1.0T`): Die Fassung ist
ausgeliefert, damit sie am Gerät angesehen werden kann, aber noch nicht abgenommen. Ist
sie es, fällt das T weg und die Zahl bleibt. Das T gehört **in** die Version, nicht
daneben — der Cache des Workers heißt nach ihr, und «0.1.0T» und «0.1.0» müssen zwei
Stände sein, sonst käme die abgenommene Fassung nie beim Gerät an. `tools/build.mjs` stempelt sie als `APP_VERSION` nach `index.html` und als `SW_VERSION`
nach `sw.js`, wie es den Stand als `APP_STAND` stempelt. Sie steht in den Einstellungen
und geht in jedes Ticket.

| Ziffer | wird größer, wenn … | Beispiel |
| --- | --- | --- |
| **erste** | gespeicherte Daten oder der Sicherungscode **anders gelesen** werden müssen | 0.x.x → 1.0.0 |
| **zweite** | etwas **dazukommt**: ein Bauabschnitt, eine Ansicht, eine Funktion | 0.1.0 → 0.2.0 |
| **dritte** | alles Übrige: Oberfläche, Texte, Fehlerbehebungen | 0.2.0 → 0.2.1 |

Chillinal beginnt bei **0.1.0T**. Die erste Ziffer bleibt 0, bis alle acht Bauabschnitte
stehen; die Abnahme danach heißt 1.0.0.

**Version und Stand sind zwei Dinge.** Die Version sagt, welche Fassung gemeint ist, der
Stand, von wann sie war. Im Ticket stehen beide: `App-Stand: 0.2.0 · 2026-10-11`.

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
git tag -a v1.0.0 <commit> -m "Chillinal 1.0.0"
git push origin v1.0.0
```
