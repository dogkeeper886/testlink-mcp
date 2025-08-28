#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { TestLink, Constants } from 'testlink-xmlrpc';

dotenv.config();

const TESTLINK_URL = process.env.TESTLINK_URL || 'http://localhost/testlink';
const TESTLINK_API_KEY = process.env.TESTLINK_API_KEY || '';

if (!TESTLINK_API_KEY) {
  process.exit(1);
}

// Input validation helpers
function parseTestCaseId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Test case ID must be a non-empty string');
  }
  
  // Handle external ID format (ACX-50140) - extract numeric part
  const externalIdMatch = id.match(/^[A-Z]+-(\d+)$/);
  if (externalIdMatch) {
    return externalIdMatch[1];
  }
  
  // Handle pure numeric ID
  if (/^\d+$/.test(id)) {
    return id;
  }
  
  throw new Error('Test case ID must be either numeric (50140) or external format (ACX-50140)');
}

function validateTestCaseId(id: string): void {
  parseTestCaseId(id); // This will throw if invalid
}

function validateProjectId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new Error('Project ID must be a non-empty string');
  }
  if (!/^\d+$/.test(id)) {
    throw new Error('Project ID must contain only digits');
  }
}

function validateSuiteId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new Error('Suite ID must be a non-empty string');
  }
  if (!/^\d+$/.test(id)) {
    throw new Error('Suite ID must contain only digits');
  }
}

function validateNonEmptyString(value: string, fieldName: string): void {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

class TestLinkAPI {
  private client: TestLink;

  constructor(url: string, apiKey: string) {
    const parsedUrl = new URL(url);
    this.client = new TestLink({
      host: parsedUrl.hostname,
      rpcPath: parsedUrl.pathname + '/lib/api/xmlrpc/v1/xmlrpc.php',
      apiKey: apiKey
    });
  }

  private async handleAPICall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      const result = await apiCall();
      
      // Handle error responses from TestLink
      if (Array.isArray(result) && result[0]?.code) {
        const errorCode = result[0].code;
        const errorMessage = result[0].message || 'Unknown error';
        
        // Provide more helpful error messages based on common error codes
        if (errorCode === 2000) {
          throw new Error(`TestLink Authentication Failed: Invalid API key`);
        } else if (errorCode === 3000) {
          throw new Error(`TestLink Permission Denied: ${errorMessage}`);
        } else if (errorCode === 7000) {
          throw new Error(`TestLink Object Not Found: ${errorMessage}`);
        } else {
          throw new Error(`TestLink API Error (${errorCode}): ${errorMessage}`);
        }
      }
      
      return result;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to TestLink. Please check TESTLINK_URL.`);
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error(`TestLink API request timed out`);
      }
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  async getTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    
    // If it looks like an external ID (ACX-50140), use testcaseexternalid
    if (/^[A-Z]+-\d+$/.test(testCaseId)) {
      return this.handleAPICall(() => this.client.getTestCase({ 
        testcaseexternalid: testCaseId
      }));
    }
    
    // Otherwise use the numeric ID
    const numericId = parseTestCaseId(testCaseId);
    return this.handleAPICall(() => this.client.getTestCase({ 
      testcaseid: numericId
    }));
  }

  async updateTestCase(testCaseId: string, data: any) {
    validateTestCaseId(testCaseId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }
    
    const updateParams: any = {
      testcaseexternalid: testCaseId
    };

    if (data.name) updateParams.testcasename = data.name;
    if (data.summary) updateParams.summary = data.summary;
    if (data.preconditions) updateParams.preconditions = data.preconditions;
    if (data.steps) updateParams.steps = data.steps;
    if (data.importance !== undefined) updateParams.importance = data.importance;
    if (data.execution_type !== undefined) updateParams.executiontype = data.execution_type;
    if (data.status !== undefined) updateParams.status = data.status;

    return this.handleAPICall(() => this.client.updateTestCase(updateParams));
  }

  async createTestCase(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Test case data must be an object');
    }
    if (!data.testprojectid || !data.testsuiteid || !data.name || !data.authorlogin) {
      throw new Error('Missing required fields: testprojectid, testsuiteid, name, authorlogin');
    }
    validateProjectId(data.testprojectid);
    validateSuiteId(data.testsuiteid);
    validateNonEmptyString(data.name, 'Test case name');
    validateNonEmptyString(data.authorlogin, 'Author login');

    const createParams = {
      testprojectid: parseInt(data.testprojectid),
      testsuiteid: parseInt(data.testsuiteid),
      testcasename: data.name,
      authorlogin: data.authorlogin,
      summary: data.summary || '',
      steps: data.steps || [],
      importance: data.importance || 2,
      executiontype: data.execution_type || 1,
      status: data.status || 1
    };

    return this.handleAPICall(() => this.client.createTestCase(createParams));
  }

  async deleteTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    // TestLink XML-RPC library doesn't have a direct delete method
    // We'll implement this by marking as obsolete
    return this.updateTestCase(testCaseId, { status: 7 }); // Status 7 = obsolete
  }

  async getTestProjects() {
    return this.handleAPICall(() => this.client.getProjects());
  }

  async getTestSuites(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.getFirstLevelTestSuitesForTestProject({
      testprojectid: projectId
    }));
  }

  async getTestSuiteByID(suiteId: string) {
    validateSuiteId(suiteId);
    return this.handleAPICall(() => this.client.getTestSuiteByID({
      testsuiteid: parseInt(suiteId)
    }));
  }

  async getTestCasesForTestSuite(suiteId: string) {
    validateSuiteId(suiteId);
    return this.handleAPICall(() => this.client.getTestCasesForTestSuite({
      testsuiteid: parseInt(suiteId),
      deep: true,
      details: Constants.Details.FULL
    }));
  }

  async searchTestCases(projectId: string, searchText: string) {
    validateProjectId(projectId);
    validateNonEmptyString(searchText, 'Search text');
    return this.handleAPICall(() => this.client.getTestCaseIDByName({
      testcasename: searchText
    }));
  }

  async bulkUpdateTestCases(testCaseIds: string[], data: any) {
    if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
      throw new Error('Test case IDs must be a non-empty array');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }
    
    const results = [];
    for (const id of testCaseIds) {
      try {
        const result = await this.updateTestCase(id, data);
        results.push({ id, success: true, result });
      } catch (error: any) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }

  async createTestSuite(projectId: string, suiteName: string, details: string = '', parentId?: string) {
    validateProjectId(projectId);
    validateNonEmptyString(suiteName, 'Suite name');
    if (parentId) {
      validateSuiteId(parentId);
    }
    
    const params: any = {
      testprojectid: projectId,
      testsuitename: suiteName,
      details: details
    };
    
    if (parentId) {
      params.parentid = parseInt(parentId);
    }
    
    return this.handleAPICall(() => this.client.createTestSuite(params));
  }

  async archiveTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    // Get current test case to prepend [ARCHIVED] to summary
    const testCase = await this.getTestCase(testCaseId);
    const currentSummary = Array.isArray(testCase) && testCase[0] ? testCase[0].summary : '';
    
    return this.updateTestCase(testCaseId, { 
      status: 7, // Status 7 is typically used for obsolete/archived
      summary: '[ARCHIVED] ' + currentSummary
    });
  }
}

const server = new Server(
  {
    name: 'testlink-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const testlinkAPI = new TestLinkAPI(TESTLINK_URL, TESTLINK_API_KEY);

const tools: Tool[] = [
  {
    name: 'read_test_case',
    description: 'Read a test case from TestLink by ID',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_id: {
          type: 'string',
          description: 'The TestLink test case ID (numeric like "50140" or external format like "ACX-50140")'
        }
      },
      required: ['test_case_id']
    }
  },
  {
    name: 'update_test_case',
    description: 'Update a test case in TestLink',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_id: {
          type: 'string',
          description: 'The TestLink test case ID'
        },
        data: {
          type: 'object',
          description: 'Test case data to update',
          properties: {
            name: { type: 'string' },
            summary: { type: 'string' },
            preconditions: { type: 'string' },
            steps: { type: 'array' },
            importance: { type: 'number' },
            execution_type: { type: 'number' },
            status: { type: 'number' }
          }
        }
      },
      required: ['test_case_id', 'data']
    }
  },
  {
    name: 'create_test_case',
    description: 'Create a new test case in TestLink',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Test case data',
          properties: {
            testprojectid: { type: 'string', description: 'Test project ID' },
            testsuiteid: { type: 'string', description: 'Test suite ID' },
            name: { type: 'string', description: 'Test case name' },
            authorlogin: { type: 'string', description: 'Author login' },
            summary: { type: 'string' },
            preconditions: { type: 'string' },
            steps: { type: 'array' },
            importance: { type: 'number' },
            execution_type: { type: 'number' },
            status: { type: 'number' }
          },
          required: ['testprojectid', 'testsuiteid', 'name', 'authorlogin']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'delete_test_case',
    description: 'Delete a test case from TestLink',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_id: {
          type: 'string',
          description: 'The TestLink test case ID to delete'
        }
      },
      required: ['test_case_id']
    }
  },
  {
    name: 'list_projects',
    description: 'List all test projects in TestLink',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'list_test_suites',
    description: 'List test suites for a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The test project ID'
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'list_test_cases_in_suite',
    description: 'List all test cases in a test suite',
    inputSchema: {
      type: 'object',
      properties: {
        suite_id: {
          type: 'string',
          description: 'The test suite ID'
        }
      },
      required: ['suite_id']
    }
  },
  {
    name: 'search_test_cases',
    description: 'Search for test cases by exact name match in a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The test project ID'
        },
        search_text: {
          type: 'string',
          description: 'Exact test case name to search for (case-sensitive, exact match only)'
        }
      },
      required: ['project_id', 'search_text']
    }
  },
  {
    name: 'bulk_update_test_cases',
    description: 'Update multiple test cases at once with the same data',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of test case IDs to update'
        },
        data: {
          type: 'object',
          description: 'Test case data to apply to all selected cases',
          properties: {
            name: { type: 'string' },
            summary: { type: 'string' },
            preconditions: { type: 'string' },
            steps: { type: 'array' },
            importance: { type: 'number' },
            execution_type: { type: 'number' },
            status: { type: 'number' }
          }
        }
      },
      required: ['test_case_ids', 'data']
    }
  },
  {
    name: 'create_test_suite',
    description: 'Create a new test suite in a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The test project ID'
        },
        suite_name: {
          type: 'string',
          description: 'Name of the new test suite'
        },
        details: {
          type: 'string',
          description: 'Description or details for the test suite'
        },
        parent_id: {
          type: 'string',
          description: 'Parent test suite ID (optional, for nested suites)'
        }
      },
      required: ['project_id', 'suite_name']
    }
  },
  {
    name: 'archive_test_case',
    description: 'Archive a test case (marks as obsolete and adds [ARCHIVED] prefix)',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_id: {
          type: 'string',
          description: 'The test case ID to archive'
        }
      },
      required: ['test_case_id']
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!args) {
    throw new Error('Missing arguments in request');
  }

  try {
    switch (name) {
      case 'read_test_case': {
        const result = await testlinkAPI.getTestCase(args.test_case_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_test_case': {
        const result = await testlinkAPI.updateTestCase(args.test_case_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_test_case': {
        const result = await testlinkAPI.createTestCase(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_test_case': {
        const result = await testlinkAPI.deleteTestCase(args.test_case_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_projects': {
        const result = await testlinkAPI.getTestProjects();
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_test_suites': {
        const result = await testlinkAPI.getTestSuites(args.project_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_test_cases_in_suite': {
        const result = await testlinkAPI.getTestCasesForTestSuite(args.suite_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'search_test_cases': {
        const result = await testlinkAPI.searchTestCases(args.project_id as string, args.search_text as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'bulk_update_test_cases': {
        const result = await testlinkAPI.bulkUpdateTestCases(args.test_case_ids as string[], args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_test_suite': {
        const result = await testlinkAPI.createTestSuite(
          args.project_id as string, 
          args.suite_name as string, 
          (args.details as string) || '', 
          args.parent_id as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'archive_test_case': {
        const result = await testlinkAPI.archiveTestCase(args.test_case_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { 
      content: [{ 
        type: 'text', 
        text: `Error: ${error.message}` 
      }],
      isError: true 
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(() => {
  process.exit(1);
});