# Create TestLink Test Suite

```
Create new test suite in TestLink with HTML formatting support for details.

## Agent Instructions:
1. Extract test suite data from user input
2. Apply HTML formatting to details field if needed
3. Generate external ID automatically or use provided format
4. Call TestLink MCP create_test_suite tool with formatted data
5. Return new suite ID and confirmation

## Expected User Input:
User should provide:
- Project ID (where to create the test suite)
- Test Suite Name
- Suite Details/Description (optional, supports HTML formatting)
- Parent Suite ID (optional, for nested suites)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (project ID, suite name)
2. **Format Details**: Apply HTML formatting if details contain special characters
3. **Prepare Data**: Structure data for MCP tool call
4. **Call API**: Use create_test_suite tool with formatted data
5. **Return Result**: Provide new suite ID and creation confirmation

## Example Usage:
**User Input:**
```
Create test suite in project 1
Name: User Session Management Suite
Details: Comprehensive test suite for validating session management functionality with token rotation support. Includes GUI testing, automation testing, and customer scenario replication.
```

**Agent Processing:**
1. Extract: projectId="1", name="User Session Management Suite", details="..."
2. Format details: Apply HTML formatting for special characters
3. Prepare data: Structure for MCP tool
4. Call: create_test_suite with formatted data
5. Return: New suite ID and creation confirmation

**Formatted Output:**
```
Suite Created Successfully!
Suite ID: 12
Name: User Session Management Suite
Details: <p>Comprehensive test suite for validating session management functionality with token rotation support. Includes GUI testing, automation testing, and customer scenario replication.</p>
```

## HTML Formatting:
- Apply formatting per `/tl-format` rules (details field uses summary formatting conventions)

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)",
  "suite_name": "string (required)",
  "details": "string (optional, HTML formatted)",
  "parent_id": "string (optional)"
}
```

## Required Fields:
- project_id: String (project ID where suite will be created)
- suite_name: String (name of the new test suite)

## Optional Fields:
- details: String (test suite description, HTML formatted)
- parent_id: String (parent suite ID for nested suites)

## Success Criteria:
✅ Project ID and suite name provided
✅ Data properly formatted for MCP tool
✅ HTML formatting applied to details if needed
✅ Suite creation completed successfully
✅ New suite ID returned to user

## Common Scenarios:
- "Create Authentication test suite in project 1"
- "Create UI test suite in project 490671 with details 'User interface testing'"
- "Create nested API test suite under parent suite 5"
- "Create test suite with HTML formatted details"

## Nested Suite Creation:
For nested suites, provide parent_id:
```
Create test suite in project 1
Name: API Testing Suite
Parent Suite ID: 5
Details: Nested suite for API endpoint testing
```
```
