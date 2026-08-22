# Arbeitsanweisung

## Umgang mit mir

Antworte auf Deutsch, sprich mich mit „Sir" an, Sie-Form. Direkt und knapp, proaktiv
Vorschläge machen. Vor Force-Push, Löschen von Dateien und History-Rewrite meine
ausdrückliche Zustimmung einholen. Bei Zielkonflikten zwischen meinen Vorgaben: sag es
mir, statt still eine Seite zu wählen.

**Eine Sitzung trägt einen Vorgang.** Jeder Aufruf schickt die ganze bisherige Sitzung
noch einmal mit — ein abgeschlossener Vorgang, der im Kontext liegen bleibt, kostet
weiter und trägt nichts mehr bei (gemessen: von 84 000 auf 780 000 Tokens in einer
Sitzung, zwei Drittel der Kosten). Ist ein Ticketblock ausgeliefert und der Lauf grün,
sage ich **«Sir, hier wäre ein guter Schnitt»**. Ob `/clear` kommt, entscheiden Sie.

**Die Übergabe kommt immer kopierfertig** — als Codeblock, den Sie ohne eine Änderung in
die neue Sitzung einsetzen können, nie als Fließtext zum Abschreiben. Sie trägt genau
fünf Zeilen und **nur die Lage**: Was das Projekt ist, steht in dieser Datei und wird
ohnehin geladen; es zu wiederholen kostet zweimal.

```
Chillingo, Branch main. Stand <sha>, Version <VERSION>.
Zuletzt: <was gerade fertig wurde, ein Satz>
Offen: <was als Nächstes ansteht — oder «nichts»>
Achtung: <nur was diese Lage betrifft — sonst Zeile weglassen>
Lies CLAUDE.md.
```

## Projekt

**Chillingo** — Web-App zum Russischlernen (Kyrillisch lesen, schreiben, übersetzen).
Alles Inhaltliche steht in `index.html`; daneben liegt ein Service Worker, der nichts
anderes tut, als sie beiseitezulegen (ADR 0059). Gehostet über GitHub Pages unter
https://chillijust.github.io/. Zielgerät: iPhone 15 Pro Max (iOS 26.5.2), installiert
über „Zum Home-Bildschirm" als PWA im Vollbild.

Einstieg ist **Home**: Empfehlung plus eine Kachel je Übung. Der Begriff ist **Übung**,
nicht «Rubrik». **Die Reihenfolge ist der Lernweg** — Zeichen, Wörter, Sätze (ADR 0066):

| Übung | wozu |
| --- | --- |
| **Buchstaben** | das kyrillische Alphabet — freiwillig, eigener Lernstand, zählt nicht in Serie und Fortschritt; Einstieg ist das Üben, die Tafel liegt hinter einem eigenen Knopf |
| **Lernsets** | die Wörter der nächsten Sätze, schaltet «Übersetzen» frei; das nächste Set öffnet bei **80 % gemeistert**, und gemeistert wird **nur hier** (ADR 0086/0092) |
| **Tippen** | Eingabequiz mit kyrillischer Tastatur, ab Leitner-Stufe 3 — freiwillige Zugabe |
| **Übersetzen** | nur Sätze, deren Wörter sitzen; Form und Richtung steigern sich mit der Stufe (Kacheln vor Tippen, RU→DE vor DE→RU) |
| **Schreibung** | warum man nicht schreibt, was man hört — eine Regel je Karteikarte, zählt mit |
| **Grammatik** | warum ein Wort so dasteht — freiwillig, entdecken statt belehren |
| **Power-Training** | die zurückgefallenen Wörter zurückholen — drei auf einmal, ab drei gefallenen offen |

Keine Übungen, sondern **im Menü** (runder Knopf, drei Striche), in dieser Reihenfolge:
**Einstellungen**, **Bilanz**, **Sicherung**, **Tickets**. Dazu **Sprachfakten** aus der
Faktenkarte oder der Bilanz. Eine Reiterleiste gibt es nicht — der Kopf trägt unterwegs
den Rückweg. Maskottchen ist die Chili.

## Wo die Regeln stehen

Diese Datei trägt nur, was **immer** gilt. Das Übrige liegt themenweise unter
`.claude/rules/` und wird automatisch geladen, sobald ich eine passende Datei anfasse:

| Datei | greift bei | Inhalt |
| --- | --- | --- |
| `.claude/rules/oberflaeche.md` | `index.html` | Chili, Blätter und runde Knöpfe, Leiste, Tutorial, Kopf und Fortschritt, Übersicht, Jubel, Einstellungen, Farben, Tastatur, Ton, Update, Tickets |
| `.claude/rules/lernlogik.md` | `index.html` | Strenge, Meistern und Deckel, Lernsets, Fälligkeit und Stapel, Buchstaben, Übersetzen, Empfehlung, Bilanz, Sicherungscode |
| `.claude/rules/inhalte.md` | `data/**`, `build.mjs` | Grammatik, Sätze und Lehrplan, Betonung, Schreibung |
| `.claude/rules/pruefstand.md` | `tools/pruefstand/**` | wie eine Suite entsteht und woran sie scheitert |
| `.claude/rules/docs.md` | `docs/**` | ADRs, Index, Archiv |

Die Begründung hinter jeder Regel steht im jeweiligen ADR unter `docs/decisions/`
(Index: `docs/decisions/README.md`). Wer eine Regel ändert, ändert sie **dort**, wo sie
steht — nicht zusätzlich hier.

## Harte Rahmenbedingungen — nicht verhandelbar

- Kein React, kein JSX, kein Build-Schritt, keine npm-Toolchain im Auslieferungspfad.
- **Zwei Dateien, nicht mehr** (ADR 0059): `index.html` und `sw.js`. Alles Inhaltliche
  steht in der ersten; der Worker kennt kein Wort Russisch. Die CSP trägt dafür genau eine
  Ausnahme, `worker-src 'self'` — **`connect-src` bleibt weg**, die Seite baut keine
  Verbindung auf. `pruefen.mjs` hält `sw.js` an dieselbe Leine und bricht ab, wenn eine
  Direktive mehr aufmacht. Ein `manifest.json` gibt es bewußt nicht.
- **Keine externen Ressourcen**: keine CDNs, keine Google Fonts, keine externen Bilder,
  keine API-Aufrufe. Alles inline. Symbole als Inline-SVG über `ICON` — **keine
  Emoji-Zeichen**, iOS rendert sie als farbige Grafik. `tools/pruefen.mjs` bricht darüber
  ab. Die Content-Security-Policy im `<head>` macht die Regel erzwingbar; sie bleibt drin.
- **Die ausgelieferte Datei ist öffentlich lesbar.** Nie ein Token, ein Passwort oder einen
  Schlüssel hineinschreiben — auch nicht verschleiert, auch nicht «nur zum Testen».
  `pruefen.mjs` sucht nach tokenähnlichem Text und bricht bei **jeder** Fremdadresse ab.
  Daß die Seite öffentlich ist, ist für die Daten belanglos: Lernstand und Tickets liegen
  im `localStorage` des Geräts.
- **Persistenz ausschließlich über `localStorage`**, jeder Zugriff in `try/catch`.
- **Mobile-first**: Touch-Ziele ≥ 44 × 44 px, keine Hover-abhängige Bedienung,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)` für Notch und
  Home-Indicator.
- **Die App duzt** (ADR 0050). Jeder Text, der den Nutzer anspricht, sagt «du» — auch
  Kommentare und Jubel. **Der Lehrstoff bleibt davon unberührt:** «вы» heißt weiterhin
  «ihr / Sie», «Sie schreibt einen Brief» ist она пишет, und eine Grammatikerklärung darf
  «sie» über Wörter sagen. Die Suite `anrede` liest den gerenderten Text jeder Ansicht und
  führt die Ausnahmen namentlich — wer eine hinzufügt, begründet sie dort.
- Die App muß offline funktionieren, nachdem sie einmal geladen wurde.

## Verzeichnisse

```
index.html                die App — hier steht alles Inhaltliche
sw.js                     Service Worker: legt die App beiseite, mehr nicht (ADR 0059)
.nojekyll                 schaltet Jekyll ab, niemals löschen
data/*.json               Lerninhalte, einzige Quelle für Vokabeln/Sätze/Fakten/
                          Tastatur/Buchstaben/Grammatik/Verben/Nomen/Kommentare/
                          Tutorial/Betonung/Schreibregeln/Minimalpaare
tools/build.mjs           /data prüfen und in index.html einbetten (--check = nur prüfen)
tools/pruefen.mjs         Vor-Push-Prüfung von index.html
tools/pruefstand/         Prüfstand: lauf.mjs, suiten/*.mjs, bild.mjs (siehe README dort)
.claude/rules/            Regeln nach Thema, geladen bei passender Datei
.claude/skills/           Abläufe für Claude: pruefstand, ticket
.claude/hooks/            vor-dem-push.mjs — hält den Push an, wenn etwas rot ist
tools/freistellen.py      Maskottchen aus einem Bild freistellen (ohne Bildbibliothek)
tools/skaliere.py         PNG auf Icon-Größe bringen (ohne Bildbibliothek)
tools/appikon.py          App-Symbol bauen: Grund tauschen, Sprechblase umdrehen
docs/appikon-hell-*.png   das ausgelieferte App-Symbol als Datei (180 und 1024)
tools/palette.py          getönte Paletten aus dem neutralen Grundton rechnen
docs/                     Architektur, Datenmodell, Deploy, Entscheidungen (ADRs)
docs/arbeitsweise.md      Kurzanleitung für den Nutzer: Schnitt, Modell, Übergabe
docs/decisions/           kurze ADRs, fortlaufend numeriert — README.md ist der Index
docs/archiv/              abgearbeitete Pläne; nichts davon ist offen
```

Vor inhaltlicher Arbeit lesen: `docs/architektur.md` (Zustand, Render-Zyklus),
`docs/datenmodell.md` (Format der Inhalte), `docs/deploy.md` (Pages, Cache).

## Konventionen

- **Code-Stil in `index.html`:** ES5-nah — `var`, klassische `function`-Ausdrücke, keine
  Klassen, keine Module, kein `async`, `'use strict'` am Skriptanfang. Bewußt so; neue
  Abschnitte folgen demselben Stil. Zwei Leerzeichen Einrückung, einfache
  Anführungszeichen. Gliederung über Kommentarbalken.
- **Alle Ausgaben durch `esc()`**, Ereignisbehandler nach dem Setzen von `innerHTML`
  anhängen, nie als `onclick`-Attribut.
- **Der Datenblock zwischen `DATEN:START` und `DATEN:ENDE` ist generiert.** Inhalte
  ausschließlich in `/data` ändern, danach `node tools/build.mjs`.
- **Die Version steht in `VERSION`**, sonst nirgends von Hand (siehe `docs/deploy.md`):
  erste Ziffer = der Lernstand wird anders gelesen, zweite = etwas kommt dazu, dritte =
  alles Übrige. `tools/build.mjs` stempelt sie als `APP_VERSION`. **Ein angehängtes `T`
  heißt «noch nicht abgenommen»** (`2.4.6T`) — die Fassung wird ausgeliefert, damit sie am
  Gerät angesehen werden kann; fällt das T weg, ist sie freigegeben. Es gehört **in** die
  Zahl: Der Cache des Workers heißt nach der Version. **Aus demselben Grund darf das T
  zählen** (ADR 0083): Wird an einer angesagten Fassung ein zweites Mal nachgebessert,
  heißt die nächste Ansicht `2.5.0T2`.
- **`APP_STAND` setzt `tools/build.mjs`**, nicht die Hand. Der Wert geht in jedes Ticket
  ein. `--check` vergleicht ohne ihn.
- **Commits:** einer je logischer Änderung, Nachricht auf Deutsch, Betreffzeile im
  Imperativ. Im Rumpf steht, *warum*.
- **Branches:** neue Branches nur auf meine ausdrückliche Ansage. Direkte Arbeit auf
  `main` nur, wenn ich es für den jeweiligen Vorgang freigegeben habe.

## Prüfstand und Push

Die App wird am **echten DOM** geprüft: Die ausgelieferte Datei bekommt ein Skript
angehängt, ein kopfloser Browser lädt sie, das Skript prüft und schreibt sein Urteil in
den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs   # alle Suiten, ~16 s — grün schweigt, rot redet
node tools/pruefstand/lauf.mjs jubel flammen   # nur diese
node tools/pruefstand/lauf.mjs -v              # auch jede grüne Suite nennen
```

**Der Push ist abgesichert.** `.claude/hooks/vor-dem-push.mjs` fährt vor jedem `git push`
`build.mjs --check`, `pruefen.mjs` und den Prüfstand und hält an, wenn etwas rot ist.
Notausgang, wenn es wirklich raus muß: `PRUEFSTAND=aus` vor den Befehl. Ein GitHub-Lauf
(`.github/workflows/pruefstand.yml`) prüft dasselbe noch einmal unabhängig.

**Wer `index.html` anfaßt, sichert die Änderung mit einer Prüfung ab** — der Prüfstand ist
das Gedächtnis für jeden Fehler, der schon einmal da war. Wie eine Suite entsteht: Skill
`pruefstand` und `tools/pruefstand/README.md`.

**`index.html` nie in Blöcken lesen.** 15 000 Zeilen — mit `grep -n` und engem Kontext
suchen, nicht mit `sed -n 'A,Bp'` über hunderte Zeilen. Was einmal im Kontext liegt,
kostet bis zum Sitzungsende bei jedem Aufruf mit.

**Für einen ganzen Vorgang** — vom gemeldeten Befund bis zur Auslieferung — gibt es den
Skill `ticket`.

## Bekannte Fallstricke

- **Jekyll.** Ohne `.nojekyll` rendert Pages Markdown und packt alles in ein
  Theme-Layout — genau der Fehler, der die Seite ursprünglich unbrauchbar machte
  (ADR 0003). Datei nie löschen. Kein YAML-Front-Matter in `index.html`.
- **Fehlendes DOCTYPE.** Ohne `<!DOCTYPE html>` in Zeile 1 rendert Safari im
  Quirks-Mode; Flexbox und Viewport verhalten sich anders. War schon einmal versehentlich
  entfernt.
- **iOS-Quick-Look** (Vorschau aus Dateien/Mail) zeigt HTML anders als Safari und
  speichert nichts dauerhaft. Testen immer in Safari oder in der
  Home-Bildschirm-Verknüpfung.
- **`localStorage`** wirft im privaten Modus und bei vollem Kontingent. Jeder Zugriff in
  `try/catch`; schlägt das Schreiben fehl, Hinweis auf den Sicherungscode zeigen.
  Schlüssel: `russisch_trainer_v1` — Schemawechsel nur mit neuem Schlüssel und Migration.
- **`speechSynthesis`** braucht auf iOS eine Nutzergeste, liefert Stimmen erst verzögert
  und schweigt im Stummschalter-Modus. Nie in einen Ablauf einbauen, der ohne
  Sprachausgabe nicht funktioniert; Aufrufe in `try/catch`.
- **Der Service Worker liefert, was er gespeichert hat** (ADR 0059) — aus dem Speicher
  sofort, im Hintergrund nachsehen. Der Cache heißt nach der Version; wer den Namen
  entkoppelt, liefert für immer den alten Stand aus. **Kein `skipWaiting` beim
  Einrichten:** Der neue Worker wartet auf «Jetzt laden» oder den Knopf «Update»
  (ADR 0062). Klemmt etwas, gibt es den Notausgang in den Einstellungen unter «App» — er
  läßt den Lernstand unberührt. **Ohne Netz kommt kein Urteil:** «Nach Aktualisierung
  suchen» meldet dann «Kein Netz», nicht «Aktuell» (ADR 0052). **`update()` ist fertig,
  bevor die neue Fassung wartet** — wer sofort urteilt, sagt «Aktuell» und sieht sie eine
  Sekunde später auftauchen.
- **Das App-Symbol läßt sich zur Laufzeit nicht wechseln.** iOS liest `apple-touch-icon`
  einmal, beim Anlegen der Verknüpfung. Ein Umschalter wäre eine Attrappe. Gebaut wird es
  mit `tools/appikon.py`; wer die Farben ändert, denkt an die Sprechblase. **Das
  ausgelieferte Symbol ist keine Datei** — es steht als Daten-URI im `<head>` von
  `index.html` (180 × 180, Grund `#F4F2ED`). `docs/IMG_2942.png` ist das **türkise
  Original**; zum Nachsehen liegen `docs/appikon-hell-180.png` (bitgleich mit dem
  ausgelieferten) und `docs/appikon-hell-1024.png` daneben.

## Offen

- `apple-mobile-web-app-capable` gilt als veraltet zugunsten von
  `mobile-web-app-capable`. Safari braucht weiterhin die alte Variante; beide zu setzen
  wäre die saubere Lösung, ist aber noch nicht umgesetzt.
- Angelegt sind die Skills `pruefstand` und `ticket`. Weitere waren einmal vorgesehen; ob
  sie gebraucht werden, ist offen.
