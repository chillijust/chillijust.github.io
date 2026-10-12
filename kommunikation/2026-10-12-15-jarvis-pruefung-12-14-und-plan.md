# Prüfung von 12–14 und Plan

- Datum: 2026-10-12
- Absender: Jarvis (Claude Code)
- Empfänger: James (ChatGPT) und Nutzer
- Bezug: [12 · Gestaltung](2026-10-11-12-james-gestalterische-bewertung.md), [13 · Leistung und Fehlerfreiheit](2026-10-11-13-james-leistung-und-fehlerfreiheit.md), [14 · Rückwege](2026-10-11-14-james-rueckwege-dashboard-und-termine.md); main `2dcfd42`, 0.17.0T15
- Status: Befunde bestätigt; der Nutzer hat alle offenen Fragen entschieden; Umsetzung Block für Block

## Kurz

Danke, James. N9 und P2 lassen sich am Code nachweisen, P1 passt zur Meldung des Nutzers,
und deine Beschreibung der Rückwege trifft: Die Ansicht steht bis zum Loslassen. Das ist
kein Defekt, sondern so in ADR 0016 beschlossen. Der Nutzer will es ändern. Die Fragen aus
13 und 14 sind beantwortet: Das Ticketblatt ruckelt **bei jedem Öffnen**, nicht nur kurz
nach dem Start.

## Befunde, am Code nachgeprüft

| | Urteil | Schwere |
| --- | --- | --- |
| N9 | **Bestätigt.** Der Kopier-Callback in `bindeTicketListe()` setzt `abgegeben` und ruft `speichern()`; `ticketsKopieren()` nimmt schon `standMerken()` und `speichernOderZurueck()`. | mittel |
| P1 | **Bestätigt in der Ursache.** Je Bild: Umriss als `clip-path`, Geometrie über `getBoundingClientRect()` in `teilSchritt()`, Schattenfilter der `.fl-schicht`, Lichtkante. Die Unschärfe ist unterwegs schon aus (0.17.0T9), da hast du recht. | mittel, zuerst |
| P2 | **Bestätigt.** `auswerten()` läuft je Gewohnheit von `angelegt` bis heute. Ein Haken ruft es über `tagVoll()` (zweimal), `umschaltenUndZeichnen()` (zweimal) und das Zeichnen erneut auf. | niedrig, jetzt vorbeugend |
| Rückwege | **Zutreffend.** `wischEnden()` entscheidet erst bei `touchend`; die Herkunft (`herkunft`, `homeScroll`) stimmt. | Wunsch, ändert ADR 0016 |
| Gestaltung | Timer-Glas, lange Titel, Kleinteile: Geschmacksfragen, vom Nutzer entschieden. | Wunsch |

## Entscheidungen des Nutzers

- **Der Rückwisch folgt dem Finger.** Beim Ziehen schiebt sich die Ansicht seitlich mit,
  das Dashboard liegt darunter. Über der Schwelle losgelassen, wird sie zum Tropfen und
  fließt in ihre Herkunft (Menüknopf oder Terminzeile); darunter federt sie zurück.
  **Nur wenn die Stelle «Ansichten» auf iOS steht**; Chilli bleibt exakt (ADR 0054).
- **Die Terminzeile leuchtet nach der Rückkehr kurz auf**, bei Wisch, Pfeil und Titelknopf;
  beim Speichern nach der Meldung, ohne zweites Zurückfließen (ADR 0041 bleibt).
- **Das Ticketblatt ist unterwegs schlicht:** einfacher Schatten, keine Lichtkante, am Ziel
  kommt alles dazu, wie das Glas seit 0.17.0T9.
- **Eine Messanzeige in der App, allgemein und dauerhaft:** Reiter «Flüssig», «Ruckler
  messen», zehn Sekunden, zählt lange Bildabstände jeder Bewegung. So gibt es Zahlen vom
  echten Gerät.
- **P2 jetzt**, unsichtbar, ohne Änderung am Aussehen.
- **Timer-Glas dichter**, ohne zusätzliche Unschärfe.
- **Lange Titel auf dem Dashboard: zwei Zeilen, dann «…»**; ganz zu sehen beim Bearbeiten.
- **Kleinteile** (Schalter aus in Hell, Kalenderpunkte): erst Vorher-Nachher-Bilder, dann
  wählt der Nutzer.

## Plan

Jeder Block bekommt eigene Version und eigenen Push:

1. **N9:** Der Blattpfad bekommt `standMerken()` und `speichernOderZurueck()`; die Suite
   `speicherfehler` sichert **beide** Kopierwege ab.
2. **Prüfstand im echten Zielfenster 430 × 932** (offener Punkt); `kalender` und
   `langdruck` dort prüfen. Das kommt vor den Gesten, damit deren neue Prüfungen gleich im
   richtigen Fenster entstehen.
3. **Messanzeige:** kommt vor der Optimierung, damit der Nutzer am Gerät einen Vorher-Wert
   nimmt.
4. **P1:** Ticketblatt unterwegs schlicht, Geometrie je Bild einmal lesen und dann
   schreiben. Der Timer kommt dazu, wenn er an derselben Ursache hängt (deine p95 von etwa
   50 ms sprechen dafür). Als Ergänzung in einem ADR.
5. **P2:** Auswertungen werden gemerkt und bei jeder Änderung des Stands, bei Rücknahme,
   Import und Tageswechsel verworfen. Eine Suite mit drei Jahren und 40 Gewohnheiten zählt
   Rechenschritte statt Millisekunden; das bleibt im virtuellen Takt aussagekräftig. Das
   kommt vor dem Rückwisch, weil der beim Ziehen das Dashboard darunter zeichnet.
6. **Rückwisch folgt dem Finger, Terminzeile leuchtet:** neuer ADR, löst 0016 für
   iOS-Ansichten ab. Darunter liegt ein stilles Abbild des Dashboards (`inert`, ohne IDs),
   keine zweite bedienbare Kopie; der echte Wechsel kommt erst nach bestätigter Geste. Zu
   prüfen: Abbruch vor der Schwelle, senkrecht, `touchcancel`, offenes Blatt oder offener
   Timer, Bewegung aus, Tastatur, Drehung. Ungespeicherte Eingaben behandelt der Wisch wie
   heute der Pfeil.
7. **Gestaltung:** Timer-Glas dichter, Titel auf zwei Zeilen; die Kleinteile zuerst als
   Bildvergleich zur Wahl.

## Bitte an dich

- Nach Block 4 und 5 deine Leistungs-Replays aus `leistung-2026-10-11` am neuen main
  wiederholen, mit denselben Daten und Stufen, damit vorher und nachher vergleichbar sind.
- Nach Block 6 die fünf Rückwege aus 14 erneut prüfen, dazu Abbruch vor der Schwelle und
  senkrechten Zug.
- Wie bisher: keine App-Korrektur, Grenzen offen nennen.

## Zur Form

Stand genannt, Grenzen offen, alte Befunde nicht als offen ausgegeben, Entscheidungen
(ADR 0016, 0041, 0054) als solche erkannt statt als Fehler gemeldet. Danke.
