# 0014 · Tickets über eine vorausgefüllte GitHub-Adresse

**Status:** überholt durch ADR 0016 · 2026-08-02

> Die Tickets bleiben inzwischen auf dem Gerät und werden gebündelt kopiert, statt
> einzeln über GitHub zu laufen. Die Sicherheitsüberlegungen unten gelten weiter — die
> Antwort ist nur noch einfacher geworden.

## Kontext

Fehler und Wünsche sollen aus der App heraus erfasst werden können, damit sie nicht in
Chatverläufen versickern. Zwei Randbedingungen stehen dem im Weg:

- Die Vorgaben verbieten **externe Ressourcen, API-Aufrufe und alles, was Offline-Betrieb
  bricht** (ADR 0001).
- Die ausgelieferte Datei ist **öffentlich lesbar**. GitHub Pages lässt sich auf einem
  Privatkonto nicht privat schalten; das gibt es nur in Enterprise Cloud.

Verlangt war zugleich: Tickets soll **nur der Betreiber** anlegen können.

## Entscheidung

1. **Die App verschickt nichts.** Sie schreibt Tickets in `localStorage` und baut daraus
   eine Adresse `https://github.com/<repo>/issues/new?title=…&labels=…&body=…`. Antippen
   öffnet das GitHub-Formular; abgeschickt wird dort.
2. **Das Zielrepo ist privat und getrennt** von der öffentlichen App
   (`chillijust/chillingo-tickets`).
3. **Keine Abfrage in der App.** Die Zugangskontrolle macht GitHub.
4. **Kein Geheimnis in der Datei** — als Regel und als Prüfung in `tools/pruefen.mjs`.
5. **Content-Security-Policy als `<meta>`**, damit «keine externen Ressourcen» erzwingbar
   wird statt nur verabredet.
6. **Rubrik, App-Stand und Gerät** wandern automatisch in den Issue-Rumpf. `APP_STAND`
   stempelt `tools/build.mjs`.

## Begründung

**Die Adresse ist der ganze Trick.** Ein vorausgefülltes Formular ist kein API-Aufruf:
Es wird nichts geladen, nichts gesendet, es gibt kein CORS, kein Rate-Limit und vor allem
keinen Schlüssel. Die App bleibt eine einzelne, offline lauffähige Datei; nur der letzte
Schritt braucht Netz, und den macht ohnehin der Browser.

**Eine Passwortabfrage im Client wäre Zierde.** Der Quelltext ist öffentlich; wer will,
liest die Prüfung und ruft die Funktion aus der Konsole. Sie hätte gegen einen
entschlossenen Fremden nichts ausgerichtet und den Betreiber bei jedem Ticket aufgehalten.
Das gewünschte «nur ich» leistet das private Repo vollständig — und zwar serverseitig,
also dort, wo es zählt.

**Ein Token in der App wäre die schlechteste Variante.** Es hätte drei harte Vorgaben auf
einmal gebrochen und ein Schreibrecht auf das Repo dauerhaft in den `localStorage` eines
Geräts gelegt. Der Gewinn — die App nicht verlassen zu müssen — wiegt das nicht auf.

**Getrenntes, privates Repo**, weil Issues eines öffentlichen Repos öffentlich sind.
Fehlerberichte enthalten Gerätekennung und Nutzungskontext; die gehen niemanden etwas an.

**Die CSP ist der eigentliche Sicherheitsgewinn.** Sie ändert nichts am heutigen
Verhalten, macht aber einen ganzen Fehlerzweig folgenlos: Selbst wenn je fremder Code in
die Seite käme, könnte er weder nachladen noch etwas nach außen funken.

## Folgen

- Ein Ticket kostet einen Tipp mehr: sichern, senden, im GitHub-Formular abschicken.
- Ohne Netz lassen sich Tickets schreiben und sammeln; gesendet wird später.
- Der Rumpf wird bei `TICKET_MAX` (1400 Zeichen) gekürzt, damit die Adresse handhabbar
  bleibt. «Alle als Text kopieren» ist der Ausweg für lange Berichte.
- Die Marken `bug` und `enhancement` müssen im Zielrepo existieren — GitHubs
  Standardmarken decken beide ab.
- `tools/pruefen.mjs` schlägt künftig fehl, wenn eine zweite Fremdadresse, ein
  tokenähnlicher Text oder keine CSP in der Datei steht.
- `tools/build.mjs --check` vergleicht ohne `APP_STAND`; sonst wäre die Datei jeden Tag
  «nicht auf Stand».
