# Claude Code Documentation

## TestLink MCP Server Connection Issue

### Problem
The TestLink MCP server was failing to connect when tested with `claude mcp list`, showing:
```
testlink: docker run --rm -i --name testlink-mcp -e TESTLINK_URL=http://qa-tms.commscope.com/testlink -e TESTLINK_API_KEY=565c591e63466d98a05ff6eae7f07d1d dogkeeper886/testlink-mcp:latest - ✗ Failed to connect
```

### Root Cause
The issue was located in `src/index.ts:585` where a `console.error()` message was contaminating the stdout stream:

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TestLink MCP Server started successfully'); // ← This was the problem
}
```

**Why this caused issues:**
- MCP (Model Context Protocol) clients expect clean JSON-RPC communication on stdout
- The `console.error()` message was mixing stderr output with the JSON-RPC protocol stream
- This interfered with the client's ability to parse MCP responses correctly

### Solution
Removed the interfering console.error message from the main() function:

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Removed: console.error('TestLink MCP Server started successfully');
}
```

### Verification
After the fix:
- Clean JSON-RPC responses: `{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"testlink-mcp-server","version":"1.0.0"}},"jsonrpc":"2.0","id":1}`
- No stderr contamination
- MCP clients can properly connect and communicate

### Key Takeaway
**Never use console.log() or console.error() in MCP servers** that communicate via stdio, as they will contaminate the JSON-RPC protocol stream and cause connection failures.