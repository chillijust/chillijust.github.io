# 0075 · Defizite zeigen, die Übersicht einrichten

**Stand:** angenommen · 2026-08-15 · aus zwei Tickets (Etappen 5 und 6 von 15)
**Ergänzt:** ADR 0066 (die Reihenfolge ist der Weg) · ADR 0022 (Bilanz im Detail)

## 1 · Die Bilanz zeigt, woran es hakt

**Befund:** «Defizite in Bilanz anzeigen. Betreff sagt schon alles.»

Die App wusste bereits vier Dinge über die eigenen Schwächen und hat sie für
sich behalten — verteilt über drei Stellen im Zustand:

| Quelle | woher | seit |
| --- | --- | --- |
| Zurückgefallene Wörter | `state.patzer` | ADR 0033 |
| Verwechslungen | `state.verwechselt` | ADR 0056 |
| Zeichen unter der Schwelle | `state.abcBox` | ADR 0024 |
| Überfälliges | `lastSeen` / `satzSeen` | ADR 0015 |

**Entscheidung:** Ein Abschnitt «Defizite» in der Bilanz-Übersicht, **vor** dem
Lernweg: Was quer liegt, gehört nach oben — darunter steht, wie weit man ist,
und das liest sich anders, wenn man weiß, was klemmt.

Drei Regeln dafür:

- **Jede Zeile nennt einen Grund.** «3 zurückgefallen» ist eine Zahl; «dreimal
  hintereinander falsch geschrieben und damit den Satz geschlossen» ist eine
  Auskunft.
- **Jede Zeile nennt einen Weg dorthin.** Ein Defizit ohne Ausgang ist ein
  Vorwurf; mit Ausgang ist es ein Vorschlag. Wo die zuständige Übung gerade
  gesperrt ist — das Power-Training braucht drei Gefallene —, entfällt der
  Knopf, statt ins Leere zu führen.
- **Ein Ausrutscher ist kein Muster.** Verwechslungen zählen erst ab dem
  zweiten Mal. Sonst stünde nach jedem Fehlgriff ein Defizit da, und der
  Abschnitt wäre nach einer Woche Rauschen.

Der Leerzustand meldet ausdrücklich, dass nichts quer liegt — ein Abschnitt,
der bei guter Lage einfach verschwindet, sieht aus, als sei er kaputt.

## 2 · Drei Rubriken statt acht Schaltern

**Befund:** «Die Option soll ein eigenes Fenster bekommen … Rubriken: außerdem
fällig (umbenennen), weitere Übungen, versteckt. Per Drag and Drop … ebenfalls
einen Knopf *automatisch verteilen*.»

Bis 2.4.16 war das eine Reihe von acht Chips in den Einstellungen. Sie konnte
genau zwei Dinge: zeigen und wegräumen. Die Ordnung oben blieb der App
überlassen.

**Entscheidung:** Eine eigene Ansicht `einrichten` mit drei Kästen, in die man
Zeilen zieht. Der Weg dorthin liegt in **Einstellungen · Darstellung**.

### Was gespeichert wird

| | | |
| --- | --- | --- |
| `settings.homeAus` | Array | was versteckt ist (unverändert seit ADR 0066) |
| `settings.homeOben` | `null` **oder** Array | `null` = automatisch, Array = von Hand |

**Gespeichert wird das Abweichende, nicht der Bestand.** Eine neue Übung taucht
damit von selbst unter «Weitere Übungen» auf, statt still zu fehlen — dieselbe
Regel, aus demselben Grund wie bei `homeAus`. Beide stehen **nicht** im
Sicherungscode: Sie gehören zum Gerät.

### Warum «Meine Auswahl» stehen bleibt, auch ohne Arbeit

Auf Nachfrage entschieden. Die Automatik überspringt Gesperrtes und Leeres und
nimmt höchstens drei — sie beantwortet die Frage «was ist jetzt zu tun». Eine
Anordnung von Hand beantwortet eine andere: «was will ich sehen». Verschwände
eine Kachel, die der Nutzer eben hingezogen hat, weil dort gerade nichts
wartet, sähe das aus wie ein Fehler. Die Höchstzahl gilt für Angeheftetes
darum ebenso wenig.

Aus demselben Grund gilt die Ausnahme für die Empfehlung nur im automatischen
Fall: Die Automatik wiederholt nicht, was sie selbst gerade vorgeschlagen hat;
eine Anordnung von Hand wird respektiert.

### «Weitere» heißt weitere

Der untere Bereich hieß «Alle Übungen» und enthielt auch, was oben schon stand.
Mit dem neuen Namen wäre das falsch — er trägt jetzt genau die Übrigen. **Nichts
steht zweimal auf der Seite**, und die Suiten prüfen das.

Die eine Ausnahme bleibt das Tutorial: Acht seiner Schritte zeigen auf je eine
Kachel, und ein Wähler, der ins Leere zeigt, ist ein stiller Fehler (ADR 0051).
Solange der Scheinwerfer läuft, stehen alle acht unten.

### Ziehen

Zeigerereignisse statt Touch-Ereignissen: Ein Satz Zuhörer deckt Finger, Maus
und Stift ab, und `setPointerCapture` hält den Zeiger bei der Zeile, wenn sie
unter ihm wegrutscht. Zwei Dinge, die man leicht vergisst und die den ganzen
Zug unbrauchbar machen:

- **`touch-action: none`** auf der Zeile — sonst scrollt die Seite unter dem
  Finger, statt dass etwas gezogen wird.
- **Eine Schwelle von acht Pixeln**, bevor aus dem Aufsetzen ein Ziehen wird —
  sonst verlöre jeder Tipp auf einen der beiden Pfeile sein Ereignis.

Die Zielrubrik wird über die **Kästen** bestimmt, nicht über `elementFromPoint`:
Die gezogene Zeile läge sonst immer selbst darunter.

**Dazu zwei Pfeile je Zeile.** Ziehen ist die verlangte Bedienung, aber es ist
auch die, die auf einem fremden Gerät oder mit einer Tastatur ausfallen kann.
Eine Einrichtung, die sich nur ziehen lässt, wäre für den, bei dem das hakt,
gar keine.

## Folgen

- Neue Suite `einrichten` (29 Prüfungen), darunter ein nachgestellter Zug über
  Zeigerereignisse und die Zusage, dass ein bloßer Tipp nichts verschiebt.
- **Drei bestehende Suiten mussten mit** — `maskottchen`, `schreibung`,
  `rubriken` zählten Kacheln in `#homeAlle` und gingen davon aus, dass dort alle
  acht stehen. Sie zählen jetzt über die ganze Seite und prüfen zusätzlich, dass
  **nichts doppelt** steht.
- Eine der drei prüfte die Reihenfolge über die ersten fünf Einträge — also über
  den **Platz**. Genau davor warnt ADR 0066, und es hat wieder zugeschlagen.
