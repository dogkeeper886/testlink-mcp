# `docs/tests/` — the test-doc format

Each test is a **readable markdown document** that lives here, close to the story it verifies.
The markdown owns **why / what** (intent) — that authoring format is the contract this file
defines, shared with the `qa-workflow` commands. The bound `cicd/` YAML owns **how it runs**
(execution): `qw-bind` links them, `qw-review-bind` audits the link, and `qw-drift` watches for
divergence — all via `npm --prefix cicd/tests` (`audit-bind` / `drift` / `port-yaml`).

## One file = one scenario (TS), many cases (TC)

A **scenario** groups related **cases**, each case a sequence of **steps**.

Docs are **grouped by story**, and a scenario id restarts at `TS-01` within each story — so
`TS-01` always means "this story's first scenario", never a position in a global list.

```
docs/tests/
  STORY-001/
    TS-01-<slug>.md   # a scenario: TC-01, TC-02, … each with a Steps table
    TS-02-….md        # this story's second scenario, if it has one
  STORY-002/
    TS-01-….md
```

The directory is the story; the front-matter `story:` line still records it explicitly, because
that is what `qw-drift` reads to resolve the drift anchor. The tooling walks the tree, so a doc
must live under its story directory to be seen at all.

- **TS** (scenario) — the file. Holds the front-matter and a `## Why this scenario exists`.
- **TC** (case) — a `### TC-NN:` section. Has an objective, a **`Script:`** line (the bound
  `cicd/` YAML), and a **Steps** table.
- **Step** — one row of a case's Steps table: an **Action** and its **Expected Result**. The
  audit treats the doc's step count vs the YAML's step count as the binding check.

## Front-matter (scenario level)

```yaml
---
id: TS-01                       # scenario id, unique within its story (restarts per story)
title: The server builds, starts, and containerises
namespace: testlink-mcp         # which repo/tenant this test belongs to
story: STORY-001                # the need this scenario verifies (→ docs/stories/STORY-001.md)
story_hash: 7474d8b6…           # sha256 of the linked story file at last sync (drift anchor)
plan: 28                        # the [STORY-XXX] Test Plan issue it was authored from (optional)
issue: 107                      # the issue this doc was written under (optional)
status: green                   # green | stale | unbound  (maintained by qw-drift)
---
```

- `story` + `story_hash` are the **drift anchor**: when the story changes, its hash no longer
  matches and `qw-drift` flags the scenario `stale`.
- The **`Script:` binding is per-TC, not in front-matter** — a scenario's cases can map to
  different executables.

## Case (TC) structure

```markdown
### TC-01: Project build verification

- **Objective:** the server compiles from a clean checkout.
- **Script:** cicd/tests/testcases/s1-build-deploy/TC-S1-001.yml
- **Preconditions:** Node 20+ and npm available.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Check Node.js version (`node --version`) | prints `vNN.NN.NN` |
| 2 | Install dependencies (`npm ci`) | completes without `ERR!` |
```

The Steps table is **machine-extractable** on purpose: one row = one `Action → Expected Result`,
and the row count is what `audit-bind` compares to the YAML's `steps:`.

A cell may contain a literal pipe — escape it as `\|` (a regex alternation like `ok\|healthy`,
a shell `... \|\| echo`), so the parser still reads the row as three cells.

## Binding, running, drift

- **Bind** (`qw-bind`): set each TC's `Script:` to the `cicd/tests/testcases/**/*.yml` that runs
  it. Or revert: `npm --prefix cicd/tests run port-yaml -- <yaml>` scaffolds a doc from a YAML.
- **Audit** (`qw-review-bind`): `npm --prefix cicd/tests run audit-bind` — the `Script:` resolves
  and the step counts match, else `unbound`.
- **Run**: `npm --prefix cicd/tests test` (the dual-judge runner).
- **Drift** (`qw-drift`): `npm --prefix cicd/tests run drift` — `stale` if `story_hash` no longer
  matches the story; `unbound` if a doc and its script diverged. Exits non-zero on either, and
  warns when it checked nothing.

## This repo's flow is connected — mind the ordering

Unlike an independent suite, the `cicd/tests/testcases/` YAMLs are **one lifecycle**: fixtures
are provisioned in `s2` and threaded through `s7`'s teardown via `/tmp/tl-flow/`. A doc describes
its case's intent; it does **not** license running that case standalone. See
`.claude/skills/agent-runner-flow/SKILL.md`.

## Traceability

- **story → tests:** `grep -l 'story: STORY-XXX' docs/tests/`
- **test → story / script:** the front-matter `story:` and each case's `Script:` line.
- **test → plan:** the front-matter `plan:` line (the `[STORY-XXX] Test Plan` issue number).
- **script → test:** the `Script:` path points at the YAML.

No hand-maintained index — the links live in the files and resolve by `grep`/path.
