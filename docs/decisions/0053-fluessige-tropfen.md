# 0053 · Die Tropfen fließen wie in iOS 26

*2026-10-10 · Wunsch des Nutzers, gewählt am Gerät aus der Flüssigprobe in 0.16.0T ·
Version 0.17.0T · löst «ohne Überschwingen» aus 0008 ab, ergänzt 0023 (rund) · ändert die
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
- **Die Dauern bleiben die abgenommenen.** Die Feder gibt die Kurve, das Tempo skaliert
  die Dauer (`faktor`); bei der Voreinstellung ist er 1. Eine Meldung von 0,17 s bliebe
  sonst nicht kurz.
- **Voreinstellung: iOS 26 im Filter.** Der Reiter «Flüssig» der Einstellungen trägt
  «Eigene Einstellungen» für alle (Grund, Technik, Regler) und je Probe (Technik,
  Regler). Aus heißt Voreinstellung bzw. «für alle»; was ausgeschaltet wird, bleibt
  gemerkt. Gilt sofort, in den Proben und in der App. `state.fluessig`, nicht im
  Sicherungscode, beim Einlesen behalten. «Einstellungen kopieren» faßt alles als Text.
- **Die Einstellungen haben zwei Reiter**, Allgemein und Flüssig, als `.wahl` oben auf
  der Seite (`esReiter`, bis zum Neuladen). Die Hauptnavigation bleibt ohne Reiter.
- **Zuerst die Tropfen aus Knöpfen und das Menü.** Knauf und Wahl, Tagesmarkierung,
  Abhaken, Zeilen, Welle und Perle folgen Stelle für Stelle; ihre Proben stehen schon da.

## Begründung

Bewegung wählt man am Gerät, nicht nach Beschreibung — darum Proben, Regler und die
kopierbare Sicherung. Der Hals liegt unter dem Tropfen statt in ihm, damit der Tropfen
(Inhalt, Glas, Hülle) bleiben kann, wie er abgenommen ist. Die Schicht deckt nur den
Kasten um Quelle und Tropfen und nur, solange der Hals hält: Der Filter kostet je
Bildpunkt.

## Folgen

- Der Hals ist in der App kürzer zu sehen als in den Proben: Die Wege sind lang, er
  reißt nach höchstens dreifacher Knopfgröße. Am Gerät nachsehen.
- Ohne Bewegung (`bewegungAus`) gibt es keinen Hals; die Kurven fallen auf feste zurück,
  wo `linear()` fehlt.
- Wer eine neue Stelle flüssig macht, nimmt `fluessigTakt(stelle)` und `fliessen()`.
