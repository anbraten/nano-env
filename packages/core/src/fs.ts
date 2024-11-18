import { fs } from '@zenfs/core';

// TODO: https://github.com/zen-fs/core/pull/137
export type FS = typeof fs;

export type Watcher = {
  close: () => void;
};

export class FileSystemApi {
  private fs: FS;

  constructor(fs: FS) {
    this.fs = fs;
  }

  public async mkdir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<void> {
    await this.fs.promises.mkdir(path, options);
  }

  public async readdir(
    path: string,
    options: { encoding?: 'utf-8'; withFileTypes: true }
  ): Promise<DirEnt<string>[]>;
  public async readdir(
    path: string,
    options: { encoding?: 'utf-8'; withFileTypes: false }
  ): Promise<string[]>;
  public async readdir(
    path: string,
    options?: { encoding?: BufferEncoding; withFileTypes?: boolean }
  ): Promise<
    Uint8Array[] | string[] | DirEnt<Uint8Array>[] | DirEnt<string>[]
  > {
    return this.fs.promises.readdir(path, options) as any;
  }

  public async readFile(
    path: string,
    encoding?: BufferEncoding | null
  ): Promise<Uint8Array | string> {
    return this.fs.promises.readFile(path, encoding);
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    await this.fs.promises.rename(oldPath, newPath);
  }

  public async rm(
    path: string,
    options?: { force?: boolean; recursive?: boolean }
  ): Promise<void> {
    await this.fs.promises.rm(path, options);
  }

  public async writeFile(
    path: string,
    data: string | Uint8Array,
    options?: { encoding?: null | BufferEncoding } | null
  ): Promise<void> {
    await this.fs.promises.writeFile(path, data, {
      encoding: options?.encoding || undefined,
    });
  }

  public watch(
    path: string,
    options: { recursive?: boolean; encoding?: BufferEncoding },
    listener: (event: 'rename' | 'change', filename: string | Buffer) => void
  ): Watcher {
    return this.fs.watch(
      path,
      { persistent: true },
      listener as (event: string, filename: any) => void
    );
  }
}

export class DirEnt<T = string | Uint8Array> {
  public _name: T;
  private _isFile: boolean;
  private _isDirectory: boolean;

  constructor(dirent: DirEnt<T>) {
    this._name = dirent.name;
    this._isFile = dirent.isFile();
    this._isDirectory = dirent.isDirectory();
  }

  public get name(): T {
    return this._name;
  }

  public isDirectory(): boolean {
    return this._isDirectory;
  }

  public isFile(): boolean {
    return this._isFile;
  }
}

export type FileSystemTree = {
  [name: string]: FileNode | SymlinkNode | DirectoryNode;
};

export type FileNode = {
  file: {
    contents: string | Uint8Array;
  };
};

export type SymlinkNode = {
  file: {
    symlink: string;
  };
};

export type DirectoryNode = {
  directory: FileSystemTree;
};

export function isFileNode(node: any): node is FileNode {
  return (
    typeof node.file !== 'undefined' &&
    typeof node.file.contents !== 'undefined'
  );
}

export function isSymlinkNode(node: any): node is SymlinkNode {
  return (
    typeof node.file !== 'undefined' && typeof node.file.symlink !== 'undefined'
  );
}

export function isDirectoryNode(node: any): node is DirectoryNode {
  return typeof node.directory !== 'undefined';
}
