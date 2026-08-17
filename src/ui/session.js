/**
 * The session player: what a learner actually does each day.
 *
 * A session is flattened into a queue of screens — concept cards and exercises
 * interleaved — and walked one at a time. Concepts come immediately before the
 * drills that use them, never as a wall of reading at the start, because the
 * gap between meeting an idea and applying it is where the idea gets lost.
 *
 * Results are written back to the profile as they happen rather than at the
 * end, so a learner who closes the tab halfway through keeps their progress.
 */

import { el, paragraphs, richText, announce } from './dom.js';
import { t } from '../i18n/index.js';
import { localiseLesson } from '../learn/curriculum/index.js';
import { progressBar } from './components.js';
import { renderExercise } from './exercise.js';
import {
  completeLesson, recordAnswer, recordSkillBatch,
} from '../learn/progress.js';

/**
 * @param {object} deps
 * @param {object} deps.session   from buildSession
 * @param {() => object} deps.getProfile
 * @param {(next: object) => void} deps.setProfile persists immediately
 * @param {() => void} deps.onExit
 */
export function sessionView({ session, getProfile, setProfile, onExit }) {
  const root = el('div');
  const screens = flatten(session);
  const scores = new Map(); // skill -> {correct, total}

  let index = 0;
  let answeredCount = 0;
  let correctCount = 0;
  const startedAt = Date.now();

  const head = el('div.player-head');
  const body = el('div');
  root.append(head, body);

  const drawHead = () => {
    head.replaceChildren(
      el('button.btn.btn-ghost.btn-sm', { onClick: confirmExit, 'aria-label': t('session.leave') }, '✕'),
      progressBar(index / screens.length),
      el('span.faint', `${Math.min(index + 1, screens.length)}/${screens.length}`),
    );
  };

  function confirmExit() {
    // Progress is already saved; leaving is safe and needs no scary warning.
    onExit();
  }

  const noteResult = (skill, correct) => {
    if (!skill) return;
    const entry = scores.get(skill) || { correct: 0, total: 0 };
    entry.total++;
    if (correct) entry.correct++;
    scores.set(skill, entry);

    answeredCount++;
    if (correct) correctCount++;
    setProfile(recordAnswer(getProfile(), skill, correct));
  };

  const advance = () => {
    index++;
    show();
  };

  function show() {
    drawHead();
    if (index >= screens.length) return finish();

    const screen = screens[index];
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screen.type === 'concept') {
      body.replaceChildren(conceptScreen(screen, advance));
      announce(screen.concept.title);
      return;
    }

    if (screen.type === 'takeaway') {
      body.replaceChildren(takeawayScreen(screen, () => {
        // A lesson is banked the moment its final screen is reached.
        const lesson = screen.lesson;
        const stats = scores.get(lesson.skill);
        const score = stats && stats.total ? stats.correct / stats.total : 1;
        let profile = completeLesson(getProfile(), lesson.id, score);
        profile = recordSkillBatch(profile, lesson.skill, score);
        setProfile(profile);
        advance();
      }));
      return;
    }

    const { exercise } = screen;
    body.replaceChildren(
      el('div.card-panel',
        el('div.section-title', screen.label || localiseLesson(screen.lesson).title),
        renderExercise(exercise, ({ correct, score }) => {
          noteResult(exercise.skill, correct);
          if (screen.reviewSkill) {
            setProfile(recordSkillBatch(getProfile(), screen.reviewSkill, score));
          }
          advance();
        }),
      ),
    );
  }

  function finish() {
    // Any skill drilled several times this session gets its interval updated.
    let profile = getProfile();
    for (const [skill, stat] of scores) {
      if (stat.total >= 2) profile = recordSkillBatch(profile, skill, stat.correct / stat.total);
    }
    setProfile(profile);

    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const accuracy = answeredCount ? correctCount / answeredCount : 0;

    head.replaceChildren();
    body.replaceChildren(summaryScreen({
      answeredCount, correctCount, accuracy, minutes,
      profile: getProfile(),
      onExit,
    }));
    announce(`Session complete. ${correctCount} of ${answeredCount} correct.`);
  }

  show();
  return root;
}

/* ------------------------------------------------------------------ *
 * Screens
 * ------------------------------------------------------------------ */

function conceptScreen(screen, onNext) {
  const { lesson: rawLesson, position, total, conceptIndex } = screen;
  const lesson = localiseLesson(rawLesson);
  const concept = lesson.concepts[conceptIndex];
  return el('div.card-panel.concept',
    el('div.concept-kicker', t('session.ideaOf', {
      level: lesson.levelName, unit: lesson.unit, n: position, total,
    })),
    el('h2', concept.title),
    paragraphs(concept.body, 'concept-body'),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1.4rem' }, onClick: onNext }, t('session.gotIt')),
  );
}

function takeawayScreen(screen, onNext) {
  const lesson = localiseLesson(screen.lesson);
  return el('div.card-panel.concept',
    el('div.concept-kicker', t('session.takeaway')),
    el('h2', lesson.title),
    el('div.takeaway', { style: { marginTop: '1rem' }, html: richText(lesson.takeaway) }),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1.4rem' }, onClick: onNext }, t('session.finishLesson')),
  );
}

function summaryScreen({ answeredCount, correctCount, accuracy, minutes, profile, onExit }) {
  const verdict = accuracy >= 0.9
    ? { icon: '🎯', title: t('summary.sharp'), note: t('summary.sharpNote') }
    : accuracy >= 0.7
      ? { icon: '✓', title: t('summary.solid'), note: t('summary.solidNote') }
      : { icon: '🌱', title: t('summary.done'), note: t('summary.doneNote') };

  return el('div.card-panel.center',
    el('div', { style: { fontSize: '3rem' } }, verdict.icon),
    el('h1', { style: { marginBottom: '.3rem' } }, verdict.title),
    el('p.muted', verdict.note),

    el('div.result-grid', { style: { margin: '1.5rem 0' } },
      el('div',
        el('div.summary-big', `${correctCount}/${answeredCount}`),
        el('div.tile-label', t('summary.correctLabel')),
      ),
      el('div',
        el('div.summary-big', `${Math.round(accuracy * 100)}%`),
        el('div.tile-label', t('summary.accuracyLabel')),
      ),
      el('div',
        el('div.summary-big', String(profile.streak)),
        el('div.tile-label', t('summary.streakLabel')),
      ),
    ),

    el('p.faint', t('summary.time', { minutes, xp: profile.xp })),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1rem' }, onClick: onExit }, t('summary.doneForToday')),
  );
}

/* ------------------------------------------------------------------ *
 * Flattening
 * ------------------------------------------------------------------ */

/** Turn session items into a flat queue of screens. */
function flatten(session) {
  const screens = [];

  for (const item of session.items) {
    if (item.type === 'lesson') {
      const { lesson } = item;
      lesson.concepts.forEach((concept, i) => {
        screens.push({
          type: 'concept',
          concept,
          conceptIndex: i,
          lesson,
          position: i + 1,
          total: lesson.concepts.length,
        });
      });
      for (const exercise of item.exercises) {
        screens.push({ type: 'exercise', exercise, lesson });
      }
      screens.push({ type: 'takeaway', lesson });
    } else if (item.type === 'review') {
      screens.push({
        type: 'exercise',
        exercise: item.exercise,
        label: t('session.review'),
        reviewSkill: item.skill,
      });
    } else {
      screens.push({ type: 'exercise', exercise: item.exercise, label: t('session.practice') });
    }
  }

  return screens;
}
