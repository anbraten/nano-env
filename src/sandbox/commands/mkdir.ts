import { Command, CommandCTX } from './command';

export class MkdirCommand extends Command {
  constructor() {
    super('mkdir', {
      description: 'Create a directory',
      usage: '[path]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const _path = process.argv[1];
    const dirPath = path.resolve(_path);

    try {
      fs.mkdirSync(dirPath);
      return 0;
    } catch (error) {
      this.write(
        `mkdir: cannot create directory '${path}': ${
          (error as Error).message
        }\n\r`
      );
      return 1;
    }
  }
}
