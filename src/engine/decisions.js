/**
 * The EV of every action, so decisions can be compared rather than argued.
 *
 * Poker has five actions: fold, check, call, bet, raise. Each one is worth some
 * number of chips on average. The correct play is simply the largest number.
 * That is the entire game, and this module computes those numbers and shows the
 * arithmetic that produced them.
 *
 * The model is deliberately simple and stated out loud rather than hidden:
 *
 *   - Villain folds to aggression some fraction of the time, `foldFrequency`.
 *   - When villain continues, hero wins the pot with probability `equity`.
 *   - No further betting is modelled beyond the action being priced.
 *
 * That last assumption is the significant one, and it makes these numbers a
 * floor rather than the truth: a semi-bluff that also wins money on later
 * streets is worth more than this says. The learner is told that explicitly
 * rather than being handed a number that quietly understates the case. A model
 * you understand the limits of is usable; a black box is not.
 *
 * All amounts are in big blinds. All probabilities are 0..1.
 */

import { pct, round } from './odds.js';

/**
 * @typedef {Object} ActionEV
 * @property {string} action     'fold' | 'check' | 'call' | 'bet' | 'raise'
 * @property {string} label      how it reads in the UI, e.g. "Raise to 24"
 * @property {number} ev         chips won or lost on average
 * @property {number} [amount]   chips put in, where relevant
 * @property {string[]} steps    the derivation
 */

/**
 * Folding is always worth exactly zero.
 *
 * This is the single most clarifying fact in poker maths, and it is worth
 * stating as its own function. Chips already in the pot are not yours, so
 * giving up costs nothing further. Every other action is measured against
 * zero — which means any action with a negative EV is worse than folding, and
 * "but I already put money in" never enters the comparison.
 */
export function evOfFold() {
  return {
    action: 'fold',
    label: 'Fold',
    ev: 0,
    steps: [
      'Folding is worth exactly 0.',
      'The chips you already put in are gone whatever you do now, so they are not part of this decision.',
      'Every other option is measured against this zero. Anything worse than 0 means fold.',
    ],
  };
}

/**
 * Checking, modelled as simply realising your equity in the current pot.
 *
 * Real checking is more complicated — you might get bet at, you might improve
 * and win more. This is the honest simple version and the learner is told so.
 */
export function evOfCheck(pot, equity) {
  const ev = equity * pot;
  return {
    action: 'check',
    label: 'Check',
    ev,
    steps: [
      `Checking puts in no more chips, so you are playing for the ${pot} already there.`,
      `You win that pot ${pct(equity)} of the time: ${pct(equity)} × ${pot} = ${round(ev, 2)}.`,
      'This is a simplification — checking can also let you get bluffed off the hand, or let you improve cheaply.',
    ],
  };
}

/**
 * EV of calling a bet.
 *
 * @param {number} pot   the pot BEFORE villain's bet
 * @param {number} bet   villain's bet
 * @param {number} equity hero's chance of winning at showdown
 */
export function evOfCall(pot, bet, equity) {
  const win = pot + bet;
  const ev = equity * win - (1 - equity) * bet;
  return {
    action: 'call',
    label: `Call ${round(bet, 1)}`,
    ev,
    amount: bet,
    steps: [
      `If you call and win, you collect the ${pot} that was there plus their ${bet} = ${round(win, 1)}.`,
      `That happens ${pct(equity)} of the time: ${pct(equity)} × ${round(win, 1)} = ${round(equity * win, 2)}.`,
      `The other ${pct(1 - equity)} of the time you lose your ${round(bet, 1)}: ${pct(1 - equity)} × ${round(bet, 1)} = ${round((1 - equity) * bet, 2)}.`,
      `${round(equity * win, 2)} − ${round((1 - equity) * bet, 2)} = ${round(ev, 2)}.`,
    ],
  };
}

/**
 * EV of betting into an unopened pot.
 *
 * Two ways to win, which is why betting beats checking with far more hands
 * than beginners expect: villain folds, or villain calls and you win anyway.
 */
export function evOfBet(pot, bet, foldFrequency, equityWhenCalled) {
  const f = foldFrequency;
  const e = equityWhenCalled;
  const finalPot = pot + 2 * bet;
  const whenCalled = e * finalPot - bet;
  const ev = f * pot + (1 - f) * whenCalled;

  return {
    action: 'bet',
    label: `Bet ${round(bet, 1)}`,
    ev,
    amount: bet,
    foldEquity: f * pot,
    showdownValue: (1 - f) * whenCalled,
    steps: [
      `They fold ${pct(f)} of the time, and you win the ${pot} immediately: ${pct(f)} × ${pot} = ${round(f * pot, 2)}.`,
      `They call ${pct(1 - f)} of the time, making the pot ${pot} + ${round(bet, 1)} + ${round(bet, 1)} = ${round(finalPot, 1)}.`,
      `When called you win that pot ${pct(e)} of the time: ${pct(e)} × ${round(finalPot, 1)} − ${round(bet, 1)} = ${round(whenCalled, 2)}.`,
      `Total: ${round(f * pot, 2)} + ${pct(1 - f)} × ${round(whenCalled, 2)} = ${round(ev, 2)}.`,
      'Notice there are two separate ways this makes money. That is why betting beats checking with far more hands than feels right.',
    ],
  };
}

/**
 * EV of raising a bet.
 *
 * @param {number} pot     pot BEFORE villain's bet
 * @param {number} bet     villain's bet
 * @param {number} raiseTo hero's total raise size
 */
export function evOfRaise(pot, bet, raiseTo, foldFrequency, equityWhenCalled) {
  const f = foldFrequency;
  const e = equityWhenCalled;
  const winNow = pot + bet;
  const finalPot = pot + 2 * raiseTo;
  const whenCalled = e * finalPot - raiseTo;
  const ev = f * winNow + (1 - f) * whenCalled;

  return {
    action: 'raise',
    label: `Raise to ${round(raiseTo, 1)}`,
    ev,
    amount: raiseTo,
    foldEquity: f * winNow,
    showdownValue: (1 - f) * whenCalled,
    steps: [
      `They fold ${pct(f)} of the time and you take the ${pot} plus their ${round(bet, 1)} = ${round(winNow, 1)}: ${pct(f)} × ${round(winNow, 1)} = ${round(f * winNow, 2)}.`,
      `They call ${pct(1 - f)} of the time, making the pot ${round(finalPot, 1)}.`,
      `When called you win ${pct(e)} of the time: ${pct(e)} × ${round(finalPot, 1)} − ${round(raiseTo, 1)} = ${round(whenCalled, 2)}.`,
      `Total: ${round(f * winNow, 2)} + ${pct(1 - f)} × ${round(whenCalled, 2)} = ${round(ev, 2)}.`,
    ],
  };
}

/**
 * Rank a set of actions and say which wins and by how much.
 *
 * The margin matters as much as the winner. A decision that is close is one
 * where being slightly wrong about villain costs almost nothing; a decision
 * that is not close is one worth getting right.
 */
export function compareActions(actions) {
  const ranked = [...actions].sort((a, b) => b.ev - a.ev);
  const best = ranked[0];
  const second = ranked[1];
  const margin = second ? best.ev - second.ev : Infinity;

  return {
    ranked,
    best,
    margin,
    close: margin < 0.5,
    verdict: second
      ? `${best.label} is best by ${round(margin, 2)} big blinds over ${second.label.toLowerCase()}.`
      : `${best.label} is the only option considered.`,
    guidance: margin < 0.5
      ? 'This is close. Small changes in how often they fold would flip it, so do not agonise — either is defensible.'
      : margin < 2
        ? 'A clear edge. Worth getting right, and worth remembering the shape of.'
        : 'A big edge. Getting this one wrong is expensive.',
  };
}

/**
 * Price a ladder of bet sizes and find the best one.
 *
 * This is the "how much should I bet?" question answered directly. The fold
 * model matters: bigger bets fold out more hands, so `foldModel` maps a bet
 * size to how often villain gives up. A flat fold frequency would make the
 * biggest bet always win, which is wrong and would teach exactly the wrong
 * lesson.
 *
 * @param {number[]} fractions bet sizes as fractions of the pot
 * @param {(fraction: number) => number} foldModel
 */
export function sizingLadder(pot, fractions, foldModel, equityWhenCalled) {
  const options = fractions.map((fraction) => {
    const bet = round(pot * fraction, 1);
    const f = foldModel(fraction);
    const result = evOfBet(pot, bet, f, equityWhenCalled);
    return { ...result, fraction, foldFrequency: f, label: `Bet ${bet} (${Math.round(fraction * 100)}% pot)` };
  });

  const comparison = compareActions(options);
  return { options, ...comparison };
}

/**
 * A plausible default fold model for a thinking opponent.
 *
 * Bigger bets fold out more, with diminishing returns — nobody folds their
 * strong hands to any size, so the curve flattens. `stickiness` shifts the
 * whole curve for calling stations (high) or nits (low).
 */
export function foldModel({ stickiness = 0.5 } = {}) {
  return (fraction) => {
    const base = 1 - Math.exp(-1.1 * fraction);
    const adjusted = base * (1.35 - 0.7 * stickiness);
    return Math.max(0.02, Math.min(0.85, adjusted));
  };
}

/**
 * How much of your equity you actually get to keep.
 *
 * A drawing hand out of position does not realise its raw equity, because it
 * gets bet off the hand. This is why two hands with identical equity are not
 * worth the same, which is otherwise one of the most confusing facts in poker.
 */
export function realisedEquity(rawEquity, { inPosition, hasDraw, isMadeHand }) {
  let factor = 1;
  if (!inPosition) factor -= 0.1;
  if (hasDraw) factor += 0.04;
  if (!isMadeHand && !hasDraw) factor -= 0.12;
  factor = Math.max(0.6, Math.min(1.1, factor));

  return {
    raw: rawEquity,
    realised: rawEquity * factor,
    factor,
    steps: [
      `Raw equity says you win ${pct(rawEquity)} if every card is dealt.`,
      inPosition
        ? 'In position you get to see what they do first, so you realise close to all of it.'
        : 'Out of position you will be bet off some of these hands before showdown, so you keep less than the raw number.',
      `Realistically you capture about ${pct(rawEquity * factor)}.`,
    ],
  };
}

/**
 * The break-even fold frequency for a pure bluff: the number that decides
 * every bluff you will ever make.
 */
export function bluffBreakEven(pot, bet) {
  const breakEven = bet / (pot + bet);
  return {
    breakEven,
    steps: [
      `You risk ${round(bet, 1)} to win ${pot}.`,
      `Break-even fold rate = ${round(bet, 1)} ÷ (${pot} + ${round(bet, 1)}) = ${pct(breakEven)}.`,
      `Fold more often than that and the bluff prints money; less and it loses.`,
    ],
  };
}
