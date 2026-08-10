---
name: pruefstand
description: Den Prüfstand von Chillingo bedienen und erweitern — Suiten schreiben, einen Befund am echten DOM reproduzieren, Bildschirmfotos in Handybreite machen. Verwenden, wenn eine Änderung an index.html abgesichert, ein gemeldeter Fehler nachgestellt oder das Aussehen geprüft werden soll.
---

# Prüfstand

Die App ist eine einzelne HTML-Datei ohne Build und ohne Testwerkzeug. Geprüft
wird sie so, wie ein Gerät sie sieht: Die **ausgelieferte Datei** bekommt ein
Skript angehängt, ein kopfloser Browser lädt sie, das Skript prüft am echten DOM
und schreibt sein Urteil in den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs        # alle Suiten, ~16 s
node tools/pruefstand/lauf.mjs jubel  # nur eine
node tools/pruefstand/lauf.mjs -q     # nur Zusammenfassung und was rot ist
```

`tools/pruefstand/README.md` hat den vollständigen Aufbau und eine Vorlage zum
Kopieren. Der Läufer liest `suiten/` selbst aus — eine neue Datei läuft ab
sofort mit, sie muss nur nach `bau/t-<dateiname>.html` schreiben.

## Reihenfolge bei einem gemeldeten Fehler

1. **Erst reproduzieren, dann verstehen.** Ein Prüfskript schreiben, das den
   Befund am DOM zeigt — bevor eine Zeile am Code geändert wird. Ohne das
   repariert man, was man vermutet, statt was gemeldet wurde.
2. **Prüfen, ob der Befund stimmt.** Er stimmt oft nicht wörtlich. «Das Set wird
   von einem Wort gemeistert» hieß in Wahrheit: Ein *wiederholtes* Vollwerden
   feiert erneut. Die Bedingung war richtig, ihre Häufigkeit war falsch.
3. **Fragen, ob dieselbe Ursache anderswo steckt.** Derselbe Fehler saß in vier
   Übungen. Wer nur die gemeldete repariert, bekommt drei weitere Meldungen.
4. **Reparieren**, dann die Prüfung in eine Suite überführen — sie ist ab jetzt
   das Gedächtnis für diesen Fehler.
5. **Alles fahren** (`lauf.mjs`), nicht nur die neue Suite.

## Was am DOM geprüft wird und was nicht

Geprüft gehört, was sich still ändern kann und teuer auffällt:

- **Was genau einmal im Dokument stehen darf** — die Chili (`#chiliFigur`), ein
  runder Knopf, in den sie springt. Zweimal eingebettet heißt: sie flackert
  zwischen zwei Orten.
- **Rechtecke statt Klassennamen.** «Der Knopf liegt rechts vom Titel» als
  `getBoundingClientRect()`-Vergleich prüfen, nicht über eine CSS-Klasse. Der
  Fehler war nie ein fehlender Klassenname, sondern eine falsche Lage.
- **Errechnete Farben** über `getComputedStyle`, verglichen mit dem Wert, den
  ein Token liefert — nicht mit einer eingetippten Hexzahl.
- **Zustandsübergänge**, nicht Zustände: «feiert beim ersten Mal» *und* «feiert
  beim zweiten Mal nicht».
- **Leerzustände.** Fast jeder gemeldete Fehler saß in einem.

## Fallen, die schon zugeschnappt sind

- **Keine Prüfung in einem `if`, dessen Bedingung ausgelost wird.** Die
  Aufgabenform wechselt zufällig. Stattdessen weiterblättern, bis die gewünschte
  Form kommt, und das Erreichen selbst prüfen.
- **Die Zahl im Titel ist ein Messwert.** Sinkt sie ohne Grund, ist eine Prüfung
  verschwunden, nicht bestanden. Bei jedem Lauf kurz hinsehen.
- **Feldnamen nachschlagen, nicht raten.** `abcQ.modus`, aber `uebQ.mode`. Ein
  falscher Name lässt die Prüfung stumm in den falschen Zweig laufen.
- **`renderKopf()` läuft vor der Ansicht.** Wer etwas in eine Kachel hängt: erst
  nach Hause schicken, dann zeichnen, dann umhängen.
- **Die Seite immer mit `testseite(html, test)` bauen**, nie von Hand über
  `html.replace('</body>', …)`. In einem Ersatz*text* sind `$&`, `` $` ``, `$'`
  und `$1` Steuerzeichen — ein `'\$&'` im Prüfskript wurde stillschweigend zu
  `</body>` und machte die Seite unlesbar.
- **Kein Backtick im Prüfskript**, auch nicht in einem Kommentar: Es steckt in
  einem `String.raw`-Template und endet dort.

## Bildschirmfotos

```sh
node tools/pruefstand/bild.mjs szenen.mjs
```

Eine Szenendatei gibt Name auf Skript zurück (Beispiel im README). Gerätemaß ist
430 × 932. **Es wird nichts eingespritzt** — die Seite rendert, wie sie
ausgeliefert wird. Der Vorgänger setzte eine dunkle Palette von Hand nach und
zeigte nach ADR 0041 still die alten Farben.

Ein Bild ersetzt keine Prüfung: Es zeigt, ob etwas *aussieht* wie gedacht, nicht
ob es *bleibt*. Was einmal falsch aussah, gehört danach in eine Suite.
