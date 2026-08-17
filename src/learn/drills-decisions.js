/**
 * The decision drills: bet, check, call, raise, fold — and how much.
 *
 * This is the centre of the course. Every drill here ends in an action and a
 * number of chips, because that is what a decision is. The learner is never
 * asked "what would you do?" as a matter of taste; they are asked to work out
 * which action is worth the most, and then told by how much.
 *
 * A deliberate constraint runs through all of it: cash games, 6 to 10 players,
 * 100 big blinds. No tournament situations, no short stacks, no ICM. Narrowing
 * the world means every drill is a spot the learner will actually face.
 *
 * The fold frequencies villains are given are stated to the learner rather than
 * hidden, because the honest lesson is that EV depends on a read, and the skill
 * is knowing how much the answer moves when the read changes.
 */

import {
  cardToString, cardsToString, dealRandom, deckWithout, makeRng, parseCards,
  pick, randomInt, rankOf, shuffle,
} from '../engine/cards.js';
import { CATEGORY, categoryOf, describe, evaluate } from '../engine/evaluator.js';
import { exactEquity, monteCarloEquity } from '../engine/equity.js';
import { pct, potOdds, round } from '../engine/odds.js';
import {
  bluffBreakEven, compareActions, evOfBet, evOfCall, evOfCheck, evOfFold,
  evOfRaise, foldModel, realisedEquity, sizingLadder,
} from '../engine/decisions.js';
import { boardTexture, countOuts, describeBoard, draws, rangeAdvantageHint } from '../engine/board.js';
import { equityVsRange, handLabel, parseRange, rangeSize } from '../engine/ranges.js';
import {
  FULL_RING_RFI, POSITION_INFO, RFI, TABLE_SIZES, openSizeFor, openingRange, seatsFor,
} from '../engine/preflop.js';

/* ------------------------------------------------------------------ *
 * Builders
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

/** Cash-game pot sizes in big blinds, at 100bb stacks. */
const POTS = [6, 8, 10, 12, 15, 18, 20, 24, 30, 36, 44];
const SIZINGS = [
  { label: 'a third of the pot', fraction: 1 / 3 },
  { label: 'half the pot', fraction: 0.5 },
  { label: 'two thirds of the pot', fraction: 2 / 3 },
  { label: 'three quarters of the pot', fraction: 0.75 },
  { label: 'the full pot', fraction: 1 },
];

/** A flop scenario where hero holds something specific. */
function dealSpot(rng, want = 'any') {
  for (let attempt = 0; attempt < 3000; attempt++) {
    const cards = dealRandom(5, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 5);
    const d = draws(hole, board);
    const made = d.madeCategory;

    if (want === 'draw' && (d.flushDraw || d.openEnded)) return { hole, board, d };
    if (want === 'strong' && made >= CATEGORY.TWO_PAIR) return { hole, board, d };
    if (want === 'pair' && made === CATEGORY.PAIR) return { hole, board, d };
    if (want === 'air' && made === CATEGORY.HIGH_CARD && !d.flushDraw && !d.openEnded) return { hole, board, d };
    if (want === 'any') return { hole, board, d };
  }
  const hole = parseCards('AcKc');
  const board = parseCards('Qc7d2h');
  return { hole, board, d: draws(hole, board) };
}

/** A villain hand consistent with them having bet. */
function dealVillain(rng, hole, board) {
  return dealRandom(2, [...hole, ...board], rng);
}

/** Round to a chip amount that is pleasant to do arithmetic with. */
const chips = (v) => Math.max(1, Math.round(v * 2) / 2);

/* ------------------------------------------------------------------ *
 * Generators
 * ------------------------------------------------------------------ */

export const DECISION_GENERATORS = {

  /* ---------------- Foundations of EV ---------------- */

  /** The zero that every other action is measured against. */
  'ev-of-folding': (rng) => {
    const pot = pick(rng, POTS);
    const invested = chips(pot * pick(rng, [0.3, 0.4, 0.5]));
    return {
      skill: 'ev-basics',
      scenario: { pot, note: `You have already put ${invested} big blinds into this pot.` },
      ...choice(
        `You have already invested **${invested}bb** in this pot. If you fold right now, what is that fold worth to you?`,
        ['Exactly 0', `−${invested}bb, because you lose what you put in`, 'It depends on your hand'],
        0,
      ),
      hint: 'Ask what changes between the moment before you fold and the moment after.',
      explain: [
        'Folding is worth exactly zero. Always.',
        `The ${invested}bb you already put in stopped being yours the moment it went in. It is in the pot, and it is going to whoever wins — folding does not lose it, because you had already lost it.`,
        'This sounds like a technicality and it is the most useful single idea in poker maths. It means every decision is only about the chips still in front of you, and "I have too much invested to fold now" is never a reason.',
      ],
    };
  },

  /** EV of calling, computed step by step in chips. */
  'ev-call-chain': (rng) => {
    const { hole, board } = dealSpot(rng, pick(rng, ['draw', 'pair']));
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, POTS);
    const bet = chips(pot * pick(rng, [0.5, 0.66, 0.75]));
    const call = evOfCall(pot, bet, eq.equity);
    const price = bet / (pot + 2 * bet);

    return {
      skill: 'ev-basics',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      kind: 'steps',
      prompt: `Pot is **${pot}bb**, they bet **${bet}bb**. Their hand is face up, so equity is not a guess here — the job is to turn it into chips.`,
      steps: [
        slider('What is your equity — how often do you win this pot?', Math.round(eq.equity * 100), {
          tolerance: 7,
          hint: 'Count the cards that get you there, out of the cards you have not seen.',
          explain: `Exactly ${pct(eq.equity)}, from enumerating all ${eq.trials} runouts.`,
        }),
        numeric(`If you call and win, how many chips do you collect? (The pot plus their bet.)`, pot + bet, {
          unit: 'bb',
          hint: 'Everything in the middle before your call.',
          explain: `${pot} + ${bet} = ${pot + bet}bb.`,
        }),
        numeric(`So what is calling worth on average, in chips?`, round(call.ev, 1), {
          tolerance: 1.2,
          unit: 'bb',
          hint: `${pct(eq.equity)} of ${pot + bet} won, minus ${pct(1 - eq.equity)} of ${bet} lost.`,
          explain: call.steps.join(' '),
        }),
        choice('So what do you do?', ['Call', 'Fold'], call.ev > 0 ? 0 : 1, {
          hint: 'Folding is worth 0. Is calling worth more or less than that?',
          explain: call.ev > 0
            ? `Calling is worth ${round(call.ev, 2)}bb and folding is worth 0, so you call. You will still lose this hand ${pct(1 - eq.equity)} of the time — that is not a mistake, it is the price of the times you win.`
            : `Calling is worth ${round(call.ev, 2)}bb, which is worse than the 0 you get for folding. Fold.`,
        }),
      ],
      explain: [
        `You needed ${pct(price)} to break even and you had ${pct(eq.equity)}.`,
        'Every call you will ever face is this exact calculation. The only thing that changes at a real table is that you have to estimate the equity instead of being handed it.',
      ],
    };
  },

  /* ---------------- Bet or check ---------------- */

  /** The first real "should I put money in?" decision, priced both ways. */
  'bet-or-check-ev': (rng) => {
    const want = pick(rng, ['strong', 'draw', 'pair']);
    const { hole, board, d } = dealSpot(rng, want);
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, POTS);
    const sizing = pick(rng, SIZINGS.slice(1, 4));
    const bet = chips(pot * sizing.fraction);
    const folds = foldModel()(sizing.fraction);

    const betting = evOfBet(pot, bet, folds, eq.equity);
    const checking = evOfCheck(pot, eq.equity);
    const result = compareActions([betting, checking]);
    const shouldBet = result.best.action === 'bet';

    return {
      skill: 'bet-decision',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot },
      kind: 'steps',
      prompt: `Pot is **${pot}bb** and they check to you. You are considering betting **${bet}bb**. Assume they fold about **${Math.round(folds * 100)}%** of the time to that bet.`,
      steps: [
        slider('If they call, how often do you win?', Math.round(eq.equity * 100), {
          tolerance: 8,
          hint: `You have ${d.madeDescription}.`,
          explain: `${pct(eq.equity)} against their actual hand.`,
        }),
        numeric(`How much do you win in the ${Math.round(folds * 100)}% of cases where they just fold?`, pot, {
          unit: 'bb',
          tolerance: 0.6,
          hint: 'Whatever is already in the middle.',
          explain: `The ${pot}bb pot, without a showdown. This is the half of betting that checking cannot give you.`,
        }),
        choice('So which is worth more, betting or checking?', ['Betting', 'Checking'], shouldBet ? 0 : 1, {
          hint: 'Betting wins two ways: they fold, or they call and you still win. Checking only wins one way.',
          explain: `Betting is worth ${round(betting.ev, 2)}bb; checking is worth ${round(checking.ev, 2)}bb. ${result.verdict}`,
        }),
      ],
      explain: [
        ...betting.steps.slice(0, 4),
        result.guidance,
        shouldBet
          ? 'Betting has two separate sources of profit — the times they fold, and the times they call and lose. Beginners only ever count the second one, which is why they check far too much.'
          : 'Here the hand is not strong enough to want a call, and not weak enough to need the fold. Checking keeps the pot small and keeps their bluffs in.',
      ],
    };
  },

  /** Value betting: the only question that matters. */
  'can-worse-call': (rng) => {
    const cards = dealRandom(7, [], rng);
    const hole = cards.slice(0, 2);
    const board = cards.slice(2, 7);
    const score = evaluate(cards);
    const cat = categoryOf(score);
    const pot = pick(rng, POTS);
    const worthValue = cat >= CATEGORY.PAIR;

    return {
      skill: 'value-betting',
      scenario: { hole, board, pot, note: 'River. They check to you.' },
      ...choice(
        `River, pot **${pot}bb**, they check. Should you bet for value?`,
        ['Bet — a worse hand can call', 'Check — nothing worse calls'],
        worthValue ? 0 : 1,
      ),
      hint: 'Not "am I strong?" but "will something worse than me put money in?"',
      explain: [
        `You have ${describe(score)}.`,
        worthValue
          ? 'Bet. The test for a value bet is whether a worse hand can call, not whether you feel strong. If you can name two worse hands that would call, betting makes money.'
          : 'Check. With no pair, nothing worse than you is calling, so a bet can only be a bluff — a different decision with different maths. Betting here just loses money when called.',
        'Checking good hands on the river costs more, over a year, than any bluff you will ever get caught making. It feels safe, which is exactly why it goes unnoticed.',
      ],
    };
  },

  /* ---------------- Bluffing ---------------- */

  /** The break-even fold frequency: the whole of bluffing in one number. */
  'bluff-break-even': (rng) => {
    const pot = pick(rng, POTS);
    const sizing = pick(rng, SIZINGS);
    const bet = chips(pot * sizing.fraction);
    const b = bluffBreakEven(pot, bet);

    return {
      skill: 'bluffing',
      scenario: { pot, note: 'You have nothing. You are considering a bluff.' },
      kind: 'steps',
      prompt: `Pot is **${pot}bb**. You have nothing at all, and you are thinking about bluffing **${bet}bb**.`,
      steps: [
        numeric('If they fold, how much do you win?', pot, {
          unit: 'bb',
          tolerance: 0.6,
          hint: 'The pot, as it stands.',
          explain: `${pot}bb.`,
        }),
        numeric('If they call, how much do you lose?', bet, {
          unit: 'bb',
          tolerance: 0.6,
          hint: 'Your bluff, and nothing else — you have no equity.',
          explain: `Your ${bet}bb. With no hand you never win when called.`,
        }),
        slider('So how often do they need to fold for this to break even?', Math.round(b.breakEven * 100), {
          tolerance: 5,
          hint: `Your risk, ${bet}, as a share of the total ${pot} + ${bet}.`,
          explain: b.steps.join(' '),
        }),
      ],
      explain: [
        `A ${Math.round(sizing.fraction * 100)}%-pot bluff needs to work ${pct(b.breakEven)} of the time.`,
        'This is the whole of bluffing. Bigger bluffs need to work more often — which is why bluffing huge with nothing is usually worse than bluffing small, not better.',
        'At the table the question becomes: can I name enough hands they will fold? If not, do not bluff.',
      ],
    };
  },

  /** Semi-bluffing: the drill that shows two ways to win beating one. */
  'semibluff-ev': (rng) => {
    const { hole, board, d } = dealSpot(rng, 'draw');
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, POTS);
    const bet = chips(pot * 0.66);
    const folds = foldModel()(0.66);

    const betting = evOfBet(pot, bet, folds, eq.equity);
    const checking = evOfCheck(pot, eq.equity);
    const better = betting.ev > checking.ev;

    return {
      skill: 'semi-bluffing',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot },
      kind: 'steps',
      prompt: `You have ${d.labels.join(' and ') || 'a draw'}. Pot **${pot}bb**, they check. You could bet **${bet}bb**, and they fold about **${Math.round(folds * 100)}%** of the time.`,
      steps: [
        slider('If they call, how often do you end up winning?', Math.round(eq.equity * 100), {
          tolerance: 8,
          hint: 'Count the cards that complete your draw.',
          explain: `${pct(eq.equity)}. A draw is not nothing — it is a real share of the pot.`,
        }),
        choice('Betting a draw wins the pot in how many different ways?', [
          'Two — they fold, or they call and you hit',
          'One — you have to hit',
        ], 0, {
          hint: 'What happens when they fold to your bet?',
          explain: 'Two. That is the entire reason aggression with draws beats passivity with the same cards.',
        }),
        choice('So is betting or checking worth more here?', ['Betting', 'Checking'], better ? 0 : 1, {
          hint: 'Add the fold profit to the showdown profit.',
          explain: `Betting ${round(betting.ev, 2)}bb versus checking ${round(checking.ev, 2)}bb.`,
        }),
      ],
      explain: [
        `Betting: ${round(betting.foldEquity, 2)}bb from the times they fold, plus ${round(betting.showdownValue, 2)}bb from the times they call and you get there. Total ${round(betting.ev, 2)}bb.`,
        `Checking: ${round(checking.ev, 2)}bb, from hitting alone.`,
        'And this understates the case. The model stops after this street — in a real hand you also win more on the turn and river when you hit, which makes betting draws better still.',
      ],
    };
  },

  /* ---------------- How much ---------------- */

  /** The sizing question, answered by comparing EV across a ladder of sizes. */
  'choose-bet-size': (rng) => {
    const want = pick(rng, ['strong', 'draw', 'air']);
    const { hole, board, d } = dealSpot(rng, want);
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [8, 10, 12, 16, 20]);
    const sticky = rng() < 0.5;
    const ladder = sizingLadder(pot, [1 / 3, 0.5, 0.75, 1], foldModel({ stickiness: sticky ? 0.9 : 0.3 }), eq.equity);

    const options = ladder.options.map((o) => o.label);
    const answer = ladder.options.indexOf(ladder.best);

    return {
      skill: 'bet-sizing',
      scenario: {
        hole, board, pot,
        note: sticky
          ? 'These opponents call far too much and rarely fold.'
          : 'These opponents are fairly tight and give up when they miss.',
      },
      ...choice(
        `Pot **${pot}bb**, they check to you. Which size makes the most money?`,
        options, answer,
      ),
      hint: sticky
        ? 'Against players who will not fold, fold equity is nearly worthless. What is left?'
        : 'Bigger bets fold out more hands — but you also risk more when they do not fold.',
      explain: [
        `You have ${d.madeDescription} with ${pct(eq.equity)} equity.`,
        ...ladder.options.map((o) => `${o.label}: they fold ${pct(o.foldFrequency)}, EV ${round(o.ev, 2)}bb.`),
        ladder.verdict,
        sticky
          ? 'Against players who do not fold, sizing is decided almost entirely by your equity: bet big with strong hands, do not bluff at all.'
          : 'Against players who do fold, small bets often beat large ones, because you get most of the folds for a third of the risk.',
        ladder.guidance,
      ],
    };
  },

  /** How much to raise, and why bigger is not automatically better. */
  'raise-sizing': (rng) => {
    const { hole, board, d } = dealSpot(rng, pick(rng, ['strong', 'draw']));
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [8, 10, 12, 16]);
    const bet = chips(pot * 0.5);

    // Standard raise sizes: about 3x their bet in position, 4x out of position.
    const candidates = [2, 3, 4].map((multiple) => {
      const raiseTo = chips(bet * multiple);
      const folds = foldModel()(raiseTo / (pot + bet));
      const r = evOfRaise(pot, bet, raiseTo, folds, eq.equity);
      return { ...r, multiple, folds, label: `Raise to ${raiseTo}bb (${multiple}× their bet)` };
    });
    const withCall = [...candidates, evOfCall(pot, bet, eq.equity), evOfFold()];
    const result = compareActions(withCall);
    const options = withCall.map((o) => o.label);

    return {
      skill: 'raise-sizing',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      ...choice(
        `Pot **${pot}bb**, they bet **${bet}bb**. What is your best action, and at what size?`,
        options, withCall.indexOf(result.best),
      ),
      hint: 'A raise wins the pot now when they fold, and builds a bigger pot when they call and you are ahead. Both parts depend on the size.',
      explain: [
        `You have ${d.madeDescription} with ${pct(eq.equity)} equity against their hand.`,
        ...withCall.map((o) => `${o.label}: ${round(o.ev, 2)}bb.`),
        result.verdict,
        'The standard raise is about three times their bet in position and four times out of position. Not because it is traditional — because it is roughly where fold equity stops being worth the extra risk.',
        result.guidance,
      ],
    };
  },

  /* ---------------- The full decision ---------------- */

  /** Fold, call, or raise — all three priced, all three compared. */
  'fold-call-raise': (rng) => {
    const { hole, board, d } = dealSpot(rng, pick(rng, ['draw', 'pair', 'strong', 'air']));
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [8, 10, 12, 16, 20]);
    const bet = chips(pot * pick(rng, [0.5, 0.66, 0.75]));
    const raiseTo = chips(bet * 3);
    const folds = foldModel()(raiseTo / (pot + bet));

    const actions = [
      evOfFold(),
      evOfCall(pot, bet, eq.equity),
      evOfRaise(pot, bet, raiseTo, folds, eq.equity),
    ];
    const result = compareActions(actions);

    return {
      skill: 'decision-making',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      kind: 'steps',
      prompt: `Pot **${pot}bb**, they bet **${bet}bb**. Three options: fold, call, or raise to **${raiseTo}bb** (they would fold about **${Math.round(folds * 100)}%** to the raise).`,
      steps: [
        slider('First, your equity against their hand.', Math.round(eq.equity * 100), {
          tolerance: 8,
          hint: `You have ${d.madeDescription}.`,
          explain: `${pct(eq.equity)}.`,
        }),
        numeric('What is folding worth?', 0, {
          unit: 'bb',
          hint: 'This one is not a trick.',
          explain: 'Zero, always. It is the line the other two have to beat.',
        }),
        numeric('What is calling worth?', round(actions[1].ev, 1), {
          tolerance: 1.5,
          unit: 'bb',
          hint: `Win ${pot + bet} at ${pct(eq.equity)}, lose ${bet} the rest of the time.`,
          explain: actions[1].steps.join(' '),
        }),
        choice('So what is your play?', ['Fold', 'Call', `Raise to ${raiseTo}bb`], actions.indexOf(result.best), {
          hint: 'Three numbers. Pick the biggest.',
          explain: `Fold ${round(actions[0].ev, 2)}bb, call ${round(actions[1].ev, 2)}bb, raise ${round(actions[2].ev, 2)}bb. ${result.verdict}`,
        }),
      ],
      explain: [
        result.guidance,
        'This is the shape of every decision in poker: price each option in chips, take the biggest. Everything else in this course is about estimating those numbers faster.',
      ],
    };
  },

  /** Same hand, two lines: why raising and calling are not interchangeable. */
  'raise-or-call': (rng) => {
    const { hole, board, d } = dealSpot(rng, pick(rng, ['draw', 'strong']));
    const villain = dealVillain(rng, hole, board);
    const eq = exactEquity(hole, villain, board);
    const pot = pick(rng, [10, 12, 16, 20]);
    const bet = chips(pot * 0.5);
    const raiseTo = chips(bet * 3);
    const folds = foldModel()(raiseTo / (pot + bet));

    const call = evOfCall(pot, bet, eq.equity);
    const raise = evOfRaise(pot, bet, raiseTo, folds, eq.equity);
    const result = compareActions([call, raise]);

    return {
      skill: 'raise-decision',
      scenario: { hole, board, villainCards: villain, revealVillain: true, pot, bet },
      ...choice(
        `Pot **${pot}bb**, they bet **${bet}bb**. Same hand, two lines: call, or raise to **${raiseTo}bb**?`,
        [`Call ${bet}bb`, `Raise to ${raiseTo}bb`],
        result.best.action === 'call' ? 0 : 1,
      ),
      hint: 'Raising adds fold equity but risks more. Which one dominates depends on how much of the pot you already deserve.',
      explain: [
        `You have ${d.madeDescription}, ${pct(eq.equity)} against their hand.`,
        `Calling: ${round(call.ev, 2)}bb. Raising: ${round(raise.ev, 2)}bb.`,
        result.verdict,
        eq.equity > 0.6
          ? 'With a strong hand raising wins because you want more money in while you are ahead — the folds you cause are a cost, not a benefit.'
          : 'With a modest hand raising wins on fold equity or not at all. If they rarely fold, calling is the better line with the identical cards.',
        result.guidance,
      ],
    };
  },

  /* ---------------- Preflop, table-size aware ---------------- */

  /** How much to open, at a table of a given size. */
  'open-sizing': (rng) => {
    const tableSize = pick(rng, [6, 8, 9, 10]);
    const table = TABLE_SIZES[tableSize];
    const limpers = pick(rng, [0, 0, 1, 2]);
    const recommended = openSizeFor(tableSize, { limpers });
    const options = [...new Set([recommended.size, table.openSize, recommended.size + 1, 2])]
      .sort((a, b) => a - b)
      .map((v) => `${v} big blinds`);

    return {
      skill: 'preflop-sizing',
      scenario: {
        position: `${table.name} table`,
        note: limpers
          ? `${limpers} player${limpers > 1 ? 's have' : ' has'} limped in for 1bb.`
          : 'Everyone has folded to you.',
      },
      ...choice(
        `You are opening from the cutoff at a **${table.name}** table${limpers ? ` with ${limpers} limper${limpers > 1 ? 's' : ''}` : ''}. How much do you raise?`,
        options,
        options.indexOf(`${recommended.size} big blinds`),
      ),
      hint: 'More players behind means more callers, which means a bigger raise to charge them properly.',
      explain: [
        ...recommended.steps,
        `${table.note}`,
        'Use the same size with every hand you open. Raising more with aces and less with suited connectors is readable within an hour and costs far more than it gains.',
      ],
    };
  },

  /** The same hand at different table sizes — the point of full-ring awareness. */
  'table-size-effect': (rng) => {
    const cards = dealRandom(2, [], rng);
    const label = handLabel(cards);
    const seat = pick(rng, ['UTG', 'HJ', 'CO']);
    const sixMax = parseRange(openingRange(6, seat === 'HJ' ? 'MP' : seat)).has(label);
    const fullRing = parseRange(openingRange(9, seat)).has(label);

    const answer = sixMax && fullRing ? 0 : sixMax && !fullRing ? 1 : !sixMax && !fullRing ? 2 : 3;

    return {
      skill: 'position',
      scenario: { hole: cards, note: `You are in ${seat}. Everyone folds to you.` },
      ...choice(
        `You hold **${label}** in **${seat}**. Is this an open?`,
        [
          'Yes at both 6-handed and 9-handed',
          'Yes at 6-handed, fold at 9-handed',
          'Fold at both',
          'Fold at 6-handed, open at 9-handed',
        ],
        answer,
      ),
      hint: 'Count how many players are still to act in each case. That number is the whole answer.',
      explain: [
        `At 6-handed, ${seat} opens about ${Math.round(rangeSize(parseRange(openingRange(6, seat === 'HJ' ? 'MP' : seat))).percent * 100)}% of hands. At 9-handed the same seat opens about ${Math.round(rangeSize(parseRange(openingRange(9, seat))).percent * 100)}%.`,
        `${label} is ${sixMax ? 'in' : 'not in'} the 6-handed range and ${fullRing ? 'in' : 'not in'} the 9-handed one.`,
        'Playing a 9-handed game with 6-handed ranges is one of the most common and most expensive mistakes. More players behind means more chances someone has a real hand.',
      ],
    };
  },

  /* ---------------- Multiway ---------------- */

  /** How equity collapses with more players in, at a full table. */
  'multiway-equity': (rng) => {
    const cards = dealRandom(2, [], rng);
    const label = handLabel(cards);
    const opponents = pick(rng, [1, 3, 5]);
    const r = monteCarloEquity(cards, new Array(opponents).fill(null), [], { trials: 4000, seed: randomInt(rng, 1e6) });

    return {
      skill: 'multiway',
      scenario: { hole: cards, note: `${opponents} opponent${opponents > 1 ? 's' : ''} in the pot.` },
      ...slider(
        `You hold **${label}** against **${opponents}** opponent${opponents > 1 ? 's' : ''} who all go to showdown. What is your equity?`,
        Math.round(r.equity * 100),
        { tolerance: 8 },
      ),
      hint: 'Every extra player is another chance that someone makes something better than you.',
      explain: [
        `About ${pct(r.equity)} against ${opponents} opponent${opponents > 1 ? 's' : ''}.`,
        'Equity falls fast with more players. Even aces are close to a coin flip against five opponents — still the best hand, but nothing like the favourite they are heads-up.',
        'This is why at a 9 or 10-handed table you raise to cut the field rather than letting everyone in cheaply, and why hands that need to make something big go up in value multiway while one-pair hands go down.',
      ],
    };
  },

  /** Multiway betting: value narrows and bluffs die. */
  'multiway-decision': (rng) => {
    const { hole, board, d } = dealSpot(rng, pick(rng, ['pair', 'air', 'strong']));
    const opponents = pick(rng, [2, 3]);
    const pot = pick(rng, [12, 16, 20, 24]);
    const strong = d.madeCategory >= CATEGORY.TWO_PAIR;
    const answer = strong ? 0 : 1;

    return {
      skill: 'multiway',
      scenario: { hole, board, pot, note: `${opponents} opponents still in the hand. Both check to you.` },
      ...choice(
        `Pot **${pot}bb** with **${opponents} opponents** still in. They check to you. Bet or check?`,
        ['Bet', 'Check'],
        answer,
      ),
      hint: 'With three or four players seeing a flop, how likely is it that nobody has anything?',
      explain: [
        `You have ${d.madeDescription}.`,
        strong
          ? 'Bet. With a genuinely strong hand, more opponents means more people who can pay you. Multiway is where value betting earns most.'
          : 'Check. Bluffing multiway is close to hopeless — everyone has to fold, and with three players that almost never happens. One opponent misses the flop about two thirds of the time; three all missing is closer to a quarter.',
        'The rule for multiway pots: value bet narrower and harder, and bluff almost never.',
      ],
    };
  },

  /* ---------------- River ---------------- */

  /** The river call, decided by counting combinations against the price. */
  'river-call-combos': (rng) => {
    const board = dealRandom(5, [], rng);
    const hole = dealRandom(2, board, rng);
    const pot = pick(rng, [16, 20, 24, 30]);
    const bet = chips(pot * pick(rng, [0.5, 0.75, 1]));
    const price = bet / (pot + 2 * bet);

    // A simple, explicit range model the learner can follow.
    const valueCombos = 4 + randomInt(rng, 9);
    const bluffCombos = 2 + randomInt(rng, 10);
    const winRate = bluffCombos / (valueCombos + bluffCombos);
    const shouldCall = winRate >= price;
    const call = evOfCall(pot, bet, winRate);

    return {
      skill: 'river-decisions',
      scenario: { hole, board, pot, bet, note: 'River. They bet.' },
      kind: 'steps',
      prompt: `River. Pot **${pot}bb**, they bet **${bet}bb**. You have a bluff-catcher: you beat their bluffs and lose to their value hands. You put them on **${valueCombos} value combinations** and **${bluffCombos} bluff combinations**.`,
      steps: [
        numeric('How many combinations are in their betting range altogether?', valueCombos + bluffCombos, {
          unit: 'combos',
          hint: 'Value plus bluffs.',
          explain: `${valueCombos} + ${bluffCombos} = ${valueCombos + bluffCombos}.`,
        }),
        slider('So how often are you good when you call?', Math.round(winRate * 100), {
          tolerance: 6,
          hint: `You beat the bluffs only: ${bluffCombos} out of ${valueCombos + bluffCombos}.`,
          explain: `${bluffCombos} ÷ ${valueCombos + bluffCombos} = ${pct(winRate)}.`,
        }),
        slider('What do you need to break even on the call?', Math.round(price * 100), {
          tolerance: 5,
          hint: `${bet} into a final pot of ${pot + 2 * bet}.`,
          explain: `${bet} ÷ ${pot + 2 * bet} = ${pct(price)}.`,
        }),
        choice('Call or fold?', ['Call', 'Fold'], shouldCall ? 0 : 1, {
          hint: 'Two percentages. Compare them.',
          explain: shouldCall
            ? `You are good ${pct(winRate)} and you need ${pct(price)}, so calling makes ${round(call.ev, 2)}bb.`
            : `You are good ${pct(winRate)} but you need ${pct(price)}, so calling loses ${round(Math.abs(call.ev), 2)}bb. Fold.`,
        }),
      ],
      explain: [
        'On the river there are no more cards, so there is no equity to work out — only how many of their hands beat you and how many do not.',
        'That makes river calls the most countable decision in poker, and the one where "I have a feeling" costs the most.',
      ],
    };
  },

  /* ---------------- Discipline ---------------- */

  /** When the price says call and the situation says fold. */
  'reverse-implied': (rng) => {
    const pot = pick(rng, [12, 16, 20]);
    const bet = chips(pot * 0.4);
    const price = bet / (pot + 2 * bet);
    const equity = price + 0.03;

    return {
      skill: 'fold-discipline',
      scenario: { pot, bet, note: 'You have a weak second pair with a bad kicker, out of position, 100bb deep.' },
      ...choice(
        `Pot **${pot}bb**, they bet **${bet}bb**. You need **${pct(price)}** and you estimate you have **${pct(equity)}**. Weak second pair, out of position, 100bb behind. Call or fold?`,
        ['Call — the price is right', 'Fold — the price is not the whole story'],
        1,
      ),
      hint: 'What happens on the turn and river when you call and they keep betting?',
      explain: [
        `On raw pot odds this is a call by ${pct(equity - price)}. The number is real, and it is not the whole decision.`,
        'Pot odds price *this* street. They assume the hand ends here. It does not: you are out of position with a hand that cannot call three bets, so you will often pay this bet and then have to fold anyway on the turn.',
        'That is reverse implied odds — the money you lose *after* calling. When you have a weak made hand out of position against continued aggression, the true price is worse than the pot is showing you.',
        'The honest rule: pot odds tell you the minimum. Position, stack depth, and whether your hand can stand more pressure decide whether the real price is higher.',
      ],
    };
  },
};
