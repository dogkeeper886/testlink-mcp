# Initialize GitHub Tracking for a Dev Task

```
Set up GitHub milestone and labels to track development work.

Story or Feature: {{input}}

## PURPOSE

Creates a GitHub milestone and ensures standard dev labels exist so all work
(features, fixes, refactoring, tests, docs) is tracked with full change history.

---

## WORKFLOW

```
/gh-init "Add bulk test case creation"
    │
    ├─► Step 1: Verify GitHub Access
    │   - Run: gh auth status
    │   - Run: gh repo view --json name,owner
    │   - Confirm we are in a GitHub-backed repository
    │
    ├─► Step 2: Create Labels (idempotent)
    │   - Create labels if they do not already exist:
    │     • feat         (color: #0e8a16) — New tool or capability
    │     • fix          (color: #d93f0b) — Bug fix
    │     • refactor     (color: #1d76db) — Code improvement
    │     • docs         (color: #c5def5) — Documentation, command files
    │     • test         (color: #e4e669) — Test coverage
    │     • priority:high (color: #b60205) — High priority
    │     • priority:med  (color: #fbca04) — Medium priority
    │     • priority:low  (color: #0e8a16) — Low priority
    │   - Use: gh label create "<name>" --color "<hex>" --description "<desc>" --force
    │
    ├─► Step 3: Create Milestone
    │   - Title: user's input (the story or feature name)
    │   - Description: "Dev tracking for: <story/feature description>"
    │   - Use: gh api repos/{owner}/{repo}/milestones --method POST
    │   - If milestone with same title exists, skip creation and use existing
    │
    └─► Step 4: Report
        - Print milestone number and URL
        - Print label summary
        - Print next step: "Run /gh-track to create tracking issues"
```

---

## EXAMPLE

```bash
/gh-init "Add bulk test case creation"
```

**Output:**
```
GitHub tracking initialized for "Add bulk test case creation"

Milestone: #2 "Add bulk test case creation"
URL: https://github.com/owner/repo/milestone/2

Labels verified: feat, fix, refactor, docs, test, priority:high/med/low

Next: Use /gh-track to create tracking issues under this milestone.
```

---

## API Notes

- Uses `gh` CLI (GitHub CLI) — must be authenticated
- Labels use `--force` flag so existing labels are updated, not duplicated
- Milestone creation checks for existing milestone with same title first
```
