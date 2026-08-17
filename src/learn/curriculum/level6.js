/**
 * Level 6 — The full table. Roughly days 281 to 365.
 *
 * Everything so far has been implicitly heads-up. Real cash games are six to
 * ten handed, pots go multiway, and every decision has to be made in about five
 * seconds. This level covers all three, and ends by handing the learner the
 * study loop so the course makes itself unnecessary.
 */

export const LEVEL_6 = {
  level: 6,
  name: 'The Full Table',
  subtitle: 'Six to ten players, at speed',
  promise: 'Make these decisions in five seconds at a real table, and keep improving without this app.',
  lessons: [
    {
      id: 'l6-01',
      unit: 'Table size',
      title: 'Under the gun is not one seat',
      skill: 'position',
      minutes: 25,
      concepts: [
        {
          title: 'The same seat name means different things',
          body: 'At a 6-handed table, under the gun has four players behind. At a 9-handed table it has seven. The same two cards are a comfortable open in one and a clear fold in the other.\n\nPlaying a full-ring game with 6-max ranges is one of the most common and expensive mistakes there is, and it is entirely avoidable by asking one question: how many people still have to act?',
        },
        {
          title: 'The rule that generates every chart',
          body: 'Count the players behind you. That number, more than anything about your cards, decides how strong your hand needs to be.\n\nYou do not need eight memorised ranges. You need one shape that widens smoothly as the players behind you disappear.',
        },
      ],
      drills: [{ gen: 'table-size-effect', count: 4 }],
      takeaway: 'Count the players behind you. That number sets how strong your hand must be.',
    },
    {
      id: 'l6-02',
      unit: 'Table size',
      title: 'Where the money comes from at a full table',
      skill: 'position',
      minutes: 25,
      concepts: [
        {
          title: 'Late position and the blinds',
          body: 'At a 9 or 10-handed table you will fold roughly 80% of your hands, and most of your profit comes from the button and cutoff, plus defending your big blind at the right frequency.\n\nThat is not a boring style, it is where the edge actually is. The early seats are a cost of doing business.',
        },
      ],
      drills: [{ gen: 'open-or-fold', count: 3 }, { gen: 'open-sizing', count: 2 }, { gen: 'bb-defence', count: 1 }],
      takeaway: 'Full ring: fold most hands, make money on the button and in the big blind.',
    },
    {
      id: 'l6-03',
      unit: 'Multiway',
      title: 'Three players changes the arithmetic',
      skill: 'multiway',
      minutes: 30,
      concepts: [
        {
          title: 'Everyone has to fold, and they will not',
          body: 'One opponent misses the flop about two thirds of the time. Three opponents all missing happens closer to a quarter of the time.\n\nSo bluffing multiway is close to hopeless, and thin value bets stop working because someone in there has something real. Multiway pots are for strong hands and draws, not for creativity.',
        },
        {
          title: 'Value gets better, bluffs die',
          body: 'The compensation is that when you do have a big hand, there are more people to pay you. Multiway is where value betting earns the most and where bluffing earns the least.\n\nThe adjustment is simple and mechanical: narrower, harder, and almost no bluffs.',
        },
      ],
      drills: [{ gen: 'multiway-decision', count: 3 }, { gen: 'multiway-equity', count: 2 }],
      takeaway: 'Multiway: value bet narrower and bigger, and bluff almost never.',
    },
    {
      id: 'l6-04',
      unit: 'Multiway',
      title: 'Pot odds with several players in',
      skill: 'multiway',
      minutes: 25,
      concepts: [
        {
          title: 'The price improves, the requirement rises',
          body: 'More callers means a bigger pot and a better price on your call. It also means more players who might have you beaten, so the equity you need against the *field* is higher than against any one of them.\n\nThe practical effect: drawing hands do well multiway because the price is good and their draw beats everyone when it hits. Marginal made hands do badly, because the good price does not compensate for having to beat four people.',
        },
      ],
      drills: [{ gen: 'multiway-equity', count: 3 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Multiway improves your price and raises the bar. Draws gain, weak pairs lose.',
    },
    {
      id: 'l6-05',
      unit: 'At speed',
      title: 'The five-second version',
      skill: 'decision-making',
      minutes: 30,
      concepts: [
        {
          title: 'What you actually run at the table',
          body: 'You will not compute EV in real time. You run a compressed version: What is the size, so what is my price? What do I have, roughly what is my equity? Is equity bigger than price? Would raising fold anything out?\n\nFour questions, a few seconds. The full arithmetic you have been practising is what makes the fast version accurate — you are not guessing, you are recognising numbers you have derived a hundred times.',
        },
        {
          title: 'Anchors instead of calculations',
          body: 'Flush draw on the flop, one card: about 19%. Both cards: about 35%. Open-ender: 17% and 32%. Gutshot: 9% and 16%. Every standard bet needs between 20% and 33%.\n\nYou derived all of these. Now they work as instant recognition, and the derivation is there when a spot is unusual.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 3 }, { gen: 'fold-call-raise', count: 2 }],
      takeaway: 'Size → price. Hand → equity. Compare. Consider a raise. Four questions, five seconds.',
    },
    {
      id: 'l6-06',
      unit: 'At speed',
      title: 'Deciding before it is your turn',
      skill: 'decision-making',
      minutes: 25,
      concepts: [
        {
          title: 'Use the time you are given',
          body: 'Most of a hand happens while you are waiting. Work out the price, name the likely hands, decide what you will do if they bet small and what you will do if they bet big — before the action reaches you.\n\nThis alone removes most time pressure, and it stops the tell of taking a long time only in difficult spots.',
        },
      ],
      drills: [{ gen: 'fold-call-raise', count: 2 }, { gen: 'river-call-combos', count: 2 }],
      takeaway: 'Decide your responses before the action reaches you. It removes time pressure and a tell.',
    },
    {
      id: 'l6-07',
      unit: 'Staying in the game',
      title: 'Bankroll and stakes',
      skill: 'bankroll',
      minutes: 25,
      concepts: [
        {
          title: 'Enough buy-ins to outlast the noise',
          body: 'Thirty buy-ins is the usual minimum for cash games, and more while you are learning. This is not caution for its own sake — it is what lets a real edge survive an ordinary bad run.\n\nA winning player with too small a bankroll goes broke. The edge was real; the sample was too short.',
        },
        {
          title: 'Moving up and down',
          body: 'Move up when you have the bankroll and are genuinely beating the current level over a real sample. Both, not one.\n\nMove down mechanically when the bankroll drops below the threshold. It is a rule, not a judgement, and the players who follow it are the ones still playing years later.',
        },
      ],
      drills: [{ gen: 'bankroll-check', count: 3 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Thirty buy-ins minimum. Move up on bankroll plus proven edge; move down mechanically.',
    },
    {
      id: 'l6-08',
      unit: 'Staying in the game',
      title: 'Tilt, and the rule you write in advance',
      skill: 'tilt',
      minutes: 25,
      concepts: [
        {
          title: 'It does not always feel like anger',
          body: 'Tilt is any state where emotion rather than reasoning is choosing your actions. Frustration after a bad beat is the obvious form. Boredom while card dead is tilt. Overconfidence while winning is tilt.\n\nThe common signature is a reason that sounds like strategy but arrived after the feeling.',
        },
        {
          title: 'Decide while calm',
          body: 'You will not judge well whether to keep playing while tilted, so decide now: a specific trigger and a specific response. "If I lose two big pots in a row, I stand up for ten minutes."\n\nWritten down, followed automatically, no judgement required in the moment.',
        },
      ],
      drills: [{ gen: 'tilt-check', count: 3 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Tilt is emotion choosing your actions. Write the stop rule while calm.',
    },
    {
      id: 'l6-09',
      unit: 'Your own loop',
      title: 'Reviewing hands without hindsight',
      skill: 'review-process',
      minutes: 30,
      concepts: [
        {
          title: 'Judge with the information you had',
          body: 'Review with their cards hidden first. Work out what you should have done, then look.\n\nReviewing with the answer visible teaches you to recognise outcomes rather than decisions, which is the exact habit that stops people improving.',
        },
        {
          title: 'Review the ordinary hands',
          body: 'The instinct is to review disasters, but big losses are usually either obvious mistakes or plain bad luck, and neither teaches much.\n\nThe money is in the routine spots you play on autopilot dozens of times a session. A small error there, repeated, costs far more than one spectacular blow-up.',
        },
      ],
      drills: [{ gen: 'fold-call-raise', count: 2 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Review with their cards hidden, and review ordinary hands, not disasters.',
    },
    {
      id: 'l6-10',
      unit: 'Your own loop',
      title: 'Running your own improvement',
      skill: 'study-loop',
      minutes: 30,
      concepts: [
        {
          title: 'The loop',
          body: 'Play. Notice discomfort. Turn it into a specific question with a numeric answer. Answer it in the sandbox. Drill it. Return to playing.\n\nThat is the whole method, and it is the same at every level from your first session to your ten-thousandth. If that loop is running, you no longer need this course — which was always the point.',
        },
        {
          title: 'Use the sandbox as your calculator',
          body: 'When a hand puzzles you, set it up and change one thing at a time. What if they had a flush draw instead? What if the pot were twice as big? Watching the number move is how intuition gets built.\n\nCuriosity plus a calculator is a complete study method.',
        },
      ],
      drills: [
        { gen: 'fold-call-raise', count: 2 },
        { gen: 'choose-bet-size', count: 2 },
        { gen: 'river-call-combos', count: 1 },
      ],
      takeaway: 'Play, notice, question, answer, drill, return. The loop is the skill.',
    },
    {
      id: 'l6-11',
      unit: 'Your own loop',
      title: 'Final checkpoint',
      skill: 'decision-making',
      minutes: 40,
      checkpoint: true,
      concepts: [
        {
          title: 'Everything, one last time',
          body: 'This samples the whole course: pricing calls, choosing between betting and checking, sizing, raising, multiway adjustments, full-ring position, and your own discipline.\n\nWhatever it finds weak gets scheduled. Sessions continue past day 365, drawing from everything, indefinitely.',
        },
      ],
      drills: [
        { gen: 'ev-of-folding', count: 1 },
        { gen: 'outs-chain', count: 1 },
        { gen: 'bet-size-price', count: 1 },
        { gen: 'ev-call-chain', count: 1 },
        { gen: 'bet-or-check-ev', count: 1 },
        { gen: 'bluff-break-even', count: 1 },
        { gen: 'semibluff-ev', count: 1 },
        { gen: 'choose-bet-size', count: 1 },
        { gen: 'raise-or-call', count: 1 },
        { gen: 'raise-sizing', count: 1 },
        { gen: 'fold-call-raise', count: 2 },
        { gen: 'river-call-combos', count: 1 },
        { gen: 'open-sizing', count: 1 },
        { gen: 'table-size-effect', count: 1 },
        { gen: 'multiway-decision', count: 1 },
        { gen: 'reverse-implied', count: 1 },
      ],
      takeaway: 'Five decisions, priced in chips, at a table of any size. Go and play.',
    },
  ],
};
