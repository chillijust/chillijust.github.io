// Nichts wartet am Ziel (ADR 0007, 0054): Was ankommt, ist im selben Bild es
// selbst. Bis 0.17.0T8 blendete der Kalenderring nach seiner Fahrt erst aus und
// wieder ein, der Abhaken-Tropfen stand eine Sekunde an der Chili, und eine
// aufgehende Zeile wartete auf das Ausschwingen der Feder.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('ankunft', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function uebergaenge(el) {
  return el.getAnimations().filter(function (a) { return window.CSSTransition && a instanceof CSSTransition; });
}
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
state.fluessig = { ios: { tag: true } };
flDauernSetzen();
zeige('home');
ausbewegt();

// ── K · Der Ring im Kalender ───────────────────────────────────
alle('#kalRaster [data-kaltag]')[1].click();
return warten(900).then(function () {
  ausbewegt();
  alle('#kalRaster [data-kaltag]')[4].click();
  return warten(fluessigTakt('tag').dauer + 200);
}).then(function () {
  ausbewegt();
  return warten(20);
}).then(function () {
  var n = q('#kalRaster .kal-tag.gewaehlt');
  pruefe('K1 angekommen steht der Ring sofort, ohne auszublenden und wieder einzublenden', !!n &&
    !n.classList.contains('gleitet') && !q('body > .fl-tagring') && uebergaenge(n).length === 0 &&
    getComputedStyle(n).boxShadow !== 'none');

  // ── H · Der Abhaken-Tropfen ──────────────────────────────────
  state.fluessig = { ios: { haken: true } };
  flDauernSetzen();
  zeige('home');
  ausbewegt();
  q('#app [data-haken="A"]').click();
  var perle = alle('body > .fl-perle').pop(), a = perle && perle.getAnimations()[0];
  var m = a ? /linear\((.*)\)/.exec(String(a.effect.getTiming().easing)) : null;
  var pts = m ? m[1].split(',').map(function (v) { return parseFloat(v); }) : [], bilder = a ? a.effect.getKeyframes() : [];
  pruefe('H1 der Tropfen kommt am Ende seiner Zeit an, er steht nicht die halbe Zeit am Ring',
    pts.length > 2 && pts.findIndex(function (v) { return v >= 0.99; }) >= pts.length - 2);
  pruefe('H2 im letzten Stück geht er auf', bilder.length > 2 && String(bilder[bilder.length - 1].opacity) === '0' &&
    String(bilder[0].opacity) === '1');
  ausbewegt();
  return warten(20);
}).then(function () {
  pruefe('H3 und im selben Augenblick nickt der Ring', !q('body > .fl-perle') &&
    q('#app .tagesring .tr-bild').getAnimations().length === 1);

  // ── W · Eine Zeile aus dem Wahlschalter ──────────────────────
  state.fluessig = { ios: { ansichten: true } };
  flDauernSetzen();
  zeige('terminNeu');
  ausbewegt();
  q('#app [data-wdh="woechentlich"]').click();
  var teil = q('#tmEndeTeil'), hw = alle('body > .tropfen-huelle').pop(), gw = hw && hw.querySelector('.geist');
  var kopie = gw && gw.shadowRoot.lastChild, platz = teil.getAnimations()[0];
  pruefe('W1 der Inhalt im Tropfen sitzt, wo die Zeile sitzt, nicht um ihren Außenabstand tiefer',
    !!platz && parseFloat(platz.effect.getKeyframes()[1].marginTop) > 0 && !!kopie && getComputedStyle(kopie).marginTop === '0px' &&
    Math.abs(gw.getBoundingClientRect().height - parseFloat(hw.style.height)) < 1);
  pruefe('W2 ihr Platz geht auf der Feder des Tropfens auf, nicht erst nach doppelter Zeit', !!platz &&
    platz.effect.getTiming().duration <= TROPFEN_DAUER * 0.6 && String(platz.effect.getTiming().easing).indexOf('linear(') === 0);

  // Chilli: dieselbe Hülle, derselbe Abstand.
  state.fluessig = null;
  flDauernSetzen();
  zeige('terminNeu');
  ausbewegt();
  q('#app [data-wdh="taeglich"]').click();
  var hc = alle('body > .tropfen-huelle').pop(), gc = hc && hc.querySelector('.geist');
  pruefe('W3 auch in Chilli sitzt der Inhalt im Tropfen ohne Außenabstand', !!gc && getComputedStyle(gc.shadowRoot.lastChild).marginTop === '0px');

  // ── B · Das Ticketblatt auf iOS: Glas erst am Ziel ───────────
  state.fluessig = { ios: { hinweis: true } };
  flDauernSetzen();
  zeige('home');
  ausbewegt();
  return warten(20);
}).then(function () {
  var echt = glasAmZiel;
  glasAmZiel = function () { glasAmZiel.mal = (glasAmZiel.mal || 0) + 1; return echt.apply(this, arguments); };
  q('#ticketKnopf').click();
  var hb = q('body > .tropfen-huelle.milchig');
  pruefe('B1 auf iOS fließt das Blatt milchig, ohne Unschärfe, auch die wartende Karte', !!hb && !!hb._fluss &&
    !hb._fluss.o.farbeAmZiel && typeof hb._fluss.o.angekommen === 'function' &&
    !/blur/.test(getComputedStyle(hb).backdropFilter || '') && !/blur/.test(getComputedStyle(q('#ticketKarte')).backdropFilter || ''));
  return warten(fpRuhe(FP_IOS) + 600).then(function () { ausbewegt(); return warten(20); }).then(function () {
    var kst = getComputedStyle(q('#ticketKarte'));
    pruefe('B2 am Ziel bekommt die Karte ihr Glas, einmal, und Hülle und Schicht sind fort', glasAmZiel.mal === 1 &&
      /blur/.test(kst.backdropFilter || '') && q('#ticketKarte').style.opacity === '' &&
      !q('body > .tropfen-huelle') && !q('body > .fl-schicht'));
    glasAmZiel = echt;
    ticketBlattSchliessen();
    pruefe('B3 zu fließt es ebenso milchig', !!q('body > .tropfen-huelle.milchig') &&
      !/blur/.test(getComputedStyle(q('body > .tropfen-huelle.milchig')).backdropFilter || ''));
    return warten(fpRuhe(FP_IOS) + 600);
  });
}).then(function () {
  ausbewegt();
  state.fluessig = null;
  flDauernSetzen();
  state.fluessig = null;
  flDauernSetzen();
});
`);
