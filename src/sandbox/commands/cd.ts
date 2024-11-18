import { Command, CommandCTX } from './command';

export class CdCommand extends Command {
  constructor() {
    super('cd', {
      description: 'Change directory',
      usage: '[path]',
      builtin: true,
    });
  }

  async exec({ fs, process, path }: CommandCTX): Promise<number> {
    const newPath = path.resolve(process.argv[1] ?? process.env.HOME ?? '/');
    if (fs.existsSync(newPath)) {
      process.chdir(newPath);
      return 0;
    } else {
      this.write(`cd: no such file or directory: ${newPath}\n\r`);
      return 1;
    }
  }
}
