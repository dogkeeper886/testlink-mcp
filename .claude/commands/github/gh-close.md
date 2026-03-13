# Close GitHub Tracking Issue

```
Close a GitHub tracking issue with a summary of completed work.

Issue Number: {{input}}

## PURPOSE

Closes a dev tracking issue after tasks are complete. Adds a summary
comment documenting what was done, linking to the PR if applicable.

---

## WORKFLOW

    /gh-close 3
        │
        ├─► Step 1: Verify Completion
        │   - Fetch issue body: gh issue view <number> --json body,title,labels
        │   - Parse task list: count checked vs unchecked
        │   - If unchecked tasks remain:
        │     • Warn: "Issue #3 has 2 unchecked tasks. Close anyway? (y/n)"
        │     • If user says no, stop
        │     • If user says yes, proceed (partial completion)
        │
        ├─► Step 2: Generate Summary Comment
        │   - List completed tasks
        │   - List skipped/deferred tasks (if any)
        │   - Reference PR number if current branch has a PR
        │   - Note files created or modified
        │
        ├─► Step 3: Close Issue
        │   - Add summary comment: gh issue comment <number> --body "<summary>"
        │   - Close: gh issue close <number>
        │   - If a PR exists that addresses this issue, prefer closing via
        │     "Fixes #N" in the PR description instead
        │
        └─► Step 4: Report
            - Print closed issue number and URL
            - Print summary of completed work
            - Suggest next action (next open issue from /gh-status)

---

## SUMMARY COMMENT TEMPLATE

    ## Completed

    - [x] Task 1 description
    - [x] Task 2 description
    - [x] Task 3 description

    ## Deferred
    <!-- Only if there are unchecked tasks -->
    - [ ] Task 4 — deferred: reason

    ## Files Modified
    - src/index.ts — added bulkCreateTestCases()
    - .claude/commands/bulk-create.md (new)

    ## PR
    Closes via PR #14

---

## EXAMPLES

### Example 1: All tasks complete

    /gh-close 3

**Output:**

    Issue #3 closed: "Implement bulk create API method"
    All 5/5 tasks completed.
    Files: src/index.ts updated, tool added.
    Next open issue: #4 "Add command file" (2 tasks)

### Example 2: Partial completion

    /gh-close 3

**Output:**

    Issue #3 has 1 unchecked task:
      - [ ] Add integration test

    Close anyway? (y/n)

    > y

    Issue #3 closed with 4/5 tasks completed.
    Deferred: integration test (blocked on test environment).

### Example 3: Close via PR

If you have a branch with changes for this issue, include "Fixes #3" in the PR description. The issue will auto-close when the PR merges.

    gh pr create --title "[feat] Implement bulk create API" \
      --body "Fixes #3" --milestone "Add bulk test case creation"

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Prefer closing via PR "Fixes #N" for automatic traceability
- Summary comment provides a final record of what was done
- Deferred tasks should be tracked in a new issue if follow-up is needed
```
