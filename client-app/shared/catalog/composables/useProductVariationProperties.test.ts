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

  it("handles an empty variations array", () => {
    const variations = ref<readonly Product[]>([]);
    const { properties, isCompleted, variationResult } = useProductVariationProperties(variations);

    expect(properties.value.size).toBe(0);
    expect(isCompleted.value).toBe(false);
    expect(variationResult.value).toBeUndefined();
  });

  it("handles variations with no 'Variation' type properties", () => {
    const variations = ref([
      {
        id: "1",
        properties: [
          {
            name: "Color",
            value: "Red",
            propertyType: PropertyType.Product,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "Color",
          },
        ],
      },
    ] as unknown as readonly Product[]);
    const { properties, isCompleted } = useProductVariationProperties(variations);

    expect(properties.value.size).toBe(0);
    expect(isCompleted.value).toBe(false);
  });

  it("does not change selection when selecting the same value again", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { select, isSelected } = useProductVariationProperties(variations);

    select("Color", "Red");
    expect(isSelected("Color", "Red")).toBe(true);

    select("Size", "M");
    expect(isSelected("Size", "M")).toBe(true);

    select("Color", "Red");
    expect(isSelected("Color", "Red")).toBe(true);
    expect(isSelected("Size", "M")).toBe(true);
  });

  it("handles a chain of auto-selections", () => {
    const variationsWithChain = ref([
      {
        id: "1",
        properties: [
          { name: "Color", value: "Red" },
          { name: "Size", value: "S" },
          { name: "Fit", value: "Slim" },
        ].map((p) => ({ ...p, propertyType: PropertyType.Variation, propertyValueType: PropertyValueTypes.ShortText })),
      },
      {
        id: "2",
        properties: [
          { name: "Color", value: "Red" },
          { name: "Size", value: "M" },
          { name: "Fit", value: "Slim" },
        ].map((p) => ({ ...p, propertyType: PropertyType.Variation, propertyValueType: PropertyValueTypes.ShortText })),
      },
      {
        id: "3",
        properties: [
          { name: "Color", value: "Blue" },
          { name: "Size", value: "S" },
          { name: "Fit", value: "Regular" },
        ].map((p) => ({ ...p, propertyType: PropertyType.Variation, propertyValueType: PropertyValueTypes.ShortText })),
      },
    ] as unknown as readonly Product[]);

    const { select, isSelected, isCompleted } = useProductVariationProperties(variationsWithChain);

    select("Fit", "Regular");
    expect(isSelected("Fit", "Regular")).toBe(true);
    expect(isSelected("Color", "Blue")).toBe(true);
    expect(isSelected("Size", "S")).toBe(true);
    expect(isCompleted.value).toBe(true);
  });

  it("correctly formats display labels for different property value types", () => {
    const variationsWithTypes = ref([
      {
        id: "1",
        properties: [
          {
            name: "Available",
            value: true,
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.Boolean,
            label: "Available",
          },
          {
            name: "Count",
            value: 10,
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.Integer,
            label: "Count",
          },
          {
            name: "ReleaseDate",
            value: "2023-10-27T10:00:00Z",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.DateTime,
            label: "ReleaseDate",
          },
        ],
      },
      {
        id: "2",
        properties: [
          {
            name: "Available",
            value: false,
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.Boolean,
            label: "Available",
          },
        ],
      },
    ] as unknown as readonly Product[]);

    const dateSpy = vi.spyOn(Date.prototype, "toLocaleDateString").mockReturnValue("mock date");
    const { properties } = useProductVariationProperties(variationsWithTypes);

    const availableProp = properties.value.get("Available");
    expect(availableProp?.values).toEqual(
      expect.arrayContaining([
        { value: true, label: "common.labels.true_property" },
        { value: false, label: "common.labels.false_property" },
      ]),
    );

    const countProp = properties.value.get("Count");
    expect(countProp?.values).toEqual(expect.arrayContaining([{ value: 10, label: "10" }]));

    const releaseDateProp = properties.value.get("ReleaseDate");
    expect(releaseDateProp?.values).toEqual(
      expect.arrayContaining([{ value: "2023-10-27T10:00:00Z", label: "mock date" }]),
    );

    dateSpy.mockRestore();
  });

  it("does not mark any property as inactive when no selections are made", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { isInactive } = useProductVariationProperties(variations);

    expect(isInactive("Color", "Red")).toBe(false);
    expect(isInactive("Color", "Blue")).toBe(false);
    expect(isInactive("Size", "M")).toBe(false);
    expect(isInactive("Size", "L")).toBe(false);
    expect(isInactive("Material", "Cotton")).toBe(false);
  });

  it("handles properties with null, undefined or no name gracefully", () => {
    const variationsWithProblematicValues = ref([
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
            value: null,
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
            value: undefined,
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
            name: undefined,
            value: "orphaned",
            propertyType: PropertyType.Variation,
            propertyValueType: PropertyValueTypes.ShortText,
            label: "No name",
          },
        ],
      },
    ] as unknown as readonly Product[]);

    const { properties } = useProductVariationProperties(variationsWithProblematicValues);

    expect(properties.value.has("Color")).toBe(true);
    expect(properties.value.has("Size")).toBe(true);

    const sizeProperty = properties.value.get("Size");
    expect(sizeProperty?.values).toHaveLength(1);
    expect(sizeProperty?.values).toEqual(expect.arrayContaining([{ value: null, label: "null" }]));
  });

  it("has a correct initial state before any selections", () => {
    const variations = ref(MOCK_VARIATIONS);
    const { isCompleted, variationResult, properties } = useProductVariationProperties(variations);

    expect(isCompleted.value).toBe(false);
    expect(variationResult.value).toBeUndefined();
    expect(properties.value.size).toBeGreaterThan(0);
  });
});
