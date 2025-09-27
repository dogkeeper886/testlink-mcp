# List TestLink Requirements

```
Retrieve and display all requirements for a specific TestLink project.

## Agent Instructions:
1. Extract project ID from user input
2. Call TestLink MCP list_requirements tool with project ID
3. Format requirements information in a readable format
4. Display requirement details including ID, title, and description

## Expected User Input:
User should provide:
- Project ID (to get requirements for)

## Agent Processing Steps:
1. **Extract Project ID**: Get project ID from user input
2. **Call API**: Use list_requirements MCP tool with project ID
3. **Format Data**: Organize requirements information for display
4. **Present Results**: Show requirements in readable format

## Example Usage:
**User Input:**
```
Show requirements for project 1
```

**Agent Processing:**
1. Extract: projectId="1"
2. Call: list_requirements with project_id="1"
3. Format: Organize requirements data
4. Present: Display formatted requirements list

**Formatted Output:**
```
Requirements for Project 1 (Guest Pass Device Limitation):
┌─────────┬─────────────────────────────────────────┬─────────────────────────┐
│   ID    │                 Title                  │       Description       │
├─────────┼─────────────────────────────────────────┼─────────────────────────┤
│    6    │ BR-001: MAC Randomization Device Limit │ Device limit issue with │
│         │ Issue                                   │ MAC randomization      │
│    8    │ BR-002: Customer Issue Resolution      │ Resolution of customer  │
│         │                                         │ device limit issues    │
└─────────┴─────────────────────────────────────────┴─────────────────────────┘

Requirement Details:
• BR-001: MAC Randomization Device Limit Issue
• BR-002: Customer Issue Resolution
```

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)"
}
```

## Required Fields:
- project_id: String (project ID to get requirements for)

## Display Format:
- **Table Format**: Organized table with key requirements information
- **Summary List**: Bullet points with requirements highlights
- **Key Details**: Requirement ID, title, description

## Information Displayed:
- Requirement ID
- Requirement Title
- Requirement Description
- Additional metadata (if available)

## Success Criteria:
✅ Project ID extracted from user input
✅ Requirements retrieved successfully from TestLink
✅ Information formatted in readable format
✅ Key requirements details clearly displayed
✅ User can easily identify available requirements

## Common Scenarios:
- "Show requirements for project 1"
- "List requirements for Mobile App project"
- "Get all requirements for project 1404789"
- "What requirements are available in project 1?"
- "Display requirements for Guest Pass project"
```
