import { describe, it, expect, vi } from "vitest";
import { ref, nextTick } from "vue";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import { useProductVariationProperties } from "./useProductVariationProperties";
import type { Product } from "@/core/api/graphql/types";

const MOCK_VARIATIONS = [
  {
    id: "1",
    properties: [
      {
        name: "Color",
        value: "Red",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Color",
      },
      {
        name: "Size",
        value: "M",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Size",
      },
    ],
  },
  {
    id: "2",
    properties: [
      {
        name: "Color",
        value: "Red",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Color",
      },
      {
        name: "Size",
        value: "L",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Size",
      },
    ],
  },
  {
    id: "3",
    properties: [
      {
        name: "Color",
        value: "Blue",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Color",
      },
      {
        name: "Size",
        value: "M",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Size",
      },
    ],
  },
  {
    id: "4",
    properties: [
      {
        name: "Material",
        value: "Cotton",
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        label: "Material",
      },
    ],
  },
] as unknown as readonly Product[];

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("useProductVariationProperties", () => {
  it("initializes correctly with variation properties", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { properties } = useProductVariationProperties(variations);

    expect(properties.value.size).toBe(3);
    expect(properties.value.has("Color")).toBe(true);
    expect(properties.value.has("Size")).toBe(true);
    expect(properties.value.has("Material")).toBe(true);

    const colorProperty = properties.value.get("Color");
    expect(colorProperty?.values.length).toBe(2);
    expect(colorProperty?.values).toEqual(
      expect.arrayContaining([
        { value: "Red", label: "Red" },
        { value: "Blue", label: "Blue" },
      ]),
    );
  });

  it("selects a property and updates selected state", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { select, isSelected } = useProductVariationProperties(variations);

    select("Color", "Red");
    expect(isSelected("Color", "Red")).toBe(true);
    expect(isSelected("Color", "Blue")).toBe(false);
  });

  it("determines inactive state of properties correctly", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { select, isInactive } = useProductVariationProperties(variations);

    select("Color", "Blue");
    expect(isInactive("Size", "L")).toBe(true);
    expect(isInactive("Size", "M")).toBe(false);
  });

  it("auto-selects a property when only one choice remains", () => {
    const variationsWithAutoSelect = ref([
      {
        id: "1",
        properties: [
          {
            name: "Color",
            value: "Red",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "Color",
          },
          {
            name: "Fit",
            value: "Slim",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "Fit",
          },
        ],
      },
      {
        id: "2",
        properties: [
          {
            name: "Color",
            value: "Blue",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "Color",
          },
          {
            name: "Fit",
            value: "Regular",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "Fit",
          },
        ],
      },
    ] as unknown as readonly Product[]);
    const { select, isSelected } = useProductVariationProperties(variationsWithAutoSelect);

    select("Color", "Red");
    expect(isSelected("Fit", "Slim")).toBe(true);
  });

  it("resets incompatible selections when a new property is selected", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { select, isSelected } = useProductVariationProperties(variations);

    select("Size", "L");
    expect(isSelected("Size", "L")).toBe(true);
    select("Color", "Blue");
    expect(isSelected("Size", "L")).toBe(false);
    expect(isSelected("Color", "Blue")).toBe(true);
    expect(isSelected("Size", "M")).toBe(true); // auto-selected
  });

  it("correctly identifies when all properties are selected (isCompleted)", () => {
    const variations = ref(MOCK_VARIATIONS.slice(0, 3));
    const { select, isCompleted } = useProductVariationProperties(variations);

    expect(isCompleted.value).toBe(false);
    select("Color", "Red");
    expect(isCompleted.value).toBe(false);
    select("Size", "M");
    expect(isCompleted.value).toBe(true);
  });

  it("returns the correct final variation when selection is complete", () => {
    const variations = ref(MOCK_VARIATIONS.slice(0, 3));
    const { select, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    select("Size", "M");
    expect(variationResult.value).toBeDefined();
    expect(variationResult.value?.id).toBe("1");
  });

  it("returns undefined for variationResult when selection is not complete", () => {
    const variations = ref(MOCK_VARIATIONS.slice(0, 3));
    const { select, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    expect(variationResult.value).toBeUndefined();
  });

  it("handles variations with different property counts", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { select, isSelected, isInactive } = useProductVariationProperties(variations);

    select("Material", "Cotton");
    expect(isSelected("Material", "Cotton")).toBe(true);
    expect(isInactive("Color", "Red")).toBe(true);
    expect(isInactive("Size", "M")).toBe(true);
  });

  it("resets selections when the variations array changes", async () => {
    const variations = ref(MOCK_VARIATIONS.slice(0, 1));
    const { select, isSelected, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    select("Size", "M");
    expect(isSelected("Color", "Red")).toBe(true);
    expect(variationResult.value).toBeDefined();

    variations.value = MOCK_VARIATIONS.slice(2, 3);
    await nextTick();

    expect(isSelected("Color", "Red")).toBe(false);
    expect(variationResult.value).toBeUndefined();
  });
});
