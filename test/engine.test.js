import { suite, test, assert, assertEqual, assertClose } from './harness.js';
import { parseCard, parseCards, cardToString, cardsToString, makeRng, deckWithout } from '../src/engine/cards.js';
import { evaluate, describe, categoryOf, CATEGORY, bestFive, compareHands } from '../src/engine/evaluator.js';
import { exactEquity, monteCarloEquity, equity } from '../src/engine/equity.js';
import { potOdds, priceOfBet, minimumDefenceFrequency, evOfCall, ruleOfTwoAndFour, bluffToValueRatio } from '../src/engine/odds.js';
import { countOuts, draws, boardTexture } from '../src/engine/board.js';
import { parseRange, comboCount, rangeSize, handLabel, expandLabel, GRID, equityVsRange } from '../src/engine/ranges.js';

suite('cards');

test('parses and round-trips card notation', () => {
  assertEqual(cardToString(parseCard('As')), 'As');
  assertEqual(cardToString(parseCard('2c')), '2c');
  assertEqual(cardToString(parseCard('10h')), 'Th');
  assertEqual(cardToString(parseCard('td')), 'Td');
});

test('parses a run of cards', () => {
  assertEqual(cardsToString(parseCards('AsKdQc')), 'As Kd Qc');
  assertEqual(cardsToString(parseCards('As Kd, Qc')), 'As Kd Qc');
  assertEqual(parseCards('AsKd').length, 2);
});

test('deck without dead cards has the right size', () => {
  assertEqual(deckWithout(parseCards('AsKd')).length, 50);
  assertEqual(deckWithout([]).length, 52);
});

test('rng is deterministic for a seed', () => {
  const a = makeRng(42);
  const b = makeRng(42);
  for (let i = 0; i < 5; i++) assertEqual(a(), b());
});

suite('evaluator: categories');

const cat = (s) => categoryOf(evaluate(parseCards(s)));

test('identifies every hand category', () => {
  assertEqual(cat('AsKsQsJsTs'), CATEGORY.STRAIGHT_FLUSH);
  assertEqual(cat('7c7d7h7s2c'), CATEGORY.QUADS);
  assertEqual(cat('7c7d7h2s2c'), CATEGORY.FULL_HOUSE);
  assertEqual(cat('As9s7s4s2s'), CATEGORY.FLUSH);
  assertEqual(cat('9c8d7h6s5c'), CATEGORY.STRAIGHT);
  assertEqual(cat('7c7d7hKs2c'), CATEGORY.TRIPS);
  assertEqual(cat('7c7dKhKs2c'), CATEGORY.TWO_PAIR);
  assertEqual(cat('7c7dKhQs2c'), CATEGORY.PAIR);
  assertEqual(cat('Ac9d7h4s2c'), CATEGORY.HIGH_CARD);
});

test('the wheel is a five-high straight, not ace-high', () => {
  assertEqual(cat('Ac2d3h4s5c'), CATEGORY.STRAIGHT);
  // 5-high straight loses to 6-high straight
  assert(evaluate(parseCards('Ac2d3h4s5c')) < evaluate(parseCards('2d3h4s5c6h')));
});

test('steel wheel is a straight flush', () => {
  assertEqual(cat('Ac2c3c4c5c'), CATEGORY.STRAIGHT_FLUSH);
});

test('ace-high flush beats king-high flush', () => {
  assert(evaluate(parseCards('AsQs9s5s2s')) > evaluate(parseCards('KsQs9s5s3s')));
});

test('kickers decide otherwise-equal hands', () => {
  assert(evaluate(parseCards('AcAdKh9s3c')) > evaluate(parseCards('AcAdQh9s3c')));
  assertEqual(evaluate(parseCards('AcAdKh9s3c')), evaluate(parseCards('AhAsKd9c3d')));
});

test('a paired board does not create a false full house', () => {
  // Pocket pair plus a paired board is two pair, not a boat.
  assertEqual(categoryOf(evaluate(parseCards('AcAd 7h7s 2c 5d 9h'))), CATEGORY.TWO_PAIR);
  // Unpaired hand on the same board is just the board's pair with kickers.
  assertEqual(categoryOf(evaluate(parseCards('AcKd 7h7s 2c 5d 9h'))), CATEGORY.PAIR);
  // Trips on board plus a pocket pair genuinely is a full house.
  assertEqual(categoryOf(evaluate(parseCards('AcAd 7h7s7d 2c 9h'))), CATEGORY.FULL_HOUSE);
});

suite('evaluator: seven cards');

test('finds the best five of seven', () => {
  const { cards, score } = bestFive(parseCards('AcKc QcJc Tc 2d 3h'));
  assertEqual(categoryOf(score), CATEGORY.STRAIGHT_FLUSH);
  assertEqual(cards.length, 5);
});

test('two sets of trips make a full house', () => {
  assertEqual(categoryOf(evaluate(parseCards('7c7d7h 2s2c2d Ah'))), CATEGORY.FULL_HOUSE);
  // sevens full of deuces, not deuces full of sevens
  assert(evaluate(parseCards('7c7d7h2s2c2dAh')) > evaluate(parseCards('2s2c2d5c5d5hAh')));
});

test('six-card straight uses the top five', () => {
  const s = evaluate(parseCards('9c8d7h6s5c4d2h'));
  assertEqual(categoryOf(s), CATEGORY.STRAIGHT);
  assert(s === evaluate(parseCards('9c8d7h6s5c')));
});

test('describes hands in plain English', () => {
  assertEqual(describe(evaluate(parseCards('AsKsQsJsTs'))), 'a royal flush');
  assertEqual(describe(evaluate(parseCards('KcKd7h7sAc'))), 'two pair, kings and sevens, ace kicker');
  assertEqual(describe(evaluate(parseCards('7c7d7h2s2c'))), 'a full house, sevens full of deuces');
});

test('compareHands agrees with evaluate', () => {
  assertEqual(compareHands(parseCards('AcAd2h3s4c'), parseCards('KcKd2h3s4c')), 1);
  assertEqual(compareHands(parseCards('AcAd2h3s4c'), parseCards('AhAs2d3c4h')), 0);
});

suite('equity');

test('AA versus KK preflop is about 82%', () => {
  const r = monteCarloEquity(parseCards('AcAd'), [parseCards('KcKd')], [], { trials: 20000, seed: 7 });
  assertClose(r.equity, 0.82, 0.02, 'AA vs KK');
});

test('a coin flip is a coin flip', () => {
  const r = monteCarloEquity(parseCards('AcKd'), [parseCards('QhQs')], [], { trials: 20000, seed: 11 });
  assertClose(r.equity, 0.435, 0.03, 'AK vs QQ');
});

test('exact equity on the turn enumerates 44 rivers', () => {
  const r = exactEquity(parseCards('AcKc'), parseCards('7h7d'), parseCards('Qc2c5s9h'));
  assertEqual(r.trials, 44);
  assert(r.exact);
  // Nine clubs plus three aces plus three kings = 15 outs of 44.
  assertClose(r.equity, 15 / 44, 0.001);
});

test('exact flop equity enumerates 990 runouts', () => {
  const r = exactEquity(parseCards('AcKc'), parseCards('7h7d'), parseCards('Qc2c5s'));
  assertEqual(r.trials, 990);
});

test('identical hands chop and each get half', () => {
  const r = exactEquity(parseCards('AcKd'), parseCards('AhKs'), parseCards('2c5d9h'));
  assertClose(r.equity, 0.5, 0.001);
  assertClose(r.tie, 1.0, 0.001);
});

test('a hand already drawing dead has zero equity', () => {
  // Villain has a made flush; hero has bottom pair and no possible improvement to beat it.
  const r = exactEquity(parseCards('2c2d'), parseCards('AhKh'), parseCards('Qh7h3h4s'));
  assert(r.equity < 0.1, `expected near zero, got ${r.equity}`);
});

test('equity() routes to the exact engine when it can', () => {
  const r = equity(parseCards('AcKc'), [parseCards('7h7d')], parseCards('Qc2c5s9h'));
  assert(r.exact);
});

test('more opponents means less equity', () => {
  const one = monteCarloEquity(parseCards('AcAd'), [null], [], { trials: 6000, seed: 3 });
  const five = monteCarloEquity(parseCards('AcAd'), [null, null, null, null, null], [], { trials: 6000, seed: 3 });
  assert(one.equity > five.equity + 0.2, 'aces should shed a lot of equity multiway');
  assertClose(one.equity, 0.85, 0.03);
});

suite('odds');

test('pot odds produce the break-even percentage', () => {
  const p = potOdds(100, 50);
  assertClose(p.breakEven, 1 / 3, 0.001);
  assertEqual(p.finalPot, 150);
  assertEqual(p.ratio, 2);
  assert(p.steps.length >= 4, 'every calculation shows its working');
});

test('bet sizes map to fixed break-even numbers', () => {
  assertClose(priceOfBet(0.5).breakEven, 0.25, 0.001);
  assertClose(priceOfBet(1.0).breakEven, 1 / 3, 0.001);
  assertClose(priceOfBet(0.33).breakEven, 0.1988, 0.001);
});

test('MDF is the mirror of the bluff price', () => {
  const m = minimumDefenceFrequency(100, 100);
  assertClose(m.mdf, 0.5, 0.001);
  const half = minimumDefenceFrequency(100, 50);
  assertClose(half.mdf, 2 / 3, 0.001);
});

test('bluff-to-value ratio matches the price offered', () => {
  const b = bluffToValueRatio(1.0);
  assertClose(b.bluffShare, 1 / 3, 0.001);
  assertClose(b.bluffsPerValue, 0.5, 0.01);
});

test('EV of a call is positive exactly when equity beats the price', () => {
  const price = potOdds(100, 50).breakEven;
  assert(evOfCall(price + 0.05, 100, 50).ev > 0);
  assert(evOfCall(price - 0.05, 100, 50).ev < 0);
  assertClose(evOfCall(price, 100, 50).ev, 0, 0.001);
});

test('rule of 2 and 4 reports its own error', () => {
  const r = ruleOfTwoAndFour(9, 'flop');
  assertClose(r.estimate, 0.36, 0.001);
  assertClose(r.exact, 0.35, 0.01);
  const turn = ruleOfTwoAndFour(9, 'turn');
  assertClose(turn.exact, 9 / 46, 0.001);
});

suite('board reading');

test('counts real outs and excludes dirty ones', () => {
  // Hero has a flush draw; villain already has a set, so two clubs pair the
  // board and give villain a full house. Those are not outs.
  const r = countOuts(parseCards('AcKc'), parseCards('7h7s'), parseCards('7d5c2c'));
  assert(!r.aheadNow);
  assert(r.outCount > 0);
  assertEqual(r.unseen, 45);
  // A naive count says 9 clubs + 3 aces + 3 kings = 15. The truth is far lower
  // because villain has a set and can boat up.
  assert(r.outCount < 15, `naive count is 15, exact is ${r.outCount}`);
});

test('flush draw plus overcards against one pair', () => {
  const r = countOuts(parseCards('AcKc'), parseCards('Qh9d'), parseCards('Qd5c2c'));
  assert(!r.aheadNow);
  // 9 clubs + 3 aces + 3 kings = 15, minus the Ac/Kc already counted as clubs.
  assertEqual(r.outCount, 15);
});

test('detects draws correctly', () => {
  const fd = draws(parseCards('AcKc'), parseCards('Qc5c2d'));
  assert(fd.flushDraw);
  assert(!fd.madeFlush);

  const oesd = draws(parseCards('9h8d'), parseCards('7c6s2d'));
  assert(oesd.openEnded, 'T or 5 completes: open ended');

  const gut = draws(parseCards('9h8d'), parseCards('6c5s2d'));
  assert(gut.gutshot, 'only a 7 completes: gutshot');
  assert(!gut.openEnded);

  const bd = draws(parseCards('AcKc'), parseCards('Qc5d2h'));
  assert(bd.backdoorFlush);
});

test('reads board texture', () => {
  const wet = boardTexture(parseCards('Jh Th 9c'));
  assert(wet.connected);
  assert(wet.twoTone);
  assertEqual(wet.label, 'wet');

  const dry = boardTexture(parseCards('Kd 7c 2s'));
  assert(dry.rainbow);
  assert(!dry.connected);
  assertEqual(dry.label, 'dry');

  const mono = boardTexture(parseCards('Ah Kh 4h'));
  assert(mono.monotone);
});

suite('ranges');

test('combo counts are the foundation of combinatorics', () => {
  assertEqual(comboCount('AA'), 6);
  assertEqual(comboCount('AKs'), 4);
  assertEqual(comboCount('AKo'), 12);
  assertEqual(expandLabel('AA').length, 6);
  assertEqual(expandLabel('AKs').length, 4);
  assertEqual(expandLabel('AKo').length, 12);
});

test('the whole grid accounts for all 1326 combinations', () => {
  const all = GRID.flat();
  assertEqual(all.length, 169);
  assertEqual(all.reduce((sum, l) => sum + comboCount(l), 0), 1326);
});

test('labels hands canonically', () => {
  assertEqual(handLabel(parseCards('AcKc')), 'AKs');
  assertEqual(handLabel(parseCards('KdAc')), 'AKo');
  assertEqual(handLabel(parseCards('7c7d')), '77');
});

test('parses range notation', () => {
  const pairs = parseRange('TT+');
  assertEqual(pairs.size, 5);
  assert(pairs.has('AA') && pairs.has('TT') && !pairs.has('99'));

  const aces = parseRange('ATs+');
  assertEqual(aces.size, 4);
  assert(aces.has('AKs') && aces.has('ATs') && !aces.has('A9s'));

  const dash = parseRange('AA-JJ');
  assertEqual(dash.size, 4);

  const diag = parseRange('T9s-76s');
  assert(diag.has('T9s') && diag.has('87s') && diag.has('76s'));

  const mixed = parseRange('QQ+, AKs, A5s');
  assertEqual(mixed.size, 5);
});

test('range size converts to a percentage of all hands', () => {
  const s = rangeSize(parseRange('AA'));
  assertEqual(s.combos, 6);
  assertClose(s.percent, 6 / 1326, 0.0001);

  const wide = rangeSize(parseRange('22+, A2s+'));
  assertEqual(wide.combos, 13 * 6 + 12 * 4);
});

test('equity against a range sits between its best and worst case', () => {
  const r = equityVsRange(parseCards('AcAd'), parseRange('KK, QQ, AKs'), [], { trials: 3000, seed: 5 });
  assert(r.equity > 0.7 && r.equity < 0.95, `got ${r.equity}`);
});
