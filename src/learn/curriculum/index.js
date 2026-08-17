/**
 * The assembled curriculum.
 *
 * Levels are authored separately and joined here so that adding content never
 * means touching the scheduling code.
 */

import { LEVEL_1 } from './level1.js';
import { LEVEL_2 } from './level2.js';
import { LEVEL_3 } from './level3.js';
import { LEVEL_4 } from './level4.js';
import { LEVEL_5 } from './level5.js';
import { LEVEL_6 } from './level6.js';
import { GENERATORS } from '../exercises.js';
import { SKILL_BY_ID } from '../skills.js';
import { getLocale } from '../../i18n/index.js';
import { LESSONS_ZH, LEVELS_ZH } from '../../i18n/lessons-zh.js';

export const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6];

/** Every lesson, in course order, with its level attached. */
export const LESSONS = LEVELS.flatMap((level) =>
  level.lessons.map((lesson, index) => ({
    ...lesson,
    level: level.level,
    levelName: level.name,
    indexInLevel: index,
  })));

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

/** Unit groupings within a level, for the path view. */
export function unitsOf(levelNumber) {
  const level = LEVELS.find((l) => l.level === levelNumber);
  if (!level) return [];
  const units = [];
  for (const lesson of level.lessons) {
    let unit = units.find((u) => u.name === lesson.unit);
    if (!unit) {
      unit = { name: lesson.unit, lessons: [] };
      units.push(unit);
    }
    unit.lessons.push(lesson);
  }
  return units;
}

/** Total estimated minutes of authored content. */
export function totalMinutes() {
  return LESSONS.reduce((sum, l) => sum + l.minutes, 0);
}

/** Every skill a lesson touches, via its own skill plus its drills'. */
export function skillsInLesson(lesson) {
  const skills = new Set([lesson.skill]);
  for (const drill of lesson.drills) {
    const gen = GENERATORS[drill.gen];
    if (!gen) continue;
    try {
      skills.add(gen(() => 0.5, drill.params || {}).skill);
    } catch {
      // A generator that needs real randomness is fine; its own skill is
      // covered by the drill registry test.
    }
  }
  return [...skills];
}

/**
 * Structural validation. Run by the test suite so a typo in a generator name
 * or a lesson referencing a skill that does not exist fails loudly rather than
 * producing an empty drill at day 200.
 */
export function validateCurriculum() {
  const problems = [];
  const seenIds = new Set();

  for (const lesson of LESSONS) {
    const at = `lesson ${lesson.id}`;
    if (seenIds.has(lesson.id)) problems.push(`${at}: duplicate id`);
    seenIds.add(lesson.id);

    if (!lesson.title) problems.push(`${at}: no title`);
    if (!lesson.takeaway) problems.push(`${at}: no takeaway`);
    if (!SKILL_BY_ID[lesson.skill]) problems.push(`${at}: unknown skill "${lesson.skill}"`);
    if (!lesson.concepts?.length) problems.push(`${at}: no concepts`);
    if (!lesson.drills?.length) problems.push(`${at}: no drills`);
    if (!(lesson.minutes >= 10 && lesson.minutes <= 60)) {
      problems.push(`${at}: implausible duration ${lesson.minutes}`);
    }

    for (const concept of lesson.concepts || []) {
      if (!concept.title) problems.push(`${at}: concept without a title`);
      if (!concept.body || concept.body.length < 80) {
        problems.push(`${at}: concept "${concept.title}" is too thin to teach anything`);
      }
    }

    for (const drill of lesson.drills || []) {
      if (!GENERATORS[drill.gen]) problems.push(`${at}: unknown generator "${drill.gen}"`);
      if (!(drill.count >= 1 && drill.count <= 10)) {
        problems.push(`${at}: drill "${drill.gen}" has an odd count ${drill.count}`);
      }
    }
  }

  // Every level should end with a checkpoint.
  for (const level of LEVELS) {
    const last = level.lessons[level.lessons.length - 1];
    if (!last?.checkpoint) problems.push(`level ${level.level} does not end with a checkpoint`);
    if (!level.promise) problems.push(`level ${level.level} has no promise`);
  }

  return problems;
}

/* ------------------------------------------------------------------ *
 * Localisation
 * ------------------------------------------------------------------ */

/**
 * A lesson in the active language.
 *
 * Falls back field by field rather than all-or-nothing, so a lesson with a
 * translated title but untranslated concepts shows the Chinese title and the
 * English body instead of reverting entirely to English.
 */
export function localiseLesson(lesson) {
  const zh = LESSONS_ZH[lesson.id];
  if (!zh || getLocale() !== 'zh') return lesson;

  const levelZh = LEVELS_ZH[lesson.level];
  return {
    ...lesson,
    title: zh.title ?? lesson.title,
    unit: zh.unit ?? lesson.unit,
    takeaway: zh.takeaway ?? lesson.takeaway,
    levelName: levelZh?.name ?? lesson.levelName,
    concepts: lesson.concepts.map((concept, i) => ({
      ...concept,
      title: zh.concepts?.[i]?.title ?? concept.title,
      body: zh.concepts?.[i]?.body ?? concept.body,
    })),
  };
}

/** A level's display strings in the active language. */
export function localiseLevel(level) {
  const zh = LEVELS_ZH[level.level];
  if (!zh || getLocale() !== 'zh') return level;
  return {
    ...level,
    name: zh.name ?? level.name,
    subtitle: zh.subtitle ?? level.subtitle,
    promise: zh.promise ?? level.promise,
  };
}

/** Share of lessons with Chinese content, reported honestly in the app. */
export function lessonTranslationCoverage() {
  const translated = LESSONS.filter((l) => LESSONS_ZH[l.id]).length;
  return translated / LESSONS.length;
}
