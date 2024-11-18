import { Command, type CommandCTX } from './command';
import { Wasmer, init as initWasmer } from '@wasmer/sdk';

export class WasmCommand extends Command {
  constructor() {
    super('wasm', {
      description: 'Run a WebAssembly module',
      usage: '<module>',
    });
  }

  async exec({ process }: CommandCTX): Promise<number> {
    await initWasmer();
    const pkg = await Wasmer.fromRegistry(process.argv[1]);
    if (!pkg.entrypoint) {
      throw new Error('Package not found');
    }

    const instance = await pkg.entrypoint.run({
      args: process.argv.slice(1),
      cwd: process.cwd(),
      env: process.env,
    });

    if (instance.stdin) {
      process.stdin?.pipeTo(instance.stdin);
    }
    if (instance.stdout) {
      instance.stdout?.pipeTo(process.stdout);
    }

    const { code } = await instance.wait();

    // exitResolve!(code);

    return code;
  }
}
