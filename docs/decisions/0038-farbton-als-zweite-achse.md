# 0038 · Der Farbton ist eine zweite Achse

**Stand:** **ersetzt** durch [ADR 0039](0039-ein-farbschema-statt-zweier-achsen.md) · 2026-08-08

> Die zweite Achse gibt es nicht mehr: Farbton und Helligkeit sind zu **einem** Schema
> zusammengefallen (Dark · Classic · Grün · Blau · Rosa). Der Eintrag bleibt stehen, weil
> er festhält, warum die getrennten Achsen am Gerät nicht trugen.

## Ausgangslage

Die App kannte genau zwei Erscheinungen: dunkel (Vorgabe) und hell. Beide sind neutral
graubraun gehalten. Gewünscht waren weitere Grundfarben — grün, blau, rosa, „entspannt
cremig" —, **ohne hell und dunkel zu verlieren**.

## Entscheidung

Der Farbton ist eine **zweite, unabhängige Achse** neben hell und dunkel, nicht eine
Erweiterung der bestehenden Liste. `data-farbe` am `<html>`-Element neben `data-theme`;
vier Töne (Nacht, Grün, Blau, Rosa) mal zwei Modi ergeben acht Paletten.

Wie «system» beim Modus trägt **«nacht» kein Attribut**: Der Grundton ist die Abwesenheit
einer Wahl.

**Getönt werden nur die Flächen** — `--bg`, `--card`, `--card-2`, `--line`, `--glow`.
Schrift, Gold und die Signalfarben bleiben in jedem Ton dieselben.

**Die Helligkeit stammt aus dem neutralen Grundton**, nur Farbton und Sättigung wandern.
`tools/palette.py` rechnet die Werte aus; von Hand gewählte Töne wären nicht vergleichbar.

## Begründung

Eine Liste aus «dunkel, hell, grün, blau, rosa» hätte die Frage «hell oder dunkel?» mit
der Frage «welche Farbe?» vermengt. Wer Grün wählt, will nicht zugleich entscheiden, ob
es Tag oder Nacht ist. Zwei Achsen sind ehrlicher — und der Nutzer hat ausdrücklich
gesagt, dass hell und dunkel erhalten bleiben sollen.

**Nur Flächen zu tönen, hat zwei Gründe.** Der erste ist Bedeutung: Grün heißt in dieser
App «richtig», Rot «falsch», Gold «Fortschritt». Würden diese Farben mitwandern, hieße
«richtig» auf Rosa etwas anderes als auf Grün. Der zweite ist Aufwand: fünf Werte je Ton
und Modus statt einer ganzen Palette — 40 Zeilen statt 112, und alle nachrechenbar.

**Die Helligkeit zu übernehmen, hält den Kontrast stabil.** Gemessen über alle acht
Paletten liegt der größte anteilige Verlust gegenüber «Nacht» unter 6 %; die Lesetexte
bleiben bei mindestens 12,8 : 1. Eine frei gewählte Palette hätte das erst nachträglich
gezeigt.

Die Kaskade spiegelt die der Grundpalette: dunkler Ton, heller Ton über die
Systemvorgabe, heller Ton über die ausdrückliche Wahl. **Die Regel mit beiden Attributen
sticht beide Einzelregeln** — darauf und auf nichts sonst beruht das Zusammenspiel.

## Folgen

- `FARBTOENE` im Skript führt je Ton den dunklen und den hellen Grundwert. Das ist die
  einzige Stelle, an der Flächenfarben doppelt stehen — `meta[name=theme-color]` nimmt
  eine Zahl und kennt keine Medienabfrage. Wer die Palette ändert, ändert beides.
- Der Sicherungscode führt den Ton als fünftes Feld der Einstellungen. Ältere Codes haben
  es nicht; dann gilt der Grundton (ADR 0037 hat dieselbe Regel schon für die Schalter).
- Ein unbekannter Wert im Speicher fällt auf «nacht» zurück, wie eine unbekannte
  Darstellung auf «system».
- **Was gemessen wird, bleibt messbar:** Die Testsuite prüft den Kontrast nicht gegen
  einen Wunschwert, sondern gegen den neutralen Grundton. Gold auf Weiß liegt im hellen
  Modus seit jeher bei 3,8 : 1 — unter AA für kleine Schrift. Das ist eine bestehende
  Entscheidung und war nicht Gegenstand dieses Tickets; die Töne dürfen sie nur nicht
  verschlechtern.
