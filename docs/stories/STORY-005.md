# STORY-005: Build Management

## User Story

As a QA engineer,
I want to create builds under test plans and track which build a test was executed against,
So that test results are tied to specific software versions.

## Acceptance Criteria

- [x] `list_builds` returns all builds for a plan
- [x] `create_build` with name, notes, active/open flags
- [x] `close_build` prevents new executions

## Test Cases

| Test Case | Script | Objective |
|-----------|--------|-----------|
| TC-S5-001 | `cicd/tests/testcases/s5-build-mgmt/TC-S5-001.yml` | create_build, close_build, delete_test_plan full lifecycle |

## Technical Notes

- Affected files: `src/index.ts` (lines 322-356, 688-737)
- Tools: `list_builds`, `create_build`, `close_build`
- Seed data: plan 172 (CI Test Plan)

## Traceability

- TestLink suite: TBD

## Status

- Created: 2026-04-09
- Status: COMPLETE
