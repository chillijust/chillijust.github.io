// Timer-Start ohne ganzes Neuzeichnen (0.17.0T22): Beim Start ändert sich nur
// die Kachel. Am Gerät kostete render() 6–10 ms in dem Bild, in dem das
// Timerfenster aufgeht. Der Knopf bleibt derselbe, samt Zuhörern.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('timerkachel', html, String.raw`
function kachel(id) { var k = kachelVon(id); return k && k.closest('.gw-kachel'); }
frisch();
state.bewegung = 'aus';
themaAnwenden();
var heute = heuteSchluessel();
state.gewohnheiten = ['a', 'b'].map(function (id) {
  return gewohnheitLesen({ id: id, name: id === 'a' ? 'Lesen' : 'Laufen', rhythmus: { art: 'taeglich' },
    angelegt: tagPlus(heute, -5), erledigt: [], timer: { minuten: 20, stumm: true } });
});
zeige('home');

var knopf = kachelVon('a'), gezeichnet = 0, renderEcht = render;
render = function () { gezeichnet++; return renderEcht.apply(this, arguments); };
knopf.click();
pruefe('K1 der Start zeichnet nicht das ganze Dashboard', gezeichnet === 0, gezeichnet);
pruefe('K2 die Kachel läuft: Klasse, Merkmal, Timer-Ring, Text', kachel('a').classList.contains('laeuft') &&
  kachel('a').getAttribute('data-timerkachel') === 'a' && !!kachel('a').querySelector('.ring-fuell:not([id])') &&
  /läuft/.test(kachel('a').querySelector('.gw-info').textContent), kachel('a').outerHTML.slice(0, 200));
pruefe('K3 der Knopf ist derselbe, das Fenster ist offen', kachelVon('a') === knopf && timerOffen());
pruefe('K4 die Kachel zählt mit', (timerAnzeigen(state.timer.ms - 60000), /19:00/.test(kachel('a').querySelector('[data-timerrest]').textContent)),
  kachel('a').querySelector('.gw-info').textContent);
timerSchliessen();
ausbewegt();
knopf.click();
pruefe('K5 ein zweiter Tipp öffnet das Fenster wieder', timerOffen() && gezeichnet === 0);
timerSchliessen();
ausbewegt();

// Läuft schon ein anderer, zeichnet der Wechsel alles neu.
kachelVon('b').click();
q('#hinweisOk').click();
pruefe('K6 nach dem Wechsel läuft nur noch der neue', state.timer.id === 'b' && kachel('b').classList.contains('laeuft') &&
  !kachel('a').classList.contains('laeuft') && !kachel('a').hasAttribute('data-timerkachel') && gezeichnet > 0);
timerSchliessen();
ausbewegt();
render = renderEcht;
state.timer = null;
`);
