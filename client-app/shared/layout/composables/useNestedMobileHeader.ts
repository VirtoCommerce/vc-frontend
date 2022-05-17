import { computed, readonly, ref, shallowRef, Slots, warn } from "vue";
import { eagerComputed } from "@vueuse/core";

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

export default function useNestedMobileHeader({ writable = false } = {}) {
  return {
    setSlots,
    resetSlots,
    isSlotsExist,
    customSlots: computed(() => customSlots.value),
    isAnimated: writable ? isAnimated : readonly(isAnimated),
  };
}
