import { Command, type CommandCTX } from './command';

export class TouchCommand extends Command {
  constructor() {
    super('touch', {
      description: 'Create an empty file',
      usage: '[filename]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const filePath = path.resolve(process.argv[1]);
    fs.writeFileSync(filePath, '');
    return 0;
  }
}
