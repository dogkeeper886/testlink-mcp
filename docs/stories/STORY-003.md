# STORY-003: Test Suite Management

## User Story

As a QA engineer,
I want to organize test cases into suites and manage suite hierarchy,
So that my test cases are structured by feature area or test type.

## Description

Test suite operations including listing suites for a project, listing test cases within a suite, creating new suites (with optional nesting via parent_id), and updating suite properties.

## Acceptance Criteria

- [x] `list_test_suites` - Get first-level suites for a project
- [x] `list_test_cases_in_suite` - Get all test cases in a suite (deep, full details)
- [x] `create_test_suite` - Create suite with optional parent for nesting
- [x] `update_test_suite` - Update name and details
- [x] HTML formatting support for suite details

## Technical Notes

- Affected files: `src/index.ts` (lines 192-253, 520-598, 851-877)
- Tools: `list_test_suites`, `list_test_cases_in_suite`, `create_test_suite`, `update_test_suite`
- API: `getFirstLevelTestSuitesForTestProject` (only returns first level), `getTestCasesForTestSuite` (deep=true)
- Missing: `delete_test_suite` — not implemented (PRD lists as P1)

## Traceability

- PRD: Test Suite Management (4 tools planned, 4 implemented — but delete not in code, update added instead)
- Release: v1.0.0 (list), v1.2.0 (create, update, HTML support)
- GitHub: PRs #37 (integration tests)
- TestLink: project 162 has 8 suites (2 real + 6 CI leftovers)
- Tests: TC-TOOL-006 (list suites), TC-TOOL-007 (list cases in suite), TC-TOOL-008 (create suite), TC-TOOL-009 (update suite)

## Status

- Created: 2026-04-08
- Status: COMPLETE (delete_test_suite not implemented per PRD P1)
- Tasks: none open
- Tests: 4 tool tests + integration tests
