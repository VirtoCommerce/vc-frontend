import { onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

export function useHorizontalScrollSync(element1: Ref<HTMLElement | null>, element2: Ref<HTMLElement | null>) {
  function syncScroll(event: Event) {
    if (element1.value && element2.value) {
      if (event.target === element1.value) {
        element2.value.scrollLeft = element1.value.scrollLeft;
      } else {
        element1.value.scrollLeft = element2.value.scrollLeft;
      }
    }
  }

  onMounted(() => {
    if (element1.value && element2.value) {
      element1.value.addEventListener("scroll", syncScroll);
      element2.value.addEventListener("scroll", syncScroll);
    }
  });

  onUnmounted(() => {
    if (element1.value && element2.value) {
      element1.value.removeEventListener("scroll", syncScroll);
      element2.value.removeEventListener("scroll", syncScroll);
    }
  });
}
