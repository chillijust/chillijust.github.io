# 0053 · Die Tropfen fließen wie in iOS 26

*2026-10-10 · Wunsch des Nutzers, gewählt am Gerät aus der Flüssigprobe in 0.16.0T ·
Version 0.17.0T, nachgebessert in 0.17.0T2 · löst «ohne Überschwingen» aus 0008 ab, ergänzt 0023 (rund) · ändert die
Regel «keine Reiterleiste» für die Einstellungen*

## Ausgangslage

Die Tropfen verformten nur eine Fläche zwischen Knopf und Ansicht, auf einer festen Kurve
ohne Überschwingen (0008). Der Nutzer wollte sie näher an iOS 26, nach dem Vorbild einer
Metaball-Vorlage in SwiftUI: Formen, die über einen Hals zusammenhängen und abreißen,
nachfedern, sich in Laufrichtung dehnen und eine Lichtkante tragen. Acht Proben standen
in 0.16.0T am Dashboard zur Wahl, je als «Pfad» (Umriß als `clip-path`, Glas bleibt Glas)
oder «Filter» (weich gezeichnet und hart geschnitten wie die Vorlage). Gewählt:
**iOS 26 im Filter**. Feilen will der Nutzer selbst, in den Einstellungen unter einem
eigenen Reiter.

## Entscheidung

- **Die echten Tropfen fließen.** `tropfenAuf`, `tropfenZu` und das Menü laufen auf der
  Kurve einer Feder (`fluessigTakt`, als `linear()`); auf dem Weg hinaus schwingt sie
  über, in einen Knopf hinein nicht — dort federt der Knopf, so weit wie eingestellt.
  Solange der Tropfen nah an seiner Quelle ist, hängt er über einen Hals an ihr
  (`fliessen`): eine Schicht direkt unter dem Tropfen, die die Quelle (und bei Glas den
  Tropfen) ausspart, mit dem Schatten und der Deckkraft des Tropfens. Klein dehnt er sich
  in Laufrichtung; er trägt eine Lichtkante (`.fl-kante`).
- **Die App läuft mit der Zeit der Feder, wie die Proben** (seit 0.17.0T2): Dauer und
  Kurve aus `fluessigTakt(stelle)`, bis die Feder auf ein Hundertstel am Ziel ist;
  `flDauernSetzen` setzt `TROPFEN_DAUER`, `MENUE_DAUER`, `HINWEIS_DAUER`, `MELDE_ZU` und
  `TROPFEN_KURVE` beim Start und nach jeder Änderung. Der Hinweis bleibt 60 % schneller
  als eine Ansicht (0013), die Knäufe behalten ihre Dauer (0037), nehmen aber die Kurve.
  0.17.0T hatte die alten Dauern behalten — am Gerät war keine Einstellung zu spüren.
- **Voreinstellung: iOS 26 im Filter.** Der Reiter «Flüssig» der Einstellungen trägt
  «Eigene Einstellungen» für alle (Grund, Technik, Regler) und je Probe (Technik,
  Regler). Aus heißt Voreinstellung bzw. «für alle»; was ausgeschaltet wird, bleibt
  gemerkt. Gilt sofort, in den Proben und in der App. `state.fluessig`, nicht im
  Sicherungscode, beim Einlesen behalten. «Einstellungen kopieren» faßt alles als Text.
- **Die Einstellungen haben zwei Reiter**, Allgemein und Flüssig, als `.wahl` oben auf
  der Seite (`esReiter`, bis zum Neuladen). Die Hauptnavigation bleibt ohne Reiter.
- **Jede Probe hat ihre Stelle in der App** (seit 0.17.0T2):
  - *Menü, Hinweis*: Tropfen aus Knöpfen und das Menü, mit Hals.
  - *Schalter und Wahl*: Die Wahl-Marke fließt auf der Feder, dehnt sich und läßt am
    alten Platz einen Rest, der über einen Hals an ihr hängt (`fliessen` mit `rest`);
    die Knäufe nehmen die Kurve.
  - *Tagesmarkierung*: Der Ring gleitet zum neuen Tag (`tagGleitet`) — ohne Hals, ein
    Hals zwischen zwei Ringen sähe aus wie ein Versehen.
  - *Abhaken*: Ein Tropfen fließt aus dem Haken in den Tagesring (`hakenFliesst`), nur
    wenn beide im Bild sind; die Scheibe federt wie eingestellt.
  - *Zeilen*: Eine gehende Zeile zieht sich zur Perle zusammen; Zeilen, die kommen, laufen
    auf der Feder (`TROPFEN_KURVE`).
  - *Welle*: Im Ring steht Flüssigkeit, deren Pegel mit der Restzeit sinkt, Perlen steigen
    auf (`welleFliesst`), gezeichnet alle 50 ms statt jedes Bild.
  - *Perle*: «Neue Version» und der Auftritt tropfen auf der Feder der Probe.
- **Die Lichtkante sitzt nur oben** und blendet weich ein und aus — links sah sie wie ein
  Schatten aus, ihr harter Schnitt am Ende wie ein Rand, der übrig blieb.

## Begründung

Bewegung wählt man am Gerät, nicht nach Beschreibung — darum Proben, Regler und die
kopierbare Sicherung. Der Hals liegt unter dem Tropfen statt in ihm, damit der Tropfen
(Inhalt, Glas, Hülle) bleiben kann, wie er abgenommen ist. Die Schicht deckt nur den
Kasten um Quelle und Tropfen und nur, solange der Hals hält: Der Filter kostet je
Bildpunkt.

## Folgen

- Der Hals ist in der App kürzer zu sehen als in den Proben: Die Wege sind lang, er
  reißt nach höchstens dreifacher Knopfgröße. Am Gerät nachsehen.
- Die festen Dauern der älteren Entscheidungen (416 und 338 ms aus 0026, 580 ms der
  Wahl-Marke) gelten nicht mehr; ihre Prüfungen fragen jetzt nach der Feder.
- Ohne Bewegung (`bewegungAus`) gibt es keinen Hals; die Kurven fallen auf feste zurück,
  wo `linear()` fehlt.
- Wer eine neue Stelle flüssig macht, nimmt `fluessigTakt(stelle)` und `fliessen()`.
