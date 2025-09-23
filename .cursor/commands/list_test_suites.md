# List Test Suites

This command retrieves and displays all test suites for a specific TestLink project.

## Steps:
1. Prompt the user for the project ID
2. Use the MCP tool `list_test_suites` with the following parameters:
   - `project_id` (required): The project ID to get test suites for
3. Format and display the test suites information in a readable format
4. Show suite ID, name, details, and other relevant information

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)"
}
```

## Example Usage:
- "Show test suites for project 1"
- "List test suites for Mobile App project"
- "Get all test suites for project 1404789"

## MCP Tool: `list_test_suites`
