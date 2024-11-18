import { Command, type CommandCTX } from './command';
import { Buffer } from 'buffer/';

export class WgetCommand extends Command {
  constructor() {
    super('wget', {
      description: 'Download files from the web',
      usage: '[url]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const url = process.argv[1];
    const filename = url.split('/').pop();
    if (!filename) {
      this.write('wget: invalid URL\n\r');
      return 1;
    }

    const filePath = path.resolve(filename);

    try {
      const response = await fetch(url);
      const content = await response.arrayBuffer();
      await fs.promises.writeFile(filePath, Buffer.from(content));
      return 0;
    } catch (error) {
      this.write(`wget: ${url}: ${(error as Error).message}\n\r`);
      return 1;
    }
  }
}
