import { fs } from '@zenfs/core';
import {
  FileSystemApi,
  type FileSystemTree,
  type FS,
  isDirectoryNode,
  isFileNode,
  isSymlinkNode,
} from './fs';
import { type SandboxProcess, type SpawnOptions } from './types';
import { JSH } from './shell/jsh';
import { Kernel } from './kernel';

export class Sandbox {
  private _fs: FileSystemApi;
  private _volume: FS;
  private _kernel: Kernel;

  private constructor() {
    this._volume = fs;
    this._fs = new FileSystemApi(this._volume);
    this._kernel = new Kernel({ fs: this._volume });
  }

  public get fs(): FileSystemApi {
    return this._fs;
  }

  public get path(): string {
    return this._kernel.initProcess.env.PATH ?? '';
  }

  public get workdir(): string {
    return this._kernel.initProcess.cwd();
  }

  static async boot() {
    const sandbox = new Sandbox();
    return sandbox;
  }

  private debug(...args: any[]) {
    this._kernel.debug('sandbox', ...args);
  }

  private async createFileTree(
    root: string,
    node: FileSystemTree
  ): Promise<void> {
    for await (const [name, value] of Object.entries(node)) {
      const path = `${root}/${name}`;
      if (isFileNode(value)) {
        this.debug('createFileTree:writeFile', path);
        await this.fs.writeFile(path, value.file.contents as string);
      } else if (isSymlinkNode(value)) {
        this.debug('createFileTree:symlink', path, value.file.symlink);
        await this._volume.promises.symlink(value.file.symlink, path);
      } else if (isDirectoryNode(value)) {
        this.debug('createFileTree:mkdir', path);
        await this.fs.mkdir(path);
        await this.createFileTree(path, value.directory);
      } else {
        this.debug('createFileTree:invalid', path, value);
        throw new Error('Invalid node type');
      }
    }
  }

  public async mount(
    tree: FileSystemTree,
    options?: { mountPoint?: string }
  ): Promise<void> {
    const mountPoint = options?.mountPoint || this.workdir;
    await this.createFileTree(mountPoint, tree);
  }

  public on(event: string, listener: (code: number) => void): void {
    throw new Error('Not implemented');
  }

  public async spawn(
    command: string,
    args: string[],
    _options?: SpawnOptions
  ): Promise<SandboxProcess> {
    let exitResolve: (code: number) => void, exitReject: (error: Error) => void;

    const exitPromise = new Promise<number>((resolve, reject) => {
      exitResolve = resolve;
      exitReject = reject;
    });

    const { writable: stdinIn, readable: stdinOut } = new TransformStream<
      string,
      string
    >();
    const { writable: stdoutIn, readable: stdoutOut } = new TransformStream<
      string,
      string
    >();

    if (command === 'jsh') {
      const process = this._kernel.fork(this._kernel.initProcess, {
        argv0: command,
        argv: args,
        stdin: stdinOut,
        stdout: stdoutIn,
        stderr: stdoutIn,
        exit: (code) => {
          console.log('exit bye', code);
          exitResolve(code ?? 0);
        },
      });

      process.chdir('/home/project');
      process.env.HOME = '/home';

      await JSH.init({
        process: process,
        kernel: this._kernel,
      });
    } else {
      throw new Error(`Use 'jsh' command to spawn a shell`);
    }

    return {
      exit: exitPromise,
      input: stdinIn,
      output: stdoutOut,
      kill: () => {
        throw new Error('Not implemented');
      },
      resize: () => {
        throw new Error('Not implemented');
      },
    };
  }

  public async export(
    path: string,
    options?: {
      format?: 'json' | 'binary' | 'zip';
      includes?: string[];
      excludes?: string[];
    }
  ): Promise<Uint8Array | FileSystemTree> {
    if (!options?.format || options.format === 'json') {
      return await this.getFolderTree(path);
    }

    throw new Error('Only JSON format is supported');
  }

  private async getFolderTree(path: string): Promise<FileSystemTree> {
    const tree = await this.fs.readdir(path, { withFileTypes: true });

    const result: FileSystemTree = {};

    for (const entry of tree) {
      if (entry.isDirectory()) {
        result[entry.name] = {
          directory: await this.getFolderTree(`${path}/${entry.name}`),
        };
      } else if (entry.isFile()) {
        result[entry.name] = {
          file: {
            contents: await this.fs.readFile(`${path}/${entry.name}`, 'utf8'),
          },
        };
      }
      // TODO: check for symlinks
      // } else if (entry.isSymbolicLink()) {
      //   result[entry.name] = {
      //     symlink: await this.fs.readlink(`${path}/${entry.name}`),
      //   };
      // }
    }

    return result;
  }

  public async setPreviewScript(
    _scriptSrc: string,
    _options?: { type?: string }
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  public teardown(): void {
    throw new Error('Not implemented');
  }
}
