/**
 * The arithmetic of poker decisions, written so each function returns its own
 * working, not just an answer.
 *
 * Every function here returns a `steps` array: the ordered, plain-language
 * derivation the learner is walked through. The teaching layer never prints a
 * formula the learner hasn't just built themselves one line at a time, so the
 * derivation is the product and the number is a by-product.
 */

/** Round to a sane number of decimals for display. */
export function round(value, places = 1) {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

export function pct(fraction, places = 1) {
  return `${round(fraction * 100, places)}%`;
}

/**
 * Pot odds: the price you are being offered.
 *
 * Framed as "what fraction of the final pot is your own money?" rather than as
 * a ratio, because the fraction *is* the break-even win rate. Ratios ("3 to 1")
 * are taught later as a shorthand once the fraction is intuitive.
 */
export function potOdds(potBeforeCall, callAmount) {
  const finalPot = potBeforeCall + callAmount;
  const breakEven = callAmount / finalPot;
  return {
    potBeforeCall,
    callAmount,
    finalPot,
    breakEven,
    ratio: callAmount === 0 ? Infinity : potBeforeCall / callAmount,
    steps: [
      `There is ${potBeforeCall} in the middle and it costs you ${callAmount} to call.`,
      `If you call, the pot you are playing for becomes ${potBeforeCall} + ${callAmount} = ${finalPot}.`,
      `Your ${callAmount} is ${callAmount} / ${finalPot} = ${pct(breakEven)} of that pot.`,
      `So calling breaks even if you win at least ${pct(breakEven)} of the time.`,
    ],
  };
}

/**
 * Break-even equity for facing a bet of `bet` into a pot of `pot`.
 * Identical maths to potOdds, named the way it is used postflop.
 */
export function breakEvenEquity(pot, bet) {
  return potOdds(pot + bet, bet).breakEven;
}

/**
 * Bet sizing expressed as a fraction of the pot, and the equity the *caller*
 * needs. Learners discover here that a half-pot bet always needs 25% and a
 * pot-sized bet always needs 33%, regardless of the numbers involved.
 */
export function priceOfBet(potSizeFraction) {
  const b = potSizeFraction;
  const breakEven = b / (1 + 2 * b);
  return {
    betFraction: b,
    breakEven,
    steps: [
      `The bet is ${round(b * 100, 0)}% of the pot.`,
      `Call ${b} into a pot of 1, and the final pot is 1 + ${b} + ${b} = ${round(1 + 2 * b, 2)}.`,
      `Your share of the risk is ${b} / ${round(1 + 2 * b, 2)} = ${pct(breakEven)}.`,
      `That is the equity you need to call, whatever the stakes are.`,
    ],
  };
}

/**
 * Expected value of a call.
 * EV = (equity x pot you win) - ((1 - equity) x amount you lose)
 */
export function evOfCall(equity, potBeforeCall, callAmount) {
  const win = equity * potBeforeCall;
  const lose = (1 - equity) * callAmount;
  const ev = win - lose;
  return {
    ev,
    win,
    lose,
    steps: [
      `You win ${potBeforeCall} when you are good, which happens ${pct(equity)} of the time: ${pct(equity)} x ${potBeforeCall} = ${round(win, 2)}.`,
      `You lose your ${callAmount} the rest of the time: ${pct(1 - equity)} x ${callAmount} = ${round(lose, 2)}.`,
      `${round(win, 2)} - ${round(lose, 2)} = ${round(ev, 2)}.`,
      ev > 0
        ? `A positive number means calling makes money in the long run.`
        : ev < 0
          ? `A negative number means calling loses money in the long run.`
          : `Exactly zero: this call is a coin flip in value.`,
    ],
  };
}

/**
 * Expected value of a bluff that risks `bet` to win `pot`.
 * The break-even fold frequency is the whole of bluffing theory in one line.
 */
export function evOfBluff(foldFrequency, pot, bet) {
  const breakEven = bet / (pot + bet);
  const ev = foldFrequency * pot - (1 - foldFrequency) * bet;
  return {
    ev,
    breakEvenFoldFrequency: breakEven,
    steps: [
      `You risk ${bet} to win the ${pot} already there.`,
      `When they fold you gain ${pot}. When they call you lose ${bet}.`,
      `Break-even fold rate = ${bet} / (${pot} + ${bet}) = ${pct(breakEven)}.`,
      `You estimated they fold ${pct(foldFrequency)}, so the bluff is ${ev > 0 ? 'profitable' : 'losing'} at ${round(ev, 2)} per attempt.`,
    ],
  };
}

/**
 * Minimum defence frequency: how often you must continue to stop an opponent
 * profitably bluffing any two cards.
 *
 * Taught as the mirror image of the bluff maths above, which is why it lands:
 * it is not a new formula, it is the same one read from the other chair.
 */
export function minimumDefenceFrequency(pot, bet) {
  const mdf = pot / (pot + bet);
  return {
    mdf,
    foldMax: 1 - mdf,
    steps: [
      `Their bluff risks ${bet} to win ${pot}.`,
      `If you fold more than ${pct(bet / (pot + bet))} of the time, betting any two cards prints money for them.`,
      `So you must continue with at least ${pot} / (${pot} + ${bet}) = ${pct(mdf)} of your range.`,
    ],
  };
}

/**
 * The value-to-bluff ratio that makes a bettor's range balanced at a given
 * size: the caller ends up indifferent, which is the point.
 */
export function bluffToValueRatio(potSizeFraction) {
  const b = potSizeFraction;
  const bluffShare = b / (1 + 2 * b);
  const valueShare = 1 - bluffShare;
  return {
    bluffShare,
    valueShare,
    bluffsPerValue: bluffShare / valueShare,
    steps: [
      `A ${round(b * 100, 0)}%-pot bet gives your opponent ${pct(bluffShare)} pot odds.`,
      `For their call to be exactly break-even, ${pct(bluffShare)} of your betting range should be bluffs.`,
      `That is roughly ${round(bluffShare / valueShare, 2)} bluffs for every 1 value hand.`,
    ],
  };
}

/**
 * The rule of 2 and 4, and how far off it is.
 *
 * Taught only *after* the learner has counted 9/47 by hand several times, and
 * always shown alongside the true number so the shortcut is understood as an
 * approximation with known error rather than as the rule itself.
 */
export function ruleOfTwoAndFour(outs, street) {
  const multiplier = street === 'flop' ? 4 : 2;
  const estimate = (outs * multiplier) / 100;
  const unseen = street === 'flop' ? 47 : 46;
  const exact =
    street === 'flop'
      ? 1 - ((47 - outs) / 47) * ((46 - outs) / 46)
      : outs / 46;
  return {
    outs,
    street,
    estimate,
    exact,
    error: estimate - exact,
    steps: [
      `You counted ${outs} outs.`,
      street === 'flop'
        ? `Two cards are still to come, so multiply by 4: ${outs} x 4 = ${outs * 4}%.`
        : `One card is still to come, so multiply by 2: ${outs} x 2 = ${outs * 2}%.`,
      `The true figure is ${pct(exact)} (${outs} good cards out of ${unseen} unseen).`,
      Math.abs(estimate - exact) < 0.02
        ? `Close enough to act on at the table.`
        : `The shortcut drifts high with a lot of outs; shade it down when you have more than about 8.`,
    ],
  };
}

/**
 * Implied odds: what the call needs to be worth once you account for money you
 * expect to win on later streets when you hit.
 */
export function impliedOdds(equityToHit, potBeforeCall, callAmount, extraWhenHit) {
  const naive = potOdds(potBeforeCall, callAmount);
  const effectivePot = potBeforeCall + extraWhenHit;
  const required = callAmount / (effectivePot + callAmount);
  return {
    naiveBreakEven: naive.breakEven,
    impliedBreakEven: required,
    profitable: equityToHit >= required,
    steps: [
      `On raw pot odds you need ${pct(naive.breakEven)} and you only have ${pct(equityToHit)}.`,
      `But when you hit, you expect to win about ${extraWhenHit} more from them.`,
      `That makes the pot you are really playing for ${potBeforeCall} + ${extraWhenHit} = ${effectivePot}.`,
      `Now you need ${callAmount} / ${effectivePot + callAmount} = ${pct(required)}.`,
      equityToHit >= required
        ? `Your ${pct(equityToHit)} clears that, so the call works if they really do pay you off.`
        : `Even with that, ${pct(equityToHit)} is not enough. Fold.`,
    ],
  };
}

/** Stack-to-pot ratio: the number that decides whether a hand can be played for stacks. */
export function spr(effectiveStack, pot) {
  const value = effectiveStack / pot;
  return {
    spr: value,
    commitment:
      value < 3 ? 'low' : value < 7 ? 'medium' : 'high',
    steps: [
      `Effective stack ${effectiveStack} divided by pot ${pot} is an SPR of ${round(value, 1)}.`,
      value < 3
        ? `Low SPR: one pair is often enough to commit the stack.`
        : value < 7
          ? `Medium SPR: you want two pair or better to play a big pot.`
          : `High SPR: keep the pot small without a very strong hand or a big draw.`,
    ],
  };
}

/** Convert odds ratio to percentage, and back. Used by the ratio-fluency drills. */
export function ratioToPercent(a, b) {
  return b / (a + b);
}

export function percentToRatio(fraction) {
  if (fraction <= 0) return { a: 1, b: 0 };
  const a = (1 - fraction) / fraction;
  return { a: round(a, 2), b: 1 };
}
