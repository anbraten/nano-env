import type { InjectionKey, Ref } from 'vue';
import { inject as vueInject, provide as vueProvide } from 'vue';
import { Sandbox } from 'open-webcontainer';

interface InjectKeys {
  sandbox: () => Sandbox;
  openFile: Ref<string | undefined>;
}

export function inject<T extends keyof InjectKeys>(key: T): InjectKeys[T] {
  const value = vueInject<InjectKeys[T]>(key);
  if (value === undefined) {
    throw new Error(`Please provide a value for ${key}`);
  }
  return value;
}

export function provide<T extends keyof InjectKeys>(
  key: T,
  value: InjectKeys[T]
): void {
  return vueProvide(
    key,
    value as T extends InjectionKey<infer V> ? V : InjectKeys[T]
  );
}
