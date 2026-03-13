# Create Pull Request

```
Push branch and create a PR with full traceability.

Issue Number: {{input}}

## PURPOSE

Creates a pull request that links back to the tracking issue, includes
a summary of changes, files modified, and sets up auto-close via "Fixes #N".

---

## WORKFLOW

    /gh-pr 17
        │
        ├─► Step 1: Detect Context
        │   - If input is a number: use that issue
        │   - If empty: parse issue number from current branch name
        │   - Fetch issue details: gh issue view <number> --json title,body,labels,milestone
        │   - Parse milestone name for PR metadata
        │
        ├─► Step 2: Verify Readiness
        │   - Check all task checkboxes are checked in issue body
        │   - If unchecked tasks remain: warn and ask to proceed or STOP
        │   - Run: npm run build (must pass)
        │   - If build fails: report and STOP
        │
        ├─► Step 3: Push Branch
        │   - Run: git push -u origin <branch>
        │   - If already pushed, force is NOT needed (just push new commits)
        │
        ├─► Step 4: Build PR Body
        │   - Title: issue title without [type] prefix
        │   - Body from template below:
        │     • Summary from issue rationale
        │     • Files changed (from git diff --name-only main..HEAD)
        │     • Test results (from latest issue comment or re-run)
        │     • Traceability: Fixes #N, milestone link
        │
        ├─► Step 5: Create PR
        │   - Run: gh pr create --title "<title>" --body "<body>"
        │           --milestone "<milestone>" --label "<labels>"
        │   - If PR already exists for this branch: print URL and STOP
        │
        └─► Step 6: Report
            - Print PR number and URL
            - Print: "Waiting for CI checks"
            - Suggest: "After CI passes and review approved, run /gh-merge"

---

## PR BODY TEMPLATE

    ## Summary
    <1-3 bullet points from issue rationale>

    ## Changes
    <list of files modified/created from git diff>

    ## Test Results
    - Build: ✅ Pass
    - Tests: ✅ Pass (or N/A)

    ## Traceability
    - Fixes #<issue>
    - Milestone: <milestone name>

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## EXAMPLES

### Example 1: Create PR for a feature issue

    /gh-pr 17

**Output:**

    Issue: #17 [feat] Add Express server with Streamable HTTP endpoint
    Milestone: HTTP Transport Support for Dify Integration
    Tasks: 6/6 completed ✅
    Build: ✅ Pass

    Pushed branch: feat/streamable-http-#17
    Created PR #21: "Add Express server with Streamable HTTP endpoint"
    URL: https://github.com/owner/repo/pull/21

    Waiting for CI checks.
    Next: After CI passes, run /gh-merge 21

### Example 2: Unchecked tasks warning

    /gh-pr 17

**Output:**

    Issue #17 has 1 unchecked task:
      - [ ] Handle DELETE for session termination

    Create PR anyway? (y/n)

### Example 3: Auto-detect from branch

    /gh-pr

**Output:**

    Detected branch: feat/streamable-http-#17
    Detected issue: #17
    ... (continues as normal)

---

## API Notes

- Uses `gh` CLI for PR creation and issue reads
- Uses `git` for push and diff
- PR title omits the [type] prefix from issue title for cleaner display
- PR body uses "Fixes #N" to auto-close the issue on merge
- Milestone and labels are copied from the issue to the PR
- If a PR already exists for the branch, reports the existing PR URL
```
