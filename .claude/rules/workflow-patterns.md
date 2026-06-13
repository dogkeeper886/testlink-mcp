---
paths:
  - ".github/workflows/**/*.yml"
---

# CI Workflow Patterns

## Per-Feature Workflow Pattern

Split CI into composable, independently triggerable workflows:

```
.github/workflows/
├── build.yml                # Standalone build step
├── test-run.yml             # Reusable test runner (called by feature workflows)
├── test-<feature>.yml       # One per feature (~25 lines, thin delegator)
└── ci.yml                   # Full pipeline: build -> all features in parallel
```

**Adding a new feature test:**
1. Tag test cases: `tags: [my-feature]`
2. Copy `test-feature-example.yml` -> `test-my-feature.yml`
3. Change the `tag` input value to `my-feature`
4. Add the new workflow as a job in `ci.yml`

### Suite-Based Alternative

For projects organized by test suite rather than feature:

```
.github/workflows/
├── build.yml
├── test-run.yml             # Same reusable runner
├── test-build.yml           # Uses --suite build
├── test-integration.yml     # Uses --suite integration
└── ci.yml                   # Orchestrates all suites
```

Both patterns use `test-run.yml` as the single reusable job.

## Key Design Decisions

**Dual triggers:** Each workflow supports both `workflow_dispatch` (manual, with dropdowns) and `workflow_call` (callable from pipeline). This lets you run features independently or as part of the full CI.

**Judge mode dropdown:** Each workflow offers `simple` (default — fast, deterministic, no model) or `dual` (simple + the opt-in agent judge). The workflow sets `JUDGE_MODE` from this input; the runner is simple-only unless it reads `dual`.

## Environment Variables

The agent judge is an ACP client: it spawns an agent that owns its own model and auth,
so swapping models/vendors is configuration, not code. Set these via GitHub repository
variables/secrets (`Settings > Variables/Secrets > Actions`):

| Variable | Purpose | Example |
|----------|---------|---------|
| `JUDGE_MODE` | `simple` (default) or `dual` (opt in the agent judge) | `dual` |
| `JUDGE_AGENT` | Command launching the ACP agent (unset → the bundled Claude agent). Swap models/vendors here — config, not code. | `gemini-acp` |
| `CLAUDE_CODE_OAUTH_TOKEN` | Subscription token for the default Claude agent in CI (secret). No `ANTHROPIC_API_KEY` needed. | `(secret)` |

**Keyless by default:** the bundled Claude agent authenticates via `~/.claude` locally or `CLAUDE_CODE_OAUTH_TOKEN` in CI — the runner sets no API key and the model lives in the agent. To judge with a different model, point `JUDGE_AGENT` at that vendor's ACP agent command.

## Legacy Workflows

`test-pipeline.yml` and `test-suite.yml` are the original suite-based workflows. They still work but the per-feature pattern (`ci.yml` + `test-run.yml`) is recommended for projects with many test cases.
