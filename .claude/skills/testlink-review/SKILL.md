---
name: testlink-review
description: |
  Reviews a TestLink change after the fact to confirm it achieved the user's goal
  — the right entities exist, fields are correct and well-formed, and the source
  document is faithfully represented. Use after testlink-sync or any manual
  create/update in TestLink, before calling the work done. The review gate paired
  with testlink-sync.
disable-model-invocation: true
tools:
  - testlink-mcp:list_projects
  - testlink-mcp:list_test_suites
  - testlink-mcp:list_test_cases_in_suite
  - testlink-mcp:read_test_case
  - testlink-mcp:get_test_cases_for_test_plan
  - testlink-mcp:list_requirements
  - testlink-mcp:list_builds
---

# testlink-review

After content is written to TestLink, verify it actually did what the user asked.
Don't trust the write call's success — read it back. Pairs with `testlink-sync`
the way a code review pairs an implementation.

## What you need

- The **goal** — what the user wanted (the source document, or their request).
- What was **changed** — the entities and IDs `testlink-sync` (or a manual edit)
  reported.

## Checks

1. **Exists** — read each entity back (`read_test_case`, `list_test_cases_in_suite`,
   `get_test_cases_for_test_plan`, `list_requirements`). Every entity the goal
   requires is present, under the expected name.
2. **Correct** — fields match the source: name, summary, preconditions, steps
   (actions + expected results), importance, suite placement, plan assignment. No
   truncation, no missing preconditions.
3. **Well-formed** — rich-text fields render as HTML, not a literal `<p>` shown as
   text or `\n` artifacts; lists are real `<ul><li>`. (See `testlink-format`.)
4. **Complete** — counts match: every scenario in the document has a case; every
   case meant for the plan is assigned; nothing extra or duplicated.
5. **Connected** — requirements link to cases, cases sit in the right suite, cases
   are in the plan, the plan has a build — the graph the goal implied.

## Verdict

- **PASS** — every check holds; state what was verified and the IDs.
- **FIX** — list each gap as `entity → what's wrong → the smallest correction`,
  then hand back to `testlink-sync` (or fix the specific field).

Read back, don't assume. A create/update call returning an ID is not proof the
field landed correctly — verify the content.
