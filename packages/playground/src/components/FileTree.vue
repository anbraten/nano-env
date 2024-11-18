<template>
  <FileTreeNode
    :items="files"
    :level="0"
    :root="projectDir()"
    @open-file="($event) => $emit('open-file', $event)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import FileTreeNode from './FileTreeNode.vue';
import { inject } from '../compositions/injectProvide';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  expanded?: boolean;
}

defineEmits<{
  (event: 'open-file', path: string): void;
}>();

const files = ref<TreeNode[]>([]);

const sandbox = inject('sandbox');

const projectDir = () => '/home/project';

async function buildFileTree(dir: string): Promise<TreeNode[]> {
  const entries = await sandbox().fs.readdir(dir, { withFileTypes: true });
  const tree: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      tree.push({
        name: entry.name,
        type: 'folder',
        expanded: false,
        children: await buildFileTree(`${dir}/${entry.name}`),
      });
    } else {
      tree.push({
        name: entry.name,
        type: 'file',
      });
    }
  }

  return tree;
}

async function refreshFileTree() {
  files.value = await buildFileTree(projectDir());
}

onMounted(async () => {
  sandbox().fs.watch(projectDir(), { recursive: true }, (_event, _filename) => {
    // TODO: only refresh the changed file / folder
    // Rebuild the file tree on changes
    refreshFileTree();
  });

  await refreshFileTree();
});
</script>
