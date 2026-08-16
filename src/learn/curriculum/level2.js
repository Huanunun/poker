/**
 * Level 2 — The maths, built from counting. Roughly days 31 to 90.
 *
 * This is the level the whole course exists for. The promise is that a learner
 * with no mathematical background can end it genuinely fluent in poker odds,
 * because nothing here is ever presented as a formula to apply. Every number is
 * arrived at by counting things and dividing once.
 *
 * The shortcuts (rule of 2 and 4, the fixed prices of standard bet sizes) are
 * deliberately withheld until the learner has computed them the long way often
 * enough that the shortcut reads as a discovery rather than an instruction.
 */

export const LEVEL_2 = {
  level: 2,
  name: 'The Maths',
  subtitle: 'Counting, not formulas',
  promise: 'Know the price of every decision, in seconds, without a calculator.',
  lessons: [
    {
      id: 'l2-01',
      unit: 'Counting outs',
      title: 'An out is a card that saves you',
      skill: 'outs-counting',
      minutes: 20,
      concepts: [
        {
          title: 'Count the cards, not the concept',
          body: 'An out is a specific card that turns your losing hand into a winning one. Not "a heart" — the actual hearts, each one a separate card in a 52-card deck.\n\nWith four hearts between your hand and the board, there are thirteen hearts in total and you can see four, so nine remain. Nine outs. You did not need a formula, you counted.',
        },
        {
          title: 'The standard counts',
          body: 'Flush draw: 9. Open-ended straight draw: 8. Gutshot: 4. Two overcards: 6. These are not rules to memorise — count them once each and you will never need to look them up, because the counting takes two seconds.',
        },
      ],
      drills: [{ gen: 'spot-draws', count: 3 }, { gen: 'outs-chain', count: 2 }],
      takeaway: 'An out is a specific card. Count them; do not estimate them.',
    },
    {
      id: 'l2-02',
      unit: 'Counting outs',
      title: 'Dirty outs: the cards that betray you',
      skill: 'outs-counting',
      minutes: 25,
      concepts: [
        {
          title: 'Some outs are already beaten',
          body: 'You hold two hearts and the flop has two hearts. Nine outs, obviously. But if your opponent has a set, two of those hearts pair the board and give them a full house — you make your flush and lose your stack.\n\nThose are dirty outs. The card arrives, you celebrate, and you are still behind.',
        },
        {
          title: 'Count against their hand, not in the abstract',
          body: 'The honest question is never "how many cards make my hand?" but "how many cards make my hand *better than theirs*?" Those are different numbers and the gap is where beginners lose money.\n\nThe drills here show their hand face up so you can see the difference directly. At the table you will be estimating, but you will be estimating the right thing.',
        },
      ],
      drills: [{ gen: 'outs-chain', count: 3 }],
      takeaway: 'Count outs that beat their hand, not outs that improve yours.',
    },
    {
      id: 'l2-03',
      unit: 'Counting outs',
      title: 'Outs into a percentage',
      skill: 'outs-to-equity',
      minutes: 20,
      concepts: [
        {
          title: 'One division, that is all',
          body: 'Nine outs, 47 unseen cards. Nine divided by 47 is a bit under one in five, so roughly 19%.\n\nThat is the entire calculation for the next card. Count the good ones, divide by the unseen ones. No formula, no memorisation, and it works for any number of outs on any street.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 5, params: { street: 'turn' } }],
      takeaway: 'Outs divided by unseen cards. That is your chance of hitting on the next card.',
    },
    {
      id: 'l2-04',
      unit: 'Counting outs',
      title: 'Two cards to come',
      skill: 'outs-to-equity',
      minutes: 25,
      concepts: [
        {
          title: 'Two chances, but not quite double',
          body: 'On the flop you will see two more cards, so you get two attempts. Roughly, that doubles your chance — nine outs is about 19% on one card and about 35% across two.\n\nIt is not exactly double, because sometimes both cards are outs and you only needed one. That overlap is why the doubling slightly overstates things, and it matters more the more outs you have.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 5, params: { street: 'flop' } }],
      takeaway: 'Two cards to come is nearly twice one card, slightly less because of overlap.',
    },
    {
      id: 'l2-05',
      unit: 'Counting outs',
      title: 'The shortcut you just derived',
      skill: 'outs-to-equity',
      minutes: 20,
      concepts: [
        {
          title: 'Times two, or times four',
          body: 'You have now done this enough times to see the pattern. One card to come: multiply your outs by 2. Two cards to come: multiply by 4.\n\nNine outs on the turn is 18%, and the true answer is 19.6%. Nine outs on the flop is 36%, true answer 35%. Close enough to act on, every time.',
        },
        {
          title: 'Where it breaks',
          body: 'The times-four version drifts high when you have a lot of outs. With fifteen outs it says 60% and the truth is nearer 54%. Above about eight outs, shade it down a few points.\n\nThat is not a flaw to worry about. Knowing where your shortcut is wrong is what makes it safe to use.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 6 }],
      takeaway: 'Times 2 for one card, times 4 for two. Shade down above 8 outs.',
    },
    {
      id: 'l2-06',
      unit: 'The price',
      title: 'What the pot is offering you',
      skill: 'pot-odds',
      minutes: 25,
      concepts: [
        {
          title: 'Your money as a share of the pot',
          body: 'There is 100 in the pot and they bet 50. If you call, the pot becomes 200 and 50 of it is yours. Your money is a quarter of the pot you are playing for.\n\nSo you need to win at least a quarter of the time. That is pot odds, and it is one division: your call, divided by the final pot.',
        },
        {
          title: 'Include your own call',
          body: 'The mistake is dividing by the pot *before* your call. The pot you win includes the chips you are about to put in, so they belong in the denominator.\n\nGet this one detail right and pot odds are permanently easy.',
        },
      ],
      drills: [{ gen: 'pot-odds-chain', count: 3 }],
      takeaway: 'Your call divided by the final pot, including your call. That is the equity you need.',
    },
    {
      id: 'l2-07',
      unit: 'The price',
      title: 'Every bet size has a fixed price',
      skill: 'break-even',
      minutes: 25,
      concepts: [
        {
          title: 'The stakes do not matter',
          body: 'A half-pot bet always requires 25%. Always — at 2 chips or 2,000. A pot-sized bet always requires 33%. These are properties of the *fraction*, not the amounts.\n\nOnce you see that, most table arithmetic disappears. You stop calculating and start recognising.',
        },
        {
          title: 'The five you will meet',
          body: 'One third of the pot needs 20%. Half needs 25%. Two thirds needs 29%. Three quarters needs 30%. A pot-sized bet needs 33%.\n\nYou derived every one of these in the last lesson. They are yours now, not memorised.',
        },
      ],
      drills: [{ gen: 'bet-size-price', count: 6 }],
      takeaway: 'Third: 20%. Half: 25%. Two thirds: 29%. Three quarters: 30%. Pot: 33%.',
    },
    {
      id: 'l2-08',
      unit: 'The price',
      title: 'Ratios, and why percentages are better',
      skill: 'pot-odds',
      minutes: 20,
      concepts: [
        {
          title: 'Three to one, translated',
          body: 'Older books say "you are getting 3 to 1". That means you win 3 for every 1 you risk, so you need to win 1 time in 4 — which is 25%.\n\nRatios are fine, but they need a translation step before you can compare them to your equity, which you already hold as a percentage. Skip the translation and work in percentages throughout.',
        },
      ],
      drills: [{ gen: 'pot-odds-chain', count: 2 }, { gen: 'bet-size-price', count: 4 }],
      takeaway: 'Ratios convert to percentages by adding the parts. Work in percentages and skip the step.',
    },
    {
      id: 'l2-09',
      unit: 'The decision',
      title: 'Two numbers, one comparison',
      skill: 'facing-bets',
      minutes: 30,
      concepts: [
        {
          title: 'The whole of poker, briefly',
          body: 'You have an equity: how often you win. You have a price: how often you need to win. If equity is bigger, call. If it is smaller, fold.\n\nEverything else in this course is about estimating those two numbers more accurately in harder situations. The comparison itself never gets more complicated than this.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }],
      takeaway: 'Equity versus price. Bigger, call. Smaller, fold.',
    },
    {
      id: 'l2-10',
      unit: 'The decision',
      title: 'Calling with a draw',
      skill: 'facing-bets',
      minutes: 25,
      concepts: [
        {
          title: 'Only count the cards still to come',
          body: 'On the flop facing a bet, be careful: you get to see the turn for the price of this call, but you may have to pay again to see the river. If they will bet the turn too, count one card, not two.\n\nBeginners use the times-four number when facing a flop bet and talk themselves into calls they cannot afford. Use times four only when the money is already all in.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }],
      takeaway: 'Facing a flop bet, count one card unless you are going all in.',
    },
    {
      id: 'l2-11',
      unit: 'Expected value',
      title: 'What a decision is worth in chips',
      skill: 'ev-basics',
      minutes: 30,
      concepts: [
        {
          title: 'Winnings times how often, minus cost times how often',
          body: 'Expected value turns "this is a good call" into "this call makes 4 chips". You win the pot some of the time and lose your call the rest.\n\nEV = (how often you win × what you win) − (how often you lose × what it costs). Two multiplications and a subtraction.',
        },
        {
          title: 'Why it is worth the effort',
          body: 'Because it makes size visible. Two calls can both be correct, and one can be worth ten times the other. Knowing which spots are worth the most is how you decide where to focus.',
        },
      ],
      drills: [{ gen: 'ev-of-call', count: 3 }],
      takeaway: 'EV puts a number on a decision. Positive means it makes money, however this hand turns out.',
    },
    {
      id: 'l2-12',
      unit: 'Expected value',
      title: 'Sunk costs are not yours any more',
      skill: 'ev-basics',
      minutes: 20,
      concepts: [
        {
          title: 'The chips in the pot are not your chips',
          body: '"I have already put so much in, I have to call." No. The money in the pot is gone regardless of what you do next. It is not yours and calling does not recover it.\n\nThe only question is whether *this* call, with *this* equity, at *this* price, makes money. What you invested earlier changes nothing about that.',
        },
        {
          title: 'It cuts both ways',
          body: 'It also means you should not fold out of embarrassment about the money already in. The pot being large is precisely what makes your price good. Big pots justify thin calls; that is the arithmetic working in your favour.',
        },
      ],
      drills: [{ gen: 'ev-of-call', count: 2 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Money already in the pot is not yours. It changes the price, not the ownership.',
    },
    {
      id: 'l2-13',
      unit: 'Expected value',
      title: 'Good decisions that lose',
      skill: 'variance',
      minutes: 25,
      concepts: [
        {
          title: 'You will lose most of the pots you should win',
          body: 'With 80% equity you lose one time in five. Over an evening, that will happen several times, and it will feel like being cheated.\n\nIt is not. It is the 20% doing exactly what 20% does. A decision is good or bad before the cards come, and nothing that happens afterwards changes it.',
        },
        {
          title: 'Results teach the wrong lesson',
          body: 'This is the real danger. If you judge plays by outcomes, you will learn to avoid the correct calls that happened to lose, and repeat the terrible ones that happened to win.\n\nJudge by the decision, made with the information you had. It is the only standard that improves you.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 4 }, { gen: 'ev-of-call', count: 2 }],
      takeaway: 'Judge the decision, not the result. Results are too noisy to learn from.',
    },
    {
      id: 'l2-14',
      unit: 'Expected value',
      title: 'How long is the long run?',
      skill: 'variance',
      minutes: 20,
      concepts: [
        {
          title: 'Longer than you think',
          body: 'A solid winning player can lose over ten thousand hands. That is weeks or months of casual play. The edge is real and the noise is simply bigger than the edge over short samples.\n\nThe practical consequence: you cannot use your recent results to evaluate your play. You have to evaluate the decisions directly, which is why the review habit matters so much.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 3 }, { gen: 'bankroll-check', count: 2 }],
      takeaway: 'Your results over weeks say almost nothing about your skill. Review decisions instead.',
    },
    {
      id: 'l2-15',
      unit: 'Estimating',
      title: 'Equity without a calculator',
      skill: 'equity-intuition',
      minutes: 30,
      concepts: [
        {
          title: 'Anchors, then adjust',
          body: 'You will not compute exact equities at the table. You will recognise situations. A flush draw against one pair is about 35% on the flop. A pair against two overcards is about 55%. Two overcards against a lower pair is about 45%.\n\nLearn a handful of anchors, then adjust up or down for what is different about the spot in front of you.',
        },
      ],
      drills: [{ gen: 'equity-vs-range', count: 4 }],
      takeaway: 'Learn a few anchor equities and adjust. Precision is for study; recognition is for the table.',
    },
    {
      id: 'l2-16',
      unit: 'Estimating',
      title: 'Preflop equities are all quite close',
      skill: 'equity-intuition',
      minutes: 25,
      concepts: [
        {
          title: 'Nothing is a huge favourite against a range',
          body: 'Aces are 85% against one random hand, but only around 65% against the range someone actually raises with. The worst hand in the deck still has roughly a third against a strong range.\n\nPreflop equities are compressed. This is why preflop decisions are mostly about position and playability rather than about being ahead right now.',
        },
      ],
      drills: [{ gen: 'equity-vs-range', count: 5 }],
      takeaway: 'Against real ranges, preflop equities cluster between 35% and 65%.',
    },
    {
      id: 'l2-17',
      unit: 'Estimating',
      title: 'More opponents, less equity',
      skill: 'multiway',
      minutes: 25,
      concepts: [
        {
          title: 'Aces against five players',
          body: 'Pocket aces beat one random hand 85% of the time. Against five random hands, they win about 49%. Still the best hand at the table, but now a coin flip.\n\nEvery extra player is another chance for someone to make something. Hands that need to hit — suited connectors, small pairs — go up in value multiway. Hands that want to be heads-up — big offsuit cards — go down.',
        },
      ],
      drills: [{ gen: 'equity-vs-range', count: 3 }, { gen: 'open-or-fold', count: 3 }],
      takeaway: 'Multiway: drawing hands gain, big offsuit hands lose. Raise to reduce the field.',
    },
    {
      id: 'l2-18',
      unit: 'Beyond pot odds',
      title: 'The money still to come',
      skill: 'implied-odds',
      minutes: 30,
      concepts: [
        {
          title: 'You win more than what is in the pot now',
          body: 'A gutshot has about 16% on the flop, and a half-pot bet needs 25%. Raw pot odds say fold. But if you hit and they pay you off for another 80, the pot you are really playing for is much larger, and the call becomes correct.\n\nThat is implied odds: counting the money you expect to win later.',
        },
        {
          title: 'Where wishful thinking lives',
          body: 'Implied odds are real and they are also the most abused idea in poker. The extra money only exists if they have a big stack, they have a hand strong enough to pay you, and your draw is hidden enough that they will.\n\nAgainst a short stack, or when the third heart is obvious, implied odds are close to zero. If you find yourself invoking them for every marginal call, you are not calculating, you are hoping.',
        },
      ],
      drills: [{ gen: 'implied-odds-chain', count: 3 }],
      takeaway: 'Implied odds need a deep stack, a payable hand, and a disguised draw. All three.',
    },
    {
      id: 'l2-19',
      unit: 'Beyond pot odds',
      title: 'Stack-to-pot ratio',
      skill: 'spr',
      minutes: 25,
      concepts: [
        {
          title: 'One number that plans the whole hand',
          body: 'Divide the stack behind by the pot. Below 3, one pair is usually worth your stack. Between 3 and 7, you want two pair or better. Above 7, keep the pot small unless you have a monster.\n\nWork it out on the flop, before the decisions get hard. It tells you in advance how much hand you need, which is far easier than working it out on the river with your stack on the line.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 5 }],
      takeaway: 'SPR under 3: one pair commits. Over 7: keep it small. Decide on the flop, not the river.',
    },
    {
      id: 'l2-20',
      unit: 'Beyond pot odds',
      title: 'Blockers: your cards are information',
      skill: 'blockers',
      minutes: 30,
      concepts: [
        {
          title: 'What you hold, they cannot',
          body: 'There are sixteen ways to hold ace-king. If you have an ace, only twelve remain for them. Holding one card of a rank removes a quarter of every hand that uses it.\n\nOn a board where a flush is possible, holding the ace of that suit means they cannot have the nut flush. That single fact can be the whole reason a bluff works.',
        },
        {
          title: 'Free information',
          body: 'This costs you nothing. You already know your own cards; using them to reason about theirs is pure profit. It is also the idea that most separates intermediate players from beginners, because it requires thinking about their range rather than your hand.',
        },
      ],
      drills: [{ gen: 'blocker-count', count: 5 }, { gen: 'combo-count', count: 3 }],
      takeaway: 'Your cards remove combinations from their range. Holding one ace kills a quarter of their aces.',
    },
    {
      id: 'l2-21',
      unit: 'Putting it together',
      title: 'A full decision under pressure',
      skill: 'facing-bets',
      minutes: 35,
      concepts: [
        {
          title: 'The sequence, at speed',
          body: 'What do I have. What can beat me. How many cards fix it. What fraction of the unseen deck is that. What is the price. Compare.\n\nSix steps, and you have practised each one separately. The only new thing here is doing them in a row without stopping.',
        },
      ],
      drills: [
        { gen: 'call-or-fold', count: 3 },
        { gen: 'implied-odds-chain', count: 1 },
        { gen: 'spr-plan', count: 2 },
      ],
      takeaway: 'Hand, threats, outs, fraction, price, compare. Practise the sequence until it is one motion.',
    },
    {
      id: 'l2-22',
      unit: 'Putting it together',
      title: 'Level 2 checkpoint',
      skill: 'pot-odds',
      minutes: 35,
      checkpoint: true,
      concepts: [
        {
          title: 'The maths is done',
          body: 'You can count outs against a real hand, convert them to a percentage two ways, price any bet size instantly, compute expected value, and explain why a losing call can be correct.\n\nThat is genuinely all the arithmetic poker requires. Everything from here is about applying it to situations where the numbers are not handed to you.',
        },
      ],
      drills: [
        { gen: 'outs-chain', count: 1 },
        { gen: 'outs-to-percent', count: 3 },
        { gen: 'bet-size-price', count: 3 },
        { gen: 'pot-odds-chain', count: 1 },
        { gen: 'ev-of-call', count: 1 },
        { gen: 'call-or-fold', count: 1 },
        { gen: 'blocker-count', count: 2 },
        { gen: 'decision-vs-result', count: 2 },
      ],
      takeaway: 'You now have every piece of arithmetic the game requires. The rest is judgement.',
    },
  ],
};
