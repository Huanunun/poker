/**
 * Flatten the app into one self-contained HTML file.
 *
 * The app is written as ES modules, which is right for reading and testing but
 * needs a server to run. This produces a single page that opens from anywhere —
 * a file:// double-click, an email attachment, a static host — with the CSS and
 * every module inlined and no external requests at all.
 *
 * Each module is wrapped in its own IIFE that returns its exports, rather than
 * having the sources concatenated. Concatenation would leak every top-level
 * name into one scope, where `describe`, `equity`, `round` and `strength` would
 * collide across modules and the failures would be silent.
 *
 *   node tools/bundle.js        writes dist/holdem-dojo.html
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ENTRY = join(ROOT, 'src/ui/app.js');
const CSS = join(ROOT, 'src/ui/styles.css');
const OUT = join(ROOT, 'dist/holdem-dojo.html');

const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;
const SIDE_EFFECT_IMPORT_RE = /import\s*['"]([^'"]+)['"]\s*;?/g;

/** Turn a file path into a safe JS identifier. */
const moduleId = (path) => `__m_${relative(ROOT, path).replace(/[^a-zA-Z0-9]/g, '_')}`;

const modules = new Map();

async function collect(path) {
  if (modules.has(path)) return modules.get(path);

  const source = await readFile(path, 'utf8');
  const record = { path, source, deps: [], imports: [], exports: [] };
  modules.set(path, record);

  for (const match of source.matchAll(IMPORT_RE)) {
    const [, names, specifier] = match;
    if (!specifier.startsWith('.')) {
      throw new Error(`${relative(ROOT, path)} imports a bare specifier "${specifier}"; the bundle only supports relative imports.`);
    }
    const depPath = resolve(dirname(path), specifier);
    record.deps.push(depPath);
    record.imports.push({ depPath, names: parseNames(names) });
    await collect(depPath);
  }

  for (const match of source.matchAll(SIDE_EFFECT_IMPORT_RE)) {
    throw new Error(`${relative(ROOT, path)} has a side-effect import of "${match[1]}", which the bundle does not handle.`);
  }

  record.exports = findExports(source);
  return record;
}

function parseNames(list) {
  return list
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => {
      const [original, alias] = n.split(/\s+as\s+/).map((s) => s.trim());
      return { original, local: alias || original };
    });
}

function findExports(source) {
  const names = new Set();
  for (const m of source.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s+class\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]*)\}\s*;?/g)) {
    for (const { local } of parseNames(m[1])) names.add(local);
  }
  if (/export\s+default/.test(source)) {
    throw new Error('default exports are not supported by the bundle');
  }
  return [...names];
}

/** Strip module syntax, leaving plain statements. */
function stripModuleSyntax(source) {
  return source
    .replace(IMPORT_RE, '')
    .replace(/export\s*\{[^}]*\}\s*;?/g, '')
    .replace(/^([ \t]*)export\s+/gm, '$1');
}

/** Depth-first post-order, so a module is emitted after everything it needs. */
function order(entryPath) {
  const sorted = [];
  const state = new Map();

  const visit = (path, stack) => {
    const status = state.get(path);
    if (status === 'done') return;
    if (status === 'visiting') {
      const cycle = [...stack, path].map((p) => relative(ROOT, p)).join(' -> ');
      throw new Error(`circular import: ${cycle}`);
    }
    state.set(path, 'visiting');
    for (const dep of modules.get(path).deps) visit(dep, [...stack, path]);
    state.set(path, 'done');
    sorted.push(path);
  };

  visit(entryPath, []);
  return sorted;
}

function emit(record, isEntry) {
  const id = moduleId(record.path);
  const lines = [];

  for (const { depPath, names } of record.imports) {
    if (!names.length) continue;
    const bindings = names
      .map(({ original, local }) => (original === local ? original : `${original}: ${local}`))
      .join(', ');
    lines.push(`  const { ${bindings} } = ${moduleId(depPath)};`);
  }

  const body = stripModuleSyntax(record.source)
    .split('\n')
    .map((l) => (l.trim() ? `  ${l}` : l))
    .join('\n');

  const returns = record.exports.length
    ? `\n  return { ${record.exports.join(', ')} };`
    : '';

  const header = `/* ${relative(ROOT, record.path)} */`;

  if (isEntry) {
    // The entry has no exports and only needs to run.
    return `${header}\n(() => {\n${lines.join('\n')}\n${body}\n})();`;
  }
  return `${header}\nconst ${id} = (() => {\n${lines.join('\n')}\n${body}${returns}\n})();`;
}

/* ------------------------------------------------------------------ */

await collect(ENTRY);
const sorted = order(ENTRY);
const css = await readFile(CSS, 'utf8');

const script = sorted
  .map((path) => emit(modules.get(path), path === ENTRY))
  .join('\n\n');

const html = `<title>Hold'em Dojo</title>
<meta name="description" content="Learn Texas Hold'em from first principles, fifteen minutes a day.">
<style>
${css}
</style>

<div id="app" class="app"></div>

<script type="module">
/*
 * Hold'em Dojo — a complete build, generated by tools/bundle.js.
 * Source: src/engine (poker mathematics), src/learn (curriculum and
 * scheduling), src/ui (interface). Nothing here talks to a network.
 */
${script}
<\/script>
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, html, 'utf8');

const kb = (html.length / 1024).toFixed(0);
console.log(`\n  ${relative(ROOT, OUT)} — ${sorted.length} modules, ${kb} KB\n`);
for (const path of sorted) console.log(`    ${relative(ROOT, path)}`);
console.log();
