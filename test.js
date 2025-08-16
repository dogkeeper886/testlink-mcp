#!/usr/bin/env node
import { TestLink } from 'testlink-xmlrpc';
import dotenv from 'dotenv';

dotenv.config();

const TESTLINK_URL = process.env.TESTLINK_URL || 'http://localhost/testlink';
const TESTLINK_API_KEY = process.env.TESTLINK_API_KEY || '';

console.log('Testing TestLink connection...');
console.log('URL:', TESTLINK_URL);
console.log('API Key:', TESTLINK_API_KEY ? 'SET' : 'NOT SET');

// Parse the URL properly to extract hostname and path
const url = new URL(TESTLINK_URL);
console.log('Hostname:', url.hostname);
console.log('Path:', url.pathname);

const client = new TestLink({
  host: url.hostname,
  rpcPath: url.pathname + '/lib/api/xmlrpc/v1/xmlrpc.php',
  apiKey: TESTLINK_API_KEY
});

async function test() {
  try {
    console.log('Calling getProjects...');
    const projects = await client.getProjects();
    console.log('SUCCESS! Found', projects.length, 'projects');
    console.log('Projects:', projects.map(p => ({ id: p.id, name: p.name })));
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

test();