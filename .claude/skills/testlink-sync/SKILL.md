---
name: testlink-sync
description: |
  Reads a source document — a spec, a GitHub issue, a markdown test-case file, a
  folder of them — and creates or updates the matching content in TestLink:
  requirements, test suites, test plans, builds, and test cases. Use when a QA
  engineer wants to import, sync, upload, or push content into TestLink from a
  document. Pairs with testlink-review (verify) and testlink-format (markup).
disable-model-invocation: true
tools:
  - testlink-mcp:list_projects
  - testlink-mcp:list_test_suites
  - testlink-mcp:create_test_suite
  - testlink-mcp:update_test_suite
  - testlink-mcp:list_test_cases_in_suite
  - testlink-mcp:create_test_case
  - testlink-mcp:update_test_case
  - testlink-mcp:read_test_case
  - testlink-mcp:list_requirements
  - testlink-mcp:create_requirement
  - testlink-mcp:create_requirement_specification
  - testlink-mcp:assign_requirements
  - testlink-mcp:create_test_plan
  - testlink-mcp:add_test_case_to_test_plan
  - testlink-mcp:get_test_cases_for_test_plan
  - testlink-mcp:create_build
---

# testlink-sync

Turn a **document** into **TestLink content**. The document is the source of
truth; TestLink is brought into line with it — create what's missing, update what
differs, skip what already matches. Format every rich-text field per the
`testlink-format` skill.

## Source documents

Anything that describes test intent: a markdown test-case file or folder, a
requirements spec, a GitHub issue's acceptance criteria, a design doc. Map the
document's structure onto TestLink entities.

## Entities you can write

| Document content | TestLink entity | Tools |
|---|---|---|
| Product / area under test | project (target — usually already exists) | `list_projects` to confirm |
| Requirement / acceptance criterion | requirement (+ spec) | `create_requirement_specification`, `create_requirement`, `assign_requirements` |
| Group of scenarios | test suite (nestable) | `create_test_suite`, `update_test_suite` |
| A scenario | test case | `create_test_case`, `update_test_case` |
| Execution target | test plan + build | `create_test_plan`, `create_build`, `add_test_case_to_test_plan` |

Not every document touches every entity — only write what the document implies.

## Progress checklist

```
- [ ] 1. Read the source document; identify which entities it implies
- [ ] 2. Confirm target project (list_projects)
- [ ] 3. Requirements: create spec + requirements if the doc has them
- [ ] 4. Suites: create/confirm the suite hierarchy
- [ ] 5. Cases: diff each against TestLink → skip / update / create (HTML via testlink-format)
- [ ] 6. Plan + build: create and assign cases (if the doc implies execution)
- [ ] 7. Verify counts match the document; hand to testlink-review
```

## Diff logic

Before writing, list what's already in TestLink and compare by name:

- **Matches** (all compared fields equal) → skip; do not call update
- **Differs** (name found, fields differ) → update only the differing fields
- **New** (name not found) → create

Compare cases on `name`, `summary`, `preconditions`, and each step's `actions` and
`expected_results`; suites on name + details; requirements on title + scope.

## Notes & quirks

- Format all rich-text fields as HTML — see `testlink-format`. Plain text or `\n`
  renders wrong.
- Test plan `notes` is plain text — no HTML there.
- Test case IDs may be numeric or external (`PREFIX-1`); the tools accept either.
- After creating a case, re-read it (`read_test_case`) and confirm `preconditions`
  took; if empty, `update_test_case`.
- Before overwriting a case that has real execution history, ask the user to
  create a new version in TestLink first.

## Verify

Count entities written vs the document, report PASS/FAIL and the IDs (especially
the test plan ID), then run `testlink-review` to confirm the change met the user's
goal.
