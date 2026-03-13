/**
 * Test executor - orchestrates test execution with log collection
 * and pattern matching.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { TestCase, TestResult, StepResult, PatternMatch, RunConfig } from './types.js';
import { LogCollector } from './log-collector.js';
import { CONFIG } from './config.js';

const execAsync = promisify(exec);

/**
 * Strip ANSI escape codes from strings.
 */
function stripAnsi(str: string): string {
  return str.replace(
    /\x1b\[[0-9;?]*[a-zA-Z]|\x1b\][^\x07]*\x07|\x1b[()][AB012]|\x1b[a-zA-Z]/g,
    ''
  );
}

export class TestExecutor {
  private config: RunConfig;
  private logCollector: LogCollector | null = null;
  private totalTests: number = 0;
  private currentTest: number = 0;
  private currentTestId: string | null = null;

  constructor(config: RunConfig) {
    this.config = config;
  }

  private progress(msg: string): void {
    process.stderr.write(msg + '\n');
  }

  private async executeStep(
    step: { name: string; command: string; timeout?: number },
    defaultTimeout: number
  ): Promise<StepResult> {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    let timedOut = false;

    const timeout = step.timeout || defaultTimeout;

    const env = { ...process.env };
    if (this.currentTestId) {
      env.TEST_ID = this.currentTestId;
    }

    try {
      const result = await execAsync(step.command, {
        cwd: this.config.workingDir,
        timeout,
        maxBuffer: CONFIG.logs.maxBuffer,
        shell: '/bin/bash',
        env,
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: unknown) {
      const err = error as {
        stdout?: string;
        stderr?: string;
        message?: string;
        code?: number;
        killed?: boolean;
      };
      stdout = err.stdout || '';
      stderr = err.stderr || err.message || 'Unknown error';
      exitCode = err.code || 1;
      timedOut = err.killed === true;
    }

    const duration = Date.now() - startTime;

    stdout = stripAnsi(stdout);
    stderr = stripAnsi(stderr);

    if (timedOut) {
      stderr = `[TIMEOUT] Command killed after ${timeout / 1000}s\n\n${stderr}`;
    }

    return {
      name: step.name,
      command: step.command,
      stdout,
      stderr,
      exitCode,
      duration,
    };
  }

  private checkPatterns(
    result: StepResult,
    expectPatterns?: string[],
    rejectPatterns?: string[]
  ): StepResult['patternMatches'] {
    if (!expectPatterns && !rejectPatterns) {
      return undefined;
    }

    const combined = result.stdout + '\n' + result.stderr;

    const expected: PatternMatch[] = (expectPatterns || []).map((pattern) => ({
      pattern,
      found: new RegExp(pattern, 'i').test(combined),
    }));

    const rejected: PatternMatch[] = (rejectPatterns || []).map((pattern) => ({
      pattern,
      found: new RegExp(pattern, 'i').test(combined),
    }));

    return { expected, rejected };
  }

  async executeTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    const timestamp = new Date().toISOString().substring(11, 19);

    this.currentTest++;
    this.currentTestId = testCase.id;
    this.progress(
      `[${timestamp}] [${this.currentTest}/${this.totalTests}] ${testCase.id}: ${testCase.name}`
    );

    if (this.logCollector) {
      this.logCollector.markTestStart(testCase.id);
    }

    for (let i = 0; i < testCase.steps.length; i++) {
      const step = testCase.steps[i];
      const stepTimestamp = new Date().toISOString().substring(11, 19);

      this.progress(
        `  [${stepTimestamp}] Step ${i + 1}/${testCase.steps.length}: ${step.name}`
      );
      const cmdPreview =
        step.command.length > 80
          ? step.command.substring(0, 80) + '...'
          : step.command;
      this.progress(`    Command: ${cmdPreview}`);

      const result = await this.executeStep(step, testCase.timeout);

      result.patternMatches = this.checkPatterns(
        result,
        step.expectPatterns,
        step.rejectPatterns
      );

      stepResults.push(result);

      const status = result.exitCode === 0 ? '[PASS]' : '[FAIL]';
      const duration = `${(result.duration / 1000).toFixed(1)}s`;
      this.progress(`    ${status} Exit: ${result.exitCode} (${duration})`);

      if (result.patternMatches) {
        const expectedMissing = result.patternMatches.expected.filter(
          (p) => !p.found
        );
        const rejectedFound = result.patternMatches.rejected.filter(
          (p) => p.found
        );
        if (expectedMissing.length > 0) {
          this.progress(
            `    Missing patterns: ${expectedMissing.map((p) => p.pattern).join(', ')}`
          );
        }
        if (rejectedFound.length > 0) {
          this.progress(
            `    Rejected patterns found: ${rejectedFound.map((p) => p.pattern).join(', ')}`
          );
        }
      }

      if (result.exitCode !== 0 && result.stderr) {
        const errorPreview = result.stderr.split('\n')[0].substring(0, 100);
        this.progress(`    Error: ${errorPreview}`);
      }
    }

    const totalDuration = Date.now() - startTime;

    let logs = '';
    let logFile = '';
    if (this.logCollector) {
      this.logCollector.markTestEnd(testCase.id);
      logFile = this.logCollector.extractTestLogs(testCase.id);
      logs = this.logCollector.getLogsForTest(testCase.id);
    }
    this.currentTestId = null;

    if (!logs) {
      logs = stepResults
        .map(
          (r) =>
            `=== Step: ${r.name} ===
Command: ${r.command}
Exit Code: ${r.exitCode}
Duration: ${r.duration}ms

STDOUT:
${r.stdout || '(empty)'}

STDERR:
${r.stderr || '(empty)'}
`
        )
        .join('\n' + '='.repeat(50) + '\n');
    }

    return {
      testCase,
      steps: stepResults,
      totalDuration,
      logs,
      logFile,
    };
  }

  async executeAll(testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    this.totalTests = testCases.length;
    this.currentTest = 0;

    const startTimestamp = new Date().toISOString().substring(11, 19);
    this.progress(`\n[${startTimestamp}] Starting ${this.totalTests} test(s)...`);
    this.progress('-'.repeat(60));

    // Determine if we need the log collector (for Docker-based tests)
    const needsLogCollector = testCases.some(
      (tc) => tc.suite === 'integration' || tc.suite === 'e2e'
    );

    if (needsLogCollector) {
      this.logCollector = new LogCollector(
        this.config.dockerComposePath,
        this.config.outputDir
      );
      try {
        await this.logCollector.start();
        this.progress(`[LOG] Docker log collector started`);
      } catch (err) {
        this.progress(`[WARN] Failed to start log collector: ${err}`);
        this.logCollector = null;
      }
    }

    for (const tc of testCases) {
      const result = await this.executeTestCase(tc);
      results.push(result);
    }

    if (this.logCollector) {
      await this.logCollector.stop();
      this.logCollector.copySessionToOutput();
      this.progress(`[LOG] Docker log collector stopped`);
    }

    const endTimestamp = new Date().toISOString().substring(11, 19);
    this.progress('-'.repeat(60));
    this.progress(`[${endTimestamp}] Execution complete: ${results.length} test(s)`);

    return results;
  }
}
