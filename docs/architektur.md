# Architektur

Eine Datei, ein Skript, ein Zustand. Dieses Papier beschreibt, wie `index.html` gebaut ist —
es wächst mit jedem Bauabschnitt.

## Aufbau der Datei

| Teil | Inhalt |
| --- | --- |
| `<head>` | Meta für iOS, CSP, App-Symbol (Daten-URI), `theme-color` |
| `<style>` | Schriftblock (generiert), Farbtokens hell/dunkel, Bausteine |
| `<body>` | `#app` mit `#kopf`, `#swNeu`, `#ansicht`; daneben `#menue` und `#meldung` |
| `<script>` | genau einer, `'use strict'`, ES5-nah |

Im Skript, von oben: Version und Stand · `CHILI_BILD` · Hilfen (`esc`, `ICON`, Datum,
`melden`, Tage) · Zustand und Speicher · Darstellung · Bewegung (Tropfen) · Gewohnheiten
(Rechnung) · Abgewöhnen (Rechnung, Welle) · Termine · Kalender-Export (`.ics`) · Ansichten ·
Menü · Service Worker · Start.

## Zustand

```js
state = {
  schema: 1,
  thema: 'auto',     // 'auto' | 'hell' | 'dunkel'
  kalender: 'woche', // 'woche' | 'monat' — was der Kalender zuletzt zeigte
  gewohnheiten: [{
    id: 'g…',
    name: 'Lesen',                       // höchstens NAME_MAX Zeichen
    rhythmus: { art: 'taeglich' }        // | { art: 'wochentage', tage: [1, 4] }  (0 = Sonntag)
                                         // | { art: 'proWoche', anzahl: 3 }      (1–6)
    angelegt: '2026-10-05',              // Tagesschlüssel, lokale Zeit
    erledigt: ['2026-10-05', …],         // sortiert, einmalig
    archiviert: null,                    // | Tagesschlüssel
    erinnerung: null                     // | 'HH:MM' — nur für den Kalender-Export
  }],
  abgewoehnen: [{
    id: 'a…',
    name: 'Rauchen',
    start: 1791100000000,                // Zeitpunkt in ms — «frei seit» ist eine Dauer
    rueckfaelle: [{ zeit: …, notiz: '' }],  // sortiert, keiner vor dem Start
    draenge: [1791200000000, …],         // gewonnene Dränge
    archiviert: null
  }],
  termine: [{
    id: 't…',
    titel: 'Zahnarzt',                   // höchstens TITEL_MAX Zeichen
    tag: '2026-10-16',                   // der erste Termin einer Reihe
    ganztags: false,
    von: '09:30', bis: '10:15',          // null ganztags; bis darf fehlen, liegt sonst nach von
    wiederholung: 'keine',               // | 'taeglich' | 'woechentlich' | 'monatlich'
    wiederholungBis: null,               // | Tag — nur bei einer Reihe
    vorlauf: 15,                         // Minuten vor dem Beginn, aus VORLAUF_ZEIT / VORLAUF_GANZ, oder null
    ort: '', notiz: ''
  }],
  welle: null,                           // | { id, start } — die laufende 10-Minuten-Welle
  exportiert: null                       // | Zeitpunkt in ms — wann zuletzt eine .ics hinausging
}
```

- **Gespeichert sind nur Tage.** Stärke, Serie, «nie zweimal» und die Punkte rechnet
  `auswerten(g, heute)` bei jedem Zeichnen neu (ADR 0002, `.claude/rules/logik.md`).
- **`jetzt()` ist die einzige Uhr**; Tage sind Schlüssel `JJJJ-MM-TT` (`tagSchluessel`,
  `tagPlus`, `wochenAnfang`).
- `gewohnheitLesen()` prüft jede Gewohnheit einzeln; was nicht paßt, fällt weg.
  `lasterLesen()` ebenso fürs Abgewöhnen; eine Welle gilt nur für etwas, das es gibt und
  das nicht archiviert ist.
- **Abgewöhnen** (ADR 0004): `lasterAuswerten(a, nun)` liefert «frei seit», Rekord und
  Stärke; `zeitJetzt()` ist `jetzt()` in Millisekunden. Geändert wird nur über
  `rueckfallEintragen`, `welleBeginnen` und `welleGewonnen`.

- **Termine** (ADR 0006): `terminAm(t, k)` sagt, ob ein Termin an einem Tag liegt,
  `termineAm(k)` liefert sie sortiert (ganztags zuerst, dann Uhrzeit). Monatlich fällt in
  Monaten ohne die Tageszahl aus. `terminLesen()` prüft jeden einzeln.

- **Kalender-Export** (ADR 0009): `kalenderDatei(heute, nun)` schreibt die `.ics` aus
  `exportTermine(heute)` (was heute oder später noch liegt) und `exportGewohnheiten()`
  (laufend, mit Erinnerung) — je ein VEVENT über `terminEreignis` bzw.
  `gewohnheitEreignis`, Zeiten schwebend in der Zeit des Geräts, Zeilen über `icsFalten`.
  Hinaus geht sie über `icsLaden` (Blob, `<a download>`), das `exportiert` setzt;
  Teilen gibt es nicht mehr (ADR 0013).
  Die Kachel zeichnet ihre Wege immer mit, nur verborgen; `exTeileNachziehen()` (aus
  `bindeExport`) vergleicht mit `exTeileZuvor` und läßt Geändertes über `teilTropfen`
  auf- und zugehen. Außerhalb der Exportansicht ist `exTeileZuvor` `null` (ADR 0012).

- **Ein Schlüssel**: `chillinal_v1`. `laden()` liest, `stand(roh)` übernimmt nur bekannte
  Felder mit gültigen Werten und füllt den Rest aus `grundStand()`. Kaputtes JSON, ein
  fremder Wert, ein werfender Speicher — alles ergibt den Grundstand.
- `speichern()` schreibt den ganzen Zustand und meldet ein Scheitern über `melden()`.
- **Neue Felder** bekommen ihren Vorgabewert in `grundStand()` und ihre Prüfung in
  `stand()`. Erst wenn ein vorhandener Stand **anders gelesen** werden muß, steigt das
  Schema — mit neuem Schlüssel und Migration — und die erste Ziffer der Version.

## Render-Zyklus

`render()` zeichnet erst den Kopf (`renderKopf()`), dann die Ansicht: `ANSICHTEN[ansicht]
.zeichnen()` liefert HTML, danach hängt `bindeAnsicht()` die Ereignisse an. Kein Diffing,
keine Teilaktualisierung — eine Ansicht ist schnell genug neu gezeichnet. Danach zieht
`heldNachziehen()` die Höhe der Karte oben weich nach und `wahlenSetzen()` legt die Marken
der Umschalter (ADR 0007).

- **Bewegung legt sich über das Neuzeichnen, sie verzögert es nie** (ADR 0007).
  `zeige()` nimmt vor `render()` die alte Ansicht als Geist (`uebergangVorbereiten`) und
  läßt danach die neue aus dem getippten Element wachsen oder die alte in ihre Herkunft
  schrumpfen (`uebergangAusfuehren`). Woher getippt wurde, merkt sich `tippMerken` (Erfassung
  von `pointerdown` und `click`); `herkunft` hält den Selektor auf dem Dashboard,
  `homeScroll` die Rollposition. Der Tag im Kalender öffnet mit `tropfenFallen`, schließt
  mit `leisteZurueck`.
  Der Hinweis (`hinweisZeigen`/`hinweisSchliessen`) liegt außerhalb von `#app` in
  `#hinweisBlatt` und überlebt darum jedes `render()`. Er tropft über `tropfenAuf` und
  `tropfenZu` wie eine Ansicht (ADR 0013).

- `zeige(name, id)` wechselt die Ansicht; ein unbekannter Name landet beim Dashboard.
  `neu` und `bearbeiten` legen dabei den `entwurf` an; `bearbeiten` ohne gültige `id`
  landet ebenfalls beim Dashboard.
- **Ansichten:** `home` (Dashboard), `neu` (Neue Gewohnheit, mit Umschalter Angewöhnen |
  Abgewöhnen), `bearbeiten` (Gewohnheit: Stand, Formular, Archivieren), `abgewoehnen`
  (Stand, Formular, Rückfälle, Archivieren), `welle` (Drang), `rueckfall`, `terminNeu` und
  `termin` (Formular, Löschen), `export` (Kalender-Export), `einstellungen`. Wer aus `export` eine
  Gewohnheit oder einen Termin öffnet, kommt über `rueckZiel` dorthin zurück — mit dem
  Rückweg wie nach dem Speichern. `termin` braucht eine gültige `id`,
  `terminNeu` nimmt statt dessen einen Tag; beide legen `terminEntwurf` an.
  `abgewoehnen` und `rueckfall` brauchen eine gültige `id`, `welle` eine laufende Welle —
  sonst geht es zum Dashboard.
- **Der Takt:** `takt()` läuft jede Sekunde und schreibt «frei seit» (`[data-frei]`), die
  Restzeit auf dem Drang-Knopf (`[data-wellerest]`) und den Ring der Welle an Ort und
  Stelle. Neu gezeichnet wird nur, wenn die Welle durch ist.
- **Das Formular zeichnet sich beim Wählen nicht neu**: Rhythmus, Tage und Zähler ändern
  `entwurf` und die Knöpfe an Ort und Stelle; gespeichert wird mit dem Knopf.
- **Abhaken** (`[data-haken]`) ändert `erledigt`, speichert und zeichnet neu; die eben
  getippte Kachel trägt dabei `gerade` für ihre Animation. Kacheln bleiben, wo sie sind.
  **Lange drücken** (`langDruecken`, 500 ms) öffnet statt dessen `bearbeiten`; der Klick
  danach ist gesperrt (`langGedrueckt`).
- **Jede Änderung eines Tages** geht über `umschalten(id, tag)` — die Kachel für heute,
  der Kalender (`[data-nachtrag]`) für bis zu `NACHTRAG_TAGE` zurück.
- **Oben steht eine Karte** (`zeichneHeld`, ADR 0005): Tagesring mit Chili und der
  Umschalter Woche | Monat, darunter der Kalender.
- **Kalender** (`zeichneKalender`, `bindeKalender`): `state.kalender` wählt Woche oder
  Monat; was zu sehen ist, halten `kalVersatz` (Wochen bzw. Monate von heute) und `kalTag`
  (der angetippte Tag) — beide nur im Speicher der Seite, nicht in `state`. Jeder Tag trägt
  vorn einen blauen Punkt, wenn er Termine hat, dann einen je Gewohnheit (`kalPunkte`);
  `kalStufe` aus `tagesStand(k)` färbt nur noch die Zahl eines vollen Tags. Die
  Tagesliste (`zeichneTagesleiste`) zeigt Termine, Gewohnheiten und «Termin an diesem
  Tag» (`[data-neutermin]`). `kalZeige(k)` stellt den Kalender auf einen Tag — nach dem
  Speichern eines Termins. Blättern und Umschalten setzen `kalGewechselt` für das
  Einblenden des Rasters.
- **Termine heute** stehen unter der Karte; eine Zeile (`zeichneTerminZeile`,
  `[data-termin]`) öffnet den Termin — auf dem Dashboard wie in der Tagesliste.
- **Ringe** werden mit dem Ziel gezeichnet und tragen in `data-von` den zuletzt gezeigten
  Wert (`ringZuletzt`); `ringeFuellen()` läßt sie nach jedem `render()` herüberlaufen.
- `visibilitychange` zeichnet das Dashboard und die Welle ganz neu — nach Mitternacht ist es
  ein anderer Tag, nach zehn Minuten im Hintergrund ist die Welle durch.
- Der Kopf hat zwei Gestalten: auf dem Dashboard Titel, Datum, Sonne/Mond, Menüknopf;
  unterwegs Rückweg und Titel.
- Das Menü klappt unter dem Menüknopf auf (`blattLegen`), über einem Schleier, gezeichnet
  beim Öffnen aus `MENUE`; es quillt als Tropfen aus dem Knopf und fließt zurück. Ein
  Eintrag mit `ziel` öffnet die Ansicht als Tropfen aus dem Eintrag und schließt das Menü
  sofort (`menueSchliessen(true)`), einer ohne meldet «kommt» (ADR 0008).
- **Tropfen** (`tropfenAuf`, `tropfenZu`): Wo die Quelle rund ist (`tropfenQuelle`), läuft
  der Übergang in einer festen Hülle (`.tropfen-huelle`) mit einem Geist darin statt als
  Zoom. Woche | Monat behalten `kalTag`; `kalAnker` und `versatzFuer` wählen, was zu sehen
  ist, `kalFliessen` läßt den Monat aus der Woche quellen und zurück; Kartenhöhe (`heldTakt`) und
  Tagesliste (`leisteGleiten`) laufen dabei im selben `KAL_TAKT`.

## Darstellung

Die Palette steht als CSS-Variablen: hell im `:root`, dunkel zweimal gleich — unter
`@media (prefers-color-scheme: dark)` für `:root:not([data-thema="hell"])` und unter
`:root[data-thema="dunkel"]`. Die Suite `thema` vergleicht beide Wert für Wert.
`themaAnwenden()` setzt nur das Attribut und `theme-color`; ohne Wahl tut das Stylesheet
die Arbeit allein.

## Service Worker

`swAnmelden()` beim Start. Wartet eine neue Fassung und läuft schon eine, erscheint
`#swNeu`; «Jetzt laden» schickt `uebernehmen`, beim Wechsel des Workers lädt die Seite
einmal neu. Die Einstellungen zeigen die gespeicherte Fassung (`swAuskunft()`) und haben
«Nach Aktualisierung suchen» (`swNachsehen()` → `ok` · `kein netz` · `unmoeglich`) und den
Notausgang `swAufraeumen()`.
