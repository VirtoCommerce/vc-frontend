import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { usePopoverEscape } from "./usePopoverEscape";

enableAutoUnmount(afterEach);

function mountTrigger(opened: boolean) {
  const onClick = vi.fn();
  const isOpen = ref(opened);

  mount(
    defineComponent({
      setup() {
        const trigger = ref<HTMLButtonElement>();

        usePopoverEscape(trigger, isOpen);

        return { trigger, onClick };
      },

      template: `<button ref="trigger" type="button" @click="onClick">Menu</button>`,
    }),
    { attachTo: document.body },
  );

  return onClick;
}

function pressEscape(handled = false): void {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });

  if (handled) {
    event.preventDefault();
  }

  document.body.dispatchEvent(event);
}

describe("usePopoverEscape", () => {
  it("closes an open popover through its trigger on Escape anywhere on the page", () => {
    const onClick = mountTrigger(true);

    pressEscape();

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("leaves a closed popover alone", () => {
    const onClick = mountTrigger(false);

    pressEscape();

    expect(onClick).not.toHaveBeenCalled();
  });

  it("leaves the popover alone when something else has taken the Escape", () => {
    const onClick = mountTrigger(true);

    pressEscape(true);

    expect(onClick).not.toHaveBeenCalled();
  });
});
