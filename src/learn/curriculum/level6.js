/**
 * Level 6 — Mastery and independence. Roughly days 321 to 365 and beyond.
 *
 * The goal of this level is to make the course unnecessary. A learner who
 * finishes should be able to identify their own leaks, design their own drills,
 * and keep improving without anything supplying the next lesson.
 *
 * Everything here is a habit rather than a fact, which is why the lessons are
 * shorter and the practice is longer.
 */

export const LEVEL_6 = {
  level: 6,
  name: 'Independence',
  subtitle: 'Running your own improvement',
  promise: 'Leave with a study process you can run for the rest of your poker life.',
  lessons: [
    {
      id: 'l6-01',
      unit: 'Reviewing',
      title: 'Reviewing hands without hindsight',
      skill: 'review-process',
      minutes: 30,
      concepts: [
        {
          title: 'Judge with the information you had',
          body: 'The point of review is not to find out whether you won. You know that. It is to ask whether the decision was right given what you knew at the time.\n\nSo review with their cards hidden first. Work out what you should have done, and only then look. Reviewing with the answer visible teaches you to recognise outcomes, not decisions.',
        },
        {
          title: 'Review the ordinary hands',
          body: 'The instinct is to review the disasters. But big losses are usually either obvious mistakes or plain bad luck, and neither teaches much.\n\nThe money is in the routine spots you play on autopilot dozens of times a session. A small error there, repeated, costs more than one spectacular blow-up.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 3 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'Review with their cards hidden, and review ordinary hands, not disasters.',
    },
    {
      id: 'l6-02',
      unit: 'Reviewing',
      title: 'Finding your own leaks',
      skill: 'review-process',
      minutes: 30,
      concepts: [
        {
          title: 'Look for the repeated shape',
          body: 'One bad call is noise. The same bad call in the same spot five times is a leak, and it has a cause you can name — usually a wrong assumption about how often someone bluffs, or a hand you have overvalued for years.\n\nTag your uncomfortable decisions as you play. Once a week, look for the shape that repeats.',
        },
        {
          title: 'Fix one at a time',
          body: 'Trying to fix five leaks at once fixes none. Pick the most frequent one, work only on it for a week, and let the others wait. Frequency matters more than severity: a small error in a common spot outweighs a large error in a rare one.',
        },
      ],
      drills: [{ gen: 'call-or-fold', count: 2 }, { gen: 'river-value', count: 2 }, { gen: 'mdf-chain', count: 1 }],
      takeaway: 'Tag uncomfortable spots, look weekly for the repeating shape, fix one at a time.',
    },
    {
      id: 'l6-03',
      unit: 'Reviewing',
      title: 'Turning a hand into a question',
      skill: 'review-process',
      minutes: 25,
      concepts: [
        {
          title: 'A good review question is answerable',
          body: '"Did I play this well?" is not answerable. "Against this player\'s range, how many combinations beat me on the river, and what price was I getting?" is.\n\nWhen a hand bothers you, convert it into a specific question with a number for an answer. Then answer it properly, with the tools you have.',
        },
      ],
      drills: [{ gen: 'narrow-range', count: 2 }, { gen: 'blocker-count', count: 3 }],
      takeaway: 'Convert vague discomfort into a specific question with a numeric answer.',
    },
    {
      id: 'l6-04',
      unit: 'Study design',
      title: 'Designing your own drills',
      skill: 'study-loop',
      minutes: 30,
      concepts: [
        {
          title: 'Practise the thing, not around the thing',
          body: 'If your leak is over-folding the big blind, the drill is big blind defence spots, repeatedly, until the correct action feels obvious. Not reading about it, not watching videos about it: doing it.\n\nA drill needs three properties: it isolates one decision, it gives immediate feedback, and it can be repeated with variation. That is the whole design.',
        },
        {
          title: 'Use the sandbox',
          body: 'The equity sandbox in this app will answer any specific question you can pose to it. When a hand puzzles you, set it up, change one variable at a time, and watch what happens to the numbers. Curiosity plus a calculator is a complete study method.',
        },
      ],
      drills: [{ gen: 'equity-vs-range', count: 3 }, { gen: 'call-or-fold', count: 2 }],
      takeaway: 'A drill isolates one decision, gives instant feedback, and repeats with variation.',
    },
    {
      id: 'l6-05',
      unit: 'Study design',
      title: 'Spaced repetition, applied to poker',
      skill: 'study-loop',
      minutes: 25,
      concepts: [
        {
          title: 'Revisit just before you would forget',
          body: 'This course has been scheduling your reviews all along, pushing each skill out further as you get it right and pulling it closer when you do not.\n\nYou can run the same process yourself: keep a short list of spots you have got wrong, and revisit each one a day later, then a week, then a month. Anything you get wrong resets to the start.',
        },
      ],
      drills: [{ gen: 'outs-to-percent', count: 3 }, { gen: 'bet-size-price', count: 3 }],
      takeaway: 'Revisit at growing intervals; reset to the start whenever you get one wrong.',
    },
    {
      id: 'l6-06',
      unit: 'Study design',
      title: 'Balancing play and study',
      skill: 'study-loop',
      minutes: 20,
      concepts: [
        {
          title: 'Neither alone works',
          body: 'Playing without studying grinds the same errors deeper. Studying without playing builds knowledge you cannot access under pressure.\n\nA reasonable ratio while improving is about three parts play to one part study, with the study aimed at whatever the play just exposed.',
        },
      ],
      drills: [{ gen: 'decision-vs-result', count: 2 }, { gen: 'spr-plan', count: 2 }],
      takeaway: 'Roughly three parts play to one part study, and let play choose the study topic.',
    },
    {
      id: 'l6-07',
      unit: 'Integration',
      title: 'Playing a full session well',
      skill: 'study-loop',
      minutes: 35,
      concepts: [
        {
          title: 'Before, during, after',
          body: 'Before: check your state, pick a table, set a stop rule. During: play your baseline, gather reads, deviate consciously, watch your own tilt. After: tag two or three hands and stop.\n\nThe after step is the one everyone skips, and it is the one that turns hours played into skill gained.',
        },
      ],
      drills: [
        { gen: 'player-type', count: 2 },
        { gen: 'cbet-decision', count: 2 },
        { gen: 'river-value', count: 2 },
        { gen: 'tilt-check', count: 1 },
      ],
      takeaway: 'Before, during, after. The after step is what converts play into improvement.',
    },
    {
      id: 'l6-08',
      unit: 'Integration',
      title: 'Moving up in stakes',
      skill: 'bankroll',
      minutes: 25,
      concepts: [
        {
          title: 'Two conditions, both required',
          body: 'Move up when you have the bankroll for the next level and you are genuinely beating the current one over a real sample. Both, not one.\n\nMoving up because you are bored, or because you are down and want to win it back faster, is the most reliable way to lose everything you have built.',
        },
        {
          title: 'Moving down is not a failure',
          body: 'If your bankroll drops below the threshold, drop a level. It is a mechanical rule, not a judgement on you, and the players who follow it are the ones who are still playing years later.',
        },
      ],
      drills: [{ gen: 'bankroll-check', count: 4 }],
      takeaway: 'Move up with bankroll and a proven edge. Move down mechanically, without ego.',
    },
    {
      id: 'l6-09',
      unit: 'Integration',
      title: 'What mastery actually looks like',
      skill: 'study-loop',
      minutes: 25,
      concepts: [
        {
          title: 'Not knowing everything',
          body: 'A master is not someone who has memorised solver outputs. It is someone who reliably makes reasonable decisions quickly, notices when a spot is unusual, and knows what to do about the ones they get wrong.\n\nThe decisions look boring from outside. That is what competence looks like in a game of incomplete information.',
        },
        {
          title: 'The loop never ends',
          body: 'Play, notice discomfort, form a question, answer it, drill it, return to play. That is the whole method, and it is the same at every level from your first session to your ten-thousandth.\n\nIf you have that loop running, you no longer need this course. That was the point.',
        },
      ],
      drills: [
        { gen: 'call-or-fold', count: 2 },
        { gen: 'narrow-range', count: 2 },
        { gen: 'river-value', count: 2 },
      ],
      takeaway: 'Play, notice, question, answer, drill, return. The loop is the skill.',
    },
    {
      id: 'l6-10',
      unit: 'Integration',
      title: 'Final checkpoint',
      skill: 'study-loop',
      minutes: 45,
      checkpoint: true,
      concepts: [
        {
          title: 'The whole game, one last time',
          body: 'This checkpoint samples everything: board reading, outs, pot odds, ranges, position, c-betting, defence, river decisions, opponent types, and your own discipline.\n\nWhatever it finds weak, it will schedule. Then keep going — the daily sessions continue past day 365, drawing from everything you have learned, forever.',
        },
      ],
      drills: [
        { gen: 'name-your-hand', count: 2 },
        { gen: 'find-the-nuts', count: 1 },
        { gen: 'outs-chain', count: 1 },
        { gen: 'bet-size-price', count: 2 },
        { gen: 'call-or-fold', count: 1 },
        { gen: 'build-range', count: 1 },
        { gen: 'bb-defence', count: 1 },
        { gen: 'range-advantage', count: 2 },
        { gen: 'cbet-decision', count: 1 },
        { gen: 'mdf-chain', count: 1 },
        { gen: 'river-value', count: 2 },
        { gen: 'bluff-selection', count: 1 },
        { gen: 'narrow-range', count: 1 },
        { gen: 'player-type', count: 2 },
        { gen: 'bankroll-check', count: 1 },
        { gen: 'tilt-check', count: 1 },
      ],
      takeaway: 'You have the whole game and the loop to keep improving it. Go and play.',
    },
  ],
};
