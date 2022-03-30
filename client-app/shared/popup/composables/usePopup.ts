import { computed, shallowRef, triggerRef } from "vue";
import { ClosePopupHandle, IPopup } from "..";
import _ from "lodash";

const stack = shallowRef<IPopup[]>([]);

export default function usePopup() {
  function openPopup(options: IPopup): ClosePopupHandle {
    const id = options.id || _.uniqueId();

    stack.value.push({ id, ...options });
    triggerRef(stack);

    return () => closePopup(id);
  }

  function closePopup(id?: string) {
    if (!id) {
      // Close last popup window
      stack.value.pop();
      triggerRef(stack);
      return;
    }

    const index = stack.value.findIndex((item) => item.id === id);

    if (index === -1) return;

    stack.value.splice(index, 1);
    triggerRef(stack);
  }

  return {
    openPopup,
    closePopup,
    popupStack: computed(() => stack.value),
  };
}
