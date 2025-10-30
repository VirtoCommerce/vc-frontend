import { describe, it, expect, vi } from "vitest";
import { PropertyValueTypes, PropertyType } from "@/core/api/graphql/types";
import { getPropertyValue, getPropertiesGroupedByName, getGroupedAndSortedProperties } from "./index";
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
  });
});
