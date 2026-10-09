# 0012 · Markierung aufheben, Knöpfe tropfen, ein Hinweis wartet auf «OK»

*2026-10-05 · Ansicht von 0.5.0T7 · Version 0.5.0T8 · ergänzt 0007, 0011 · Tropfen des Hinweises und Teilen abgelöst durch 0013*

## Ausgangslage

Drei Wünsche zur Exportansicht:

- Wer einen exportierten Eintrag im Kalender von Hand gelöscht hat, konnte ihn nur über
  «Bearbeiten» *und einen Export* wieder hinausschicken. Die Marke ohne Export
  zurückzusetzen ging nicht.
- Die Knöpfe der Kachel «Exportieren» schnappten auf und zu, sobald unter «Bearbeiten»
  etwas dazukam oder wegging — die Ansicht wird ganz neu gezeichnet, die Knöpfe waren
  einfach da oder fort.
- Nach «Als Datei laden» stand der Satz «Öffne sie, um sie in den Kalender zu holen»
  zwei Sekunden unten — iOS legt im selben Augenblick sein eigenes Blatt darüber, und
  wer zurückkam, fand ihn nicht mehr.

## Entscheidung

- **«Markierung aufheben»** steht unter «Als Datei laden», wenn «Bearbeiten» an ist und
  die Auswahl *nur* aus Dazugeholtem besteht (`exAufheben`). Es setzt `imKalender` der
  Gewählten auf `null` und speichert — ohne Export. Die Einträge gelten danach als neu und
  gehen beim nächsten Export mit; «Bearbeiten» schließt, eine Meldung sagt, wie viele.
  Ist etwas Neues dabei, fehlt der Knopf: Neues hat keine Marke, und ein Knopf, der nur
  für einen Teil der Auswahl gilt, wäre nicht zu durchschauen.
- **Die Wege stehen immer im DOM**, nur verborgen: `#exWege` (Teilen, Laden, darunter
  `#exAufhebenTeil`) und der Satz `#exNichts`. Nach jedem Zeichnen vergleicht
  `exTeileNachziehen()` mit dem vorigen Stand, setzt Geänderte kurz zurück und läßt sie
  über **`teilTropfen(el, an)`** in den neuen: Der Platz zieht sich auf wie bei
  `teilZeigen`, und jeder `.knopf` darin hängt erst als Perle oben, längt sich zum
  Tropfen und wird breit (`clip-path`); zu dasselbe rückwärts am Geist. Ein Teil im
  anderen geht mit dem äußeren.
- **Der Hinweis** (`hinweisZeigen(titel, text, quelle, ziel)`) ist eine Karte mittig auf
  einem Schleier, `role="alertdialog"`, und geht erst auf «OK». Sie quillt als Tropfen aus
  dem getippten Knopf und fließt beim Schließen in `ziel` — nach dem Laden in den Wert
  «Zuletzt», der dabei nickt; ist das Ziel nicht zu sehen, dorthin zurück, woher sie kam.
  Die Spitze zeigt zur Quelle (`tropfenSpitze`). Den Fokus trägt die Karte, nicht «OK».
- Nur das Laden bekommt den Hinweis. Teilen meldet sich weiter unten: Wenn die Meldung
  kommt, hat das Teilen-Blatt den Weg in den Kalender schon gezeigt.

## Begründung

Erst zeichnen, dann bewegen (ADR 0007) gilt weiter: Der Zustand stimmt sofort, nur das
Bild folgt. Verborgene Teile statt fehlender sind das Einzige, was nach einem vollständigen
Neuzeichnen einen Geist für das Zugehen und eine Höhe für das Aufgehen hergibt. Eine
Meldung, die geht, ist richtig für «Gespeichert»; für eine Anweisung, die man nach einem
Wechsel in eine andere App noch braucht, ist sie falsch.

## Folgen

- Wer einem Teil ein eigenes `display` gibt, braucht dazu `[hidden] { display: none; }` —
  sonst schlägt die Klasse das Attribut, und Verborgenes bleibt zu sehen (`.ex-wege`).
  Prüfungen fragen darum `getClientRects()`, nicht nur `hidden`.
- Suiten: `exportwege`; `exportmarken` B5 fragt die verborgenen Wege.
- Nebenbefund, älter als diese Fassung: `export` kam etwa jeden fünfzehnten Lauf ohne
  Urteil zurück. `Blob.text()` liest wirklich; solange der Läufer darauf wartet, läuft
  seine virtuelle Uhr im Sekundentakt der App (`takt`) bis ans Budget. Die Suiten lesen
  Blobs jetzt über `blobText(b)` aus `helfer.mjs`, ohne Wartezeit — 0 von 60 Läufen rot,
  vorher 3 von 40. (Der Commit davor schob es fälschlich auf den offenen Hinweis.)
