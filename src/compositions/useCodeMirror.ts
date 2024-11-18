import { EditorState, Extension } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { Ref, watch } from 'vue';

type CodeMirrorOptions = {
  doc?: string;
  extensions?: Extension[];
  onUpdate?: (update: ViewUpdate) => void;
  onChange?: (doc: string, update: ViewUpdate) => void;
};

export function useCodeMirror(
  container: Ref<HTMLElement | undefined>,
  options?: CodeMirrorOptions
) {
  let editorView: EditorView | undefined;

  watch(
    container,
    () => {
      if (editorView) {
        editorView.destroy();
      }

      if (!container.value) {
        return;
      }

      const editorState = EditorState.create({
        doc: options?.doc || '',
        extensions: [
          ...(options?.extensions || []),
          EditorView.updateListener.of((update) => {
            options?.onUpdate?.(update);

            if (update.docChanged) {
              options?.onChange?.(update.state.doc.toString(), update);
            }
          }),
        ],
      });

      editorView = new EditorView({
        state: editorState,
        parent: container.value,
      });
    },
    { immediate: true }
  );

  function destroyView() {
    editorView?.destroy();
  }

  function setText(doc: string | Uint8Array) {
    editorView?.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: doc.toString(),
      },
    });
  }

  function getText() {
    return editorView?.state.doc.toString();
  }

  return {
    destroyView,
    setText,
    getText,
    view: () => editorView,
  };
}
