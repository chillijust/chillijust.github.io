// Prüft die Reiter der Einstellungen: die Bahn, das Wischen und den Vorrang
// des Zurückwischens.
import { readFileSync, writeFileSync } from 'node:fs';
import { WURZEL, BAU, testseite } from '../helfer.mjs';
const html = readFileSync(WURZEL + '/index.html', 'utf8');

const test = String.raw`
var log = [];
function pruefe(n, c, e) { log.push((c ? 'PASS ' : 'FAIL ') + n + (e ? ' [' + e + ']' : '')); }
function q(s) { return document.querySelector(s); }
function alle(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
function tippe(el) { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }

// Eine Berührung nachstellen. Ohne echte Touch-Hardware baut der Browser
// TouchEvents nur über den Konstruktor — der reicht, die Zuhörer sehen dasselbe.
function beruehrung(ziel, x, y) {
  return new Touch({ identifier: 1, target: ziel, clientX: x, clientY: y });
}
function touch(ziel, art, x, y) {
  var t = beruehrung(ziel, x, y);
  var e = new TouchEvent(art, {
    bubbles: true, cancelable: true,
    touches: art === 'touchend' ? [] : [t],
    targetTouches: art === 'touchend' ? [] : [t],
    changedTouches: [t]
  });
  ziel.dispatchEvent(e);
  return e;
}
// Ein ganzer Wisch: aufsetzen, ziehen, loslassen.
function wische(vonX, nachX, y) {
  var rahmen = q('#einstRahmen');
  touch(rahmen, 'touchstart', vonX, y || 300);
  touch(rahmen, 'touchmove', vonX + (nachX - vonX) / 2, y || 300);
  touch(rahmen, 'touchmove', nachX, y || 300);
  touch(rahmen, 'touchend', nachX, y || 300);
}
function versatz() {
  var b = q('#einstBahn');
  return b ? b.style.transform : '—';
}
// Die zwei Zahlen aus «translateX(calc(-100% + 12.0px))».
function bahnProzent() {
  var m = /(-?\d+)%/.exec(versatz());
  return m ? parseInt(m[1], 10) : null;
}
// Der Sollwert der Bahn ergibt sich aus der **Stelle** des Reiters in der
// Liste, nicht aus einer festen Zahl: Die Reihenfolge ist eine Entscheidung
// und darf sich ändern, ohne dass die Prüfung eine Meinung dazu hat.
function sollProzent(id) {
  for (var i = 0; i < EINST_REITER.length; i++) {
    if (EINST_REITER[i].id === id) return -100 * i;
  }
  return null;
}
function bahnPixel() {
  var m = /([-+]) (\d+(?:\.\d+)?)px/.exec(versatz());
  return m ? (m[1] === '-' ? -1 : 1) * parseFloat(m[2]) : null;
}

try {
  state = defaultState();
  ansichtenZuruecksetzen();
  setTab('einstellungen');

  // ── A · Alle Blätter stehen da ────────────────────────────
  pruefe('A1 vier Reiter', alle('[data-reiter]').length === EINST_REITER.length,
    String(alle('[data-reiter]').length));
  pruefe('A2 und vier Blätter auf einer Bahn',
    alle('#einstBahn > [data-reiterblatt]').length === EINST_REITER.length);
  // **Geöffnet wird beim ersten Reiter** (ADR 0067): «App» steht vorn, weil
  // man dort zuerst nachsieht, wenn etwas mit der App selbst ist. Gefragt wird
  // die Stelle, nicht der Name — die Reihenfolge darf sich ändern.
  var ERSTER = EINST_REITER[0].id;
  var ZWEITER = EINST_REITER[1].id;
  pruefe('A3 der Anfang ist der erste Reiter', einstReiter === ERSTER &&
    q('[data-reiter="' + ERSTER + '"]').classList.contains('active'), einstReiter);
  pruefe('A4 die Bahn steht auf seinem Blatt',
    bahnProzent() === sollProzent(ERSTER) && bahnPixel() === 0, versatz());
  pruefe('A5 das Fenster schneidet ab',
    getComputedStyle(q('#einstRahmen')).overflow === 'hidden');
  pruefe('A6 jedes Blatt ist so breit wie das Fenster',
    alle('[data-reiterblatt]').every(function (b) {
      return Math.abs(b.getBoundingClientRect().width -
        q('#einstRahmen').getBoundingClientRect().width) < 1;
    }));

  // ── B · Nur das aktive Blatt ist erreichbar ───────────────
  pruefe('B1 das aktive Blatt ist nicht versteckt',
    q('[data-reiterblatt="' + ERSTER + '"]').getAttribute('aria-hidden') === 'false');
  pruefe('B2 die anderen schon',
    alle('[data-reiterblatt]').filter(function (b) {
      return b.dataset.reiterblatt !== ERSTER;
    }).every(function (b) { return b.getAttribute('aria-hidden') === 'true'; }));
  pruefe('B3 und der Fokus springt nicht hinein',
    alle('[data-reiterblatt="antworten"] button').every(function (b) { return b.tabIndex === -1; }));
  // «App» hat nichts einzustellen — dort gibt es Knöpfe, aber keine Schalter.
  pruefe('B4 im aktiven Blatt dagegen schon',
    alle('[data-reiterblatt="' + ERSTER + '"] button').every(function (b) { return b.tabIndex === 0; }));

  // ── C · Der Finger nimmt die Bahn mit ─────────────────────
  var rahmen = q('#einstRahmen');
  touch(rahmen, 'touchstart', 300, 300);
  var vorher = versatz();
  var bewegt = touch(rahmen, 'touchmove', 220, 302);
  pruefe('C1 die Bahn folgt schon während des Ziehens', versatz() !== vorher, versatz());
  pruefe('C2 der Versatz zeigt in die Zugrichtung und ist so weit wie der Finger',
    bahnPixel() === -80, versatz());
  pruefe('C3 und das Scrollen wird unterdrückt', bewegt.defaultPrevented);
  pruefe('C4 ohne Übergang, damit es am Finger klebt',
    q('#einstBahn').style.transition === 'none', q('#einstBahn').style.transition);
  touch(rahmen, 'touchend', 220, 302);
  pruefe('C5 ein kurzer Zug rastet zurück', einstReiter === ERSTER, einstReiter);
  pruefe('C6 und tut das weich', q('#einstBahn').style.transition.indexOf('transform') === 0,
    q('#einstBahn').style.transition);

  // ── D · Weit genug gezogen wechselt das Blatt ─────────────
  wische(360, 60);
  pruefe('D1 nach links kommt der nächste Reiter', einstReiter === ZWEITER, einstReiter);
  pruefe('D2 die Leiste zieht mit',
    q('[data-reiter="' + ZWEITER + '"]').classList.contains('active') &&
    !q('[data-reiter="' + ERSTER + '"]').classList.contains('active'));
  pruefe('D3 die Bahn steht auf dessen Blatt',
    bahnProzent() === sollProzent(ZWEITER) && bahnPixel() === 0, versatz());
  pruefe('D4 und der Fokus wandert mit',
    alle('[data-reiterblatt="' + ZWEITER + '"] button').every(function (b) { return b.tabIndex === 0; }) &&
    alle('[data-reiterblatt="' + ERSTER + '"] button').every(function (b) { return b.tabIndex === -1; }));

  wische(60, 360);
  pruefe('D5 nach rechts wieder zurück', einstReiter === ERSTER, einstReiter);

  // Am Rand gibt es nichts mehr — und es wird nicht umgebrochen.
  einstReiter = EINST_REITER[0].id;
  einstBahnSetzen(0, false);
  einstReiterKopf();
  wische(60, 360);
  pruefe('D6 vor dem ersten Blatt bleibt es stehen',
    einstReiter === EINST_REITER[0].id, einstReiter);
  einstReiter = EINST_REITER[EINST_REITER.length - 1].id;
  einstBahnSetzen(0, false);
  einstReiterKopf();
  wische(360, 60);
  pruefe('D7 nach dem letzten auch',
    einstReiter === EINST_REITER[EINST_REITER.length - 1].id, einstReiter);
  einstReiter = ERSTER;
  einstBahnSetzen(0, false);
  einstReiterKopf();

  // ── E · Der Rand gehört dem Zurückwischen ─────────────────
  // Der Zug vom linken Rand darf nicht blättern — er führt zurück, und genau
  // das soll er weiterhin tun.
  wische(10, 300);
  pruefe('E1 ein Zug vom linken Rand blättert nicht', einstReiter === ERSTER, einstReiter);
  pruefe('E2 sondern führt zurück', currentTab !== 'einstellungen', currentTab);
  setTab('einstellungen');
  pruefe('E3 und die Reiter stehen wieder da', !!q('#einstBahn') && einstReiter === ERSTER,
    einstReiter);

  // ── F · Senkrecht ist Scrollen, nicht Blättern ────────────
  rahmen = q('#einstRahmen');
  touch(rahmen, 'touchstart', 300, 200);
  var runter = touch(rahmen, 'touchmove', 302, 300);
  pruefe('F1 ein senkrechter Zug wird nicht abgefangen', !runter.defaultPrevented);
  touch(rahmen, 'touchmove', 200, 320);
  pruefe('F2 und bleibt Scrollen, auch wenn er später quer wird',
    bahnPixel() === 0, versatz());
  touch(rahmen, 'touchend', 200, 320);
  pruefe('F3 kein Reiterwechsel daraus', einstReiter === ERSTER, einstReiter);

  // ── G · Tippen geht weiterhin ─────────────────────────────
  tippe(q('[data-reiter="darstellung"]'));
  pruefe('G1 ein Tipp auf den Reiter wechselt', einstReiter === 'darstellung');
  pruefe('G2 und schiebt die Bahn dorthin',
    bahnProzent() === sollProzent('darstellung'), versatz());
  pruefe('G3 das Farbschema steht dort', !!q('[data-reiterblatt="darstellung"] [data-wahltext="schema"]'));
  pruefe('G4 der Tonknopf auch', !!q('#tonTest'));

  // ── H · Die Gestalt ───────────────────────────────────────
  pruefe('H1 die Leiste klebt oben',
    getComputedStyle(q('.reiter')).position === 'sticky');
  pruefe('H2 die Knöpfe sind rund wie im Kopf',
    getComputedStyle(q('.reiter-knopf')).borderRadius.indexOf('999') === 0 ||
    parseFloat(getComputedStyle(q('.reiter-knopf')).borderRadius) > 20,
    getComputedStyle(q('.reiter-knopf')).borderRadius);
  pruefe('H3 und groß genug für einen Daumen',
    q('.reiter-knopf').getBoundingClientRect().height >= 44,
    String(q('.reiter-knopf').getBoundingClientRect().height));
  pruefe('H4 die Zeilen sitzen auf einem Blatt', !!q('.blattkarte') &&
    getComputedStyle(q('.blattkarte')).borderStyle === 'solid');
  pruefe('H5 das Blatt trägt die Blattfarbe',
    getComputedStyle(q('.blattkarte')).backgroundColor ===
    getComputedStyle(q('.menuinhalt')).backgroundColor,
    getComputedStyle(q('.blattkarte')).backgroundColor);

  // ── I · Ansichtszustand ───────────────────────────────────
  einstReiter = 'tastatur';
  ansichtenZuruecksetzen();
  pruefe('I1 zurückgesetzt steht wieder der erste Reiter', einstReiter === EINST_REITER[0].id,
    einstReiter);
} catch (e) {
  log.push('AUSNAHME: ' + e.message + ' | ' + (e.stack || '').split('\n')[1]);
}

var pre = document.createElement('pre');
pre.id = 'testlog';
pre.textContent = log.join('\n');
document.body.appendChild(pre);
var f = log.filter(function (l) { return l.indexOf('FAIL') === 0 || l.indexOf('AUSNAHME') === 0; });
document.title = f.length === 0 ? 'ALLE ' + log.length + ' TESTS BESTANDEN' : 'FEHLGESCHLAGEN: ' + f.length;
`;

writeFileSync(BAU + '/t-reiter.html', testseite(html, test));
console.log('Reiter-Testseite geschrieben');
