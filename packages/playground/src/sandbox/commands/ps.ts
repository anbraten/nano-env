import { Command, CommandCTX } from './command';

export class Psommand extends Command {
  constructor() {
    super('ps', {
      description: 'List all processes',
    });
  }

  async exec({ fs }: CommandCTX): Promise<number> {
    this.write('PID\tTTY\tTIME\tCMD\n\r');
    this.kernel?.processTable.forEach((process) => {
      this.write(
        `${process.pid}\t${process.tty}\t${process.time}\t${process.argv.join(
          ' '
        )}\n\r`
      );
    });
    return 0;
  }
}
