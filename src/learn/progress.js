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

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createProfile();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return createProfile();
  }
}

export function save(profile, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function reset(storage = globalThis.localStorage) {
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
  return next;
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
