---
paths:
  - "tools/pruefstand/**"
---

# Prüfstand · Chillinal

Gilt für die Suiten. Ausführlich in `tools/pruefstand/README.md` und im Skill `pruefstand`.

- **Eine Suite baut ihre Seite mit `suite(name, html, rumpf)`** aus `helfer.mjs`. Der Rumpf
  hat `pruefe`, `q`, `alle`, `frisch()` und darf ein Promise zurückgeben — dann wird erst
  geurteilt, wenn es erfüllt ist.
- **Eine Suite bricht mit `throw` ab, nie mit `process.exit()`** — ein Ausstieg beim Bauen
  beendet den Läufer selbst, ohne Ausgabe und ohne Grund.
- **Backticks brechen `String.raw`** — auch im Kommentar. Symptom: «SUITE BRICHT AB —
  Unexpected identifier». Statt dessen «» oder Klartext.
- **Ein Syntaxfehler im Rumpf meldet sich nur als Seitentitel** («Chilli Journal», null
  Prüfungen). Häufigste Ursache: Wer eine Suite per Skript ändert, verwandelt ein `\n` im
  Suchtext in einen echten Zeilenumbruch — im String-Literal ist das ein Syntaxfehler.
- **Was die Prüfung sucht, steht nicht wörtlich in ihr.** Das Prüfskript hängt im selben
  Dokument: Ein Emoji im Suchmuster findet sich selbst, Chillingos Schlüssel im Klartext
  ließe `pruefen.mjs` anschlagen. Zeichen über `String.fromCharCode`, Schlüssel
  zusammengesetzt; gelesen wird `#app`, nicht `document.body`.
- **Der Auftritt beim Kaltstart ist vor jeder Suite still beendet** (`helfer.mjs`, ebenso
  `bild.mjs`). Ob er lief, sagt `auftrittBeimStart`; wer ihn sehen will, ruft `auftritt()`.
- **Wer Lage oder Größe mißt, ruft vorher `ausbewegt()`** — Ansichten wachsen, Teile
  ziehen sich auf (ADR 0007). Der Läufer rechnet in virtueller Zeit ohne Bilder:
  Animationen kommen nie von selbst an, auf ihr Ende wartet man mit `ausbewegt()` und
  einem kurzen `setTimeout`.
- **Blobs über `blobText(b)` lesen, nie über `b.text()`** — echtes Lesen läßt die
  virtuelle Uhr im Sekundentakt der App bis ans Budget laufen; die Suite kommt dann
  gelegentlich ohne Urteil zurück.
- **Wer auf das Ende einer Bewegung wartet, rechnet aus ihrer Konstante** (`THEMA_TROPFEN
  + 500`), nie mit einer festen Zahl. Lokal und auf GitHub endet derselbe Übergang auf
  verschiedenen Wegen: lokal greift oft ein früher Notweg, auf GitHub nur die späte
  Sicherheitsuhr — eine feste Zahl ist lokal grün und auf GitHub rot (ADR 0039).
- **Das virtuelle Budget des Läufers ist 20 s** (`lauf.mjs`). Was eine Suite in Summe
  wartet, bleibt darunter; sonst kommt sie mit «Chilli Journal» und null Prüfungen zurück.
- **Übergänge abschalten, wenn eine Farbe gefragt ist** — der kopflose Browser läßt sie
  nicht zuverlässig ablaufen; gefragt ist das Ziel, nicht der Weg.
- **Eine Prüfung zählt nicht auf, sie fragt nach allen.** Menüeinträge, Knöpfe,
  Trefferflächen: über `alle()` und eine Bedingung für jeden, nicht über eine feste Zahl.
- **Das Menü blendet nach dem Schließen noch aus.** Wer danach Knöpfe zählt, fragt `#app`.
- **Nur das Bild findet manches.** Ein DOM-Test sagt nichts über Größe und Umbruch. Bei
  sichtbaren Änderungen ein Bildschirmfoto in Handybreite, **hell und dunkel**.
- **Der kopflose Browser kennt weder Safe-Area noch iOS-Leiste noch ein dunkles Gerät** —
  was davon abhängt, findet nur das Gerät.
