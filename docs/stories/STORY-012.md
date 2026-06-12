# STORY-012: Review and prune non-TestLink local-only .claude tooling

## User Story

As a maintainer of testlink-mcp,
I want the local-only `.claude` tooling that isn't TestLink-specific reviewed and
mostly removed,
So that the repo carries only the tooling it actually uses, instead of accreted
commands and skills that overlap with the agent-workflows-runner baseline.

## The Need

A diff against agent-workflows-runner shows 34 files that exist only in this repo's
`.claude/`. The TestLink commands and skills among them are handled by STORY-011.
The **rest** — github `gh-*` commands, `utility/evolve`, the extra `dw-review-pr`
command, and the non-TestLink local skills (`code-review`, `integration-test-flow`,
`tracking-changes`) — grew over time and were never reviewed as a set. The
maintainer's read is that most of these should be reviewed and removed: they
predate the qa-workflow / CI alignment (STORY-008) and likely overlap with it or
are no longer earning their place.

## Success Looks Like

- Every non-TestLink local-only command and skill has a known verdict: keep / merge
  into the aligned tooling / remove.
- What's removed is genuinely unused or superseded — nothing the repo still depends
  on is dropped.
- What remains is consistent with the aligned tooling from STORY-008.

## Open Questions

- Where exactly is the TestLink boundary? `github/tl-define` and `syncing-testlink`
  are TestLink-related (STORY-011); confirm the partition so nothing falls between
  the two stories.
- Does the `github/` `gh-*` set get removed in favour of the dev-workflow / GitHub
  flow the template uses, or is it still load-bearing for this repo?
- Best sequenced after STORY-008 lands, so "overlaps with the aligned tooling" is a
  real comparison rather than a prediction.

## Status

- Created: 2026-06-12
- Issues: none
