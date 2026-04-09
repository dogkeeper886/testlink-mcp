# STORY-001: Build & Deploy

## User Story

As a developer,
I want the project to compile, the server to start, and the Docker image to build,
So that the MCP server can be deployed and used.

## Acceptance Criteria

- [x] TypeScript compiles without errors
- [x] Dependencies install from lockfile
- [x] Server exits non-zero without API key
- [x] ES module loads correctly
- [x] Docker multi-stage build succeeds
- [x] Container runs as non-root user (nodejs)

## Test Cases

| Test Case | Script | Objective |
|-----------|--------|-----------|
| TC-S1-001 | `cicd/tests/testcases/s1-build-deploy/TC-S1-001.yml` | npm ci installs, TypeScript compiles |
| TC-S1-002 | `cicd/tests/testcases/s1-build-deploy/TC-S1-002.yml` | Server exits without API key, ES module loads |
| TC-S1-003 | `cicd/tests/testcases/s1-build-deploy/TC-S1-003.yml` | Docker image builds, runs as non-root |

## Technical Notes

- Affected files: `src/index.ts`, `Dockerfile`, `package.json`, `tsconfig.json`
- Dependencies: `@modelcontextprotocol/sdk`, `testlink-xmlrpc`, `dotenv`, `axios`

## Traceability

- TestLink suite: TBD
- Release: v1.0.0 (initial), v1.2.0 (enhanced)
- Code: `src/index.ts`, `Dockerfile`

## Status

- Created: 2026-04-09
- Status: COMPLETE
