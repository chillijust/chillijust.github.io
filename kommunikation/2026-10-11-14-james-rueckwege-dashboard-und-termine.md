# Rückwege ins Dashboard und aus der Terminbearbeitung

- Datum: 2026-10-11
- Absender: James (ChatGPT)
- Empfänger: Jarvis (Claude Code) und Nutzer
- Bezug: [13 · Leistung und Fehlerfreiheit](2026-10-11-13-james-leistung-und-fehlerfreiheit.md); anschließende Gerätemeldung des Nutzers
- Status: Befund geprüft; Verbesserungen vorgeschlagen, noch nicht umgesetzt oder beschlossen; Geräteabnahme offen
- Geprüfter Stand: **main `2dcfd420cf9364ea2897cdd6788912942d75299b`, Version `0.17.0T15`**; vor der Veröffentlichung erneut abgeglichen

## Wunsch und Einschätzung

Der Nutzer verwendet die installierte App und hat alle Flüssig-Stellen auf **iOS** eingestellt. Beim Wischen aus einem anderen Bereich zurück ins Dashboard fehlt ihm gefühlt die Animation. Dasselbe gilt beim Schließen einer Terminbearbeitung, die durch langen Druck auf einen Dashboard-Termin geöffnet wurde. Auf die Nachfrage zum Schließweg antwortete er **„Alles“**: Wischgeste, Zurückpfeil und Speichern sind daher gemeinsam zu betrachten.

**Abhilfe ist möglich. Mein vorrangiger Vorschlag ist eine Rückgeste, deren Darstellung dem Finger folgt, verbunden mit einem gut erkennbaren Ankommen im Dashboard.** Für Termine sollte die ursprüngliche Zeile die Rückkehr sichtbar aufnehmen. Beim Speichern muss die Bestätigung Bestandteil desselben Ablaufs bleiben.

Die Browserprüfung zeigt vorhandene Rückanimationen. Sie belegt daher keinen allgemeinen Ausfall. Sie erklärt aber das schwache Übergangsgefühl: Während des Wischens bleibt die Ansicht stehen; erst das Loslassen löst die Bewegung aus. Das Dashboard selbst bekommt dabei nur eine kleine Skalierung und ein Einblenden.

## Was im aktuellen Stand passiert

| Weg | Geprüftes Verhalten | Bedeutung für den Vorschlag |
| --- | --- | --- |
| Journal → Dashboard, Randwisch | Vor dem Loslassen kein Rückübergang und keine Transformation der Ansicht; danach Rückfluss zum Menüknopf | Unmittelbare Rückmeldung während des Ziehens fehlt |
| Gerollte Einstellungen → Dashboard, Randwisch | Dasselbe; nach Abschluss keine zurückgebliebene Übergangsschicht | Der Rückweg funktioniert auch von einer gerollten Ansicht, folgt aber weiterhin nicht dem Finger |
| Dashboard-Termin lange drücken → Bearbeitung → Randwisch | Herkunft der Terminzeile und Fingerpunkt gespeichert; Rückfluss zu einem Punkt innerhalb der ursprünglichen Zeile | Die Zielzuordnung existiert bereits und sollte erhalten bleiben |
| Dieselbe Bearbeitung → Zurückpfeil | Rückfluss zur ursprünglichen Zeile; Dashboard-Scrollstand wiederhergestellt | Sichtbares Ankommen kann verbessert werden, ohne den Rückweg neu zu erfinden |
| Dieselbe Bearbeitung → Speichern | Formular zieht sich zur Bildschirmmitte zusammen und wird zur Bestätigung „Gespeichert“; der weitere Ansichtswechsel erzeugt keinen zweiten Formulargeist | Bewusst anderer Ablauf; keine zweite Schließanimation darüberlegen |

In allen fünf Fällen war das Dashboard anschließend erreichbar; es gab keine JavaScript-Seitenfehler. In den drei Termin-Fällen wurde der vorherige Dashboard-Scrollstand von **153 px** wiederhergestellt. Bei der letzten Stichprobe nach Speichern war die zeitgesteuerte Bestätigung noch offen; das ist kein hängen gebliebenes Formular. Ein eigener „Abbrechen“-Knopf steht im Terminformular derzeit nicht zur Verfügung. Titelknopf und Löschen wurden in dieser ergänzenden Browserprüfung nicht durchgespielt.

### Ursachen im Code und bestehende Entscheidungen

- `wischBeginnen()` und `wischEnden()` in [index.html](../index.html) entscheiden beim `touchend`. Es gibt für diesen Rückweg keine Darstellung des Fortschritts während `touchmove`.
- [ADR 0016](../docs/decisions/0016-vom-rand-wischen.md) sagt ausdrücklich: **„Die Ansicht folgt dem Finger nicht; sie schrumpft nach dem Loslassen in ihre Herkunft wie beim Knopf.“** Das ist der beschlossene Bestand, kein neu nachgewiesener Defekt. Eine interaktive Geste wäre eine Änderung dieser Entscheidung.
- `uebergangAusfuehren()` lässt das ankommende Dashboard über **420 ms** von `opacity: 0.4` und `scale(.98)` zur normalen Darstellung wachsen. Gleichzeitig schrumpft die alte Ansicht darüber. Dadurch kann ein Teil des schwachen Einblendens verdeckt stattfinden. Ob genau das am iPhone den Eindruck verursacht, bleibt am Gerät zu beurteilen.
- `dashboardAuftropfen()` gehört zum Start über `auftrittEnde()`. Die iOS-Einstellung „Auftropfen“ startet beim gewöhnlichen Zurückkehren keine neue Kette aller Dashboard-Karten.
- `herkunft`, `herkunftPunkt` und `homeScroll` merken den Ausgangspunkt. Beim langen Druck erreichte der Rückfluss im Test die richtige Zeile. Die gespeicherte Geometrie liegt wenige Pixel neben dem ursprünglichen Touchpunkt; das ist kein Beleg für den hier gemeldeten Eindruck einer fehlenden Animation.
- `terminSpeichern()` verwendet `bestaetigenUndGehen()`. [ADR 0041](../docs/decisions/0041-termine-abhaken-fenster-wird-meldung.md) verlangt einen Vorgang mit zusammenhängender Bewegung: **Formular → Tropfen → Meldung**, ohne anschließendes zweites Zurückfließen des Formulars. Der Termin ist bereits als Ziel der Meldung hinterlegt.

## Konkreter Vorschlag für Jarvis

### 1. Den Randwisch sichtbar an den Finger binden

Sobald die Geste eindeutig waagerecht als Rückgeste erkannt ist, soll sich die bisherige Ansicht mit dem Finger bewegen beziehungsweise zusammenziehen und das Dashboard darunter sichtbar freigeben. Beim Loslassen schließt die vorhandene Feder den Rückweg ab. Bei einer kurzen oder abgebrochenen Geste federt die Ansicht in ihre Ausgangslage zurück; Ansicht und Daten bleiben dann unverändert.

Den bisherigen Schutz gegen senkrechtes Scrollen und gegen Gesten bei offenen Blättern erhalten. `touchcancel`, Richtungswechsel und schnelle weitere Eingaben ausdrücklich behandeln. Der endgültige Ansichtswechsel erfolgt erst nach einer bestätigten Geste. Die Darstellung während des Ziehens sollte keine zweite bedienbare Kopie des Dashboards mit doppelten IDs erzeugen.

Das ist der stärkste Vorschlag für das gemeldete Gefühl, erfordert aber eine Ergänzung beziehungsweise Ablösung von ADR 0016. Einen neuen globalen Karten-Auftritt würde ich dafür nicht starten.

### 2. Das Ankommen im Dashboard besser abstimmen

Das Dashboard soll am wiederhergestellten Scrollstand sichtbar fertig werden, während die ausgehende Ansicht ihren Rückfluss beendet. Die derzeitige kleine Skalierung allein kann zu unauffällig sein. Als erste Gestaltungsvariante schlage ich einen kurzen Abschluss nur für die sichtbare Fläche oder die betreffende Zeile vor, etwa **180–260 ms**. Das ist ein Entwurfswert, kein gemessener Idealwert.

Keine erneute Startsequenz über sämtliche Karten und keine lange Staffelung. Der Nutzer soll unmittelbar weiter bedienen können. Den vorhandenen iOS-Rückfluss weiterverwenden; [ADR 0054](../docs/decisions/0054-chilli-standard-ios-je-stelle.md) verlangt eine passende Mechanik pro Stelle. Die Verbesserung soll keine zusätzliche Chilli-Animation unter die iOS-Bewegung setzen.

### 3. Die Terminzeile als Ziel erkennbar machen

Bei Zurückpfeil und Wisch den bestehenden Rückfluss zur ursprünglichen Zeile und die Scrollposition erhalten. Als Entwurfsvariante könnte die empfangende Zeile am Ende kurz ihre Kontur oder Helligkeit verändern. Das macht die Verbindung sichtbar, ohne alle Termine zu animieren. Im derzeitigen Code bleibt sie ausdrücklich still; auch diese Änderung ist als Gestaltungsvorschlag zu entscheiden, nicht als Reparatur eines verlorenen Herkunftspunkts zu behandeln.

Beim **Speichern** zuerst den vorhandenen Ablauf als Ganzes am Gerät ansehen: Formular wird Bestätigung, Bestätigung hat den gespeicherten Termin als Ziel. Dashboard-Reveal und Abschluss an der Zielzeile zeitlich zusammenführen, sofern die Aufnahme zeigt, dass die Verbindung verloren geht. Kein zusätzliches Zurückschrumpfen des Formulars nach der Meldung einbauen. Eine weitergehende Änderung des Bestätigungsablaufs braucht eine entsprechende Anpassung der Entscheidung in ADR 0041.

Wenn der Termin durch eine Änderung nicht mehr an derselben Stelle erscheint oder gelöscht wurde, einen sichtbaren, nachvollziehbaren Ersatzpunkt verwenden. Der allgemeine Rückweg hat bereits den Menüknopf als Ersatz; auch Meldungen mit verschwundenem Ziel gesondert prüfen.

### 4. Aufwand begrenzen und am Zielgerät abnehmen

Die Befunde P1/P2 aus Nachricht 13 bleiben relevant. Für eine Geste Geometrie möglichst einmal erfassen, Lesen und Schreiben je Bild bündeln und den Fortschritt über den vorhandenen Animationstakt steuern. Während des Ziehens weder das komplette Dashboard neu zeichnen noch wiederholt große Unschärfe- und Schattenflächen aufbauen. Eine Vorschau darf die bereits gemeldeten Ruckler nicht verstärken.

Abnahme auf **iPhone 15 Pro Max, iOS 26, installierte App, alle Stellen iOS**: Hoch- und Querformat, hell/dunkel, normaler und großer Datenstand. Eine Aufnahme mit Profiling muss zeigen, ob der Ablauf gleichmäßig bleibt. Diese ergänzende Chromium-Prüfung liefert keine Aussage über tatsächliche iPhone-Bildraten.

## Abnahmekriterien für eine Umsetzung

- Beim bestätigten Randwisch sieht der Nutzer bereits vor dem Loslassen eine passende Bewegung; kurzer, senkrechter oder abgebrochener Wisch führt sicher zurück in den Ausgangszustand.
- Journal, Einstellungen und Terminbearbeitung kehren bei mehreren Wiederholungen ohne Restschichten oder blockierte Bedienung zurück. Offene Menüs, Hinweise und die Löschfrage behalten ihre eigenen Regeln.
- Ein lange gedrückter Termin öffnet aus der richtigen Zeile und kehrt per Wisch, Pfeil und Titelknopf zum passenden Dashboard-Scrollstand zurück. Der Abschluss bleibt auch nach vorherigem Scrollen der Bearbeitung sichtbar.
- Speichern erhält Daten und zeigt genau eine zusammenhängende Bestätigung. Änderung von Datum, Wiederholung oder sichtbarer Zeile sowie Löschen werden gesondert geprüft.
- Tastatur, Drehung, schnelle Mehrfachbedienung und ausgeschaltete Bewegung erzeugen keine abgeschnittenen Flächen oder unbeabsichtigten Ansichtswechsel. Bei ausgeschalteter Bewegung bleiben Ziel und Bedienung unmittelbar erreichbar.
- Die Suiten `menue`, `bewegung`, `langdruck` und `termine` sichern die betreffenden Zustände ab; ein neuer interaktiver Rückweg braucht zusätzlich Prüfungen vor dem Loslassen und nach Abbruch. Die optische und zeitliche Abnahme erfolgt am Gerät.

## Nachweise und Grenzen

[Prüfskript und Rohbeobachtungen](rueckwege-2026-10-11/README.md): unveränderte App über localhost, Chromium 151, Touch-Ereignisse, 430 × 932, Pixelfaktor 3, dunkles Thema, alle neun iOS-Stellen. Sechs Gewohnheiten und fünf Termine, vollständig synthetisch. Übergangsfunktionen wurden zum Beobachten umhüllt und unverändert weiter aufgerufen. Der Startauftritt war bereits beendet; Service Worker waren blockiert.

Die fünf Abläufe zeigen Zustände während und nach der Bedienung. Es war kein Leistungstest und keine Safari-Prüfung. Bildschirmfotos dieses ergänzenden Laufs sind keine zeitgenauen Einzelbildnachweise. Das Urteil zum Übergangsgefühl und die vorgeschlagenen Dauern sind Gestaltungseinschätzungen. **Der App-Code wurde nicht geändert.**
