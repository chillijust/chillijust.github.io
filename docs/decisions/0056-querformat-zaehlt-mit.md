# 0056 · Querformat zählt mit

*2026-10-11 · Befund N7 von James (Nachricht 09 auf `chatgpt/kommunikation`), Antwort des
Nutzers · Version 0.17.0T14*

## Ausgangslage

James prüfte die App zusätzlich bei geringer Höhe: Die Timerkarte war 505 Punkte hoch und
ragte bei 430 Punkten Fensterhöhe oben und unten hinaus, mit Name und «Fertig» außerhalb
des Bildes. Er nahm an, das Zielgerät sei auf das Hochformat festgelegt. Beschlossen war
die Ausrichtung nirgends — weder im Pflichtenheft noch in einem ADR. Auf Nachfrage sagt der
Nutzer: Er nutzt auch das Querformat.

## Entscheidung

- **Das Zielgerät gilt in beiden Ausrichtungen**: iPhone 15 Pro Max hoch (430 × 932) und
  quer (932 × 430).
- **Keine Karte wird höher als das Bild.** Frage, Meldung und Timer sind auf die Höhe ihres
  Blatts begrenzt und rollen notfalls innen; das Ticketblatt tat das schon (ADR 0031).
- **Der Timer stellt quer Ring und Bedienung nebeneinander** (bis 560 Punkte Höhe): links
  Ring und Chili, rechts Name, Zeit, Pause und die Knöpfe. So paßt er ohne Rollen.
- **Das Menü endet über dem unteren Rand** und rollt seine Liste innen; gedreht hängt es
  wieder unter seinem Knopf.
- Die Suite `querformat` fährt die App in 932 × 430; dafür darf eine Suite ihr Fenster
  wählen (`suite(…, { fenster })`).

## Begründung

Ein Timer, dessen «Fertig» außerhalb des Bildes liegt, ist im Querformat unbedienbar. Quer
ist Breite im Überfluß und Höhe knapp — nebeneinander statt untereinander nutzt das, statt
den Timer rollen zu lassen. Eine allgemeine Grenze auf die Bildhöhe fängt auch, was hier
nicht eigens gestaltet ist.

## Folgen

- Wer eine neue Karte oder ein Blatt baut, prüft es auch quer (Suite `querformat`).
- Safe-Area quer (Dynamic Island links oder rechts, Home-Leiste unten) zeigt nur das Gerät;
  die Blätter halten dafür `env(safe-area-inset-*)` an allen vier Seiten ein.
- Nebenbefund beim Bau: Der Prüfstand gibt den Suiten im Hochformat 500 × 845 statt
  430 × 932 — kopfloses Chrome hat eine Mindestbreite und zieht seine Leiste ab. Offen.
