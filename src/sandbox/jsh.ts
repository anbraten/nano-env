import { Path } from './path';
import ansiEscapes from 'ansi-escapes';
import { createColors } from 'colorette';
import { isPath as isExplicitPath, SyntaxError } from './utils';
import { ErrorWithCode } from './types';
import { Process } from './process';
import { CommandLoader, jshCommands } from './commands';
import { Kernel } from './kernel';
import { Autocomplete } from './autocomplete';

const colors = createColors({ useColor: true });

type JSHOptions = {
  kernel: Kernel;
  process: Process;
};

export class JSH {
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private lastExitCode: number = 0;
  private currentInputBuffer: string = '';
  private aliases: Map<string, string> = new Map();

  private kernel: Kernel;
  private process: Process;

  constructor(options: JSHOptions) {
    this.kernel = options.kernel;
    this.process = options.process;
    this.process.title = 'jsh';

    // Pipe input to terminal
    this.process.stdin?.pipeTo(
      new WritableStream<string>({
        write: this.handleInput.bind(this),
      })
    );

    this.debug('_constructor', 'initialized');

    this.aliases.set('open', 'xdg-open');
    this.aliases.set('python', 'python3');
    this.aliases.set('ll', 'ls -la');

    // Initial prompt
    this.write(this.getPrompt());
  }

  static async init(options: JSHOptions) {
    const jsh = new JSH(options);

    jsh.loadJshrc();

    jsh.loadHistory();

    jsh.loadSession(); // auto-load last session for faster debugging

    return jsh;
  }

  private get path() {
    return new Path(this.process.cwd());
  }

  private get env() {
    return this.process.env;
  }

  private get fs() {
    return this.kernel.fs;
  }

  private debug(...args: any[]) {
    this.kernel.debug('jsh', ...args);
  }

  private async loadJshrc() {
    if (!this.env.HOME) {
      return;
    }

    const file = this.path.join(this.env.HOME, '.jshrc');
    let jshrcFile;
    try {
      jshrcFile = this.fs.statSync(file);
    } catch (t) {
      'ENOENT' === (t as ErrorWithCode).code && this.fs.writeFileSync(file, '');
    }
    if (jshrcFile?.size || 0 > 0) {
      await this.executeFile(file);
    }
  }

  private async loadHistory() {
    if (!this.env.HOME) {
      return;
    }

    const historyFile = this.path.join(this.env.HOME, '.jsh_history');
    try {
      const history = this.fs.readFileSync(historyFile, 'utf8').toString();
      this.commandHistory = history.split('\n');
      this.historyIndex = this.commandHistory.length;
    } catch (t) {
      'ENOENT' === (t as ErrorWithCode).code &&
        this.fs.writeFileSync(historyFile, '');
    }
  }

  private async saveHistory() {
    if (!this.env.HOME) {
      return;
    }

    try {
      const historyFile = this.path.join(this.env.HOME, '.jsh_history');
      this.fs.writeFileSync(
        historyFile,
        this.commandHistory.map((i) => i.trim()).join('\n') + '\n'
      );
    } catch (err) {
      this.write(`jsh: Error saving history: ${(err as Error).message}\n\r`);
    }
  }

  private getPrompt() {
    const c = '❯';
    const path = this.process.cwd().startsWith(this.env.HOME ?? '')
      ? `~/${this.path.relative(this.env.HOME ?? '', this.process.cwd())}`
      : this.process.cwd();

    return `${colors.cyanBright(path)} ${
      this.lastExitCode !== 0 ? colors.redBright(c) : colors.magentaBright(c)
    } `;
  }

  private write(data: string) {
    const writer = this.process.stdout?.getWriter();
    writer?.write(data);
    writer?.releaseLock();
  }

  private async handleInput(data: string) {
    // TODO: forward to command when one is currently running

    switch (data) {
      case '\r': // Enter
        this.handleCommand();
        this.saveHistory();
        break;
      case '\u0003': // Ctrl+C
        this.currentInputBuffer = '';
        this.write(`^C\r\n${this.getPrompt()} `);
        break;
      case '\u007F': // Backspace
        this.handleBackspace();
        break;
      case '\u001b[A': // Up arrow
        this.handleArrowUp();
        break;
      case '\u001b[B': // Down arrow
        this.handleArrowDown();
        break;
      case '\u001b[C': // Right arrow
        this.write(ansiEscapes.cursorForward(1));
        break;
      case '\u001b[D': // Left arrow
        this.write(ansiEscapes.cursorBackward(1));
        break;
      case '\u000C':
        this.write(ansiEscapes.clearScreen);
        this.write(this.getPrompt());
        this.write(this.currentInputBuffer);
        break;
      case '': // ctrl-a
        break;
      case '': // ctrl-e
        break;
      case '\t': // Tab
        this.handleTab();
        break;
      case '\u001b[15~': // F5 still reloads the page
        window.location.reload();
        break;
      default:
        // Print printable characters
        if (data >= ' ' || data === '\n') {
          this.write(data);
          this.currentInputBuffer += data;
        } else {
          this.debug('Unhandled key:', data);
        }
    }
  }

  private async handleCommand() {
    const command = this.currentInputBuffer;
    this.currentInputBuffer = '';
    this.write('\r\n');

    if (command.trim()) {
      if (this.commandHistory[this.commandHistory.length - 1] !== command) {
        this.commandHistory.push(command);
      }
      this.historyIndex = this.commandHistory.length;
      this.lastExitCode = await this.executeCommand(command);
    }

    this.write(this.getPrompt());
  }

  private async executeCommand(input: string): Promise<number> {
    const [cmd, ...args] = input.trim().split(' ');

    if (isExplicitPath(cmd)) {
      return this.executeFile(cmd, args);
    }

    for (const [alias, command] of this.aliases) {
      if (cmd === alias) {
        return this.executeCommand(`${command} ${args.join(' ')}`);
      }
    }

    // TODO: support aliases from .jshrc

    // const write = (data: string) => {
    //   // TODO: remove hack
    //   if (data === '$save$') {
    //     this.saveSession();
    //     return;
    //   }

    //   // TODO: remove hack
    //   if (data === '$debug$') {
    //     const session = this.getSession();
    //     this.debug('debug-cmd', session);
    //     return;
    //   }

    //   this.write(data);
    // };

    // const { writable: stdoutIn, readable: stdoutOut } = new TransformStream<
    //   string,
    //   string
    // >();

    // stdoutOut.pipeTo(new WritableStream<string>({ write }));

    const commandContext = this.getCommand(cmd);

    if (commandContext !== undefined) {
      const command = commandContext.command.load();

      console.log('commandContext', commandContext);

      let process: Process;
      if (command.builtin) {
        process = this.kernel.clone(this.process, {
          argv: [cmd, ...args],
          argv0: cmd,
          title: cmd,
          exit: (code) => {
            if (cmd === 'exit') {
              this.process.exit(code);
            }
          },
        });
      } else {
        process = this.kernel.fork(this.process, {
          argv: [cmd, ...args],
          argv0: cmd,
          title: cmd,
        });
      }

      // TODO: do differently
      command.inject({
        process,
        kernel: this.kernel,
      });

      const exitCode = await command.exec({
        path: this.path,
        process,
        fs: this.fs,
      });

      process.exit(exitCode);

      return exitCode;
    }

    this.write(`jsh: Command not found: ${cmd}\n\r`);
    return 1;
  }

  private getCommands(): Map<string, CommandLoader | string> {
    const commands = new Map<string, CommandLoader | string>();

    for (const [bin, command] of jshCommands) {
      if (command === undefined) {
        this.debug('Command undefined:', bin);
        continue;
      }

      commands.set(bin, command);
    }

    for (const [alias, command] of this.aliases) {
      commands.set(alias, command);
    }

    // TODO: get file binaries from fs by PATH

    return commands;
  }

  private getCommand(argv0: string):
    | {
        binPath: string;
        command: CommandLoader;
      }
    | undefined {
    // split PATH into all binary paths
    const binPaths = (this.env.PATH ?? '').split(':');

    const commands = this.getCommands();

    console.log('commands', commands);

    for (const binPath of binPaths) {
      const command = commands.get(this.path.join(binPath, '/', argv0));
      if (command && typeof command !== 'string') {
        return {
          binPath: this.path.join(binPath, '/', argv0),
          command,
        };
      }
    }

    const command = commands.get(argv0);
    if (command && typeof command !== 'string') {
      return {
        binPath: argv0,
        command,
      };
    }

    return undefined;
  }

  private handleBackspace() {
    if (this.currentInputBuffer.length > 0) {
      this.currentInputBuffer = this.currentInputBuffer.slice(0, -1);
      this.write('\b \b');
    }
  }

  private handleArrowUp() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentInputBuffer = this.commandHistory[this.historyIndex];
      this.write(`\r${this.getPrompt()}${this.currentInputBuffer}`);
      this.write('\x1b[K'); // Clear to end of line
    }
  }

  private handleArrowDown() {
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      this.currentInputBuffer = this.commandHistory[this.historyIndex];
    } else {
      this.historyIndex = this.commandHistory.length;
      this.currentInputBuffer = '';
    }
    this.write(`\r${this.getPrompt()}${this.currentInputBuffer}`);
    this.write('\x1b[K'); // Clear to end of line
  }

  private handleTab() {
    let input = this.currentInputBuffer;
    if (!input.trim()) {
      return;
    }

    const hasSpace = input.includes(' ');
    input = hasSpace ? (input.split(' ').pop() as string) : input;

    this.debug({ input, hasSpace });

    // Command suggestions
    // TODO: check if we don't allow spaces in commands?!
    if (!isExplicitPath(input) && !hasSpace) {
      const commands = Array.from(this.getCommands().keys()).map((cmd) =>
        this.path.basename(cmd)
      );
      this.debug('suggesting commands', {
        commands,
        input,
      });
      const suggestions = commands.filter((cmd) =>
        cmd.startsWith(input.toLowerCase())
      );

      if (suggestions.length === 1) {
        this.completeInput(suggestions[0]);
      } else if (suggestions.length > 1) {
        this.showSuggestions(suggestions);
      }
      return;
    }

    // Path suggestions
    const suggestions = Autocomplete.init(
      this.fs,
      this.process
    ).getPathSuggestions(input);

    if (suggestions.length === 1) {
      this.completeInput(suggestions[0]);
    } else if (suggestions.length > 1) {
      this.showSuggestions(suggestions);
    }
  }

  private completeInput(suggestion: string) {
    this.currentInputBuffer = this.currentInputBuffer.replace(
      /[^ ]*$/,
      suggestion
    );
    this.write(`\r${this.getPrompt()}${this.currentInputBuffer}`);
  }

  private showSuggestions(suggestions: string[]) {
    this.write('\r\n');
    suggestions.forEach((suggestion) => {
      this.write(`${suggestion}\t`);
    });
    this.write('\r\n');
    this.write(this.getPrompt());
    this.write(this.currentInputBuffer);
  }

  private async executeFile(path: string, _args?: string[]): Promise<number> {
    this.debug(`Executing file: ${path}`);

    try {
      const file = this.path.resolve(process.cwd(), path);
      const raw = this.fs.readFileSync(file, 'utf8');
      return await this.executeScript(raw);
    } catch (t) {
      if (t instanceof SyntaxError) {
        process.stderr.write(`${path}: ${t.display()}\n`);
        return 2;
      }
      process.stderr.write(`jsh: can't open input file: ${path}\n`);
      return 127;
    }
  }

  private async executeScript(raw: string | Buffer): Promise<number> {
    const e = raw.toString();
    this.debug(`Executing script: ${e}`);

    // TODO: implement ShellScript
    // this.runningScript = new c.ShellScript(this, e);
    // try {
    //   this.resumeInput();
    //   await this.runningScript.execute();
    // } catch (e) {
    //   if (e instanceof s.SyntaxError) {
    //     this.exitCode = e.exitCode;
    //     this.runningScript = void 0;
    //     throw e;
    //   }
    // } finally {
    //   this.pauseInput();
    // }
    // this.exitCode = this.runningScript.exitCode;
    // this.runningScript = void 0;
    // return this.exitCode;

    return 0;
  }

  private getSession() {
    return {
      cwd: this.process.cwd(),
      env: this.env,
      lastExitCode: this.lastExitCode,
      commandHistory: this.commandHistory,
    };
  }

  public async loadSession(storage = localStorage) {
    if (!this.env.HOME) {
      throw new Error('HOME not set');
    }

    const rawSession = storage.getItem('jsh-session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      Object.assign(this, session);
      this.historyIndex = this.commandHistory.length;
      this.debug('Loaded session', rawSession);
    }
    const projectData = storage.getItem('jsh-project-data');
    if (projectData) {
      this.fs.fromJSON(JSON.parse(projectData), this.env.HOME);
    }
  }

  public async saveSession(storage = localStorage) {
    if (!this.env.HOME) {
      throw new Error('HOME not set');
    }

    const session = this.getSession();
    const rawSession = JSON.stringify(session);
    storage.setItem('jsh-session', rawSession);

    const projectData = this.fs.toJSON(this.env.HOME);
    if (projectData) {
      storage.setItem('jsh-project-data', JSON.stringify(projectData));
    }

    this.debug('Saved session', rawSession);
  }
}
