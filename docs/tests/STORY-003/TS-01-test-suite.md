---
id: TS-01
title: Suites list, update, and nest correctly
namespace: testlink-mcp
story: STORY-003
story_hash: 42a2fa11f9b9b56b1bd1dfa1bc96b1db6749b7732bbdfd6e375c5b3a247770d7
issue: 107
status: green
---

## Why this scenario exists

STORY-003 asks that cases be organised into suites with a real hierarchy. Listing and updating
are the visible half; TC-04 covers the half that is easy to get wrong — a child suite must appear
under its parent **and must not** appear in the project's top-level list. Both halves are asserted
in the same case, because either alone would pass a broken implementation.

### TC-01: List suites in the project

- **Objective:** `list_test_suites` returns the project's top-level suites.
- **Script:** cicd/tests/testcases/s3-test-suite/TC-S3-001.yml
- **Preconditions:** TS-02 TC-01 has provisioned the flow suite.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | List suites for the flow project and look for `Flow Suite` | `LIST_SUITES_OK` — the suite is present |

### TC-02: List cases in a suite

- **Objective:** `list_test_cases_in_suite` returns the cases a suite holds.
- **Script:** cicd/tests/testcases/s3-test-suite/TC-S3-002.yml
- **Preconditions:** TS-02 TC-02 has created the flow case.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | List cases in the flow suite and look for `Flow Case` | `LIST_CASES_OK` — the case is present |

### TC-03: Update a suite

- **Objective:** `update_test_suite` edits suite details without error.
- **Script:** cicd/tests/testcases/s3-test-suite/TC-S3-003.yml
- **Preconditions:** the flow suite exists.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Update the flow suite's details | `UPDATE_SUITE_OK` — the call reports no `isError` |

### TC-04: Nest a child suite and scope the listing

- **Objective:** `parent_suite_id` returns a suite's immediate children, and children stay out of the top-level list.
- **Script:** cicd/tests/testcases/s3-test-suite/TC-S3-004.yml
- **Preconditions:** the flow suite exists.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Ensure a child suite exists under the flow suite, idempotently | `PROVISION_CHILD_OK child=<id>` |
| 2 | List children via `parent_suite_id` | `LIST_CHILD_SUITES_OK` — the child is present with the correct parent |
| 3 | List the project's top-level suites again | `TOPLEVEL_EXCLUDES_CHILD_OK` — the child is absent, so nesting is real rather than cosmetic |
