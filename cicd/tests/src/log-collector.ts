/**
 * LogCollector - Captures docker compose logs with text markers for precise
 * test boundary extraction.
 *
 * Marker format: ===TEST:{TEST_ID}:{START|END}:{ISO_TIMESTAMP}===
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import {
  createWriteStream,
  WriteStream,
  writeFileSync,
  readFileSync,
  existsSync,
  unlinkSync,
  readdirSync,
  mkdirSync,
} from 'fs';
import path from 'path';
import { CONFIG } from './config.js';

interface TestMarkerState {
  startWritten: boolean;
  endWritten: boolean;
}

export class LogCollector {
  private process: ChildProcess | null = null;
  private sessionFile: string;
  private logFileStream: WriteStream | null = null;
  private dockerComposeDir: string;
  private isRunning: boolean = false;
  private testMarkers: Map<string, TestMarkerState> = new Map();
  private writeQueue: Promise<void> = Promise.resolve();
  private lineBuffer: string = '';
  private outputDir: string;

  constructor(dockerComposeDir: string, outputDir: string) {
    this.dockerComposeDir = dockerComposeDir;
    this.outputDir = outputDir;
    this.sessionFile = `/tmp/${CONFIG.sessionPrefix}-${Date.now()}.log`;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.cleanupOldSessions();

    return new Promise((resolve, reject) => {
      this.logFileStream = createWriteStream(this.sessionFile, { flags: 'a' });
      this.logFileStream.write(
        `===SESSION:START:${new Date().toISOString()}===\n`
      );

      this.process = spawn(
        'docker',
        ['compose', 'logs', '--follow', '--timestamps'],
        {
          cwd: this.dockerComposeDir,
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );

      this.isRunning = true;

      this.process.stdout?.on('data', (data: Buffer) => {
        this.processLogData(data, false);
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        this.processLogData(data, true);
      });

      this.process.on('error', (err) => {
        this.isRunning = false;
        reject(err);
      });

      this.process.on('close', () => {
        this.isRunning = false;
      });

      setTimeout(() => {
        if (this.isRunning) {
          resolve();
        } else {
          reject(new Error('Log collector failed to start'));
        }
      }, 500);
    });
  }

  async stop(): Promise<void> {
    if (!this.process || !this.isRunning) {
      return;
    }

    if (this.lineBuffer) {
      this.queueWrite(this.lineBuffer + '\n');
      this.lineBuffer = '';
    }

    return new Promise((resolve) => {
      let resolved = false;
      const doResolve = () => {
        if (!resolved) {
          resolved = true;
          this.isRunning = false;

          if (this.logFileStream && !this.logFileStream.destroyed) {
            this.logFileStream.write(
              `===SESSION:END:${new Date().toISOString()}===\n`
            );
            this.logFileStream.end();
          }

          resolve();
        }
      };

      this.process!.on('close', doResolve);
      this.process!.kill('SIGTERM');

      setTimeout(() => {
        if (this.isRunning && this.process) {
          this.process.kill('SIGKILL');
        }
        doResolve();
      }, 5000);
    });
  }

  markTestStart(testId: string): void {
    const testLogPath = this.getTestLogPath(testId);
    if (existsSync(testLogPath)) {
      try {
        unlinkSync(testLogPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    const timestamp = new Date().toISOString();
    this.testMarkers.set(testId, { startWritten: true, endWritten: false });
    this.queueWrite(`===TEST:${testId}:START:${timestamp}===\n`);
  }

  markTestEnd(testId: string): void {
    const timestamp = new Date().toISOString();
    const state = this.testMarkers.get(testId);
    if (state) {
      state.endWritten = true;
    }
    this.queueWrite(`===TEST:${testId}:END:${timestamp}===\n`);
  }

  extractTestLogs(testId: string): string {
    const outputPath = this.getTestLogPath(testId);

    const dir = path.dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.syncFlush();

    const markerState = this.testMarkers.get(testId);
    if (!markerState?.startWritten) {
      writeFileSync(outputPath, '');
      return outputPath;
    }

    try {
      const escapedTestId = this.escapeRegex(testId);
      let sedCmd: string;

      if (markerState.endWritten) {
        sedCmd = `sed -n '/===TEST:${escapedTestId}:START:/,/===TEST:${escapedTestId}:END:/{/===TEST:/d;p}' "${this.sessionFile}"`;
      } else {
        sedCmd = `sed -n '/===TEST:${escapedTestId}:START:/,${'$'}{/===TEST:/d;p}' "${this.sessionFile}"`;
      }

      const result = execSync(sedCmd, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      const cleaned = this.stripAnsi(result);
      writeFileSync(outputPath, cleaned);
    } catch {
      writeFileSync(outputPath, '');
    }

    return outputPath;
  }

  getLogsForTest(testId: string): string {
    const logPath = this.extractTestLogs(testId);
    try {
      return readFileSync(logPath, 'utf-8');
    } catch {
      return '';
    }
  }

  getAllLogs(): string {
    this.syncFlush();
    try {
      return readFileSync(this.sessionFile, 'utf-8');
    } catch {
      return '';
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getSessionFilePath(): string {
    return this.sessionFile;
  }

  copySessionToOutput(): string {
    const outputPath = path.join(this.outputDir, 'session.log');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
    try {
      const content = readFileSync(this.sessionFile, 'utf-8');
      writeFileSync(outputPath, content);
    } catch {
      writeFileSync(outputPath, '');
    }
    return outputPath;
  }

  private getTestLogPath(testId: string): string {
    return path.join(this.outputDir, `${testId}.log`);
  }

  private processLogData(data: Buffer, isStderr: boolean): void {
    const text = this.lineBuffer + data.toString();
    const lines = text.split('\n');

    this.lineBuffer = lines.pop() || '';

    if (lines.length > 0) {
      const prefix = isStderr ? '[stderr] ' : '';
      const formatted = lines.map((l) => prefix + l).join('\n') + '\n';
      this.queueWrite(formatted);
    }
  }

  private queueWrite(data: string): void {
    this.writeQueue = this.writeQueue.then(() => {
      return new Promise<void>((resolve) => {
        if (this.logFileStream && !this.logFileStream.destroyed) {
          this.logFileStream.write(data, () => resolve());
        } else {
          resolve();
        }
      });
    });
  }

  private syncFlush(): void {
    if (this.logFileStream && !this.logFileStream.destroyed) {
      const fd = (this.logFileStream as unknown as { fd?: number }).fd;
      if (typeof fd === 'number') {
        try {
          const { fsyncSync } = require('fs');
          fsyncSync(fd);
        } catch {
          // Ignore fsync errors
        }
      }
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private cleanupOldSessions(): void {
    try {
      const files = readdirSync('/tmp').filter((f) =>
        f.startsWith(CONFIG.sessionPrefix)
      );
      const now = Date.now();
      for (const file of files) {
        const match = file.match(new RegExp(`${CONFIG.sessionPrefix}-(\\d+)\\.log`));
        if (match) {
          const timestamp = parseInt(match[1]);
          if (now - timestamp > CONFIG.logs.cleanupAge) {
            try {
              unlinkSync(`/tmp/${file}`);
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
