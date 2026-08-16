/**
 * Board reading: what a flop *is*, what a hand has, and which cards genuinely
 * help.
 *
 * The outs counter here is exact rather than heuristic. It enumerates the next
 * card and asks "does this card actually put me in front of that hand?", which
 * regularly disagrees with the count a beginner produces by eye. Showing that
 * disagreement, card by card, is the fastest cure for counting dirty outs.
 */

import {
  RANKS, RANK_NAMES_PLURAL, deckWithout, rankOf, suitOf, cardToString,
} from './cards.js';
import { evaluate, categoryOf, CATEGORY, describe } from './evaluator.js';

/** How wet is this flop? Returns the components, not just a verdict. */
export function boardTexture(board) {
  const ranks = board.map(rankOf).sort((a, b) => b - a);
  const suits = board.map(suitOf);
  const suitCounts = [0, 0, 0, 0];
  for (const s of suits) suitCounts[s]++;
  const maxSuit = Math.max(...suitCounts);

  const uniqueRanks = [...new Set(ranks)];
  const paired = uniqueRanks.length < ranks.length;
  const trips = ranks.length >= 3 && uniqueRanks.length === 1;

  // Connectedness: how many distinct straights can be made using two board cards.
  let straightWindows = 0;
  const rankSet = new Set(ranks);
  const withWheel = new Set(ranks);
  if (rankSet.has(12)) withWheel.add(-1);
  for (let low = -1; low <= 8; low++) {
    let onBoard = 0;
    for (let i = 0; i < 5; i++) if (withWheel.has(low + i)) onBoard++;
    if (onBoard >= 2) straightWindows++;
  }

  const gaps = [];
  for (let i = 0; i < uniqueRanks.length - 1; i++) {
    gaps.push(uniqueRanks[i] - uniqueRanks[i + 1]);
  }
  const connected = gaps.some((g) => g <= 2);

  const highCard = ranks[0];
  const broadwayCount = ranks.filter((r) => r >= 8).length;

  let wetness = 0;
  if (maxSuit >= 3) wetness += 3;
  else if (maxSuit === 2) wetness += 1;
  if (connected) wetness += 2;
  if (straightWindows >= 4) wetness += 1;
  if (paired) wetness -= 1;

  return {
    ranks,
    highCard,
    highCardName: RANKS[highCard],
    paired,
    trips,
    monotone: maxSuit >= 3,
    twoTone: maxSuit === 2,
    rainbow: maxSuit === 1,
    connected,
    straightWindows,
    broadwayCount,
    wetness,
    label: wetness >= 4 ? 'wet' : wetness >= 2 ? 'semi-wet' : 'dry',
    /** Plain-language summary used in lesson feedback. */
    summary: [
      maxSuit >= 3 ? 'three of one suit' : maxSuit === 2 ? 'two of one suit' : 'rainbow',
      paired ? 'paired' : 'unpaired',
      connected ? 'connected' : 'disconnected',
      broadwayCount >= 2 ? 'broadway heavy' : highCard <= 6 ? 'low' : 'one high card',
    ].join(', '),
  };
}

/** Which draws does this hand hold on this board? */
export function draws(hole, board) {
  const all = [...hole, ...board];
  const suitCounts = [0, 0, 0, 0];
  for (const c of all) suitCounts[suitOf(c)]++;
  const holeSuits = hole.map(suitOf);

  const flushDraw = suitCounts.some((n, s) => n === 4 && holeSuits.includes(s));
  const madeFlush = suitCounts.some((n) => n >= 5);
  const backdoorFlush =
    !flushDraw && !madeFlush && suitCounts.some((n, s) => n === 3 && holeSuits.includes(s));

  const rankSet = new Set(all.map(rankOf));
  if (rankSet.has(12)) rankSet.add(-1); // wheel ace

  let openEnded = false;
  let gutshot = false;
  let madeStraight = false;
  for (let low = -1; low <= 8; low++) {
    let have = 0;
    const missing = [];
    for (let i = 0; i < 5; i++) {
      if (rankSet.has(low + i)) have++;
      else missing.push(low + i);
    }
    if (have === 5) madeStraight = true;
    else if (have === 4) {
      // Distinguish open-ended from gutshot by where the hole sits.
      const miss = missing[0];
      if (miss === low || miss === low + 4) openEnded = true;
      else gutshot = true;
    }
  }
  if (openEnded) gutshot = false;

  const boardRanks = board.map(rankOf);
  const topBoard = Math.max(...boardRanks);
  const overcards = hole.filter((c) => rankOf(c) > topBoard).length;

  const score = evaluate(all);
  const made = categoryOf(score);

  return {
    madeCategory: made,
    madeDescription: describe(score),
    flushDraw,
    madeFlush,
    backdoorFlush,
    openEnded,
    gutshot,
    madeStraight,
    overcards,
    labels: [
      madeFlush && 'flush',
      madeStraight && 'straight',
      flushDraw && 'flush draw',
      openEnded && 'open-ended straight draw',
      gutshot && 'gutshot',
      backdoorFlush && 'backdoor flush draw',
      overcards > 0 && made <= CATEGORY.HIGH_CARD && `${overcards} overcard${overcards > 1 ? 's' : ''}`,
    ].filter(Boolean),
  };
}

/**
 * Exact outs against a specific opponent hand.
 *
 * An "out" is a next card after which hero holds the better hand. Cards that
 * improve hero but improve villain more are excluded, and reported separately
 * as `trapCards` — those are the ones beginners count and then lose stacks to.
 */
export function countOuts(hole, villainHole, board) {
  const dead = [...hole, ...villainHole, ...board];
  const remaining = deckWithout(dead);

  const heroNow = evaluate([...hole, ...board]);
  const villNow = evaluate([...villainHole, ...board]);
  const aheadNow = heroNow > villNow;

  const outs = [];
  const trapCards = [];
  const neutral = [];

  for (const c of remaining) {
    const h = evaluate([...hole, ...board, c]);
    const v = evaluate([...villainHole, ...board, c]);
    if (!aheadNow && h > v) outs.push(c);
    else if (!aheadNow && h === v) neutral.push(c);
    else if (aheadNow && h < v) trapCards.push(c);
  }

  return {
    aheadNow,
    heroDescription: describe(heroNow),
    villainDescription: describe(villNow),
    outs,
    outCount: outs.length,
    chopCards: neutral,
    trapCards,
    unseen: remaining.length,
    /** Exact chance of hitting on the very next card. */
    nextCardEquity: outs.length / remaining.length,
    outsText: outs.map(cardToString).join(' '),
  };
}

/**
 * The out count a learner is *likely* to produce by eye, so a drill can show
 * the gap between the intuitive count and the real one.
 */
export function naiveOuts(hole, board) {
  const d = draws(hole, board);
  let count = 0;
  const reasons = [];
  if (d.flushDraw) {
    count += 9;
    reasons.push('9 for the flush draw');
  }
  if (d.openEnded) {
    count += 8;
    reasons.push('8 for the open-ended straight draw');
  } else if (d.gutshot) {
    count += 4;
    reasons.push('4 for the gutshot');
  }
  if (d.overcards > 0 && d.madeCategory === CATEGORY.HIGH_CARD) {
    count += d.overcards * 3;
    reasons.push(`${d.overcards * 3} for ${d.overcards} overcard${d.overcards > 1 ? 's' : ''}`);
  }
  return { count, reasons };
}

/**
 * Does this flop favour the preflop raiser? Expressed as which player's range
 * connects harder, which is the foundation the whole c-bet lesson is built on.
 */
export function rangeAdvantageHint(board) {
  const t = boardTexture(board);
  if (t.broadwayCount >= 2) {
    return {
      favours: 'raiser',
      why: 'Two broadway cards hit the raiser\'s range of big cards far more often than the caller\'s.',
    };
  }
  if (t.highCard <= 6) {
    return {
      favours: 'caller',
      why: 'A low, connected board misses big cards entirely and connects with the caller\'s suited and connected hands.',
    };
  }
  if (t.highCard === 12 || t.highCard === 11) {
    return {
      favours: 'raiser',
      why: 'Ace and king high flops belong to whoever holds more aces and kings, which is the raiser.',
    };
  }
  return {
    favours: 'neither strongly',
    why: 'A middling board is close to shared; position decides more than range here.',
  };
}

/** Human-readable flop name used in lesson prose: "king-high, two hearts, paired". */
export function describeBoard(board) {
  const t = boardTexture(board);
  const parts = [`${RANKS[t.highCard]}-high`];
  if (t.trips) parts.push('trips on board');
  else if (t.paired) {
    const counts = {};
    for (const c of board) counts[rankOf(c)] = (counts[rankOf(c)] || 0) + 1;
    const pairRank = Number(Object.keys(counts).find((k) => counts[k] >= 2));
    parts.push(`paired ${RANK_NAMES_PLURAL[pairRank]}`);
  }
  if (t.monotone) parts.push('monotone');
  else if (t.twoTone) parts.push('two-tone');
  else parts.push('rainbow');
  if (t.connected) parts.push('connected');
  return parts.join(', ');
}
