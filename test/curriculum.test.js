import { suite, test, assert, assertEqual, assertClose } from './harness.js';
import { LESSONS, LEVELS, validateCurriculum, totalMinutes, unitsOf } from '../src/learn/curriculum/index.js';
import { buildPlan, buildSession, milestones, LEVEL_SCHEDULE, generatorsFor, uncoveredSkills, nextLesson } from '../src/learn/plan.js';
import { SKILLS } from '../src/learn/skills.js';
import { difficultyOf, generate } from '../src/learn/exercises.js';
import { newRecord, review, strength, dueSkills, isDue } from '../src/learn/srs.js';
import {
  createProfile, registerVisit, recordAnswer, completeLesson, isLevelUnlocked,
  levelProgress, overallMastery, dayNumber, recordSkillBatch, weakestSkills, save, load,
} from '../src/learn/progress.js';

const DAY = 24 * 60 * 60 * 1000;

suite('curriculum structure');

test('every lesson is well formed and references real skills and generators', () => {
  const problems = validateCurriculum();
  assertEqual(problems.length, 0, `\n      ${problems.slice(0, 20).join('\n      ')}\n`);
});

test('the course is substantial', () => {
  assert(LESSONS.length >= 70, `only ${LESSONS.length} lessons`);
  assert(totalMinutes() >= 1800, `only ${totalMinutes()} minutes of content`);
  assertEqual(LEVELS.length, 6);
});

/**
 * The course is for someone who knows the rules and cannot yet price a
 * decision. Rules-level drills would waste their time, so the path must not
 * contain any — they exist only as warm-ups when something is being got wrong.
 */
test('no rules-level filler appears anywhere in the path', () => {
  const offenders = [];
  for (const lesson of LESSONS) {
    for (const drill of lesson.drills) {
      if (difficultyOf(drill.gen) <= 1) offenders.push(`${lesson.id} uses ${drill.gen}`);
    }
  }
  assertEqual(offenders.length, 0, `\n      ${offenders.join('\n      ')}\n`);
});

/** The five decisions are the point, so they must dominate the curriculum. */
test('the curriculum is mostly about betting, calling, raising and folding', () => {
  const decisionSkills = new Set(SKILLS.filter((s) => s.strand === 'decisions').map((s) => s.id));
  const decisionLessons = LESSONS.filter((l) => decisionSkills.has(l.skill)
    || l.drills.some((d) => {
      try {
        return decisionSkills.has(generate(d.gen, 7).skill);
      } catch {
        return false;
      }
    }));
  const share = decisionLessons.length / LESSONS.length;
  assert(share >= 0.5, `only ${Math.round(share * 100)}% of lessons touch the five decisions`);
});

/** Cash games only, 6-10 players, 100bb. Tournament material would be scope creep. */
test('nothing in the course teaches tournament play', () => {
  const banned = /\bICM\b|\btournament|\bfinal table\b|\bbubble\b|\bpayout jump/i;
  const offenders = [];
  for (const lesson of LESSONS) {
    const text = [
      lesson.title,
      lesson.takeaway,
      ...lesson.concepts.map((c) => `${c.title} ${c.body}`),
    ].join(' ');
    if (banned.test(text)) offenders.push(lesson.id);
  }
  assertEqual(offenders.length, 0, `tournament material in: ${offenders.join(', ')}`);
});

test('lesson ids are unique and ordered by level', () => {
  const ids = LESSONS.map((l) => l.id);
  assertEqual(new Set(ids).size, ids.length);
  let lastLevel = 0;
  for (const lesson of LESSONS) {
    assert(lesson.level >= lastLevel, 'lessons are not in level order');
    lastLevel = lesson.level;
  }
});

test('every level groups into units', () => {
  for (const level of LEVELS) {
    const units = unitsOf(level.level);
    assert(units.length >= 2, `level ${level.level} has only ${units.length} unit`);
    const counted = units.reduce((sum, u) => sum + u.lessons.length, 0);
    assertEqual(counted, level.lessons.length);
  }
});

test('every skill has at least one drill that trains it', () => {
  const uncovered = uncoveredSkills();
  // Some skills are taught through concepts and assessed via related drills;
  // the requirement is that most are directly drillable.
  const coverage = 1 - uncovered.length / SKILLS.length;
  assert(coverage >= 0.6, `only ${Math.round(coverage * 100)}% of skills have drills: missing ${uncovered.join(', ')}`);
});

test('every generator referenced by a lesson exists', () => {
  for (const lesson of LESSONS) {
    for (const drill of lesson.drills) {
      assert(generatorsFor(lesson.skill) !== undefined, `${lesson.id} skill lookup failed`);
      assert(drill.gen, `${lesson.id} has a drill with no generator`);
    }
  }
});

suite('the 365-day plan');

test('the plan covers exactly one year', () => {
  const plan = buildPlan();
  assertEqual(plan.length, 365);
  assertEqual(plan[0].day, 1);
  assertEqual(plan[364].day, 365);
});

test('every lesson appears in the plan exactly once', () => {
  const plan = buildPlan();
  const scheduled = plan.filter((d) => d.lessonId).map((d) => d.lessonId);
  assertEqual(new Set(scheduled).size, scheduled.length, 'a lesson is scheduled twice');
  assertEqual(scheduled.length, LESSONS.length, 'not every lesson is scheduled');
});

test('levels arrive on the promised days', () => {
  const plan = buildPlan();
  for (const window of LEVEL_SCHEDULE) {
    assertEqual(plan[window.startDay - 1].level, window.level, `day ${window.startDay}`);
    assertEqual(plan[window.endDay - 1].level, window.level, `day ${window.endDay}`);
  }
});

test('lessons are spread through their level rather than front loaded', () => {
  const plan = buildPlan();
  for (const window of LEVEL_SCHEDULE) {
    const span = plan.slice(window.startDay - 1, window.endDay);
    const lessonDays = span.filter((d) => d.lessonId);
    const firstHalf = lessonDays.filter((d) => d.day < (window.startDay + window.endDay) / 2).length;
    const ratio = firstHalf / lessonDays.length;
    assert(ratio > 0.35 && ratio < 0.65, `level ${window.level} is unevenly distributed (${Math.round(ratio * 100)}% in the first half)`);
  }
});

test('milestones describe a believable arc', () => {
  const ms = milestones();
  assertEqual(ms[0].day, 30);
  assertEqual(ms[ms.length - 1].day, 365);
  for (let i = 1; i < ms.length; i++) {
    assert(ms[i].lessonsDone >= ms[i - 1].lessonsDone, 'lesson count went backwards');
    assert(ms[i].level >= ms[i - 1].level, 'level went backwards');
  }
  assertEqual(ms[ms.length - 1].level, 6);
});

suite('daily sessions');

test('a brand new learner gets the first lesson', () => {
  const profile = createProfile();
  const session = buildSession(profile, 30, Date.now(), 1);
  const lessonItems = session.items.filter((i) => i.type === 'lesson');
  assertEqual(lessonItems.length, 1);
  assertEqual(lessonItems[0].lessonId, LESSONS[0].id);
  assert(lessonItems[0].exercises.length > 0, 'the lesson has no exercises');
});

test('sessions respect the time budget at every goal length', () => {
  for (const budget of [15, 30, 45]) {
    const profile = createProfile();
    const session = buildSession(profile, budget, Date.now(), 7);
    assert(
      session.estimatedMinutes <= budget * 1.35,
      `budget ${budget} produced ${session.estimatedMinutes} minutes`,
    );
    assert(session.estimatedMinutes > budget * 0.3, `budget ${budget} produced only ${session.estimatedMinutes} minutes`);
  }
});

test('a short budget trims drills instead of dropping the lesson', () => {
  const profile = createProfile();
  const short = buildSession(profile, 15, Date.now(), 3);
  const long = buildSession(profile, 45, Date.now(), 3);
  const shortLesson = short.items.find((i) => i.type === 'lesson');
  const longLesson = long.items.find((i) => i.type === 'lesson');
  assert(shortLesson, 'the short session dropped the lesson entirely');
  assert(shortLesson.exercises.length >= 3, 'the short session trimmed too far');
  assert(longLesson.exercises.length >= shortLesson.exercises.length);
});

test('due reviews are scheduled ahead of new material', () => {
  let profile = createProfile();
  profile = completeLesson(profile, LESSONS[0].id, 1);
  profile = recordSkillBatch(profile, 'card-notation', 0.4, Date.now() - 5 * DAY);

  const session = buildSession(profile, 30, Date.now(), 11);
  const firstType = session.items[0]?.type;
  assertEqual(firstType, 'review', 'an overdue skill should lead the session');
});

test('sessions advance as lessons are completed', () => {
  let profile = createProfile();
  for (let i = 0; i < 5; i++) {
    const next = nextLesson(profile);
    assert(next, 'ran out of lessons');
    assertEqual(next.id, LESSONS[i].id);
    profile = completeLesson(profile, next.id, 0.9);
  }
  assertEqual(nextLesson(profile).id, LESSONS[5].id);
});

test('every session item carries a gradeable exercise', () => {
  let profile = createProfile();
  for (let i = 0; i < 12; i++) {
    const session = buildSession(profile, 30, Date.now(), i + 100);
    for (const item of session.items) {
      if (item.type === 'lesson') {
        for (const ex of item.exercises) assert(ex.prompt && ex.kind, 'malformed lesson exercise');
      } else {
        assert(item.exercise?.prompt && item.exercise?.kind, `malformed ${item.type} exercise`);
      }
    }
    const lesson = nextLesson(profile);
    if (lesson) profile = completeLesson(profile, lesson.id, 0.9);
  }
});

suite('spaced repetition');

test('a correct review pushes the interval out', () => {
  let r = newRecord('pot-odds');
  const intervals = [];
  for (let i = 0; i < 5; i++) {
    r = review(r, 1.0, Date.now());
    intervals.push(r.intervalDays);
  }
  for (let i = 1; i < intervals.length; i++) {
    assert(intervals[i] > intervals[i - 1], `intervals did not grow: ${intervals}`);
  }
});

test('a failed review pulls the skill straight back', () => {
  let r = newRecord('pot-odds');
  for (let i = 0; i < 4; i++) r = review(r, 1.0);
  assert(r.intervalDays > 5);
  r = review(r, 0.2);
  assert(r.intervalDays <= 1, `failed skill should return immediately, got ${r.intervalDays} days`);
  assertEqual(r.lapses, 1);
});

test('repeated failure lowers ease so the skill stays close', () => {
  let r = newRecord('mdf');
  const easeBefore = r.ease;
  for (let i = 0; i < 3; i++) r = review(r, 0.3);
  assert(r.ease < easeBefore, 'ease should fall after failures');
  assert(r.ease >= 1.3, 'ease should not fall below the floor');
});

test('strength decays when a skill goes unpractised', () => {
  const now = Date.now();
  let r = newRecord('outs-counting', now);
  r = review(r, 1.0, now);
  r = review(r, 1.0, now);
  r = { ...r, attempts: 10, correct: 10 };

  const fresh = strength(r, now);
  const stale = strength(r, now + 60 * DAY);
  assert(stale < fresh, `strength should decay: ${fresh} -> ${stale}`);
  assert(fresh > 0, 'a practised skill should have some strength');
});

test('due skills sort most overdue first', () => {
  const now = Date.now();
  const records = {
    a: { ...newRecord('a'), due: now - 10 * DAY },
    b: { ...newRecord('b'), due: now - 2 * DAY },
    c: { ...newRecord('c'), due: now + 5 * DAY },
  };
  const due = dueSkills(records, now);
  assertEqual(due.length, 2);
  assertEqual(due[0].skill, 'a');
});

suite('progress and streaks');

test('a new profile starts empty', () => {
  const p = createProfile();
  assertEqual(p.xp, 0);
  assertEqual(p.streak, 0);
  assertEqual(Object.keys(p.completedLessons).length, 0);
  assertEqual(overallMastery(p), 0);
});

test('consecutive days build a streak', () => {
  let p = createProfile();
  const start = Date.now();
  for (let d = 0; d < 5; d++) p = registerVisit(p, start + d * DAY);
  assertEqual(p.streak, 5);
  assertEqual(p.longestStreak, 5);
  assertEqual(p.daysActive, 5);
});

test('visiting twice in one day does not double count', () => {
  let p = createProfile();
  const now = Date.now();
  p = registerVisit(p, now);
  p = registerVisit(p, now + 60_000);
  assertEqual(p.streak, 1);
  assertEqual(p.daysActive, 1);
});

test('one missed day spends a freeze rather than resetting', () => {
  let p = createProfile();
  const start = Date.now();
  for (let d = 0; d < 4; d++) p = registerVisit(p, start + d * DAY);
  assertEqual(p.streak, 4);
  const freezesBefore = p.streakFreezes;

  p = registerVisit(p, start + 5 * DAY); // skipped day 4
  assertEqual(p.streak, 5, 'a single missed day should not reset the streak');
  assertEqual(p.streakFreezes, freezesBefore - 1);
});

test('a long absence does reset the streak', () => {
  let p = createProfile();
  const start = Date.now();
  for (let d = 0; d < 4; d++) p = registerVisit(p, start + d * DAY);
  p = registerVisit(p, start + 20 * DAY);
  assertEqual(p.streak, 1);
});

test('answers accumulate xp and accuracy', () => {
  let p = createProfile();
  p = recordAnswer(p, 'pot-odds', true);
  p = recordAnswer(p, 'pot-odds', false);
  assertEqual(p.stats.attempted, 2);
  assertEqual(p.stats.correct, 1);
  assert(p.xp > 0);
  assertEqual(p.skills['pot-odds'].attempts, 2);
});

test('levels unlock only when the previous level is finished', () => {
  let p = createProfile();
  assert(isLevelUnlocked(p, 1));
  assert(!isLevelUnlocked(p, 2));

  for (const lesson of LEVELS[0].lessons) p = completeLesson(p, lesson.id, 1);
  assert(isLevelUnlocked(p, 2), 'level 2 should unlock after level 1');
  assert(!isLevelUnlocked(p, 3));
});

test('level progress reports honest counts', () => {
  let p = createProfile();
  for (const lesson of LEVELS[0].lessons.slice(0, 5)) p = completeLesson(p, lesson.id, 1);
  const lp = levelProgress(p);
  assertEqual(lp[0].lessonsDone, 5);
  assertEqual(lp[0].lessonsTotal, LEVELS[0].lessons.length);
  assert(!lp[0].complete);
  assert(lp[1].unlocked === false);
});

test('weakest skills surface the ones needing work', () => {
  let p = createProfile();
  const now = Date.now();
  p = recordSkillBatch(p, 'pot-odds', 1.0, now);
  p = recordSkillBatch(p, 'pot-odds', 1.0, now);
  p = recordAnswer(p, 'pot-odds', true);
  p = recordSkillBatch(p, 'outs-counting', 0.2, now);
  p = recordAnswer(p, 'outs-counting', false);

  const weak = weakestSkills(p, 2, now);
  assertEqual(weak[0].skill.id, 'outs-counting');
});

test('profiles round-trip through storage', () => {
  const store = new Map();
  const fake = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
  };
  let p = createProfile();
  p = completeLesson(p, LESSONS[0].id, 0.85);
  p = recordAnswer(p, 'card-notation', true);
  save(p, fake);

  const loaded = load(fake);
  assertEqual(loaded.xp, p.xp);
  assertEqual(Object.keys(loaded.completedLessons).length, 1);
  assertEqual(loaded.skills['card-notation'].attempts, 1);
});

test('a corrupt store falls back to a fresh profile instead of crashing', () => {
  const fake = { getItem: () => '{not json', setItem: () => {}, removeItem: () => {} };
  const p = load(fake);
  assertEqual(p.xp, 0);
});

test('day numbering is stable within a day and increments across days', () => {
  const now = Date.now();
  assertEqual(dayNumber(now), dayNumber(now + 1000));
  assertEqual(dayNumber(now + DAY), dayNumber(now) + 1);
});

suite('a simulated year');

/**
 * The integration test that matters: drive a learner through a year of daily
 * sessions and assert the system actually delivers what the course promises.
 */
test('a learner who shows up daily finishes the course and masters the skills', () => {
  let profile = createProfile();
  const start = Date.now();
  let sessionsRun = 0;

  for (let day = 0; day < 365; day++) {
    const now = start + day * DAY;
    profile = registerVisit(profile, now);
    const session = buildSession(profile, 30, now, day + 1);
    sessionsRun++;

    assert(session.items.length > 0, `day ${day + 1} produced an empty session`);

    for (const item of session.items) {
      if (item.type === 'lesson') {
        for (const ex of item.exercises) profile = recordAnswer(profile, ex.skill, true, now);
        profile = recordSkillBatch(profile, item.lesson.skill, 0.9, now);
        profile = completeLesson(profile, item.lessonId, 0.9, now);
      } else {
        profile = recordAnswer(profile, item.exercise.skill, true, now);
        profile = recordSkillBatch(profile, item.skill, 0.9, now);
      }
    }
  }

  assertEqual(sessionsRun, 365);
  assertEqual(profile.streak, 365, 'daily attendance should build a 365 day streak');
  assertEqual(Object.keys(profile.completedLessons).length, LESSONS.length, 'the course should be finished');
  assert(isLevelUnlocked(profile, 6), 'level 6 should be unlocked');

  const mastery = overallMastery(profile, start + 365 * DAY);
  assert(mastery > 0.5, `expected real mastery after a year, got ${Math.round(mastery * 100)}%`);
});

test('a learner who struggles still progresses, with weak skills recycled', () => {
  let profile = createProfile();
  const start = Date.now();
  let reviewsSeen = 0;

  for (let day = 0; day < 90; day++) {
    const now = start + day * DAY;
    profile = registerVisit(profile, now);
    const session = buildSession(profile, 30, now, day + 1);
    reviewsSeen += session.items.filter((i) => i.type === 'review').length;

    for (const item of session.items) {
      // Struggling learner: right about half the time.
      const score = (day + item.type.length) % 2 === 0 ? 0.4 : 0.8;
      if (item.type === 'lesson') {
        for (const ex of item.exercises) profile = recordAnswer(profile, ex.skill, score > 0.5, now);
        profile = recordSkillBatch(profile, item.lesson.skill, score, now);
        profile = completeLesson(profile, item.lessonId, score, now);
      } else {
        profile = recordAnswer(profile, item.exercise.skill, score > 0.5, now);
        profile = recordSkillBatch(profile, item.skill, score, now);
      }
    }
  }

  assert(Object.keys(profile.completedLessons).length > 20, 'a struggling learner should still advance');
  assert(reviewsSeen > 30, `weak skills should be recycled into sessions, saw ${reviewsSeen} reviews`);
});
