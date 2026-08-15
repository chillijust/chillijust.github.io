# Entscheidungen (ADRs)

Kurze Einträge, fortlaufend nummeriert, in der Reihenfolge des Entstehens. Jeder hält
fest, **was entschieden wurde und warum** — nicht, wie es gebaut ist; das steht in
`docs/architektur.md`.

**Diese Liste ist ein Wegweiser, keine Quelle.** Was gilt, steht in `CLAUDE.md` und im
jeweiligen Eintrag. Wo hier ⚠︎ steht, ist der Eintrag ganz oder teilweise überholt — er
bleibt stehen, weil er festhält, was probiert wurde und woran es scheiterte.

## Die tragenden zuerst

Wer neu dazukommt und nur fünf lesen will:

| | |
| --- | --- |
| [0001](0001-eine-einzige-html-datei.md) · [0059](0059-der-service-worker.md) | warum alles in einer Datei steht — und warum es jetzt zwei sind |
| [0002](0002-daten-build-pipeline.md) | warum Inhalte in `/data` liegen und eingebettet werden |
| [0030](0030-grammatik-als-funktion.md) | Grammatik ist eine Funktion, keine Karteikarte |
| [0057](0057-die-saetze-tragen-den-lehrplan.md) | die Sätze tragen den Lehrplan, nicht die Vokabeln |
| [0012](0012-chili-im-fluss-und-toene.md) · [0044](0044-knopf-in-der-kachel-und-das-jubelfenster.md) | wie sich die Chili bewegt — die häufigste Fehlerquelle in der Oberfläche |

## Alle

| Nr. | Titel | |
| --- | --- | --- |
| [0001](0001-eine-einzige-html-datei.md) | Auslieferung als eine einzige HTML-Datei | offener Punkt entschieden durch 0059 |
| [0002](0002-daten-build-pipeline.md) | Lerninhalte in `/data`, eingebettet durch `build.mjs` | |
| [0003](0003-jekyll-per-nojekyll-abschalten.md) | Jekyll per `.nojekyll` abschalten | |
| [0004](0004-bestaetigen-und-einstellungen.md) | Abgabe erst nach Bestätigung | |
| [0005](0005-kopfbereich-und-ikonografie.md) | Kopf als Statusanzeige, Symbole als Inline-SVG | Kopf später umgebaut (0018, 0019); die SVG-Regel gilt |
| [0006](0006-lernweg-paeckchen-und-freischaltung.md) | Päckchen, Wiedervorlage, gesperrtes Tippen | |
| [0007](0007-lehrplan-und-satzvoraussetzungen.md) | Funktionswörter zuerst, Sätze mit Voraussetzungen | |
| [0008](0008-lernsets-und-freestyle.md) | «Üben» wird zu «Lernsets» und «Freestyle» | |
| [0009](0009-faktensammlung-darstellung-symbol.md) | Faktensammlung, Darstellungswahl, App-Symbol | Darstellungswahl abgelöst durch 0039 |
| [0010](0010-maskottchen-in-der-app.md) | Das Maskottchen tritt in der App auf | |
| [0011](0011-wandernde-chili.md) | Die Chili wandert statt aufzutauchen | |
| [0012](0012-chili-im-fluss-und-toene.md) | Die Chili steht im Fluss, Antworten bekommen einen Ton | Punkt 2 korrigiert durch 0013 |
| [0013](0013-kompakte-kopfzeile-beim-scrollen.md) | Kompakte Kopfzeile statt reserviertem Streifen | |
| [0014](0014-tickets-ueber-vorausgefuellte-github-adresse.md) | Tickets über eine GitHub-Adresse | ⚠︎ überholt durch 0016 |
| [0015](0015-fertig-heisst-raus.md) | Fertig heißt raus — Wiederholung als eigener Stapel | |
| [0016](0016-tickets-bleiben-lokal.md) | Tickets bleiben lokal und werden gebündelt kopiert | |
| [0017](0017-sicherungscode-format-2.md) | Sicherungscode Format 2, Ansichten bauen danach neu auf | |
| [0018](0018-home-und-menue.md) | Home als Einstieg, Menü statt Reiterleiste | |
| [0019](0019-menue-als-ebene-chili-im-knopf.md) | Menü als Ebene darüber, Chili im Knopf | |
| [0020](0020-auswahl-hinter-einem-knopf.md) | Auswahl hinter einem Knopf statt in jeder Übung | |
| [0021](0021-melden-von-ueberall.md) | Melden von überall, aus einem Blatt heraus | |
| [0022](0022-bilanz-im-detail.md) | Bilanz im Detail, Ringe aus Inline-SVG | |
| [0023](0023-buchstaben-freiwillig.md) | Buchstaben als freiwillige Übung | |
| [0024](0024-buchstaben-wie-vokabeln.md) | Buchstaben werden abgefragt wie Vokabeln | |
| [0025](0025-sechs-tickets-vom-geraet.md) | Sechs Tickets vom Gerät | |
| [0026](0026-gemeistert-tippen-klang.md) | Gemeistert melden, Sätze tippen, den Klang reparieren | ⚠︎ Klangteil zurückgenommen durch 0028 |
| [0027](0027-stummschalter-und-webclip.md) | Der Stummschalter und die Home-Bildschirm-App | |
| [0028](0028-alter-klang-wieder.md) | Zurück zum alten Klang | |
| [0029](0029-richtung-wechselt-mit-der-stufe.md) | Die Übersetzungsrichtung wechselt mit der Stufe | |
| [0030](0030-grammatik-als-funktion.md) | Grammatik ist eine Funktion, keine Karteikarte | |
| [0031](0031-verben-im-praesens.md) | Verben im Präsens — und was der Beweis ans Licht brachte | Aspekt nachgetragen in 0057 |
| [0032](0032-praepositiv-und-belebtheit.md) | Der Präpositiv — warum Grammatik allein nicht reicht | |
| [0033](0033-wer-schreibt-der-bleibt.md) | «Falsch» ist eine dürftige Auskunft | |
| [0034](0034-power-training-und-gezielte-regel.md) | Power-Training, und die Regel gezielt wählen | |
| [0035](0035-buchstaben-tragen-woerter.md) | Buchstaben tragen Wörter | |
| [0036](0036-zurueck-heisst-woher.md) | Zurück heißt: woher man kam | |
| [0037](0037-buchstaben-zeigen-und-tastatur-waehlen.md) | Zeigen, wo es klemmte — und die Tastatur mitbringen | |
| [0038](0038-farbton-als-zweite-achse.md) | Der Farbton ist eine zweite Achse | ⚠︎ ersetzt durch 0039 |
| [0039](0039-ein-farbschema-statt-zweier-achsen.md) | Ein Farbschema statt zweier Achsen | |
| [0040](0040-in-dark-liegt-die-kachel-unter-dem-grund.md) | In «Dark» liegt die Kachel unter dem Grund | ⚠︎ abgelöst durch 0041 |
| [0041](0041-die-dunkle-palette-neu.md) | Die dunkle Palette neu | |
| [0042](0042-blaetter-und-eine-tiefere-leiter.md) | Blätter tragen den Grund, die helle Leiter steht tiefer | |
| [0043](0043-vier-neue-regeln.md) | Vier neue Regeln, und was sie über die Bauform verraten | |
| [0044](0044-knopf-in-der-kachel-und-das-jubelfenster.md) | Der Knopf zieht in die Kachel, der Jubel wird ein Fenster | |
| [0045](0045-gruppen-reiter-und-fakten-ueberall.md) | Gruppen auf Home, Reiter in den Einstellungen, Fakten überall | |
| [0046](0046-die-fortschrittsreihe-brennt.md) | Die Fortschrittsreihe brennt | |
| [0047](0047-der-jubel-gehoert-dem-ersten-mal.md) | Der Jubel gehört dem ersten Mal | |
| [0048](0048-ueben-duerfen-wann-man-will.md) | Üben dürfen, wann man will | |
| [0049](0049-die-chili-sagt-etwas-dazu.md) | Die Chili sagt etwas dazu | Gestalt des Kommentars geändert durch 0060 |
| [0050](0050-die-app-duzt.md) | Die App duzt | |
| [0051](0051-das-tutorial-ist-ein-scheinwerfer.md) | Das Tutorial ist ein Scheinwerfer | |
| [0052](0052-was-die-app-ueber-sich-selbst-weiss.md) | Was die App über sich selbst weiß | Offline-Anzeige abgelöst durch 0061 |
| [0053](0053-das-wort-steht-im-satz.md) | Das Wort steht im Satz | |
| [0054](0054-betonung-als-zahl.md) | Die Betonung ist eine Zahl | |
| [0055](0055-die-luecke-ist-ein-paar.md) | Die Lücke ist ein Paar | |
| [0056](0056-drei-strengen.md) | Drei Strengen — und drei Schalter dafür | |
| [0057](0057-die-saetze-tragen-den-lehrplan.md) | Die Sätze tragen den Lehrplan | |
| [0058](0058-erkennen-ist-nicht-unterscheiden.md) | Erkennen ist nicht unterscheiden | |
| [0059](0059-der-service-worker.md) | Der Service Worker — die zweite Datei | |
| [0060](0060-die-chili-sagt-es-selbst.md) | Die Chili sagt es selbst | |
| [0061](0061-der-punkt-ist-die-lampe.md) | Der Punkt hinter dem Namen ist die Statuslampe | |
| [0062](0062-der-knopf-sucht-und-laedt.md) | Der Knopf sucht und lädt — er meldet nicht nur | Ladeanzeige geändert durch 0063 |
| [0063](0063-sechs-tickets-vom-geraet.md) | Sechs Tickets vom Gerät — Farbe, Ordnung und ein stehengebliebener Satz | |
| [0064](0064-der-akzent-gehoert-zum-schema.md) | Der Akzent gehört zum Schema, der Schatten auch | ⚠︎ Schattenteil abgelöst durch 0071 |
| [0065](0065-ein-weg-statt-einer-wand.md) | Ein Weg statt einer Wand — und ein Strich, der nicht mitgeschrieben wird | |
| [0066](0066-der-weg-und-die-wahl.md) | Die Reihenfolge ist der Weg, die Empfehlung eine Leiter | |
| [0067](0067-fuenf-tickets-und-ein-merkzettel.md) | Fünf Tickets — und ein Merkzettel für Erklärungen | |
| [0068](0068-die-marke-und-der-ort.md) | Die Schreibmarke gehört ins Feld, der Ort überlebt das Update | |
| [0069](0069-der-rueckweg-und-die-wahl.md) | Der Rückweg für Tickets, und der Bezug wird eine Wahl | |
| [0070](0070-gelegt-ist-auch-geschrieben.md) | Die Nachschrift kommt auch nach falsch gelegten Kacheln | ändert 0056 |
| [0071](0071-nichts-huepft-nichts-schiebt.md) | Der Hüpfer nur nach einem Flug, kein Schatten, nichts schiebt | löst 0064 §1 ab |
| [0072](0072-der-vordereingang.md) | Der Weg durchs Menü beginnt am Anfang der Ansicht | ergänzt 0036 |
| [0073](0073-auch-saetze-heisst-alle-stufen.md) | «Auch Sätze» wirkt auf allen Stufen, gelegt wie getippt | ergänzt 0056, 0070 |
| [0074](0074-null-anteil-klappfeld.md) | Null heißt «gar nicht», der Anteil in Prozent, der Bezug ein Klappfeld | ergänzt 0015, 0069 |
| [0075](0075-defizite-und-drei-rubriken.md) | Die Bilanz zeigt Defizite, die Übersicht wird eingerichtet | ergänzt 0066 |
| [0076](0076-das-menue-misst-seinen-inhalt.md) | Das Menü ist so breit wie sein längster Eintrag | ergänzt 0019 |
| [0077](0077-ein-stern-zeichnet-nichts-neu.md) | Ein Stern schaltet an Ort und Stelle, ohne Renderlauf | ergänzt 0071 |
| [0078](0078-ort-und-art-und-ein-dritter-reiter.md) | Ort und Art sind zwei Felder, «Bearbeiten» ein dritter Reiter | ergänzt 0069, 0025 |
| [0079](0079-eine-spur-je-uebung.md) | Eine Tutorial-Spur je Übung, angeboten beim ersten Betreten | ergänzt 0051 |
| [0080](0080-der-tutorialknopf-wird-klein.md) | Der Tutorial-Knopf wird klein und rund und zieht in den Kopf | ändert 0079 |
| [0081](0081-fuenf-tickets-vom-geraet.md) | Fünf Tickets — Auskunft, Puls, Liste, Gestalt, Leiste | ändert 0078, 0080 |

## Einen neuen anlegen

Nächste freie Nummer, Dateiname `NNNN-kurzer-titel.md`. Aufbau: **Ausgangslage**
(was nicht stimmte), **Entscheidung**, **Begründung**, **Folgen**. Wer einen älteren
Eintrag ablöst, schreibt es in **beide** Köpfe und trägt es hier nach — ein überholter
Eintrag ohne Vermerk ist eine Falle für den Nächsten.
