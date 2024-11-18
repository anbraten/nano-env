import type { Dirent } from '@zenfs/core';
import { type FS } from '../fs';
import { Path } from '../path';
import { type Process } from '../process';

export class Autocomplete {
  private fs: FS;
  private process: Process;

  private constructor(fs: FS, process: Process) {
    this.fs = fs;
    this.process = process;
  }

  static init(fs: FS, process: Process) {
    return new Autocomplete(fs, process);
  }

  private get cwd() {
    return this.process.cwd();
  }

  private get path() {
    return Path.init(this.cwd);
  }

  public getPathSuggestions(input: string): string[] {
    // If input is empty, return all files in current directory
    if (!input) {
      return this.fs.readdirSync(this.cwd).map((file) => file.toString());
    }

    // Handle absolute paths
    const isAbsolute = input.startsWith('/');
    const inputPath = this.path.resolve(input);

    // Check if the input path exists and is a directory
    let isDir = false;
    try {
      const stats = this.fs.statSync(inputPath);
      isDir = stats.isDirectory();
    } catch {
      // Path doesn't exist, that's fine
    }

    // If it's a directory and ends with '/', list its contents
    if (isDir && input.endsWith('/')) {
      const dirContents = this.fs.readdirSync(inputPath, {
        withFileTypes: true,
      }) as Dirent[];
      return dirContents
        .sort()
        .map((file) => `${input}${file.name}${file.isDirectory() ? '/' : ''}`);
    }

    // If it's a directory without a trailing slash, suggest the directory with a slash
    if (isDir && !input.endsWith('/')) {
      return [`${input}/`];
    }

    // Handle file / folder suggestions
    const dirPath = input.includes('/')
      ? this.path.resolve(input.substring(0, input.lastIndexOf('/')) || '/')
      : this.cwd;

    const searchTerm = input.split('/').pop() || '';
    const prefix = input.substring(0, input.length - searchTerm.length);

    try {
      const files = this.fs.readdirSync(dirPath, {
        withFileTypes: true,
      }) as Dirent[];
      return files
        .filter((file) => file.name.toString().startsWith(searchTerm))
        .map((file) => {
          if (isAbsolute) {
            return (
              this.path.resolve(dirPath, file.name.toString()) +
              (file.isDirectory() ? '/' : '')
            );
          } else {
            return (
              prefix + file.name.toString() + (file.isDirectory() ? '/' : '')
            );
          }
        })
        .sort();
    } catch {
      return [];
    }
  }
}
