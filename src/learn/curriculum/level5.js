/**
 * Level 5 — The opponent. Roughly days 241 to 320.
 *
 * Everything so far has been about the cards and the maths, which are the same
 * for everyone. This level is about the fact that you are not playing the game,
 * you are playing a person who is playing the game badly in a specific,
 * identifiable way.
 *
 * The framing throughout: theory is the baseline you fall back to when you know
 * nothing. Exploitation is where the money is, and it requires paying attention.
 */

export const LEVEL_5 = {
  level: 5,
  name: 'The Opponent',
  subtitle: 'Playing people, not cards',
  promise: 'Spot a tendency within an orbit, and know exactly how to punish it.',
  lessons: [
    {
      id: 'l5-01',
      unit: 'Classification',
      title: 'Two numbers describe most players',
      skill: 'player-types',
      minutes: 30,
      concepts: [
        {
          title: 'How often they play, how often they raise',
          body: 'Every player can be roughly located by two figures: the share of hands they voluntarily enter, and the share they raise with. A big gap between them means a passive caller. A small gap at a high number means an aggressive player. A small gap at a low number means someone who only plays good hands.\n\nYou do not need software. Watching for twenty hands gives you a usable estimate.',
        },
        {
          title: 'The four archetypes',
          body: 'Calling station: plays everything, raises nothing, calls too much. Nit: plays almost nothing, and means it. Maniac: plays and raises everything. Solid regular: around a quarter of hands, mostly raised.\n\nMost low-stakes players are stations or nits, and both are highly exploitable in opposite directions.',
        },
      ],
      drills: [{ gen: 'player-type', count: 5 }],
      takeaway: 'Frequency and aggression locate any player. Watch twenty hands and you have both.',
    },
    {
      id: 'l5-02',
      unit: 'Classification',
      title: 'Beating the calling station',
      skill: 'exploits',
      minutes: 30,
      concepts: [
        {
          title: 'Never bluff, always value bet',
          body: 'A player who calls too much cannot be bluffed, by definition. Every chip you put in as a bluff is a donation.\n\nThe correction is not subtle: stop bluffing entirely, and value bet much thinner than you would against anyone else. Third pair becomes a river bet. They will call, and that is the entire plan.',
        },
        {
          title: 'This is the most profitable adjustment in poker',
          body: 'Calling stations are common at low stakes and the exploit is simple and enormous. Players who cannot resist bluffing them are lighting money on fire while a very easy alternative sits in front of them.',
        },
      ],
      drills: [{ gen: 'player-type', count: 3 }, { gen: 'river-value', count: 3 }],
      takeaway: 'Against stations: zero bluffs, very thin value. It is the biggest easy edge there is.',
    },
    {
      id: 'l5-03',
      unit: 'Classification',
      title: 'Beating the nit',
      skill: 'exploits',
      minutes: 25,
      concepts: [
        {
          title: 'Steal constantly, believe them always',
          body: 'A player who folds too much should be attacked at every opportunity: raise their blinds, bet their checks, take the small pots they surrender.\n\nAnd when they finally raise, fold. They only do it with a real hand. The two exploits work together, and both are easy.',
        },
      ],
      drills: [{ gen: 'player-type', count: 3 }, { gen: 'mdf-chain', count: 2 }],
      takeaway: 'Against nits: steal relentlessly, and fold the moment they show aggression.',
    },
    {
      id: 'l5-04',
      unit: 'Classification',
      title: 'Beating the maniac',
      skill: 'exploits',
      minutes: 25,
      concepts: [
        {
          title: 'Let them bet for you',
          body: 'Against someone who bets everything, stop bluffing and start calling wider. Their range is mostly air, so hands you would normally fold become profitable calls.\n\nThe temptation is to fight fire with fire. Do not. Sit back, widen your calling range, and let them hand you their stack.',
        },
      ],
      drills: [{ gen: 'player-type', count: 3 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Against maniacs: call wider, bluff never. Let their aggression pay you.',
    },
    {
      id: 'l5-05',
      unit: 'Reading patterns',
      title: 'Bet sizing as a tell',
      skill: 'bet-tells',
      minutes: 30,
      concepts: [
        {
          title: 'Amateurs size by feeling',
          body: 'Most inexperienced players bet big when they are strong and small when they are weak, or the exact reverse if they have read one book about it. Either way it is a pattern, and it is readable within an hour.\n\nWatch sizes at showdown. Two or three data points usually reveal the whole scheme.',
        },
        {
          title: 'The overbet from a passive player',
          body: 'A player who has been betting half pot all session suddenly bets twice the pot. Against a thinking opponent that could be a polarised range. Against a passive amateur it is almost always the nuts.\n\nBelieve unusual actions from unimaginative players.',
        },
      ],
      drills: [{ gen: 'sizing-choice', count: 3 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Amateurs size by strength. Watch showdowns and the code breaks quickly.',
    },
    {
      id: 'l5-06',
      unit: 'Reading patterns',
      title: 'Timing and hesitation',
      skill: 'bet-tells',
      minutes: 25,
      concepts: [
        {
          title: 'Instant and slow both mean something',
          body: 'An instant call usually means a hand that was never going to fold and was not strong enough to raise — a medium hand. An instant bet is often a planned bluff. A long pause before a big bet is frequently genuine strength being sized carefully.\n\nThese are tendencies, not laws. Use them to break ties, never as your main evidence.',
        },
        {
          title: 'Guard your own timing',
          body: 'Take a consistent amount of time on every decision. If you act instantly with bluffs and slowly with value, you are giving away more than any tell you will ever read.',
        },
      ],
      drills: [{ gen: 'player-type', count: 3 }, { gen: 'bluff-selection', count: 2 }],
      takeaway: 'Timing breaks ties, never decides hands. Keep your own timing constant.',
    },
    {
      id: 'l5-07',
      unit: 'Reading patterns',
      title: 'The hands they show down',
      skill: 'hand-reading',
      minutes: 30,
      concepts: [
        {
          title: 'Free information, mostly ignored',
          body: 'Every showdown tells you what someone was willing to play that way. Most players watch the cards and forget them instantly.\n\nKeep one fact per opponent: the weakest hand you have seen them call a river bet with, or the widest hand you have seen them raise. One fact each is enough to change how you play against them.',
        },
      ],
      drills: [{ gen: 'narrow-range', count: 3 }, { gen: 'range-hit-rate', count: 2 }],
      takeaway: 'Remember one showdown fact per opponent. It is free and almost nobody does it.',
    },
    {
      id: 'l5-08',
      unit: 'Balance',
      title: 'What being balanced actually means',
      skill: 'gto-vs-exploit',
      minutes: 30,
      concepts: [
        {
          title: 'Unexploitable, not unbeatable',
          body: 'A balanced strategy is one where your opponent cannot profit from any adjustment. It has the right ratio of value hands to bluffs at each size, and it defends at the right frequency.\n\nIt does not maximise your winnings. It guarantees you cannot be exploited, which is a different and more modest goal.',
        },
        {
          title: 'When you actually need it',
          body: 'Against strong, observant opponents who will notice and punish a pattern. Against everyone else, balance costs you money, because you are declining to exploit an obvious weakness in order to defend against an attack that is not coming.',
        },
      ],
      drills: [{ gen: 'mdf-chain', count: 3 }],
      takeaway: 'Balance defends against good players. Against bad ones it costs you money.',
    },
    {
      id: 'l5-09',
      unit: 'Balance',
      title: 'Deviating on purpose',
      skill: 'gto-vs-exploit',
      minutes: 30,
      concepts: [
        {
          title: 'Every exploit opens you up',
          body: 'When you stop bluffing against a station, your bets become entirely value. That is exploitable — but only by someone paying attention, and the station is not.\n\nDeviate consciously. Know which weakness you are attacking and what it costs if they adjust. Then watch for the adjustment.',
        },
      ],
      drills: [{ gen: 'player-type', count: 3 }, { gen: 'river-value', count: 2 }],
      takeaway: 'Exploit deliberately, know your exposure, and watch for the counter-adjustment.',
    },
    {
      id: 'l5-10',
      unit: 'Balance',
      title: 'The baseline you return to',
      skill: 'gto-vs-exploit',
      minutes: 25,
      concepts: [
        {
          title: 'What to do when you know nothing',
          body: 'New table, unknown opponents: play the balanced baseline. Sensible ranges, sensible sizes, defend at roughly the right frequency.\n\nThen gather information and deviate as it arrives. Theory is the map you use until you can see the terrain.',
        },
      ],
      drills: [{ gen: 'mdf-chain', count: 2 }, { gen: 'cbet-decision', count: 2 }],
      takeaway: 'Start balanced against unknowns. Deviate as information arrives.',
    },
    {
      id: 'l5-11',
      unit: 'Advanced hand reading',
      title: 'Ranges through three streets',
      skill: 'hand-reading',
      minutes: 35,
      concepts: [
        {
          title: 'Narrow at every action',
          body: 'They open the cutoff, c-bet a K-7-2 flop, check the turn, then bet big on a river nine. Each action removes hands. The check on the turn removes most strong hands; the big river bet after that check is either a hand that improved or a bluff.\n\nBy the river a well-tracked range is often a handful of combinations, and you can count them.',
        },
        {
          title: 'Count the combinations, then compare',
          body: 'How many combinations beat you, how many do not, and what price are you being offered? If twelve combinations beat you and eight do not, you are good 40% of the time, and a half-pot bet needs 25%.\n\nThis is the whole endgame of hand reading: turning a story into a number.',
        },
      ],
      drills: [{ gen: 'narrow-range', count: 3 }, { gen: 'blocker-count', count: 3 }],
      takeaway: 'Narrow street by street, then count combinations against the price.',
    },
    {
      id: 'l5-12',
      unit: 'Advanced hand reading',
      title: 'What their checks tell you',
      skill: 'hand-reading',
      minutes: 30,
      concepts: [
        {
          title: 'Absence of a bet is information',
          body: 'When a player checks a flop that heavily favours their range, they usually do not have it. When they check the turn after betting the flop, they have often given up.\n\nBeginners only read bets. Half the information at the table is in the actions that did not happen.',
        },
      ],
      drills: [{ gen: 'range-advantage', count: 3 }, { gen: 'narrow-range', count: 2 }],
      takeaway: 'Read checks as hard as you read bets. Missing aggression is a strong signal.',
    },
    {
      id: 'l5-13',
      unit: 'Advanced hand reading',
      title: 'Blockers on the river',
      skill: 'blockers',
      minutes: 30,
      concepts: [
        {
          title: 'Where blockers matter most',
          body: 'On the river, ranges are narrow and every combination counts. Holding one card of the nut flush suit, or one of the cards that completes the obvious straight, meaningfully changes how many strong hands they can have.\n\nThis is where the combinatorics from level two pays off in real money.',
        },
      ],
      drills: [{ gen: 'blocker-count', count: 4 }, { gen: 'bluff-selection', count: 2 }],
      takeaway: 'On narrow river ranges, one blocker can flip a decision.',
    },
    {
      id: 'l5-14',
      unit: 'Table dynamics',
      title: 'Choosing where to sit',
      skill: 'table-selection',
      minutes: 25,
      concepts: [
        {
          title: 'The most profitable decision you make',
          body: 'Your win rate depends more on who you play against than on how well you play. An average player at a soft table earns more than a strong player at a tough one.\n\nLook for tables with high average pot sizes and many players seeing the flop. Those are the tables with loose, passive players in them.',
        },
        {
          title: 'Sit to the left of the loose players',
          body: 'You want position on the players who play the most hands, so you act after them. If you cannot get that seat, consider a different table.',
        },
      ],
      drills: [{ gen: 'player-type', count: 4 }, { gen: 'position-compare', count: 2 }],
      takeaway: 'Game selection beats strategy improvement. Sit to the left of the loose players.',
    },
    {
      id: 'l5-15',
      unit: 'Table dynamics',
      title: 'When to leave',
      skill: 'table-selection',
      minutes: 20,
      concepts: [
        {
          title: 'Two good reasons to stand up',
          body: 'The soft players left, or you are not playing well. Neither is about how much you are up or down.\n\nStaying at a table that has turned tough, in order to "win the money back", is the same mistake as chasing a draw at a bad price, and it is far more expensive.',
        },
      ],
      drills: [{ gen: 'tilt-check', count: 3 }, { gen: 'player-type', count: 2 }],
      takeaway: 'Leave when the soft players go or your play degrades. Never based on your result.',
    },
    {
      id: 'l5-16',
      unit: 'The mental game',
      title: 'Recognising tilt in yourself',
      skill: 'tilt',
      minutes: 30,
      concepts: [
        {
          title: 'It does not always feel like anger',
          body: 'Tilt is any state where emotion rather than reasoning is choosing your actions. Frustration after a bad beat is the obvious form. Boredom during a card-dead stretch is tilt. Overconfidence when winning is tilt.\n\nThe common signature is a reason that sounds like strategy but arrived after the feeling.',
        },
        {
          title: 'Decide the rule while calm',
          body: 'You will not make a good decision about whether to keep playing while tilted. So make it now: a specific trigger, and a specific response. "If I lose two big pots in a row, I stand up for ten minutes." Written down, followed automatically.',
        },
      ],
      drills: [{ gen: 'tilt-check', count: 4 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Tilt is emotion choosing your actions. Write the stop rule while you are calm.',
    },
    {
      id: 'l5-17',
      unit: 'The mental game',
      title: 'Bankroll as survival',
      skill: 'bankroll',
      minutes: 25,
      concepts: [
        {
          title: 'Enough buy-ins to outlast the noise',
          body: 'Thirty buy-ins for cash games is the usual minimum, and more while you are still learning. This is not caution for its own sake — it is what lets a real edge survive an ordinary bad run.\n\nA winning player with too small a bankroll goes broke. The edge was real; the sample was too short.',
        },
      ],
      drills: [{ gen: 'bankroll-check', count: 4 }, { gen: 'decision-vs-result', count: 2 }],
      takeaway: 'Thirty buy-ins minimum. Bankroll rules keep a real edge alive long enough to show.',
    },
    {
      id: 'l5-18',
      unit: 'The mental game',
      title: 'Playing the long game',
      skill: 'variance',
      minutes: 25,
      concepts: [
        {
          title: 'Detach from the session',
          body: 'A session is a meaningless unit. It is an arbitrary slice of one long game that runs for years. Winning or losing tonight tells you nothing.\n\nPlayers who think in sessions chase losses and quit while winning. Both are expensive, and both come from treating an arbitrary boundary as though it meant something.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 3 }, { gen: 'tilt-check', count: 2 }],
      takeaway: 'Sessions are arbitrary. One long game, judged by decisions.',
    },
    {
      id: 'l5-19',
      unit: 'Putting it together',
      title: 'Level 5 checkpoint',
      skill: 'exploits',
      minutes: 40,
      checkpoint: true,
      concepts: [
        {
          title: 'You are playing people now',
          body: 'You can classify an opponent in an orbit, name the exploit, deviate consciously, read a range through three streets, and manage your own state well enough to keep doing it.\n\nWhat is left is the habit that makes all of it compound.',
        },
      ],
      drills: [
        { gen: 'player-type', count: 3 },
        { gen: 'narrow-range', count: 2 },
        { gen: 'blocker-count', count: 2 },
        { gen: 'mdf-chain', count: 1 },
        { gen: 'bluff-selection', count: 2 },
        { gen: 'tilt-check', count: 2 },
        { gen: 'bankroll-check', count: 2 },
      ],
      takeaway: 'Cards, maths, ranges, people. One thing remains: the study habit itself.',
    },
  ],
};
