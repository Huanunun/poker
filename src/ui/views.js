/**
 * The screens outside a session: today, the path, progress, and the sandbox.
 */

import { el, paragraphs, pctText, richText } from './dom.js';
import {
  cardRow, derivation, emptyState, feltTable, playingCard, progressBar,
  rangeGrid, rangeLegend, readout, skillRow, tile,
} from './components.js';
import { LESSONS, LEVELS, unitsOf, totalMinutes } from '../learn/curriculum/index.js';
import { DAILY_GOALS, buildPlan, milestones, nextLesson } from '../learn/plan.js';
import { SKILLS, SKILL_BY_ID, STRANDS } from '../learn/skills.js';
import { dueLabel, strength, strengthLabel } from '../learn/srs.js';
import {
  accuracy, courseDay, exportProfile, importProfile, levelProgress, overallMastery,
  strandMastery, suggestedFilename, weakestSkills,
} from '../learn/progress.js';
import { parseCards, cardToString, makeRng } from '../engine/cards.js';
import { equity } from '../engine/equity.js';
import { evaluate, describe } from '../engine/evaluator.js';
import { countOuts, draws, describeBoard, boardTexture } from '../engine/board.js';
import { potOdds, priceOfBet, minimumDefenceFrequency, ruleOfTwoAndFour, round } from '../engine/odds.js';
import { equityVsRange, parseRange, rangeSize, handLabel, rangeToString } from '../engine/ranges.js';
import { RFI, POSITION_INFO } from '../engine/preflop.js';

/**
 * How the adaptive difficulty tier reads to a learner.
 *
 * Shown because a course that silently got easier when you struggled would feel
 * like it was not working. Naming the tier makes the adaptation legible, and
 * makes moving up feel like the achievement it is.
 */
const DIFFICULTY_NAMES = {
  2: 'Building',
  3: 'Standard',
  4: 'Sharp',
  5: 'Hard',
};

/* ------------------------------------------------------------------ *
 * Today
 * ------------------------------------------------------------------ */

export function todayView({ profile, onStart, onSetGoal }) {
  const root = el('div.stack');
  const next = nextLesson(profile);
  const day = courseDay(profile);
  const done = Object.keys(profile.completedLessons || {}).length;

  root.append(el('div.hero',
    el('div.hero-day', `Day ${day} · ${done} of ${LESSONS.length} lessons`),
    el('h1', next ? next.title : 'The course is complete'),
    el('p', next
      ? `${next.levelName} · ${next.unit} · about ${next.minutes} minutes`
      : 'Keep going with daily practice — sessions carry on drawing from everything you have learned.'),
    el('button.btn.btn-good.btn-lg', { onClick: onStart },
      done === 0 ? 'Start your first lesson' : 'Start today\'s session'),
  ));

  const strandValues = strandMastery(profile);
  root.append(el('div.tiles',
    tile(profile.streak, 'day streak'),
    tile(DIFFICULTY_NAMES[profile.ceiling ?? 3], 'difficulty'),
    tile(pctText(overallMastery(profile)), 'mastery'),
    tile(profile.stats?.attempted ? pctText(accuracy(profile)) : '—', 'accuracy'),
  ));

  const weak = weakestSkills(profile, 5);
  if (weak.length) {
    root.append(el('div.card-panel',
      el('div.section-title', 'Needs work'),
      el('div', weak.map(({ skill, strength: s, record }) =>
        skillRow(skill, s, `${strengthLabel(s)} · ${dueLabel(record)}`))),
      el('p.faint', { style: { marginTop: '.8rem' } },
        'These are pulled into your sessions automatically. You do not need to do anything about them.'),
    ));
  }

  root.append(el('div.card-panel',
    el('div.section-title', 'Daily goal'),
    el('div.goal-options', DAILY_GOALS.map((goal) => el('button', {
      class: `goal-option ${profile.dailyGoalMinutes === goal.minutes ? 'on' : ''}`,
      onClick: () => onSetGoal(goal.minutes),
    },
    el('span.goal-mins', `${goal.minutes}m`),
    el('span',
      el('div', { style: { fontWeight: '650' } }, goal.name),
      el('div.faint', goal.detail),
    ),
    ))),
  ));

  if (!done) root.append(howItWorksPanel());

  return root;
}

function howItWorksPanel() {
  return el('div.card-panel',
    el('div.section-title', 'How this works'),
    paragraphs(
      'This course assumes you know the rules and cannot yet price a decision. So it starts at the maths — no hand rankings, no card notation — and every lesson works towards one of five questions: bet, check, call, raise, or fold, and how much.\n\n'
      + 'Nothing is memorised. Those odds charts are impossible to hold in your head, and they should be: the goal here is to derive the number at the table in about five seconds, from counting. Shortcuts arrive only after you have worked them out the long way often enough that they feel obvious — and you learn where each one lies to you.\n\n'
      + 'Cash games, six to ten players, 100 big blinds. No tournaments.\n\n'
      + 'Skills you get wrong come back tomorrow; skills you get right come back in three days, then a week, then a month. If you find it too easy it gets harder on its own, and you never have to track any of this.',
    ),
  );
}

/* ------------------------------------------------------------------ *
 * The path
 * ------------------------------------------------------------------ */

export function pathView({ profile, onStartLesson }) {
  const root = el('div.stack');
  const progress = levelProgress(profile);

  root.append(el('div.card-panel',
    el('h1', 'The path'),
    el('p.muted', `${LESSONS.length} lessons across 6 levels, about ${Math.round(totalMinutes() / 60)} hours of material, designed to be spread across a year at 15 to 45 minutes a day.`),
  ));

  for (const level of LEVELS) {
    const p = progress.find((x) => x.level === level.level);
    const locked = !p.unlocked;
    const card = el(`div.level-card${locked ? '.locked' : ''}${p.complete ? '.done' : ''}`);

    const body = el('div.level-body');
    let open = !locked && !p.complete;

    const head = el('button.level-head', {
      onClick: () => {
        open = !open;
        body.style.display = open ? '' : 'none';
      },
    },
    el('div.level-num', locked ? '🔒' : p.complete ? '✓' : String(level.level)),
    el('div', { style: { flex: '1', minWidth: '0' } },
      el('div.level-title', level.name),
      el('div.level-sub', level.subtitle),
      el('div', { style: { marginTop: '.45rem' } }, progressBar(p.lessonsDone / p.lessonsTotal, p.complete ? 'good' : '')),
    ),
    el('span.faint', `${p.lessonsDone}/${p.lessonsTotal}`),
    );

    body.append(el('p.faint', { style: { marginTop: '.6rem' } }, level.promise));

    if (locked) {
      body.append(el('p.muted', { style: { marginTop: '.8rem' } },
        `Finish level ${level.level - 1} to unlock this.`));
    } else {
      for (const unit of unitsOf(level.level)) {
        body.append(el('div.unit-name', unit.name));
        for (const lesson of unit.lessons) {
          const isDone = Boolean(profile.completedLessons?.[lesson.id]);
          body.append(el('button', {
            class: `lesson-row ${isDone ? 'done' : ''} ${lesson.checkpoint ? 'checkpoint' : ''}`,
            onClick: () => onStartLesson(lesson),
          },
          el('span.lesson-check', isDone ? '✓' : ''),
          el('span', { style: { flex: '1' } },
            lesson.title,
            lesson.checkpoint && el('span.badge.accent', { style: { marginLeft: '.5rem' } }, 'checkpoint'),
          ),
          el('span.lesson-mins', `${lesson.minutes}m`),
          ));
        }
      }
    }

    body.style.display = open ? '' : 'none';
    card.append(head, body);
    root.append(card);
  }

  root.append(planPanel());
  return root;
}

function planPanel() {
  const panel = el('div.card-panel',
    el('div.section-title', 'The year ahead'),
    el('p.muted', 'Where a learner doing one session a day arrives, and when.'),
  );

  for (const m of milestones()) {
    panel.append(el('div.skill-row',
      el('span.badge.accent', `Day ${m.day}`),
      el('span.skill-name', el('strong', m.levelName), el('div.faint', m.promise)),
    ));
  }

  panel.append(el('p.faint', { style: { marginTop: '.8rem' } },
    'Miss a week and nothing is lost. Sessions resume from what you actually know, not from where the calendar says you should be.'));
  return panel;
}

/* ------------------------------------------------------------------ *
 * Progress
 * ------------------------------------------------------------------ */

export function progressView({ profile, onReset, onImport }) {
  const root = el('div.stack');
  const now = Date.now();

  root.append(el('div.card-panel',
    el('h1', 'Progress'),
    el('div.tiles', { style: { marginTop: '1rem' } },
      tile(courseDay(profile), 'days active'),
      tile(profile.longestStreak, 'best streak'),
      tile(profile.stats?.attempted || 0, 'questions'),
      tile(pctText(overallMastery(profile, now)), 'mastery'),
    ),
  ));

  const strands = strandMastery(profile, now);
  root.append(el('div.card-panel',
    el('div.section-title', 'Mastery by area'),
    el('div', Object.entries(STRANDS).map(([id, strand]) => el('div.skill-row',
      el('span.skill-dot', { style: { background: `var(--${strand.colour})` } }),
      el('span.skill-name', strand.name),
      el('span.faint', pctText(strands[id] || 0)),
      el('span.skill-bar', progressBar(strands[id] || 0, (strands[id] || 0) >= 0.7 ? 'good' : '')),
    ))),
  ));

  const started = SKILLS.filter((s) => profile.skills?.[s.id]?.attempts);
  if (started.length) {
    const panel = el('div.card-panel', el('div.section-title', `Every skill (${started.length} of ${SKILLS.length} started)`));
    const byStrand = {};
    for (const skill of started) (byStrand[skill.strand] ||= []).push(skill);

    for (const [strandId, skills] of Object.entries(byStrand)) {
      panel.append(el('div.unit-name', STRANDS[strandId].name));
      for (const skill of skills) {
        const record = profile.skills[skill.id];
        const s = strength(record, now);
        panel.append(skillRow(skill, s, `${strengthLabel(s)} · ${dueLabel(record, now)}`));
      }
    }
    root.append(panel);
  } else {
    root.append(el('div.card-panel', emptyState('📊', 'Nothing tracked yet', 'Finish a session and your skill strengths appear here.')));
  }

  if (profile.history?.length) {
    root.append(el('div.card-panel',
      el('div.section-title', 'Lessons completed'),
      el('div.heatmap', profile.history.slice(-120).map((h) => el('div', {
        class: `heat-cell ${h.score >= 0.9 ? 'l3' : h.score >= 0.7 ? 'l2' : 'l1'}`,
        title: `${h.lessonId} — ${Math.round(h.score * 100)}%`,
      }))),
    ));
  }

  root.append(backupPanel({ profile, onImport }));

  root.append(el('div.card-panel',
    el('div.section-title', 'Start over'),
    el('p.muted', 'Erasing is permanent. Save a backup first if there is any chance you want this back.'),
    el('button.btn', {
      style: { marginTop: '.6rem' },
      onClick: () => {
        if (confirm('Erase all progress and start over? This cannot be undone.')) onReset();
      },
    }, 'Reset all progress'),
  ));

  return root;
}

/**
 * Backup and restore.
 *
 * Progress lives in one browser's local storage, which is fine until that
 * browser is cleared. A file the learner holds is the only persistence that is
 * really theirs, so this offers a download and — because a sandboxed page
 * cannot always start a download — a copyable text box that always works.
 */
function backupPanel({ profile, onImport }) {
  const status = el('div');
  const panel = el('div.card-panel',
    el('div.section-title', 'Save your progress'),
    el('p.muted', 'Everything is stored in this browser and never sent anywhere. Save a backup file to move your progress to another browser or machine, or to keep it safe.'),
  );

  const downloadBtn = el('button.btn.btn-primary', {
    onClick: () => {
      const text = exportProfile(profile);
      const name = suggestedFilename(profile);
      try {
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = el('a', { href: url, download: name });
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showStatus(`Saved as ${name}. Keep it somewhere you will find it again.`, 'correct');
      } catch {
        showStatus('This browser blocked the download. Use "Show backup text" below and copy it instead.', 'neutral');
      }
    },
  }, 'Download backup file');

  const showTextBtn = el('button.btn', {
    onClick: () => {
      const box = el('textarea', {
        readonly: true,
        rows: '8',
        style: {
          width: '100%', marginTop: '.6rem', fontFamily: 'var(--mono)', fontSize: '.75rem',
          background: 'var(--bg-sunken)', color: 'var(--text)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '.6rem',
        },
      }, exportProfile(profile));
      status.replaceChildren(
        el('p.faint', { style: { marginTop: '.6rem' } }, 'Select all of this and copy it somewhere safe.'),
        box,
      );
      box.focus();
      box.select();
    },
  }, 'Show backup text');

  const fileInput = el('input', {
    type: 'file',
    accept: 'application/json,.json',
    style: { display: 'none' },
    onChange: async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      applyImport(await file.text());
      event.target.value = '';
    },
  });

  const restoreBtn = el('button.btn', { onClick: () => fileInput.click() }, 'Restore from file');

  const pasteBtn = el('button.btn.btn-ghost', {
    onClick: () => {
      const box = el('textarea', {
        rows: '6',
        placeholder: 'Paste your backup text here…',
        style: {
          width: '100%', marginTop: '.6rem', fontFamily: 'var(--mono)', fontSize: '.75rem',
          background: 'var(--bg-sunken)', color: 'var(--text)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '.6rem',
        },
      });
      status.replaceChildren(
        box,
        el('button.btn.btn-primary', {
          style: { marginTop: '.6rem' },
          onClick: () => applyImport(box.value),
        }, 'Restore this'),
      );
      box.focus();
    },
  }, 'Paste backup text');

  function applyImport(text) {
    const result = importProfile(text);
    if (result.error) {
      showStatus(result.error, 'wrong');
      return;
    }
    if (!confirm(`${result.summary}\n\nThis replaces your current progress. Continue?`)) return;
    onImport(result.profile);
  }

  function showStatus(message, tone) {
    status.replaceChildren(el(`div.feedback.${tone}`, el('div.feedback-body', el('p', message))));
  }

  panel.append(
    el('div.row.row-wrap', { style: { marginTop: '.8rem' } },
      downloadBtn, showTextBtn, restoreBtn, pasteBtn),
    fileInput,
    status,
  );
  return panel;
}

/* ------------------------------------------------------------------ *
 * Sandbox
 * ------------------------------------------------------------------ */

/**
 * A free-form calculator.
 *
 * Deliberately shows the derivation rather than only the answer: the sandbox is
 * where a learner brings a hand that puzzled them, and a bare number would not
 * settle the question that brought them here.
 */
export function sandboxView() {
  const root = el('div.stack');

  root.append(el('div.card-panel',
    el('h1', 'Sandbox'),
    el('p.muted', 'Bring a hand that puzzled you. Change one thing at a time and watch what happens to the numbers.'),
  ));

  root.append(equityTool());
  root.append(oddsTool());
  root.append(rangeTool());
  return root;
}

function equityTool() {
  const panel = el('div.card-panel', el('div.section-title', 'Equity calculator'));
  const output = el('div');

  const heroInput = field('Your hand', 'AcKc');
  const villainInput = field('Their hand or range', 'QQ');
  const boardInput = field('Board (leave blank for preflop)', '');

  const run = () => {
    try {
      const hero = parseCards(heroInput.input.value);
      if (hero.length !== 2) throw new Error('Your hand needs exactly two cards, like "AcKc".');
      const board = boardInput.input.value.trim() ? parseCards(boardInput.input.value) : [];
      if (board.length && (board.length < 3 || board.length > 5)) {
        throw new Error('A board is 3, 4, or 5 cards.');
      }

      const villainText = villainInput.input.value.trim();
      const asCards = /^[2-9TJQKA][cdhs]\s*[2-9TJQKA][cdhs]$/i.test(villainText.replace(/\s+/g, ' '));

      let result;
      let against;
      if (asCards) {
        const villain = parseCards(villainText);
        result = equity(hero, [villain], board);
        against = `against ${villain.map(cardToString).join(' ')}`;
      } else {
        const range = parseRange(villainText);
        if (!range.size) throw new Error('Could not read that range. Try something like "QQ+, AKs" or a hand like "QhQd".');
        const r = equityVsRange(hero, range, board, { trials: 8000, seed: 4242 });
        result = { equity: r.equity, exact: false, trials: r.trials };
        const size = rangeSize(range);
        against = `against ${range.size} hands (${size.combos} combinations, ${pctText(size.percent, 1)} of all hands)`;
      }

      const rows = [[pctText(result.equity, 1), 'your equity']];
      if (result.win !== undefined) {
        rows.push([pctText(result.win, 1), 'you win'], [pctText(result.tie, 1), 'you chop']);
      }

      const detail = [];
      if (board.length) {
        detail.push(`Board: ${describeBoard(board)}.`);
        detail.push(`You have ${describe(evaluate([...hero, ...board]))}.`);
        const d = draws(hero, board);
        if (d.labels.length) detail.push(`Draws: ${d.labels.join(', ')}.`);
      }
      if (asCards && board.length >= 3 && board.length < 5) {
        const outs = countOuts(hero, parseCards(villainText), board);
        detail.push(outs.aheadNow
          ? `You are ahead. ${outs.trapCards.length} cards would put them in front.`
          : `You are behind with ${outs.outCount} outs${outs.outsText ? `: ${outs.outsText}` : ''}.`);
      }

      output.replaceChildren(
        readout(rows),
        el('p.faint', { style: { marginTop: '.7rem' } },
          `${against}. ${result.exact ? `Exact, from all ${result.trials} runouts.` : `Estimated from ${result.trials} simulations.`}`),
        detail.length ? el('div.derivation', { style: { marginTop: '.8rem' } }, el('ol', detail.map((d) => el('li', d)))) : null,
      );
    } catch (err) {
      output.replaceChildren(el('div.feedback.wrong', el('div.feedback-body', el('p', err.message))));
    }
  };

  for (const f of [heroInput, villainInput, boardInput]) {
    f.input.addEventListener('input', run);
    panel.append(f.node);
  }
  panel.append(output);
  run();
  return panel;
}

function oddsTool() {
  const panel = el('div.card-panel', el('div.section-title', 'Pot odds and price'));
  const output = el('div');
  const potInput = field('Pot before their bet', '100');
  const betInput = field('Their bet', '50');
  const outsInput = field('Your outs (optional)', '9');

  const run = () => {
    const pot = Number(potInput.input.value) || 0;
    const bet = Number(betInput.input.value) || 0;
    const outs = Number(outsInput.input.value) || 0;

    if (pot <= 0 || bet <= 0) {
      output.replaceChildren(el('p.faint', 'Enter a pot and a bet.'));
      return;
    }

    const p = potOdds(pot + bet, bet);
    const mdf = minimumDefenceFrequency(pot, bet);
    const flop = outs ? ruleOfTwoAndFour(outs, 'flop') : null;
    const turn = outs ? ruleOfTwoAndFour(outs, 'turn') : null;

    const children = [
      readout([
        [pctText(p.breakEven, 1), 'equity needed'],
        [`${round(bet / pot * 100, 0)}%`, 'of pot'],
        [pctText(mdf.mdf, 0), 'you must defend'],
      ]),
      el('div.derivation', { style: { marginTop: '.8rem' } }, el('ol', p.steps.map((s) => el('li', s)))),
    ];

    if (outs) {
      const verdictTurn = turn.exact >= p.breakEven;
      children.push(el('div', { style: { marginTop: '.8rem' } },
        readout([
          [pctText(turn.exact, 1), 'one card'],
          [pctText(flop.exact, 1), 'two cards'],
        ]),
        el('p', { style: { marginTop: '.7rem' }, html: richText(
          `With ${outs} outs and one card to come you have **${pctText(turn.exact, 1)}** against a price of **${pctText(p.breakEven, 1)}** — `
          + `${verdictTurn ? 'a call on raw pot odds.' : 'a fold on raw pot odds, unless implied odds close the gap.'}`,
        ) }),
      ));
    }

    output.replaceChildren(...children);
  };

  for (const f of [potInput, betInput, outsInput]) {
    f.input.addEventListener('input', run);
    panel.append(f.node);
  }
  panel.append(output);
  run();
  return panel;
}

function rangeTool() {
  const panel = el('div.card-panel', el('div.section-title', 'Range explorer'));
  const selected = new Set(parseRange(RFI.BTN));
  const info = el('div');
  const gridHolder = el('div');

  const draw = () => {
    gridHolder.replaceChildren(rangeGrid({
      selected,
      mode: 'select',
      onToggle: (label, on) => {
        if (on) selected.add(label);
        else selected.delete(label);
        draw();
      },
    }));
    const size = rangeSize(selected);
    info.replaceChildren(
      readout([
        [String(selected.size), 'hands'],
        [String(size.combos), 'combos'],
        [pctText(size.percent, 1), 'of all hands'],
      ]),
      el('p.faint', { style: { marginTop: '.6rem', wordBreak: 'break-word' } }, rangeToString(selected) || 'Nothing selected.'),
    );
  };

  const presets = el('div.row.row-wrap', { style: { marginBottom: '.8rem' } },
    ...Object.keys(RFI).map((pos) => el('button.btn.btn-sm', {
      onClick: () => {
        selected.clear();
        for (const l of parseRange(RFI[pos])) selected.add(l);
        draw();
      },
    }, pos)),
    el('button.btn.btn-sm', {
      onClick: () => { selected.clear(); draw(); },
    }, 'Clear'),
  );

  draw();
  panel.append(presets, gridHolder, el('div', { style: { marginTop: '.8rem' } }, info));
  return panel;
}

function field(label, value) {
  const input = el('input', { type: 'text', value, spellcheck: 'false', autocapitalize: 'off' });
  return { node: el('div.field', el('label', label), input), input };
}
