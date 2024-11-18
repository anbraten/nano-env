import { expect, test } from 'bun:test';
import { Volume } from 'memfs';
import { Autocomplete } from './autocomplete';
import { FS } from './fs';
import { Process } from './process';

function suggest(input: string, cwd: string, fs: FS): string[] {
  return Autocomplete.init(fs, {
    cwd: () => cwd,
  } as Process).getPathSuggestions(input);
}

test('jsh file suggestions', async () => {
  const fs = Volume.fromJSON({
    '/home/user/UPPER.txt': 'UPPER',
    '/home/user/index.html': 'HTML',
    '/home/user/package.json': 'JSON',
    '/home/user/src': null,
    '/home/user/src/main.ts': 'TS',
    '/home/user/src/index.ts': 'TS',
    '/home/user/test': null,
    '/proc/1/stat': 'STAT',
  });

  const cwd = '/home/user';
  expect(suggest('i', cwd, fs)).toEqual(['index.html']);
  expect(suggest('', cwd, fs)).toEqual([
    'UPPER.txt',
    'index.html',
    'package.json',
    'src',
    'test',
  ]);
  expect(suggest('./i', cwd, fs)).toEqual(['./index.html']);
  expect(suggest('src', cwd, fs)).toEqual(['src/']);
  expect(suggest('src/', cwd, fs)).toEqual(['src/index.ts', 'src/main.ts']);
  expect(suggest('src/ma', cwd, fs)).toEqual(['src/main.ts']);
  expect(suggest('/home/user/i', cwd, fs)).toEqual(['/home/user/index.html']);
  expect(suggest('/proc/', cwd, fs)).toEqual(['/proc/1/']);
  expect(suggest('/pr', cwd, fs)).toEqual(['/proc/']);
  expect(suggest('/', cwd, fs)).toEqual(['/home/', '/proc/']);
});
