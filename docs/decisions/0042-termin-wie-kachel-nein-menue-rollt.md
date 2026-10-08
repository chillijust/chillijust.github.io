# 0042 · Termin wie eine Kachel, «Nein» in der Frage, Menüknopf rollt mit, Meldung ohne zweiten Tropfen

*2026-10-08 · drei Tickets und ein Nachtrag vom Gerät (App-Stand 0.13.0T) · Version 0.13.0T2 ·
ändert 0041*

## Ausgangslage

- «Timer abbrechen?» trug zwei Knöpfe, die beide «Abbrechen» hießen — einer brach den Timer ab,
  der andere die Frage.
- Ein Termin von heute ließ sich nur über den kleinen Haken rechts abhaken; ein Tipp auf die Zeile
  öffnete ihn. Gewünscht war, was die Kachel einer Gewohnheit tut: antippen hakt ab, lange drücken
  öffnet.
- Rollte die Seite bei offenem Menü, rollte der Menüknopf aus dem Bild, das Menü blieb stehen und
  hing an nichts.
- Nachtrag zu 0041: Ein Fenster wurde zur Meldung, aber führte das Speichern nicht aufs Dashboard —
  Wochenreflexion aus dem Journal oder aus «Lesen», ein Formular aus dem Export —, tropfte die
  nächste Ansicht danach noch einmal aus dem getippten «Speichern». Drei Tropfen für einen Vorgang.

## Entscheidung

- **Eine Frage verneint man**: Der Ausweg einer Frage im Glas heißt «Nein» (`hinweisFrage.nein`
  kann ihn anders nennen), eine Wahl wie «Hinzufügen» bricht man weiter mit «Abbrechen» ab.
  «Timer abbrechen?» fragt mit «Ja» und «Nein»; «Es läuft schon ein Timer» mit «Abbrechen, diesen
  starten» und «Weiterlaufen lassen».
- **Der Termin ist eine Kachel**: An einem Tag, der nicht mehr kommt, ist die ganze Zeile der
  Haken — antippen hakt diesen Tag ab, noch einmal nimmt es zurück, lange drücken öffnet. Der runde
  Haken steht rechts **in** der Zeile; abgehakt treten Zeit und Text zurück, der grüne Haken nicht.
  An einem kommenden Tag gibt es nichts abzuhaken, dort öffnet schon das Antippen.
- **Der Menüknopf rollt nicht davon**: Rollt die Seite bei offenem Menü, folgt das Blatt dem Knopf;
  erreicht er den oberen Rand, bleibt dort sein Gast stehen — derselbe wie in 0041, nur ohne Fall —,
  und das Blatt hängt unter ihm. Kommt der Knopf zurück ins Bild, löst sich der Gast in ihn auf
  (`menueMitrollen` am `scroll` des Fensters).
- **Nach der Meldung steht die nächste Ansicht still dahinter**: Ist das Fenster zur Meldung
  geworden (`fensterIstMeldung`), wächst die nächste Ansicht weder aus dem getippten Knopf noch
  fließt die alte zurück — sie blendet sich nur weich ein, wohin sie auch führt.

## Begründung

Zweimal dasselbe Wort für Gegenteiliges ist eine Falle, gerade bei etwas, das nicht zurückgeht.
Eine Zeile, die anders reagiert als die Kachel darüber, muß man lernen; eine, die dasselbe tut,
nicht. Ein Menü ohne seinen Knopf sieht aus, als sei es liegengeblieben. Und eine Meldung, hinter
der noch etwas tropft, ist wieder zwei Bewegungen für einen Vorgang — genau das, was 0041
abschaffen wollte; der Fehler saß im gemeinsamen Übergang, darum gilt die Abhilfe überall.

## Folgen

- Suiten: `timer` T8a, T15a; `nachschliff` A2a; `termine` D8–D8b, F24a, H1, H3a, H6a; `menue`
  M1–M4; `journal` W1–W3; angepaßt `bewegung` A1–A7, R3 (aus dem Abgewöhnen und dem Menü statt aus
  einem Termin von heute) und `langdruck` K1–K3.
- Version 0.13.0T2: gelesen wird alles wie bisher.
