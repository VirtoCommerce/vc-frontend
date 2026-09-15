import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcPopover } from "@/ui-kit/components/molecules";
import type { VueWrapper } from "@vue/test-utils";

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

const Host = defineComponent({
  components: { VcPopover },

  props: {
    role: { type: String, default: undefined },
  },

  setup() {
    function closeAndFocusExternal(close: () => void, external: HTMLElement | null) {
      close();
      external?.focus();
    }

    return { closeAndFocusExternal };
  },

  template: `
    <div>
      <button ref="external" class="external">External</button>

      <VcPopover :role="role" aria-label="Filters">
        <template #default="{ triggerProps }">
          <button class="trigger" v-bind="triggerProps">Open</button>

          <button class="trigger-extra">Extra</button>
        </template>

        <template #content="{ close }">
          <button class="inside">Inside</button>
          <button class="consumer-close" @click="closeAndFocusExternal(close, $refs.external)">Close</button>
        </template>
      </VcPopover>
    </div>
  `,
});

// Mirrors VcDatePicker: the consumer claims focus for its own content from @toggle, one tick later.
const ClaimingHost = defineComponent({
  components: { VcPopover },

  setup() {
    function onToggle(opened: boolean, claimed: HTMLElement | null) {
      if (!opened) {
        return;
      }

      void nextTick(() => claimed?.focus());
    }

    return { onToggle };
  },

  template: `
    <VcPopover role="dialog" aria-label="Filters" @toggle="onToggle($event, $refs.claimed)">
      <template #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <button ref="claimed" class="claimed">Claimed</button>
      </template>
    </VcPopover>
  `,
});

// The shape both shipping drawers use (lazy) and the one the Dialog story uses (#trigger slot),
// which wires its listeners on the wrapper instead of the consumer's element.
const ShapeHost = defineComponent({
  components: { VcPopover },

  props: {
    lazy: { type: Boolean, default: false },
    triggerSlot: { type: Boolean, default: false },
  },

  template: `
    <VcPopover role="dialog" aria-label="Filters" :lazy="lazy">
      <template v-if="triggerSlot" #trigger="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template v-else #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <button class="inside">Inside</button>
      </template>
    </VcPopover>
  `,
});

// Mirrors the filter drawers: applying disables the trigger while the list reloads.
const DisablingHost = defineComponent({
  components: { VcPopover },

  props: {
    disabled: { type: Boolean, default: false },
    triggerKey: { type: Number, default: 0 },
    role: { type: String, default: "dialog" },
    showTrigger: { type: Boolean, default: true },
  },

  template: `
    <div>
      <button class="elsewhere">Elsewhere</button>

      <VcPopover :role="role" aria-label="Filters" :disabled="disabled">
        <template #default="{ triggerProps }">
          <button
            v-if="showTrigger"
            :key="triggerKey"
            class="trigger"
            :disabled="disabled"
            v-bind="triggerProps"
          >
            Open
          </button>
        </template>

        <template #content>
          <button class="inside">Inside</button>
        </template>
      </VcPopover>
    </div>
  `,
});

// Two dialog popovers nested the way the drawers nest a select or a calendar inside themselves.
const NestedHost = defineComponent({
  components: { VcPopover },

  props: {
    hover: { type: Boolean, default: false },
  },

  template: `
    <VcPopover role="dialog" aria-label="Outer" :hover="hover">
      <template #default="{ triggerProps }">
        <button class="trigger" v-bind="triggerProps">Open outer</button>
      </template>

      <template #content>
        <VcPopover role="dialog" aria-label="Inner">
          <template #default="{ triggerProps }">
            <button class="inner-trigger" v-bind="triggerProps">Open inner</button>
          </template>

          <template #content>
            <button class="inner-inside">Inner content</button>
          </template>
        </VcPopover>
      </template>
    </VcPopover>
  `,
});

function panelByName(wrapper: VueWrapper, name: string) {
  return wrapper.findAll(".vc-popover__body").find((panel) => panel.attributes("aria-label") === name);
}

function isPanelOpen(wrapper: VueWrapper, name: string): boolean {
  const panel = panelByName(wrapper, name);

  return Boolean(panel && !panel.attributes("style")?.includes("display: none"));
}

// lodash `merge` drops undefined overrides, so the role is opted into per case, never defaulted here.
const createWrapper = createWrapperFactory(mount, Host, {
  attachTo: document.body,
});

function createDialogWrapper() {
  return createWrapper({ props: { role: "dialog" } });
}

async function open(wrapper: VueWrapper) {
  await wrapper.get("button.trigger").trigger("click");
  await nextTick();
}

describe("VcPopover", () => {
  describe("dialog role", () => {
    it("names the panel and makes it programmatically focusable", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);

      const panel = wrapper.get(".vc-popover__body");

      expect(panel.attributes("role")).toBe("dialog");
      expect(panel.attributes("aria-label")).toBe("Filters");
      expect(panel.attributes("tabindex")).toBe("-1");
    });

    it("lets a consumer claiming focus from @toggle win the panel, without focusing it first", async () => {
      const wrapper = mount(ClaimingHost, { attachTo: document.body });
      const focused: string[] = [];
      const record = (event: FocusEvent) => focused.push((event.target as HTMLElement).className);

      document.addEventListener("focusin", record);

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      await nextTick();

      document.removeEventListener("focusin", record);

      expect(focused).toEqual(["claimed"]);
      expect(document.activeElement).toBe(wrapper.get("button.claimed").element);
    });

    it("gives alertdialog the same contract as dialog", async () => {
      const wrapper = createWrapper({ props: { role: "alertdialog" } });
      await open(wrapper);

      expect(wrapper.get(".vc-popover__body").attributes("tabindex")).toBe("-1");

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([false]);
    });

    it("leaves a role-less popover out of the tab order", async () => {
      const wrapper = createWrapper();
      await open(wrapper);

      expect(wrapper.get(".vc-popover__body").attributes("tabindex")).toBeUndefined();
    });

    it("moves focus to the panel when it opens", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);

      expect(document.activeElement).toBe(wrapper.get(".vc-popover__body").element);
    });

    it("keeps the focus a consumer placed inside the panel before the panel could take it", async () => {
      const wrapper = createDialogWrapper();

      void wrapper.get("button.trigger").trigger("click");
      (wrapper.get("button.inside").element as HTMLElement).focus();
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.inside").element);
    });
  });

  describe("trigger and lazy shapes", () => {
    it.each([
      ["default slot, eager", { lazy: false, triggerSlot: false }],
      ["default slot, lazy", { lazy: true, triggerSlot: false }],
      ["#trigger slot, eager", { lazy: false, triggerSlot: true }],
      ["#trigger slot, lazy", { lazy: true, triggerSlot: true }],
    ])("keeps the whole dialog contract with a %s popover", async (_name, props) => {
      const wrapper = mount(ShapeHost, { attachTo: document.body, props });

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      const panel = wrapper.get(".vc-popover__body");

      expect(panel.attributes("role")).toBe("dialog");
      expect(panel.attributes("aria-label")).toBe("Filters");
      expect(document.activeElement).toBe(panel.element);

      (wrapper.get("button.inside").element as HTMLElement).focus();
      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([false]);
      expect(document.activeElement).toBe(wrapper.get("button.trigger").element);
    });
  });

  describe("nesting", () => {
    async function openBothLevels(wrapper: VueWrapper) {
      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      await wrapper.get("button.inner-trigger").trigger("click");
      await nextTick();
    }

    it("closes one level per Escape", async () => {
      const wrapper = mount(NestedHost, { attachTo: document.body });
      await openBothLevels(wrapper);

      expect(isPanelOpen(wrapper, "Inner")).toBe(true);

      await wrapper.get("button.inner-inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(isPanelOpen(wrapper, "Inner")).toBe(false);
      expect(isPanelOpen(wrapper, "Outer")).toBe(true);
    });

    it("does not pull focus into a hover popover, which would fight its own focusout", async () => {
      const wrapper = mount(NestedHost, { attachTo: document.body, props: { hover: true } });

      await wrapper.get("button.trigger").trigger("focusin");
      await nextTick();
      await nextTick();

      expect(isPanelOpen(wrapper, "Outer")).toBe(true);
      expect(document.activeElement).not.toBe(panelByName(wrapper, "Outer")?.element);
    });
  });

  describe("aria-haspopup on the trigger", () => {
    it.each([
      ["dialog", "dialog"],
      ["alertdialog", "dialog"],
      ["menu", "menu"],
      ["listbox", "listbox"],
    ])("announces role %s as %s", async (role, haspopup) => {
      const wrapper = createWrapper({ props: { role } });
      await open(wrapper);

      expect(wrapper.get("button.trigger").attributes("aria-haspopup")).toBe(haspopup);
    });

    it("announces no popup kind for a tooltip, which has no token", async () => {
      const wrapper = createWrapper({ props: { role: "tooltip" } });
      await open(wrapper);

      expect(wrapper.get("button.trigger").attributes("aria-haspopup")).toBeUndefined();
    });

    // Silencing these triggers would lose an announcement they have always made; the fix for the
    // remaining mismatch is a real role on those panels, tracked separately.
    it("keeps the historical dialog default for a panel that declares no role", async () => {
      const wrapper = createWrapper();
      await open(wrapper);

      expect(wrapper.get("button.trigger").attributes("aria-haspopup")).toBe("dialog");
    });
  });

  describe("escape", () => {
    it("closes the dialog from inside the panel", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([false]);
    });

    it("is ignored inside a popover that is not a dialog", async () => {
      const wrapper = createWrapper();
      await open(wrapper);

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([true]);
    });
  });

  describe("focus return", () => {
    it("returns focus to the trigger when the panel closes", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (wrapper.get("button.inside").element as HTMLElement).focus();

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.trigger").element);
    });

    it("returns focus to the element inside the trigger that had it, not to the first focusable", async () => {
      const wrapper = createDialogWrapper();
      (wrapper.get("button.trigger-extra").element as HTMLElement).focus();

      await open(wrapper);
      (wrapper.get("button.inside").element as HTMLElement).focus();

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.trigger-extra").element);
    });

    it("retries the return when the trigger was disabled by the close itself", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (wrapper.get("button.inside").element as HTMLElement).focus();

      void wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await wrapper.setProps({ disabled: true });
      await nextTick();

      expect(document.activeElement).toBe(document.body);

      await wrapper.setProps({ disabled: false });
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.trigger").element);
    });

    it("leaves focus alone if the user moved on while the trigger was disabled", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (wrapper.get("button.inside").element as HTMLElement).focus();

      void wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await wrapper.setProps({ disabled: true });
      await nextTick();

      (wrapper.get("button.elsewhere").element as HTMLElement).focus();

      await wrapper.setProps({ disabled: false });
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.elsewhere").element);
    });

    it("returns focus to a trigger the consumer re-rendered as a new element", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (wrapper.get("button.inside").element as HTMLElement).focus();

      void wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await wrapper.setProps({ disabled: true });
      await nextTick();

      await wrapper.setProps({ disabled: false, triggerKey: 1 });
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.trigger").element);
    });

    it("closes instead of staying open behind a disabled trigger", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      await wrapper.setProps({ disabled: true });
      await nextTick();

      expect(wrapper.get("button.trigger").attributes("aria-expanded")).toBe("false");

      await wrapper.setProps({ disabled: false });
      await nextTick();

      expect(wrapper.find(".vc-popover__body").attributes("style")).toContain("display: none");
    });

    // jsdom keeps focus on a disabled button where a browser blurs it, so focus is dropped here by
    // removing the trigger in the same flush — the state the retry exists to recover from.
    async function disableWhileTriggerHasFocus(wrapper: VueWrapper) {
      (wrapper.get("button.trigger").element as HTMLElement).focus();

      await wrapper.setProps({ disabled: true, showTrigger: false });
      await nextTick();
      expect(document.activeElement).toBe(document.body);

      await wrapper.setProps({ disabled: false, showTrigger: true });
      await nextTick();
      await nextTick();
    }

    it("returns focus to the trigger of a dialog once it is enabled again", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      await disableWhileTriggerHasFocus(wrapper);

      expect(document.activeElement).toBe(wrapper.get("button.trigger").element);
    });

    it("does not return focus for a popover that is not a dialog", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body, props: { role: "menu" } });

      await disableWhileTriggerHasFocus(wrapper);

      expect(document.activeElement).toBe(document.body);
    });

    it("forgets a failed return once the popover is opened again", async () => {
      const wrapper = mount(DisablingHost, { attachTo: document.body });

      // Fail a return: the trigger is gone by the time the panel hands focus back.
      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (wrapper.get("button.inside").element as HTMLElement).focus();
      await wrapper.setProps({ showTrigger: false });
      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      // Reopen and close cleanly, with focus outside the panel so nothing is owed.
      await wrapper.setProps({ showTrigger: true });
      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (wrapper.get("button.elsewhere").element as HTMLElement).focus();
      await wrapper.get("button.trigger").trigger("click");
      await nextTick();
      (document.activeElement as HTMLElement).blur();

      // An unrelated disable cycle must not resurrect the stale debt.
      await wrapper.setProps({ disabled: true });
      await nextTick();
      await wrapper.setProps({ disabled: false });
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(document.body);
    });

    it("does not steal focus that already sits outside the panel", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (wrapper.get("button.external").element as HTMLElement).focus();

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.external").element);
    });

    it("leaves focus on the document when nothing inside the panel held it", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (document.activeElement as HTMLElement).blur();

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(document.body);
    });

    it("yields to a consumer that moves focus out of the panel while closing", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (wrapper.get("button.inside").element as HTMLElement).focus();

      await wrapper.get("button.consumer-close").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.external").element);
    });
  });
});
