# TestLink MCP Server Release Notes
## Version 1.2.0 - Enhanced Test Management & Agent Integration

### Overview

TestLink MCP Server v1.2.0 represents a major evolution from the initial v1.0.0 release, expanding from basic test case management to comprehensive TestLink integration with advanced AI agent support. This release introduces test plan management, build tracking, test execution recording, requirement management, and 16 agent-friendly command files.

### 🚀 Major New Features

#### **Test Plan Management (5 new tools)**
- `list_test_plans` - List all test plans for a project
- `create_test_plan` - Create new test plans with HTML formatting support
- `delete_test_plan` - Remove test plans
- `get_test_cases_for_test_plan` - List all test cases assigned to a test plan
- `add_test_case_to_test_plan` - Assign test cases to test plans with validation

#### **Build Management (3 new tools)**
- `list_builds` - List all builds for a test plan
- `create_build` - Create new builds for test execution
- `close_build` - Close builds to prevent new test executions

#### **Test Execution Management (2 new tools)**
- `read_test_execution` - Get test execution details and status
- `create_test_execution` - Record test execution results (pass/fail/blocked)

#### **Requirement Management (2 new tools)**
- `list_requirements` - Get all requirements for a project
- `get_requirement` - Get detailed requirement information

### 🤖 Agent-Friendly Command Files (16 files)

#### **Critical Priority Commands (4 files)**
- `add-test-case-to-test-plan.md` - Complex test case assignment with validation
- `read-test-execution.md` - API limitation explanations and workarounds
- `list-test-cases-in-suite.md` - Output interpretation and guidance
- `get-test-cases-for-test-plan.md` - Execution status tracking and management

#### **High Priority Commands (4 files)**
- `create-test-execution.md` - Test execution recording with error handling
- `create-test-plan.md` - Test plan creation with HTML formatting guidance
- `identify-test-type.md` - Test case type identification and prefixing
- `create-test-case.md` - Test case creation with comprehensive validation

#### **Standard Commands (8 files)**
- `update-test-case.md` - Test case updates with HTML formatting
- `get-test-case.md` - Test case retrieval and interpretation
- `create_test_suite.md` - Test suite creation with HTML support
- `update_test_suite.md` - Test suite updates with validation
- `list_projects.md` - Project listing with user-friendly display
- `list_requirements.md` - Requirement listing and interpretation
- `list_test_suites.md` - Test suite listing with organization
- `testlink-format.md` - HTML formatting guidelines for TestLink content

### 🔧 Enhanced Features

#### **Improved Test Case Management**
- Enhanced `update_test_case` with preconditions support
- Better error handling and validation
- Support for HTML formatting in test case content
- Improved external ID handling (PROJ-1 format)

#### **Advanced Test Suite Operations**
- HTML formatting support for test suite details
- Better validation and error messages
- Enhanced test case listing with metadata

#### **Test Plan HTML Formatting**
- Special handling for test plan notes (plain text via API)
- Manual HTML formatting instructions for web interface
- Clear guidance on API limitations vs web interface capabilities

### 🗑️ Removed Features (API Limitations)

#### **Deprecated Tools Removed**
- `search_test_cases` - Limited to exact name matches only
- `bulk_update_test_cases` - Not supported by TestLink API
- `archive_test_case` - Functionality deemed unnecessary
- `update_test_plan` - Not supported by TestLink API
- `update_build` - Not supported by TestLink API
- `update_test_execution` - Not supported by TestLink API
- `delete_test_execution` - Not supported by TestLink API

#### **Requirement Management Cleanup**
- Removed `create_requirement` - Not supported by TestLink API
- Removed `update_requirement` - Not supported by TestLink API
- Removed `delete_requirement` - Not supported by TestLink API
- Kept `list_requirements` and `get_requirement` for read-only access

### 📊 Tool Inventory Comparison

| Category | v1.0.0 | v1.2.0 | Change |
|----------|--------|--------|--------|
| **Test Case Management** | 4 tools | 4 tools | ✅ Enhanced |
| **Test Suite Management** | 2 tools | 4 tools | +2 tools |
| **Test Plan Management** | 0 tools | 5 tools | +5 tools |
| **Build Management** | 0 tools | 3 tools | +3 tools |
| **Test Execution** | 0 tools | 2 tools | +2 tools |
| **Requirement Management** | 0 tools | 2 tools | +2 tools |
| **Project Management** | 1 tool | 1 tool | ✅ Enhanced |
| **Command Files** | 0 files | 16 files | +16 files |
| **Total Tools** | 11 tools | 22 tools | +11 tools |

### 🛠️ Technical Improvements

#### **Enhanced Error Handling**
- Better validation for test case assignments
- Improved error messages for common issues
- API limitation explanations in command files
- Troubleshooting guidance for complex operations

#### **Improved Documentation**
- Comprehensive README.md with all 22 tools
- Docker Hub optimized DOCKERHUB.md
- Agent-friendly command files with step-by-step guidance
- Real-world examples and best practices

#### **Better API Integration**
- Fixed test case ID handling for executions
- Improved parameter mapping for complex operations
- Better handling of TestLink API limitations
- Enhanced validation for required fields

### 🐳 Docker & Deployment

#### **Updated Docker Image**
- **Image**: `dogkeeper886/testlink-mcp:v1.2`
- **Size**: Optimized multi-stage build
- **Security**: Non-root user execution
- **Tags**: `latest`, `v1.2`, `v1.1`

#### **Environment Variables**
- `TESTLINK_URL` - TestLink instance URL
- `TESTLINK_API_KEY` - TestLink API key

### 📖 Usage Examples

#### **New Test Plan Workflow**
```bash
# Create a test plan
"Create a test plan called 'Release 2.0 Testing' for project 1"

# Add test cases to the plan
"Add test case PROJ-1 to test plan 10 with high priority"

# Create builds
"Create a build called 'Build 2.0.1' for test plan 10"

# Record execution results
"Record test execution: test case 1 in plan 10, build 1, status passed"
```

#### **Enhanced Test Case Management**
```bash
# Read and improve test cases
"Read test case PROJ-1 and improve the test steps with better expected results"

# Update with HTML formatting
"Update test case PROJ-2 summary with HTML formatting for better readability"

# Manage test suites
"Create a test suite called 'API Tests' with HTML formatted description"
```

#### **Requirement Management**
```bash
# Work with requirements
"List all requirements for project 1"
"Get detailed information about requirement 5"
```

### 🔄 Migration from v1.0.0

#### **Breaking Changes**
- Removed deprecated tools (search, bulk update, archive)
- Updated external ID format from ACX-50140 to PROJ-1
- Enhanced parameter validation (may require parameter adjustments)

#### **New Capabilities**
- Test plan and build management
- Test execution tracking
- Requirement management
- Agent-friendly command files

#### **Upgrade Path**
1. Update Docker image to `dogkeeper886/testlink-mcp:v1.2`
2. Review removed tools and update workflows
3. Utilize new command files for better AI agent integration
4. Take advantage of new test plan and execution features

### 🐛 Bug Fixes

- Fixed test case preconditions not being saved during creation
- Resolved test case ID format issues in execution recording
- Fixed parameter mapping for test case assignments
- Improved error handling for missing required fields
- Fixed HTML entity encoding issues in test plan notes

### 📈 Performance Improvements

- Optimized Docker image size through multi-stage builds
- Improved error handling reduces failed API calls
- Better validation prevents unnecessary API requests
- Enhanced command files reduce agent confusion

### 🔮 What's Next

- Enhanced test case version control
- Advanced reporting and analytics
- Integration with additional test management tools
- Improved AI agent guidance and automation

### 📚 Documentation Updates

- **README.md**: Complete rewrite with all 22 tools
- **DOCKERHUB.md**: Docker Hub optimized documentation
- **Command Files**: 16 comprehensive agent guidance files
- **Release Notes**: Detailed comparison with v1.0.0

### 🏷️ Release Information

- **Release Date**: January 2025
- **Version**: 1.2.0
- **Status**: Stable
- **Docker Image**: `dogkeeper886/testlink-mcp:v1.2`
- **Compatibility**: TestLink 1.9.20+, Claude Code, Cursor IDE

### 🆘 Support

For issues or questions:
- **GitHub Issues**: [Repository Issues](https://github.com/your-username/testlink-mcp/issues)
- **Documentation**: [Full README](https://github.com/your-username/testlink-mcp/blob/main/README.md)
- **Docker Hub**: [Image Repository](https://hub.docker.com/r/dogkeeper886/testlink-mcp)

---

**Ready to enhance your TestLink workflow with comprehensive test management and AI agent integration? Upgrade to v1.2.0 today!** 🚀
