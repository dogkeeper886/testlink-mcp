# Read TestLink Test Execution

```
Read test execution details from TestLink with proper error handling and troubleshooting.

## Agent Instructions:
1. Extract test execution parameters from user input
2. Understand the API limitation - requires test case ID
3. Provide alternative approaches when direct reading fails
4. Guide users to available workarounds
5. Handle errors gracefully with clear explanations

## Expected User Input Format:
User should provide:
- Test Plan ID (numeric)
- Test Case ID (optional, but recommended for better results)
- Build ID (optional, to filter by specific build)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (plan_id)
2. **Explain Limitation**: Inform user about test case ID requirement
3. **Provide Alternatives**: Suggest workarounds for reading executions
4. **Attempt API Call**: Try read_test_execution with available parameters
5. **Handle Errors**: Provide clear error messages and solutions

## Example Usage:
**User Input:**
```
Read test executions for test plan 10
```

**Agent Processing:**
1. Extract: plan_id="10"
2. Explain: API requires test case ID for best results
3. Suggest: Use get_test_cases_for_test_plan first to get test cases
4. Attempt: Call read_test_execution with plan_id only
5. Handle: Provide error explanation and alternatives

**API Notes:**
- ⚠️ **LIMITATION**: TestLink API requires test case ID for reliable execution reading
- Plan ID alone may not return all executions
- Test case ID provides more accurate results
- Build ID can filter executions by specific build

## Common Errors & Solutions:

### ❌ "Expected one of this fields: {["testcaseid","testcaseexternalid"]}"
**Cause**: TestLink API requires test case ID for execution reading
**Solution**: Use test case ID or alternative approach

### ❌ "Test plan not found"
**Cause**: Invalid test plan ID
**Solution**: Verify test plan exists using list_test_plans

### ❌ "No executions found"
**Cause**: No test executions exist for the criteria
**Solution**: Check if test cases are assigned and executed

## Alternative Approaches:

### 1. **Get Test Cases First (Recommended)**
```
1. Use get_test_cases_for_test_plan to get test cases in plan
2. For each test case, use read_test_execution with test case ID
3. Compile results for complete execution overview
```

### 2. **Use Test Case ID Directly**
```
1. Get test case ID from user or previous operations
2. Use read_test_execution with both plan_id and test case ID
3. Get specific execution details for that test case
```

### 3. **Check Build-Specific Executions**
```
1. Use list_builds to get available builds
2. Use read_test_execution with plan_id and build_id
3. Get executions for specific build
```

## Required Fields:
- plan_id: String (test plan ID)

## Optional Fields:
- test_case_id: String (test case ID for better results)
- build_id: String (build ID to filter executions)

## Step-by-Step Process:

### 1. Validate Test Plan
- Use list_test_plans to verify test plan exists
- Confirm test plan is active and accessible

### 2. Choose Approach
- **Option A**: Get test cases first, then read executions
- **Option B**: Use provided test case ID directly
- **Option C**: Read all executions (may have limitations)

### 3. Execute Reading
- Call read_test_execution with available parameters
- Handle API limitations gracefully
- Provide alternative suggestions if needed

### 4. Process Results
- Interpret execution data
- Present results in user-friendly format
- Highlight any limitations or missing data

## Workaround Strategies:

### **Strategy 1: Complete Execution Overview**
```
1. get_test_cases_for_test_plan(plan_id) → Get all test cases
2. For each test case:
   - read_test_execution(plan_id, test_case_id)
3. Compile all execution results
```

### **Strategy 2: Build-Specific Executions**
```
1. list_builds(plan_id) → Get available builds
2. For each build:
   - read_test_execution(plan_id, build_id)
3. Show executions by build
```

### **Strategy 3: Test Case Specific**
```
1. User provides specific test case ID
2. read_test_execution(plan_id, test_case_id)
3. Get detailed execution for that test case
```

## Best Practices:
✅ Always explain API limitations upfront
✅ Provide alternative approaches when direct reading fails
✅ Use test case ID when available for better results
✅ Suggest getting test cases first for complete overview
✅ Handle errors gracefully with clear explanations
✅ Offer multiple strategies based on user needs

## Error Handling Examples:

**API Limitation Error:**
```
❌ Error: Expected one of this fields: {["testcaseid","testcaseexternalid"]}
✅ Solution: Use test case ID or get test cases first
```

**No Executions Found:**
```
❌ Error: No executions found
✅ Solution: Check if test cases are assigned and executed
```

## Agent Response Template:

**When explaining limitation:**
```
⚠️ TestLink API Limitation: read_test_execution requires a test case ID for reliable results.

Available Approaches:
1. Get test cases first: get_test_cases_for_test_plan(plan_id)
2. Use specific test case ID: read_test_execution(plan_id, test_case_id)
3. Try with plan ID only (may have limitations)

Which approach would you prefer?
```

**When providing alternatives:**
```
Since direct execution reading has limitations, here are your options:

Option 1 - Complete Overview:
1. Get all test cases in the plan
2. Read executions for each test case
3. Compile complete execution report

Option 2 - Specific Test Case:
1. Provide specific test case ID
2. Read executions for that test case only

Option 3 - Build-Specific:
1. Get available builds
2. Read executions by build

Which option would you like me to execute?
```

**When execution succeeds:**
```
Test execution details retrieved successfully!

Execution Summary:
- Test Plan: [plan_name] (ID: [plan_id])
- Test Case: [test_case_name] (ID: [test_case_id])
- Build: [build_name] (ID: [build_id])
- Status: [execution_status]
- Notes: [execution_notes]

[Additional execution details...]
```
