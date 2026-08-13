---
paths:
  - ".claude/commands/**/*.md"
  - ".claude/skills/**/*.md"
---

# project-profile

**This project's values** — the paths, ID schemes, labels, and formats that the workflow
commands and skills resolve instead of hardcoding. Customize a workflow by editing this
file, not the units.

The **doctrine** around it — how a unit cites this file, why a procedure never belongs
here, where a project's own units live — is the `agent-workflows` plugin's
`rules/profile-doctrine.md`. It is the same in every project and is not restated here.

---

## Paths

- stories dir: `docs/stories/`
- tests dir: `docs/tests/`
- story format contract: `docs/stories/README.md`
- test format contract: `docs/tests/README.md`

## ID schemes

- story id: `STORY-XXX` (zero-padded sequential, e.g. `STORY-001`)
- scenario id: `TS-NN`
- case id: `TC-NN`
- title prefixes: `[STORY-XXX] Plan` · `[STORY-XXX] Test Plan` · `[STORY-XXX] <task>`

## Labels

Names the workflow uses; colours where the workflow pins one (`#hex`), otherwise the
project's choice.

- plan: `plan` (`#5319e7`)
- test plan: `test-plan` (`#006b75`)
- priority: `priority:high` · `priority:medium` · `priority:low`
- type: `feature` · `enhancement` · `bug` · `docs`
- status: `status:in-progress` · `status:needs-review` · `status:blocked`
- triage state: `ready-for-agent` — applied by `/triage` to mark an issue ready to be
  worked; `/ship-merge` is its only exit. The full triage vocabulary is
  `docs/agents/triage-labels.md`.

## Linking & branch

- story back-reference (in titles/bodies): `[STORY-XXX]`
- plan back-reference (task → plan): `Part of #<plan>`
- issue closure (PR → issue): `Fixes #N` / `Closes #N`
- feature branch name: `issue-<N>-<slug>`

## Git

- default branch: *derive it* (`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`), don't assume `main`
- merge strategy: `--merge` (preserve history; switch to `--squash` only if the project requires)

## Front-matter & format contract (test docs)

- test-doc filename: `TS-NN-<slug>.md` in the tests dir
- front-matter fields: `id, title, namespace, story, plan, issue, status` — the anchor
  field tracks the drift anchor below; it is absent because that is `none`
- drift anchor: `none`. There was one — `story_hash`, the `sha256` of the story file — read
  by a `qw-drift` gate this repo owned. Both are gone: the QA lifecycle ships from the
  `agent-workflows-runner` plugin now, and that plugin has no story-drift command to record
  an anchor for. Doc↔YAML binding drift is still checked (`audit-bind`); nothing notices
  when a *story* moves underneath its tests.
- default status: `green`

## Reports

The words a gate report uses. The contract itself — the questions a report answers and
why — is the `agent-workflows` plugin's `rules/agent-report.md`; a unit resolves the
wording from here.

- verdict vocabulary: `PASS` · `REVISE` · `HAND BACK`
- extra verdict (artifact review only): `CUT` — the artifact duplicates another or does
  nothing useful; propose removal
- section names: `Verdict` · `Findings` · `Checked` · `Not done` · `Unresolved` ·
  `Trace` · `Next`
- empty-section marker: `none` (a section with nothing to report says so; it is not dropped)
- finding columns: `# · severity · location · what's wrong · smallest fix`
- formats by medium: chat session → plain text, tables, ASCII diagrams · document or
  issue → whatever renders there.

## Review semantics

- canonical format (source of truth): `markdown`
- live integrations: `GitHub` — tools the project genuinely uses; coupling to one
  listed here is correct, not drift. (A downstream adds its own, e.g. Jira, Confluence,
  TestLink.)
- deliverable (triggers a paired review): a unit that *produces or changes* an output —
  by name (`create-`/`sync-`/`publish-`/`draft-`/`init-`) or as a producing gerund skill
  (`planning-…`, `drafting-…`)
- audience (human-read docs): engineers and newcomers
