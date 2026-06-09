# Sync TestLink Test Cases

Synchronize TestLink test cases with local test case files. This command automates the process of comparing, updating, and creating test cases in TestLink based on local markdown files.

## When to Use

- After creating or updating local test case files that need syncing to TestLink
- Before test execution when TestLink must reflect the latest test cases

## Usage

When user provides:
1. A TestLink test case ID (e.g., PROJ-12345)
2. A local test case file path

## Process

### Step 1: Get Test Suite ID
- Retrieve the specified test case from TestLink using the test case ID
- Extract the test suite ID from the response
- Confirm suite name and ID with the user

### Step 2: List All Test Cases in Suite
- Use the suite ID to get all test cases in the test suite
- Display summary: total count and test case IDs

### Step 3: Verify Mapping File IDs
- If a `testlink_mapping.md` file exists in the project, verify that the TestLink IDs listed match the actual test case external IDs returned from Step 2
- Flag any mismatches (wrong IDs, missing IDs) before proceeding
- If mismatches are found, ask the user to confirm before continuing

### Step 4: Compare with Local File
- Read the local test case markdown file
- Compare each test case from local file with TestLink:
  - Check if test case exists in TestLink
  - Compare: name, summary, preconditions, steps (actions and expected results)
  - Track differences found
  - **If test case matches completely (no differences):**
    - Skip the test case - no update needed
    - Add to "Test Cases Already Matching" list
    - Do NOT call update API for matching test cases

### Step 5: Update or Create Test Cases
- **For existing test cases that match completely:**
  - Skip update - preserve existing test case as-is
  - Report as "already matching" in summary

- **For existing test cases with differences:**
  - **Version Backup**: Before updating, prompt the user: "Please create a new version for {Test Case ID} in TestLink before I update it." Wait for confirmation before proceeding.
  - Update only the fields that differ
  - Preserve test case IDs and version history
  - Report what was updated

- **For missing test cases (in local but not in TestLink):**
  - Create new test cases with proper formatting
  - Use HTML formatting according to TestLink format guidelines
  - Apply proper importance level (1=High/P0, 2=Medium/P1, 3=Low/P2)
  - Set execution_type to 1 (manual)
  - Set status to 1 (final/ready)
  - Report new test case IDs created

### Step 6: Review Preconditions
- After updates/creation, retrieve all test cases again
- Check each test case for:
  - Missing preconditions (empty string)
  - Incorrect preconditions (not matching local file)
- Fix any missing or incorrect preconditions
- Report final status of all preconditions

### Step 7: Final Verification (Optional)
- Optionally review entire test case content:
  - Summary formatting
  - Step formatting
  - HTML entities correctness
  - Cross-references to other test cases

## Output Format

Provide structured summary:

### Summary Report:
- **Test Suite:** [Name] (ID: [suite_id])
- **Total Test Cases in Local File:** X
- **Total Test Cases in TestLink:** Y

### Test Cases Already Matching: X
- List test case IDs and names

### Test Cases Updated: X
- List test case IDs, names, and what was updated

### New Test Cases Created: X
- List new test case IDs and names

### Preconditions Fixed: X
- List test case IDs with precondition issues fixed

### Final Status:
✅ All X test cases synchronized successfully

## Example Usage

**User:** "Sync PROJ-12345 with [@03_TS-04_RESTful_API_Integration.md](file)"

**Agent Response:**
1. Retrieves PROJ-12345 to get suite ID 1234567
2. Lists all test cases in suite (found 5 existing)
3. Compares with local file (8 test cases total)
4. Updates 2 test cases with precondition differences
5. Creates 3 new test cases for Accounting profiles
6. Reviews and fixes 3 missing preconditions
7. Provides final summary report

## Notes

- Always use TestLink HTML format for content
- Preserve existing test case properties when updating
- Use proper HTML entities (&gt;, &lt;, &quot;, etc.)
- Format preconditions as `<ul><li>` lists
- Break down complex tasks into subtodos for tracking
- Mark todos as completed immediately after finishing each step
- Author login should be your TestLink username for new test cases
- Project ID should match your TestLink project (use list_projects to find it)

## TestLink Format

See `/tl-format` for HTML formatting rules (preconditions, step actions, expected results, summaries, and entity encoding).

## Error Handling

- If test case ID not found, ask user to verify the ID
- If local file not found, ask user to provide correct path
- If preconditions field is returned as empty string from create operation, immediately update with correct preconditions
- If API returns error, report the error and suggest resolution
