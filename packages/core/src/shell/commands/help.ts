import { Command, type CommandCTX } from './command';

export class HelpCommand extends Command {
  constructor() {
    super('help', {
      description: 'Display file contents',
      usage: '[filename]',
      builtin: true,
    });
  }

  async exec({ process, commands }: CommandCTX): Promise<number> {
    if (process.argv.length === 2) {
      const cmd = commands.find((c) => c.name === process.argv[1]);
      if (cmd) {
        this.write(`${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ''}\n\r`);
        return 0;
      } else {
        this.write(`Command not found: ${process.argv[0]}\n\r`);
        return 1;
      }
    }

    this.write('Available commands:\n\r');
    commands
      // .filter((c) => !c.alias)
      .forEach((cmd) => {
        this.write(cmd.name);
        if (cmd.usage) {
          this.write(` ${cmd.usage}`);
        }
        if (cmd.description) {
          this.write(` - ${cmd.description}`);
        }
        this.write('\n\r');
      });
    return 0;
  }
}
