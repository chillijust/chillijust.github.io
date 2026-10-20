# 0063 · Erst aufräumen, dann aufteilen: Quelltext in `src/`, `index.html` baut `build.mjs`

*2026-10-19 · beschlossen vom Nutzer · beginnt nach der Release 1.0.0 (ADR 0064), deren
Stand auf `backup/chillinal-0.19.0T-2026-10-20` liegt · führt den Ausweg aus 0046 aus*

## Ausgangslage

`index.html` hat 620 KB (0.19.0T; KB zu 1024 Byte, wie `pruefen.mjs` zählt); 0046
warnt ab 600 KB und hält bei 800 KB an. Die Grenze schützt nicht das Gerät, sondern den
Überblick: Jarvis liest die Datei nur in Ausschnitten, und je größer sie wird, desto eher
bleibt beim Ändern etwas Abhängiges ungesehen.

Gemessen am 2026-10-19:

| Teil | Größe | Befund |
| --- | --- | --- |
| Skript | 405 KB | 497 Funktionen auf oberster Ebene, keine tot; kaum doppelte Blöcke |
| davon Kommentare | 101 KB | ganze Zeilen `//`, 163 ADR-Verweise — die Gebrauchsanweisung |
| CSS ohne Schriften | 73 KB | 3 scheinbar tote Klassen, zur Laufzeit gebaut (`wm-a` + Nummer) |
| Schriften | 107 KB | Lora kursiv 30 KB, an 5 Stellen benutzt — bleibt |
| Chili, Symbol | 32 KB | PNG |

Aufräumen allein bringt wenig; das Gewicht liegt in den Kommentaren, und die dürfen im
Quelltext nicht fehlen.

## Entscheidung

Drei Schritte, je eine Sitzung, je grün gepusht.

**1 · Aufräumen** (1.0.1T)
- Das Flüssige an einen Ort: heute verteilt auf die Abschnitte ab Zeile 2685, 2831, 3244
  und 6065–6354. Nur verschieben.
- Die größten Abschnitte auf Reste der zweiten Fassung (0062) durchsehen: Umschalter,
  Menü, Neue Gewohnheit, Tage, «Ein Teil fließt selbst».
- Kommentare, die Geschichte erzählen («früher», «nicht mehr», Herkunft eines Tickets),
  auf das *Warum* mit ADR-Verweis kürzen.
- Chili und Symbol verlustfrei nachpressen, wenn ein Werkzeug dafür da ist.
- Beweis: Prüfstand grün, Bildschirmfotos (`bild.mjs`) vorher und nachher gleich.
- Erwartet: 600–610 KB.

**2a · Aufteilen**
- Quelltext unter `src/`: `kopf.html`, `stil/*.css`, `koerper.html`, `skript/NN-*.js`,
  geschnitten an den bestehenden Kommentarbalken (rund 30 Dateien, 1–32 KB).
- `build.mjs` setzt sie in der Reihenfolge der Nummern zusammen, bettet wie bisher ein,
  stempelt und schreibt `index.html`. Es bleibt **ein** klassisches `<script>` mit einem
  gemeinsamen Gültigkeitsbereich — aneinandergehängt, keine Module.
- Beweis: die gebaute `index.html` ist **byteweise gleich** der vorigen.
- Mit angepaßt: `CLAUDE.md`, die Pfade in `.claude/rules/*` (`index.html` → `src/**`), die
  Skills `ticket` und `pruefstand`, `AGENTS.md`, der Wegweiser in `docs/architektur.md`.
- Offene PRs von James auf `chatgpt/*` sind vorher in `main`.

**2b · Schlanke Auslieferung**
- `build.mjs` läßt ganze Kommentarzeilen aus der ausgelieferten `index.html` weg; im
  Quelltext bleiben sie. Erwartet: rund 520 KB.
- Der Prüfstand läuft auf der schlanken Datei — die einzige Falle, eine Zeile `//` in
  einem Template-String, fällt dort auf.
- `pruefen.mjs` mißt zusätzlich jede Quelldatei; die Schwelle setzt der Nutzer
  (Vorschlag: Hinweis ab 40 KB).

## Begründung

Erst aufräumen, damit nichts Totes mit umzieht; dann aufteilen, weil erst getrennte
Quelldateien den Überblick zurückgeben und die Kommentare aus der Auslieferung nehmen
lassen, ohne sie zu verlieren. Der byteweise Vergleich macht den Umzug selbst prüfbar.

«Kein Build-Schritt beim Ausliefern» bleibt gewahrt: `build.mjs` läuft vor dem Commit,
Pages liefert die fertige Datei — wie heute bei den Schriften. Ausgeliefert werden weiter
zwei Dateien.

## Folgen

- Bearbeitet wird in `src/`; `index.html` schreibt nur `build.mjs`. Eine Handänderung an
  `index.html` fällt bei `build.mjs --check` durch — im Push-Hook und auf GitHub.
- Der Prüfstand lädt weiter `index.html` und ersetzt Funktionen wie bisher.
- Wird dieser Entwurf umgesetzt, bekommt 0046 den Vermerk «Ausweg umgesetzt durch 0063».
