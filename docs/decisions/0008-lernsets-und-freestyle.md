# 0008 · „Üben" wird zu „Lernsets" und „Freestyle"

**Status:** angenommen · 2026-08-02

## Kontext

Nach ADR 0006 und 0007 lief alles über einen einzigen linearen Weg: Päckchen zu zwölf
Wörtern in der Reihenfolge des Lehrplans, jedes Wort auf Stufe 3, bevor es weiterging.
Der erste Satz in „Übersetzen" lag damit rund 60 Wörter entfernt — bei zwölf Wörtern je
Päckchen und drei richtigen Antworten je Wort mehrere Sitzungen. Die Rubrik „Übersetzen"
war faktisch unerreichbar, obwohl sie das eigentliche Ziel trägt: ganze Sätze lesen.

Zugleich diente dieselbe Rubrik zwei Zwecken, die sich widersprechen: zielgerichtet auf
Sätze hinarbeiten und frei Vokabeln nach Sachgebiet pauken.

## Entscheidung

Die Rubrik „Üben" wird geteilt.

1. **Lernsets** — der kurze Weg. Ein Set bündelt genau die Wörter, die die nächsten Sätze
   voraussetzen; wer es schafft, schaltet diese Sätze frei. Die Sets entstehen zur
   Laufzeit aus `SENTENCES`: Sätze nach ihrem spätesten Wort sortieren, deren noch
   unbekannte Voraussetzungen sammeln, bei zwölf Wörtern ein Set schließen. Ergebnis:
   12 Sets aus 133 Wörtern — **nach dem ersten Set stehen fünf Sätze offen**, nach drei
   Sets vierzehn.
2. **Freestyle** — das freie Training. Thema wählen (oder „Alle"), keine Sperre, kein
   Ziel außer Wiederholung. Hier leben die 247 Wörter, die kein Satz braucht.
3. Die Schwelle für ein geschafftes Set ist **Stufe 2** — dieselbe, ab der ein Satz
   erscheint. Vorher waren es zwei verschiedene Schwellen (Päckchen 3, Sätze 2), was
   niemand erklären konnte.

Dazu Kleineres im selben Zug: die App heißt **Chillingo**, der Doppeltipp vergrößert
nicht mehr (`touch-action: manipulation`), die Buchstaben-Kacheln liegen in Überzahl aus,
die Themenliste in der Bilanz zeigt nur Themen mit Fortschritt, und die eingebaute
Tastatur in „Tippen" startet zugeklappt.

## Begründung

Die Sets aus den Sätzen abzuleiten statt sie von Hand zu pflegen hält beides
zusammen: Kommt ein Satz dazu, wächst das passende Set von selbst mit. Die Alternative —
Sets als eigene Datei — hätte eine dritte Stelle geschaffen, die zu Vokabeln und Sätzen
passen muss.

Die Päckchen-Sperre entfällt ersatzlos: Freestyle ist der Ort ohne Sperren, und innerhalb
der Lernsets ist die Reihenfolge kein Selbstzweck, sondern folgt den Sätzen.

## Folgen

- Die Reihenfolge in `data/vokabeln.json` bestimmt weiterhin, *in welcher Folge* Sets
  entstehen — aber nicht mehr, wie viel man lernen muss, bevor der erste Satz kommt.
- Wörter, die in keinem Satz vorkommen, tauchen in keinem Lernset auf. Wer sie lernen
  will, geht in Freestyle. Sollen sie in den Hauptweg, brauchen sie einen Satz.
- Die Tab-Leiste trägt jetzt fünf Rubriken. Auf schmalen Geräten scrollt sie; die
  Einstellungen bleiben deshalb hinter dem Reglerknopf.
- `state.settings.paketSperre` ist entfallen, `tastaturAn` neu — `mergeState()` fängt
  beides ab, gespeicherte Stände laufen unverändert weiter.
