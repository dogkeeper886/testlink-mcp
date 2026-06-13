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
Every fixture is connected: the requirement covers the case, the case lives in
the suite and the plan, the build belongs to the plan, the execution records the
case in the build. No stage is an island.

This is why the suites are numbered: the number is the position in the flow.

```
s1  BUILD & DEPLOY     build server, validate startup, build docker image
        │              (no TestLink data — pure CI/build checks)
        ▼
s2  TEST CASE          TC-S2-001 provision: ensure project + suite
        │                → publishes project_id, project_name, prefix, suite_id
        │              TC-S2-002 create_test_case
        │                → publishes case_ext_id (MFT-N)
        │              TC-S2-003 read · TC-S2-004 update (external id)
        │              TC-S2-005 update by INTERNAL id (#80 regression)
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
        │              TC-S7-002 create req-spec + requirement → get_requirement
        │                        → link requirement to the flow CASE (coverage)
        │              TC-S7-003 TEARDOWN: close build → delete case (verified
        ▼                        gone) → delete plan → delete req-spec → delete suite
```

> **CRUD is embedded in the flow, not isolated in one test.** Create lands in the
> provision/s2 stages, Read/Update in the middle suites, Delete in teardown. The
> lifecycle *is* the suite run.

> **Logical order vs. suite number:** a case needs a suite first, a plan needs a
> case, etc. Execution order is enforced by the `dependencies` field (topological
> sort), so the real ordering follows the arrows above regardless of the numeric
> suite name.

A full `cli.ts run` executes 19 tests and passes against a **fresh** TestLink
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
| Req spec | `Flow Req Spec` (doc `FLOW-RS`) | idempotent (reuse-or-create) |
| Requirement | `Flow Requirement` (doc `FLOW-REQ`) | idempotent; inside the spec |

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
/tmp/tl-flow/reqspec_id
/tmp/tl-flow/requirement_id
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

![Dual-judge test runner with a keyless Claude ACP agent](../../docs/diagrams/agent-judge.png)

- **Simple judge** (default): a test passes when every step exits 0, all
  `expectPatterns` match, no `rejectPatterns` match, and no `ERROR_PATTERNS`
  (`config.ts`) appear in the logs (minus `ERROR_EXCLUSIONS`, e.g. `isError`).
  This is the always-on correctness floor.
- **Agent judge** (opt-in, `JUDGE_MODE=dual`): sends each result + `criteria` to an
  ACP agent for a semantic verdict — catching silent failures exit codes miss.
  Final dual-mode verdict = `simple && agent` (both must pass).

#### Configuring the agent judge

The agent judge is an [Agent Client Protocol](https://agentclientprotocol.com) (ACP)
client: it spawns an agent process and asks it to judge each result. **Auth is the
agent's job — the default runs keyless on a Claude subscription, no API key.**

```bash
JUDGE_MODE=dual npm test        # opt in the agent judge (env, not a flag)
```

| Env | Default | Meaning |
|-----|---------|---------|
| `JUDGE_MODE` | `simple` | `simple` = deterministic only; `dual` = also run the agent judge |
| `JUDGE_AGENT` | (bundled) | Command launching the ACP agent. Unset → the bundled Claude agent (`@agentclientprotocol/claude-agent-acp`). Set it to another ACP agent's command to swap models/vendors — **config, not code.** |

- **Auth (keyless):** the default Claude agent uses `~/.claude` locally and
  `CLAUDE_CODE_OAUTH_TOKEN` in CI. No `ANTHROPIC_API_KEY` needed. The model is
  chosen by the agent, not the runner.
- **Another model:** point `JUDGE_AGENT` at that vendor's ACP agent command, e.g.
  `JUDGE_AGENT="gemini-acp" JUDGE_MODE=dual npm test`. No code change.
- **Fallback:** if the agent can't be reached or can't answer, the run falls back to
  the simple judge — the simple judge is always the floor.

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

## Coverage

The full flow (17 tests) exercises the complete tool surface end to end and tears
down every fixture it creates (case, plan, build, requirement spec, suite),
leaving only the empty project for the next run. The earlier gaps —
`read_test_execution`, `create_test_execution` external IDs, self-contained
`get_requirement`, and `delete_test_suite` — were all addressed in #60.
