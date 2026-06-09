# Execute Test Case with Browser Automation

```
Execute test case from TestLink using browser MCP tools to perform automated testing and verify feature functionality.

## Agent Instructions:
1. Read test case from TestLink using test case ID
2. Navigate to the application URL
3. Perform login if credentials provided
4. Execute each test step sequentially using browser MCP tools
5. Verify expected results at each step
6. Document test execution results
7. Determine if feature meets test objective

## Expected User Input Format:
User should provide:
- Test Case ID (external format like "TC-001" or numeric)
- Application URL (e.g., "app.example.com")
- Login credentials (optional):
  - Email/Username
  - Password
- Any additional context or requirements

## Agent Processing Steps:
1. **Read Test Case**: Get test case details from TestLink
2. **Browser Setup**: Navigate to application URL, resize if needed
3. **Authentication**: Login if credentials provided
4. **Execute Steps**: Follow each test step sequentially
5. **Verify Results**: Check expected results match actual results
6. **Document Outcomes**: Record pass/fail status for each step
7. **Final Assessment**: Determine if feature meets test objective

## Browser MCP Tools Available:
- `playwright-mcp:browser_navigate` - Navigate to URL
- `playwright-mcp:browser_snapshot` - Capture page state/structure
- `playwright-mcp:browser_click` - Click buttons/elements
- `playwright-mcp:browser_type` - Enter text in fields
- `playwright-mcp:browser_select_option` - Select dropdown options
- `playwright-mcp:browser_hover` - Hover over elements
- `playwright-mcp:browser_press_key` - Press keyboard keys
- `playwright-mcp:browser_wait_for` - Wait for text/elements/time
- `playwright-mcp:browser_resize` - Resize browser window
- `playwright-mcp:browser_take_screenshot` - Capture screenshots
- `playwright-mcp:browser_console_messages` - Get console messages
- `playwright-mcp:browser_network_requests` - Get network requests

## Example Usage:
**User Input:**
```
Execute test case TC-001
URL: app.example.com
Credentials: user@example.com / your-password
```

**Agent Processing:**
1. Read test case TC-001 from TestLink
2. Navigate to https://app.example.com
3. Login with provided credentials
4. Follow all test steps from the test case
5. Verify each expected result
6. Document execution results

## Step-by-Step Execution Workflow:

### 1. Read Test Case from TestLink
```
- Use testlink-mcp:read_test_case with test case ID
- Extract: name, summary, preconditions, steps
- Understand test objective and expected behavior
```

### 2. Browser Initialization
```
- Navigate to application URL
- Resize browser to minimum 1280px width if needed
- Take initial snapshot to understand page structure
- Wait for page to fully load
```

### 3. Authentication (if required)
```
- Locate login form elements
- Enter credentials in appropriate fields
- Click login/submit button
- Wait for authentication to complete
- Verify successful login (check for dashboard/main page)
```

### 4. Execute Test Steps
For each test step:
```
- Read step action and expected result
- Locate UI elements using snapshot references
- Perform the action (click, type, select, etc.)
- Wait for action to complete
- Take snapshot to verify result
- Compare actual result with expected result
- Document pass/fail status
```

### 5. Element Interaction Patterns

**Clicking Elements:**
```
- Use browser_snapshot to get element reference
- Use browser_click with element ref
- Wait for action to complete
- Verify expected change occurred
```

**Typing Text:**
```
- Locate textbox/input field
- Use browser_type with element ref and text
- Verify text was entered correctly
```

**Selecting Options:**
```
- Locate dropdown/combobox
- Use browser_select_option with element ref and values
- Verify selection was applied
```

**Navigation:**
```
- Use browser_navigate for direct URL navigation
- Or click navigation menu items
- Verify correct page loaded
```

### 6. Verification Strategies

**Verify Page Display:**
```
- Check URL matches expected path
- Verify page title or heading
- Confirm key elements are visible
```

**Verify Form Fields:**
```
- Check field values match expected input
- Verify validation messages (if any)
- Confirm field states (enabled/disabled)
```

**Verify Table/List Content:**
```
- Locate table/list in snapshot
- Find target row/item
- Verify column values match expected
- Check for success indicators
```

**Verify Messages/Notifications:**
```
- Look for success/error notifications
- Check for alert messages
- Verify message text matches expected
```

## Best Practices:

### Browser Setup:
✅ Resize browser to at least 1280px width for optimal display
✅ Wait for page loads between actions (2-3 seconds)
✅ Take snapshots frequently to understand page state
✅ Handle responsive design warnings gracefully

### Element Interaction:
✅ Always take snapshot before interacting with elements
✅ Use element references (ref) from snapshots for reliable interaction
✅ Wait for elements to be ready before interaction
✅ Verify actions completed successfully

### Error Handling:
✅ Check for validation errors after form input
✅ Handle page load timeouts gracefully
✅ Verify element exists before interaction
✅ Document any unexpected behaviors

### Test Execution:
✅ Execute steps in sequential order
✅ Verify each step before proceeding to next
✅ Document actual vs expected results
✅ Capture screenshots at key verification points
✅ Note any discrepancies or issues

### Credentials Management:
✅ Use provided credentials securely
✅ Clear sensitive data from logs if needed
✅ Handle authentication failures gracefully

## Common Issues & Solutions:

### ❌ "Screen width too low" warning
**Cause**: Browser window too narrow
**Solution**: Use browser_resize to set width to 1280px or higher

### ❌ Element not found in snapshot
**Cause**: Page not fully loaded or element not visible
**Solution**: 
- Wait for page to load (browser_wait_for)
- Take new snapshot
- Check if element is in different location

### ❌ Form validation errors
**Cause**: Invalid input or missing required fields
**Solution**:
- Check field requirements
- Verify input format
- Clear and re-enter correct values

### ❌ Login fails
**Cause**: Invalid credentials or authentication issue
**Solution**:
- Verify credentials are correct
- Check for error messages
- Try navigating directly to login page

### ❌ Page navigation doesn't work
**Cause**: Element not clickable or page not ready
**Solution**:
- Wait for page to be interactive
- Try alternative navigation method
- Check for JavaScript errors in console

### ❌ Expected result doesn't match
**Cause**: Feature bug or test case mismatch
**Solution**:
- Document the discrepancy
- Take screenshot for evidence
- Continue with remaining steps
- Note in final assessment

## Test Execution Documentation:

### Step-by-Step Results:
For each step, document:
- Step number and action
- Actual result observed
- Expected result from test case
- Pass/Fail status
- Screenshots (if applicable)
- Notes or issues

### Final Test Summary:
```
Test Case: [Test Case ID] - [Test Case Name]
Test Objective: [Summary from test case]
Execution Date: [Date/Time]
Environment: [URL/Environment]

Test Steps Executed: [X] of [Total]
Steps Passed: [X]
Steps Failed: [X]
Steps Blocked: [X]

Overall Result: PASS / FAIL / BLOCKED

Key Findings:
- [Finding 1]
- [Finding 2]

Issues/Discrepancies:
- [Issue 1]
- [Issue 2]

Conclusion:
[Does the feature meet the test objective?]
```

## Agent Response Template:

**When starting execution:**
```
Starting test execution for [Test Case ID]: [Test Case Name]

Test Objective: [Summary]
Total Steps: [Number]

Navigating to [URL]...
```

**During execution:**
```
Step [X]: [Action]
✓ Expected: [Expected Result]
✓ Actual: [Actual Result]
Status: PASS / FAIL
```

**When execution completes:**
```
Test execution completed!

Summary:
- Total Steps: [X]
- Passed: [X]
- Failed: [X]
- Overall Result: PASS / FAIL

The feature [meets/does not meet] the test objective.
```

## Integration with TestLink:

After execution, you may want to:
- Create test execution record in TestLink
- Update test case with findings
- Create bug reports for failures
- Document test results for reporting

Use related commands:
- `/tl-create-execution` - Record execution in TestLink
- `/pm-bug-report` - Create bug reports for failures
- `/tl-update-case` - Update test case with findings

## Advanced Techniques:

### Handling Dynamic Content:
- Use browser_wait_for to wait for specific text
- Take multiple snapshots to track changes
- Use network requests to verify API calls

### Debugging:
- Use browser_console_messages to check for errors
- Use browser_network_requests to verify API calls
- Take screenshots at each step for troubleshooting

### Performance Testing:
- Monitor page load times
- Check for slow network requests
- Document performance observations

## Notes:
- Always verify test case steps are clear before execution
- Document any ambiguities in test steps
- Take screenshots for evidence of pass/fail
- Be thorough in verification - don't skip expected results
- If test fails, document exact failure point and behavior
```

