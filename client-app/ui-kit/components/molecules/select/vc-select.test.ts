import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcCheckbox, VcIcon, VcInputDetails, VcLabel, VcScrollbar, VcTooltip } from "@/ui-kit/components/atoms";
import { VcButton, VcDropdownMenu, VcInput, VcMenuItem, VcPopover, VcSelect } from "@/ui-kit/components/molecules";
import type { VueWrapper } from "@vue/test-utils";

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

// A select inside a dialog popover: the shape both filter drawers ship, minus the teleport, so
// Escape really travels from the select up to the dialog.
const Host = defineComponent({
  components: { VcPopover, VcSelect },

  props: {
    clearable: { type: Boolean, default: false },
    selected: { type: String, default: undefined },
  },

  setup() {
    return { items: ["Custom date", "Last day", "Last week"] };
  },

  template: `
    <VcPopover role="dialog" aria-label="Filters">
      <template #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <VcSelect :items="items" label="Created date" :clearable="clearable" :model-value="selected" />
      </template>
    </VcPopover>
  `,
});

// The other trigger shape: a slotted trigger, plus the clear and arrow buttons that live in the
// input's append slot — each carries its own Escape binding.
const SlottedHost = defineComponent({
  components: { VcPopover, VcSelect },

  setup() {
    return { items: ["Custom date", "Last day"] };
  },

  template: `
    <VcPopover role="dialog" aria-label="Filters">
      <template #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <VcSelect :items="items" model-value="Last day" clearable>
          <template #selected="{ item }">{{ item }}</template>
        </VcSelect>
      </template>
    </VcPopover>
  `,
});

const createWrapper = createWrapperFactory(mount, Host, {
  attachTo: document.body,
  global: {
    // VcDropdownMenu renders VcPopover itself, so the kit has to be resolvable globally, not only
    // on the host.
    components: {
      VcButton,
      VcCheckbox,
      VcDropdownMenu,
      VcIcon,
      VcInput,
      VcInputDetails,
      VcLabel,
      VcMenuItem,
      VcPopover,
      VcScrollbar,
      VcTooltip,
    },
  },
});

const createSlottedWrapper = createWrapperFactory(mount, SlottedHost, {
  attachTo: document.body,
  global: {
    components: {
      VcButton,
      VcCheckbox,
      VcDropdownMenu,
      VcIcon,
      VcInput,
      VcInputDetails,
      VcLabel,
      VcMenuItem,
      VcPopover,
      VcScrollbar,
      VcTooltip,
    },
  },
});

async function openDialogAndSelect(wrapper: VueWrapper) {
  await wrapper.get("button.trigger").trigger("click");
  await nextTick();

  await wrapper.get(".vc-select input").trigger("focus");
  await nextTick();
}

const DIALOG_NAME = "Filters";

// Named, not positional: once the dropdown is open there are two panels, and the shipping consumers
// teleport the list out of the dialog subtree entirely.
function dialogIsOpen(wrapper: VueWrapper): boolean {
  return !wrapper.get(`.vc-popover__body[aria-label="${DIALOG_NAME}"]`).attributes("style")?.includes("display: none");
}

describe("VcSelect inside a dialog popover", () => {
  it("opens its dropdown without closing the dialog", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("consumes Escape while its dropdown is open, leaving the dialog open", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    await wrapper.get(".vc-select input").trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).not.toContain("vc-select--opened");
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("lets Escape reach the dialog once its dropdown is closed", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    await wrapper.get(".vc-select input").trigger("keydown", { key: "Escape" });
    await nextTick();
    await wrapper.get(".vc-select input").trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(dialogIsOpen(wrapper)).toBe(false);
  });

  it("ignores an auto-repeated Escape, so holding the key does not close the dialog too", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    const option = wrapper.get(".vc-menu-item");
    (option.element as HTMLElement).focus();
    await option.trigger("keydown", { key: "Escape" });
    await nextTick();

    // The first press moved focus to the trigger; the repeat lands there with the list already shut.
    await wrapper.get(".vc-select input").trigger("keydown", { key: "Escape", repeat: true });
    await nextTick();

    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("consumes Escape from an option and hands focus back to its own trigger", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    const option = wrapper.get(".vc-menu-item");
    (option.element as HTMLElement).focus();
    await option.trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).not.toContain("vc-select--opened");
    expect(dialogIsOpen(wrapper)).toBe(true);
    expect(wrapper.get(".vc-select input").element).toBe(document.activeElement);
  });

  // The trigger now keeps focus when its list closes, so the keyboard has to be able to open it again:
  // the input's `@focus` handler cannot fire for focus it never lost.
  it("reopens its dropdown on Enter after Escape handed focus back to the trigger", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    const option = wrapper.get(".vc-menu-item");
    (option.element as HTMLElement).focus();
    await option.trigger("keydown", { key: "Escape" });
    await nextTick();

    await wrapper.get(".vc-select input").trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("opens its dropdown on ArrowDown and moves focus to the first option", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    const option = wrapper.get(".vc-menu-item");
    (option.element as HTMLElement).focus();
    await option.trigger("keydown", { key: "Escape" });
    await nextTick();

    await wrapper.get(".vc-select input").trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");
    expect(wrapper.get(".vc-menu-item").element.contains(document.activeElement)).toBe(true);
  });

  // The other half of the same handler: the list is already open (focus opened it), so ArrowDown has
  // to step into it rather than re-open it.
  it("moves focus into the open list on ArrowDown from the trigger", async () => {
    const wrapper = createWrapper();
    await openDialogAndSelect(wrapper);

    await wrapper.get(".vc-select input").trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    expect(wrapper.get(".vc-menu-item").element.contains(document.activeElement)).toBe(true);
  });

  it("opens the slotted trigger's dropdown on ArrowDown", async () => {
    const wrapper = createSlottedWrapper();

    await wrapper.get("button.trigger").trigger("click");
    await nextTick();

    await wrapper.get(".vc-select__button").trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");
  });

  it("consumes Escape from the slotted trigger while its dropdown is open", async () => {
    const wrapper = createSlottedWrapper();

    await wrapper.get("button.trigger").trigger("click");
    await nextTick();
    await wrapper.get(".vc-select__button").trigger("click");
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");

    await wrapper.get(".vc-select__button").trigger("keydown", { key: "Escape" });
    await nextTick();

    expect(wrapper.get(".vc-select").classes()).not.toContain("vc-select--opened");
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  // Both buttons live in the input trigger's append slot, so this is the non-slotted shape.
  it.each([[".vc-select__clear"], [".vc-select__arrow"]])(
    "consumes Escape from %s while its dropdown is open",
    async (selector) => {
      const wrapper = createWrapper({ props: { clearable: true, selected: "Last day" } });
      await openDialogAndSelect(wrapper);

      expect(wrapper.get(".vc-select").classes()).toContain("vc-select--opened");

      await wrapper.get(selector).trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(wrapper.get(".vc-select").classes()).not.toContain("vc-select--opened");
      expect(dialogIsOpen(wrapper)).toBe(true);
    },
  );
});
