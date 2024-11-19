import { createColors } from 'colorette';
import { Command, type CommandCTX } from './command';
import { getCommandOptions } from './utils';

const colors = createColors({ useColor: true });

export class LsCommand extends Command {
  constructor() {
    super('ls', {
      description: 'List directory contents',
      usage: '[path] [-l] [-a]',
    });
  }

  async exec({ process, fs }: CommandCTX): Promise<number> {
    const [options, args] = getCommandOptions(
      process.argv.slice(1),
      {
        showLongFormat: false,
        showHidden: false,
      },
      {
        short: 'l',
        apply: (ctx) => {
          ctx.showLongFormat = true;
          return ctx;
        },
      },
      {
        short: 'a',
        option: 'all',
        apply: (ctx) => {
          ctx.showHidden = true;
          return ctx;
        },
      }
    );

    const path = args?.[0] || process.cwd();

    try {
      const files = await fs.promises.readdir(path, { withFileTypes: true });

      function permToString(perm: number): string {
        return [
          perm & 0o4 ? 'r' : '-',
          perm & 0o2 ? 'w' : '-',
          perm & 0o1 ? 'x' : '-',
        ].join('');
      }

      const fileInfo = files.map((file) => {
        // const fileType = (file.mode & 0o170000) === 0o040000 ? 'd' : '-';
        const ownerPerm = (file.mode >> 6) & 0o7;
        const groupPerm = (file.mode >> 3) & 0o7;
        const otherPerm = file.mode & 0o7;

        return {
          name: file.name,
          type: file.isDirectory() ? 'd' : '-',
          permissions: `${permToString(ownerPerm)}${permToString(
            groupPerm
          )}${permToString(otherPerm)}`,
          owner: 'user', // Placeholder, actual owner not available in memfs
          group: 'group', // Placeholder, actual group not available in memfs
          size: 0, // Placeholder, actual file size not available in memfs
          modifiedDate: new Date(), // Placeholder, actual modified date not available in memfs
        };
      });

      fileInfo.forEach((file) => {
        if (options.showHidden || !file.name.startsWith('.')) {
          const modified = new Date()
            .toLocaleString('default', {
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            .replace(',', '');

          let line = [
            file.type === 'd' ? colors.cyanBright(file.type) : file.type,
            file.permissions,
            file.owner,
            file.group,
            file.size,
            modified,
            file.name,
          ].join(' ');
          if (!options.showLongFormat) {
            line = file.name;
          }
          this.write(`${line}\n\r`);
        }
      });
      return 0;
    } catch (error) {
      this.write(
        `ls: cannot access '${path}': ${(error as Error).message}\n\r`
      );
      return 1;
    }
  }
}
