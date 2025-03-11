import { uniqueId } from "lodash";
import { computed, markRaw, nextTick, ref } from "vue";
import type { CloseModalHandleType, IModal } from "..";

const stack = ref<IModal[]>([]);
const triggerElements = ref<Map<string, HTMLElement>>(new Map());

export function useModal() {
  function openModal(options: IModal): CloseModalHandleType {
    const id = options.id ?? uniqueId();
    triggerElements.value.set(id, document.activeElement as HTMLElement);

    stack.value.push({
      id,
      props: options.props,
      component: typeof options.component === "string" ? options.component : markRaw(options.component),
    });

    return () => closeModal(id);
  }

  function closeModal(id?: string) {
    if (!id) {
      const lastModal = stack.value.pop();
      if (lastModal?.id) {
        void returnFocus(lastModal.id);
      }
      return;
    }

    const index = stack.value.findIndex((item) => item.id === id);
    if (index === -1) {
      return;
    }

    stack.value.splice(index, 1);
    void returnFocus(id);
  }

  async function returnFocus(id: string) {
    const triggerElement = triggerElements.value.get(id);
    await nextTick();
    triggerElement?.focus();
    triggerElements.value.delete(id);
  }

  return {
    openModal,
    closeModal,
    modalStack: computed(() => stack.value),
  };
}
