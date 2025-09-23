# Delete Project

This command removes a test project from TestLink.

## Steps:
1. Prompt the user for the project ID to delete (required)
2. Confirm the deletion action
3. Use the MCP tool `delete_project` with the following parameters:
   - `project_id` (required): The project ID to delete
4. Display the deletion result

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)"
}
```

## Example Usage:
- "Delete project 123"
- "Remove project with ID 1"
- "Delete the mobile app project"

## MCP Tool: `delete_project`
