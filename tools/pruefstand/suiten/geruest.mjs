// Das Gerüst: Kopf, leeres Dashboard, Chili, Schriften, Trefferflächen.
// Was hier steht, trägt jede spätere Ansicht — fällt es weg, fällt es überall.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('geruest', html, String.raw`
frisch();

// ── A · Kopf ────────────────────────────────────────────────
pruefe('A1 der Kopf nennt die App', q('#kopf h1') && q('#kopf h1').textContent === 'Chillinal');
var heute = new Date();
pruefe('A2 und das heutige Datum, ausgeschrieben',
  q('#kopf .datum').textContent === WOCHENTAGE[heute.getDay()] + ', ' + heute.getDate() + '. ' +
    MONATE[heute.getMonth()], q('#kopf .datum').textContent);
pruefe('A3 Sonne/Mond-Schalter und Menü stehen im Kopf', !!q('#kopf #themaKnopf') && !!q('#kopf #menuKnopf'));
var titel = q('#kopf h1').getBoundingClientRect();
var menue = q('#menuKnopf').getBoundingClientRect();
var thema = q('#themaKnopf').getBoundingClientRect();
pruefe('A4 der Menüknopf liegt ganz rechts, der Schalter davor',
  menue.left > thema.right - 1 && thema.left > titel.left, thema.left + ' / ' + menue.left);
pruefe('A5 der Menüknopf ist rund', getComputedStyle(q('#menuKnopf')).borderRadius === '50%');
pruefe('A6 auf dem Dashboard kein Rückweg', !q('#zurueckKnopf'));

// ── B · Leeres Dashboard ────────────────────────────────────
pruefe('B1 die Chili steht genau einmal da', alle('#chiliFigur').length === 1);
pruefe('B2 und ist ein eingebettetes Bild',
  q('#chiliFigur').getAttribute('src').indexOf('data:image/png;base64,') === 0);
pruefe('B3 das Bild ist geladen', q('#chiliFigur').complete && q('#chiliFigur').naturalWidth > 0,
  q('#chiliFigur').naturalWidth);
pruefe('B4 sie begrüßt', /Hallo/.test(q('.willkommen h2').textContent));
var erste = q('#ersteGewohnheit');
pruefe('B5 ein Knopf führt zur ersten Gewohnheit',
  !!erste && erste.textContent.indexOf('Erste Gewohnheit anlegen') !== -1);
pruefe('B6 kein Tutorial', !q('[class*="tut"]') && !q('[id*="tut"]'));

// ── C · Trefferflächen: alles, was man antippt, ≥ 44 × 44 ───
// Je Bereich gefragt: Das Menü blendet nach dem Schließen noch eine Weile aus.
function zuKlein(wo) {
  return alle(wo + ' button').filter(function (b) {
    var r = b.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;   // nicht sichtbar
    return r.width < 44 || r.height < 44;
  }).map(function (b) { return b.id || b.textContent.trim().slice(0, 20); });
}
pruefe('C1 auf dem Dashboard', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
menueOeffnen();
pruefe('C2 im Menü', zuKlein('#menue').length === 0, zuKlein('#menue').join(', '));
menueSchliessen();
zeige('einstellungen');
pruefe('C3 in den Einstellungen', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
zeige('home');

// ── D · Die App duzt ────────────────────────────────────────
function siezt() {
  var t = document.body.innerText;
  var m = t.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g);
  // «Sie» am Satzanfang kann auch «sie» sein — das gibt es hier noch nicht.
  return m ? m.join(' | ') : '';
}
pruefe('D1 auf dem Dashboard', siezt() === '', siezt());
zeige('einstellungen');
pruefe('D2 in den Einstellungen', siezt() === '', siezt());
menueOeffnen();
pruefe('D3 im Menü', siezt() === '', siezt());
frisch();

// ── E · Kein Emoji, keine Fremdadresse im gerenderten Baum ──
// Gelesen wird der Baum der App, nicht die angehängte Prüfung. Die Grenzen
// als Zahlen: Stünden die Zeichen selbst hier, fände die Prüfung sich selbst.
var baum = q('#app').innerHTML + q('#menue').innerHTML + q('#meldung').innerHTML;
var bereich = new RegExp('[' + String.fromCharCode(0x2600) + '-' + String.fromCharCode(0x27BF) +
  String.fromCharCode(0x2B00) + '-' + String.fromCharCode(0x2BFF) + String.fromCharCode(0xFE0F) +
  ']|[' + String.fromCharCode(0xD83C) + '-' + String.fromCharCode(0xD83E) + '][' +
  String.fromCharCode(0xDC00) + '-' + String.fromCharCode(0xDFFF) + ']');
var emoji = baum.match(bereich);
pruefe('E1 kein Zeichen aus dem Emoji-Bereich', !emoji,
  emoji ? emoji[0].charCodeAt(0).toString(16) : '');
pruefe('E2 kein Verweis nach draußen', !q('a[href^="http"], img[src^="http"]'));

// ── F · Schriften: eingebettet und geladen ──────────────────
return document.fonts.ready.then(function () {
  return Promise.all([
    document.fonts.load('400 16px Lora'), document.fonts.load('italic 400 16px Lora'),
    document.fonts.load('600 16px Lora'), document.fonts.load('500 16px Poppins'),
    document.fonts.load('600 16px Poppins')
  ]);
}).then(function (geladen) {
  pruefe('F1 alle fünf Schnitte sind geladen',
    geladen.every(function (l) { return l.length === 1; }),
    geladen.map(function (l) { return l.length; }).join(','));
  pruefe('F2 der Text steht in Lora', /^'?Lora/.test(getComputedStyle(document.body).fontFamily),
    getComputedStyle(document.body).fontFamily);
  pruefe('F3 die Überschrift in Poppins', /^'?Poppins/.test(getComputedStyle(q('#kopf h1')).fontFamily));
  pruefe('F4 die Knöpfe auch', /^'?Poppins/.test(getComputedStyle(q('#ersteGewohnheit')).fontFamily));
  pruefe('F5 Umlaute kommen aus der eingebetteten Schrift',
    document.fonts.check('16px Lora', 'äöüß') && document.fonts.check('600 16px Poppins', 'ÄÖÜ'));
});
`);
