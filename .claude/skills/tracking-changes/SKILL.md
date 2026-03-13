---
name: tracking-changes
description: |
  Tracks dev work in GitHub using milestones, issues, and PRs.
  Use when starting a new feature (to initialize tracking), when breaking
  work into tasks, when implementing changes, or when resuming work
  in a new session.
disable-model-invocation: true
---

# tracking-changes

Tracks development work in GitHub with full provenance: what changed, why, and what's still open.

## Progress Checklist

Copy and track your progress:

```
- [ ] Step 1: Initialize tracking (first time only)
- [ ] Step 2: Create tracking issue for current work
- [ ] Step 3: Work through tasks, update checkboxes
- [ ] Step 4: Close issue when tasks are complete
```

## When to Track

The agent should create or update tracking issues at these points:

| After This Activity | Action |
|---------------------|--------|
| New user story or feature | Run `/gh-init` to create milestone, then `/gh-track` to log tasks |
| Planning / task breakdown | Run `/gh-track` to log each implementation task |
| Implementation work | Update issue checkboxes as tasks complete |
| Bug fix | Run `/gh-track` to log the fix |
| Review feedback | Run `/gh-track` to capture feedback as checklist |
| Documentation updates | Run `/gh-track` to log docs work |
| Session start (resuming work) | Run `/gh-status` to see open tasks |

## Steps

### Step 1: Initialize Tracking (First Time Only)

Run `/gh-init` with the feature or story name to create a GitHub milestone and ensure labels exist.

Skip if milestone already exists for this feature.

### Step 2: Create Tracking Issue

Run `/gh-track` to create a GitHub issue under the milestone. The agent should:

1. **Detect the task type** from context (feat, fix, refactor, docs, test)
2. **Write the source** — what triggered this work (user story, bug report, review)
3. **Write the rationale** — why this change is needed
4. **Break into tasks** — checkable items for each piece of work
5. **List references** — related issues, PRs

### Step 3: Work Through Tasks

As the agent completes each task:

1. Update the issue body to check off completed items
2. Add comments for significant findings or decisions
3. If blocked, comment with details and move to next task

### Step 4: Close Issue

Run `/gh-close` when all tasks are complete (or when closing with deferred items).

If changes were committed, prefer closing via PR with "Fixes #N" in the description.

## Session Recovery

At the start of a new session, if the user is resuming work on an existing feature:

1. Run `/gh-status` to see open issues and pending tasks
2. Pick up the first open issue or ask the user which to continue
3. Resume work from the unchecked tasks

## Branch Naming Convention

When creating a branch for an issue, use:

```
<type>/<short-desc>-#<issue>
```

Examples:
- `feat/bulk-create-#3`
- `fix/id-parsing-#4`
- `docs/command-files-#5`

## Integration with Dev Workflow

This skill runs alongside normal development:

```
User story arrives    → /gh-init + /gh-track   (tracking layer)
Plan / breakdown      → /gh-track per task      (tracking layer)
Implement             → branch, code, commit    (normal dev)
                      → update issue checkboxes (tracking layer)
Review / feedback     → /gh-track              (tracking layer)
Done                  → /gh-close or PR         (tracking layer)
Resume next session   → /gh-status             (tracking layer)
```
