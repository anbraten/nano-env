import { RemoteFSClient } from './fs';

let fs: RemoteFSClient | undefined;

function getIframe(): HTMLIFrameElement {
  const iframe = document.querySelector('iframe');
  if (!iframe) {
    throw new Error('Iframe not found');
  }
  return iframe;
}

function reloadIframe() {
  const iframe = getIframe();
  iframe.contentWindow?.location.reload();
}

function getTextarea(): HTMLTextAreaElement {
  const textarea = document.getElementById(
    'editor'
  ) as HTMLTextAreaElement | null;
  if (!textarea) {
    throw new Error('Textarea not found');
  }
  return textarea;
}

async function saveFile(path: string) {
  if (!fs) {
    throw new Error('FS not initialized');
  }

  const textarea = getTextarea();
  await fs.writeFile(path, textarea.value);
}

async function updateColor() {
  const indexHtml = getTextarea().value;
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const css = 'body { background-color: #' + randomColor + '; }';
  const newIndexHtml = indexHtml.replace(
    /\<style\>.*?\<\/style\>/,
    `<style>${css}</style>`
  );
  getTextarea().value = newIndexHtml;
}

async function initUI(fileUrl: string) {
  const preview = document.createElement('iframe');
  preview.src = fileUrl;
  preview.title = fileUrl;
  document.getElementById('preview')?.appendChild(preview);

  const updateColorButton = document.getElementById('updateColor');
  if (!updateColorButton) {
    throw new Error('Update color button not found');
  }
  updateColorButton.addEventListener('click', async () => {
    await updateColor();
    await saveFile(fileUrl);
    reloadIframe();
  });

  const saveButton = document.getElementById('reload');
  if (!saveButton) {
    throw new Error('Save button not found');
  }
  saveButton.addEventListener('click', async () => {
    await saveFile(fileUrl);
    reloadIframe();
  });

  const textarea = getTextarea();
  textarea.value = (await fs?.readFile(fileUrl)) ?? '';
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers support is required');
  }

  const registration = await navigator.serviceWorker.register(
    new URL('../sw.ts', import.meta.url),
    {
      type: 'module',
      scope: '/',
    }
  );
  if (!registration.active) {
    throw new Error('No active service worker');
  }
  const { port1: localPort, port2: remotePort } = new MessageChannel();
  fs = new RemoteFSClient(localPort);
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data.type === 'init-done') {
      console.log('Service worker attached');
      initUI('/fs/index.html');
      return;
    }

    if (event.data.type === 'attach-fs-done') {
      console.log('Attached fs to service worker');
      return;
    }
  });

  registration.active.postMessage({ type: 'init' });
  registration.active.postMessage({ type: 'attach-fs' }, [remotePort]);
}

async function spawnWorker(name: string, entryPoint: string) {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    /* @vite-ignore */
    name,
    type: 'module',
  });
  const ready = new Promise<void>((resolve) => {
    function handleMessage(event: MessageEvent) {
      if (event.data.type === 'init-done') {
        worker.removeEventListener('message', handleMessage);
        resolve();
      }
    }
    worker.addEventListener('message', handleMessage);
  });

  worker.postMessage({ type: 'init' });

  await ready;

  worker.postMessage({
    type: 'load-module',
    path: entryPoint,
  });
}

window.addEventListener('load', async () => {
  await registerServiceWorker();

  const samples = [
    'hello-world',
    'es-module',
    'cjs-module',
    'express',
    'basic-http-server',
    'env',
    'path',
    'fs',
    'cli',
  ];

  let fileContent = `
import fs from 'fs';
import path from 'path';
const path = require('path');
const fs = require('node:fs');
const moin = await import('node:fs');
  `.trim();

  fileContent = fileContent.replace(
    /import\(['"]node:([^'"]+)['"]\)/g,
    "import('/fs/node-$1.js')"
  );

  fileContent = fileContent.replace(
    /import ['"]node:([^'"]+)['"]/g,
    "import '/fs/node-$1.js'"
  );

  fileContent = fileContent.replace(
    /require\(['"]node:([^'"]+)['"]\)/g,
    "require('/fs/node-$1.js')"
  );

  console.log(fileContent);

  for await (const sample of samples) {
    await spawnWorker(sample, `/fs/node-samples/${sample}/index.js`);
  }
});
