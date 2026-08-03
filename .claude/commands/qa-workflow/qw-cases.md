# Write the Test Docs

```
Turn a reviewed test plan into readable test docs in docs/tests/ — reusing vetted
steps from the store instead of re-inventing them.

Target: the scenarios approved by /qw-review-plan for a STORY-XXX.

## PURPOSE

The authoring producer of the qa-workflow — the test analogue of `dw-implement`.
Writes each planned scenario as a `docs/tests/TS-*.md` doc in the format contract
(docs/tests/README.md): front-matter + cases, each case a Steps table of
Action / Expected Result rows.

Fits in the qa-workflow:

    qw-plan → qw-review-plan → qw-cases → qw-review-cases → qw-bind → qw-run
    (qw-run = `make up` + the cicd runner — a phase, not a slash command)

---

## WORKFLOW

    /qw-cases STORY-003
        │
        ├─► Step 1: One file per scenario
        │   - Create docs/tests/TS-NN-<slug>.md with front-matter:
        │       id, title, namespace, story (+ the drift anchor the profile declares),
        │       issue, status: green
        │   - (Format and field meanings: docs/tests/README.md.)
        │
        ├─► Step 2: Write each case (TC) — reuse before re-inventing (dogfood the store)
        │   - For each step you are about to write, ask the store first:
        │       make query Q="<the action you mean>"
        │     If a vetted step comes back close, phrase yours to match it — same
        │     meaning, same good expected result — instead of coining a new one.
        │   - Fill the Steps table: each row one Action + its Expected Result.
        │
        ├─► Step 3: Index + bind
        │   - Load the new docs into the store:  npm --prefix step-store run load-tests
        │   - Bind each case to its executable:  /qw-bind  (then /qw-review-bind)
        │
        └─► Step 4: Hand off
            - Run `/qw-review-cases` to gate the docs.

---

## OUTPUT

The test docs written. Trace carries each doc's path. Reported per
`.claude/rules/agent-report.md` — the verdict first, and a section with nothing to
report says so.


---

## API Notes

- Reuse is the point of the store: `search_step` (via `make query`) makes a vetted
  step findable so coverage converges instead of duplicating.
- Drift anchor: record whatever the profile declares, so a later gate can tell the story
  has moved (default here: `story_hash`, the `sha256sum` of the story file — what `qw-drift`
  reads). A project that detects drift another way declares that instead.
- Producer paired with `/qw-review-cases`.
```
