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

  async createProject(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Project data must be an object');
    }
    if (!data.name || !data.prefix) {
      throw new Error('Missing required fields: name, prefix');
    }
    validateNonEmptyString(data.name, 'Project name');
    validateNonEmptyString(data.prefix, 'Project prefix');

    const createParams = {
      testprojectname: data.name,
      testcaseprefix: data.prefix,
      notes: data.notes || '',
      opt: data.options || { requirementsEnabled: 1, testPriorityEnabled: 1, automationEnabled: 1, inventoryEnabled: 1 }
    };

    return this.handleAPICall(() => this.client.createTestProject(createParams));
  }

  async updateProject(projectId: string, data: any) {
    validateProjectId(projectId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    // TestLink doesn't have a direct update project method
    // We'll need to use custom fields or other approaches
    throw new Error('Project update not supported by TestLink API');
  }

  async deleteProject(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.deleteTestProject({
      prefix: projectId
    }));
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

  async updateTestSuite(suiteId: string, data: any) {
    validateSuiteId(suiteId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    const updateParams: any = {
      testsuiteid: parseInt(suiteId)
    };

    if (data.name) updateParams.testsuitename = data.name;
    if (data.details) updateParams.details = data.details;

    return this.handleAPICall(() => this.client.updateTestSuite(updateParams));
  }

  async deleteTestSuite(suiteId: string) {
    validateSuiteId(suiteId);
    // TestLink doesn't have a direct delete test suite method
    // We'll need to use a different approach or mark as obsolete
    throw new Error('Test suite deletion not supported by TestLink API');
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

  async getTestPlans(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.getProjectTestPlans({
      testprojectid: parseInt(projectId)
    }));
  }

  async createTestPlan(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Test plan data must be an object');
    }
    if (!data.project_id || !data.name) {
      throw new Error('Missing required fields: project_id, name');
    }
    validateProjectId(data.project_id);
    validateNonEmptyString(data.name, 'Test plan name');

    const createParams = {
      testprojectid: parseInt(data.project_id),
      testplanname: data.name,
      notes: data.notes || '',
      active: data.active !== undefined ? data.active : 1,
      is_public: data.is_public !== undefined ? data.is_public : 1
    };

    return this.handleAPICall(() => this.client.createTestPlan(createParams));
  }

  async updateTestPlan(planId: string, data: any) {
    validateSuiteId(planId); // Using suite validation for plan ID
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    // TestLink doesn't have a direct update test plan method
    throw new Error('Test plan update not supported by TestLink API');
  }

  async deleteTestPlan(planId: string) {
    validateSuiteId(planId); // Using suite validation for plan ID
    return this.handleAPICall(() => this.client.deleteTestPlan({
      testplanid: parseInt(planId)
    }));
  }

  async getBuilds(planId: string) {
    validateSuiteId(planId); // Using suite validation for plan ID
    return this.handleAPICall(() => this.client.getBuildsForTestPlan({
      testplanid: parseInt(planId)
    }));
  }

  async createBuild(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Build data must be an object');
    }
    if (!data.plan_id || !data.name) {
      throw new Error('Missing required fields: plan_id, name');
    }
    validateSuiteId(data.plan_id); // Using suite validation for plan ID
    validateNonEmptyString(data.name, 'Build name');

    const createParams = {
      testplanid: parseInt(data.plan_id),
      buildname: data.name,
      buildnotes: data.notes || '',
      active: data.active !== undefined ? data.active : 1,
      open: data.open !== undefined ? data.open : 1,
      releasedate: data.release_date || new Date().toISOString().split('T')[0]
    };

    return this.handleAPICall(() => this.client.createBuild(createParams));
  }

  async updateBuild(buildId: string, data: any) {
    validateSuiteId(buildId); // Using suite validation for build ID
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    // TestLink doesn't have a direct update build method
    throw new Error('Build update not supported by TestLink API');
  }

  async deleteBuild(buildId: string) {
    validateSuiteId(buildId); // Using suite validation for build ID
    return this.handleAPICall(() => this.client.closeBuild({
      buildid: parseInt(buildId)
    }));
  }

  async getTestExecutions(planId: string, buildId?: string) {
    validateSuiteId(planId); // Using suite validation for plan ID
    if (buildId) {
      validateSuiteId(buildId);
    }
    
    const params: any = { testplanid: parseInt(planId) };
    if (buildId) {
      params.buildid = parseInt(buildId);
    }
    
    return this.handleAPICall(() => this.client.getAllExecutionsResults(params));
  }

  async createTestExecution(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Test execution data must be an object');
    }
    if (!data.test_case_id || !data.plan_id || !data.build_id || !data.status) {
      throw new Error('Missing required fields: test_case_id, plan_id, build_id, status');
    }
    validateTestCaseId(data.test_case_id);
    validateSuiteId(data.plan_id);
    validateSuiteId(data.build_id);

    const executionParams = {
      testcaseid: parseTestCaseId(data.test_case_id),
      testplanid: parseInt(data.plan_id),
      buildid: parseInt(data.build_id),
      status: data.status,
      notes: data.notes || '',
      platformid: data.platform_id ? data.platform_id : undefined,
      steps: data.steps || []
    };

    return this.handleAPICall(() => this.client.setTestCaseExecutionResult(executionParams));
  }

  async updateTestExecution(executionId: string, data: any) {
    validateSuiteId(executionId); // Using suite validation for execution ID
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    // TestLink doesn't have a direct update execution method
    // We would need to create a new execution with updated data
    throw new Error('Test execution update not supported by TestLink API');
  }

  async deleteTestExecution(executionId: string) {
    validateSuiteId(executionId); // Using suite validation for execution ID
    return this.handleAPICall(() => this.client.deleteExecution({
      executionid: parseInt(executionId)
    }));
  }

  async getRequirements(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.getRequirements({
      testprojectid: parseInt(projectId)
    }));
  }

  async createRequirement(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Requirement data must be an object');
    }
    if (!data.project_id || !data.title) {
      throw new Error('Missing required fields: project_id, title');
    }
    validateProjectId(data.project_id);
    validateNonEmptyString(data.title, 'Requirement title');

    // TestLink doesn't have a direct create requirement method
    throw new Error('Requirement creation not supported by TestLink API');
  }

  async updateRequirement(requirementId: string, data: any) {
    validateSuiteId(requirementId); // Using suite validation for requirement ID
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    // TestLink doesn't have a direct update requirement method
    throw new Error('Requirement update not supported by TestLink API');
  }

  async deleteRequirement(requirementId: string) {
    validateSuiteId(requirementId); // Using suite validation for requirement ID
    // TestLink doesn't have a direct delete requirement method
    throw new Error('Requirement deletion not supported by TestLink API');
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
  },
  {
    name: 'create_project',
    description: 'Create a new test project',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Project data',
          properties: {
            name: { type: 'string', description: 'Project name' },
            prefix: { type: 'string', description: 'Test case prefix' },
            notes: { type: 'string', description: 'Project notes' },
            options: { type: 'object', description: 'Project options' }
          },
          required: ['name', 'prefix']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'update_project',
    description: 'Update project settings',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to update'
        },
        data: {
          type: 'object',
          description: 'Project data to update'
        }
      },
      required: ['project_id', 'data']
    }
  },
  {
    name: 'delete_project',
    description: 'Delete a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to delete'
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'update_test_suite',
    description: 'Update test suite properties',
    inputSchema: {
      type: 'object',
      properties: {
        suite_id: {
          type: 'string',
          description: 'The test suite ID to update'
        },
        data: {
          type: 'object',
          description: 'Test suite data to update',
          properties: {
            name: { type: 'string' },
            details: { type: 'string' }
          }
        }
      },
      required: ['suite_id', 'data']
    }
  },
  {
    name: 'delete_test_suite',
    description: 'Delete a test suite',
    inputSchema: {
      type: 'object',
      properties: {
        suite_id: {
          type: 'string',
          description: 'The test suite ID to delete'
        }
      },
      required: ['suite_id']
    }
  },
  {
    name: 'list_test_plans',
    description: 'List all test plans for a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID'
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'create_test_plan',
    description: 'Create a new test plan',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Test plan data',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            name: { type: 'string', description: 'Test plan name' },
            notes: { type: 'string', description: 'Test plan notes' },
            active: { type: 'number', description: 'Whether plan is active (1/0)' },
            is_public: { type: 'number', description: 'Whether plan is public (1/0)' }
          },
          required: ['project_id', 'name']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'update_test_plan',
    description: 'Update test plan details',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: {
          type: 'string',
          description: 'The test plan ID to update'
        },
        data: {
          type: 'object',
          description: 'Test plan data to update'
        }
      },
      required: ['plan_id', 'data']
    }
  },
  {
    name: 'delete_test_plan',
    description: 'Delete a test plan',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: {
          type: 'string',
          description: 'The test plan ID to delete'
        }
      },
      required: ['plan_id']
    }
  },
  {
    name: 'list_builds',
    description: 'List all builds for a test plan',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: {
          type: 'string',
          description: 'The test plan ID'
        }
      },
      required: ['plan_id']
    }
  },
  {
    name: 'create_build',
    description: 'Create a new build',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Build data',
          properties: {
            plan_id: { type: 'string', description: 'Test plan ID' },
            name: { type: 'string', description: 'Build name' },
            notes: { type: 'string', description: 'Build notes' },
            active: { type: 'number', description: 'Whether build is active (1/0)' },
            open: { type: 'number', description: 'Whether build is open (1/0)' }
          },
          required: ['plan_id', 'name']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'update_build',
    description: 'Update build info',
    inputSchema: {
      type: 'object',
      properties: {
        build_id: {
          type: 'string',
          description: 'The build ID to update'
        },
        data: {
          type: 'object',
          description: 'Build data to update'
        }
      },
      required: ['build_id', 'data']
    }
  },
  {
    name: 'delete_build',
    description: 'Delete a build',
    inputSchema: {
      type: 'object',
      properties: {
        build_id: {
          type: 'string',
          description: 'The build ID to delete'
        }
      },
      required: ['build_id']
    }
  },
  {
    name: 'read_test_execution',
    description: 'Get test execution details',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: {
          type: 'string',
          description: 'The test plan ID'
        },
        build_id: {
          type: 'string',
          description: 'The build ID (optional)'
        }
      },
      required: ['plan_id']
    }
  },
  {
    name: 'create_test_execution',
    description: 'Record test execution result',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Test execution data',
          properties: {
            test_case_id: { type: 'string', description: 'Test case ID' },
            plan_id: { type: 'string', description: 'Test plan ID' },
            build_id: { type: 'string', description: 'Build ID' },
            status: { type: 'string', description: 'Execution status (p/f/b)' },
            notes: { type: 'string', description: 'Execution notes' },
            platform_id: { type: 'string', description: 'Platform ID (optional)' }
          },
          required: ['test_case_id', 'plan_id', 'build_id', 'status']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'update_test_execution',
    description: 'Modify execution details',
    inputSchema: {
      type: 'object',
      properties: {
        execution_id: {
          type: 'string',
          description: 'The execution ID to update'
        },
        data: {
          type: 'object',
          description: 'Execution data to update'
        }
      },
      required: ['execution_id', 'data']
    }
  },
  {
    name: 'delete_test_execution',
    description: 'Remove execution record',
    inputSchema: {
      type: 'object',
      properties: {
        execution_id: {
          type: 'string',
          description: 'The execution ID to delete'
        }
      },
      required: ['execution_id']
    }
  },
  {
    name: 'list_requirements',
    description: 'Get all requirements for a project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID'
        }
      },
      required: ['project_id']
    }
  },
  {
    name: 'create_requirement',
    description: 'Add new requirement',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Requirement data',
          properties: {
            project_id: { type: 'string', description: 'Project ID' },
            title: { type: 'string', description: 'Requirement title' },
            description: { type: 'string', description: 'Requirement description' }
          },
          required: ['project_id', 'title']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'update_requirement',
    description: 'Modify requirement',
    inputSchema: {
      type: 'object',
      properties: {
        requirement_id: {
          type: 'string',
          description: 'The requirement ID to update'
        },
        data: {
          type: 'object',
          description: 'Requirement data to update'
        }
      },
      required: ['requirement_id', 'data']
    }
  },
  {
    name: 'delete_requirement',
    description: 'Remove requirement',
    inputSchema: {
      type: 'object',
      properties: {
        requirement_id: {
          type: 'string',
          description: 'The requirement ID to delete'
        }
      },
      required: ['requirement_id']
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

      case 'create_project': {
        const result = await testlinkAPI.createProject(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_project': {
        const result = await testlinkAPI.updateProject(args.project_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_project': {
        const result = await testlinkAPI.deleteProject(args.project_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_test_suite': {
        const result = await testlinkAPI.updateTestSuite(args.suite_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_test_suite': {
        const result = await testlinkAPI.deleteTestSuite(args.suite_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_test_plans': {
        const result = await testlinkAPI.getTestPlans(args.project_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_test_plan': {
        const result = await testlinkAPI.createTestPlan(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_test_plan': {
        const result = await testlinkAPI.updateTestPlan(args.plan_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_test_plan': {
        const result = await testlinkAPI.deleteTestPlan(args.plan_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_builds': {
        const result = await testlinkAPI.getBuilds(args.plan_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_build': {
        const result = await testlinkAPI.createBuild(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_build': {
        const result = await testlinkAPI.updateBuild(args.build_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_build': {
        const result = await testlinkAPI.deleteBuild(args.build_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'read_test_execution': {
        const result = await testlinkAPI.getTestExecutions(
          args.plan_id as string, 
          args.build_id as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_test_execution': {
        const result = await testlinkAPI.createTestExecution(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_test_execution': {
        const result = await testlinkAPI.updateTestExecution(args.execution_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_test_execution': {
        const result = await testlinkAPI.deleteTestExecution(args.execution_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_requirements': {
        const result = await testlinkAPI.getRequirements(args.project_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_requirement': {
        const result = await testlinkAPI.createRequirement(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'update_requirement': {
        const result = await testlinkAPI.updateRequirement(args.requirement_id as string, args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_requirement': {
        const result = await testlinkAPI.deleteRequirement(args.requirement_id as string);
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