/**
 * Level 1 — Foundations. Roughly days 1 to 30.
 *
 * Goal: by the end of this level the learner can sit at a table, always know
 * what they hold, always know what beats it, and never be the person holding
 * up the game. No maths beyond counting. Nothing memorised.
 *
 * The order is deliberate. Reading your own hand comes before anything about
 * strategy, because a strategy built on a misread hand is worse than no
 * strategy at all.
 */

export const LEVEL_1 = {
  level: 1,
  name: 'Foundations',
  subtitle: 'Know what you have, and what beats it',
  promise: 'Sit down at any table and never be lost.',
  lessons: [
    {
      id: 'l1-01',
      unit: 'The language',
      title: 'Two characters per card',
      skill: 'card-notation',
      minutes: 15,
      concepts: [
        {
          title: 'Every card is written the same way',
          body: 'A card is its rank followed by its suit, always two characters. The ace of spades is `As`. The seven of hearts is `7h`. The only special case is the ten, written `T` rather than `10`, so that every card takes exactly the same space.\n\nThis is not trivia. Every hand you ever discuss, every chart you ever read, and every drill in this course uses this notation. Reading it without thinking frees your attention for the actual game.',
        },
        {
          title: 'Suits have no ranking',
          body: 'In Hold\'em, no suit beats another. Spades are not better than clubs. Suits matter only for making flushes and for telling two cards apart. If two players make the same hand of different suits, they split the pot.',
        },
      ],
      drills: [{ gen: 'read-notation', count: 6 }],
      takeaway: 'Rank then suit, two characters, T for ten. Suits never outrank each other.',
    },
    {
      id: 'l1-02',
      unit: 'The language',
      title: 'How a hand of Hold\'em runs',
      skill: 'card-notation',
      minutes: 15,
      concepts: [
        {
          title: 'Two cards yours, five cards shared',
          body: 'You are dealt two private cards. Then five community cards arrive in three instalments: the flop (three at once), the turn (one), and the river (one). Everyone shares those five.\n\nYour hand is the best five cards you can make from your two plus the five on the board. You can use both of your cards, one of them, or neither.',
        },
        {
          title: 'Four rounds of betting',
          body: 'There is a betting round before the flop, and one after each of the flop, turn and river. A hand can end at any of them if everyone but one player folds. Most hands end before anyone shows a card, which is the first hint that this game is not really about the cards.',
        },
      ],
      drills: [{ gen: 'read-notation', count: 3 }, { gen: 'name-your-hand', count: 3 }],
      takeaway: 'Two private cards, five shared, four betting rounds. Best five cards wins.',
    },
    {
      id: 'l1-03',
      unit: 'Hand rankings',
      title: 'The nine categories',
      skill: 'hand-ranking',
      minutes: 20,
      concepts: [
        {
          title: 'Rarer beats commoner',
          body: 'The nine hand categories, weakest to strongest: high card, one pair, two pair, three of a kind, straight, flush, full house, four of a kind, straight flush.\n\nThere is no arbitrary decision here. The ordering is exactly how rare each hand is. A flush beats a straight because flushes are harder to make. If you ever forget the order, reason it out from rarity rather than reciting it.',
        },
        {
          title: 'The two everyone confuses',
          body: 'Straight versus flush is the one beginners get wrong. Five in a row is a straight; five of one suit is a flush; the flush wins. Full house versus flush is the other one: the full house wins.',
        },
      ],
      drills: [{ gen: 'name-your-hand', count: 5 }, { gen: 'who-wins', count: 3 }],
      takeaway: 'Rarer hands beat commoner ones. Flush beats straight; full house beats flush.',
    },
    {
      id: 'l1-04',
      unit: 'Hand rankings',
      title: 'Straights, and the ace at both ends',
      skill: 'hand-ranking',
      minutes: 15,
      concepts: [
        {
          title: 'The ace plays high or low',
          body: 'An ace can be the top of `T J Q K A` or the bottom of `A 2 3 4 5`. The low one is called the wheel, and it is the weakest possible straight — it is five-high, so any other straight beats it.\n\nWhat an ace cannot do is turn a corner. `Q K A 2 3` is not a straight. This costs beginners real money when they think they have made one.',
        },
      ],
      drills: [{ gen: 'name-your-hand', count: 4 }, { gen: 'who-wins', count: 3 }],
      takeaway: 'Aces play high or low but never wrap around. The wheel is the weakest straight.',
    },
    {
      id: 'l1-05',
      unit: 'Hand rankings',
      title: 'Kickers decide close hands',
      skill: 'best-five',
      minutes: 20,
      concepts: [
        {
          title: 'A hand is exactly five cards',
          body: 'When two players make the same pair, the remaining cards break the tie one at a time, highest first. Those are kickers.\n\nHolding `AK` on a board of `A 9 4 2 7` beats `AQ` because the king outranks the queen. This is where kicker trouble comes from: hands like `A5` make top pair and lose to every other ace. The pair is not the problem, the second card is.',
        },
        {
          title: 'Sometimes your cards do not play at all',
          body: 'If the board is `A K Q J T` and you hold `2 3`, your hand is the board: an ace-high straight. So is everyone else\'s. The pot is split. Recognising when you are playing the board saves you from betting into a guaranteed chop.',
        },
      ],
      drills: [{ gen: 'best-five', count: 4 }, { gen: 'who-wins', count: 3 }],
      takeaway: 'Only five cards count. When pairs tie, the kicker decides.',
    },
    {
      id: 'l1-06',
      unit: 'Board reading',
      title: 'Name your hand every time',
      skill: 'board-reading',
      minutes: 20,
      concepts: [
        {
          title: 'Say it out loud',
          body: 'Before you make any decision, name your hand in words: "I have two pair, kings and sevens." It feels slow and unnecessary. It is neither.\n\nMisreading your own hand is the single most expensive beginner mistake, and it happens most often in exactly the spots where the money is: a flush you did not notice, a straight you thought you had, a board that pairs and turns your two pair into something worse than it looks.',
        },
      ],
      drills: [{ gen: 'name-your-hand', count: 6 }, { gen: 'best-five', count: 2 }],
      takeaway: 'Name your hand in words before every decision. Every time, not just the interesting ones.',
    },
    {
      id: 'l1-07',
      unit: 'Board reading',
      title: 'What is the best possible hand?',
      skill: 'nuts-reading',
      minutes: 25,
      concepts: [
        {
          title: 'The nuts',
          body: 'The nuts is the best hand anyone could have on this board. Asking "what is the nuts?" on every street is the fastest board-reading habit you can build.\n\nIt is not because you expect them to have it. It is because the distance between your hand and the nuts tells you how much room you have to be wrong. Top pair on a board where the nuts is also top pair is a monster. The same top pair on a board with a possible flush and straight is a hand you should be careful with.',
        },
        {
          title: 'Work down from the top',
          body: 'Three of a suit on board? The nuts is the ace-high flush, unless the board is paired, in which case a full house beats it. Four to a straight? Someone might have the fifth card. Paired board? Quads and full houses are live.\n\nRun the check in that order and it takes about two seconds.',
        },
      ],
      drills: [{ gen: 'find-the-nuts', count: 5 }],
      takeaway: 'Ask what the nuts is on every street. The gap between it and your hand is your margin for error.',
    },
    {
      id: 'l1-08',
      unit: 'Board reading',
      title: 'Reading someone else\'s hand at showdown',
      skill: 'board-reading',
      minutes: 20,
      concepts: [
        {
          title: 'Two hands, one board',
          body: 'At showdown you have to compare two five-card hands built from the same five shared cards. Do them one at a time: name your hand, name theirs, then compare.\n\nThe error to watch for is counting cards twice, or using three of your own cards. You have two. You will never use more than two.',
        },
      ],
      drills: [{ gen: 'who-wins', count: 6 }],
      takeaway: 'Name both hands separately, then compare. Never more than two of your own cards.',
    },
    {
      id: 'l1-09',
      unit: 'Position',
      title: 'Why the seat matters more than the cards',
      skill: 'position',
      minutes: 25,
      concepts: [
        {
          title: 'Acting last is information',
          body: 'The player who acts last in a betting round has seen what everyone else did. The player who acts first has to guess.\n\nThat is the entire concept, and it is worth more than most card strength. The same hand that is a fold from the first seat is a clear raise from the button, purely because of who has to act first for the rest of the hand.',
        },
        {
          title: 'The six seats',
          body: 'At a six-handed table: under the gun acts first before the flop with five players still to come. Then middle position, cutoff, and the button. The small and big blinds have posted money and act last before the flop — but first on every street after it, which is why they are the hardest seats to play.',
        },
      ],
      drills: [{ gen: 'position-compare', count: 5 }],
      takeaway: 'Position is information, and information is money. The button is the best seat at the table.',
    },
    {
      id: 'l1-10',
      unit: 'Position',
      title: 'Counting the players behind you',
      skill: 'position',
      minutes: 15,
      concepts: [
        {
          title: 'Each player behind is another chance to be beaten',
          body: 'A hand is worth playing when it is likely to be the best one out there. If five players are still to act, there are five chances that someone has something better. If one is, there is one.\n\nThis is why opening ranges widen as you move around the table. It is not a rule to memorise. It is a direct consequence of counting.',
        },
      ],
      drills: [{ gen: 'position-compare', count: 4 }, { gen: 'open-or-fold', count: 3 }],
      takeaway: 'Count the players left to act. That number decides how strong your hand needs to be.',
    },
    {
      id: 'l1-11',
      unit: 'First decisions',
      title: 'The three questions before the flop',
      skill: 'starting-hands',
      minutes: 25,
      concepts: [
        {
          title: 'Strength, position, and what happened already',
          body: 'Before the flop, three things decide your action: how strong your two cards are, how many players act after you, and what those before you have done.\n\nBeginners use only the first. That is why they play too many hands from bad seats and lose money before a single community card appears.',
        },
        {
          title: 'Raise or fold, mostly',
          body: 'When the pot has not been raised, your default is to raise or fold, not to call. Calling invites players in behind you and gives up the chance to win the pot immediately. There are exceptions, and you will learn them, but "limping" into pots is one of the clearest signs of an inexperienced player.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 6 }],
      takeaway: 'Strength, position, prior action. When you are first in, raise or fold.',
    },
    {
      id: 'l1-12',
      unit: 'First decisions',
      title: 'Why suited and connected cards are worth more',
      skill: 'starting-hands',
      minutes: 20,
      concepts: [
        {
          title: 'Suited is a small edge that compounds',
          body: 'Two cards of the same suit make a flush about 6% of the time by the river, against roughly 2% for offsuit cards. That sounds tiny, and in raw equity it is worth only about 2 to 4 percentage points.\n\nThe real value is playability. A suited hand can keep going on more flops with a genuine reason, which means it wins pots that an offsuit version would have to abandon.',
        },
        {
          title: 'Gaps cost you straights',
          body: 'Seventy-six suited makes far more straights than seventy-two suited. Connected cards make the hands that win big pots — straights and two pair — which is how you get paid off by an opponent with top pair.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 4 }, { gen: 'combo-count', count: 3 }],
      takeaway: 'Suited and connected cards are worth playing because of the pots they win, not the equity they add.',
    },
    {
      id: 'l1-13',
      unit: 'First decisions',
      title: 'Domination: the hands that flop well and still lose',
      skill: 'starting-hands',
      minutes: 20,
      concepts: [
        {
          title: 'Top pair is not automatically good',
          body: 'King-seven makes top pair on a king-high flop. So does king-queen, king-jack, king-ten, and ace-king — and every one of them beats you.\n\nA dominated hand is one that makes exactly the hand you were hoping for and is still behind. These are more expensive than hands that simply miss, because missing is cheap and being second best is not.',
        },
        {
          title: 'Which hands are the traps',
          body: 'Weak aces and weak kings offsuit are the classic offenders: `A5o`, `K8o`, `Q7o`. They look playable because they contain a big card. That big card is precisely the problem — it is what gets you involved in the pot you are losing.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 5 }],
      takeaway: 'Beware hands that hit the flop and are still second best. Missing is cheap; domination is not.',
    },
    {
      id: 'l1-14',
      unit: 'Counting',
      title: 'The unseen deck',
      skill: 'unseen-cards',
      minutes: 15,
      concepts: [
        {
          title: 'The number under every probability',
          body: 'Fifty-two cards. You see two of yours and whatever is on the board. Everything else is unseen. On the flop that is 47 cards; on the turn, 46.\n\nEvery probability in poker is a fraction with that number underneath. There is no other maths to learn here — the whole subject is counting the good cards and dividing.',
        },
        {
          title: 'Other players\' cards count as unseen',
          body: 'This surprises people. If five opponents are holding ten cards, those are still "unseen" from your point of view, and you treat them as though they were still in the deck.\n\nThat is correct, not a simplification. Probability describes what you know, not where the cards physically are. Since you have no information about which cards they hold, they are exactly as likely to be anywhere.',
        },
      ],
      drills: [{ gen: 'unseen-count', count: 6 }],
      takeaway: '47 unseen on the flop, 46 on the turn. Other players\' cards count as unseen.',
    },
    {
      id: 'l1-15',
      unit: 'Counting',
      title: 'Counting combinations without algebra',
      skill: 'combinatorics',
      minutes: 25,
      concepts: [
        {
          title: 'Six, four, and twelve',
          body: 'There are exactly three shapes a starting hand can take, and each has a fixed number of ways to be dealt.\n\nA pocket pair: four cards of that rank, choose two, which is six ways. A suited hand: the two cards must share a suit, and there are four suits, so four ways. An offsuit hand: four choices for the first card times four for the second is sixteen, minus the four that came out suited, leaving twelve.',
        },
        {
          title: 'Why anyone cares',
          body: 'Because it tells you what your opponent is likely to have. There are twelve ways to hold ace-king offsuit and only six ways to hold aces. So when you are wondering whether they have the monster or the strong-but-beatable hand, the counting has already answered most of the question before you consider anything else.',
        },
      ],
      drills: [{ gen: 'combo-count', count: 8 }],
      takeaway: 'Pairs: 6 ways. Suited: 4. Offsuit: 12. Unpaired hands are far more common than pairs.',
    },
    {
      id: 'l1-16',
      unit: 'Board texture',
      title: 'Wet boards and dry boards',
      skill: 'texture',
      minutes: 25,
      concepts: [
        {
          title: 'How much did this flop help everyone?',
          body: 'A dry flop is disconnected, rainbow, and usually has one high card: `K 7 2` with three different suits. Very few hands connect with it.\n\nA wet flop is connected or suited or both: `J T 9` with two hearts. An enormous number of hands have something — a pair, a straight draw, a flush draw, or several at once.',
        },
        {
          title: 'Texture decides how you bet',
          body: 'On dry boards, small bets work: nobody has anything, so you do not need to charge anyone, and you do not need to risk much to make them fold.\n\nOn wet boards, bets need to be bigger, because there are real draws that will happily call a cheap price and beat you on the next card.',
        },
      ],
      drills: [{ gen: 'flop-texture', count: 6 }],
      takeaway: 'Dry boards miss everyone, so bet small. Wet boards hit many hands, so bet bigger or not at all.',
    },
    {
      id: 'l1-17',
      unit: 'Board texture',
      title: 'Seeing every draw on the board',
      skill: 'draw-spotting',
      minutes: 25,
      concepts: [
        {
          title: 'Two kinds of draw',
          body: 'A flush draw is four cards of one suit, needing a fifth. A straight draw is four to a run: open-ended if either end completes it, a gutshot if only one specific rank does.\n\nOpen-ended gives you eight cards; a gutshot gives you four. That difference is enormous and it is the whole reason the distinction has a name.',
        },
        {
          title: 'Spot yours and theirs',
          body: 'Look at every board twice: once for what you have, once for what the board makes possible for anyone else. The draws that exist are simultaneously the hands that will call your bets and the cards that will beat you later.',
        },
      ],
      drills: [{ gen: 'spot-draws', count: 6 }],
      takeaway: 'Open-ended straight draw: 8 cards. Gutshot: 4. Flush draw: 9. Look for yours and theirs.',
    },
    {
      id: 'l1-18',
      unit: 'Putting it together',
      title: 'Playing the board and split pots',
      skill: 'best-five',
      minutes: 15,
      concepts: [
        {
          title: 'When nobody can win',
          body: 'Sometimes the five community cards are the best hand available and nobody\'s private cards improve on them. Everyone still in the pot ties.\n\nThe practical lesson is to notice it before you bet. Betting into a board that has already made your hand for you, when your opponent has the same hand, cannot win you anything and can only lose you money if they raise.',
        },
      ],
      drills: [{ gen: 'best-five', count: 4 }, { gen: 'who-wins', count: 3 }],
      takeaway: 'When the board is the best hand, everyone chops. Notice before you bet, not after.',
    },
    {
      id: 'l1-19',
      unit: 'Putting it together',
      title: 'Your first complete decision',
      skill: 'starting-hands',
      minutes: 30,
      concepts: [
        {
          title: 'Everything so far, in one sequence',
          body: 'You now have enough to play a hand properly from the start. Before the flop: how strong are my cards, how many players act after me, what has happened already. After the flop: what do I have, what is the nuts, what draws exist, how wet is this board.\n\nThat is six questions and none of them require arithmetic. Answer them in order and you are already playing better than most people at a low-stakes table.',
        },
      ],
      drills: [
        { gen: 'open-or-fold', count: 3 },
        { gen: 'name-your-hand', count: 2 },
        { gen: 'find-the-nuts', count: 2 },
        { gen: 'flop-texture', count: 2 },
      ],
      takeaway: 'Six questions, no arithmetic, and you are ahead of most beginners.',
    },
    {
      id: 'l1-20',
      unit: 'Putting it together',
      title: 'Level 1 checkpoint',
      skill: 'board-reading',
      minutes: 30,
      checkpoint: true,
      concepts: [
        {
          title: 'What you should be able to do now',
          body: 'Read any hand written in shorthand. Name your hand instantly on any board. Find the nuts. Spot every draw. Explain why the button plays more hands than the first seat.\n\nIf any of those feel shaky, the checkpoint will find it and send you back to the right lesson. That is what it is for — not a grade, a diagnostic.',
        },
      ],
      drills: [
        { gen: 'name-your-hand', count: 3 },
        { gen: 'who-wins', count: 3 },
        { gen: 'find-the-nuts', count: 2 },
        { gen: 'spot-draws', count: 2 },
        { gen: 'best-five', count: 2 },
        { gen: 'position-compare', count: 2 },
        { gen: 'combo-count', count: 2 },
        { gen: 'unseen-count', count: 2 },
      ],
      takeaway: 'Foundations done. From here on, every lesson adds a number to what you can already see.',
    },
  ],
};
