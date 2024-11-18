import { FS } from './fs';
import { Process } from './process';

export class Kernel {
  private lastPID = 0;
  initProcess: Process;
  readonly processTable = new Map<number, Process>();

  fs: FS; // TODO: migrate to FileSystemApi

  constructor(options: { fs: FS }) {
    this.fs = options.fs;

    this.fs.fromJSON(
      {
        '/etc/os-release':
          `
PRETTY_NAME = "Ubuntu 20.04.0 LTS"
NAME = "Ubuntu"
VERSION_ID = "20.04"
VERSION = "20.04.0 LTS (Focal Fossa)"
VERSION_CODENAME = focal
ID = ubuntu
ID_LIKE = debian
HOME_URL = "https://www.ubuntu.com/"
SUPPORT_URL = "https://help.ubuntu.com/"
BUG_REPORT_URL = "https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL = "https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME = focal
`.trim() + '\n',
        '/etc/shells':
          `
/bin/jsh
/bin/zsh
/bin/bash
/bin/sh
`.trim() + '\n',
        '/etc/lsb-release':
          `
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=20.04
DISTRIB_CODENAME=focal
DISTRIB_DESCRIPTION="Ubuntu 20.04.0 LTS"
`.trim() + '\n',
        '/etc/passwd':
          `
0:root
1:staff
`.trim() + '\n',
        '/home/project': null,
        '/dev/null': '',
        '/dev/urandom': '',
        '/dev/tty': '',
        '/dev/ttys001': '',
        '/dev/ttys002': '',
        '/dev/ttys003': '',
        '/dev/ttys004': '',
        '/bin': null,
        '/tmp': null,
        '/usr': null,
        '/proc': null,
      },
      '/'
    );

    let cwd = '/';
    this.initProcess = this.createProcess({
      ppid: 0,
      title: 'init',
      argv0: '/sbin/init',
      argv: [],
      env: {
        HOME: '',
        PWD: '',
        PATH: '/usr/bin:/bin:/usr/local/bin',
      },
      cwd() {
        return cwd;
      },
      chdir(directory: string) {
        cwd = directory;
      },
    });

    globalThis.pt = this.processTable;
  }

  private deleteProcess(pid: number) {
    if (pid === 1) {
      console.error('Can not delete root process');
      return;
    }

    if (!this.processTable.has(pid)) {
      return;
    }

    this.processTable.delete(pid);
    this.fs.rmdirSync(`/proc/${pid}`, {
      recursive: true,
    });
    this.debug(`Process ${pid} deleted`);
  }

  debug(...args: any[]) {
    if (globalThis.DEBUG) {
      console.log('kernel', ...args);
    }
  }

  private createProcess(p: Partial<Process>): Process {
    this.lastPID++;
    const pid = this.lastPID;

    const self = this;

    const process = {
      argv: [],
      argv0: '',
      env: {},
      title: '',
      ...p,

      // those properties can not be overridden
      pid,
      exit(code = 0) {
        process.exitCode = code;
        self.deleteProcess(pid);
        p.exit?.(code);
      },
    } as Process;

    this.processTable.set(pid, process);

    this.fs.mkdirSync(`/proc/${pid}`);
    this.fs.writeFileSync(`/proc/${pid}/cmdline`, process.argv.join('\0'));
    this.fs.writeFileSync(
      `/proc/${pid}/status`,
      `Name: ${process.title}\nPid: ${pid}\nPPid: ${process.ppid}\nState: running\n`
    );
    this.fs.writeFileSync(
      `/proc/${pid}/stat`,
      `${pid} (${process.title}) S ${process.ppid}`
    );

    this.debug(`Process ${pid} created`);

    return process;
  }

  fork(parent: Partial<Process>, p?: Partial<Process>): Process {
    let cwd = p?.cwd?.() ?? parent.cwd?.() ?? '/';
    let env = { ...parent.env, ...p?.env };

    const self = this;

    const process: Process = this.createProcess({
      stderr: parent.stderr,
      stdin: parent.stdin,
      stdout: parent.stdout,
      ...p,

      // those properties can not be overridden
      ppid: parent.pid,
      env,
      cwd() {
        return cwd;
      },
      chdir(directory: string) {
        cwd = directory;
        env.PWD = directory;
        self.debug(`chdir: ${directory}`);
      },
    });

    return process;
  }

  clone(parent: Process, p?: Partial<Process>): Process {
    return this.createProcess({
      ...parent,
      ...p,

      // those properties can not be overridden
      ppid: parent.pid,
      cwd: () => parent.cwd(),
      chdir: parent.chdir,
    });
  }

  kill(pid: number, signal: string) {
    const process = this.processTable.get(pid);
    if (!process) {
      throw new Error(`No such process: ${pid}`);
    }
    process.exit(1);
    this.debug(`Process ${pid} killed by signal ${signal}`);
  }
}
