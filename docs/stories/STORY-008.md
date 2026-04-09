# STORY-008: Docker Deployment

## User Story

As a DevOps engineer,
I want to run the TestLink MCP server as a Docker container,
So that deployment is consistent and doesn't require local Node.js setup.

## Description

Multi-stage Docker build with Alpine Linux for minimal image size. Runs as non-root user. Published to Docker Hub as `dogkeeper886/testlink-mcp`.

## Acceptance Criteria

- [x] Multi-stage Dockerfile (build + runtime)
- [x] Alpine Linux base for minimal size
- [x] Non-root user execution
- [x] Environment variable configuration (TESTLINK_URL, TESTLINK_API_KEY)
- [x] Published to Docker Hub with tags: `latest`, `v1.2`, `v1.1`
- [x] `.env.example` documents required variables
- [x] `DOCKERHUB.md` provides Docker Hub-specific documentation

## Technical Notes

- Affected files: `Dockerfile`, `.env.example`, `DOCKERHUB.md`
- Image: `dogkeeper886/testlink-mcp:latest`
- Usage: `docker run --rm -i -e TESTLINK_URL=... -e TESTLINK_API_KEY=... dogkeeper886/testlink-mcp:latest`

## Traceability

- Release: v1.0.0 (initial Docker), v1.2.0 (optimized)
- Tests: TC-BUILD-002 (Docker build), TC-BUILD-003 (container startup)
- CI: `.github/workflows/docker-publish.yml`

## Test Coverage

| Test ID | Name | Type | E2E? |
|---------|------|------|------|
| TC-INTEGRATION-001 | Docker Image Build | Build gate | No (builds image, verifies non-root user, cleans up) |

Coverage: FULL for build verification

## Status

- Created: 2026-04-08
- Status: COMPLETE
- Tasks: none open
