# STORY-009: Adopt the Anthropic SDK for the test runner's LLM judge

## User Story

As a maintainer of testlink-mcp,
I want the CI test runner's LLM judge to run on the Anthropic SDK like the rest of
the agent-workflows family,
So that the repo uses the same standard, Claude-powered evaluation instead of a
one-off, divergent model integration.

## The Need

The test runner has an opt-in LLM judge that semantically evaluates test results.
Today it talks to a local, hand-rolled model integration that diverged from how
`agent-workflows-runner` (and the rest of the family) do it — through the standard
**Anthropic SDK**. That divergence means the repo can't share the family's judge
behaviour, model choices, or Anthropic-compatible endpoint configuration. The
maintainer wants the judge brought onto the Anthropic SDK — a small, well-scoped
port, not a CI overhaul.

## Success Looks Like

- The test runner's LLM judge evaluates results through the Anthropic SDK (Claude),
  matching the family.
- Turning the LLM judge on behaves the same here as in agent-workflows-runner.
- The default deterministic (simple) judge is unaffected — a normal suite run is
  unchanged.

## Open Questions

- Keep a self-hosted/local option (via an Anthropic-compatible endpoint), or go
  Claude-only?
- Should the LLM judge run in CI (needs an API-key secret), or stay a local opt-in
  with CI on the simple judge?
- Which default judge model to standardize on?

## Status

- Created: 2026-06-12
- Plan: #82
- Issues: #83 (done — PR #85 merged, raw @anthropic-ai/sdk), #84 (open — CI key, decision-gated),
  #86 (open — re-port to the Agent SDK for keyless subscription auth; corrects #83)
- #86 is **planned** as **judge = ACP client (Option A)**: the LLM judge becomes an Agent
  Client Protocol client (`@agentclientprotocol/sdk`) that spawns a configured ACP agent
  (Claude `claude-agent-acp` by default; Gemini/others by config) and parses its verdict.
  Goal = compatibility + lowest maintenance: **add a model = config, not code**; keyless
  subscription auth comes from the agent (`~/.claude` / `CLAUDE_CODE_OAUTH_TOKEN`).
  **Supersedes #83** (raw `@anthropic-ai/sdk`, to be removed) and makes #84 moot.
- Direction: **testlink-mcp #86 leads; agent-workflows-runner#35 is the backport** ("judge =
  ACP client" for the family). Path proven by ai-qa-studio (ACP client → claude-code-acp).
- Trade-off accepted: ACP-less sources (Ollama, raw API) need a generic ACP bridge; the
  deterministic simple judge stays the default correctness floor regardless.
