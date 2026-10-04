---
name: pruefstand
description: Den Prüfstand von Chillinal bedienen und erweitern — Suiten schreiben, einen Befund am echten DOM reproduzieren, Bildschirmfotos in Handybreite machen. Verwenden, wenn eine Änderung an index.html abgesichert, ein gemeldeter Fehler nachgestellt oder das Aussehen geprüft werden soll.
---

# Prüfstand

Die App ist eine einzelne HTML-Datei ohne Build und ohne Testwerkzeug. Geprüft
wird sie so, wie ein Gerät sie sieht: Die **ausgelieferte Datei** bekommt ein
Skript angehängt, ein kopfloser Browser lädt sie, das Skript prüft am echten DOM
und schreibt sein Urteil in den Seitentitel.

```sh
node tools/pruefstand/lauf.mjs        # alle Suiten
node tools/pruefstand/lauf.mjs thema  # nur eine
node tools/pruefstand/lauf.mjs -v     # auch jede grüne Suite einzeln nennen
```

`tools/pruefstand/README.md` hat den vollständigen Aufbau und eine Vorlage zum
Kopieren. Der Läufer liest `suiten/` selbst aus — eine neue Datei läuft ab
sofort mit, sie muss nur nach `bau/t-<dateiname>.html` schreiben.

## Reihenfolge bei einem gemeldeten Fehler

1. **Erst reproduzieren, dann verstehen.** Ein Prüfskript schreiben, das den
   Befund am DOM zeigt — bevor eine Zeile am Code geändert wird. Ohne das
   repariert man, was man vermutet, statt was gemeldet wurde.
2. **Prüfen, ob der Befund stimmt.** Er stimmt oft nicht wörtlich — gemeldet wird
   das Symptom, nicht die Bedingung dahinter.
3. **Fragen, ob dieselbe Ursache anderswo steckt.** Gewohnheiten, Abgewöhnen und
   Termine teilen sich Muster (Tagesgrenze, Kachel, Ring). Wer nur die gemeldete
   Stelle repariert, bekommt die nächste Meldung.
4. **Reparieren**, dann die Prüfung in eine Suite überführen — sie ist ab jetzt
   das Gedächtnis für diesen Fehler.
5. **Alles fahren** (`lauf.mjs`), nicht nur die neue Suite.

## Was am DOM geprüft wird und was nicht

Geprüft gehört, was sich still ändern kann und teuer auffällt:

- **Was genau einmal im Dokument stehen darf** — die Chili (`#chiliFigur`).
  Zweimal eingebettet heißt: sie flackert zwischen zwei Orten.
- **Rechtecke statt Klassennamen.** «Der Knopf liegt rechts vom Titel» als
  `getBoundingClientRect()`-Vergleich prüfen, nicht über eine CSS-Klasse. Der
  Fehler war nie ein fehlender Klassenname, sondern eine falsche Lage.
- **Errechnete Farben** über `getComputedStyle`, verglichen mit dem Wert, den
  ein Token liefert — nicht mit einer eingetippten Hexzahl.
- **Zustandsübergänge**, nicht Zustände: «feiert beim ersten Mal» *und* «feiert
  beim zweiten Mal nicht», «abgehakt» *und* «nochmal getippt = zurück».
- **Leerzustände.** Fast jeder gemeldete Fehler saß in einem.
- **Die Zeit**: Mitternacht, Wochenwechsel, Monatsende. Eine Prüfung, die von
  «heute» abhängt, setzt ihr Datum selbst, statt auf den Lauftag zu hoffen.

## Fallen, die schon zugeschnappt sind

- **Keine Prüfung in einem `if`, dessen Bedingung vom Zufall oder vom Lauftag
  abhängt.** Sie läuft mal und mal nicht, und die Zahl im Titel schwankt still.
- **Die Zahl im Titel ist ein Messwert.** Sinkt sie ohne Grund, ist eine Prüfung
  verschwunden, nicht bestanden. Bei jedem Lauf kurz hinsehen.
- **Feldnamen nachschlagen, nicht raten.** Ein falscher Name lässt die Prüfung
  stumm in den falschen Zweig laufen.
- **Was gesucht wird, steht nicht wörtlich im Prüfskript** — es hängt im selben
  Dokument und fände sich selbst (siehe `.claude/rules/pruefstand.md`).
- **Die Seite immer mit `suite()` oder `testseite()` bauen**, nie von Hand über
  `html.replace('</body>', …)`. In einem Ersatz*text* sind `$&`, `` $` ``, `$'`
  und `$1` Steuerzeichen — ein `'\$&'` im Prüfskript wurde stillschweigend zu
  `</body>` und machte die Seite unlesbar.
- **Kein Backtick im Prüfskript**, auch nicht in einem Kommentar: Es steckt in
  einem `String.raw`-Template und endet dort.

## Bildschirmfotos

```sh
node tools/pruefstand/bild.mjs              # Dashboard, hell und dunkel
node tools/pruefstand/bild.mjs szenen.mjs   # eigene Szenen
```

Eine Szenendatei gibt Name auf Skript zurück (Beispiel im README). Gerätemaß ist
430 × 932. **Es wird nichts eingespritzt** — die Seite rendert, wie sie
ausgeliefert wird. Immer **hell und dunkel** ansehen: `themaSetzen('hell')`,
`themaSetzen('dunkel')`.

Ein Bild ersetzt keine Prüfung: Es zeigt, ob etwas *aussieht* wie gedacht, nicht
ob es *bleibt*. Was einmal falsch aussah, gehört danach in eine Suite.
