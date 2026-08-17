/**
 * Shared visual pieces: playing cards, the felt, the range grid.
 *
 * Cards are rendered as real elements rather than unicode glyphs so they scale
 * cleanly and can carry state (selected, dimmed, highlighted). A beginner
 * spends most of their attention decoding the board, so the board has to be
 * legible at a glance.
 */

import { el, pctText } from './dom.js';
import { t } from '../i18n/index.js';
import { RANKS, SUITS, SUIT_SYMBOLS, cardToString, isRed, rankOf, suitOf } from '../engine/cards.js';
import { GRID, comboCount } from '../engine/ranges.js';
import { STRANDS } from '../learn/skills.js';

/** One playing card. */
export function playingCard(card, options = {}) {
  const { size = '', selected, dim, highlight, onClick, index } = options;
  const classes = ['pcard', isRed(card) ? 'red' : 'black'];
  if (size) classes.push(size);
  if (selected) classes.push('selected');
  if (dim) classes.push('dim');
  if (highlight) classes.push('highlight');
  if (onClick) classes.push('selectable');

  const node = el(
    onClick ? 'button' : 'div',
    {
      class: classes.join(' '),
      'aria-label': cardToString(card),
      ...(onClick ? { onClick: () => onClick(card, index), type: 'button' } : {}),
    },
    el('span.rank', RANKS[rankOf(card)]),
    el('span.suit', SUIT_SYMBOLS[SUITS[suitOf(card)]]),
  );
  return node;
}

export function cardRow(cards, options = {}) {
  return el('div.card-row', cards.map((c, i) => playingCard(c, { ...options, index: i })));
}

/**
 * The table. Renders whichever parts of a scenario are present, so one
 * component serves every exercise type without each generator knowing anything
 * about layout.
 */
export function feltTable(scenario = {}) {
  if (!scenario || !Object.keys(scenario).length) return null;
  const felt = el('div.felt');

  if (scenario.position) {
    felt.append(el('div.felt-section',
      el('div.felt-label', t('table.yourSeat')),
      el('div', { style: { fontWeight: '700', fontSize: '1.1rem' } }, scenario.position),
    ));
  }

  if (scenario.board?.length) {
    felt.append(el('div.felt-section',
      el('div.felt-label', boardLabel(scenario.board.length)),
      cardRow(scenario.board),
    ));
  }

  if (scenario.hole?.length) {
    felt.append(el('div.felt-section',
      el('div.felt-label', t('table.yourHand')),
      cardRow(scenario.hole),
    ));
  }

  if (scenario.villainCards?.length && scenario.revealVillain) {
    felt.append(el('div.felt-section',
      el('div.felt-label', t('table.theirHand')),
      cardRow(scenario.villainCards),
    ));
  }

  if (scenario.showdown?.length) {
    felt.append(el('div.felt-section.showdown',
      scenario.showdown.map((player) => el('div',
        el('div.felt-label', player.label),
        cardRow(player.cards),
      )),
    ));
  }

  const money = [];
  if (scenario.pot !== undefined) money.push({ label: t('table.pot'), value: scenario.pot });
  if (scenario.bet !== undefined) money.push({ label: t('table.theyBet'), value: scenario.bet });
  if (scenario.stack !== undefined) money.push({ label: t('table.stackBehind'), value: scenario.stack });
  if (money.length) {
    felt.append(el('div.felt-section.pot-display',
      money.map((m) => el('div.pot-item',
        el('div.pot-label', m.label),
        el('div.pot-value', String(m.value)),
      )),
    ));
  }

  if (scenario.stats) {
    felt.append(el('div.felt-section.pot-display',
      Object.entries(scenario.stats).map(([k, v]) => el('div.pot-item',
        el('div.pot-label', k),
        el('div.pot-value', String(v)),
      )),
    ));
  }

  const note = scenario.note || scenario.action;
  if (note) felt.append(el('div.felt-note', note));

  return felt;
}

function boardLabel(count) {
  if (count === 3) return t('table.flop');
  if (count === 4) return t('table.flopTurn');
  return t('table.board');
}

/* ------------------------------------------------------------------ *
 * Range grid
 * ------------------------------------------------------------------ */

/**
 * The 13x13 grid.
 *
 * `mode` is 'select' while answering and 'review' afterwards, where the cells
 * are recoloured to show hits, misses and extras at a glance. Seeing the shape
 * of your mistake is far more instructive than a score.
 */
export function rangeGrid({ selected = new Set(), answer = null, mode = 'select', onToggle = null }) {
  const answerSet = answer ? new Set(answer) : null;
  const grid = el('div.range-grid', { role: 'grid', 'aria-label': 'Starting hand grid' });

  let dragging = false;
  let dragValue = true;
  if (mode === 'select') {
    grid.addEventListener('pointerup', () => { dragging = false; });
    grid.addEventListener('pointerleave', () => { dragging = false; });
  }

  for (const row of GRID) {
    for (const label of row) {
      const isPair = label.length === 2;
      const classes = ['range-cell'];
      if (isPair) classes.push('pair');

      if (mode === 'review' && answerSet) {
        const want = answerSet.has(label);
        const have = selected.has(label);
        if (want && have) classes.push('correct-on');
        else if (want && !have) classes.push('missed');
        else if (!want && have) classes.push('extra');
      } else if (selected.has(label)) {
        classes.push('on');
      }

      const cell = el('button', {
        class: classes.join(' '),
        type: 'button',
        title: `${label} — ${comboCount(label)} combos`,
        'aria-label': label,
        'aria-pressed': selected.has(label) ? 'true' : 'false',
        disabled: mode !== 'select',
      }, label);

      if (mode === 'select' && onToggle) {
        // Pointer events give drag-select, which makes building a 40-cell
        // range take seconds instead of forty separate taps.
        cell.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          dragging = true;
          dragValue = !selected.has(label);
          onToggle(label, dragValue);
        });
        cell.addEventListener('pointerenter', () => {
          if (dragging) onToggle(label, dragValue);
        });
      }

      grid.append(cell);
    }
  }

  return grid;
}

export function rangeLegend(mode) {
  const items = mode === 'review'
    ? [
      ['var(--good)', 'Correct'],
      ['var(--warn)', 'Missed'],
      ['var(--bad)', 'Should not be in'],
    ]
    : [['var(--accent)', 'Selected']];
  return el('div.range-legend', items.map(([colour, label]) => el('span',
    el('span.legend-swatch', { style: { background: colour } }),
    label,
  )));
}

/* ------------------------------------------------------------------ *
 * Progress pieces
 * ------------------------------------------------------------------ */

export function progressBar(fraction, variant = '') {
  return el('div.progress-track',
    el('div', {
      class: `progress-fill ${variant}`,
      style: { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` },
    }),
  );
}

export function statPill(icon, value, className = '') {
  return el(`div.stat-pill.${className}`, el('span.ico', icon), el('span', String(value)));
}

export function tile(value, label) {
  return el('div.tile', el('div.tile-value', String(value)), el('div.tile-label', label));
}

/** One skill with its strand colour and strength bar. */
export function skillRow(skill, strengthValue, detail) {
  return el('div.skill-row',
    el('span.skill-dot', { style: { background: `var(--${STRANDS[skill.strand].colour})` } }),
    el('span.skill-name', skill.name),
    detail && el('span.faint', detail),
    el('span.skill-bar', progressBar(strengthValue, strengthValue >= 0.7 ? 'good' : '')),
  );
}

export function emptyState(icon, title, body) {
  return el('div.empty-state', el('div.big', icon), el('h3', title), body && el('p.muted', body));
}

export function derivation(steps) {
  return el('div.derivation', el('ol', steps.map((s) => el('li', s))));
}

export function readout(items) {
  return el('div.equity-readout', items.map(([value, label]) => el('div.readout-item',
    el('div.readout-value', value),
    el('div.readout-label', label),
  )));
}

export { pctText };
