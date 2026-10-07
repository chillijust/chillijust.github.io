# Arbeitsanweisung

## Umgang mit mir

Antworte auf Deutsch, sprich mich mit „Sir" an, Sie-Form. Direkt und knapp, proaktiv
Vorschläge machen. Vor Force-Push, Löschen von Dateien und History-Rewrite meine
ausdrückliche Zustimmung einholen. Bei Zielkonflikten zwischen meinen Vorgaben: sag es
mir, statt still eine Seite zu wählen.

**Eine Sitzung trägt einen Vorgang.** Jeder Aufruf schickt die ganze bisherige Sitzung
noch einmal mit — ein abgeschlossener Vorgang, der im Kontext liegen bleibt, kostet
weiter und trägt nichts mehr bei (gemessen: von 84 000 auf 780 000 Tokens in einer
Sitzung, zwei Drittel der Kosten). Ist ein Ticketblock oder Bauabschnitt ausgeliefert und
der Lauf grün, sage ich **«Sir, hier wäre ein guter Schnitt»**. Ob `/clear` kommt,
entscheiden Sie.

**Die Übergabe kommt immer kopierfertig** — als Codeblock, den Sie ohne eine Änderung in
die neue Sitzung einsetzen können, nie als Fließtext zum Abschreiben. Sie trägt genau
fünf Zeilen und **nur die Lage**: Was das Projekt ist, steht in dieser Datei und wird
ohnehin geladen; es zu wiederholen kostet zweimal.

```
Chillinal, Branch main. Stand <sha>, Version <VERSION>.
Zuletzt: <was gerade fertig wurde, ein Satz>
Offen: <was als Nächstes ansteht — oder «nichts»>
Achtung: <nur was diese Lage betrifft — sonst Zeile weglassen>
Lies CLAUDE.md.
```

## Projekt

**Chillinal** (Chilli + Journal; sichtbar heißt die App **«Chilli Journal»**, unter dem Symbol
«Chilli» — ADR 0010) — Web-App zum An- und Abgewöhnen von Gewohnheiten, mit
Terminen, offline, Daten nur auf dem Gerät. Alles Inhaltliche steht in `index.html`;
daneben liegt ein Service Worker, der nichts anderes tut, als sie beiseitezulegen.
Gehostet über GitHub Pages unter https://chillijust.github.io/. Zielgerät: iPhone 15 Pro
Max (iOS 26.5.2), installiert über „Zum Home-Bildschirm" als PWA im Vollbild.

**Das Pflichtenheft ist `docs/chillinal-plan.md`.** Was dort steht, ist entschieden —
Ansichten, Stärke-Rechnung, Farben, Bauabschnitte. Wer davon abweicht, sagt es und hält
es in einem ADR fest.

Chillinal hat **Chillingo** (Russischlernen) auf `main` abgelöst (ADR 0001). Chillingo ruht
vollständig auf `backup/chillingo-2.11.2T-2026-10-04`, samt Sicherungscode des
Lernstands. Sein `localStorage` liegt auf dem Gerät weiter und wird nie angefaßt.

Start ist das **Dashboard**; alles Weitere öffnet der **runde Menüknopf** (drei Striche).
Eine Reiterleiste gibt es nicht — der Kopf trägt unterwegs den Rückweg. Maskottchen ist
die Chili.

| Bauabschnitt | Stand |
| --- | --- |
| 1 · Umbau, Gerüst, Kopf, Farben, Schriften, Symbol, `sw.js` | fertig (0.1.0) |
| 2 · Gewohnheiten: anlegen, Rhythmus, Abhaken, Stärke, nie zweimal; Kalender, Nachtragen, langer Druck | fertig (0.2.0) |
| 3 · Abgewöhnen, 10-Minuten-Welle; Chili und Kalender in einer Karte | fertig (0.3.0T2, frei mit 0.4.0) |
| 4 · Termine im Kalender, Tagesansicht; Tropfen statt Aufploppen, Tropfenform, Menü unter dem Knopf | fertig (0.4.0) |
| 5 · Kalender-Export (`.ics`), Erinnerung je Gewohnheit; «Heute» als Rückweg, Name «Chilli Journal», Schriftzug «Lodern» (frei); Exportiertes merken, Markierung aufheben, Hinweis aus Glas; nur Laden | fertig (0.5.0) |
| 6 · Rückblick: Heatmap, Detail, Journal; Wisch vom Rand, Lesen, Woche wählen, Bestätigung im Glas | fertig (0.7.0); alle Meldungen im Glas (0.7.1) |
| 7 · Sicherung (Code kopieren, Einlesen mit Rückgängig, Kachel nach 30 Tagen), Einstellungen (Hinweis ab 3, Bewegung, alles löschen), Tickets (Knopf unten rechts, Blatt als Tropfen); langer Druck tropft | fertig (0.8.0); Ticketblatt unten, «Alle Tickets» |
| 8 · Feinschliff: Leerzustände als Wegweiser, Jubel bei 50 %/90 %, «nie zweimal» und neuem Rekord, Ende der Welle, gelöschte Zeilen als Geist | fertig (0.9.0); Ticketblatt aus Glas, Kalendertag, «Hinzufügen» im Glas, KW-Linien, Wisch von rechts, Hell/Dunkel als Tropfen, Tickets im Blatt; 0.9.1T (kein Zoom beim Tippen, Woche tropft zur Seite, Ticketliste so hoch wie das Ticket); 0.10.0T (Auftritt beim Kaltstart, Woche ohne Überbreite); 0.10.0T2 (Hell/Dunkel-Tropfen löst sich immer) — abgenommen am 2026-10-07; 0.11.0T (Beginn zurückstellen, Export wählen, Zeichen bewegen sich, Geöffnetes tropft aus seinem Knopf, Woche \| Monat schaltet immer, Ticketblatt rollt innen) — Glastropfen und «Begonnen am» abgenommen; 0.11.0T2 (Hell/Dunkel weicher, mehrmals und aus den Einstellungen; «alle» tropft; Zeichen langsamer); 0.11.0T3 (der Tropfen folgt Knauf und Markierung, Zeichen einen Tick flotter); 0.12.0T (Timer und Zähler je Gewohnheit); 0.12.0T2 (Glas aus der Scheibe, Timer-Pause, Zähler in Schritten mit Einheit), Abnahme offen; 0.13.0T (Termine abhaken, Pause im Ring, Menüknopf tropft herab, Einträge nacheinander, Fenster wird Meldung, «Hinzufügen» aus dem Plus, Fragen im Glas) |

Im Menü stehen alle Einträge des Pflichtenhefts von Anfang an; was noch nicht gebaut ist,
trägt «bald» und meldet sich mit einer Zeile. **Wer einen Abschnitt baut, gibt dem
Eintrag sein `ziel`** — die Suite `menue` prüft, daß «bald» und Gebautes zusammenpassen.

## Wo die Regeln stehen

Diese Datei trägt nur, was **immer** gilt. Das Übrige liegt themenweise unter
`.claude/rules/` und wird automatisch geladen, sobald ich eine passende Datei anfasse:

| Datei | greift bei | Inhalt |
| --- | --- | --- |
| `.claude/rules/oberflaeche.md` | `index.html` | Farben, Darstellung, Schrift, Kopf, Menü, Chili, Bewegung, Speicher |
| `.claude/rules/logik.md` | `index.html` | Stärke, Serie, nie zweimal, Tage, Uhr |
| `.claude/rules/pruefstand.md` | `tools/pruefstand/**` | wie eine Suite entsteht und woran sie scheitert |
| `.claude/rules/docs.md` | `docs/**` | ADRs, Index |

Die Begründung hinter jeder Regel steht im jeweiligen ADR unter `docs/decisions/`
(Index: `docs/decisions/README.md`). Wer eine Regel ändert, ändert sie **dort**, wo sie
steht — nicht zusätzlich hier.

## Harte Rahmenbedingungen — nicht verhandelbar

- Kein React, kein JSX, kein Build-Schritt, keine npm-Toolchain im Auslieferungspfad.
- **Zwei Dateien, nicht mehr** (ADR 0001): `index.html` und `sw.js`. Alles Inhaltliche
  steht in der ersten. Die CSP trägt dafür genau eine Ausnahme, `worker-src 'self'` —
  **`connect-src` bleibt weg**, die Seite baut keine Verbindung auf. `pruefen.mjs` hält
  `sw.js` an dieselbe Leine. Ein `manifest.json` gibt es bewußt nicht.
- **Keine externen Ressourcen**: keine CDNs, keine Google Fonts, keine externen Bilder,
  keine API-Aufrufe. Schriften (Lora, Poppins) und Bilder stecken als Daten-URI in der
  Datei. Symbole als Inline-SVG über `ICON` — **keine Emoji-Zeichen**, iOS rendert sie als
  farbige Grafik. `tools/pruefen.mjs` bricht darüber ab. Die Content-Security-Policy im
  `<head>` macht die Regel erzwingbar; sie bleibt drin.
- **Erinnerungen nur über den Kalender-Export** (`.ics`, Abschnitt 5) — kein Server, keine
  Push-Nachrichten.
- **Die ausgelieferte Datei ist öffentlich lesbar.** Nie ein Token, ein Passwort oder einen
  Schlüssel hineinschreiben — auch nicht verschleiert, auch nicht «nur zum Testen».
  `pruefen.mjs` sucht nach tokenähnlichem Text und bricht bei **jeder** Fremdadresse ab.
- **Persistenz ausschließlich über `localStorage`**, Schlüssel `chillinal_v1`, jeder
  Zugriff in `try/catch`. **Chillingos Schlüssel kommt im Quelltext nicht vor, und
  `localStorage.clear()` gibt es nicht** — `pruefen.mjs` bricht über beides ab.
- **Mobile-first**: Touch-Ziele ≥ 44 × 44 px, keine Hover-abhängige Bedienung,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)` für Notch und
  Home-Indicator. **Eingabefelder mit Schrift ≥ 16 px** — darunter zoomt iOS beim Tippen
  heran (Suite `zoom`, ADR 0028).
- **Die App duzt.** Jeder Text, der den Nutzer anspricht, sagt «du». Die Suite `geruest`
  liest den gerenderten Text und schlägt bei «Sie»/«Ihnen» an.
- **Kein Name und kein Logo von Anthropic** — nur Farben und Typografie.
- Die App muß offline funktionieren, nachdem sie einmal geladen wurde.

## Verzeichnisse

```
index.html                die App — hier steht alles Inhaltliche
sw.js                     Service Worker: legt die App beiseite, mehr nicht
.nojekyll                 schaltet Jekyll ab, niemals löschen
VERSION                   die Version, einzige Stelle von Hand
tools/build.mjs           Schriften, Chili, Symbol einbetten; Version stempeln (--check = nur prüfen)
tools/pruefen.mjs         Vor-Push-Prüfung von index.html und sw.js
tools/appsymbol.mjs       App-Symbol als SVG zeichnen und zu PNG rendern (180, 1024)
tools/schriften/          Lora und Poppins, lateinische Teilmenge, woff2, samt OFL
tools/pruefstand/         Prüfstand: lauf.mjs, suiten/*.mjs, bild.mjs (siehe README dort)
.claude/rules/            Regeln nach Thema, geladen bei passender Datei
.claude/skills/           Abläufe für Claude: pruefstand, ticket
.claude/hooks/            vor-dem-push.mjs — hält den Push an, wenn etwas rot ist
docs/chillinal-plan.md    das Pflichtenheft
docs/stil-vorlage.md      der Stil zum Übertragen auf andere Apps (Farben, Schrift, Glas, Bewegung)
docs/maskottchen-freigestellt.png   die Chili (Quelle für App und Symbol)
docs/appsymbol-*.png      das App-Symbol; 180 ist bitgleich mit dem ausgelieferten
docs/                     Architektur, Deploy, Arbeitsweise
docs/decisions/           kurze ADRs, fortlaufend numeriert — README.md ist der Index
```

Vor inhaltlicher Arbeit lesen: `docs/architektur.md` (Zustand, Render-Zyklus),
`docs/deploy.md` (Pages, Cache, Version).

## Konventionen

- **Code-Stil in `index.html`:** ES5-nah — `var`, klassische `function`-Ausdrücke, keine
  Klassen, keine Module, kein `async`, `'use strict'` am Skriptanfang. Bewußt so; neue
  Abschnitte folgen demselben Stil. Zwei Leerzeichen Einrückung, einfache
  Anführungszeichen. Gliederung über Kommentarbalken.
- **Alle Ausgaben durch `esc()`**, Ereignisbehandler nach dem Setzen von `innerHTML`
  anhängen, nie als `onclick`-Attribut.
- **Eingebettetes setzt `tools/build.mjs`**, nie die Hand: der Schriftblock zwischen
  `SCHRIFTEN:START` und `SCHRIFTEN:ENDE`, `CHILI_BILD`, das `apple-touch-icon`. Wer das
  Symbol ändert, fährt erst `node tools/appsymbol.mjs`, dann `node tools/build.mjs`.
- **Die Version steht in `VERSION`**, sonst nirgends von Hand (siehe `docs/deploy.md`):
  erste Ziffer = gespeicherte Daten werden anders gelesen, zweite = etwas kommt dazu,
  dritte = alles Übrige. `tools/build.mjs` stempelt sie als `APP_VERSION` und
  `SW_VERSION`. **Ein angehängtes `T` heißt «noch nicht abgenommen»** (`0.1.0T`) — die
  Fassung wird ausgeliefert, damit sie am Gerät angesehen werden kann; fällt das T weg,
  ist sie freigegeben. Es gehört **in** die Zahl: Der Cache des Workers heißt nach der
  Version. **Aus demselben Grund darf das T zählen**: Wird an einer angesagten Fassung ein
  zweites Mal nachgebessert, heißt die nächste Ansicht `0.2.0T2`.
- **`APP_STAND` setzt `tools/build.mjs`**, nicht die Hand. `--check` vergleicht ohne ihn.
- **Commits:** einer je logischer Änderung, Nachricht auf Deutsch, Betreffzeile im
  Imperativ. Im Rumpf steht, *warum*.
- **Branches:** Gearbeitet und gepusht wird **immer auf `main`** — ein Branch ist nur
  Backup, nie das Ziel. Schreibt eine Umgebung von sich aus einen anderen Arbeits-Branch
  vor, gilt das nicht: dort committen, dann auf `main` bringen (Fast-Forward reicht meist)
  und dorthin pushen. Landet trotzdem etwas auf einem anderen Branch — eigenes Vertun oder
  eine fremde Sitzung —, wird es bei der nächsten Gelegenheit nach `main` nachgeholt, nicht
  stehengelassen. Neue Branches nur auf meine ausdrückliche Ansage. **`backup/*` wird nie
  verändert.**

## Prüfstand und Push

Die App wird am **echten DOM** geprüft: Die ausgelieferte Datei bekommt ein Skript
angehängt, ein kopfloser Browser lädt sie, das Skript prüft und schreibt sein Urteil in
den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs                 # alle Suiten — grün schweigt, rot redet
node tools/pruefstand/lauf.mjs thema menue     # nur diese
node tools/pruefstand/lauf.mjs -v              # auch jede grüne Suite nennen
node tools/pruefstand/bild.mjs                 # Bildschirmfotos, hell und dunkel
```

**Der Push ist abgesichert.** `.claude/hooks/vor-dem-push.mjs` fährt vor jedem `git push`
`build.mjs --check`, `pruefen.mjs` und den Prüfstand und hält an, wenn etwas rot ist.
Notausgang, wenn es wirklich raus muß: `PRUEFSTAND=aus` vor den Befehl. Ein GitHub-Lauf
(`.github/workflows/pruefstand.yml`) prüft dasselbe noch einmal unabhängig.

**Wer `index.html` anfaßt, sichert die Änderung mit einer Prüfung ab** — der Prüfstand ist
das Gedächtnis für jeden Fehler, der schon einmal da war. Wie eine Suite entsteht: Skill
`pruefstand` und `tools/pruefstand/README.md`.

**`index.html` nicht in großen Blöcken lesen.** Sie wächst mit jedem Abschnitt — mit
`grep -n` und engem Kontext suchen. Die eingebetteten Daten-URIs sind je eine einzige,
sehr lange Zeile; `cut -c1-200` hält sie aus dem Kontext.

**Für einen ganzen Vorgang** — vom gemeldeten Befund bis zur Auslieferung — gibt es den
Skill `ticket`.

## Bekannte Fallstricke

- **Jekyll.** Ohne `.nojekyll` rendert Pages Markdown und packt alles in ein
  Theme-Layout. Datei nie löschen. Kein YAML-Front-Matter in `index.html`.
- **Fehlendes DOCTYPE.** Ohne `<!DOCTYPE html>` in Zeile 1 rendert Safari im
  Quirks-Mode; Flexbox und Viewport verhalten sich anders.
- **iOS-Quick-Look** (Vorschau aus Dateien/Mail) zeigt HTML anders als Safari und
  speichert nichts dauerhaft. Testen immer in Safari oder in der
  Home-Bildschirm-Verknüpfung.
- **`localStorage`** wirft im privaten Modus und bei vollem Kontingent. Jeder Zugriff in
  `try/catch`; schlägt das Schreiben fehl, sagt die App es. Schemawechsel nur mit neuem
  Schlüssel und Migration; neue Felder bekommen ihren Vorgabewert in `grundStand()`.
- **Die Tagesgrenze ist lokale Mitternacht.** Eine offene App merkt den Tageswechsel nur,
  wenn sie danach zeichnet — `visibilitychange` zeichnet den Kopf neu.
- **Der Service Worker liefert, was er gespeichert hat** — aus dem Speicher sofort, im
  Hintergrund nachsehen. Der Cache heißt nach der Version; wer den Namen entkoppelt,
  liefert für immer den alten Stand aus. **Kein `skipWaiting` beim Einrichten:** Der neue
  Worker wartet auf «Jetzt laden» oder den Knopf in den Einstellungen. Die Nachrichten
  `version` und `uebernehmen` bleiben, wie sie sind — sie sind Chillingos Wortschatz, und
  nur über ihn kam Chillinal aufs Gerät. Klemmt etwas, gibt es den Notausgang
  «App neu einrichten» in den Einstellungen; er läßt die Daten unberührt. **Ohne Netz
  kommt kein Urteil:** «Nach Aktualisierung suchen» meldet dann «Kein Netz», nicht
  «Aktuell». **`update()` ist fertig, bevor die neue Fassung wartet.**
- **Die Statusleiste** steht auf `black-translucent`, ihre Grundfarbe setzt `theme-color`
  je nach Darstellung. Wie iOS die Schrift darin bei hellem Grund färbt, zeigt nur das Gerät.
- **Das App-Symbol läßt sich zur Laufzeit nicht wechseln.** iOS liest `apple-touch-icon`
  einmal, beim Anlegen der Verknüpfung — wer Chillingos Verknüpfung behält, behält dessen
  Symbol, bis er sie neu anlegt.

## Offen

- Abnahme von 0.11.0T3 (ADR 0036, 0037) am Gerät — ob der Tropfen dem Knauf und der Markierung
  sichtbar folgt (im Kopf und in den Einstellungen, auch mehrmals hintereinander), Tempo der
  Zeichen, «alle» im Export.
- Abnahme von 0.12.0T2 (ADR 0038, 0040) am Gerät — Timer klein aus der Scheibe, Pause, Gong (auch
  mit Stummschalter), Zähler in Schritten mit Einheit.
- Abnahme von 0.13.0T (ADR 0041) am Gerät — Termin-Haken, Pause im Ring, Menü nach dem Hinunterrollen,
  Einträge nacheinander, Fenster wird Meldung (Ticket, Journal, Formulare), «Kopiert» tropft,
  «Hinzufügen» klein aus dem Plus, «Löschen?» im Glas.
