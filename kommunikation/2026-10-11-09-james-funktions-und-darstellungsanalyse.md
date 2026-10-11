# Erneute Funktions- und Darstellungsanalyse

- Datum: 2026-10-11
- Absender: James
- Empfänger: Nutzer und Jarvis
- Bezug: Auftrag des Nutzers zur erneuten Prüfung des aktualisierten `main`; Nachrichten 01–03 und 07–08
- Status: Analyse abgeschlossen; Rückfragen und Abnahme auf dem iPhone offen. Keine App-Korrekturen vorgenommen.
- Untersucht: **Chilli Journal / Chillinal, main `2b7d245f0b44d2cc8360c18530766254defd7ede`, Version `0.17.0T9`**.

## Ergebnis

Die geprüften ruhenden Ansichten sind bei 430 × 932 in Hell und Dunkel ordentlich angeordnet. In **64 Zustandsprüfungen** gab es keine horizontale Überbreite, keine doppelten DOM-IDs und keine gemessenen Bedienflächen unter 44 px (Toleranz 0,5 px). Lange Namen und volle Listen wurden mit synthetischen Daten geprüft. Das schließt Fehler zwischen Animationsbildern und Safari-spezifische Fehler nicht aus.

**Eine tatsächliche Überlagerung ist reproduziert:** Eine Randgeste öffnet bei offenem Timer zusätzlich das Menü dahinter. Zwei ältere Befunde bestehen weiter und sind jetzt im Browser nachgewiesen: Der Worker kann neue App-Inhalte vor der bestätigten Übernahme ausliefern; fehlgeschlagene Formularspeicherung verwirft den Entwurf und zeigt einen ungespeicherten Eintrag an.

Zuerst sollten N1–N3 bearbeitet werden. N4–N6 betreffen Importrobustheit und Bedienungshilfen. N7 ist eine ergänzende Prüfung außerhalb des bislang festgelegten Hochformat-Zielgeräts.

## Befunde mit Reproduktion

### N1 · Mittel · Timer und Menü sind gleichzeitig offen

**Nachweis:** Timer einer Gewohnheit öffnen, dann vom rechten Bildschirmrand nach links wischen. Über Chromium/CDP wurde eine echte Touch-Folge von x=424 bis x=320 bei y=700 ausgelöst. Danach sind `timerOffen() === true` und `menue.hidden === false`; zwei modale Dialoge stehen im DOM sichtbar. Das Menü erscheint hinter dem Glas des Timers und bleibt nach dessen Schließen übrig.

**Ursache:** [`blattOffen()`](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L4840) prüft Menü, Hinweis und Ticketblatt, aber **nicht das Timerblatt**. `wischBeginnen()` und `wischEnden()` lassen deshalb die Geste durch. Das betrifft auch die Sperre in `kalDruck()`.

**Vorschlag:** Timer in die gemeinsame Prüfung aufnehmen. Randnavigation darf bei offenem Timer keinen weiteren Dialog öffnen. Den Fall mit einer Touch-Folge absichern, einschließlich des Zustands nach dem Schließen des Timers.

**Bild:** [Timer mit gleichzeitig offenem Menü](pruefung-2026-10-11/risiko-timer-menue-geste.png). Daten: `risk-results.json`, Fall `timer-menue-geste`.

### N2 · Mittel · Neue App unter altem Worker vor „Jetzt laden“ (bisher A1)

**Nachweis:** Lokaler HTTP-Server, unveränderte Worker-Logik aus main, zwei simulierte Auslieferungen. Es wurde weder „Jetzt laden“ geklickt noch die Nachricht `uebernehmen` geschickt:

| Schritt | App-Version | Aktiver Worker | Neuer Worker wartet |
| --- | --- | --- | --- |
| Erststart | 0.17.0T9 | 0.17.0T9 | nein |
| Erste Neuladung nach neuer Auslieferung | 0.17.0T9 | 0.17.0T9 | ja |
| Zweite Neuladung | **0.17.0T10-audit** | **0.17.0T9** | **ja** |

Die Kennung `0.17.0T10-audit` ist ausschließlich eine Testfassung auf localhost, keine veröffentlichte Version.

**Ursache:** [`sw.js`, Fetch-Handler](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/sw.js#L59) schreibt neue Netzantworten in den Cache des aktiven alten Workers. Zusätzlich wird `c.put()` weder abgewartet noch über `event.waitUntil()` abgesichert. Der zweite Punkt ist ein Codebefund; der Versionsmix wurde im echten Worker reproduziert.

**Vorschlag:** Eine veröffentlichte Worker-Version muss ihren App-Stand behalten, bis der neue Worker übernommen wird. Auslieferung und Cache-Wechsel gemeinsam entscheiden, Hintergrundschreiben und dessen Fehler explizit behandeln. Jarvis hat dafür bereits ein ADR angekündigt. Als Abnahmetest: v1 installieren → v2 anbieten → vor Bestätigung weiter v1 → nach Bestätigung konsistent v2 → offline v2.

**Daten/Replay:** [sw-results.json](pruefung-2026-10-11/sw-results.json), [sw_update.py](pruefung-2026-10-11/sw_update.py). A1 ist damit kein ausschließlich statischer Verdacht mehr.

### N3 · Mittel · Formular geht nach Speicherfehler verloren (offener Rest von A3)

**Nachweis:** Eine Gewohnheit anlegen und beim Schreiben einen `QuotaExceededError` auslösen. Danach zeigt die App das Dashboard mit der neuen Gewohnheit, der gespeicherte Stand enthält sie jedoch nicht. `ansicht === 'home'`, `entwurf === null`. Die Warnung wird angezeigt, verhindert aber nicht den Verlust der Eingabe beim Neuladen.

**Ursache:** [`entwurfSpeichern()`](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L6965) mutiert `state` vor `speichern()` und ruft unabhängig vom Ergebnis `zeige('home')` auf. [`terminSpeichern()`](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L7853) hat denselben Aufbau. Das entspricht dem von Jarvis dokumentierten offenen Rest; die schon korrigierten Abhak-Wege sind davon zu unterscheiden.

**Vorschlag:** Entwurf und Formular bei einem Fehlschlag behalten; den persistent dargestellten Zustand zurücknehmen oder erst nach erfolgreichem Schreiben übernehmen. Dieselbe Regel anschließend für Löschen, Rückfall, Drang, Timer und Tickets prüfen. Kein zusätzlicher Speicherschlüssel nötig. Abnahme: Fehler → Eingabe bleibt → Speicher wieder verfügbar → genau einmal erfolgreich speichern → Neuladen erhält den Eintrag.

**Daten/Bild:** `risk-results.json`, Fall `speichern-fehlschlag`; [Bild nach fehlgeschlagener Speicherung](pruefung-2026-10-11/risiko-speichern-fehlschlag.png).

### N4 · Niedrig · Importierte IDs können Timer-Bedienung abbrechen

**Nachweis:** `gewohnheitLesen()` akzeptiert eine ID mit einem Anführungszeichen, etwa `bad"`. Der Stand lässt sich zeichnen. `timerStarten()` scheitert danach an einem ungültigen CSS-Selektor in `kachelVon()`: `SyntaxError: … '[data-haken="bad""]' is not a valid selector`.

**Ursache:** IDs werden beim Lesen nur als nichtleere Zeichenfolge geprüft ([Zeile 2055](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L2055)), anschließend aber unmaskiert in Selektoren eingesetzt ([`kachelVon`, Zeile 7536](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L7536)). Die eigenen erzeugten IDs lösen das nicht aus. Voraussetzung ist ein entsprechend veränderter Import oder Speicherstand; kein nachgewiesener externer Angriff und kein XSS-Nachweis.

**Vorschlag:** Zulässige IDs beim Import klar begrenzen oder alle Selektorwerte korrekt mit `CSS.escape()` maskieren. Fälle für Anführungszeichen, eckige Klammern und doppelte IDs ergänzen. [Messwert](pruefung-2026-10-11/import-results.json).

### N5 · Niedrig · Fokus verlässt den modalen Dialog (bisher A6)

**Nachweis:** Eine Ja/Nein-Frage öffnen und Tab drücken. Fokusfolge: `hinweisNein → hinweisOk → ticketKnopf → body → markeKnopf`. Der Hintergrund bleibt per Tastatur erreichbar, obwohl der Dialog `aria-modal="true"` trägt.

**Ursache:** Fokus wird beim Öffnen auf die Karte gesetzt, aber der Hintergrund wird nicht `inert`; es gibt keine Fokusbegrenzung und keine geregelte Rückgabe an den Auslöser. `aria-modal` allein setzt diese Funktionen nicht um.

**Vorschlag:** Nur der oberste Dialog ist bedienbar; Hintergrund und darunterliegende Dialoge `inert` setzen, Fokus im aktuellen Dialog halten und nach dem Schließen sinnvoll zurückgeben. VoiceOver gesondert auf dem iPhone prüfen. Die Tab-Folge ist belegt; daraus folgt keine Behauptung über einen bereits beobachteten VoiceOver-Fehler.

### N6 · Niedrig · Laufender iOS-Tropfen bewegt sich nach „Bewegung reduzieren“ weiter

**Nachweis:** iOS-Auftropfen starten und währenddessen `prefers-reduced-motion` auf `reduce` umstellen. `bewegungAus()` ist bereits `true`, aber die laufende Feder läuft weiter: in einem Messlauf von p=0,878 auf p=1,028 innerhalb weiterer 200 ms.

**Ursache:** [`teilFliesst()`](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L2855) prüft die Einstellung beim Beginn. [`teilSchritt()`](https://github.com/chillijust/chillijust.github.io/blob/2b7d245f0b44d2cc8360c18530766254defd7ede/index.html#L2899) prüft sie in späteren Bildern nicht erneut. Die CSS-Regel stoppt diese per JavaScript gezeichnete Bewegung nicht.

**Vorschlag:** Einen laufenden Tropfen bei deaktivierter Bewegung sofort ins passende Endbild bringen und seinen Abschluss genau einmal ausführen. Vor dem Start deaktivierte Bewegung und währenddessen umgeschaltete Bewegung getrennt prüfen. Daten: `risk-results.json`, Fall `bewegung-waehrenddessen-aus`.

### N7 · Ergänzung · Timerkarte passt nicht in geringe Fensterhöhe

Bei einem zusätzlichen Viewport von **430 × 430** ist die Timerkarte ca. 505 px hoch und reicht von y=−37,7 bis y=467,8. Sie hat weder eine begrenzte Höhe noch eine eigene Scrollfläche. Teile einschließlich Aktionen können außerhalb des sichtbaren Fensters liegen.

Das ist **kein nachgewiesener Fehler im festgelegten iPhone-Hochformat** und keine Simulation der echten iOS-Tastatur. Relevant, falls Querformat oder kleinere sichtbare Höhen unterstützt werden sollen. Dann Karte auf die verfügbare Höhe begrenzen und den Inhalt innen rollen lassen, wie beim Ticketblatt. [Bild](pruefung-2026-10-11/risiko-timer-kurze-hoehe.png).

### N8 · Niedrig · Unbekanntes Schema wird weiterhin als Schema 1 gelesen (bisher A4)

`stand({schema: 999, …})` übernimmt bekannte Felder und liefert `schema: 1`. Der Browserversuch bestätigt das. Bei einer künftigen inkompatiblen Sicherung kann der Nutzer so einen unvollständig verstandenen Stand übernehmen. Heute erzeugt die App nur Schema 1; die Priorität bleibt niedrig. Unbekannte Schemata vor dem Ersetzen ablehnen oder ausdrücklich migrieren. Messwert ebenfalls in `import-results.json`.

## Darstellung und Animationen: was tatsächlich geprüft wurde

- **46 Zustände im Chilli-Standard:** 23 Szenen jeweils hell/dunkel, darunter Dashboard, Woche/Monat und Tagesliste, Gewohnheits- und Terminformulare, Abgewöhnen, Drang, Journal/Reflexion, Export, Sicherung, Tickets, Einstellungen, Flüssig-Proben, Menü und Dialoge. Bei längeren Ansichten auch Bilder am unteren Ende.
- **18 ergänzende Zustände mit allen neun iOS-Optionen eingeschaltet:** Dashboard, Monat, Formular, Gewohnheitsdetail, Export, Flüssig-Einstellungen, Ticketblatt, Timer und Menü, jeweils hell/dunkel.
- Testbestand: acht Gewohnheiten, zwei Laster, acht Termine, zwanzig Tickets, lange Texte und Namen. Alles synthetisch; keine persönlichen Gerätedaten.
- Schnelles Öffnen → Schließen → Öffnen beim iOS-Menü hinterließ in der geprüften Folge keine Restschicht; beide Varianten eines erneut geöffneten Hinweises waren sichtbar. Daraus folgt keine Aussage über jede mögliche Klickfolge.
- **Echte Touch-Kalendergesten:** −100 px langsam → bleibt; −160 px langsam → nächste Woche; +40 px schnell → zurück; vertikale Folge → kein Wochenwechsel. Keine Überbreite dabei.

Beispielbilder: [Dashboard hell](pruefung-2026-10-11/hell-home.png), [Dashboard dunkel](pruefung-2026-10-11/dunkel-home.png), [Menü mit iOS-Bewegung, angekommen](pruefung-2026-10-11/ios-dunkel-menue.png).

**Grenzen:** Chromium 151, mobiler Viewport, echter DOM und echte Touch-Ereignisse; kein iPhone und kein Safari/WebKit. Safe-Area, Dynamic Island, Statusleiste, iOS-Tastatur, VoiceOver, App-Hintergrund/Resume und tatsächliche Bildrate müssen am Gerät abgenommen werden. Die ruhenden Bilder sind keine Messung der Flüssigkeit zwischen den Bildern. Die Darstellungsprüfungen blockierten den Worker, damit er die Prüfseiten nicht beeinflusst; N2 wurde separat mit aktivem echten Worker geprüft.

## Prüfungen und Aussagekraft des Prüfstands

- `node tools/build.mjs --check`: bestanden, Version/Eingebettetes auf Stand.
- `node tools/pruefen.mjs`: bestanden; **608 KB**, Warnschwelle **600 KB**, Halt weiterhin **800 KB**.
- App-Teil des Kommunikationsbranches entspricht dem geprüften main Datei für Datei; keine App-Korrektur, kein Merge mit main.
- GitHub-Lauf des exakten main-Commits ist grün: [Prüfstand 38125178440](https://github.com/chillijust/chillijust.github.io/actions/runs/38125178440).
- Der unveränderte lokale CLI-Läufer war zunächst durch die Browsersuche/Sandbox blockiert. Chromium konnte anschließend mit dem freigegebenen Netzwerk-Sandboxmodus starten. Direkte `file://`-Navigation wurde durch die Browserrichtlinie blockiert. Daher wurden die **unveränderten 33 generierten Suite-Seiten über localhost** mit Playwright gefahren, in Echtzeit und je Suite mit isoliertem Browserkontext. Das ersetzt nicht wortgleich den virtuellen CLI-Lauf.
- Ergebnis dieses ergänzenden Laufs: **30 Suiten grün, 3 mit Abweichungen** (`fliessen`, `kalender`, `langdruck`). Kein pauschales „alle Tests bestanden“.

**Die drei Abweichungen sind keine drei belegten App-Fehler:** `fliessen/P6` verlangt höchstens 1 ms Differenz zwischen separat mit `Date.now()` gemerkten Startzeiten; in der virtuellen Uhr steht die Zeit während synchroner Arbeit, in Echtzeit nicht. Der Kalender-Test misst beim Loslassen erneut den bereits transformierten Rastermittelpunkt und zieht nochmals 100 px ab; dadurch kann der vermeintlich kurze Wisch weiter werden. Nachfolgende Erwartungen laufen dann mit falschem Wochenversatz. Die echten Touch-Folgen oben funktionieren. `langdruck/T3` verfehlt in diesem Lauf den alten Zielpunkt um wenige Pixel, während unmittelbar zuvor andere Bewegungen beendet wurden; Ursache noch nicht abschließend getrennt. Das ist ausdrücklich ein offener Prüfstand-Befund, kein sicherer Darstellungsfehler.

**Verbesserung:** Zusätzlich zum virtuellen Lauf einige Prüfungen mit echter Bildzeit und Touch-Folgen aufnehmen: Richtungswechsel, Dialogsperre, Cleanup nach Navigation, Update vor/nach Übernahme. Reihenfolgen und Endzustände prüfen; Millisekundengleichheit nur verwenden, wenn sie fachlich erforderlich ist. Zeitleisten an einer gemeinsamen Startzeit aufhängen, wenn sie exakt gemeinsam beginnen sollen. Bisher A5 ist durch den vorhandenen Offline-Test nicht erledigt; der reale Worker-Versuch zeigt die Lücke.

## Verbesserungen an Code und Gestaltung

1. **Dialogzustand zentral bestimmen.** Ein gemeinsamer Weg für „oberster Dialog“, Gestensperre, Fokus und Hintergrund verhindert Fehler wie N1/N5. Die bestehenden Glas- und Tropfenfunktionen bleiben die Grundlage.
2. **Änderung, Speichern und Rückmeldung gemeinsam behandeln.** Ein klarer Erfolgs-/Fehlschlagpfad verhindert, dass einzelne Formulare ihren Entwurf trotz Fehler schließen. Bestehende funktionierende Abhak-Rollbacks nicht wieder vereinheitlichen, ohne deren Verhalten zu sichern.
3. **Bewegungen pro Element sauber beenden.** Richtungswechsel, Neuzeichnen, Entfernen und reduzierte Bewegung sollten alte Abschlussfunktionen und Hilfsschichten kontrolliert beenden. Abgeschnittene Zwischenbilder und übriggebliebene Schichten gezielt prüfen.
4. **608-KB-Warnung ernst nehmen.** Seit 0.13.2T ist viel Probe- und Bewegungscode hinzugekommen. Erst auf dem iPhone CPU/Bildrate bei Menü, Auftropf-Kette und Ticketglas messen, dann doppelte Berechnung/Zeichnung reduzieren. Keine gemessene Bildrate wird hier behauptet; die Grenzen nicht still anheben.
5. **Visueller Stil:** Die klaren Hauptaktionen, genügend großen Trefferflächen und die stärkeren erhöhten Flächen in Dunkel sind sinnvoll. Lange Inhalte bleiben in den geprüften Bildern im Rahmen. Als nächste gezielte Stilprüfung: ausgeschaltete Schalter in Hell deutlicher abgrenzen und kleine Begleittexte am Gerät auf Lesbarkeit prüfen. Beides ist ein Vorschlag, kein pauschaler Kontrastfehler-Nachweis. Bei Timer und Drang darf ein reduzierter Bewegungseffekt die Zeit-/Fortschrittsinformation nicht verdecken.

Ein Framework oder neue externe Ressourcen sind für diese Verbesserungen nicht nötig und passen nicht zum beschlossenen Auslieferungsmodell.

## Rückfragen an den Nutzer

In der Sitzung wurden elf Fragen gestellt. **Antwort des Nutzers: Er nutzt nur die installierte App**, Safari nicht parallel. Die übrigen zehn Antworten stehen noch aus. Arbeitsannahme für das Gerät bleibt das beschlossene Zielgerät **iPhone 15 Pro Max, iOS 26, installierte Safari-App im Hochformat**. Die Fragen ändern keine bereits im Pflichtenheft/ADR beschlossene Regel.

1. Welche Geräte, Betriebssysteme und Browser nutzt du, installiert oder im Browser?
2. Welche Darstellungsfehler hast du gesehen, auf welcher Ansicht und mit welcher Schrittfolge?
3. Welche Ansichten sind dir besonders wichtig?
4. Nutzt du hell/dunkel, Querformat, größere Schrift/Zoom oder Bedienungshilfen?
5. Soll es bei Analyse/Vorschlägen bleiben oder sollen später Korrekturen als PR vorbereitet werden?
6. Welche Animationen sind wichtig, welche stören durch Überlagerung, Dauer, Flackern oder Ruckeln?
7. Wie viele Gewohnheiten, Zähler, Termine und ältere Einträge sowie besonders lange Namen nutzt du?
8. Welche Version steht aktuell in deinen App-Einstellungen?
9. Welche der neun optionalen iOS-Bewegungen sind eingeschaltet?
10. Treten Probleme bei einzelnen Aktionen oder bei schnellen Folgen auf?
11. Nutzt du installierte App und Safari manchmal gleichzeitig? **Beantwortet: nur die installierte App.**

Für die Geräte-Abnahme besonders hilfreich: Beobachtungen zu **Timer → Randwisch**, **schnellem Menü-Auf/Zu**, **Kaltstart mit Auftropfen**, **Ticketblatt mit Tastatur** und **Wechsel Hell/Dunkel während einer Bewegung**. Antworten können hier als neue Nachricht oder im Chat ergänzt werden. Keine privaten Sicherungscodes in dieses öffentliche Repository kopieren.

Alle Messdaten und Replay-Skripte: [Nachweise und Ausführung](pruefung-2026-10-11/README.md).
