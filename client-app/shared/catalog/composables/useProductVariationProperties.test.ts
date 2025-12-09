import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import type { useProductVariationProperties as useProductVariationPropertiesType } from "./useProductVariationProperties";
import type { Product, Property } from "@/core/api/graphql/types";
import type { PrimitiveValueType } from "@/core/utilities/properties";

interface IPropertyRecord {
  name: string;
  value?: PrimitiveValueType;
  valueType?: PropertyValueTypes;
}

function createVariation(id: string, properties: IPropertyRecord[]): Product {
  return {
    id,
    properties: properties.map(
      ({ name, value, valueType = PropertyValueTypes.ShortText }): Property => ({
        name: name,
        value,
        propertyType: PropertyType.Variation,
        propertyValueType: valueType,
        label: name,
        hidden: false,
        id: name,
        multivalue: false,
      }),
    ),
  } as unknown as Product;
}

const mockData = {
  basic: [
    createVariation("1", [
      { name: "Color", value: "Red" },
      { name: "Size", value: "M" },
    ]),
    createVariation("2", [
      { name: "Color", value: "Red" },
      { name: "Size", value: "L" },
    ]),
    createVariation("3", [
      { name: "Color", value: "Blue" },
      { name: "Size", value: "M" },
    ]),
    createVariation("4", [{ name: "Material", value: "Cotton" }]),
  ],

  autoSelect: [
    createVariation("1", [
      { name: "Color", value: "Red" },
      { name: "Fit", value: "Slim" },
    ]),
    createVariation("2", [
      { name: "Color", value: "Blue" },
      { name: "Fit", value: "Regular" },
    ]),
  ],

  chainedAutoSelect: [
    createVariation("1", [
      { name: "Color", value: "Red" },
      { name: "Size", value: "S" },
      { name: "Fit", value: "Slim" },
    ]),
    createVariation("2", [
      { name: "Color", value: "Red" },
      { name: "Size", value: "M" },
      { name: "Fit", value: "Slim" },
    ]),
    createVariation("3", [
      { name: "Color", value: "Blue" },
      { name: "Size", value: "S" },
      { name: "Fit", value: "Regular" },
    ]),
  ],

  withDifferentPropTypes: [
    createVariation("1", [
      { name: "Available", value: true, valueType: PropertyValueTypes.Boolean },
      { name: "Count", value: 10, valueType: PropertyValueTypes.Integer },
      { name: "ReleaseDate", value: "2023-10-27T10:00:00Z", valueType: PropertyValueTypes.DateTime },
    ]),
    createVariation("2", [{ name: "Available", value: false, valueType: PropertyValueTypes.Boolean }]),
  ],

  withProblematicValues: [
    createVariation("1", [
      { name: "Color", value: "Red" },
      { name: "Size", value: null },
    ]),
    createVariation("2", [
      { name: "Color", value: "Red" },
      { name: "Size", value: undefined },
    ]),
    createVariation("3", [{ name: "noname", value: "orphaned" }]),
  ],
};

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/core/globals", () => ({
  globals: {
    i18n: {
      global: {
        t: vi.fn((key: string) => key),
        d: vi.fn((date: Date) => date.toLocaleDateString()),
        n: vi.fn((num: number) => num.toString()),
      },
    },
    cultureName: "en-US",
  },
}));

describe("useProductVariationProperties", () => {
  let useProductVariationProperties: typeof useProductVariationPropertiesType;

  beforeEach(async () => {
    vi.resetModules();
    // Dynamically import a fresh module for each test to reset the shared state
    const module = await import("./useProductVariationProperties");
    useProductVariationProperties = module.useProductVariationProperties;
  });

  it("initializes correctly with variation properties", () => {
    const variations = ref(mockData.basic);
    const { properties } = useProductVariationProperties(variations);

    expect(properties.value.size).toBe(3);
    expect(properties.value.has("Color")).toBe(true);
    expect(properties.value.has("Size")).toBe(true);
    expect(properties.value.has("Material")).toBe(true);

    const colorProperty = properties.value.get("Color");
    expect(colorProperty?.values.length).toBe(2);
    expect(colorProperty?.values).toEqual(
      expect.arrayContaining([
        { value: "Red", label: "Red", displayOrder: undefined },
        { value: "Blue", label: "Blue", displayOrder: undefined },
      ]),
    );
  });

  it("selects a property and updates selected state", () => {
    const variations = ref(mockData.basic);
    const { select, isSelected } = useProductVariationProperties(variations);

    select("Color", "Red");
    expect(isSelected("Color", "Red")).toBe(true);
    expect(isSelected("Color", "Blue")).toBe(false);
  });

  it("determines available state of properties correctly", () => {
    const variations = ref(mockData.basic);
    const { select, isAvailable } = useProductVariationProperties(variations);

    select("Color", "Blue");
    expect(isAvailable("Size", "L")).toBe(false);
    expect(isAvailable("Size", "M")).toBe(true);
  });

  it("auto-selects a property when only one choice remains", () => {
    const variationsWithAutoSelect = ref(mockData.autoSelect);
    const { select, isSelected } = useProductVariationProperties(variationsWithAutoSelect);

    select("Color", "Red");
    expect(isSelected("Fit", "Slim")).toBe(true);
  });

  it("resets incompatible selections when a new property is selected", () => {
    const variations = ref(mockData.basic);
    const { select, isSelected } = useProductVariationProperties(variations);

    select("Size", "L");
    expect(isSelected("Size", "L")).toBe(true);
    select("Color", "Blue");
    expect(isSelected("Size", "L")).toBe(false);
    expect(isSelected("Color", "Blue")).toBe(true);
    expect(isSelected("Size", "M")).toBe(true); // auto-selected
  });

  it("correctly identifies when all properties are selected (isCompleted)", () => {
    const variations = ref(mockData.basic.slice(0, 3));
    const { select, isCompleted } = useProductVariationProperties(variations);

    expect(isCompleted.value).toBe(false);
    select("Color", "Red");
    expect(isCompleted.value).toBe(false);
    select("Size", "M");
    expect(isCompleted.value).toBe(true);
  });

  it("returns the correct final variation when selection is complete", () => {
    const variations = ref(mockData.basic.slice(0, 3));
    const { select, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    select("Size", "M");
    expect(variationResult.value).toBeDefined();
    expect(variationResult.value?.id).toBe("1");
  });

  it("returns undefined for variationResult when selection is not complete", () => {
    const variations = ref(mockData.basic.slice(0, 3));
    const { select, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    expect(variationResult.value).toBeUndefined();
  });

  it("handles variations with different property counts", () => {
    const variations = ref(mockData.basic);
    const { select, isSelected, isAvailable } = useProductVariationProperties(variations);

    select("Material", "Cotton");
    expect(isSelected("Material", "Cotton")).toBe(true);
    expect(isAvailable("Color", "Red")).toBe(false);
    expect(isAvailable("Size", "M")).toBe(false);
  });

  it("resets selections when the variations array changes", async () => {
    const variations = ref(mockData.basic.slice(0, 1));
    const { select, isSelected, variationResult } = useProductVariationProperties(variations);

    select("Color", "Red");
    select("Size", "M");
    expect(isSelected("Color", "Red")).toBe(true);
    expect(variationResult.value).toBeDefined();

    variations.value = mockData.basic.slice(2, 3);
    await nextTick();

    expect(isSelected("Color", "Red")).toBe(false);
    expect(variationResult.value).toBeUndefined();
  });

  it("handles an empty variations array", () => {
    const variations = ref([]);
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
    ] as unknown as Product[]);
    const { properties, isCompleted } = useProductVariationProperties(variations);

    expect(properties.value.size).toBe(0);
    expect(isCompleted.value).toBe(false);
  });

  it("does not change selection when selecting the same value again", () => {
    const variations = ref(mockData.basic);
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
    const variationsWithChain = ref(mockData.chainedAutoSelect);

    const { select, isSelected, isCompleted } = useProductVariationProperties(variationsWithChain);

    select("Fit", "Regular");
    expect(isSelected("Fit", "Regular")).toBe(true);
    expect(isSelected("Color", "Blue")).toBe(true);
    expect(isSelected("Size", "S")).toBe(true);
    expect(isCompleted.value).toBe(true);
  });

  it("correctly formats display labels for different property value types", () => {
    const variationsWithTypes = ref(mockData.withDifferentPropTypes);

    const dateSpy = vi.spyOn(Date.prototype, "toLocaleDateString").mockReturnValue("mock date");
    const { properties } = useProductVariationProperties(variationsWithTypes);

    const availableProp = properties.value.get("Available");
    expect(availableProp?.values).toEqual(
      expect.arrayContaining([
        { value: "true", label: "common.labels.true_property", displayOrder: undefined },
        { value: "false", label: "common.labels.false_property", displayOrder: undefined },
      ]),
    );

    const countProp = properties.value.get("Count");
    expect(countProp?.values).toEqual(expect.arrayContaining([{ value: "10", label: "10", displayOrder: undefined }]));

    const releaseDateProp = properties.value.get("ReleaseDate");
    expect(releaseDateProp?.values).toEqual(
      expect.arrayContaining([{ value: "2023-10-27T10:00:00Z", label: "mock date", displayOrder: undefined }]),
    );

    dateSpy.mockRestore();
  });

  it("does not mark any property as available when no selections are made", () => {
    const variations = ref(mockData.basic);
    const { isAvailable } = useProductVariationProperties(variations);

    expect(isAvailable("Color", "Red")).toBe(true);
    expect(isAvailable("Color", "Blue")).toBe(true);
    expect(isAvailable("Size", "M")).toBe(true);
    expect(isAvailable("Size", "L")).toBe(true);
    expect(isAvailable("Material", "Cotton")).toBe(true);
  });

  it("handles properties with null, undefined or no name gracefully", () => {
    const variationsWithProblematicValues = ref(mockData.withProblematicValues);

    const { properties } = useProductVariationProperties(variationsWithProblematicValues);

    expect(properties.value.has("Color")).toBe(true);
    // Properties with null/undefined values should not be created
    expect(properties.value.has("Size")).toBe(false);
  });

  it("has a correct initial state before any selections", () => {
    const variations = ref(mockData.basic);
    const { isCompleted, variationResult, properties } = useProductVariationProperties(variations);

    expect(isCompleted.value).toBe(false);
    expect(variationResult.value).toBeUndefined();
    expect(properties.value.size).toBeGreaterThan(0);
  });

  it("initially returns all variations in applicableVariations", () => {
    const variations = ref(mockData.basic);
    const { applicableVariations } = useProductVariationProperties(variations);

    expect(applicableVariations.value.length).toBe(mockData.basic.length);
    expect(applicableVariations.value).toEqual(variations.value);
  });

  it("filters applicableVariations based on a single selection", () => {
    const variations = ref(mockData.basic);
    const { select, applicableVariations } = useProductVariationProperties(variations);

    select("Color", "Red");

    expect(applicableVariations.value.length).toBe(2);
    const ids = applicableVariations.value.map((v) => v.id);
    expect(ids).toEqual(expect.arrayContaining(["1", "2"]));
  });

  it("filters applicableVariations based on multiple selections", () => {
    const variations = ref(mockData.basic);
    const { select, applicableVariations } = useProductVariationProperties(variations);

    select("Color", "Red");
    select("Size", "M");

    expect(applicableVariations.value.length).toBe(1);
    expect(applicableVariations.value[0].id).toBe("1");
  });

  it("updates applicableVariations when an incompatible property is selected", () => {
    const variations = ref(mockData.basic);
    const { select, applicableVariations } = useProductVariationProperties(variations);

    select("Size", "L");
    expect(applicableVariations.value.length).toBe(1);
    expect(applicableVariations.value[0].id).toBe("2");

    select("Color", "Blue");
    expect(applicableVariations.value.length).toBe(1);
    expect(applicableVariations.value[0].id).toBe("3");
  });
});
