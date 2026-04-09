# STORY-005: Build Management

## User Story

As a QA engineer,
I want to create builds under test plans and track which build a test was executed against,
So that test results are tied to specific software versions.

## Description

Build lifecycle within test plans: list builds, create builds with release dates, and close builds to prevent further executions. The `update_build` and `delete_build` tools were removed because the TestLink XML-RPC API does not support them.

## Acceptance Criteria

- [x] `list_builds` - Get all builds for a test plan
- [x] `create_build` - Create build with name, notes, active/open flags, release date
- [x] `close_build` - Close a build (prevents new test executions)
- [x] API limitations documented: `update_build` and `delete_build` not supported

## Technical Notes

- Affected files: `src/index.ts` (lines 322-356, 688-737, 907-919)
- Tools: `list_builds`, `create_build`, `close_build`
- Default release date: `new Date().toISOString().split('T')[0]` (today)
- Validation reuses `validateSuiteId` for plan_id and build_id (numeric format)

## Traceability

- PRD: Builds & Environments (4 tools planned; 3 implemented — update/delete removed)
- Release: v1.2.0
- Tests: TC-TOOL-015 (list builds), TC-TOOL-016 (create build)

## Test Coverage

| Test ID | Name | Tool Tested | E2E? | Cleans Up? |
|---------|------|-------------|------|------------|
| TC-TOOL-013 | list_builds + create_build | list_builds, create_build | Yes | No (debris) |
| TC-TOOL-015 | close_build + delete_test_plan | close_build, create_build, create_test_plan, delete_test_plan | Yes | Yes |
| — | delete_build | **NOT COVERED** | — | — |

Gaps:
- `delete_build` has no test
- TC-TOOL-013 leaves orphaned builds per CI run
- TC-TOOL-015 tests close_build but doesn't verify closed state

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: none open
