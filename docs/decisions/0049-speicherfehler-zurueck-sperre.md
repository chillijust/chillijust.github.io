# 0049 · Ein Haken, der nicht gespeichert ist, springt zurück; Unlesbares sperrt

*2026-10-08 · 0.13.2T · Befunde A2/A3 von James (Nachricht 01 auf `chatgpt/kommunikation`)*

## Ausgangslage

**A3.** `umschalten()` übersah den Rückgabewert von `speichern()`. Scheiterte das Schreiben,
stand der Haken trotzdem da, die Chili flammte, und ein Jubel konnte die Warnung im Glas
überdecken. Beim nächsten Start fehlte der Haken.

**A2.** War der gespeicherte Stand unlesbar (kaputtes JSON, kein Objekt, ein werfendes
`getItem`), startete `laden()` still mit dem Grundstand. Das nächste Speichern überschrieb
dann den alten Stand mit dem leeren.

## Entscheidung

- **Was man sieht, ist gespeichert.** Scheitert das Speichern beim Abhaken, springt der
  Haken zurück: `umschalten()` stellt `erledigt` und die Menge wieder her und gibt `false`
  zurück, `umschaltenUndZeichnen()` zeichnet und jubelt dann nicht. Dasselbe gilt für den
  Schritt eines Zählers (`zaehlen`) und das Abhaken eines Termins (`terminAbhaken`).
- **Ein unlesbarer Stand wird nie still überschrieben.** `speicherUnlesbar()` prüft beim
  Start; ist etwas da und nicht lesbar, steht es in `speicherSperre`. Solange sie steht,
  schreibt `speichern()` nichts und zeigt den Hinweis «Deine Daten sind nicht lesbar» mit
  zwei Wegen: «Rohtext kopieren» (unverändert, in die Zwischenablage) und «Neu anfangen»,
  das erst fragt und dann überschreibt. Der Hinweis kommt auch beim Start von selbst.
- Es bleibt beim einen Schlüssel `chillinal_v1`; ein zweiter Speicherplatz für den Rohtext
  wurde verworfen.

## Begründung

Der Nutzer hat beides so entschieden (Zurückrollen statt Markieren; Sperren und Fragen
statt eines zweiten Schlüssels). Ein Haken, der beim nächsten Start fehlt, zerstört das
Vertrauen in die Stärke. Ein unlesbarer Stand ist unwahrscheinlich, weil nur die App selbst
schreibt; die Folge wäre aber der Verlust aller Daten, und die Sperre kostet wenig.

**Nicht global zurückgerollt.** Ein Zurückrollen in `speichern()` selbst hätte auch die
Schreibvorgänge erfasst, die die App von allein auslöst: Das Ende eines Timers und die
Feier eines Rekords würden zurückgenommen und im nächsten Takt erneut versucht, jede
Sekunde mit Gong und Meldung. Deshalb rollen nur die Abhak-Wege zurück.

## Folgen

- Formulare, Löschen, Rückfall und Drang melden ein Scheitern schon jetzt ohne
  Erfolgsbestätigung, ihr Stand bleibt aber bis zum Neuladen im Speicher der Seite. Das
  ist der Rest von A3 und offen.
- Unter der Sperre lässt sich auch kein Sicherungscode einlesen; erst «Neu anfangen»,
  dann einlesen.
- Ein gültiges Objekt mit fremdem Schema sperrt nicht; das ist A4.
