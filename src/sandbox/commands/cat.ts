import { Command, CommandCTX } from './command';

export class CatCommand extends Command {
  constructor() {
    super('cat', {
      description: 'Display file contents',
      usage: '[filename]',
    });
  }

  async exec({ fs, process, path }: CommandCTX): Promise<number> {
    const filename = process.argv[1];
    const filePath = path.resolve(filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    this.write(content.toString().replace(/\n/g, '\n\r'));
    if (!content.toString().endsWith('\n')) {
      this.write('\n\r');
    }
    return 0;
  }
}
