# TestLink Format

```
Format text for TestLink with proper HTML formatting and external ID format.

## Agent Instructions:
1. Take user input text and apply TestLink HTML formatting
2. Convert plain text to proper HTML format according to guidelines below
3. Apply HTML entities for special characters
4. Return formatted text ready for TestLink use

## Expected User Input:
User provides plain text that needs TestLink formatting:
- Test case summaries
- Preconditions lists
- Test step actions and expected results
- Any text content for TestLink

## Agent Processing Steps:
1. **Identify Content Type**: Determine if input is summary, preconditions, actions, or expected results
2. **Apply HTML Tags**: Wrap content in appropriate HTML tags
3. **Format Lists**: Convert bullet points to <ul><li> or <ol><li> format
4. **Apply Emphasis**: Use <strong> for important actions, <em> for alternatives
5. **Convert Entities**: Replace >, <, ", &, ' with HTML entities
6. **Validate Format**: Ensure proper HTML structure
7. **Return Result**: Provide formatted HTML text

## Example Usage:
**User Input:**
```
Format this for TestLink:
Summary: Verify user can login with valid credentials
Preconditions:
- Valid user account exists
- Login page is accessible
Steps:
1. Navigate to login page
2. Enter username and password
3. Click Login button
Expected: User successfully logs in and redirected to dashboard
```

**Agent Processing:**
1. Identify: Summary, preconditions list, numbered steps, expected results
2. Format summary: "<p>Verify user can <strong>login</strong> with valid credentials</p>"
3. Format preconditions: "<ul><li>Valid user account exists</li><li>Login page is accessible</li></ul>"
4. Format steps: Apply <p> tags and <strong> for actions
5. Format expected: "<p>User successfully logs in and redirected to dashboard</p>"
6. Apply entities: Convert any special characters
7. Return: Complete HTML formatted text

**Formatted Output:**
```
Summary: <p>Verify user can <strong>login</strong> with valid credentials</p>
Preconditions: <ul><li>Valid user account exists</li><li>Login page is accessible</li></ul>
Steps:
1. <p>Navigate to login page</p>
2. <p>Enter username and password</p>
3. <p>Click <strong>Login</strong> button</p>
Expected: <p>User successfully logs in and redirected to dashboard</p>
```

## HTML Formatting Rules:

### Summary Formatting:
- Wrap in <p> tags
- Use <strong> for key actions and important terms
- Example: "<p>Verify that users can <strong>perform action</strong> and validate behavior</p>"

### Preconditions Formatting:
- Convert bullet points to <ul><li> lists
- Each item in separate <li> tag
- Example: "<ul><li>Admin access with Advanced Permissions &gt; Feature &gt; Setting</li><li>Required configuration: Parameter &quot;value&quot;</li></ul>"

### Actions Formatting:
- Main action in <p> tags
- Use <strong> for buttons, menus, field names
- Use <em> for alternatives or clarifications
- Sub-steps in <ul><li> or <ol><li> format
- Example: "<p>Click button and click &quot;<strong>Edit</strong>&quot;</p><ul><li>Alternatively, click name then click &quot;<strong>Configure</strong>&quot;</li></ul>"

### Expected Results Formatting:
- Simple results: Use <br>• for multi-line items
- Complex results: Use <p> with <ul><li> for validation lists
- Example: "User can perform action successfully<br>• First validation point<br>• Second validation point"

## HTML Entities Required:
- &gt; for >, &lt; for <, &quot; for ", &amp; for &, &apos; for ', &nbsp; for non-breaking space

## HTML Tags Available:
- <p> for paragraphs
- <strong> for bold/important text
- <em> for italic/alternative text
- <strong><em> for bold italic/critical emphasis
- <ul><li> for bullet lists
- <ol><li> for numbered lists
- <br> for line breaks

## Required Step Fields (for complete test cases):
- step_number: String (e.g., "1", "2", "3")
- actions: String (what to do, HTML formatted)
- expected_results: String (what should happen, HTML formatted)
- active: Integer (always use 1)
- execution_type: Integer (1 = manual, 2 = automated)

## Common Mistakes to Avoid:
❌ Don't use \n for line breaks (shows as literal 'n')
❌ Don't forget HTML entities for special characters
❌ Don't use numeric-only external IDs
❌ Don't skip required step fields
❌ Don't mix HTML and plain text formatting

## Success Criteria:
✅ All text properly wrapped in HTML tags
✅ Preconditions use <ul><li> HTML format
✅ Multi-line expected results use <br>• format
✅ All special characters use HTML entities
✅ All required step fields included (if applicable)
✅ All formatting follows HTML standards
✅ Text is ready for direct use in TestLink
```
