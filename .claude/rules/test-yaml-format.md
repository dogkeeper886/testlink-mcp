---
paths:
  - "cicd/tests/testcases/**/*.yml"
  - "cicd/tests/src/types.ts"
  - "cicd/tests/src/loader.ts"
---

# Test Case YAML Format

## Schema

```yaml
id: TC-[SUITE]-[NUMBER]
testlink_id: 17                    # TestLink test case ID this maps to (this repo)
name: Human-readable test name
suite: build|integration|e2e      # Extensible — add custom suites in config.ts
goal: One-line objective for agent judge context
priority: 1                        # Lower = runs first
timeout: 30000                     # Milliseconds
dependencies: [TC-SUITE-001]       # Tests that must pass first
tags: [feature-name]               # For --tag filtering (optional)

steps:
  - name: Step description
    command: shell command to execute
    timeout: 5000                  # Optional, overrides test timeout
    expectPatterns:                # All must match (regex)
      - "pattern"
    rejectPatterns:                # None should match (regex)
      - "error"
    capture:                       # Extract values from JSON output
      varName: "json.path"

criteria: |
  Human-readable criteria for agent judge evaluation.
```

## Tags

Tags enable per-feature CI workflows. Use feature names or capability areas:

```yaml
tags: [auth, api]          # Feature tags
tags: [build, compile]     # Suite-aligned tags
tags: [smoke]              # Test category tags
```

Filter by tag: `npm test -- --tag auth` or `npm run list -- --tag auth`

## Variable Capture

Steps can extract values from JSON output and inject them into later steps:

```yaml
steps:
  - name: Create resource
    command: curl -s -X POST http://localhost:3000/api/resources
    capture:
      resourceId: "id"
  - name: Verify resource
    command: curl -s http://localhost:3000/api/resources/{{resourceId}}
```

**Path syntax:**
- `id` — direct field
- `data.name` — nested field
- `data[name=foo].id` — array find by field match
- `$[type=user].email` — root array find

Variables resolve from captured step output first, then fall back to `process.env`. This enables CI-friendly patterns like `{{TEST_API_KEY}}` without hardcoding values.

MCP double-encoded responses (`content[0].text` wrapping) are automatically unwrapped.

## Suite Guidelines

- `build` — compilation, dependency checks, environment validation
- `integration` — single tool/API calls, verify output format and correctness
- `e2e` — multi-step workflows, verify end-to-end state

Add custom suites by extending the `SUITES` array in `config.ts`.

## ID Format

- `TC-BUILD-XXX`
- `TC-INT-XXX`
- `TC-E2E-XXX`
- Custom: `TC-{SUITE}-XXX` (match your suite names)
