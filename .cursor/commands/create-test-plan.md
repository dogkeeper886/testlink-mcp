# Create TestLink Test Plan

```
Create new test plan in TestLink with plain text formatting and TestLink compliance.

## Agent Instructions:
1. Extract test plan data from user input
2. **DO NOT apply HTML formatting** - TestLink API doesn't support it for test plans
3. Use project name (not prefix) for project identification
4. Call TestLink MCP create_test_plan tool with plain text data
5. Provide HTML source for user to copy to web interface manually

## Expected User Input Format:
User should provide:
- Project Name (e.g., "Guest Pass Device Limitation")
- Test Plan Name
- Test Plan Description/Notes (optional)
- Active Status (optional, defaults to active)
- Public Status (optional, defaults to public)

## Agent Processing Steps:
1. **Validate Input**: Check for required fields (project name, test plan name)
2. **Use Plain Text**: Send description/notes as plain text (no HTML formatting)
3. **Call API**: Use create_test_plan tool with plain text data
4. **Verify Creation**: Confirm test plan was created successfully
5. **Provide HTML Source**: Give user HTML code to copy to web interface manually

## Example Usage:
**User Input:**
```
Create test plan for project "Guest Pass Device Limitation"
Name: Device Limit Validation Test Plan
Description: Comprehensive test plan for validating device limit functionality
Scope:
- WLAN profile configuration with device limits (1-1000)
- UI validation and boundary testing
- Configuration persistence and data integrity
- API functionality and error handling
```

**Agent Processing:**
1. Extract: projectName="Guest Pass Device Limitation", name="Device Limit Validation Test Plan", etc.
2. Use plain text: "Comprehensive test plan for validating device limit functionality. Scope: WLAN profile configuration with device limits (1-1000), UI validation and boundary testing, Configuration persistence and data integrity, API functionality and error handling."
3. Call: create_test_plan with plain text data
4. Verify: Check creation was successful
5. Provide HTML source for manual copy to web interface

**API Notes:**
- Must use exact project name, not project prefix (e.g., "Guest Pass Device Limitation" not "GPDL")
- Project name must match exactly as shown in list_projects output
- Test plan will be created in the specified project
- ⚠️ **IMPORTANT**: Use PLAIN TEXT only - no HTML formatting in API calls
- ⚠️ **LIMITATION**: TestLink XML-RPC API does NOT support HTML formatting for test plans

## Manual HTML Formatting (for Web Interface):
If user wants rich formatting, provide HTML source for manual copy to TestLink web interface:

**HTML Template:**
```html
<h3>Test Plan Overview</h3>
<p>Brief description of the test plan purpose and scope.</p>

<h4>Scope</h4>
<ul>
<li>First area of testing</li>
<li>Second area of testing</li>
<li>Third area of testing</li>
</ul>

<h4>Test Strategy</h4>
<p>Description of the overall testing approach and methodology.</p>

<h4>Success Criteria</h4>
<ul>
<li>First success criterion</li>
<li>Second success criterion</li>
</ul>
```

**Instructions for User:**
1. Create test plan via API (plain text)
2. Open TestLink web interface
3. Navigate to Test Plan Management
4. Edit the created test plan
5. Copy HTML source above into the Description field
6. Save changes

## Plain Text Formatting (for API):
Use simple, clear descriptions without HTML:

**Plain Text Examples:**
- Simple description: "Comprehensive test plan for validating device limit functionality"
- Structured description: "Test Plan Overview: Brief description. Scope: First area, Second area, Third area. Test Strategy: Description of approach. Success Criteria: First criterion, Second criterion."
- Technical details: "Test plan for Device Limit feature with MAC randomization support"

Required Create Fields:
- project_id: String (exact project name, not prefix)
- name: String (test plan name)
- notes: String (plain text description, optional)
- active: Integer (1 = active, 0 = inactive, optional, defaults to 1)
- is_public: Integer (1 = public, 0 = private, optional, defaults to 1)

Best Practices:
✅ Use exact project name from list_projects output
✅ Use plain text descriptions (no HTML formatting)
✅ Keep descriptions clear and comprehensive
✅ Always verify creation was successful
✅ Use descriptive test plan names with clear purpose
✅ Provide HTML source for manual web interface formatting if needed

Common Issues & Solutions:
❌ "Test Project (name:XXX) does not exist" → Use exact project name from list_projects, not prefix
❌ "Missing required fields" → Ensure project_id and name are provided
❌ "Project ID must contain only digits" → Use project name, not numeric ID
❌ Test plan not appearing → Verify project name matches exactly
❌ User wants HTML formatting → Provide HTML source for manual copy to web interface

Project Name Examples:
✅ Correct: "Guest Pass Device Limitation"
❌ Incorrect: "GPDL" (this is the prefix)
❌ Incorrect: "1" (this is the numeric ID)

Test Plan Naming Conventions:
✅ "AIGEN - [Feature] Test Plan" for AI-generated test plans
✅ "Manual - [Feature] Validation" for manual testing focus
✅ "Automated - [Feature] Regression" for automated testing
✅ "Integration - [System] Testing" for integration testing

## ⚠️ Important: No HTML Formatting in API Calls

**TestLink XML-RPC API Limitation:**
- Test plan `notes` field only supports plain text
- HTML formatting will be stored as encoded text and display as raw code
- Use plain text descriptions only in API calls

**For Rich Formatting:**
- Create test plan via API with plain text
- Provide HTML source for user to copy manually to web interface
- Web interface supports full HTML rendering

## Agent Response Template:

**When creating test plan:**
```
Test plan created successfully!

Test Plan Details:
- ID: [plan_id]
- Name: [test_plan_name]
- Project: [project_name]
- Status: Active and Public

For rich HTML formatting, copy this HTML source to the TestLink web interface:

[HTML_SOURCE_HERE]

Instructions:
1. Open TestLink web interface
2. Navigate to Test Plan Management
3. Edit the created test plan
4. Copy the HTML source above into the Description field
5. Save changes
```
