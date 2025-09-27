# Create TestLink Test Execution

```
Create new test execution in TestLink with proper status and execution data.

## Agent Instructions:
1. Extract test execution data from user input
2. Use NUMERIC test case ID (not external ID format)
3. Validate all required fields before API call
4. Call TestLink MCP create_test_execution tool with validated data
5. Handle common errors and provide clear feedback

## Expected User Input Format:
User should provide:
- Test Case ID (NUMERIC format like "13", not "GPDL-1")
- Test Plan ID (numeric)
- Build ID (numeric)
- Execution Status (p/f/b for pass/fail/block)
- Execution Notes (optional)
- Platform ID (optional)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (test_case_id, plan_id, build_id, status)
2. **Convert Test Case ID**: Use numeric ID, not external format
3. **Validate Status**: Ensure status is valid (p/f/b)
4. **Format Notes**: Clean up execution notes
5. **Call API**: Use create_test_execution tool with validated data
6. **Handle Errors**: Provide clear error messages for common issues

## Example Usage:
**User Input:**
```
Create test execution for test case PROJ-1
Test Plan: 10
Build: 2
Status: Pass
Notes: All validations completed successfully
```

**Agent Processing:**
1. Extract: testCaseId="PROJ-1", planId="10", buildId="2", status="Pass"
2. Convert: testCaseId="5" (numeric ID from external format)
3. Validate: status="p" (convert to single letter)
4. Format: notes="All validations completed successfully"
5. Call: create_test_execution with validated data
6. Verify: Check creation was successful

**API Notes:**
- MUST use numeric test case ID (e.g., "5") not external format (e.g., "PROJ-1")
- Test case must be assigned to the test plan first
- Build must exist and be active/open
- Status must be single letter: p=pass, f=fail, b=block

## Common Errors & Solutions:

### ❌ "Test Case ID (testcaseid: 1) provided does not exist"
**Cause**: Using external ID format (PROJ-1) instead of numeric ID
**Solution**: Convert external ID to numeric ID
- PROJ-1 → 5
- PROJ-2 → 10
- PROJ-3 → 15
- PROJ-4 → 20

### ❌ "Missing required fields"
**Cause**: Missing test_case_id, plan_id, build_id, or status
**Solution**: Ensure all required fields are provided

### ❌ "Test case not assigned to test plan"
**Cause**: Test case not linked to the specified test plan
**Solution**: Use add_test_case_to_test_plan first

### ❌ "Build not found or inactive"
**Cause**: Build ID doesn't exist or is closed
**Solution**: Verify build exists and is active using list_builds

## Status Values:
- **p** = Pass (test execution successful)
- **f** = Fail (test execution failed)
- **b** = Block (test execution blocked)

## Required Fields:
- test_case_id: String (NUMERIC ID like "5", not "PROJ-1")
- plan_id: String (test plan ID)
- build_id: String (build ID)
- status: String (p/f/b)
- notes: String (execution notes, optional)
- platform_id: String (platform ID, optional)

## Step-by-Step Process:

### 1. Get Test Case Numeric ID
If user provides external ID (PROJ-1), convert to numeric:
- Use list_test_cases_in_suite to find numeric ID
- Or use read_test_case with external ID to get internal ID

### 2. Validate Test Plan and Build
- Verify test plan exists using list_test_plans
- Verify build exists and is active using list_builds

### 3. Check Test Case Assignment
- Use get_test_cases_for_test_plan to verify test case is assigned
- If not assigned, use add_test_case_to_test_plan first

### 4. Create Execution
- Call create_test_execution with validated data
- Handle any remaining errors gracefully

## Best Practices:
✅ Always use numeric test case IDs
✅ Validate all IDs exist before creating execution
✅ Use clear, descriptive execution notes
✅ Check test case assignment to test plan
✅ Verify build is active before execution
✅ Use appropriate status values (p/f/b)
✅ Handle errors with clear user feedback

## Error Handling Examples:

**External ID Error:**
```
❌ Error: Test Case ID (testcaseid: 1) provided does not exist
✅ Solution: Convert PROJ-1 to numeric ID 5
```

**Missing Assignment Error:**
```
❌ Error: Test case not assigned to test plan
✅ Solution: Use add_test_case_to_test_plan first
```

**Invalid Build Error:**
```
❌ Error: Build not found
✅ Solution: Check build exists with list_builds
```

## Agent Response Template:

**When creating test execution:**
```
Test execution created successfully!

Execution Details:
- Execution ID: [execution_id]
- Test Case: [test_case_name] (ID: [numeric_id])
- Test Plan: [test_plan_name] (ID: [plan_id])
- Build: [build_name] (ID: [build_id])
- Status: [status_description]
- Notes: [execution_notes]

Execution recorded in TestLink system.
```

**When handling errors:**
```
❌ Test execution failed: [error_message]

Troubleshooting:
1. Verify test case ID is numeric (not external format)
2. Check test case is assigned to test plan
3. Verify build exists and is active
4. Ensure all required fields are provided

Would you like me to help resolve this issue?
```
