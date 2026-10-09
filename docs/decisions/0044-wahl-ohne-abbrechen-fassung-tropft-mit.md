# 0044 · «Hinzufügen» ohne «Abbrechen»; die Zeile «Neue Fassung» tropft mit auf

*2026-10-08 · zwei Tickets vom Gerät (App-Stand 0.13.0T3 und 0.13.0) · Version 0.13.1T ·
ändert 0025, 0042 · ergänzt 0029*

## Ausgangslage

- Das Fenster «Hinzufügen» im Kalender trug unter Termin, Gewohnheit und Abgewöhnen noch
  «Abbrechen». Abgebrochen wird längst mit einem Tipp daneben (0026); der Knopf war doppelt.
- Beim Kaltstart erschien die Zeile «Eine neue Fassung ist da» mit einem Schlag mitten im
  Auftritt. Ursache: `#swNeu` steht zwischen Kopf und `#ansicht`. Der Auftritt hielt nur
  `#ansicht` und die Knöpfe unsichtbar, und `dashboardAuftropfen` sammelte nur die Kinder von
  `#ansicht` — die Zeile war in keiner der beiden Listen. Der Service Worker meldet die
  wartende Fassung gerade in den ersten Sekunden, also fast immer während des Schriftzugs.

## Entscheidung

- **Eine Wahl trägt nur ihre Knöpfe.** `opt.wahl` blendet die ganze Knopfleiste aus, nicht
  nur «OK»; ab bricht, wer aufs Blatt tippt. `#hinweisNein` heißt nur noch «Nein» oder, was
  die Frage nennt — die Ausnahme «Abbrechen» für die Wahl aus 0042 entfällt.
- **Die Zeile «Neue Fassung» gehört zum Auftritt.** Solange er läuft, ist sie unsichtbar wie
  die Ansicht; danach tropft sie als erste auf, im Takt der Karten. Meldet sie sich erst
  später, tropft sie allein auf — dieselbe Perle (`perleAuf`), aus `dashboardAuftropfen`
  herausgelöst.

## Begründung

Was es schon als Geste gibt, braucht keinen Knopf, der Platz nimmt. Und was beim Kaltstart
erscheint, gehört zum Auftritt — sonst ploppt es (0007).

## Folgen

- Suiten: `nachschliff` A2, A2a, A5, A5a, A5c (A5 ist jetzt der Tipp daneben); `auftritt`
  A14–A16.
- Version 0.13.1T: gelesen wird alles wie bisher.
- Weiter ohne Bewegung: «Später» läßt die Zeile mit einem Schlag gehen; sie ist ein
  Hinweis, den man selbst wegtippt.
