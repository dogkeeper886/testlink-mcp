---
id: TS-01
title: Test cases are created, read, and updated by either id form
namespace: testlink-mcp
story: STORY-002
story_hash: 54ae0e60def1d6d3587178dd3878c4328687e7040a563fffa6a13feb8b7d18fd
status: green
---

## Why this scenario exists

STORY-002 asks a QA engineer to manage test cases through an agent rather than the TestLink UI.
This scenario also **provisions the fixtures the rest of the flow consumes** — the project and
suite in TC-01, and the case in TC-02 — publishing their ids under `/tmp/tl-flow/`. Deletion is
not here: the case is deleted by TS-07's teardown, so the delete is exercised *in* the lifecycle
rather than in isolation.

TC-04 and TC-05 are deliberately paired: the same update is driven once by **external** id
(`MFT-N`) and once by **internal** numeric id, because routing them to the wrong TestLink
parameter silently edits a different case (#80).

### TC-01: Provision the project and suite fixtures

- **Objective:** the shared fixtures every later stage depends on exist, idempotently.
- **Script:** cicd/tests/testcases/s2-test-case/TC-S2-001.yml
- **Preconditions:** a reachable TestLink with the XML-RPC API enabled.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Ensure the test project exists, out-of-band via `testlink-xmlrpc` (project creation is not an MCP tool) | `PROVISION_PROJECT_OK <id>`; id, name, and prefix published to `/tmp/tl-flow/` |
| 2 | Ensure the top-level `Flow Suite` exists, reusing it by name if present | `PROVISION_SUITE_OK suite=<id>` |

### TC-02: Create a test case

- **Objective:** `create_test_case` writes a case into the flow suite and returns its external id.
- **Script:** cicd/tests/testcases/s2-test-case/TC-S2-002.yml
- **Preconditions:** TC-01 has published `project_id` and `suite_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Create `Flow Case` in the flow suite, with a summary and preconditions | `CREATED=<PREFIX>-<n>`; the external id is published for downstream stages |

### TC-03: Read the case back

- **Objective:** a created case reads back with every field that was written — `preconditions` included (#51).
- **Script:** cicd/tests/testcases/s2-test-case/TC-S2-003.yml
- **Preconditions:** TC-02 has published `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Read the case by external id and assert name, summary, and preconditions | `READ_OK` — `preconditions` is present, not silently dropped |

### TC-04: Update by external id

- **Objective:** an update addressed by `PREFIX-N` lands on the intended case.
- **Script:** cicd/tests/testcases/s2-test-case/TC-S2-004.yml
- **Preconditions:** TC-02 has published `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Update summary and importance by external id, then re-read | `UPDATE_OK` — the new values are visible on read-back |

### TC-05: Update by internal id

- **Objective:** the same update addressed by the numeric internal id also lands correctly (#80).
- **Script:** cicd/tests/testcases/s2-test-case/TC-S2-005.yml
- **Preconditions:** TC-02 has published `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Resolve the internal id, update by it, then re-read | `INTERNAL_ID=<n>` and the update is visible — the numeric id was not misrouted as an external id |
