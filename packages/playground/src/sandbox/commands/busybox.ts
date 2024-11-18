// import { runBusybox } from '../../test/busybox';
import { Command, CommandCTX } from './command';

export class BusyboxCommand extends Command {
  constructor() {
    super('busybox', {
      description: 'Busybox shell',
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    // runBusybox(process.argv.slice(1).join(' '), { write: this.write }, (m) => {
    //   console.log('busybox', m);
    //   m.FS.unmount('/');
    //   m.FS.mount(m.FS.filesystems.MEMFS, {}, '/');
    // });
    return 0;
  }
}
