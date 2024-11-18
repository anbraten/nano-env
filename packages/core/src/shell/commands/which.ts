import { Command, type CommandCTX } from './command';

export class WhichCommand extends Command {
  constructor() {
    super('which', {
      description: 'Locate a command',
      usage: '[command]',
      builtin: true,
    });
  }

  async exec({ process, commands }: CommandCTX): Promise<number> {
    const command = commands.find((c) => c.name === process.argv[1]);
    if (command) {
      this.write(`${command.name}\n\r`);
      return 0;
    } else {
      this.write(
        `which: no ${process.argv[1]} in ${commands.map((c) => c.name)}\n\r`
      );
      return 1;
    }
  }
}
