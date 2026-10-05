import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory, describeScrollBox } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import { focusFirstElement } from "@/ui-kit/utilities/focus";
import VcSelect from "./vc-select.vue";
import type { VueWrapper } from "@vue/test-utils";

const ITEMS = ["Albania", "Belgium", "China"];

// VcScrollbar debounces its edge measurement by 100 ms.
async function afterContentSettles() {
  await new Promise((resolve) => setTimeout(resolve, 160));
}

const OBJECT_ITEMS = [
  { id: "1", name: "Albania" },
  { id: "2", name: "Belgium" },
];

// "bel" prefixes Belgium and sits inside Abel: tells includes from startsWith and pins the
// order in which prefix matches are hoisted.
const AFFIX_ITEMS = ["Abel", "Belgium"];

// Real strings for the parameterised keys; with empty messages t() would return the bare key.
const countingI18n = createI18n({
  locale: "en",
  legacy: false,
  missingWarn: false,
  messages: {
    en: {
      ui_kit: {
        select: {
          items_selected: "{0} items selected",
          results_available: "{0} results available",
          selected_of_total: "{selected} of {total}",
          select_all_label: "Select all, {selected} of {total}",
        },
      },
    },
  },
});

// attachTo: document.activeElement only tracks attached nodes, and a leftover instance would
// answer the next test's queries, hence the auto-unmount.
enableAutoUnmount(afterEach);

// Integration mount on purpose: the trigger, popover, list and checkbox are not stubbed.
// Components go in as an object, not the uiKit plugin, which would duplicate html-safe under
// lodash.merge; only maska is needed. i18n has empty messages, so t() returns keys.
const mountSelect = createWrapperFactory(mount, VcSelect, {
  attachTo: document.body,
  global: { components: UIKitComponents, directives: { maska: vMaska } },
});

type MountOptionsType = NonNullable<Parameters<typeof mount<typeof VcSelect>>[1]>;

function createWrapper(props: MountOptionsType["props"], slots?: MountOptionsType["slots"]) {
  return mountSelect({ props, slots });
}

function createWrapperWithMessages(props: MountOptionsType["props"]) {
  return mountSelect({ props, global: { plugins: [countingI18n] } });
}

describe("VcSelect", () => {
  describe("rendering", () => {
    it("renders a combobox input and one option per item", () => {
      const wrapper = createWrapper({ items: ITEMS });

      expect(wrapper.get("input").attributes("role")).toBe("combobox");
      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });

    it("shows the no-options row for an empty item list", () => {
      const wrapper = createWrapper({ items: [] });

      expect(wrapper.get('[role="option"]').text()).toBe("ui_kit.select.no_options");
    });
  });

  describe("single selection", () => {
    it("emits the item itself when no valueField is set", async () => {
      const wrapper = createWrapper({ items: ITEMS });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([["Belgium"]]);
      expect(wrapper.emitted("change")).toEqual([["Belgium"]]);
    });

    it("emits the valueField value when valueField is set", async () => {
      const wrapper = createWrapper({ items: OBJECT_ITEMS, textField: "name", valueField: "id" });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([["2"]]);
    });

    it("does not re-emit when the same value is picked twice", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    // Single mode compares by identity: an equal but distinct object is a new pick and must emit
    // (date-filter-select.vue rebuilds its ranges on a locale change).
    it("re-emits for a deep-equal but distinct object", async () => {
      const items = [{ code: "al" }, { code: "be" }];
      const wrapper = createWrapper({ items, textField: "code", modelValue: { code: "be" } });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[items[1]]]);
    });

    // An empty-string model matches nothing and must leave the placeholder.
    it("shows the placeholder for an empty model value", () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        modelValue: "",
        placeholder: "Pick one",
      });

      expect(wrapper.get("input").attributes("placeholder")).toBe("Pick one");
    });

    // A value missing from items must not leak into the field as raw text.
    it("does not leak an unmatched valueField model into the field", () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        modelValue: "does-not-exist",
        placeholder: "Pick one",
      });

      expect(wrapper.get("input").attributes("placeholder")).toBe("Pick one");
    });

    it("marks the selected option with aria-selected", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });

      const flags = wrapper.findAll('[role="option"]').map((option) => option.attributes("aria-selected"));

      expect(flags).toEqual(["false", "true", "false"]);
    });
  });

  describe("multiple selection", () => {
    // `M & boolean` keeps Vue's Boolean cast: a valueless `multiple` attribute must not arrive as
    // "" and fall back to single mode. The empty string emulates the shorthand.
    it("treats a valueless multiple attribute as true", () => {
      const wrapper = createWrapper({
        items: ITEMS,
        multiple: "" as unknown as boolean,
        modelValue: [],
      });

      expect(wrapper.findAll('[role="option"] .vc-checkbox')).toHaveLength(ITEMS.length);
    });

    it("adds an item to the array", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: ["Albania"] });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["Albania", "Belgium"]]]);
    });

    it("removes an already selected item", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: ["Albania", "Belgium"] });

      await wrapper.findAll('[role="option"]')[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["Belgium"]]]);
    });

    it("shows the selected count as the placeholder instead of item text", () => {
      const wrapper = createWrapperWithMessages({
        items: ITEMS,
        multiple: true,
        modelValue: ["Albania", "Belgium"],
      });

      expect(wrapper.get("input").attributes("placeholder")).toBe("2 items selected");
    });

    // The multiple model holds valueField values, so the highlight compares values.
    it("marks selected options with aria-selected when valueField is set", () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        multiple: true,
        modelValue: ["2"],
      });

      const flags = wrapper.findAll('[role="option"]').map((option) => option.attributes("aria-selected"));

      expect(flags).toEqual(["false", "true"]);
    });

    // Both modes store valueField values, never whole items.
    it("stores valueField values, not whole items", async () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        multiple: true,
        modelValue: [],
      });

      await wrapper.findAll('[role="option"]')[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["1"]]]);
    });

    // An uninitialised model counts as an empty array.
    it("treats an uninitialised model as empty", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true });

      await wrapper.findAll('[role="option"]')[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["Albania"]]]);
    });

    it("marks the listbox as multiselectable", () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: [] });

      expect(wrapper.get('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
    });

    it("leaves aria-multiselectable off in single mode", () => {
      const wrapper = createWrapper({ items: ITEMS });

      expect(wrapper.get('[role="listbox"]').attributes("aria-multiselectable")).toBeUndefined();
    });
  });

  describe("select all", () => {
    const selectAllProps = { items: ITEMS, multiple: true, selectAll: true };

    it("is absent unless asked for", () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: [] });

      expect(wrapper.find(".vc-select-all").exists()).toBe(false);
    });

    it("is ignored in single mode", () => {
      const wrapper = createWrapper({ items: ITEMS, selectAll: true });

      expect(wrapper.find(".vc-select-all").exists()).toBe(false);
    });

    it("selects every visible option and announces itself", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });

      await wrapper.get(".vc-select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[ITEMS]]);
      expect(wrapper.emitted("selectAll")).toHaveLength(1);
    });

    it("clears the visible options when everything is already selected", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [...ITEMS] });

      await wrapper.get(".vc-select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    });

    it("reports mixed state for a partial selection", () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: ["Albania"] });

      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("reports checked state once everything is selected", () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [...ITEMS] });

      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("true");
    });

    it("counts against the whole set, not the loaded page", () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: ["Albania"], total: 3000 });

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 3000");
    });

    it("falls back to the option count when no total is given", () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: ["Albania"] });

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 3");
    });

    // "30 of 3000" is not "all selected": a checked box would send the click down the clearing path.
    it("stays partial while a fully selected page is only part of the set", () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: [...ITEMS], total: 3000 });

      expect(wrapper.get(".vc-select-all__count").text()).toBe("3 of 3000");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("keeps the loaded page selected when it is clicked with pages still to come", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [...ITEMS], total: 3000 });

      await wrapper.get(".vc-select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[...ITEMS]]]);
      expect(wrapper.emitted("selectAll")).toHaveLength(1);
    });

    // A filter narrows the set: the visible options are added, hidden selections are kept.
    it("acts on the filtered subset only", async () => {
      const wrapper = createWrapper({ ...selectAllProps, autocomplete: true, modelValue: ["China"] });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");
      await wrapper.get(".vc-select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["China", "Belgium"]]]);
    });

    // With "bel" only the unselected Belgium is visible, so the count must not read "1 of 1".
    it("counts only what the filter leaves visible", async () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, autocomplete: true, modelValue: ["Albania"] });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("bel");
      await nextTick();

      expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(["Belgium"]);
      expect(wrapper.get(".vc-select-all__count").text()).toBe("0 of 1");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("false");
    });

    it("clears the whole selection, loaded or not, when nothing narrows the list", async () => {
      const wrapper = createWrapper({ ...selectAllProps, total: 5, modelValue: [...ITEMS, "Denmark", "Egypt"] });

      await wrapper.get(".vc-select-all input").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    });

    it("counts only the loaded matches while a server-side query narrows the list", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 5,
        modelValue: [...ITEMS, "Denmark", "Egypt"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("3 of 5");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("tells a select from a clear in the selectAll event", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });
      const checkbox = wrapper.get(".vc-select-all input");

      await checkbox.trigger("click");
      await wrapper.setProps({ modelValue: [...ITEMS] });
      await checkbox.trigger("click");

      expect(wrapper.emitted("selectAll")).toEqual([[true], [false]]);
    });

    // Only the consumer knows how many matches are selected on pages that are not loaded.
    it("checks once the consumer reports every match of a server-side query selected", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        hasNextPage: true,
        total: 5,
        selectedCount: 5,
        modelValue: [...ITEMS, "Denmark", "Egypt"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("5 of 5");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("true");
    });

    it("shows mixed while the consumer reports selected matches that are not loaded", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        hasNextPage: true,
        total: 5,
        selectedCount: 2,
        modelValue: ["Denmark", "Egypt"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("2 of 5");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("ignores the consumer's selected count when no query narrows the list", () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        serverFilter: true,
        total: 5,
        selectedCount: 4,
        modelValue: ["Albania"],
      });

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 5");
    });

    it("never counts fewer than the visibly selected matches", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 5,
        selectedCount: 0,
        modelValue: [...ITEMS],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("3 of 5");
      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("ignores the consumer's selected count under a local filter", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        selectedCount: 10,
        modelValue: ["Belgium"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("bel");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 1");
    });

    it("counts only the visible selection under a local filter that leaves several matches", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        selectedCount: 10,
        modelValue: ["Albania"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 2");
    });

    it("ignores a selected count that is not a number", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 5,
        selectedCount: Number.NaN,
        modelValue: ["Albania"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 5");
    });

    it("never counts fewer than the checked rows, even above a lower total", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 1,
        selectedCount: 1,
        modelValue: [...ITEMS],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("3 of 1");
    });

    it("never counts more than the matches of a server-side query", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 5,
        selectedCount: 7,
        modelValue: [],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("a");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("5 of 5");
    });

    it("names the checkbox with its count and keeps the name when it is checked", async () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: [...ITEMS] });

      expect(wrapper.get(".vc-select-all input").attributes("aria-label")).toBe("Select all, 3 of 3");
    });

    // A click that adds nothing must not leave the native box toggled against the component's state.
    it("keeps the native checkbox in step when a click changes nothing", async () => {
      const wrapper = createWrapper({ ...selectAllProps, total: 3000, modelValue: [...ITEMS] });
      const checkbox = wrapper.get(".vc-select-all input").element as HTMLInputElement;

      checkbox.click();
      await nextTick();

      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);
    });

    it("counts against the consumer's total while a server-side filter is on", async () => {
      const wrapper = createWrapperWithMessages({
        ...selectAllProps,
        autocomplete: true,
        serverFilter: true,
        total: 3000,
        modelValue: ["Albania"],
      });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("bel");
      await nextTick();

      expect(wrapper.get(".vc-select-all__count").text()).toBe("1 of 3000");
    });

    // The label text lives in the checkbox's own slot, so it toggles the control.
    it("toggles when the visible label text is clicked", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, selectAll: true, modelValue: [] });

      await wrapper.get(".vc-select-all__text").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[ITEMS]]);
    });

    it("is not checked for an empty list", () => {
      const wrapper = createWrapper({ ...selectAllProps, items: [], modelValue: [] });

      expect(wrapper.get(".vc-select-all input").attributes("aria-checked")).toBe("false");
    });

    it("hands focus back to the trigger on ArrowDown from the checkbox", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });
      const input = wrapper.get("input");
      const checkbox = wrapper.get(".vc-select-all input");

      await input.trigger("click");
      (checkbox.element as HTMLInputElement).focus();
      await checkbox.trigger("keydown", { key: "ArrowDown" });

      expect(document.activeElement).toBe(input.element);
    });

    it("leaves Shift+Tab to the browser", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");

      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
      input.element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(input.element);
    });

    it("keeps the selections a filter hides when clearing the visible ones", async () => {
      const wrapper = createWrapper({ ...selectAllProps, autocomplete: true, modelValue: ["China", "Belgium"] });

      await wrapper.get("input").trigger("click");
      await wrapper.get("input").setValue("bel");
      await wrapper.get(".vc-select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["China"]]]);
    });

    it("hands focus to the checkbox on Tab, since the popover is out of tab order", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");

      // jsdom never moves focus on Tab itself; in a browser an uncancelled Tab would carry focus
      // past the checkbox.
      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      input.element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(wrapper.get(".vc-select-all input").element);
    });
  });

  describe("read-only field", () => {
    it("drops the toggle button", () => {
      expect(createWrapper({ items: ITEMS }).find(".vc-select-field__arrow").exists()).toBe(true);
      expect(createWrapper({ items: ITEMS, readonly: true }).find(".vc-select-field__arrow").exists()).toBe(false);
    });
  });

  describe("clearable", () => {
    it("hides the clear button when there is no selection", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true });

      expect(wrapper.find(".vc-select-field__clear").exists()).toBe(false);
    });

    it("emits undefined on clear in single mode", async () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Albania" });

      await wrapper.get(".vc-select-field__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
    });

    it("emits an empty array on clear in multiple mode", async () => {
      const wrapper = createWrapper({
        items: ITEMS,
        clearable: true,
        multiple: true,
        modelValue: ["Albania"],
      });

      await wrapper.get(".vc-select-field__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    });

    it("hides the clear button when disabled", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Albania", disabled: true });

      expect(wrapper.find(".vc-select-field__clear").exists()).toBe(false);
    });
  });

  describe("autocomplete", () => {
    it("matches a substring anywhere and hoists prefix matches to the top", async () => {
      const wrapper = createWrapper({ items: AFFIX_ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");

      const texts = wrapper.findAll('[role="option"]').map((option) => option.text());

      expect(texts).toEqual(["Belgium", "Abel"]);
    });

    it("matches case-insensitively", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("BELG");

      const texts = wrapper.findAll('[role="option"]').map((option) => option.text());

      expect(texts).toEqual(["Belgium"]);
    });

    it("shows the no-results row when nothing matches", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("zzz");

      expect(wrapper.get('[role="option"]').text()).toBe("ui_kit.messages.no_results");
    });

    it("announces the result count in the live region", async () => {
      const wrapper = createWrapperWithMessages({ items: AFFIX_ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");

      expect(wrapper.get(".sr-only").text()).toBe("2 results available");
    });

    // Two-stage clear: the first click wipes the query only and leaves the selection alone.
    it("clears the search text before the selection", async () => {
      const wrapper = createWrapper({
        items: ITEMS,
        autocomplete: true,
        clearable: true,
        modelValue: "Albania",
      });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");

      expect(wrapper.findAll('[role="option"]')).toHaveLength(1);

      await wrapper.get(".vc-select-field__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });
  });

  describe("async loading", () => {
    it("shows a spinner instead of the empty row while the first page loads", () => {
      const wrapper = createWrapper({ items: [], loading: true });

      expect(wrapper.find(".vc-loader").exists()).toBe(true);
      expect(wrapper.get('[role="option"]').text()).not.toContain("ui_kit.select.no_options");
    });

    it("keeps showing options while a further page loads", () => {
      const wrapper = createWrapper({ items: ITEMS, loading: true, hasNextPage: true });

      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });

    // An empty list and a further page on its way are two indicators for the same spot.
    it.each([
      ["a first page with nothing to show yet", { items: [], loading: true }],
      ["a further page on its way", { items: ITEMS, loading: true, hasNextPage: true }],
    ])("shows exactly one spinner for %s", (_label, props) => {
      const wrapper = createWrapper(props);

      expect(wrapper.findAll(".vc-loader")).toHaveLength(1);
    });

    it("leaves the empty-list spinner to the pager while a further page is coming", () => {
      const wrapper = createWrapper({ items: [], loading: true, hasNextPage: true });

      expect(wrapper.findAll(".vc-loader")).toHaveLength(1);
      expect(wrapper.get(".vc-load-more").find(".vc-loader").exists()).toBe(true);
      expect(wrapper.find('[role="option"]').exists()).toBe(false);
    });

    it("names the loading row", () => {
      const wrapper = createWrapper({ items: [], loading: true });

      expect(wrapper.get('[role="option"]').text()).toBe("ui_kit.messages.loading_text");
    });

    // The options on screen stay the previous query's until the consumer answers.
    it("drops the highlight when a server-side query is typed", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true, serverFilter: true });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.trigger("keydown", { key: "ArrowDown" });

      expect(input.attributes("aria-activedescendant")).toBeDefined();

      await input.setValue("chi");
      await input.trigger("keydown", { key: "Enter" });

      expect(input.attributes("aria-activedescendant")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("shows no spinner while nothing is being fetched", () => {
      const wrapper = createWrapper({ items: ITEMS, hasNextPage: true });

      expect(wrapper.find(".vc-loader").exists()).toBe(false);
    });

    // A listbox holds only options and the pager is role="status", so it sits beside the list.
    it("keeps the pager out of the listbox", () => {
      const wrapper = createWrapper({ items: ITEMS, hasNextPage: true, loading: true });
      const pager = wrapper.get(".vc-load-more");

      expect(pager.attributes("role")).toBe("status");
      expect(wrapper.get('[role="listbox"]').element.contains(pager.element)).toBe(false);
      expect(wrapper.get(".vc-scrollbar").element.contains(pager.element)).toBe(true);
    });

    // End to end: the list inside the popup rests at its bottom and asks for a page without a scroll.
    it("asks for the next page when the open list rests at its bottom", async () => {
      const wrapper = createWrapper({ items: ITEMS, hasNextPage: true });

      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });

      describeScrollBox(wrapper.get(".vc-scrollbar").element as HTMLElement, {
        clientHeight: 400,
        scrollHeight: 400,
        scrollTop: 0,
      });

      // jsdom has no ResizeObserver, so a landed row provokes the measurement instead.
      await wrapper.setProps({ items: [...ITEMS, "Denmark"] });
      await afterContentSettles();

      expect(wrapper.emitted("loadMore")).toHaveLength(1);
    });

    // Paging appends, so the highlighted option has not moved and the highlight survives.
    it("keeps the highlight when a further page is appended", async () => {
      const wrapper = createWrapper({ items: ITEMS, hasNextPage: true });
      const input = wrapper.get("input");

      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      const highlighted = input.attributes("aria-activedescendant");

      expect(highlighted).toBe(wrapper.findAll('[role="option"]')[1].attributes("id"));

      await wrapper.setProps({ items: [...ITEMS, "Denmark", "Estonia"] });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(highlighted);
      expect(wrapper.findAll('[role="option"]')).toHaveLength(5);
    });

    // A replaced list (a new search answer) puts another option under the index.
    it("drops the highlight when the list is replaced", async () => {
      const wrapper = createWrapper({ items: ITEMS, hasNextPage: true });
      const input = wrapper.get("input");

      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBeTruthy();

      await wrapper.setProps({ items: ["Denmark", "Estonia"] });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBeUndefined();
    });

    it("lets the empty state be replaced", () => {
      const wrapper = createWrapper({ items: [] }, { empty: () => h("span", { class: "probe-empty" }, "nothing") });

      expect(wrapper.get(".probe-empty").text()).toBe("nothing");
    });

    it("does not filter locally when the consumer filters server-side", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true, serverFilter: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("zzz");

      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });

    it("still filters locally by default", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("zzz");

      expect(wrapper.get('[role="option"]').text()).toBe("ui_kit.messages.no_results");
    });

    it("debounces the search text and clears it immediately", async () => {
      vi.useFakeTimers();

      try {
        const wrapper = createWrapper({ items: ITEMS, autocomplete: true, serverFilter: true });

        await wrapper.get("input").trigger("focus");
        await wrapper.get("input").setValue("bel");

        expect(wrapper.emitted("search")).toBeUndefined();

        await vi.advanceTimersByTimeAsync(300);

        expect(wrapper.emitted("search")).toEqual([["bel"]]);

        await wrapper.get("input").setValue("");

        expect(wrapper.emitted("search")).toEqual([["bel"], [""]]);
      } finally {
        vi.useRealTimers();
      }
    });

    // Clearing is sent at once and cannot cancel the scheduled query, so a cleared "bel" must
    // not land afterwards.
    it("drops a query that was cleared before it went out", async () => {
      vi.useFakeTimers();

      try {
        const wrapper = createWrapper({ items: ITEMS, autocomplete: true, serverFilter: true });

        await wrapper.get("input").trigger("focus");
        await wrapper.get("input").setValue("bel");
        await vi.advanceTimersByTimeAsync(200);
        await wrapper.get("input").setValue("");
        await vi.advanceTimersByTimeAsync(300);

        expect(wrapper.emitted("search")).toEqual([[""]]);
      } finally {
        vi.useRealTimers();
      }
    });

    it("stays silent when filtering locally", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");

      expect(wrapper.emitted("search")).toBeUndefined();
    });
  });

  describe("keyboard and ARIA", () => {
    // Opening onto an empty list must not point `aria-activedescendant` at nothing.
    it("publishes no active option while the list has none", async () => {
      const wrapper = createWrapper({ items: [] });
      const input = wrapper.get("input");

      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBeUndefined();

      await input.trigger("keydown", { key: "Home" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBeUndefined();
    });

    // Focus stays on the trigger (aria-activedescendant), so autocomplete keeps accepting typing.
    it("keeps DOM focus on the trigger while arrowing through options", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      // Real focus: trigger("focus") does not move document.activeElement.
      (input.element as HTMLInputElement).focus();
      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(document.activeElement).toBe(input.element);
      expect(wrapper.findAll('[role="option"]')[0].attributes("id")).toBe(input.attributes("aria-activedescendant"));
    });

    it("leaves Home and End to the caret in an autocomplete field", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });
      const input = wrapper.get("input");

      await input.trigger("click");

      const home = new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true });
      input.element.dispatchEvent(home);
      const end = new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true });
      input.element.dispatchEvent(end);
      await nextTick();

      expect(home.defaultPrevented).toBe(false);
      expect(end.defaultPrevented).toBe(false);
      expect(input.attributes("aria-activedescendant")).toBeUndefined();
    });

    it("wraps around and supports Home/End", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await input.trigger("click");
      await input.trigger("keydown", { key: "ArrowUp" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(optionIds[optionIds.length - 1]);

      await input.trigger("keydown", { key: "Home" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(optionIds[0]);

      await input.trigger("keydown", { key: "End" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(optionIds[optionIds.length - 1]);
    });

    // APG: Down/Home open on the first option, Up/End on the last.
    it("opens on the last option with ArrowUp", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await input.trigger("keydown", { key: "ArrowUp" });
      await nextTick();
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(input.attributes("aria-activedescendant")).toBe(optionIds[optionIds.length - 1]);
    });

    it("opens on the first option with ArrowDown", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(input.attributes("aria-activedescendant")).toBe(optionIds[0]);
    });

    it("selects the highlighted option on Enter", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toEqual([["Belgium"]]);
    });

    it("options are not reachable with Tab", () => {
      const wrapper = createWrapper({ items: ITEMS });

      const tabIndexes = wrapper.findAll('[role="option"]').map((option) => option.attributes("tabindex"));

      expect(tabIndexes).toEqual(["-1", "-1", "-1"]);
    });

    it("links the trigger to the listbox only while open", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      expect(input.attributes("aria-controls")).toBeUndefined();
      expect(input.attributes("aria-expanded")).toBe("false");

      await wrapper.get(".vc-select-field__arrow").trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(input.attributes("aria-controls")).toBe(wrapper.get('[role="listbox"]').attributes("id"));
    });

    // Closing hands focus back to the trigger; that must not reopen the list.
    it("closes when an option is picked with the default trigger", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await wrapper.get(".vc-select-field__arrow").trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      await wrapper.findAll('[role="option"]')[1].trigger("click");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(input.element);
    });

    // An outside click already put focus where the user aimed; taking it back would lose that click.
    it("leaves focus alone when it has already moved outside", async () => {
      const outside = document.createElement("input");
      document.body.appendChild(outside);

      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      outside.focus();
      // This is how an outside click closes it: the popover reports the toggle itself.
      wrapper.getComponent({ name: "VcPopover" }).vm.$emit("toggle", false);
      await nextTick();

      expect(document.activeElement).toBe(outside);

      outside.remove();
    });

    // aria-activedescendant keeps DOM focus on the trigger; a mouse press on an option would take it.
    it("keeps focus on the trigger when an option is pressed with the mouse", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: [] });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");

      const option = wrapper.findAll('[role="option"]')[1];
      const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      option.element.dispatchEvent(press);
      await option.trigger("click");
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(press.defaultPrevented).toBe(true);
      expect(input.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[0].attributes("id"));
    });

    // The scroller is focusable by pointer once it opts out of the Tab order, and Escape is not heard
    // there.
    it("keeps focus on the trigger when the list's scroller is pressed", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");

      const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      wrapper.get(".vc-select__scroll").element.dispatchEvent(press);

      expect(press.defaultPrevented).toBe(true);
    });

    it("hands focus back to the trigger from a teleported list", async () => {
      const host = document.createElement("div");
      host.id = "popover-host";
      document.body.appendChild(host);

      const wrapper = createWrapper({ items: ITEMS, enableTeleport: true });
      const input = wrapper.get("input");

      await input.trigger("click");

      const option = host.querySelector<HTMLElement>('[role="option"]')!;
      option.focus();
      option.click();
      await nextTick();

      expect(document.activeElement).toBe(input.element);

      wrapper.unmount();
      host.remove();
    });

    it("draws the field as opened only while the list is open", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const field = wrapper.get(".vc-select-field");

      expect(field.classes()).not.toContain("vc-input--opened");

      await wrapper.get("input").trigger("click");

      expect(field.classes()).toContain("vc-input--opened");

      await wrapper.get("input").trigger("keydown", { key: "Escape" });

      expect(field.classes()).not.toContain("vc-input--opened");
    });

    it("rings the highlight moved by the keyboard, not the one moved by the pointer", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");
      await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");
      await input.trigger("keydown", { key: "a" });

      const pointed = wrapper.findAll(".vc-menu-item__inner")[1];

      expect(pointed.classes()).toContain("vc-menu-item__inner--highlighted");
      expect(pointed.classes()).not.toContain("vc-menu-item__inner--highlight-ring");
      expect(input.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[1].attributes("id"));

      await input.trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe("China");
    });

    it("opens by the pointer onto no highlight, so the keyboard starts at the top", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });
      const input = wrapper.get("input");

      await input.trigger("click");

      expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(false);
      expect(input.attributes("aria-activedescendant")).toBeUndefined();

      await input.trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe("Albania");
    });

    it.each([
      ["ArrowDown", "Albania"],
      ["Home", "Albania"],
      ["ArrowUp", "China"],
      ["End", "China"],
    ])("opens with %s on its own start, not on the selection", async (key, start) => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });
      const input = wrapper.get("input");

      await input.trigger("keydown", { key });
      await nextTick();
      await nextTick();

      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe(start);
    });

    it("opens an autocomplete by typing with nothing highlighted", async () => {
      // "a" keeps Albania first, so a highlight left on the selection would survive the filter.
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true, modelValue: "Albania" });
      const input = wrapper.get("input");

      await input.setValue("Albaniaa");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(false);
    });

    it("rings the selection when Enter opens the list", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("keydown", { key: "Enter" });
      await nextTick();

      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe("Belgium");
    });

    it("forgets a keyboard open once the list closes", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("keydown", { key: "Enter" });
      await nextTick();
      await input.trigger("keydown", { key: "Escape" });
      await nextTick();
      await input.trigger("click");
      await nextTick();

      expect(wrapper.find(".vc-menu-item__inner--highlight-ring").exists()).toBe(false);
    });

    it("opens a select-only field with Space and accepts the highlighted option with it", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("keydown", { key: " " });
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");

      await input.trigger("keydown", { key: "ArrowDown" });
      await input.trigger("keydown", { key: " " });

      expect(wrapper.emitted("update:modelValue")).toEqual([["Albania"]]);
    });

    it("leaves Space to the text of an autocomplete field", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });
      const input = wrapper.get("input");
      const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });

      input.element.dispatchEvent(event);
      await nextTick();

      expect(event.defaultPrevented).toBe(false);
      expect(input.attributes("aria-expanded")).toBe("false");
    });

    // Options are not tab stops, so Tab would otherwise walk away from an open list.
    it("closes the list when focus leaves the select", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      onTestFinished(() => outside.remove());

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");
      expect(input.attributes("aria-expanded")).toBe("true");

      // trigger() fires a synthetic focusout that moves no focus, so blur first to put activeElement
      // on <body>, as a browser does during a Tab.
      (input.element as HTMLInputElement).blur();
      await input.trigger("focusout", { relatedTarget: outside });
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
      expect(document.activeElement).not.toBe(input.element);
    });

    it("closes the list when focus leaves the slotted trigger", async () => {
      const wrapper = createWrapper({ items: ITEMS }, { placeholder: () => h("span", "pick") });
      const control = wrapper.get(".vc-select-button__control");
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      onTestFinished(() => outside.remove());

      await control.trigger("click");
      await control.trigger("focusout", { relatedTarget: outside });
      await nextTick();

      expect(control.attributes("aria-expanded")).toBe("false");
    });

    it("closes the list when focus leaves Select all for the page", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, selectAll: true, modelValue: [] });
      const input = wrapper.get("input");
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      onTestFinished(() => outside.remove());

      await input.trigger("click");
      await wrapper.get(".vc-select-all input").trigger("focusout", { relatedTarget: outside });
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
    });

    // A Tab's order: activeElement is <body> while focusout fires, then the target takes focus.
    // blur() itself adds a focusout with no relatedTarget, which the select ignores.
    async function moveFocus(from: Element, to: HTMLElement) {
      (from as HTMLElement).blur();
      from.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: to }));
      to.focus();
      await nextTick();
    }

    it.each([
      ["clear", ".vc-select-field__clear"],
      ["toggle", ".vc-select-field__arrow"],
    ])("closes the list when focus leaves the field's %s button", async (_, selector) => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Albania" });
      const input = wrapper.get("input");
      const button = wrapper.get(selector).element as HTMLElement;
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      onTestFinished(() => outside.remove());

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");
      await moveFocus(input.element, button);
      expect(input.attributes("aria-expanded")).toBe("true");

      await moveFocus(button, outside);

      expect(input.attributes("aria-expanded")).toBe("false");
    });

    it("keeps the list open when focus goes nowhere", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");
      await input.trigger("focusout", { relatedTarget: null });

      expect(input.attributes("aria-expanded")).toBe("true");
    });

    it.each([
      ["after focus left an open list", true],
      ["after focus left a closed one", false],
    ])("still returns focus on a later pick %s", async (_, openFirst) => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      onTestFinished(() => outside.remove());

      (input.element as HTMLInputElement).focus();

      if (openFirst) {
        await input.trigger("click");
      }

      await moveFocus(input.element, outside);
      (input.element as HTMLInputElement).focus();
      await input.trigger("click");

      const option = wrapper.findAll('[role="option"]')[1];
      (option.element as HTMLElement).focus();
      await option.trigger("click");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(input.element);
    });

    it("keeps the list open when focus moves to Select all", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, selectAll: true, modelValue: [] });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.trigger("focusout", { relatedTarget: wrapper.get(".vc-select-all input").element });
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
    });

    it("picks the row under the pointer on Enter", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");
      await wrapper.findAll(".vc-menu-item")[2].trigger("mousemove");
      await input.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toEqual([["China"]]);
    });

    it("leaves Enter to the form after a pointer open", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: ["Belgium"] });
      const input = wrapper.get("input");

      await input.trigger("click");

      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
      input.element.dispatchEvent(event);
      await nextTick();

      expect(event.defaultPrevented).toBe(false);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    // The selection sits where the key would open, so only the ring tells a keyboard open.
    it.each([
      ["End", "China"],
      ["ArrowUp", "China"],
      ["ArrowDown", "Albania"],
    ])("rings the selection when %s opens onto it", async (key, selection) => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: selection });
      const input = wrapper.get("input");

      await input.trigger("keydown", { key });
      await nextTick();
      await nextTick();

      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe(selection);
    });

    it("opens the slotted trigger with Space and rings the selection", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" }, { selected: () => h("span", "chosen") });
      const button = wrapper.get(".vc-select-button__control");

      (button.element as HTMLElement).focus();
      await button.trigger("keydown", { key: " " });
      await nextTick();

      expect(button.attributes("aria-expanded")).toBe("true");
      expect(wrapper.get(".vc-menu-item__inner--highlight-ring").text()).toBe("Belgium");
    });

    it("drops a pointer highlight when the pointer leaves the list", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");
      await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");

      expect(wrapper.get(".vc-menu-item__inner--highlighted").text()).toBe("Belgium");

      await wrapper.get('[role="listbox"]').trigger("mouseleave");

      expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(false);
      expect(input.attributes("aria-activedescendant")).toBeUndefined();
    });

    it("keeps a keyboard highlight when the pointer leaves the list", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.trigger("keydown", { key: "ArrowDown" });
      await wrapper.get('[role="listbox"]').trigger("mouseleave");

      expect(wrapper.get(".vc-menu-item__inner--highlighted").text()).toBe("Albania");
    });

    // A plain select is a button: the click toggles it, and focus alone must not open it — the
    // click that delivers the focus would otherwise toggle it straight back shut.
    it("toggles on click and does not open on focus alone (plain select)", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("focus");

      expect(input.attributes("aria-expanded")).toBe("false");

      await input.trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      await input.trigger("click");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(input.element);
    });

    // Autocomplete never closes on a click inside the field — that click is the user placing a
    // caret. It opens on click or on typing, and closes on the arrow button or outside.
    it("never closes on a click inside the field (autocomplete)", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });
      const input = wrapper.get("input");

      await input.trigger("focus");

      expect(input.attributes("aria-expanded")).toBe("false");

      await input.trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      await input.trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      await wrapper.get(".vc-select-field__arrow").trigger("click");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
    });

    // The APG editable combobox opens on input, not on focus: tab in, type, and the list appears.
    it("opens on typing (autocomplete)", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });
      const input = wrapper.get("input");

      await input.trigger("focus");

      expect(input.attributes("aria-expanded")).toBe("false");

      await input.setValue("bel");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(["Belgium"]);
    });

    // The closed field shows the selected label, so the keystroke lands inside it. Only the typed
    // characters are the query — filtering by "Belgiumb" would find nothing.
    it("starts a fresh query when typing over a selection (autocomplete)", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true, modelValue: "Belgium" });
      const input = wrapper.get("input");

      expect((input.element as HTMLInputElement).value).toBe("Belgium");

      await input.setValue("Belgiumc");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("true");
      expect((input.element as HTMLInputElement).value).toBe("c");
      expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(["China"]);
    });

    it("describes the trigger with the details element", () => {
      const wrapper = createWrapper({ items: ITEMS, message: "Pick one" });

      const detailsId = wrapper.get("input").attributes("aria-describedby");

      expect(detailsId).toBeTruthy();
      expect(wrapper.find(`#${detailsId}`).exists()).toBe(true);
    });

    it("points aria-activedescendant at the highlighted option", async () => {
      const wrapper = createWrapper({ items: ITEMS });

      expect(wrapper.get("input").attributes("aria-activedescendant")).toBeUndefined();

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });

      const firstOptionId = wrapper.findAll('[role="option"]')[0].attributes("id");

      expect(wrapper.get("input").attributes("aria-activedescendant")).toBe(firstOptionId);
    });

    it("marks the trigger invalid and required from props", () => {
      const wrapper = createWrapper({ items: ITEMS, error: true, required: true });

      expect(wrapper.get("input").attributes("aria-invalid")).toBe("true");
      expect(wrapper.get("input").attributes("aria-required")).toBe("true");
    });
  });

  // A modal's focusFirstElement targets `.vc-select__container` (useFocusManagement); without
  // its own tabindex focus silently stays on <body>.
  it("keeps the container focusable, so a modal's autofocus lands on it", () => {
    const wrapper = createWrapper({ items: ITEMS });
    const container = wrapper.get(".vc-select__container");

    expect(container.attributes("tabindex")).toBe("-1");

    const returned = focusFirstElement(document.body, {
      ignoreSelector: ".vc-select input",
      extendSelector: ".vc-select__container",
    });

    expect(returned).toBe(true);
    expect(document.activeElement).toBe(container.element);
  });

  describe("custom trigger slot", () => {
    const slots = {
      selected: () => h("span", { class: "probe-selected" }, "chosen"),
      placeholder: () => h("span", { class: "probe-placeholder" }, "pick one"),
    };

    it("drops the chevron of a read-only slotted trigger", () => {
      expect(createWrapper({ items: ITEMS }, slots).find(".vc-select-button__icon").exists()).toBe(true);
      expect(createWrapper({ items: ITEMS, readonly: true }, slots).find(".vc-select-button__icon").exists()).toBe(
        false,
      );
    });

    it("points the label at the slotted trigger and hands it the aria-label", () => {
      const wrapper = createWrapper({ items: ITEMS, label: "Country", ariaLabel: "Shipping country" }, slots);
      const control = wrapper.get(".vc-select-button__control");

      expect(wrapper.get("label").attributes("for")).toBe(control.attributes("id"));
      expect(control.attributes("aria-label")).toBe("Shipping country");
    });

    it("links the slotted trigger to the listbox and the highlighted option while open", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);
      const control = wrapper.get(".vc-select-button__control");

      expect(control.attributes("aria-controls")).toBeUndefined();
      expect(control.attributes("aria-activedescendant")).toBeUndefined();

      await control.trigger("keydown", { key: "ArrowDown" });

      expect(control.attributes("aria-controls")).toBe(wrapper.get('[role="listbox"]').attributes("id"));
      expect(control.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[0].attributes("id"));
    });

    it("marks the slotted trigger invalid and required and describes it with the details", () => {
      const wrapper = createWrapper({ items: ITEMS, error: true, required: true, message: "Pick one" }, slots);
      const control = wrapper.get(".vc-select-button__control");
      const detailsId = control.attributes("aria-describedby");

      expect(control.attributes("aria-invalid")).toBe("true");
      expect(control.attributes("aria-required")).toBe("true");
      expect(detailsId).toBeTruthy();
      expect(wrapper.find(`#${detailsId}`).exists()).toBe(true);
    });

    it("marks a disabled slotted trigger aria-disabled", () => {
      const control = createWrapper({ items: ITEMS, disabled: true }, slots).get(".vc-select-button__control");

      expect(control.attributes("aria-disabled")).toBe("true");
    });

    it("passes the selected values, not the items, to the selected slot in multiple mode", () => {
      const wrapper = createWrapper(
        {
          items: OBJECT_ITEMS,
          textField: "name",
          valueField: "id",
          multiple: true,
          modelValue: ["1", "2"],
          error: true,
        },
        {
          selected: ({ item, error }: { item: unknown; error?: boolean }) =>
            h("span", { class: "probe-selected" }, `${JSON.stringify(item)} ${String(error)}`),
          placeholder: () => h("span", { class: "probe-placeholder" }, "pick one"),
        },
      );

      expect(wrapper.get(".probe-selected").text()).toBe('["1","2"] true');
      expect(wrapper.find(".probe-placeholder").exists()).toBe(false);
    });

    it("passes the error state to the placeholder slot", () => {
      const wrapper = createWrapper(
        { items: ITEMS, error: true },
        { placeholder: ({ error }: { error?: boolean }) => h("span", { class: "probe-placeholder" }, String(error)) },
      );

      expect(wrapper.get(".probe-placeholder").text()).toBe("true");
    });

    it("shows the placeholder slot for an empty multiple selection", () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: [] }, slots);

      expect(wrapper.find(".probe-selected").exists()).toBe(false);
      expect(wrapper.find(".probe-placeholder").exists()).toBe(true);
    });

    // A value that matches no item under valueField resolves to nothing, so there is no item to pass.
    it("shows the placeholder for a single value that resolves to no item", () => {
      const wrapper = createWrapper(
        { items: OBJECT_ITEMS, textField: "name", valueField: "id", modelValue: "missing" },
        slots,
      );

      expect(wrapper.find(".probe-placeholder").exists()).toBe(true);
      expect(wrapper.find(".probe-selected").exists()).toBe(false);
    });

    // An unset GraphQL value arrives as null, and without valueField the model is the item.
    it("shows the placeholder for a null model, not the selected slot", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: null as unknown as string }, slots);

      expect(wrapper.find(".probe-placeholder").exists()).toBe(true);
      expect(wrapper.find(".probe-selected").exists()).toBe(false);
    });

    it("renders the button branch instead of the input", () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      expect(wrapper.find(".vc-select-button").exists()).toBe(true);
      expect(wrapper.find("input").exists()).toBe(false);
    });

    it("shows the placeholder slot until something is selected", () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      expect(wrapper.find(".probe-placeholder").exists()).toBe(true);
      expect(wrapper.find(".probe-selected").exists()).toBe(false);
    });

    // Without valueField the model is the item, so an unmatched value still reaches the slot.
    it("renders the selected slot for a model value that matches no item", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Atlantis" }, slots);

      expect(wrapper.find(".probe-selected").exists()).toBe(true);
      expect(wrapper.find(".probe-placeholder").exists()).toBe(false);
    });

    // The slot receives the whole item that the valueField model resolves to.
    it("passes the resolved item to the selected slot", () => {
      const wrapper = createWrapper(
        { items: OBJECT_ITEMS, textField: "name", valueField: "id", modelValue: "2" },
        {
          selected: ({ item }: { item: unknown }) =>
            h("span", { class: "probe-selected" }, (item as (typeof OBJECT_ITEMS)[number]).name),
          placeholder: () => h("span", { class: "probe-placeholder" }, "pick one"),
        },
      );

      expect(wrapper.find(".probe-placeholder").exists()).toBe(false);
      expect(wrapper.get(".probe-selected").text()).toBe("Belgium");
    });

    it("honours the clearable prop", async () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Albania", clearable: true }, slots);

      expect(wrapper.find(".vc-select-button__clear").exists()).toBe(true);

      await wrapper.get(".vc-select-button__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
    });

    it("hides the clear button when nothing is selected", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true }, slots);

      expect(wrapper.find(".vc-select-button__clear").exists()).toBe(false);
    });

    it("reflects the size prop as a modifier", () => {
      const wrapper = createWrapper({ items: ITEMS, size: "xs" }, slots);

      expect(wrapper.get(".vc-select-button").classes()).toContain("vc-select-button--size--xs");
    });

    // VcPopover binds its own `click: toggle` on the #trigger wrapper, so the trigger's click must
    // not reach it too, or the two toggles cancel out.
    it("opens, closes and reopens on click", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);
      const trigger = wrapper.get(".vc-select-button__control");

      await trigger.trigger("click");
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("true");

      await trigger.trigger("click");
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("false");

      await trigger.trigger("click");
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("true");
    });

    it("does not let the click reach the popover wrapper twice", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);
      let wrapperClicks = 0;

      wrapper.get(".vc-popover__trigger").element.addEventListener("click", () => (wrapperClicks += 1));
      await wrapper.get(".vc-select-button__control").trigger("click");

      expect(wrapperClicks).toBe(0);
    });

    it("opens the list on ArrowDown", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      await wrapper.get(".vc-select-button__control").trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(wrapper.get(".vc-select-button__control").attributes("aria-expanded")).toBe("true");
      expect(wrapper.classes()).toContain("vc-select--opened");
    });

    // The trigger is its own BEM block, and its states arrive as its own modifiers.
    it("owns its block and carries the state modifiers on its own root", () => {
      const wrapper = createWrapper({ items: ITEMS, disabled: true, readonly: true, error: true }, slots);
      const root = wrapper.get(".vc-select-button");

      expect(root.classes()).toEqual(
        expect.arrayContaining([
          "vc-select-button",
          "vc-select-button--size--md",
          "vc-select-button--disabled",
          "vc-select-button--readonly",
          "vc-select-button--error",
        ]),
      );
      expect(wrapper.html()).not.toContain("vc-select__button");
    });

    // A real <button>, beside the clear button rather than around it: buttons cannot nest.
    it("renders a real button element carrying the combobox semantics", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Belgium" }, slots);
      const trigger = wrapper.get(".vc-select-button__control");

      expect(trigger.element.tagName).toBe("BUTTON");
      expect(trigger.attributes("type")).toBe("button");
      expect(trigger.attributes("role")).toBe("combobox");
      expect(trigger.attributes("aria-haspopup")).toBe("listbox");
      expect(trigger.find("button").exists()).toBe(false);
      expect(wrapper.get(".vc-select-button__clear").element.closest(".vc-select-button__control")).toBeNull();
    });
  });
});

// A select inside a dialog popover: the shape both filter drawers ship, minus the teleport, so
// Escape really travels from the select up to the dialog.
const DialogHost = defineComponent({
  components: { VcPopover: UIKitComponents.VcPopover, VcSelect },

  props: {
    autocomplete: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    selectAll: { type: Boolean, default: false },
    slotted: { type: Boolean, default: false },
    selected: { type: [String, Array], default: undefined },
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
        <VcSelect
          :items="items"
          label="Created date"
          :autocomplete="autocomplete"
          :clearable="clearable"
          :multiple="multiple"
          :readonly="readonly"
          :select-all="selectAll"
          :model-value="selected"
        >
          <template v-if="slotted" #selected="{ item }">{{ item }}</template>
          <template v-if="slotted" #placeholder>Pick one</template>
        </VcSelect>
      </template>
    </VcPopover>
  `,
});

const mountDialogHost = createWrapperFactory(mount, DialogHost, {
  attachTo: document.body,
  global: { components: UIKitComponents, directives: { maska: vMaska } },
});

const DIALOG_NAME = "Filters";

// Named, not positional: once the list is open there are two panels.
function dialogIsOpen(wrapper: VueWrapper): boolean {
  return !wrapper.get(`.vc-popover__body[aria-label="${DIALOG_NAME}"]`).attributes("style")?.includes("display: none");
}

function selectIsOpen(wrapper: VueWrapper): boolean {
  return wrapper.get(".vc-select").classes().includes("vc-select--opened");
}

function selectTrigger(wrapper: VueWrapper) {
  return wrapper.get(".vc-select-button__control, .vc-select input");
}

function pressOn(element: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  element.dispatchEvent(event);
  return event;
}

async function openDialogAndSelect(wrapper: VueWrapper) {
  await wrapper.get("button.trigger").trigger("click");
  await nextTick();

  (selectTrigger(wrapper).element as HTMLElement).focus();
  await selectTrigger(wrapper).trigger("click");
  await nextTick();
}

describe("VcSelect inside a dialog popover", () => {
  it("opens its list without closing the dialog", async () => {
    const wrapper = mountDialogHost();
    await openDialogAndSelect(wrapper);

    expect(selectIsOpen(wrapper)).toBe(true);
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it.each([
    ["the input trigger", false],
    ["the slotted trigger", true],
  ])("consumes Escape on %s while its list is open, leaving the dialog open", async (_, slotted) => {
    const wrapper = mountDialogHost({ props: { slotted } });
    await openDialogAndSelect(wrapper);

    pressOn(selectTrigger(wrapper).element, "Escape");
    await nextTick();

    expect(selectIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
    expect(document.activeElement).toBe(selectTrigger(wrapper).element);
  });

  it("lets Escape reach the dialog once its list is closed", async () => {
    const wrapper = mountDialogHost();
    await openDialogAndSelect(wrapper);

    pressOn(selectTrigger(wrapper).element, "Escape");
    await nextTick();
    pressOn(selectTrigger(wrapper).element, "Escape");
    await nextTick();

    expect(dialogIsOpen(wrapper)).toBe(false);
  });

  it("ignores an auto-repeated Escape, so holding the key does not close the dialog too", async () => {
    const wrapper = mountDialogHost();
    await openDialogAndSelect(wrapper);

    pressOn(selectTrigger(wrapper).element, "Escape");
    await nextTick();
    pressOn(selectTrigger(wrapper).element, "Escape", { repeat: true });
    await nextTick();

    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it("consumes Escape from the Select all checkbox and hands focus back to the trigger", async () => {
    const wrapper = mountDialogHost({ props: { multiple: true, selectAll: true } });
    await openDialogAndSelect(wrapper);

    const checkbox = wrapper.get(".vc-select-all input");
    (checkbox.element as HTMLElement).focus();
    pressOn(checkbox.element, "Escape");
    await nextTick();

    expect(selectIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
    expect(document.activeElement).toBe(selectTrigger(wrapper).element);
  });

  // Both buttons live in the input trigger's append slot.
  it.each([[".vc-select-field__clear"], [".vc-select-field__arrow"]])(
    "consumes Escape from %s while its list is open",
    async (selector) => {
      const wrapper = mountDialogHost({ props: { clearable: true, selected: "Last day" } });
      await openDialogAndSelect(wrapper);

      pressOn(wrapper.get(selector).element, "Escape");
      await nextTick();

      expect(selectIsOpen(wrapper)).toBe(false);
      expect(dialogIsOpen(wrapper)).toBe(true);
    },
  );

  // Closing empties the filter, which unmounts the very button the key was pressed on.
  it("keeps focus on the trigger when Escape unmounts the clear button", async () => {
    const wrapper = mountDialogHost({ props: { autocomplete: true, clearable: true } });
    await openDialogAndSelect(wrapper);

    const input = wrapper.get(".vc-select input");
    await input.setValue("Cust");
    await nextTick();

    const clear = wrapper.get(".vc-select-field__clear");
    (clear.element as HTMLElement).focus();
    pressOn(clear.element, "Escape");
    await nextTick();
    await nextTick();

    expect(selectIsOpen(wrapper)).toBe(false);
    expect(wrapper.find(".vc-select-field__clear").exists()).toBe(false);
    expect(document.activeElement).toBe(input.element);
  });

  // Enter is consumed only by a select-only combobox (APG). An editable one keeps it for its form —
  // address-form.vue.
  it.each([
    [false, true],
    [true, false],
  ])("with autocomplete=%s, Enter on the closed trigger is consumed: %s", async (autocomplete, consumed) => {
    const wrapper = mountDialogHost({ props: { autocomplete } });
    await openDialogAndSelect(wrapper);

    pressOn(selectTrigger(wrapper).element, "Escape");
    await nextTick();

    const event = pressOn(selectTrigger(wrapper).element, "Enter");
    await nextTick();

    expect(event.defaultPrevented).toBe(consumed);
    expect(selectIsOpen(wrapper)).toBe(consumed);
  });

  it("leaves Enter alone when the select is readonly", async () => {
    const wrapper = mountDialogHost({ props: { readonly: true } });
    await wrapper.get("button.trigger").trigger("click");
    await nextTick();

    const event = pressOn(selectTrigger(wrapper).element, "Enter");
    await nextTick();

    expect(event.defaultPrevented).toBe(false);
    expect(selectIsOpen(wrapper)).toBe(false);
  });

  // With no option highlighted there is nothing to accept, so a select in a form must still submit.
  it("leaves Enter alone while its list is open with nothing highlighted", async () => {
    const wrapper = mountDialogHost();
    await openDialogAndSelect(wrapper);

    const event = pressOn(selectTrigger(wrapper).element, "Enter");
    await nextTick();

    expect(event.defaultPrevented).toBe(false);
    expect(selectIsOpen(wrapper)).toBe(true);
  });

  it("consumes Enter that accepts the highlighted option", async () => {
    const wrapper = mountDialogHost();
    await openDialogAndSelect(wrapper);

    pressOn(selectTrigger(wrapper).element, "ArrowDown");
    await nextTick();

    const event = pressOn(selectTrigger(wrapper).element, "Enter");
    await nextTick();

    expect(event.defaultPrevented).toBe(true);
    expect(selectIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
  });

  it.each([
    ["the input trigger", false],
    ["the slotted trigger", true],
  ])("returns focus to %s when picking an option closes the list", async (_, slotted) => {
    const wrapper = mountDialogHost({ props: { slotted } });
    await openDialogAndSelect(wrapper);

    const option = wrapper.get(".vc-menu-item__inner");
    (option.element as HTMLElement).focus();
    await option.trigger("click");
    await nextTick();

    expect(selectIsOpen(wrapper)).toBe(false);
    expect(dialogIsOpen(wrapper)).toBe(true);
    expect(document.activeElement).toBe(selectTrigger(wrapper).element);
  });
});
