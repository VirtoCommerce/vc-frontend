import { readonly, ref } from "vue";

const isBodyScrollable = ref(true);

function toggleBodyScrollable(value = true) {
  isBodyScrollable.value = value;
}

export function useDomUtils() {
  return {
    isBodyScrollable: readonly(isBodyScrollable),
    toggleBodyScrollable,
  };
}
