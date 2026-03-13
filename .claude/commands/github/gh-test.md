# Test Implementation

```
Build and run tests for current implementation branch.

Issue or Branch: {{input}}

## PURPOSE

Verifies the implementation compiles and passes tests before creating a PR.
Reports results back to the GitHub issue as a comment.

---

## WORKFLOW

    /gh-test 17
        │
        ├─► Step 1: Detect Context
        │   - If input is a number: find branch for that issue
        │   - If input is empty: use current branch
        │   - Parse issue number from branch name (e.g., feat/foo-#17 → 17)
        │   - If not on a feature branch: warn and STOP
        │
        ├─► Step 2: Build
        │   - Run: npm run build
        │   - If fails: report TypeScript errors and STOP
        │   - Do NOT proceed to tests if build fails
        │
        ├─► Step 3: Run Tests
        │   - Run: npm test (if test script exists in package.json)
        │   - If no test script, check for cicd/tests/ and run those
        │   - If no tests exist: note "No tests found" and continue
        │   - If tests fail: report failures and STOP
        │
        ├─► Step 4: Report to Issue
        │   - Add comment to issue with results:
        │     gh issue comment <number> --body "<results>"
        │   - Comment includes: build status, test results, files changed
        │
        └─► Step 5: Report
            - Print build status (pass/fail)
            - Print test results (pass/fail/none)
            - If all pass: suggest "Run /gh-pr to create pull request"
            - If fail: suggest fixing the issues first

---

## ISSUE COMMENT TEMPLATE

    ## Test Results

    **Branch**: `feat/streamable-http-#17`
    **Build**: ✅ Pass
    **Tests**: ✅ Pass (or ⚠️ No tests found)

    ### Files Changed
    - src/index.ts (modified)
    - package.json (modified)

---

## EXAMPLES

### Example 1: All passing

    /gh-test 17

**Output:**

    Branch: feat/streamable-http-#17
    Issue: #17

    Build: ✅ npm run build succeeded
    Tests: ✅ 12 passed, 0 failed

    Comment added to issue #17.
    Next: Run /gh-pr to create pull request

### Example 2: Build failure

    /gh-test 17

**Output:**

    Branch: feat/streamable-http-#17
    Issue: #17

    Build: ❌ npm run build failed
    Error: src/index.ts(42,5): error TS2345: Argument of type...

    Fix the build errors before proceeding.

### Example 3: No input (auto-detect)

    /gh-test

**Output:**

    Detected branch: feat/streamable-http-#17
    Detected issue: #17
    ... (continues as normal)

---

## API Notes

- Uses `gh` CLI for issue comments
- Uses `npm` for build and test execution
- Always runs build before tests
- Stops on first failure (fail fast)
- If no tests exist, this is a warning not a failure
```
