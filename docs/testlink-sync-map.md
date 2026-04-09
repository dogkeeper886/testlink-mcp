# TestLink Sync Map

Maps YAML test scripts to TestLink test case content. Ready to sync when dogkeeper886/testlink-code#1 is resolved.

**Status:** NOT SYNCED — TestLink XML-RPC API lacks deleteTestCase/deleteTestSuite  
**Project:** testlink-mcp (ID 162, prefix tm)  
**Blocked by:** dogkeeper886/testlink-code#1, dogkeeper886/testlink-mcp#40

## Target TestLink Structure

```
testlink-mcp (project 162)
├── Build Tests (new suite)
│   ├── TC-BUILD-001: Project Build Verification
│   ├── TC-BUILD-002: TypeScript Strict Type Check
│   └── TC-BUILD-003: Build Output Verification
├── Integration Tests (new suite)
│   └── TC-INTEGRATION-001: Docker Image Build
├── E2E Tests (new suite)
│   └── TC-E2E-001: MCP Server Startup Validation
├── Tool Tests (new suite)
│   ├── TC-TOOL-000: TestLink API Connection Smoke Test
│   ├── TC-TOOL-001: create_test_case
│   ├── TC-TOOL-002: read_test_case
│   ├── TC-TOOL-003: update_test_case
│   ├── TC-TOOL-005: list_test_suites
│   ├── TC-TOOL-006: create_test_suite
│   ├── TC-TOOL-007: list_test_cases_in_suite
│   ├── TC-TOOL-008: update_test_suite
│   ├── TC-TOOL-009: list_test_plans
│   ├── TC-TOOL-010: create_test_plan
│   ├── TC-TOOL-011: add_test_case_to_test_plan
│   ├── TC-TOOL-012: get_test_cases_for_test_plan
│   ├── TC-TOOL-013: list_builds + create_build
│   ├── TC-TOOL-014: create_test_execution + read_test_execution
│   ├── TC-TOOL-015: close_build + delete_test_plan
│   ├── TC-TOOL-016: list_projects
│   ├── TC-TOOL-017: list_requirements
│   └── TC-TOOL-018: get_requirement
├── CRUD Tests (existing suite 163) — keep as seed data
├── Plan Tests (existing suite 164) — keep as seed data
└── CI-* suites (debris) — delete when API available
```

## Existing Seed Data (DO NOT MODIFY)

| TestLink ID | External | Name | Suite | Purpose |
|-------------|----------|------|-------|---------|
| 166 | tm-1 | Read Test Case | CRUD Tests (163) | Seed for TC-TOOL-002 |
| 168 | tm-2 | Update Test Case | CRUD Tests (163) | Seed for TC-TOOL-003 |
| 170 | tm-3 | Plan Workflow Case | Plan Tests (164) | Seed for TC-TOOL-012, 014 |

## Test Case Content

### Build Tests Suite

#### TC-BUILD-001: Project Build Verification

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/build/TC-BUILD-001.yml`
- **Summary:** Verify Node.js environment, install dependencies from lockfile, and compile TypeScript without errors.
- **Preconditions:**
  - Node.js 20+ installed
  - package-lock.json exists
- **Steps:**
  1. Action: Check Node.js version (`node --version`)  
     Expected: Version string matching v[0-9]+.[0-9]+.[0-9]+
  2. Action: Install dependencies (`npm ci`)  
     Expected: No ERR! in output
  3. Action: Compile TypeScript (`npm run build`)  
     Expected: No "error TS" or "Cannot find" in output
- **Importance:** High
- **Execution type:** Automated

#### TC-BUILD-002: TypeScript Strict Type Check

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/build/TC-BUILD-002.yml`
- **Summary:** Run TypeScript compiler in strict mode without emitting output to verify type safety.
- **Preconditions:**
  - TC-BUILD-001 passed (dependencies installed)
- **Steps:**
  1. Action: Run strict type check (`npx tsc --noEmit`)  
     Expected: No "error TS" or "Cannot find module" in output
- **Importance:** High
- **Execution type:** Automated

#### TC-BUILD-003: Build Output Verification

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/build/TC-BUILD-003.yml`
- **Summary:** Verify compiled build artifacts exist and are valid JavaScript.
- **Preconditions:**
  - TC-BUILD-001 passed (build completed)
- **Steps:**
  1. Action: Check dist/index.js exists  
     Expected: File exists
  2. Action: Check dist/index.d.ts exists  
     Expected: File exists
  3. Action: Validate dist/index.js is valid JS (`node --check dist/index.js`)  
     Expected: SYNTAX_OK
- **Importance:** Medium
- **Execution type:** Automated

---

### Integration Tests Suite

#### TC-INTEGRATION-001: Docker Image Build

- **Story:** STORY-008
- **YAML:** `cicd/tests/testcases/integration/TC-INTEGRATION-001.yml`
- **Summary:** Build Docker image, verify tagging, non-root user execution, and clean up test image.
- **Preconditions:**
  - Docker daemon running
  - TC-BUILD-001 passed
- **Steps:**
  1. Action: Build Docker image (`docker build -t testlink-mcp:test .`)  
     Expected: No "ERROR" or "failed to" in output
  2. Action: Inspect image ID (`docker image inspect testlink-mcp:test`)  
     Expected: sha256: prefix present
  3. Action: Verify non-root user (`docker inspect --format '{{.Config.User}}'`)  
     Expected: "nodejs"
  4. Action: Clean up test image (`docker rmi testlink-mcp:test`)  
     Expected: Image removed
- **Importance:** High
- **Execution type:** Automated

---

### E2E Tests Suite

#### TC-E2E-001: MCP Server Startup Validation

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/e2e/TC-E2E-001.yml`
- **Summary:** Verify server exits non-zero without API key and that the ES module loads correctly.
- **Preconditions:**
  - TC-BUILD-001 passed (build completed)
  - No TESTLINK_API_KEY set
- **Steps:**
  1. Action: Run server without API key (`timeout 5 node dist/index.js`)  
     Expected: Non-zero exit code, "EXIT_OK: server requires API key"
  2. Action: Validate ES module import  
     Expected: "MODULE_OK"
- **Importance:** High
- **Execution type:** Automated

---

### Tool Tests Suite

#### TC-TOOL-000: TestLink API Connection Smoke Test

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-000.yml`
- **Summary:** Verify environment variables are set and TestLink XML-RPC endpoint is reachable.
- **Preconditions:**
  - TESTLINK_URL and TESTLINK_API_KEY env vars set
  - TestLink instance running
- **Steps:**
  1. Action: Check TESTLINK_URL env var is set  
     Expected: "TESTLINK_URL=" present
  2. Action: curl TestLink XML-RPC endpoint  
     Expected: HTTP 200
- **Importance:** High
- **Execution type:** Automated

#### TC-TOOL-001: MCP Tool — create_test_case

- **Story:** STORY-002
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-001.yml`
- **Summary:** Create a test case via MCP tool and verify it can be read back.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists, Suite 163 (CRUD Tests) exists
- **Steps:**
  1. Action: Call create_test_case for project 162, suite 163, name "CI-Created-Case"  
     Expected: Returns new test case ID
  2. Action: Read back created case via read_test_case  
     Expected: Contains "CI-Created-Case"
- **Importance:** High
- **Execution type:** Automated
- **Debris:** Creates test case, no cleanup (blocked by testlink-code#1)

#### TC-TOOL-002: MCP Tool — read_test_case

- **Story:** STORY-002
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-002.yml`
- **Summary:** Read test case by numeric ID and external ID format, verify both return correct data.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Test case tm-1 (ID 166) exists in CRUD Tests suite
- **Steps:**
  1. Action: Call read_test_case with numeric ID "166"  
     Expected: Contains "Read Test Case", READ_NUMERIC_OK
  2. Action: Call read_test_case with external ID "tm-1"  
     Expected: Contains "Read Test Case", READ_EXTERNAL_OK
- **Importance:** High
- **Execution type:** Automated

#### TC-TOOL-003: MCP Tool — update_test_case

- **Story:** STORY-002
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-003.yml`
- **Summary:** Update test case tm-2, verify changes, then restore original values.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Test case tm-2 (ID 168) exists
- **Steps:**
  1. Action: Update tm-2 with new name/summary/importance  
     Expected: UPDATE_OK
  2. Action: Read back and verify "Updated by TC-TOOL-003"  
     Expected: VERIFY_SUMMARY_OK
  3. Action: Restore original values  
     Expected: RESTORE_OK
- **Importance:** High
- **Execution type:** Automated

#### TC-TOOL-005: MCP Tool — list_test_suites

- **Story:** STORY-003
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-005.yml`
- **Summary:** List test suites for project 162 and verify known suites exist.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Suites 163 (CRUD Tests) and 164 (Plan Tests) exist
- **Steps:**
  1. Action: Call list_test_suites for project 162  
     Expected: FOUND_CRUD_SUITE, FOUND_PLAN_SUITE
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-006: MCP Tool — create_test_suite

- **Story:** STORY-003
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-006.yml`
- **Summary:** Create top-level and nested suites, verify both appear in listing.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists
- **Steps:**
  1. Action: Create top-level suite with timestamp name  
     Expected: Returns suite ID
  2. Action: Create nested child suite with parent_id  
     Expected: Returns suite ID
  3. Action: Verify both appear in list_test_suites  
     Expected: Both suite names found
- **Importance:** Medium
- **Execution type:** Automated
- **Debris:** Creates 2 suites, no cleanup (blocked by testlink-code#1)

#### TC-TOOL-007: MCP Tool — list_test_cases_in_suite

- **Story:** STORY-003
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-007.yml`
- **Summary:** List test cases in populated suite (163) and empty suite (164).
- **Preconditions:**
  - TC-TOOL-000 passed
  - Suite 163 has tm-1, tm-2; Suite 164 is queryable
- **Steps:**
  1. Action: Call list_test_cases_in_suite for suite 163  
     Expected: "Read Test Case", "Update Test Case"
  2. Action: Call list_test_cases_in_suite for suite 164  
     Expected: Valid response (may be empty)
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-008: MCP Tool — update_test_suite

- **Story:** STORY-003
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-008.yml`
- **Summary:** Update suite 164 name, verify change, then restore original.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Suite 164 (Plan Tests) exists
- **Steps:**
  1. Action: Update suite 164 name to "Plan Tests - Modified"  
     Expected: UPDATE_OK
  2. Action: Verify new name in list_test_suites  
     Expected: VERIFY_NAME_OK
  3. Action: Restore original name "Plan Tests"  
     Expected: RESTORE_OK
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-009: MCP Tool — list_test_plans

- **Story:** STORY-004
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-009.yml`
- **Summary:** List test plans for project 162, verify CI Test Plan exists.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Plan 172 (CI Test Plan) exists
- **Steps:**
  1. Action: Call list_test_plans for project 162  
     Expected: FOUND_CI_PLAN, PLAN_COUNT=
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-010: MCP Tool — create_test_plan

- **Story:** STORY-004
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-010.yml`
- **Summary:** Create temporary test plan, verify in listing, then delete.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists
- **Steps:**
  1. Action: Create plan with timestamp name for project "testlink-mcp"  
     Expected: Returns plan ID
  2. Action: Verify plan appears in list_test_plans  
     Expected: Plan name found
  3. Action: Delete created plan via delete_test_plan  
     Expected: Plan removed
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-011: MCP Tool — add_test_case_to_test_plan

- **Story:** STORY-004
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-011.yml`
- **Summary:** Create temp plan, add test case tm-1, verify assignment, then delete plan.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Test case tm-1 (ID 166) and project 162 exist
- **Steps:**
  1. Action: Create temporary test plan  
     Expected: Returns plan ID
  2. Action: Add tm-1 to plan via add_test_case_to_test_plan  
     Expected: Assignment confirmed
  3. Action: Verify via get_test_cases_for_test_plan  
     Expected: tm-1 found in plan
  4. Action: Delete temporary plan  
     Expected: Plan removed
- **Importance:** High
- **Execution type:** Automated

#### TC-TOOL-012: MCP Tool — get_test_cases_for_test_plan

- **Story:** STORY-004
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-012.yml`
- **Summary:** Get test cases for CI Test Plan (172), verify tm-3 and response structure.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Plan 172 has tm-3 (ID 170) assigned
- **Steps:**
  1. Action: Call get_test_cases_for_test_plan for plan 172  
     Expected: "Plan Workflow Case", "tm-3"
  2. Action: Verify response fields  
     Expected: tcase_name, tcase_id, version, exec_status, full_external_id present
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-013: MCP Tool — list_builds + create_build

- **Story:** STORY-005
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-013.yml`
- **Summary:** List existing builds for plan 172, create new build, verify it appears.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Plan 172 exists with "CI Build 1"
- **Steps:**
  1. Action: Call list_builds for plan 172  
     Expected: "CI Build 1" found
  2. Action: Create build with timestamp name  
     Expected: Returns build ID
  3. Action: Verify build appears in list_builds  
     Expected: New build name found
- **Importance:** Medium
- **Execution type:** Automated
- **Debris:** Creates build, no cleanup

#### TC-TOOL-014: MCP Tool — create_test_execution + read_test_execution

- **Story:** STORY-006
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-014.yml`
- **Summary:** Create build, record pass execution for tm-3, verify status via plan query.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Plan 172, test case 170 (tm-3) exist
- **Steps:**
  1. Action: Create build for plan 172  
     Expected: Returns build ID
  2. Action: Record pass (p) execution for case 170  
     Expected: EXECUTION_OK
  3. Action: Verify via get_test_cases_for_test_plan  
     Expected: EXEC_STATUS_PASS
- **Importance:** High
- **Execution type:** Automated
- **Debris:** Creates build + execution record, no cleanup

#### TC-TOOL-015: MCP Tool — close_build + delete_test_plan

- **Story:** STORY-005
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-015.yml`
- **Summary:** Create temp plan and build, close build, delete plan, verify cleanup.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists
- **Steps:**
  1. Action: Create temporary plan and build  
     Expected: Returns plan ID and build ID
  2. Action: Close build  
     Expected: Build closed
  3. Action: Delete plan  
     Expected: Plan removed
  4. Action: Verify plan not in listing  
     Expected: Plan name absent
- **Importance:** Medium
- **Execution type:** Automated

#### TC-TOOL-016: MCP Tool — list_projects

- **Story:** STORY-001
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-016.yml`
- **Summary:** List all projects, verify testlink-mcp project exists with correct fields.
- **Preconditions:**
  - TC-TOOL-000 passed
- **Steps:**
  1. Action: Call list_projects  
     Expected: "testlink-mcp" found, PROJECT_COUNT=
  2. Action: Verify response fields  
     Expected: id, name, prefix, active, is_public present
- **Importance:** Low
- **Execution type:** Automated

#### TC-TOOL-017: MCP Tool — list_requirements

- **Story:** STORY-007
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-017.yml`
- **Summary:** List requirements for project 162, verify valid response.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists
- **Steps:**
  1. Action: Call list_requirements for project 162  
     Expected: Valid response, no error
- **Importance:** Low
- **Execution type:** Automated

#### TC-TOOL-018: MCP Tool — get_requirement

- **Story:** STORY-007
- **YAML:** `cicd/tests/testcases/tool/TC-TOOL-018.yml`
- **Summary:** Query non-existent requirement ID 99999, verify proper error response.
- **Preconditions:**
  - TC-TOOL-000 passed
  - Project 162 exists
- **Steps:**
  1. Action: Call get_requirement for ID 99999  
     Expected: isError=true, message contains "does not exist"
- **Importance:** Low
- **Execution type:** Automated

---

## Coverage Summary

| Metric | Count |
|--------|-------|
| Total MCP tools | 22 |
| Tools with FULL coverage | 13 |
| Tools with BASIC coverage | 6 |
| Tools with NO coverage | 3 (delete_test_case, read_test_execution, delete_build) |
| Total test scripts | 23 |
| E2E tests (live TestLink) | 18 |
| Build gate tests | 5 |
| Tests that leave debris | 4 (TC-TOOL-001, 006, 013, 014) |
| Tests that clean up | 5 (TC-TOOL-003, 008, 010, 011, 015) |
| Missing test IDs | TC-TOOL-004 (gap in numbering) |

## Sync Instructions

When dogkeeper886/testlink-code#1 is resolved:

1. Delete CI debris (6 suites, 6 test cases) — see dogkeeper886/testlink-mcp#40
2. Create 4 new suites: Build Tests, Integration Tests, E2E Tests, Tool Tests
3. Create 23 test cases using the content above
4. Add `testlink_id` field to each YAML test file
5. Update story docs with TestLink IDs
6. Keep existing seed data (tm-1, tm-2, tm-3) unchanged
