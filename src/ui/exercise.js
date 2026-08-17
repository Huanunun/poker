/**
 * The exercise player.
 *
 * One function renders any exercise the generators produce. Two behaviours
 * matter more than the rest:
 *
 *  - Answer, then check. The learner commits before seeing whether they were
 *    right, because the moment of commitment is where learning happens.
 *  - Nothing advances without an explanation. Even a correct answer shows the
 *    working, because getting the right number for the wrong reason is the
 *    failure mode this whole course is designed to prevent.
 *
 * Step chains reveal one step at a time and keep answered steps visible above,
 * so by the last question the learner can see the chain of reasoning they just
 * built rather than a single isolated question.
 */

import { el, line, paragraphs, richText, announce } from './dom.js';
import { t } from '../i18n/index.js';
import { cardRow, feltTable, playingCard, rangeGrid, rangeLegend } from './components.js';
import { grade } from '../learn/exercises.js';

/**
 * @param {object} exercise
 * @param {(result: {correct: boolean, score: number}) => void} onComplete
 * @returns {HTMLElement}
 */
export function renderExercise(exercise, onComplete) {
  const root = el('div.exercise');

  if (exercise.scenario) {
    const felt = feltTable(exercise.scenario);
    if (felt) root.append(felt);
  }

  if (exercise.kind === 'steps') {
    root.append(renderStepChain(exercise, onComplete));
  } else {
    root.append(el('div.exercise-prompt', { html: richText(exercise.prompt) }));
    root.append(renderSingle(exercise, exercise, (correct) => {
      onComplete({ correct, score: correct ? 1 : 0 });
    }));
  }

  return root;
}

/* ------------------------------------------------------------------ *
 * Step chains
 * ------------------------------------------------------------------ */

function renderStepChain(exercise, onComplete) {
  const wrap = el('div.step-chain');
  const track = el('div.steps-track');
  const history = el('div.step-history');
  const current = el('div');

  wrap.append(
    el('div.exercise-prompt', { html: richText(exercise.prompt) }),
    track,
    history,
    current,
  );

  const results = [];
  let index = 0;

  const drawTrack = () => {
    track.replaceChildren(...exercise.steps.map((_, i) => el('div', {
      class: `step-dot ${i < index ? 'done' : i === index ? 'active' : ''}`,
    })));
  };

  const showStep = () => {
    drawTrack();
    if (index >= exercise.steps.length) return finish();

    const step = exercise.steps[index];
    current.replaceChildren(
      el('div.step-counter', t('session.stepOf', { n: index + 1, total: exercise.steps.length })),
      el('div.exercise-prompt', { html: richText(step.prompt) }),
      renderSingle(step, exercise, (correct, displayAnswer) => {
        results.push(correct);
        history.append(el(`div.step-done.${correct ? 'ok' : 'no'}`,
          el('span.tick', correct ? '✓' : '✗'),
          el('span',
            el('span.q', `${stripMarkup(step.prompt)} `),
            el('span.a', displayAnswer),
          ),
        ));
        index++;
        current.replaceChildren();
        showStep();
      }),
    );
    announce(t('session.stepOf', { n: index + 1, total: exercise.steps.length }));
  };

  const finish = () => {
    const score = results.filter(Boolean).length / results.length;
    const allRight = score === 1;
    current.replaceChildren(
      el(`div.feedback.${allRight ? 'correct' : 'neutral'}`,
        el('div.feedback-head', allRight ? '✓ Chain complete' : `${results.filter(Boolean).length} of ${results.length} steps correct`),
        el('div.feedback-body', exercise.explain.map((text) => paragraphs(text))),
      ),
      el('button.btn.btn-primary.btn-lg', {
        style: { marginTop: '1rem' },
        onClick: () => onComplete({ correct: allRight, score }),
      }, t('session.continue')),
    );
  };

  showStep();
  return wrap;
}

function stripMarkup(text) {
  return String(text).replace(/[*`]/g, '');
}

/* ------------------------------------------------------------------ *
 * Single questions
 * ------------------------------------------------------------------ */

/**
 * Render one gradeable question.
 * @param {object} item the exercise, or one step of a chain
 * @param {object} exercise the parent exercise, for context like the card pool
 * @param {(correct: boolean, displayAnswer: string) => void} onAnswered
 */
function renderSingle(item, exercise, onAnswered) {
  const wrap = el('div');
  const inputArea = el('div');
  const controls = el('div.row', { style: { marginTop: '1rem' } });
  const feedbackArea = el('div');

  let response = null;
  let answered = false;

  const input = buildInput(item, exercise, (value) => {
    response = value;
    checkBtn.disabled = !hasResponse(item, response);
  });
  inputArea.append(input.node);

  const hintBtn = item.hint
    ? el('button.btn.btn-ghost.btn-sm', {
      onClick: () => {
        hintBtn.remove();
        feedbackArea.append(el('div.hint-box', { html: `<strong>${t('session.hint')}:</strong> ${richText(item.hint)}` }));
      },
    }, t('session.showHint'))
    : null;

  const checkBtn = el('button.btn.btn-primary', {
    disabled: true,
    onClick: () => {
      if (answered) return;
      answered = true;

      const result = grade(item, response);
      input.lock(result);
      checkBtn.remove();
      if (hintBtn) hintBtn.remove();

      feedbackArea.replaceChildren(buildFeedback(item, result, input.describe(response)));
      announce(result.correct ? t('session.correct') : t('session.notQuite'));

      const nextBtn = el('button.btn.btn-primary.btn-lg', {
        style: { marginTop: '1rem' },
        onClick: () => onAnswered(result.correct, input.describe(response)),
      }, t('session.continue'));
      feedbackArea.append(nextBtn);
      nextBtn.focus();
    },
  }, t('session.check'));

  controls.append(checkBtn, el('span.spacer'), hintBtn);
  wrap.append(inputArea, controls, feedbackArea);
  return wrap;
}

function hasResponse(item, response) {
  if (response === null || response === undefined) return false;
  if (Array.isArray(response)) return response.length > 0;
  if (item.kind === 'numeric') return String(response).trim() !== '' && !Number.isNaN(Number(response));
  return true;
}

function buildFeedback(item, result, given) {
  const explain = item.explain
    ? (Array.isArray(item.explain) ? item.explain : [item.explain])
    : [];

  const head = result.correct
    ? `✓ ${t('session.correct')}`
    : result.close
      ? `✗ ${t('session.closeButNot')}`
      : `✗ ${t('session.notQuite')}`;

  const body = el('div.feedback-body');

  if (!result.correct) {
    body.append(el('p', { html: `<strong>${richText(t('session.youSaid', { answer: given }))}</strong> ${richText(correctAnswerText(item))}` }));
  }
  if (result.errors !== undefined && !result.correct) {
    body.append(el('p.muted', t('session.gridFeedback', { missing: result.missing, extra: result.extra })));
  }
  for (const text of explain) body.append(paragraphs(text));

  return el(`div.feedback.${result.correct ? 'correct' : 'wrong'}`,
    el('div.feedback-head', head),
    body,
  );
}

function correctAnswerText(item) {
  switch (item.kind) {
    case 'choice':
      return t('session.answerIs', { answer: `**${item.options[item.answer]}**` });
    case 'numeric':
      return t('session.answerIs', { answer: `**${item.answer}${item.unit ? ` ${item.unit}` : ''}**` });
    case 'slider':
      return t('session.answerIs', { answer: `**${item.answer}%**` });
    case 'multi':
      return t('session.answerIs', { answer: `**${item.answer.map((i) => item.options[i]).join(', ') || t('session.nothing')}**` });
    default:
      return t('session.selectionShown');
  }
}

/* ------------------------------------------------------------------ *
 * Input widgets
 * ------------------------------------------------------------------ */

/**
 * Each widget returns { node, lock(result), describe(response) }.
 * `lock` recolours the widget to show the answer; `describe` renders the
 * learner's response as text for the feedback and the step history.
 */
function buildInput(item, exercise, onChange) {
  switch (item.kind) {
    case 'choice': return choiceInput(item, onChange);
    case 'multi': return multiInput(item, onChange);
    case 'numeric': return numericInput(item, onChange);
    case 'slider': return sliderInput(item, onChange);
    case 'cards': return cardsInput(item, exercise, onChange);
    case 'grid': return gridInput(item, onChange);
    default: return { node: el('div', 'Unsupported exercise'), lock: () => {}, describe: () => '' };
  }
}

function choiceInput(item, onChange) {
  let chosen = null;
  const buttons = item.options.map((option, i) => el('button.option', {
    type: 'button',
    onClick: () => {
      chosen = i;
      buttons.forEach((b, j) => b.classList.toggle('chosen', i === j));
      onChange(i);
    },
  },
  el('span.marker', String.fromCharCode(65 + i)),
  el('span', { html: richText(option) }),
  ));

  return {
    node: el('div.options', buttons),
    lock: () => {
      buttons.forEach((b, i) => {
        b.disabled = true;
        b.classList.remove('chosen');
        if (i === item.answer) b.classList.add('correct');
        else if (i === chosen) b.classList.add('wrong');
      });
    },
    describe: (r) => (r === null ? t('session.nothing') : item.options[r]),
  };
}

function multiInput(item, onChange) {
  const picked = new Set();
  const buttons = item.options.map((option, i) => el('button.option', {
    type: 'button',
    onClick: () => {
      if (picked.has(i)) picked.delete(i);
      else picked.add(i);
      buttons[i].classList.toggle('chosen', picked.has(i));
      onChange([...picked]);
    },
  },
  el('span.marker', picked.has(i) ? '✓' : ''),
  el('span', { html: richText(option) }),
  ));

  return {
    node: el('div',
      el('p.faint', t('session.selectAll')),
      el('div.options', buttons),
    ),
    lock: () => {
      const want = new Set(item.answer);
      buttons.forEach((b, i) => {
        b.disabled = true;
        b.classList.remove('chosen');
        if (want.has(i)) b.classList.add('correct');
        else if (picked.has(i)) b.classList.add('wrong');
      });
    },
    describe: (r) => (r?.length ? r.map((i) => item.options[i]).join(', ') : t('session.nothing')),
  };
}

function numericInput(item, onChange) {
  const input = el('input', {
    type: 'number',
    inputmode: 'decimal',
    step: 'any',
    placeholder: '?',
    'aria-label': stripMarkup(item.prompt),
    onInput: (e) => onChange(e.target.value === '' ? null : Number(e.target.value)),
  });

  return {
    node: el('div.numeric-input', input, item.unit && el('span.numeric-unit', item.unit)),
    lock: () => { input.disabled = true; },
    describe: (r) => `${r}${item.unit ? ` ${item.unit}` : ''}`,
  };
}

function sliderInput(item, onChange) {
  const min = item.min ?? 0;
  const max = item.max ?? 100;
  const start = Math.round((min + max) / 2);
  const value = el('div.slider-value', `${start}%`);
  const input = el('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    value: String(start),
    'aria-label': stripMarkup(item.prompt),
    onInput: (e) => {
      value.textContent = `${e.target.value}%`;
      onChange(Number(e.target.value));
    },
  });

  // Report the midpoint immediately so Check is live; a learner who genuinely
  // thinks the answer is the midpoint should not have to jiggle the slider.
  queueMicrotask(() => onChange(start));

  return {
    node: el('div.slider-wrap',
      value,
      input,
      el('div.slider-scale', el('span', `${min}%`), el('span', `${Math.round((min + max) / 2)}%`), el('span', `${max}%`)),
    ),
    lock: (result) => {
      input.disabled = true;
      value.textContent = `${input.value}%`;
      value.style.color = result.correct ? 'var(--good)' : 'var(--bad)';
      value.append(el('span', {
        style: { fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '.5rem' },
      }, `actual ${item.answer}%`));
    },
    describe: (r) => `${r}%`,
  };
}

function cardsInput(item, exercise, onChange) {
  const picked = new Set();
  let nodes = [];

  const render = () => {
    const row = el('div.card-row', item.pool.map((card) => playingCard(card, {
      selected: picked.has(card),
      onClick: () => {
        if (picked.has(card)) picked.delete(card);
        else if (picked.size < item.selectCount) picked.add(card);
        onChange([...picked]);
        redraw();
      },
    })));
    nodes = [row];
    return row;
  };

  const container = el('div',
    el('p.faint', t('session.chooseN', { n: item.selectCount })),
    render(),
  );

  function redraw() {
    const fresh = render();
    container.replaceChild(fresh, container.lastChild);
  }

  return {
    node: container,
    lock: () => {
      const want = new Set(item.answer);
      const row = el('div.card-row', item.pool.map((card) => playingCard(card, {
        highlight: want.has(card),
        dim: !want.has(card),
      })));
      container.replaceChild(row, container.lastChild);
      container.append(el('p.faint', { style: { marginTop: '.5rem' } }, t('session.cardsHighlighted')));
    },
    describe: (r) => (r?.length ? `${r.length}` : t('session.nothing')),
  };
}

function gridInput(item, onChange) {
  const selected = new Set();
  const container = el('div');

  const draw = (mode) => {
    container.replaceChildren(
      rangeGrid({
        selected,
        answer: item.answer,
        mode,
        onToggle: (label, on) => {
          if (on) selected.add(label);
          else selected.delete(label);
          onChange([...selected]);
          draw('select');
        },
      }),
      rangeLegend(mode),
      mode === 'select' && el('p.faint.center', { style: { marginTop: '.5rem' } },
        t('session.handsSelected', { n: selected.size })),
    );
  };

  draw('select');

  return {
    node: container,
    lock: () => draw('review'),
    describe: (r) => `${r?.length || 0} hands`,
  };
}
