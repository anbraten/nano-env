import { Command, type CommandCTX } from './command';

export class ClearCommand extends Command {
  constructor() {
    super('clear', {
      description: 'Clear the terminal screen',
    });
  }

  async exec({}: CommandCTX): Promise<number> {
    this.write('\x1b[2J\x1b[H');
    return 0;
  }
}
