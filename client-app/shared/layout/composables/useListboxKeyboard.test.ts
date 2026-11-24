import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { useListboxKeyboard } from "./useListboxKeyboard";
import type { VueWrapper } from "@vue/test-utils";

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

const onFocus = vi.fn();

// VcPopover's dialog with two lists, as in the preferences menu: the first has a disabled option.
async function mountDialog(): Promise<VueWrapper> {
  onFocus.mockReset();

  const wrapper = mount(
    defineComponent({
      setup() {
        const first = ref<HTMLElement>();
        const second = ref<HTMLElement>();
        const { moveFocus } = useListboxKeyboard(first, { onFocus });

        useListboxKeyboard(second);

        return { first, second, moveFocus };
      },

      template: `
        <div id="dialog" role="dialog" tabindex="-1">
          <input data-test-id="search" @keydown.down.prevent="moveFocus(1)" />

          <div ref="first" role="listbox">
            <button id="a" type="button" role="option">A</button>
            <button id="b" type="button" role="option" disabled>B</button>
            <button id="c" type="button" role="option">C</button>
            <button id="d" type="button" role="option">D</button>
          </div>

          <div ref="second" role="listbox">
            <button id="e" type="button" role="option">E</button>
            <button id="f" type="button" role="option">F</button>
          </div>
        </div>
      `,
    }),
    { attachTo: document.body },
  );
  // The listeners attach once the template refs are set.
  await nextTick();
  return wrapper;
}

async function press(wrapper: VueWrapper, id: string, key: string, init: KeyboardEventInit = {}): Promise<void> {
  const element = wrapper.get<HTMLElement>(`#${id}`);

  element.element.focus();
  await element.trigger("keydown", { key, ...init });
}

function focusedId(): string {
  return document.activeElement?.id ?? "";
}

describe("useListboxKeyboard: in a list", () => {
  it("moves one option per arrow, steps over a disabled one and wraps at both ends", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "a", "ArrowDown");
    expect(focusedId()).toBe("c");

    await press(wrapper, "d", "ArrowDown");
    expect(focusedId()).toBe("a");

    await press(wrapper, "a", "ArrowUp");
    expect(focusedId()).toBe("d");
  });

  it("goes to the first option on Home and to the last on End", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "c", "Home");
    expect(focusedId()).toBe("a");

    await press(wrapper, "c", "End");
    expect(focusedId()).toBe("d");
  });

  it("keeps an arrow with a modifier for the browser", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "a", "ArrowDown", { shiftKey: true });

    expect(focusedId()).toBe("a");
  });

  it("stays inside its own list", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "f", "ArrowDown");

    expect(focusedId()).toBe("e");
  });

  it("reports each option it focuses", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "a", "End");

    expect(onFocus).toHaveBeenCalledWith(wrapper.get("#d").element);
  });
});

describe("useListboxKeyboard: from outside the list", () => {
  it("enters the dialog's first list from the dialog: Down at the first option, Up at the last", async () => {
    const wrapper = await mountDialog();

    await press(wrapper, "dialog", "ArrowDown");
    expect(focusedId()).toBe("a");

    await press(wrapper, "dialog", "ArrowUp");
    expect(focusedId()).toBe("d");
  });

  it("leaves the dialog alone for an arrow from a field inside it", async () => {
    const wrapper = await mountDialog();
    const search = wrapper.get<HTMLInputElement>('[data-test-id="search"]');
    search.element.focus();

    await search.trigger("keydown", { key: "ArrowUp" });

    expect(document.activeElement).toBe(search.element);
  });

  it("enters the list at the first option when a field asks it to", async () => {
    const wrapper = await mountDialog();
    const search = wrapper.get<HTMLInputElement>('[data-test-id="search"]');
    search.element.focus();

    await search.trigger("keydown", { key: "ArrowDown" });

    expect(focusedId()).toBe("a");
  });
});
