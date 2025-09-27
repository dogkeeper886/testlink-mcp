# TestLink MCP Server

[![Docker Pulls](https://img.shields.io/docker/pulls/dogkeeper886/testlink-mcp)](https://hub.docker.com/r/dogkeeper886/testlink-mcp)
[![Docker Image Size](https://img.shields.io/docker/image-size/dogkeeper886/testlink-mcp)](https://hub.docker.com/r/dogkeeper886/testlink-mcp)

A Model Context Protocol (MCP) server for TestLink test case management, designed to work with Claude Code and Cursor IDE for AI-powered test case enhancement.

## 🚀 Quick Start

### For Claude Code
```bash
claude mcp add testlink -- docker run --rm -i \
  -e TESTLINK_URL=http://your-testlink-server.com \
  -e TESTLINK_API_KEY=your_api_key_here \
  dogkeeper886/testlink-mcp:latest
```

### For Cursor IDE
Add to your Cursor MCP settings:
```json
{
  "mcpServers": {
    "testlink": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "TESTLINK_URL=http://your-testlink-server.com",
        "-e", "TESTLINK_API_KEY=your_api_key_here",
        "dogkeeper886/testlink-mcp:latest"
      ]
    }
  }
}
```

## 📋 Features

- **22 MCP Tools** for comprehensive TestLink management
- **Test Case Management**: Create, read, update, delete test cases
- **Test Suite Operations**: Manage test suites and organize test cases
- **Test Plan Management**: Create test plans, assign test cases, manage builds
- **Test Execution**: Record and track test execution results
- **Requirement Management**: Read requirements and link to test cases
- **16 Agent-Friendly Commands**: Comprehensive guidance for AI agents
- **Docker Optimized**: Multi-stage build for minimal image size
- **XML-RPC Native**: Direct TestLink API communication

## 🛠️ Available Tools

### Test Case Management (4 tools)
- `read_test_case` - Fetch complete test case data
- `create_test_case` - Create new test case with validation
- `update_test_case` - Update test case fields with full validation
- `delete_test_case` - Remove test case permanently

### Test Suite Management (4 tools)
- `list_test_suites` - Get test suites for a project
- `list_test_cases_in_suite` - Get all test cases in a suite
- `create_test_suite` - Create a new test suite in a project
- `update_test_suite` - Update test suite properties

### Test Plan Management (5 tools)
- `list_test_plans` - List all test plans for a project
- `create_test_plan` - Create a new test plan
- `delete_test_plan` - Delete a test plan
- `get_test_cases_for_test_plan` - List all test cases in a test plan
- `add_test_case_to_test_plan` - Add a test case to a test plan

### Build Management (3 tools)
- `list_builds` - List all builds for a test plan
- `create_build` - Create a new build
- `close_build` - Close a build (prevents new test executions)

### Test Execution Management (2 tools)
- `read_test_execution` - Get test execution details
- `create_test_execution` - Record test execution result

### Requirement Management (2 tools)
- `list_requirements` - Get all requirements for a project
- `get_requirement` - Get detailed information about a specific requirement

### Project Management (1 tool)
- `list_projects` - Get all test projects

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TESTLINK_URL` | Your TestLink instance URL | `http://192.168.1.100:8090` |
| `TESTLINK_API_KEY` | Your TestLink API key | `your_api_key_here` |

## 📖 Usage Examples

```bash
# Read a test case
"Read test case PROJ-1 and improve the test steps"

# Create a new test case
"Create a new test case for login functionality"

# Manage test plans
"Create a test plan for the new release"
"Add test case PROJ-1 to test plan 10"

# Track executions
"Record test execution result for test case 1 in plan 10"

# Work with requirements
"List all requirements for project 1"
```

## 🏗️ Build Information

- **Base Image**: Node.js 20 Alpine
- **Architecture**: linux/amd64
- **Size**: ~50MB compressed
- **Multi-stage Build**: Optimized for minimal size
- **Security**: Non-root user, minimal attack surface

## 📦 Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `v1.2` | Version 1.2 release |
| `v1.1` | Version 1.1 release |

## 🔍 Prerequisites

- TestLink instance with XML-RPC API enabled
- TestLink API key (generate from user profile)
- Docker or compatible container runtime
- Claude Code or Cursor IDE

## 🚨 Troubleshooting

### Connection Issues
- Verify TestLink URL is accessible from container
- Check API key is valid and has permissions
- Ensure TestLink XML-RPC API is enabled

### Common Errors
- `Invalid API key`: Check your TestLink API key
- `Connection refused`: Verify TestLink URL and port
- `Missing arguments`: Check required parameters

## 📚 Documentation

- **Full Documentation**: [GitHub Repository](https://github.com/your-username/testlink-mcp)
- **Command Files**: 16 agent-friendly command files included
- **API Reference**: Complete TestLink XML-RPC integration
- **Examples**: Comprehensive usage examples and tutorials

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/testlink-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/testlink-mcp/discussions)
- **Documentation**: [Full README](https://github.com/your-username/testlink-mcp/blob/main/README.md)

## 📄 License

MIT License - see [LICENSE](https://github.com/your-username/testlink-mcp/blob/main/LICENSE) file for details.

## 🏷️ Tags

`testlink` `mcp` `test-management` `claude` `cursor` `ai` `testing` `automation` `xmlrpc` `docker`

---

**Ready to enhance your TestLink workflow with AI? Pull the image and start testing!** 🚀
