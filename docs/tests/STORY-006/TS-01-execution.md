---
id: TS-01
title: A pass result is recorded and reads back as a pass
namespace: testlink-mcp
story: STORY-006
story_hash: 153c9f026bdc0750d93b3663bcbb4f9230eac4b39ae9cc7a5a6a0b9891723691
status: green
---

## Why this scenario exists

STORY-006 asks that pass/fail status be tracked per build. Writing an execution is only half of
it — a write that reports success but stores nothing readable would satisfy a weaker test. Both
steps live in one case so the write is always followed by the read that proves it.

### TC-01: Record and read an execution

- **Objective:** an execution result is written against the flow case and build, and reads back as a pass.
- **Script:** cicd/tests/testcases/s6-execution/TC-S6-001.yml
- **Preconditions:** TS-04 published `plan_id`, TS-05 published an open `build_id`, TS-02 published `case_ext_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Record a **pass** execution for the flow case against the flow build | `EXEC_RECORDED_OK` — no `isError`, and the response carries a success status |
| 2 | Read the execution back | `EXEC_READ_OK` — the stored status is `p` (pass), not merely "written" |
