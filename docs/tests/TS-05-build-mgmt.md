---
id: TS-05
title: A build is created under the plan and is listable
namespace: testlink-mcp
story: STORY-005
story_hash: 18acd2219abca24430f11826b00d9f8cbb85fa92c140b926f07bd8b07eff3a8d
status: green
---

## Why this scenario exists

STORY-005 asks that results be tied to a specific software version, which in TestLink means a
build under a plan. This scenario creates that build and leaves it **open** on purpose — TS-06
records an execution against it, and TS-07's teardown is what finally closes it. Closing it here
would break the stage that follows.

### TC-01: Create the build and list it

- **Objective:** a build exists under the flow plan and appears in the plan's build list.
- **Script:** cicd/tests/testcases/s5-build-mgmt/TC-S5-001.yml
- **Preconditions:** TS-04 has published `plan_id`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Create `Flow Build` under the flow plan, reusing it if already present | `BUILD_READY=<id>`; the build id is published for TS-06 and teardown |
| 2 | List builds for the plan and look for the flow build | `LIST_BUILDS_OK` — the build is present and still open |
