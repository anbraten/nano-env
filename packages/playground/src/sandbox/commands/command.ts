import { FS } from '../fs';
import { Kernel } from '../kernel';
import { Path } from '../path';
import { Process } from '../process';

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
  protected kernel?: Kernel;

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
    this.kernel = ctx.kernel;
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

// type CommandOption<T> = {
//   short: string;
//   option?: string;
//   description?: string;
//   apply: (ctx: T) => T;
// };

// export abstract class CoreUtilsCommand extends Command {
//   private options: CommandOption<this>[] = [];

//   constructor(name: string, options: CommandOption<this>[] = []) {
//     super(name, {
//       description: options.map((o) => o.description).join('\n'),
//       usage: options.map((o) => o.short).join(''),
//     });
//     this.options = options;
//   }

//   private getCommandOptions<T>(args: string[], context: T): [T, string[]] {
//     const shortOptions = args
//       .filter((arg) => arg.startsWith('-'))
//       .flatMap((a) => a.slice(1).split(''));
//     if (shortOptions.length > 0) {
//       shortOptions.forEach((opt) => {
//         const option = this.options.find((o) => o.short === opt);
//         if (option) {
//           context = option.apply(context);
//         } else {
//           throw new Error(`Unknown option: -${opt}`);
//         }
//       });
//     }

//     const longOptions = args.filter((arg) => arg.startsWith('--'));
//     if (longOptions.length > 0) {
//       longOptions.forEach((opt) => {
//         const option = this.options.find((o) => o.option === opt.slice(2));
//         if (option) {
//           context = option.apply(context);
//         } else {
//           throw new Error(`Unknown option: ${opt}`);
//         }
//       });
//     }

//     return [context, args.filter((arg) => !arg.startsWith('-'))];
//   }

//   async exec(ctx: CommandCTX) {
//     return 0;
//   }

//   protected abstract execCommand(
//     ctx: CommandCTX,
//     args: string[],
//     context: this
//   ): Promise<number> | number;
// }
