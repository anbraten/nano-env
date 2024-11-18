<template>
  <div class="w-full h-full p-4">
    <div
      class="flex w-full h-full flex-col bg-zinc-900 border border-zinc-700 rounded-md"
    >
      <!-- Header -->
      <header class="text-zinc-200 p-2 border-b border-zinc-700">
        <div class="flex gap-3">
          <button
            @click="show = 'code'"
            :class="[
              'px-2 py-1 rounded-md transition-colors',
              show === 'code'
                ? ' bg-purple-950 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700',
            ]"
          >
            Code
          </button>
          <button
            @click="show = 'preview'"
            :class="[
              'px-2 py-1 rounded-md transition-colors',
              show === 'preview'
                ? 'bg-purple-950 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700',
            ]"
          >
            Preview
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="relative flex flex-1 flex-col overflow-hidden">
        <Splitpanes
          :class="{
            '-translate-x-0': show === 'code',
            '-translate-x-full': show !== 'code',
          }"
          horizontal
          class="absolute flex-1 flex flex-col inset-0 transform transition-transform-slow"
        >
          <Pane class="flex" :size="75">
            <Splitpanes class="flex h-full w-full">
              <Pane class="flex flex-col max-w-72" :size="25">
                <div class="p-2 border-b border-zinc-700 text-zinc-300">
                  Files
                </div>

                <FileTree @open-file="openFile = $event" />
              </Pane>

              <Pane class="flex flex-grow flex-col" :size="75">
                <Editor :open-file />
              </Pane>
            </Splitpanes>
          </Pane>

          <Pane class="flex" :size="25">
            <Terminals />
          </Pane>
        </Splitpanes>

        <div
          :class="{
            'translate-x-0': show === 'preview',
            'translate-x-full': show !== 'preview',
          }"
          class="absolute inset-0 transform transition-transform-slow"
        >
          <Preview :url="previewUrl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FileTree from './FileTree.vue';
import Terminals from './Terminals.vue';
import Editor from './Editor.vue';
import { provide } from '../compositions/injectProvide';
import Preview from './Preview.vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const show = ref<'code' | 'preview'>('code');
const openFile = ref<string>();
const previewUrl = ref<string>('/');
provide('openFile', openFile);

// TODO: remove this hack
globalThis.openFile = function (file: string) {
  openFile.value = file;
};
</script>

<style>
:root {
  --zinc-700: 63, 63, 70;
}
</style>

<style scoped>
.transition-transform-slow {
  transition: transform cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
}

:deep(.splitpanes__splitter) {
  z-index: 10;
  background-color: rgb(var(--zinc-700));
  position: relative;
  flex-shrink: 0;
}

:deep(.splitpanes--horizontal .splitpanes__splitter) {
  width: 100%;
  height: 1px;
  margin-top: -1px;
}

:deep(.splitpanes--vertical .splitpanes__splitter) {
  width: 1px;
  height: 100%;
  margin-left: -1px;
}

:deep(.splitpanes__splitter:before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: transparent;
  transition: background-color 0.3s;
  transform: translate(-50%, -50%);
  background-color: rgba(var(--zinc-700), 0);
}

:deep(.splitpanes__splitter:hover:before) {
  background-color: rgba(var(--zinc-700), 0.4);
}

:deep(.splitpanes--horizontal .splitpanes__splitter:before) {
  width: 100%;
  height: 9px;
}

:deep(.splitpanes--vertical .splitpanes__splitter:before) {
  width: 9px;
  height: 100%;
}
</style>
