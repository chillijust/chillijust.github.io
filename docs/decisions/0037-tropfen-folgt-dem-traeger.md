# 0037 · Der Hell/Dunkel-Tropfen folgt dem Knauf und der Markierung; Zeichen einen Tick flotter

*2026-10-07 · Abnahme 0.11.0T2 · Version 0.11.0T3 · ändert 0026 (`knaufGleiten`), 0036 (Dauer des
Tropfens, Zeiten der Zeichen); ergänzt 0025, 0027 · Zeiten der Zeichen der Meldung abgelöst durch 0051*

## Ausgangslage

**Im Schalter sprang es.** Am Gerät sprang der Knauf, im Kopf wie in den Einstellungen. Die
Ursache: `themaUmschalten` setzte `aria-checked` schon **vor** dem Ansichtsübergang. Das
alte Standbild zeigte den Knauf deshalb bereits am Ziel. Geglitten ist er nur im neuen Bild
(`knaufGleiten`), und das war in der Scheibe anfangs fast durchsichtig. In den Einstellungen
glitt die Markierung ebenfalls nur im neuen Bild. Das alte zeigte sie, bis die Scheibe darüber
lief, an der alten Stelle.

**Die Zeichen** waren nach 0036 einen Tick zu träge.

## Entscheidung

- **Der Träger ist eine eigene Ebene.** Der Knauf (im Kopf) bzw. die Markierung (in den
  Einstellungen) heißt während des Tropfens `thema-traeger`. Der Ansichtsübergang hebt ihn
  aus beiden Bildern und läßt ihn voll sichtbar hinübergleiten, im ersten Drittel des
  Tropfens. Was im Schalter über ihm liegt, wird mitgehoben (`thema-oben-N`), sonst deckte er
  es zu: Sonne und Mond bzw. die drei Beschriftungen.
- **Der Tropfen folgt ihm** (`thema-spur`): Er beginnt im Träger, so rund wie dieser. Hinter
  dem Träger färbt sich, was er überstreicht, und danach läuft die Spur nach allen Seiten über
  den Bildschirm aus. Die Spur ist die Fläche um den Weg des Trägers (`inset() … round`, Rundung
  wächst mit), darum bleibt sie beim Wachsen rund. Ihr Kontrast steigt: 0 → 0,5 am Ende der
  Spur → 1 (wie 0027).
- **`aria-checked` setzt erst das Neuzeichnen**, nicht der Druck. `knaufGleiten` entfällt.
  Die Markierung streckt sich nicht zusätzlich (`wahlenSetzen` läßt das, solange `thema-folgt`
  steht).
- **`THEMA_TROPFEN` 1560 ms**: 520 ms gleitet der Träger, 1040 ms läuft es aus. Bisher
  wuchs die Scheibe 1300 ms lang.
- **Zeichen ein Viertel flotter**: Haken 0,53 s, Punkt 0,41 s, Pfeil 0,71 s, Blatt 0,6 s,
  die Verzögerungen im selben Maß. Das liegt zwischen 0.11.0T (zu flink) und 0.11.0T2 (zu träge).
- Ohne Träger (kein Schalter zur Hand) wächst weiterhin die runde Scheibe aus `quelle`.

## Begründung

Was gleitet, muß in beiden Bildern gleiten. Solange der Träger in einem Standbild steckt,
steht er dort still oder schon am Ziel, und die Grenze zwischen den Bildern schneidet ihn
entzwei. Als eigene Ebene gehört er keinem der beiden. Eine Spur hinter ihm erzählt, woher
die neue Farbe kommt: aus dem Knauf, den man gerade geschoben hat.

## Folgen

- Suiten: `thema` C0c, C5b–C5h (C5b neu: im alten Bild liegt der Knauf noch auf der Sonne),
  D4c, D4d; `zeichen` W1 prüft jetzt die Spanne zwischen beiden Fassungen.
- Ob Safari Spur und Ebene so zeichnet wie Chromium, zeigt nur das Gerät. Im kopflosen
  Browser lief der Film in sechsfacher Zeitlupe sauber.
