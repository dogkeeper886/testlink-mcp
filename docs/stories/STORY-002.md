# STORY-002: Test Case Management

## User Story

As a QA engineer,
I want to create, read, update, and delete test cases through my AI agent,
So that I can manage test cases in TestLink without leaving my IDE.

## Description

Full CRUD operations for TestLink test cases. Supports both numeric IDs (123) and external IDs (PREFIX-123). Delete is implemented as "mark obsolete" (status 7) since TestLink XML-RPC has no direct delete method.

## Acceptance Criteria

- [x] `read_test_case` - Fetch by numeric ID or external ID (PREFIX-123)
- [x] `create_test_case` - Create with project, suite, name, author, summary, steps, importance
- [x] `update_test_case` - Update name, summary, preconditions, steps, importance, execution type, status
- [x] `delete_test_case` - Mark as obsolete (status 7)
- [x] HTML formatting support for summary, preconditions, steps
- [x] Input validation on all parameters

## Technical Notes

- Affected files: `src/index.ts` (lines 115-185, 429-510, 826-844)
- Tools: `read_test_case`, `create_test_case`, `update_test_case`, `delete_test_case`
- API quirk: delete is implemented as `updateTestCase({ status: 7 })` — marks obsolete, not true delete
- External ID parsing: regex `/^[A-Za-z0-9]+-(\d+)$/`

## Traceability

- PRD: Test Case Management (4 tools, all P0)
- Release: v1.0.0 (initial), v1.2.0 (preconditions, HTML formatting)
- GitHub: PRs #36 (integration tests)
- TestLink: CRUD Tests suite (ID 163), test cases tm-1 (read), tm-2 (update)
- Tests: TC-TOOL-001 (create), TC-TOOL-002 (read), TC-TOOL-003 (update), TC-TOOL-005 (delete)

## Test Coverage

| Test ID | Name | Tool Tested | E2E? | Cleans Up? |
|---------|------|-------------|------|------------|
| TC-TOOL-001 | create_test_case | create_test_case, read_test_case | Yes | No (debris) |
| TC-TOOL-002 | read_test_case | read_test_case | Yes | N/A |
| TC-TOOL-003 | update_test_case | update_test_case, read_test_case | Yes | Yes (restores) |
| — | delete_test_case | **NOT COVERED** | — | — |

Gaps:
- `delete_test_case` has no test — blocked by testlink-code#1 (no delete API)
- TC-TOOL-001 leaves debris (creates case, never deletes)
- TC-TOOL-003 only tests name/summary/importance, not preconditions/steps

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: none open
