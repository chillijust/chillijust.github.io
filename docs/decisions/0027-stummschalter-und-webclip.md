# 0027 · Der Stummschalter und die Home-Bildschirm-App

**Status:** angenommen · 2026-08-04 · ergänzt ADR 0026

## Kontext

Nach der Reparatur aus ADR 0026 klingt der Ton im Browser, aber nicht in der über
Safari → «Zum Home-Bildschirm» abgelegten App. Deren Symbol heißt bei Apple **Webclip**;
die App läuft darin im **Standalone-Modus**, also im Vollbild ohne Safari-Leisten.

Die Ursache liegt nicht am Standalone-Modus selbst, sondern an der **Audiositzung**: Ohne
Zutun läuft Webton auf iOS in der Sitzungsart `ambient` — und die schweigt, sobald der
seitliche Stummschalter gestellt ist. Im Browser fällt das seltener auf, weil man dort
zwischendurch Videos oder anderes hört; die Home-Bildschirm-App macht man auf, lernt
zwanzig Minuten und hört sonst nichts.

Dazu kommt: Ein `AudioContext`, der nie einen Ton ausgegeben hat, gilt auf iOS als nicht
freigegeben. Er steht auf `running` und liefert trotzdem nichts.

## Entscheidung

1. **`navigator.audioSession.type = 'transient'`** (Safari ab 16.4), gesetzt beim ersten
   Tipp. Kennt die Fassung `transient` nicht, greift `playback`.
2. **`tonEntsperren()` beim ersten Tipp irgendwo in der App:** Sitzungsart setzen,
   Kontext anlegen, wecken und einen unhörbaren Ein-Sample-Puffer abspielen.
3. **Eine Selbstauskunft in den Einstellungen** («Ton prüfen»): spielt den Klang und
   nennt darunter Einstellung, Kontextzustand, Freigabe und Sitzungsart.

## Begründung

**`transient`, nicht `playback`.** Beide klingen trotz Stummschalter, aber `playback`
hält laufende Musik an — wer nebenbei etwas hört, bekäme nach der ersten Vokabel Stille.
`transient` ist genau für kurze Rückmeldungen gedacht: Es drängt anderes Audio für den
Augenblick weg und gibt es danach zurück. Für zwei Töne von 0,6 Sekunden ist das die
richtige Zusage an das Gerät.

**Den Stummschalter zu übergehen ist hier vertretbar.** Er ist ein Signal, keine
Anweisung: Wer die Lern-App öffnet und antwortet, will die Rückmeldung. Wer sie nicht
will, hat den Schalter in den Einstellungen — und der schaltet den Ton wirklich ab,
nicht bloß leise.

**Der stille Puffer ist kein Aberglaube.** iOS gibt einen Audiokontext erst frei, wenn
er *innerhalb einer Nutzergeste* tatsächlich etwas ausgegeben hat. `resume()` allein
genügt nicht; der Zustand meldet dann `running` und die Ausgabe bleibt trotzdem leer.
Ein Puffer von einem Sample ist der billigste Weg, diese Bedingung zu erfüllen — er
kostet nichts und ist nicht zu hören.

**Die App muss selbst sagen können, woran es liegt.** «Kein Ton» hat vier Ursachen, die
von außen alle gleich aussehen: Schalter aus, Kontext schlafend, Stummschalter ohne
Sitzungssteuerung, oder gar kein Web-Audio. Ohne Auskunft bleibt nur Raten — und Raten
über zwei Geräte hinweg, die ich nicht in der Hand habe, kostet jede Runde einen ganzen
Durchgang. Die Zeile unter «Ton prüfen» beendet das.

**Verifiziert ist die Absicht, nicht der Klang.** Headless hat keinen Ton. Die Testreihe
prüft mit einem Schein-Kontext, *was* die App tut: welche Sitzungsart sie setzt, dass sie
den stillen Puffer spielt, dass sie es genau einmal tut und dass die Auskunft jede
Ursache beim Namen nennt. Ob es auf dem iPhone klingt, sagt nur das iPhone.

## Folgen

- `tonSitzungGesetzt` und `tonEntsperrt` sind einmalige Merker, kein Ansichtszustand —
  sie gehören ausdrücklich **nicht** in `ansichtenZuruecksetzen()`.
- Der Hinweistext zur Einstellung `ton` behauptet nicht mehr, der Stummschalter habe
  Vorrang; er sagt jetzt, unter welcher Bedingung er es nicht hat.
- Kennt ein Gerät `navigator.audioSession` nicht, bleibt es beim alten Verhalten. Die
  Auskunft sagt das dann ausdrücklich.
- `tonBereit()` legt den Kontext weiterhin nur an, wenn die Einstellung an ist; wer den
  Ton abschaltet, bekommt keinen Audiokontext.
