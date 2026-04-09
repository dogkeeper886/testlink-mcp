# STORY-002: Test Case Management

## User Story

As a QA engineer,
I want to create, read, update, and delete test cases through my AI agent,
So that I can manage test cases in TestLink without leaving my IDE.

## Acceptance Criteria

- [x] `read_test_case` by numeric ID and external ID (PREFIX-123)
- [x] `create_test_case` with project, suite, name, author, summary, steps
- [x] `update_test_case` fields: name, summary, preconditions, steps, importance
- [x] `delete_test_case` marks as obsolete (status 7)

## Test Cases

| Test Case | Script | Objective | Status |
|-----------|--------|-----------|--------|
| TC-S2-001 | `cicd/tests/testcases/s2-test-case/TC-S2-001.yml` | read by numeric & external ID | Active |
| TC-S2-002 | `cicd/tests/testcases/s2-test-case/TC-S2-002.yml` | update, verify, restore | Active |
| TC-S2-003 | `cicd/tests/testcases/s2-test-case/TC-S2-003.yml.disabled` | create, read back | Disabled (debris) |

## Technical Notes

- Affected files: `src/index.ts` (lines 115-185, 429-510)
- Tools: `read_test_case`, `create_test_case`, `update_test_case`, `delete_test_case`
- Seed data: tm-1 (ID 166), tm-2 (ID 168) in CRUD Tests suite (163)

## Traceability

- TestLink suite: TBD
- GitHub: PR #36 (integration tests)

## Status

- Created: 2026-04-09
- Status: COMPLETE
