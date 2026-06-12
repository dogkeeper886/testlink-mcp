# STORY-010: Apply test binding to existing tests

## User Story

As a QA engineer on testlink-mcp,
I want each existing test to be bound to the executable that runs it (the qw-bind
audit link),
So that intent (the test doc) and execution (the cicd YAML) stay verifiably in sync
instead of diverging silently.

## The Need

The template's qa-workflow treats binding as **audit, not codegen**: a markdown test
doc owns *intent* (why / what), the cicd YAML owns *execution* (how it runs), and a
link connects them — checked later by the binding's paired review.

testlink-mcp already has a body of integration tests under `cicd/tests/` (the
single connected end-to-end flow) but no binding layer over them. The maintainer
wants the binding applied to what already exists, not just to new tests — so the
existing suite gains the same traceability the template assumes.

## Success Looks Like

- Every existing test case has a binding linking its intent doc to the cicd YAML
  that executes it.
- Running the binding's paired review (`qw-review-bind` / `qw-drift`) over the
  existing suite passes — the links hold.
- No existing test behavior changes; this adds traceability, not new execution.

## Open Questions

- Forward bind (doc → YAML) or revert (port existing YAML into a doc scaffold), or
  a mix? The existing tests have YAML but may lack `docs/tests/TS-*.md` docs.
- Depends on STORY-008 landing the qa-workflow commands first.
- How does binding coexist with this repo's "one self-contained connected flow"
  integration-test principle?

## Status

- Created: 2026-06-12
- Issues: none
