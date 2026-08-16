import { suite, test, assert, assertEqual } from './harness.js';
import { GENERATORS, generate, grade, questionCount } from '../src/learn/exercises.js';
import { SKILL_BY_ID, validateGraph } from '../src/learn/skills.js';

suite('skill graph');

test('every prerequisite exists and there are no cycles', () => {
  const problems = validateGraph();
  assertEqual(problems.length, 0, problems.join('; '));
});

suite('exercise generators');

const ids = Object.keys(GENERATORS);

test('there are enough generators to cover a long course', () => {
  assert(ids.length >= 20, `only ${ids.length} generators`);
});

/**
 * The important property: an exercise must be answerable and gradeable. A
 * generator that produces a question with no correct answer, or one where the
 * stated answer would be marked wrong, silently teaches the wrong thing.
 */
test('every generator produces well-formed, self-consistent exercises across many seeds', () => {
  const problems = [];

  for (const id of ids) {
    for (let seed = 1; seed <= 40; seed++) {
      let ex;
      try {
        ex = generate(id, seed * 7919);
      } catch (err) {
        problems.push(`${id} seed ${seed} threw: ${err.message}`);
        continue;
      }

      if (!ex.skill) problems.push(`${id} has no skill`);
      if (!SKILL_BY_ID[ex.skill]) problems.push(`${id} references unknown skill ${ex.skill}`);
      if (!ex.prompt) problems.push(`${id} seed ${seed} has no prompt`);
      if (!ex.explain.length) problems.push(`${id} seed ${seed} has no explanation`);

      const items = ex.kind === 'steps' ? ex.steps : [ex];
      if (ex.kind === 'steps' && items.length < 2) {
        problems.push(`${id} is a step chain with fewer than 2 steps`);
      }

      for (const [i, item] of items.entries()) {
        const where = `${id} seed ${seed} item ${i}`;
        if (!item.prompt) problems.push(`${where} has no prompt`);

        switch (item.kind) {
          case 'choice': {
            if (!Array.isArray(item.options) || item.options.length < 2) {
              problems.push(`${where} needs at least two options`);
              break;
            }
            if (typeof item.answer !== 'number' || item.answer < 0 || item.answer >= item.options.length) {
              problems.push(`${where} answer index ${item.answer} out of range`);
              break;
            }
            if (new Set(item.options).size !== item.options.length) {
              problems.push(`${where} has duplicate options: ${JSON.stringify(item.options)}`);
            }
            if (!grade(item, item.answer).correct) problems.push(`${where} does not grade its own answer as correct`);
            if (grade(item, (item.answer + 1) % item.options.length).correct) {
              problems.push(`${where} grades a wrong answer as correct`);
            }
            break;
          }
          case 'numeric':
          case 'slider': {
            if (typeof item.answer !== 'number' || Number.isNaN(item.answer)) {
              problems.push(`${where} has a non-numeric answer: ${item.answer}`);
              break;
            }
            if (!grade(item, item.answer).correct) problems.push(`${where} rejects its own answer`);
            const far = item.answer + (item.tolerance ?? 0) + 100;
            if (grade(item, far).correct) problems.push(`${where} accepts a wildly wrong answer`);
            break;
          }
          case 'multi': {
            if (!Array.isArray(item.answer)) problems.push(`${where} multi answer is not an array`);
            else if (!grade(item, item.answer).correct) problems.push(`${where} rejects its own answer`);
            break;
          }
          case 'cards': {
            if (!Array.isArray(item.answer) || item.answer.length !== item.selectCount) {
              problems.push(`${where} card answer length does not match selectCount`);
              break;
            }
            for (const c of item.answer) {
              if (!item.pool.includes(c)) problems.push(`${where} answer card is not in the pool`);
            }
            if (!grade(item, item.answer).correct) problems.push(`${where} rejects its own answer`);
            break;
          }
          case 'grid': {
            if (!Array.isArray(item.answer) || !item.answer.length) {
              problems.push(`${where} grid answer is empty`);
              break;
            }
            if (!grade(item, item.answer).correct) problems.push(`${where} rejects its own answer`);
            break;
          }
          default:
            problems.push(`${where} has unknown kind ${item.kind}`);
        }
      }
    }
  }

  assertEqual(problems.length, 0, `\n      ${[...new Set(problems)].slice(0, 25).join('\n      ')}\n`);
});

test('the same seed always produces the same exercise', () => {
  for (const id of ids) {
    const a = generate(id, 4242);
    const b = generate(id, 4242);
    assertEqual(JSON.stringify(a), JSON.stringify(b), `${id} is not reproducible`);
  }
});

test('different seeds produce different exercises', () => {
  for (const id of ids) {
    const variants = new Set();
    for (let s = 1; s <= 12; s++) variants.add(JSON.stringify(generate(id, s * 1013)));
    assert(variants.size > 1, `${id} produces the same exercise for every seed`);
  }
});

test('step chains ask several small questions rather than one big one', () => {
  const chains = ids.map((id) => generate(id, 55)).filter((e) => e.kind === 'steps');
  assert(chains.length >= 6, `expected several step chains, found ${chains.length}`);
  for (const c of chains) {
    assert(c.steps.length >= 3, `${c.generator} chain is too short`);
    for (const s of c.steps) {
      assert(s.hint, `${c.generator} step is missing a hint`);
      assert(s.explain, `${c.generator} step is missing an explanation`);
    }
  }
});

test('grading a whole step chain scores each step', () => {
  const chain = ids.map((id) => generate(id, 91)).find((e) => e.kind === 'steps');
  const answers = chain.steps.map((s) => s.answer);
  const result = grade(chain, answers);
  assert(result.correct, 'a fully correct chain should grade as correct');
  assertEqual(result.score, 1);

  const wrong = grade(chain, chain.steps.map(() => -999));
  assert(!wrong.correct);
  assertEqual(wrong.score, 0);
});

test('question counts are sane for session budgeting', () => {
  for (const id of ids) {
    const n = questionCount(generate(id, 17));
    assert(n >= 1 && n <= 8, `${id} reports ${n} questions`);
  }
});
