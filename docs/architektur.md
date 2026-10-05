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
`melden`, Tage) · Zustand und Speicher · Darstellung · Gewohnheiten (Rechnung) · Ansichten ·
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
    archiviert: null                     // | Tagesschlüssel
  }]
}
```

- **Gespeichert sind nur Tage.** Stärke, Serie, «nie zweimal» und die Punkte rechnet
  `auswerten(g, heute)` bei jedem Zeichnen neu (ADR 0002, `.claude/rules/logik.md`).
- **`jetzt()` ist die einzige Uhr**; Tage sind Schlüssel `JJJJ-MM-TT` (`tagSchluessel`,
  `tagPlus`, `wochenAnfang`).
- `gewohnheitLesen()` prüft jede Gewohnheit einzeln; was nicht paßt, fällt weg.

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
keine Teilaktualisierung — eine Ansicht ist schnell genug neu gezeichnet.

- `zeige(name, id)` wechselt die Ansicht; ein unbekannter Name landet beim Dashboard.
  `neu` und `bearbeiten` legen dabei den `entwurf` an; `bearbeiten` ohne gültige `id`
  landet ebenfalls beim Dashboard.
- **Ansichten:** `home` (Dashboard), `neu` (Neue Gewohnheit), `bearbeiten` (Gewohnheit:
  Stand, Formular, Archivieren), `einstellungen`.
- **Das Formular zeichnet sich beim Wählen nicht neu**: Rhythmus, Tage und Zähler ändern
  `entwurf` und die Knöpfe an Ort und Stelle; gespeichert wird mit dem Knopf.
- **Abhaken** (`[data-haken]`) ändert `erledigt`, speichert und zeichnet neu; die eben
  getippte Kachel trägt dabei `gerade` für ihre Animation. Kacheln bleiben, wo sie sind.
  **Lange drücken** (`langDruecken`, 500 ms) öffnet statt dessen `bearbeiten`; der Klick
  danach ist gesperrt (`langGedrueckt`).
- **Jede Änderung eines Tages** geht über `umschalten(id, tag)` — die Kachel für heute,
  der Kalender (`[data-nachtrag]`) für bis zu `NACHTRAG_TAGE` zurück.
- **Kalender** (`zeichneKalender`, `bindeKalender`): `state.kalender` wählt Woche oder
  Monat; was zu sehen ist, halten `kalVersatz` (Wochen bzw. Monate von heute) und `kalTag`
  (der angetippte Tag) — beide nur im Speicher der Seite, nicht in `state`. Getönt wird aus
  `tagesStand(k)` über `kalStufe`; Blättern und Umschalten setzen `kalGewechselt` für das
  Einblenden des Rasters.
- **Ringe** werden mit dem Ziel gezeichnet und tragen in `data-von` den zuletzt gezeigten
  Wert (`ringZuletzt`); `ringeFuellen()` läßt sie nach jedem `render()` herüberlaufen.
- `visibilitychange` zeichnet das Dashboard ganz neu — nach Mitternacht ist es ein anderer Tag.
- Der Kopf hat zwei Gestalten: auf dem Dashboard Titel, Datum, Sonne/Mond, Menüknopf;
  unterwegs Rückweg und Titel.
- Das Menü ist ein Blatt über der Seite, gezeichnet beim Öffnen aus `MENUE`. Ein Eintrag
  mit `ziel` öffnet die Ansicht, einer ohne meldet «kommt».

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
