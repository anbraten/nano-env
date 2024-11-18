import { Command, CommandCTX } from './command';

export class XdgOpenCommand extends Command {
  constructor() {
    super('xdg-open', {
      description: 'Open a file',
      usage: '[filename/link]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const filename = process.argv[1];

    if (filename.startsWith('http') || filename.startsWith('mailto:')) {
      this.write(`Opening url: ${filename}\n\r`);
      window.open(filename, '_blank');
      return 0;
    }

    // // TODO: open local files in the editor
    // write(`xdg-open: ${filename}: Does not support local files yet\n\r`);

    try {
      const absFile = path.resolve(filename);
      await fs.promises.stat(absFile);
      globalThis.openFile(absFile); // TODO: find proper way to call openFile
      return 0;
    } catch (error) {
      this.write(`xdg-open: ${filename}: ${(error as Error).message}\n\r`);
      return 1;
    }
  }
}
