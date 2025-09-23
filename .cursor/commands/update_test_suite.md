# Update Test Suite

This command updates an existing test suite in TestLink with new properties.

## Steps:
1. Prompt the user for:
   - Suite ID to update (required)
   - New suite data (name, details)
2. Use the MCP tool `update_test_suite` with the following parameters:
   - `suite_id` (required): The test suite ID to update
   - `data` (required): Test suite data to update
3. Display the update result

## MCP Tool Parameters:
```json
{
  "suite_id": "string (required)",
  "data": {
    "name": "string (optional)",
    "details": "string (optional)"
  }
}
```

## Example Usage:
- "Update suite 5 with new name 'Updated Authentication Suite'"
- "Modify test suite 10 with new details"
- "Update suite 15 name to 'API Testing Suite'"

## MCP Tool: `update_test_suite`
