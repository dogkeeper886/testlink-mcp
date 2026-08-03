/**
 * STORY-004 #25: audit that each test doc and its bound executable agree.
 *
 * Binding is *audit, not codegen* (#21): the markdown owns intent, the cicd YAML
 * owns execution. This checks, per case (TC), that the binding still holds:
 *   - the `Script:` path resolves to a file, and
 *   - the doc's step count matches the YAML's step count (a structural drift
 *     signal — if the executable gains/loses steps without the doc following,
 *     the pair has diverged).
 * A case that fails is `unbound`. Exits non-zero if any case is unbound, so CI
 * (and the drift gate, #27) can gate on it.
 *
 * Run: npm run audit-bind
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readScenario, scenarioFiles } from './testdoc.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');  // cicd/tests/src → repo root
const TESTS_DIR = join(REPO_ROOT, 'docs', 'tests');

export interface BindFinding {
  doc: string;
  tc: string;
  bound: boolean;
  detail: string;
}

/**
 * Count step entries (`- name:`) inside the top-level `steps:` block of a cicd
 * YAML — anchored to `steps:` so a `- name:` under some other list (a future
 * `matrix:`, `hooks:`, …) doesn't inflate the count.
 *
 * This is a structural signal: equal counts mean "same number of steps", not
 * "same steps" — a count-preserving edit (swap/reorder) stays `bound`. That is
 * the floor for an audit-not-codegen design; semantic agreement is the
 * reviewer's job in /qw-review-bind.
 */
function yamlStepCount(path: string): number {
  let inSteps = false;
  let n = 0;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (/^steps:\s*$/.test(line)) { inSteps = true; continue; }
    if (inSteps && /^\S/.test(line)) inSteps = false; // dedent to the next top-level key
    if (inSteps && /^\s*-\s+name:/.test(line)) n++;
  }
  return n;
}

/** Audit every case in every docs/tests/ scenario; returns one finding per case. */
export function auditBindings(): BindFinding[] {
  const findings: BindFinding[] = [];
  for (const f of scenarioFiles(TESTS_DIR)) {
    const { cases } = readScenario(join(TESTS_DIR, f));
    for (const c of cases) {
      if (!c.script) {
        findings.push({ doc: f, tc: c.tc, bound: false, detail: 'no Script: binding' });
        continue;
      }
      const scriptPath = join(REPO_ROOT, c.script);
      if (!existsSync(scriptPath)) {
        findings.push({ doc: f, tc: c.tc, bound: false, detail: `script not found: ${c.script}` });
        continue;
      }
      const docN = c.steps.length;
      const yamlN = yamlStepCount(scriptPath);
      if (docN !== yamlN) {
        findings.push({
          doc: f, tc: c.tc, bound: false,
          detail: `step count diverged: doc=${docN} vs ${c.script}=${yamlN}`,
        });
        continue;
      }
      findings.push({ doc: f, tc: c.tc, bound: true, detail: `${docN} steps ↔ ${c.script}` });
    }
  }
  return findings;
}

// Run as a script: print findings, exit non-zero if anything is unbound.
if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = auditBindings();
  for (const f of findings) {
    console.log(`${f.bound ? 'bound  ' : 'UNBOUND'}  ${f.doc} ${f.tc} — ${f.detail}`);
  }
  const unbound = findings.filter((f) => !f.bound).length;
  console.log(`\n${findings.length} case(s), ${unbound} unbound`);
  process.exit(unbound > 0 ? 1 : 0);
}
