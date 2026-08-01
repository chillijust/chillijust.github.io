# 0004 · Abgabe erst nach Bestätigung, steuerbar über Einstellungen

**Status:** angenommen · 2026-08-01

## Kontext

In „Üben" wurde eine Antwort in dem Moment gewertet, in dem eine Option angetippt wurde;
in „Übersetzen" sobald das letzte Wort lag. Auf dem Telefon führt das zu Fehlwertungen
durch versehentliche Berührungen, und eine gelegte Reihenfolge ließ sich nicht mehr
korrigieren. Ob eine Abgabe auch unvollständig möglich sein soll, ist Geschmackssache —
gegen eine feste Wahl spricht, dass beide Varianten ihre Berechtigung haben.

## Entscheidung

1. Beide Rubriken kennen einen ausdrücklichen Schritt „Bestätigen". Bis dahin ist die
   Auswahl änderbar.
2. In „Übersetzen" entfernt ein Tipp auf ein gelegtes Wort genau dieses Wort; die
   Rücktaste (letztes Wort) bleibt daneben bestehen.
3. Das Verhalten ist über einen Einstellungsbereich schaltbar, erreichbar über das
   Zahnrad in der Kopfzeile. Die Schalter liegen in `state.settings` und werden mit dem
   Lernstand gespeichert.

## Begründung

- Ein Bestätigungsschritt kostet einen Tipp, verhindert aber die Fehlwertung — bei einem
  Trainer, dessen Leitner-Stufen von der Korrektheit abhängen, ist das der bessere Tausch.
- Der Streit „vollständig oder unvollständig abgebbar" wird nicht entschieden, sondern
  dem Nutzer überlassen. Die Vorgabe ist die tolerantere Variante: abgeben ist ab dem
  ersten gelegten Element möglich, eine unvollständige Lösung zählt als falsch. So
  verrät die Oberfläche nichts über die Länge der Lösung.
- Zahnrad statt fünftem Tab: Die Tab-Leiste ist auf dem iPhone bereits voll; ein fünfter
  Eintrag läge außerhalb des sichtbaren Bereichs.

## Folgen

- `state.settings` darf nie als Ganzes aus dem Speicher übernommen werden, sonst fehlen
  bestehenden Ständen später ergänzte Schalter. Dafür gibt es `mergeState()`, das
  gleichermaßen beim Laden und beim Wiederherstellen einer Sicherung greift.
- Einstellungen gelten als Vorliebe, nicht als Fortschritt: „Fortschritt zurücksetzen"
  lässt sie unberührt.
- Jede künftige Verhaltensfrage dieser Art hat jetzt einen naheliegenden Ort — mit dem
  Risiko, dass der Bereich zuwächst. Ein Schalter braucht eine Begründung, keine bloße
  Möglichkeit.
