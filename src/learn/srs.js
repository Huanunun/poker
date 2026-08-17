/**
 * Spaced repetition, adapted for skills rather than flashcards.
 *
 * The standard SM-2 algorithm schedules individual facts. Poker skills are not
 * facts — you do not "remember" how to count outs, you either can or cannot do
 * it under time pressure, and that ability decays. So the unit scheduled here
 * is a skill, and the grade comes from performance across a batch of generated
 * drills rather than a single self-reported recall score.
 *
 * Two consequences worth noting:
 *   - Getting a skill wrong drops its interval hard, because a skill you have
 *     lost needs practice now, not in three days.
 *   - Strength decays with time even without failures, so the progress display
 *     tells the truth about what has gone rusty.
 */

import { t } from '../i18n/index.js';

const DAY = 24 * 60 * 60 * 1000;

/** A fresh record for a skill the learner has just met. */
export function newRecord(skillId, now = Date.now()) {
  return {
    skill: skillId,
    ease: 2.3,
    intervalDays: 0,
    due: now,
    reps: 0,
    lapses: 0,
    correct: 0,
    attempts: 0,
    lastSeen: null,
    introduced: now,
  };
}

/**
 * Update a record after a practice batch.
 * @param {object} record
 * @param {number} score 0..1, the fraction of questions answered correctly
 */
export function review(record, score, now = Date.now()) {
  const r = { ...record };
  r.reps += 1;
  r.lastSeen = now;

  const passed = score >= 0.7;

  if (!passed) {
    r.lapses += 1;
    r.ease = Math.max(1.3, r.ease - 0.25);
    // A failed skill comes back tomorrow at the latest, sooner if badly failed.
    r.intervalDays = score < 0.4 ? 0 : 1;
  } else {
    // Ease drifts up for confident performance, down for scrappy passes.
    r.ease = Math.min(3.0, r.ease + (score >= 0.95 ? 0.12 : score >= 0.85 ? 0.04 : -0.05));
    if (r.intervalDays === 0) r.intervalDays = 1;
    else if (r.intervalDays === 1) r.intervalDays = 3;
    else r.intervalDays = Math.round(r.intervalDays * r.ease);
    r.intervalDays = Math.min(r.intervalDays, 180);
  }

  r.due = now + r.intervalDays * DAY;
  return r;
}

/** Record the raw result of one question, for accuracy statistics. */
export function tally(record, correct) {
  return {
    ...record,
    attempts: (record.attempts || 0) + 1,
    correct: (record.correct || 0) + (correct ? 1 : 0),
  };
}

/**
 * Current strength, 0..1.
 *
 * Combines how far through the interval schedule the skill has got with how
 * overdue it is. A skill on a 30-day interval that is 40 days overdue is not
 * strong, whatever its history says.
 */
export function strength(record, now = Date.now()) {
  if (!record || !record.reps) return 0;
  const progress = Math.min(1, Math.log2(1 + record.intervalDays) / Math.log2(1 + 60));
  const overdueDays = Math.max(0, (now - record.due) / DAY);
  const decay = Math.exp(-overdueDays / Math.max(3, record.intervalDays));
  const accuracy = record.attempts ? record.correct / record.attempts : 0.5;
  return Math.max(0, Math.min(1, progress * (0.35 + 0.65 * decay) * (0.6 + 0.4 * accuracy)));
}

export function isDue(record, now = Date.now()) {
  return !record || record.due <= now;
}

/** Skills due for review, most overdue first. */
export function dueSkills(records, now = Date.now()) {
  return Object.values(records)
    .filter((r) => isDue(r, now))
    .sort((a, b) => a.due - b.due);
}

/** Where a skill sits, for display. */
export function strengthLabel(value) {
  if (value >= 0.8) return t('strength.solid');
  if (value >= 0.55) return t('strength.good');
  if (value >= 0.3) return t('strength.shaky');
  if (value > 0) return t('strength.rusty');
  return t('strength.new');
}

/** Human phrasing for when a skill comes back. */
export function dueLabel(record, now = Date.now()) {
  if (!record || !record.reps) return t('due.notStarted');
  const days = Math.round((record.due - now) / DAY);
  if (days <= 0) return t('due.now');
  if (days === 1) return t('due.tomorrow');
  if (days < 7) return t('due.days', { n: days });
  if (days < 30) return t('due.weeks', { n: Math.round(days / 7) });
  return t('due.months', { n: Math.round(days / 30) });
}
