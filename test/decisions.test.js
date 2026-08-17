import { suite, test, assert, assertEqual, assertClose } from './harness.js';
import {
  bluffBreakEven, compareActions, evOfBet, evOfCall, evOfCheck, evOfFold,
  evOfRaise, foldModel, realisedEquity, sizingLadder,
} from '../src/engine/decisions.js';
import { potOdds } from '../src/engine/odds.js';

suite('EV of each action');

test('folding is always exactly zero', () => {
  assertEqual(evOfFold().ev, 0);
});

test('calling is profitable exactly when equity beats the price', () => {
  const pot = 100;
  const bet = 50;
  const price = potOdds(pot + bet, bet).breakEven; // 50 / 200 = 25%

  assertClose(price, 0.25, 0.001);
  assertClose(evOfCall(pot, bet, price).ev, 0, 0.001, 'at the price, calling is break-even');
  assert(evOfCall(pot, bet, price + 0.1).ev > 0, 'above the price, calling wins');
  assert(evOfCall(pot, bet, price - 0.1).ev < 0, 'below the price, calling loses');
});

test('calling with certainty wins the whole pot', () => {
  assertClose(evOfCall(100, 50, 1).ev, 150, 0.001);
});

test('calling with no equity loses exactly the call', () => {
  assertClose(evOfCall(100, 50, 0).ev, -50, 0.001);
});

test('a pure bluff breaks even at the advertised fold frequency', () => {
  const pot = 100;
  const bet = 75;
  const { breakEven } = bluffBreakEven(pot, bet);
  assertClose(breakEven, 75 / 175, 0.001);

  // equityWhenCalled = 0 makes the bet a pure bluff.
  assertClose(evOfBet(pot, bet, breakEven, 0).ev, 0, 0.01, 'at break-even the bluff is worth zero');
  assert(evOfBet(pot, bet, breakEven + 0.1, 0).ev > 0);
  assert(evOfBet(pot, bet, breakEven - 0.1, 0).ev < 0);
});

test('betting the nuts is worth more than checking them', () => {
  const pot = 100;
  const bet = 75;
  const betting = evOfBet(pot, bet, 0.3, 1);
  const checking = evOfCheck(pot, 1);
  assert(betting.ev > checking.ev, `bet ${betting.ev} should beat check ${checking.ev}`);
});

test('betting has two separate sources of profit', () => {
  const r = evOfBet(100, 50, 0.4, 0.5);
  assert(r.foldEquity > 0, 'fold equity');
  assert(r.showdownValue > 0, 'showdown value');
  assertClose(r.ev, r.foldEquity + r.showdownValue, 0.001, 'the two parts sum to the whole');
});

test('a semi-bluff beats the same hand called down', () => {
  // 35% equity: betting adds fold equity on top of that showdown value.
  const pot = 100;
  const betting = evOfBet(pot, 60, 0.45, 0.35);
  const checking = evOfCheck(pot, 0.35);
  assert(betting.ev > checking.ev, 'two ways to win beats one');
});

test('raising is priced against the pot including their bet', () => {
  const r = evOfRaise(100, 50, 150, 0.5, 0.5);
  // Folds half the time winning 150; called half the time into a 400 pot.
  assertClose(r.foldEquity, 0.5 * 150, 0.001);
  assertClose(r.showdownValue, 0.5 * (0.5 * 400 - 150), 0.001);
});

test('raising with no fold equity and no showdown equity is a disaster', () => {
  assert(evOfRaise(100, 50, 150, 0, 0).ev < -100);
});

suite('comparing actions');

test('the best action is the largest number', () => {
  const actions = [
    evOfFold(),
    evOfCall(100, 50, 0.4),
    evOfRaise(100, 50, 150, 0.4, 0.4),
  ];
  const result = compareActions(actions);
  assertEqual(result.ranked.length, 3);
  assert(result.ranked[0].ev >= result.ranked[1].ev);
  assert(result.ranked[1].ev >= result.ranked[2].ev);
  assertEqual(result.best, result.ranked[0]);
});

test('a hopeless hand should fold', () => {
  const actions = [evOfFold(), evOfCall(100, 80, 0.05)];
  assertEqual(compareActions(actions).best.action, 'fold');
});

test('a monster should not fold', () => {
  const actions = [evOfFold(), evOfCall(100, 50, 0.95), evOfRaise(100, 50, 150, 0.3, 0.95)];
  assert(compareActions(actions).best.action !== 'fold');
});

test('close decisions are flagged as close', () => {
  const a = { action: 'call', label: 'Call', ev: 2.0 };
  const b = { action: 'raise', label: 'Raise', ev: 1.9 };
  const result = compareActions([a, b]);
  assert(result.close, 'a 0.1bb margin is close');
  assert(result.guidance.includes('close'));

  const wide = compareActions([{ action: 'call', label: 'Call', ev: 10 }, { action: 'fold', label: 'Fold', ev: 0 }]);
  assert(!wide.close);
});

suite('bet sizing');

test('the fold model rewards bigger bets with diminishing returns', () => {
  const model = foldModel();
  const small = model(0.33);
  const medium = model(0.75);
  const large = model(1.5);
  assert(small < medium && medium < large, 'bigger bets fold out more');
  assert(large - medium < medium - small, 'with diminishing returns');
  assert(large < 0.9, 'nobody folds everything');
});

test('sticky opponents fold less at every size', () => {
  const station = foldModel({ stickiness: 1 });
  const nit = foldModel({ stickiness: 0 });
  for (const size of [0.33, 0.66, 1]) {
    assert(station(size) < nit(size), `station should fold less at ${size}`);
  }
});

test('a sizing ladder picks a size and explains the margin', () => {
  const ladder = sizingLadder(100, [0.33, 0.5, 0.75, 1], foldModel(), 0.6);
  assertEqual(ladder.options.length, 4);
  assert(ladder.best, 'a best size is chosen');
  assert(ladder.verdict.includes('best'));
  for (const option of ladder.options) {
    assert(option.steps.length >= 4, 'every size shows its working');
    assert(option.label.includes('%'), 'sizes are labelled as a share of the pot');
  }
});

test('value hands prefer bigger sizes than bluffs do', () => {
  const nuts = sizingLadder(100, [0.33, 0.66, 1], foldModel(), 0.95);
  const bluff = sizingLadder(100, [0.33, 0.66, 1], foldModel(), 0.05);
  assert(
    nuts.best.fraction >= bluff.best.fraction,
    `nuts chose ${nuts.best.fraction}, bluff chose ${bluff.best.fraction}`,
  );
});

suite('equity realisation');

test('position lets you keep more of your equity', () => {
  const ip = realisedEquity(0.4, { inPosition: true, hasDraw: true, isMadeHand: false });
  const oop = realisedEquity(0.4, { inPosition: false, hasDraw: true, isMadeHand: false });
  assert(ip.realised > oop.realised, 'in position realises more');
  assertEqual(ip.raw, oop.raw, 'raw equity is unchanged');
});

test('air out of position realises the least', () => {
  const air = realisedEquity(0.4, { inPosition: false, hasDraw: false, isMadeHand: false });
  const made = realisedEquity(0.4, { inPosition: true, hasDraw: false, isMadeHand: true });
  assert(air.realised < made.realised);
  assert(air.factor >= 0.6, 'the factor stays within sane bounds');
});
