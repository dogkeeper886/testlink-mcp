# Get TestLink Test Case

```
Retrieve and display a specific test case from TestLink in a readable format.

## Agent Instructions:
1. Extract test case ID from user input
2. Call TestLink MCP get_test_case tool with test case ID
3. Format test case information in readable markdown format
4. Display test case details including steps, preconditions, and summary

## Expected User Input:
User should provide:
- Test Case ID (external format like "PROJ-1" or numeric ID)

## Agent Processing Steps:
1. **Extract Test Case ID**: Get test case ID from user input
2. **Call API**: Use get_test_case MCP tool with test case ID
3. **Format Data**: Organize test case information for display
4. **Present Results**: Show test case in readable markdown format

## Example Usage:
**User Input:**
```
Get test case GPDL-1
```

**Agent Processing:**
1. Extract: testCaseId="GPDL-1"
2. Call: get_test_case with test_case_id="GPDL-1"
3. Format: Organize test case data into markdown
4. Present: Display formatted test case

**Formatted Output:**
```
# Test Case: GPDL-1

## Test Case Information
- **ID**: GPDL-1
- **Name**: [GUI] TC-ACX-99052-001: Device Limit Functional Validation
- **Status**: Final
- **Importance**: High
- **Execution Type**: Manual

## Summary
Validate complete device limit functionality including WLAN profile configuration (1-1000 devices), UI input field validation with boundary testing, and configuration persistence across save/load operations.

## Pre-conditions
- RuckusOne cloud controller configured and operational
- Administrative access to RuckusOne management interface
- Browser automation framework (Playwright) configured

## Test Steps
| Step | Actions | Expected Results |
|------|---------|------------------|
| 1 | Navigate: Wi-Fi > Wi-Fi Networks > Add Wi-Fi Network | Navigation successful |
| 2 | Configure: Network Name > Captive Portal > Self Sign In > SMS Token | Basic configuration complete |
| 3 | Access: Show more settings > User Connection tab | Device limit control visible |
| 4 | Validate: Device limit spinbutton control exists and is functional | Control responsive and accessible |
| 5 | Test minimum value: Set device limit to 1 | Value accepted, UI updates correctly |
| 6 | Test maximum value: Set device limit to 1000 | Value accepted, UI updates correctly |
```

## MCP Tool Parameters:
```json
{
  "test_case_id": "string (required)"
}
```

## Required Fields:
- test_case_id: String (test case ID to retrieve)

## Display Format:
- **Markdown Format**: Organized markdown with clear headings
- **Table Format**: Test steps in organized table
- **Key Details**: Test case ID, name, summary, preconditions, steps

## Information Displayed:
- Test Case ID and Name
- Test Case Status and Importance
- Summary/Test Objective
- Pre-conditions (if any)
- Test Steps in table format with Actions and Expected Results
- Additional metadata (if available)

## Success Criteria:
✅ Test case ID extracted from user input
✅ Test case retrieved successfully from TestLink
✅ Information formatted in readable markdown
✅ Test steps clearly organized in table format
✅ User can easily understand test case content

## Common Scenarios:
- "Get test case GPDL-1"
- "Show me test case 123"
- "Display test case PROJ-5"
- "Retrieve test case details for GPDL-2"
- "Get test case information"
```