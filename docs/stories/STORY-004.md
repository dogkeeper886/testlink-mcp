# STORY-004: Test Plan Management

## User Story

As a QA engineer,
I want to create and manage test plans and assign test cases to them,
So that I can organize test execution around releases or milestones.

## Acceptance Criteria

- [x] `list_test_plans` returns all plans for a project
- [x] `create_test_plan` with name, notes, active/public flags
- [x] `delete_test_plan` removes a plan
- [x] `get_test_cases_for_test_plan` lists assigned cases
- [x] `add_test_case_to_test_plan` with version, platform, urgency

## Test Cases

| Test Case | Script | Objective |
|-----------|--------|-----------|
| TC-S4-001 | `cicd/tests/testcases/s4-test-plan/TC-S4-001.yml` | add_test_case_to_test_plan full lifecycle |
| TC-S4-002 | `cicd/tests/testcases/s4-test-plan/TC-S4-002.yml` | get_test_cases_for_test_plan verifies structure |

## Technical Notes

- Affected files: `src/index.ts` (lines 257-320, 600-687)
- Tools: `list_test_plans`, `create_test_plan`, `delete_test_plan`, `get_test_cases_for_test_plan`, `add_test_case_to_test_plan`
- Seed data: plan 172 (CI Test Plan), tm-1 (ID 166), tm-3 (ID 170)

## Traceability

- TestLink suite: TBD
- GitHub: PR #38 (integration tests)

## Status

- Created: 2026-04-09
- Status: COMPLETE
