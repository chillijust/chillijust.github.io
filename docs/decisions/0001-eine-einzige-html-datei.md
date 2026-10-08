# 0001 · Auslieferung als eine einzige HTML-Datei

**Status:** angenommen · 2026-08-01

## Kontext

Der Trainer läuft auf einem iPhone, das über „Zum Home-Bildschirm" eine Verknüpfung
ablegt, und soll auch ohne Netz funktionieren. Das Projekt hat einen einzigen Autor und
soll in einem Jahr ohne Einarbeitung wieder änderbar sein.

## Entscheidung

`index.html` enthält Markup, Stile, Logik und Lerninhalte. Keine externen Dateien, keine
CDNs, keine Schriftarten von außen, keine API-Aufrufe. Kein Framework, kein
Build-Schritt im Auslieferungspfad — was im Repository liegt, ist exakt das, was der
Browser bekommt.

## Begründung

- Eine Datei kann nicht halb geladen sein: Ist sie im Cache, läuft die App vollständig.
- Kein Toolchain-Verfall. Ein npm-Baum von heute ist in zwei Jahren nicht mehr ohne
  Weiteres installierbar; eine HTML-Datei öffnet sich in zehn Jahren noch.
- GitHub Pages liefert sie ohne jede Konfiguration aus.
- Der Preis — eine große Datei — ist bei einem Autor tragbar. Fremde Merge-Konflikte
  gibt es nicht.

## Folgen

- Die Datei wächst. Dagegen hilft die strikte Gliederung (siehe `architektur.md`) und die
  Auslagerung der Inhalte nach `/data` (siehe ADR 0002).
- **Offener Zielkonflikt:** Ein Service Worker für echtes Offline-Verhalten braucht eine
  eigene Datei unter eigener URL — das widerspricht der Ein-Datei-Vorgabe. Derzeit trägt
  der normale HTTP-Cache das Offline-Verhalten, was nach längerer Zeit ohne Netz nicht
  zuverlässig ist. Ebenso liegt das App-Symbol des Home-Bildschirms ohne Manifest oder
  `apple-touch-icon` in der Hand von Safari.
  Der Konflikt ist bewusst offen; er wird entschieden, wenn das Offline-Verhalten in der
  Praxis stört — nicht vorher und nicht stillschweigend.
