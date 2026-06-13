/**
 * LLM Judge - Semantic analysis of test results via the Anthropic SDK.
 *
 * Uses a language model to evaluate test execution logs against criteria.
 * Catches silent failures that exit code checking misses.
 *
 * Reaches its model through the standard Anthropic client, so any
 * Anthropic-compatible endpoint (hosted or a local one) is a matter of
 * configuration (LLM_JUDGE_URL / LLM_JUDGE_MODEL / ANTHROPIC_API_KEY), not a
 * code change. Judges one test at a time with a structured JSON prompt.
 */

import Anthropic from '@anthropic-ai/sdk';
import { TestResult, Judgment } from '../types.js';
import { CONFIG } from '../config.js';

export class LLMJudge {
  private client: Anthropic;
  private model: string;

  constructor(
    baseUrl: string | undefined = CONFIG.llm.baseUrl,
    model: string = CONFIG.llm.model,
    apiKey: string = CONFIG.llm.apiKey
  ) {
    this.client = new Anthropic({
      apiKey,
      baseURL: baseUrl,
      timeout: CONFIG.llm.timeout,
    });
    this.model = model;
  }

  /**
   * Probe the configured endpoint. Returns false on any connection/auth error
   * so the caller can skip cleanly and fall back to the simple judge.
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch (error) {
      process.stderr.write(`  [LLM] Endpoint not reachable: ${error}\n`);
      return false;
    }
  }

  /**
   * Truncate a string to a maximum length.
   */
  private truncate(text: string, limit: number): string {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '... (truncated)';
  }

  /**
   * Build structured JSON prompt for LLM evaluation of a single test.
   */
  private buildPrompt(result: TestResult): string {
    const r = result;

    const steps = r.steps.map((step, j) => {
      const stepDef = r.testCase.steps[j];
      return {
        name: step.name,
        command: step.command.trim(),
        exit_code: step.exitCode,
        duration_ms: step.duration,
        timeout_ms: stepDef?.timeout || r.testCase.timeout,
        stdout: this.truncate(step.stdout, CONFIG.llm.stdoutLimit),
        stderr: this.truncate(step.stderr, CONFIG.llm.stderrLimit),
      };
    });

    const promptData = {
      role: `You are a test result evaluator for ${CONFIG.projectName}. Analyze the test execution data and determine if the test passed or failed.`,
      rules: [
        'Check step stdout for error responses (e.g. {"error":"..."} means FAIL)',
        'Errors with exit code 0 are still FAIL',
        'For AI-generated text, accept reasonable variations',
        'Long durations within timeout are acceptable',
        'Focus on semantic correctness, not formatting differences',
      ],
      test: {
        id: r.testCase.id,
        name: r.testCase.name,
        suite: r.testCase.suite,
        goal: r.testCase.goal || r.testCase.name,
        criteria: r.testCase.criteria,
        timeout_ms: r.testCase.timeout,
        duration_ms: r.totalDuration,
      },
      steps,
      container_logs: this.truncate(r.logs, CONFIG.llm.logsLimit),
      respond: {
        format: 'Respond with a single JSON object and nothing else',
        fields: {
          testId: r.testCase.id,
          pass: 'true if test meets all criteria, false otherwise',
          reason: 'Brief explanation of your verdict',
          evidence: 'Required if pass is false — the exact stdout content or log line that caused failure',
        },
      },
    };

    const prompt = JSON.stringify(promptData, null, 2);

    // Log prompt stats
    const totalStdout = r.steps.reduce((sum, s) => sum + s.stdout.length, 0);
    const totalStderr = r.steps.reduce((sum, s) => sum + s.stderr.length, 0);
    process.stderr.write(`  [LLM] Prompt for ${r.testCase.id}: logs ${r.logs.length} chars, stdout ${totalStdout} chars, stderr ${totalStderr} chars\n`);
    process.stderr.write(`  [LLM] Prompt size: ${prompt.length} chars\n`);

    return prompt;
  }

  /**
   * Extract the first JSON object from a model response, tolerating prose or
   * markdown fences around it.
   */
  private extractJson(text: string): string | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return null;
    return text.substring(start, end + 1);
  }

  /**
   * Judge a single test result.
   */
  private async judgeOne(result: TestResult): Promise<Judgment> {
    const prompt = this.buildPrompt(result);
    const testId = result.testCase.id;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    process.stderr.write(`  [LLM] Tokens for ${testId}: prompt=${response.usage.input_tokens}, response=${response.usage.output_tokens}\n`);

    // Handle empty response
    if (!responseText) {
      process.stderr.write(`  [LLM] WARNING: Empty response for ${testId}\n`);
      return {
        testId,
        pass: false,
        reason: 'LLM returned empty response',
      };
    }

    process.stderr.write(`  [LLM] Raw response for ${testId} (${responseText.length} chars): ${responseText.substring(0, 500)}\n`);

    const json = this.extractJson(responseText);
    if (!json) {
      process.stderr.write(`  [LLM] WARNING: No JSON object in response for ${testId}\n`);
      return {
        testId,
        pass: false,
        reason: `No JSON object in LLM response: ${responseText.substring(0, 200)}`,
      };
    }

    try {
      const judgment = JSON.parse(json) as Judgment;

      // Validate testId matches
      if (judgment.testId !== testId) {
        process.stderr.write(`  [LLM] WARNING: Response testId "${judgment.testId}" doesn't match expected "${testId}"\n`);
        judgment.testId = testId;
      }

      // Coerce string "true"/"false" to boolean (LLMs often return strings)
      if (typeof judgment.pass === 'string') {
        judgment.pass = (judgment.pass as unknown as string).toLowerCase() === 'true';
      }

      // Validate required fields
      if (typeof judgment.pass !== 'boolean') {
        process.stderr.write(`  [LLM] WARNING: Response missing "pass" field for ${testId}\n`);
        return {
          testId,
          pass: false,
          reason: `LLM response missing "pass" field: ${responseText.substring(0, 200)}`,
        };
      }

      if (!judgment.reason) {
        judgment.reason = judgment.pass ? 'Passed (no reason provided)' : 'Failed (no reason provided)';
      }

      return judgment;
    } catch {
      process.stderr.write(`  [LLM] WARNING: Failed to parse JSON for ${testId}\n`);
      process.stderr.write(`  [LLM] Full response: ${responseText}\n`);
      return {
        testId,
        pass: false,
        reason: `Failed to parse LLM response: ${responseText.substring(0, 200)}`,
      };
    }
  }

  /**
   * Judge all test results, one at a time.
   */
  async judgeResults(results: TestResult[]): Promise<Judgment[]> {
    const allJudgments: Judgment[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      process.stderr.write(
        `  [LLM] Judging ${i + 1}/${results.length}: ${result.testCase.id}...\n`
      );

      try {
        const judgment = await this.judgeOne(result);
        allJudgments.push(judgment);
        process.stderr.write(`  [LLM] ${result.testCase.id}: ${judgment.pass ? 'PASS' : 'FAIL'} — ${judgment.reason}\n`);
      } catch (error) {
        process.stderr.write(`  [LLM] Failed to judge ${result.testCase.id}: ${error}\n`);
        allJudgments.push({
          testId: result.testCase.id,
          pass: false,
          reason: 'LLM judgment failed: ' + String(error),
        });
      }
    }

    return allJudgments;
  }
}
