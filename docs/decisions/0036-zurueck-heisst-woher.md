# 0036 · Zurück heißt: woher man kam

**Stand:** angenommen · 2026-08-08

## Ausgangslage

`zurueckGehen()` ging aus jeder Ansicht nach Home. Für die Übungen stimmte das — dort
gibt es nur einen Weg hinein. Für die Menüansichten stimmte es nicht: Aus der Bilanz
führen Knöpfe zu den Fakten und zur Sicherung. Wer sie nahm, kam mit «Zurück» nicht in
die Bilanz, sondern an den Anfang und musste den Weg neu gehen.

Die drei «Zurück»-Knöpfe **innerhalb** der Menüansichten hatten dasselbe Problem in
anderer Form: Sie riefen `setTab(letzterTab)` und landeten in der zuletzt offenen
*Übung* — also irgendwo, nur nicht dort, woher man kam.

## Entscheidung

Ein Stapel (`ansichtStapel`) merkt sich die Ansichten davor. `setTab(name, zurueck)`
legt ab, `zurueckGehen()` nimmt herunter. Pfeil, Randwischgeste und die drei
«Zurück»-Knöpfe gehen denselben Weg.

Zwei Regeln halten den Stapel klein:

- **Home räumt ihn leer.** Dort endet jeder Weg.
- **Wer umkehrt, nimmt den Schritt zurück.** Steuert man die Ansicht an, aus der man
  gerade kam, wird sie vom Stapel genommen, statt einen zweiten Eintrag daraufzusetzen.
  Ein Hin und Her zwischen zwei Ansichten hinterlässt so keinen Rest.

`STAPEL_MAX` (12) ist nur die Reißleine.

## Verworfen: beim Wiedersehen abschneiden

Der erste Entwurf schnitt den Stapel überall dort ab, wo die angesteuerte Ansicht schon
einmal stand — nicht nur an der Spitze. Das hielt ihn ebenso klein, verlor aber Schritte:

```
Home → Tippen → Tickets → Lernsets → Tickets
```

Das zweite «Tickets» schnitt bis zum ersten zurück, und «Zurück» führte nach *Tippen* —
obwohl man unmittelbar aus *Lernsets* kam. Ein Bestandstest fiel darüber, und zwar zu
Recht: Der Nutzer erwartet den letzten Schritt, nicht den letzten Besuch. Nur die Spitze
zu prüfen erfüllt beides.

## Folgen

- Der Stapel gehört wie jeder Ansichtszustand in `ansichtenZuruecksetzen()` (ADR 0017);
  sonst führte der Rückweg nach dem Wiederherstellen einer Sicherung ins Leere.
- Die Detailansicht der Bilanz behält ihren eigenen Zwischenschritt **vor** dem Stapel:
  Erst schließt sie, dann geht es weiter zurück.
- `letzterTab` bleibt, hat aber nur noch eine Aufgabe: den Bezug eines Tickets zu nennen,
  wenn man aus der Ticketliste heraus meldet.
- Drei Bestandstests prüften den alten Weg («Zurück führt in die Übung davor») und
  wurden auf die neue Bedeutung umgestellt.
