export type SpawnOptions = {
  cwd?: string;
  env?: Record<string, string | number | boolean>;
  output?: boolean;
  terminal?: { cols: number; rows: number };
};

export type SandboxProcess = {
  exit: Promise<number>;
  input: WritableStream<string>;
  output: ReadableStream<string>;
  kill: () => void;
  resize: (dimensions: { cols: number; rows: number }) => void;
};

export interface PreviewScriptOptions {
  type?: 'module' | 'importmap';
  defer?: boolean;
  async?: boolean;
}

export class ErrorWithCode extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
