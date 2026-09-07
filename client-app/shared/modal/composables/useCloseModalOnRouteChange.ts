import { watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Closes the modal (with its usual close transition) when the user navigates to a different page —
 * e.g. clicking a product link inside the modal. The modal stack itself is route-agnostic (rendered
 * outside RouterView by ModalHost), so it doesn't unmount on its own when the route changes.
 */
export function useCloseModalOnRouteChange(close: () => void) {
  const route = useRoute();

  watch(() => route.path, close);
}
