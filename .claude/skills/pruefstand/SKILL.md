---
name: pruefstand
description: Den Prüfstand von Chillinal bedienen und erweitern — Suiten schreiben, einen Befund am echten DOM reproduzieren, Bildschirmfotos in Handybreite machen. Verwenden, wenn eine Änderung an index.html abgesichert, ein gemeldeter Fehler nachgestellt oder das Aussehen geprüft werden soll.
---

# Prüfstand

Ein kopfloser Browser lädt die ausgelieferte `index.html` mit angehängtem Prüfskript;
das Skript prüft am echten DOM und schreibt sein Urteil in den Seitentitel.

- **Vorlage und Aufbau:** `tools/pruefstand/README.md`.
- **Fallen:** `.claude/rules/pruefstand.md` — lädt von selbst, sobald eine Datei unter
  `tools/pruefstand/` gelesen oder geändert wird. Vor dem Schreiben einer Suite lesen.
- Was eine Suite prüft, sagt ihr Kopfkommentar: `head -3 tools/pruefstand/suiten/*.mjs`.
  Erst nachsehen, ob es schon eine passende gibt — dann dort ergänzen.

```sh
node tools/pruefstand/lauf.mjs          # alle Suiten
node tools/pruefstand/lauf.mjs thema    # nur eine
node tools/pruefstand/bild.mjs          # Dashboard, hell und dunkel
node tools/pruefstand/bild.mjs s.mjs    # eigene Szenen (Beispiel im README)
```

## Bei einem gemeldeten Fehler

1. **Erst reproduzieren.** Ein Prüfskript schreiben, das den Befund am DOM zeigt, bevor
   eine Zeile am Code geändert wird.
2. **Prüfen, ob der Befund stimmt.** Gemeldet wird das Symptom, nicht die Bedingung
   dahinter.
3. **Fragen, ob dieselbe Ursache anderswo steckt.** Gewohnheiten, Abgewöhnen und Termine
   teilen sich Muster (Tagesgrenze, Kachel, Ring).
4. **Reparieren**, dann die Prüfung in eine Suite überführen.
5. **Alle Suiten fahren**, nicht nur die neue. Die Zahl der Prüfungen ansehen.

## Was am DOM geprüft wird

- **Was genau einmal dastehen darf** — etwa `#chiliFigur`.
- **Rechtecke statt Klassennamen**: Lage über `getBoundingClientRect()` vergleichen.
- **Errechnete Farben** über `getComputedStyle`, verglichen mit dem Token, nicht mit einer
  eingetippten Hexzahl.
- **Übergänge, nicht Zustände**: «feiert beim ersten Mal» *und* «beim zweiten nicht».
- **Leerzustände** — fast jeder gemeldete Fehler saß in einem.
- **Die Zeit**: Mitternacht, Wochenwechsel, Monatsende — die Uhr selbst stellen.

## Bildschirmfotos

Gerätemaß 430 × 932. Immer **hell und dunkel** (`themaSetzen('hell')`,
`themaSetzen('dunkel')`). Ein Bild zeigt, ob etwas *aussieht* wie gedacht, nicht ob es
*bleibt*: Was einmal falsch aussah, gehört danach in eine Suite. Die gemeldete Überbreite
muß 0 sein.
