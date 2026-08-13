# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Dev & QA workflow discipline

Substantial work flows through a gated pipeline — each step stops for a human decision,
and a command suggests the next rather than auto-running it. **This repo no longer owns
any of it.** The work is split across three installed sources:

| Source | Covers | Doctrine |
|--------|--------|----------|
| `mattpocock/skills` | **idea → commit**: `/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement`, `/code-review-2axis`. Ends at *"commit your work to the current branch"*. | — |
| `agent-workflows` | **commit → merge** (the ship tail): `reviewing-finish` → `/ship-create-pr` → `/ship-merge`. Plus the `doc-*` pair and the report contract. | its `rules/ship-tail.md`, `rules/agent-report.md`, `rules/doc-workflow.md` |
| `agent-workflows-runner` | the **QA lifecycle** — plan → author → bind → audit, as `qa-*` | its `rules/qa-workflow.md` |

Read the flow and the producer→review pairing from those rules — don't restate them here,
and don't copy a plugin command back into `.claude/`. A local fork shadows the installed
copy and goes stale silently; that is exactly what this repo just cleaned up.

**There is no `dw-*` pipeline any more.** `agent-workflows` deleted those seven commands
rather than compete with `mattpocock/skills`, and renamed the two that survived —
`dw-create-pr` → `/ship-create-pr`, `dw-merge` → `/ship-merge`. **The QA commands are
`qa-*`, not `qw-*`**; the runner renamed those. Older `docs/stories/` entries still say
`dw-tasks`, `qw-bind`, `qw-drift` — those records describe what was true when written.

**The plugins load live from a directory source**, not a version-pinned cache
(`~/.claude/settings.json` → `extraKnownMarketplaces`). Editing the plugin repo changes
this project's commands immediately, and a stale cache is not what you are reading. Check
the source tree, not `~/.claude/plugins/cache/`, when you need to know what a plugin ships.

**What this repo still owns**, because no plugin ships it:
- `/dw-test-design` (`.claude/commands/dw-test-design.md`) — its review is running the suite.
- the four `testlink-*` skills — see §6 and `.claude/rules/testlink-authoring.md`.
- `.claude/rules/project-profile.md` — this project's *values*, which every plugin command
  resolves. Values live here; doctrine travels in the plugins.

The rule of thumb for `.claude/commands/`: **a command here is one no plugin ships.**

One review gate is an external builtin no toolkit owns — invoke it by hand:
- `/review` (builtin): PR overview. Run before the merge gate.

**Right-size it.** A typo or a one-line doc change does not need the full chain —
use judgment; branch + PR + merge is enough. The review passes overlap: the
implementation review is the always-on substance gate, `/review` is the PR summary.
Running both on a trivial diff is ritual, not rigor.

## 6. Artifact & doc review discipline

Match the reviewer to **who reads** the file you changed:

- **Human-read docs** (README, `docs/` prose): run `reviewing-phrasing` (the words)
  + `reviewing-typography` (the look) — the human-read doc review.
- **Agent-read tooling** (commands, skills, CLAUDE.md, rules): run
  `reviewing-artifacts` (does it do its job — one job, complete, goal-not-spec,
  fits the project, right for its reader).

These ship from the `agent-workflows` plugin. Like the pipeline gates, they stop for a
human and never auto-run — invoke them by hand.

**TestLink content has its own pair**, owned here: `testlink-sync` writes it,
`testlink-review` reads it back, `testlink-format` is the markup reference.

**Right-size it.** A typo or a one-line tweak does not need a review pass — use
judgment. Reach for these when a change is substantial enough that the look, the
wording, or the artifact's fitness actually matters.

## Agent skills

Where the engineering skills read this repo's specifics. These are **values**, like
`.claude/rules/project-profile.md` — edit the files, not the skills.

### Issue tracker

GitHub Issues on `dogkeeper886/testlink-mcp`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
