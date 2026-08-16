/**
 * The skill graph.
 *
 * Mastery is tracked per skill, not per lesson. A lesson is an event; a skill
 * is a thing you either can or cannot do, and it decays if you stop doing it.
 * Review scheduling, the daily session builder, and the progress screen all
 * read from here.
 *
 * `requires` builds a directed graph. Nothing unlocks until its prerequisites
 * are at working strength, which is what stops a learner meeting minimum
 * defence frequency before they can count to 47.
 */

export const STRANDS = {
  reading: { name: 'Reading the board', colour: 'strand-reading' },
  maths: { name: 'The maths', colour: 'strand-maths' },
  preflop: { name: 'Before the flop', colour: 'strand-preflop' },
  postflop: { name: 'After the flop', colour: 'strand-postflop' },
  opponent: { name: 'Reading opponents', colour: 'strand-opponent' },
  self: { name: 'Playing yourself', colour: 'strand-self' },
};

/**
 * @typedef {Object} Skill
 * @property {string} id
 * @property {string} name        short imperative: what you can do
 * @property {string} strand
 * @property {string[]} requires
 * @property {string} why         one line on why this matters at the table
 */

export const SKILLS = [
  // --- Reading -------------------------------------------------------------
  { id: 'card-notation', name: 'Read card shorthand', strand: 'reading', requires: [], why: 'Every tool, forum post and coach writes hands as "AsKd". Not reading it fluently slows everything else down.' },
  { id: 'hand-ranking', name: 'Rank the nine hand categories', strand: 'reading', requires: ['card-notation'], why: 'You cannot value a hand you cannot name.' },
  { id: 'board-reading', name: 'Name your hand instantly', strand: 'reading', requires: ['hand-ranking'], why: 'Misreading your own hand is the most expensive beginner mistake there is.' },
  { id: 'best-five', name: 'Spot which five cards play', strand: 'reading', requires: ['board-reading'], why: 'Kickers and playing the board decide a surprising share of showdowns.' },
  { id: 'nuts-reading', name: 'Find the nuts on any board', strand: 'reading', requires: ['best-five'], why: 'Knowing the best possible hand tells you how much of the deck beats you.' },
  { id: 'texture', name: 'Classify a flop', strand: 'reading', requires: ['board-reading'], why: 'Wet or dry decides how often you bet, and how big.' },
  { id: 'draw-spotting', name: 'See every draw on a board', strand: 'reading', requires: ['texture'], why: 'The draws present are the hands that will call you and the cards that will kill you.' },

  // --- Maths ---------------------------------------------------------------
  { id: 'unseen-cards', name: 'Count the unseen deck', strand: 'maths', requires: ['card-notation'], why: 'Every probability in poker is a fraction with this number underneath it.' },
  { id: 'outs-counting', name: 'Count outs honestly', strand: 'maths', requires: ['draw-spotting', 'unseen-cards'], why: 'Counting outs that are already beaten is how draws lose stacks.' },
  { id: 'outs-to-equity', name: 'Turn outs into a percentage', strand: 'maths', requires: ['outs-counting'], why: 'Outs mean nothing until they are a number you can compare to a price.' },
  { id: 'equity-intuition', name: 'Estimate equity by feel', strand: 'maths', requires: ['outs-to-equity'], why: 'At the table you get seconds, not a calculator. Calibrated instinct is the goal.' },
  { id: 'pot-odds', name: 'Price a call', strand: 'maths', requires: ['unseen-cards'], why: 'This is the single most profitable ten minutes of study in poker.' },
  { id: 'break-even', name: 'Read a bet size as a percentage', strand: 'maths', requires: ['pot-odds'], why: 'Half pot always needs 25%. Knowing that instantly frees your attention for reads.' },
  { id: 'ev-basics', name: 'Compute expected value', strand: 'maths', requires: ['pot-odds', 'outs-to-equity'], why: 'EV turns "it felt right" into "it made 4 big blinds".' },
  { id: 'variance', name: 'Separate decisions from results', strand: 'maths', requires: ['ev-basics'], why: 'Judging your play by whether you won the hand teaches you the wrong lesson every time.' },
  { id: 'implied-odds', name: 'Value the money still to come', strand: 'maths', requires: ['pot-odds', 'ev-basics'], why: 'Speculative hands are only profitable because of the pots you win later.' },
  { id: 'combinatorics', name: 'Count hand combinations', strand: 'maths', requires: ['card-notation'], why: 'Six ways to hold aces, four to hold ace-king suited. That ratio decides most tough river calls.' },
  { id: 'blockers', name: 'Use the cards in your hand as information', strand: 'maths', requires: ['combinatorics'], why: 'Holding one ace removes half their ace-king combinations. That is a real edge, free of charge.' },
  { id: 'spr', name: 'Use stack-to-pot ratio', strand: 'maths', requires: ['pot-odds'], why: 'SPR decides before the flop whether one pair can be played for a stack.' },

  // --- Preflop -------------------------------------------------------------
  { id: 'position', name: 'Value position correctly', strand: 'preflop', requires: ['card-notation'], why: 'Acting last is worth more than most of the card strength beginners chase.' },
  { id: 'starting-hands', name: 'Judge a starting hand', strand: 'preflop', requires: ['position', 'hand-ranking'], why: 'Most losing players lose before the flop, one loose call at a time.' },
  { id: 'range-grid', name: 'Think in the 169-hand grid', strand: 'preflop', requires: ['combinatorics', 'starting-hands'], why: 'Ranges, not hands. This is the shift that separates beginners from players.' },
  { id: 'rfi', name: 'Open the right hands from each seat', strand: 'preflop', requires: ['range-grid', 'position'], why: 'Your opening range is the foundation every postflop decision rests on.' },
  { id: 'blind-defence', name: 'Defend the big blind', strand: 'preflop', requires: ['rfi', 'pot-odds'], why: 'Over-folding the big blind quietly costs more than any other single leak.' },
  { id: 'three-betting', name: 'Build a 3-bet range', strand: 'preflop', requires: ['rfi', 'blockers'], why: 'A range of only premiums is transparent and unprofitable.' },
  { id: 'facing-three-bet', name: 'Respond to a 3-bet', strand: 'preflop', requires: ['three-betting', 'spr'], why: 'Most players either fold far too much here or call with hands that cannot continue.' },
  { id: 'multiway', name: 'Adjust for multiway pots', strand: 'preflop', requires: ['starting-hands', 'equity-intuition'], why: 'Hand values change completely when three people see a flop.' },

  // --- Postflop ------------------------------------------------------------
  { id: 'range-advantage', name: 'Work out whose range the flop favours', strand: 'postflop', requires: ['texture', 'range-grid'], why: 'Whoever the board hits harder gets to do the betting.' },
  { id: 'cbet', name: 'Continuation bet with a plan', strand: 'postflop', requires: ['range-advantage', 'break-even'], why: 'Betting every flop and betting no flops are both losing strategies.' },
  { id: 'bet-sizing', name: 'Choose a bet size on purpose', strand: 'postflop', requires: ['break-even', 'cbet'], why: 'Size is a message. Sending the wrong one is free money for observant opponents.' },
  { id: 'facing-bets', name: 'Defend against bets', strand: 'postflop', requires: ['pot-odds', 'equity-intuition'], why: 'Knowing your price turns agonising calls into arithmetic.' },
  { id: 'mdf', name: 'Apply minimum defence frequency', strand: 'postflop', requires: ['facing-bets', 'break-even'], why: 'It tells you how much of your range you are allowed to fold before you become exploitable.' },
  { id: 'turn-play', name: 'Plan the turn before you bet the flop', strand: 'postflop', requires: ['cbet', 'bet-sizing'], why: 'A flop bet with no turn plan is how stacks get lost on blank cards.' },
  { id: 'river-value', name: 'Bet the river for value', strand: 'postflop', requires: ['turn-play', 'combinatorics'], why: 'Most players leave more money on the river than they lose anywhere else.' },
  { id: 'river-bluff', name: 'Bluff the river with the right hands', strand: 'postflop', requires: ['river-value', 'blockers'], why: 'The best bluffs are the hands that block the calls, not the worst hands you happen to hold.' },
  { id: 'polarisation', name: 'Recognise polarised and merged ranges', strand: 'postflop', requires: ['bet-sizing', 'river-value'], why: 'Big bets say something specific. Learn what, and you can read sizings for what they are.' },
  { id: 'draw-play', name: 'Play draws aggressively', strand: 'postflop', requires: ['outs-to-equity', 'cbet'], why: 'Semi-bluffing wins pots two ways. Calling with draws wins one.' },
  { id: 'pot-control', name: 'Control the pot with medium hands', strand: 'postflop', requires: ['spr', 'facing-bets'], why: 'Top pair is a good hand and a terrible reason to play a 200 big blind pot.' },

  // --- Opponent ------------------------------------------------------------
  { id: 'hand-reading', name: 'Narrow a range street by street', strand: 'opponent', requires: ['range-grid', 'texture'], why: 'Every action they take removes hands. Hand reading is just subtraction done carefully.' },
  { id: 'player-types', name: 'Classify opponents quickly', strand: 'opponent', requires: ['position'], why: 'The correct play against a calling station is not the correct play against a solid regular.' },
  { id: 'exploits', name: 'Deviate to punish a tendency', strand: 'opponent', requires: ['player-types', 'mdf'], why: 'Balanced play is a safe default. Exploitation is where the money actually is.' },
  { id: 'bet-tells', name: 'Read sizing and timing patterns', strand: 'opponent', requires: ['polarisation', 'player-types'], why: 'Amateurs size their bets according to how strong they feel. That is a free window.' },
  { id: 'gto-vs-exploit', name: 'Know when to balance and when to deviate', strand: 'opponent', requires: ['exploits', 'mdf'], why: 'Theory is the map. Your opponent is the terrain.' },

  // --- Self ----------------------------------------------------------------
  { id: 'bankroll', name: 'Manage a bankroll', strand: 'self', requires: ['variance'], why: 'The best player in the world goes broke at the wrong stakes.' },
  { id: 'tilt', name: 'Recognise and interrupt tilt', strand: 'self', requires: ['variance'], why: 'Almost everyone loses more money to their own state of mind than to their opponents.' },
  { id: 'review-process', name: 'Review your own hands usefully', strand: 'self', requires: ['hand-reading', 'ev-basics'], why: 'Playing is practice. Reviewing is study. Improvement needs both.' },
  { id: 'table-selection', name: 'Choose profitable games', strand: 'self', requires: ['player-types'], why: 'Game selection beats strategy improvement, hour for hour, by a wide margin.' },
  { id: 'study-loop', name: 'Run your own improvement loop', strand: 'self', requires: ['review-process', 'gto-vs-exploit'], why: 'The goal of this course is to make itself unnecessary.' },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

/** Skills with no unmet prerequisites, given a set of mastered skill ids. */
export function availableSkills(masteredIds) {
  const mastered = new Set(masteredIds);
  return SKILLS.filter((s) => s.requires.every((r) => mastered.has(r)));
}

/** Everything that depends on this skill, transitively. Used by the map view. */
export function dependents(skillId) {
  const out = new Set();
  const walk = (id) => {
    for (const s of SKILLS) {
      if (s.requires.includes(id) && !out.has(s.id)) {
        out.add(s.id);
        walk(s.id);
      }
    }
  };
  walk(skillId);
  return [...out];
}

/** Validate the graph: no missing or cyclic prerequisites. */
export function validateGraph() {
  const problems = [];
  for (const s of SKILLS) {
    for (const r of s.requires) {
      if (!SKILL_BY_ID[r]) problems.push(`${s.id} requires unknown skill ${r}`);
    }
  }
  const state = {};
  const visit = (id, stack) => {
    if (state[id] === 'done') return;
    if (state[id] === 'visiting') {
      problems.push(`cycle: ${[...stack, id].join(' -> ')}`);
      return;
    }
    state[id] = 'visiting';
    for (const r of SKILL_BY_ID[id]?.requires || []) visit(r, [...stack, id]);
    state[id] = 'done';
  };
  for (const s of SKILLS) visit(s.id, []);
  return problems;
}
