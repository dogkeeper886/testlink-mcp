#!/usr/bin/env npx tsx
/**
 * Flow fixture provisioner.
 *
 * Ensures a dedicated test project exists for the end-to-end flow and prints
 * its identity as JSON: {"id":"...","name":"...","prefix":"..."}.
 *
 * Project creation is not exposed as an MCP tool, so this fixture is created
 * out-of-band via the testlink-xmlrpc client. Idempotent: reuses the project
 * if it already exists (matched by prefix).
 *
 * Requires TESTLINK_URL and TESTLINK_API_KEY in the environment.
 */
import { TestLink } from 'testlink-xmlrpc';

const NAME = 'MCP Flow Tests';
const PREFIX = 'MFT';

const url = new URL(process.env.TESTLINK_URL || '');
const client = new TestLink({
  host: url.hostname,
  port: url.port ? parseInt(url.port) : undefined,
  secure: url.protocol === 'https:',
  rpcPath: url.pathname + '/lib/api/xmlrpc/v1/xmlrpc.php',
  apiKey: process.env.TESTLINK_API_KEY || '',
});

function findByPrefix(projects: any): any {
  return (Array.isArray(projects) ? projects : []).find((p) => p.prefix === PREFIX);
}

let projects = await client.getProjects();
let project = findByPrefix(projects);

if (!project) {
  await client.createTestProject({ testprojectname: NAME, testcaseprefix: PREFIX, notes: 'MCP flow tests' });
  projects = await client.getProjects();
  project = findByPrefix(projects);
}

if (!project) {
  process.stderr.write('flow-provision: failed to create or find project\n');
  process.exit(1);
}

console.log(JSON.stringify({ id: project.id, name: project.name, prefix: project.prefix }));
