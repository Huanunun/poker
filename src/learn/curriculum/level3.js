/**
 * Level 3 — Bet or check. Roughly days 91 to 150.
 *
 * The second decision. The organising idea is that betting has two independent
 * sources of profit — the times they fold, and the times they call and lose —
 * while checking has only one. Beginners count only the second, which is why
 * they check far too much and why "should I bet?" feels like a matter of nerve
 * rather than arithmetic.
 */

export const LEVEL_3 = {
  level: 3,
  name: 'Bet or Check',
  subtitle: 'Two ways to win versus one',
  promise: 'Know before you act whether betting beats checking, and by how much.',
  lessons: [
    {
      id: 'l3-01',
      unit: 'Why bet at all',
      title: 'Betting wins two ways',
      skill: 'bet-decision',
      minutes: 25,
      concepts: [
        {
          title: 'Folds and showdowns are separate profits',
          body: 'When you bet, two good things can happen. They fold and you take the pot now. Or they call, and you still win the pot some of the time.\n\nChecking only ever gives you the second. That is the entire reason betting is correct with far more hands than feels comfortable, and it is worth writing down: **bet EV = fold profit + showdown profit**.',
        },
        {
          title: 'The three reasons to bet',
          body: 'Value: worse hands will call. Protection: better hands might fold, or hands that would outdraw you have to pay. Fold equity: they give up and you win immediately.\n\nA good bet usually has at least one clearly, and often two. A bet with none of the three is just donating.',
        },
      ],
      drills: [{ gen: 'bet-or-check-ev', count: 3 }],
      takeaway: 'Bet EV = the times they fold + the times they call and lose. Checking only gets the second.',
    },
    {
      id: 'l3-02',
      unit: 'Why bet at all',
      title: 'Pricing a bet against a check',
      skill: 'bet-decision',
      minutes: 30,
      concepts: [
        {
          title: 'Both options, both in chips',
          body: 'Checking is worth your equity times the pot. Betting is worth the fold profit plus the showdown profit. Work out both and compare.\n\nThe comparison is often surprising: hands you would instinctively check turn out to be clear bets because the fold profit alone covers the risk.',
        },
      ],
      drills: [{ gen: 'bet-or-check-ev', count: 3 }],
      takeaway: 'Price both. Check = equity × pot. Bet = folds + showdown.',
    },
    {
      id: 'l3-03',
      unit: 'Value',
      title: 'Can a worse hand call?',
      skill: 'value-betting',
      minutes: 25,
      concepts: [
        {
          title: 'The only value-bet test there is',
          body: 'Not "am I strong?" but "will something worse than me put money in?"\n\nIf yes, betting makes money. If no, betting can only be called by better, so it can only lose. Being strong is neither necessary nor sufficient — second pair on a dry river against a station is a value bet, and top pair against a nit who only continues with two pair is not.',
        },
        {
          title: 'The leak nobody notices',
          body: 'Checking good hands on the river out of caution costs more, over a year, than any bluff you will ever get caught making. It feels safe, and it is invisible, because you never see the money you did not win.',
        },
      ],
      drills: [{ gen: 'can-worse-call', count: 4 }, { gen: 'river-value', count: 2 }],
      takeaway: 'Bet whenever a worse hand can call. Checking good hands is the invisible leak.',
    },
    {
      id: 'l3-04',
      unit: 'Value',
      title: 'Thin value',
      skill: 'value-betting',
      minutes: 25,
      concepts: [
        {
          title: 'Betting hands that are only just ahead',
          body: 'A thin value bet gets called by worse slightly more than half the time. It feels uncomfortable, and a large part of a winning player\'s edge lives there.\n\nThe test is unchanged: name two worse hands they would call with. If you can, bet.',
        },
      ],
      drills: [{ gen: 'can-worse-call', count: 3 }, { gen: 'river-value', count: 2 }],
      takeaway: 'If you can name two worse hands that call, it is a value bet.',
    },
    {
      id: 'l3-05',
      unit: 'Bluffing',
      title: 'How often must a bluff work?',
      skill: 'bluffing',
      minutes: 25,
      concepts: [
        {
          title: 'A bluff is a price, not a feeling',
          body: 'You risk your bet to win the pot. The break-even fold rate is your bet divided by the pot plus your bet.\n\nA half-pot bluff needs to work 33% of the time. A pot-sized bluff needs 50%. If you cannot name the number, you are not bluffing, you are hoping.',
        },
        {
          title: 'Bigger bluffs need to work more often',
          body: 'This surprises people, who assume that betting huge makes bluffs better. It makes them more likely to succeed *and* raises the bar they must clear. Usually the bar rises faster.\n\nWhich is why, against most opponents, a modest bluff is better than a giant one.',
        },
      ],
      drills: [{ gen: 'bluff-break-even', count: 4 }],
      takeaway: 'Half pot needs 33% folds. Pot needs 50%. Bigger bluffs need to work more often.',
    },
    {
      id: 'l3-06',
      unit: 'Bluffing',
      title: 'Who are you actually folding out?',
      skill: 'bluffing',
      minutes: 25,
      concepts: [
        {
          title: 'Name the hands, or do not bet',
          body: 'The break-even number tells you how often they must fold. It does not tell you whether they will.\n\nSo before bluffing, name the hands you are folding out. If their range is mostly hands that beat you and will call, no size works. If it is mostly missed draws and weak pairs, a small bet is plenty.',
        },
        {
          title: 'Never bluff a station',
          body: 'Against a player who does not fold, the fold profit is zero and a bluff is a pure donation. This is the single most reliable adjustment in low-stakes cash: identify who never folds, and stop bluffing them entirely.',
        },
      ],
      drills: [{ gen: 'bluff-break-even', count: 2 }, { gen: 'player-type', count: 3 }],
      takeaway: 'Name the folding hands before you bluff. Against stations, never.',
    },
    {
      id: 'l3-07',
      unit: 'Bluffing',
      title: 'Semi-bluffing: the best of both',
      skill: 'semi-bluffing',
      minutes: 30,
      concepts: [
        {
          title: 'A draw that bets wins two ways',
          body: 'Call with a flush draw and you win only by hitting. Bet it and you also win every time they fold.\n\nTwo ways against one. This is the single highest-value habit in this course, and the reason passive players with good draws still lose money.',
        },
        {
          title: 'And the model understates it',
          body: 'The EV numbers in these drills stop at this street. In a real hand a semi-bluff also wins more on later streets when you hit, because you have already built the pot.\n\nSo whenever a semi-bluff looks close, it is better than it looks.',
        },
      ],
      drills: [{ gen: 'semibluff-ev', count: 3 }],
      takeaway: 'Bet your draws. Two ways to win beats one, and the maths understates it.',
    },
    {
      id: 'l3-08',
      unit: 'Bluffing',
      title: 'Which draws to bet, and which to check',
      skill: 'semi-bluffing',
      minutes: 25,
      concepts: [
        {
          title: 'The bigger the draw, the more it wants to bet',
          body: 'A flush draw with two overcards can bet, get raised, and still continue comfortably. A gutshot with nothing else usually wants a cheap card instead.\n\nThe rough line: if you would be happy getting raised, bet. If a raise would force you to fold a hand with real equity, consider checking.',
        },
      ],
      drills: [{ gen: 'semibluff-ev', count: 2 }, { gen: 'bet-or-check-ev', count: 2 }],
      takeaway: 'Bet the draws you would be happy to get raised with.',
    },
    {
      id: 'l3-09',
      unit: 'Which flops',
      title: 'Whose range does this board favour?',
      skill: 'range-advantage',
      minutes: 30,
      concepts: [
        {
          title: 'The board hits one range harder',
          body: 'You raised, they called. Your range has more big cards; theirs has more middling and suited ones. So an ace-king-four flop belongs to you, and a seven-six-five flop belongs to them.\n\nWhoever the board favours gets to do the betting. Ask this before you look at your own two cards.',
        },
        {
          title: 'Why it works',
          body: 'On a board that fits your range you hold more strong hands, so they cannot fight back hard, and your bets succeed cheaply. On a board that fits theirs, your bets get called and raised by hands that beat you.\n\nBetting is not a reward for having raised preflop. It is a tool that works when the board supports it.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 4 }],
      takeaway: 'Ask whose range the flop favours before you look at your hand.',
    },
    {
      id: 'l3-10',
      unit: 'Which flops',
      title: 'Dry boards and wet boards',
      skill: 'texture',
      minutes: 25,
      concepts: [
        {
          title: 'How much did this flop help everybody?',
          body: 'A dry flop is disconnected and rainbow with one high card — very few hands connect. A wet flop is connected or suited or both, and an enormous number of hands have a pair, a draw, or several.\n\nDry boards are where small bets work, because nobody has anything and there is nothing to charge. Wet boards need bigger bets, because real draws will happily call a cheap price and beat you.',
        },
      ],
      drills: [{ gen: 'flop-texture', count: 4 }, { gen: 'spot-draws', count: 2 }],
      takeaway: 'Dry boards: bet small, bet often. Wet boards: bet bigger, bet less often.',
    },
    {
      id: 'l3-11',
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
      id: 'l3-12',
      unit: 'Continuation betting',
      title: 'Planning the turn before betting the flop',
      skill: 'turn-play',
      minutes: 30,
      concepts: [
        {
          title: 'What will you do on a blank?',
          body: 'Before putting money in on the flop, decide what you will do on a card that changes nothing. If the answer is "give up", that is fine — but knowing it now changes how much you should bet.\n\nMost stacks are lost by players who bet the flop with no plan and then feel obliged to continue.',
        },
        {
          title: 'Sort the deck in advance',
          body: 'Cards that improve your range let you keep betting. Cards that complete obvious draws mean slowing down. Decide which is which before the turn arrives, not after.',
        },
      ],
      drills: [{ gen: 'cbet-decision', count: 2 }, { gen: 'bet-or-check-ev', count: 2 }],
      takeaway: 'Decide your turn plan before betting the flop, especially the plan for blanks.',
    },
    {
      id: 'l3-13',
      unit: 'Putting it together',
      title: 'Level 3 checkpoint',
      skill: 'bet-decision',
      minutes: 30,
      checkpoint: true,
      concepts: [
        {
          title: 'You can decide whether to put money in',
          body: 'You can price betting against checking, name the fold rate a bluff needs, recognise the boards that belong to you, and see why a draw would rather bet than call.\n\nOne question left in this decision: how much.',
        },
      ],
      drills: [
        { gen: 'bet-or-check-ev', count: 2 },
        { gen: 'can-worse-call', count: 2 },
        { gen: 'bluff-break-even', count: 2 },
        { gen: 'semibluff-ev', count: 1 },
        { gen: 'range-advantage', count: 2 },
        { gen: 'cbet-decision', count: 1 },
      ],
      takeaway: 'Whether to bet is settled. Next: how much.',
    },
  ],
};
