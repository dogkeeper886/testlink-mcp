---
id: TS-01
title: A test plan is created and the flow case is linked to it
namespace: testlink-mcp
story: STORY-004
issue: 107
status: green
---

## Why this scenario exists

STORY-004 asks that execution be organised around plans. This scenario creates the plan the
build (TS-05) and execution (TS-06) stages both hang off, and links the flow case to it.

One quirk is load-bearing: `create_test_plan` is keyed by the project **name**, not its id —
passing the id yields `Test Project (name:1) does not exist`. TC-01 therefore reads
`project_name` from the fixtures while everything else reads `project_id`.

### TC-01: Create the plan and add the case

- **Objective:** a plan exists in the flow project, lists without leaking a credential, and the flow case is assigned to it.
- **Script:** cicd/tests/testcases/s4-test-plan/TC-S4-001.yml
- **Preconditions:** TS-02 has published `project_name`, `project_id`, and `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Create `Flow Plan`, keyed by project **name**, reusing it if already present | `PLAN_READY=<id>`; the plan id is published for TS-05 and TS-06 |
| 2 | List the project's plans | `LIST_TEST_PLANS_OK` — the plan is present and **no row carries `api_key`** |
| 3 | Add the flow case to the plan | `ADD_TO_PLAN_OK` — the call reports no `isError` |

Step 2 guards the #100 credential redaction, which shipped with nothing asserting it
(#111). It sits *after* creation deliberately: the listing call in step 1 runs before
the plan exists and is empty on a fresh TestLink, so asserting there would pass forever
while checking nothing. It scans every returned row, not just the flow's own, so a
partial regression on one code path still trips it.

### TC-02: Read the plan's cases back

- **Objective:** `get_test_cases_for_test_plan` shows the case actually landed in the plan.
- **Script:** cicd/tests/testcases/s4-test-plan/TC-S4-002.yml
- **Preconditions:** TC-01 has published `plan_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Get the cases for the plan and look for the flow case | `PLAN_CASES_OK` — the case is linked, confirming the write rather than trusting it |
