---
name: testlink-mcp-code
description: Guidelines for writing or changing this project's MCP server code — adding or modifying TestLink tools
user-invocable: true
---

# MCP Tool Guidelines (testlink-mcp)

How to add or change a tool in this server, grounded in how the code actually works.
The rule above all: **read the closest existing tool and copy its shape** — don't
invent a new style.

## The layout (one file)

Everything lives in `src/index.ts`:
- **`TestLinkAPI` class** wraps `new TestLink({...})` from the `testlink-xmlrpc`
  client. Each operation is a method that calls the client and is wrapped in
  `this.handleAPICall(() => …)` for uniform error handling.
- **Tool registry** — the `ListToolsRequestSchema` handler returns an array of
  `{ name, description, inputSchema }`.
- **Dispatch** — the `CallToolRequestSchema` handler is a `switch` on tool name; each
  `case` destructures args and calls a `TestLinkAPI` method.

Adding a tool = one new `TestLinkAPI` method + one registry entry + one `switch` case.

## The client, and the escape hatch

Prefer the typed client method (`this.client.getTestCase(...)`, `createTestCase(...)`,
etc.). But the `testlink-xmlrpc` typed wrappers carry `@MandatoryFields` decorators
that **reject valid params before they reach the server** — and some operations have
no typed wrapper at all. When that happens, call the dispatcher directly:

```ts
(this.client as any)._performRequest('updateTestCase', params)
```

Existing precedents (study these): `updateTestCase` (typed wrapper hard-requires
`testcaseexternalid` and rejects a numeric `testcaseid`), `deleteTestCase`,
`deleteTestSuite` (no typed wrapper). Use `_performRequest` only for these reasons;
note why in a comment.

## Test-case identifiers

A test case can be addressed by **external** id (`PREFIX-123`) or **internal** numeric
id (`123`). Route it with the existing helper — never pass the raw id straight to a
param:

```ts
testCaseIdParam(id)   // → { testcaseexternalid: 'PREFIX-123' }  or  { testcaseid: '123' }
```

`EXTERNAL_TC_ID` / `parseTestCaseId` back it. Sending a numeric id as
`testcaseexternalid` resolves to the **wrong case** (this was bug #80). Any new tool
that takes a case id uses `testCaseIdParam`.

## Field conventions (match existing descriptions)

- **HTML** in `summary`, `steps[].actions`, `steps[].expected_results`,
  `preconditions` — TestLink stores/renders these as HTML.
- **Coded enums** — use the documented maps and state them in the tool description:
  `importance` 1=low / 2=medium / 3=high; `execution_type` 1=manual / 2=automated;
  execution status `p`=pass / `f`=fail / `b`=blocked. Prefer `Constants` from
  `testlink-xmlrpc` where it provides them.
- Validate inputs with the existing helpers (`validateNonEmptyString`, etc.).

## Synchronous, not async

TestLink XML-RPC is plain request/response. There is **no** async/polling/retry model
here — do not add `maxRetries`/`pollIntervalMs` or polling loops. A tool calls the
client once and returns.

## Tool descriptions are for the agent

The description is how an AI agent learns to call the tool. Keep it actionable:

```
[verb] [what it does]. PREREQUISITE: [condition] (use [tool]).
REQUIRED: [param] (use [tool] to get [param]). [destructive? warn].
```

Reference the tool that produces each id (e.g. *"the internal id from
`read_test_case`"*). Mark destructive operations (delete/overwrite) clearly.

## Checklist

- [ ] New `TestLinkAPI` method, wrapped in `handleAPICall`, modelled on the closest
      existing one
- [ ] Typed client method used; `_performRequest` only where a wrapper rejects valid
      params or none exists — with a comment saying why
- [ ] Case-id params routed through `testCaseIdParam`
- [ ] HTML/enum/status conventions followed and spelled out in the description
- [ ] Registry entry (`name` snake_case, `inputSchema`, required vs optional) + a
      `switch` case
- [ ] No async/polling machinery added
- [ ] Exercised through the `cicd/tests` end-to-end flow (see `agent-runner-flow`)
      — embed it in the connected flow, don't add a standalone test
