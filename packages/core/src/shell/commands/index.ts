import { BusyboxCommand } from './busybox';
import { CatCommand } from './cat';
import { CdCommand } from './cd';
import { ClearCommand } from './clear';
import { Command } from './command';
import { CpCommand } from './cp';
import { EchoCommand } from './echo';
import { EnvCommand } from './env';
import { ExitCommand } from './exit';
import { FalseCommand } from './false';
import { HelpCommand } from './help';
import { HistoryCommand } from './history';
import { LsCommand } from './ls';
import { MkdirCommand } from './mkdir';
import { MvCommand } from './mv';
import { PsCommand } from './ps';
import { PwdCommand } from './pwd';
import { RmCommand } from './rm';
import { TouchCommand } from './touch';
import { TrueCommand } from './true';
import { UnzipCommand } from './unzip';
import { WgetCommand } from './wget';
import { WhichCommand } from './which';
import { XdgOpenCommand } from './xdg-open';

export type CommandLoader = {
  load: () => Command;
};

export const jshCommands = new Map<string, CommandLoader | undefined>([
  ['command', undefined],
  ['source', undefined],
  ['export', undefined],
  ['help', { load: () => new HelpCommand() }],
  ['exit', { load: () => new ExitCommand() }],

  ['/bin/echo', { load: () => new EchoCommand() }],
  ['/bin/pwd', { load: () => new PwdCommand() }],
  ['/bin/ls', { load: () => new LsCommand() }],
  ['/bin/cat', { load: () => new CatCommand() }],
  ['/bin/chmod', undefined],
  ['/bin/cp', { load: () => new CpCommand() }],
  ['/bin/hostname', undefined],
  ['/bin/mkdir', { load: () => new MkdirCommand() }],
  ['/bin/mv', { load: () => new MvCommand() }],
  ['/bin/rm', { load: () => new RmCommand() }],
  ['/bin/rmdir', undefined],
  ['/bin/ln', undefined],
  ['/bin/ps', undefined],
  ['/bin/kill', undefined],
  ['/bin/xxd', undefined],
  ['/bin/history', { load: () => new HistoryCommand() }],
  ['/usr/bin/true', { load: () => new TrueCommand() }],
  ['/usr/bin/false', { load: () => new FalseCommand() }],
  ['/usr/bin/cd', { load: () => new CdCommand() }],
  ['/usr/bin/curl', undefined],
  ['/usr/bin/which', { load: () => new WhichCommand() }],
  ['/usr/bin/alias', undefined],
  ['/usr/bin/env', { load: () => new EnvCommand() }],
  ['/usr/bin/clear', { load: () => new ClearCommand() }],
  ['/usr/bin/sort', undefined],
  ['/usr/bin/head', undefined],
  ['/usr/bin/tail', undefined],
  ['/usr/bin/touch', { load: () => new TouchCommand() }],
  ['/usr/bin/uptime', undefined],
  ['/usr/bin/git', undefined],
  ['/usr/bin/wget', { load: () => new WgetCommand() }],
  ['/usr/bin/getconf', undefined],
  ['/usr/local/bin/node', undefined],
  ['/usr/local/bin/xdg-open', { load: () => new XdgOpenCommand() }],
  ['/usr/local/bin/code', undefined],
  ['/usr/local/bin/python3', undefined],
  ['/usr/local/bin/jq', undefined],
  ['/usr/local/bin/wasm', undefined],
  ['/usr/local/bin/loadenv', undefined],
  ['/usr/bin/ps', { load: () => new PsCommand() }],
  ['/usr/bin/unzip', { load: () => new UnzipCommand() }],
  ['/usr/bin/busybox', { load: () => new BusyboxCommand() }],
]);
