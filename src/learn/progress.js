/**
 * Learner state: what has been done, how strong each skill is, and the streak.
 *
 * Deliberately a plain serializable object with pure functions over it. No
 * framework, no observables — the whole state fits in a few kilobytes of
 * localStorage and the UI re-renders from it wholesale, which is fast enough
 * and removes an entire category of state-synchronisation bugs.
 *
 * On the gamification: streaks and XP are here because they demonstrably keep
 * people returning, and returning daily is the only mechanism by which any of
 * this works. But the streak is built to survive a missed day (see
 * `registerVisit`), because a learner who breaks a 40-day streak and quits has
 * been harmed by the very feature meant to help them.
 */

import { LESSONS, LEVELS } from './curriculum/index.js';
import { SKILLS, SKILL_BY_ID } from './skills.js';
import { newRecord, review, strength, tally } from './srs.js';

const STORAGE_KEY = 'holdem-dojo:v1';
const DAY = 24 * 60 * 60 * 1000;

export function createProfile(now = Date.now()) {
  return {
    version: 1,
    createdAt: now,
    dailyGoalMinutes: 30,
    tableSize: 9,
    // Difficulty ceiling, 2..5. Starts at 3 rather than 2 because this course
    // assumes a learner who already knows the rules; rules-level drills (tier 1)
    // are never on the path at all.
    ceiling: 3,
    recent: [],
    xp: 0,
    streak: 0,
    longestStreak: 0,
    streakFreezes: 2,
    lastActiveDay: null,
    daysActive: 0,
    completedLessons: {},
    skills: {},
    history: [],
    stats: { attempted: 0, correct: 0 },
  };
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

/**
 * localStorage, or an in-memory stand-in.
 *
 * Reading `globalThis.localStorage` throws outright in a sandboxed frame, which
 * is where this app runs when it is published as a single page rather than
 * served. That throw happens while evaluating a default parameter, before any
 * try/catch in the function body, so the guard has to live here. Falling back
 * to memory keeps a session working end to end; only a reload loses it.
 */
const memoryStore = new Map();

export const memoryStorage = {
  getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
  setItem: (k, v) => memoryStore.set(k, String(v)),
  removeItem: (k) => memoryStore.delete(k),
  persistent: false,
};

export function defaultStorage() {
  try {
    const store = globalThis.localStorage;
    if (!store) return memoryStorage;
    // Safari in private mode exposes the object but throws on write.
    const probe = '__dojo_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return memoryStorage;
  }
}

export function load(storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createProfile();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return createProfile();
  }
}

export function save(profile, storage = defaultStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function reset(storage = defaultStorage()) {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; a fresh profile is returned either way.
  }
  return createProfile();
}

function migrate(profile) {
  const base = createProfile(profile.createdAt || Date.now());
  return { ...base, ...profile, stats: { ...base.stats, ...(profile.stats || {}) } };
}

/* ------------------------------------------------------------------ *
 * Days and streaks
 * ------------------------------------------------------------------ */

/** Local calendar day as a stable integer. */
export function dayNumber(timestamp = Date.now()) {
  const d = new Date(timestamp);
  return Math.floor((timestamp - d.getTimezoneOffset() * 60_000) / DAY);
}

/**
 * Mark the learner as present today and update the streak.
 *
 * A single missed day spends a "freeze" rather than resetting to zero. Missing
 * two consecutive days without a freeze does reset it. The intent is that an
 * ordinary busy Tuesday does not undo two months of habit, while the streak
 * still means something.
 */
export function registerVisit(profile, now = Date.now()) {
  const today = dayNumber(now);
  if (profile.lastActiveDay === today) return profile;

  const next = { ...profile };
  const gap = profile.lastActiveDay === null ? 1 : today - profile.lastActiveDay;

  if (gap === 1) {
    next.streak = profile.streak + 1;
  } else if (gap === 2 && profile.streakFreezes > 0) {
    next.streak = profile.streak + 1;
    next.streakFreezes = profile.streakFreezes - 1;
    next.usedFreezeOn = today;
  } else {
    next.streak = 1;
  }

  next.longestStreak = Math.max(profile.longestStreak, next.streak);
  next.lastActiveDay = today;
  next.daysActive = (profile.daysActive || 0) + 1;

  // Earn a freeze back every 10 consecutive days, capped at 2.
  if (next.streak % 10 === 0) {
    next.streakFreezes = Math.min(2, (next.streakFreezes ?? 0) + 1);
  }

  return next;
}

/** Which day of the course the learner is on, by days active rather than by clock. */
export function courseDay(profile) {
  return Math.max(1, profile.daysActive || 1);
}

/* ------------------------------------------------------------------ *
 * Recording results
 * ------------------------------------------------------------------ */

/**
 * Adaptive difficulty.
 *
 * The target is roughly 75% accuracy over the last 20 questions: comfortably
 * right often enough to stay motivated, wrong often enough to be learning. Too
 * easy is a real failure mode, not a pleasant one — a learner who gets
 * everything right is being entertained rather than taught.
 *
 * The window is short so the ceiling responds within a session or two, and the
 * bounds are 2 to 5 because tier 1 is rules material this course never uses.
 */
export const DIFFICULTY_WINDOW = 20;
const TARGET_ACCURACY = 0.75;

export function updateCeiling(profile) {
  const recent = profile.recent || [];
  if (recent.length < DIFFICULTY_WINDOW) return profile;

  const accuracy = recent.reduce((a, b) => a + b, 0) / recent.length;
  let ceiling = profile.ceiling ?? 3;

  if (accuracy > TARGET_ACCURACY + 0.13 && ceiling < 5) ceiling += 1;
  else if (accuracy < TARGET_ACCURACY - 0.20 && ceiling > 2) ceiling -= 1;
  else return profile;

  // Reset the window after a change so the next adjustment judges the new tier
  // rather than re-reacting to performance at the old one.
  return { ...profile, ceiling, recent: [] };
}

/** Record one graded question. */
export function recordAnswer(profile, skillId, correct, now = Date.now()) {
  const next = { ...profile, skills: { ...profile.skills } };
  const record = next.skills[skillId] || newRecord(skillId, now);
  next.skills[skillId] = tally(record, correct);
  next.stats = {
    attempted: (profile.stats?.attempted || 0) + 1,
    correct: (profile.stats?.correct || 0) + (correct ? 1 : 0),
  };
  next.xp = (profile.xp || 0) + (correct ? 10 : 2);
  next.recent = [...(profile.recent || []), correct ? 1 : 0].slice(-DIFFICULTY_WINDOW);
  return updateCeiling(next);
}

/* ------------------------------------------------------------------ *
 * Backup and restore
 * ------------------------------------------------------------------ */

/**
 * Everything about a learner, as portable text.
 *
 * Progress lives in one browser's local storage, which is fine until the
 * browser is cleared or the learner changes machine. A file they hold is the
 * only form of persistence that is genuinely theirs, so export produces
 * readable JSON rather than an opaque blob.
 */
export function exportProfile(profile) {
  return JSON.stringify({
    format: 'holdem-dojo-progress',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
  }, null, 2);
}

export function suggestedFilename(profile, now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  return `holdem-dojo-day${courseDay(profile)}-${date}.json`;
}

/**
 * Restore from exported text.
 *
 * Returns `{ profile }` or `{ error }` rather than throwing, because this runs
 * on text a person pasted and a stack trace is not a useful answer to "that
 * file was the wrong one".
 */
export function importProfile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'That does not look like a backup file — it is not valid JSON.' };
  }

  const candidate = parsed?.profile ?? parsed;
  if (!candidate || typeof candidate !== 'object') {
    return { error: 'That file does not contain a saved profile.' };
  }
  if (parsed?.format && parsed.format !== 'holdem-dojo-progress') {
    return { error: `That backup is from a different app (${parsed.format}).` };
  }
  if (!candidate.skills || typeof candidate.skills !== 'object') {
    return { error: 'That backup is missing its skill history, so it cannot be restored.' };
  }

  const restored = migrate(candidate);
  const lessons = Object.keys(restored.completedLessons || {}).length;
  return {
    profile: restored,
    summary: `Restored ${lessons} completed lesson${lessons === 1 ? '' : 's'}, `
      + `${Object.keys(restored.skills).length} tracked skills, `
      + `${restored.xp || 0} XP and a ${restored.streak || 0} day streak.`,
  };
}

/** Record the outcome of a whole practice batch for one skill. */
export function recordSkillBatch(profile, skillId, score, now = Date.now()) {
  const next = { ...profile, skills: { ...profile.skills } };
  const record = next.skills[skillId] || newRecord(skillId, now);
  next.skills[skillId] = review(record, score, now);
  return next;
}

/** Mark a lesson finished. */
export function completeLesson(profile, lessonId, score, now = Date.now()) {
  const next = {
    ...profile,
    completedLessons: { ...profile.completedLessons, [lessonId]: { at: now, score } },
    xp: (profile.xp || 0) + 50 + Math.round(score * 50),
    history: [
      ...(profile.history || []).slice(-364),
      { day: dayNumber(now), lessonId, score },
    ],
  };
  return next;
}

/* ------------------------------------------------------------------ *
 * Derived views
 * ------------------------------------------------------------------ */

/** Overall mastery, 0..1, across every skill in the course. */
export function overallMastery(profile, now = Date.now()) {
  const total = SKILLS.reduce((sum, s) => sum + strength(profile.skills?.[s.id], now), 0);
  return total / SKILLS.length;
}

/** Per-level completion and mastery, for the path view. */
export function levelProgress(profile, now = Date.now()) {
  return LEVELS.map((level) => {
    const lessons = level.lessons;
    const done = lessons.filter((l) => profile.completedLessons?.[l.id]).length;
    const skills = [...new Set(lessons.map((l) => l.skill))];
    const mastery = skills.reduce((sum, id) => sum + strength(profile.skills?.[id], now), 0) / skills.length;
    return {
      level: level.level,
      name: level.name,
      subtitle: level.subtitle,
      promise: level.promise,
      lessonsTotal: lessons.length,
      lessonsDone: done,
      complete: done === lessons.length,
      unlocked: level.level === 1 || isLevelUnlocked(profile, level.level),
      mastery,
    };
  });
}

/**
 * A level unlocks when the previous one is finished.
 *
 * Gating is on lessons completed rather than on mastery, deliberately. Holding
 * someone at level 2 because their outs counting sits at 68% would be
 * demoralising and unnecessary — spaced repetition already drags weak skills
 * forward into later sessions, so the material keeps getting practised without
 * the path being blocked.
 */
export function isLevelUnlocked(profile, levelNumber) {
  if (levelNumber <= 1) return true;
  const previous = LEVELS.find((l) => l.level === levelNumber - 1);
  if (!previous) return false;
  return previous.lessons.every((l) => profile.completedLessons?.[l.id]);
}

/** The skills most in need of work, for the "weak spots" panel. */
export function weakestSkills(profile, count = 5, now = Date.now()) {
  return SKILLS
    .filter((s) => profile.skills?.[s.id]?.attempts)
    .map((s) => ({
      skill: s,
      strength: strength(profile.skills[s.id], now),
      record: profile.skills[s.id],
    }))
    .sort((a, b) => a.strength - b.strength)
    .slice(0, count);
}

/** Skills at full strength, for the "solid" panel. */
export function strongestSkills(profile, count = 5, now = Date.now()) {
  return SKILLS
    .filter((s) => profile.skills?.[s.id]?.attempts)
    .map((s) => ({
      skill: s,
      strength: strength(profile.skills[s.id], now),
      record: profile.skills[s.id],
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, count);
}

/** Accuracy over the whole history. */
export function accuracy(profile) {
  const { attempted = 0, correct = 0 } = profile.stats || {};
  return attempted ? correct / attempted : 0;
}

/** Strand-level rollup for the progress chart. */
export function strandMastery(profile, now = Date.now()) {
  const byStrand = {};
  for (const skill of SKILLS) {
    (byStrand[skill.strand] ||= []).push(strength(profile.skills?.[skill.id], now));
  }
  return Object.fromEntries(
    Object.entries(byStrand).map(([strand, values]) => [
      strand,
      values.reduce((a, b) => a + b, 0) / values.length,
    ]),
  );
}

/** Lessons available to start right now. */
export function availableLessons(profile) {
  return LESSONS.filter((l) => isLevelUnlocked(profile, l.level) && !profile.completedLessons?.[l.id]);
}
