import { Command, type CommandCTX } from './command';

export class RmCommand extends Command {
  constructor() {
    super('rm', {
      description: 'Remove files',
      usage: '[path]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const filePath = path.resolve(process.argv[1]);
    fs.unlinkSync(filePath);
    return 0;
  }
}
