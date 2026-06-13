/**
 * JSON Reporter - Outputs test results as JSON files.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { hostname } from 'os';
import path from 'path';
import { TestResult, TestReport, TestSummary, Judgment, StepReportEntry } from '../types.js';

export class JsonReporter {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  generateReports(
    results: TestResult[],
    simpleJudgments: Judgment[],
    agentJudgments: Judgment[],
    startTime: Date,
    suite: string
  ): { summary: TestSummary; reports: TestReport[] } {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const simpleMap = new Map(simpleJudgments.map((j) => [j.testId, j]));
    const agentMap = new Map(agentJudgments.map((j) => [j.testId, j]));

    const reports: TestReport[] = results.map((result) => {
      const simple = simpleMap.get(result.testCase.id) || {
        testId: result.testCase.id,
        pass: false,
        reason: 'No judgment',
      };
      const agent = agentMap.get(result.testCase.id) || {
        testId: result.testCase.id,
        pass: false,
        reason: 'No judgment',
      };

      const pass = simple.pass && agent.pass;

      const steps: StepReportEntry[] = result.steps.map((step) => ({
        name: step.name,
        command: step.command,
        exitCode: step.exitCode,
        duration: step.duration,
        stdout: step.stdout,
        stderr: step.stderr,
        pass: step.exitCode === 0,
      }));

      return {
        testId: result.testCase.id,
        name: result.testCase.name,
        suite: result.testCase.suite,
        pass,
        reason: pass
          ? 'Both judges passed'
          : `Simple: ${simple.reason}; Agent: ${agent.reason}`,
        duration: result.totalDuration,
        steps,
        logFile: result.logFile,
        simpleJudge: simple,
        agentJudge: agent,
        testlink_id: result.testCase.testlink_id,
      };
    });

    const simplePassed = simpleJudgments.filter((j) => j.pass).length;
    const agentPassed = agentJudgments.filter((j) => j.pass).length;
    const passed = reports.filter((r) => r.pass).length;

    const summary: TestSummary = {
      runId: startTime.toISOString(),
      suite,
      timestamp: startTime.toISOString(),
      duration,
      total: results.length,
      passed,
      failed: results.length - passed,
      simple: {
        passed: simplePassed,
        failed: results.length - simplePassed,
      },
      agent: {
        passed: agentPassed,
        failed: results.length - agentPassed,
      },
      environment: {
        hostname: hostname(),
        nodeVersion: process.version,
      },
      tests: results.map((r) => r.testCase.id),
    };

    return { summary, reports };
  }

  writeReports(summary: TestSummary, reports: TestReport[]): void {
    const summaryPath = path.join(this.outputDir, 'summary.json');
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    for (const report of reports) {
      const reportPath = path.join(this.outputDir, `${report.testId}.json`);
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    process.stderr.write(`\n[JSON] Results written to ${this.outputDir}/\n`);
  }

  outputSummary(summary: TestSummary, reports: TestReport[]): void {
    const output = {
      summary,
      results: reports.map((r) => ({
        testId: r.testId,
        name: r.name,
        suite: r.suite,
        pass: r.pass,
        reason: r.reason,
        duration: r.duration,
        steps: r.steps,
        simpleJudge: r.simpleJudge,
        agentJudge: r.agentJudge,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
  }
}
