# Merge Pull Request

```
Merge PR, clean up branch, and check milestone completion.

PR Number: {{input}}

## PURPOSE

Merges an approved PR, deletes the feature branch, switches back to main,
and closes the milestone if all issues are done.

---

## WORKFLOW

    /gh-merge 21
        │
        ├─► Step 1: Detect Context
        │   - If input is a number: use that PR
        │   - If empty: detect PR from current branch
        │     Run: gh pr view --json number -q .number
        │   - Fetch PR details: gh pr view <number> --json state,title,headRefName,
        │     milestone,reviewDecision,statusCheckRollup
        │
        ├─► Step 2: Verify PR Status
        │   - If PR is already merged or closed: report and STOP
        │   - Check CI status: gh pr checks <number>
        │   - If checks failing: report which checks failed and STOP
        │   - If review required but not approved: warn and STOP
        │   - If checks pending: warn and ask to wait or proceed
        │
        ├─► Step 3: Merge
        │   - Run: gh pr merge <number> --squash --delete-branch
        │   - Squash merge keeps history clean
        │   - --delete-branch removes remote feature branch
        │
        ├─► Step 4: Update Local
        │   - Run: git checkout main && git pull
        │   - Delete local branch if it still exists:
        │     git branch -d <branch-name>
        │
        ├─► Step 5: Check Milestone
        │   - Find milestone from PR metadata
        │   - Count open issues: gh issue list --milestone "<name>" --state open
        │   - If no open issues remain:
        │     Close milestone: gh api repos/{owner}/{repo}/milestones/{N}
        │                      --method PATCH -f state=closed
        │     Print: "Milestone '<name>' completed and closed"
        │   - If open issues remain:
        │     Print: "Milestone '<name>': N issues remaining"
        │     Suggest next open issue
        │
        └─► Step 6: Report
            - Print merge result
            - Print milestone status
            - If more issues: suggest "/gh-implement <next-issue>"
            - If milestone done: suggest "/gh-status to review"

---

## EXAMPLES

### Example 1: Clean merge, more issues remain

    /gh-merge 21

**Output:**

    PR #21 "Add Express server with Streamable HTTP endpoint"
    CI: ✅ All checks passed
    Review: ✅ Approved

    Merged via squash. Branch feat/streamable-http-#17 deleted.
    Switched to main, pulled latest.

    Milestone "HTTP Transport Support for Dify Integration":
      3 issues remaining (#18, #19, #20)

    Next: Run /gh-implement 18

### Example 2: Milestone complete

    /gh-merge 24

**Output:**

    PR #24 "Update Dockerfile and documentation for HTTP transport"
    CI: ✅ All checks passed

    Merged via squash. Branch docs/http-transport-#20 deleted.
    Switched to main, pulled latest.

    Milestone "HTTP Transport Support for Dify Integration":
      All issues closed. Milestone closed. ✅

### Example 3: CI failing

    /gh-merge 21

**Output:**

    PR #21 "Add Express server with Streamable HTTP endpoint"
    CI: ❌ build (failed), ❌ test (failed)

    Cannot merge — CI checks are failing.
    Run /gh-test to diagnose, or check the PR for details.

### Example 4: Auto-detect from branch

    /gh-merge

**Output:**

    Detected PR #21 from branch feat/streamable-http-#17
    ... (continues as normal)

---

## API Notes

- Uses `gh` CLI for PR operations and milestone management
- Uses `git` for local branch cleanup
- Squash merge is the default strategy (clean history)
- --delete-branch removes the remote branch automatically
- Local branch is cleaned up separately with git branch -d
- Milestone is auto-closed only when ALL issues under it are closed
- If the PR has "Fixes #N" in the body, the issue auto-closes on merge
```
