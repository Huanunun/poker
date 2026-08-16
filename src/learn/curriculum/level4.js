/**
 * Level 4 — After the flop. Roughly days 151 to 240.
 *
 * The longest level, because postflop is where the game actually lives. The
 * organising idea is that every postflop decision answers two questions in
 * order: whose range does this board favour, and what does this specific hand
 * want to do about it. Learners who only ask the second question play their
 * cards; learners who ask both play poker.
 */

export const LEVEL_4 = {
  level: 4,
  name: 'After the Flop',
  subtitle: 'Betting with a reason',
  promise: 'Never bet because you raised preflop. Bet because the board and the hand say so.',
  lessons: [
    {
      id: 'l4-01',
      unit: 'Whose board is it?',
      title: 'Range advantage',
      skill: 'range-advantage',
      minutes: 30,
      concepts: [
        {
          title: 'The flop hits one range harder',
          body: 'You raised, they called. Your range has more big cards; theirs has more middling and suited ones. So an ace-king-four flop belongs to you, and a seven-six-five flop belongs to them.\n\nWhoever the board favours gets to do the betting. This is the first question on every flop, before you even look at your own two cards.',
        },
        {
          title: 'Why it works',
          body: 'On a board that hits your range, you have more strong hands than they do, so they cannot defend aggressively. On a board that hits theirs, your bets get raised and called by hands that beat you.\n\nBetting is not a reward for having raised. It is a tool that works when the board supports it.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 5 }],
      takeaway: 'Ask whose range the board favours before you look at your hand.',
    },
    {
      id: 'l4-02',
      unit: 'Whose board is it?',
      title: 'Boards that belong to the caller',
      skill: 'range-advantage',
      minutes: 25,
      concepts: [
        {
          title: 'Low and connected',
          body: 'A flop of 7-6-5 or 9-8-7 misses a raising range almost entirely and hits a calling range hard. The caller has all the suited connectors and small pairs; the raiser has ace-king and queens.\n\nOn these boards, check. Betting into the player who has more strong hands than you is donating.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 4 }, { gen: 'flop-texture', count: 2 }],
      takeaway: 'Low connected boards belong to the caller. Check them.',
    },
    {
      id: 'l4-03',
      unit: 'Continuation betting',
      title: 'Two questions before every c-bet',
      skill: 'cbet',
      minutes: 30,
      concepts: [
        {
          title: 'Whose board, and what do I have',
          body: 'Bet when the board favours your range, or when your hand wants money in the pot — a strong hand building value, or a draw that wins two ways.\n\nCheck when neither is true. Betting every flop because you raised preflop is a reflex, and observant opponents feed on it.',
        },
      ],
      drills: [{ gen: 'cbet-decision', count: 3 }],
      takeaway: 'Bet with range advantage, a real hand, or a real draw. Otherwise check.',
    },
    {
      id: 'l4-04',
      unit: 'Continuation betting',
      title: 'Small bets on dry boards',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Nothing to charge, so charge little',
          body: 'On K-7-2 rainbow there are no draws worth protecting against. A third-pot bet accomplishes everything a bigger one would: it folds out the hands with nothing, and it gets called by the weak pairs you beat.\n\nIt also costs you a third as much on the occasions you are wrong. Small bets on dry boards are close to free money.',
        },
        {
          title: 'You can bet almost your whole range',
          body: 'Because the price is so good and the board favours you, a small bet works with nearly everything you hold. That is comfortable for you and genuinely difficult for them.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 4 }, { gen: 'bet-size-price', count: 2 }],
      takeaway: 'Dry board: bet a third of the pot with a wide range.',
    },
    {
      id: 'l4-05',
      unit: 'Continuation betting',
      title: 'Big bets on wet boards',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Charge the draws',
          body: 'On J-T-9 with two hearts, an enormous number of hands have a real draw. A small bet gives them a wonderful price to chase, and they will take it.\n\nBet two thirds to three quarters. You are making them pay a bad price, and building a pot you will usually win.',
        },
        {
          title: 'Bet less often, but bigger',
          body: 'The trade-off: on wet boards you should bet a narrower range, because your weak hands cannot afford to get raised. Fewer bets, larger ones.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 4 }, { gen: 'flop-texture', count: 2 }],
      takeaway: 'Wet board: bet bigger with a narrower range.',
    },
    {
      id: 'l4-06',
      unit: 'Continuation betting',
      title: 'Bet size is a question about the board',
      skill: 'bet-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'Not about how strong you feel',
          body: 'The universal amateur tell is sizing by hand strength: big with monsters, small with bluffs, or the reverse. Either way it is readable within an hour.\n\nSize according to the board and your plan for the whole hand. Every hand you bet on a given board should use the same size.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 5 }],
      takeaway: 'Same size for every hand on a given board. Vary by board, never by strength.',
    },
    {
      id: 'l4-07',
      unit: 'Playing draws',
      title: 'Semi-bluffing wins two ways',
      skill: 'draw-play',
      minutes: 30,
      concepts: [
        {
          title: 'Betting a draw beats calling with it',
          body: 'Call with a flush draw and you win only by hitting. Bet it and you also win every time they fold.\n\nTwo ways to win against one. That is why aggression with draws is one of the highest-value habits you can build, and why passive players with good draws still lose money.',
        },
        {
          title: 'Which draws to bet',
          body: 'The bigger the draw, the more it wants to bet. A flush draw with two overcards can bet, get raised, and still call comfortably. A gutshot with nothing else should usually just fold or take a cheap card.',
        },
      ],
      drills: [{ gen: 'cbet-decision', count: 3 }, { gen: 'spot-draws', count: 2 }],
      takeaway: 'Bet your draws. Two ways to win beats one.',
    },
    {
      id: 'l4-08',
      unit: 'Playing draws',
      title: 'When calling is better',
      skill: 'draw-play',
      minutes: 25,
      concepts: [
        {
          title: 'Against people who never fold',
          body: 'Semi-bluffing works because they fold. Against a player who calls everything, the fold equity is zero and you are just building a pot with the worse hand.\n\nAgainst calling stations, play draws passively and value bet relentlessly when you hit. The correct strategy depends on the opponent, not only the cards.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Semi-bluffs need fold equity. Against stations, just call and value bet when you hit.',
    },
    {
      id: 'l4-09',
      unit: 'Defending',
      title: 'Minimum defence frequency',
      skill: 'mdf',
      minutes: 30,
      concepts: [
        {
          title: 'The same maths from the other chair',
          body: 'If they bet half pot as a pure bluff, they need you to fold more than a third of the time. So if you continue with at least two thirds of your range, bluffing with anything stops being automatic profit.\n\nThat is minimum defence frequency, and it is the pot odds calculation you already know, read from the other side of the table.',
        },
        {
          title: 'It is about your range, not your hand',
          body: 'MDF never says "call with this hand". It says "if you are folding almost everything here, your earlier decisions built a range that cannot defend".\n\nWith a hand that has no equity and no way to improve, fold it. The number is a diagnostic on your whole strategy.',
        },
      ],
      drills: [{ gen: 'mdf-chain', count: 3 }],
      takeaway: 'MDF is pot odds from the other chair. It diagnoses your range, not your hand.',
    },
    {
      id: 'l4-10',
      unit: 'Defending',
      title: 'When to ignore MDF',
      skill: 'mdf',
      minutes: 25,
      concepts: [
        {
          title: 'Most opponents do not bluff enough',
          body: 'MDF assumes an opponent who bluffs at the correct frequency. Almost nobody at low stakes does. Most players bluff far too little, especially on the river.\n\nAgainst them, folding much more than MDF is correct and profitable. The theory tells you what an unexploitable opponent would require; your actual opponent is usually far more honest than that.',
        },
      ],
      drills: [{ gen: 'mdf-chain', count: 2 }, { gen: 'player-type', count: 3 }],
      takeaway: 'Against players who rarely bluff, over-fold happily. MDF is a floor against good players only.',
    },
    {
      id: 'l4-11',
      unit: 'Defending',
      title: 'Choosing which hands defend',
      skill: 'facing-bets',
      minutes: 30,
      concepts: [
        {
          title: 'Equity, and what happens next',
          body: 'When you must continue with some hands, pick the ones with the best combination of current equity and future potential. A gutshot with two overcards is a better call than a slightly stronger pair with no way to improve.\n\nAsk what your hand does on the turn. Hands with no plan for the next street should fold now rather than later.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }, { gen: 'mdf-chain', count: 1 }],
      takeaway: 'Defend with hands that have a plan for the turn. Fold the ones that do not.',
    },
    {
      id: 'l4-12',
      unit: 'The turn',
      title: 'Plan the turn before you bet the flop',
      skill: 'turn-play',
      minutes: 30,
      concepts: [
        {
          title: 'What will you do on a blank?',
          body: 'Before you put money in on the flop, decide what you will do on a card that changes nothing. If the answer is "give up", that is fine — but know it now, because it changes how much you should bet.\n\nMost stacks are lost by players who bet the flop with no plan and then feel obliged to keep going.',
        },
        {
          title: 'Which cards are good for you',
          body: 'A card that improves your range more than theirs lets you keep betting. A card that completes obvious draws usually means slowing down. Sort the deck into good and bad cards for you before the turn arrives, not after.',
        },
      ],
      drills: [{ gen: 'cbet-decision', count: 2 }, { gen: 'sizing-choice', count: 2 }],
      takeaway: 'Decide your turn plan before betting the flop. Especially the plan for blanks.',
    },
    {
      id: 'l4-13',
      unit: 'The turn',
      title: 'The turn is where pots become serious',
      skill: 'turn-play',
      minutes: 25,
      concepts: [
        {
          title: 'Bets get big fast',
          body: 'A pot-sized bet on the flop and another on the turn means the pot has grown nine-fold. The turn is where a marginal hand stops being a call and starts being a disaster.\n\nBe more selective than on the flop. Hands you would happily call one bet with are frequently folds facing a second.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 3 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Turn bets are where pots explode. Tighten up considerably.',
    },
    {
      id: 'l4-14',
      unit: 'The turn',
      title: 'Double barrelling',
      skill: 'turn-play',
      minutes: 30,
      concepts: [
        {
          title: 'Bet again when the card helps you',
          body: 'You bet the flop and got called. The turn brings an ace on a board of K-7-2. That card hits your range and misses most of what called you, so betting again is strong.\n\nBarrel on cards that improve your range. Give up on cards that improve theirs. This is not about your two cards; it is about which range the new card favours.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 3 }, { gen: 'cbet-decision', count: 2 }],
      takeaway: 'Barrel the turn cards that favour your range. Check the ones that favour theirs.',
    },
    {
      id: 'l4-15',
      unit: 'The turn',
      title: 'Pot control with medium hands',
      skill: 'pot-control',
      minutes: 30,
      concepts: [
        {
          title: 'Good hands, small pots',
          body: 'Second pair is a perfectly good hand and a terrible reason to play a huge pot. Checking it keeps the pot small, lets you call a bet, and avoids the situation where you have put in three streets and face a fourth.\n\nNot every good hand wants to build a pot. The hands that want big pots are the ones that beat the hands that will pay.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 3 }, { gen: 'river-value', count: 2 }],
      takeaway: 'Medium hands want small pots. Only bet what beats the hands that will call.',
    },
    {
      id: 'l4-16',
      unit: 'The river',
      title: 'Can a worse hand call?',
      skill: 'river-value',
      minutes: 30,
      concepts: [
        {
          title: 'The only value-bet test',
          body: 'On the river there are no more cards. Your hand cannot improve and neither can theirs. So the question is not "am I strong?" but "will something worse pay me?"\n\nIf yes, bet. If no, checking costs you nothing and betting can only lose.',
        },
        {
          title: 'The most common leak among decent players',
          body: 'Checking good hands on the river out of caution. It feels safe, and it quietly costs more than any bluff you ever get caught on. Second pair on a dry river against a passive player is very often a bet.',
        },
      ],
      drills: [{ gen: 'river-value', count: 5 }],
      takeaway: 'Bet the river whenever a worse hand can call. Checking good hands is expensive.',
    },
    {
      id: 'l4-17',
      unit: 'The river',
      title: 'Thin value',
      skill: 'river-value',
      minutes: 25,
      concepts: [
        {
          title: 'Betting hands that are only just ahead',
          body: 'A thin value bet is one where you will be called by worse slightly more than half the time. It feels uncomfortable and it is where a large part of a good player\'s win rate comes from.\n\nThe test is unchanged: does a worse hand call? If you can name two worse hands they would call with, bet.',
        },
      ],
      drills: [{ gen: 'river-value', count: 4 }],
      takeaway: 'If you can name two worse hands that call, it is a value bet.',
    },
    {
      id: 'l4-18',
      unit: 'The river',
      title: 'Bluffing with the right hands',
      skill: 'river-bluff',
      minutes: 30,
      concepts: [
        {
          title: 'Blockers, not rubbish',
          body: 'The instinct is to bluff with the worst hand you hold. That is backwards. The best bluffs are hands that block the hands that would call.\n\nIf a flush is possible and you hold the ace of that suit, they cannot have the nut flush. Your bluff succeeds more often because of a card you were dealt.',
        },
        {
          title: 'Never bluff with showdown value',
          body: 'Turning a hand that might win into a bluff means you can only be called by better. You give up a way to win in exchange for nothing. Bluff with the hands that cannot win otherwise, chosen by their blockers.',
        },
      ],
      drills: [{ gen: 'bluff-selection', count: 4 }, { gen: 'blocker-count', count: 2 }],
      takeaway: 'Bluff with blockers, never with showdown value.',
    },
    {
      id: 'l4-19',
      unit: 'The river',
      title: 'How many bluffs is the right number?',
      skill: 'river-bluff',
      minutes: 30,
      concepts: [
        {
          title: 'The bet size decides it',
          body: 'A pot-sized bet offers them 33%, so about a third of your betting range should be bluffs — roughly one bluff for every two value hands. A half-pot bet offers 25%, so about a quarter.\n\nThe ratio is not a convention. It is the number that makes their call exactly break-even, which is the same arithmetic you have been doing since level two.',
        },
      ],
      drills: [{ gen: 'mdf-chain', count: 2 }, { gen: 'bet-size-price', count: 3 }],
      takeaway: 'Bluff share equals the pot odds you offer. Pot bet: a third bluffs.',
    },
    {
      id: 'l4-20',
      unit: 'The river',
      title: 'Facing a river bet',
      skill: 'facing-bets',
      minutes: 30,
      concepts: [
        {
          title: 'No more cards, so no more equity',
          body: 'On the river you either have the best hand or you do not. Pot odds tell you how often you need to be good; hand reading tells you how often you are.\n\nThe question becomes concrete: given everything they have done, how many of their hands beat mine, and how many do not? Count the combinations. That is what combinatorics was for.',
        },
      ],
      drills: [{ gen: 'blocker-count', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: 'River calls are combination counting. How many of their hands beat you, how many do not?',
    },
    {
      id: 'l4-21',
      unit: 'Sizing theory',
      title: 'Polarised and merged',
      skill: 'polarisation',
      minutes: 30,
      concepts: [
        {
          title: 'Big bets mean two things at once',
          body: 'A polarised range is very strong hands and bluffs, with nothing in between. It wants to bet big, because the strong hands want maximum value and the bluffs want maximum fold equity.\n\nA merged range is a band of decent hands. It wants to bet small, to get called by the hands just below it.',
        },
        {
          title: 'Reading their sizing',
          body: 'This works in reverse too. A huge river bet from a thinking player means nuts or air, so your medium hands are close to worthless and only your strongest hands matter. A small bet usually means a real but modest hand.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 3 }, { gen: 'bluff-selection', count: 2 }],
      takeaway: 'Big bets are polarised: nuts or air. Small bets are merged: modest, real hands.',
    },
    {
      id: 'l4-22',
      unit: 'Sizing theory',
      title: 'Overbetting',
      skill: 'polarisation',
      minutes: 25,
      concepts: [
        {
          title: 'More than the pot',
          body: 'When your range is much stronger than theirs and contains hands they cannot beat, betting more than the pot is correct. It maximises value from the top of your range and applies maximum pressure with your bluffs.\n\nIt requires a genuine range advantage. Overbetting without one is just a large mistake.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 2 }, { gen: 'sizing-choice', count: 2 }],
      takeaway: 'Overbet only with a real range advantage and a polarised range.',
    },
    {
      id: 'l4-23',
      unit: 'Putting it together',
      title: 'A hand from flop to river',
      skill: 'turn-play',
      minutes: 35,
      concepts: [
        {
          title: 'One plan, three streets',
          body: 'Whose board is this. What do I have. What is my plan for the turn. Which cards continue the plan and which end it. What does the river bet look like if I get there.\n\nGood players decide most of this on the flop. Beginners decide each street as it arrives, which is why they end up in spots with no good options.',
        },
      ],
      drills: [
        { gen: 'cbet-decision', count: 2 },
        { gen: 'sizing-choice', count: 2 },
        { gen: 'river-value', count: 2 },
      ],
      takeaway: 'Plan the whole hand on the flop. Deciding street by street is how stacks are lost.',
    },
    {
      id: 'l4-24',
      unit: 'Putting it together',
      title: 'Level 4 checkpoint',
      skill: 'cbet',
      minutes: 40,
      checkpoint: true,
      concepts: [
        {
          title: 'You can play a hand now',
          body: 'You can determine whose range a board favours, bet with a reason and a size, defend at a sensible frequency, plan a turn, extract value on a river, and choose bluffs by their blockers.\n\nThat is a complete postflop game. What remains is adapting it to the specific human across the table.',
        },
      ],
      drills: [
        { gen: 'range-advantage', count: 2 },
        { gen: 'cbet-decision', count: 2 },
        { gen: 'sizing-choice', count: 2 },
        { gen: 'mdf-chain', count: 1 },
        { gen: 'river-value', count: 2 },
        { gen: 'bluff-selection', count: 2 },
        { gen: 'call-or-fold', count: 1 },
      ],
      takeaway: 'A complete postflop game. Next: the opponent.',
    },
  ],
};
