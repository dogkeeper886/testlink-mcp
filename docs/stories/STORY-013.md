# STORY-013: Keep the server on a supported MCP protocol era — study first, then update

## User Story

As a maintainer of testlink-mcp,
I want the server's MCP SDK brought onto a version that is still supported and speaks a
current protocol revision — decided by a study before any code moves,
So that clients keep connecting as the ecosystem moves on, without me gambling a working
server on a rewrite I haven't sized.

## The Need

The MCP specification has moved twice since this server was pinned. The published
`2026-07-28` revision is the largest break since launch — a stateless core with no
`initialize` handshake, per-request metadata, and Roots/Sampling/Logging deprecated — and
the SDK split into a v2 line (`@modelcontextprotocol/server` / `@modelcontextprotocol/client`)
to speak it. The v1 line the server uses is on a support clock.

The repo is also inconsistent with itself: the server declares `^1.0.0` and resolves to an
older SDK than the test runner, which declares `^1.27.1`. Two halves of one project
negotiating different protocol revisions is a bug waiting to surface as "works in the test
suite, fails in a real client".

The maintainer does not want to jump straight at v2. The server is stdio-only, so most of
the headline break is not its surface, and the cost of the two available moves is wildly
different — one is a dependency refresh, the other reshapes how every tool is declared.
Which move is warranted is exactly what the study has to answer, and it has to answer it
before implementation starts.

## Success Looks Like

- The maintainer can say which SDK line the server is on and why, backed by a written
  study rather than a guess — including what it would cost to go further, so the decision
  can be revisited without redoing the research.
- The server and the test runner agree on one SDK version; the project no longer speaks two
  protocol revisions to itself.
- A real MCP client still drives all 27 tools exactly as before — nothing a user can ask
  for changes.
- **The update is proven by the tests that already exist.** A normal suite run is green
  with no new test cases and no edits to the existing ones. If passing needs a test
  changed, that is a finding to report, not a change to make quietly.

## Open Questions

- Does the study land on refreshing within v1, or migrating to v2 for the `2026-07-28`
  revision? What evidence decides it — client compatibility, support window, the size of
  the tool-declaration rewrite?
- If v2 wins: the test runner is itself an SDK *client*. Moving it is test infrastructure,
  not a test case — does that stay inside the "no test changes" constraint, or does it
  make v2 a separate story? (Settle on the plan before any task is cut.)
- Is there a client in the wild that already refuses the server's current protocol
  revision, or is this purely getting ahead of the support clock? The answer changes the
  urgency, not the direction.

## Status

- Created: 2026-08-03
- Plan: #97 — **study done**, planned as a **v1 refresh to `^1.30.0`** (drop-in; every
  symbol `src/index.ts` imports is still exported). v2 / `2026-07-28` deferred: it would
  rewrite all 27 tool declarations and the runner's client, on the two surfaces the QA
  plan found uncovered.
- Issues: #98 (align server + runner on `^1.30.0`) — deliberately one task; the
  verification is the bump's acceptance evidence, not separable work.
