# 0031 · Der Kalenderschalter schaltet immer; die Ticketliste rollt innen

*2026-10-06 · Tickets «Woche Monat Button», «Alle Tickets Glas Rand» · Version 0.11.0T · ergänzt 0008, 0024, 0028*

## Ausgangslage

**Woche | Monat.** Der Umschalter im Kalender war ein Wahlfeld: Ein Tipp auf das schon
Gewählte tat nichts. Am Gerät trifft man das Gewählte ständig — der Schalter wirkte, als
ginge er nur manchmal.

## Entscheidung

**Woche | Monat ist ein Schalter.** Jeder Tipp darauf wechselt zur anderen Ansicht, gleich
welche Hälfte getroffen wird. Die Marke fließt wie bisher hinüber, `aria-pressed` sagt
weiter, was gilt.

## Folgen

- Suite `kalender` K19a–K19c.
