import { suite, test, assert, assertEqual } from './harness.js';
import {
  createProfile, recordAnswer, exportProfile, importProfile, suggestedFilename,
  completeLesson, DIFFICULTY_WINDOW,
} from '../src/learn/progress.js';
import { generatorsFor, buildSession } from '../src/learn/plan.js';
import { difficultyOf } from '../src/learn/exercises.js';
import { LESSONS } from '../src/learn/curriculum/index.js';

suite('adaptive difficulty');

const answerMany = (profile, correct, count) => {
  let p = profile;
  for (let i = 0; i < count; i++) p = recordAnswer(p, 'pot-odds', correct);
  return p;
};

test('a new learner starts above rules level', () => {
  const p = createProfile();
  assert(p.ceiling >= 3, `expected to start at tier 3 or higher, got ${p.ceiling}`);
});

test('getting everything right raises the ceiling', () => {
  let p = createProfile();
  const start = p.ceiling;
  p = answerMany(p, true, DIFFICULTY_WINDOW);
  assert(p.ceiling > start, `ceiling should rise from ${start}, got ${p.ceiling}`);
});

test('the ceiling keeps rising for a learner who keeps cruising', () => {
  let p = createProfile();
  for (let round = 0; round < 4; round++) p = answerMany(p, true, DIFFICULTY_WINDOW);
  assertEqual(p.ceiling, 5, 'a learner who gets everything right should reach the hardest tier');
});

test('struggling lowers the ceiling', () => {
  let p = createProfile();
  p = answerMany(p, true, DIFFICULTY_WINDOW); // up to 4
  const raised = p.ceiling;
  p = answerMany(p, false, DIFFICULTY_WINDOW);
  assert(p.ceiling < raised, `ceiling should fall from ${raised}, got ${p.ceiling}`);
});

test('the ceiling never drops to rules level', () => {
  let p = createProfile();
  for (let round = 0; round < 6; round++) p = answerMany(p, false, DIFFICULTY_WINDOW);
  assert(p.ceiling >= 2, `should never fall below tier 2, got ${p.ceiling}`);
});

test('performing around the target leaves the ceiling alone', () => {
  let p = createProfile();
  const start = p.ceiling;
  // 75% correct, which is the target.
  for (let i = 0; i < DIFFICULTY_WINDOW; i++) p = recordAnswer(p, 'pot-odds', i % 4 !== 0);
  assertEqual(p.ceiling, start, 'hitting the target should not move the ceiling');
});

test('the window resets after an adjustment', () => {
  let p = createProfile();
  p = answerMany(p, true, DIFFICULTY_WINDOW);
  assertEqual(p.recent.length, 0, 'the window should reset so the next judgement is of the new tier');
});

suite('difficulty-aware drill selection');

/**
 * The contract is "at most the ceiling, unless the skill has nothing that
 * easy — then the easiest it has". The fallback is deliberate: a ceiling should
 * never make a skill undrillable, which would silently drop it from reviews.
 */
const withinContract = (skillId, ceiling) => {
  const chosen = generatorsFor(skillId, ceiling);
  const all = generatorsFor(skillId, 5);
  const floor = Math.min(...all.map(difficultyOf));
  return chosen.every((id) => difficultyOf(id) <= ceiling || difficultyOf(id) === floor);
};

test('a low ceiling excludes drills harder than necessary', () => {
  // A skill with drills spread across tiers must actually filter.
  const wide = generatorsFor('ev-basics', 5);
  assert(wide.length > 1, 'ev-basics should have several drills to choose between');
  const capped = generatorsFor('ev-basics', 2);
  assert(capped.length < wide.length, 'a ceiling of 2 should narrow the choice');
  for (const id of capped) assert(difficultyOf(id) <= 2, `${id} is too hard for a ceiling of 2`);

  // A skill with only a hard drill falls back to it rather than returning none.
  for (const skill of ['decision-making', 'pot-odds', 'bet-sizing', 'river-decisions']) {
    for (const ceiling of [2, 3, 4, 5]) {
      assert(withinContract(skill, ceiling), `${skill} broke the ceiling contract at ${ceiling}`);
    }
  }
});

test('rules-level drills are never selected while anything else exists', () => {
  for (const skill of ['pot-odds', 'decision-making', 'bet-sizing', 'board-reading']) {
    for (const ceiling of [2, 3, 4, 5]) {
      const chosen = generatorsFor(skill, ceiling);
      if (!chosen.length) continue;
      const tiers = chosen.map(difficultyOf);
      // Tier 1 may only appear when it is the sole option for that skill.
      if (tiers.some((t) => t <= 1)) {
        assert(
          generatorsFor(skill, 5).every((id) => difficultyOf(id) <= 1),
          `${skill} at ceiling ${ceiling} offered rules-level drills despite having harder ones`,
        );
      }
    }
  }
});

test('a skill is never left undrillable by a low ceiling', () => {
  for (const skill of ['decision-making', 'raise-sizing', 'river-decisions', 'fold-discipline']) {
    assert(generatorsFor(skill, 2).length > 0, `${skill} has nothing to drill at ceiling 2`);
  }
});

test('sessions respect the learner ceiling', () => {
  let profile = createProfile();
  profile = { ...profile, ceiling: 2 };
  profile = completeLesson(profile, LESSONS[0].id, 1);
  profile = recordAnswer(profile, 'pot-odds', true);

  const session = buildSession(profile, 30, Date.now(), 5);
  const practice = session.items.filter((i) => i.type !== 'lesson');
  assert(practice.length > 0, 'the session should contain practice items to check');

  for (const item of practice) {
    const gen = item.exercise.generator;
    assert(
      withinContract(item.skill, 2),
      `${gen} (tier ${difficultyOf(gen)}) broke the ceiling contract for ${item.skill}`,
    );
  }
  assertEqual(session.ceiling, 2);

  // And a high ceiling must actually let the hard material through, otherwise
  // the whole mechanism is decorative.
  const advanced = buildSession({ ...profile, ceiling: 5 }, 30, Date.now(), 5);
  assertEqual(advanced.ceiling, 5);
});

suite('backup and restore');

test('a profile round-trips through export and import', () => {
  let p = createProfile();
  p = completeLesson(p, LESSONS[0].id, 0.9);
  p = recordAnswer(p, 'pot-odds', true);
  p = recordAnswer(p, 'ev-basics', false);

  const text = exportProfile(p);
  const { profile, error, summary } = importProfile(text);

  assert(!error, `unexpected error: ${error}`);
  assertEqual(profile.xp, p.xp);
  assertEqual(Object.keys(profile.completedLessons).length, 1);
  assertEqual(profile.skills['pot-odds'].attempts, 1);
  assert(summary.includes('1 completed lesson'), summary);
});

test('exported text is human-readable JSON with a format marker', () => {
  const text = exportProfile(createProfile());
  const parsed = JSON.parse(text);
  assertEqual(parsed.format, 'holdem-dojo-progress');
  assert(parsed.exportedAt, 'carries a timestamp');
  assert(text.includes('\n'), 'is pretty-printed rather than a single opaque line');
});

test('a bare profile object imports too', () => {
  const p = createProfile();
  const { profile, error } = importProfile(JSON.stringify(p));
  assert(!error, error);
  assertEqual(profile.xp, 0);
});

test('bad input produces an explanation, not a crash', () => {
  assert(importProfile('not json at all').error.includes('JSON'));
  assert(importProfile('[]').error, 'an array is not a profile');
  assert(importProfile('{"format":"something-else","profile":{"skills":{}}}').error.includes('different app'));
  assert(importProfile('{"completedLessons":{}}').error.includes('skill history'));
});

test('the filename says which day it came from', () => {
  let p = createProfile();
  p = { ...p, daysActive: 42 };
  const name = suggestedFilename(p, new Date('2026-03-04T00:00:00Z'));
  assert(name.includes('day42'), name);
  assert(name.includes('2026-03-04'), name);
  assert(name.endsWith('.json'), name);
});

suite('session variety');

/**
 * The complaint that produced these tests: sessions asked the same question
 * shape over and over. Variety is not cosmetic — repeatedly answering one shape
 * teaches the shape rather than the skill, and it is boring, which is worse.
 */
const sessionGenerators = (session) => {
  const order = [];
  for (const item of session.items) {
    const exercises = item.type === 'lesson' ? item.exercises : [item.exercise];
    for (const ex of exercises) if (ex) order.push(ex.generator);
  }
  return order;
};

const maxConsecutive = (list) => {
  let best = 0;
  let run = 0;
  for (let i = 0; i < list.length; i++) {
    run = i > 0 && list[i] === list[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
};

const counts = (list) => list.reduce((m, g) => m.set(g, (m.get(g) || 0) + 1), new Map());

/** Drive a learner forward so later sessions can be inspected too. */
function advance(profile, days, budget = 30) {
  const sessions = [];
  let p = profile;
  for (let day = 0; day < days; day++) {
    const session = buildSession(p, budget, Date.now(), day + 1);
    sessions.push(session);
    for (const item of session.items) {
      const exercises = item.type === 'lesson' ? item.exercises : [item.exercise];
      for (const ex of exercises) if (ex) p = recordAnswer(p, ex.skill, true);
      if (item.type === 'lesson') p = completeLesson(p, item.lessonId, 0.9);
    }
  }
  return { profile: p, sessions };
}

test('no drill is repeated more than three times in a session', () => {
  const { sessions } = advance(createProfile(), 40);
  for (const [i, session] of sessions.entries()) {
    const worst = Math.max(...counts(sessionGenerators(session)).values());
    assert(worst <= 3, `day ${i + 1} repeated one drill ${worst} times`);
  }
});

test('the same drill never appears more than three times in a row', () => {
  const { sessions } = advance(createProfile(), 40);
  for (const [i, session] of sessions.entries()) {
    const run = maxConsecutive(sessionGenerators(session));
    assert(run <= 3, `day ${i + 1} had ${run} identical drills back to back`);
  }
});

test('a session is a sensible length rather than a grind', () => {
  for (const budget of [15, 30, 45]) {
    const { sessions } = advance(createProfile(), 20, budget);
    for (const [i, session] of sessions.entries()) {
      const asked = sessionGenerators(session).length;
      assert(asked <= budget / 1.5, `day ${i + 1} at ${budget}min asked ${asked} questions`);
      assert(asked >= 3, `day ${i + 1} at ${budget}min asked only ${asked} questions`);
    }
  }
});

test('sessions draw on several different drills, not just one', () => {
  const { sessions } = advance(createProfile(), 30);
  for (const [i, session] of sessions.entries()) {
    const distinct = counts(sessionGenerators(session)).size;
    assert(distinct >= 3, `day ${i + 1} used only ${distinct} distinct drill(s)`);
  }
});

test('a short session is preferred over padding it with repeats', () => {
  // Day one has few available skills. The session should simply be shorter
  // rather than filling thirty minutes with the same two questions.
  const session = buildSession(createProfile(), 45, Date.now(), 3);
  const worst = Math.max(...counts(sessionGenerators(session)).values());
  assert(worst <= 3, `padded to ${worst} repeats instead of ending early`);
  assert(session.estimatedMinutes < 45, 'should not claim to fill the whole budget with repeats');
});
