export class Path {
  cwd: string = '/';
  private pathSeparator = '/';

  constructor(cwd: string = '/') {
    this.cwd = cwd;
  }

  static init(cwd: string = '/') {
    return new Path(cwd);
  }

  normalize(path: string): string {
    // Handle absolute Windows paths
    const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(path);

    // Split into segments, filtering out empty parts and single dots
    const segments = path.split(/[/\\]+/).filter((s) => s !== '' && s !== '.');

    // Determine if path is absolute
    const isAbsolute = path.startsWith('/') || isWindowsAbsolute;

    const stack = [];

    // Process segments
    for (const segment of segments) {
      if (segment === '..') {
        if (stack.length > 0 && stack[stack.length - 1] !== '..') {
          stack.pop();
        } else if (!isAbsolute) {
          stack.push('..');
        }
      } else {
        stack.push(segment);
      }
    }

    // Handle empty result
    if (stack.length === 0) {
      return isAbsolute ? '/' : '.';
    }

    // Construct result
    let result = isAbsolute ? '/' : '';
    result += stack.join('/');

    // Add trailing slash if original path had one
    if (path.endsWith('/')) {
      result += '/';
    }

    return result;
  }

  join(...paths: string[]): string {
    return this.normalize(paths.filter(Boolean).join(this.pathSeparator));
  }

  resolve(...paths: string[]): string {
    let path = '';

    if (paths[0].startsWith(this.pathSeparator)) {
      path = this.join(...paths);
    } else {
      path = this.join(this.cwd, ...paths);
    }

    return path.replace(/(?!^)\/+$/, '');
  }

  dirname(path: string): string {
    // Normalize slashes for consistency
    path = path.replace(/\\/g, this.pathSeparator);

    // Remove trailing slashes except for the root (e.g., /, C:/)
    path = path.replace(/(?!^)\/+$/, '');

    // Find the last slash
    const lastSlashIndex = path.lastIndexOf(this.pathSeparator);

    // If no slash is found, return '.'
    if (lastSlashIndex === -1) {
      return '.';
    }

    // If the last slash is at the beginning (root), return '/'
    if (lastSlashIndex === 0) {
      return this.pathSeparator;
    }

    // Return the substring before the last slash
    return path.slice(0, lastSlashIndex);
  }

  basename(path: string, suffix = ''): string {
    // Normalize slashes for consistency
    path = path.replace(/\\/g, this.pathSeparator);

    // Remove trailing slashes
    path = path.replace(/\/+$/, '');

    // Find the last slash
    const lastSlashIndex = path.lastIndexOf(this.pathSeparator);

    // Get the part after the last slash (file name)
    const base = lastSlashIndex === -1 ? path : path.slice(lastSlashIndex + 1);

    // If an extension is provided and matches the end of the base, remove it
    if (suffix && base.endsWith(suffix)) {
      return base.slice(0, -suffix.length);
    }

    return base;
  }

  relative(from: string, to: string): string {
    // Normalize both paths
    from = this.normalize(from);
    to = this.normalize(to);

    // Split paths into segments
    const fromSegments = from.split(/[/\\]+/).filter(Boolean);
    const toSegments = to.split(/[/\\]+/).filter(Boolean);

    // Find the common base path
    let commonLength = 0;
    while (
      commonLength < fromSegments.length &&
      commonLength < toSegments.length &&
      fromSegments[commonLength] === toSegments[commonLength]
    ) {
      commonLength++;
    }

    // Calculate the relative path
    const upSegments = fromSegments.slice(commonLength).map(() => '..');
    const downSegments = toSegments.slice(commonLength);
    return upSegments.concat(downSegments).join(this.pathSeparator) || '';
  }
}
