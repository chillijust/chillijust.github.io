# 0031 · Der Kalenderschalter schaltet immer; die Ticketliste rollt innen

*2026-10-06 · Tickets «Woche Monat Button», «Alle Tickets Glas Rand» · Version 0.11.0T · ergänzt 0008, 0024, 0028*

## Ausgangslage

**Woche | Monat.** Der Umschalter im Kalender war ein Wahlfeld: Ein Tipp auf das schon
Gewählte tat nichts. Am Gerät trifft man das Gewählte ständig — der Schalter wirkte, als
ginge er nur manchmal.

**Alle Tickets.** Rollte man die Liste im Ticketblatt, schoben sich Kopfknöpfe und Zeilen
über die Kante des Glases. Die Kante ist ein innerer Schatten (`.glas`, ADR 0014) — und
den malt der Browser *unter* den Inhalt des Elements. Solange die Karte selbst rollte,
lag alles, was rollte, über ihr.

## Entscheidung

**Woche | Monat ist ein Schalter.** Jeder Tipp darauf wechselt zur anderen Ansicht, gleich
welche Hälfte getroffen wird. Die Marke fließt wie bisher hinüber, `aria-pressed` sagt
weiter, was gilt.

**Das Ticketblatt rollt innen.** Die Karte rollt nicht mehr; ihr Kopf steht, darunter
rollt `.tk-rolle` — mit 2 px Abstand zur Kante und oben wie unten über 12 px
ausgeblendet (`mask-image`), sodaß nichts an die Kante stößt. Das gilt für die Liste wie
für das Ticket selbst (dort rollt es, wenn die Tastatur Platz nimmt).

## Begründung

Ein Rand über dem Inhalt (`outline`) hätte die Kante gerettet, aber der Inhalt wäre
weiter hart an ihr abgeschnitten worden. Ein stehender Kopf hält außerdem «Zurück» und
«Ticketseite» erreichbar, wie weit man auch rollt.

## Folgen

- Suite `kalender` K19a–K19c; Suite `tickets` U9e (rollt in `.tk-rolle`), U9h–U9k.
