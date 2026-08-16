/**
 * Card primitives.
 *
 * A card is an integer 0..51.
 *   rank index = card >> 2   (0 = deuce ... 12 = ace)
 *   suit index = card & 3    (0 = clubs, 1 = diamonds, 2 = hearts, 3 = spades)
 *
 * Integers keep the Monte Carlo simulator allocation-free, which is what makes
 * live equity feedback possible in the browser while a learner drags a slider.
 */

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS = ['c', 'd', 'h', 's'];
export const SUIT_SYMBOLS = { c: '♣', d: '♦', h: '♥', s: '♠' };
export const SUIT_NAMES = { c: 'clubs', d: 'diamonds', h: 'hearts', s: 'spades' };

export const RANK_NAMES = [
  'deuce', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'jack', 'queen', 'king', 'ace',
];

export const RANK_NAMES_PLURAL = [
  'deuces', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights',
  'nines', 'tens', 'jacks', 'queens', 'kings', 'aces',
];

export const DECK_SIZE = 52;

/** Every card id, 0..51. */
export const FULL_DECK = Object.freeze(
  Array.from({ length: DECK_SIZE }, (_, i) => i),
);

export function rankOf(card) {
  return card >> 2;
}

export function suitOf(card) {
  return card & 3;
}

export function makeCard(rankIndex, suitIndex) {
  return (rankIndex << 2) | suitIndex;
}

/** "As" -> card id. Accepts "as", "AS", "10s" and "Ts". */
export function parseCard(text) {
  const raw = String(text).trim();
  if (raw.length < 2) throw new Error(`Cannot parse card: "${text}"`);
  let rankChar = raw.slice(0, raw.length - 1).toUpperCase();
  if (rankChar === '10') rankChar = 'T';
  const suitChar = raw[raw.length - 1].toLowerCase();
  const rankIndex = RANKS.indexOf(rankChar);
  const suitIndex = SUITS.indexOf(suitChar);
  if (rankIndex < 0 || suitIndex < 0) throw new Error(`Cannot parse card: "${text}"`);
  return makeCard(rankIndex, suitIndex);
}

/** "AsKd 7h" -> [card, card, card]. Whitespace and commas are optional. */
export function parseCards(text) {
  if (Array.isArray(text)) return text.map((c) => (typeof c === 'number' ? c : parseCard(c)));
  const cleaned = String(text).replace(/[,\s]+/g, '');
  const out = [];
  let i = 0;
  while (i < cleaned.length) {
    if (cleaned.slice(i, i + 2).toUpperCase() === '10') {
      out.push(parseCard(cleaned.slice(i, i + 3)));
      i += 3;
    } else {
      out.push(parseCard(cleaned.slice(i, i + 2)));
      i += 2;
    }
  }
  return out;
}

export function cardToString(card) {
  return RANKS[rankOf(card)] + SUITS[suitOf(card)];
}

export function cardsToString(cards) {
  return cards.map(cardToString).join(' ');
}

/** Human phrasing used by lesson copy: "ace of spades". */
export function cardToWords(card) {
  return `${RANK_NAMES[rankOf(card)]} of ${SUIT_NAMES[SUITS[suitOf(card)]]}`;
}

export function isRed(card) {
  const s = suitOf(card);
  return s === 1 || s === 2;
}

/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * Every drill the app generates is reproducible from a seed, so a learner can
 * be handed the exact hand they got wrong last Tuesday, and so the test suite
 * can assert on generated content.
 */
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng, maxExclusive) {
  return Math.floor(rng() * maxExclusive) % maxExclusive;
}

export function pick(rng, array) {
  return array[randomInt(rng, array.length)];
}

export function shuffle(array, rng) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/** A deck with the given cards removed. */
export function deckWithout(dead) {
  const blocked = new Uint8Array(DECK_SIZE);
  for (const c of dead) blocked[c] = 1;
  const out = [];
  for (let c = 0; c < DECK_SIZE; c++) if (!blocked[c]) out.push(c);
  return out;
}

/** Draw `n` distinct cards not already dealt. */
export function dealRandom(n, dead, rng) {
  const blocked = new Uint8Array(DECK_SIZE);
  for (const c of dead) blocked[c] = 1;
  const out = [];
  while (out.length < n) {
    const c = randomInt(rng, DECK_SIZE);
    if (!blocked[c]) {
      blocked[c] = 1;
      out.push(c);
    }
  }
  return out;
}
