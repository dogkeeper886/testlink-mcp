# STORY-001: Core MCP Server Foundation

## User Story

As a QA engineer using an AI coding agent,
I want a TestLink MCP server that connects via stdio transport,
So that my AI agent can interact with TestLink through the MCP protocol.

## Description

The foundational server that bridges AI agents (Claude Code, Cursor) with TestLink's XML-RPC API via the Model Context Protocol. It handles connection setup, authentication, input validation, error handling, and tool routing.

## Acceptance Criteria

- [x] Server connects to TestLink via XML-RPC API
- [x] Authentication via `TESTLINK_API_KEY` environment variable
- [x] Stdio transport for MCP communication
- [x] Fail-fast on missing API key (process.exit)
- [x] Structured error handling with TestLink error code mapping (2000=auth, 3000=permission, 7000=not found)
- [x] Input validation helpers for test case IDs, project IDs, suite IDs
- [x] External ID format support (PREFIX-123) alongside numeric IDs
- [x] Single switch-case tool router for all 22 tools

## Technical Notes

- Affected files: `src/index.ts` (lines 1-113, 415-964)
- Dependencies: `@modelcontextprotocol/sdk` v1.0.0, `testlink-xmlrpc` v3.0.0, `dotenv`, `axios`
- Config: `TESTLINK_URL`, `TESTLINK_API_KEY` environment variables
- Architecture: Single-file monolith, TestLinkAPI class wraps all XML-RPC calls

## Traceability

- PRD: Phase 1 Foundation
- Release: v1.0.0 (initial), v1.2.0 (enhanced)
- Code: `src/index.ts`
- Docker: `Dockerfile` (multi-stage Alpine build)

## Test Coverage

| Test ID | Name | Type | E2E? |
|---------|------|------|------|
| TC-BUILD-001 | Project Build Verification | Build gate | No |
| TC-BUILD-002 | TypeScript Strict Type Check | Build gate | No |
| TC-BUILD-003 | Build Output Verification | Build gate | No |
| TC-E2E-001 | MCP Server Startup Validation | Module check | No |
| TC-TOOL-000 | TestLink API Connection Smoke Test | Smoke | Partial |

Coverage: FULL — all foundation aspects verified

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: none open
