# TestLink MCP Server

[![Docker pulls](https://img.shields.io/docker/pulls/dogkeeper886/testlink-mcp)](https://hub.docker.com/r/dogkeeper886/testlink-mcp)
[![Docker image size](https://img.shields.io/docker/image-size/dogkeeper886/testlink-mcp)](https://hub.docker.com/r/dogkeeper886/testlink-mcp)
[![Docker version](https://img.shields.io/docker/v/dogkeeper886/testlink-mcp?sort=semver)](https://hub.docker.com/r/dogkeeper886/testlink-mcp/tags)

Run your TestLink test management from an AI assistant, in plain English. Create suites,
write and refine test cases, build test plans, record executions, and link requirements
by chatting with any [Model Context Protocol](https://modelcontextprotocol.io) client.

![Architecture: MCP clients drive TestLink through the server](https://raw.githubusercontent.com/dogkeeper886/testlink-mcp/main/docs/diagrams/architecture.png)

TestLink is capable but slow to drive by hand, since every case edit, plan, and execution
is a trip through the web UI. This image puts an MCP server in front of TestLink's XML-RPC
API so your assistant does that work instead. It speaks MCP over stdio and TestLink over
XML-RPC; you only see the conversation.

## Quick start

```bash
docker pull dogkeeper886/testlink-mcp:latest
```

The container reads its configuration from two environment variables and talks over stdio,
so it is launched by your MCP client rather than run as a background service.

**Claude Code**

```bash
claude mcp add testlink -- docker run --rm -i \
  -e TESTLINK_URL=http://your-testlink-host/testlink \
  -e TESTLINK_API_KEY=your_api_key_here \
  dogkeeper886/testlink-mcp:latest
```

**Cursor and other MCP clients** — add to your MCP config:

```json
{
  "mcpServers": {
    "testlink": {
      "command": "docker",
      "args": ["run", "--rm", "-i",
        "-e", "TESTLINK_URL=http://your-testlink-host/testlink",
        "-e", "TESTLINK_API_KEY=your_api_key_here",
        "dogkeeper886/testlink-mcp:latest"]
    }
  }
}
```

Then ask your assistant: *"List the test suites in project 1."*

The server prints nothing at all, so silence is what a working start looks like. If the
container exits immediately with status 1, `TESTLINK_API_KEY` is unset — that is the only
thing it refuses to start without, and it says so with the exit code rather than a message.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `TESTLINK_URL` | in practice | Base URL of your TestLink instance, e.g. `http://192.168.1.100/testlink`. Left unset it falls back to `http://localhost/testlink`, which is almost never right: the server starts anyway and then every call fails. |
| `TESTLINK_API_KEY` | yes | API key from *My Settings → API interface → Generate key*. Left unset the container exits with status 1 and prints nothing. |

The XML-RPC API must be enabled on your TestLink installation for any of this to work.

## Tools

30 tools, across the whole TestLink object model.

| Area | Tools |
|------|-------|
| Test cases (4) | `create_test_case`, `read_test_case`, `update_test_case`, `delete_test_case` |
| Test suites (5) | `create_test_suite`, `update_test_suite`, `delete_test_suite`, `list_test_suites`, `list_test_cases_in_suite` |
| Test plans (5) | `create_test_plan`, `delete_test_plan`, `list_test_plans`, `add_test_case_to_test_plan`, `get_test_cases_for_test_plan` |
| Builds (3) | `create_build`, `close_build`, `list_builds` |
| Executions (2) | `create_test_execution`, `read_test_execution` |
| Requirements (7) | `create_requirement_specification`, `delete_requirement_specification`, `list_requirement_specifications`, `create_requirement`, `get_requirement`, `list_requirements`, `assign_requirements` |
| Projects (4) | `create_project`, `update_project`, `delete_project`, `list_projects` |

Every tool works against a stock TestLink with XML-RPC enabled, with one exception.
`update_project` calls `tl.updateTestProject`, which upstream TestLink does not ship; it
exists in the [dogkeeper886/testlink-code](https://github.com/dogkeeper886/testlink-code)
fork on `main`. Against a server without it, the tool names the missing method instead of
returning a raw XML-RPC fault.

## Image tags

| Tag | What it points at |
|-----|-------------------|
| `latest` | The newest release |
| `1.6.0` | An exact version, pinned |
| `1.6` | The latest patch on that minor line |

Published tags follow unprefixed semver. The `v1.1` and `v1.2` tags predate that scheme
and are not updated.

## What is in the image

`linux/amd64` only. There is no ARM build, so on Apple Silicon it runs under emulation.

Around 53 MB compressed, built from `node:20-alpine` in a multi-stage Dockerfile and
running as a non-root user with production dependencies only.

## Troubleshooting

**Cannot connect to TestLink.** Check that `TESTLINK_URL` is reachable *from inside the
container*, which is not the same as from your desktop. A TestLink running on your own
machine is not at `localhost` from the container's point of view: use
`host.docker.internal` on Docker Desktop, or the host's LAN address on Linux.

**Invalid API key.** Regenerate the key in TestLink and confirm API access is enabled for
your user.

**Edits land on the wrong test case.** Pass either the external ID (`PREFIX-123`) or the
numeric internal ID. The server routes each correctly, but they are different numbers for
the same case.

## Source and support

Everything else lives in the GitHub repository: the full README, instructions for running
from source, and three reusable Claude skills — `testlink-sync` to turn a spec or a folder
of markdown into TestLink content, `testlink-review` to read it back and check it, and
`testlink-format` for TestLink's rich-text markup.

- Repository: https://github.com/dogkeeper886/testlink-mcp
- Issues: https://github.com/dogkeeper886/testlink-mcp/issues
- TestLink fork used for development: https://github.com/dogkeeper886/testlink-code

No license has been published for this project yet. Open an issue if you need licensing
clarified before use.
