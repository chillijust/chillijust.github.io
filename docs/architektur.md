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
`melden`) · Zustand und Speicher · Darstellung · Ansichten · Menü · Service Worker · Start.

## Zustand

```js
state = {
  schema: 1,
  thema: 'auto'      // 'auto' | 'hell' | 'dunkel'
}
```

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

- `zeige(name)` wechselt die Ansicht; ein unbekannter Name landet beim Dashboard.
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
