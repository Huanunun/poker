/**
 * Prove the standalone build works with no network at all.
 *
 * "It has no external references" is a claim about the source. This is the
 * claim about the artefact: the browser is put into offline mode, every
 * http(s) request is aborted and recorded, and the page is opened from a
 * file:// URL and driven through a real session. If anything reaches for the
 * network, or the page lands in quirks mode, this fails.
 *
 *   node tools/verify-offline.js
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const FILE = resolve(fileURLToPath(new URL('../dist/holdem-dojo.html', import.meta.url)));
const URL_ = `file://${FILE}`;

const problems = [];
const notes = [];
const log = (ok, msg) => {
  notes.push(`${ok ? '  \x1b[32m✓\x1b[0m' : '  \x1b[31m✗\x1b[0m'} ${msg}`);
  if (!ok) problems.push(msg);
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });

// Hard offline: the context refuses network, and any attempt is recorded.
await context.setOffline(true);
const attempted = [];
await context.route('**/*', (route) => {
  const url = route.request().url();
  if (url.startsWith('file://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return route.continue();
  }
  attempted.push(url);
  return route.abort();
});

const page = await context.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

console.log("\n\x1b[1moffline verification — dist/holdem-dojo.html\x1b[0m");

await page.goto(URL_, { waitUntil: 'load' });

log(await page.locator('.brand').isVisible(), 'the page loads from disk with the network off');

const mode = await page.evaluate(() => document.compatMode);
log(mode === 'CSS1Compat', `renders in standards mode, not quirks (${mode})`);

const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
log(bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent', `body paints its own background (${bg})`);

log((await page.locator('.hero h1').textContent())?.length > 0, 'the first lesson is offered');

// Drive a real session so the engine, generators and grading all execute.
await page.locator('.hero button').click();
await page.waitForTimeout(200);

let answered = 0;
for (let i = 0; i < 260; i++) {
  if (await page.locator('.summary-big').first().isVisible().catch(() => false)) break;

  const advance = page.locator('button', { hasText: /^(Got it|Continue|Finish lesson)$/ });
  if (await advance.first().isVisible().catch(() => false)) {
    await advance.first().click();
    await page.waitForTimeout(40);
    continue;
  }
  const option = page.locator('.option:not([disabled])');
  const numeric = page.locator('.numeric-input input:not([disabled])');
  const slider = page.locator('.slider-wrap input:not([disabled])');
  const cards = page.locator('.pcard.selectable');
  const gridCell = page.locator('.range-cell:not([disabled])');

  if (await option.first().isVisible().catch(() => false)) {
    await option.first().click();
    answered++;
  } else if (await numeric.first().isVisible().catch(() => false)) {
    await numeric.first().fill('47');
    answered++;
  } else if (await slider.first().isVisible().catch(() => false)) {
    await slider.first().press('ArrowRight');
    answered++;
  } else if (await cards.count() > 0) {
    for (let n = 0; n < 5; n++) await cards.nth(n).click();
    answered++;
  } else if (await gridCell.first().isVisible().catch(() => false)) {
    for (let n = 0; n < 6; n++) await gridCell.nth(n * 14).click();
    answered++;
  } else {
    break;
  }
  const check = page.locator('button', { hasText: /^Check$/ });
  if (await check.first().isVisible().catch(() => false)) {
    await check.first().click();
    await page.waitForTimeout(50);
  }
}

log(answered >= 4, `answered ${answered} questions offline`);
log(
  await page.locator('.summary-big').first().isVisible().catch(() => false),
  'a full session completes offline',
);

// Leave the session — the nav is deliberately hidden while one is running.
const done = page.locator('button', { hasText: 'Done for today' });
if (await done.isVisible().catch(() => false)) await done.click();
else await page.locator('.player-head button').first().click();
await page.waitForTimeout(200);

// The equity engine is the heaviest computation; confirm it runs here too.
await page.locator('.nav button', { hasText: 'Sandbox' }).click();
await page.waitForTimeout(300);
const eq = await page.locator('.readout-value').first().textContent();
const eqValue = parseFloat(eq);
log(eqValue > 40 && eqValue < 50, `the equity engine computes offline (AcKc vs QQ = ${eq})`);

log(attempted.length === 0, attempted.length
  ? `attempted ${attempted.length} network requests: ${attempted.slice(0, 3).join(', ')}`
  : 'made zero network requests');
log(errors.length === 0, errors.length ? `console errors: ${errors.slice(0, 3).join(' | ')}` : 'no console errors');

await page.screenshot({ path: '/tmp/offline-desktop.png' });
await browser.close();

console.log(notes.join('\n'));
console.log(`\n${notes.length - problems.length} passed, ${problems.length} failed\n`);
if (problems.length) process.exit(1);
