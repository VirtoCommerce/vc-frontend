import type { Directive } from "vue";

/** @deprecated */
export const clickOutside: Directive = {
  beforeMount(el, binding) {
    const handler = binding.value;

    if (typeof handler !== "function") {
      return;
    }

    el._outsideClickHandler = function (event: Event) {
      if (!el.contains(event.target)) {
        event.stopPropagation();
        handler(event);
      }
    };

    document.addEventListener("mouseup", el._outsideClickHandler);
    document.addEventListener("touchstart", el._outsideClickHandler);
  },

  unmounted(el) {
    const handler = el._outsideClickHandler;

    if (!handler) {
      return;
    }

    document.removeEventListener("mouseup", handler);
    document.removeEventListener("touchstart", handler);

    delete el._outsideClickHandler;
  },
};
