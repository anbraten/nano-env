/// <reference lib="webworker" />

// Import types for self
declare const self: ServiceWorkerGlobalScope;

const HTML_ERROR = (code: number, error: Error) => `
<!DOCTYPE html>
<html>
  <head><title>${code} - ${error.name}</title></head>
  <body>
    <h1>${error.name}</h1>
    <p>${error.message}</p>
  </body>
</html>
`;

function log(...args: unknown[]) {
  console.log('[Service Worker]', ...args);
}

self.addEventListener('install', (_event) => {
  log('Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  log('Activate event');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (url.search.includes('preview=true')) {
    log('handlePreviewRequest', url.pathname);
    event.respondWith(handlePreviewRequest(event.request));
    return;
  }
});

const requestPromises = new Map<
  number,
  {
    resolve: (response: Response) => void;
    reject: (error: unknown) => void;
  }
>();
let messagePort: MessagePort | null = null;
let initChannelResolve: (() => void) | null = null;
const initChannelPromise = new Promise<void>((resolve) => {
  initChannelResolve = resolve;
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'init-channel') {
    if (messagePort) {
      messagePort.close();
    }

    messagePort = event.ports[0];
    messagePort.onmessage = async (event) => {
      const { id, response } = event.data;
      const request = requestPromises.get(id);
      if (request) {
        request.resolve(response);
        requestPromises.delete(id);
      }
    };

    if (initChannelResolve) {
      initChannelResolve();
    }
  }
});

async function getResponse(request: Request): Promise<Response> {
  const id = Math.random();
  const promise = new Promise<Response>((resolve, reject) => {
    requestPromises.set(id, { resolve, reject });
  });

  // setTimeout(() => {
  //   const request = requestPromises.get(id);
  //   if (request) {
  //     request.reject(new Error('Request timed out'));
  //     requestPromises.delete(id);
  //   }
  // }, 5000);

  log('r', JSON.stringify(request));

  if (messagePort) {
    messagePort.postMessage({
      type: 'request',
      id,
      request: JSON.stringify(request),
    });
  }

  return promise;
}

async function handlePreviewRequest(request: Request): Promise<Response> {
  // await initChannelPromise; // FIX
  log('can handle request', request.url);

  const defaultHeaders = {
    'Content-Security-Policy':
      "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *",
    'Cross-Origin-Embedder-Policy': 'require-corp',
  };

  try {
    // return await getResponse(request);
    throw new Error('server offline?');
  } catch (error) {
    return new Response(HTML_ERROR(500, error as Error).trim(), {
      status: 500,
      headers: { ...defaultHeaders, 'Content-Type': 'text/html' },
    });
  }
}
