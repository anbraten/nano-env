import { Command, type CommandCTX } from './command';

export class FalseCommand extends Command {
  constructor() {
    super('false', {
      description: 'Sometimes we fail',
      builtin: true,
    });
  }

  async exec({}: CommandCTX): Promise<number> {
    return 1;
  }
}
