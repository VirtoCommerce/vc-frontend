import { computed, ref, shallowRef } from "vue";
import { IPopup } from "..";

const stack = ref<IPopup[]>([]);

export default function usePopup() {
  return {
    popupStack: computed(() => stack.value),

    openPopup({ component, props }: IPopup) {
      console.log(`Open popup`);
      stack.value.push({
        component: shallowRef(component),
        props,
      });
    },

    closePopup() {
      console.log(`Close popup`);
      stack.value.pop();
    },
  };
}
