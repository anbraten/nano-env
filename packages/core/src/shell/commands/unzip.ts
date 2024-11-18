import { Command, type CommandCTX } from './command';
import { unzip, type Unzipped } from 'fflate';
import { Buffer } from 'buffer/';

export class UnzipCommand extends Command {
  constructor() {
    super('unzip', {
      description: 'Extract compressed files in a ZIP archive',
      usage: '[zipfile]',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    const zipFilePath = path.resolve(process.argv[1]);

    try {
      const content = await fs.promises.readFile(zipFilePath);
      const compressed = new Uint8Array(Buffer.from(content));
      const zipFile = await new Promise<Unzipped>((resolve, reject) =>
        unzip(compressed, (err, unzipped) => {
          if (err) {
            reject(err);
          } else {
            resolve(unzipped);
          }
        })
      );

      this.write(
        `Unzipping: ${zipFilePath} with ${
          Object.keys(zipFile).length
        } files\n\r`
      );

      for (const [file, content] of Object.entries(zipFile)) {
        if (!file) {
          throw new Error('Invalid file name');
        }

        if (file.endsWith('/')) {
          await fs.promises.mkdir(path.resolve(file), { recursive: true });
          continue;
        }

        const filePath = path.resolve(file);
        await fs.promises.writeFile(filePath, content);
        // this.write(`inflating: ${file}\n\r`);
      }

      this.write('unzip: done\n\r');

      return 0;
    } catch (error) {
      this.write(`unzip: ${zipFilePath}: ${(error as Error).message}\n\r`);
      return 1;
    }
  }
}
