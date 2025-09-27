# List TestLink Projects

```
Retrieve and display all available test projects from TestLink.

## Agent Instructions:
1. Call TestLink MCP list_projects tool (no parameters required)
2. Format project information in a readable format
3. Display project details including ID, name, prefix, and status
4. Present information in an organized, user-friendly manner

## Expected User Input:
User requests project information:
- "Show me all available projects"
- "List all TestLink projects"
- "Display project information"
- "What projects are available?"

## Agent Processing Steps:
1. **Call API**: Use list_projects MCP tool (no parameters needed)
2. **Format Data**: Organize project information for display
3. **Present Results**: Show project details in readable format
4. **Highlight Key Info**: Emphasize important project details

## Example Usage:
**User Input:**
```
Show me all available projects
```

**Agent Processing:**
1. Call: list_projects MCP tool
2. Format: Organize project data
3. Present: Display formatted project list

**Formatted Output:**
```
Available TestLink Projects:
┌─────────┬─────────────────────────────────┬─────────┬─────────┬─────────┐
│   ID    │              Name               │ Prefix  │ Status  │ Active  │
├─────────┼─────────────────────────────────┼─────────┼─────────┼─────────┤
│    1    │ Guest Pass Device Limitation    │  GPDL   │ Active  │   Yes   │
│    2    │ Mobile App Testing              │  MAT    │ Active  │   Yes   │
│    3    │ API Integration Tests           │  AIT    │ Active  │   Yes   │
└─────────┴─────────────────────────────────┴─────────┴─────────┴─────────┘

Project Details:
• Project 1: Guest Pass Device Limitation (GPDL) - Active
• Project 2: Mobile App Testing (MAT) - Active  
• Project 3: API Integration Tests (AIT) - Active
```

## MCP Tool Parameters:
```json
{}
```
*No parameters required - fetches all projects*

## Display Format:
- **Table Format**: Organized table with key project information
- **Summary List**: Bullet points with project highlights
- **Key Details**: Project ID, name, prefix, status, active status

## Information Displayed:
- Project ID
- Project Name
- Project Prefix (for external IDs)
- Active Status
- Project Status
- Additional metadata (if available)

## Success Criteria:
✅ Projects retrieved successfully from TestLink
✅ Information formatted in readable format
✅ Key project details clearly displayed
✅ User can easily identify available projects

## Common Scenarios:
- "Show me all available projects"
- "List all TestLink projects"
- "Display project information"
- "What projects can I work with?"
- "Show available test projects"
```
