# Delete Test Suite

This command removes a test suite from TestLink.

## Steps:
1. Prompt the user for the suite ID to delete (required)
2. Confirm the deletion action
3. Use the MCP tool `delete_test_suite` with the following parameters:
   - `suite_id` (required): The test suite ID to delete
4. Display the deletion result

## Note: TestLink API may have limitations for test suite deletion

## MCP Tool Parameters:
```json
{
  "suite_id": "string (required)"
}
```

## Example Usage:
- "Delete test suite 5"
- "Remove suite with ID 10"
- "Delete the Authentication test suite"

## MCP Tool: `delete_test_suite`
