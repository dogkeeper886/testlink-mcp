# TestLink MCP — Integration Test Framework

Integration tests for the MCP server. Each test spins up the **real** `dist/index.js`
server over stdio (via `cicd/tests/src/mcp-client.ts`), calls its tools against a live
TestLink, and judges the responses. Tests are declarative YAML under `testcases/`.

See `cli.ts`, `executor.ts`, `loader.ts`, `judge/`, `reporter/` for the runner internals.

---

## The Test Flow (s1 → s7)

The suites are **not independent**. They form a single end-to-end **lifecycle**: a
small set of fixtures (project → suite → case → plan → build → execution) is
**created once upstream and threaded downstream** through the dependency chain.
Tests do not hardcode instance IDs, and they do not each re-bootstrap their own
data — they consume what earlier stages produced and clean it up at the end.

This is why the suites are numbered: the number is the position in the flow.

```
s1  BUILD & DEPLOY     build server, validate startup, build docker image
        │              (no TestLink data — pure CI/build checks)
        ▼
s2  TEST CASE          TC-S2-001 provision: ensure project + suite
        │                → publishes project_id, project_name, prefix, suite_id
        │              TC-S2-002 create_test_case
        │                → publishes case_ext_id (MFT-N) + case_internal_id
        │              TC-S2-003 read · TC-S2-004 update
        ▼
s3  TEST SUITE         list_test_suites · list_test_cases_in_suite · update_test_suite
        ▼
s4  TEST PLAN          TC-S4-001 create_test_plan (reuse-or-create) + add case
        │                → publishes plan_id
        │              TC-S4-002 get_test_cases_for_test_plan
        ▼
s5  BUILD MGMT         TC-S5-001 create_build (reuse-or-create, left OPEN) + list_builds
        │                → publishes build_id
        ▼
s6  EXECUTION          TC-S6-001 create_test_execution + read_test_execution
        ▼
s7  REQUIREMENTS       TC-S7-001 list_requirements
        │              TC-S7-003 TEARDOWN: close build → delete case (verified
        ▼                        gone) → delete plan
```

> **CRUD is embedded in the flow, not isolated in one test.** Create lands in the
> provision/s2 stages, Read/Update in the middle suites, Delete in teardown. The
> lifecycle *is* the suite run.

> **Logical order vs. suite number:** a case needs a suite first, a plan needs a
> case, etc. Execution order is enforced by the `dependencies` field (topological
> sort), so the real ordering follows the arrows above regardless of the numeric
> suite name.

A full `cli.ts run` executes 16 tests and passes against a **fresh** TestLink
(only precondition: the XML-RPC API is enabled), repeatably.

---

## Test data (stable named fixtures — no hardcoded or random IDs)

Every entity is created by the flow with a fixed name; all IDs are produced at
runtime and threaded, never hardcoded.

| Entity | Name | Notes |
|--------|------|-------|
| Project | `MCP Flow Tests` (prefix `MFT`) | created out-of-band by `flow-provision.ts` |
| Suite   | `Flow Suite` | idempotent (reused by name) |
| Case    | `Flow Case` | author `admin` (the built-in default user) |
| Plan    | `Flow Plan` | idempotent (reuse-or-create) |
| Build   | `Flow Build` | idempotent, left open for s6 |

Project creation is **not** an MCP tool, so the project fixture is provisioned
out-of-band via `flow-provision.ts` (uses the `testlink-xmlrpc` client directly).
Everything else is created through the MCP tools under test.

---

## How fixtures are threaded

Stages publish IDs to small files under a shared scratch dir; later stages read them:

```
/tmp/tl-flow/project_id        # numeric
/tmp/tl-flow/project_name      # used by create_test_plan (keys plans by NAME)
/tmp/tl-flow/prefix            # e.g. MFT
/tmp/tl-flow/suite_id
/tmp/tl-flow/case_ext_id       # MFT-N — used by read/update/delete/add-to-plan/execution
/tmp/tl-flow/plan_id
/tmp/tl-flow/build_id
```

A producing step writes the ID; consuming steps read it (steps run from the project
root, so use the full `cicd/tests/...` path):

```yaml
# producer (TC-S2-002 create)
command: |
  mkdir -p /tmp/tl-flow
  RESULT=$(npx tsx cicd/tests/src/mcp-client.ts create_test_case "$PAYLOAD" 2>/dev/null)
  echo "$RESULT" | python3 -c "import sys,json; a=json.loads(json.load(sys.stdin)['content'][0]['text'])[0]['additionalInfo']; open('/tmp/tl-flow/case_ext_id','w').write(open('/tmp/tl-flow/prefix').read().strip()+'-'+str(a['external_id']))"
# consumer (TC-S4-001 add-to-plan)
command: |
  CASE=$(cat /tmp/tl-flow/case_ext_id)
  npx tsx cicd/tests/src/mcp-client.ts add_test_case_to_test_plan "{...,\"testcaseid\":\"$CASE\"}"
```

Ordering is declared with `dependencies` (and `priority` to break ties):

```yaml
id: TC-S4-001
dependencies: [TC-S2-002]   # runs only after the case exists
```

---

## Running

Requires a reachable TestLink with the XML-RPC API enabled.

```bash
cd cicd/tests
export TESTLINK_URL=http://localhost:8090
export TESTLINK_API_KEY=<key>

npx tsx src/cli.ts run                  # full flow (s1 → s7 + teardown)
npx tsx src/cli.ts run --suite s4-test-plan   # one suite (deps auto-included)
npx tsx src/cli.ts run --id TC-S2-002         # one test (deps auto-included)
npx tsx src/cli.ts list                       # list all tests
```

- Suite shortcuts: `npm run test:s1` … `test:s7`.
- Results (JSON) are written to `cicd/results/<timestamp>_<suite>/`.
- Standing up a local TestLink: see the `testlink-code` fork's docker-compose
  (TestLink on `:8090`).

### Judging

- **Simple judge** (default): a test passes when every step exits 0, all
  `expectPatterns` match, no `rejectPatterns` match, and no `ERROR_PATTERNS`
  (`config.ts`) appear in the logs (minus `ERROR_EXCLUSIONS`, e.g. `isError`).
- **LLM judge** (opt-in, `--llm`): sends each result + `criteria` to an Ollama
  model for a semantic verdict. Final dual-mode verdict = `simple && llm`.

---

## Adding a test to the flow

1. Pick the stage and depend on the producer of the IDs you need
   (`dependencies: [TC-S2-002]`).
2. Read fixture IDs from `/tmp/tl-flow/*`; never hardcode project/suite/case IDs.
3. If your test creates a new fixture, give it a **stable name** and make creation
   idempotent (reuse-or-create), then publish its ID to `/tmp/tl-flow/` and clean
   it up in the teardown stage.
4. Each step `echo`s a marker (e.g. `READ_OK`) for `expectPatterns`; parse MCP JSON
   with `python3` rather than dumping raw responses (keeps the error scan clean).

### Don'ts
- ❌ Hardcoded instance IDs (`162`, `271`, `tm-14`, …) — they pin the suite to one
  TestLink and break everywhere else.
- ❌ IDs embedded in fixture names, or random/timestamp suffixes — use stable names
  with idempotent reuse-or-create instead.
- ❌ Per-test bootstrap of the whole project/suite — duplicate work; use the flow's
  shared fixtures.

---

## Known gaps (tracked in #60)

- **`get_requirement`** (`TC-S7-002`, disabled) — no `create_requirement` tool to
  provision a requirement fixture.
- **No `delete_test_suite` tool** — teardown can't delete the suite; provisioning is
  idempotent so it's reused rather than accumulated.
