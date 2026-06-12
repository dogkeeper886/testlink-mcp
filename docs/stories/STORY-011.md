# STORY-011: Review all TestLink-related commands and skills

## User Story

As a maintainer of testlink-mcp,
I want a total review of the TestLink-related commands and skills,
So that the TestLink tooling is accurate, consistent, and not stale or duplicated
after the template alignment.

## The Need

testlink-mcp carries a large TestLink-specific surface that the template does not:

- ~20 `tl-*` commands under `.claude/commands/testlink/` (create/list/update/get
  cases, suites, plans, executions, requirements, sync, format, identify-type).
- TestLink-specific skills (`syncing-testlink`, `integration-test-flow`) and the
  `github/` `tl-define` command.

These grew over time and have not been reviewed as a whole. As STORY-008/009 pull
in template patterns, the TestLink commands need a pass to confirm they're correct,
consistent with each other, free of overlap/dead entries, and aligned with the new
qa-workflow conventions.

## Success Looks Like

- Every TestLink command and skill is reviewed and its status known: keep / fix /
  merge / retire.
- Naming, structure, and conventions are consistent across the `tl-*` set and with
  the adopted template patterns.
- Redundant, broken, or outdated TestLink tooling is identified (and addressed).

## Open Questions

- Best done after STORY-008/009 so the review measures against the new conventions?
- Which `tl-*` commands overlap with the underlying MCP tools vs. add real value?
- Does any TestLink command belong in the qa-workflow rather than a standalone
  `tl-*` namespace?

## Status

- Created: 2026-06-12
- Plan: #75
