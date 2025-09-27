# Update TestLink Test Suite

```
Update existing test suite in TestLink with new properties and HTML formatting support.

## Agent Instructions:
1. Extract test suite data from user input
2. Apply HTML formatting to details field if needed
3. Use external ID format for updates (e.g., "PROJ-1", "ABC-12345")
4. Call TestLink MCP update_test_suite tool with formatted data

## Expected User Input:
User should provide:
- Test Suite ID (external format like "PROJ-1" or numeric ID)
- New Suite Name (optional)
- New Suite Details/Description (optional, supports HTML formatting)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (suite ID)
2. **Format Details**: Apply HTML formatting if details contain special characters
3. **Prepare Data**: Structure data for MCP tool call
4. **Call API**: Use update_test_suite tool with formatted data
5. **Return Result**: Provide update confirmation and new suite information

## Example Usage:
**User Input:**
```
Update test suite 12
Name: Updated Guest Pass Device Limitation Suite
Details: Comprehensive test suite for validating device limit functionality with MAC randomization support. Includes GUI testing, automation testing, and customer scenario replication.
```

**Agent Processing:**
1. Extract: suiteId="12", name="Updated Guest Pass Device Limitation Suite", details="..."
2. Format details: Apply HTML formatting for special characters
3. Prepare data: Structure for MCP tool
4. Call: update_test_suite with formatted data
5. Return: Update confirmation and suite information

**Formatted Output:**
```
Suite ID: 12
Name: Updated Guest Pass Device Limitation Suite
Details: <p>Comprehensive test suite for validating device limit functionality with MAC randomization support. Includes GUI testing, automation testing, and customer scenario replication.</p>
```

## HTML Formatting for Details:
- Wrap descriptions in <p> tags
- Use <strong> for important terms and features
- Use <ul><li> for lists of test types or features
- Apply HTML entities: &gt;, &lt;, &quot;, &amp;, &apos;

## MCP Tool Parameters:
```json
{
  "suite_id": "string (required)",
  "data": {
    "name": "string (optional)",
    "details": "string (optional, HTML formatted)"
  }
}
```

## Required Fields:
- suite_id: String (test suite ID to update)

## Optional Fields:
- name: String (new test suite name)
- details: String (new test suite description, HTML formatted)

## HTML Formatting Examples:
- Simple description: "<p>Test suite for user authentication validation</p>"
- Complex description: "<p>Comprehensive test suite covering <strong>GUI</strong> and <strong>API</strong> testing</p><ul><li>User interface validation</li><li>Backend service testing</li><li>Integration testing</li></ul>"
- Technical details: "<p>Test suite for &quot;Device Limit&quot; feature with MAC randomization support</p>"

## Success Criteria:
✅ Suite ID provided and valid
✅ Data properly formatted for MCP tool
✅ HTML formatting applied to details if needed
✅ Update operation completed successfully
✅ Confirmation returned to user

## Common Scenarios:
- "Update suite 5 with new name 'Updated Authentication Suite'"
- "Modify test suite 10 with new details"
- "Update suite 15 name to 'API Testing Suite'"
- "Change suite 20 details to include HTML formatting"
```
