---
paths:
  - "tools/pruefstand/**"
---

# Prüfstand · Chillingo

Gilt für die Suiten. Ausführlich in `tools/pruefstand/README.md` und im Skill `pruefstand`.

- **Eine Suite bricht mit `throw` ab, nie mit `process.exit()`** — ein Ausstieg beim Bauen
  beendet den Läufer selbst, ohne Ausgabe und ohne Grund.
- **Backticks brechen `String.raw`** — auch im Kommentar. Symptom: «SUITE BRICHT AB —
  Unexpected identifier». Statt dessen «» oder Klartext.
- **Wer eine Suite schreibt, die eine Übung betritt, stellt die Spuren still** (ADR 0079) —
  sonst steht die Chili in der Tutorial-Blase statt in der Ansicht.
- **Wer den Tutorial-Zustand braucht, stellt ihn selbst her** (ADR 0094): Die Testseite lädt
  mit leerem Speicher, die App fragt beim Start von selbst — darauf zu bauen heißt, vom ersten
  `tutEnde()` einer fremden Prüfung abzuhängen. `tutStarten()` setzt nur den Scheinwerfer und
  zeichnet die Ansicht **nicht** neu; `setTab()` gehört danach, nicht davor.
- **Eine Prüfung fragt eine Kachel nach Namen**, nie nach Platz — dieselbe Übung steht
  zweimal im Baum.
- **Eine Prüfung zählt nicht auf, sie fragt nach allen.** Eine Liste (runde Knöpfe, Felder im
  Sicherungscode, Binder der Tastatur, Reiter der Einstellungen) mißt über jede neue Lücke
  hinweg. Sollwerte aus der Stelle in `EINST_REITER` rechnen, nie aus einer festen Zahl.
- **Nur das Bild findet manches.** Ein DOM-Test sagt nichts über Größe und Umbruch: Die
  Tastatur in der Kachel war im DOM unsichtbar, der Ring in der Bilanz halbseitengroß. Bei
  sichtbaren Änderungen ein Bildschirmfoto in Handybreite, in **Dark und einem hellen Schema**.
- **Der kopflose Browser kennt weder Safe-Area noch iOS-Leiste** — was darunter liegt (ADR
  0087), findet nur das Gerät.
