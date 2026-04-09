/**
 * Project configuration for the test framework.
 * 
 * Customize this file for your project's needs.
 */

/**
 * Available test suites - extend this for your project.
 */
export const SUITES = ['s1-build-deploy', 's2-test-case', 's3-test-suite', 's4-test-plan', 's5-build-mgmt', 's6-execution', 's7-requirements'] as const;
export type Suite = typeof SUITES[number];

/**
 * Project configuration.
 */
export const CONFIG = {
  // Project identification
  projectName: 'testlink-mcp',
  
  // Session file prefix for log collection
  sessionPrefix: 'testlink-mcp-session',
  
  // Default timeouts (in milliseconds)
  defaultTimeout: 60000,
  defaultStepTimeout: 30000,
  
  // LLM Judge defaults
  llm: {
    defaultUrl: 'http://192.168.6.113:11435',
    defaultModel: 'gemma3:12b-judge',
    timeout: 300000,
    stdoutLimit: 1000,
    stderrLimit: 500,
    logsLimit: 3000,
  },
  
  // Log collection settings
  logs: {
    cleanupAge: 24 * 60 * 60 * 1000, // 24 hours
    maxBuffer: 50 * 1024 * 1024, // 50MB
  },
};

/**
 * Error patterns to detect in logs.
 * The Simple Judge will fail tests if any of these patterns are found.
 * 
 * Customize for your project's specific error indicators.
 */
export const ERROR_PATTERNS: RegExp[] = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bexception\b/i,
  /\bpanic\b/i,
  /segmentation fault/i,
  /out of memory/i,
  /OOM/,
];

/**
 * Patterns that indicate a test should NOT be failed.
 * Use these to exclude false positives from ERROR_PATTERNS.
 */
export const ERROR_EXCLUSIONS: RegExp[] = [
  /error.*handled/i,
  /expected.*error/i,
];
