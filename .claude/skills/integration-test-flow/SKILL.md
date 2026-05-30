---
name: integration-test-flow
description: |
  Integration test design principles for testlink-mcp. Use when writing,
  reviewing, refactoring, or adding test cases under cicd/tests/ (the YAML
  flow under testcases/ and the runner in src/). Enforces one self-contained,
  connected end-to-end flow with no hardcoded or standalone tests.
---

# Integration Test Flow: testlink-mcp

## The Goal (non-negotiable)

The integration tests are **one self-contained, connected end-to-end flow** — not a
bag of independent tests. A run provisions its own fixtures, threads them through
every stage, and tears them all down, leaving only an empty project. It must pass
against a **fresh** TestLink (only precondition: the XML-RPC API is enabled),
repeatably.

Mechanics live in `cicd/tests/README.md`. This skill is the *why* and the *rules*.

## The five rules

1. **Embed every test in the flow — never an island.**
   A new test consumes fixtures produced upstream (read from `/tmp/tl-flow/*`) and
   declares `dependencies` on the stage that produced them. It does **not**
   bootstrap its own project/suite/case. If it creates a fixture, that fixture is
   cleaned up in the shared teardown (`TC-S7-003`), not by the test itself.

2. **No hardcoded instance IDs.**
   Never write a real TestLink ID (`162`, `271`, `tm-14`, plan `172`, …) into a
   test. Every ID is created at runtime by a stage and threaded downstream. The
   one allowed literal is `admin` (the built-in default user, portable across any
   TestLink spin-up).

3. **No IDs in names; no random/timestamp suffixes.**
   Fixtures are **stable named test data** (`Flow Suite`, `Flow Case`, `Flow Plan`,
   `Flow Build`, doc ids `FLOW-RS`/`FLOW-REQ`). Do not embed a runtime id or a
   random/`$$`/timestamp value into a name to get uniqueness — use a stable name
   with **idempotent reuse-or-create** (list by name/doc-id, reuse if present, else
   create). This survives a fixture leaked by a failed run.

4. **Everything is connected — no parallel islands.**
   Fixtures must relate to each other, mirroring TestLink's real graph: the
   requirement *covers* the case, the case is *in* the suite and the plan, the
   build *belongs to* the plan, the execution *records* the case in the build. A
   new entity that doesn't connect to the chain (e.g. a requirement sitting alone
   in its own spec) is not embedded — link it (e.g. `assign_requirements`).

5. **Teardown leaves the instance clean.**
   The final stage deletes everything the flow created (case, plan, build,
   requirement spec, suite) and depends on every fixture-consuming test so it runs
   last. It verifies deletion where it can (e.g. read-back reports the case gone).

## Checklist for a new/edited test

- [ ] `dependencies` point at the stage(s) producing the IDs it reads
- [ ] Reads fixture IDs from `/tmp/tl-flow/*` — zero hardcoded instance IDs
- [ ] Any fixture it creates has a **stable name** + idempotent reuse-or-create
- [ ] Any fixture it creates is published to `/tmp/tl-flow/` and deleted in teardown
- [ ] The new entity is **linked into** the connected graph, not standalone
- [ ] Steps `echo` a marker for `expectPatterns`; parse MCP JSON with `python3`
      rather than dumping raw responses (keeps the simple-judge error scan clean)
- [ ] `cli.ts run` still passes against a fresh TestLink, twice (idempotent)

## Anti-patterns (reject these)

- ❌ A "self-contained" test that creates *and* tears down its own project/suite in
  isolation — duplicates setup and breaks the shared lifecycle. Embed it instead.
- ❌ Hardcoded instance IDs, or IDs/random values baked into fixture names.
- ❌ An entity created but never connected to the case→plan→build→execution chain.
- ❌ A fixture created with no corresponding teardown (leaks across runs).
