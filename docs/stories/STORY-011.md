# STORY-011: CD Docker Image Build & Push

## User Story

As a maintainer,
I want Docker images automatically built and pushed on release,
So that users always have access to the latest version on Docker Hub.

## Description

Continuous delivery pipeline that builds and pushes Docker images to Docker Hub when a release is tagged. Currently partially implemented via `docker-publish.yml` workflow.

## Acceptance Criteria

- [x] GitHub Actions workflow triggers on release tag
- [x] Multi-platform Docker build (if applicable)
- [x] Push to Docker Hub as `dogkeeper886/testlink-mcp`
- [ ] Automated tagging with version from `package.json`
- [ ] Smoke test before push (container starts and responds)

## Technical Notes

- Affected files: `.github/workflows/docker-publish.yml`, `.github/workflows/release.yml`
- Docker Hub: `dogkeeper886/testlink-mcp`
- Current tags: `latest`, `v1.2`, `v1.1`

## Traceability

- GitHub: Issue #11
- CI: `docker-publish.yml`, `release.yml`

## Status

- Created: 2026-04-08
- Status: PARTIAL — workflow exists, automated version tagging not confirmed
- Tasks: Issue #11
- Tests: TC-BUILD-002 (Docker build), TC-BUILD-003 (container startup)
