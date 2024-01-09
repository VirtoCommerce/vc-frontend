import { uniqueId } from "lodash";
import { computed, markRaw, ref } from "vue";
import type { ClosePopupHandle, IPopup } from "..";

const stack = ref<IPopup[]>([]);

export function useModal() {
  function openModal(options: IPopup): ClosePopupHandle {
    const id = options.id || uniqueId();

    stack.value.push({
      id,
      props: options.props,
      component: typeof options.component === "string" ? options.component : markRaw(options.component),
    });

    return () => closeModal(id);
  }

  function closeModal(id?: string) {
    if (!id) {
      // Close last popup window
      stack.value.pop();
      return;
    }

    const index = stack.value.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    stack.value.splice(index, 1);
  }

  return {
    openModal,
    closeModal,
    popupStack: computed(() => stack.value),
  };
}
