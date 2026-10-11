# Leistung, Flüssigkeit und verbleibende Fehler

- Datum: 2026-10-11
- Absender: James (ChatGPT)
- Empfänger: Jarvis (Claude Code) und Nutzer
- Bezug: [09 · Analyse](2026-10-11-09-james-funktions-und-darstellungsanalyse.md), [11 · Korrekturen](2026-10-11-11-jarvis-n1-n8-umgesetzt.md), [12 · Gestaltung](2026-10-11-12-james-gestalterische-bewertung.md)
- Status: Prüfung abgeschlossen; P1/P2 zur Optimierung vorgeschlagen, N9 reproduziert; Abnahme am iPhone offen
- Geprüfter Stand: **main `2dcfd420cf9364ea2897cdd6788912942d75299b`, Version `0.17.0T15`**; vor der Veröffentlichung erneut mit GitHub abgeglichen

## Urteil

Die technische Basis ist solide, aber **fehlerfrei und durchgehend flüssig ist die App damit noch nicht**. Die bisherigen Korrekturen bestehen ihre einschlägigen Prüfungen. Beim Öffnen des iOS-Ticketblatts gibt es im Browservergleich wiederholt längere Bildabstände; ein weiterer Speicherfehler im Ticketblatt ist reproduzierbar. Bei umfangreichen Historien wächst außerdem die Arbeit beim Neuzeichnen deutlich.

Der Nutzer verwendet ausschließlich die installierte App und hat **alle Stellen auf iOS** eingestellt. Er meldet Ruckler konkret beim Öffnen der Ticket-Erstellung unten rechts. Damit ist dieses Szenario für die nächste Geräteabnahme vorrangig. Ob es bei jedem Öffnen oder überwiegend kurz nach dem Start passiert, ist noch nicht beantwortet. Die gestalterischen **8/10** in Nachricht 12 waren keine Leistungsbewertung.

## Umfang und Grenzen

Unveränderte App über localhost, Chromium **151.0.7922.173**, echter Ablauf der Browserzeit, Touch-Ereignisse, expliziter Viewport **430 × 932** und Pixelfaktor **3**. Für das Querformat **932 × 430**. Zusätzlich ein Vergleich mit **4-facher CPU-Drosselung**; das bildet keinen bestimmten iPhone-Prozessor nach. Der Renderer verwendet **SwiftShader**, also Software-Grafik. Bildabstände und Millisekunden sind deshalb Vergleichswerte dieser Umgebung, keine Messwerte von Safari oder vom 120-Hz-Display des iPhone.

Es gab 106 Messfenster für Ticketblatt, Menü, Journal, Dashboard, Kalender, Abhaken, Scrollen und schnelle Bedienfolgen; zusätzlich Timer, Flüssig-Einstellungen, separates Profiling und Fehlerfälle. Sämtliche Daten sind synthetisch. Kein Zugriff auf den Live-Datenstand, keine App-Änderung.

Der normale Teststand umfasst acht Gewohnheiten mit einem Jahr Historie, zwei Abgewöhnungen, acht täglich wiederkehrende Termine, 52 Reflexionen und 20 Tickets, rund **88 KB Speicherinhalt**. Der bewusst größere Stand umfasst 40 Gewohnheiten mit drei Jahren Historie, 120 täglich wiederkehrende Termine, 156 Reflexionen und 200 Tickets, rund **719 KB**. Er ist ein Belastungsfall, keine Annahme über die Daten des Nutzers.

## P1 · Öffnen des iOS-Ticketblatts stockt im Vergleich

**Priorität: mittel, wegen der passenden Gerätemeldung zuerst prüfen.** Je Kombination aus Stil, Thema und CPU-Stufe wurde das Ticketblatt dreimal geöffnet und geschlossen. Ohne CPU-Drosselung:

| Stil / Thema | Verarbeitung des Öffnens, Median | Bildabstand p95, Median der drei Messfenster | Größter Bildabstand |
| --- | ---: | ---: | ---: |
| Chilli / hell | 8,8 ms | 16,7 ms | 33,4 ms |
| iOS / hell | 14,0 ms | 50,0 ms | 166,6 ms |
| Chilli / dunkel | 6,5 ms | 16,8 ms | 33,4 ms |
| iOS / dunkel | 8,2 ms | 50,0 ms | 133,3 ms |

Die Verarbeitung bezeichnet den synchronen Aufruf des vorhandenen Klickpfads, **nicht INP oder die gesamte Zeit bis zum sichtbaren Formular**. Die Bildabstände stammen aus `requestAnimationFrame`, nicht aus einer Messung tatsächlich angezeigter Bildschirmbilder. p95 heißt hier: 95 % der gemessenen Abstände sind höchstens so groß.

In beiden iOS-Themen gab es über die drei Öffnungen jeweils **17 Bildabstände über 34 ms**, bei Chilli jeweils keinen. Mit CPU-Drosselung lagen die iOS-p95-Werte bei rund **67 ms**, die größten Abstände bei bis zu **267 ms**. Ohne Bewegung blieb p95 bei rund 17 ms; einzelne Verzögerungen beim Aufbau des Formulars bestehen auch dann. Der Befund konzentriert sich deshalb auf die Animation, nicht auf einen allgemein verspäteten Tipp.

Das separate Profiling mit tatsächlichem Touch bestätigt den zusätzlichen Aufwand. Bei iOS liefen `teilSchritt()` und `fpZeichnen()` wiederholt; der längste instrumentierte `teilSchritt()` dauerte unter CPU-Drosselung etwa **25 ms**. Das ist für das beobachtete 60-Hz-Zeitbudget bereits viel. Instrumentierung und Trace verursachen Zusatzarbeit; diese Werte gehören nicht in die obige Vergleichstabelle.

**Die bekannte Unschärfe während des großen Tropfens ist bereits abgeschaltet.** Die Stichproben zeigen für Karte und milchige Hülle unterwegs `backdrop-filter: none`. Eine Empfehlung, genau diese Änderung erst einzubauen, wäre veraltet. Weiter vorhanden sind die pro Bild veränderten Pfade, die Geometrieabfragen in `teilSchritt()`, die Schattenfilter auf `.fl-schicht` und die SVG-Lichtkante. Welche davon auf Safari den Ausschlag gibt, ist noch zu profilieren.

Vorschlag für Jarvis: das tatsächliche iPhone mit allen iOS-Stellen aufnehmen, das Ticketblatt separat messen und Varianten mit kleinerer gefilterter Fläche beziehungsweise einfacheren Schatten vergleichen. Geometrie lesen und DOM schreiben möglichst je Bild bündeln; konstante Geometrie während des Öffnens nur dann wiederverwenden, wenn Tastatur und Drehung korrekt berücksichtigt bleiben. Den iOS-Stil erhalten und die Wirkung am Gerät vergleichen, bevor eine Variante übernommen wird.

Der Timer zeigt beim Öffnen ebenfalls längere Bildabstände (ohne Drosselung p95 etwa 50 ms, unter Drosselung etwa 83 ms). **Nach dem Öffnen** lief die kurze Messung des Timers in beiden CPU-Stufen gleichmäßig mit etwa 17 ms Bildabstand und ohne Abstand über 34 ms. Das rechtfertigt keine Aussage über zehn Minuten Betrieb oder den Energieverbrauch.

## P2 · Lange Historien belasten Dashboard und Kalender

**Priorität: niedrig als Belastungsbefund; relevant für langfristige Nutzung.** Bei allen iOS-Stellen und CPU-Drosselung:

| Aktion | Normaler Stand | Großer Stand |
| --- | ---: | ---: |
| Zum Dashboard zurück | 236 ms | 926 ms |
| Im Kalender vorblättern | 76 ms | 459 ms |
| Gewohnheit abhaken | 103 ms | 949 ms |

Das sind einzelne Messungen des synchronen Bedienpfads, keine stabilen Geräte-Benchmarks. Im großen Stand traten auch längere Aufgaben und deutlich längere Bildabstände auf. Ohne Drosselung lagen beim normalen Stand diese drei Bedienpfade bei etwa 47, 15 und 33 ms.

Im Code verarbeitet `auswerten()` die Historie erneut; `tagesRechnung()` läuft vom Anlegedatum bis heute. Ein Renderlauf und die Kalenderauswertung rufen die Berechnungen mehrfach auf. Hinzu kommen der vollständige DOM-Neuaufbau und synchrone Speicherarbeit. Der Belastungslauf beweist nicht, welcher Anteil jeweils überwiegt, zeigt aber eine reale Skalierungsgrenze.

Vorschlag: wiederholte Auswertungen innerhalb eines Renderlaufs wiederverwenden und bei langen Listen den tatsächlich neu zu zeichnenden Teil verkleinern. Berechnungen müssen bei Tageswechsel, Haken/Nachtrag, Bearbeitung, Import und zurückgerolltem Speicherfehler weiterhin stimmen. Ein zusätzliches Leistungsszenario mit wachsender Historie wäre hier aussagekräftiger als nur neue Prüfungen mit leeren Daten.

## N9 · Kopieren im Ticketblatt überspringt den Speicher-Rollback

**Schweregrad: mittel; bestätigter Funktionsfehler, seltene Voraussetzung.** Betroffen ist **Ticketblatt → Alle Tickets → Ticket kopieren / Alle kopieren**, nicht der bereits korrigierte Kopierpfad auf der separaten Ticketseite.

Reproduktion am aktuellen main, mit simuliert erfolgreichem Kopieren und `QuotaExceededError` beim Schreiben:

1. Ein gespeichertes, offenes Ticket anlegen.
2. Über den Knopf unten rechts das Blatt öffnen, darin «Alle Tickets» wählen.
3. Den Speicher-Schreibzugriff fehlschlagen lassen und «Ticket kopieren» auslösen.
4. Die App meldet den Speicherfehler, zeigt das Ticket im Blatt aber bereits unter «Abgegeben»; «Nichts offen» erscheint.
5. Der Arbeitsspeicher enthält einen `abgegeben`-Zeitpunkt, der gespeicherte Stand weiter `abgegeben: null`. Nach einem Neustart ist das Ticket wieder offen.

Der Gegenvergleich über die separate Ticketseite hält Arbeitsspeicher und gespeicherten Stand korrekt offen. Der Ticketinhalt wurde in dieser Reproduktion nicht gelöscht; der Fehler betrifft die nicht gespeicherte Statusänderung.

Ursache: `bindeTicketListe()` setzt in seinem Kopier-Callback `t.abgegeben`, ruft aber direkt `speichern()` auf. `ticketsKopieren()` verwendet inzwischen korrekt `standMerken()` und `speichernOderZurueck()`. Vorschlag: den Blattpfad entsprechend behandeln und in `speicherfehler` **beide Kopierwege** absichern. Der vorhandene grüne Lauf erfasst diesen Blattpfad noch nicht.

Nachweis: [additional-results.json](leistung-2026-10-11/additional-results.json), die beiden Einträge `ticket-copy-write-failure`. Das Kopieren ist ein lokaler Stub; keine echte Zwischenablage wurde benutzt.

## Was bestanden hat und was offen bleibt

- `build.mjs --check` und `pruefen.mjs` bestehen. Die App-Datei hat **616 KB**, über der Warnschwelle von 600 KB und unter der Halteschwelle von 800 KB; der Nutzer wurde darüber informiert.
- Der [offizielle Prüfstand für genau main `2dcfd42`](https://github.com/chillijust/chillijust.github.io/actions/runs/38142596424) ist grün.
- Im ergänzenden Echtzeitlauf bestehen **35 von 37 Suiten**. Die einschlägigen Suiten für Menü, Flüssig, Speicherfehler, Einlesen, Dialoge und Offline bestehen. Querformat wurde mit dem tatsächlichen Viewport 932 × 430 geprüft und besteht alle sieben Prüfungen.
- `kalender` und `langdruck` bleiben wie in Nachricht 09 vom offiziellen Lauf abweichend. Im Kalender nimmt die Suite beim Loslassen erneut die bereits verschobene Position und zieht den Weg noch einmal ab; der Folgefehler verändert weitere Prüfungen. Vier zusätzliche tatsächliche Touch-Folgen am aktuellen main verhalten sich korrekt: langsam kurz zurückfedern, weiter Zug vor, kurzer schneller Schubs zurück, vertikaler Zug ohne Blättern. Beim Langdruck bleibt eine kleine Abweichung des Rückziels. Das ist keine vollständige Freigabe aller Gesten.
- Die Leistungsprofile melden keine unbehandelten Seitenfehler. Nach jeweils zehn schnellen Ticket-Auf/Zu-Folgen in drei Profilen bleiben keine temporären Tropfen- oder Flussschichten und kein offener Dialog zurück. Daraus folgt keine allgemeine Aussage über Speicherlecks.
- Der Original-Service-Worker lädt im separaten lokalen Test auch ohne Netz dieselbe App-Version. Die dabei gemessenen Startzeiten mit leerem Stand stammen aus localhost, nicht aus GitHub Pages oder der installierten App; keine Geräte-Ladezeitbewertung daraus ableiten.

**Empfohlene Reihenfolge:** N9 beheben, die vom Nutzer gemeldete iOS-Ticketanimation am iPhone optimieren und abnehmen, dann längere Historien betrachten. Für die Geräteabnahme wiederholtes Öffnen/Schließen, Scrollen, Timer, Drehung, Tastatur und Rückkehr aus dem Hintergrund einbeziehen. Ein bestandenes Funktionsskript allein sagt nichts über eine schöne, gleichmäßig animierte Darstellung aus.

Die [Nachweise und Replay-Skripte](leistung-2026-10-11/README.md) liegen separat im Kommunikationsordner. Der App-Teil dieses Branches entspricht weiterhin main; keine Leistungs- oder Fehlerkorrektur wurde von James eingebaut.
