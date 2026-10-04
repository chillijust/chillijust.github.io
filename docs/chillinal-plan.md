# Chillinal · Pflichtenheft

Chillinal (Chilli + Journal) löst Chillingo auf `main` ab: eine Web-App zum An- und
Abgewöhnen von Gewohnheiten, mit Terminen, offline, Daten nur auf dem Gerät. Chillingo
ruht vollständig auf `backup/chillingo-2.11.2T-2026-10-04`.

Geplant am 2026-10-04 im Gespräch, Punkt für Punkt. Was hier steht, ist entschieden;
offen ist nur, was unter **Offen** steht.

## Grundlage aus der Recherche

| Befund | Folge |
| --- | --- |
| Abhaken muß in unter 5 s gehen — der stärkste Vorhersagewert für 30-Tage-Treue | Kachel antippen = erledigt, direkt auf dem Dashboard |
| Ja/Nein-Erfassung hält in der Anfangsphase länger als Meßwerte | nur abhaken, keine Mengen |
| Mehr als 2–3 neue Gewohnheiten zugleich senken den Erfolg aller | sanfter Hinweis ab 3 ungefestigten |
| Lally 2010: Automatik nach im Mittel 66 Tagen, Spanne 18–254 | kein «21-Tage»-Versprechen; Stärke statt Countdown |
| Lange Serien erzeugen Verlustangst, ein Bruch führt zum Aufgeben | **Stärke-Wert** als Hauptanzeige, «nie zweimal auslassen» |
| Ein Drang flaut nach Minuten ab | Drang-Knopf = 10-Minuten-Welle |

## Entscheidungen

| Punkt | Entscheidung |
| --- | --- |
| Ort | ersetzt Chillingo auf `main`, URL bleibt https://chillijust.github.io/ |
| Umfang | Angewöhnen, Abgewöhnen, Termine |
| Rhythmus (angewöhnen) | täglich · bestimmte Wochentage · x-mal pro Woche — keine Mini-Version |
| Fortschritt | Stärke in Prozent + «nie zweimal auslassen», Serie nur zweitrangig |
| Drang-Knopf | nur die 10-Minuten-Welle |
| Termine | einmalig und wiederkehrend (täglich, wöchentlich, monatlich), Alarm-Vorlauf |
| Erinnerungen | Kalender-Export als `.ics` — kein Server |
| Navigation | wie Chillingo: Start ist ein Dashboard, alles Weitere über den runden Menüknopf, der Kopf trägt unterwegs den Rückweg |
| Dashboard | Kachel = Abhaken (mit Animation), kleiner Pfeil führt zu Details |
| Rückblick | Kalender-Heatmap je Gewohnheit, Wochenreflexion als Journal |
| Stil | Anthropic-Palette, hell und dunkel; Sonne/Mond-Schalter auf dem Dashboard |
| Schrift | Lora (Text) und Poppins (Überschriften), lateinische Teilmenge, eingebettet. Anthropics Hausschriften sind lizenzpflichtig. |
| Maskottchen | die Chili; neues App-Symbol mit Chili |
| Sicherung | nur Sicherungscode, wie Chillingo |
| Tickets | kommen mit, Format `# Chillinal · N Tickets` |
| Werkzeuge | Prüfstand, Vor-Push-Hook, GitHub-Lauf, `pruefen.mjs` samt Emoji-Sperre |
| Obergrenze | sanfter Hinweis ab 3 Gewohnheiten unter 50 % Stärke, kein Verbot |
| Erster Start | leeres Dashboard: die Chili begrüßt, Knopf «Erste Gewohnheit anlegen» — kein Tutorial |
| Chili-Grafik | Chillingos freigestellte Chili (`docs/maskottchen-freigestellt.png`), auch im neuen Symbol |

## Farben

| Rolle | Hell | Dunkel |
| --- | --- | --- |
| Grund | `#FAF9F5` | `#141413` |
| Text | `#141413` | `#FAF9F5` |
| Fläche / Linie | `#E8E6DC` / `#B0AEA5` | aus dem Dunkel abgeleitet |
| Akzent (Chili) | `#D97757` | `#D97757` |
| erledigt | `#788C5D` | aufgehellt |
| Termin | `#6A9BCC` | aufgehellt |

Ohne Wahl folgt die App `prefers-color-scheme`; der Schalter legt sie fest und merkt sie
sich. Kein Logo, kein Name von Anthropic — nur Farben und Typografie.

## Ansichten

**Dashboard (Start)**, von oben:

1. Kopf: «Chillinal», Datum, Sonne/Mond, Menüknopf
2. Tagesring mit Chili: «Heute 3 von 5», füllt sich animiert
3. **Termine heute**, blau, nach Uhrzeit
4. **Gewohnheiten** als Kacheln: Name, Stärke-Ring, letzte 7 Tage als Punkte.
   Antippen = erledigt (Ring füllt sich, Chili jubelt), nochmal = zurück. Nicht fällige
   Gewohnheiten stehen gedimmt darunter.
5. **Abgewöhnen** als Kacheln: «frei seit 12 T 4 h» (läuft live), Knöpfe *Drang* und
   *Rückfall*, Rekord darunter
6. **Monatskalender**: Tage nach Erledigungsquote getönt, Punkt für Termine. Tag
   antippen → Tagesansicht.

**Detail einer Gewohnheit**: Heatmap der letzten Monate, Stärke, Serie, Rhythmus,
bearbeiten, archivieren.

**Drang (10-Minuten-Welle)**: großer Ring, der in 10 Minuten abläuft, ein Satz zum
Aussitzen. Am Ende: «Gewonnen» oder «Nachgegeben» (= Rückfall). Gewonnene Dränge zählen
auf der Kachel.

**Menü**, in dieser Reihenfolge: Neue Gewohnheit · Neuer Termin · Journal ·
Kalender-Export · Einstellungen · Sicherung · Tickets.

**Journal**: sonntags erscheint auf dem Dashboard eine Kachel «Wochenreflexion» — zwei
Fragen (Was lief gut? Was hat gestört?). Gespeichert, im Journal nachlesbar.

Animationen überall, wo sie Rückmeldung geben; bei `prefers-reduced-motion` aus.

## Lernlogik

**Stärke** (nach dem Vorbild von Loop Habit Tracker): gleitender Mittelwert über die
*fälligen* Gelegenheiten, `s ← s·(1−α) + α·x`, x = 1 erledigt, 0 verpaßt. α so, daß eine
Gewohnheit bei lückenloser Erfüllung nach etwa 66 Fälligkeiten 90 % erreicht. Ein
einzelner Aussetzer kostet wenig, eine Lücke von Wochen viel.

- *Täglich*: jeder Tag ist eine Gelegenheit.
- *Wochentage*: nur die gewählten Tage.
- *x-mal pro Woche*: gewertet am Wochenende — erreicht = x Treffer, sonst anteilig.

**Nie zweimal**: Ein verpaßter fälliger Tag färbt die Kachel am Folgetag («Heute nicht
wieder»). Die Serie bricht erst beim zweiten Aussetzer in Folge.

**Abgewöhnen**: Startzeitpunkt, Rückfälle mit Zeit und optionaler Notiz, Rekord bleibt
nach einem Rückfall stehen. Stärke hier = Anteil freier Tage der letzten 66.

**Tagesgrenze**: lokale Mitternacht.

## Kalender-Export

Eine `.ics` mit `VEVENT` je Termin und je Gewohnheit mit Erinnerungszeit, Wiederholung als
`RRULE`, Alarm als `VALARM`, `UID` stabil je Eintrag. Gewohnheiten bekommen dafür eine
optionale Erinnerungsuhrzeit.

- **Bekannte Grenze:** iOS importiert eine Kopie. Wer nach einer Änderung neu exportiert,
  löscht den alten Eintrag im Kalender von Hand — ein sich selbst aktualisierendes Abo
  bräuchte einen Server.
- **Am Gerät zu klären:** ob der Export in der Home-Bildschirm-App per Download oder per
  Teilen-Blatt (`navigator.share` mit Datei) zuverlässig im Kalender landet.

## Technik

- Weiterhin **`index.html` + `sw.js`**, nichts geladen von außen, CSP im Kopf,
  `connect-src` bleibt weg. Schriften und App-Symbol als Daten-URI.
- `localStorage`-Schlüssel `chillinal_v1`. **Den Chillingo-Schlüssel
  `russisch_trainer_v1` nie anfassen**, kein `localStorage.clear()` — der alte Lernstand
  bleibt so auf dem Gerät liegen.
- `sw.js` liegt wie bisher unter `/sw.js`: Auf dem iPhone kommt Chillinal über Chillingos
  Update-Knopf an, der neue Worker räumt Chillingos Cache beim Aktivieren ab.
- Stil wie bisher: ES5-nah, `esc()` für alle Ausgaben, Version in `VERSION`, Start bei
  `0.1.0T`.
- App-Symbol: Chili auf Elfenbein, als SVG gezeichnet, im kopflosen Chromium zu PNG
  (180 und 1024) gerendert.
- Die App duzt.
- `.nojekyll` bleibt.

## Bauabschnitte

Je Abschnitt eine Sitzung, am Ende grün und gepusht.

1. **Umbau**: `main` räumen (Chillingo-Dateien, Inhalte, Suiten, Regeln, ADRs —
   alles liegt auf dem Backup-Branch), neue `CLAUDE.md`, Werkzeuge anpassen, Gerüst
   mit Kopf, CSP, Farben, Schalter, Schriften, Symbol, `sw.js`. ADR 0001.
2. **Gewohnheiten**: anlegen, Rhythmus, Kachel = Abhaken, Stärke, nie zweimal, Hinweis
   ab 3.
3. **Abgewöhnen**: frei seit, Rückfall, Rekord, 10-Minuten-Welle.
4. **Termine** und Monatskalender, Tagesansicht.
5. **Kalender-Export**.
6. **Rückblick**: Heatmap, Detailansicht, Journal mit Wochenreflexion.
7. **Sicherung, Einstellungen, Tickets**.
8. **Feinschliff**: Animationen, Chili-Jubel, Leerzustände.

## Offen

Nichts. Der Chillingo-Lernstand vom 2026-10-04 liegt als Sicherungscode in
`docs/ChilliSicherung` auf dem Backup-Branch.
