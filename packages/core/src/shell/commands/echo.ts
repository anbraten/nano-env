import { Command, type CommandCTX } from './command';

export class EchoCommand extends Command {
  constructor() {
    super('echo', {
      description: 'Display text',
      usage: '[text]',
      builtin: true,
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    const text = process.argv.slice(1).join(' ');
    this.write(`${text}\n\r`);
    return 0;
  }
}
