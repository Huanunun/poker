/**
 * Level 3 — Before the flop. Roughly days 91 to 150.
 *
 * The shift from hands to ranges happens here, and it is the single biggest
 * conceptual jump in the course. The approach is to teach the principles that
 * generate a chart, then have the learner reconstruct the chart from them. A
 * chart you can rebuild is repairable when the game changes; a chart you
 * memorised is not.
 */

export const LEVEL_3 = {
  level: 3,
  name: 'Before the Flop',
  subtitle: 'Ranges, position, and the first decision',
  promise: 'Build every opening range from principles, and never memorise a chart again.',
  lessons: [
    {
      id: 'l3-01',
      unit: 'The grid',
      title: 'All 169 hands on one picture',
      skill: 'range-grid',
      minutes: 25,
      concepts: [
        {
          title: 'Thirteen by thirteen',
          body: 'There are 1,326 possible starting hands, but only 169 meaningfully different ones, because suits are interchangeable. They fit on a 13×13 grid: pairs down the diagonal, suited hands in the triangle above it, offsuit hands below.\n\nThis grid is the working surface for every preflop idea in poker. Once you can see it in your head, ranges stop being lists and become shapes.',
        },
        {
          title: 'The cells are not equal',
          body: 'Each pair cell is 6 combinations, each suited cell 4, each offsuit cell 12. So the 78 offsuit cells hold 936 combinations while the 13 pair cells hold only 78.\n\nThat is why "they could have any pair" is a much smaller claim than it sounds.',
        },
      ],
      drills: [{ gen: 'combo-count', count: 5 }, { gen: 'build-range', count: 1 }],
      takeaway: 'Pairs on the diagonal, suited above, offsuit below. Cells are 6, 4, and 12 combinations.',
    },
    {
      id: 'l3-02',
      unit: 'The grid',
      title: 'Ranges are shapes, not lists',
      skill: 'range-grid',
      minutes: 25,
      concepts: [
        {
          title: 'Every sensible range is a blob in the corner',
          body: 'Strong hands cluster in the top-left: big pairs, big suited cards, big offsuit cards. A range is a region growing outward from that corner.\n\nWhich means you can check your own work visually. If your selection has holes in the middle or stray cells in the bottom-right, something has gone wrong. You do not need the chart to spot the error.',
        },
      ],
      drills: [{ gen: 'build-range', count: 2 }],
      takeaway: 'Ranges grow outward from the top-left corner. Holes and strays mean an error.',
    },
    {
      id: 'l3-03',
      unit: 'Opening',
      title: 'Rebuilding the first-seat range',
      skill: 'rfi',
      minutes: 30,
      concepts: [
        {
          title: 'Five players behind you',
          body: 'Under the gun, five opponents still get to act. You need a hand that is likely best against five chances, and one that plays well out of position if someone calls.\n\nThat leaves pairs from about sevens up, strong suited aces and kings, the suited broadways, and ace-queen or better offsuit. About 15% of hands. You can derive that shape from the counting alone.',
        },
        {
          title: 'What gets cut, and why',
          body: 'Suited connectors like 76s are cut not because they are weak but because they need to see cheap flops and play in position — neither of which is available here. Weak aces are cut because they are dominated by exactly the hands that will call you.',
        },
      ],
      drills: [{ gen: 'build-range', count: 1, params: { position: 'UTG' } }, { gen: 'open-or-fold', count: 5, params: { position: 'UTG' } }],
      takeaway: 'First seat: about 15%. Pairs, strong aces, suited broadways. No speculative hands.',
    },
    {
      id: 'l3-04',
      unit: 'Opening',
      title: 'The button opens three times as wide',
      skill: 'rfi',
      minutes: 30,
      concepts: [
        {
          title: 'Two players, and last to act forever',
          body: 'From the button only the blinds remain, and you will act last on every street afterwards. Both facts push in the same direction: open far more hands.\n\nAround 45% of all hands, including every pair, every suited ace, most suited connectors, and a wide band of offsuit broadways. The same cards that were an easy fold under the gun.',
        },
        {
          title: 'This is where most of your profit comes from',
          body: 'The button is the most profitable seat by a wide margin, and it is profitable because of frequency, not because of strong hands. Players who open the button too tightly are leaving most of their edge unclaimed.',
        },
      ],
      drills: [{ gen: 'build-range', count: 1, params: { position: 'BTN' } }, { gen: 'open-or-fold', count: 5, params: { position: 'BTN' } }],
      takeaway: 'Button: about 45%. The widest range at the table, and the most profitable seat.',
    },
    {
      id: 'l3-05',
      unit: 'Opening',
      title: 'The seats in between',
      skill: 'rfi',
      minutes: 25,
      concepts: [
        {
          title: 'A smooth progression',
          body: 'Middle position is under the gun loosened one notch. The cutoff is where suited connectors first appear, because with three players left you win the pot uncontested often enough to justify hands that need to flop well.\n\nYou do not need four separate charts. You need one shape and a sense of how fast it grows as the players behind you disappear.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 6 }, { gen: 'position-compare', count: 3 }],
      takeaway: 'One shape, growing as players behind you disappear. Roughly 15%, 20%, 28%, 45%.',
    },
    {
      id: 'l3-06',
      unit: 'Opening',
      title: 'Raise sizes and why they barely change',
      skill: 'rfi',
      minutes: 20,
      concepts: [
        {
          title: 'One size, all hands',
          body: 'Open to about 2.5 big blinds, from every seat, with every hand you play. Adding one blind with aces and one less with suited connectors tells observant opponents exactly what you have.\n\nThe size is chosen to be big enough to make continuing a real decision and small enough that the times you get resisted are cheap.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 4 }, { gen: 'bet-size-price', count: 3 }],
      takeaway: 'One opening size for every hand. Varying it by strength is a free tell.',
    },
    {
      id: 'l3-07',
      unit: 'The blinds',
      title: 'The big blind discount',
      skill: 'blind-defence',
      minutes: 30,
      concepts: [
        {
          title: 'You are already invested',
          body: 'When the button raises to 2.5 and you are in the big blind, calling costs you 1.5, not 2.5 — your blind is already in. You are being offered a price nobody else at the table gets.\n\nThat price is around 27%, which an enormous number of hands can beat against a wide button range.',
        },
        {
          title: 'The most common leak in poker',
          body: 'Folding the big blind too often costs more than any other single mistake amateurs make. It happens quietly, one small fold at a time, and it never feels like a mistake because you were "just folding a bad hand".\n\nAgainst a button open you should be continuing with something like 40 to 50% of all hands.',
        },
      ],
      drills: [{ gen: 'bb-defence', count: 3 }],
      takeaway: 'You need around 27% in the big blind. Defend 40 to 50% against a button open.',
    },
    {
      id: 'l3-08',
      unit: 'The blinds',
      title: 'Position pulls the other way',
      skill: 'blind-defence',
      minutes: 25,
      concepts: [
        {
          title: 'A great price for a bad seat',
          body: 'The discount says defend widely. Acting first on every remaining street says be careful. Both are true, and the resolution is: defend wide, but with hands that can make something.\n\nSuited hands, connected hands and pairs keep their value out of position because they either make a strong hand or fold easily. Weak offsuit hands that make one pair and then face three bets are the ones to let go.',
        },
      ],
      drills: [{ gen: 'bb-defence', count: 2 }, { gen: 'open-or-fold', count: 4 }],
      takeaway: 'Defend wide with hands that make something. Fold the offsuit hands that only make one pair.',
    },
    {
      id: 'l3-09',
      unit: 'The blinds',
      title: 'Why the small blind is the worst seat',
      skill: 'blind-defence',
      minutes: 25,
      concepts: [
        {
          title: 'Money in, and still first to act',
          body: 'The small blind has some money invested, like the big blind, but acts before the big blind on every street after the flop and has a player still behind who gets a discount to continue.\n\nThe result is the worst combination in the game: a partial discount that tempts you in, and the worst position for the rest of the hand. Play tight here, and prefer raising to calling when you do play.',
        },
      ],
      drills: [{ gen: 'position-compare', count: 3 }, { gen: 'bb-defence', count: 2 }],
      takeaway: 'Small blind: tight, and raise rather than call. The discount is a trap.',
    },
    {
      id: 'l3-10',
      unit: '3-betting',
      title: 'Why a 3-bet range of only premiums fails',
      skill: 'three-betting',
      minutes: 30,
      concepts: [
        {
          title: 'Transparency is expensive',
          body: 'If you only ever re-raise with queens, kings, aces and ace-king, your opponents know exactly what you have every time. They fold everything that loses and continue only with what beats you.\n\nA range that is always strong wins tiny pots and loses big ones. It is the most common shape among improving players and it caps your win rate hard.',
        },
        {
          title: 'Add hands that are not premium',
          body: 'The fix is to include hands that play well when called and block the hands that would call. Small suited aces are ideal: A5s blocks their aces, makes the nut flush, and can make a wheel.\n\nYou are not "bluffing with rubbish". You are choosing hands whose specific cards make their strong hands less likely.',
        },
      ],
      drills: [{ gen: 'blocker-count', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: 'A 3-bet range needs value hands and blocker hands. Only-premiums is transparent and unprofitable.',
    },
    {
      id: 'l3-11',
      unit: '3-betting',
      title: 'Sizing a 3-bet',
      skill: 'three-betting',
      minutes: 25,
      concepts: [
        {
          title: 'Three times in position, four out of position',
          body: 'Re-raise to about three times their open when you are in position, and about four times when you are not. The extra size out of position charges them more to take a positional edge against you.\n\nAs with opening, use the same size regardless of your hand.',
        },
      ],
      drills: [{ gen: 'bet-size-price', count: 4 }, { gen: 'spr-plan', count: 2 }],
      takeaway: '3x in position, 4x out of position, same size with every hand.',
    },
    {
      id: 'l3-12',
      unit: '3-betting',
      title: 'Facing a 3-bet',
      skill: 'facing-three-bet',
      minutes: 30,
      concepts: [
        {
          title: 'Three options, not two',
          body: 'You can fold, call, or 4-bet. Most players use only fold and call, and use them badly: folding hands that are comfortably ahead of a modern 3-bet range, and calling hands that cannot continue on most flops.\n\nCall with hands that flop well and have room to improve. 4-bet with the top of your range plus a few blockers. Fold the rest without regret.',
        },
        {
          title: 'Check the stack-to-pot ratio first',
          body: 'A 3-bet pot has a much lower SPR than a single-raised pot, often around 3 to 4. That means one pair is often enough to commit, which changes which hands are worth calling with. Speculative hands need deep stacks to be worth it; in 3-bet pots they usually are not.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: 'Fold, call, or 4-bet. Check the SPR first: 3-bet pots commit you faster than you expect.',
    },
    {
      id: 'l3-13',
      unit: 'Hand reading begins',
      title: 'Every action removes hands',
      skill: 'hand-reading',
      minutes: 30,
      concepts: [
        {
          title: 'Subtraction, one street at a time',
          body: 'They open from the cutoff: that is about 28% of hands. They call your 3-bet rather than folding or 4-betting: remove the hands that would have done those instead. What is left is their range.\n\nHand reading is not a psychic skill. It is bookkeeping, done carefully, starting from a sensible assumption about what they play.',
        },
        {
          title: 'Never collapse to one hand',
          body: '"He has aces" is almost always wrong. "He has queens, kings, aces, or ace-king" is usually right and far more useful, because you can compute against it.\n\nThe discipline of holding a *set* of hands in mind, rather than a guess, is what makes the rest of postflop play possible.',
        },
      ],
      drills: [{ gen: 'narrow-range', count: 3 }, { gen: 'range-hit-rate', count: 2 }],
      takeaway: 'Start with their opening range, subtract what each action rules out. Keep it a set, not a guess.',
    },
    {
      id: 'l3-14',
      unit: 'Hand reading begins',
      title: 'How often a range hits a flop',
      skill: 'hand-reading',
      minutes: 30,
      concepts: [
        {
          title: 'Usually, they have nothing',
          body: 'Two unpaired cards miss a three-card flop entirely about two thirds of the time. A typical opening range flops top pair or better only around a quarter of the time.\n\nBeginners assume a bet means a hand. The arithmetic says otherwise: the cards simply do not cooperate often enough for that to be true.',
        },
      ],
      drills: [{ gen: 'range-hit-rate', count: 4 }],
      takeaway: 'A range misses the flop about two thirds of the time. Bets are mostly not hands.',
    },
    {
      id: 'l3-15',
      unit: 'Adjusting',
      title: 'Multiway changes everything',
      skill: 'multiway',
      minutes: 30,
      concepts: [
        {
          title: 'Someone always has something',
          body: 'One opponent misses the flop two thirds of the time. Three opponents all miss only about a third of the time. With four players in, someone usually has a piece.\n\nSo bluffing dies, thin value bets die, and the hands that gain are the ones that make strong hands: pairs that can become sets, suited connectors that can become straights and flushes.',
        },
        {
          title: 'Big offsuit cards get worse',
          body: 'Ace-queen offsuit is a strong heads-up hand and a mediocre five-way hand. It makes one pair, and one pair rarely wins a four-player pot. Raise to cut the field, or be prepared to give up cheaply.',
        },
      ],
      drills: [{ gen: 'equity-vs-range', count: 3 }, { gen: 'open-or-fold', count: 3 }],
      takeaway: 'Multiway: draws and pairs gain, one-pair hands lose. Raise to cut the field.',
    },
    {
      id: 'l3-16',
      unit: 'Adjusting',
      title: 'Playing against limpers',
      skill: 'starting-hands',
      minutes: 25,
      concepts: [
        {
          title: 'A limp is an invitation',
          body: 'A player who calls the big blind rather than raising is almost always weak and almost always inexperienced. Raise larger than usual — add a blind for each limper — and raise with a wider range than you otherwise would.\n\nThey have shown you they do not want to fight for the pot. Charge them for it.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 4 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Raise bigger and wider against limpers. A limp is an admission of weakness.',
    },
    {
      id: 'l3-17',
      unit: 'Adjusting',
      title: 'Short stacks and deep stacks',
      skill: 'spr',
      minutes: 25,
      concepts: [
        {
          title: 'Stack depth changes which hands are good',
          body: 'With 20 big blinds, implied odds barely exist. Suited connectors and small pairs lose most of their value, and high card strength gains, because you will often be all in before the river.\n\nWith 200 big blinds, the reverse: speculative hands that can win enormous pots go up in value, and hands that make one pair go down.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 4 }, { gen: 'implied-odds-chain', count: 1 }],
      takeaway: 'Short stacks favour high cards. Deep stacks favour hands that can make monsters.',
    },
    {
      id: 'l3-18',
      unit: 'Putting it together',
      title: 'Reconstruct every chart',
      skill: 'rfi',
      minutes: 35,
      concepts: [
        {
          title: 'From principles, not memory',
          body: 'You should now be able to derive any opening range from three facts: how many players are behind you, whether you will have position after the flop, and how dominated the hand is by the hands that continue against you.\n\nTest yourself by building a range from scratch and comparing. Where you differ, ask which principle you applied differently. That question is worth more than the correction.',
        },
      ],
      drills: [
        { gen: 'build-range', count: 2 },
        { gen: 'open-or-fold', count: 4 },
      ],
      takeaway: 'Players behind, position after, domination. Three facts generate every chart.',
    },
    {
      id: 'l3-19',
      unit: 'Putting it together',
      title: 'Level 3 checkpoint',
      skill: 'range-grid',
      minutes: 35,
      checkpoint: true,
      concepts: [
        {
          title: 'You think in ranges now',
          body: 'You can build an opening range for any seat, defend a big blind at the right frequency, construct a 3-bet range with value and blockers, and narrow an opponent street by street.\n\nThat is the foundation postflop play is built on. Without it, every flop decision is a guess.',
        },
      ],
      drills: [
        { gen: 'build-range', count: 1 },
        { gen: 'open-or-fold', count: 3 },
        { gen: 'bb-defence', count: 1 },
        { gen: 'narrow-range', count: 2 },
        { gen: 'range-hit-rate', count: 2 },
        { gen: 'combo-count', count: 2 },
        { gen: 'spr-plan', count: 2 },
      ],
      takeaway: 'Preflop is a solved-enough problem. Postflop is where the real game is.',
    },
  ],
};
