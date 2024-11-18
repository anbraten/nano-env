export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxError';
  }

  display() {
    return `${this.name}: ${this.message}`;
  }
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[mGK]/g, '');
}

export function isPath(path: string): boolean {
  return path.startsWith('.') || path.startsWith('/') || path.startsWith('~/');
}
