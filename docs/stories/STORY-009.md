# STORY-009: Run the test runner's reasoning judge on Claude — like the family, keyless, model-swappable

## User Story

As a maintainer of testlink-mcp,
I want the test runner's reasoning judge to evaluate results with Claude the same
standard way the rest of the agent-workflows family does — runnable on my Claude
subscription without a separate API key, and able to gain another model by
configuration,
So that the repo shares the family's evaluation instead of a one-off, divergent
integration I have to maintain by hand.

## The Need

The test runner has an opt-in reasoning judge that semantically evaluates test
results (alongside the always-on deterministic simple judge). Today it talks to a
local, hand-rolled model integration that diverged from how `agent-workflows-runner`
(and the rest of the family) evaluate — with Claude. That divergence costs three
ways: the repo can't share the family's evaluation behaviour; running it needs a paid
API key even though the maintainer already has a Claude subscription; and supporting a
different model means writing new backend code. The maintainer wants the judge brought
onto the family's standard Claude evaluation — runnable keyless on a subscription, and
extensible to other models by configuration rather than code — as a well-scoped change
to the judge, not a CI overhaul.

## Success Looks Like

- The reasoning judge evaluates results with Claude, matching how the family does it.
- It runs on the maintainer's Claude subscription without a separate API key.
- Adding a different model/source is a configuration change, not new backend code.
- The default deterministic (simple) judge is unaffected — a normal suite run is
  unchanged.

## Open Questions

- How far should non-subscription / non-Claude sources be supported out of the box,
  versus left to configuration? (mechanism + trade-offs settled on the plan, #86)
- Should the reasoning judge run in CI, or stay a local opt-in with CI on the simple
  judge? (CI auth approach settled on #86)

## Status

- Created: 2026-06-12
- Plan: #82
- Issues: #83 (done — PR #85 merged, raw @anthropic-ai/sdk), #84 (open — CI key, now moot under ACP),
  #86 (open — judge = ACP client; supersedes #83)
- #86 is **planned** as **judge = ACP client (Option A)**: the reasoning judge becomes an
  Agent Client Protocol client (`@agentclientprotocol/sdk`) that spawns a configured ACP
  agent (Claude `claude-agent-acp` by default; Gemini/others by config) and parses its
  verdict. Goal = compatibility + lowest maintenance: **add a model = config, not code**;
  keyless subscription auth comes from the agent (`~/.claude` / `CLAUDE_CODE_OAUTH_TOKEN`).
  **Supersedes #83** (raw `@anthropic-ai/sdk`, to be removed) and makes #84 moot.
- **Naming:** "LLM judge" is dropped (it's an agent now, vendor/model-agnostic). The
  deterministic **simple judge** name stays; the reasoning judge is the **agent judge**.
  Env prefix `LLM_JUDGE_*` → `JUDGE_*` (`JUDGE_AGENT`, `JUDGE_MODE=simple|dual`); class
  `AgentJudge`, `CONFIG.judge` block. Full rename table is on #86.
- Direction: **testlink-mcp #86 leads; agent-workflows-runner#35 is the backport** ("judge =
  ACP client" for the family). Path proven by ai-qa-studio (ACP client → claude-code-acp).
- Trade-off accepted: ACP-less sources (Ollama, raw API) need a generic ACP bridge; the
  deterministic simple judge stays the default correctness floor regardless.
