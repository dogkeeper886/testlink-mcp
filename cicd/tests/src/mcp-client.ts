#!/usr/bin/env npx tsx
/**
 * Lightweight MCP client CLI for integration testing.
 * Spawns the MCP server, calls a tool, prints the result as JSON.
 *
 * Usage: npx tsx cicd/tests/src/mcp-client.ts <tool_name> '<json_args>'
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const [toolName, argsJson] = process.argv.slice(2);
if (!toolName) {
  console.error('Usage: mcp-client.ts <tool_name> [json_args]');
  process.exit(1);
}

const args = argsJson ? JSON.parse(argsJson) : {};

const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/index.js'],
  env: { ...process.env } as Record<string, string>,
});

const client = new Client({ name: 'test-client', version: '1.0.0' });
await client.connect(transport);

const result = await client.callTool({ name: toolName, arguments: args });
console.log(JSON.stringify(result, null, 2));

await client.close();
