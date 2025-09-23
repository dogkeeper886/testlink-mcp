# List Requirements

This command retrieves and displays all requirements for a specific TestLink project.

## Steps:
1. Prompt the user for the project ID
2. Use the MCP tool `list_requirements` with the following parameters:
   - `project_id` (required): The project ID to get requirements for
3. Format and display the requirements information in a readable format
4. Show requirement ID, title, description, and other relevant details

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)"
}
```

## Example Usage:
- "Show requirements for project 1"
- "List requirements for Mobile App project"
- "Get all requirements for project 1404789"

## MCP Tool: `list_requirements`
