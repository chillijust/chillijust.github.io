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
// Der Läufer stellt das Fenster über DevTools genau ein (kopflos.mjs).
pruefe('Q0 der Läufer gibt das Fenster quer, genau wie das iPhone', innerWidth === 932 && innerHeight === 430,
  innerWidth + 'x' + innerHeight);
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

  // ── Drang: dasselbe Blatt wie der Timer (ADR 0059) ────────────
  state.abgewoehnen = [lasterLesen({ id: 'z', name: 'Zucker', start: zeitJetzt() - 864e5, rueckfaelle: [], draenge: [] })];
  render();
  q('[data-drang="z"]').click();
  var dk = q('#drangKarte'), dbild = dk.querySelector('.timer-bild').getBoundingClientRect(), dname = q('#drangName').getBoundingClientRect();
  pruefe('Q2b der Drang paßt ganz ins Bild, ohne zu rollen', imBild(dk) && dk.scrollHeight <= dk.clientHeight + 1 &&
    imBild(q('#welleAbbrechen')), JSON.stringify(dk.getBoundingClientRect()) + ' ' + dk.scrollHeight + '/' + dk.clientHeight);
  pruefe('Q3b Ring links, Name und Knöpfe rechts daneben', getComputedStyle(dk).display === 'grid' && dbild.right <= dname.left &&
    dbild.right <= q('#welleNachgegeben').getBoundingClientRect().left);
  drangSchliessen(true);
  welleAbbrechen();
  state.abgewoehnen = [];
  render();

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

  // ── N · Lange Namen im Timer- und Drangblatt (James N12) ──────
  // Höchstens zwei Zeilen, nichts über die Karte oder den Tonknopf; ein
  // Wort ohne Leerzeichen bricht um. Gemessen am Text selbst (Range), nicht an
  // der Seite — die wird auch so nicht breiter.
  function titelLage(h) {
    var karte = h.closest('.timer-karte').getBoundingClientRect(), ton = q('#timerTon');
    var t = ton && h.id === 'timerName' ? ton.getBoundingClientRect() : null;
    var ganz = h.textContent;
    h.textContent = 'W';
    var zeile = h.getBoundingClientRect().height;
    h.textContent = ganz;
    var r = document.createRange();
    r.selectNodeContents(h);
    var sicht = h.getBoundingClientRect();
    var drin = Array.prototype.every.call(r.getClientRects(), function (rc) {
      if (rc.top >= sicht.bottom - 0.5) return true;
      return rc.left >= karte.left - 0.5 && rc.right <= karte.right + 0.5 &&
        (!t || rc.right <= t.left + 0.5 || rc.top >= t.bottom - 0.5);
    });
    return { drin: drin, zeilen: Math.round(sicht.height / zeile), ganz: ganz };
  }
  frisch();
  state.bewegung = 'aus';
  var WORT = new Array(NAME_MAX + 1).join(String.fromCharCode(87));
  var SATZ = 'Jeden Morgen Dehnen auf der grünen Matte';
  var N_OK = true, N_INFO = [];
  [WORT, SATZ].forEach(function (name) {
    state.gewohnheiten = [gewohnheitLesen({ id: 'n', name: name, rhythmus: { art: 'taeglich' },
      angelegt: tagPlus(heuteSchluessel(), -2), erledigt: [], timer: { minuten: 10 } })];
    state.abgewoehnen = [lasterLesen({ id: 'z', name: name, start: zeitJetzt() - 864e5, rueckfaelle: [], draenge: [] })];
    zeige('home');
    timerStarten('n');
    var a = titelLage(q('#timerName'));
    state.timer = null;
    timerSchliessen();
    render();
    q('[data-drang="z"]').click();
    var b = titelLage(q('#drangName'));
    drangSchliessen(true);
    welleAbbrechen();
    [a, b].forEach(function (l) {
      if (!l.drin || l.zeilen > 2 || l.ganz !== name) { N_OK = false; N_INFO.push(JSON.stringify(l)); }
    });
  });
  pruefe('QN1 lange Namen bleiben in Timer- und Drangkarte, höchstens zwei Zeilen, ganz im Text', N_OK, N_INFO.join(' '));
  frisch();
});
`, { fenster: '932,430' });
