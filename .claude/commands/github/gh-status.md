# GitHub Dev Tracking Status

```
Show open tracking issues and pending tasks for a milestone.

Milestone or Feature: {{input}}

## PURPOSE

Lists all GitHub issues under a milestone, showing what dev work is done and
what remains. Gives the agent session-start context to resume work.

---

## WORKFLOW

    /gh-status "Add bulk test case creation"
        │
        ├─► Step 1: Find Milestone
        │   - Search milestones matching the input
        │   - Use: gh api repos/{owner}/{repo}/milestones --jq '.[] | select(.title | test("<input>"; "i"))'
        │   - If not found: "No milestone found. Run /gh-init first."
        │
        ├─► Step 2: List Issues
        │   - Fetch all issues (open + closed) under the milestone
        │   - Use: gh issue list --milestone "<title>" --state all --json number,title,state,labels,body
        │
        ├─► Step 3: Parse Open Tasks
        │   - For each open issue, count checked vs unchecked tasks in body
        │   - Extract unchecked items (lines matching "- [ ]")
        │
        └─► Step 4: Report
            - Print summary table
            - Print open tasks list
            - Suggest next action

---

## OUTPUT FORMAT

    ## Dev Tracking Status: Add bulk test case creation

    ### Summary
    | # | Title | Labels | Tasks | Status |
    |---|-------|--------|-------|--------|
    | #3 | Implement bulk create API | feat | 5/5 | Closed |
    | #4 | Add command file | docs | 1/3 | Open |
    | #5 | Update README | docs | 0/2 | Open |

    ### Open Tasks

    **#4 — Add command file** (2 remaining)
    - [ ] Write .claude/commands/bulk-create.md
    - [ ] Test command with Claude

    **#5 — Update README** (2 remaining)
    - [ ] Add tool to README table
    - [ ] Add usage example

    ### Suggested Next Action
    Pick up issue #4 — 2 tasks remaining.

---

## USE CASES

### Session Start
Run at the beginning of a new session to see where you left off:

    /gh-status "Add bulk test case creation"

The agent reads open tasks and resumes work without asking the user.

### Progress Check
Run mid-session to see how much work remains.

### Milestone Completion
When all issues are closed, the milestone can be closed:

    gh api repos/{owner}/{repo}/milestones/{number} --method PATCH -f state=closed

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Parses task lists from issue bodies (GitHub-flavored markdown checkboxes)
- Shows both open and closed issues for complete picture
- Milestone search is case-insensitive substring match
```
