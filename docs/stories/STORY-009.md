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

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: CI cleanup of orphaned TestLink data (not tracked)
- Tests: self-referential — this IS the test infrastructure
