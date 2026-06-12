# STORY-008: Align .claude tooling with agent-workflows-runner

## User Story

As a maintainer of testlink-mcp,
I want my `.claude/` skills and commands to match agent-workflows-runner,
So that I get the qa-workflow and CI tooling the template has standardized on,
instead of drifting on an older toolset.

## The Need

agent-workflows-runner (the renamed `test-framework-template`; local checkout still
at `/home/jack/src/test-framework-template/.claude`) is the reference for how this
family of projects should be set up. testlink-mcp is missing pieces the template
now carries:

- **qa-workflow commands** (`qw-plan`, `qw-cases`, `qw-bind`, `qw-drift`,
  `qw-review-*`) — testlink-mcp has none of them.
- **CI skills** (`ci-run`, `ci-testcase`) and supporting skills (`add-tool`,
  `install`, the `review-*` family) — present in the template, absent here.
- **rules** — the template carries `test-yaml-format.md` and
  `workflow-patterns.md`; testlink-mcp only has `dev-workflow.md`.

The maintainer should be able to use the same QA + CI commands here as in any
other project built from the template.

## Success Looks Like

- The qa-workflow command set and the CI/support skills from the template are
  available under testlink-mcp's `.claude/`.
- Running a qa-workflow or CI command in testlink-mcp behaves the same as in the
  template, adapted to this repo's layout (`cicd/tests/`, TestLink specifics).
- Nothing testlink-mcp-specific (TestLink commands, existing dev-workflow) is lost
  in the alignment.

## Open Questions

- Which template skills/commands apply verbatim vs. need adaptation for the
  TestLink/MCP context? (worked out in the plan)
- Are template `rules/` (`test-yaml-format.md`, `workflow-patterns.md`) adopted
  as-is or merged with this repo's conventions?
- How to reconcile testlink-mcp's existing `github/` (gh-*) commands with the
  template's dev-workflow — keep both, replace, or bridge?

## Status

- Created: 2026-06-12
- Plan: #69
- Issues: #70
