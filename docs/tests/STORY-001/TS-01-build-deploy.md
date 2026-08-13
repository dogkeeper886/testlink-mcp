---
id: TS-01
title: The server builds, starts, and containerises
namespace: testlink-mcp
story: STORY-001
issue: 107
status: green
---

## Why this scenario exists

STORY-001 asks that the project compile, the server start, and the Docker image build — the
preconditions for anyone deploying testlink-mcp at all. These are the only cases in the flow
that touch no TestLink data, so they run first and gate everything downstream.

### TC-01: Project build verification

- **Objective:** the server compiles from a clean checkout with the locked dependencies.
- **Script:** cicd/tests/testcases/s1-build-deploy/TC-S1-001.yml
- **Preconditions:** Node 20+ and npm available.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Check the Node.js version (`node --version`) | prints a `vNN.NN.NN` version |
| 2 | Install dependencies from the lock file (`npm ci`) | completes with no `ERR!` |
| 3 | Compile TypeScript (`npm run build`) | no `error TS`, no `Cannot find`; `dist/index.js` is produced |

### TC-02: MCP server startup validation

- **Objective:** the server enforces its documented missing-key contract and ships a valid ES module.
- **Script:** cicd/tests/testcases/s1-build-deploy/TC-S1-002.yml
- **Preconditions:** TC-01 has produced `dist/`.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Start the server with `TESTLINK_API_KEY` blank, and assert the exit code is exactly 1 | `EXIT_OK` — the server self-exited via its own guard, not a timeout kill (124) or a missing-node error (127) |
| 2 | Syntax-check the entry point (`node --check dist/index.js`) | `MODULE_OK` |

### TC-03: Docker image build

- **Objective:** the published artifact builds and runs unprivileged.
- **Script:** cicd/tests/testcases/s1-build-deploy/TC-S1-003.yml
- **Preconditions:** Docker available; TC-01 has succeeded.

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Build the image (`docker build -t testlink-mcp:test .`) | no `ERROR`, no `failed to` |
| 2 | Inspect the image id | a `sha256:` digest is returned |
| 3 | Inspect the configured user | `nodejs` — the container does not run as root |
| 4 | Remove the test image | cleanup succeeds (tolerates an already-absent image) |
