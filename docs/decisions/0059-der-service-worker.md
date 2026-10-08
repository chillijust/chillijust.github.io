# 0059 · Der Service Worker — die zweite Datei

**Stand:** angenommen · 2026-08-14 · Etappe 8 der Umstellung
**Löst ab:** den offenen Punkt aus ADR 0001 («Service Worker und Manifest stehen im
Zielkonflikt mit der Ein-Datei-Vorgabe — bewusst unentschieden»)

## Ausgangslage

«Offline» hing am Browser-Cache. Das funktionierte, war aber eine **Hoffnung**: Safari darf
diesen Cache jederzeit wegräumen, und wer dann im Funkloch sitzt, sieht eine leere Seite.

Der zweite Punkt stand seit Monaten als Fallstrick in `CLAUDE.md`: *«Eine bestehende
Home-Bildschirm-Verknüpfung hält ihren eigenen Cache. Zeigt sie nach einem Deploy noch den
alten Stand: Verknüpfung löschen und neu anlegen.»* Ein Fehler, den der Nutzer ausbaden
musste.

## Entscheidung

**Es kommt ein Service Worker — und sonst nichts.** Aus einer Datei im Auslieferungspfad
werden zwei: `index.html` und `sw.js` (3,8 KB). ADR 0001 ist damit entschieden, aber nur
zur Hälfte: **Ein `manifest.json` kommt nicht.**

## Begründung

### Warum kein Manifest

Auf dem Zielgerät erledigen `apple-touch-icon` und `apple-mobile-web-app-capable` schon
alles, was ein Manifest täte. Es wäre eine dritte Datei für praktisch nichts — und sein
`icons`-Feld verträgt sich schlecht mit einem eingebetteten Bild: Das App-Symbol steckt als
Daten-URI im `<head>`, und ob Safari es aus einem Manifest heraus akzeptiert, ist nicht
zugesagt. Wo etwas nichts bringt und Unsicherheit kostet, bleibt es weg.

### Der Preis, den der Plan nicht genannt hatte

**Die Content-Security-Policy musste eine Tür öffnen.** Sie stand auf `default-src 'none'`
mit `script-src 'unsafe-inline'` — das erlaubt Inline-Code, aber **kein Laden einer
Skriptdatei**. `navigator.serviceWorker.register('./sw.js')` wäre vom Browser blockiert
worden. Neu ist darum genau eine Angabe: `worker-src 'self'`.

**`connect-src` bleibt weg**, und das ist die eigentliche Pointe: Die Seite selbst baut
weiterhin keine Verbindung auf. Sie meldet den Worker an, mehr nicht; dessen Anfragen
laufen in seinem eigenen Zusammenhang. Die Zusage «diese Seite sendet nichts» gilt
unverändert, und die Suite `tickets` prüft sie weiter wortgleich.

`pruefen.mjs` hält `sw.js` jetzt an dieselbe Leine wie `index.html`: keine Fremdadresse,
kein Nachladen über `importScripts`, kein Zugangsschlüssel — und zusätzlich, dass die CSP
nichts weiter aufmacht als diese eine Tür.

### Aus dem Speicher sofort, im Hintergrund nachsehen

Der Plan sah «Netz zuerst für die App-Datei» vor. Dagegen spricht eine Zahl: Die
ausgelieferte Datei ist **über 600 KB**. «Netz zuerst» hieße, bei jedem Start erst darauf
zu warten — im Funkloch bis zum Zeitablauf.

Die gewählte Regel: Die gespeicherte Fassung geht **sofort** raus, die Anfrage läuft
trotzdem und legt das Ergebnis für das nächste Mal ab. Die App startet augenblicklich und
offline zuverlässig. Dass eine neue Fassung da ist, meldet nicht dieser Weg, sondern der
wartende Worker.

**Der Cache trägt die Version im Namen** (`chillingo-2.4.0`). Ohne das legte ein neuer
Stand keinen neuen Speicher an, und der alte bliebe liegen — der klassische Fehler, bei dem
ein Service Worker für immer die alte Fassung ausliefert. `build.mjs` stempelt die Version
in `sw.js` wie in `index.html`, und `pruefen.mjs` bricht ab, wenn der Cache-Name sie nicht
mitführt.

### Kein skipWaiting — der Nutzer entscheidet

Der neue Worker **wartet**. Würde er sich beim Einrichten vordrängen, tauschte sich die App
unter der laufenden Sitzung aus. Stattdessen erscheint eine Zeile unter dem Kopf: «Eine
neue Fassung liegt bereit — jetzt laden». **Kein Blatt, kein Zwang**; sie liegt nicht über
der Seite, und wer sie wegtippt, sieht sie in dieser Sitzung nicht wieder.

### Der Notausgang ist Pflicht, nicht Beiwerk

Ein Service Worker, der sich verschluckt, ist auf einem Telefon kaum loszuwerden: keine
Entwicklerwerkzeuge, kein hartes Neuladen. Also gehört der Ausgang in die App —
«Speicher der App leeren» meldet den Worker ab, wirft die Caches weg und lädt neu. Er fragt
einmal nach. **Der Lernstand bleibt unberührt**: Der liegt im `localStorage`, und den fasst
`swAufraeumen()` nicht an.

### Was der Prüfstand nicht kann — und was er stattdessen tut

**Service Worker laufen nicht unter `file://`**, und der Prüfstand lädt genau so. Ob der
Worker wirklich offline trägt, zeigt nur das Gerät. Das ist eine echte Lücke, und sie steht
im Kopf der Suite `offline`, damit sie niemand für Deckung hält.

Geprüft wird alles andere, und das ist mehr, als es klingt: dass `sw.js` tut, was er tun
soll und nichts darüber hinaus (13 Prüfungen an der Datei selbst); dass die App **ohne**
Worker exakt so läuft wie vorher — jeder Aufruf in `try/catch`, jede Auskunft ehrlich; dass
der Hinweis sich zeigt, wegtippen lässt und sich nicht aufdrängt; dass der Notausgang
nachfragt.

## Zwei Fehler, die erst das Bildschirmfoto gezeigt hat

**1. `display: flex` sticht `[hidden]`.** Die Hinweisleiste stand *immer* da, obwohl das
Attribut gesetzt war und die Suite es bestätigte — sie prüfte das Attribut, nicht die
Sichtbarkeit. Jetzt steht `#swNeu[hidden] { display: none; }` im Stil, und die Suite fragt
`getComputedStyle`.

**2. Fünf Reiter passen nicht mehr.** Mit «App» ragte der letzte Reiter bei 430 px aus dem
Bild. Die Leiste ließ sich zwar schieben, aber ein Reiter, den man erst suchen muss, ist
keiner. Enger und eine Spur kleiner — und die Suite misst jetzt `scrollWidth` gegen
`clientWidth`.

Beides wäre ohne den Blick aufs Bild durchgegangen. Das ist das Argument für die
Augenprüfung, nicht gegen die Suite.

## Folgen

- Neue Datei `sw.js` im Auslieferungspfad. **Alles Inhaltliche bleibt in `index.html`** —
  der Worker kennt kein Wort Russisch.
- Die CSP trägt `worker-src 'self'`. Mehr nie; `pruefen.mjs` bricht ab, wenn eine
  Direktive eine Fremdadresse oder `*` zuließe.
- Fünfter Einstellungs-Reiter **«App»**: Offline bereit, Nach Aktualisierung suchen,
  Speicher leeren. **Kein einziger Schalter** — es gibt hier nichts einzustellen, nur
  nachzusehen.
- `swLeerenSicher` gehört als Ansichtszustand in `ansichtenZuruecksetzen()` (ADR 0017).
- Der Fallstrick «Verknüpfung löschen und neu anlegen» in `CLAUDE.md` ist erledigt.
- Neue Suite `offline` (28 Prüfungen im Browser, 13 an der Datei). Die Suite `jubel`
  musste lernen, eine Frage nach dem Buchstaben selbst zu erzwingen — die schärfenden
  Formen aus ADR 0058 haben auch Optionen, tragen ihre Lösung aber selbst.
