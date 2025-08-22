# TestLink MCP Server Release Notes

## Version 1.0.0 - Initial Stable Release

### Overview
TestLink MCP Server is a Model Context Protocol (MCP) integration that enables AI assistants (particularly Claude) to interact with TestLink test management systems. This first stable release provides comprehensive test case management functionality through a reliable XML-RPC connection.

### Features

#### Core Test Case Operations (RUCD)
The server implements all fundamental test management operations following the Read-Update-Create-Delete pattern:

**Read Operations:**
- `read_test_case` - Fetch complete test case data by ID
- `list_projects` - Get all test projects
- `list_test_suites` - Get test suites for a project
- `list_test_cases_in_suite` - Get all test cases in a suite
- `search_test_cases` - Search by exact test case name

**Update Operations:**
- `update_test_case` - Update individual test case fields
- `bulk_update_test_cases` - Update multiple test cases simultaneously

**Create Operations:**
- `create_test_case` - Create new test cases with validation
- `create_test_suite` - Create new test suites in projects

**Delete Operations:**
- `delete_test_case` - Mark test case as obsolete
- `archive_test_case` - Archive with [ARCHIVED] prefix

#### Technical Highlights

1. **External Test Case ID Support**
   - Supports both numeric IDs (e.g., "50140")
   - Supports external format IDs (e.g., "ACX-50140", "ZD-15540")
   - Automatically extracts and handles ID formats

2. **Native XML-RPC Communication**
   - Uses `testlink-xmlrpc` library for reliable API communication
   - Proper XML-RPC protocol implementation
   - Optimized for TestLink's API architecture

3. **Docker Containerization**
   - Multi-stage Docker build for optimized image size
   - Published to Docker Hub: `dogkeeper886/testlink-mcp:latest`
   - Runs as non-root user for enhanced security
   - Environment variable configuration

4. **Robust Error Handling**
   - Comprehensive input validation for all parameters
   - Detailed error messages for common TestLink errors
   - Connection error handling (ECONNREFUSED, ETIMEDOUT)
   - TestLink-specific error code interpretation

5. **MCP SDK Integration**
   - Full MCP protocol compliance
   - STDIO transport for Claude integration
   - Dynamic tool discovery
   - JSON-RPC 2.0 message format

### Installation & Usage

#### Quick Start with Docker (Recommended)

```bash
claude mcp add testlink -- docker run --rm -i \
  --name testlink-mcp \
  -e TESTLINK_URL=http://your-testlink-server/testlink \
  -e TESTLINK_API_KEY=your_api_key_here \
  dogkeeper886/testlink-mcp:latest
```

#### Natural Language Usage Examples

Once installed, use natural language with Claude:

```
"Read test case 123 and improve the test steps"
"Create a new test case for login functionality"
"Update test case ZD-15540 with more detailed expected results"
"List all test cases in suite 789"
"Search for test cases named 'User Login Test' in project 1"
"Update test cases 123, 456, 789 to set importance level to 3"
"Create a new test suite called 'Authentication Tests' in project 1"
"Archive test case 999 as it's no longer relevant"
```

### Technical Details

#### Technology Stack
- **Runtime**: Node.js 20 Alpine (Docker)
- **Language**: TypeScript 5.x
- **MCP SDK**: v1.0.0
- **XML-RPC Client**: testlink-xmlrpc v3.0.0
- **Container**: Multi-stage Docker build

#### Environment Variables
- `TESTLINK_URL` - TestLink instance URL (required)
- `TESTLINK_API_KEY` - TestLink API key (required)

#### Docker Image Details
- Base: `node:20-alpine`
- Size: Optimized through multi-stage build
- Security: Runs as non-root user (nodejs:1001)
- Registry: Docker Hub (`dogkeeper886/testlink-mcp`)

### Requirements

- TestLink 1.9.20+ with XML-RPC API enabled
- Valid TestLink API key with appropriate permissions
- Docker runtime (for containerized deployment)
- Claude Code or compatible MCP client

### Recent Updates

- `350f055` - docs: Add Cursor IDE configuration and reorganize documentation
- `b04a033` - docs: Update README with Docker Hub image
- `abbe669` - feat: Add support for external test case ID format
- `f8fba35` - fix: Replace JSON HTTP client with native XML-RPC client
- `c74a8ac` - feat: Initial TestLink MCP Server implementation

### What's New in This Release

- **Native XML-RPC Client**: Replaced JSON HTTP approach with native XML-RPC for better TestLink compatibility
- **External ID Support**: Added support for external test case ID formats (e.g., ZD-15540)
- **Docker Hub Publishing**: Official image now available at `dogkeeper886/testlink-mcp`
- **Enhanced Documentation**: Added Cursor IDE configuration and improved setup guides

### Support

For issues or questions, please open an issue in the repository.

---

**Release Date**: January 2025  
**Version**: 1.0.0  
**Status**: Stable  
**Docker Image**: `dogkeeper886/testlink-mcp:latest`