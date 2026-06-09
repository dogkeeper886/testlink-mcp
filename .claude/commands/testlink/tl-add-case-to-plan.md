# Add Test Case to Test Plan

```
Add a test case to a test plan in TestLink with proper validation and error handling.

## Agent Instructions:
1. Extract test case and test plan data from user input
2. Validate all required fields before API call
3. Use correct ID formats (external for test case, numeric for plan/project)
4. Call TestLink MCP add_test_case_to_test_plan tool with validated data
5. Handle common errors and provide clear feedback

## Expected User Input Format:
User should provide:
- Test Case ID (external format like "PROJ-1" or numeric like "5")
- Test Plan ID (numeric)
- Test Project ID (numeric)
- Urgency Level (optional, 1=low, 2=medium, 3=high)
- Platform ID (optional)
- Overwrite Flag (optional, true/false)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (testcaseid, testplanid, testprojectid)
2. **Validate IDs**: Ensure test case exists and test plan exists
3. **Check Assignment**: Verify test case is not already assigned (unless overwrite=true)
4. **Format Data**: Prepare data object with correct field names
5. **Call API**: Use add_test_case_to_test_plan tool with validated data
6. **Handle Errors**: Provide clear error messages for common issues

## Example Usage:
**User Input:**
```
Add test case PROJ-1 to test plan 10
Project: 1
Urgency: High
```

**Agent Processing:**
1. Extract: testcaseid="PROJ-1", testplanid="10", testprojectid="1", urgency="High"
2. Validate: Check test case exists, test plan exists
3. Check: Verify test case not already assigned
4. Format: urgency=3 (convert High to 3)
5. Call: add_test_case_to_test_plan with validated data
6. Verify: Check assignment was successful

**API Notes:**
- testcaseid: Use external format (PROJ-1) or numeric ID
- testplanid: Must be numeric ID
- testprojectid: Must be numeric ID
- urgency: 1=low, 2=medium, 3=high (defaults to 2)
- overwrite: true/false (defaults to false)

## Common Errors & Solutions:

### ❌ "Missing required fields"
**Cause**: Missing testcaseid, testplanid, or testprojectid
**Solution**: Ensure all required fields are provided

### ❌ "Test case not found"
**Cause**: Invalid test case ID or test case doesn't exist
**Solution**: Verify test case exists using read_test_case or list_test_cases_in_suite

### ❌ "Test plan not found"
**Cause**: Invalid test plan ID or test plan doesn't exist
**Solution**: Verify test plan exists using list_test_plans

### ❌ "Test case already assigned"
**Cause**: Test case already linked to test plan
**Solution**: Use overwrite=true to replace existing assignment

### ❌ "Test case not in project"
**Cause**: Test case belongs to different project than test plan
**Solution**: Verify test case and test plan are in same project

## Required Fields:
- testcaseid: String (external format like "PROJ-1" or numeric like "5")
- testplanid: String (numeric test plan ID)
- testprojectid: String (numeric project ID)

## Optional Fields:
- version: Number (test case version, defaults to 1)
- platformid: String (platform ID for multi-platform test plans)
- urgency: Number (1=low, 2=medium, 3=high, defaults to 2)
- overwrite: Boolean (replace existing assignment, defaults to false)

## Step-by-Step Process:

### 1. Validate Test Case
- Use read_test_case to verify test case exists
- Extract project ID from test case if not provided
- Confirm test case is active and accessible

### 2. Validate Test Plan
- Use list_test_plans to verify test plan exists
- Confirm test plan is active
- Verify test plan belongs to correct project

### 3. Check Existing Assignment
- Use get_test_cases_for_test_plan to check if already assigned
- If assigned and overwrite=false, inform user
- If assigned and overwrite=true, proceed with assignment

### 4. Prepare Assignment Data
- Format urgency level (High=3, Medium=2, Low=1)
- Set overwrite flag appropriately
- Include platform ID if specified

### 5. Execute Assignment
- Call add_test_case_to_test_plan with prepared data
- Handle any API errors gracefully
- Verify assignment was successful

## Urgency Level Mapping:
- **1** = Low priority
- **2** = Medium priority (default)
- **3** = High priority

## Best Practices:
✅ Always validate test case and test plan exist before assignment
✅ Check for existing assignments to avoid duplicates
✅ Use appropriate urgency levels based on test importance
✅ Verify test case and test plan are in same project
✅ Use overwrite=true only when replacing existing assignments
✅ Provide clear feedback on assignment success/failure

## Error Handling Examples:

**Missing Fields Error:**
```
❌ Error: Missing required fields: testcaseid, testplanid, testprojectid
✅ Solution: Ensure all required fields are provided
```

**Test Case Not Found Error:**
```
❌ Error: Test case not found
✅ Solution: Verify test case exists using read_test_case
```

**Already Assigned Error:**
```
❌ Error: Test case already assigned to test plan
✅ Solution: Use overwrite=true to replace existing assignment
```

## Agent Response Template:

**When assignment succeeds:**
```
Test case successfully added to test plan!

Assignment Details:
- Test Case: [test_case_name] (ID: [testcaseid])
- Test Plan: [test_plan_name] (ID: [testplanid])
- Project: [project_name] (ID: [testprojectid])
- Urgency: [urgency_level]
- Assignment ID: [feature_id]

Test case is now available for execution in the test plan.
```

**When handling errors:**
```
❌ Failed to add test case to test plan: [error_message]

Troubleshooting:
1. Verify test case exists and is accessible
2. Check test plan exists and is active
3. Ensure test case and test plan are in same project
4. Use overwrite=true if test case already assigned
5. Verify all required fields are provided

Would you like me to help resolve this issue?
```
