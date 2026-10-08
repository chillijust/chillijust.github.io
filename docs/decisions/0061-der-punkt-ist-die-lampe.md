# 0061 · Der Punkt hinter dem Namen ist die Statuslampe

**Stand:** angenommen · 2026-08-14 · aus einem Ticket
**Löst ab:** die Offline-Zeile aus ADR 0052 («Was die App über sich selbst weiß»)

## Ausgangslage

Seit ADR 0052 sagt die App im Kopf, wenn sie offline ist — eine kleine Zeile in
Versalien, unten in der Fortschrittsleiste, dort wo sonst «gespeichert» aufblitzt. Sie
tat, was sie sollte, und war doch an zwei Stellen unglücklich:

Sie stand **nur bei schlechten Nachrichten** da. Wer nichts sah, wusste nicht, ob alles
in Ordnung ist oder ob die Anzeige klemmt. Und sie stand **nur auf Home** — unterwegs
gibt es keine Fortschrittsleiste, also auch keine Auskunft.

Daneben trug der Name seit jeher einen goldenen Punkt: «Chillingo**.**» Ein Satzzeichen
in der Wortmarke, hübsch, aber ohne Aufgabe. Und darüber stand die Augenbraue
«Русский · Тренажёр» — eine Zeile, die sagte, was der Name darunter schon sagt.

## Entscheidung

**Der Punkt hinter dem Namen wird die Statuslampe.** Grün, solange das Gerät ein Netz
hat; rot im Funkloch. Auf Home steht das Wort daneben — «ONLINE» beziehungsweise
«OFFLINE», in der kleinen Versalienschrift der Kopfzeilen. Unterwegs, wo der Kopf den
Namen der Übung trägt, bleibt der Punkt allein: «Lernsets**.**»

Die alte Zeile `#offlineNote` entfällt ersatzlos. Die Augenbraue auf Home wird geleert,
behält aber ihre Zeilenhöhe.

## Begründung

### Warum die Lampe neben der Überschrift steht, nicht darin

Der naheliegende Weg wäre gewesen, den Punkt im `<h1>` zu lassen und ihn dort
einzufärben. Das hätte den Namen der Ansicht mit einer zweiten Angabe vermischt: `Tippen.`
statt `Tippen`, `Sicherung. ONLINE` statt `Sicherung`. Vier Suiten prüfen den Namen genau
so, wie er dasteht — und sie täten gut daran.

Also trägt `#kopfTitel` weiterhin **genau den Namen** und sonst nichts; die Lampe ist ihr
eigenes Stück daneben, in einer gemeinsamen Zeile. Nebenwirkung: `renderKopf()` und
`netzZeigen()` schreiben nie in dasselbe Element und können sich nicht gegenseitig
überschreiben.

### Warum automatisch — und warum es gar nicht anders geht

Gefragt wird `navigator.onLine`, gemeldet über die Ereignisse `online` und `offline`. Das
kostet keine Verbindung und meldet sich von selbst.

Ein Knopf zum Nachsehen wäre keine Alternative, sondern **unmöglich**: Wirklich messen
hieße, irgendwo anzuklopfen. Die CSP dieser Datei führt bewusst kein `connect-src`, und
`pruefen.mjs` bricht bei jeder Fremdadresse ab (ADR 0003 ff.). Die Seite baut keine
Verbindung auf — also kann sie auch keine prüfen.

### Der Vorbehalt bei Grün

`navigator.onLine === true` heißt «dieses Gerät hat ein Netz», nicht «das Internet ist
erreichbar». Im Hotel-WLAN vor der Anmeldeseite steht der Punkt grün, obwohl nichts
durchgeht.

Das steht in einer gewissen Spannung zu ADR 0052 («Ohne Netz kommt kein Urteil» — die App
behauptet nichts über einen Stand, den sie nie gesehen hat). Der Unterschied: Dort ging es
um eine **Aussage über eine fremde Fassung**, die nur das Netz beantworten kann. Hier geht
es um den **eigenen Zustand des Geräts**, und den kennt das Gerät. Rot stimmt immer, grün
steht unter Vorbehalt — und weil die App ohnehin nie etwas aus dem Netz braucht, hat ein
falsches Grün keine Folge außer sich selbst.

Wichtig bleibt: Die Auskunft «Nach Aktualisierung suchen» in den Einstellungen wird davon
**nicht** abgeleitet. Sie fragt weiter den Service Worker und sagt weiter «Kein Netz»,
wenn sie nichts gesehen hat.

### Warum die Farbe nicht allein trägt

Rot und Grün unterscheiden sich für einen Teil der Menschen nicht. Auf Home steht darum
das Wort daneben. Unterwegs, wo dafür kein Platz ist, trägt der Punkt `role="img"` und ein
`aria-label` mit demselben Wort — das Wort daneben ist `aria-hidden`, damit die Auskunft
nicht doppelt kommt.

**Was dabei verloren geht:** Die alte Zeile war ein `role="status"` und meldete den
Wechsel von selbst. Die Lampe tut das nicht. Ein Live-Bereich im Kopf hätte bei **jedem**
Ansichtswechsel «Online» gerufen, weil dort das Wort kommt und geht — Lärm für eine
Nachricht, die man auch sieht. Das ist eine bewusste Abwägung, kein Versehen.

### Warum die Augenbraue geht, ihr Platz aber bleibt

«Русский · Тренажёр» war Zierde. Ersatzlos streichen ließ sie sich trotzdem nicht: Ein
leeres Element hat keine Zeilenbox, und «Chillingo» wäre zehn Pixel nach oben an den
Bildschirmrand gerutscht. `.eyebrow:empty::before { content: '\200B'; }` baut die Zeile
auf, ohne etwas zu zeigen oder vorzulesen. Unterwegs sagt die Augenbraue weiterhin
«Übung» oder «Menü» — dort ist sie eine Angabe, keine Zierde.

## Folgen

- `#offlineNote` und `offlineZeigen()` sind fort. An ihre Stelle treten `#netzStand`
  (mit `#netzPunkt` und `#netzWort`) und `netzZeigen()`.
- `renderKopf()` ruft `netzZeigen()` am Ende auf: Die **Ansicht** entscheidet, ob das
  Wort steht. Die Ereignisse `online`/`offline` rufen sie direkt: Das **Netz**
  entscheidet über die Farbe.
- `.title-dot` ist nicht mehr golden, sondern `--good`, in `.aus` dann `--bad`. Damit
  hängt der Punkt an den Signalfarben des Schemas — sie stehen einmal für alle hellen
  Schemata (ADR 0039), also heißt Rot überall dasselbe.
- Abschnitt B der Suite `robust` ist neu geschrieben (16 Prüfungen statt 4): Sitz des
  Punktes hinter dem Namen, beide Wörter, beide Farben **gegen `--good`/`--bad`
  gerechnet**, das Verschwinden des Wortes unterwegs, die Vorlesbarkeit, und dass
  `#kopfTitel` weiterhin nur den Namen trägt.
