# List TestLink Test Suites

```
Retrieve and display all test suites for a specific TestLink project.

## Agent Instructions:
1. Extract project ID from user input
2. Call TestLink MCP list_test_suites tool with project ID
3. Format test suite information in a readable format
4. Display suite details including ID, name, and description

## Expected User Input:
User should provide:
- Project ID (to get test suites for)

## Agent Processing Steps:
1. **Extract Project ID**: Get project ID from user input
2. **Call API**: Use list_test_suites MCP tool with project ID
3. **Format Data**: Organize test suite information for display
4. **Present Results**: Show test suites in readable format

## Example Usage:
**User Input:**
```
Show test suites for project 1
```

**Agent Processing:**
1. Extract: projectId="1"
2. Call: list_test_suites with project_id="1"
3. Format: Organize test suite data
4. Present: Display formatted test suite list

**Formatted Output:**
```
Test Suites for Project 1 (Guest Pass Device Limitation):
┌─────────┬─────────────────────────────────────────┬─────────────────────────┐
│   ID    │                 Name                    │       Description       │
├─────────┼─────────────────────────────────────────┼─────────────────────────┤
│   12    │ Guest Pass Device Limitation - Essential│ Essential test cases for│
│         │ Test Cases                              │ device limit validation  │
│   13    │ GUI Testing Suite                       │ User interface testing  │
│   14    │ API Testing Suite                       │ Backend service testing │
└─────────┴─────────────────────────────────────────┴─────────────────────────┘

Suite Details:
• Suite 12: Guest Pass Device Limitation - Essential Test Cases
• Suite 13: GUI Testing Suite
• Suite 14: API Testing Suite
```

## MCP Tool Parameters:
```json
{
  "project_id": "string (required)"
}
```

## Required Fields:
- project_id: String (project ID to get test suites for)

## Display Format:
- **Table Format**: Organized table with key test suite information
- **Summary List**: Bullet points with test suite highlights
- **Key Details**: Suite ID, name, description

## Information Displayed:
- Test Suite ID
- Test Suite Name
- Test Suite Description
- Additional metadata (if available)

## Success Criteria:
✅ Project ID extracted from user input
✅ Test suites retrieved successfully from TestLink
✅ Information formatted in readable format
✅ Key test suite details clearly displayed
✅ User can easily identify available test suites

## Common Scenarios:
- "Show test suites for project 1"
- "List test suites for Mobile App project"
- "Get all test suites for project 1404789"
- "What test suites are available in project 1?"
- "Display test suites for Guest Pass project"
```
