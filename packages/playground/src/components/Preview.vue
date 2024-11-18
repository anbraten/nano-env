<template>
  <div
    class="h-full flex flex-col"
    :class="{
      'fixed top-0 left-0 w-full h-full': fullscreen,
    }"
  >
    <div class="flex gap-4 border-b border-zinc-600 p-2">
      <input
        class="w-full px-4 bg-zinc-800 text-zinc-300 focus:outline-none rounded-full focus:border-zinc-600 border border-zinc-800 hover:border-zinc-600 text-sm"
        type="text"
        v-model="inputUrl"
        @keyup.enter="url = inputUrl"
      />

      <button class="p-2 hover:bg-zinc-700 rounded-md" @click="reload">
        <RotateCw class="h-4 text-zinc-300" />
      </button>

      <button
        class="p-2 hover:bg-zinc-700 rounded-md"
        @click="fullscreen = !fullscreen"
      >
        <Minimize v-if="fullscreen" class="h-4 text-zinc-300" />
        <Maximize v-else class="h-4 text-zinc-300" />
      </button>
    </div>

    <div class="flex-grow">
      <iframe
        ref="iframe"
        class="w-full h-full border-none bg-zinc-800 rounded-b-md"
        :src="addPreviewQuery('/')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RotateCw, Maximize, Minimize } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import { inject } from '../compositions/injectProvide';

const iframe = ref<HTMLIFrameElement | null>(null);

const fullscreen = ref(false);

const url = defineModel<string>('url', {
  required: true,
});

const inputUrl = ref(url.value);

function reload() {
  iframe.value?.contentWindow?.location.reload();
}

function openPage(url: string) {
  iframe.value?.contentWindow?.location.replace(url);
}

watch(url, (newUrl) => {
  inputUrl.value = newUrl;
  openPage(addPreviewQuery(newUrl));
});

const sandbox = inject('sandbox');

onMounted(async () => {
  const sw = await navigator.serviceWorker.ready;
  const messageChannel = new MessageChannel();
  messageChannel.port1.onmessage = (event) => {
    if (event.data.type === 'request') {
      const request = new Request(JSON.parse(event.data.request));
      const url = new URL(request.url);

      console.log(request, url, event.data.request);

      let filePath = url.pathname;
      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      }

      const baseDir = '/home/public';

      sandbox()
        .fs.readFile(baseDir + filePath)
        .then((content) => {
          messageChannel.port1.postMessage({
            type: 'response',
            response: new Response(content, {
              status: 200,
              statusText: 'OK',
            }),
          });
        });
    }

    throw new Error('Unknown message type');
  };
  sw.active?.postMessage({ type: 'init-channel' }, [messageChannel.port2]);
});

function addPreviewQuery(url: string) {
  const u = new URL(
    url.includes('http')
      ? url
      : `${window.location.protocol}//${window.location.host}${
          url.startsWith('/') ? '' : '/'
        }${url}`
  );
  u.searchParams.set('preview', 'true');
  return u.toString();
}
</script>
