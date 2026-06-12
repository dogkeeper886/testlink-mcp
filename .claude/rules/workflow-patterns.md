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

**Judge mode dropdown:** Each workflow offers `simple` (default — fast, deterministic, no model) or `dual` (simple + the opt-in LLM judge). The workflow sets `LLM_JUDGE_MODE` from this input; the runner is simple-only unless it reads `dual`.

## Environment Variables

The LLM judge reaches its model through the Anthropic SDK, so any Anthropic-compatible
endpoint (the hosted API or a local one) is a matter of configuration. Set these via
GitHub repository variables/secrets (`Settings > Variables/Secrets > Actions`):

| Variable | Purpose | Example |
|----------|---------|---------|
| `LLM_JUDGE_MODE` | `simple` (default) or `dual` (opt in the LLM judge) | `dual` |
| `LLM_JUDGE_MODEL` | Model for judging | `claude-haiku-4-5-20251001` |
| `LLM_JUDGE_URL` | Base URL of an Anthropic-compatible endpoint (unset → hosted Anthropic API) | `http://localhost:11434` |
| `ANTHROPIC_API_KEY` | API key for the hosted API (secret; a placeholder works for a local endpoint that ignores auth) | `sk-ant-...` |

**Local endpoint:** To judge against a local Anthropic-compatible model server, point `LLM_JUDGE_URL` at it. Keeping the judge on a separate endpoint from any model your project itself tests avoids resource contention.

## Legacy Workflows

`test-pipeline.yml` and `test-suite.yml` are the original suite-based workflows. They still work but the per-feature pattern (`ci.yml` + `test-run.yml`) is recommended for projects with many test cases.
