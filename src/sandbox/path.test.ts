import { expect, test } from 'bun:test';
import { Path } from './path';
import path from 'node:path';

function getPath(cwd: string) {
  return Path.init(cwd);
  process.chdir(cwd);
  return path;
}

test('dirname', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.dirname('.')).toBe('.');
  expect(path.dirname('./')).toBe('.');
  expect(path.dirname('..')).toBe('.');
  expect(path.dirname('/home/project')).toBe('/home');
  expect(path.dirname('/home/project/test.txt')).toBe('/home/project');
});

test('basename', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.basename('.')).toBe('.');
  expect(path.basename('./')).toBe('.');
  expect(path.basename('..')).toBe('..');
  expect(path.basename('/home/project')).toBe('project');
  expect(path.basename('/home/project/test.txt')).toBe('test.txt');
});

test('resolve', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.resolve('.')).toBe('/home/project');
  expect(path.resolve('./')).toBe('/home/project');
  expect(path.resolve('..')).toBe('/home');
  expect(path.resolve('../project')).toBe('/home/project');
  expect(path.resolve('/home', 'project')).toBe('/home/project');
  expect(path.resolve('/home', 'project', '..', 'project')).toBe(
    '/home/project'
  );
  expect(path.resolve('/home', 'project', '.')).toBe('/home/project');
  expect(path.resolve('/home/project/test.txt')).toBe('/home/project/test.txt');
  expect(path.resolve('/home', '..', '..')).toBe('/');
  expect(path.resolve('../..')).toBe('/');
  expect(path.resolve('/')).toBe('/');
});

test('join', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.join('/')).toBe('/');
  expect(path.join('test')).toBe('test');
  expect(path.join('test', 'next')).toBe('test/next');
  expect(path.join('test', '')).toBe('test');
  expect(path.join('test', '..')).toBe('.');
  expect(path.join('test', '.')).toBe('test');
  expect(path.join('test', '..', 'next')).toBe('next');
  expect(path.join('test/', 'next')).toBe('test/next');
  expect(path.join('test', '/next')).toBe('test/next');
  expect(path.join('test/', '/next')).toBe('test/next');
  expect(path.join('/test/', '/next')).toBe('/test/next');
  expect(path.join('/home', '..', '..')).toBe('/');
  expect(path.join('./test')).toBe('test');
});

test('normalize', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.normalize('test')).toBe('test');
  expect(path.normalize('test/next')).toBe('test/next');
  expect(path.normalize('test//next')).toBe('test/next');
  expect(path.normalize('test/./next')).toBe('test/next');
  expect(path.normalize('test/../next')).toBe('next');
  expect(path.normalize('test/../../next')).toBe('../next');
  expect(path.normalize('test/../../../next')).toBe('../../next');
  expect(path.normalize('/test/../../../next')).toBe('/next');
  expect(path.normalize('/test/./../next')).toBe('/next');
  expect(path.normalize('/test/./../next/')).toBe('/next/');
  expect(path.normalize('/test/./../next//')).toBe('/next/');
  expect(path.normalize('/')).toBe('/');
  expect(path.normalize('//')).toBe('/');
  expect(path.normalize('/../..')).toBe('/');
});

test('relative', () => {
  const cwd = '/home/project';
  const path = getPath(cwd);
  expect(path.relative('/home/project', '/home/project')).toBe('');
  expect(path.relative('/home/project', '/home/project/test.txt')).toBe(
    'test.txt'
  );
  expect(path.relative('/home/project', '/home/project/test')).toBe('test');
  expect(path.relative('/home/project', '/home')).toBe('..');
  expect(path.relative('/home/project', '/home/test')).toBe('../test');
  expect(path.relative('/home/project', '/home/test/test')).toBe(
    '../test/test'
  );
  expect(path.relative('/home/project', '/home/test/test/test')).toBe(
    '../test/test/test'
  );
  expect(path.relative('/home/project', '/home/project/../project')).toBe('');
  expect(path.relative('/home/project', '/home/./project')).toBe('');
});
