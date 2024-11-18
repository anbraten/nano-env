import { Command, CommandCTX } from './command';

export class SaveCommand extends Command {
  constructor() {
    super('save', {
      description: 'Save the current state',
    });
  }

  async exec({}: CommandCTX): Promise<number> {
    this.write('$save$');
    return 0;
  }
}
