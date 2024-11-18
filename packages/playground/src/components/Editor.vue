<template>
  <div class="p-2 border-b border-zinc-700 text-zinc-300 flex gap-2">
    <span>{{ currentFile ?? 'Open a file' }}</span>

    <template v-if="changed">
      <button
        @click="save"
        class="px-2 ml-auto rounded-md bg-zinc-800 hover:bg-zinc-700"
      >
        Save
      </button>
      <button
        @click="reset"
        class="px-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
      >
        Reset
      </button>
    </template>
  </div>

  <div class="h-full relative w-full">
    <div class="h-full overflow-hidden">
      <div ref="editorContainer" class="h-full w-full bg-transparent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentUnit,
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';

import { onBeforeUnmount, ref, watch } from 'vue';
import { inject } from '../compositions/injectProvide';
import { useCodeMirror } from '../compositions/useCodeMirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from './editor-theme';

const props = defineProps<{
  openFile?: string;
}>();

const sandbox = inject('sandbox');
const fs = () => sandbox().fs;

const currentFile = ref<string>();
const changed = ref(false);

watch(
  () => props.openFile,
  (file) => {
    if (!file) {
      return;
    }

    open(file);
  }
);

const editorContainer = ref<HTMLDivElement>();
const editor = useCodeMirror(editorContainer, {
  extensions: [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    indentUnit.of('  '),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      {
        key: 'Ctrl-s',
        run: () => {
          save();
          return true;
        },
      },
    ]),
    javascript(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    oneDark,
  ],
  onChange: () => {
    if (currentFile.value) {
      changed.value = true;
    }
  },
});

onBeforeUnmount(() => {
  editor.destroyView();
});

async function fileWatcher() {
  if (!currentFile.value) {
    return;
  }

  const newText = await fs().readFile(currentFile.value, 'utf-8');

  if (changed.value && newText !== editor.getText()) {
    if (
      !confirm(
        'The file has changed on disk. Do you want to discard your current changes?'
      )
    ) {
      return;
    }
  }

  if (newText === editor.getText()) {
    return;
  }

  editor.setText(newText);
}

let watcher: { close: () => void } | undefined;
async function open(file: string) {
  if (changed.value) {
    if (!confirm('You have unsaved changes. Do you want to continue?')) {
      return;
    }
  }

  editor.setText(await fs().readFile(file, 'utf-8'));
  currentFile.value = file;
  changed.value = false;

  if (watcher) {
    watcher.close();
  }
  watcher = fs().watch(file, {}, fileWatcher);
}

onBeforeUnmount(() => {
  if (watcher) {
    watcher.close();
  }
});

async function save() {
  if (!currentFile.value) {
    return;
  }

  const text = editor.getText();
  if (text === undefined) {
    return;
  }

  await fs().writeFile(currentFile.value, text);
  changed.value = false;
}

async function reset() {
  if (!props.openFile) {
    return;
  }

  editor.setText(await fs().readFile(props.openFile, 'utf-8'));
  changed.value = false;
}
</script>

<style>
.cm-editor {
  height: 100%;
}
</style>
