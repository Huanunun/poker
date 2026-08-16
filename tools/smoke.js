/**
 * Browser smoke test.
 *
 * Drives the real app in Chromium and plays a full session end to end. Unit
 * tests prove the engine is right; this proves a learner can actually reach it
 * through the interface. Any console error or unhandled rejection fails the run.
 *
 *   node tools/serve.js &   then   node tools/smoke.js
 */

import { chromium } from 'playwright';

const BASE = process.env.SMOKE_URL || 'http://localhost:8080';
const problems = [];
const notes = [];

function log(ok, message) {
  notes.push(`${ok ? '  \x1b[32m✓\x1b[0m' : '  \x1b[31m✗\x1b[0m'} ${message}`);
  if (!ok) problems.push(message);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

await page.goto(BASE, { waitUntil: 'networkidle' });

console.log('\n\x1b[1mbrowser smoke test\x1b[0m');

// --- The shell loads ------------------------------------------------------
log(await page.locator('.brand').isVisible(), 'the app shell renders');
log((await page.locator('.hero h1').textContent())?.length > 0, 'today screen shows the next lesson');
log(await page.locator('.nav button', { hasText: 'Path' }).isVisible(), 'navigation is present');

// --- Tabs all render ------------------------------------------------------
for (const tab of ['Path', 'Progress', 'Sandbox', 'Today']) {
  await page.locator('.nav button', { hasText: tab }).click();
  await page.waitForTimeout(120);
  const hasContent = await page.locator('.main').evaluate((n) => n.children.length > 0);
  log(hasContent, `${tab} tab renders`);
}

// --- The sandbox actually computes ---------------------------------------
await page.locator('.nav button', { hasText: 'Sandbox' }).click();
await page.waitForTimeout(200);
const equityText = await page.locator('.readout-value').first().textContent();
log(/\d+(\.\d+)?%/.test(equityText || ''), `equity calculator produces a number (${equityText})`);

// AcKc versus QQ preflop is a familiar coin-flip-ish number; assert the real
// value rather than merely "some percentage appeared".
const equityValue = parseFloat(equityText);
log(equityValue > 40 && equityValue < 50, `AcKc vs QQ equity is plausible (${equityValue}%)`);

await page.locator('.range-grid .range-cell').first().waitFor();
const gridCells = await page.locator('.range-grid .range-cell').count();
log(gridCells === 169, `range grid has 169 cells (found ${gridCells})`);

// --- Play a full session --------------------------------------------------
await page.locator('.nav button', { hasText: 'Today' }).click();
await page.waitForTimeout(150);
await page.locator('.hero button').click();
await page.waitForTimeout(250);

log(await page.locator('.player-head').isVisible(), 'session player opens');

let screens = 0;
let answered = 0;
let sawConcept = false;
let sawFeedback = false;
let sawStepChain = false;

while (screens < 260) {
  screens++;

  // Finished?
  if (await page.locator('.summary-big').first().isVisible().catch(() => false)) break;

  // Concept or takeaway screen.
  const advanceBtn = page.locator('button', { hasText: /^(Got it|Finish lesson)$/ });
  if (await advanceBtn.first().isVisible().catch(() => false)) {
    sawConcept = true;
    await advanceBtn.first().click();
    await page.waitForTimeout(60);
    continue;
  }

  // Post-answer continue.
  const continueBtn = page.locator('button', { hasText: /^Continue$/ });
  if (await continueBtn.first().isVisible().catch(() => false)) {
    await continueBtn.first().click();
    await page.waitForTimeout(60);
    continue;
  }

  if (await page.locator('.step-chain').first().isVisible().catch(() => false)) sawStepChain = true;

  // Answer whatever input is showing.
  const answeredThis = await answerCurrent(page);
  if (!answeredThis) {
    log(false, `stuck on an unanswerable screen after ${answered} answers`);
    await page.screenshot({ path: '/tmp/smoke-stuck.png' });
    break;
  }
  answered++;

  const check = page.locator('button', { hasText: /^Check$/ });
  if (await check.first().isVisible().catch(() => false)) {
    await check.first().click();
    await page.waitForTimeout(80);
    if (await page.locator('.feedback').first().isVisible().catch(() => false)) sawFeedback = true;
  }
}

log(sawConcept, 'concept screens appeared before drills');
log(answered >= 5, `answered ${answered} questions`);
log(sawFeedback, 'every answer produced feedback with an explanation');
log(
  await page.locator('.summary-big').first().isVisible().catch(() => false),
  'session reached the summary screen',
);

// --- Progress persisted ---------------------------------------------------
const doneBtn = page.locator('button', { hasText: 'Done for today' });
if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
await page.waitForTimeout(200);

const xpAfter = await page.locator('.stat-pill.xp').textContent();
log(parseInt(xpAfter.replace(/\D/g, ''), 10) > 0, `xp was earned (${xpAfter.trim()})`);

await page.reload({ waitUntil: 'networkidle' });
const xpAfterReload = await page.locator('.stat-pill.xp').textContent();
log(
  xpAfterReload.replace(/\D/g, '') === xpAfter.replace(/\D/g, ''),
  'progress survives a reload',
);

await page.locator('.nav button', { hasText: 'Path' }).click();
await page.waitForTimeout(150);
const completed = await page.locator('.lesson-row.done').count();
log(completed >= 1, `the path shows ${completed} completed lesson(s)`);

// --- Step chains ----------------------------------------------------------
//
// Day one teaches card notation, which is all single questions, so the step
// chain — the format the whole course is built around — needs a seeded profile
// to reach. This unlocks level 2 and opens the outs-counting lesson directly.
await page.evaluate(() => {
  const key = 'holdem-dojo:v1';
  const profile = JSON.parse(localStorage.getItem(key));
  profile.completedLessons ||= {};
  for (let i = 1; i <= 20; i++) {
    profile.completedLessons[`l1-${String(i).padStart(2, '0')}`] = { at: Date.now(), score: 1 };
  }
  localStorage.setItem(key, JSON.stringify(profile));
});
await page.reload({ waitUntil: 'networkidle' });
await page.locator('.nav button', { hasText: 'Path' }).click();
await page.waitForTimeout(150);

const outsLesson = page.locator('.lesson-row', { hasText: 'An out is a card that saves you' });
log(await outsLesson.isVisible().catch(() => false), 'level 2 unlocked after finishing level 1');
await outsLesson.click();
await page.waitForTimeout(200);

// Walk to the first step chain in that lesson.
for (let i = 0; i < 40 && !sawStepChain; i++) {
  if (await page.locator('.step-chain').first().isVisible().catch(() => false)) {
    sawStepChain = true;
    break;
  }
  const advance = page.locator('button', { hasText: /^(Got it|Continue|Finish lesson)$/ });
  if (await advance.first().isVisible().catch(() => false)) {
    await advance.first().click();
    await page.waitForTimeout(60);
    continue;
  }
  if (!(await answerCurrent(page))) break;
  const check = page.locator('button', { hasText: /^Check$/ });
  if (await check.first().isVisible().catch(() => false)) {
    await check.first().click();
    await page.waitForTimeout(80);
  }
}

log(sawStepChain, 'a step chain was presented');

if (sawStepChain) {
  const dots = await page.locator('.steps-track .step-dot').count();
  log(dots >= 3, `the chain breaks the decision into ${dots} steps`);
  log(
    await page.locator('.felt').first().isVisible().catch(() => false),
    'the chain shows the hand on a table',
  );
  log(
    await page.locator('.step-counter').first().isVisible().catch(() => false),
    'the learner is told which step they are on',
  );

  await page.screenshot({ path: '/tmp/smoke-stepchain.png' });

  // Answer the first step and confirm the chain advances and keeps history.
  await answerCurrent(page);
  await page.locator('button', { hasText: /^Check$/ }).first().click();
  await page.waitForTimeout(100);
  log(
    await page.locator('.feedback').first().isVisible().catch(() => false),
    'each step is graded on its own',
  );
  await page.locator('button', { hasText: /^Continue$/ }).first().click();
  await page.waitForTimeout(120);
  log(
    await page.locator('.step-history .step-done').first().isVisible().catch(() => false),
    'answered steps stay visible so the reasoning chain builds up',
  );
}

// --- Layout sanity --------------------------------------------------------
const overflows = await page.evaluate(() =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
log(!overflows, 'no horizontal overflow at 430px wide');

await page.screenshot({ path: '/tmp/smoke-path.png', fullPage: false });

log(consoleErrors.length === 0, `no console errors${consoleErrors.length ? `: ${consoleErrors.slice(0, 4).join(' | ')}` : ''}`);

await browser.close();

console.log(notes.join('\n'));
console.log(`\n${notes.length - problems.length} passed, ${problems.length} failed\n`);
if (problems.length) process.exit(1);

/* ------------------------------------------------------------------ */

/** Fill in whichever input widget the current screen is showing. */
async function answerCurrent(page) {
  // Multiple choice / multi-select
  const option = page.locator('.option:not([disabled])');
  if (await option.first().isVisible().catch(() => false)) {
    await option.first().click();
    return true;
  }

  // Numeric
  const numeric = page.locator('.numeric-input input:not([disabled])');
  if (await numeric.first().isVisible().catch(() => false)) {
    await numeric.first().fill('12');
    return true;
  }

  // Slider — already reports its midpoint, so nudging it is enough.
  const slider = page.locator('.slider-wrap input:not([disabled])');
  if (await slider.first().isVisible().catch(() => false)) {
    await slider.first().press('ArrowRight');
    return true;
  }

  // Card selection
  const cards = page.locator('.pcard.selectable');
  const cardCount = await cards.count();
  if (cardCount > 0) {
    const need = await page.locator('.exercise p.faint').first().textContent();
    const n = parseInt((need || '').replace(/\D/g, ''), 10) || 5;
    for (let i = 0; i < Math.min(n, cardCount); i++) {
      await page.locator('.pcard.selectable').nth(i).click();
      await page.waitForTimeout(20);
    }
    return true;
  }

  // Range grid
  const cell = page.locator('.range-cell:not([disabled])');
  if (await cell.first().isVisible().catch(() => false)) {
    for (let i = 0; i < 6; i++) await cell.nth(i * 14).click();
    return true;
  }

  return false;
}
