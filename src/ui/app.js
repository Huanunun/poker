/**
 * Application shell and router.
 *
 * State lives in one profile object. Any change writes to localStorage and
 * re-renders the current view wholesale. At this size that is faster than any
 * diffing scheme and it removes a whole class of stale-view bugs.
 */

import { el, mount } from './dom.js';
import { statPill } from './components.js';
import { registerStrings, setLocale, getLocale, otherLocale, localeInfo, t, coverage } from '../i18n/index.js';
import { UI_EN, UI_ZH } from '../i18n/ui.js';
import { lessonTranslationCoverage } from '../learn/curriculum/index.js';

registerStrings('en', UI_EN);
registerStrings('zh', UI_ZH);
import { pathView, progressView, sandboxView, todayView } from './views.js';
import { sessionView } from './session.js';
import { buildSession } from '../learn/plan.js';
import { load, registerVisit, save, reset } from '../learn/progress.js';
import { LESSON_BY_ID } from '../learn/curriculum/index.js';
import { generate } from '../learn/exercises.js';

const TAB_IDS = ['today', 'path', 'progress', 'sandbox'];

const app = document.getElementById('app');

let profile = registerVisit(load());
// The learner's language is part of their profile, so it survives a reload and
// travels with an exported backup.
setLocale(profile.locale || getLocale());
applyLocaleToDocument();
save(profile);

/** Keep the document's lang attribute in step, so the CJK font stack applies. */
function applyLocaleToDocument() {
  document.documentElement.setAttribute('lang', getLocale());
}

let route = { name: 'today' };

function setProfile(next) {
  profile = next;
  save(profile);
  // A running session manages its own DOM; re-rendering underneath it would
  // discard the current question, so only the chrome is refreshed.
  if (route.name === 'session') renderChrome();
  else render();
}

function navigate(name, params = {}) {
  route = { name, ...params };
  window.scrollTo({ top: 0 });
  render();
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

let topbarSlot = null;
let navSlot = null;
let mainSlot = null;

function shell() {
  topbarSlot = el('div.topbar-stats');
  navSlot = el('nav.nav');
  mainSlot = el('main.main');

  return el('div',
    el('header.topbar',
      el('div.topbar-inner',
        el('button.brand', { onClick: () => navigate('today') },
          el('span.brand-mark', '♠'),
          el('span', t('app.name')),
        ),
        topbarSlot,
      ),
      navSlot,
    ),
    mainSlot,
  );
}

function switchLanguage() {
  const next = otherLocale();
  setLocale(next);
  applyLocaleToDocument();
  setProfile({ ...profile, locale: next });
  // A session in progress keeps its current question in the old language;
  // everything generated afterwards uses the new one. Re-rendering mid-question
  // would throw away an answer the learner had already typed.
  render();
}

function renderChrome() {
  mount(topbarSlot,
    el('button.btn.btn-sm.lang-toggle', {
      onClick: switchLanguage,
      title: t('lang.switch'),
      'aria-label': `${t('lang.switch')}: ${localeInfo(otherLocale()).native}`,
    }, localeInfo(otherLocale()).short),
    statPill('🔥', profile.streak, 'streak'),
    statPill('◆', profile.xp, 'xp'),
  );

  const inSession = route.name === 'session';
  navSlot.style.display = inSession ? 'none' : '';
  mount(navSlot, TAB_IDS.map((id) => el('button', {
    'aria-current': route.name === id ? 'page' : null,
    onClick: () => navigate(id),
  }, t(`nav.${id}`))));
}

function render() {
  renderChrome();

  switch (route.name) {
    case 'today':
      mount(mainSlot, todayView({
        profile,
        onStart: () => startSession(),
        onSetGoal: (minutes) => setProfile({ ...profile, dailyGoalMinutes: minutes }),
      }));
      break;

    case 'path':
      mount(mainSlot, pathView({
        profile,
        onStartLesson: (lesson) => startSession(lesson.id),
      }));
      break;

    case 'progress':
      mount(mainSlot, progressView({
        profile,
        onImport: (restored) => {
          profile = registerVisit(restored);
          save(profile);
          navigate('today');
        },
        onReset: () => {
          profile = registerVisit(reset());
          save(profile);
          navigate('today');
        },
      }));
      break;

    case 'sandbox':
      mount(mainSlot, sandboxView());
      break;

    case 'session':
      mount(mainSlot, sessionView({
        session: route.session,
        getProfile: () => profile,
        setProfile,
        onExit: () => navigate('today'),
      }));
      break;

    default:
      navigate('today');
  }
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

/**
 * Start today's session, or a single named lesson when one is picked from the
 * path. A named lesson still gets its own drills but skips the review queue,
 * because the learner asked for that specific thing.
 */
function startSession(lessonId = null) {
  const seed = Date.now();

  if (lessonId) {
    const lesson = LESSON_BY_ID[lessonId];
    if (!lesson) return;
    let s = seed;
    const nextSeed = () => (s = (s * 1664525 + 1013904223) >>> 0);
    const exercises = [];
    for (const drill of lesson.drills) {
      for (let i = 0; i < drill.count; i++) {
        exercises.push(generate(drill.gen, nextSeed(), drill.params || {}));
      }
    }
    navigate('session', {
      session: {
        items: [{ type: 'lesson', lessonId, lesson, exercises }],
        estimatedMinutes: lesson.minutes,
      },
    });
    return;
  }

  const session = buildSession(profile, profile.dailyGoalMinutes || 30, Date.now(), seed);
  if (!session.items.length) {
    navigate('today');
    return;
  }
  navigate('session', { session });
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

mount(app, shell());
render();

// Surfacing a render failure beats a blank page with an error only in the console.
window.addEventListener('error', (event) => {
  if (!mainSlot) return;
  mount(mainSlot, el('div.card-panel',
    el('h2', t('error.title')),
    el('p.muted', t('error.body')),
    el('pre', { style: { overflow: 'auto', fontSize: '.8rem', color: 'var(--bad)' } }, String(event.message)),
    el('button.btn.btn-primary', { onClick: () => location.reload() }, t('error.reload')),
  ));
});
