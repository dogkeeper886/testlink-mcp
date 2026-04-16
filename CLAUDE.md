# TestLink MCP Server

## Project

MCP server connecting Claude to TestLink test management. TypeScript, Node.js 20+, Docker.

## Code Style

Fail fast, keep simple. See `.claude/skills/code-review/` for full guidelines.

## Agent Behavior Rules

1. **Apply changes uniformly** — When modifying one file in a group (e.g., workflow files, config files), apply the same change to ALL files in that group. Do not skip files based on reasoning about whether they "need" it.
2. **Do not assume future state** — Never justify skipping work by predicting what will or won't happen (e.g., "IDs will always be unique"). Apply the change, then flag concerns as separate issues.
3. **Do not narrow scope without asking** — If the user says "fix all workflows", fix ALL workflows. Do not decide some don't need fixing.
4. **Flag concerns separately** — If you spot a potential issue during implementation, finish the implementation first, then raise the concern as a separate issue or comment. Do not let concerns block or reduce the current work.
5. **Consistency over optimization** — When in doubt, prefer consistent treatment across similar files over "smart" selective changes.

## Dev Workflow

### Commands

| Command | Purpose | Phase |
|---------|---------|-------|
| `/gh-init "<feature>"` | Create milestone + dev labels | Plan |
| `/gh-track "<task>"` | Create issue under milestone with task checklist | Plan |
| `/tl-define <issue#>` | Create test cases in TestLink for issue | Define |
| `/gh-status "<feature>"` | Show open issues and pending tasks | Any |
| `/gh-implement <issue#>` | Create branch, implement tasks, update checkboxes | Build |
| `/gh-test <issue#>` | Build + run tests, report results to issue + TestLink | Verify |
| `/gh-pr <issue#>` | Push branch, create PR with traceability | Deliver |
| `/gh-merge <pr#>` | Merge PR, delete branch, close milestone if done | Deliver |
| `/gh-close <issue#>` | Close issue with summary comment | Deliver |
| `/evolve` | Analyze project history, suggest improvements | Any |

### Lifecycle

```
User Request
  ├─► PLAN → TRACK → DEFINE → IMPLEMENT → TEST → PR → MERGE → NEXT
  │
  Rules:
  - MERGE requires explicit user approval (NEVER auto-merge)
  - Implement issues sequentially (one branch per issue)
  - Commit messages include "refs #N"
  - Check off task checkboxes as each completes
  - PR body includes "Fixes #N" to auto-close issue
```

### Auto-Trigger Rules

The agent advances automatically EXCEPT before merge:

1. After user approves plan → `/gh-init` then `/gh-track`
2. After tracking, if testable → `/tl-define`
3. After test cases defined → `/gh-implement` first open issue
4. After all checkboxes checked → `/gh-test`
5. After tests pass → `/gh-pr`
6. After PR created → **STOP** (merge is human decision)
7. After user says merge → `/gh-merge`
8. After merge → next issue or close milestone

### Conventions

- **Branches**: `<type>/<short-desc>-#<issue>` (types: feat, fix, refactor, docs, test)
- **Issue titles**: `[<type>] <action description>`
- **Labels**: feat, fix, refactor, docs, test + priority:high/med/low

### Traceability

```
Milestone (user story)
  └─► Issue #N (task checklist)
       ├─► TestLink test cases (via /tl-define)
       ├─► Branch + commits (refs #N)
       ├─► PR (Fixes #N → auto-close)
       └─► Test results (reported to issue + TestLink)
```
