<template>
  <div v-if="loading">loading ...</div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { provide } from '../compositions/injectProvide';
import { Sandbox } from '../sandbox/sandbox';
import { FileSystemTree } from '../sandbox/fs';

const sandbox = ref<Sandbox>();
provide('sandbox', () => {
  if (!sandbox.value) {
    throw new Error('jsh not ready');
  }

  return sandbox.value;
});

const loading = ref(true);

onMounted(async () => {
  const fileTree: FileSystemTree = {
    'package.json': {
      file: {
        contents: 'package json content',
      },
    },
    src: {
      directory: {
        'App.vue': {
          file: {
            contents: 'app vue content',
          },
        },
        'main.ts': {
          file: {
            contents: 'main ts content',
          },
        },
        'style.css': {
          file: {
            contents: 'style css content',
          },
        },
      },
    },
    'index.html': {
      file: {
        contents: 'index html content',
      },
    },
    'UPPER.txt': {
      file: {
        contents: '',
      },
    },
    test: {
      directory: {
        __fixtures__: {
          directory: {
            'snapshot.txt': {
              file: {
                contents: '',
              },
            },
          },
        },
      },
    },
  };

  sandbox.value = await Sandbox.boot();
  sandbox.value.mount(fileTree, {
    mountPoint: '/home/project',
  });

  loading.value = false;
});
</script>
