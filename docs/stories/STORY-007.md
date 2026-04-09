# STORY-007: Requirement Management (Read-Only)

## User Story

As a QA engineer,
I want to view requirements linked to a TestLink project,
So that I can trace test cases back to requirements for coverage analysis.

## Description

Read-only access to TestLink requirements. Create, update, and delete operations were removed because the TestLink XML-RPC API does not support them.

## Acceptance Criteria

- [x] `list_requirements` - Get all requirements for a project
- [x] `get_requirement` - Get detailed information about a specific requirement
- [x] API limitations documented: create/update/delete not supported by XML-RPC API

## Technical Notes

- Affected files: `src/index.ts` (lines 397-411, 779-810, 936-941)
- Tools: `list_requirements`, `get_requirement`
- Both require `project_id`; `get_requirement` also requires `requirement_id`

## Traceability

- PRD: Requirements & Traceability (4 tools planned; 2 implemented — CUD removed)
- Release: v1.2.0
- GitHub: PRs #39 (integration tests)
- Tests: part of integration test suite

## Test Coverage

| Test ID | Name | Tool Tested | E2E? | Cleans Up? |
|---------|------|-------------|------|------------|
| TC-TOOL-017 | list_requirements | list_requirements | Yes | N/A |
| TC-TOOL-018 | get_requirement | get_requirement (error case only) | Yes | N/A |

Gaps:
- TC-TOOL-017 is a smoke test — no actual requirement data to verify against
- TC-TOOL-018 only tests error case (non-existent ID 99999); no success case test

## Status

- Created: 2026-04-08
- Status: COMPLETE (read-only by design — API limitation)
- Tasks: none open
