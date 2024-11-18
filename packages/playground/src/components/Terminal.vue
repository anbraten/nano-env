<template>
  <div class="h-full w-full max-h-full min-h-0 rounded-b-md overflow-hidden">
    <div ref="terminalRef" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { inject } from '../compositions/injectProvide';

const terminalRef = ref<HTMLDivElement>();
const terminal = ref<Terminal>();

const fitAddon = new FitAddon();

const emit = defineEmits<{
  (event: 'exit', code: number): void;
}>();

function onResize() {
  nextTick(() => {
    fitAddon.fit();
  });
}

onMounted(async () => {
  if (!terminalRef.value) {
    throw new Error('Terminal element not found');
  }

  terminal.value = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    theme: {
      background: '#0a0a0a',
      foreground: '#ffffff',
    },
  });
  terminal.value.loadAddon(fitAddon);
  terminal.value.open(terminalRef.value);

  const sandbox = inject('sandbox');
  const jsh = await sandbox().spawn('jsh', [], {
    env: {
      TERM: 'xterm-256color',
    },
    output: true,
    terminal: {
      cols: terminal.value.cols,
      rows: terminal.value.rows,
    },
  });

  const writer = jsh.input.getWriter();
  terminal.value.onData((data) => {
    writer.write(data);
  });

  jsh.output.pipeTo(
    new WritableStream({
      write(chunk) {
        if (!terminal.value) {
          throw new Error('Terminal not found');
        }

        terminal.value.write(chunk);
      },
    })
  );

  (async () => {
    const exitCode = await jsh.exit;
    emit('exit', exitCode);
  })();

  nextTick(() => {
    fitAddon.fit();
  });

  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<style>
.xterm {
  padding: 1rem;
  height: 100%;
}

.xterm .xterm-viewport {
  overflow-y: auto !important;
}
</style>
