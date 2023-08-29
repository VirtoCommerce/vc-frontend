import _ from "lodash";
import { computed, markRaw, ref } from "vue";
import type { ClosePopupHandle, IPopup } from "..";

const stack = ref<IPopup[]>([]);

export function usePopup() {
  function openPopup(options: IPopup): ClosePopupHandle {
    const id = options.id || _.uniqueId();

    stack.value.push({
      id,
      props: options.props,
      component: typeof options.component === "string" ? options.component : markRaw(options.component),
    });

    return () => closePopup(id);
  }

  function closePopup(id?: string) {
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
    openPopup,
    closePopup,
    popupStack: computed(() => stack.value),
  };
}
