#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TESTLINK_URL = process.env.TESTLINK_URL || 'http://localhost/testlink';
const TESTLINK_API_KEY = process.env.TESTLINK_API_KEY || '';

if (!TESTLINK_API_KEY) {
  console.error('Error: TESTLINK_API_KEY environment variable is required');
  process.exit(1);
}

// Input validation helpers
function validateTestCaseId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new Error('Test case ID must be a non-empty string');
  }
  if (!/^\d+$/.test(id)) {
    throw new Error('Test case ID must contain only digits');
  }
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
  private apiUrl: string;
  private apiKey: string;

  constructor(url: string, apiKey: string) {
    this.apiUrl = `${url}/lib/api/xmlrpc/v1/xmlrpc.php`;
    this.apiKey = apiKey;
  }

  private async callAPI(method: string, params: any = {}) {
    const requestData = {
      method: method,
      params: [{ devKey: this.apiKey, ...params }]
    };

    try {
      const response = await axios.post(this.apiUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      });
      
      if (response.data[0]?.code) {
        const errorCode = response.data[0].code;
        const errorMessage = response.data[0].message || 'Unknown error';
        
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
      
      return response.data[0];
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to TestLink at ${this.apiUrl}. Please check TESTLINK_URL.`);
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error(`TestLink API request timed out after 30 seconds`);
      } else if (error.response?.status === 404) {
        throw new Error(`TestLink API endpoint not found. Please check TestLink configuration.`);
      } else if (error.response?.status >= 500) {
        throw new Error(`TestLink server error (${error.response.status}): ${error.message}`);
      }
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  async getTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    return this.callAPI('tl.getTestCase', { 
      testcaseid: testCaseId,
      version: null
    });
  }

  async updateTestCase(testCaseId: string, data: any) {
    validateTestCaseId(testCaseId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }
    
    const updateParams: any = {
      testcaseid: testCaseId
    };

    if (data.name) updateParams.testcasename = data.name;
    if (data.summary) updateParams.summary = data.summary;
    if (data.preconditions) updateParams.preconditions = data.preconditions;
    if (data.steps) updateParams.steps = data.steps;
    if (data.importance !== undefined) updateParams.importance = data.importance;
    if (data.execution_type !== undefined) updateParams.executiontype = data.execution_type;
    if (data.status !== undefined) updateParams.status = data.status;

    return this.callAPI('tl.updateTestCase', updateParams);
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
      testprojectid: data.testprojectid,
      testsuiteid: data.testsuiteid,
      testcasename: data.name,
      authorlogin: data.authorlogin,
      summary: data.summary || '',
      preconditions: data.preconditions || '',
      steps: data.steps || [],
      importance: data.importance || 2,
      executiontype: data.execution_type || 1,
      status: data.status || 1
    };

    return this.callAPI('tl.createTestCase', createParams);
  }

  async deleteTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    return this.callAPI('tl.deleteTestCase', { testcaseid: testCaseId });
  }

  async getTestProjects() {
    return this.callAPI('tl.getProjects');
  }

  async getTestSuites(projectId: string) {
    validateProjectId(projectId);
    return this.callAPI('tl.getFirstLevelTestSuitesForTestProject', {
      testprojectid: projectId
    });
  }

  async getTestSuiteByID(suiteId: string) {
    validateSuiteId(suiteId);
    return this.callAPI('tl.getTestSuiteByID', {
      testsuiteid: suiteId
    });
  }

  async getTestCasesForTestSuite(suiteId: string) {
    validateSuiteId(suiteId);
    return this.callAPI('tl.getTestCasesForTestSuite', {
      testsuiteid: suiteId,
      deep: true,
      details: 'full'
    });
  }

  async searchTestCases(projectId: string, searchText: string) {
    validateProjectId(projectId);
    validateNonEmptyString(searchText, 'Search text');
    return this.callAPI('tl.getTestCaseIDByName', {
      testcasename: searchText,
      testprojectname: projectId
    });
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
      params.parentid = parentId;
    }
    
    return this.callAPI('tl.createTestSuite', params);
  }

  async archiveTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    // TestLink doesn't have a built-in archive, so we'll update status to indicate archived
    return this.updateTestCase(testCaseId, { 
      status: 7, // Status 7 is typically used for obsolete/archived
      summary: '[ARCHIVED] ' + (await this.getTestCase(testCaseId))[0].summary
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
          description: 'The TestLink test case ID'
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
    description: 'Search for test cases by name in a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The test project ID'
        },
        search_text: {
          type: 'string',
          description: 'Text to search for in test case names'
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
  console.error('TestLink MCP Server started successfully');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});