# TestLink MCP Server

A Model Context Protocol (MCP) server for TestLink test case management, designed to work with Claude Code for AI-powered test case enhancement.

## Features

**Comprehensive TestLink Integration**
- **Test Case Management**: Create, read, update, delete test cases with full validation
- **Test Suite Operations**: Manage test suites and organize test cases
- **Test Plan Management**: Create test plans, assign test cases, manage builds
- **Test Execution**: Record and track test execution results
- **Requirement Management**: Read requirements and link to test cases
- **Project Management**: List and manage test projects
- **Agent-Friendly Commands**: 16 comprehensive command files for AI agents
- Advanced error handling and input validation
- Multi-stage Docker containerization for optimal performance
- Modern MCP SDK integration with STDIO transport
- Native XML-RPC client for reliable TestLink API communication

## Usage Examples with Claude Code

Once installed, you can use natural language with Claude Code:

```
"Read test case PROJ-1 and improve the test steps"
"Create a new test case for login functionality"
"Update test case PROJ-2 with more detailed expected results"
"List all test cases in suite 12"
"Create a new test suite called 'Authentication Tests' in project 1"
"Create a test plan for the new release"
"Add test case PROJ-1 to test plan 10"
"Create a build for test plan 10"
"Record test execution result for test case 1 in plan 10"
"List all requirements for project 1"
```

## Quick Start

### Option 1: Using Docker (Recommended)

#### For Claude Code
```bash
claude mcp add testlink -- docker run --rm -i \
  -e TESTLINK_URL=http://192.168.x.x/testlink \
  -e TESTLINK_API_KEY=your_api_key_here \
  dogkeeper886/testlink-mcp:latest
```

#### For Cursor IDE
Add the following configuration to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "testlink": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "TESTLINK_URL=http://your-testlink-server.com/testlink",
        "-e",
        "TESTLINK_API_KEY=your_api_key_here",
        "dogkeeper886/testlink-mcp:latest"
      ]
    }
  }
}
```

*Replace `http://your-testlink-server.com/testlink` with your TestLink URL and `your_api_key_here` with your API key*

### Option 2: Using Node (Run from Source)

1. Clone and build:
```bash
git clone <repository-url>
cd testlink-mcp-server
npm install
npm run build
```

2. Add to Claude Code:
```bash
claude mcp add testlink \
  --env TESTLINK_URL=http://192.168.x.x/testlink \
  --env TESTLINK_API_KEY=your_api_key_here \
  -- node dist/index.js
```

### Option 3: Local Development

For development and testing:

1. Clone and install:
```bash
git clone <repository-url>
cd testlink-mcp-server
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your TestLink credentials
```

3. Run in development mode:
```bash
npm run dev
```

## Available MCP Tools

**Total: 22 MCP Tools** organized by functionality:

### Test Case Management (4 tools)
- **read_test_case**: Fetch complete test case data
  - Parameters: `test_case_id` (supports both numeric "50140" and external "PROJ-1" formats)
- **create_test_case**: Create new test case with validation
  - Parameters: `data` (requires: testprojectid, testsuiteid, name, authorlogin)
- **update_test_case**: Update test case fields with full validation
  - Parameters: `test_case_id`, `data` (object with fields to update)
- **delete_test_case**: Remove test case permanently
  - Parameters: `test_case_id`

### Test Suite Management (4 tools)
- **list_test_suites**: Get test suites for a project
  - Parameters: `project_id`
- **list_test_cases_in_suite**: Get all test cases in a suite
  - Parameters: `suite_id`
- **create_test_suite**: Create a new test suite in a project
  - Parameters: `project_id`, `suite_name`, `details` (optional), `parent_id` (optional)
- **update_test_suite**: Update test suite properties
  - Parameters: `suite_id`, `project_id`, `data`

### Test Plan Management (5 tools)
- **list_test_plans**: List all test plans for a project
  - Parameters: `project_id`
- **create_test_plan**: Create a new test plan
  - Parameters: `data` (requires: project_id, name)
- **delete_test_plan**: Delete a test plan
  - Parameters: `plan_id`
- **get_test_cases_for_test_plan**: List all test cases in a test plan
  - Parameters: `plan_id`
- **add_test_case_to_test_plan**: Add a test case to a test plan
  - Parameters: `data` (requires: testcaseid, testplanid, testprojectid)

### Build Management (3 tools)
- **list_builds**: List all builds for a test plan
  - Parameters: `plan_id`
- **create_build**: Create a new build
  - Parameters: `data` (requires: plan_id, name)
- **close_build**: Close a build (prevents new test executions)
  - Parameters: `build_id`

### Test Execution Management (2 tools)
- **read_test_execution**: Get test execution details
  - Parameters: `plan_id`, `build_id` (optional)
- **create_test_execution**: Record test execution result
  - Parameters: `data` (requires: test_case_id, plan_id, build_id, status)

### Requirement Management (2 tools)
- **list_requirements**: Get all requirements for a project
  - Parameters: `project_id`
- **get_requirement**: Get detailed information about a specific requirement
  - Parameters: `requirement_id`, `project_id`

### Project Management (1 tool)
- **list_projects**: Get all test projects
  - Parameters: none

## Agent-Friendly Command Files

This MCP server includes 16 comprehensive command files in `.cursor/commands/` designed to guide AI agents in using the TestLink tools effectively:

### Critical Priority Commands (4 files)
- **add-test-case-to-test-plan.md**: Complex test case assignment with validation
- **read-test-execution.md**: API limitation explanations and workarounds
- **list-test-cases-in-suite.md**: Output interpretation and guidance
- **get-test-cases-for-test-plan.md**: Execution status tracking and management

### High Priority Commands (4 files)
- **create-test-execution.md**: Test execution recording with error handling
- **create-test-plan.md**: Test plan creation with HTML formatting guidance
- **identify-test-type.md**: Test case type identification and prefixing
- **create-test-case.md**: Test case creation with comprehensive validation

### Standard Commands (8 files)
- **update-test-case.md**: Test case updates with HTML formatting
- **get-test-case.md**: Test case retrieval and interpretation
- **create_test_suite.md**: Test suite creation with HTML support
- **update_test_suite.md**: Test suite updates with validation
- **list_projects.md**: Project listing with user-friendly display
- **list_requirements.md**: Requirement listing and interpretation
- **list_test_suites.md**: Test suite listing with organization
- **testlink-format.md**: HTML formatting guidelines for TestLink content

Each command file provides:
- Step-by-step agent instructions
- Input validation and error handling
- Output interpretation guidance
- Best practices and troubleshooting
- Real-world examples and templates

## Setup & Configuration

### Prerequisites

- TestLink instance with XML-RPC API access enabled
- TestLink API key (generate from TestLink user profile)
- Docker (for containerized deployment) or Node.js 20+ (for local development)

### Environment Variables

- `TESTLINK_URL`: Your TestLink instance URL (e.g., `http://192.168.4.114/testlink`)
- `TESTLINK_API_KEY`: Your TestLink API key

### TestLink API Configuration

1. Enable XML-RPC API in TestLink configuration
2. Generate API key from your TestLink user profile:
   - Login to TestLink
   - Go to "My Settings" 
   - Click "Generate API Key"
3. Ensure your TestLink user has appropriate permissions

## Troubleshooting

### Connection Issues
- Verify TestLink URL is accessible from Docker container
- Check API key is valid and has permissions
- Ensure TestLink XML-RPC API is enabled in TestLink configuration
- Verify the URL format includes the full path (e.g., `http://server/testlink`, not just `http://server`)

### API Errors
- Check TestLink version compatibility (tested with TestLink 1.9.20+)
- Verify required fields for create/update operations
- Review TestLink server logs for detailed errors
- Ensure TestLink user has sufficient permissions for the requested operations

### Technical Notes
- This server uses the `testlink-xmlrpc` library for native XML-RPC communication
- TestLink's API requires XML-RPC protocol, not REST/JSON
- All API calls are properly validated and error-handled

---

## Development

### Building and Publishing

#### Build Docker Image
```bash
docker build -t dogkeeper886/testlink-mcp:latest .
```

#### Push to Docker Hub
```bash
docker push dogkeeper886/testlink-mcp:latest
```

### Project Structure
```
testlink-mcp-server/
├── src/
│   └── index.ts       # Main MCP server implementation with XML-RPC client
├── Dockerfile         # Docker configuration
├── package.json       # Node dependencies (includes testlink-xmlrpc)
├── tsconfig.json      # TypeScript configuration
└── .env.example       # Environment variables template
```

### Testing Locally
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server
npm start
```

## License

MIT

## Support

For issues or questions, please open an issue in the repository.