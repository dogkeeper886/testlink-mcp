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
// A TestLink external id is PREFIX-NUMBER (e.g. MFT-20); the captured group is the
// numeric part. Single source of truth for external-vs-internal classification.
const EXTERNAL_TC_ID = /^[A-Za-z0-9]+-(\d+)$/;

function parseTestCaseId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error('Test case ID must be a non-empty string');
  }

  // Handle external ID format (PREFIX-123) - extract numeric part
  const externalIdMatch = id.match(EXTERNAL_TC_ID);
  if (externalIdMatch) {
    return externalIdMatch[1];
  }

  // Handle pure numeric ID
  if (/^\d+$/.test(id)) {
    return id;
  }

  throw new Error('Test case ID must be either numeric (123) or external format (PREFIX-123)');
}

function validateTestCaseId(id: string): void {
  parseTestCaseId(id); // This will throw if invalid
}

// Route a test case identifier to the correct TestLink param: an external id
// (PREFIX-123) goes to testcaseexternalid; a numeric id is the internal testcaseid.
// TestLink's checkTestCaseIdentity accepts either — sending a numeric internal id
// as testcaseexternalid would resolve it to the wrong case.
function testCaseIdParam(id: string): Record<string, string> {
  return EXTERNAL_TC_ID.test(id)
    ? { testcaseexternalid: id }
    : { testcaseid: parseTestCaseId(id) };
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
      port: parsedUrl.port ? parseInt(parsedUrl.port) : undefined,
      secure: parsedUrl.protocol === 'https:',
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
    
    return this.handleAPICall(() => this.client.getTestCase(testCaseIdParam(testCaseId)));
  }

  async updateTestCase(testCaseId: string, data: any) {
    validateTestCaseId(testCaseId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }
    
    const updateParams: any = {
      ...testCaseIdParam(testCaseId)
    };

    if (data.name) updateParams.testcasename = data.name;
    if (data.summary) updateParams.summary = data.summary;
    if (data.preconditions) updateParams.preconditions = data.preconditions;
    if (data.steps) updateParams.steps = data.steps;
    if (data.importance !== undefined) updateParams.importance = data.importance;
    if (data.execution_type !== undefined) updateParams.executiontype = data.execution_type;
    if (data.status !== undefined) updateParams.status = data.status;

    // Call via the generic dispatcher, not the typed client.updateTestCase: the
    // lib wrapper hard-requires testcaseexternalid and would reject a numeric
    // testcaseid before it reaches the server (which accepts either via
    // checkTestCaseIdentity). Same approach as deleteTestCase/assignRequirements.
    return this.handleAPICall(() => (this.client as any)._performRequest('updateTestCase', updateParams));
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
      preconditions: data.preconditions || '',
      steps: data.steps || [],
      importance: data.importance || 2,
      executiontype: data.execution_type || 1,
      status: data.status || 1
    };

    return this.handleAPICall(() => this.client.createTestCase(createParams));
  }

  async deleteTestCase(testCaseId: string) {
    validateTestCaseId(testCaseId);
    // testlink-xmlrpc 3.0.0 has no typed deleteTestCase wrapper; call the
    // server's tl.deleteTestCase (real delete) via the generic dispatcher.
    const params = testCaseIdParam(testCaseId);
    return this.handleAPICall(() => (this.client as any)._performRequest('deleteTestCase', params));
  }

  async getTestProjects() {
    return this.handleAPICall(() => this.client.getProjects());
  }


  async getTestSuites(projectId: string, parentSuiteId?: string) {
    validateProjectId(projectId);
    if (parentSuiteId) {
      validateSuiteId(parentSuiteId);
    }

    // Top-level mode: the library already returns a TestSuite[].
    if (!parentSuiteId) {
      return this.handleAPICall(() => this.client.getFirstLevelTestSuitesForTestProject({
        testprojectid: projectId
      }));
    }

    // Child mode: getTestSuitesForTestSuite returns a keyed object
    // ({ <id>: TestSuite, ... }) for multiple children, a single TestSuite
    // object for exactly one child, and empty for none. Normalize all to a
    // TestSuite[] so the return shape matches top-level mode.
    const children = await this.handleAPICall(() => this.client.getTestSuitesForTestSuite({
      testsuiteid: parseInt(parentSuiteId)
    }));

    // TestLink returns "" (empty string) for no children, like getProjects —
    // this guards that real boundary shape, not an impossible state.
    if (!children || typeof children !== 'object') {
      return [];
    }
    if ('id' in children) {          // single-child form: object IS a TestSuite
      return [children];
    }
    return Object.values(children);  // multi-child form: map keyed by suite id
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

  async updateTestSuite(suiteId: string, projectId: string, data: any) {
    validateSuiteId(suiteId);
    validateProjectId(projectId);
    if (!data || typeof data !== 'object') {
      throw new Error('Update data must be an object');
    }

    const updateParams: any = {
      testsuiteid: parseInt(suiteId),
      testprojectid: parseInt(projectId)
    };

    if (data.name) updateParams.testsuitename = data.name;
    if (data.details) updateParams.details = data.details;

    return this.handleAPICall(() => this.client.updateTestSuite(updateParams));
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
    validateNonEmptyString(data.project_id, 'Project ID/prefix');
    validateNonEmptyString(data.name, 'Test plan name');

    const createParams = {
      testprojectname: data.project_id, // Use project prefix instead of numeric ID
      testplanname: data.name,
      notes: data.notes || '',
      active: data.active !== undefined ? data.active : 1,
      is_public: data.is_public !== undefined ? data.is_public : 1
    };

    return this.handleAPICall(() => this.client.createTestPlan(createParams));
  }


  async deleteTestPlan(planId: string) {
    validateSuiteId(planId); // Using suite validation for plan ID
    return this.handleAPICall(() => this.client.deleteTestPlan({
      testplanid: parseInt(planId)
    }));
  }

  async getTestCasesForTestPlan(planId: string) {
    validateSuiteId(planId);
    return this.handleAPICall(() => this.client.getTestCasesForTestPlan({
      testplanid: parseInt(planId)
    }));
  }

  async addTestCaseToTestPlan(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid assignment data');
    }
    if (!data.testcaseid || !data.testplanid || !data.testprojectid) {
      throw new Error('Missing required fields');
    }
    validateTestCaseId(data.testcaseid);
    validateSuiteId(data.testplanid);
    validateProjectId(data.testprojectid);

    // Generic dispatcher, not the typed client.addTestCaseToTestPlan: the lib
    // wrapper hard-requires testcaseexternalid and would reject a numeric
    // testcaseid before it reaches the server (which accepts either via
    // checkTestCaseIdentity).
    return this.handleAPICall(() => (this.client as any)._performRequest('addTestCaseToTestPlan', {
      testprojectid: parseInt(data.testprojectid),
      testplanid: parseInt(data.testplanid),
      ...testCaseIdParam(data.testcaseid),
      version: data.version || 1,
      platformid: data.platformid ? parseInt(data.platformid) : undefined,
      urgency: data.urgency || 2,
      overwrite: data.overwrite || false
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

  async closeBuild(buildId: string) {
    validateSuiteId(buildId); // Using suite validation for build ID
    return this.handleAPICall(() => this.client.closeBuild({
      buildid: parseInt(buildId)
    }));
  }

  async getTestExecutions(planId: string, testCaseId: string, buildId?: string) {
    validateSuiteId(planId); // Using suite validation for plan ID
    validateTestCaseId(testCaseId);
    if (buildId) {
      validateSuiteId(buildId);
    }

    const params: any = { testplanid: parseInt(planId) };
    // getLastExecutionResult requires a test case id (external PREFIX-N or numeric)
    Object.assign(params, testCaseIdParam(testCaseId));
    if (buildId) {
      params.buildid = parseInt(buildId);
    }

    return this.handleAPICall(() => this.client.getLastExecutionResult(params));
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

    const executionParams: any = {
      testplanid: parseInt(data.plan_id),
      buildid: parseInt(data.build_id),
      status: data.status,
      notes: data.notes || '',
      platformid: data.platform_id ? data.platform_id : undefined,
      steps: data.steps || []
    };
    // Pass external PREFIX-N as testcaseexternalid; numeric as internal testcaseid
    Object.assign(executionParams, testCaseIdParam(data.test_case_id));

    return this.handleAPICall(() => this.client.setTestCaseExecutionResult(executionParams));
  }


  async getRequirements(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.getRequirements({
      testprojectid: parseInt(projectId)
    }));
  }

  async getRequirement(requirementId: string, projectId: string) {
    validateSuiteId(requirementId);
    validateProjectId(projectId);
    return this.handleAPICall(() => this.client.getRequirement({
      requirementid: parseInt(requirementId),
      testprojectid: parseInt(projectId)
    }));
  }

  async deleteTestSuite(suiteId: string) {
    validateSuiteId(suiteId);
    // testlink-xmlrpc has no typed deleteTestSuite wrapper; use the dispatcher.
    return this.handleAPICall(() => (this.client as any)._performRequest('deleteTestSuite', {
      testsuiteid: parseInt(suiteId)
    }));
  }

  async getRequirementSpecifications(projectId: string) {
    validateProjectId(projectId);
    return this.handleAPICall(() => (this.client as any)._performRequest('getRequirementSpecificationsForTestProject', {
      testprojectid: parseInt(projectId)
    }));
  }

  async createRequirementSpecification(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Requirement spec data must be an object');
    }
    if (!data.project_id || !data.doc_id || !data.title) {
      throw new Error('Missing required fields: project_id, doc_id, title');
    }
    validateProjectId(data.project_id);
    return this.handleAPICall(() => (this.client as any)._performRequest('createRequirementSpecification', {
      testprojectid: parseInt(data.project_id),
      requirementdocid: data.doc_id,
      title: data.title,
      scope: data.scope || ''
    }));
  }

  async createRequirement(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Requirement data must be an object');
    }
    if (!data.project_id || !data.reqspec_id || !data.doc_id || !data.title) {
      throw new Error('Missing required fields: project_id, reqspec_id, doc_id, title');
    }
    validateProjectId(data.project_id);
    validateSuiteId(data.reqspec_id);
    return this.handleAPICall(() => (this.client as any)._performRequest('createRequirement', {
      testprojectid: parseInt(data.project_id),
      reqspecid: parseInt(data.reqspec_id),
      requirementdocid: data.doc_id,
      title: data.title,
      scope: data.scope || ''
    }));
  }

  async deleteRequirementSpecification(reqSpecId: string) {
    validateSuiteId(reqSpecId);
    return this.handleAPICall(() => (this.client as any)._performRequest('deleteRequirementSpecification', {
      reqspecid: parseInt(reqSpecId)
    }));
  }

  async assignRequirements(data: any) {
    if (!data || typeof data !== 'object') {
      throw new Error('Assignment data must be an object');
    }
    if (!data.test_case_id || !data.project_id || !data.reqspec_id || !data.requirement_ids) {
      throw new Error('Missing required fields: test_case_id, project_id, reqspec_id, requirement_ids');
    }
    validateTestCaseId(data.test_case_id);
    validateProjectId(data.project_id);
    validateSuiteId(data.reqspec_id);
    const reqs = (Array.isArray(data.requirement_ids) ? data.requirement_ids : [data.requirement_ids]).map((r: any) => parseInt(r));
    return this.handleAPICall(() => (this.client as any)._performRequest('assignRequirements', {
      ...testCaseIdParam(data.test_case_id),
      testprojectid: parseInt(data.project_id),
      requirements: [{ req_spec: parseInt(data.reqspec_id), requirements: reqs }]
    }));
  }

}

const server = new Server(
  {
    name: 'testlink-mcp-server',
    version: '1.4.1',
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
          description: 'The TestLink test case ID (numeric like "123" or external format like "PREFIX-123")'
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
            summary: { type: 'string', description: 'HTML-formatted (e.g. <p>, <strong>, <em>, <ul><li>); escape < > & " as HTML entities' },
            preconditions: { type: 'string', description: 'HTML-formatted, same rules as summary' },
            steps: { type: 'array', description: 'Each step\'s actions and expected_results are HTML-formatted, same rules as summary' },
            importance: { type: 'number', description: '1=low, 2=medium, 3=high' },
            execution_type: { type: 'number', description: '1=manual, 2=automated' },
            status: { type: 'number', description: '1=draft, 7=final' }
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
            summary: { type: 'string', description: 'HTML-formatted (e.g. <p>, <strong>, <em>, <ul><li>); escape < > & " as HTML entities' },
            preconditions: { type: 'string', description: 'HTML-formatted, same rules as summary' },
            steps: { type: 'array', description: 'Each step\'s actions and expected_results are HTML-formatted, same rules as summary' },
            importance: { type: 'number', description: '1=low, 2=medium, 3=high' },
            execution_type: { type: 'number', description: '1=manual, 2=automated' },
            status: { type: 'number', description: '1=draft, 7=final' }
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
    description: 'List test suites for a project. Without parent_suite_id, returns top-level (first-level) suites. With parent_suite_id, returns the immediate child suites of that parent (single level, no recursion).',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The test project ID'
        },
        parent_suite_id: {
          type: 'string',
          description: 'Optional. The ID of a parent test suite. When provided, returns only the immediate child suites of this suite instead of the project top-level suites. This is a SUITE ID, not a project ID — do not pass it as project_id.'
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
    name: 'update_test_suite',
    description: 'Update test suite properties',
    inputSchema: {
      type: 'object',
      properties: {
        suite_id: {
          type: 'string',
          description: 'The test suite ID to update'
        },
        project_id: {
          type: 'string',
          description: 'The test project ID'
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
      required: ['suite_id', 'project_id', 'data']
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
    name: 'get_test_cases_for_test_plan',
    description: 'List all test cases in a test plan',
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
    name: 'add_test_case_to_test_plan',
    description: 'Add a test case to a test plan',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Test case assignment data',
          properties: {
            testcaseid: { type: 'string', description: 'Test case ID — numeric (internal) or external (PREFIX-123); both accepted' },
            testplanid: { type: 'string', description: 'Test plan ID' },
            testprojectid: { type: 'string', description: 'Test project ID' },
            version: { type: 'number', description: 'Test case version (optional, defaults to 1)' },
            platformid: { type: 'string', description: 'Platform ID (optional)' },
            urgency: { type: 'number', description: 'Urgency level (1=low, 2=medium, 3=high, optional, defaults to 2)' },
            overwrite: { type: 'boolean', description: 'Overwrite existing assignment (optional, defaults to false)' }
          },
          required: ['testcaseid', 'testplanid', 'testprojectid']
        }
      },
      required: ['data']
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
    name: 'close_build',
    description: 'Close a build (prevents new test executions)',
    inputSchema: {
      type: 'object',
      properties: {
        build_id: {
          type: 'string',
          description: 'The build ID to close'
        }
      },
      required: ['build_id']
    }
  },
  {
    name: 'read_test_execution',
    description: 'Get the last execution result for a test case in a test plan. Both plan_id and test_case_id are required — a plan ID alone is not enough.',
    inputSchema: {
      type: 'object',
      properties: {
        plan_id: {
          type: 'string',
          description: 'The test plan ID'
        },
        test_case_id: {
          type: 'string',
          description: 'The test case ID (numeric or external PREFIX-123)'
        },
        build_id: {
          type: 'string',
          description: 'The build ID (optional)'
        }
      },
      required: ['plan_id', 'test_case_id']
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
            test_case_id: { type: 'string', description: 'Test case ID — numeric (internal) or external (PREFIX-123); both accepted' },
            plan_id: { type: 'string', description: 'Test plan ID' },
            build_id: { type: 'string', description: 'Build ID' },
            status: { type: 'string', description: 'Execution status: p=pass, f=fail, b=block' },
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
    name: 'list_requirements',
    description: 'Get all requirements for a project',
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
    name: 'get_requirement',
    description: 'Get detailed information about a specific requirement',
    inputSchema: {
      type: 'object',
      properties: {
        requirement_id: {
          type: 'string',
          description: 'The requirement ID'
        },
        project_id: {
          type: 'string',
          description: 'The test project ID'
        }
      },
      required: ['requirement_id', 'project_id']
    }
  },
  {
    name: 'delete_test_suite',
    description: 'Delete a test suite (and its contents) from TestLink',
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
    name: 'list_requirement_specifications',
    description: 'List requirement specifications for a test project',
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
    name: 'create_requirement_specification',
    description: 'Create a requirement specification in a project',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Requirement specification data',
          properties: {
            project_id: { type: 'string', description: 'Test project ID' },
            doc_id: { type: 'string', description: 'Unique document ID within the project' },
            title: { type: 'string', description: 'Specification title' },
            scope: { type: 'string', description: 'Free-text description (optional)' }
          },
          required: ['project_id', 'doc_id', 'title']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'create_requirement',
    description: 'Create a requirement inside a requirement specification',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Requirement data',
          properties: {
            project_id: { type: 'string', description: 'Test project ID' },
            reqspec_id: { type: 'string', description: 'Parent requirement specification ID' },
            doc_id: { type: 'string', description: 'Unique document ID within the project' },
            title: { type: 'string', description: 'Requirement title' },
            scope: { type: 'string', description: 'Free-text description (optional)' }
          },
          required: ['project_id', 'reqspec_id', 'doc_id', 'title']
        }
      },
      required: ['data']
    }
  },
  {
    name: 'delete_requirement_specification',
    description: 'Delete a requirement specification (and its requirements)',
    inputSchema: {
      type: 'object',
      properties: {
        reqspec_id: {
          type: 'string',
          description: 'The requirement specification ID to delete'
        }
      },
      required: ['reqspec_id']
    }
  },
  {
    name: 'assign_requirements',
    description: 'Link requirements to a test case (requirement coverage)',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Requirement coverage assignment',
          properties: {
            test_case_id: { type: 'string', description: 'Test case ID — numeric (internal) or external (PREFIX-123); both accepted' },
            project_id: { type: 'string', description: 'Test project ID' },
            reqspec_id: { type: 'string', description: 'Requirement specification ID' },
            requirement_ids: { type: 'array', description: 'Requirement IDs to assign', items: { type: 'string' } }
          },
          required: ['test_case_id', 'project_id', 'reqspec_id', 'requirement_ids']
        }
      },
      required: ['data']
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
        const result = await testlinkAPI.getTestSuites(
          args.project_id as string,
          args.parent_suite_id as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_test_cases_in_suite': {
        const result = await testlinkAPI.getTestCasesForTestSuite(args.suite_id as string);
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



      case 'update_test_suite': {
        const result = await testlinkAPI.updateTestSuite(args.suite_id as string, args.project_id as string, args.data);
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


      case 'delete_test_plan': {
        const result = await testlinkAPI.deleteTestPlan(args.plan_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'get_test_cases_for_test_plan': {
        const result = await testlinkAPI.getTestCasesForTestPlan(args.plan_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'add_test_case_to_test_plan': {
        const result = await testlinkAPI.addTestCaseToTestPlan(args.data);
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

      case 'close_build': {
        const result = await testlinkAPI.closeBuild(args.build_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'read_test_execution': {
        const result = await testlinkAPI.getTestExecutions(
          args.plan_id as string,
          args.test_case_id as string,
          args.build_id as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_test_execution': {
        const result = await testlinkAPI.createTestExecution(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }


      case 'list_requirements': {
        return { content: [{ type: 'text', text: JSON.stringify(await testlinkAPI.getRequirements(args.project_id as string), null, 2) }] };
      }

      case 'get_requirement': {
        return { content: [{ type: 'text', text: JSON.stringify(await testlinkAPI.getRequirement(args.requirement_id as string, args.project_id as string), null, 2) }] };
      }

      case 'delete_test_suite': {
        const result = await testlinkAPI.deleteTestSuite(args.suite_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'list_requirement_specifications': {
        const result = await testlinkAPI.getRequirementSpecifications(args.project_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_requirement_specification': {
        const result = await testlinkAPI.createRequirementSpecification(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'create_requirement': {
        const result = await testlinkAPI.createRequirement(args.data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'delete_requirement_specification': {
        const result = await testlinkAPI.deleteRequirementSpecification(args.reqspec_id as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'assign_requirements': {
        const result = await testlinkAPI.assignRequirements(args.data);
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