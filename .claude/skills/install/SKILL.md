---
name: install
description: Install test framework into a project with agent-driven configuration
user-invocable: true
---

# Install Test Framework

Install the dual-judge test framework into the current project.

```
$ARGUMENTS

## PURPOSE

Install the test framework from the template source into the user's current working directory, adapting configuration to the project's needs.

---

## AGENT WORKFLOW

### Step 1: Locate Template Source

Input is the path to the agent-workflows-runner repo:
- If provided: use it directly
- If empty: check common locations (`~/src/agent-workflows-runner`, `../agent-workflows-runner`)
- If not found: ask the user for the path

Read the template's `CLAUDE.md` to understand available components and the installation flow.

### Step 2: Detect Project Context

Examine the current working directory:

1. **Read `package.json`** — extract project name, check for `@modelcontextprotocol/sdk`
2. **Check for `docker-compose.yml`** — Docker project?
3. **Check for existing `cicd/tests/`** — fresh install or update?
4. **Check `.claude/skills/`** — what skills are already installed?

### Step 3: Ask Configuration Questions

Prompt the user with detected defaults:

- **Project name** — from package.json or ask
- **Judge mode** — default: `simple` (deterministic, no model); `dual` opts in the agent judge
- **Judge agent** (`JUDGE_AGENT`) — command launching the ACP agent; unset → the bundled
  Claude ACP agent, keyless via `~/.claude` / `CLAUDE_CODE_OAUTH_TOKEN`. Set to another
  ACP agent's command to swap models/vendors (the model lives in the agent).
- **Include MCP client?** — auto-yes if MCP SDK detected
- **Include Docker log collector?** — auto-yes if docker-compose found
- **Install Claude skills?** — recommend yes
- **Install example test cases?** — yes for fresh install, ask for updates

### Step 4: Install

1. **Create directories:**
   - `cicd/tests/src/judge/`
   - `cicd/tests/src/reporter/`
   - `cicd/tests/testcases/{build,integration,e2e}/`
   - `cicd/scripts/`
   - `cicd/results/`

2. **Copy files** from template source to current project:
   - Core: `cli.ts`, `config.ts`, `types.ts`, `loader.ts`, `executor.ts`
   - Judges: `judge/simple-judge.ts`, `judge/agent-judge.ts`, `judge/index.ts`
   - Reporters: `reporter/console.ts`, `reporter/json.ts`, `reporter/index.ts`
   - Supporting: `package.json`, `tsconfig.json`
   - Conditional: `log-collector.ts` (Docker), `mcp-client.ts` (MCP)
   - Skills: `ci-testcase`, `ci-run`, `add-tool` (to `.claude/skills/`)
   - Rules: `test-yaml-format.md`, `workflow-patterns.md` (to `.claude/rules/`)
   - Examples: test case YAML files (if selected)
   - Scripts: `format-results.sh`

3. **Adapt config.ts** — replace placeholder values with user's answers:
   - `projectName: 'my-project'` -> actual project name
   - `sessionPrefix: 'test-session'` -> `'{name}-session'`
   - `llm.model` -> user's judge model (default `claude-haiku-4-5-20251001`)
   - `llm.baseUrl` -> user's endpoint, if any (else leave unset for the hosted Anthropic API)

4. **Create `.gitignore`** in `cicd/results/`:
   ```
   *
   !.gitignore
   ```

5. **Run `npm install`** in `cicd/tests/`

### Step 5: Verify

1. Run `cd cicd/tests && npm run build` — must compile
2. Run `npm run list` — must load test cases
3. If either fails, diagnose and fix

### Step 6: Report

Show the user:
- What was installed (components list)
- Configuration values applied
- Next steps:
  - Write test cases: `cicd/tests/testcases/<suite>/*.yml`
  - Customize error patterns: `cicd/tests/src/config.ts`
  - Run tests: `cd cicd/tests && npm test`
  - Generate test cases: `/ci-testcase`

---

## FOR UPDATES

If `cicd/tests/` already exists:

1. **Preserve user files** — do NOT overwrite:
   - `config.ts` (user's configuration)
   - `testcases/**/*.yml` (user's test cases)
   - Any files the user has customized

2. **Update framework files** — compare and update:
   - `executor.ts`, `loader.ts`, `types.ts`, `cli.ts`
   - Judge and reporter files
   - `package.json` (merge dependencies, don't overwrite scripts)

3. **Show diff** before applying updates — let user approve changes

---

## OUTPUT

Summary of installed/updated components with next steps.
