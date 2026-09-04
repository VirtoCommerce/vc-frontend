import { onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { cancelAnchorScroll, scrollToAnchor } from "../anchors";

export function useAnchorScroll(content?: () => unknown): void {
  const route = useRoute();

  let awaitingContent = false;

  function scroll() {
    awaitingContent = false;
    void scrollToAnchor(route.hash);
  }

  watch(
    () => [route.path, route.hash] as const,
    ([path], previous) => {
      // Undefined on the immediate run, so the page we opened on never counts as a move.
      const movedToAnotherPage = previous !== undefined && previous[0] !== path;

      if (content && (movedToAnotherPage || awaitingContent)) {
        cancelAnchorScroll();
        awaitingContent = true;
        return;
      }

      scroll();
    },
    { immediate: true },
  );

  if (content) {
    watch(content, () => {
      if (awaitingContent) {
        scroll();
      }
    });
  }

  onBeforeUnmount(cancelAnchorScroll);
}
