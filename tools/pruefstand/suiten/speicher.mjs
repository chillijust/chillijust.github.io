// Der Speicher: ein Schlüssel, abgesichert, und nie im Weg.
//
// Safari wirft im privaten Modus und bei vollem Kontingent. Die App muss dann
// trotzdem stehen — und sagen, dass sie nicht speichern konnte.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('speicher', html, String.raw`
frisch();
pruefe('A1 der Schlüssel heißt chillinal_v1', SPEICHER === 'chillinal_v1');

// ── B · Lesen ───────────────────────────────────────────────
localStorage.removeItem(SPEICHER);
pruefe('B1 leer gibt den Grundstand', JSON.stringify(laden()) === JSON.stringify(grundStand()));
localStorage.setItem(SPEICHER, '{kaputt');
pruefe('B2 Unlesbares auch', JSON.stringify(laden()) === JSON.stringify(grundStand()));
localStorage.setItem(SPEICHER, '"nur ein Text"');
pruefe('B3 ein Wert ohne Gestalt auch', laden().thema === 'auto');
localStorage.setItem(SPEICHER, JSON.stringify({ thema: 'lila', fremd: 1 }));
var l = laden();
pruefe('B4 ein unbekanntes Thema fällt auf auto', l.thema === 'auto');
pruefe('B5 fremde Felder kommen nicht hinein', !('fremd' in l));
pruefe('B6 ein Stand ohne neues Feld wird aufgefüllt', l.schema === 1);

// ── C · Wenn der Speicher wirft ─────────────────────────────
var echtLesen = Storage.prototype.getItem, echtSchreiben = Storage.prototype.setItem;
Storage.prototype.getItem = function () { throw new Error('gesperrt'); };
Storage.prototype.setItem = function () { throw new Error('voll'); };
var gelesen, geschrieben, geworfen = false;
try {
  gelesen = laden();
  geschrieben = speichern();
  themaSetzen('dunkel');
  zeige('einstellungen');
  zeige('home');
} catch (e) { geworfen = e.message; }
Storage.prototype.getItem = echtLesen;
Storage.prototype.setItem = echtSchreiben;
pruefe('C1 nichts wirft durch', geworfen === false, geworfen);
pruefe('C2 gelesen wird der Grundstand', gelesen && gelesen.thema === 'auto');
pruefe('C3 speichern sagt, dass es nicht ging', geschrieben === false);
pruefe('C4 und die Meldung sagt es dem Nutzer', /Speichern ging nicht/.test(q('#meldung').textContent));
pruefe('C5 die App steht weiter', !!q('#chiliFigur') && state.thema === 'dunkel');

// ── D · Geschrieben wird, was der Zustand ist ───────────────
frisch();
state.thema = 'hell';
speichern();
pruefe('D1 der Zustand liegt als JSON unter dem Schlüssel',
  JSON.parse(localStorage.getItem(SPEICHER)).thema === 'hell');
frisch();
speichern();
`);
