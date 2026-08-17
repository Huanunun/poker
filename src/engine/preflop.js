/**
 * Baseline preflop reference ranges for 6-max, 100bb, no ante.
 *
 * These are deliberately *simplified* solver-adjacent ranges, not solver output.
 * The system's whole premise is that a learner should be able to reconstruct a
 * range from principles, so every entry carries the reason it looks the way it
 * does. A chart the learner can regenerate from ideas beats a chart they
 * memorised and cannot repair when the game changes.
 */

import { parseRange, rangeSize } from './ranges.js';

export const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

/**
 * Table sizes this course covers: cash games, 6 to 10 players, 100bb.
 *
 * Seat names differ by table size, and this matters more than it looks. "Under
 * the gun" at a 6-handed table has four players behind; at a 9-handed table it
 * has seven, and the same hand is a comfortable open in one and a clear fold in
 * the other. Teaching one set of ranges for "UTG" without saying how many
 * players are at the table is how people end up playing a full-ring game with
 * 6-max ranges and losing steadily.
 */
export const TABLE_SIZES = {
  6: {
    players: 6,
    name: '6-handed',
    seats: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
    openSize: 2.5,
    note: 'Short-handed. Ranges are wide everywhere because the blinds come around fast.',
  },
  8: {
    players: 8,
    name: '8-handed',
    seats: ['UTG', 'UTG1', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
    openSize: 2.5,
    note: 'The common live and online middle ground. Closer to full ring than to 6-max.',
  },
  9: {
    players: 9,
    name: '9-handed',
    seats: ['UTG', 'UTG1', 'UTG2', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
    openSize: 3,
    note: 'Full ring. Early seats are very tight; the money is made on the button and in the blinds.',
  },
  10: {
    players: 10,
    name: '10-handed',
    seats: ['UTG', 'UTG1', 'UTG2', 'MP1', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
    openSize: 3,
    note: 'Typical live full ring. Tighter still up front, and opens are usually larger because more players call.',
  },
};

/**
 * Full-ring opening ranges, by seat.
 *
 * Simplified and reconstructible rather than solver-exact — the point is that a
 * learner can rebuild them by counting players behind, not that they match a
 * solve to the combination.
 */
export const FULL_RING_RFI = {
  UTG: '77+, ATs+, KQs, AQo+',
  UTG1: '66+, A9s+, KJs+, QJs, AJo+',
  UTG2: '55+, A8s+, KTs+, QTs+, JTs, AJo+, KQo',
  MP1: '55+, A8s+, KTs+, QTs+, JTs, ATo+, KQo',
  LJ: '44+, A7s+, KTs+, QTs+, J9s+, T9s, ATo+, KQo',
  HJ: '33+, A5s+, K9s+, Q9s+, J9s+, T8s+, 98s, ATo+, KJo+, QJo',
  CO: '22+, A2s+, K8s+, Q9s+, J9s+, T8s+, 97s+, 87s, 76s, A9o+, KTo+, QTo+, JTo',
  BTN: '22+, A2s+, K5s+, Q7s+, J7s+, T7s+, 96s+, 86s+, 75s+, 65s, 54s, A5o+, K8o+, Q9o+, J9o+, T9o',
  SB: '22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 76s, A7o+, K9o+, Q9o+, JTo',
};

/** Seats in order, with how many players still act behind at a given size. */
export function seatsFor(tableSize) {
  const table = TABLE_SIZES[tableSize] || TABLE_SIZES[9];
  return table.seats.map((seat, index) => ({
    seat,
    // Everyone after this seat, excluding the blinds' preflop option.
    behind: table.seats.length - index - 1,
    isBlind: seat === 'SB' || seat === 'BB',
  }));
}

/** The opening range for a seat at a given table size. */
export function openingRange(tableSize, seat) {
  if (Number(tableSize) <= 6) return RFI[seat] ?? RFI.CO;
  return FULL_RING_RFI[seat] ?? FULL_RING_RFI.CO;
}

/**
 * How much to open, and why.
 *
 * The size is not a matter of taste. It is set by how many players are behind
 * and how sticky they are: more callers means a bigger raise, because you need
 * to charge each of them and you want fewer of them.
 */
export function openSizeFor(tableSize, { limpers = 0, sticky = false } = {}) {
  const table = TABLE_SIZES[tableSize] || TABLE_SIZES[9];
  const base = table.openSize + (sticky ? 0.5 : 0);
  const size = base + limpers;
  return {
    size,
    base: table.openSize,
    steps: [
      `At a ${table.name} table the standard open is ${table.openSize} big blinds.`,
      limpers
        ? `Add one big blind for each of the ${limpers} limper${limpers > 1 ? 's' : ''}: +${limpers}.`
        : 'Nobody has limped, so no addition.',
      sticky ? 'These players call too much, so add half a blind to charge them properly.' : null,
      `Open to ${size} big blinds.`,
    ].filter(Boolean),
  };
}

export const POSITION_INFO = {
  UTG: {
    name: 'Under the gun',
    seatsBehind: 5,
    idea: 'Five players still to act. Every hand you open has to beat five chances of being woken up by something better.',
  },
  MP: {
    name: 'Middle position',
    seatsBehind: 4,
    idea: 'One fewer opponent than under the gun, so the door opens slightly.',
  },
  CO: {
    name: 'Cutoff',
    seatsBehind: 3,
    idea: 'Only three left, and you often end up in position. Suited and connected hands become playable.',
  },
  BTN: {
    name: 'Button',
    seatsBehind: 2,
    idea: 'Two blinds left, and you act last on every future street. Position is worth more than card strength here.',
  },
  SB: {
    name: 'Small blind',
    seatsBehind: 1,
    idea: 'You already have money in, but you act first for the rest of the hand. That is the worst trade in poker.',
  },
  BB: {
    name: 'Big blind',
    seatsBehind: 0,
    idea: 'You are getting a discount to continue because your blind is already invested, so you defend far wider than anywhere else.',
  },
};

/** Raise-first-in ranges by position. */
export const RFI = {
  UTG: '77+, ATs+, KTs+, QTs+, JTs, AQo+',
  MP: '66+, A9s+, KTs+, QTs+, JTs, T9s, AJo+, KQo',
  CO: '44+, A2s+, K9s+, Q9s+, J9s+, T8s+, 98s, 87s, ATo+, KJo+, QJo',
  BTN: '22+, A2s+, K5s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 75s+, 65s, A8o+, K9o+, Q9o+, J9o+, T9o',
  SB: '22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 76s, A7o+, K9o+, Q9o+, JTo',
};

export const RFI_REASONING = {
  UTG: 'Tight and top-heavy. Nearly every hand here is either a pair, an ace with a good kicker, or two big suited cards. Nothing speculative, because five players can still punish you.',
  MP: 'Almost the same shape as under the gun, loosened by one notch across the board.',
  CO: 'The first position where suited connectors appear. With three players left you will take the pot uncontested often enough to open hands that need to flop well.',
  BTN: 'By far the widest opening range. You will be in position for the entire hand, and only two players can stop you, so almost half of all hands are profitable opens.',
  SB: 'Wide in card strength but played carefully, because you will be out of position for the whole hand if the big blind calls.',
};

/** Facing a raise: which hands 3-bet, which flat. */
export const VS_RFI = {
  BTN_vs_CO: {
    threeBet: 'JJ+, AQs+, A5s, A4s, KQs',
    call: '22-TT, ATs-AJs, KJs, QJs, JTs, T9s, AQo',
    idea: 'The 3-bet range is split: big hands for value, and low suited aces as bluffs because they block their strong aces while still flopping well.',
  },
  BB_vs_BTN: {
    threeBet: 'TT+, AJs+, KQs, A5s-A2s, 76s',
    call: '22-99, A2s-ATs, K5s+, Q8s+, J8s+, T8s+, 97s+, 87s, A8o+, KTo+, QTo+, JTo',
    idea: 'You are getting a big discount to continue, so you defend an enormous number of hands. Folding too much here is the most common leak in the game.',
  },
  BB_vs_UTG: {
    threeBet: 'QQ+, AKs, AKo, A5s',
    call: '22-JJ, A9s-AJs, KTs+, QTs+, J9s+, T9s, 98s, AQo, KQo',
    idea: 'Their range is strong, so you defend much less than against a button open, and your 3-bets are nearly all pure value.',
  },
};

/**
 * The principle stack. Every chart entry above is an application of one of
 * these; the curriculum teaches the principles and then has the learner
 * rebuild the charts, rather than the reverse.
 */
export const PREFLOP_PRINCIPLES = [
  {
    id: 'players-behind',
    title: 'Every player behind you costs you hands',
    body: 'A hand is playable when it is likely to be the best one at the table. Each extra opponent yet to act is another chance someone holds better, so ranges tighten as you move away from the button.',
  },
  {
    id: 'position-value',
    title: 'Acting last is worth more than most card strength',
    body: 'Seeing what everyone does before you decide is information, and information is money. That is why the button opens roughly three times as many hands as under the gun with the same deck.',
  },
  {
    id: 'suitedness',
    title: 'Suited is worth about 2 to 4 percent, and much more than that in playability',
    body: 'Making a flush is rare, but the possibility of one lets you continue on more flops with a real chance to improve. Suited hands are not stronger so much as easier to play.',
  },
  {
    id: 'connectedness',
    title: 'Connected cards make the hands that win big pots',
    body: 'Straights and two pair are how you get paid off by top pair. Gaps cost you straight combinations, which is why 76s outperforms 72s far more than one rank difference suggests.',
  },
  {
    id: 'domination',
    title: 'Avoid hands that are behind when they hit',
    body: 'K7 makes top pair and is still losing to KT, KJ, KQ, AK. A hand that flops well but is beaten when it does is the most expensive kind of hand for a beginner.',
  },
  {
    id: 'discount',
    title: 'Money already in the pot is not yours, but it does change the price',
    body: 'In the big blind you are being offered a discount on continuing. That single fact is why the big blind defends more hands than any other seat.',
  },
];

/** Look up whether a label is in a position's opening range. */
export function shouldOpen(position, label) {
  const range = parseRange(RFI[position] || '');
  return range.has(label);
}

/** Summary stats used by the range-grid lessons. */
export function rangeStats(position) {
  const set = parseRange(RFI[position] || '');
  const size = rangeSize(set);
  return { position, ...size, range: set };
}

/** Ordered list for the "which is wider?" comparison drills. */
export function openingWidths() {
  return Object.keys(RFI).map((p) => {
    const s = rangeStats(p);
    return { position: p, percent: s.percent, combos: s.combos };
  });
}
