# STORY-009: CI/CD Pipeline & Test Framework

## User Story

As a developer,
I want automated build verification and tool testing on every push,
So that regressions are caught before merging to main.

## Description

Custom YAML-based test framework with 23 test cases covering tool operations, build verification, integration, and E2E scenarios. Integrated with 5 GitHub Actions workflows for CI/CD automation.

## Acceptance Criteria

- [x] TypeScript compilation check (CI)
- [x] Docker build verification (CI)
- [x] 14 tool-level tests (TC-TOOL-000 through TC-TOOL-018)
- [x] 3 build verification tests (TC-BUILD-001 through TC-BUILD-003)
- [x] 1 integration test (TC-INTEGRATION-001)
- [x] 1 E2E test (TC-E2E-001)
- [x] Simple judge + LLM judge (Ollama) for result evaluation
- [x] Console and JSON reporters
- [x] GitHub Actions: ci.yml, test-pipeline.yml, test-suite.yml, docker-publish.yml, release.yml

## Technical Notes

- Affected files: `cicd/tests/` (test framework), `.github/workflows/` (5 pipelines)
- Test format: YAML definitions with shell command execution + pattern matching
- Test framework: `cicd/tests/src/` (MCP client, judges, reporters)
- Results: `cicd/results/` (test execution output)
- Known issue: CI creates test data in TestLink (suites, cases) but does not clean up — 6 orphaned suites, 6 orphaned test cases in TestLink project 162

## Traceability

- GitHub: PRs #34 (CI pipeline), #36-#39 (integration tests)
- Tests: 23 test cases total across 4 categories
- CI: 5 GitHub Actions workflows

## Test Coverage

All 23 test scripts ARE this story's deliverables:

| Suite | Count | Type | E2E? |
|-------|-------|------|------|
| build | 3 | TC-BUILD-001/002/003 | No — compile gates |
| integration | 1 | TC-INTEGRATION-001 | No — Docker build |
| e2e | 1 | TC-E2E-001 | No — startup check |
| tool | 18 | TC-TOOL-000 through 018 | Yes — live TestLink |

Coverage gaps in tool suite:
- 3 tools untested: delete_test_case, read_test_execution, delete_build
- 4 tests leave debris: TC-TOOL-001, 006, 013, 014
- TC-TOOL-004 missing (gap in numbering)
- Tracked: dogkeeper886/testlink-mcp#40

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: dogkeeper886/testlink-mcp#40 (CI debris cleanup, blocked by testlink-code#1)
