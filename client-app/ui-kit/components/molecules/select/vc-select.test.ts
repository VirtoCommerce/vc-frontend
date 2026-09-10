import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import VcSelect from "./vc-select.vue";

const ITEMS = ["Albania", "Belgium", "China"];

const OBJECT_ITEMS = [
  { id: "1", name: "Albania" },
  { id: "2", name: "Belgium" },
];

// "bel" — префикс Belgium и подстрока внутри Abel: набор различает includes от startsWith
// и заодно пиннит порядок, в котором union() поднимает префиксные совпадения наверх.
const AFFIX_ITEMS = ["Abel", "Belgium"];

// Реальные строки для двух параметризованных ключей: с пустыми messages t() вернул бы
// голый ключ, и подстановка счётчика осталась бы непроверенной.
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
        },
      },
    },
  },
});

// attachTo: VcSelect ищет опции через document.querySelectorAll, а document.activeElement
// отслеживает только присоединённые узлы — detached-монтирование ломает и то и другое.
// Отсюда обязательный auto-unmount: оставшийся в body экземпляр перехватывал бы
// эти запросы в следующих тестах.
enableAutoUnmount(afterEach);

// Монтирование намеренно интеграционное: дети (VcInput, VcPopover, VcMenuItem, VcCheckbox)
// не заглушены, потому что характеризуется поведение всей связки триггер-попап-список.
// Компоненты передаются объектом, а не плагином uiKit: фабрика сливает опции через
// lodash.merge, и плагин продублировал бы директиву html-safe. Из директив дереву нужна
// только maska (vc-input.vue:31). Фабрика поднимает i18n с пустыми messages, поэтому
// t("ui_kit.select.no_options") возвращает сам ключ — ожидания ниже сравниваются с ключами.
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

    it("marks the selected option with aria-selected", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Belgium" });

      const flags = wrapper.findAll('[role="option"]').map((option) => option.attributes("aria-selected"));

      expect(flags).toEqual(["false", "true", "false"]);
    });
  });

  describe("multiple selection", () => {
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

    // Пиннит подсветку выбранного при multiple + valueField: isActiveItem (vc-select.vue:351)
    // прогоняет getItemValue по записям модели, поэтому унификация модели на шаге 1
    // (массив значений вместо массива объектов) обязана поменяться вместе с ним.
    it("marks selected options with aria-selected when valueField is set", () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        multiple: true,
        modelValue: [OBJECT_ITEMS[1]],
      });

      const flags = wrapper.findAll('[role="option"]').map((option) => option.attributes("aria-selected"));

      expect(flags).toEqual(["false", "true"]);
    });

    // DEFECT — меняется на шаге 1.
    // С valueField модель в multiple хранит целые объекты, а в single — скаляр.
    it("stores whole objects, not valueField values", async () => {
      const wrapper = createWrapper({
        items: OBJECT_ITEMS,
        textField: "name",
        valueField: "id",
        multiple: true,
        modelValue: [],
      });

      await wrapper.findAll('[role="option"]')[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[OBJECT_ITEMS[0]]]]);
    });

    // DEFECT — меняется на шаге 1.
    // modelValue не массив -> Array.isArray ложно -> уходим в single-ветку и эмитим скаляр.
    it("degrades to single selection when modelValue is undefined", async () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true });

      await wrapper.findAll('[role="option"]')[0].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([["Albania"]]);
    });

    // DEFECT — меняется на шаге 3.
    it("does not set aria-multiselectable on the listbox", () => {
      const wrapper = createWrapper({ items: ITEMS, multiple: true, modelValue: [] });

      expect(wrapper.get('[role="listbox"]').attributes("aria-multiselectable")).toBeUndefined();
    });
  });

  describe("clearable", () => {
    it("hides the clear button when there is no selection", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true });

      expect(wrapper.find(".vc-select__clear").exists()).toBe(false);
    });

    it("emits undefined on clear in single mode", async () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Albania" });

      await wrapper.get(".vc-select__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
    });

    it("emits an empty array on clear in multiple mode", async () => {
      const wrapper = createWrapper({
        items: ITEMS,
        clearable: true,
        multiple: true,
        modelValue: ["Albania"],
      });

      await wrapper.get(".vc-select__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    });

    it("hides the clear button when disabled", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Albania", disabled: true });

      expect(wrapper.find(".vc-select__clear").exists()).toBe(false);
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

    // Двухстадийная очистка: первый клик стирает только строку поиска и возвращает
    // полный список, не трогая выбор. Шаг 1 переносит фильтр и выбор в useSelect.
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

      await wrapper.get(".vc-select__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });
  });

  describe("keyboard and ARIA", () => {
    // DEFECT — меняется на шаге 3: фокус должен оставаться на триггере.
    it("moves real DOM focus onto the first option on ArrowDown", async () => {
      const wrapper = createWrapper({ items: ITEMS });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });

      const firstOptionId = wrapper.findAll('[role="option"]')[0].attributes("id");

      expect(firstOptionId).toBeTruthy();
      expect(document.activeElement?.id).toBe(firstOptionId);
    });

    it("links the trigger to the listbox only while open", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      expect(input.attributes("aria-controls")).toBeUndefined();
      expect(input.attributes("aria-expanded")).toBe("false");

      await wrapper.get(".vc-select__arrow").trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(input.attributes("aria-controls")).toBe(wrapper.get('[role="listbox"]').attributes("id"));
    });

    it("describes the trigger with the details element", () => {
      const wrapper = createWrapper({ items: ITEMS, message: "Pick one" });

      const detailsId = wrapper.get("input").attributes("aria-describedby");

      expect(detailsId).toBeTruthy();
      expect(wrapper.find(`#${detailsId}`).exists()).toBe(true);
    });

    // DEFECT — меняется на шаге 3: сейчас activedescendant выставляется одновременно
    // с реальным переносом фокуса, то есть две взаимоисключающие модели работают разом.
    it("points aria-activedescendant at the focused option", async () => {
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

  describe("custom trigger slot", () => {
    const slots = {
      selected: () => h("span", { class: "probe-selected" }, "chosen"),
      placeholder: () => h("span", { class: "probe-placeholder" }, "pick one"),
    };

    it("renders the button branch instead of the input", () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      expect(wrapper.find(".vc-select__button").exists()).toBe(true);
      expect(wrapper.find("input").exists()).toBe(false);
    });

    it("shows the placeholder slot until something is selected", () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      expect(wrapper.find(".probe-placeholder").exists()).toBe(true);
      expect(wrapper.find(".probe-selected").exists()).toBe(false);
    });

    // Позитивная ветка слота: selected (vc-select.vue:273) резолвит модель обратно в элемент
    // через valueField, и слот получает целый объект. Шаг 1 переписывает этот резолв.
    it("passes the resolved item to the selected slot", () => {
      const wrapper = createWrapper(
        { items: OBJECT_ITEMS, textField: "name", valueField: "id", modelValue: "2" },
        {
          selected: ({ item }: { item: (typeof OBJECT_ITEMS)[number] }) =>
            h("span", { class: "probe-selected" }, item.name),
          placeholder: () => h("span", { class: "probe-placeholder" }, "pick one"),
        },
      );

      expect(wrapper.find(".probe-placeholder").exists()).toBe(false);
      expect(wrapper.get(".probe-selected").text()).toBe("Belgium");
    });

    // DEFECT — чинится на шаге 2: clearable в этой ветке не отрисовывается вовсе.
    it("ignores the clearable prop", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Albania", clearable: true }, slots);

      expect(wrapper.find(".vc-select__clear").exists()).toBe(false);
    });

    // DEFECT — чинится на шаге 2: у кнопки нет ни одного size-модификатора.
    it("ignores the size prop", () => {
      const wrapper = createWrapper({ items: ITEMS, size: "xs" }, slots);

      expect(wrapper.get(".vc-select__button").classes().join(" ")).not.toContain("--size--");
    });

    // DEFECT — чинится на шаге 3: ArrowDown обязан открывать список.
    it("does not open the list on ArrowDown", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      await wrapper.get(".vc-select__button").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.get(".vc-select__button").attributes("aria-expanded")).toBe("false");
      expect(wrapper.classes()).not.toContain("vc-select--opened");
    });
  });
});
