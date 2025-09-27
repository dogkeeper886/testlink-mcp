# Update TestLink Test Case

```
Update test case in TestLink with proper HTML formatting and TestLink compliance.

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
1. **Validate Input**: Check for required fields (ID, name, summary)
2. **Format Summary**: Wrap in <p> tags, apply <strong> for emphasis
3. **Format Preconditions**: Convert to <ul><li> list format
4. **Format Steps**: Apply HTML formatting to actions and expected results
5. **Apply HTML Entities**: Convert >, <, ", &, ' to proper entities
6. **Call API**: Use update_test_case tool with formatted data

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

HTML Formatting Applied Automatically:
- Summary: <p> tags with <strong> for emphasis on key actions
- Preconditions: <ul><li> lists for each requirement
- Actions: <p> for main action, <ul><li> for alternatives, <ol><li> for ordered steps
- Expected Results: <br>• format for multi-line items or <ul><li> for complex validations

HTML Formatting Examples:
- Summary: "<p>Verify that users can <strong>perform action</strong> and validate behavior</p>"
- Preconditions: "<ul><li>Admin access with Advanced Permissions &gt; Feature &gt; Setting</li><li>Required configuration: Parameter &quot;value&quot;</li></ul>"
- Actions with alternatives: "<p>Click button and click &quot;<strong>Edit</strong>&quot;</p><ul><li>Alternatively, click name then click &quot;<strong>Configure</strong>&quot;</li></ul>"
- Actions with ordered steps: "<p>Navigate to page and click &quot;<strong><em>Edit</em></strong>&quot;</p><ol><li><em>Use Configure button method</em></li><li><em>Or access via direct URL</em></li></ol>"
- Expected Results (simple): "User can perform action successfully<br>• First validation point<br>• Second validation point"
- Expected Results (complex): "<p>Action completes successfully</p><ul><li>Success notification appears</li><li>Settings persist after save</li><li>User redirected to correct page</li></ul>"

HTML Entities Applied:
- &gt; for >, &lt; for <, &quot; for ", &amp; for &, &apos; for ', &nbsp; for non-breaking space

Formatting Options:
- <strong> for important actions, buttons, field names
- <em> for alternative methods or notes
- <strong><em> for critical emphasis
- <ul><li> for bullet points in actions or results
- <ol><li> for numbered sequences
- <br>• for simple multi-line expected results

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
```