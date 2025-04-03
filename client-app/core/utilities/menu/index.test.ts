import { describe, it, expect, vi } from "vitest";
import { globals } from "../../globals";
import { convertToExtendedMenuLink, categoryToExtendedMenuLink, getTranslatedMenuLink } from "./index";
import type { MenuLinkType, Category } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";

// Mock the getCategoryRoute function
vi.mock("@/core/utilities/categories", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  getCategoryRoute: vi.fn().mockImplementation((category) => `/category/${category.id}`),
}));

// Mock the globals.i18n
vi.mock("@/core/globals", () => ({
  globals: {
    i18n: {
      global: {
        t: vi.fn().mockImplementation((key) => `translated_${key}`),
      },
    },
  },
}));

describe("Menu Utilities", () => {
  describe("convertToExtendedMenuLink", () => {
    it("should convert a simple MenuLinkType to ExtendedMenuLinkType", () => {
      const menuLink: MenuLinkType = {
        title: "Test Link",
        url: "/test-url",
        priority: 1,
        childItems: [],
      };

      const result = convertToExtendedMenuLink(menuLink);

      expect(result).toEqual({
        isCatalogItem: undefined,
        title: "Test Link",
        route: "/test-url",
        children: [],
        priority: 1,
      });
    });

    it("should convert a MenuLinkType with children to ExtendedMenuLinkType", () => {
      const menuLink: MenuLinkType = {
        title: "Parent Link",
        url: "/parent-url",
        priority: 1,
        childItems: [
          {
            title: "Child Link",
            url: "/child-url",
            priority: 2,
            childItems: [],
          },
        ],
      };

      const result = convertToExtendedMenuLink(menuLink);

      expect(result).toEqual({
        isCatalogItem: undefined,
        title: "Parent Link",
        route: "/parent-url",
        priority: 1,
        children: [
          {
            isCatalogItem: undefined,
            title: "Child Link",
            route: "/child-url",
            children: [],
            priority: 2,
          },
        ],
      });
    });

    it("should set isCatalogItem when provided", () => {
      const menuLink: MenuLinkType = {
        title: "Test Link",
        url: "/test-url",
        priority: 1,
        childItems: [],
      };

      const result = convertToExtendedMenuLink(menuLink, true);

      expect(result.isCatalogItem).toBe(true);
    });
  });

  describe("categoryToExtendedMenuLink", () => {
    it("should convert a simple Category to ExtendedMenuLinkType", () => {
      const category: Category = {
        id: "123",
        name: "Test Category",
        priority: 1,
        breadcrumbs: [],
        childCategories: [],
        code: "test-code",
        descriptions: [],
        hasParent: false,
        images: [],
        level: 1,
        outlines: [],
        properties: [],
        seoInfo: {
          id: "seo-123",
          objectId: "123",
          objectType: "Category",
          semanticUrl: "test-category",
          isActive: true,
          metaDescription: "Test Category Description",
          metaKeywords: "test, category",
          pageTitle: "Test Category SEO",
        },
      };

      const result = categoryToExtendedMenuLink(category);

      expect(result).toEqual({
        isCatalogItem: undefined,
        id: "123",
        title: "Test Category",
        route: "/category/123",
        children: [],
        priority: 1,
      });
    });

    it("should convert a Category with childCategories to ExtendedMenuLinkType", () => {
      const category: Category = {
        id: "123",
        name: "Parent Category",
        priority: 1,
        breadcrumbs: [],
        childCategories: [
          {
            id: "456",
            name: "Child Category",
            priority: 2,
            breadcrumbs: [],
            childCategories: [],
            code: "child-code",
            descriptions: [],
            hasParent: true,
            images: [],
            level: 2,
            outlines: [],
            properties: [],
            seoInfo: {
              id: "seo-456",
              objectId: "456",
              objectType: "Category",
              semanticUrl: "child-category",
              isActive: true,
              metaDescription: "Child Category Description",
              metaKeywords: "child, category",
              pageTitle: "Child Category SEO",
            },
          },
        ],
        code: "parent-code",
        descriptions: [],
        hasParent: false,
        images: [],
        level: 1,
        outlines: [],
        properties: [],
        seoInfo: {
          id: "seo-123",
          objectId: "123",
          objectType: "Category",
          semanticUrl: "parent-category",
          isActive: true,
          metaDescription: "Parent Category Description",
          metaKeywords: "parent, category",
          pageTitle: "Parent Category SEO",
        },
      };

      const result = categoryToExtendedMenuLink(category);

      expect(result).toEqual({
        isCatalogItem: undefined,
        id: "123",
        title: "Parent Category",
        route: "/category/123",
        children: [
          {
            isCatalogItem: undefined,
            id: "456",
            title: "Child Category",
            route: "/category/456",
            children: [],
            priority: 2,
          },
        ],
        priority: 1,
      });
    });

    it("should set isCatalogItem when provided", () => {
      const category: Category = {
        id: "123",
        name: "Test Category",
        priority: 1,
        breadcrumbs: [],
        childCategories: [],
        code: "test-code",
        descriptions: [],
        hasParent: false,
        images: [],
        level: 1,
        outlines: [],
        properties: [],
        seoInfo: {
          id: "seo-123",
          objectId: "123",
          objectType: "Category",
          semanticUrl: "test-category",
          isActive: true,
          metaDescription: "Test Category Description",
          metaKeywords: "test, category",
          pageTitle: "Test Category SEO",
        },
      };

      const result = categoryToExtendedMenuLink(category, true);

      expect(result.isCatalogItem).toBe(true);
    });
  });

  describe("getTranslatedMenuLink", () => {
    it("should translate a simple menu link title", () => {
      const menuLink: ExtendedMenuLinkType = {
        title: "test_key",
        route: "/test-route",
      };

      const result = getTranslatedMenuLink(menuLink);

      expect(result.title).toBe("translated_test_key");
      expect(globals.i18n.global.t).toHaveBeenCalledWith("test_key");
    });

    it("should translate all nested children titles", () => {
      const menuLink: ExtendedMenuLinkType = {
        title: "test_key",
        route: "/test-route",
        children: [
          {
            title: "child_key",
            route: "/child-route",
            children: [
              {
                title: "child_key2",
                route: "/child-route2",
              },
            ],
          },
        ],
      };

      const result = getTranslatedMenuLink(menuLink);

      expect(result).toEqual({
        route: "/test-route",
        title: "translated_test_key",
        children: [
          {
            children: [
              {
                route: "/child-route2",
                title: "translated_child_key2",
              },
            ],
            route: "/child-route",
            title: "translated_child_key",
          },
        ],
      });
    });
  });
});
