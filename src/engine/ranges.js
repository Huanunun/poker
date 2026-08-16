/**
 * Ranges: thinking in groups of hands instead of one hand.
 *
 * The 169-cell grid is the single most important mental model in the game and
 * also the easiest to teach visually, because combinatorics stops being algebra
 * the moment you can see that a pair occupies 6 squares and a suited hand only
 * 4. Everything here is built to be rendered as that grid.
 */

import { RANKS, makeCard, rankOf, suitOf, cardToString } from './cards.js';
import { evaluate } from './evaluator.js';
import { deckWithout, makeRng, randomInt } from './cards.js';

/** Canonical label for a two-card hand: "AKs", "AKo", "77". */
export function handLabel(cards) {
  const [a, b] = cards;
  const ra = rankOf(a);
  const rb = rankOf(b);
  const hi = Math.max(ra, rb);
  const lo = Math.min(ra, rb);
  if (ra === rb) return RANKS[hi] + RANKS[lo];
  const suited = suitOf(a) === suitOf(b);
  return RANKS[hi] + RANKS[lo] + (suited ? 's' : 'o');
}

/** How many of the 1326 possible two-card combinations a label covers. */
export function comboCount(label) {
  if (label.length === 2 && label[0] === label[1]) return 6; // pair: 4 choose 2
  if (label.endsWith('s')) return 4; // one per suit
  return 12; // offsuit: 4 x 4 minus the 4 suited
}

export const TOTAL_COMBOS = 1326;

/** Every concrete combination for a label, as card-id pairs. */
export function expandLabel(label) {
  const r1 = RANKS.indexOf(label[0]);
  const r2 = RANKS.indexOf(label[1]);
  const out = [];
  if (r1 === r2) {
    for (let s1 = 0; s1 < 4; s1++) {
      for (let s2 = s1 + 1; s2 < 4; s2++) out.push([makeCard(r1, s1), makeCard(r2, s2)]);
    }
    return out;
  }
  const suited = label[2] === 's';
  if (suited) {
    for (let s = 0; s < 4; s++) out.push([makeCard(r1, s), makeCard(r2, s)]);
  } else {
    for (let s1 = 0; s1 < 4; s1++) {
      for (let s2 = 0; s2 < 4; s2++) if (s1 !== s2) out.push([makeCard(r1, s1), makeCard(r2, s2)]);
    }
  }
  return out;
}

/**
 * The 13x13 grid, row 0 / col 0 being aces.
 * Above the diagonal is suited, below is offsuit — the standard layout every
 * poker tool uses, so the learner's mental picture transfers.
 */
export const GRID = (() => {
  const rows = [];
  for (let i = 0; i < 13; i++) {
    const row = [];
    const r1 = 12 - i;
    for (let j = 0; j < 13; j++) {
      const r2 = 12 - j;
      if (i === j) row.push(RANKS[r1] + RANKS[r1]);
      else if (j > i) row.push(RANKS[r1] + RANKS[r2] + 's');
      else row.push(RANKS[r2] + RANKS[r1] + 'o');
    }
    rows.push(row);
  }
  return rows;
})();

export const ALL_LABELS = GRID.flat();

/**
 * Parse a range string into a Set of labels.
 * Supports: "AA", "AKs", "77+", "ATs+", "KQo+", "T9s-76s", "AA-JJ", and any
 * comma separated mix of those.
 */
export function parseRange(text) {
  const out = new Set();
  if (!text) return out;
  for (const rawPart of String(text).split(',')) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [a, b] = part.split('-').map((s) => s.trim());
      for (const label of expandDashRange(a, b)) out.add(label);
      continue;
    }
    if (part.endsWith('+')) {
      for (const label of expandPlus(part.slice(0, -1))) out.add(label);
      continue;
    }
    const norm = normalizeLabel(part);
    if (norm) out.add(norm);
  }
  return out;
}

function normalizeLabel(part) {
  if (part.length < 2) return null;
  const r1 = RANKS.indexOf(part[0].toUpperCase());
  const r2 = RANKS.indexOf(part[1].toUpperCase());
  if (r1 < 0 || r2 < 0) return null;
  const hi = Math.max(r1, r2);
  const lo = Math.min(r1, r2);
  if (hi === lo) return RANKS[hi] + RANKS[lo];
  const suffix = part[2] ? part[2].toLowerCase() : 'o';
  return RANKS[hi] + RANKS[lo] + (suffix === 's' ? 's' : 'o');
}

function expandPlus(base) {
  const label = normalizeLabel(base);
  if (!label) return [];
  const r1 = RANKS.indexOf(label[0]);
  const r2 = RANKS.indexOf(label[1]);
  const out = [];
  if (r1 === r2) {
    for (let r = r1; r <= 12; r++) out.push(RANKS[r] + RANKS[r]);
  } else {
    const suffix = label[2];
    for (let r = r2; r < r1; r++) out.push(RANKS[r1] + RANKS[r] + suffix);
  }
  return out;
}

function expandDashRange(a, b) {
  const la = normalizeLabel(a);
  const lb = normalizeLabel(b);
  if (!la || !lb) return [];
  const a1 = RANKS.indexOf(la[0]);
  const a2 = RANKS.indexOf(la[1]);
  const b1 = RANKS.indexOf(lb[0]);
  const b2 = RANKS.indexOf(lb[1]);
  const out = [];
  if (a1 === a2 && b1 === b2) {
    const lo = Math.min(a1, b1);
    const hi = Math.max(a1, b1);
    for (let r = lo; r <= hi; r++) out.push(RANKS[r] + RANKS[r]);
    return out;
  }
  if (la[2] === lb[2] && a1 - a2 === b1 - b2) {
    // Same gap, e.g. T9s-76s: walk the diagonal.
    const lo = Math.min(a1, b1);
    const hi = Math.max(a1, b1);
    const gap = a1 - a2;
    for (let r = lo; r <= hi; r++) out.push(RANKS[r] + RANKS[r - gap] + la[2]);
    return out;
  }
  if (a1 === b1 && la[2] === lb[2]) {
    // Same top card, e.g. AJs-A2s
    const lo = Math.min(a2, b2);
    const hi = Math.max(a2, b2);
    for (let r = lo; r <= hi; r++) out.push(RANKS[a1] + RANKS[r] + la[2]);
    return out;
  }
  return [la, lb];
}

/** Total combinations in a range, and the share of all hands it represents. */
export function rangeSize(labels) {
  let combos = 0;
  for (const l of labels) combos += comboCount(l);
  return {
    labels: labels.size ?? labels.length,
    combos,
    percent: combos / TOTAL_COMBOS,
  };
}

/** Serialize a Set of labels back to a compact, human-editable string. */
export function rangeToString(labels) {
  return [...labels]
    .sort((a, b) => ALL_LABELS.indexOf(a) - ALL_LABELS.indexOf(b))
    .join(', ');
}

/** Remove combinations blocked by known cards. Blockers, made concrete. */
export function removeBlocked(labels, deadCards) {
  const dead = new Set(deadCards);
  let combos = 0;
  const surviving = new Map();
  for (const label of labels) {
    const alive = expandLabel(label).filter(([a, b]) => !dead.has(a) && !dead.has(b));
    if (alive.length) {
      surviving.set(label, alive.length);
      combos += alive.length;
    }
  }
  return { surviving, combos };
}

/**
 * Equity of a concrete hand against a whole range.
 * Samples villain combos and runouts together; this is the number behind every
 * "how am I doing against what they'd actually play like this?" drill.
 */
export function equityVsRange(hero, rangeLabels, board = [], options = {}) {
  const trials = options.trials ?? 6000;
  const rng = options.rng ?? makeRng(options.seed ?? 99);
  const dead = new Set([...hero, ...board]);

  const combos = [];
  for (const label of rangeLabels) {
    for (const combo of expandLabel(label)) {
      if (!dead.has(combo[0]) && !dead.has(combo[1])) combos.push(combo);
    }
  }
  if (!combos.length) return { equity: 0, trials: 0, combos: 0 };

  let share = 0;
  const deckBase = deckWithout([...hero, ...board]);

  for (let t = 0; t < trials; t++) {
    const villain = combos[randomInt(rng, combos.length)];
    const blocked = new Set([...hero, ...board, ...villain]);
    const full = board.slice();
    while (full.length < 5) {
      const c = deckBase[randomInt(rng, deckBase.length)];
      if (!blocked.has(c)) {
        blocked.add(c);
        full.push(c);
      }
    }
    const h = evaluate([...hero, ...full]);
    const v = evaluate([...villain, ...full]);
    if (h > v) share += 1;
    else if (h === v) share += 0.5;
  }

  return { equity: share / trials, trials, combos: combos.length };
}

/**
 * How much of a range makes each hand class on a given flop.
 * This is what turns "they have a range" into "they have top pair 14% of the
 * time", which is the sentence that unlocks postflop thinking.
 */
export function rangeHitBreakdown(rangeLabels, board) {
  const dead = new Set(board);
  const buckets = {
    'nothing': 0,
    'weak pair': 0,
    'top pair': 0,
    'overpair': 0,
    'two pair+': 0,
  };
  let total = 0;
  const boardRanks = board.map(rankOf);
  const topBoard = Math.max(...boardRanks);

  for (const label of rangeLabels) {
    for (const combo of expandLabel(label)) {
      if (dead.has(combo[0]) || dead.has(combo[1])) continue;
      total++;
      const score = evaluate([...combo, ...board]);
      const cat = Math.floor(score / 16 ** 5);
      if (cat >= 2) buckets['two pair+']++;
      else if (cat === 1) {
        const r1 = rankOf(combo[0]);
        const r2 = rankOf(combo[1]);
        if (r1 === r2 && r1 > topBoard) buckets['overpair']++;
        else if (r1 === topBoard || r2 === topBoard) buckets['top pair']++;
        else buckets['weak pair']++;
      } else buckets['nothing']++;
    }
  }

  const out = {};
  for (const [k, v] of Object.entries(buckets)) out[k] = { combos: v, share: total ? v / total : 0 };
  return { total, buckets: out };
}

/** A random concrete hand drawn from a range, for scenario generation. */
export function sampleFromRange(rangeLabels, deadCards, rng) {
  const dead = new Set(deadCards);
  const combos = [];
  for (const label of rangeLabels) {
    for (const combo of expandLabel(label)) {
      if (!dead.has(combo[0]) && !dead.has(combo[1])) combos.push(combo);
    }
  }
  if (!combos.length) return null;
  return combos[randomInt(rng, combos.length)];
}

/** Pretty printer used in feedback text. */
export function describeCombos(label) {
  const n = comboCount(label);
  if (label.length === 2) {
    return `${label} is 6 combinations: 4 cards taken 2 at a time.`;
  }
  if (label.endsWith('s')) {
    return `${label} is 4 combinations, one for each suit.`;
  }
  return `${label} is 12 combinations: 4 x 4 pairings, minus the 4 that would be suited.`;
}
