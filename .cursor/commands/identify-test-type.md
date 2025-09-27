# Identify TestLink Test Case Type

```
Identify test case type (GUI, API, or other) and add appropriate prefix based on content analysis.

## Agent Instructions:
1. Analyze test case content to determine test type (GUI, API, or other)
2. Add appropriate prefix to test case name based on identified type
3. Apply HTML formatting if needed
4. Return test case with proper type prefix

## Expected User Input:
User provides test case data for type identification:
- Test case name
- Summary/Test Objective
- Test steps with actions and expected results
- Any additional test case content

## Agent Processing Steps:
1. **Analyze Content**: Review test case name, summary, and steps
2. **Identify Test Type**: Determine if it's GUI, API, or other type
3. **Apply Prefix**: Add appropriate prefix to test case name
4. **Format Content**: Apply HTML formatting if needed
5. **Return Result**: Provide test case with proper type prefix

## Test Type Identification Rules:

### [GUI] Prefix - UI Validation Tests:
Apply when test case contains:
- UI element interactions (buttons, menus, forms, fields)
- Navigation between pages/screens
- Visual validation or display checks
- User interface testing
- Browser-based operations
- Click, type, select, hover actions
- Page loading, rendering, responsiveness
- Form validation, input fields, dropdowns
- Modal dialogs, popups, alerts
- Screen resolution, layout testing

**Keywords to look for:**
- "click", "navigate", "select", "type", "hover"
- "button", "menu", "form", "field", "dropdown"
- "page", "screen", "window", "dialog"
- "display", "show", "render", "appear"
- "UI", "interface", "browser", "web"

### [API] Prefix - API Operation Tests:
Apply when test case contains:
- HTTP requests (GET, POST, PUT, DELETE)
- API endpoints, URLs, endpoints
- Request/response validation
- Data exchange between systems
- Backend service testing
- Integration testing
- Authentication tokens, headers
- JSON/XML data handling
- Status codes, error responses
- Database operations via API

**Keywords to look for:**
- "API", "endpoint", "request", "response"
- "HTTP", "GET", "POST", "PUT", "DELETE"
- "JSON", "XML", "data", "payload"
- "status code", "error", "success"
- "token", "header", "authentication"
- "service", "integration", "backend"

### No Prefix - Other Tests:
Leave unchanged when test case contains:
- Business logic testing
- Data validation
- Performance testing
- Security testing
- Configuration testing
- Environment setup
- General functional testing
- Non-UI, non-API operations

## Example Usage:

### GUI Test Case:
**User Input:**
```
Name: Login Page Validation
Summary: Verify user can login through the web interface
Steps:
1. Navigate to login page
2. Enter username in username field
3. Enter password in password field
4. Click Login button
5. Verify user is redirected to dashboard
Expected: User successfully logs in and sees dashboard page
```

**Agent Processing:**
1. Analyze: Contains "navigate", "click", "page", "field", "button"
2. Identify: GUI/UI validation test
3. Apply prefix: "[GUI] Login Page Validation"
4. Format: Apply HTML formatting
5. Return: Test case with [GUI] prefix

**Output:**
```
Name: [GUI] Login Page Validation
Summary: <p>Verify user can <strong>login</strong> through the web interface</p>
Steps:
1. <p>Navigate to login page</p>
2. <p>Enter username in username field</p>
3. <p>Enter password in password field</p>
4. <p>Click <strong>Login</strong> button</p>
5. <p>Verify user is redirected to dashboard</p>
Expected: <p>User successfully logs in and sees dashboard page</p>
```

### API Test Case:
**User Input:**
```
Name: User Authentication API
Summary: Verify API returns correct response for user authentication
Steps:
1. Send POST request to /api/auth/login
2. Include username and password in JSON payload
3. Verify response status code is 200
4. Validate response contains authentication token
Expected: API returns success response with valid token
```

**Agent Processing:**
1. Analyze: Contains "API", "POST request", "endpoint", "JSON", "status code"
2. Identify: API operation test
3. Apply prefix: "[API] User Authentication API"
4. Format: Apply HTML formatting
5. Return: Test case with [API] prefix

**Output:**
```
Name: [API] User Authentication API
Summary: <p>Verify API returns correct response for user authentication</p>
Steps:
1. <p>Send <strong>POST</strong> request to /api/auth/login</p>
2. <p>Include username and password in <strong>JSON</strong> payload</p>
3. <p>Verify response status code is <strong>200</strong></p>
4. <p>Validate response contains authentication token</p>
Expected: <p>API returns success response with valid token</p>
```

### Mixed Test Case:
**User Input:**
```
Name: Data Validation Test
Summary: Verify data integrity across the system
Steps:
1. Create test data in database
2. Process data through business logic
3. Validate data consistency
4. Clean up test data
Expected: Data maintains integrity throughout process
```

**Agent Processing:**
1. Analyze: Contains "data", "database", "business logic", "validation"
2. Identify: General functional test (not GUI or API specific)
3. Apply prefix: No prefix (leave unchanged)
4. Format: Apply HTML formatting
5. Return: Test case without prefix

**Output:**
```
Name: Data Validation Test
Summary: <p>Verify data integrity across the system</p>
Steps:
1. <p>Create test data in database</p>
2. <p>Process data through business logic</p>
3. <p>Validate data consistency</p>
4. <p>Clean up test data</p>
Expected: <p>Data maintains integrity throughout process</p>
```

## Prefix Application Rules:

### [GUI] Prefix Application:
- **UI Interactions**: Any test involving user interface elements
- **Navigation**: Page/screen navigation testing
- **Visual Validation**: Display, rendering, layout testing
- **Form Testing**: Input fields, buttons, dropdowns
- **Browser Operations**: Web-based testing

### [API] Prefix Application:
- **HTTP Operations**: Any HTTP request/response testing
- **Service Integration**: Backend service testing
- **Data Exchange**: API-based data operations
- **Authentication**: Token-based authentication testing
- **Endpoint Testing**: Specific API endpoint validation

### No Prefix (Leave Unchanged):
- **Business Logic**: Core functionality testing
- **Data Processing**: Data validation and manipulation
- **Configuration**: System configuration testing
- **Performance**: Performance and load testing
- **Security**: Security testing (non-API)
- **General Functional**: Broad functional testing

## HTML Formatting Applied:
- Summary: <p> tags with <strong> for emphasis
- Actions: <p> tags with <strong> for UI elements and technical terms
- Expected Results: <p> tags with <strong> for key outcomes
- HTML Entities: &gt;, &lt;, &quot;, &amp;, &apos; for special characters

## Success Criteria:
✅ Test type correctly identified (GUI, API, or other)
✅ Appropriate prefix applied based on test type
✅ Test case name properly prefixed
✅ Content formatted with appropriate HTML
✅ All special characters use HTML entities
✅ Test type clearly identified and categorized
✅ Ready for TestLink use with proper type prefix

## Common Scenarios:

### GUI Test Examples:
- "Login Page Testing" → "[GUI] Login Page Testing"
- "Form Validation" → "[GUI] Form Validation"
- "Navigation Testing" → "[GUI] Navigation Testing"
- "Button Functionality" → "[GUI] Button Functionality"

### API Test Examples:
- "User API Testing" → "[API] User API Testing"
- "Authentication Service" → "[API] Authentication Service"
- "Data Endpoint Validation" → "[API] Data Endpoint Validation"
- "HTTP Response Testing" → "[API] HTTP Response Testing"

### No Prefix Examples:
- "Data Validation" → "Data Validation" (unchanged)
- "Performance Testing" → "Performance Testing" (unchanged)
- "Security Testing" → "Security Testing" (unchanged)
- "Configuration Testing" → "Configuration Testing" (unchanged)
```
