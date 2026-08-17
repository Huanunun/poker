/**
 * The screens outside a session: today, the path, progress, and the sandbox.
 */

import { el, paragraphs, pctText, richText } from './dom.js';
import {
  cardRow, derivation, emptyState, feltTable, playingCard, progressBar,
  rangeGrid, rangeLegend, readout, skillRow, tile,
} from './components.js';
import {
  LESSONS, LEVELS, unitsOf, totalMinutes, localiseLesson, localiseLevel,
  lessonTranslationCoverage,
} from '../learn/curriculum/index.js';
import { t, getLocale, coverage as uiCoverage } from '../i18n/index.js';
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
const difficultyName = (tier) => t(`difficulty.${tier}`);

/* ------------------------------------------------------------------ *
 * Today
 * ------------------------------------------------------------------ */

export function todayView({ profile, onStart, onSetGoal }) {
  const root = el('div.stack');
  const rawNext = nextLesson(profile);
  const next = rawNext ? localiseLesson(rawNext) : null;
  const day = courseDay(profile);
  const done = Object.keys(profile.completedLessons || {}).length;

  root.append(el('div.hero',
    el('div.hero-day', t('today.day', { day, done, total: LESSONS.length })),
    el('h1', next ? next.title : t('today.complete')),
    el('p', next
      ? t('today.lessonMeta', { level: next.levelName, unit: next.unit, minutes: next.minutes })
      : t('today.completeBody')),
    el('button.btn.btn-good.btn-lg', { onClick: onStart },
      done === 0 ? t('today.startFirst') : t('today.startSession')),
  ));

  const strandValues = strandMastery(profile);
  root.append(el('div.tiles',
    tile(profile.streak, t('stat.streak')),
    tile(difficultyName(profile.ceiling ?? 3), t('stat.difficulty')),
    tile(pctText(overallMastery(profile)), t('stat.mastery')),
    tile(profile.stats?.attempted ? pctText(accuracy(profile)) : '—', t('stat.accuracy')),
  ));

  const weak = weakestSkills(profile, 5);
  if (weak.length) {
    root.append(el('div.card-panel',
      el('div.section-title', t('today.needsWork')),
      el('div', weak.map(({ skill, strength: s, record }) =>
        skillRow(skill, s, `${strengthLabel(s)} · ${dueLabel(record)}`))),
      el('p.faint', { style: { marginTop: '.8rem' } },
        t('today.needsWorkNote')),
    ));
  }

  root.append(el('div.card-panel',
    el('div.section-title', t('today.dailyGoal')),
    el('div.goal-options', DAILY_GOALS.map((goal) => el('button', {
      class: `goal-option ${profile.dailyGoalMinutes === goal.minutes ? 'on' : ''}`,
      onClick: () => onSetGoal(goal.minutes),
    },
    el('span.goal-mins', `${goal.minutes}m`),
    el('span',
      el('div', { style: { fontWeight: '650' } }, t(`goal.${goal.id}`)),
      el('div.faint', t(`goal.${goal.id}Detail`)),
    ),
    ))),
  ));

  if (!done) root.append(howItWorksPanel());

  return root;
}

function howItWorksPanel() {
  return el('div.card-panel',
    el('div.section-title', t('today.howItWorks')),
    paragraphs(t('today.howItWorksBody')),
  );
}

/* ------------------------------------------------------------------ *
 * The path
 * ------------------------------------------------------------------ */

export function pathView({ profile, onStartLesson }) {
  const root = el('div.stack');
  const progress = levelProgress(profile);

  root.append(el('div.card-panel',
    el('h1', t('path.title')),
    el('p.muted', t('path.summary', { lessons: LESSONS.length, hours: Math.round(totalMinutes() / 60) })),
  ));

  for (const rawLevel of LEVELS) {
    const level = localiseLevel(rawLevel);
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
        t('path.locked', { n: level.level - 1 })));
    } else {
      for (const unit of unitsOf(level.level)) {
        const unitName = localiseLesson({ ...unit.lessons[0], level: rawLevel.level }).unit;
        body.append(el('div.unit-name', unitName));
        for (const rawLesson of unit.lessons) {
          const lesson = localiseLesson({ ...rawLesson, level: rawLevel.level });
          const isDone = Boolean(profile.completedLessons?.[lesson.id]);
          body.append(el('button', {
            class: `lesson-row ${isDone ? 'done' : ''} ${lesson.checkpoint ? 'checkpoint' : ''}`,
            onClick: () => onStartLesson(lesson),
          },
          el('span.lesson-check', isDone ? '✓' : ''),
          el('span', { style: { flex: '1' } },
            lesson.title,
            lesson.checkpoint && el('span.badge.accent', { style: { marginLeft: '.5rem' } }, t('path.checkpoint')),
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
    el('div.section-title', t('path.yearAhead')),
    el('p.muted', t('path.yearAheadNote')),
  );

  for (const m of milestones()) {
    panel.append(el('div.skill-row',
      el('span.badge.accent', t('path.dayLabel', { day: m.day })),
      el('span.skill-name',
        el('strong', localiseLevel({ level: m.level, name: m.levelName, promise: m.promise }).name),
        el('div.faint', localiseLevel({ level: m.level, name: m.levelName, promise: m.promise }).promise)),
    ));
  }

  panel.append(el('p.faint', { style: { marginTop: '.8rem' } },
    t('path.missNote')));
  return panel;
}

/* ------------------------------------------------------------------ *
 * Progress
 * ------------------------------------------------------------------ */

export function progressView({ profile, onReset, onImport }) {
  const root = el('div.stack');
  const now = Date.now();

  root.append(el('div.card-panel',
    el('h1', t('progress.title')),
    el('div.tiles', { style: { marginTop: '1rem' } },
      tile(courseDay(profile), t('stat.daysActive')),
      tile(profile.longestStreak, t('stat.bestStreak')),
      tile(profile.stats?.attempted || 0, t('stat.questions')),
      tile(pctText(overallMastery(profile, now)), t('stat.mastery')),
    ),
  ));

  const strands = strandMastery(profile, now);
  root.append(el('div.card-panel',
    el('div.section-title', t('progress.byArea')),
    el('div', Object.entries(STRANDS).map(([id, strand]) => el('div.skill-row',
      el('span.skill-dot', { style: { background: `var(--${strand.colour})` } }),
      el('span.skill-name', t(`strand.${id}`)),
      el('span.faint', pctText(strands[id] || 0)),
      el('span.skill-bar', progressBar(strands[id] || 0, (strands[id] || 0) >= 0.7 ? 'good' : '')),
    ))),
  ));

  const started = SKILLS.filter((s) => profile.skills?.[s.id]?.attempts);
  if (started.length) {
    const panel = el('div.card-panel', el('div.section-title', t('progress.allSkills', { started: started.length, total: SKILLS.length })));
    const byStrand = {};
    for (const skill of started) (byStrand[skill.strand] ||= []).push(skill);

    for (const [strandId, skills] of Object.entries(byStrand)) {
      panel.append(el('div.unit-name', t(`strand.${strandId}`)));
      for (const skill of skills) {
        const record = profile.skills[skill.id];
        const s = strength(record, now);
        panel.append(skillRow(skill, s, `${strengthLabel(s)} · ${dueLabel(record, now)}`));
      }
    }
    root.append(panel);
  } else {
    root.append(el('div.card-panel', emptyState('📊', t('progress.nothingYet'), t('progress.nothingYetBody'))));
  }

  if (profile.history?.length) {
    root.append(el('div.card-panel',
      el('div.section-title', t('progress.lessonsCompleted')),
      el('div.heatmap', profile.history.slice(-120).map((h) => el('div', {
        class: `heat-cell ${h.score >= 0.9 ? 'l3' : h.score >= 0.7 ? 'l2' : 'l1'}`,
        title: `${h.lessonId} — ${Math.round(h.score * 100)}%`,
      }))),
    ));
  }

  if (getLocale() === 'zh') {
    const uiPct = Math.round(uiCoverage('zh') * 100);
    const lessonPct = Math.round(lessonTranslationCoverage() * 100);
    root.append(el('div.card-panel',
      el('div.section-title', t('lang.switch')),
      el('p.muted', t('lang.coverage', { percent: `${Math.round((uiPct + lessonPct) / 2)}%` })),
      el('p.faint', `界面 ${uiPct}% · 课程内容 ${lessonPct}% · 练习题目仍为英文`),
    ));
  }

  root.append(backupPanel({ profile, onImport }));

  root.append(el('div.card-panel',
    el('div.section-title', t('progress.startOver')),
    el('p.muted', t('progress.startOverBody')),
    el('button.btn', {
      style: { marginTop: '.6rem' },
      onClick: () => {
        if (confirm(t('progress.resetConfirm'))) onReset();
      },
    }, t('progress.reset')),
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
    el('div.section-title', t('progress.save')),
    el('p.muted', t('progress.saveBody')),
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
        showStatus(t('progress.saved', { name }), 'correct');
      } catch {
        showStatus(t('progress.downloadBlocked'), 'neutral');
      }
    },
  }, t('progress.download'));

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
        el('p.faint', { style: { marginTop: '.6rem' } }, t('progress.copyNote')),
        box,
      );
      box.focus();
      box.select();
    },
  }, t('progress.showText'));

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

  const restoreBtn = el('button.btn', { onClick: () => fileInput.click() }, t('progress.restoreFile'));

  const pasteBtn = el('button.btn.btn-ghost', {
    onClick: () => {
      const box = el('textarea', {
        rows: '6',
        placeholder: t('progress.pastePlaceholder'),
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
        }, t('progress.restoreThis')),
      );
      box.focus();
    },
  }, t('progress.pasteText'));

  function applyImport(text) {
    const result = importProfile(text);
    if (result.error) {
      showStatus(result.error, 'wrong');
      return;
    }
    if (!confirm(t('progress.replaceConfirm', { summary: result.summary }))) return;
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
    el('h1', t('sandbox.title')),
    el('p.muted', t('sandbox.intro')),
  ));

  root.append(equityTool());
  root.append(oddsTool());
  root.append(rangeTool());
  return root;
}

function equityTool() {
  const panel = el('div.card-panel', el('div.section-title', t('sandbox.equity')));
  const output = el('div');

  const heroInput = field(t('sandbox.yourHand'), 'AcKc');
  const villainInput = field(t('sandbox.theirHand'), 'QQ');
  const boardInput = field(t('sandbox.board'), '');

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

      const rows = [[pctText(result.equity, 1), t('sandbox.yourEquity')]];
      if (result.win !== undefined) {
        rows.push([pctText(result.win, 1), t('sandbox.youWin')], [pctText(result.tie, 1), t('sandbox.youChop')]);
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
          `${against} ${result.exact ? t('sandbox.exactNote', { trials: result.trials }) : t('sandbox.estimateNote', { trials: result.trials })}`),
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
  const panel = el('div.card-panel', el('div.section-title', t('sandbox.potOdds')));
  const output = el('div');
  const potInput = field(t('sandbox.potBefore'), '10');
  const betInput = field(t('sandbox.theirBet'), '5');
  const outsInput = field(t('sandbox.yourOuts'), '9');

  const run = () => {
    const pot = Number(potInput.input.value) || 0;
    const bet = Number(betInput.input.value) || 0;
    const outs = Number(outsInput.input.value) || 0;

    if (pot <= 0 || bet <= 0) {
      output.replaceChildren(el('p.faint', t('sandbox.enterPotAndBet')));
      return;
    }

    const p = potOdds(pot + bet, bet);
    const mdf = minimumDefenceFrequency(pot, bet);
    const flop = outs ? ruleOfTwoAndFour(outs, 'flop') : null;
    const turn = outs ? ruleOfTwoAndFour(outs, 'turn') : null;

    const children = [
      readout([
        [pctText(p.breakEven, 1), t('sandbox.equityNeeded')],
        [`${round(bet / pot * 100, 0)}%`, t('sandbox.ofPot')],
        [pctText(mdf.mdf, 0), t('sandbox.mustDefend')],
      ]),
      el('div.derivation', { style: { marginTop: '.8rem' } }, el('ol', p.steps.map((s) => el('li', s)))),
    ];

    if (outs) {
      const verdictTurn = turn.exact >= p.breakEven;
      children.push(el('div', { style: { marginTop: '.8rem' } },
        readout([
          [pctText(turn.exact, 1), t('sandbox.oneCard')],
          [pctText(flop.exact, 1), t('sandbox.twoCards')],
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
  const panel = el('div.card-panel', el('div.section-title', t('sandbox.rangeExplorer')));
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
        [String(selected.size), t('sandbox.hands')],
        [String(size.combos), t('sandbox.combos')],
        [pctText(size.percent, 1), t('sandbox.ofAllHands')],
      ]),
      el('p.faint', { style: { marginTop: '.6rem', wordBreak: 'break-word' } }, rangeToString(selected) || t('sandbox.nothingSelected')),
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
    }, t('sandbox.clear')),
  );

  draw();
  panel.append(presets, gridHolder, el('div', { style: { marginTop: '.8rem' } }, info));
  return panel;
}

function field(label, value) {
  const input = el('input', { type: 'text', value, spellcheck: 'false', autocapitalize: 'off' });
  return { node: el('div.field', el('label', label), input), input };
}
