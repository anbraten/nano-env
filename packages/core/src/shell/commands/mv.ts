import { Command, type CommandCTX } from './command';

export class MvCommand extends Command {
  constructor() {
    super('mv', {
      description: 'Move files',
      usage: '[source] [destination]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const source = process.argv[1];
    const destination = process.argv[2];

    const sourcePath = path.resolve(source);
    const destinationPath = path.resolve(destination);

    fs.renameSync(sourcePath, destinationPath);
    return 0;
  }
}
