/**
 * 5-to-7 card hand evaluator.
 *
 * Returns a single integer score; higher is better, equal means a chopped pot.
 * The score packs the hand category into the high bits and up to five ranks
 * below it, so plain numeric comparison resolves kickers correctly.
 *
 *   score = category * 16^5 + r1*16^4 + r2*16^3 + r3*16^2 + r4*16 + r5
 *
 * This is not the fastest possible evaluator (lookup tables win that race), but
 * it is fast enough for ~50k Monte Carlo trials in a browser tick and it stays
 * readable, which matters because the teaching layer inspects its output to
 * explain *why* a hand won.
 */

import { RANKS, RANK_NAMES, RANK_NAMES_PLURAL, rankOf, suitOf } from './cards.js';

export const CATEGORY = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  TRIPS: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
};

export const CATEGORY_NAMES = [
  'high card',
  'one pair',
  'two pair',
  'three of a kind',
  'straight',
  'flush',
  'full house',
  'four of a kind',
  'straight flush',
];

const CATEGORY_MULTIPLIER = 16 ** 5;

/** Bitmask of the five ranks of every straight, best first. Index 0 is A-high. */
const STRAIGHT_MASKS = (() => {
  const masks = [];
  // A-high (T J Q K A) down to 6-high (2 3 4 5 6)
  for (let high = 12; high >= 4; high--) {
    let m = 0;
    for (let i = 0; i < 5; i++) m |= 1 << (high - i);
    masks.push({ mask: m, high });
  }
  // The wheel: A 2 3 4 5, where the ace plays low so the straight is five-high.
  masks.push({ mask: (1 << 12) | (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3), high: 3 });
  return masks;
})();

function straightHighFromMask(rankMask) {
  for (const { mask, high } of STRAIGHT_MASKS) {
    if ((rankMask & mask) === mask) return high;
  }
  return -1;
}

function pack(category, ranks) {
  let score = category * CATEGORY_MULTIPLIER;
  for (let i = 0; i < 5; i++) {
    score = score * 1; // keep shape obvious
    const r = i < ranks.length ? ranks[i] : 0;
    score += r * 16 ** (4 - i);
  }
  return score;
}

/**
 * Evaluate any 5, 6, or 7 card hand.
 * @param {number[]} cards card ids
 * @returns {number} comparable score
 */
export function evaluate(cards) {
  const rankCounts = new Uint8Array(13);
  const suitCounts = new Uint8Array(4);
  const suitRankMask = new Uint16Array(4);
  let rankMask = 0;

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const r = rankOf(c);
    const s = suitOf(c);
    rankCounts[r]++;
    suitCounts[s]++;
    suitRankMask[s] |= 1 << r;
    rankMask |= 1 << r;
  }

  // Flush family.
  let flushSuit = -1;
  for (let s = 0; s < 4; s++) if (suitCounts[s] >= 5) flushSuit = s;

  if (flushSuit >= 0) {
    const sfHigh = straightHighFromMask(suitRankMask[flushSuit]);
    if (sfHigh >= 0) return pack(CATEGORY.STRAIGHT_FLUSH, [sfHigh]);
  }

  // Rank-count families.
  let quad = -1;
  const trips = [];
  const pairs = [];
  for (let r = 12; r >= 0; r--) {
    const n = rankCounts[r];
    if (n === 4) quad = r;
    else if (n === 3) trips.push(r);
    else if (n === 2) pairs.push(r);
  }

  if (quad >= 0) {
    let kicker = -1;
    for (let r = 12; r >= 0; r--) {
      if (r !== quad && rankCounts[r] > 0) { kicker = r; break; }
    }
    return pack(CATEGORY.QUADS, [quad, kicker]);
  }

  if (trips.length >= 2) {
    // Two sets of trips: the lower one contributes a pair.
    return pack(CATEGORY.FULL_HOUSE, [trips[0], trips[1]]);
  }
  if (trips.length === 1 && pairs.length >= 1) {
    return pack(CATEGORY.FULL_HOUSE, [trips[0], pairs[0]]);
  }

  if (flushSuit >= 0) {
    const flushRanks = [];
    for (let r = 12; r >= 0 && flushRanks.length < 5; r--) {
      if (suitRankMask[flushSuit] & (1 << r)) flushRanks.push(r);
    }
    return pack(CATEGORY.FLUSH, flushRanks);
  }

  const straightHigh = straightHighFromMask(rankMask);
  if (straightHigh >= 0) return pack(CATEGORY.STRAIGHT, [straightHigh]);

  if (trips.length === 1) {
    const kickers = [];
    for (let r = 12; r >= 0 && kickers.length < 2; r--) {
      if (r !== trips[0] && rankCounts[r] > 0) kickers.push(r);
    }
    return pack(CATEGORY.TRIPS, [trips[0], ...kickers]);
  }

  if (pairs.length >= 2) {
    const [hi, lo] = pairs;
    let kicker = -1;
    for (let r = 12; r >= 0; r--) {
      if (r !== hi && r !== lo && rankCounts[r] > 0) { kicker = r; break; }
    }
    return pack(CATEGORY.TWO_PAIR, [hi, lo, kicker]);
  }

  if (pairs.length === 1) {
    const kickers = [];
    for (let r = 12; r >= 0 && kickers.length < 3; r--) {
      if (r !== pairs[0] && rankCounts[r] > 0) kickers.push(r);
    }
    return pack(CATEGORY.PAIR, [pairs[0], ...kickers]);
  }

  const high = [];
  for (let r = 12; r >= 0 && high.length < 5; r--) {
    if (rankCounts[r] > 0) high.push(r);
  }
  return pack(CATEGORY.HIGH_CARD, high);
}

export function categoryOf(score) {
  return Math.floor(score / CATEGORY_MULTIPLIER);
}

export function categoryName(score) {
  return CATEGORY_NAMES[categoryOf(score)];
}

/** The five ranks packed under the category, highest first. */
export function rankChain(score) {
  const rest = score % CATEGORY_MULTIPLIER;
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push(Math.floor(rest / 16 ** (4 - i)) % 16);
  }
  return out;
}

/**
 * Plain-English description, e.g. "two pair, kings and sevens, ace kicker".
 * The learning layer leans on this constantly: a beginner who is told the name
 * of what they hold learns board reading far faster than one shown a number.
 */
export function describe(score) {
  const cat = categoryOf(score);
  const r = rankChain(score);
  const N = RANK_NAMES;
  const P = RANK_NAMES_PLURAL;
  switch (cat) {
    case CATEGORY.STRAIGHT_FLUSH:
      return r[0] === 12 ? 'a royal flush' : `a straight flush, ${N[r[0]]} high`;
    case CATEGORY.QUADS:
      return `four ${P[r[0]]}, ${N[r[1]]} kicker`;
    case CATEGORY.FULL_HOUSE:
      return `a full house, ${P[r[0]]} full of ${P[r[1]]}`;
    case CATEGORY.FLUSH:
      return `a flush, ${N[r[0]]} high`;
    case CATEGORY.STRAIGHT:
      return `a straight, ${N[r[0]]} high`;
    case CATEGORY.TRIPS:
      return `three ${P[r[0]]}, ${N[r[1]]} and ${N[r[2]]} kickers`;
    case CATEGORY.TWO_PAIR:
      return `two pair, ${P[r[0]]} and ${P[r[1]]}, ${N[r[2]]} kicker`;
    case CATEGORY.PAIR:
      return `a pair of ${P[r[0]]}, ${N[r[1]]} kicker`;
    default:
      return `${N[r[0]]} high, ${RANKS[r[1]]}${RANKS[r[2]]}${RANKS[r[3]]}${RANKS[r[4]]} kickers`;
  }
}

/** Short label without kickers, for compact UI: "two pair". */
export function shortName(score) {
  return CATEGORY_NAMES[categoryOf(score)];
}

/** The best 5 of N cards, for showing a learner which cards actually played. */
export function bestFive(cards) {
  if (cards.length <= 5) return { cards: cards.slice(), score: evaluate(cards) };
  let bestScore = -1;
  let best = null;
  const n = cards.length;
  const idx = [0, 1, 2, 3, 4];
  const combo = new Array(5);
  const emit = () => {
    for (let i = 0; i < 5; i++) combo[i] = cards[idx[i]];
    const s = evaluate(combo);
    if (s > bestScore) {
      bestScore = s;
      best = combo.slice();
    }
  };
  emit();
  while (true) {
    let i = 4;
    while (i >= 0 && idx[i] === n - 5 + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < 5; j++) idx[j] = idx[j - 1] + 1;
    emit();
  }
  return { cards: best, score: bestScore };
}

/** -1, 0, or 1 comparing two made hands. */
export function compareHands(a, b) {
  const sa = evaluate(a);
  const sb = evaluate(b);
  return sa === sb ? 0 : sa > sb ? 1 : -1;
}
