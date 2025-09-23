# Create Project

This command creates a new test project in TestLink with the specified parameters.

## Steps:
1. Prompt the user for project details:
   - Project name (required)
   - Test case prefix (required)
   - Project notes (optional)
   - Project options (optional)

2. Use the MCP tool `create_project` with the following parameters:
   - `data.name` (required): Project name
   - `data.prefix` (required): Test case prefix
   - `data.notes` (optional): Project notes
   - `data.options` (optional): Project options object

3. Display the creation result and provide the new project ID

## MCP Tool Parameters:
```json
{
  "data": {
    "name": "string (required)",
    "prefix": "string (required)", 
    "notes": "string (optional)",
    "options": "object (optional)"
  }
}
```

## Example Usage:
- "Create project for mobile app with prefix MOB"
- "Create project for web application testing with prefix WEB and notes 'E-commerce platform testing'"

## MCP Tool: `create_project`
