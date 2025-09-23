# Create Test Suite

This command creates a new test suite in a TestLink project.

## Steps:
1. Prompt the user for test suite details:
   - Project ID (required)
   - Suite name (required)
   - Suite details/description (optional)
   - Parent suite ID (optional, for nested suites)
2. Use the MCP tool `create_test_suite` with the following parameters:
   - `project_id` (required): The project ID
   - `suite_name` (required): Name of the new test suite
   - `details` (optional): Description or details for the test suite
   - `parent_id` (optional): Parent test suite ID for nested suites
3. Display the creation result and provide the new suite ID

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)",
  "suite_name": "string (required)",
  "details": "string (optional)",
  "parent_id": "string (optional)"
}
```

## Example Usage:
- "Create Authentication test suite in project 1"
- "Create UI test suite in project 490671 with details 'User interface testing'"
- "Create nested API test suite under parent suite 5"

## MCP Tool: `create_test_suite`
