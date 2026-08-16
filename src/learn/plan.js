/**
 * The 365-day arc, and the session you actually do today.
 *
 * Two different things live here and it is worth being clear about the split.
 *
 * `buildPlan` is the *map*: a fixed 365-day schedule showing when each level
 * arrives, so a learner can see the shape of the year before committing to it.
 * It answers "where will I be in three months?".
 *
 * `buildSession` is the *territory*: what to actually do right now, assembled
 * from the next unlearned lesson plus whatever spaced repetition says is due,
 * trimmed to fit the daily time budget. It answers "what do I do today?".
 *
 * They deliberately do not have to agree. A learner who misses a fortnight
 * picks up where their knowledge is, not where the calendar says they should
 * be. The calendar is a promise about pace, not a debt to be repaid.
 */

import { LESSONS, LEVELS } from './curriculum/index.js';
import { GENERATORS, generate, questionCount } from './exercises.js';
import { SKILLS } from './skills.js';
import { dueSkills, isDue, strength } from './srs.js';

/** Where each level lands in the year. Matches the arc the course promises. */
export const LEVEL_SCHEDULE = [
  { level: 1, startDay: 1, endDay: 30 },
  { level: 2, startDay: 31, endDay: 90 },
  { level: 3, startDay: 91, endDay: 150 },
  { level: 4, startDay: 151, endDay: 240 },
  { level: 5, startDay: 241, endDay: 320 },
  { level: 6, startDay: 321, endDay: 365 },
];

export const DAILY_GOALS = [
  { id: 'light', minutes: 15, name: 'Light', detail: '15 minutes — one idea a day' },
  { id: 'steady', minutes: 30, name: 'Steady', detail: '30 minutes — the recommended pace' },
  { id: 'serious', minutes: 45, name: 'Serious', detail: '45 minutes — fastest sensible progress' },
];

/**
 * The reference calendar: 365 days, each either a new lesson or a practice day.
 *
 * Lessons are spread evenly through their level's window rather than front
 * loaded, because the gaps are not padding. Repetition on days between new
 * material is where a skill actually consolidates, and a level that delivers
 * all its lessons in the first fortnight teaches much less than the same
 * lessons spaced across two months.
 */
export function buildPlan() {
  const days = [];

  for (const window of LEVEL_SCHEDULE) {
    const level = LEVELS.find((l) => l.level === window.level);
    const lessons = level.lessons;
    const span = window.endDay - window.startDay + 1;

    // Evenly distribute lesson days across the window.
    const lessonDays = new Map();
    for (let i = 0; i < lessons.length; i++) {
      const offset = Math.floor((i * span) / lessons.length);
      lessonDays.set(window.startDay + offset, lessons[i]);
    }

    for (let day = window.startDay; day <= window.endDay; day++) {
      const lesson = lessonDays.get(day);
      if (lesson) {
        days.push({
          day,
          level: window.level,
          levelName: level.name,
          kind: lesson.checkpoint ? 'checkpoint' : 'lesson',
          lessonId: lesson.id,
          title: lesson.title,
          unit: lesson.unit,
          minutes: lesson.minutes,
        });
      } else {
        days.push({
          day,
          level: window.level,
          levelName: level.name,
          kind: 'practice',
          title: 'Practice and review',
          minutes: 20,
        });
      }
    }
  }

  return days;
}

/** Milestone summary for the "where will I be?" view. */
export function milestones() {
  const plan = buildPlan();
  return [30, 60, 90, 120, 180, 240, 300, 365].map((day) => {
    const entry = plan[day - 1];
    const level = LEVELS.find((l) => l.level === entry.level);
    const lessonsDone = plan.slice(0, day).filter((d) => d.kind !== 'practice').length;
    return {
      day,
      level: entry.level,
      levelName: level.name,
      promise: level.promise,
      lessonsDone,
    };
  });
}

/* ------------------------------------------------------------------ *
 * Today's session
 * ------------------------------------------------------------------ */

/** Rough time cost of one generated question, in minutes. */
const MINUTES_PER_QUESTION = 0.7;

/** The next lesson the learner has not completed. */
export function nextLesson(progress) {
  return LESSONS.find((l) => !progress.completedLessons?.[l.id]) || null;
}

/**
 * Assemble today's work.
 *
 * Order matters and is not arbitrary:
 *   1. Overdue skills come first, while attention is freshest, because a
 *      decayed skill is the most urgent thing in the queue.
 *   2. Then the new lesson, which needs concentration.
 *   3. Then extra practice on the weakest skills to fill any remaining budget.
 *
 * @param {object} progress
 * @param {number} budgetMinutes
 * @param {number} now
 */
export function buildSession(progress, budgetMinutes = 30, now = Date.now(), seedBase = now) {
  const records = progress.skills || {};
  const items = [];
  let spent = 0;
  let seed = seedBase >>> 0;
  const nextSeed = () => (seed = (seed * 1664525 + 1013904223) >>> 0);

  const push = (item, minutes) => {
    items.push(item);
    spent += minutes;
  };

  // --- 1. Reviews that are due ---------------------------------------------
  const due = dueSkills(records, now).filter((r) => generatorsFor(r.skill).length);
  const reviewBudget = budgetMinutes * (progress.completedLessons ? 0.4 : 0);

  for (const record of due) {
    if (spent >= reviewBudget) break;
    const gens = generatorsFor(record.skill);
    if (!gens.length) continue;
    const gen = gens[nextSeed() % gens.length];
    const exercise = generate(gen, nextSeed());
    push(
      { type: 'review', skill: record.skill, exercise },
      questionCount(exercise) * MINUTES_PER_QUESTION,
    );
  }

  // --- 2. The new lesson ----------------------------------------------------
  const lesson = nextLesson(progress);
  if (lesson && spent < budgetMinutes) {
    const drills = [];
    for (const drill of lesson.drills) {
      for (let i = 0; i < drill.count; i++) {
        drills.push(generate(drill.gen, nextSeed(), drill.params || {}));
      }
    }

    // A short budget gets the concepts plus a trimmed drill set rather than a
    // truncated lesson. Meeting the idea matters more than doing every rep.
    const conceptMinutes = lesson.concepts.length * 2.5;
    let allowed = drills.length;
    const remaining = budgetMinutes - spent - conceptMinutes;
    if (remaining < drills.length * MINUTES_PER_QUESTION) {
      allowed = Math.max(3, Math.floor(remaining / MINUTES_PER_QUESTION));
    }

    push(
      {
        type: 'lesson',
        lessonId: lesson.id,
        lesson,
        exercises: drills.slice(0, allowed),
        trimmed: allowed < drills.length,
      },
      conceptMinutes + Math.min(allowed, drills.length) * MINUTES_PER_QUESTION,
    );
  }

  // --- 3. Fill the rest with the weakest skills -----------------------------
  //
  // The pool includes the skills the current lesson touches, not only skills
  // with history. Otherwise day one ends after nine minutes against a thirty
  // minute goal: there is nothing to review yet, and the one available lesson
  // is short. Extra repetitions of what was just taught are the right filler.
  const poolIds = new Set(Object.keys(records));
  if (lesson) {
    poolIds.add(lesson.skill);
    for (const ex of items.find((i) => i.type === 'lesson')?.exercises || []) {
      poolIds.add(ex.skill);
    }
  }

  const practicable = SKILLS
    .filter((s) => poolIds.has(s.id) && generatorsFor(s.id).length)
    .sort((a, b) => strength(records[a.id], now) - strength(records[b.id], now));

  for (let guard = 0; spent < budgetMinutes && practicable.length && guard < 40; guard++) {
    const skill = practicable[guard % Math.min(practicable.length, 5)];
    const gens = generatorsFor(skill.id);
    const exercise = generate(gens[nextSeed() % gens.length], nextSeed());
    push(
      { type: 'practice', skill: skill.id, exercise },
      questionCount(exercise) * MINUTES_PER_QUESTION,
    );
  }

  return {
    items,
    estimatedMinutes: Math.round(spent),
    budgetMinutes,
    lesson,
    reviewCount: items.filter((i) => i.type === 'review').length,
    practiceCount: items.filter((i) => i.type === 'practice').length,
  };
}

/* ------------------------------------------------------------------ *
 * Generator index
 * ------------------------------------------------------------------ */

/**
 * Which generators train which skill.
 *
 * Built once by probing each generator, because the skill a generator teaches
 * is a property of the generator rather than something worth maintaining by
 * hand in a second list that would drift out of date.
 */
const GENERATOR_SKILLS = (() => {
  const index = {};
  for (const id of Object.keys(GENERATORS)) {
    try {
      const skill = generate(id, 12345).skill;
      (index[skill] ||= []).push(id);
    } catch {
      // Skipped: a generator that cannot produce a probe exercise is caught by
      // the generator test suite, not silently tolerated here.
    }
  }
  return index;
})();

export function generatorsFor(skillId) {
  return GENERATOR_SKILLS[skillId] || [];
}

/** Skills with no drill coverage, so gaps surface in tests rather than in use. */
export function uncoveredSkills() {
  return SKILLS.filter((s) => !generatorsFor(s.id).length).map((s) => s.id);
}
