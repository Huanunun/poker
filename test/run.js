/**
 * Zero-dependency test runner.
 *
 * The engine is the part of this project allowed to have exactly one right
 * answer, so it gets tested hard. Curriculum content is checked for structural
 * integrity: every lesson reachable, every exercise generator producing a
 * solvable question.
 */

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { results } from './harness.js';

const here = dirname(fileURLToPath(import.meta.url));

const files = readdirSync(here)
  .filter((f) => f.endsWith('.test.js'))
  .sort();

for (const f of files) {
  await import(join(here, f));
}

console.log(`\n${results.passed} passed, ${results.failed} failed\n`);

if (results.failed) {
  for (const f of results.failures) {
    console.log(`\x1b[31m${f.suite} > ${f.name}\x1b[0m`);
    console.log(f.err.stack?.split('\n').slice(0, 4).join('\n'));
  }
  process.exit(1);
}
