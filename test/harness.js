/**
 * Assertions and result collection.
 *
 * Kept separate from run.js so test files can import it without creating a
 * cycle with the runner that imports them.
 */

export const results = { passed: 0, failed: 0, failures: [] };
let currentSuite = '';

export function suite(name) {
  currentSuite = name;
  console.log(`\n\x1b[1m${name}\x1b[0m`);
}

export function test(name, fn) {
  try {
    fn();
    results.passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    results.failed++;
    results.failures.push({ suite: currentSuite, name, err });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`      \x1b[31m${err.message}\x1b[0m`);
  }
}

export function assert(condition, message = 'assertion failed') {
  if (!condition) throw new Error(message);
}

export function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertClose(actual, expected, tolerance = 0.01, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message} expected ${expected} +/- ${tolerance}, got ${actual}`);
  }
}

export function assertDeep(actual, expected, message = '') {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${message} expected ${b}, got ${a}`);
}

export function assertThrows(fn, message = 'expected a throw') {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message);
}
