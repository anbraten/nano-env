import { Command, CommandCTX } from './command';

export class HistoryCommand extends Command {
  constructor() {
    super('history', {
      description: 'Display command history',
    });
  }

  async exec({ process, path, fs }: CommandCTX): Promise<number> {
    try {
      const history = await fs.promises.readFile(
        path.resolve(process.env.HOME || '/', '.jsh_history'),
        'utf-8'
      );
      this.write(history.toString().replace(/\n/g, '\n\r'));
    } catch (error) {}

    return 0;
  }
}
