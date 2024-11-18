import { Command, type CommandCTX } from './command';

export class PwdCommand extends Command {
  constructor() {
    super('pwd', {
      description: 'Print working directory',
      builtin: true,
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    this.write(`${process.cwd()}\n\r`);
    return 0;
  }
}
