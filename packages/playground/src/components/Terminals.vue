<template>
  <div class="w-full">
    <div class="p-2 border-b border-zinc-700 text-zinc-300 flex gap-2">
      <button
        v-for="(id, i) in terminals"
        :key="id"
        class="px-3 py-1 rounded-full flex gap-2"
        :class="{
          'bg-zinc-700': id === activeTerminalId,
          'hover:bg-zinc-800': id !== activeTerminalId,
        }"
        @click="activeTerminalId = id"
      >
        <template v-if="i !== 0">
          <TerminalSquare class="w-4" />
          <span>Terminal {{ i }}</span>
        </template>
        <template v-else>
          <Zap class="w-4" />
          <span>Power</span>
        </template>
      </button>
      <IconButton @click="addTerminal">
        <Plus class="w-4" />
      </IconButton>
    </div>

    <Terminal
      v-for="id in terminals"
      :key="id"
      v-show="id === activeTerminalId"
      @exit="removeTerminal(id)"
    />
  </div>
</template>

<script setup lang="ts">
import { TerminalSquare, Zap, Plus } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import Terminal from './Terminal.vue';
import IconButton from './IconButton.vue';

const terminals = ref<number[]>([]);
const activeTerminalId = ref<number>();

function addTerminal() {
  terminals.value.push(Date.now());
  activeTerminalId.value = terminals.value[terminals.value.length - 1];
}

function removeTerminal(id: number) {
  if (terminals.value[0] === id) {
    terminals.value = [Date.now(), ...terminals.value.slice(1)];
    activeTerminalId.value = terminals.value[0];
    return;
  }

  terminals.value = terminals.value.filter((_id) => _id !== id);
  if (activeTerminalId.value === id) {
    activeTerminalId.value = terminals.value[terminals.value.length - 1];
  }
}

onMounted(() => {
  addTerminal();
});
</script>
