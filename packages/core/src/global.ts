console.log('kernel', 'Process', 'created');

globalThis.process = {
  env: {
    NODE_ENV: 'development',
  },
} as any;
