import { onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { cancelAnchorScroll, scrollToAnchor } from "../anchors";

export function useAnchorScroll(content?: () => unknown): void {
  const route = useRoute();

  let currentPath: string | undefined;
  let awaitingContent = false;

  function scroll() {
    awaitingContent = false;
    void scrollToAnchor(route.hash);
  }

  watch(
    () => [route.path, route.hash],
    () => {
      const movedToAnotherPage = currentPath !== undefined && currentPath !== route.path;
      currentPath = route.path;

      if (movedToAnotherPage && content) {
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
