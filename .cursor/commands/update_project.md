# Update Project

This command updates an existing test project in TestLink with new settings.

## Steps:
1. Prompt the user for:
   - Project ID to update (required)
   - New project data (name, notes, options)
2. Use the MCP tool `update_project` with the following parameters:
   - `project_id` (required): The project ID to update
   - `data` (required): Project data to update
3. Display the update result

## Note: TestLink API has limited update capabilities for projects

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)",
  "data": "object (required)"
}
```

## Example Usage:
- "Update project 123 with new notes 'Updated project description'"
- "Modify project settings for project 1"

## MCP Tool: `update_project`
