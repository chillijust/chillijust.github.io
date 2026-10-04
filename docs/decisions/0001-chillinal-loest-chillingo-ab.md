# 0001 · Chillinal löst Chillingo ab

*2026-10-04 · Bauabschnitt 1 · Version 0.1.0T*

## Ausgangslage

Auf `main` lag Chillingo, eine Web-App zum Russischlernen (zuletzt 2.11.2T). Geplant ist
an ihrer Stelle Chillinal, eine App zum An- und Abgewöhnen von Gewohnheiten
(`docs/chillinal-plan.md`). Dieselbe Adresse, dasselbe Gerät, dieselbe Bauweise — aber kein
einziger Inhalt bleibt. Chillingo ruht vollständig auf `backup/chillingo-2.11.2T-2026-10-04`,
samt Sicherungscode des Lernstands.

## Entscheidung

**Geräumt** wurde alles, was nur Chillingo diente: `data/`, sämtliche ADRs und das Archiv,
Architektur- und Datenmodell-Unterlagen, die Regeln zu Lernlogik und Inhalten, alle
40 Suiten, die Python-Werkzeuge für das alte Symbol, der Sicherungscode. Die Zählung der
ADRs beginnt neu bei 0001.

**Übernommen und angepaßt** wurde das Werkzeug: Prüfstand (Läufer, Helfer, Bildschirmfotos),
`pruefen.mjs`, der Vor-Push-Hook, der GitHub-Lauf, die Skills `pruefstand` und `ticket`.
`build.mjs` bettet jetzt Schriften, Chili und Symbol ein, statt Lerninhalte.

**Das Gerüst** (0.1.0T):

- Zwei Dateien wie bisher, `index.html` und `sw.js`. CSP mit `font-src data:` und der
  einen Ausnahme `worker-src 'self'`; `connect-src` bleibt weg.
- **Speicher** unter `chillinal_v1`. Chillingos Schlüssel kommt im Quelltext nicht vor,
  `localStorage.clear()` gibt es nicht — `pruefen.mjs` bricht über beides ab. Neue Felder
  bekommen ihren Vorgabewert in `grundStand()`; ein älterer Stand wird beim Laden
  aufgefüllt.
- **`sw.js`** behält Ort, Bauart und Wortschatz (`version`, `uebernehmen`). Nur so kommt
  Chillinal über Chillingos Update-Hinweis auf das Gerät. Der Cache heißt
  `chillinal-<Version>`; beim Aktivieren fällt jeder andere, Chillingos eingeschlossen.
- **Darstellung**: Ohne Wahl folgt die App dem Gerät — allein im Stylesheet, über
  `prefers-color-scheme`, so stimmt schon das erste Bild. Eine Wahl setzt `data-thema` am
  `<html>`. Der Sonne/Mond-Schalter im Kopf schaltet ins Gegenteil dessen, was man sieht,
  und legt damit fest; zurück zu «Automatisch» geht es in den Einstellungen. Er zeigt,
  was gerade gilt (Sonne = hell).
- **Schriften**: Lora 400, 400 kursiv und 600 für den Text, Poppins 500 und 600 für
  Überschriften und Knöpfe — lateinische Teilmenge, woff2, als Daten-URI rund 110 KB.
- **Symbol**: die Chili auf Elfenbein, oben rechts ein grüner Haken als Gegenstück zu
  Chillingos Sprechblase. Gezeichnet als SVG, gerendert im kopflosen Chromium.
- **Menü** mit allen Einträgen des Pflichtenhefts in dessen Reihenfolge. Was noch nicht
  gebaut ist, trägt «bald» und sagt beim Tippen, daß es kommt.
- **Einstellungen** schon jetzt, aber nur mit Darstellung und App (Version, Stand,
  Offline-Auskunft, Nach Aktualisierung suchen, Notausgang). Ohne sie gäbe es auf dem Gerät
  keinen Weg, ein klemmendes Update zu lösen.
- **Leeres Dashboard**: Die Chili begrüßt, ein Knopf «Erste Gewohnheit anlegen». Er meldet
  bis Abschnitt 2, daß er noch nichts tut.

**Abweichungen vom Pflichtenheft**, bewußt:

- Kacheln liegen auf `#F0EEE6`, nicht auf `#E8E6DC`. Auf dem Elfenbein-Grund wirkte die
  Fläche aus dem Plan zu schwer; `#E8E6DC` trägt jetzt die Bedienflächen (Wahl, runde
  Knöpfe im gedrückten Zustand, Hinweisleiste).
- Hauptknöpfe sind dunkel (Textfarbe), nicht chilirot. Weiße Schrift auf `#D97757` erreicht
  nur 3,1 : 1; der Akzent bleibt für Symbole, Fokus und später Ring und Jubel.

## Begründung

Ein Neubeginn auf derselben Adresse hält die Verknüpfung auf dem Gerät und den Weg dorthin
(Chillingos Update-Knopf). Ein eigenes Repository hätte eine neue Adresse, eine neue
Verknüpfung und einen neuen Ursprung bedeutet — und damit Chillingos Lernstand doch vom
Gerät gelöst.

Das Werkzeug ist das Wertvolle an Chillingo, nicht der Inhalt: Prüfstand, Hook und
Vor-Push-Prüfung haben sich über 2.11 Fassungen bewährt und kennen keine Vokabel.

## Folgen

- Auf dem iPhone erscheint Chillinal über Chillingos Hinweis «Jetzt laden». **Name und
  Symbol der Verknüpfung bleiben die alten**, bis sie neu angelegt wird — iOS liest beides
  nur beim Anlegen.
- Chillingos Lernstand bleibt im `localStorage` liegen, solange die Verknüpfung lebt. Wird
  sie gelöscht, löscht iOS deren Speicher mit; der Sicherungscode auf dem Backup-Branch
  bleibt.
- Jeder spätere Abschnitt gibt seinem Menüeintrag ein `ziel`; die Suite `menue` hält «bald»
  und Gebautes beieinander.
