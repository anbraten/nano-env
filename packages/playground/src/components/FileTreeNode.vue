<template>
  <ul class="list-none m-0">
    <li v-for="item in items" :key="item.name">
      <div
        class="flex items-center px-2 py-1 gap-1 cursor-pointer select-none transition-colors hover:bg-zinc-700"
        :class="{
          'font-medium': item.type === 'folder',
          'bg-zinc-700': `${root}/${item.name}` === openFile,
        }"
        :style="{ paddingLeft: `${(level + 1) * 0.5}rem` }"
        @click="clickNode(item)"
      >
        <span class="text-md text-zinc-400 text-sm">
          <FolderOpen
            v-if="item.type === 'folder' && item.expanded"
            class="h-4"
          />
          <Folder v-else-if="item.type === 'folder'" class="h-4" />
          <File v-else class="h-4" />
          <!-- {{ item.type === 'folder' ? (item.expanded ? '📂' : '📁') : '📄' }} -->
        </span>
        <span class="text-sm text-zinc-300">{{ item.name }}</span>
      </div>

      <FileTreeNode
        v-if="item.type === 'folder' && item.expanded"
        :items="item.children || []"
        :level="level + 1"
        :root="`${root}/${item.name}`"
        @open-file="($event) => $emit('open-file', $event)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { File, Folder, FolderOpen } from 'lucide-vue-next';
import { inject } from '../compositions/injectProvide';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  expanded?: boolean;
}

const props = defineProps<{
  items: TreeNode[];
  level: number;
  root: string;
}>();

const emit = defineEmits<{
  (event: 'open-file', path: string): void;
}>();

const openFile = inject('openFile');

function clickNode(item: TreeNode) {
  if (item.type === 'folder') {
    item.expanded = !item.expanded;
  } else if (item.type === 'file') {
    emit('open-file', `${props.root}/${item.name}`);
  }
}
</script>
