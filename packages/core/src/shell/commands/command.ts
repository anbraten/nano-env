import { type FS } from '../../fs';
import { Kernel } from '../../kernel';
import { Path } from '../../path';
import { type Process } from '../../process';

export type CommandCTX = {
  fs: FS;
  process: Process;
  path: Path;
};

export abstract class Command {
  readonly name: string;
  readonly description?: string;
  readonly usage?: string;
  readonly builtin: boolean;

  private process?: Process;

  constructor(
    name: string,
    o?: {
      description?: string;
      usage?: string;
      builtin?: boolean;
    }
  ) {
    this.name = name;
    this.description = o?.description;
    this.usage = o?.usage;
    this.builtin = o?.builtin ?? false;
  }

  inject(ctx: { kernel: Kernel; process: Process }): void {
    this.process = ctx.process;
  }

  protected write(data: string) {
    // TODO: Is this smart to use process.stdout.write directly?
    const writer = this.process?.stdout?.getWriter();
    writer?.write(data);
    writer?.releaseLock();
  }

  protected writeln(data: string) {
    this.write(data + '\n');
  }

  protected spawnWasi() {
    // const u = l.spawn('node', ['--no-warnings', '--', ...n], {
    //     cwd: process.cwd(),
    //     cols: process.stdout.columns,
    //     rows: process.stdout.rows,
    //     env: { ...process.env, ...s },
    //     stdio: { stdout: !0, stderr: !0 },
    //     wasiOptions: t,
    //   }),
    //   { port: f } = u;
    // u.setRawMode(!0);
    // f.start();

    throw new Error('Not implemented');
  }

  abstract exec(ctx: CommandCTX): Promise<number> | number;
}
