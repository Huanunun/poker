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
      el('button.btn.btn-ghost.btn-sm', { onClick: confirmExit, 'aria-label': 'Leave session' }, '✕'),
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
        screen.label && el('div.section-title', screen.label),
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
  const { concept, lesson, position, total } = screen;
  return el('div.card-panel.concept',
    el('div.concept-kicker', `${lesson.levelName} · ${lesson.unit} · idea ${position} of ${total}`),
    el('h2', concept.title),
    paragraphs(concept.body, 'concept-body'),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1.4rem' }, onClick: onNext }, 'Got it'),
  );
}

function takeawayScreen(screen, onNext) {
  const { lesson } = screen;
  return el('div.card-panel.concept',
    el('div.concept-kicker', 'Take this away'),
    el('h2', lesson.title),
    el('div.takeaway', { style: { marginTop: '1rem' }, html: richText(lesson.takeaway) }),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1.4rem' }, onClick: onNext }, 'Finish lesson'),
  );
}

function summaryScreen({ answeredCount, correctCount, accuracy, minutes, profile, onExit }) {
  const verdict = accuracy >= 0.9
    ? { icon: '🎯', title: 'Sharp session', note: 'That accuracy means the ideas are landing. The spacing algorithm will push these skills further out and bring you something harder.' }
    : accuracy >= 0.7
      ? { icon: '✓', title: 'Solid work', note: 'A few misses is exactly right. If everything were easy you would not be learning anything.' }
      : { icon: '🌱', title: 'Session done', note: 'A tough one. The skills you missed are already scheduled to come back tomorrow, which is precisely how this is meant to work.' };

  return el('div.card-panel.center',
    el('div', { style: { fontSize: '3rem' } }, verdict.icon),
    el('h1', { style: { marginBottom: '.3rem' } }, verdict.title),
    el('p.muted', verdict.note),

    el('div.result-grid', { style: { margin: '1.5rem 0' } },
      el('div',
        el('div.summary-big', `${correctCount}/${answeredCount}`),
        el('div.tile-label', 'correct'),
      ),
      el('div',
        el('div.summary-big', `${Math.round(accuracy * 100)}%`),
        el('div.tile-label', 'accuracy'),
      ),
      el('div',
        el('div.summary-big', String(profile.streak)),
        el('div.tile-label', profile.streak === 1 ? 'day streak' : 'day streak'),
      ),
    ),

    el('p.faint', `About ${minutes} minute${minutes === 1 ? '' : 's'}. Total XP ${profile.xp}.`),
    el('button.btn.btn-primary.btn-lg', { style: { marginTop: '1rem' }, onClick: onExit }, 'Done for today'),
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
          lesson,
          position: i + 1,
          total: lesson.concepts.length,
        });
      });
      for (const exercise of item.exercises) {
        screens.push({ type: 'exercise', exercise, label: lesson.title });
      }
      screens.push({ type: 'takeaway', lesson });
    } else if (item.type === 'review') {
      screens.push({
        type: 'exercise',
        exercise: item.exercise,
        label: 'Review',
        reviewSkill: item.skill,
      });
    } else {
      screens.push({ type: 'exercise', exercise: item.exercise, label: 'Practice' });
    }
  }

  return screens;
}
