/**
 * Level 2 — Call or fold. Roughly days 36 to 90.
 *
 * The first of the five decisions, taken seriously. Level 1 established that a
 * call is priced by equity against pot odds; this level covers every case where
 * that price is not the whole story — position, stack depth, what happens on
 * later streets, and how many players are in.
 *
 * The through-line: pot odds give you a floor, never a verdict.
 */

export const LEVEL_2 = {
  level: 2,
  name: 'Call or Fold',
  subtitle: 'When the price is right, and when it lies',
  promise: 'Never again call because the pot is big, or fold because the hand feels weak.',
  lessons: [
    {
      id: 'l2-01',
      unit: 'Facing a bet',
      title: 'Reading the size before the cards',
      skill: 'facing-bets',
      minutes: 20,
      concepts: [
        {
          title: 'The price arrives before the decision',
          body: 'When someone bets, the first thing to register is not your hand — it is the size, because that alone tells you what you need.\n\nA third-pot bet needs 20%. A pot-sized bet needs 33%. Register that number first, and then ask whether your hand clears it. Doing it in that order stops you talking yourself into a call you had already decided on.',
        },
      ],
      drills: [{ gen: 'bet-size-price', count: 4 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Read the size first, get the number, then look at your hand.',
    },
    {
      id: 'l2-02',
      unit: 'Facing a bet',
      title: 'Calling with a draw',
      skill: 'facing-bets',
      minutes: 25,
      concepts: [
        {
          title: 'A draw is a real share of the pot',
          body: 'A flush draw on the flop is roughly 35% to get there by the river, and about 19% on the next card alone. Against a half-pot bet needing 25%, that one-card number is a fold on raw pot odds and the two-card number is a call.\n\nWhich one applies depends entirely on whether you will be paying again on the turn. That is the whole skill in calling with draws.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }, { gen: 'outs-chain', count: 1 }],
      takeaway: 'Draws are priced on cards you actually get to see for this price.',
    },
    {
      id: 'l2-03',
      unit: 'Facing a bet',
      title: 'Bluff-catching',
      skill: 'facing-bets',
      minutes: 25,
      concepts: [
        {
          title: 'When your hand only beats bluffs',
          body: 'Often you hold a hand that beats everything they are bluffing with and loses to everything they are value betting with. Your own cards then stop mattering almost entirely.\n\nThe only question is how much of their betting range is bluffs. If that share is bigger than the price, you call — with any hand in that category, not just the prettiest one.',
        },
      ],
      drills: [{ gen: 'river-call-combos', count: 2 }, { gen: 'bet-size-price', count: 2 }],
      takeaway: 'Bluff-catchers are all the same hand. Call based on their range, not your cards.',
    },
    {
      id: 'l2-04',
      unit: 'When the price lies',
      title: 'Implied odds: the money still to come',
      skill: 'implied-odds',
      minutes: 25,
      concepts: [
        {
          title: 'You often win more than what is in the pot now',
          body: 'A gutshot is about 16% on the flop and a half-pot bet needs 25%. Raw pot odds say fold. But if you hit and they pay you another 8bb, the pot you are really playing for is much larger, and the call turns profitable.\n\nThat is implied odds: counting the money you expect to win later.',
        },
        {
          title: 'Three conditions, all required',
          body: 'The extra money only exists if they have a deep stack, they have a hand strong enough to pay you, and your draw is hidden enough that they will.\n\nAgainst a short stack, or when the third heart is obvious to everyone, implied odds are close to zero. If you find yourself invoking them on every marginal call, you have stopped calculating and started hoping.',
        },
      ],
      drills: [{ gen: 'implied-odds-chain', count: 3 }],
      takeaway: 'Implied odds need a deep stack, a payable hand, and a disguised draw. All three.',
    },
    {
      id: 'l2-05',
      unit: 'When the price lies',
      title: 'Reverse implied odds: the money you lose after calling',
      skill: 'fold-discipline',
      minutes: 30,
      concepts: [
        {
          title: 'The hand that calls once and folds later',
          body: 'Pot odds price this street. They quietly assume the hand ends here — and it does not.\n\nWith a weak made hand out of position, you call this bet and then face another on the turn. You cannot call three bets with second pair and a bad kicker, so you will often pay now and fold later anyway. That later money is a real cost of calling now.',
        },
        {
          title: 'When to fold at a price that says call',
          body: 'The signal is a hand that is probably ahead right now but cannot stand pressure: weak pairs, dominated top pairs, out of position, deep stacks.\n\nBeing offered 25% and having 28% is not enough when your hand will be folded on half of all turn cards. The pot odds were correct about this street and wrong about the hand.',
        },
      ],
      drills: [{ gen: 'reverse-implied', count: 3 }],
      takeaway: 'Pot odds price one street. Weak hands out of position pay again and again.',
    },
    {
      id: 'l2-06',
      unit: 'When the price lies',
      title: 'Position changes what a hand is worth',
      skill: 'position',
      minutes: 25,
      concepts: [
        {
          title: 'Equity you cannot collect is not equity',
          body: 'Two hands with identical equity are not worth the same. In position you see what they do before you decide, so you get to keep most of your share. Out of position you get bet off hands that were ahead.\n\nAs a rough working figure, the same hand is worth several percentage points less out of position — enough to turn a thin call into a fold.',
        },
      ],
      drills: [{ gen: 'table-size-effect', count: 2 }, { gen: 'reverse-implied', count: 2 }],
      takeaway: 'Out of position you realise less of your equity. Marginal calls become folds.',
    },
    {
      id: 'l2-07',
      unit: 'When the price lies',
      title: 'Stack depth and commitment',
      skill: 'spr',
      minutes: 25,
      concepts: [
        {
          title: 'One number decides how much hand you need',
          body: 'Divide the stack behind by the pot. Under 3, one pair is usually worth your stack. Between 3 and 7, you want two pair or better. Over 7, keep the pot small unless you have a monster.\n\nWork it out on the flop, before the decisions get hard. It tells you in advance what you are playing for, which is much easier than working it out on the river with your stack in the middle.',
        },
        {
          title: 'At 100 big blinds you are rarely committed',
          body: 'This course assumes 100bb stacks, which means a single-raised pot has a high stack-to-pot ratio and top pair is not a hand you should be getting all in with.\n\nThat one fact prevents a large share of beginner stack-offs.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 4 }],
      takeaway: 'SPR under 3 commits with one pair. Over 7, keep the pot small.',
    },
    {
      id: 'l2-08',
      unit: 'Multiway',
      title: 'Calling with players still behind you',
      skill: 'multiway',
      minutes: 25,
      concepts: [
        {
          title: 'The price is not the price if someone can raise',
          body: 'You are getting 25% and you have 30%, so you call — except two players are still to act behind you, and one of them may raise. Then you have put money in at a good price and are facing a bad one.\n\nWith players left to act, tighten. The pot odds you can see are the best case, not the actual case.',
        },
      ],
      drills: [{ gen: 'multiway-equity', count: 3 }, { gen: 'multiway-decision', count: 1 }],
      takeaway: 'Players still to act can change the price after you have paid it. Tighten up.',
    },
    {
      id: 'l2-09',
      unit: 'Multiway',
      title: 'Equity collapses with more players',
      skill: 'multiway',
      minutes: 25,
      concepts: [
        {
          title: 'Aces against five opponents',
          body: 'Pocket aces beat one random hand 85% of the time. Against five, they win about 49% — still the best hand at the table, and now a coin flip.\n\nAt a 9 or 10-handed table this matters constantly. Every extra player is another chance for someone to make something.',
        },
        {
          title: 'Which hands gain and which lose',
          body: 'Multiway, hands that make *big* hands gain: small pairs that can flop a set, suited connectors that can make straights and flushes. Hands that make one pair lose, because one pair rarely wins a four-way pot.\n\nSo ace-queen offsuit is strong heads-up and mediocre five-way, with the same two cards.',
        },
      ],
      drills: [{ gen: 'multiway-equity', count: 4 }],
      takeaway: 'Multiway: drawing hands gain, one-pair hands lose. Raise to cut the field.',
    },
    {
      id: 'l2-10',
      unit: 'The river',
      title: 'River calls are pure counting',
      skill: 'river-decisions',
      minutes: 30,
      concepts: [
        {
          title: 'No cards left means no equity to estimate',
          body: 'On the river there is nothing left to come. You either have the best hand or you do not, and there is no percentage to work out.\n\nWhat replaces it is counting: how many hands in their range beat you, how many do not. That ratio is how often you are good, and you compare it to the price exactly as before.',
        },
        {
          title: 'This is the most solvable spot in poker',
          body: 'And the one where people most often guess. If you can name their value hands and their bluffs and count the combinations, the river becomes arithmetic.\n\nA useful sanity check: for a pot-sized bet you need to be right 33% of the time. If you can name three value hands for every bluff, folding is correct.',
        },
      ],
      drills: [{ gen: 'river-call-combos', count: 3 }],
      takeaway: 'River: count their value combos against their bluff combos, compare to the price.',
    },
    {
      id: 'l2-11',
      unit: 'The river',
      title: 'How often do people actually bluff?',
      skill: 'facing-bets',
      minutes: 25,
      concepts: [
        {
          title: 'Less than the theory assumes',
          body: 'Balanced play says a pot-sized river bet should be about a third bluffs. Most opponents, especially at low stakes, bluff far less than that — often almost never.\n\nAgainst those players, folding more than the theoretical minimum is correct and profitable. The theory tells you what an unexploitable opponent would require. Your actual opponent is usually much more honest.',
        },
        {
          title: 'The exception that costs the most',
          body: 'The opposite error also exists: against an aggressive regular who bluffs constantly, folding your bluff-catchers is exactly what they are counting on.\n\nSo the river call is the spot where knowing your opponent is worth the most. Everything else can be played reasonably well on maths alone.',
        },
      ],
      drills: [{ gen: 'river-call-combos', count: 2 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Most opponents under-bluff. Over-fold against them, and never against the aggressive ones.',
    },
    {
      id: 'l2-12',
      unit: 'Before the flop',
      title: 'Defending the big blind',
      skill: 'blind-defence',
      minutes: 25,
      concepts: [
        {
          title: 'You already have money in',
          body: 'When someone raises to 3bb and you are in the big blind, calling costs 2bb, not 3 — your blind is already in the middle. That is a discount nobody else at the table is getting, and it works out to needing roughly 25 to 30%.\n\nAn enormous number of hands beat that against a wide opening range.',
        },
        {
          title: 'Wide, but with hands that can continue',
          body: 'The discount says defend widely; being out of position for the rest of the hand says be careful. The resolution is to defend wide with hands that make something — suited, connected, pairs — and fold the weak offsuit hands that make one pair and then face three bets.',
        },
      ],
      drills: [{ gen: 'bb-defence', count: 3 }],
      takeaway: 'The big blind gets a discount. Defend wide, with hands that can keep going.',
    },
    {
      id: 'l2-13',
      unit: 'Before the flop',
      title: 'Folding before the flop',
      skill: 'starting-hands',
      minutes: 25,
      concepts: [
        {
          title: 'Most hands are folds and that is fine',
          body: 'At a 9-handed table you will fold something like 80% of your hands before the flop. That is not being passive, it is the game — you are waiting for spots where you have an edge, and most of the time you do not.\n\nThe players who lose steadily are almost always the ones playing too many hands, not too few.',
        },
        {
          title: 'The dominated hands that cost the most',
          body: 'Weak aces and weak kings offsuit are the classic traps. They make top pair and lose to every better version of top pair.\n\nA hand that misses is cheap. A hand that hits and is still second best is what empties a stack.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 4 }, { gen: 'table-size-effect', count: 2 }],
      takeaway: 'Folding most hands is correct. Beware hands that hit and are still beaten.',
    },
    {
      id: 'l2-14',
      unit: 'Putting it together',
      title: 'Level 2 checkpoint',
      skill: 'facing-bets',
      minutes: 30,
      checkpoint: true,
      concepts: [
        {
          title: 'You can defend properly now',
          body: 'You can price a call, adjust for position and stack depth, recognise when the price is lying to you, count a river decision, and defend a big blind at something close to the right frequency.\n\nNext: the other side. Deciding when to put money in first.',
        },
      ],
      drills: [
        { gen: 'call-or-fold', count: 2 },
        { gen: 'reverse-implied', count: 1 },
        { gen: 'implied-odds-chain', count: 1 },
        { gen: 'river-call-combos', count: 1 },
        { gen: 'spr-plan', count: 2 },
        { gen: 'multiway-equity', count: 2 },
        { gen: 'bb-defence', count: 1 },
      ],
      takeaway: 'Calling and folding are solved. Now the aggressive half of the game.',
    },
  ],
};
