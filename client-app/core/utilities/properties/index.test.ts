import { describe, it, expect, vi } from "vitest";
import { PropertyValueTypes, PropertyType } from "@/core/api/graphql/types";
import {
  getPropertyValue,
  getPropertiesGroupedByName,
  getGroupedAndSortedProperties,
  getVariationPropertiesGroupedByName,
  normalizePropertyValue,
  isColorProperty,
  isMultiColorProperty,
} from "./index";
import type { Property, PropertyGroup } from "@/core/api/graphql/types";

// Mock the globals.i18n
vi.mock("@/core/globals", () => ({
  globals: {
    i18n: {
      global: {
        t: vi.fn().mockImplementation((key: string) => {
          const translations: Record<string, string> = {
            "common.labels.true_property": "Yes",
            "common.labels.false_property": "No",
            "common.labels.other": "Other",
          };
          return translations[key] || key;
        }),
        d: vi.fn().mockImplementation((date: Date) => date.toLocaleDateString()),
        n: vi.fn().mockImplementation((num: number) => num.toString()),
      },
    },
  },
}));

describe("Properties Utilities", () => {
  describe("getPropertyValue", () => {
    it("should return undefined for property without value", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.ShortText,
        value: undefined,
      };

      const result = getPropertyValue(property);
      expect(result).toBeUndefined();
    });

    it("should return formatted string for ShortText property", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.ShortText,
        value: "Hello World",
      };

      const result = getPropertyValue(property);
      expect(result).toBe("Hello World");
    });

    it("should return translated true for Boolean property with true value", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.Boolean,
        value: true,
      };

      const result = getPropertyValue(property);
      expect(result).toBe("Yes");
    });

    it("should return translated false for Boolean property with false value", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.Boolean,
        value: false,
      };

      const result = getPropertyValue(property);
      expect(result).toBe("No");
    });

    it("should return formatted number for Integer property", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.Integer,
        value: 42,
      };

      const result = getPropertyValue(property);
      expect(result).toBe("42");
    });

    it("should return formatted number for Number property", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.Number,
        value: 3.14,
      };

      const result = getPropertyValue(property);
      expect(result).toBe("3.14");
    });

    it("should return formatted date for DateTime property", () => {
      const testDate = new Date("2024-01-15");
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Catalog,
        propertyValueType: PropertyValueTypes.DateTime,
        value: testDate.toISOString(),
      };

      const result = getPropertyValue(property);
      expect(result).toBe(testDate.toLocaleDateString());
    });
  });

  describe("getPropertiesGroupedByName", () => {
    it("should group properties by name", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "color",
          label: "Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Red",
        },
        {
          id: "2",
          name: "size",
          label: "Size",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Large",
        },
      ];

      const result = getPropertiesGroupedByName(properties);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result["color"].value).toBe("Red");
      expect(result["size"].value).toBe("Large");
    });

    it("should skip hidden properties", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "visible",
          label: "Visible",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Visible",
        },
        {
          id: "2",
          name: "hidden",
          label: "Hidden",
          hidden: true,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Hidden",
        },
      ];

      const result = getPropertiesGroupedByName(properties);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result["visible"]).toBeDefined();
      expect(result["hidden"]).toBeUndefined();
    });

    it("should combine values for properties with the same name", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "color",
          label: "Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Red",
        },
        {
          id: "2",
          name: "color",
          label: "Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Blue",
        },
      ];

      const result = getPropertiesGroupedByName(properties);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result["color"].value).toBe("Red, Blue");
    });

    it("should filter by property type when provided", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "catalog_prop",
          label: "Catalog",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Catalog",
        },
        {
          id: "2",
          name: "category_prop",
          label: "Category",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Category,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Category",
        },
      ];

      const result = getPropertiesGroupedByName(properties, PropertyType.Catalog);
      expect(Object.keys(result)).toHaveLength(1);
      expect(result["catalog_prop"]).toBeDefined();
      expect(result["category_prop"]).toBeUndefined();
    });
  });

  describe("getGroupedAndSortedProperties", () => {
    it("should group properties by their group", () => {
      const group1: PropertyGroup = {
        id: "group1",
        name: "Group 1",
        displayOrder: 1,
        description: "",
      };

      const properties: Property[] = [
        {
          id: "1",
          name: "prop1",
          label: "Property 1",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 1",
          group: group1,
        },
        {
          id: "2",
          name: "prop2",
          label: "Property 2",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 2",
          group: group1,
        },
      ];

      const result = getGroupedAndSortedProperties(properties);
      expect(result).toHaveLength(1);
      expect(result[0].group?.id).toBe("group1");
      expect(result[0].properties).toHaveLength(2);
    });

    it("should return ungrouped properties without group when no valid groups exist", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "prop1",
          label: "Property 1",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 1",
        },
        {
          id: "2",
          name: "prop2",
          label: "Property 2",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 2",
        },
      ];

      const result = getGroupedAndSortedProperties(properties);
      expect(result).toHaveLength(1);
      expect(result[0].group).toBeUndefined();
      expect(result[0].properties).toHaveLength(2);
    });

    it("should sort groups by displayOrder", () => {
      const group1: PropertyGroup = { id: "group1", name: "Group 1", displayOrder: 2, description: "" };
      const group2: PropertyGroup = { id: "group2", name: "Group 2", displayOrder: 1, description: "" };

      const properties: Property[] = [
        {
          id: "1",
          name: "prop1",
          label: "Property 1",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 1",
          group: group1,
        },
        {
          id: "2",
          name: "prop2",
          label: "Property 2",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 2",
          group: group2,
        },
      ];

      const result = getGroupedAndSortedProperties(properties);
      expect(result).toHaveLength(2);
      expect(result[0].group?.id).toBe("group2");
      expect(result[1].group?.id).toBe("group1");
    });

    it("should use defaultGroup for properties without group when valid groups exist", () => {
      const group1: PropertyGroup = { id: "group1", name: "Group 1", displayOrder: 1, description: "" };

      const properties: Property[] = [
        {
          id: "1",
          name: "prop1",
          label: "Property 1",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 1",
          group: group1,
        },
        {
          id: "2",
          name: "prop2",
          label: "Property 2",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 2",
        },
        {
          id: "3",
          name: "prop3",
          label: "Property 3",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Catalog,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value 3",
          group: { id: "", name: "Empty ID Group", displayOrder: 0, description: "" },
        },
      ];

      const result = getGroupedAndSortedProperties(properties);
      expect(result).toHaveLength(2);

      const defaultGroupResult = result.find((item) => item.group?.id === "ungrouped");
      expect(defaultGroupResult).toBeDefined();
      expect(defaultGroupResult?.group?.id).toBe("ungrouped");
      expect(defaultGroupResult?.group?.name).toBe("Other");
      expect(defaultGroupResult?.group?.displayOrder).toBe(Infinity);
      expect(defaultGroupResult?.properties).toHaveLength(2);
      expect(defaultGroupResult?.properties.map((p) => p.id)).toEqual(["2", "3"]);

      const group1Result = result.find((item) => item.group?.id === "group1");
      expect(group1Result).toBeDefined();
      expect(group1Result?.properties).toHaveLength(1);
      expect(group1Result?.properties[0].id).toBe("1");
    });
  });

  describe("getVariationPropertiesGroupedByName", () => {
    it("should group variation properties by name preserving all instances", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "FabricColor",
          label: "Fabric Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Red",
          colorCode: "#ff0000",
        },
        {
          id: "2",
          name: "FabricColor",
          label: "Fabric Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Blue",
          colorCode: "#0000ff",
        },
        {
          id: "3",
          name: "Size",
          label: "Size",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Large",
        },
      ];

      const result = getVariationPropertiesGroupedByName(properties, PropertyType.Variation);
      expect(result.size).toBe(2);
      expect(result.get("FabricColor")).toHaveLength(2);
      expect(result.get("FabricColor")?.[0].value).toBe("Red");
      expect(result.get("FabricColor")?.[1].value).toBe("Blue");
      expect(result.get("Size")).toHaveLength(1);
      expect(result.get("Size")?.[0].value).toBe("Large");
    });

    it("should filter by property type", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "variation_prop",
          label: "Variation",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Variation",
        },
        {
          id: "2",
          name: "product_prop",
          label: "Product",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Product,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Product",
        },
      ];

      const result = getVariationPropertiesGroupedByName(properties, PropertyType.Variation);
      expect(result.size).toBe(1);
      expect(result.has("variation_prop")).toBe(true);
      expect(result.has("product_prop")).toBe(false);
    });

    it("should skip properties without name or value", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "valid",
          label: "Valid",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value",
        },
        {
          id: "2",
          name: "",
          label: "No Name",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Value",
        },
        {
          id: "3",
          name: "undefined_value",
          label: "Undefined Value",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: undefined,
        },
        {
          id: "4",
          name: "null_value",
          label: "Null Value",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: null,
        },
      ];

      const result = getVariationPropertiesGroupedByName(properties, PropertyType.Variation);
      expect(result.size).toBe(1);
      expect(result.has("valid")).toBe(true);
      expect(result.has("undefined_value")).toBe(false);
      expect(result.has("null_value")).toBe(false);
    });
  });

  describe("normalizePropertyValue", () => {
    it("should return colorCode if present", () => {
      const property: Property = {
        id: "1",
        name: "color",
        label: "Color",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.Color,
        value: "Red",
        colorCode: "#ff0000",
      };

      const result = normalizePropertyValue(property);
      expect(result).toBe("#ff0000");
    });

    it("should return lowercase string value for color properties without colorCode", () => {
      const property: Property = {
        id: "1",
        name: "Color",
        label: "Color",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.Color,
        value: "RED",
      };

      const result = normalizePropertyValue(property);
      expect(result).toBe("red");
    });

    it("should return original string value for non-color properties", () => {
      const property: Property = {
        id: "1",
        name: "Size",
        label: "Size",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        value: "LARGE",
      };

      const result = normalizePropertyValue(property);
      expect(result).toBe("LARGE");
    });

    it("should handle undefined value", () => {
      const property: Property = {
        id: "1",
        name: "test",
        label: "Test",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        value: undefined,
      };

      const result = normalizePropertyValue(property);
      expect(result).toBe("");
    });

    it("should handle numeric value", () => {
      const property: Property = {
        id: "1",
        name: "count",
        label: "Count",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.Integer,
        value: 42,
      };

      const result = normalizePropertyValue(property);
      expect(result).toBe("42");
    });
  });

  describe("isColorProperty", () => {
    it("should return true for color property type", () => {
      const property: Property = {
        id: "1",
        name: "color",
        label: "Color",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.Color,
        value: "Red",
      };

      const result = isColorProperty(property);
      expect(result).toBe(true);
    });

    it("should return false for non-color property type", () => {
      const textProperty: Property = {
        id: "1",
        name: "size",
        label: "Size",
        hidden: false,
        multivalue: false,
        propertyType: PropertyType.Variation,
        propertyValueType: PropertyValueTypes.ShortText,
        value: "Large",
      };

      expect(isColorProperty(textProperty)).toBe(false);
    });
  });

  describe("isMultiColorProperty", () => {
    it("should return true for multiple color properties", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "FabricColor",
          label: "Fabric Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Red",
        },
        {
          id: "2",
          name: "FabricColor",
          label: "Fabric Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Blue",
        },
      ];

      const result = isMultiColorProperty(properties);
      expect(result).toBe(true);
    });

    it("should return false for single color property", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "FabricColor",
          label: "Fabric Color",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Red",
        },
      ];

      const result = isMultiColorProperty(properties);
      expect(result).toBe(false);
    });

    it("should return false for non-color properties", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "Size",
          label: "Size",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Large",
        },
        {
          id: "2",
          name: "Size",
          label: "Size",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Medium",
        },
      ];

      const result = isMultiColorProperty(properties);
      expect(result).toBe(false);
    });

    it("should return false for empty list", () => {
      const result = isMultiColorProperty([]);
      expect(result).toBe(false);
    });

    it("should return false for mixed property types", () => {
      const properties: Property[] = [
        {
          id: "1",
          name: "Mixed",
          label: "Mixed",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.Color,
          value: "Red",
        },
        {
          id: "2",
          name: "Mixed",
          label: "Mixed",
          hidden: false,
          multivalue: false,
          propertyType: PropertyType.Variation,
          propertyValueType: PropertyValueTypes.ShortText,
          value: "Large",
        },
      ];

      const result = isMultiColorProperty(properties);
      expect(result).toBe(false);
    });
  });
});
