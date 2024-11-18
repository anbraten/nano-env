import { Command, type CommandCTX } from './command';

export class EnvCommand extends Command {
  constructor() {
    super('env', {
      description: 'List environment variables',
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    Object.entries(process.env).forEach(([key, value]) => {
      this.write(`${key}=${value}\n\r`);
    });
    return 0;
  }
}
