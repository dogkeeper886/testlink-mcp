# Create GitHub Tracking Issue

```
Create a GitHub issue to track a dev task with checklist and provenance.

Task Description: {{input}}

## PURPOSE

Creates a GitHub issue under a milestone to track a specific development task
(feature implementation, bug fix, refactoring, docs update).
Each issue captures what changed, why, and what tasks remain.

---

## WORKFLOW

```
/gh-track "Implement bulk create API method"
    │
    ├─► Step 1: Determine Context
    │   - Identify the milestone (from current work context or user input)
    │   - Detect task type from context:
    │     • New tool, method, or capability → label: feat
    │     • Bug fix or correction → label: fix
    │     • Code improvement, cleanup → label: refactor
    │     • Command files, README, docs → label: docs
    │     • Test coverage → label: test
    │   - Detect priority (default: priority:med)
    │
    ├─► Step 2: Build Issue Body
    │   - Source: what triggered this work (user story, bug report, review)
    │   - Rationale: why this change is needed
    │   - Checklist: break work into checkable tasks
    │   - References: link to related issues, PRs
    │   - Use markdown template below
    │
    ├─► Step 3: Create Issue
    │   - Use: gh issue create --title "<title>" --body "<body>"
    │           --milestone "<milestone>" --label "<labels>"
    │   - Title format: "[<type>] <action description>"
    │     Examples:
    │     • "[feat] Add bulk test case creation tool"
    │     • "[fix] Fix external ID regex for lowercase prefixes"
    │     • "[docs] Add command file for bulk create"
    │
    └─► Step 4: Report
        - Print issue number and URL
        - Print checklist summary (N tasks)
        - Suggest branch name: <type>/<short-desc>-#<issue>
```

---

## ISSUE BODY TEMPLATE

```markdown
## Source
<!-- What triggered this work -->
- **Story/Feature**: [milestone or feature name]
- **Trigger**: [e.g., "New feature request" / "Bug report" / "Review feedback"]

## Rationale
<!-- Why this change is needed -->
[Brief explanation of why this work matters]

## Tasks
<!-- Break into checkable items -->
- [ ] Task 1 description
- [ ] Task 2 description
- [ ] Task 3 description

## References
<!-- Related issues, PRs, links -->
- Related: #N (if applicable)

## Files
<!-- Files expected to be created or modified -->
- `src/index.ts`
- `.claude/commands/example.md`
```

---

## EXAMPLES

### Example 1: Track feature implementation

```bash
/gh-track "Implement bulk create API method"
```

**Issue created:**
```
#3: [feat] Implement bulk create API method
Labels: feat, priority:high
Milestone: Add bulk test case creation

Tasks:
- [ ] Add bulkCreateTestCases() to TestLinkAPI
- [ ] Add input schema validation
- [ ] Add tool definition to tools array
- [ ] Add switch case routing
- [ ] Build and test

Branch: feat/bulk-create-#3
```

### Example 2: Track bug fix

```bash
/gh-track "Fix test case ID parsing for mixed-case prefixes"
```

**Issue created:**
```
#4: [fix] Fix test case ID parsing for mixed-case prefixes
Labels: fix, priority:med
Milestone: (auto-detect or ask)

Tasks:
- [ ] Update regex in parseTestCaseId()
- [ ] Test with mixed-case prefixes
- [ ] Build
```

---

## UPDATING TASK STATUS

When working through tasks, update the issue body checkboxes:
- Use: gh issue edit <number> --body "<updated body>"
- Or add a comment with progress: gh issue comment <number> --body "<update>"

When all tasks are complete, close the issue with `/gh-close`.

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Milestone must exist first (run `/gh-init` if needed)
- Labels must exist (created by `/gh-init`)
- Issue title should be concise but descriptive
- Body uses GitHub-flavored markdown with task lists
```
