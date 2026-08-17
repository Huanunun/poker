/**
 * Level 1 — What a decision is worth. Roughly days 1 to 35.
 *
 * This course starts at the maths, not at the rules. The learner it is built
 * for knows how the game is played and cannot yet price a decision, so there is
 * no hand-ranking quiz and no card-notation drill: those appear only as
 * warm-ups if something is actually being got wrong.
 *
 * The level builds one number — the expected value of an action, in chips —
 * from parts that are all counting. By the end the learner can price a call
 * exactly and knows that folding is worth zero, which is the baseline every
 * later decision is measured against.
 */

export const LEVEL_1 = {
  level: 1,
  name: 'What a Decision Is Worth',
  subtitle: 'EV, in chips, from counting',
  promise: 'Put a number on any call, and know whether it beats folding.',
  lessons: [
    {
      id: 'l1-01',
      unit: 'The zero',
      title: 'Every action is worth a number of chips',
      skill: 'ev-basics',
      minutes: 15,
      concepts: [
        {
          title: 'Expected value is an average, not a prediction',
          body: 'Every action you can take — fold, call, raise — is worth some number of big blinds on average. Not this hand: on average, across every time you face that spot.\n\nThe correct play is simply the action worth the most. That is the whole game. Everything else in this course exists to help you work out those numbers faster and more accurately.',
        },
        {
          title: 'Why an average is the right thing to care about',
          body: 'You will play this spot hundreds of times. What happens in one instance is noise; what happens on average is your income.\n\nSo "was that the right call?" never means "did it win?". It means "was that action worth more chips than the alternatives, at the moment I chose it?"',
        },
      ],
      drills: [{ gen: 'ev-of-folding', count: 3 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Every action is worth a number. Pick the biggest. Results do not change which was biggest.',
    },
    {
      id: 'l1-02',
      unit: 'The zero',
      title: 'Folding is worth exactly zero',
      skill: 'ev-basics',
      minutes: 15,
      concepts: [
        {
          title: 'The baseline',
          body: 'Folding is worth zero. Not negative — zero. You put in no more chips and you win no chips.\n\nThat makes it the line every other action has to beat. Calling is right when calling is worth more than zero. Raising is right when it is worth more than both. There is never anything else to decide.',
        },
        {
          title: 'The money already in the pot is not yours',
          body: 'The chips you put in earlier are gone. They belong to the pot, and they are going to whoever wins it. Folding does not lose them, because you had already lost them the moment they went in.\n\n"I have too much invested to fold now" is the most expensive sentence in poker. The chips in the middle change the *price* you are being offered, which matters enormously — but they never create an obligation to keep going.',
        },
      ],
      drills: [{ gen: 'ev-of-folding', count: 4 }],
      takeaway: 'Fold = 0. It is the number everything else must beat. Money already in is not yours.',
    },
    {
      id: 'l1-03',
      unit: 'Counting your share',
      title: 'The cards you have not seen',
      skill: 'unseen-cards',
      minutes: 15,
      concepts: [
        {
          title: 'The number underneath every probability',
          body: 'Fifty-two cards. You see your two and whatever is on the board. On the flop that leaves 47 unseen; on the turn, 46.\n\nEvery probability in poker is a fraction with that number underneath it. There is no other maths here — the whole subject is counting the cards that help you and dividing.',
        },
        {
          title: 'Their cards count as unseen',
          body: 'If five opponents hold ten cards, those still count as unseen from where you sit, and you treat them as though they were in the deck.\n\nThat is correct rather than a simplification. Probability describes what you know. You have no information about which cards they hold, so they are exactly as likely to be anywhere.',
        },
      ],
      drills: [{ gen: 'unseen-count', count: 4 }],
      takeaway: '47 unseen on the flop, 46 on the turn. Their cards count as unseen.',
    },
    {
      id: 'l1-04',
      unit: 'Counting your share',
      title: 'Counting the cards that save you',
      skill: 'outs-counting',
      minutes: 20,
      concepts: [
        {
          title: 'An out is a specific card',
          body: 'An out is a card that turns your losing hand into a winning one. Not "a heart" — the actual hearts, each one a card in the deck.\n\nFour hearts between your hand and the board means nine hearts left. Nine outs. You did not use a formula, you counted.',
        },
        {
          title: 'The counts worth knowing by sight',
          body: 'Flush draw: 9. Open-ended straight draw: 8. Gutshot: 4. Two overcards: 6.\n\nDo not memorise these. Count them once each and they become obvious, because the counting takes two seconds and it works when the situation is slightly different from the list.',
        },
      ],
      drills: [{ gen: 'spot-draws', count: 3 }, { gen: 'outs-chain', count: 2 }],
      takeaway: 'An out is a specific card. Count them; never estimate them.',
    },
    {
      id: 'l1-05',
      unit: 'Counting your share',
      title: 'Outs that are already beaten',
      skill: 'outs-counting',
      minutes: 20,
      concepts: [
        {
          title: 'Some cards arrive and you still lose',
          body: 'You hold two hearts with two on the board — nine outs, obviously. But if they have a set, two of those hearts pair the board and give them a full house. You make your flush and lose your stack.\n\nThose are dirty outs. The card comes, you celebrate, and you are still behind.',
        },
        {
          title: 'Count against their hand, not in the abstract',
          body: 'The question is never "how many cards improve me?" but "how many cards make me *better than them*?" Those are different numbers and the gap is where money goes.\n\nThe drills show their cards face up so you can see the difference. At the table you will be estimating, but you will be estimating the right thing.',
        },
      ],
      drills: [{ gen: 'outs-chain', count: 3 }],
      takeaway: 'Count outs that beat their hand, not outs that improve yours.',
    },
    {
      id: 'l1-06',
      unit: 'Counting your share',
      title: 'Turning outs into a percentage',
      skill: 'outs-to-equity',
      minutes: 20,
      concepts: [
        {
          title: 'One division and you are done',
          body: 'Nine outs, 47 unseen cards. Nine divided by 47 is a bit under one in five — about 19%.\n\nThat is the whole calculation for the next card. Count the good ones, divide by the unseen ones. It works for any number of outs on any street, and you never have to look anything up.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 4, params: { street: 'turn' } }],
      takeaway: 'Outs ÷ unseen cards = your chance on the next card.',
    },
    {
      id: 'l1-07',
      unit: 'Counting your share',
      title: 'Two cards to come',
      skill: 'outs-to-equity',
      minutes: 20,
      concepts: [
        {
          title: 'Two chances, slightly less than double',
          body: 'On the flop you will see two more cards, so you get two attempts. Roughly that doubles it: nine outs is about 19% on one card and about 35% across both.\n\nIt is not quite double, because sometimes both cards are outs and you only needed one. That overlap is why doubling slightly overstates, and it matters more the more outs you have.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 4, params: { street: 'flop' } }],
      takeaway: 'Two cards to come is nearly twice one card — slightly less, because of overlap.',
    },
    {
      id: 'l1-08',
      unit: 'Counting your share',
      title: 'The shortcut you just derived',
      skill: 'outs-to-equity',
      minutes: 20,
      concepts: [
        {
          title: 'Times two, or times four',
          body: 'You have now done this enough times to see the pattern. One card to come: outs × 2. Two cards to come: outs × 4.\n\nNine outs on the turn is 18%, true answer 19.6%. Nine outs on the flop is 36%, true answer 35%. Close enough to act on, every time, in about a second.',
        },
        {
          title: 'And where it lies to you',
          body: 'The times-four version runs high when you have a lot of outs. With fifteen outs it says 60% and the truth is nearer 54%. Above about eight outs, take a few points off.\n\nThis is the difference between a shortcut you own and a chart you memorised. You know when this one is wrong, so you can use it at speed without it hurting you.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 5 }],
      takeaway: '×2 for one card, ×4 for two. Shade down above 8 outs.',
    },
    {
      id: 'l1-09',
      unit: 'The price',
      title: 'What the pot is offering you',
      skill: 'pot-odds',
      minutes: 25,
      concepts: [
        {
          title: 'Your money as a share of the pot',
          body: 'There is 10bb in the pot and they bet 5bb. If you call, the pot becomes 20bb and 5bb of it is yours. Your money is a quarter of what you are playing for.\n\nSo you need to win at least a quarter of the time. That is pot odds: your call, divided by the final pot.',
        },
        {
          title: 'Include your own call in the bottom',
          body: 'The common error is dividing by the pot *before* your call. The pot you win includes the chips you are about to put in, so they belong underneath.\n\nGet that one detail right and pot odds are permanently easy.',
        },
      ],
      drills: [{ gen: 'pot-odds-chain', count: 3 }],
      takeaway: 'Your call ÷ the final pot, including your call. That is the equity you need.',
    },
    {
      id: 'l1-10',
      unit: 'The price',
      title: 'Every bet size has a fixed price',
      skill: 'break-even',
      minutes: 25,
      concepts: [
        {
          title: 'The stakes never matter',
          body: 'A half-pot bet always needs 25%. Always — at 2bb or 2,000bb. A pot-sized bet always needs 33%. These are properties of the *fraction*, not the amounts.\n\nOnce you see that, most of the arithmetic at the table disappears. You stop calculating and start recognising.',
        },
        {
          title: 'The five you will actually meet',
          body: 'A third of pot needs 20%. Half needs 25%. Two thirds needs 29%. Three quarters needs 30%. A pot-sized bet needs 33%.\n\nYou derived every one of these last lesson. They are yours now — and note how close together they are. Every normal bet needs somewhere between 20% and 33%. That alone is a usable table read.',
        },
      ],
      drills: [{ gen: 'bet-size-price', count: 5 }],
      takeaway: 'Third: 20%. Half: 25%. Two-thirds: 29%. Three-quarters: 30%. Pot: 33%.',
    },
    {
      id: 'l1-11',
      unit: 'The price',
      title: 'Equity against price: the whole decision',
      skill: 'facing-bets',
      minutes: 25,
      concepts: [
        {
          title: 'Two numbers, one comparison',
          body: 'You have an equity — how often you win. You have a price — how often you need to win. Bigger, call. Smaller, fold.\n\nThat is it. Every call you will ever face is this. What gets harder at a real table is estimating the two numbers, never the comparison.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }],
      takeaway: 'Equity versus price. Bigger, call. Smaller, fold.',
    },
    {
      id: 'l1-12',
      unit: 'The price',
      title: 'Facing a flop bet: count one card, not two',
      skill: 'facing-bets',
      minutes: 20,
      concepts: [
        {
          title: 'You are usually not being shown both cards',
          body: 'On the flop facing a bet, you pay this bet to see the turn — and then they will very likely bet again. So you get one card for this price, not two.\n\nUsing the times-four number when facing a flop bet is how people talk themselves into calls they cannot afford. Use times four only when the money is going all in now.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }],
      takeaway: 'Facing a flop bet, count one card unless you are going all in.',
    },
    {
      id: 'l1-13',
      unit: 'EV in chips',
      title: 'What a call is worth',
      skill: 'ev-basics',
      minutes: 25,
      concepts: [
        {
          title: 'Winnings times how often, minus cost times how often',
          body: 'Pot odds tell you whether a call is right. EV tells you *how* right, in chips.\n\nYou win the pot some of the time and lose your call the rest. EV = (how often you win × what you win) − (how often you lose × what it costs). Two multiplications and a subtraction.',
        },
        {
          title: 'Why the size matters and not just the sign',
          body: 'Two calls can both be correct and one can be worth ten times the other. Knowing which spots carry the most money tells you where to concentrate — both at the table and in your study.',
        },
      ],
      drills: [{ gen: 'ev-call-chain', count: 2 }, { gen: 'ev-of-call', count: 2 }],
      takeaway: 'EV puts a number on the decision. Positive beats folding, whatever happens this hand.',
    },
    {
      id: 'l1-14',
      unit: 'EV in chips',
      title: 'Good decisions that lose',
      skill: 'variance',
      minutes: 20,
      concepts: [
        {
          title: 'You will lose most of the pots you should win',
          body: 'With 80% equity you lose one time in five. Over an evening that happens repeatedly and feels like being cheated.\n\nIt is not. It is the 20% doing what 20% does. A decision is good or bad before the cards come, and nothing that happens afterwards changes it.',
        },
        {
          title: 'Results teach the wrong lesson',
          body: 'This is the real danger. Judge plays by outcomes and you learn to avoid correct calls that happened to lose, and to repeat terrible ones that happened to win.\n\nJudge the decision, with the information you had. It is the only standard that improves you.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 3 }, { gen: 'ev-call-chain', count: 1 }],
      takeaway: 'Judge the decision, not the result. Results are too noisy to learn from.',
    },
    {
      id: 'l1-15',
      unit: 'EV in chips',
      title: 'Level 1 checkpoint',
      skill: 'ev-basics',
      minutes: 30,
      checkpoint: true,
      concepts: [
        {
          title: 'You can price a call now',
          body: 'You can count outs against a real hand, turn them into a percentage two ways, price any bet size instantly, work out what a call is worth in chips, and explain why a losing call can be correct.\n\nThat is the foundation. From here every level is a different decision built on exactly these pieces.',
        },
      ],
      drills: [
        { gen: 'ev-of-folding', count: 1 },
        { gen: 'outs-chain', count: 1 },
        { gen: 'outs-to-percent', count: 2 },
        { gen: 'bet-size-price', count: 2 },
        { gen: 'pot-odds-chain', count: 1 },
        { gen: 'ev-call-chain', count: 1 },
        { gen: 'call-or-fold', count: 1 },
        { gen: 'decision-vs-result', count: 1 },
      ],
      takeaway: 'You can price a call. Next: every spot where the price is not the whole story.',
    },
  ],
};
