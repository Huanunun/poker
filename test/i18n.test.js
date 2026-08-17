import { suite, test, assert, assertEqual } from './harness.js';
import {
  registerStrings, setLocale, getLocale, otherLocale, t, isTranslated,
  interpolate, coverage, missingKeys, localeInfo, LOCALE_LIST, _reset,
} from '../src/i18n/index.js';
import { UI_EN, UI_ZH } from '../src/i18n/ui.js';
import { LESSONS_ZH, LEVELS_ZH } from '../src/i18n/lessons-zh.js';
import { LESSONS, LEVELS, localiseLesson, localiseLevel, lessonTranslationCoverage } from '../src/learn/curriculum/index.js';

const load = () => {
  _reset();
  registerStrings('en', UI_EN);
  registerStrings('zh', UI_ZH);
};

suite('translation core');

test('both languages are offered', () => {
  assertEqual(LOCALE_LIST.length, 2);
  assertEqual(localeInfo('zh').short, '中文');
  assertEqual(localeInfo('en').short, 'EN');
});

test('switching locale changes what t() returns', () => {
  load();
  assertEqual(getLocale(), 'en');
  assertEqual(t('nav.today'), 'Today');
  setLocale('zh');
  assertEqual(t('nav.today'), '今天');
  setLocale('en');
  assertEqual(t('nav.today'), 'Today');
});

test('the toggle flips between exactly two languages', () => {
  load();
  assertEqual(otherLocale(), 'zh');
  setLocale('zh');
  assertEqual(otherLocale(), 'en');
});

test('placeholders are filled', () => {
  load();
  assertEqual(interpolate('{a} and {b}', { a: 'x', b: 'y' }), 'x and y');
  assertEqual(t('path.locked', { n: 3 }), 'Finish level 3 to unlock this.');
  setLocale('zh');
  assert(t('path.locked', { n: 3 }).includes('3'), 'the number survives into Chinese');
});

test('an unknown placeholder is left alone rather than blanked', () => {
  assertEqual(interpolate('hello {missing}', { other: 1 }), 'hello {missing}');
});

/**
 * The important property. A partially translated app must stay fully usable —
 * English text is an acceptable gap, a blank or a raw key is not.
 */
test('a missing Chinese string falls back to English, not to nothing', () => {
  _reset();
  registerStrings('en', { 'a.b': 'English text', 'only.en': 'Only English' });
  registerStrings('zh', { 'a.b': '中文' });

  setLocale('zh');
  assertEqual(t('a.b'), '中文');
  assertEqual(t('only.en'), 'Only English', 'falls back rather than rendering empty');
  assert(!isTranslated('only.en'));
  assert(isTranslated('a.b'));
});

test('a key missing from both languages returns the key, so the bug is visible', () => {
  _reset();
  registerStrings('en', {});
  assertEqual(t('nothing.here'), 'nothing.here');
});

suite('interface translation completeness');

test('every English interface string has a Chinese translation', () => {
  load();
  const missing = missingKeys('zh');
  assertEqual(missing.length, 0, `untranslated: ${missing.slice(0, 15).join(', ')}`);
});

test('interface coverage is complete', () => {
  load();
  assertEqual(Math.round(coverage('zh') * 100), 100);
});

test('no Chinese string was left as its English original', () => {
  const identical = Object.keys(UI_EN).filter((k) => {
    const en = UI_EN[k];
    const zh = UI_ZH[k];
    // Short labels legitimately match (e.g. "XP"); flag only real sentences.
    return zh === en && typeof en === 'string' && en.length > 12;
  });
  assertEqual(identical.length, 0, `not actually translated: ${identical.join(', ')}`);
});

test('Chinese strings keep every placeholder the English has', () => {
  const problems = [];
  const placeholders = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',');
  for (const [key, en] of Object.entries(UI_EN)) {
    const zh = UI_ZH[key];
    if (zh === undefined) continue;
    if (placeholders(en) !== placeholders(zh)) {
      problems.push(`${key}: en[${placeholders(en)}] vs zh[${placeholders(zh)}]`);
    }
  }
  assertEqual(problems.length, 0, problems.join('; '));
});

test('the Chinese actually contains Chinese characters', () => {
  const hasCJK = /[一-鿿]/;
  const suspicious = Object.entries(UI_ZH)
    .filter(([, v]) => typeof v === 'string' && v.length > 8 && !hasCJK.test(v))
    .map(([k]) => k);
  assertEqual(suspicious.length, 0, `no Chinese in: ${suspicious.join(', ')}`);
});

suite('lesson translation');

test('translated lessons swap title, unit, concepts and takeaway', () => {
  load();
  const lesson = LESSONS.find((l) => l.id === 'l1-01');

  setLocale('en');
  const en = localiseLesson(lesson);
  assertEqual(en.title, lesson.title, 'English is untouched');

  setLocale('zh');
  const zh = localiseLesson(lesson);
  assert(zh.title !== lesson.title, 'the title is translated');
  assert(/[一-鿿]/.test(zh.title), 'the title is Chinese');
  assert(/[一-鿿]/.test(zh.takeaway), 'the takeaway is Chinese');
  assert(/[一-鿿]/.test(zh.concepts[0].body), 'the concept body is Chinese');
  assertEqual(zh.concepts.length, lesson.concepts.length, 'no concept is lost');
});

test('an untranslated lesson stays fully readable in English', () => {
  load();
  setLocale('zh');
  const untranslated = LESSONS.find((l) => !LESSONS_ZH[l.id]);
  assert(untranslated, 'this test needs at least one untranslated lesson');

  const result = localiseLesson(untranslated);
  assertEqual(result.title, untranslated.title);
  assert(result.concepts.every((c) => c.body && c.body.length > 50), 'bodies survive intact');
  assert(result.takeaway, 'the takeaway survives');
});

test('translated lessons keep the same structure as their English source', () => {
  const problems = [];
  for (const lesson of LESSONS) {
    const zh = LESSONS_ZH[lesson.id];
    if (!zh) continue;
    if (!zh.title) problems.push(`${lesson.id}: no title`);
    if (!zh.takeaway) problems.push(`${lesson.id}: no takeaway`);
    if (!zh.unit) problems.push(`${lesson.id}: no unit`);
    if (zh.concepts && zh.concepts.length !== lesson.concepts.length) {
      problems.push(`${lesson.id}: ${zh.concepts.length} concepts, English has ${lesson.concepts.length}`);
    }
    for (const [i, c] of (zh.concepts || []).entries()) {
      if (!c.title) problems.push(`${lesson.id} concept ${i}: no title`);
      // Chinese carries far more meaning per character than English, so the
      // minimum length has to be script-aware. Judging 中文 by an English
      // character count marks perfectly substantial paragraphs as too thin.
      const cjk = (c.body?.match(/[一-鿿]/g) || []).length;
      const isChinese = cjk > (c.body?.length || 1) * 0.3;
      const minimum = isChinese ? 40 : 60;
      if (!c.body || c.body.length < minimum) {
        problems.push(`${lesson.id} concept ${i}: body too thin (${c.body?.length} chars)`);
      }
    }
  }
  assertEqual(problems.length, 0, problems.join('; '));
});

test('every level has Chinese display strings', () => {
  load();
  setLocale('zh');
  for (const level of LEVELS) {
    const zh = localiseLevel(level);
    assert(/[一-鿿]/.test(zh.name), `level ${level.level} name is not translated`);
    assert(/[一-鿿]/.test(zh.promise), `level ${level.level} promise is not translated`);
  }
  assertEqual(Object.keys(LEVELS_ZH).length, LEVELS.length);
});

test('lesson coverage is reported honestly', () => {
  const value = lessonTranslationCoverage();
  assert(value > 0 && value <= 1, `coverage out of range: ${value}`);
  const counted = LESSONS.filter((l) => LESSONS_ZH[l.id]).length;
  assertEqual(Math.round(value * LESSONS.length), counted);
});

test('the first level is fully translated, since it is what a learner meets first', () => {
  const levelOne = LESSONS.filter((l) => l.level === 1);
  const untranslated = levelOne.filter((l) => !LESSONS_ZH[l.id]).map((l) => l.id);
  assertEqual(untranslated.length, 0, `level 1 gaps: ${untranslated.join(', ')}`);
});
