import { RPC } from './rpc';

export class FS {
  private _fs: Map<string, string>;

  constructor(fs: [string, string][]) {
    this._fs = new Map(fs);
  }

  async readFile(path: string): Promise<string> {
    const file = this._fs.get(path);
    if (file === undefined) {
      throw new Error(`File not found: ${path}`);
    }
    return file;
  }

  async writeFile(path: string, contents: string): Promise<void> {
    this._fs.set(path, contents);
  }
}

export class RemoteFSHost {
  private _fs: FS;
  private _rpc: RPC;

  constructor(port: MessagePort, fs: FS) {
    this._fs = fs;
    this._rpc = new RPC(port, this.handleRequest.bind(this));
  }

  public unload() {
    this._rpc.unload();
  }

  private async handleRequest(event: MessageEvent) {
    if (event.data.type === 'read-file') {
      const { path } = event.data;
      try {
        const contents = await this._fs.readFile(path);
        return { contents };
      } catch (error) {
        return { error };
      }
    }

    if (event.data.type === 'write-file') {
      const { path, contents } = event.data;
      try {
        await this._fs.writeFile(path, contents);
        return { success: true };
      } catch (error) {
        return { error };
      }
    }
  }
}

export class RemoteFSClient {
  private _rpc: RPC;

  constructor(port: MessagePort) {
    this._rpc = new RPC(port);
  }

  public unload() {
    this._rpc.unload();
  }

  async readFile(path: string): Promise<string> {
    const response = await this._rpc.request<
      { contents: string },
      { path: string }
    >('read-file', { path });
    return response.contents;
  }

  async writeFile(path: string, contents: string): Promise<void> {
    const response = await this._rpc.request<
      { success: boolean },
      { path: string; contents: string }
    >('write-file', {
      path,
      contents,
    });
    if (!response.success) {
      throw new Error('Failed to write file');
    }
  }
}
