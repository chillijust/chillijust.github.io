# 0030 · Grammatik ist eine Funktion, keine Karteikarte

**Status:** angenommen · 2026-08-04 · Probelauf: Geschlecht und Akkusativ

## Kontext

In den 55 Sätzen stehen **89 Wortformen, die nicht im Wortschatz vorkommen**. Man lernt
«книга» und liest «книгу», man lernt «работать» und liest «работает». Die App zeigte eine
Form und sagte nie, woher sie kommt — genau dort entstand das Auswendiglernen, über das
sich der Betreiber beklagte: «Ich möchte verstehen, warum Wörter so geschrieben werden,
wie sie es werden.»

Vereinbart wurde: beides — Endungen zuerst, Schrift gegen Aussprache später. Eine eigene,
**freiwillige** Übung. **Entdeckend** statt belehrend. Und ein **Probelauf** mit einem
Bogen, um die Machart am fertigen Stück zu beurteilen.

## Entscheidung

1. **Die Karteikarte ist die Regel, nicht das Wort.** `state.gramBox` führt Bausteine.
2. **Eine Formenmaschine**, `grammForm(wort, art, rolle)` — Regeln, keine Tabelle.
3. **Der Build beweist sie:** Jede in `saetze.json` vermerkte Form muss die Maschine exakt
   nachbauen, sonst bricht er ab.
4. **Wortart und Geschlecht als optionales viertes Feld** der Vokabel — nur wo die Endung
   schweigt oder irrt; eine überflüssige Angabe ist ein Fehler.
5. **Drei Schritte je Baustein:** entdecken, Regelkarte, anwenden — gestaffelt wie überall.
6. **«Wissen»** erklärt Wortformen im Satz, an Ort und Stelle.
7. **Der Sicherungscode bekommt ein neuntes Feld.**

## Begründung

**Eine Vokabel ist ein Fakt, eine Regel ist eine Funktion.** Das ist der ganze
Unterschied, und alles Weitere folgt daraus. Einen Fakt prüft man, indem man ihn abfragt.
Eine Funktion prüft man, indem man sie auf **neue Eingaben** anwendet. Darum verlangt die
Aufgabe ein bekanntes Wort in einer nie gesehenen Form: Wer «книгу» auswendig gelernt hat,
scheitert an «газету»; wer die Regel hat, nicht. Eine Übung, die dieselbe Form
wiedererkennen lässt, misst genau das Falsche.

**Regeln statt Tabelle.** Eine Formentabelle wäre schneller gebaut und wertlos: Sie kann
nur, was in ihr steht. Eine Regel wirkt auf jedes Wort des Lehrplans — und auf jedes, das
später dazukommt. Neue Aufgaben kosten damit nichts.

**Der Build ist der eigentliche Fortschritt.** Grammatik in einer App ist normalerweise
eine Behauptung: Irgendwer hat Formen eingetippt, und niemand merkt es, wenn eine falsch
ist. Hier misst sich die Maschine an den Sätzen, die ohnehin dastehen. Weicht eine Form
ab, kommt die Datei nicht durch. Dieselbe Strenge, mit der der Build heute schon Dubletten
und den Abgleich Alphabet ↔ Tastatur erzwingt — nur an einer Stelle, an der Fehler sonst
lautlos blieben.

**Dass die Maschine zweimal dasteht, ist Absicht.** Der Build muss ohne die App laufen
können. Und weil beide Fassungen an denselben vermerkten Formen gemessen werden, kann
keine unbemerkt abdriften: Die Doppelung ist hier keine Schuld, sondern die Prüfung.

**Keine überflüssige Angabe.** Die Versuchung wäre, jedem Wort seine Wortart mitzugeben —
bequem und sicher. Es wäre der Anfang vom Ende: Eine Liste, die alles nennt, verdeckt die
paar Stellen, an denen etwas Besonderes steht. `кровать` ist ein Nomen trotz `-ть`, `кофе`
männlich trotz `-е`, `время` sächlich trotz `-я` — das sind die Fälle, die man sehen
können muss. Der Build besteht darum darauf, dass eine Angabe etwas hinzufügt.

**Die Beispiele beim Entdecken müssen kontrastieren.** Der erste Entwurf zeigte vier
weibliche Wörter und fragte, woran man das Geschlecht erkennt — vier Mal dasselbe zeigt
kein Muster. `gramEntdeckenWoerter()` sucht darum je eines pro Geschlecht. Entdecken heißt
Unterschiede sehen; ohne Unterschied bleibt nur Raten.

**Belebte männliche Nomen bleiben draußen**, bis ihr eigener Baustein dran ist.
Vorgeschlagen war, «брат(а)» zu schreiben und beide Formen gelten zu lassen. Das wäre eine
Unwahrheit: «Я вижу брат» ist falsch, nicht zweitbest. Der Vergleich mit den nachgesehenen
deutschen Artikeln trägt nicht — dort war Nachsicht richtig, *weil* das Russische die
Information nicht hergibt. Die Belebtheit dagegen lässt sich herleiten. Statt großzügig
zu werten, fragt die Übung schlicht nicht danach.

**«Wissen», nicht «Tipp».** Der Knopf «Hinweis» in «Tippen» zeigt die Umschrift, ist also
Lösungshilfe. Ein Tipp ist etwas, das man sich versagen sollte; Wissen soll man sich
holen. Der Unterschied ist der Sinn dieses ganzen Teils.

**Die Erklärung schweigt, wo sie die Lösung wäre.** In der Richtung DE → RU steht die
russische Seite erst nach der Auflösung da — vorher erklärt das Fenster nichts.

## Folgen

- 141 der 380 Vokabeln tragen ein viertes Feld. Der Löwenanteil sind Adverbien, Partikeln
  und Zahlwörter mit `-`: Ohne sie hätte die App gefragt, welches Geschlecht «хорошо» hat.
- Die eingebaute Tastatur steht jetzt in `tastaturHtml(attr)` und wird von «Übersetzen»
  und «Grammatik» geteilt; in «Tippen» blieb sie vorerst, weil sie dort an einem `<input>`
  hängt statt an `trEingabe`.
- Home hat sechs Kacheln; Testreihen, die fünf erwarteten, wurden nachgezogen.
- Der Sicherungscode hat neun Felder. Codes mit sieben oder acht bleiben lesbar, ihr
  Grammatikstand ist dann leer.
- `gramBaustein`, `gramQ`, `gramEingabe`, `gramKb`, `gramRegelOffen`, `gramRegelNeu` und
  `wissenOffen`/`wissenWort` sind Ansichtszustand nach der Regel aus ADR 0017.
- Neue Testreihe `grammatik.mjs` (65 Prüfungen); zusammen 728.
- **Der Probelauf zeigt die Machart, nicht den vollen Nutzen:** Im Satz leuchten erst
  sieben Wörter auf. Die Masse — 30 Verbformen, 22 Präpositiv und Vergangenheit — kommt
  mit den nächsten Bausteinen. Das war so verabredet und ist keine Überraschung.
