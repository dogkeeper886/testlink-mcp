/**
 * STORY-004 #25: port an existing cicd YAML into a markdown test-doc scaffold.
 *
 * The "revert direction" — bootstrap a human-readable test doc *from* an
 * executable that already exists, so the in-repo apparatus gets its canonical
 * half without re-authoring it. The output is a scaffold: it carries the steps
 * and the `Script:` binding; the objective, expected results, and story link
 * are TODOs for a human/agent to fill, then `qw-review-bind` audits the result.
 *
 * Run: npm run port-yaml -- cicd/tests/testcases/build/TC-BUILD-001.yml > docs/tests/TS-NN-slug.md
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');  // cicd/tests/src → repo root

const rel = process.argv[2];
if (!rel) {
  console.error('usage: npm run port-yaml -- <repo-relative/path/to/TC-*.yml>');
  process.exit(2);
}
// Accept a repo-relative path (the `Script:` form) regardless of cwd.
const yaml = readFileSync(isAbsolute(rel) ? rel : join(REPO_ROOT, rel), 'utf8');

const name = yaml.match(/^name:\s*(.*)$/m)?.[1]?.trim() ?? 'Ported scenario';

// Each step starts at `  - name:`; its block runs to the next step or EOF.
// Escape pipes so a cell containing `|` (a regex alternation, a shell `||`)
// stays one cell when the doc is parsed back (testdoc.tableCells).
const esc = (s: string) => s.replace(/\|/g, '\\|');

const stepRe = /^\s*-\s+name:\s*(.*)$/gm;
const marks = [...yaml.matchAll(stepRe)];
const rows = marks.map((m, i) => {
  const start = m.index! + m[0].length;
  const end = i + 1 < marks.length ? marks[i + 1].index! : yaml.length;
  const block = yaml.slice(start, end);
  const command = block.match(/^\s*command:\s*(.*)$/m)?.[1]?.trim();
  const expect = block.match(/expectPatterns:\s*\n\s*-\s*"?([^"\n]+)"?/)?.[1]?.trim();
  const action = command ? `${m[1].trim()} (\`${command}\`)` : m[1].trim();
  return `| ${i + 1} | ${esc(action)} | ${esc(expect ?? 'TODO')} |`;
});

process.stdout.write(`---
id: TS-NN
title: ${name}
namespace: TODO
story: STORY-NNN
issue: TODO
status: unbound
story_hash: TODO
---

## Why this scenario exists

TODO: link this to the story's need.

### TC-01: ${name}

- **Objective:** TODO
- **Script:** ${rel}
- **Preconditions:** TODO

| # | Action | Expected Result |
|---|--------|-----------------|
${rows.join('\n')}
`);
