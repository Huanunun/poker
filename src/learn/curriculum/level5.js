/**
 * Level 5 — Raise or call. Roughly days 216 to 280.
 *
 * The last of the five decisions and the one beginners get wrong most often,
 * usually by never raising at all. The core exercise is comparing the two lines
 * with the identical two cards, so it becomes obvious that raising is not
 * "calling but braver" — it is a different action with a different EV that can
 * be better or worse than calling depending on numbers you can work out.
 */

export const LEVEL_5 = {
  level: 5,
  name: 'Raise or Call',
  subtitle: 'Same cards, two different lines',
  promise: 'Know which of calling and raising is worth more, and how much to raise.',
  lessons: [
    {
      id: 'l5-01',
      unit: 'Why raise',
      title: 'Three reasons, and none of them is confidence',
      skill: 'raise-decision',
      minutes: 25,
      concepts: [
        {
          title: 'Value, protection, fold equity',
          body: 'You raise to get more money in while ahead, to charge hands that would outdraw you, or to make better hands fold.\n\nIf a raise does none of those, it is not a raise, it is a donation with extra steps. Before raising, name which one you are doing.',
        },
        {
          title: 'Raising is priced like everything else',
          body: 'A raise wins the pot plus their bet when they fold, and builds a bigger pot when they call. Both halves depend on the size, and both are computable.\n\nSo "should I raise?" is never a matter of nerve. It is a comparison between two numbers.',
        },
      ],
      drills: [{ gen: 'raise-or-call', count: 3 }],
      takeaway: 'Raise for value, protection, or folds. Name which one before you do it.',
    },
    {
      id: 'l5-02',
      unit: 'Why raise',
      title: 'The same hand, both ways',
      skill: 'raise-decision',
      minutes: 30,
      concepts: [
        {
          title: 'Calling and raising are genuinely different actions',
          body: 'With a strong hand, raising usually wins: you want money in while you are ahead, and the folds you cause are a cost you accept.\n\nWith a modest hand, raising wins on fold equity or not at all. Against someone who never folds, calling with the identical cards is the better line. Same two cards, opposite answers, decided by one number about the opponent.',
        },
      ],
      drills: [{ gen: 'raise-or-call', count: 4 }],
      takeaway: 'Strong hands raise for value. Modest hands raise only if folds are available.',
    },
    {
      id: 'l5-03',
      unit: 'How much',
      title: 'Sizing a raise',
      skill: 'raise-sizing',
      minutes: 30,
      concepts: [
        {
          title: 'About three times their bet',
          body: 'The standard raise is roughly three times their bet in position and four times out of position.\n\nNot for tradition: that is approximately where extra fold equity stops being worth the extra risk. Raise smaller and you give a good price to hands that should be folding; raise larger and you risk a lot to fold out hands that were already folding.',
        },
        {
          title: 'And check what it does to the stack',
          body: 'At 100bb, a raise on the flop often commits you to the hand whether you intended it or not. Work out the SPR after your raise before you make it — if it leaves you pot-committed with a hand you did not want to play for stacks, the size was wrong.',
        },
      ],
      drills: [{ gen: 'raise-sizing', count: 3 }, { gen: 'spr-plan', count: 2 }],
      takeaway: '3× their bet in position, 4× out. Check the SPR your raise creates.',
    },
    {
      id: 'l5-04',
      unit: 'How much',
      title: 'Raising as a semi-bluff',
      skill: 'raise-sizing',
      minutes: 25,
      concepts: [
        {
          title: 'The best raising hands are often draws',
          body: 'A flush draw that raises wins immediately sometimes, and makes the best hand the rest of the time. It also disguises the hand completely, because most players raise only with made hands.\n\nAnd if they call, you have built a pot you will often win — which is the opposite of the usual complaint that raising a draw "bloats the pot".',
        },
      ],
      drills: [{ gen: 'raise-sizing', count: 2 }, { gen: 'semibluff-ev', count: 2 }],
      takeaway: 'Draws make excellent raising hands: fold equity now, real equity when called.',
    },
    {
      id: 'l5-05',
      unit: 'Facing aggression',
      title: 'When they raise you',
      skill: 'raise-decision',
      minutes: 30,
      concepts: [
        {
          title: 'A raise is a much stronger statement than a bet',
          body: 'Most players bet with a wide range and raise with a narrow one. So facing a raise, cut their range hard — and cut your own continuing range harder than feels comfortable.\n\nTop pair is a fine hand facing a bet and often a marginal one facing a raise. The hand did not change; what you know about theirs did.',
        },
        {
          title: 'Three options, not two',
          body: 'You can fold, call, or re-raise. Most players use only the first two and use them badly.\n\nRe-raising is right when you have a genuinely strong hand or a strong draw and they raise wide. Calling is right with hands that can continue on most turns. Folding is right far more often than ego suggests.',
        },
      ],
      drills: [{ gen: 'fold-call-raise', count: 3 }],
      takeaway: 'Facing a raise, cut their range and yours. Fold more than feels right.',
    },
    {
      id: 'l5-06',
      unit: 'Facing aggression',
      title: 'The full decision: fold, call, or raise',
      skill: 'decision-making',
      minutes: 35,
      concepts: [
        {
          title: 'Three numbers, pick the biggest',
          body: 'This is the whole course in one exercise. Fold is worth 0. Calling is worth your equity times the pot minus the times you lose your call. Raising is worth the folds plus the showdown.\n\nCompute all three, take the biggest. When the top two are within half a big blind, relax — either is defensible and the read matters more than the arithmetic.',
        },
      ],
      drills: [{ gen: 'fold-call-raise', count: 4 }],
      takeaway: 'Price fold, call and raise. Take the biggest. Relax when it is close.',
    },
    {
      id: 'l5-07',
      unit: 'Before the flop',
      title: '3-betting: why premiums only fails',
      skill: 'three-betting',
      minutes: 30,
      concepts: [
        {
          title: 'A transparent range wins tiny pots',
          body: 'If you only ever re-raise with queens, kings, aces and ace-king, everyone knows exactly what you have. They fold everything that loses and continue only with what beats you.\n\nA range that is always strong wins small pots and loses big ones. It is the most common shape among improving players and it caps your win rate hard.',
        },
        {
          title: 'Add hands whose cards do work',
          body: 'Small suited aces are the standard addition: A5s blocks their aces and ace-king, makes the nut flush, and can make a wheel.\n\nYou are not "3-betting rubbish". You are choosing hands whose specific cards make their strong hands less likely, which is a real edge available for free.',
        },
      ],
      drills: [{ gen: 'blocker-count', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: 'A 3-bet range needs value hands and blocker hands. Premiums-only is transparent.',
    },
    {
      id: 'l5-08',
      unit: 'Before the flop',
      title: 'Facing a 3-bet at 100 big blinds',
      skill: 'facing-three-bet',
      minutes: 30,
      concepts: [
        {
          title: 'The SPR decides before the flop does',
          body: 'Call a 3-bet at 100bb and the pot is around 20bb with 80bb behind — an SPR of about 4. That means one strong pair is often enough to commit, which changes everything about which hands are worth continuing with.\n\nSuited connectors and small pairs need deep stacks to be worth it. In a 3-bet pot they usually do not have them, so they become folds rather than calls.',
        },
      ],
      drills: [{ gen: 'spr-plan', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: '3-bet pots run at SPR 4. Continue with hands that want that, not speculative ones.',
    },
    {
      id: 'l5-09',
      unit: 'Putting it together',
      title: 'Level 5 checkpoint',
      skill: 'raise-decision',
      minutes: 35,
      checkpoint: true,
      concepts: [
        {
          title: 'All five decisions are yours',
          body: 'Fold, check, call, bet, raise — each priced, each compared, each with a size attached where it needs one.\n\nWhat remains is the table itself: six to ten players, multiway pots, and doing all of this in the few seconds you actually get.',
        },
      ],
      drills: [
        { gen: 'fold-call-raise', count: 2 },
        { gen: 'raise-or-call', count: 2 },
        { gen: 'raise-sizing', count: 2 },
        { gen: 'blocker-count', count: 2 },
        { gen: 'spr-plan', count: 2 },
      ],
      takeaway: 'Every decision priced. Next: the real table, with nine other people at it.',
    },
  ],
};
