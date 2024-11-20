function createNodeSample(
  name: string,
  ...files: [string, string][]
): [string, string][] {
  return files.map(([path, content]) => [
    `/fs/node-samples/${name}/${path}`,
    content.trim(),
  ]);
}

const helloWorld = createNodeSample('hello-world', [
  'index.js',
  `console.log('Hello, World!');`,
]);

const expressSample = createNodeSample(
  'express',
  [
    'index.js',
    `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a NanoContainer app! ðŸ¥³');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});
`,
  ],
  [
    'package.json',
    `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
  },
  "scripts": {
    "start": "node index.js"
  }
}
`,
  ]
);

const esModule = createNodeSample(
  'es-module',
  [
    'module.js',
    `
export function myFunction() {
  console.log('Hello from es module');
}
`,
  ],
  [
    'index.js',
    `
import { myFunction } from './module.js';
myFunction();
`,
  ]
);

const cjsModule = createNodeSample(
  'cjs-module',
  [
    'module.js',
    `
exports.myFunction = function myFunction() {
  console.log('Hello from cjs module');
}
`,
  ],
  [
    'index.js',
    `
const { myFunction } = require('./module.js');
myFunction();
`,
  ]
);

const basicHttpServer = createNodeSample('basic-http-server', [
  'index.js',
  `
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, Node.js!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
`,
]);

const fsOperations = createNodeSample('fs', [
  'index.js',
  `
import fs from 'fs';

fs.writeFile('output.txt', 'This is a test.', (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File has been written.');
});
`,
]);

const pathModule = createNodeSample('path', [
  'index.js',
  `
import path from 'path';

const filePath = '/user/anbraten/documents/file.txt';
console.log('Directory:', path.dirname(filePath));
console.log('Base name:', path.basename(filePath));
console.log('Extension:', path.extname(filePath));
`,
]);

const envVars = createNodeSample('env', [
  'index.js',
  `
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 3000);
`,
]);

const cliTool = createNodeSample('cli', [
  'index.js',
  `
const args = process.argv.slice(2);
console.log('Arguments:', args);

if (args.includes('--help')) {
  console.log('Usage: node script.js [options]');
}
`,
]);

export const fsSnapshot: [string, string][] = [
  [
    '/fs/index.html',
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nano IDE - Runtime</title>
    <style></style>
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <div id="app">
      <h1>Hello 👋 from the nano-ide runtime!</h1>
      <p>Nano IDE is a platform that allows you to run Node.JS apps in a secure, isolated environment.</p>
    </div>
  </body>
</html>`.trim(),
  ],
  ...expressSample,
  ...helloWorld,
  ...esModule,
  ...cjsModule,
  ...basicHttpServer,
  ...fsOperations,
  ...pathModule,
  ...envVars,
  ...cliTool,
];
