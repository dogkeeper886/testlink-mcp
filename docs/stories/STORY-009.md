# STORY-009: Port latest Anthropic ideas into the project tooling

## User Story

As a maintainer of testlink-mcp,
I want the project to adopt the latest Anthropic / Claude Code ideas already proven
in agent-workflows-runner,
So that the repo's automation stays current instead of falling behind newer patterns.

## The Need

agent-workflows-runner (renamed from `test-framework-template`) has moved ahead on
how it uses Claude Code (workflow
patterns, skills, CI conventions). testlink-mcp should pull those forward rather
than maintain an older style. The specific ideas to port are not pinned down yet —
the maintainer flagged this briefly and wants the *how* settled at plan time.

## Success Looks Like

- testlink-mcp's tooling reflects the current patterns the template uses, with no
  obvious "this is the old way" gaps left behind.
- The maintainer can point at the template and the repo and see them as the same
  generation of tooling.

## Open Questions

- **Primary input for the plan: compare the CI between this project and the target
  project (`agent-workflows-runner`).** The diff in CI setup is the concrete signal
  for what "latest ideas" means here — start there.
- Which differences are intentional (TestLink/MCP-specific) vs. drift to be closed?
- Does this overlap with STORY-008 (align .claude) — and if so, where's the seam?
- Scope: tooling/CI patterns only, or also model IDs, skill-authoring, and
  multi-agent conventions?

## Status

- Created: 2026-06-12
- Issues: none
