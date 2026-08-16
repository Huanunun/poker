/**
 * Equity: the share of the pot a hand wins on average if all remaining cards
 * are dealt and nobody folds.
 *
 * Two engines live here.
 *   - `exactEquity` enumerates every runout. Used from the flop onward (990
 *     flop runouts, 44 turn cards) so the number a learner is graded against is
 *     the true number, not a sample.
 *   - `monteCarloEquity` samples. Used preflop and multiway, where enumeration
 *     is too slow to keep the UI responsive.
 *
 * Both split ties by pot share, so a hand that always chops reports 50%. That
 * is the honest answer and it heads off a whole class of beginner confusion
 * about "I didn't lose, so why isn't it 100%?".
 */

import { DECK_SIZE, deckWithout, makeRng, randomInt } from './cards.js';
import { evaluate } from './evaluator.js';

/**
 * @typedef {Object} EquityResult
 * @property {number} equity  0..1 average share of the pot
 * @property {number} win     0..1 outright win frequency
 * @property {number} tie     0..1 chop frequency
 * @property {number} lose    0..1
 * @property {number} trials
 * @property {boolean} exact
 */

/** Enumerate every runout. Requires a flop or later (<= 2 unknown board cards is fastest). */
export function exactEquity(heroCards, villainCards, board) {
  const dead = [...heroCards, ...villainCards, ...board];
  const remaining = deckWithout(dead);
  const need = 5 - board.length;
  if (need > 3) {
    throw new Error('exactEquity needs a flop or later; use monteCarloEquity preflop');
  }

  let win = 0;
  let tie = 0;
  let total = 0;
  const hero = new Array(7);
  const vill = new Array(7);
  hero[0] = heroCards[0];
  hero[1] = heroCards[1];
  vill[0] = villainCards[0];
  vill[1] = villainCards[1];
  for (let i = 0; i < board.length; i++) {
    hero[2 + i] = board[i];
    vill[2 + i] = board[i];
  }

  const score = () => {
    const h = evaluate(hero);
    const v = evaluate(vill);
    total++;
    if (h > v) win++;
    else if (h === v) tie++;
  };

  const place = (slot, card) => {
    hero[slot] = card;
    vill[slot] = card;
  };

  const base = 2 + board.length;
  if (need === 0) {
    score();
  } else if (need === 1) {
    for (const c of remaining) {
      place(base, c);
      score();
    }
  } else if (need === 2) {
    for (let i = 0; i < remaining.length; i++) {
      place(base, remaining[i]);
      for (let j = i + 1; j < remaining.length; j++) {
        place(base + 1, remaining[j]);
        score();
      }
    }
  } else {
    for (let i = 0; i < remaining.length; i++) {
      place(base, remaining[i]);
      for (let j = i + 1; j < remaining.length; j++) {
        place(base + 1, remaining[j]);
        for (let k = j + 1; k < remaining.length; k++) {
          place(base + 2, remaining[k]);
          score();
        }
      }
    }
  }

  return {
    equity: (win + tie / 2) / total,
    win: win / total,
    tie: tie / total,
    lose: (total - win - tie) / total,
    trials: total,
    exact: true,
  };
}

/**
 * Sampled equity. Entries in `villains` are either concrete two-card hands or
 * `null` for an unknown random hand, which is how "hero versus three unknown
 * players" is modelled.
 */
export function monteCarloEquity(heroCards, villains, board = [], options = {}) {
  const trials = options.trials ?? 10000;
  const rng = options.rng ?? makeRng(options.seed ?? 0x5eed);

  const staticDead = [...heroCards, ...board];
  for (const v of villains) if (v) staticDead.push(...v);

  const blocked = new Uint8Array(DECK_SIZE);
  const heroHand = new Array(7);
  const villHand = new Array(7);
  let share = 0;
  let wins = 0;
  let ties = 0;

  for (let t = 0; t < trials; t++) {
    blocked.fill(0);
    for (const c of staticDead) blocked[c] = 1;

    const draw = () => {
      for (;;) {
        const c = randomInt(rng, DECK_SIZE);
        if (!blocked[c]) {
          blocked[c] = 1;
          return c;
        }
      }
    };

    // Unknown villain hands are dealt before the board so they block it.
    const villainHands = villains.map((v) => v || [draw(), draw()]);
    const fullBoard = board.slice();
    while (fullBoard.length < 5) fullBoard.push(draw());

    heroHand[0] = heroCards[0];
    heroHand[1] = heroCards[1];
    for (let i = 0; i < 5; i++) heroHand[2 + i] = fullBoard[i];
    const heroScore = evaluate(heroHand);

    let best = -1;
    let tiedWithBest = 0;
    for (const v of villainHands) {
      villHand[0] = v[0];
      villHand[1] = v[1];
      for (let i = 0; i < 5; i++) villHand[2 + i] = fullBoard[i];
      const s = evaluate(villHand);
      if (s > best) {
        best = s;
        tiedWithBest = 1;
      } else if (s === best) {
        tiedWithBest++;
      }
    }

    if (heroScore > best) {
      share += 1;
      wins++;
    } else if (heroScore === best) {
      share += 1 / (tiedWithBest + 1);
      ties++;
    }
  }

  return {
    equity: share / trials,
    win: wins / trials,
    tie: ties / trials,
    lose: (trials - wins - ties) / trials,
    trials,
    exact: false,
  };
}

/** Pick the right engine automatically. This is what the app calls. */
export function equity(hero, villains, board = [], options = {}) {
  const headsUpKnown = villains.length === 1 && villains[0];
  if (headsUpKnown && board.length >= 3 && !options.forceMonteCarlo) {
    return exactEquity(hero, villains[0], board);
  }
  return monteCarloEquity(hero, villains, board, options);
}

/**
 * Equity against N unknown opponents. The single most useful sanity number for
 * a beginner: it shows that "strong hand" is meaningless without "against how
 * many players".
 */
export function equityVsRandom(hero, opponents = 1, options = {}) {
  return monteCarloEquity(hero, new Array(opponents).fill(null), [], {
    trials: options.trials ?? 8000,
    ...options,
  });
}
