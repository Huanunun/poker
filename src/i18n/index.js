/**
 * Bilingual support: English and Chinese, switchable at any time.
 *
 * Three rules shape this design.
 *
 * **Translation is data, not code.** Every translatable string has a key, and
 * the languages are plain objects keyed the same way. Adding or fixing a
 * translation never means touching application logic.
 *
 * **Missing translations fall back silently to English.** A partially
 * translated app must stay completely usable — an untranslated sentence in
 * English is fine, a blank space or a raw key is not. This matters because the
 * content here is large and translating it is staged.
 *
 * **Poker terms keep their English alongside the Chinese.** A learner who only
 * ever reads 底池赔率 cannot follow an English forum, a training video, or the
 * table talk in a live game. So the Chinese renders terms as
 * "底池赔率（pot odds）" the first time they matter. The goal is a player who can
 * operate in both, not a translated bubble.
 */

const LOCALES = {
  en: { id: 'en', name: 'English', short: 'EN', native: 'English' },
  zh: { id: 'zh', name: 'Chinese', short: '中文', native: '中文' },
};

export const LOCALE_LIST = Object.values(LOCALES);
export const DEFAULT_LOCALE = 'en';

let current = DEFAULT_LOCALE;
let tables = { en: {}, zh: {} };
const listeners = new Set();

/** Register the string tables. Called once at startup. */
export function registerStrings(locale, table) {
  tables[locale] = { ...(tables[locale] || {}), ...table };
}

export function getLocale() {
  return current;
}

export function localeInfo(id = current) {
  return LOCALES[id] || LOCALES[DEFAULT_LOCALE];
}

export function setLocale(locale) {
  if (!LOCALES[locale] || locale === current) return current;
  current = locale;
  for (const fn of listeners) fn(current);
  return current;
}

/** Subscribe to locale changes. Returns an unsubscribe function. */
export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The other language, for a two-way toggle. */
export function otherLocale() {
  return current === 'en' ? 'zh' : 'en';
}

/**
 * Look up a string.
 *
 * @param {string} key
 * @param {object} [vars] values for `{name}` placeholders
 * @returns {string}
 */
export function t(key, vars) {
  const raw = tables[current]?.[key] ?? tables[DEFAULT_LOCALE]?.[key];
  if (raw === undefined) {
    // A missing key in *both* languages is a bug, not a translation gap. Return
    // the key so it is visible in the UI rather than rendering an empty space.
    return key;
  }
  return vars ? interpolate(raw, vars) : raw;
}

/** Whether a key exists in the active locale specifically. */
export function isTranslated(key) {
  return tables[current]?.[key] !== undefined;
}

export function interpolate(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  ));
}

/**
 * Pick the right variant of an object that carries both languages.
 *
 * Used for content authored as `{ en: ..., zh: ... }` — lesson bodies and the
 * like — where a key-based table would be unwieldy.
 */
export function pick(bundle, fallback = '') {
  if (bundle === null || bundle === undefined) return fallback;
  if (typeof bundle === 'string') return bundle;
  return bundle[current] ?? bundle[DEFAULT_LOCALE] ?? fallback;
}

/**
 * How much of the interface is translated into a locale.
 *
 * Reported honestly in the app rather than hidden, because a learner who meets
 * an English paragraph should know it is a gap being filled, not a failure.
 */
export function coverage(locale = current) {
  const base = Object.keys(tables[DEFAULT_LOCALE] || {});
  if (!base.length) return 1;
  const target = tables[locale] || {};
  const done = base.filter((k) => target[k] !== undefined).length;
  return done / base.length;
}

/** Keys present in English but missing from a locale. Used by the tests. */
export function missingKeys(locale) {
  const base = Object.keys(tables[DEFAULT_LOCALE] || {});
  const target = tables[locale] || {};
  return base.filter((k) => target[k] === undefined);
}

/** Reset, for tests. */
export function _reset() {
  tables = { en: {}, zh: {} };
  current = DEFAULT_LOCALE;
  listeners.clear();
}
