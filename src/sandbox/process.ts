import { FS } from './fs';

export type Process = {
  argv: string[];
  argv0: string;
  chdir(directory: string): void;
  cwd(): string;
  env: Record<string, string | undefined>;
  exitCode?: number;
  exit(code?: number): void;
  readonly pid: number;
  ppid: number;
  title: string;
  stdin?: ReadableStream<string>;
  stdout?: WritableStream<string>;
  stderr?: WritableStream<string>;
};

export function setupGlobalProcess(process: Process) {
  const originalProcess = globalThis.process;
  globalThis.process = process;

  return () => {
    globalThis.process = originalProcess;
  };
}

export function mockedChildProcess() {
  return {
    exec() {
      throw new Error('child_process.exec is not implemented');
    },
    execFile() {
      throw new Error('child_process.execFile is not implemented');
    },
    fork() {
      throw new Error('child_process.fork is not implemented');
    },
    spawn() {
      const worker = new Worker(
        new URL('./worker?worker&url', import.meta.url)
      );

      return worker;
      throw new Error('child_process.spawn is not implemented');
    },
    execFileSync() {
      throw new Error('child_process.execFileSync is not implemented');
    },
    execSync() {
      throw new Error('child_process.execSync is not implemented');
    },
    spawnSync() {
      throw new Error('child_process.spawnSync is not implemented');
    },
  };
}

export function setupSandbox({ fs }: { fs: FS }) {
  const process: Process = {};
  const undoProcess = setupGlobalProcess(process);

  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id: string) {
    if (id === 'process' || id === 'node:process') {
      return globalThis.process;
    }
    if (id === 'module' || id === 'node:module') {
      return Module;
    }
    if (id === 'child_process' || id === 'node:child_process') {
      return mockedChildProcess();
    }
    if (id === 'fs' || id === 'node:fs') {
      return fs;
    }
    if (id === 'fs/promises' || id === 'node:fs/promises') {
      return fs.promises;
    }
    if (id === 'path' || id === 'node:path') {
      throw new Error('path is not implemented');
    }

    return originalRequire.apply(this, arguments);
  };

  return () => {
    undoProcess();
    Module.prototype.require = originalRequire;
  };
}
