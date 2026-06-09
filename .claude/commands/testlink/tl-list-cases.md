# List Test Cases in Test Suite

```
List all test cases in a TestLink test suite with proper output interpretation and guidance.

## Agent Instructions:
1. Extract test suite ID from user input
2. Validate test suite exists before listing
3. Call TestLink MCP list_test_cases_in_suite tool
4. Interpret and present results in user-friendly format
5. Provide guidance on using the test case data

## Expected User Input Format:
User should provide:
- Test Suite ID (numeric)

## Agent Processing Steps:
1. **Validate Input**: Check for required field (suite_id)
2. **Validate Suite**: Verify test suite exists
3. **Call API**: Use list_test_cases_in_suite tool
4. **Interpret Results**: Parse and format test case data
5. **Present Data**: Show results in organized format

## Example Usage:
**User Input:**
```
List test cases in suite 12
```

**Agent Processing:**
1. Extract: suite_id="12"
2. Validate: Check suite exists
3. Call: list_test_cases_in_suite with suite_id
4. Interpret: Parse test case data and metadata
5. Present: Show organized list with key information

**API Notes:**
- Returns array of test cases with detailed information
- Includes external IDs, versions, status, and metadata
- Shows test case hierarchy and relationships
- Provides execution and design information

## Output Data Interpretation:

### **Test Case Object Structure:**
```json
{
  "id": "13",                    // Internal test case ID
  "external_id": "PROJ-1",       // External ID (PROJ-1)
  "tc_external_id": "1",         // Numeric part of external ID
  "name": "Test Case Name",      // Test case name
  "version": "1",                // Version number
  "status": "7",                 // Status (7=final, 1=draft)
  "summary": "<p>Summary...</p>", // HTML formatted summary
  "preconditions": "<ul>...</ul>", // HTML formatted preconditions
  "importance": "2",             // Importance (1=low, 2=medium, 3=high)
  "execution_type": "1",         // Execution type (1=manual, 2=automated)
  "steps": [...]                 // Array of test steps
}
```

### **Status Values:**
- **1** = Draft
- **7** = Final (ready for execution)

### **Importance Levels:**
- **1** = Low priority
- **2** = Medium priority
- **3** = High priority

### **Execution Types:**
- **1** = Manual execution
- **2** = Automated execution

## Common Errors & Solutions:

### ❌ "ID 12 do not belongs to a Test Suite present on system"
**Cause**: Invalid test suite ID or suite doesn't exist
**Solution**: Verify test suite exists using list_test_suites

### ❌ "Missing required fields"
**Cause**: Missing suite_id parameter
**Solution**: Ensure suite_id is provided

### ❌ "Test suite not found"
**Cause**: Test suite doesn't exist or is inaccessible
**Solution**: Check test suite ID and permissions

## Required Fields:
- suite_id: String (numeric test suite ID)

## Step-by-Step Process:

### 1. Validate Test Suite
- Use list_test_suites to verify test suite exists
- Confirm test suite is accessible
- Check if suite belongs to correct project

### 2. Execute Listing
- Call list_test_cases_in_suite with validated suite_id
- Handle any API errors gracefully
- Verify results are returned

### 3. Process Results
- Parse test case data and metadata
- Extract key information (ID, name, status, etc.)
- Format results for user presentation

### 4. Present Data
- Show test cases in organized format
- Highlight important information
- Provide guidance on next steps

## Best Practices:
✅ Always validate test suite exists before listing
✅ Present test case data in organized, readable format
✅ Highlight key information (external ID, status, importance)
✅ Show test case hierarchy and relationships
✅ Provide guidance on using the test case data
✅ Handle empty results gracefully

## Data Presentation Examples:

### **Simple List Format:**
```
Test Cases in Suite: [Suite Name]

1. PROJ-1 - Test Case Name (Status: Final, Priority: Medium)
2. PROJ-2 - Another Test Case (Status: Draft, Priority: High)
3. PROJ-3 - Third Test Case (Status: Final, Priority: Low)
```

### **Detailed Format:**
```
Test Cases in Suite: [Suite Name]

PROJ-1 - Test Case Name
├─ ID: 13
├─ Status: Final (7)
├─ Priority: Medium (2)
├─ Type: Manual (1)
├─ Version: 1
└─ Summary: Brief description...

PROJ-2 - Another Test Case
├─ ID: 27
├─ Status: Draft (1)
├─ Priority: High (3)
├─ Type: Automated (2)
├─ Version: 1
└─ Summary: Brief description...
```

## Agent Response Template:

**When listing succeeds:**
```
Found [count] test cases in suite: [suite_name]

Test Cases:
[Formatted list of test cases with key information]

Key Information:
- External ID: Use for test case operations
- Status: Final (7) = ready for execution, Draft (1) = in progress
- Priority: High (3), Medium (2), Low (1)
- Type: Manual (1) or Automated (2)

Next Steps:
- Use read_test_case to get detailed information
- Use create_test_execution to record execution results
- Use update_test_case to modify test case details
```

**When no test cases found:**
```
No test cases found in suite: [suite_name]

This could mean:
- Test suite is empty
- Test cases are in nested suites
- Test cases are in different status

Suggestions:
- Check nested test suites
- Verify test case status filters
- Use list_test_suites to explore structure
```

**When handling errors:**
```
❌ Failed to list test cases: [error_message]

Troubleshooting:
1. Verify test suite ID is correct
2. Check test suite exists using list_test_suites
3. Ensure you have access to the test suite
4. Verify test suite belongs to correct project

Would you like me to help resolve this issue?
```
