# Get Test Cases for Test Plan

```
Get all test cases assigned to a TestLink test plan with proper output interpretation and guidance.

## Agent Instructions:
1. Extract test plan ID from user input
2. Validate test plan exists before querying
3. Call TestLink MCP get_test_cases_for_test_plan tool
4. Interpret and present results in user-friendly format
5. Provide guidance on using the test case data

## Expected User Input Format:
User should provide:
- Test Plan ID (numeric)

## Agent Processing Steps:
1. **Validate Input**: Check for required field (plan_id)
2. **Validate Plan**: Verify test plan exists
3. **Call API**: Use get_test_cases_for_test_plan tool
4. **Interpret Results**: Parse and format test case data
5. **Present Data**: Show results in organized format

## Example Usage:
**User Input:**
```
Get test cases for test plan 10
```

**Agent Processing:**
1. Extract: plan_id="10"
2. Validate: Check test plan exists
3. Call: get_test_cases_for_test_plan with plan_id
4. Interpret: Parse test case assignment data
5. Present: Show organized list with execution information

**API Notes:**
- Returns test cases assigned to the test plan
- Includes execution status and metadata
- Shows test case versions and execution details
- Provides platform and urgency information

## Output Data Interpretation:

### **Test Plan Test Case Object Structure:**
```json
{
  "13": [                    // Test case ID as key
    {
      "tcase_name": "Test Case Name",
      "tcase_id": "13",      // Internal test case ID
      "tc_id": "13",         // Test case ID (same as above)
      "tcversion_id": "14",  // Test case version ID
      "version": "1",        // Version number
      "external_id": "1",    // Numeric part of external ID
      "execution_type": "2", // Execution type (1=manual, 2=automated)
      "status": "7",         // Test case status (7=final)
      "feature_id": "1",     // Feature/assignment ID
      "platform_id": "0",    // Platform ID (0=no platform)
      "platform_name": "",   // Platform name
      "execution_order": "1", // Execution order
      "exec_status": "n",    // Execution status (n=not executed)
      "execution_duration": "", // Execution duration
      "full_external_id": "PROJ-1", // Full external ID
      "exec_id": "0",        // Execution ID (0=no execution)
      "tcversion_number": "", // Version number
      "exec_on_build": "",   // Execution build
      "exec_on_tplan": ""    // Execution test plan
    }
  ]
}
```

### **Execution Status Values:**
- **n** = Not executed
- **p** = Passed
- **f** = Failed
- **b** = Blocked

### **Execution Types:**
- **1** = Manual execution
- **2** = Automated execution

### **Test Case Status:**
- **7** = Final (ready for execution)
- **1** = Draft

## Common Errors & Solutions:

### ❌ "Test plan not found"
**Cause**: Invalid test plan ID or test plan doesn't exist
**Solution**: Verify test plan exists using list_test_plans

### ❌ "Missing required fields"
**Cause**: Missing plan_id parameter
**Solution**: Ensure plan_id is provided

### ❌ "No test cases assigned"
**Cause**: Test plan has no test cases assigned
**Solution**: Use add_test_case_to_test_plan to assign test cases

## Required Fields:
- plan_id: String (numeric test plan ID)

## Step-by-Step Process:

### 1. Validate Test Plan
- Use list_test_plans to verify test plan exists
- Confirm test plan is active and accessible
- Check if test plan belongs to correct project

### 2. Execute Query
- Call get_test_cases_for_test_plan with validated plan_id
- Handle any API errors gracefully
- Verify results are returned

### 3. Process Results
- Parse test case assignment data
- Extract key information (name, status, execution info)
- Format results for user presentation

### 4. Present Data
- Show test cases in organized format
- Highlight execution status and metadata
- Provide guidance on next steps

## Best Practices:
✅ Always validate test plan exists before querying
✅ Present test case data with execution information
✅ Highlight execution status and progress
✅ Show test case versions and metadata
✅ Provide guidance on execution and management
✅ Handle empty results gracefully

## Data Presentation Examples:

### **Simple List Format:**
```
Test Cases in Plan: [Plan Name]

1. PROJ-1 - Test Case Name (Status: Not Executed)
2. PROJ-2 - Another Test Case (Status: Passed)
3. PROJ-3 - Third Test Case (Status: Failed)
```

### **Detailed Format:**
```
Test Cases in Plan: [Plan Name]

PROJ-1 - Test Case Name
├─ ID: 13
├─ Version: 1
├─ Execution Status: Not Executed (n)
├─ Type: Manual (1)
├─ Platform: None (0)
├─ Execution Order: 1
└─ Assignment ID: 1

PROJ-2 - Another Test Case
├─ ID: 27
├─ Version: 1
├─ Execution Status: Passed (p)
├─ Type: Automated (2)
├─ Platform: None (0)
├─ Execution Order: 2
└─ Assignment ID: 2
```

### **Execution Summary Format:**
```
Test Plan Execution Summary: [Plan Name]

Total Test Cases: 4
├─ Not Executed: 2
├─ Passed: 1
├─ Failed: 1
└─ Blocked: 0

Execution Progress: 50% (2/4 completed)
```

## Agent Response Template:

**When query succeeds:**
```
Found [count] test cases in test plan: [plan_name]

Test Cases:
[Formatted list of test cases with execution information]

Execution Summary:
- Total: [total_count]
- Not Executed: [not_executed_count]
- Passed: [passed_count]
- Failed: [failed_count]
- Blocked: [blocked_count]

Next Steps:
- Use create_test_execution to record execution results
- Use read_test_execution to get detailed execution info
- Use add_test_case_to_test_plan to add more test cases
```

**When no test cases found:**
```
No test cases found in test plan: [plan_name]

This means the test plan is empty and needs test cases assigned.

Suggestions:
- Use add_test_case_to_test_plan to assign test cases
- Use list_test_cases_in_suite to find available test cases
- Check if test cases are assigned to different test plans
```

**When handling errors:**
```
❌ Failed to get test cases: [error_message]

Troubleshooting:
1. Verify test plan ID is correct
2. Check test plan exists using list_test_plans
3. Ensure you have access to the test plan
4. Verify test plan belongs to correct project

Would you like me to help resolve this issue?
```
