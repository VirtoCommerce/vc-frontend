import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useSelect } from "./useSelect";

type OptionType = { id?: string; name: string };

const ITEMS: OptionType[] = [{ name: "No id" }, { id: "a", name: "A" }];

describe("useSelect with an empty single model", () => {
  it.each([undefined, null])("selects no option lacking the value field: %s", (modelValue) => {
    const { selectedItem } = useSelect<OptionType, string | null>({
      items: ITEMS,
      modelValue,
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    expect(selectedItem.value).toBeUndefined();
  });

  it.each([undefined, null])("marks no option lacking the value field active: %s", (modelValue) => {
    const { isActiveItem } = useSelect<OptionType, string | null>({
      items: ITEMS,
      modelValue,
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    expect(isActiveItem(ITEMS[0])).toBe(false);
  });

  it("still selects the option the model names", () => {
    const { selectedItem, isActiveItem } = useSelect<OptionType, string>({
      items: ITEMS,
      modelValue: "a",
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    expect(selectedItem.value).toBe(ITEMS[1]);
    expect(isActiveItem(ITEMS[1])).toBe(true);
    expect(isActiveItem(ITEMS[0])).toBe(false);
  });
});

describe("useSelect with a null-valued option", () => {
  it("selects an option whose value is null for a null model", () => {
    const items = [
      { id: null, name: "Any" },
      { id: "a", name: "A" },
    ];
    const { selectedItem, isActiveItem } = useSelect<{ id: string | null; name: string }, string | null>({
      items,
      modelValue: null,
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    expect(selectedItem.value).toBe(items[0]);
    expect(isActiveItem(items[0])).toBe(true);
    expect(isActiveItem(items[1])).toBe(false);
  });
});

describe("useSelect with an empty multiple model", () => {
  it.each([undefined, []])("marks no option lacking the value field active: %s", (modelValue) => {
    const { isActiveItem } = useSelect<OptionType, string>({
      items: ITEMS,
      modelValue,
      multiple: true,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    expect(isActiveItem(ITEMS[0])).toBe(false);
  });
});

describe("useSelect remembering the selected item", () => {
  it("labels a value picked and paged away from within one tick", () => {
    const items = ref<OptionType[]>(ITEMS);
    const modelValue = ref<string | undefined>(undefined);
    const { selectedItem } = useSelect<OptionType, string | undefined>({
      items,
      modelValue,
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "name",
      valueField: "id",
    });

    modelValue.value = "a";
    items.value = [];

    expect(selectedItem.value).toEqual(ITEMS[1]);
  });
});

describe("useSelect hasSelection in single mode", () => {
  type ChoiceType = { value: string | null; label: string };

  const CHOICES: ChoiceType[] = [
    { value: null, label: "Any" },
    { value: "a", label: "A" },
  ];

  function hasSelectionFor(items: ChoiceType[], modelValue: string | null | undefined): boolean {
    const { hasSelection } = useSelect<ChoiceType, string | null>({
      items,
      modelValue,
      multiple: false,
      filterValue: "",
      serverFilter: false,
      textField: "label",
      valueField: "value",
    });

    return hasSelection.value;
  }

  it("counts an option whose value is null as a selection", () => {
    expect(hasSelectionFor(CHOICES, null)).toBe(true);
  });

  it("counts a null model as no selection when no option carries null", () => {
    expect(hasSelectionFor(CHOICES.slice(1), null)).toBe(false);
  });

  it("counts an unset model as no selection, even over an option without a value", () => {
    expect(hasSelectionFor([...CHOICES, { label: "No value" } as ChoiceType], undefined)).toBe(false);
  });

  it("counts a value no loaded option carries as a selection", () => {
    expect(hasSelectionFor(CHOICES, "off-page")).toBe(true);
  });

  it("keeps counting a null-valued option once a new page no longer carries it", () => {
    const items = ref(CHOICES);
    const { hasSelection } = useSelect<ChoiceType, string | null>({
      items,
      modelValue: null,
      multiple: false,
      filterValue: "",
      serverFilter: true,
      textField: "label",
      valueField: "value",
    });

    items.value = [{ value: "b", label: "B" }];

    expect(hasSelection.value).toBe(true);
  });
});
