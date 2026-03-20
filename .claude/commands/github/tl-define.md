# Define Test Cases in TestLink

```
Create test cases in TestLink for a GitHub issue before implementation begins.

Issue: {{input}}

## PURPOSE

Creates test cases in TestLink as the single source of truth BEFORE writing code.
Test cases define WHAT to test. YAML scripts written during implementation define HOW to test.
This ensures TestLink drives test design, not the other way around.

---

## WORKFLOW

    /tl-define 42
        │
        ├─► Step 1: Read Issue
        │   - Fetch issue body: gh issue view <number> --json body,title -q .
        │   - Extract acceptance criteria / expected behavior
        │   - Identify distinct test scenarios (happy path, edge cases, error cases)
        │
        ├─► Step 2: Determine Test Suite
        │   - Use MCP tool: list_test_suites to find existing suites
        │   - Match issue to appropriate suite, or create one via create_test_suite
        │
        ├─► Step 3: Create Test Cases in TestLink
        │   - For each identified scenario:
        │     - Use MCP tool: create_test_case
        │       - testcasename: descriptive name matching scenario
        │       - testsuiteid: from Step 2
        │       - summary: what is being tested
        │       - steps: verification steps
        │       - expectedresults: expected outcome
        │       - importance: 2 (medium) by default, 3 (high) for critical paths
        │     - Record returned test case ID
        │
        ├─► Step 4: Add to Test Plan
        │   - Use MCP tool: list_test_plans to find active plan
        │   - For each created test case:
        │     - Use MCP tool: add_test_case_to_test_plan
        │
        ├─► Step 5: Comment on GitHub Issue
        │   - Post comment with TestLink case mapping:
        │     gh issue comment <number> --body "<table>"
        │
        └─► Step 6: Report
            - Print created test cases with IDs
            - Remind: "Use testlink_id in YAML files during /gh-implement"

---

## ISSUE COMMENT TEMPLATE

    ## TestLink Test Cases

    | TestLink ID | Test Case | Importance |
    |-------------|-----------|------------|
    | 201 | Create test suite with valid name | Medium |
    | 202 | Create test suite with duplicate name | Medium |
    | 203 | List test suites for project | Medium |

    Use `testlink_id: <id>` in YAML test files to link executions back to TestLink.

---

## YAML LINKAGE

When writing YAML test files during `/gh-implement`, include the `testlink_id` field:

```yaml
id: TC-SUITE-001
name: Create test suite with valid name
suite: tool
testlink_id: 201
priority: 1
steps:
  - name: Create suite
    command: ...
criteria: ...
```

This enables `/gh-test` to report execution results back to TestLink automatically.

---

## EXAMPLES

### Example 1: Feature issue

    /tl-define 42

**Output:**

    Issue: #42 - [feat] Add test suite management tools
    Acceptance criteria found: 3 scenarios

    Created TestLink test cases:
      TC 201: Create test suite with valid name (Medium)
      TC 202: Create test suite with duplicate name (Medium)
      TC 203: List test suites for project (Medium)

    Added 3 cases to test plan "Integration Tests"
    Comment posted to issue #42

    Next: Run /gh-implement 42 (use testlink_id in YAML files)

### Example 2: Bug fix issue

    /tl-define 38

**Output:**

    Issue: #38 - [fix] Handle empty suite name gracefully
    Acceptance criteria found: 2 scenarios

    Created TestLink test cases:
      TC 210: Empty suite name returns error (High)
      TC 211: Whitespace-only suite name returns error (Medium)

    Added 2 cases to test plan "Integration Tests"
    Comment posted to issue #38

---

## RULES

- Always read the issue first to understand what needs testing
- Create focused test cases: one scenario per test case
- Use descriptive names that explain the scenario, not the implementation
- Default importance to Medium (2), use High (3) for critical/security paths
- If no acceptance criteria in the issue, derive scenarios from the title and description
- Do NOT create YAML test files — that happens during /gh-implement
```
