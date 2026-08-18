/**
 * Level 4 — How much. Roughly days 151 to 215.
 *
 * The sizing level, and the one most courses skip. "Bet two thirds" is the
 * usual advice, which is a convention rather than a reason. Here every size is
 * compared by EV against the alternatives, so the learner ends up able to
 * justify a number rather than recite one.
 *
 * The key mechanism: size sets the price you offer, and it sets how often they
 * fold. Those two move in opposite directions, and the best size is wherever
 * the product peaks — which depends on your equity and on the opponent.
 */

export const LEVEL_4 = {
  level: 4,
  name: 'How Much',
  subtitle: 'Sizing by expected value, not by convention',
  promise: 'Justify every bet size with a number, at every stage of the hand.',
  lessons: [
    {
      id: 'l4-equity-bridge',
      unit: 'What size does',
      title: 'The size comes from your equity',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'You cannot pick a size without a share',
          body: '"How much should I bet?" has no answer on its own. The size follows from how much of the pot is already yours.\n\nWith 75% equity, three quarters of every chip that goes in is yours, so you want the pot to grow and you bet an amount they can still call. With 35%, most of what goes in is theirs, so growing the pot helps them — you either keep it small or bet only because folding them out is the plan.',
        },
        {
          title: 'The order of the decision',
          body: 'Estimate your equity. Decide whether you want the pot bigger or smaller. Then pick the number.\n\nMost players do this backwards: they reach for a size out of habit and justify it afterwards. Doing it in the right order is what makes sizing a decision rather than a reflex, and it is why the previous level spent so long on equity.',
        },
      ],
      drills: [{ gen: 'equity-to-sizing', count: 3 }],
      takeaway: 'Equity first, then whether you want the pot to grow, then the size. Never the size first.',
    },
    {
      id: 'l4-01',
      unit: 'What size does',
      title: 'Your size is the price you hand them',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'You are setting their pot odds',
          body: 'Bet a third and you offer them 20%. Bet the pot and you offer 33%. You are choosing, on their behalf, how cheaply they get to continue.\n\nSo sizing against a draw is a direct question: what price do I want to give the flush draw? A third of the pot gives a flush draw a wonderful deal. A pot-sized bet makes it a mistake.',
        },
        {
          title: 'And you are choosing how often they fold',
          body: 'Bigger bets fold out more hands — with diminishing returns, because nobody folds their strong hands to any size. Small bets fold out fewer but risk far less.\n\nThose two effects pull in opposite directions, which is why the best size is not simply the biggest.',
        },
      ],
      drills: [{ gen: 'bet-size-price', count: 3 }, { gen: 'choose-bet-size', count: 2 }],
      takeaway: 'Size sets their price and their fold rate. Those pull opposite ways.',
    },
    {
      id: 'l4-02',
      unit: 'What size does',
      title: 'Comparing sizes by EV',
      skill: 'bet-sizing',
      minutes: 30,
      concepts: [
        {
          title: 'Price the whole ladder',
          body: 'Take a third, half, three quarters and pot. Work out for each: how often they fold, what you win when they do, and what you make when they call.\n\nThe best size is the biggest number. Often it is not the biggest bet, and seeing that once in real numbers is worth more than any rule of thumb.',
        },
      ],
      drills: [{ gen: 'choose-bet-size', count: 4 }],
      takeaway: 'Price every candidate size. The winner is frequently not the largest.',
    },
    {
      id: 'l4-03',
      unit: 'What size does',
      title: 'Strong hands and weak hands want different sizes',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Value wants calls; bluffs want folds',
          body: 'With a strong hand, folds are a cost — you wanted the money in. So the best size is the largest one they will still call.\n\nWith nothing, folds are the entire profit, so you want the cheapest size that still folds them out. These pull in opposite directions, and that is the tension every sizing decision resolves.',
        },
      ],
      drills: [{ gen: 'choose-bet-size', count: 3 }],
      takeaway: 'Value: the biggest size they still call. Bluff: the cheapest that still folds them.',
    },
    {
      id: 'l4-04',
      unit: 'The opponent',
      title: 'Sizing against a station',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'When fold equity is zero, only value remains',
          body: 'Against a player who does not fold, the fold half of your bet EV vanishes. Everything is decided by your equity when called.\n\nSo the strategy collapses to something simple and very profitable: bet big with strong hands, and never bluff. Most low-stakes cash tables have at least one of these players, and this adjustment alone beats them.',
        },
      ],
      drills: [{ gen: 'choose-bet-size', count: 3 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Against stations: big with value, zero bluffs. It is the biggest easy edge there is.',
    },
    {
      id: 'l4-05',
      unit: 'The opponent',
      title: 'Sizing against someone who folds too much',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Small bets, constantly',
          body: 'Against a player who gives up whenever they miss, the fold profit is large and cheap. A third-pot bet that works 45% of the time only needs to work 25% to break even.\n\nSo bet small and bet often. You do not need a big size to make them fold, and using one just risks more on the times they have something.',
        },
      ],
      drills: [{ gen: 'choose-bet-size', count: 2 }, { gen: 'bluff-break-even', count: 3 }],
      takeaway: 'Against over-folders, small and frequent beats big and occasional.',
    },
    {
      id: 'l4-06',
      unit: 'The board',
      title: 'Small bets on dry boards',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Nothing to charge, so charge little',
          body: 'On a king-seven-two rainbow flop there are no draws worth protecting against. A third-pot bet does everything a bigger one would: it folds out the hands with nothing and gets called by the weak pairs you beat.\n\nAnd it costs a third as much when you are wrong. On dry boards you can bet small with almost your entire range, which is comfortable for you and genuinely awkward for them.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 3 }, { gen: 'flop-texture', count: 2 }],
      takeaway: 'Dry board: a third of the pot, with a very wide range.',
    },
    {
      id: 'l4-07',
      unit: 'The board',
      title: 'Big bets on wet boards',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Charge the draws properly',
          body: 'On jack-ten-nine with two hearts, a huge number of hands have a real draw. Bet small and you give them a price they are delighted to pay.\n\nBet two thirds to three quarters. You are making the chase a mistake and building a pot you will usually win. The trade-off is that you should bet a narrower range, because your weak hands cannot afford to get raised here.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 3 }, { gen: 'choose-bet-size', count: 2 }],
      takeaway: 'Wet board: two thirds or more, with a narrower range.',
    },
    {
      id: 'l4-08',
      unit: 'The board',
      title: 'One size for every hand you bet',
      skill: 'bet-sizing',
      minutes: 20,
      concepts: [
        {
          title: 'Vary by board, never by strength',
          body: 'The universal amateur tell is sizing by how strong the hand feels: big with monsters, small with bluffs, or the reverse after reading one book. Either way it is readable within an hour.\n\nPick your size from the board and your plan for the hand, then use it with everything you bet on that board.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 4 }],
      takeaway: 'Same size for every hand on a given board. Vary by board, never by strength.',
    },
    {
      id: 'l4-09',
      unit: 'Before the flop',
      title: 'How much to open',
      skill: 'preflop-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Table size sets the base',
          body: 'At a 6-handed table, open to about 2.5 big blinds. At a 9 or 10-handed table, about 3, because more players behind means more callers and you need to charge each of them.\n\nAdd one big blind for every limper already in. Three limpers means opening to 6, not 3 — you are raising into a pot that is already three times bigger.',
        },
        {
          title: 'The same size with every hand',
          body: 'Raising more with aces and less with suited connectors gives the whole hand away. Use one size from each seat and let your range do the work.',
        },
      ],
      drills: [{ gen: 'open-sizing', count: 4 }],
      takeaway: '2.5bb at 6-handed, 3bb at full ring, plus 1bb per limper. Same size every hand.',
    },
    {
      id: 'l4-10',
      unit: 'Before the flop',
      title: '3-bet sizing',
      skill: 'preflop-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Three times in position, four out of position',
          body: 'Re-raise to about three times their open when you will have position, and four times when you will not.\n\nThe extra size out of position charges them more for the positional edge they are about to enjoy for the rest of the hand. It is not a convention — it is compensation.',
        },
        {
          title: 'What this does to the stack-to-pot ratio',
          body: 'A 3-bet pot at 100bb has an SPR of roughly 4 to 5. That is low enough that one strong pair can reasonably play for a stack, which changes which hands are worth 3-betting at all.\n\nSpeculative hands need deep stacks to pay off. In 3-bet pots they usually do not have them.',
        },
      ],
      drills: [{ gen: 'open-sizing', count: 2 }, { gen: 'spr-plan', count: 3 }],
      takeaway: '3x in position, 4x out. Watch the SPR drop to around 4.',
    },
    {
      id: 'l4-11',
      unit: 'Later streets',
      title: 'Sizing the turn and river',
      skill: 'bet-sizing',
      minutes: 30,
      concepts: [
        {
          title: 'Pots grow geometrically',
          body: 'A two-thirds bet called on the flop more than doubles the pot. Do it again on the turn and the river bet is enormous even at the same fraction.\n\nSo plan the whole hand: if you intend to get a stack in by the river, you need roughly two-thirds-pot bets on all three streets. If you do not, size smaller from the start rather than betting big and then having to stop.',
        },
        {
          title: 'Overbetting, and when it is real',
          body: 'Betting more than the pot is correct when your range is much stronger than theirs and contains hands they simply cannot beat. It maximises value from the top of your range and pressure from your bluffs.\n\nIt requires a genuine range advantage. Overbetting without one is just a large mistake.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 2 }, { gen: 'spr-plan', count: 2 }, { gen: 'choose-bet-size', count: 2 }],
      takeaway: 'Plan all three streets. Two-thirds each gets a 100bb stack in by the river.',
    },
    {
      id: 'l4-12',
      unit: 'Putting it together',
      title: 'Level 4 checkpoint',
      skill: 'bet-sizing',
      minutes: 30,
      checkpoint: true,
      concepts: [
        {
          title: 'You can justify a number',
          body: 'You can choose a size from the board, the opponent and your hand\'s equity, and say what it is worth compared to the alternatives — before the flop and after it.\n\nOne decision left: raising.',
        },
      ],
      drills: [
        { gen: 'choose-bet-size', count: 3 },
        { gen: 'sizing-choice', count: 2 },
        { gen: 'open-sizing', count: 2 },
        { gen: 'bet-size-price', count: 2 },
        { gen: 'bluff-break-even', count: 1 },
      ],
      takeaway: 'Sizing is settled. Next: when to raise instead of call.',
    },
  ],
};
