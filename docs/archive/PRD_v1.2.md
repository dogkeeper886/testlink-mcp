# TestLink MCP Server

A Model Context Protocol (MCP) server that provides AI-powered integration with TestLink test management systems.

## Comprehensive Tool Catalog

### 1. Projects & Configuration (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `list_projects` | Get all projects | P0 ✅ |
| `create_project` | Create new project | P1 |
| `update_project` | Modify project settings | P2 |
| `delete_project` | Remove project | P2 |

### 2. Test Suite Management (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `list_test_suites` | Get suites in project | P0 ✅ |
| `create_test_suite` | Create new suite | P0 ✅ |
| `update_test_suite` | Modify suite properties | P1 |
| `delete_test_suite` | Remove suite and contents | P1 |

### 3. Test Case Management (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `read_test_case` | Get test case by ID | P0 ✅ |
| `create_test_case` | Create new test case | P0 ✅ |
| `update_test_case` | Update single test case | P0 ✅ |
| `delete_test_case` | Remove test case | P0 ✅ |

### 4. Test Plans (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `list_test_plans` | Get all test plans | P1 |
| `create_test_plan` | Create new plan | P1 |
| `update_test_plan` | Modify plan details | P1 |
| `delete_test_plan` | Remove test plan | P2 |

### 5. Builds & Environments (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `list_builds` | Get builds for plan | P1 |
| `create_build` | Add new build/version | P1 |
| `update_build` | Modify build info | P2 |
| `delete_build` | Remove build | P2 |

### 6. Test Execution (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `create_test_execution` | Record test result | P1 |
| `read_test_execution` | Get execution details | P1 |
| `update_test_execution` | Modify execution details | P1 |
| `delete_test_execution` | Remove execution record | P1 |

### 7. Requirements & Traceability (4 tools)

| Tool Name | Purpose | Priority |
|-----------|---------|----------|
| `list_requirements` | Get all requirements | P1 |
| `create_requirement` | Add new requirement | P2 |
| `update_requirement` | Modify requirement | P2 |
| `delete_requirement` | Remove requirement | P2 |


## Implementation Status

### Phase 1: Foundation - Current ✅
- ✅ Basic test case operations (12 tools)
- ✅ Docker deployment
- ✅ Error handling
- ✅ MCP integration

### Phase 2: Additional CRUD Operations
- [ ] Test execution tools (4 tools)
- [ ] Test plan management (4 tools)
- [ ] Build management (4 tools)
- [ ] Requirements management (4 tools)

## Status

**Total Tools Planned**: 28 (7 categories × 4 CRUD tools each)
**Tools Implemented**: 12 (43%)