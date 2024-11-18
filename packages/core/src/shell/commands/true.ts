import { Command, type CommandCTX } from './command';

export class TrueCommand extends Command {
  constructor() {
    super('true', {
      description: 'Be successful',
      builtin: true,
    });
  }

  async exec({}: CommandCTX): Promise<number> {
    return 0;
  }
}
