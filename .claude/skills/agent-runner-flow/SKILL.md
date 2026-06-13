---
name: agent-runner-flow
description: |
  Integration test design principles for a connected end-to-end flow. Use when
  writing, reviewing, refactoring, or adding test cases under cicd/tests/ (the YAML
  flow and the runner). Enforces one self-contained, connected flow with no
  hardcoded or standalone tests. The principles are project-agnostic; the concrete
  fixtures at the end are this project's instantiation.
---

# Integration Test Flow

## The goal (non-negotiable)

The integration tests are **one self-contained, connected end-to-end flow** — not a
bag of independent tests. A run provisions its own fixtures, threads them through
every stage, and tears them all down, leaving the backend as it found it. It must
pass against a **fresh** backend (the only precondition being that the backend's API
is reachable), repeatably.

Mechanics live in `cicd/tests/README.md`. This skill is the *why* and the *rules*.

## The five rules (portable to any project)

1. **Embed every test in the flow — never an island.**
   A new test consumes fixtures produced upstream and declares `dependencies` on the
   stage that produced them. It does **not** bootstrap its own project/parent
   objects. If it creates a fixture, that fixture is removed in the shared teardown
   stage, not by the test itself.

2. **No hardcoded instance IDs.**
   Never write a real backend ID into a test. Every ID is created at runtime by a
   stage and threaded downstream. The only allowed literals are values that are
   portable across any fresh spin-up (e.g. a built-in default account).

3. **No IDs in names; no random/timestamp suffixes.**
   Fixtures are **stable named test data**. Do not embed a runtime id or a
   random/`$$`/timestamp value into a name to get uniqueness — use a stable name with
   **idempotent reuse-or-create** (look up by name, reuse if present, else create).
   This survives a fixture leaked by a failed run.

4. **Everything is connected — no parallel islands.**
   Fixtures must relate to each other, mirroring the system's real graph. A new
   entity that doesn't connect to the chain is not embedded — link it.

5. **Teardown leaves the backend clean.**
   The final stage removes everything the flow created and depends on every
   fixture-consuming test so it runs last. It verifies removal where it can (e.g. a
   read-back reports the entity gone).

## Checklist for a new/edited test

- [ ] `dependencies` point at the stage(s) producing the IDs it reads
- [ ] Reads fixture IDs from the shared hand-off — zero hardcoded instance IDs
- [ ] Any fixture it creates has a **stable name** + idempotent reuse-or-create
- [ ] Any fixture it creates is published to the hand-off and removed in teardown
- [ ] The new entity is **linked into** the connected graph, not standalone
- [ ] Steps emit a marker for `expectPatterns`; parse structured responses rather
      than dumping raw output (keeps the deterministic judge's error scan clean)
- [ ] The runner still passes against a fresh backend, twice (idempotent)

## Anti-patterns (reject these)

- ❌ A "self-contained" test that creates *and* tears down its own parent objects in
  isolation — duplicates setup and breaks the shared lifecycle. Embed it instead.
- ❌ Hardcoded instance IDs, or IDs/random values baked into fixture names.
- ❌ An entity created but never connected to the flow's chain.
- ❌ A fixture created with no corresponding teardown (leaks across runs).

---

## This project (testlink-mcp)

The flow under `cicd/tests/testcases/` runs `s1-build-deploy → … → s7-requirements`
against a TestLink instance (only precondition: the XML-RPC API is enabled).

- **Hand-off:** stages publish/read fixture IDs via `/tmp/tl-flow/*`.
- **Stable fixtures:** `Flow Suite`, `Flow Case`, `Flow Plan`, `Flow Build`, doc ids
  `FLOW-RS` / `FLOW-REQ` — each created idempotently (list by name/doc-id, reuse or
  create). The one portable literal is `admin` (the built-in default user).
- **The connected graph:** the requirement *covers* the case; the case is *in* the
  suite and the plan; the build *belongs to* the plan; the execution *records* the
  case in the build. A lone requirement in its own spec is linked via
  `assign_requirements`.
- **Teardown:** `TC-S7-003` deletes case, plan, build, requirement spec, and suite,
  and depends on every fixture-consuming test so it runs last.
- **Judge hygiene:** each step `echo`s a marker (e.g. `READ_OK`) for `expectPatterns`
  and parses MCP JSON with `python3` rather than dumping raw responses, so the
  deterministic simple judge's error scan stays clean.
- **Run:** `cd cicd/tests && npx tsx src/cli.ts run` (see `cicd/tests/README.md`); it
  must pass twice in a row against the same instance.

**Backporting upstream:** keep "The goal", "The five rules", the checklist, and the
anti-patterns verbatim; replace only this section with the target project's concrete
fixtures, hand-off mechanism, and teardown stage.
