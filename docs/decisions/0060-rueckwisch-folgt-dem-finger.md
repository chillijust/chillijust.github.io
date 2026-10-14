# 0060 · Der Rückwisch folgt dem Finger, die Terminzeile leuchtet

*2026-10-13 · Stand 0.17.0T27, Gestalt beim Ziehen 0.17.0T28 · Block 6 aus Nachricht 15 (James, 14) · löst 0016 für
Ansichten auf iOS ab; ergänzt 0041*

## Ausgangslage

Seit ADR 0016 wirkt der Wisch vom linken Rand erst beim Loslassen: Während des Ziehens
steht die Ansicht still, danach schrumpft sie in ihre Herkunft. Am Gerät fehlte dem Nutzer
damit die Bewegung — «gefühlt keine Animation» (James, Nachricht 14). Wer einen Termin
lange gedrückt hatte, sah bei der Rückkehr auch nicht, an welche Zeile er zurückkam.

## Entscheidung

- **Steht «Ansichten» auf iOS, folgt die Ansicht dem Finger und wird dabei schon zum
  Tropfen.** Ab `ZUG_AB` = 12 px waagerecht zieht sie sich zum rechten Rand hin zusammen —
  zum Menüknopf —, bis auf gut die Hälfte (`ZUG_KLEIN`), und rundet ihre Ecken (`ZUG_RUND`);
  sie bleibt dabei ganz im Bild. Ihren Schatten trägt eine eigene Fläche darunter. In
  0.17.0T27 schob sie sich nur zur Seite: Wer bis an den Rand zog, ließ sie draußen los, und
  am Gerät sah man keinen Tropfen mehr (Wahl des Nutzers in 0.17.0T28).
  Darunter liegt das Dashboard als **stilles Abbild** (`abbildDashboard`): gezeichnet wie zu
  Hause, in einer Schattenwurzel — keine doppelten IDs, `inert`, ohne Zeiger —, so weit
  gerollt, wie es beim Weggehen war. Es entsteht schon, wenn der Finger am Rand aufliegt,
  verdeckt von der Ansicht; der erste Schritt verschiebt nur noch.
- **Losgelassen über `WISCH_WEG` = 70 px** (oder schnell nach rechts, `ZUG_SCHWUNG`) wird
  die Ansicht so, wie sie steht — geschrumpft, mit ihrem Kopf — weiter als Tropfen in ihre Herkunft: Menüknopf,
  Kachel oder Terminzeile, wie beim Pfeil. Das Dashboard blendet nicht noch einmal ein; es
  stand schon da. **Darunter federt sie zurück**, ebenso bei `touchcancel`, einem zweiten
  Finger, einer Drehung oder einem Blatt, das unterdessen aufgeht. Erst die bestätigte
  Geste wechselt die Ansicht.
- **Senkrecht zuerst ist Blättern:** Dieser Finger zieht nichts und führt auch beim
  Loslassen nicht zurück.
- **Wie bisher (ADR 0016)** — die Geste wirkt beim Loslassen — bleibt es auf Chilli, bei
  Bewegung aus, bei offener Tastatur, mit Ungespeichertem im Reiter «Flüssig» (der Pfeil
  fragt dort) und wo der Rückweg nicht nach Hause führt (`rueckZiel`, etwa aus dem Export).
- **Eine Terminzeile, in die eine Ansicht oder Meldung zurückkommt, leuchtet kurz in Blau**
  (`zeileLeuchtet`, `LEUCHT_DAUER` 900 ms) statt zu nicken — nach Wisch, Pfeil und
  Titelknopf, auf iOS und Chilli. Nach dem Speichern leuchtet sie, wenn die Meldung in sie
  fließt; die Ansicht fließt nicht ein zweites Mal zurück (ADR 0041 bleibt).
- Jeder Geist und das Abbild teilen ein einmal gelesenes Stylesheet (`geistStilGeben`);
  vorher las jeder die rund 180 KB neu ein.

## Begründung

Eine Geste, die sichtbar dem Finger folgt, ist die Bewegung, die man von iOS kennt; das
Abbild statt einer zweiten echten Seite hält Ids, Fokus und Ereignisse eindeutig. Die
Schwelle bleibt die aus Chillingo, damit sich der Wisch nicht anders anfühlt als vorher,
nur sichtbarer. Wo der Wisch etwas anderes tun müßte als nach Hause zu führen, bleibt die
geprüfte Mechanik.

## Folgen

- ADR 0016 gilt weiter für Chilli und die genannten Ausnahmen; der Wisch vom rechten Rand
  und der auf dem Dashboard (ADR 0023, 0025) bleiben unverändert.
- Ob iOS am Rand selbst eine Geste beansprucht und wie flüssig der Zug läuft, zeigt nur das
  Gerät («Ruckler messen»).
- Suite: `rueckzug` (Zug, Abbild, Abbruch, Ausnahmen, Leuchten); `menue` (W1–W13) prüft die
  Geste beim Loslassen weiter.
