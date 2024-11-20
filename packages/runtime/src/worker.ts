/// <reference lib="webworker" />

function log(...args: any[]) {
  console.log(`[worker:${self.name}]`, ...args);
}

async function loadModule(name: string) {
  try {
    log('Loading module', name);
    await import(name);
  } catch (error) {
    console.error('Module loading failed', error);
  }
}

async function loadNodeLibs() {
  const originalRequire = globalThis.require;
  const originalImport = globalThis.import;

  async function customRequire(name: string) {
    // throw new Error(`WIP!!! Module ${name} is not available`);
    console.log('custom-require', name);

    try {
      const module = await import(name);
      log('Loading module', name, module);
      return module;
    } catch (error) {
      console.error('Module loading failed', error);
    }
  }

  // @ts-ignore
  globalThis.require = customRequire;
  globalThis.import = customRequire;

  // @ts-ignore
  globalThis.__dirname = '/fs';

  // @ts-ignore
  globalThis.__filename = '/fs/worker.ts';

  // @ts-ignore
  globalThis.process = {
    cwd: () => '/fs',
    env: {
      NODE_ENV: 'development',
    },
  };
}

self.onmessage = async (e) => {
  if (e.data.type === 'init') {
    await loadNodeLibs();
    self.postMessage({ type: 'init-done' });
    log('initialized');
    return;
  }

  if (e.data.type === 'load-module') {
    try {
      loadModule(e.data.path);
    } catch (error) {
      console.error('Script import failed', error);
    }
    return;
  }
};
