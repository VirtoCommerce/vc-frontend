import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcPopover } from "@/ui-kit/components/molecules";

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

// Mirrors the filter drawers: applying disables the trigger while the list reloads.
const DisablingHost = defineComponent({
  components: { VcPopover },

  props: {
    disabled: { type: Boolean, default: false },
    triggerKey: { type: Number, default: 0 },
  },

  template: `
    <VcPopover role="dialog" aria-label="Filters" :disabled="disabled">
      <template #default="{ triggerProps }">
        <button :key="triggerKey" class="trigger" :disabled="disabled" v-bind="triggerProps">Open</button>
      </template>

      <template #content>
        <button class="inside">Inside</button>
      </template>
    </VcPopover>
  `,
});

// lodash `merge` drops undefined overrides, so the role is opted into per case, never defaulted here.
const createWrapper = createWrapperFactory(mount, Host, {
  attachTo: document.body,
});

function createDialogWrapper() {
  return createWrapper({ props: { role: "dialog" } });
}

async function open(wrapper: ReturnType<typeof createWrapper>) {
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

      wrapper.unmount();
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

      wrapper.unmount();
    });

    it("gives alertdialog the same contract as dialog", async () => {
      const wrapper = createWrapper({ props: { role: "alertdialog" } });
      await open(wrapper);

      expect(wrapper.get(".vc-popover__body").attributes("tabindex")).toBe("-1");

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([false]);

      wrapper.unmount();
    });

    it("leaves a role-less popover out of the tab order", async () => {
      const wrapper = createWrapper();
      await open(wrapper);

      expect(wrapper.get(".vc-popover__body").attributes("tabindex")).toBeUndefined();

      wrapper.unmount();
    });

    it("moves focus to the panel when it opens", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);

      expect(document.activeElement).toBe(wrapper.get(".vc-popover__body").element);

      wrapper.unmount();
    });

    it("keeps the focus a consumer placed inside the panel before the panel could take it", async () => {
      const wrapper = createDialogWrapper();

      void wrapper.get("button.trigger").trigger("click");
      (wrapper.get("button.inside").element as HTMLElement).focus();
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.inside").element);

      wrapper.unmount();
    });
  });

  describe("escape", () => {
    it("closes the dialog from inside the panel", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([false]);

      wrapper.unmount();
    });

    it("is ignored inside a popover that is not a dialog", async () => {
      const wrapper = createWrapper();
      await open(wrapper);

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });

      expect(wrapper.findComponent(VcPopover).emitted("toggle")?.at(-1)).toEqual([true]);

      wrapper.unmount();
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

      wrapper.unmount();
    });

    it("returns focus to the element inside the trigger that had it, not to the first focusable", async () => {
      const wrapper = createDialogWrapper();
      (wrapper.get("button.trigger-extra").element as HTMLElement).focus();

      await open(wrapper);
      (wrapper.get("button.inside").element as HTMLElement).focus();

      await wrapper.get("button.inside").trigger("keydown", { key: "Escape" });
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.trigger-extra").element);

      wrapper.unmount();
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

      wrapper.unmount();
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

      wrapper.unmount();
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

      wrapper.unmount();
    });

    it("does not steal focus that already sits outside the panel", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (wrapper.get("button.external").element as HTMLElement).focus();

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.external").element);

      wrapper.unmount();
    });

    it("leaves focus on the document when nothing inside the panel held it", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (document.activeElement as HTMLElement).blur();

      await wrapper.get("button.trigger").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(document.body);

      wrapper.unmount();
    });

    it("yields to a consumer that moves focus out of the panel while closing", async () => {
      const wrapper = createDialogWrapper();
      await open(wrapper);
      (wrapper.get("button.inside").element as HTMLElement).focus();

      await wrapper.get("button.consumer-close").trigger("click");
      await nextTick();

      expect(document.activeElement).toBe(wrapper.get("button.external").element);

      wrapper.unmount();
    });
  });
});
