# Create TestLink Test Case

```
Create new test case in TestLink with proper HTML formatting and TestLink compliance.

## Agent Instructions:
1. Extract test case data from user input
2. Apply HTML formatting according to guidelines below
3. Generate external ID automatically or use provided format
4. Call TestLink MCP create_test_case tool with formatted data
5. If preconditions are missing after creation, use update_test_case to add them

## Expected User Input Format:
User should provide:
- Test Suite ID (where to create the test case)
- Test Case Name
- Summary/Test Objective
- Pre-conditions (optional)
- Test Steps with Actions and Expected Results
- Author Login (optional, defaults to "admin")

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (suite ID, name, summary)
2. **Generate External ID**: Create project prefix format (e.g., "PROJ-1", "PROJ-2")
3. **Format Summary**: Wrap in <p> tags, apply <strong> for emphasis
4. **Format Preconditions**: Convert to <ul><li> list format
5. **Format Steps**: Apply HTML formatting to actions and expected results
6. **Apply HTML Entities**: Convert >, <, ", &, ' to proper entities
7. **Call API**: Use create_test_case tool with formatted data
8. **Post-Creation**: If preconditions missing, call update_test_case

## Example Usage:
**User Input:**
```
Create test case in suite 12
Name: User Authentication Test
Summary: Verify user can authenticate with valid credentials
Pre-conditions:
- Valid user account exists
- Authentication service is running
- Login page is accessible
Steps:
1. Navigate to login page
2. Enter valid username and password
3. Click Login button
Expected: User successfully logs in and redirected to dashboard
```

**Agent Processing:**
1. Extract: suiteId="12", name="User Authentication Test", etc.
2. Generate: externalId="PROJ-1" (auto-generated)
3. Format summary: "<p>Verify user can <strong>authenticate</strong> with valid credentials</p>"
4. Format preconditions: "<ul><li>Valid user account exists</li><li>Authentication service is running</li><li>Login page is accessible</li></ul>"
5. Format steps with HTML entities and proper tags
6. Call: create_test_case with formatted data
7. Check if preconditions were applied, update if needed

**API Notes:**
- createTestCase may not process preconditions properly - update after creation
- External ID will be auto-generated if not provided
- Test case will be created in specified test suite
- Author defaults to "admin" if not specified

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

Required Create Fields:
- testprojectid: String (project ID)
- testsuiteid: String (test suite ID)
- name: String (test case name)
- authorlogin: String (author login, defaults to "admin")
- summary: String (HTML formatted summary)
- preconditions: String (HTML formatted preconditions)
- steps: Array (formatted step objects)
- importance: Integer (1=low, 2=medium, 3=high, defaults to 3)
- execution_type: Integer (1=manual, 2=automated, defaults to 1)
- status: Integer (1=draft, 7=final, defaults to 7)

Best Practices:
✅ Use <strong> for UI elements like buttons, menus, fields
✅ Use <em> for alternatives or clarifications
✅ Use <br>• for simple multi-line expected results
✅ Use <ul><li> for complex validation lists
✅ Apply HTML entities for all special characters
✅ Keep actions clear and concise with proper formatting
✅ Make expected results specific and measurable
✅ Always verify creation was successful by reading the test case
✅ Check if preconditions were applied after creation
✅ Update preconditions separately if missing after creation
✅ Use descriptive external IDs (auto-generated with project prefix)

Common Issues & Solutions:
❌ "Missing required fields" → Ensure testprojectid, testsuiteid, name, authorlogin are provided
❌ "Invalid test suite ID" → Verify suite exists in the project
❌ Missing preconditions after creation → Use update_test_case to add preconditions
❌ HTML not rendering → Check HTML entity usage (&gt;, &lt;, &quot;, &apos;)
❌ "Test case already exists" → Use update_test_case instead or change name
```
