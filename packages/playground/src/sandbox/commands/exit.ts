import { Command, CommandCTX } from './command';

export class ExitCommand extends Command {
  constructor() {
    super('exit', {
      description: 'Exit the shell',
      builtin: true,
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    const exitCode = process.argv[1] ? parseInt(process.argv[1]) : 0;

    process.exit(exitCode);

    return 2;
  }
}
