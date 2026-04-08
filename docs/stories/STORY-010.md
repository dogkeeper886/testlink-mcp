# STORY-010: HTTP Transport for Dify Integration

## User Story

As a Dify platform administrator,
I want to connect to the TestLink MCP server over HTTP,
So that Dify workflows can access TestLink tools without requiring a local subprocess.

## Description

Add HTTP-based transport alongside existing stdio. The MCP spec (2025-03-26) defines Streamable HTTP as the standard, but Dify defaults to legacy SSE, so both must be supported. Transport mode selected via environment variable.

## Acceptance Criteria

- [ ] Server supports Streamable HTTP transport (MCP spec 2025-03-26) at `/mcp`
- [ ] Server supports legacy SSE transport at `/sse` + `/sse/messages` for Dify compatibility
- [ ] Existing stdio transport remains the default — no breaking changes
- [ ] Transport mode is selected via `MCP_TRANSPORT` env var (`stdio` | `http`)
- [ ] HTTP port is configurable via `MCP_HTTP_PORT` (default: `3000`)
- [ ] Dify can discover and invoke all 22 existing tools over HTTP
- [ ] Docker image supports both transport modes

## Technical Notes

- Affected files: `src/index.ts`, `package.json` (add `express`), `Dockerfile`, `.env.example`
- New dependency: `express`
- MCP SDK classes: `StreamableHTTPServerTransport`, `SSEServerTransport`
- References:
  - MCP Transports Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
  - Dify MCP Support (v1.6.0): https://dify.ai/blog/v1-6-0-built-in-two-way-mcp-support

## Traceability

- GitHub: Issue #16 (user story), #17 (Express + Streamable HTTP), #18 (legacy SSE), #19 (env var config), #20 (Dockerfile + docs)
- Milestone: #3 "HTTP Transport Support for Dify Integration"
- PRD: not yet reflected (needs update)
- TestLink: no test cases defined yet

## Status

- Created: 2026-04-08
- Status: NOT STARTED
- Tasks: Issues #17, #18, #19, #20
- Tests: none defined
