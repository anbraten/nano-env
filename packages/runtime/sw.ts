/// <reference lib="es2020" />
/// <reference lib="WebWorker" />

import { FS, RemoteFSHost } from './src/fs';
import { fsSnapshot } from './src/fsSnapshot';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

const fs = new FS(fsSnapshot);

function debug(...args: unknown[]) {
  console.debug('[SW]', ...args);
}

function log(...args: unknown[]) {
  console.log('[SW]', ...args);
}

function logError(...args: unknown[]) {
  console.error('[SW]', ...args);
}

function mimeFromPath(path: string) {
  if (path.endsWith('.html')) {
    return 'text/html';
  }

  if (path.endsWith('.js')) {
    return 'text/javascript';
  }

  if (path.endsWith('.css')) {
    return 'text/css';
  }

  if (path.endsWith('.json')) {
    return 'application/json';
  }
}

async function responseFromFS(path: string) {
  let fileContent = await fs.readFile(path);
  debug('Serving file for', path, fileContent);

  if (!fileContent) {
    logError('File not found:', path);
    return new Response('File not found', { status: 404 });
  }

  const mime = mimeFromPath(path);
  if (mime === undefined) {
    logError('Unknown mime type for file:', path);
    return new Response('Unknown mime type', { status: 500 });
  }

  // TODO: hack to rewrite node imports to internal shims
  if (mime === 'text/javascript') {
    // fileContent = fileContent.replace(
    //   /require\(['"]node:([^'"]+)['"]\)/g,
    //   "require('/fs/node-$1.js')"
    // );

    fileContent = fileContent.replace(
      /import\(['"]node:([^'"]+)['"]\)/g,
      "import('/fs/node-$1.js')"
    );

    fileContent = fileContent.replace(
      /import ['"]node:([^'"]+)['"]/g,
      "import '/fs/node-$1.js'"
    );
  }

  return new Response(fileContent, {
    headers: { 'Content-Type': mime },
  });
}

sw.addEventListener('install', (event) => {
  log('installed');
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener('activate', (event) => {
  log('activated');
  event.waitUntil(sw.clients.claim());
});

let connectedClientId: string | undefined;
sw.addEventListener('message', async (event) => {
  const clientId = (event.source as Client).id;
  if (event.data.type === 'init') {
    const client = connectedClientId
      ? await sw.clients.get(connectedClientId)
      : undefined;

    // check if client is already connected
    if (connectedClientId !== clientId && client) {
      return;
    }

    log('connected to main thread', clientId);
    connectedClientId = clientId;
    event.source?.postMessage({ type: 'init-done' });
    return;
  }

  if (event.data.type === 'attach-fs') {
    new RemoteFSHost(event.ports[0], fs);
    log('attached fs to', clientId);
    event.source?.postMessage({ type: 'attach-fs-done' });
    return;
  }
});

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === '/' || url.pathname.startsWith('/.internal/')) {
    return;
  }

  if (url.pathname.startsWith('/fs/')) {
    event.respondWith(responseFromFS(url.pathname));
    return;
  }

  return;
});
