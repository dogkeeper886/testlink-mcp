---
id: TS-01
title: Requirements cover a case, then the flow tears itself down
namespace: testlink-mcp
story: STORY-007
story_hash: e91bff3102610855c4aba7e2aa5eff5c2486275c1bf8f0d4fdb4fd04e9f1244e
issue: 107
status: green
---

## Why this scenario exists

STORY-007 asks that requirements be viewable and traceable to the cases covering them. TC-01 and
TC-02 do that work.

TC-03 is different in kind: it is the **teardown for the whole flow**. It deletes what every
earlier scenario created, in dependency order, so a full run leaves only the empty project and is
repeatable against a fresh TestLink. That is also where the delete tools are genuinely exercised —
deletion is proven *by* the lifecycle rather than by a standalone case that invents its own data.

### TC-01: List requirements

- **Objective:** `list_requirements` answers for the project without error.
- **Script:** cicd/tests/testcases/s7-requirements/TC-S7-001.yml
- **Preconditions:** the flow project exists.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | List requirements for the flow project | `LIST_REQS_OK` — no `isError`, and the payload is a list |

### TC-02: Create a requirement and link it to the case

- **Objective:** a specification and requirement can be created, read back, and linked to a case as coverage.
- **Script:** cicd/tests/testcases/s7-requirements/TC-S7-002.yml
- **Preconditions:** TS-02 has published `project_id` and `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Ensure a requirement specification exists, idempotently | `REQSPEC_READY=<id>` |
| 2 | Ensure a requirement exists inside that spec, idempotently | `REQUIREMENT_READY=<id>` |
| 3 | Get the requirement and check its fields | `GET_REQ_OK` |
| 4 | Assign the requirement to the flow test case | `COVERAGE_OK` — the case is now traceable to the requirement |

### TC-03: Teardown

- **Objective:** everything the flow created is removed, in dependency order, leaving the project empty.
- **Script:** cicd/tests/testcases/s7-requirements/TC-S7-003.yml
- **Preconditions:** all earlier scenarios have run; their ids are published under `/tmp/tl-flow/`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Close the flow build | `BUILD_CLOSED_OK` |
| 2 | Delete the flow test case and confirm it is gone | `CASE_DELETED_OK` — a real delete, verified by re-reading |
| 3 | Delete the flow test plan | `PLAN_DELETED_OK` |
| 4 | Delete the requirement specification | `REQSPEC_DELETED_OK` — cascades to its requirement |
| 5 | Delete the child test suite | `CHILD_SUITE_DELETED_OK` |
| 6 | Delete the now-empty flow suite | `SUITE_DELETED_OK` — only the empty project remains |
