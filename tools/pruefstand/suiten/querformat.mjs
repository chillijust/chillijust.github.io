// Querformat zählt mit (ADR 0056): Das iPhone 15 Pro Max quer ist 932 × 430.
// Keine Karte wird höher als das Bild, der Timer stellt Ring und Knöpfe
// nebeneinander, das Menü endet über dem Rand und rollt innen. Bis 0.17.0T13
// ragte die Timerkarte mit 505 Punkten oben und unten hinaus (James, N7).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('querformat', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function imBild(el) { var r = el.getBoundingClientRect(); return r.top >= -0.5 && r.bottom <= innerHeight + 0.5 && r.left >= -0.5 && r.right <= innerWidth + 0.5; }
// Das kopflose Chrome zieht vom Fenster seine Leiste ab (87 Punkte); verlangt
// sind darum 932 × 517, ankommen sollen etwa 932 × 430.
pruefe('Q0 der Läufer gibt das Fenster quer, so hoch wie das iPhone', innerWidth === 932 && innerHeight >= 400 &&
  innerHeight <= 440, innerWidth + 'x' + innerHeight);
frisch();
state.bewegung = 'aus';
state.gewohnheiten = ['Lesen', 'Wasser', 'Laufen', 'Atmen'].map(function (n, i) {
  return gewohnheitLesen({ id: 'g' + i, name: n, rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3),
    erledigt: [], timer: i === 0 ? { minuten: 10 } : null });
});
zeige('home');
pruefe('Q1 das Dashboard wird nicht breiter als das Bild', document.documentElement.scrollWidth <= innerWidth);

// ── Timer ──────────────────────────────────────────────────────
timerStarten('g0');
return warten(0).then(function () {
  var k = q('#timerKarte'), bild = k.querySelector('.timer-bild').getBoundingClientRect();
  var name = q('#timerName').getBoundingClientRect(), fertig = q('#timerFertig');
  pruefe('Q2 der Timer paßt ganz ins Bild, ohne zu rollen', imBild(k) && k.scrollHeight <= k.clientHeight + 1 && imBild(fertig),
    JSON.stringify(k.getBoundingClientRect()));
  pruefe('Q3 Ring links, Name und Knöpfe rechts daneben', getComputedStyle(k).display === 'grid' && bild.right <= name.left &&
    bild.right <= fertig.getBoundingClientRect().left);
  state.timer = null;
  timerSchliessen();

  // ── Menü ─────────────────────────────────────────────────────
  menueOeffnen();
  var b = q('#menue .blatt'), letzter = alle('#menueListe .menue-eintrag').pop();
  b.scrollTop = 100000;
  pruefe('Q4 das Menü endet über dem Rand; was nicht paßt, rollt es heran', b.getBoundingClientRect().bottom <= innerHeight &&
    letzter.getBoundingClientRect().bottom <= b.getBoundingClientRect().bottom + 0.5);
  menueSchliessen(true);
  q('#menue').hidden = true;

  // ── Frage und Ticketblatt ────────────────────────────────────
  loeschenFragen(q('#themaKnopf'), 'Timer abbrechen?', 'Die Zeit bis hier zählt nicht.', 'Ja', function () {});
  pruefe('Q5 eine Frage steht im Bild', imBild(q('#hinweisKarte')) && imBild(q('#hinweisOk')));
  hinweisSchliessen();
  ticketBlattOeffnen(q('#ticketKnopf'));
  pruefe('Q6 das Ticketblatt steht im Bild und rollt innen', imBild(q('#ticketKarte')) &&
    q('#ticketKarte .tk-rolle').scrollHeight > q('#ticketKarte .tk-rolle').clientHeight);
  ticketBlattSchliessen();
  frisch();
});
`, { fenster: '932,517' });
