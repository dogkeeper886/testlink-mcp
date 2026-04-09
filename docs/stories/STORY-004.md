# STORY-004: Test Plan Management

## User Story

As a QA engineer,
I want to create and manage test plans and assign test cases to them,
So that I can organize test execution around releases or milestones.

## Description

Test plan lifecycle: list plans, create plans, delete plans, view assigned test cases, and assign test cases to plans. The `update_test_plan` tool was removed because the TestLink XML-RPC API does not support it.

## Acceptance Criteria

- [x] `list_test_plans` - Get all plans for a project
- [x] `create_test_plan` - Create plan with name, notes, active/public flags
- [x] `delete_test_plan` - Remove a test plan
- [x] `get_test_cases_for_test_plan` - List cases assigned to a plan
- [x] `add_test_case_to_test_plan` - Assign case with version, platform, urgency, overwrite options
- [x] API limitation documented: `update_test_plan` not supported by TestLink XML-RPC

## Technical Notes

- Affected files: `src/index.ts` (lines 257-320, 600-687, 880-905)
- Tools: `list_test_plans`, `create_test_plan`, `delete_test_plan`, `get_test_cases_for_test_plan`, `add_test_case_to_test_plan`
- API quirk: `create_test_plan` uses `testprojectname` (prefix), not numeric project ID
- `add_test_case_to_test_plan` uses external ID format for test case

## Traceability

- PRD: Test Plans (4 tools planned; 5 implemented — split differently than PRD)
- Release: v1.2.0
- GitHub: PRs #38 (integration tests)
- TestLink: "CI Test Plan" (ID 172) in testlink-mcp project
- Tests: TC-TOOL-010 (list plans), TC-TOOL-011 (create plan), TC-TOOL-012 (delete plan), TC-TOOL-013 (get cases for plan), TC-TOOL-014 (add case to plan)

## Test Coverage

| Test ID | Name | Tool Tested | E2E? | Cleans Up? |
|---------|------|-------------|------|------------|
| TC-TOOL-009 | list_test_plans | list_test_plans | Yes | N/A |
| TC-TOOL-010 | create_test_plan | create_test_plan, delete_test_plan, list_test_plans | Yes | Yes |
| TC-TOOL-011 | add_test_case_to_test_plan | add_test_case_to_test_plan, create_test_plan, get_test_cases_for_test_plan, delete_test_plan | Yes | Yes |
| TC-TOOL-012 | get_test_cases_for_test_plan | get_test_cases_for_test_plan | Yes | N/A |

Gaps:
- TC-TOOL-011 only tests basic add; no coverage of overwrite, urgency, platform_id params

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: none open
