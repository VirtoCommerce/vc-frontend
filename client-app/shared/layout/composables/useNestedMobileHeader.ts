import { eagerComputed } from "@vueuse/core";
import { computed, ref, shallowRef, Slots, warn } from "vue";

const customSlots = shallowRef<Slots>({});
const isAnimated = ref(false);
const isSlotsExist = eagerComputed(() => !!Object.keys(customSlots.value).length);

function setSlots(slots: Slots) {
  if (isSlotsExist.value) {
    warn("The component can only be active in one instance.");
  } else {
    customSlots.value = slots;
  }
}

function resetSlots() {
  if (isSlotsExist.value) {
    customSlots.value = {};
  }
}

export default function useNestedMobileHeader() {
  return {
    setSlots,
    resetSlots,
    isSlotsExist,
    customSlots: computed(() => customSlots.value),
    isAnimated,
  };
}
