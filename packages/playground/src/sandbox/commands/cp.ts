import { Command, CommandCTX } from './command';

export class CpCommand extends Command {
  constructor() {
    super('cp', {
      description: 'Copy files',
      usage: '[source] [destination]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const source = process.argv[1];
    const destination = process.argv[2];

    const sourcePath = path.resolve(source);
    const destinationPath = path.resolve(destination);

    fs.copyFileSync(sourcePath, destinationPath);
    return 0;
  }
}
