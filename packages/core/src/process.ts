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
