/**
 * Exercise generators.
 *
 * Every exercise is generated fresh from a seed rather than stored, so the
 * learner never sees the same hand twice and can never pattern-match an answer
 * key. Because the generator has the engine available, the feedback it writes
 * is computed from that exact hand: the explanation is always true, never a
 * generic paragraph that happens to sit near the question.
 *
 * Exercises are plain serializable data. Grading lives in `grade()` at the
 * bottom, keyed on `kind`, so an exercise can be saved, replayed, or shared as
 * a seed string.
 *
 * The important kind is `steps`. A step chain takes a decision that would
 * overwhelm a beginner and asks it as four or five questions a beginner can
 * each answer, in the order a strong player would actually think them. Nothing
 * in the chain is harder than counting or one division.
 */

import {
  RANKS, cardToString, cardsToString, dealRandom, deckWithout, makeCard,
  makeRng, parseCards, pick, randomInt, rankOf, shuffle, suitOf,
} from '../engine/cards.js';
import {
  CATEGORY, CATEGORY_NAMES, categoryOf, describe, evaluate, bestFive,
} from '../engine/evaluator.js';
import { equity, exactEquity, monteCarloEquity } from '../engine/equity.js';
import {
  breakEvenEquity, bluffToValueRatio, evOfBluff, evOfCall, impliedOdds,
  minimumDefenceFrequency, pct, potOdds, priceOfBet, round, ruleOfTwoAndFour, spr,
} from '../engine/odds.js';
import {
  boardTexture, countOuts, describeBoard, draws, naiveOuts, rangeAdvantageHint,
} from '../engine/board.js';
import {
  ALL_LABELS, comboCount, describeCombos, equityVsRange, expandLabel, GRID,
  handLabel, parseRange, rangeHitBreakdown, rangeSize, sampleFromRange,
} from '../engine/ranges.js';
import { POSITIONS, POSITION_INFO, RFI, RFI_REASONING, VS_RFI } from '../engine/preflop.js';

/* ------------------------------------------------------------------ *
 * Small builders
 * ------------------------------------------------------------------ */

const choice = (prompt, options, answer, extra = {}) => ({
  kind: 'choice', prompt, options, answer, ...extra,
});

const numeric = (prompt, answer, extra = {}) => ({
  kind: 'numeric', prompt, answer, tolerance: extra.tolerance ?? 0, ...extra,
});

const slider = (prompt, answer, extra = {}) => ({
  kind: 'slider', prompt, answer, min: extra.min ?? 0, max: extra.max ?? 100,
  tolerance: extra.tolerance ?? 8, unit: '%', ...extra,
});

/**
 * Distinct wrong answers near the right one, so guessing does not pay.
 *
 * Guaranteed to return exactly `count + 1` distinct values: random sampling
 * near the answer first, then a deterministic outward walk to fill any gaps.
 * Without that fallback a small correct value collapses into too few options
 * and the question becomes a giveaway.
 */
function distractors(correct, rng, { count = 3, spread = 0.5, min = 0, max = Infinity, integer = true } = {}) {
  const clean = (v) => (integer ? Math.round(v) : round(v, 1));
  const step = integer ? 1 : 0.1;
  const out = new Set([clean(correct)]);
  const reach = Math.max(spread * Math.abs(correct), integer ? 4 : 0.4);

  for (let guard = 0; guard < 200 && out.size < count + 1; guard++) {
    const v = clean(correct + (rng() * 2 - 1) * reach);
    if (v >= min && v <= max) out.add(v);
  }

  // Deterministic fill: walk outward from the answer until there are enough.
  for (let d = step; out.size < count + 1 && d < reach + 200 * step; d += step) {
    for (const v of [clean(correct + d), clean(correct - d)]) {
      if (out.size >= count + 1) break;
      if (v >= min && v <= max) out.add(v);
    }
  }

  return shuffle([...out], rng);
}

/** Deal a flop that is guaranteed to give hero the named draw. */
function dealWithDraw(rng, want) {
  for (let attempt = 0; attempt < 4000; attempt++) {
    const cards = dealRandom(5, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 5);
    const d = draws(hole, board);
    if (want === 'flush' && d.flushDraw && !d.madeStraight) return { hole, board, d };
    if (want === 'oesd' && d.openEnded && !d.flushDraw && d.madeCategory <= CATEGORY.PAIR) return { hole, board, d };
    if (want === 'gutshot' && d.gutshot && !d.flushDraw) return { hole, board, d };
    if (want === 'combo' && d.flushDraw && (d.openEnded || d.gutshot)) return { hole, board, d };
    if (want === 'any' && (d.flushDraw || d.openEnded || d.gutshot)) return { hole, board, d };
  }
  // Fall back to a known-good hand rather than looping forever.
  const hole = parseCards('AcKc');
  const board = parseCards('Qc7d2c');
  return { hole, board, d: draws(hole, board) };
}

/** A villain hand that is currently ahead of hero, for outs drills. */
function dealVillainAhead(rng, hole, board) {
  for (let attempt = 0; attempt < 3000; attempt++) {
    const v = dealRandom(2, [...hole, ...board], rng);
    const h = evaluate([...hole, ...board]);
    const vs = evaluate([...v, ...board]);
    if (vs > h) return v;
  }
  return dealRandom(2, [...hole, ...board], rng);
}

const POT_SIZES = [
  { label: 'a third of the pot', fraction: 1 / 3, display: '33%' },
  { label: 'half the pot', fraction: 0.5, display: '50%' },
  { label: 'two thirds of the pot', fraction: 2 / 3, display: '66%' },
  { label: 'three quarters of the pot', fraction: 0.75, display: '75%' },
  { label: 'the size of the pot', fraction: 1, display: '100%' },
];

/* ------------------------------------------------------------------ *
 * Generators
 * ------------------------------------------------------------------ */

export const GENERATORS = {

  /* ---------------------------------------------------------------- *
   * Reading
   * ---------------------------------------------------------------- */

  /** Read shorthand notation back as words. */
  'read-notation': (rng) => {
    const card = randomInt(rng, 52);
    const r = rankOf(card);
    const s = suitOf(card);
    const suitWords = ['clubs', 'diamonds', 'hearts', 'spades'];
    const rankWords = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];
    const correct = `${rankWords[r]} of ${suitWords[s]}`;
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = `${rankWords[randomInt(rng, 13)]} of ${suitWords[randomInt(rng, 4)]}`;
      if (w !== correct) wrong.add(w);
    }
    const options = shuffle([correct, ...wrong], rng);
    return {
      skill: 'card-notation',
      ...choice(`Which card is written **${cardToString(card)}**?`, options, options.indexOf(correct)),
      explain: [`The first character is the rank and the second is the suit: c is clubs, d is diamonds, h is hearts, s is spades. A ten is written T so that every card is exactly two characters.`],
    };
  },

  /** Which of these two hands wins, and by what. */
  'who-wins': (rng) => {
    const cards = dealRandom(9, [], rng);
    const board = cards.slice(0, 5);
    const a = cards.slice(5, 7);
    const b = cards.slice(7, 9);
    const sa = evaluate([...a, ...board]);
    const sb = evaluate([...b, ...board]);
    const answer = sa > sb ? 0 : sa < sb ? 1 : 2;
    return {
      skill: 'board-reading',
      scenario: { board, showdown: [{ label: 'Player A', cards: a }, { label: 'Player B', cards: b }] },
      ...choice('Who wins this pot?', ['Player A', 'Player B', 'They split it'], answer),
      explain: [
        `Player A has ${describe(sa)}.`,
        `Player B has ${describe(sb)}.`,
        answer === 2
          ? `Identical hands, so the pot is split. Remember: only the best five cards count, and both players are using the same five here.`
          : `${answer === 0 ? 'A' : 'B'} wins. Only the best five cards out of the seven available count.`,
      ],
    };
  },

  /** Name your own hand. Sounds trivial; it is not, under time pressure. */
  'name-your-hand': (rng) => {
    const cards = dealRandom(7, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 7);
    const score = evaluate(cards);
    const correct = CATEGORY_NAMES[categoryOf(score)];
    const wrongPool = CATEGORY_NAMES.filter((n) => n !== correct);
    const options = shuffle([correct, ...shuffle(wrongPool, rng).slice(0, 3)], rng);
    const five = bestFive(cards);
    return {
      skill: 'board-reading',
      scenario: { hole, board },
      ...choice('What is your hand?', options, options.indexOf(correct)),
      explain: [
        `You have ${describe(score)}.`,
        `The five cards that play are ${cardsToString(five.cards)}.`,
        categoryOf(score) === CATEGORY.HIGH_CARD
          ? `Nothing connected. When your two cards miss completely you are playing the board plus a kicker, which is almost never good enough to put money in.`
          : `Say the hand out loud when you look at it. Naming it is what stops you from misreading a straight or missing a flush.`,
      ],
    };
  },

  /** Pick the five cards that actually play out of seven. */
  'best-five': (rng) => {
    const cards = dealRandom(7, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 7);
    const { cards: five, score } = bestFive(cards);
    return {
      skill: 'best-five',
      scenario: { hole, board },
      kind: 'cards',
      prompt: 'Tap the five cards that make your best hand.',
      pool: cards,
      answer: five.slice().sort((a, b) => a - b),
      selectCount: 5,
      explain: [
        `You have ${describe(score)}, made from ${cardsToString(five)}.`,
        five.every((c) => board.includes(c))
          ? `Note that none of your own cards play here. You are playing the board, which means anyone still in the hand at least ties you.`
          : `Everything else is irrelevant. A hand is exactly five cards, no more.`,
      ],
    };
  },

  /** Find the best possible hand anyone could hold. */
  'find-the-nuts': (rng) => {
    const board = dealRandom(5, [], rng);
    const remaining = deckWithout(board);
    let bestScore = -1;
    let bestCombo = null;
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        const s = evaluate([remaining[i], remaining[j], ...board]);
        if (s > bestScore) {
          bestScore = s;
          bestCombo = [remaining[i], remaining[j]];
        }
      }
    }
    const correct = CATEGORY_NAMES[categoryOf(bestScore)];
    const options = shuffle([correct, ...shuffle(CATEGORY_NAMES.filter((n) => n !== correct), rng).slice(0, 3)], rng);
    return {
      skill: 'nuts-reading',
      scenario: { board },
      ...choice('What is the best hand anyone could have on this board?', options, options.indexOf(correct)),
      explain: [
        `The nuts here is ${describe(bestScore)}, held by ${cardsToString(bestCombo)}.`,
        `Ask this on every street. The gap between your hand and the nuts is how much room you have to be wrong.`,
      ],
    };
  },

  /** Classify a flop's texture. */
  'flop-texture': (rng) => {
    const board = dealRandom(3, [], rng);
    const t = boardTexture(board);
    const options = ['dry', 'semi-wet', 'wet'];
    return {
      skill: 'texture',
      scenario: { board },
      ...choice('How would you describe this flop?', options, options.indexOf(t.label)),
      explain: [
        `This flop is ${describeBoard(board)}.`,
        `${t.monotone ? 'Three of a suit means flushes are already possible.' : t.twoTone ? 'Two of a suit means flush draws are live.' : 'Rainbow, so no flush draw is possible yet.'} ${t.connected ? 'The cards are close together, so straights are in play.' : 'The cards are spread out, so straights are unlikely.'}`,
        `Wet boards connect with many hands, so ranges stay wide and pots get big. Dry boards miss almost everything, which is exactly why small bets work so well on them.`,
      ],
    };
  },

  /** Spot every draw you hold. */
  'spot-draws': (rng) => {
    const { hole, board, d } = dealWithDraw(rng, pick(rng, ['flush', 'oesd', 'gutshot', 'combo']));
    const all = ['flush draw', 'open-ended straight draw', 'gutshot', 'backdoor flush draw'];
    const correct = all.filter((label) => (
      (label === 'flush draw' && d.flushDraw)
      || (label === 'open-ended straight draw' && d.openEnded)
      || (label === 'gutshot' && d.gutshot)
      || (label === 'backdoor flush draw' && d.backdoorFlush)
    ));
    return {
      skill: 'draw-spotting',
      scenario: { hole, board },
      kind: 'multi',
      prompt: 'Select every draw you have. There may be more than one.',
      options: all,
      answer: correct.map((c) => all.indexOf(c)).sort((a, b) => a - b),
      explain: [
        `You hold ${d.labels.length ? d.labels.join(' and ') : 'no draw at all'}.`,
        d.flushDraw && d.openEnded
          ? `A flush draw plus an open-ender is a monster: roughly fifteen cards improve you, which is more equity than most made hands have against you.`
          : `Count the specific cards that complete each draw. Naming the draw is only useful because it tells you how many cards you are hoping for.`,
      ].filter(Boolean),
    };
  },

  /* ---------------------------------------------------------------- *
   * The maths, taught by counting
   * ---------------------------------------------------------------- */

  /** How many cards have you not seen? The denominator under everything. */
  'unseen-count': (rng) => {
    const street = pick(rng, ['flop', 'turn']);
    const boardSize = street === 'flop' ? 3 : 4;
    const cards = dealRandom(2 + boardSize, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2);
    const seen = 2 + boardSize;
    const unseen = 52 - seen;
    return {
      skill: 'unseen-cards',
      scenario: { hole, board },
      ...numeric(`How many cards have you **not** seen?`, unseen, { unit: 'cards' }),
      hint: 'Count what you can actually see: your two cards and the board. Everything else is unknown to you.',
      explain: [
        `You can see ${seen} cards: your ${2} plus the ${boardSize} on the board. 52 − ${seen} = ${unseen}.`,
        `The cards in other players' hands count as unseen. You do not know them, so from your point of view they are still in the deck. This trips people up, but it is correct: probability is about your information, not the physical location of the cards.`,
      ],
    };
  },

  /**
   * The core outs chain. Four steps, none of them hard, that together produce
   * a decision most beginners cannot make at all.
   */
  'outs-chain': (rng, params = {}) => {
    const want = params.draw || pick(rng, ['flush', 'oesd', 'combo']);
    const { hole, board } = dealWithDraw(rng, want);
    const villain = dealVillainAhead(rng, hole, board);
    const outs = countOuts(hole, villain, board);
    const naive = naiveOuts(hole, board);
    const unseen = 47;
    const exactNext = outs.outCount / unseen;

    return {
      skill: 'outs-counting',
      scenario: { hole, board, villainCards: villain, revealVillain: true },
      kind: 'steps',
      prompt: 'Your opponent has turned their hand face up. Work out where you stand.',
      steps: [
        choice('Who is ahead right now?', ['You are', 'They are'], outs.aheadNow ? 0 : 1, {
          hint: 'Name both hands out loud before you answer.',
          explain: `You have ${outs.heroDescription}. They have ${outs.villainDescription}.`,
        }),
        numeric('How many cards have you not seen? Your two, their two and the flop are all visible.', unseen, {
          unit: 'cards',
          hint: '52 minus everything on the table.',
          explain: `52 − 2 − 2 − 3 = 47. Their cards are face up in this drill, so they are seen, but the count works out the same as usual on the flop because normally their two unseen cards are still counted as unknown.`,
        }),
        numeric('How many of those cards give you the better hand on the very next card?', outs.outCount, {
          unit: 'outs',
          tolerance: 0,
          hint: 'Go through the draw you have and count the exact cards, then check each one against their hand.',
          explain: [
            `${outs.outCount} cards do it: ${outs.outsText || 'none'}.`,
            naive.count !== outs.outCount
              ? `Counting by eye gives ${naive.count} (${naive.reasons.join(', ')}). The real answer is ${outs.outCount}, because some of those cards improve them more than they improve you. Those are the outs that lose stacks.`
              : `Your instinctive count was right this time: ${naive.reasons.join(', ')}.`,
          ].join(' '),
        }),
        slider('So what percentage of the time do you hit on the next card?', Math.round(exactNext * 100), {
          tolerance: 5,
          hint: `You have ${outs.outCount} good cards out of 47. That is just a fraction.`,
          explain: `${outs.outCount} ÷ 47 = ${pct(exactNext)}. Notice you did not need a formula. You counted the good cards, counted all the cards, and divided.`,
        }),
      ],
      explain: [
        `Every equity question in poker is that same four-step chain: what do I have, what do they have, which cards change that, and what fraction of the deck is that?`,
      ],
    };
  },

  /** Outs to percentage, and the discovery of the shortcut. */
  'outs-to-percent': (rng, params = {}) => {
    const street = params.street || pick(rng, ['flop', 'turn']);
    const outs = 2 + randomInt(rng, 14);
    const r = ruleOfTwoAndFour(outs, street);
    return {
      skill: 'outs-to-equity',
      ...slider(
        street === 'flop'
          ? `You have **${outs} outs** on the flop, and you will see both the turn and the river. Roughly what percentage of the time do you get there?`
          : `You have **${outs} outs** on the turn, with only the river to come. Roughly what percentage of the time do you hit?`,
        Math.round(r.exact * 100),
        { tolerance: 6 },
      ),
      hint: street === 'flop'
        ? 'Two chances at roughly one in five each. Add them, then shade down a little because they overlap.'
        : `${outs} good cards out of the 46 you have not seen.`,
      explain: [
        `The true answer is ${pct(r.exact)}.`,
        street === 'flop'
          ? `The shortcut: multiply your outs by 4 when two cards are coming. ${outs} × 4 = ${outs * 4}%, which is ${Math.abs(r.error) < 0.02 ? 'almost exactly right' : `${round(Math.abs(r.error) * 100, 0)} points high`}.`
          : `The shortcut: multiply your outs by 2 when one card is coming. ${outs} × 2 = ${outs * 2}%.`,
        outs > 8 && street === 'flop'
          ? `With a lot of outs the times-four shortcut overshoots, because the two cards can both be outs and you only need one. Above about 8 outs, subtract a couple of points.`
          : `Use the shortcut at the table and the exact fraction when you study.`,
      ],
    };
  },

  /** Pot odds as a fraction of the final pot. */
  'pot-odds-chain': (rng, params = {}) => {
    const pot = params.pot || pick(rng, [20, 30, 40, 50, 60, 80, 100, 120]);
    const sizing = pick(rng, POT_SIZES);
    const bet = Math.round(pot * sizing.fraction);
    const potBeforeCall = pot + bet;
    const p = potOdds(potBeforeCall, bet);

    return {
      skill: 'pot-odds',
      scenario: { pot, bet, potLabel: `${pot} in the pot`, betLabel: `${bet} to call` },
      kind: 'steps',
      prompt: `There is **${pot}** in the pot. Your opponent bets **${bet}**.`,
      steps: [
        numeric('If you call, how big is the pot you are playing for?', pot + 2 * bet, {
          unit: 'chips',
          hint: 'The pot, plus their bet, plus your call. Add all three.',
          explain: `${pot} + ${bet} + ${bet} = ${pot + bet + bet}. All three amounts, because your own call is part of the pot you win.`,
        }),
        slider('What percentage of that final pot is your own money?', Math.round(p.breakEven * 100), {
          tolerance: 4,
          hint: `Your call is ${bet}. Divide it by the final pot.`,
          explain: `${bet} ÷ ${pot + 2 * bet} = ${pct(p.breakEven)}.`,
        }),
        choice('What does that percentage tell you?', [
          'How often you need to win for calling to break even',
          'How often you will win this hand',
          'How much of the pot you already own',
        ], 0, {
          hint: 'You are putting in that share of the money. What share of the winnings do you need to make that fair?',
          explain: `If you put in ${pct(p.breakEven)} of the final pot, you need to win it at least ${pct(p.breakEven)} of the time to get your money back. That is the whole idea.`,
        }),
      ],
      explain: [
        `A ${sizing.display} bet always offers the same price, whatever the stakes: you need ${pct(p.breakEven)}.`,
        `That is worth knowing cold. It means at the table you can skip the arithmetic entirely and go straight to the only real question: do I win often enough?`,
      ],
    };
  },

  /** The fixed price of standard bet sizes. Pure fluency drilling. */
  'bet-size-price': (rng) => {
    const sizing = pick(rng, POT_SIZES);
    const p = priceOfBet(sizing.fraction);
    const correct = Math.round(p.breakEven * 100);
    const opts = distractors(correct, rng, { count: 3, spread: 0.6, min: 5, max: 60 });
    return {
      skill: 'break-even',
      ...choice(
        `Your opponent bets **${sizing.label}**. What percentage of the time do you need to win for a call to break even?`,
        opts.map((o) => `${o}%`),
        opts.indexOf(correct),
      ),
      hint: 'Imagine the pot is exactly 100. Work out the final pot, then your share of it.',
      explain: [
        `Call ${round(sizing.fraction * 100, 0)} into a pot of 100 and the final pot is ${round(100 + 2 * sizing.fraction * 100, 0)}. Your share is ${round(sizing.fraction * 100, 0)} ÷ ${round(100 + 2 * sizing.fraction * 100, 0)} = ${pct(p.breakEven)}.`,
        `These five numbers are worth committing to memory, not because memorising is good, but because you have now derived them enough times that they are yours: a third-pot bet needs 20%, half needs 25%, two thirds needs 29%, three quarters needs 30%, and a pot-sized bet needs 33%.`,
      ],
    };
  },

  /** The full decision: equity against price. This is the game in miniature. */
  'call-or-fold': (rng, params = {}) => {
    const { hole, board } = dealWithDraw(rng, params.draw || pick(rng, ['flush', 'oesd', 'gutshot', 'combo']));
    const villain = dealVillainAhead(rng, hole, board);
    const outs = countOuts(hole, villain, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [20, 30, 40, 60, 80]);
    const sizing = pick(rng, POT_SIZES);
    const bet = Math.round(pot * sizing.fraction);
    const price = bet / (pot + 2 * bet);
    const shouldCall = eq.equity >= price;
    const ev = evOfCall(eq.equity, pot + bet, bet);

    return {
      skill: 'facing-bets',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      kind: 'steps',
      prompt: `The pot is **${pot}** and they bet **${bet}** on the flop, with two cards still to come. Their hand is face up.`,
      steps: [
        numeric('How many outs do you have?', outs.outCount, {
          unit: 'outs',
          hint: 'Count the cards that put you ahead, and only those.',
          explain: `${outs.outCount}: ${outs.outsText || 'none'}. You have ${outs.heroDescription}; they have ${outs.villainDescription}.`,
        }),
        slider('With both the turn and river to come, what is your equity?', Math.round(eq.equity * 100), {
          tolerance: 7,
          hint: `Roughly four times your outs, shaded down a little if you have a lot of them.`,
          explain: `Exactly ${pct(eq.equity)}, from enumerating all ${eq.trials} possible runouts. The times-four shortcut would have said ${outs.outCount * 4}%.`,
        }),
        slider('What equity do you need to call profitably?', Math.round(price * 100), {
          tolerance: 4,
          hint: `You are paying ${bet} into a final pot of ${pot + 2 * bet}.`,
          explain: `${bet} ÷ ${pot + 2 * bet} = ${pct(price)}.`,
        }),
        choice('So what do you do?', ['Call', 'Fold'], shouldCall ? 0 : 1, {
          hint: 'Compare the two percentages you just worked out. That is the entire decision.',
          explain: shouldCall
            ? `You have ${pct(eq.equity)} and you need ${pct(price)}. Calling makes ${round(ev.ev, 2)} chips on average.`
            : `You have ${pct(eq.equity)} but you need ${pct(price)}. Calling loses ${round(Math.abs(ev.ev), 2)} chips on average. Fold.`,
        }),
      ],
      explain: [
        `Two numbers, one comparison. Everything else in poker is about estimating those two numbers when the opponent's hand is not face up.`,
        !shouldCall && eq.equity > price - 0.08
          ? `This was close. When it is close on raw pot odds, the money you can win on later streets usually decides it, which is the next thing you will learn.`
          : null,
      ].filter(Boolean),
    };
  },

  /** EV in chips, so "correct" stops being abstract. */
  'ev-of-call': (rng) => {
    const pot = pick(rng, [40, 60, 80, 100]);
    const bet = Math.round(pot * pick(rng, [0.5, 0.75, 1]));
    const equityPct = 15 + randomInt(rng, 45);
    const eq = equityPct / 100;
    const result = evOfCall(eq, pot + bet, bet);
    return {
      skill: 'ev-basics',
      kind: 'steps',
      scenario: { pot, bet },
      prompt: `There is **${pot}** in the pot, they bet **${bet}**, and you have worked out you will win **${equityPct}%** of the time.`,
      steps: [
        numeric(`When you win, how much do you collect? (The pot plus their bet.)`, pot + bet, {
          unit: 'chips',
          hint: 'Everything in the middle before your call goes to you.',
          explain: `${pot} + ${bet} = ${pot + bet}.`,
        }),
        numeric(`When you lose, how much does it cost you?`, bet, {
          unit: 'chips',
          hint: 'Only the money you are about to put in. What is already in the pot is not yours to lose.',
          explain: `Just your ${bet} call. The chips you put in earlier are gone whatever you do now, which is why they should never affect this decision.`,
        }),
        numeric(`So what is the average result of calling? Winnings times ${equityPct}%, minus cost times ${100 - equityPct}%.`, round(result.ev, 1), {
          tolerance: 1.5,
          unit: 'chips',
          hint: `${equityPct}% × ${pot + bet} = ${round(eq * (pot + bet), 1)}. Then subtract ${100 - equityPct}% × ${bet}.`,
          explain: result.steps.join(' '),
        }),
      ],
      explain: [
        result.ev > 0
          ? `Calling here makes about ${round(result.ev, 1)} chips every time you do it. You will still lose the hand most of the time, and it is still correct. That gap is the hardest idea in poker to internalise.`
          : `Calling here loses about ${round(Math.abs(result.ev), 1)} chips every time. You will sometimes win the pot, and it was still a mistake.`,
      ],
    };
  },

  /** Results are not decisions. */
  'decision-vs-result': (rng) => {
    const equityPct = 60 + randomInt(rng, 25);
    const lost = rng() < 0.5;
    return {
      skill: 'variance',
      ...choice(
        `You got all the money in with **${equityPct}%** equity, and you ${lost ? 'lost the pot' : 'won the pot'}. How would you rate the decision?`,
        [
          'Good decision, regardless of what happened',
          lost ? 'Bad decision, because it lost' : 'Good decision, because it won',
          'Impossible to say without knowing the result',
        ],
        0,
      ),
      explain: [
        `The decision was good and stays good. With ${equityPct}% equity you make money every single time you get it in, and you still lose ${100 - equityPct} times in a hundred.`,
        lost
          ? `Losing that ${100 - equityPct}% is not a mistake, it is the price of the ${equityPct}%. Judging your play by the result teaches you to avoid the exact spots that make you money.`
          : `Winning does not confirm anything either. Plenty of terrible calls win. If you take the win as proof you were right, you will repeat the bad ones too.`,
        `Judge the decision with the information you had. That is the only standard that improves you.`,
      ],
    };
  },

  /** Combinatorics by counting, not by formula. */
  'combo-count': (rng) => {
    const label = pick(rng, ALL_LABELS);
    const correct = comboCount(label);
    const options = shuffle([...new Set([correct, 4, 6, 12, 16])].slice(0, 4), rng);
    return {
      skill: 'combinatorics',
      ...choice(`How many different ways can a player be dealt **${label}**?`, options.map(String), options.indexOf(correct)),
      hint: label.length === 2
        ? 'There are four of that rank. How many ways can you choose two of them?'
        : label.endsWith('s')
          ? 'They must share a suit. How many suits are there?'
          : 'Four choices for the first card, four for the second, minus the ones that end up suited.',
      explain: [
        describeCombos(label),
        `This matters because it tells you how likely each holding is. Pairs are the rarest shape and offsuit hands the most common, so when you are trying to work out whether they have ace-king or a set, the counting does most of the work for you.`,
      ],
    };
  },

  /** Blockers made concrete. */
  'blocker-count': (rng) => {
    const targetRank = 8 + randomInt(rng, 5);
    const kickerRank = 8 + randomInt(rng, 5);
    if (targetRank === kickerRank) return GENERATORS['blocker-count'](rng);
    const hi = Math.max(targetRank, kickerRank);
    const lo = Math.min(targetRank, kickerRank);
    const label = `${RANKS[hi]}${RANKS[lo]}`;
    const holdOne = makeCard(hi, randomInt(rng, 4));
    const total = 16;
    const remaining = 12;
    return {
      skill: 'blockers',
      scenario: { hole: [holdOne, makeCard(randomInt(rng, 7), randomInt(rng, 4))] },
      ...numeric(
        `Ignoring suits, there are 16 ways to hold **${label}**. You are holding the **${cardToString(holdOne)}**. How many combinations of ${label} can your opponent still have?`,
        remaining,
        { unit: 'combos' },
      ),
      hint: `Only three ${RANKS[hi]}s are left in the deck. Each can pair with any of the four ${RANKS[lo]}s.`,
      explain: [
        `3 × 4 = 12, down from 16. Holding one card of a rank removes a quarter of every hand that uses it.`,
        `That is a blocker. It is the cheapest edge in poker: information you get for free just by looking at your own hand. On a river where you are deciding whether they have the nuts, holding one of the cards they need is often the whole decision.`,
      ],
    };
  },

  /* ---------------------------------------------------------------- *
   * Preflop
   * ---------------------------------------------------------------- */

  /** Why position is worth more than card strength. */
  'position-compare': (rng) => {
    const [a, b] = shuffle(['UTG', 'MP', 'CO', 'BTN'], rng).slice(0, 2);
    const order = ['UTG', 'MP', 'CO', 'BTN'];
    const wider = order.indexOf(a) > order.indexOf(b) ? a : b;
    const options = shuffle([a, b], rng);
    return {
      skill: 'position',
      ...choice(
        `From which seat should you play **more** hands: **${a}** (${POSITION_INFO[a].name}) or **${b}** (${POSITION_INFO[b].name})?`,
        options.map((p) => `${p} — ${POSITION_INFO[p].name}`),
        options.indexOf(wider),
      ),
      hint: 'Count how many players still have to act behind each seat.',
      explain: [
        `${wider}. ${POSITION_INFO[wider].idea}`,
        `${POSITION_INFO[a].seatsBehind === POSITION_INFO[wider].seatsBehind ? '' : `From ${a} there are ${POSITION_INFO[a].seatsBehind} players left to act; from ${b} there are ${POSITION_INFO[b].seatsBehind}.`} Every extra player behind you is another chance that someone wakes up with a better hand.`,
        `Position is not a small edge. The button plays roughly three times as many hands as the first seat, with the same deck.`,
      ],
    };
  },

  /** Open or fold, from a real chart, with the reasoning attached. */
  'open-or-fold': (rng, params = {}) => {
    const position = params.position || pick(rng, ['UTG', 'MP', 'CO', 'BTN']);
    const range = parseRange(RFI[position]);
    const cards = dealRandom(2, [], rng);
    const label = handLabel(cards);
    const inRange = range.has(label);
    return {
      skill: 'rfi',
      scenario: { hole: cards, position, action: 'Everyone folds to you.' },
      ...choice(`You are ${POSITION_INFO[position].name} (${position}). Everyone folds to you. Do you raise or fold?`, ['Raise', 'Fold'], inRange ? 0 : 1),
      hint: POSITION_INFO[position].idea,
      explain: [
        inRange
          ? `${label} is a raise from ${position}.`
          : `${label} is a fold from ${position}.`,
        RFI_REASONING[position],
        !inRange && parseRange(RFI.BTN).has(label)
          ? `Note that ${label} *is* a fine open from the button. The same hand changes from a fold to a raise purely because of where you are sitting. That is how much position matters.`
          : null,
      ].filter(Boolean),
    };
  },

  /** Build a whole opening range on the grid. */
  'build-range': (rng, params = {}) => {
    const position = params.position || pick(rng, ['UTG', 'CO', 'BTN']);
    const range = parseRange(RFI[position]);
    const stats = rangeSize(range);
    return {
      skill: 'range-grid',
      kind: 'grid',
      prompt: `Select every hand you would open from **${position}** (${POSITION_INFO[position].name}).`,
      answer: [...range],
      position,
      tolerance: 14,
      hint: 'Start with the pairs down the diagonal, then the suited aces down the top row, then the big offsuit hands. Work outwards from the top-left corner.',
      explain: [
        `A reasonable ${position} range is about ${round(stats.percent * 100, 0)}% of all hands: ${stats.combos} of the 1326 combinations.`,
        RFI_REASONING[position],
        `Notice the shape, not the exact cells. Pairs run down the diagonal, suited hands sit above it in a triangle, offsuit hands below. Every sensible range is a blob anchored in the top-left corner. If your selection has holes in the middle or stray cells in the bottom-right, something is off.`,
      ],
    };
  },

  /** The big blind discount. */
  'bb-defence': (rng) => {
    const raise = pick(rng, [2.5, 3]);
    const pot = 1 + 0.5 + raise;
    const toCall = raise - 1;
    const price = toCall / (pot + toCall);
    return {
      skill: 'blind-defence',
      kind: 'steps',
      scenario: { pot: round(pot, 1), bet: round(toCall, 1), position: 'BB' },
      prompt: `You are in the big blind. The button raises to **${raise} big blinds** and the small blind folds.`,
      steps: [
        numeric('How much more does it cost you to call?', round(toCall, 1), {
          tolerance: 0.05,
          unit: 'bb',
          hint: 'You already have 1 big blind in the pot. You only need to make up the difference.',
          explain: `${raise} − 1 = ${round(toCall, 1)} big blinds. Your blind is already in the middle, so you are getting a discount nobody else at the table gets.`,
        }),
        slider('What equity do you need to make that call break even?', Math.round(price * 100), {
          tolerance: 5,
          hint: `You pay ${round(toCall, 1)} into a pot that will be ${round(pot + toCall, 1)}.`,
          explain: `${round(toCall, 1)} ÷ ${round(pot + toCall, 1)} = ${pct(price)}. That is a very cheap price.`,
        }),
        choice('What does that imply about how many hands you should defend?', [
          'A lot of them — almost any two cards with some potential',
          'Only strong hands, because you will be out of position',
          'The same range you would open from the button',
        ], 0, {
          hint: `You only need to win ${pct(price)} of the time. What fraction of random hands manage that against a wide button range?`,
          explain: `Needing only ${pct(price)} means you can profitably continue with a huge number of hands. Being out of position pulls that back somewhat, but not nearly as much as most players assume.`,
        }),
      ],
      explain: [
        `Folding the big blind too often is the most common and most expensive leak in amateur poker. Against a button raise you should be continuing with something like 40 to 50% of all hands.`,
        `Being out of position is a real cost and it does mean you play these pots carefully. It does not mean you fold them before the flop when you are being offered ${pct(price)}.`,
      ],
    };
  },

  /* ---------------------------------------------------------------- *
   * Postflop
   * ---------------------------------------------------------------- */

  /** Whose range does this flop favour? */
  'range-advantage': (rng) => {
    const board = dealRandom(3, [], rng);
    const hint = rangeAdvantageHint(board);
    const options = ['The preflop raiser', 'The caller', 'Neither strongly'];
    const answer = hint.favours === 'raiser' ? 0 : hint.favours === 'caller' ? 1 : 2;
    return {
      skill: 'range-advantage',
      scenario: { board, note: 'You raised before the flop, the big blind called.' },
      ...choice('Whose range does this flop favour?', options, answer),
      hint: 'Ask which player is more likely to be holding a pair of the top card.',
      explain: [
        `${hint.why}`,
        `This is the question that decides whether you bet. Whoever the board hits harder gets to apply the pressure; the other player is defending. Bet a lot on the flops that belong to you, and check the ones that do not.`,
      ],
    };
  },

  /** Continuation bet or check, with the reasoning chain exposed. */
  'cbet-decision': (rng) => {
    const board = dealRandom(3, [], rng);
    const hole = dealRandom(2, board, rng);
    const t = boardTexture(board);
    const adv = rangeAdvantageHint(board);
    const d = draws(hole, board);
    const strong = d.madeCategory >= CATEGORY.PAIR;
    const shouldBet = adv.favours === 'raiser' || strong || d.flushDraw || d.openEnded;

    return {
      skill: 'cbet',
      scenario: { hole, board, pot: 6.5, note: 'You raised from the cutoff, the big blind called.' },
      kind: 'steps',
      prompt: 'The big blind checks to you on the flop.',
      steps: [
        choice('First: whose range does this board favour?', ['Yours', 'Theirs', 'Roughly even'], adv.favours === 'raiser' ? 0 : adv.favours === 'caller' ? 1 : 2, {
          hint: 'You raised, so you hold more big cards than they do. Does this flop contain big cards?',
          explain: adv.why,
        }),
        choice('Second: what do you actually have?', [
          'A made hand worth betting for value',
          'A draw that would like to build a pot',
          'Nothing much',
        ], strong ? 0 : (d.flushDraw || d.openEnded) ? 1 : 2, {
          hint: 'Name your hand and any draws before deciding anything.',
          explain: `You have ${d.madeDescription}${d.labels.length ? `, holding ${d.labels.join(' and ')}` : ''}.`,
        }),
        choice('So do you bet or check?', ['Bet', 'Check'], shouldBet ? 0 : 1, {
          hint: 'Bet when the board favours your range, or when you have a hand or draw that wants money in the pot.',
          explain: shouldBet
            ? `Bet. ${strong ? 'You have a real hand and want to build the pot.' : d.flushDraw || d.openEnded ? 'Your draw wins the pot immediately sometimes and improves the rest of the time. That is two ways to win.' : 'The board belongs to your range, so you can bet small and profitably with almost anything.'}`
            : `Check. ${adv.favours === 'caller' ? 'This board hits their range harder than yours, so betting into it just donates chips.' : 'You have neither a hand nor a draw, and no range advantage to lean on.'}`,
        }),
      ],
      explain: [
        `Continuation betting is not a habit, it is a conclusion. Two questions get you there: whose board is this, and what do I have? Beginners bet every flop because they raised preflop. That is a reflex, and observant opponents eat it.`,
      ],
    };
  },

  /** Minimum defence frequency, derived from the bluff maths. */
  'mdf-chain': (rng) => {
    const pot = pick(rng, [20, 40, 60, 100]);
    const sizing = pick(rng, POT_SIZES);
    const bet = Math.round(pot * sizing.fraction);
    const m = minimumDefenceFrequency(pot, bet);
    const bluff = evOfBluff(0.5, pot, bet);
    return {
      skill: 'mdf',
      kind: 'steps',
      scenario: { pot, bet },
      prompt: `There is **${pot}** in the pot and your opponent bets **${bet}**. Look at this from their side of the table first.`,
      steps: [
        slider(`If they were bluffing with nothing, how often would you need to fold for their bluff to break even?`, Math.round((bet / (pot + bet)) * 100), {
          tolerance: 5,
          hint: `They risk ${bet} to win ${pot}. What fraction of the total is their risk?`,
          explain: `${bet} ÷ (${pot} + ${bet}) = ${pct(bet / (pot + bet))}. Fold more often than that and they can bet literally any two cards at a profit.`,
        }),
        slider('So what is the minimum share of your range you must continue with?', Math.round(m.mdf * 100), {
          tolerance: 5,
          hint: 'It is whatever is left over from the last answer.',
          explain: `100% − ${pct(1 - m.mdf)} = ${pct(m.mdf)}. That is minimum defence frequency, and you just derived it rather than memorised it.`,
        }),
        choice('Which of these is the honest way to use that number?', [
          'As a check on whether you are folding far too much overall',
          'As a rule that forces you to call this exact hand',
          'As a reason to call every bet you face',
        ], 0, {
          hint: 'It is a statement about your whole range, not about the two cards you happen to be holding.',
          explain: `MDF is about your range, not your hand. If your hand has no equity and no way to improve, fold it. The number tells you that *some* hands in your range must continue, so if you find yourself folding almost everything, your earlier decisions built a range that cannot defend.`,
        }),
      ],
      explain: [
        `Notice this is the same fraction you have been computing since the pot odds lesson, just read from the other chair. Bluffing maths and defending maths are one piece of arithmetic viewed from two seats.`,
        `Against real opponents, deviate freely. Most amateurs bluff far less than the theory assumes, so folding more than MDF against a passive player is correct and profitable.`,
      ],
    };
  },

  /** Bet sizing chosen for a reason. */
  'sizing-choice': (rng) => {
    const board = dealRandom(3, [], rng);
    const t = boardTexture(board);
    const wet = t.wetness >= 3;
    const options = ['A small bet, around a third of the pot', 'A large bet, around three quarters of the pot', 'Check'];
    const answer = wet ? 1 : 0;
    return {
      skill: 'bet-sizing',
      scenario: { board, pot: 10, note: 'You have top pair, good kicker. They check to you.' },
      ...choice('You have top pair on this flop and want to bet. What size?', options, answer),
      hint: 'Ask what you are protecting against. Are there draws that will get there if you let them in cheaply?',
      explain: [
        `This board is ${describeBoard(board)} — ${t.label}.`,
        wet
          ? `Wet boards mean live draws. A big bet charges them a bad price to chase and builds a pot you will win most of the time. Betting small here lets flush and straight draws in for almost nothing, and they will happily pay it.`
          : `Dry boards mean they have very little. A small bet gets called by worse pairs and the occasional bluff-catcher, and it costs you almost nothing when you are beaten. There are no draws to charge, so charging them is pointless.`,
        `Bet size is a question about the *board*, not about how strong you feel. Strong hands on dry boards should still bet small.`,
      ],
    };
  },

  /** How often does a range actually connect? Antidote to monsters-under-the-bed. */
  'range-hit-rate': (rng) => {
    const board = dealRandom(3, [], rng);
    const range = parseRange(RFI.BTN);
    const breakdown = rangeHitBreakdown(range, board);
    const nothing = breakdown.buckets['nothing'].share;
    const correct = Math.round(nothing * 100);
    const opts = distractors(correct, rng, { count: 3, spread: 0.45, min: 5, max: 95 });
    return {
      skill: 'hand-reading',
      scenario: { board, note: 'Your opponent opened from the button with a normal wide range.' },
      ...choice('What percentage of their range completely misses this flop — no pair, nothing?', opts.map((o) => `${o}%`), opts.indexOf(correct)),
      hint: 'Three cards out of five. Most starting hands are two unpaired cards. How often do two random cards hit a specific three-card flop?',
      explain: [
        `${pct(nothing)} of their range has nothing at all. Top pair or better is only ${pct(breakdown.buckets['top pair'].share + breakdown.buckets['overpair'].share + breakdown.buckets['two pair+'].share)}.`,
        `Beginners assume opponents have hit whenever they bet. The arithmetic says they usually have not. A player who bets every flop is bluffing most of the time by simple necessity — the cards do not cooperate often enough for it to be otherwise.`,
      ],
    };
  },

  /** Estimate equity against a whole range, not one hand. */
  'equity-vs-range': (rng) => {
    const position = pick(rng, ['UTG', 'CO', 'BTN']);
    const range = parseRange(RFI[position]);
    const hole = dealRandom(2, [], rng);
    const r = equityVsRange(hole, range, [], { trials: 4000, seed: randomInt(rng, 1e6) });
    return {
      skill: 'equity-intuition',
      scenario: { hole, note: `They opened from ${position}.` },
      ...slider(
        `An opponent opens from **${position}** with a standard range. Before the flop, what is your equity with ${handLabel(hole)}?`,
        Math.round(r.equity * 100),
        { tolerance: 8 },
      ),
      hint: 'Even the worst hand has roughly a third against a strong range. Even a very strong hand rarely gets past 70%.',
      explain: [
        `About ${pct(r.equity)} against their ${RFI[position]}.`,
        `Preflop equities are compressed. Almost nothing is a huge favourite or a huge dog against a *range*, which is why preflop decisions are usually about playability and position rather than about being ahead right now.`,
      ],
    };
  },

  /** Stack-to-pot ratio and commitment. */
  'spr-plan': (rng) => {
    const pot = pick(rng, [6, 10, 14, 20, 30]);
    const stack = pick(rng, [15, 30, 60, 100, 150]);
    const s = spr(stack, pot);
    const options = ['Low — one pair can go with the stack', 'Medium — you want two pair or better', 'High — keep the pot small without a monster'];
    const answer = s.commitment === 'low' ? 0 : s.commitment === 'medium' ? 1 : 2;
    return {
      skill: 'spr',
      scenario: { pot, stack },
      ...choice(
        `The pot is **${pot}** and the effective stack behind is **${stack}**. How committed are you?`,
        options, answer,
      ),
      hint: 'Divide the stack by the pot. That single number tells you how much hand you need.',
      explain: [
        s.steps.join(' '),
        `Work this out before the flop, not on the river. The size of the pot relative to the stacks decides in advance whether top pair is a hand you can play for everything, and knowing that saves you from the horrible turn decisions that come from finding out too late.`,
      ],
    };
  },

  /** Implied odds: the call that raw pot odds reject. */
  'implied-odds-chain': (rng) => {
    const { hole, board } = dealWithDraw(rng, 'gutshot');
    const villain = dealVillainAhead(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [20, 30, 40]);
    const bet = Math.round(pot * 0.5);
    const price = bet / (pot + 2 * bet);
    const extra = pick(rng, [30, 50, 80]);
    const io = impliedOdds(eq.equity, pot + bet, bet, extra);
    return {
      skill: 'implied-odds',
      kind: 'steps',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      prompt: `Pot **${pot}**, they bet **${bet}**. You have a weak draw, and they have a big stack behind and a habit of paying people off.`,
      steps: [
        slider('What equity do you need on raw pot odds?', Math.round(price * 100), {
          tolerance: 4,
          hint: `${bet} into a final pot of ${pot + 2 * bet}.`,
          explain: `${pct(price)}.`,
        }),
        slider('What equity do you actually have?', Math.round(eq.equity * 100), {
          tolerance: 6,
          hint: 'A gutshot is four outs, with two cards to come.',
          explain: `${pct(eq.equity)}. On raw pot odds alone this is ${eq.equity >= price ? 'just about a call' : 'a fold'}.`,
        }),
        choice(`If you expect to win about ${extra} more from them on later streets when you hit, does that change the answer?`, ['Yes, it becomes a call', 'No, still a fold'], io.profitable ? 0 : 1, {
          hint: `Add the money you expect to win later to the pot, then recalculate the price.`,
          explain: io.steps.join(' '),
        }),
      ],
      explain: [
        `Implied odds are real but they are also where wishful thinking lives. The extra money only exists if three things are true: they have a big stack, they have a hand strong enough to pay you, and your draw is disguised enough that they will.`,
        `Against a short stack, or when your draw is obvious (a third heart arriving), implied odds are close to zero. Do not use them as a licence to call everything.`,
      ],
    };
  },

  /** River value betting: the money nobody collects. */
  'river-value': (rng) => {
    const cards = dealRandom(7, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 7);
    const score = evaluate(cards);
    const cat = categoryOf(score);
    const worthValue = cat >= CATEGORY.PAIR;
    return {
      skill: 'river-value',
      scenario: { hole, board, pot: 30, note: 'They check to you on the river.' },
      ...choice('They check to you on the river. Do you bet for value?', ['Bet', 'Check behind'], worthValue ? 0 : 1),
      hint: 'The only question that matters: can a worse hand call you?',
      explain: [
        `You have ${describe(score)}.`,
        worthValue
          ? `Bet. The test for a value bet is not "am I strong?" but "will a worse hand pay me?" If they can call with something weaker, you are leaving money behind by checking.`
          : `Check. With no pair you cannot be called by worse, so a bet can only be a bluff. If you want to bluff, that is a different decision with different reasoning, but do not bet this hoping it is good.`,
        `Most players lose more money by checking good hands on the river than by any other single mistake. It feels safe. It is not free.`,
      ],
    };
  },

  /** Choosing the right bluff: blockers over "worst hand". */
  'bluff-selection': (rng) => {
    const board = parseCards(pick(rng, ['AhKd7c2s9h', 'QsJh4d8c2h', 'Kh9s5c3d2h']));
    const nutSuit = suitOf(board[0]);
    const blocker = makeCard(12, nutSuit);
    const options = [
      { label: 'A hand that blocks their strongest calls', good: true },
      { label: 'The very worst hand in your range', good: false },
      { label: 'A hand with some showdown value', good: false },
    ];
    return {
      skill: 'river-bluff',
      scenario: { board },
      ...choice('You have decided to bluff the river. Which hand should you pick?', options.map((o) => o.label), 0),
      hint: 'Think about which cards you would least like them to hold.',
      explain: [
        `Pick the hand that blocks their calls. If holding a card makes it less likely they have the hand that would call you, your bluff succeeds more often for free.`,
        `The worst hand in your range is a tempting answer and it is wrong. Its only virtue is that it cannot win at showdown, but that says nothing about whether *they* will fold. Blockers say something about them, which is what you actually need.`,
        `Hands with showdown value should almost never bluff. Turning a hand that might win into a bluff means you can only be called by something better. You give up two ways to win in exchange for one.`,
      ],
    };
  },

  /** Narrow a range by their actions. Hand reading as subtraction. */
  'narrow-range': (rng) => {
    const position = pick(rng, ['UTG', 'CO']);
    const opening = parseRange(RFI[position]);
    const openStats = rangeSize(opening);
    const threeBet = parseRange('QQ+, AKs, AKo');
    const tbStats = rangeSize(threeBet);
    const options = [
      `About ${round(tbStats.percent * 100, 0)}% of hands`,
      `About ${round(openStats.percent * 100, 0)}% of hands`,
      'Any two cards',
    ];
    return {
      skill: 'hand-reading',
      scenario: { position, action: `They open from ${position}, you 3-bet, and they 4-bet.` },
      ...choice('After all that, how wide is their range?', options, 0),
      hint: 'Each aggressive action removes hands. Start with their opening range and subtract everything that would not take the next action.',
      explain: [
        `They opened ${round(openStats.percent * 100, 0)}% of hands, then took the strongest line available twice. A 4-bet range is tiny: roughly ${round(tbStats.percent * 100, 0)}% of all hands.`,
        `Hand reading is subtraction, done one street at a time. Start with what they would play from that seat, then remove everything that would have folded, called, or checked instead of doing what they just did. What survives is their range.`,
        `The discipline is to keep the range as a *set of hands*, not to collapse it into one guess. "They have aces" is almost always wrong. "They have queens, kings, aces or ace-king" is usually right, and it is far more useful.`,
      ],
    };
  },

  /** Recognise a player type from a stat line. */
  'player-type': (rng) => {
    const types = [
      { name: 'Calling station', vpip: 55, pfr: 8, af: 0.7, exploit: 'Value bet relentlessly and never bluff. They call too much, so give them hands to call with.' },
      { name: 'Nit', vpip: 12, pfr: 9, af: 2.5, exploit: 'Steal their blinds constantly and fold when they show real aggression. They only play strong hands, so believe them.' },
      { name: 'Maniac', vpip: 60, pfr: 45, af: 5, exploit: 'Let them bluff into you. Widen your calling range and stop trying to bluff someone who never folds.' },
      { name: 'Solid regular', vpip: 24, pfr: 20, af: 2.5, exploit: 'Play straightforwardly and look for a softer table. There is little edge here.' },
    ];
    const t = pick(rng, types);
    const options = shuffle(types.map((x) => x.name), rng);
    return {
      skill: 'player-types',
      scenario: { stats: { VPIP: `${t.vpip}%`, PFR: `${t.pfr}%`, 'Aggression': t.af } },
      ...choice(
        `A player has these numbers over a few hundred hands: they enter **${t.vpip}%** of pots, raise **${t.pfr}%**, and have an aggression factor of **${t.af}**. What are they?`,
        options, options.indexOf(t.name),
      ),
      hint: 'The gap between how often they play and how often they raise tells you almost everything.',
      explain: [
        `That is a ${t.name.toLowerCase()}.`,
        t.exploit,
        `The two numbers to internalise: how often they play a hand, and how often they raise when they do. A big gap between them means a passive caller. A small gap at a high number means an aggressive player. A small gap at a low number means someone who only plays good hands.`,
      ],
    };
  },

  /** Bankroll, framed as survival rather than arithmetic. */
  'bankroll-check': (rng) => {
    const stake = pick(rng, [
      { name: '1c/2c', buyin: 2 },
      { name: '5c/10c', buyin: 10 },
      { name: '25c/50c', buyin: 50 },
    ]);
    const buyins = pick(rng, [5, 20, 50]);
    const roll = stake.buyin * buyins;
    const safe = buyins >= 30;
    return {
      skill: 'bankroll',
      ...choice(
        `You have **$${roll}** and you are playing $${stake.name} cash, where a full buy-in is $${stake.buyin}. Is that a sensible bankroll?`,
        ['Yes, comfortably', 'It is thin but survivable', 'No, you are likely to go broke'],
        buyins >= 30 ? 0 : buyins >= 15 ? 1 : 2,
      ),
      hint: 'Count how many full buy-ins you have. The usual guidance for cash games is at least 30, and more if you are still learning.',
      explain: [
        `$${roll} is ${buyins} buy-ins at this stake.`,
        safe
          ? `That is a healthy cushion. With 30 or more buy-ins a normal losing stretch will not take you out of the game.`
          : `That is not enough. With ${buyins} buy-ins, an entirely ordinary downswing bankrupts you even if you are playing well.`,
        `Bankroll rules are not about being careful with money. They are about staying in the game long enough for your edge to show up. A winning player with too small a bankroll goes broke; the edge was real and the sample was too short.`,
      ],
    };
  },

  /** Tilt recognition. */
  'tilt-check': (rng) => {
    const scenarios = [
      { text: 'You just lost a big pot when your aces were cracked by a hand they should never have played. You feel a strong urge to play the next hand aggressively no matter what you are dealt.', answer: 0 },
      { text: 'You have been card dead for an hour and are getting bored. You start opening hands you would normally fold, just to get involved.', answer: 0 },
      { text: 'You lost a pot, thought about it for a moment, decided your play was fine, and moved on to the next hand.', answer: 1 },
      { text: 'You are up a lot and start playing much looser because "you are playing with their money now".', answer: 0 },
    ];
    const s = pick(rng, scenarios);
    return {
      skill: 'tilt',
      ...choice(`${s.text}\n\nIs this tilt?`, ['Yes', 'No'], s.answer),
      explain: [
        s.answer === 0
          ? `Yes. Tilt is any state where your emotions, not your reasoning, are choosing your actions. It does not have to feel like anger — boredom and overconfidence are tilt too, and they are harder to notice.`
          : `No. Losing a pot and feeling nothing much is just poker. The test is not whether you lost, it is whether the loss is now driving your decisions.`,
        `The practical skill is not "never tilt". It is noticing tilt within a few hands and having a rule you follow automatically: stand up, walk away for ten minutes, and come back. Decide the rule now, while you are calm, because you will not decide it well later.`,
      ],
    };
  },
};

/* ------------------------------------------------------------------ *
 * Generation and grading
 * ------------------------------------------------------------------ */

/** Build one exercise from a generator id and a seed. */
export function generate(generatorId, seed, params = {}) {
  const gen = GENERATORS[generatorId];
  if (!gen) throw new Error(`Unknown exercise generator: ${generatorId}`);
  const rng = makeRng(seed);
  const ex = gen(rng, params);
  return {
    id: `${generatorId}:${seed}`,
    generator: generatorId,
    seed,
    kind: ex.kind || 'choice',
    ...ex,
    explain: Array.isArray(ex.explain) ? ex.explain : ex.explain ? [ex.explain] : [],
  };
}

/** All generator ids that train a given skill. */
export function generatorsForSkill(skillId) {
  return Object.entries(GENERATORS)
    .filter(([id]) => {
      try {
        return generate(id, 1).skill === skillId;
      } catch {
        return false;
      }
    })
    .map(([id]) => id);
}

/**
 * Grade a response.
 * `item` is either a whole exercise or a single step from a step chain.
 */
export function grade(item, response) {
  switch (item.kind) {
    case 'choice':
      return { correct: response === item.answer };

    case 'multi': {
      const given = [...(response || [])].sort((a, b) => a - b);
      const want = [...item.answer].sort((a, b) => a - b);
      return { correct: given.length === want.length && given.every((v, i) => v === want[i]) };
    }

    case 'numeric':
    case 'slider': {
      const value = Number(response);
      if (Number.isNaN(value)) return { correct: false };
      const tol = item.tolerance ?? 0;
      const off = Math.abs(value - item.answer);
      return {
        correct: off <= tol,
        close: off <= tol * 2,
        off,
      };
    }

    case 'cards': {
      const given = [...(response || [])].sort((a, b) => a - b);
      const want = [...item.answer].sort((a, b) => a - b);
      return { correct: given.length === want.length && given.every((v, i) => v === want[i]) };
    }

    case 'grid': {
      const given = new Set(response || []);
      const want = new Set(item.answer);
      let missing = 0;
      let extra = 0;
      for (const l of want) if (!given.has(l)) missing++;
      for (const l of given) if (!want.has(l)) extra++;
      const errors = missing + extra;
      return {
        correct: errors <= (item.tolerance ?? 0),
        missing,
        extra,
        errors,
      };
    }

    case 'steps': {
      // A chain is graded step by step in the UI; this path scores a whole
      // submitted array at once, which the review queue uses.
      const perStep = item.steps.map((s, i) => grade(s, response?.[i]));
      return {
        correct: perStep.every((r) => r.correct),
        perStep,
        score: perStep.filter((r) => r.correct).length / perStep.length,
      };
    }

    default:
      return { correct: false };
  }
}

/** Number of gradeable questions in an exercise, for session length estimates. */
export function questionCount(exercise) {
  return exercise.kind === 'steps' ? exercise.steps.length : 1;
}
