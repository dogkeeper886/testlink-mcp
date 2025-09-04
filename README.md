# TestLink MCP Server

A Model Context Protocol (MCP) server for TestLink test case management, designed to work with Claude Code for AI-powered test case enhancement.

## Features

**RUCD Operations (Read → Update → Create → Delete Priority)**
- **Read** test cases, projects, suites with comprehensive search
- **Update** test cases individually or in bulk with validation
- **Create** new test cases and test suites programmatically  
- **Delete** or archive test cases safely
- Advanced search and filtering capabilities
- Comprehensive error handling and input validation
- Multi-stage Docker containerization for optimal performance
- Modern MCP SDK integration with STDIO transport
- Native XML-RPC client for reliable TestLink API communication

## Usage Examples with Claude Code

Once installed, you can use natural language with Claude Code:

```
"Read test case 123 and improve the test steps"
"Create a new test case for login functionality"
"Update test case 456 with more detailed expected results"
"List all test cases in suite 789"
"Search for test cases containing 'login' in project 1"
"Update test cases 123, 456, 789 to set importance level to 3"
"Create a new test suite called 'Authentication Tests' in project 1"
"Archive test case 999 as it's no longer relevant"
```

## Quick Start

### Option 1: Using Docker (Recommended)

#### For Claude Code
```bash
claude mcp add testlink -- docker run --rm -i \
  --name testlink-mcp \
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
        "--name",
        "testlink-mcp",
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

### Test Case Operations (RUCD Priority Order)

#### Read Operations
- **read_test_case**: Fetch complete test case data
  - Parameters: `test_case_id` (supports both numeric "50140" and external "ZD-15540" formats)
- **list_projects**: Get all test projects
- **list_test_suites**: Get test suites for a project
  - Parameters: `project_id`
- **list_test_cases_in_suite**: Get all test cases in a suite
  - Parameters: `suite_id`
- **search_test_cases**: Search for test cases by exact name match in a project
  - Parameters: `project_id`, `search_text`

#### Update Operations
- **update_test_case**: Update test case fields with full validation
  - Parameters: `test_case_id`, `data` (object with fields to update)
- **bulk_update_test_cases**: Update multiple test cases at once with the same data
  - Parameters: `test_case_ids` (array), `data` (object with fields to update)

#### Create Operations
- **create_test_case**: Create new test case with validation
  - Parameters: `data` (requires: testprojectid, testsuiteid, name, authorlogin)
- **create_test_suite**: Create a new test suite in a project
  - Parameters: `project_id`, `suite_name`, `details` (optional), `parent_id` (optional)

#### Delete Operations
- **delete_test_case**: Remove test case permanently
  - Parameters: `test_case_id`
- **archive_test_case**: Archive a test case (marks as obsolete with [ARCHIVED] prefix)
  - Parameters: `test_case_id`

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