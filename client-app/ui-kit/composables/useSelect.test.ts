import { describe, expect, it } from "vitest";
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
      valueField: "id",
    });

    expect(selectedItem.value).toBe(ITEMS[1]);
    expect(isActiveItem(ITEMS[1])).toBe(true);
    expect(isActiveItem(ITEMS[0])).toBe(false);
  });
});

describe("useSelect with an empty multiple model", () => {
  it.each([undefined, []])("marks no option lacking the value field active: %s", (modelValue) => {
    const { isActiveItem } = useSelect<OptionType, string>({
      items: ITEMS,
      modelValue,
      multiple: true,
      filterValue: "",
      valueField: "id",
    });

    expect(isActiveItem(ITEMS[0])).toBe(false);
  });
});
