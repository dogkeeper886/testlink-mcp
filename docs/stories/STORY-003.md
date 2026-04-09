# STORY-003: Test Suite Management

## User Story

As a QA engineer,
I want to organize test cases into suites and manage suite hierarchy,
So that my test cases are structured by feature area or test type.

## Acceptance Criteria

- [x] `list_test_suites` returns first-level suites for a project
- [x] `list_test_cases_in_suite` returns all cases (deep, full details)
- [x] `create_test_suite` with optional parent for nesting
- [x] `update_test_suite` name and details

## Test Cases

| Test Case | Script | Objective | Status |
|-----------|--------|-----------|--------|
| TC-S3-001 | `cicd/tests/testcases/s3-test-suite/TC-S3-001.yml` | list_test_suites returns known suites | Active |
| TC-S3-002 | `cicd/tests/testcases/s3-test-suite/TC-S3-002.yml` | list_test_cases_in_suite populated & empty | Active |
| TC-S3-003 | `cicd/tests/testcases/s3-test-suite/TC-S3-003.yml` | update_test_suite modifies, verifies, restores | Active |
| TC-S3-004 | `cicd/tests/testcases/s3-test-suite/TC-S3-004.yml.disabled` | create_test_suite top-level & nested | Disabled (debris) |

## Technical Notes

- Affected files: `src/index.ts` (lines 192-253, 520-598)
- Tools: `list_test_suites`, `list_test_cases_in_suite`, `create_test_suite`, `update_test_suite`
- Seed data: suites 163 (CRUD Tests), 164 (Plan Tests)

## Traceability

- TestLink suite: TBD
- GitHub: PR #37 (integration tests)

## Status

- Created: 2026-04-09
- Status: COMPLETE
