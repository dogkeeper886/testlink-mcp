#!/usr/bin/env node
/**
 * CLI for the test framework.
 *
 * Usage:
 *   npx tsx src/cli.ts run [options]
 *   npx tsx src/cli.ts list [options]
 */

import { Command } from 'commander';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { TestLoader } from './loader.js';
import { TestExecutor } from './executor.js';
import { SimpleJudge, LLMJudge } from './judge/index.js';
import { JsonReporter, ConsoleReporter } from './reporter/index.js';
import { RunConfig, DEFAULT_CONFIG } from './types.js';
import { CONFIG } from './config.js';

const program = new Command();

program
  .name('test-runner')
  .description('Dual-judge test framework with YAML-based test definitions')
  .version('1.0.0');

/**
 * Run command - execute tests
 */
program
  .command('run')
  .description('Run test cases')
  .option('-s, --suite <suite>', 'Run only tests from this suite')
  .option('-i, --id <id>', 'Run only the test with this ID')
  .option('--dry-run', 'Show what would run without executing', false)
  .option('--no-llm', 'Skip LLM judging (simple judge only)')
  .option('--judge-url <url>', 'Ollama URL for LLM judge', CONFIG.llm.defaultUrl)
  .option('--judge-model <model>', 'Model to use for LLM judging', CONFIG.llm.defaultModel)
  .option('-o, --output-dir <dir>', 'Output directory for results')
  .option('-f, --format <format>', 'Output format (console, json)', 'console')
  .action(async (options) => {
    const startTime = new Date();

    // Resolve paths
    const testsDir = path.dirname(new URL(import.meta.url).pathname);
    const projectRoot = path.resolve(testsDir, '..', '..', '..');
    const testcasesDir = path.join(testsDir, '..', 'testcases');
    const dockerDir = path.join(projectRoot, 'docker');

    // Generate output directory with timestamp
    const timestamp = startTime.toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const suiteName = options.suite || 'all';
    const outputDir = options.outputDir || path.join(testsDir, '..', '..', 'results', `${timestamp}_${suiteName}`);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const config: RunConfig = {
      suite: options.suite,
      testId: options.id,
      dryRun: options.dryRun,
      noLlm: !options.llm,
      judgeUrl: options.judgeUrl,
      judgeModel: options.judgeModel,
      outputDir,
      outputFormat: options.format as RunConfig['outputFormat'],
      workingDir: projectRoot,
      dockerComposePath: dockerDir,
    };

    process.stderr.write(`\n[CONFIG] Project root: ${projectRoot}\n`);
    process.stderr.write(`[CONFIG] Docker compose: ${dockerDir}\n`);
    process.stderr.write(`[CONFIG] Testcases: ${testcasesDir}\n`);
    process.stderr.write(`[CONFIG] Output: ${outputDir}\n`);
    process.stderr.write(`[CONFIG] LLM Judge: ${config.noLlm ? 'disabled' : config.judgeUrl}\n`);

    // Load test cases
    const loader = new TestLoader(testcasesDir);
    const allTestCases = await loader.loadAll();

    if (allTestCases.length === 0) {
      process.stderr.write('[ERROR] No test cases found\n');
      process.exit(1);
    }

    // Apply user filters
    let filteredTestCases = allTestCases;

    if (config.suite) {
      filteredTestCases = filteredTestCases.filter((tc) => tc.suite === config.suite);
    }

    if (config.testId) {
      filteredTestCases = filteredTestCases.filter((tc) => tc.id === config.testId);
    }

    if (filteredTestCases.length === 0) {
      process.stderr.write('[ERROR] No matching test cases found\n');
      process.exit(1);
    }

    // Resolve cross-suite dependencies
    const { tests: resolvedTestCases, autoIncluded } = loader.resolveDependencies(
      filteredTestCases,
      allTestCases
    );

    if (autoIncluded.length > 0) {
      process.stderr.write(`[INFO] Auto-included ${autoIncluded.length} dependency test(s): ${autoIncluded.join(', ')}\n`);
    }

    // Sort by dependencies
    const testCases = loader.sortByDependencies(resolvedTestCases);

    process.stderr.write(`[INFO] Found ${testCases.length} test(s) to run\n`);

    // Dry run
    if (config.dryRun) {
      process.stderr.write('\n[DRY RUN] Would execute:\n');
      for (const tc of testCases) {
        process.stderr.write(`  - ${tc.id}: ${tc.name} (${tc.suite})\n`);
        for (const step of tc.steps) {
          process.stderr.write(`      Step: ${step.name}\n`);
        }
      }
      process.exit(0);
    }

    // Execute tests
    const executor = new TestExecutor(config);
    const results = await executor.executeAll(testCases);

    // Run judges
    process.stderr.write('\n[JUDGE] Running simple judge...\n');
    const simpleJudge = new SimpleJudge();
    const simpleJudgments = simpleJudge.judgeAll(results);

    let llmJudgments = simpleJudgments.map((j) => ({
      ...j,
      reason: config.noLlm ? 'LLM judge disabled' : j.reason,
    }));

    if (!config.noLlm) {
      process.stderr.write('[JUDGE] Running LLM judge...\n');
      const llmJudge = new LLMJudge(config.judgeUrl, config.judgeModel);

      const available = await llmJudge.isAvailable();
      if (available) {
        llmJudgments = await llmJudge.judgeResults(results);
        await llmJudge.unloadModel();
      } else {
        process.stderr.write('[WARN] LLM judge not available, using simple judge results\n');
      }
    }

    // Generate and output reports
    const jsonReporter = new JsonReporter(outputDir);
    const { summary, reports } = jsonReporter.generateReports(
      results,
      simpleJudgments,
      llmJudgments,
      startTime,
      suiteName
    );

    jsonReporter.writeReports(summary, reports);

    if (config.outputFormat === 'console') {
      const consoleReporter = new ConsoleReporter();
      consoleReporter.report(summary, reports);
    } else if (config.outputFormat === 'json') {
      jsonReporter.outputSummary(summary, reports);
    }

    process.exit(summary.failed > 0 ? 1 : 0);
  });

/**
 * List command - show available tests
 */
program
  .command('list')
  .description('List available test cases')
  .option('-s, --suite <suite>', 'Filter by suite')
  .action(async (options) => {
    const testsDir = path.dirname(new URL(import.meta.url).pathname);
    const testcasesDir = path.join(testsDir, '..', 'testcases');

    const loader = new TestLoader(testcasesDir);
    let testCases = await loader.loadAll();

    if (options.suite) {
      testCases = testCases.filter((tc) => tc.suite === options.suite);
    }

    testCases = loader.sortByDependencies(testCases);
    const groups = loader.groupBySuite(testCases);

    console.log('\nAvailable Test Cases:');
    console.log('='.repeat(60));

    for (const [suite, cases] of groups) {
      console.log(`\n${suite.toUpperCase()} SUITE (${cases.length} tests):`);
      for (const tc of cases) {
        console.log(`  ${tc.id}: ${tc.name}`);
        console.log(`    Priority: ${tc.priority}, Timeout: ${tc.timeout}ms`);
        if (tc.dependencies.length > 0) {
          console.log(`    Depends on: ${tc.dependencies.join(', ')}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${testCases.length} test(s)`);
  });

program.parse();
