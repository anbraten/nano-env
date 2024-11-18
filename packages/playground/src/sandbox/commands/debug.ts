import { Command, CommandCTX } from './command';

export class DebugCommand extends Command {
  constructor() {
    super('debug', {
      description: 'Debug the current state',
    });
  }

  async exec({ fs, process }: CommandCTX): Promise<number> {
    // write('$debug$');
    fs.writeFileSync(`${process.env.HOME}/package.json`, 'debug');
    return 0;
  }
}
