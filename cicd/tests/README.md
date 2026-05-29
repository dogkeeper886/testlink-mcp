# TestLink MCP — Integration Test Framework

Integration tests for the MCP server. Each test spins up the **real** `dist/index.js`
server over stdio (via `src/mcp-client.ts`), calls its tools against a live TestLink,
and judges the responses. Tests are declarative YAML under `testcases/`.

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
s1  BUILD & DEPLOY        build server, validate startup, build docker image
        │                 (no TestLink data — pure CI/build checks)
        ▼
PROVISION                 ensure project, CREATE a test suite
        │                 → publishes  PROJECT_ID, SUITE_ID
        ▼
s2  TEST CASE             CREATE case in SUITE_ID → READ it → UPDATE it
        │                 → publishes  CASE_ID / CASE_EXT_ID
        │                 (DELETE is deferred to teardown — see below)
        ▼
s3  TEST SUITE            list suites, list cases in suite, update suite
        │                 (operates on PROJECT_ID / SUITE_ID)
        ▼
s4  TEST PLAN             CREATE plan → ADD CASE_ID to plan → get cases for plan
        │                 → publishes  PLAN_ID
        ▼
s5  BUILD MGMT            CREATE build under PLAN_ID → list builds → close build
        │                 → publishes  BUILD_ID
        ▼
s6  EXECUTION             record execution for CASE_ID in BUILD_ID → read execution
        │
        ▼
s7  REQUIREMENTS          list / get requirements (read-only)
        │
        ▼
TEARDOWN                  DELETE case, plan, suite  (reverse order; the "D" in CRUD)
```

> **CRUD is embedded in the flow, not isolated in one test.** Create lands in the
> provision/s2 stages, Read/Update in the middle suites, Delete in teardown. The
> lifecycle *is* the suite run.

> **Logical order vs. suite number:** a case needs a suite first, a plan needs a
> case, etc. Execution order is enforced by the `dependencies` field (topological
> sort), so the real ordering follows the arrows above regardless of the numeric
> suite name.

---

## How fixtures are threaded

Stages publish IDs to small files under a shared scratch dir; later stages read them.
This is the existing `/tmp/...id.txt` pattern, standardized:

```
/tmp/tl-flow/project_id
/tmp/tl-flow/suite_id
/tmp/tl-flow/case_ext_id     # e.g. MLT-1  (external ID used by read/update/delete)
/tmp/tl-flow/plan_id
/tmp/tl-flow/build_id
```

A producing step writes the ID; consuming steps read it:

```yaml
# producer (s2 create)
command: |
  RESULT=$(npx tsx src/mcp-client.ts create_test_case "$PAYLOAD" 2>/dev/null)
  EXT=$(echo "$RESULT" | python3 -c "import sys,json;d=json.loads(json.load(sys.stdin)['content'][0]['text']);print(d[0]['additionalInfo']['external_id'])")
  echo "$PREFIX-$EXT" > /tmp/tl-flow/case_ext_id
# consumer (s4 add-to-plan)
command: |
  CASE=$(cat /tmp/tl-flow/case_ext_id)
  npx tsx src/mcp-client.ts add_test_case_to_test_plan "{...,\"testcaseexternalid\":\"$CASE\"}"
```

Ordering is declared with `dependencies` (and `priority` to break ties):

```yaml
id: TC-S4-001
dependencies: [TC-S2-CREATE]   # runs only after the case exists
```

---

## Running

Requires a reachable TestLink with the XML-RPC API enabled and at least one project.

```bash
cd cicd/tests
export TESTLINK_URL=http://localhost:8090
export TESTLINK_API_KEY=<key>

npx tsx src/cli.ts run                  # full flow (s1 → s7 + teardown)
npx tsx src/cli.ts run --suite s4-test-plan   # one suite (deps auto-included)
npx tsx src/cli.ts run --id TC-S2-CREATE      # one test (deps auto-included)
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
   (`dependencies: [TC-S2-CREATE]`).
2. Read fixture IDs from `/tmp/tl-flow/*`; never hardcode project/suite/case IDs.
3. If your test creates a new fixture, publish its ID to `/tmp/tl-flow/` for
   downstream stages, and add a teardown step (or delete in a later stage).
4. Each step `echo`s a marker (e.g. `READ_OK`) for `expectPatterns`; parse MCP
   JSON with `python3` rather than dumping raw responses (keeps the error scan clean).
5. Add a `testlink_id` for traceability if the test maps to a TestLink case.

### Don'ts
- ❌ Hardcoded instance IDs (`162`, `271`, `tm-14`, …) — they pin the suite to one
  TestLink and break everywhere else.
- ❌ Per-test bootstrap of the whole project/suite — duplicate work; use the flow's
  shared fixtures instead.
