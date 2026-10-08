---
paths:
  - "tools/pruefstand/**"
---

# Prüfstand · Fallen

Gilt für die Suiten und den Läufer. Jede Falle hier ist schon einmal zugeschnappt. Aufbau
und Vorlage: `tools/pruefstand/README.md`; Vorgehen: Skill `pruefstand`.

## Die Seite bauen

- **Immer mit `suite(name, html, rumpf)` oder `testseite()`** aus `helfer.mjs`, nie von
  Hand über `html.replace('</body>', …)`: In einem Ersatztext sind `$&`, `` $` ``, `$'`
  und `$1` Steuerzeichen — ein `'\$&'` wurde still zu `</body>`.
- Der Rumpf hat `pruefe`, `q`, `alle`, `frisch()` und läuft im Gültigkeitsbereich der App.
  Gibt er ein Promise zurück, wird erst geurteilt, wenn es erfüllt ist.
- **Eine Suite bricht mit `throw` ab, nie mit `process.exit()`** — sonst endet der Läufer
  selbst, ohne Ausgabe und ohne Grund.

## Das Prüfskript

- **Kein Backtick im Rumpf, auch nicht im Kommentar** — er steckt in `String.raw`.
  Symptom: «SUITE BRICHT AB — Unexpected identifier». Statt dessen «» oder Klartext.
- **Ein Syntaxfehler im Rumpf meldet sich nur als Seitentitel** («Chilli Journal», null
  Prüfungen). Häufigste Ursache: Wer eine Suite per Skript ändert, macht aus `\n` im
  Suchtext einen echten Zeilenumbruch.
- **Was gesucht wird, steht nicht wörtlich im Prüfskript** — es hängt im selben Dokument
  und fände sich selbst. Zeichen über `String.fromCharCode`, Schlüssel zusammengesetzt;
  gelesen wird `#app`, nicht `document.body`.
- **Feldnamen nachschlagen, nicht raten** (`docs/architektur.md`) — ein falscher Name läßt
  die Prüfung stumm in den falschen Zweig laufen.
- **Keine Prüfung in einem `if`, das vom Zufall oder vom Lauftag abhängt.** Wer «heute»
  braucht, stellt die Uhr selbst (`jetzt = function …`).
- **Eine Prüfung zählt nicht auf, sie fragt nach allen**: `alle()` und eine Bedingung für
  jeden, keine feste Anzahl.

## Zeit und Bewegung

- **Der Läufer rechnet in virtueller Zeit ohne Bilder**: Animationen kommen nie von selbst
  an. Wer Lage oder Größe mißt, ruft vorher `ausbewegt()`, dann ein kurzes `setTimeout`.
- **Auf das Ende einer Bewegung wartet man aus ihrer Konstante** (`THEMA_TROPFEN + 500`),
  nie mit einer festen Zahl — lokal grün, auf GitHub rot (ADR 0039).
- **Das virtuelle Budget ist 20 s** (`lauf.mjs`). Wartet eine Suite länger, kommt sie mit
  «Chilli Journal» und null Prüfungen zurück.
- **Blobs über `blobText(b)` lesen, nie über `b.text()`** — echtes Lesen läßt die
  virtuelle Uhr bis ans Budget laufen.
- **Übergänge abschalten, wenn eine Farbe gefragt ist** — gefragt ist das Ziel.
- Der Auftritt beim Kaltstart ist vor jeder Suite still beendet; ob er lief, sagt
  `auftrittBeimStart`, sehen will man ihn mit `auftritt()`.
- Das Menü blendet nach dem Schließen noch aus — wer danach Knöpfe zählt, fragt `#app`.

## Urteil

- **Die Zahl der Prüfungen ist ein Messwert.** Sinkt sie ohne Grund, ist eine Prüfung
  verschwunden, nicht bestanden. Bei jedem Lauf hinsehen.
- **Ein grüner Lauf gibt 0 zurück** — nie den Rückgabewert über ein `grep` leiten.
- **`bild.mjs` spritzt nichts ein**; die Seite rendert, wie sie ausgeliefert wird.
- **Nur das Bild findet Größe und Umbruch** — bei sichtbaren Änderungen ein Foto, hell und
  dunkel. Safe-Area, iOS-Leiste und ein dunkles Gerät findet nur das Gerät.
