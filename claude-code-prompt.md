# Übergabe-Prompt für Claude Code

> Diesen Text vollständig in Claude Code einfügen, nachdem du im geklonten
> Repository-Verzeichnis bist (`cd <repo>` und dann `claude`).

---

Du übernimmst ab jetzt die Verantwortung für dieses Projekt. Antworte mir
grundsätzlich auf Deutsch, sprich mich mit „Sir" an und verwende die Sie-Form.
Sei direkt und präzise, halte Antworten knapp, mache proaktiv Vorschläge und
hole vor riskanten Aktionen (Force-Push, Löschen von Dateien, History-Rewrite)
meine ausdrückliche Zustimmung ein.

## Was das Projekt ist

Eine Web-App zum Russischlernen (Kyrillisch lesen, schreiben, übersetzen),
gebaut als **eine einzelne, offline lauffähige HTML-Datei** mit reinem
HTML/CSS/Vanilla-JavaScript. Gehostet über GitHub Pages. Zielgerät ist mein
iPhone 15 Pro Max (iOS 26.5.2), installiert über „Zum Home-Bildschirm" als
PWA im Vollbild.

Enthaltene Rubriken: Üben (Multiple Choice + Buchstaben-Kacheln + Sprachfakten),
Übersetzen (Satzbau aus Wort-Kacheln, beide Richtungen), Tippen (Eingabequiz
mit kyrillischer Bildschirmtastatur), Bilanz (Leitner-Statistik, Sicherungscode).

## Harte Rahmenbedingungen — nicht verhandelbar

- Kein React, kein JSX, kein Build-Schritt, kein npm-Toolchain im Auslieferungspfad.
- Keine externen Ressourcen: keine CDNs, keine Google Fonts, keine externen
  Bilder, keine API-Aufrufe. Alles inline. Icons als Inline-SVG oder Unicode.
- Persistenz ausschließlich über `localStorage`, jeder Zugriff in try/catch.
- Mobile-first: Touch-Ziele ≥ 44 × 44 px, keine Hover-abhängige Bedienung,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)` für
  Notch und Home-Indicator.
- Dark Mode als Standard, heller Modus über `prefers-color-scheme`.
- Die App muss offline funktionieren, nachdem sie einmal geladen wurde.

## Erste Aufgabe: den Jekyll-Fehler beheben

Auf der veröffentlichten Seite steht oben der Repository- bzw. Benutzername
(„chillijust") und darunter erscheint die Zeile mit `<!DOCTYPE html>` als
sichtbarer Text. Ursache: Der GitHub-Pages-Schnellstart legt den Inhalt in
`README.md` ab und setzt in `_config.yml` ein Jekyll-Theme. Jekyll rendert
dann Markdown und packt alles in ein Theme-Layout, statt meine HTML-Datei
direkt auszuliefern.

Analysiere den Ist-Zustand des Repos selbst und behebe es. Erwartbar nötig:

1. Die Trainer-Datei muss als `index.html` **im Repository-Root** liegen
   (bzw. im konfigurierten Publishing-Verzeichnis).
2. Eine leere Datei `.nojekyll` im Root anlegen, damit GitHub Pages die
   Jekyll-Verarbeitung überspringt und Dateien unverändert ausliefert.
3. `_config.yml` und Theme-Reste entfernen oder neutralisieren; `README.md`
   darf nicht länger die ausgelieferte Seite sein, sondern wird zur
   Projektdokumentation.
4. Sicherstellen, dass die HTML-Datei **kein** YAML-Front-Matter am Anfang hat.

Prüfe danach, ob die Seite sauber ausgeliefert wird, und sag mir, was du
geändert hast.

## Zweite Aufgabe: Projektstruktur und dein eigenes Gedächtnis aufbauen

Lege eine `CLAUDE.md` im Root an, die dich in jeder künftigen Sitzung sofort
arbeitsfähig macht. Sie soll mindestens enthalten: Projektzweck, die harten
Rahmenbedingungen von oben, Verzeichnisstruktur, Konventionen (Code-Stil,
Commit-Format, Branch-Regeln), wie getestet und wie deployt wird, sowie eine
Liste bekannter Fallstricke (Jekyll, iOS-Quick-Look, Safari-Eigenheiten).
Halte sie kurz und präzise — sie ist Arbeitsanweisung, nicht Prosa.

Baue dazu eine sinnvolle Ordnerstruktur auf, etwa in dieser Richtung
(passe sie an, wenn du es besser weißt, und begründe Abweichungen):

```
/index.html              die App, ausgeliefert
/.nojekyll
/README.md               Projektbeschreibung für Menschen
/CLAUDE.md               deine Arbeitsanweisung
/.claude/skills/         eigene Skills (siehe unten)
/docs/                   Architektur, Datenmodell, Entscheidungen
/docs/decisions/         kurze ADRs: was wurde warum entschieden
/data/                   Vokabeln/Sätze als eigenständige Quelldateien
/tools/                  lokale Hilfsskripte (Build/Validierung, nie im Auslieferungspfad)
```

Wichtig zum Punkt `/data/`: Der Inhalt (Vokabeln, Sätze, Sprachfakten) wächst
über die Zeit stark. Erarbeite einen Vorschlag, wie Inhalt und Code getrennt
gepflegt werden können, **ohne** die Ein-Datei-Auslieferung aufzugeben — etwa
über ein lokales Skript in `/tools/`, das die Datenquellen in `index.html`
einbettet. Zeig mir den Vorschlag, bevor du ihn umsetzt.

## Dritte Aufgabe: dich zum Experten machen

Erstelle dir eigene Skills unter `.claude/skills/`, jeweils als Ordner mit
`SKILL.md` und knapper, präziser Beschreibung, damit sie zuverlässig
auslösen. Recherchiere die Grundlagen dafür selbst in der offiziellen
Dokumentation (`https://docs.github.com/de/pages`, MDN für Web-APIs) statt
dich auf dein Gedächtnis zu verlassen — und halte fest, was du gelernt hast.

Sinnvolle Kandidaten:

- **github-pages**: Publishing-Quellen, Branch- vs. Actions-Deployment,
  Jekyll-Umgehung, Caching-Verhalten, Grenzen, 404-Diagnose, Deploy-Prüfung.
- **ios-webapp**: `apple-mobile-web-app-*`-Metas, Safe-Area-Insets,
  Standalone-Modus, Viewport-Fallstricke, iOS-Safari-Besonderheiten bei
  `localStorage`, Speech-Synthesis und Touch-Events.
- **vanilla-app-architecture**: Zustandsverwaltung, Rendering und
  Event-Handling ohne Framework in einer Single-File-App; wie man das
  wartbar hält, wenn die Datei wächst.
- **offline-pwa**: Manifest, Service Worker, Cache-Strategie, Update-Pfad —
  inklusive der Frage, ob und wie das mit der Ein-Datei-Vorgabe vereinbar ist.
- **lerninhalt-pflege**: Regeln für neue Vokabeln und Sätze (Format,
  Transliteration, Dubletten-Prüfung, Schwierigkeitsstufen).

## Arbeitsweise, die ich erwarte

- Arbeite auf Feature-Branches, nie direkt auf `main` ohne Rückfrage.
  Erstelle neue Branches nur, wenn ich es ausdrücklich sage.
- Ein Commit pro logischer Änderung, aussagekräftige Nachrichten auf Deutsch.
- Vor jedem Push: HTML validieren, JavaScript-Syntax prüfen, und mir kurz
  sagen, was sich ändert.
- Nach dem Deploy: bestätigen, dass die Live-Seite tatsächlich aktualisiert
  wurde — GitHub Pages braucht dafür teils einige Minuten.
- Wenn du auf einen Zielkonflikt zwischen meinen Vorgaben stößt, sag es mir,
  statt still eine Seite zu wählen.

## Reihenfolge

Beginne mit einer Bestandsaufnahme des Repos und einem kurzen Plan, was du in
welcher Reihenfolge tun willst. Dann warte auf meine Freigabe, bevor du
Dateien änderst.
