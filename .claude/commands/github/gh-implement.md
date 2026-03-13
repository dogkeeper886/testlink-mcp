# Implement GitHub Issue

```
Set up branch and implement all tasks for a tracked issue.

Issue Number: {{input}}

## PURPOSE

Creates a branch for the issue, reads the task checklist, implements each
task, commits with issue references, and updates checkboxes as work completes.

---

## WORKFLOW

    /gh-implement 3
        │
        ├─► Step 1: Load Issue Context
        │   - Run: gh issue view <number> --json title,body,labels,milestone
        │   - Parse type from title prefix: [feat] → feat, [fix] → fix
        │   - Parse task checklist from body (unchecked items)
        │   - Parse expected files from body "Files" section
        │   - If issue is closed or has no tasks: warn and STOP
        │
        ├─► Step 2: Create Branch
        │   - Generate branch name: <type>/<short-desc>-#<number>
        │   - Run: git checkout main && git pull
        │   - Run: git checkout -b <branch>
        │   - If branch already exists: checkout and continue
        │
        ├─► Step 3: Implement Tasks
        │   - For each unchecked task in the checklist:
        │     a. Read relevant source files, understand context
        │     b. Implement the change
        │     c. Stage and commit: git commit -m "<task description> refs #<number>"
        │     d. Update issue checkbox to checked:
        │        - Fetch current body: gh issue view <number> --json body -q .body
        │        - Replace "- [ ] <task>" with "- [x] <task>"
        │        - Update: gh issue edit <number> --body "<new body>"
        │     e. If new files created, update "Files" section in issue body
        │
        └─► Step 4: Report
            - Print branch name and commit count
            - Print tasks completed (N/N)
            - Print files modified
            - Suggest: "Run /gh-test to verify"

---

## CHECKPOINT: UPDATING ISSUE CHECKBOXES

After completing each task, update the issue body:

    # Fetch current body
    BODY=$(gh issue view <number> --json body -q .body)

    # Replace unchecked with checked for the completed task
    # "- [ ] Task description" → "- [x] Task description"

    # Update issue
    gh issue edit <number> --body "$BODY"

Important: Always fetch the latest body before updating to avoid
overwriting changes made by other processes.

---

## EXAMPLES

### Example 1: Implement a feature issue

    /gh-implement 17

**Output:**

    Loaded issue #17: [feat] Add Express server with Streamable HTTP endpoint
    Milestone: HTTP Transport Support for Dify Integration
    Tasks: 6 unchecked

    Created branch: feat/streamable-http-#17

    ✓ Task 1/6: Add express and @types/express dependencies
      commit: a1b2c3d "Add express dependency refs #17"
      ☑ Checkbox updated

    ✓ Task 2/6: Create Express app with /mcp route
      commit: d4e5f6a "Add Express app with /mcp route refs #17"
      ☑ Checkbox updated

    ... (continues for each task)

    Branch: feat/streamable-http-#17 (6 commits)
    Tasks: 6/6 completed
    Files: src/index.ts, package.json

    Next: Run /gh-test to verify

### Example 2: Resume partial implementation

    /gh-implement 17

**Output:**

    Loaded issue #17: [feat] Add Express server with Streamable HTTP endpoint
    Branch feat/streamable-http-#17 already exists, resuming.
    Tasks: 2 unchecked (4 already done)

    ... (implements remaining 2 tasks)

---

## API Notes

- Uses `gh` CLI (GitHub CLI) for issue reads and updates
- Uses `git` for branch creation and commits
- Commit messages always include `refs #<number>` for traceability
- Branch naming follows convention: <type>/<short-desc>-#<issue>
- If a task is unclear, ask the user before implementing
- Follow all code review guidelines from CLAUDE.md when implementing
```
