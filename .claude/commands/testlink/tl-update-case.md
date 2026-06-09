# Update TestLink Test Case

Update test case in TestLink with proper HTML formatting and TestLink compliance.

## When to Use

- After modifying local test case files that are already synced to TestLink
- When test case summary, preconditions, or steps need updating in TestLink

## Agent Instructions:
1. Extract test case data from user input
2. Apply HTML formatting according to guidelines below
3. Use external ID format for updates (e.g., "PROJ-1", "ABC-12345")
4. Call TestLink MCP update_test_case tool with formatted data

## Expected User Input Format:
User should provide:
- Test Case ID (external format like "PROJ-1")
- Test Case Name
- Summary/Test Objective
- Pre-conditions (optional)
- Test Steps with Actions and Expected Results

## Agent Processing Steps:
1. **Version Backup**: Before updating, prompt the user: "Please create a new version for {Test Case ID} in TestLink before I update it." Wait for confirmation before proceeding.
2. **Validate Input**: Check for required fields (ID, name, summary)
3. **Format Summary**: Wrap in <p> tags, apply <strong> for emphasis
4. **Format Preconditions**: Convert to <ul><li> list format
5. **Format Steps**: Apply HTML formatting to actions and expected results
6. **Apply HTML Entities**: Convert >, <, ", &, ' to proper entities
7. **Call API**: Use update_test_case tool with formatted data

## Example Usage:
**User Input:**
```
Update test case PROJ-1
Name: Login Validation Test
Summary: Verify user can login with valid credentials
Pre-conditions:
- Valid user account exists
- Login page is accessible
Steps:
1. Navigate to login page
2. Enter valid username and password
3. Click Login button
Expected: User successfully logs in and redirected to dashboard
```

**Agent Processing:**
1. Extract: ID="PROJ-1", name="Login Validation Test", etc.
2. Format summary: "<p>Verify user can <strong>login</strong> with valid credentials</p>"
3. Format preconditions: "<ul><li>Valid user account exists</li><li>Login page is accessible</li></ul>"
4. Format steps with HTML entities and proper tags
5. Call: update_test_case with formatted data

**API Notes:**
- If preconditions are missing after creation, use updateTestCase to add them
- External ID format required for updates (not numeric IDs)
- createTestCase may not process preconditions properly - update after creation

HTML Formatting:
- Apply formatting per `/tl-format` rules (summary, preconditions, actions, expected results, entities)

Required Step Fields (handled automatically):
- step_number: String or number ("1", "2", "3", etc.)
- actions: String with proper HTML formatting
- expected_results: String with proper HTML formatting
- active: Integer (always 1 for active steps)
- execution_type: Integer (1 = manual, 2 = automated)

Best Practices:
✅ Use <strong> for UI elements like buttons, menus, fields
✅ Use <em> for alternatives or clarifications
✅ Use <br>• for simple multi-line expected results
✅ Use <ul><li> for complex validation lists
✅ Apply HTML entities for all special characters
✅ Keep actions clear and concise with proper formatting
✅ Make expected results specific and measurable
✅ Always verify updates were successful by reading the test case
✅ Use external ID format for updates (e.g., "PROJ-1" not "13")
✅ Update preconditions separately if missing after creation

Common Issues & Solutions:
❌ "Invalid XML-RPC message" → Use external ID format instead of numeric ID
❌ Missing preconditions after creation → Use updateTestCase to add preconditions
❌ HTML not rendering → Check HTML entity usage (&gt;, &lt;, &quot;, &apos;)