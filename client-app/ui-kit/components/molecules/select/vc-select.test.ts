import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
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
          selected_of_total: "{selected} of {total}",
        },
      },
    },
  },
});

// attachTo: VcSelect ищет опции через document.querySelectorAll, а document.activeElement
// отслеживает только присоединённые узлы — detached-монтирование ломает и то и другое.
// Отсюда обязательный auto-unmount: оставшийся в body экземпляр перехватывал бы
// эти запросы в следующих тестах.
// jsdom has no IntersectionObserver, and VcInfinityScrollLoader constructs one on mount.
// The sentinel's visibility is not what these tests check, so a no-op is enough.
class IntersectionObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

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

    // Single сравнивает по идентичности, а не по содержимому: эквивалентный, но другой
    // объект — это новый выбор, и он обязан эмитить. На этом держится date-filter-select,
    // который пересоздаёт свои диапазоны при смене локали и ждёт change, чтобы сбросить
    // флаги валидности.
    it("re-emits for a deep-equal but distinct object", async () => {
      const items = [{ code: "al" }, { code: "be" }];
      const wrapper = createWrapper({ items, textField: "code", modelValue: { code: "be" } });

      await wrapper.findAll('[role="option"]')[1].trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[items[1]]]);
    });

    // Пустая строка как модель не совпадает ни с одним элементом, поэтому должна
    // вести себя как «ничего не выбрано», а не съедать placeholder пустой меткой.
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

    // Значение, которого нет в items, не должно протекать в поле как сырой текст.
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
    // Проп объявлен как `M & boolean`, а не просто `M`: без литерального boolean в типе
    // Vue не генерирует приведение, и shorthand-атрибут `multiple` приезжает пустой
    // строкой — falsy. Приложение передаёт именно shorthand, поэтому мультивыбор
    // молча превращался в одиночный. Здесь пустая строка эмулирует shorthand.
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

    // Модель в multiple хранит значения valueField, поэтому подсветка обязана
    // сравнивать значения с значениями, а не с целыми объектами.
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

    // Модель одинакова в обоих режимах: массив значений valueField, а не целых элементов.
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

    // Неинициализированная модель трактуется как пустой массив, а не проваливается
    // в одиночный выбор (как было до рефакторинга).
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

      expect(wrapper.find(".vc-select__select-all").exists()).toBe(false);
    });

    it("is ignored in single mode", () => {
      const wrapper = createWrapper({ items: ITEMS, selectAll: true });

      expect(wrapper.find(".vc-select__select-all").exists()).toBe(false);
    });

    it("selects every visible option and announces itself", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });

      await wrapper.get(".vc-select__select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[ITEMS]]);
      expect(wrapper.emitted("selectAll")).toHaveLength(1);
    });

    it("clears the visible options when everything is already selected", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [...ITEMS] });

      await wrapper.get(".vc-select__select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[[]]]);
    });

    it("reports mixed state for a partial selection", () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: ["Albania"] });

      expect(wrapper.get(".vc-select__select-all input").attributes("aria-checked")).toBe("mixed");
    });

    it("reports checked state once everything is selected", () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [...ITEMS] });

      expect(wrapper.get(".vc-select__select-all input").attributes("aria-checked")).toBe("true");
    });

    it("counts against the whole set, not the loaded page", () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: ["Albania"], total: 3000 });

      expect(wrapper.get(".vc-select__select-all-count").text()).toBe("1 of 3000");
    });

    it("falls back to the option count when no total is given", () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, modelValue: ["Albania"] });

      expect(wrapper.get(".vc-select__select-all-count").text()).toBe("1 of 3");
    });

    // Фильтр сужает набор: выбирается видимое, а отфильтрованный выбор сохраняется.
    it("acts on the filtered subset only", async () => {
      const wrapper = createWrapper({ ...selectAllProps, autocomplete: true, modelValue: ["China"] });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");
      await wrapper.get(".vc-select__select-all input").trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[["China", "Belgium"]]]);
    });

    // Счётчик и чекбокс рядом обязаны говорить об одном наборе. С фильтром "bel" виден один
    // невыбранный Belgium, а выбранная Albania скрыта — раньше подпись читалась "1 of 1".
    it("counts only what the filter leaves visible", async () => {
      const wrapper = createWrapperWithMessages({ ...selectAllProps, autocomplete: true, modelValue: ["Albania"] });
      const input = wrapper.get("input");

      await input.trigger("click");
      await input.setValue("bel");
      await nextTick();

      expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(["Belgium"]);
      expect(wrapper.get(".vc-select__select-all-count").text()).toBe("0 of 1");
      expect(wrapper.get(".vc-select__select-all input").attributes("aria-checked")).toBe("false");
    });

    it("keeps counting against the whole set while a server-side filter is on", async () => {
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

      expect(wrapper.get(".vc-select__select-all-count").text()).toBe("1 of 3000");
    });

    it("hands focus to the checkbox on Tab, since the popover is out of tab order", async () => {
      const wrapper = createWrapper({ ...selectAllProps, modelValue: [] });
      const input = wrapper.get("input");

      (input.element as HTMLInputElement).focus();
      await input.trigger("click");
      await input.trigger("keydown", { key: "Tab" });

      expect(document.activeElement).toBe(wrapper.get(".vc-select__select-all input").element);
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

  describe("async loading", () => {
    it("shows a spinner instead of the empty row while the first page loads", () => {
      const wrapper = createWrapper({ items: [], loading: true });

      expect(wrapper.find(".vc-select__loader").exists()).toBe(true);
      expect(wrapper.get('[role="option"]').text()).not.toContain("ui_kit.select.no_options");
    });

    it("keeps showing options while a further page loads", () => {
      const wrapper = createWrapper({ items: ITEMS, loading: true });

      expect(wrapper.find(".vc-select__loader").exists()).toBe(false);
      expect(wrapper.findAll('[role="option"]')).toHaveLength(ITEMS.length);
    });

    it("renders the load-more sentinel only when more pages exist", () => {
      const without = createWrapper({ items: ITEMS });
      const with_ = createWrapper({ items: ITEMS, hasNextPage: true });

      expect(without.find(".vc-select__load-more").exists()).toBe(false);
      expect(with_.find(".vc-select__load-more").exists()).toBe(true);
    });

    // Подгрузка страницы дописывает элементы в конец: подсвеченный не сдвинулся, значит
    // подсветка обязана уцелеть. Сброс отбрасывал бы пользователя в начало на каждой странице.
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

    // А вот подмена списка (новый ответ поиска) ставит под индекс другой пункт — тут сброс нужен.
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

    it("stays silent when filtering locally", async () => {
      const wrapper = createWrapper({ items: ITEMS, autocomplete: true });

      await wrapper.get("input").trigger("focus");
      await wrapper.get("input").setValue("bel");

      expect(wrapper.emitted("search")).toBeUndefined();
    });
  });

  describe("keyboard and ARIA", () => {
    // Фокус остаётся на триггере: список ведётся через aria-activedescendant, а не переносом
    // фокуса. Иначе в autocomplete после первой же стрелки нельзя было бы печатать.
    it("keeps DOM focus on the trigger while arrowing through options", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      // Реальный фокус, а не только событие: trigger("focus") не двигает document.activeElement.
      (input.element as HTMLInputElement).focus();
      await input.trigger("focus");
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(document.activeElement).toBe(input.element);
      expect(wrapper.findAll('[role="option"]')[0].attributes("id")).toBe(input.attributes("aria-activedescendant"));
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

    // Открытие с клавиатуры: APG кладёт подсветку на первый пункт для Down/Home и на последний
    // для Up/End. Раньше всё, кроме End, открывало список на нулевом индексе.
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

      await wrapper.get(".vc-select__arrow").trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");
      expect(input.attributes("aria-controls")).toBe(wrapper.get('[role="listbox"]').attributes("id"));
    });

    // Закрытие возвращает фокус на триггер, а дефолтный триггер открывается по фокусу —
    // без развязки эти двое гоняются друг за другом и список не закрыть выбором пункта.
    it("closes when an option is picked with the default trigger", async () => {
      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await wrapper.get(".vc-select__arrow").trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      await wrapper.findAll('[role="option"]')[1].trigger("click");
      await nextTick();

      expect(input.attributes("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(input.element);
    });

    // Клик снаружи уже поставил фокус туда, куда целился пользователь. Забрать его обратно —
    // значит не дать кликнуть в соседнее поле: оно закроет список и сразу потеряет фокус.
    it("leaves focus alone when it has already moved outside", async () => {
      const outside = document.createElement("input");
      document.body.appendChild(outside);

      const wrapper = createWrapper({ items: ITEMS });
      const input = wrapper.get("input");

      await input.trigger("click");

      expect(input.attributes("aria-expanded")).toBe("true");

      outside.focus();
      // Именно так закрытие приходит от клика снаружи: попап сам гасит себя и сообщает об этом.
      wrapper.getComponent({ name: "VcPopover" }).vm.$emit("toggle", false);
      await nextTick();

      expect(document.activeElement).toBe(outside);

      outside.remove();
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

      await wrapper.get(".vc-select__arrow").trigger("click");
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

    // Без valueField модель — это сам элемент, поэтому значение, которого нет в items,
    // всё равно попадает в слот, а не проваливается в placeholder.
    it("renders the selected slot for a model value that matches no item", () => {
      const wrapper = createWrapper({ items: ITEMS, modelValue: "Atlantis" }, slots);

      expect(wrapper.find(".probe-selected").exists()).toBe(true);
      expect(wrapper.find(".probe-placeholder").exists()).toBe(false);
    });

    // Позитивная ветка слота: selected (vc-select.vue:273) резолвит модель обратно в элемент
    // через valueField, и слот получает целый объект. Шаг 1 переписывает этот резолв.
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

      expect(wrapper.find(".vc-select__clear").exists()).toBe(true);

      await wrapper.get(".vc-select__clear").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
    });

    it("hides the clear button when nothing is selected", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true }, slots);

      expect(wrapper.find(".vc-select__clear").exists()).toBe(false);
    });

    it("reflects the size prop as a modifier", () => {
      const wrapper = createWrapper({ items: ITEMS, size: "xs" }, slots);

      expect(wrapper.get(".vc-select__button").classes()).toContain("vc-select__button--size--xs");
    });

    // Клик по слотовому триггеру не открывал список с тех пор, как VcSelect переехал с
    // VcDropdownMenu на VcPopover: тот вешает свой `click: toggle` на обёртку #trigger-слота,
    // и наш emit складывался с ним в двойной toggle. Ветка с VcInput уцелела только потому,
    // что vc-input.vue сам гасит клик (`@click.stop`).
    it("opens, closes and reopens on click", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);
      const trigger = wrapper.get(".vc-select__button-trigger");

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
      await wrapper.get(".vc-select__button-trigger").trigger("click");

      expect(wrapperClicks).toBe(0);
    });

    it("opens the list on ArrowDown", async () => {
      const wrapper = createWrapper({ items: ITEMS }, slots);

      await wrapper.get(".vc-select__button-trigger").trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(wrapper.get(".vc-select__button-trigger").attributes("aria-expanded")).toBe("true");
      expect(wrapper.classes()).toContain("vc-select--opened");
    });

    // Настоящая <button>, а не div с role: внутри лежит кнопка очистки, а кнопку в кнопку
    // вкладывать нельзя — она осталась соседом, а триггер накрывает коробку псевдоэлементом.
    it("renders a real button element carrying the combobox semantics", () => {
      const wrapper = createWrapper({ items: ITEMS, clearable: true, modelValue: "Belgium" }, slots);
      const trigger = wrapper.get(".vc-select__button-trigger");

      expect(trigger.element.tagName).toBe("BUTTON");
      expect(trigger.attributes("type")).toBe("button");
      expect(trigger.attributes("role")).toBeUndefined();
      expect(trigger.attributes("aria-haspopup")).toBe("listbox");
      expect(trigger.find("button").exists()).toBe(false);
      expect(wrapper.get(".vc-select__clear").element.closest(".vc-select__button-trigger")).toBeNull();
    });
  });
});
