/**
 * STORY-004 #27: the freshness gate — surface tests that no longer match.
 *
 * Drift is silent until something checks. Two deterministic signals, per the
 * qa-workflow design:
 *   - STALE   — the linked story changed since the test was last synced
 *               (its sha256 no longer matches the doc's `story_hash`).
 *   - UNBOUND — the doc and its bound executable have diverged (reuses the
 *               #25 audit, audit-bind.ts).
 * Exits non-zero if any test is stale or unbound, so CI fails on drift and a
 * green build means "these tests still match their stories".
 *
 * (Hash-first is deterministic and needs no stack. A semantic, embedding-based
 * signal — softer "drifted in meaning" — is a later, advisory add.)
 *
 * Run: npm run drift
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readScenario, scenarioFiles } from './testdoc.js';
import { auditBindings } from './audit-bind.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');  // cicd/tests/src → repo root
const TESTS_DIR = join(REPO_ROOT, 'docs', 'tests');

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

interface Stale {
  doc: string;
  detail: string;
}

/** Flag every scenario whose linked story has moved since last sync. */
function staleDocs(): Stale[] {
  const stale: Stale[] = [];
  for (const f of scenarioFiles(TESTS_DIR)) {
    const { frontMatter: fm } = readScenario(join(TESTS_DIR, f));
    const story = fm.story;
    if (!story) {
      stale.push({ doc: f, detail: 'no story: link' });
      continue;
    }
    const storyFile = join(REPO_ROOT, 'docs', 'stories', `${story}.md`);
    if (!existsSync(storyFile)) {
      stale.push({ doc: f, detail: `story file missing: docs/stories/${story}.md` });
      continue;
    }
    const have = sha256(storyFile);
    if (fm.story_hash !== have) {
      stale.push({ doc: f, detail: `${story} changed since sync (re-check, then update story_hash)` });
    }
  }
  return stale;
}

const docCount = scenarioFiles(TESTS_DIR).length;
const stale = staleDocs();
const unbound = auditBindings().filter((b) => !b.bound);

for (const s of stale) console.log(`STALE    ${s.doc} — ${s.detail}`);
for (const u of unbound) console.log(`UNBOUND  ${u.doc} ${u.tc} — ${u.detail}`);

// A clean run over zero docs is "nothing checked", not "all good" — surface it.
if (docCount === 0) console.log('WARNING: no test docs in docs/tests/ — the drift gate checked nothing.');

const problems = stale.length + unbound.length;
console.log(`\n${docCount} doc(s): ${stale.length} stale, ${unbound.length} unbound`);
if (problems === 0) console.log('drift check clean — tests still match their stories.');
process.exit(problems > 0 ? 1 : 0);
