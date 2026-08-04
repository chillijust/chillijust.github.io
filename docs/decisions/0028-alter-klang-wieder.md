# 0028 · Zurück zum alten Klang

**Status:** angenommen · 2026-08-04 · nimmt den Klangteil von ADR 0026 zurück

## Kontext

ADR 0026 hat zwei Dinge zugleich getan: den Ton **repariert** (Zustand `interrupted`,
asynchrones `resume()`, Vorlauf beim Planen) und ihn **umgeschrieben** — von zwei
schlichten Oszillatoren auf Anschläge aus mehreren Teiltönen mit unterschiedlich
schnellem Ausklang, «glasig, mehr wie iOS».

Auf dem Gerät klingt jetzt beides. Der Betreiber hat den neuen Klang gehört und den alten
zurückverlangt.

## Entscheidung

**Der Klang geht auf den Stand vor ADR 0026 zurück**, die Reparatur bleibt.

| Anlass | Klang |
| --- | --- |
| richtig | A5, darüber E6 nach 90 ms — Sinus, 0,17 s |
| falsch | G3, darunter D♯3 nach 110 ms — Dreieck, 0,22 s |
| gemeistert | A5 · C♯6 · E6 · A6, je 75 ms versetzt — derselbe Sinus wie «richtig» |

`tonAnschlag()` mit seiner Partialtabelle entfällt; `tonNote()` nimmt seinen Platz ein:
ein Oszillator, eine Hüllkurve.

## Begründung

**Der Betreiber hat es gehört, ich nicht.** Headless hat keinen Ton; meine Begründung für
den glasigen Klang stützte sich auf Theorie über Glockenspektren, nicht auf das Ergebnis.
Wo eine Entscheidung Geschmack ist und jemand sie tatsächlich beurteilen kann, gewinnt
dessen Urteil gegen jedes Argument von hier.

**Der Unterschied lässt sich benennen:** Ein langer Ausklang mit Obertönen klingt nach
*Benachrichtigung* — nach etwas, das Aufmerksamkeit einfordert. Zwei kurze Sinustöne
klingen nach *Rückmeldung*: Sie quittieren und sind weg. Wer zwanzig Minuten am Stück
antwortet, hört den zweiten Klang hundertmal; da ist Unauffälligkeit die bessere
Eigenschaft.

**Der Meisterklang bleibt, aber als Verwandter.** Er ist neu (ADR 0026) und hat keinen
alten Stand, auf den man zurückgehen könnte. Er benutzt jetzt denselben Sinus und
dieselbe Hüllkurve wie «richtig», nur als aufsteigenden Vierklang — er soll als Steigerung
des gewöhnlichen «richtig» hörbar sein, nicht als Fremdkörper daneben.

**Reparatur und Geschmack gehören getrennt.** Dass beides in einem Commit steckte, hat
diese Rücknahme unnötig umständlich gemacht: Der Klang ließ sich nicht zurückdrehen, ohne
den Fehler wieder einzubauen. Künftig geht das eine ohne das andere.

## Folgen

- Die Testreihe prüft jetzt den Zweiklang statt der Teiltöne — inhaltlich dieselbe Frage:
  *was* plant die App.
- Die Reparaturen aus ADR 0026 (`interrupted`, asynchrones `resume()`, 20 ms Vorlauf) und
  aus ADR 0027 (`audioSession`, Freigabe über den stillen Puffer) bleiben unberührt. Der
  Klang hängt nicht an ihnen.
- ADR 0026 bleibt als Aufzeichnung stehen; sein Klangteil ist durch diesen hier überholt.
