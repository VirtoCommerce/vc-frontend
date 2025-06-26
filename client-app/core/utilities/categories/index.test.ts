import { describe, it, expect } from "vitest";
import { getCategoryRoute } from "./index";
import type { CategoryTreeItemType } from "../../types";
import type { Category } from "@/core/api/graphql/types";
import type { RouteLocationRaw } from "vue-router";

function createCategory(overrides: Partial<Category>): Category {
  return {
    id: "default-id",
    code: "default-code",
    name: "Default Category",
    level: 1,
    priority: 1,
    hasParent: false,
    breadcrumbs: [],
    childCategories: [],
    descriptions: [],
    images: [],
    outlines: [],
    properties: [],
    seoInfo: {
      id: "seo-id",
      isActive: true,
      objectId: "object-id",
      objectType: "Category",
      semanticUrl: "default-seo-path",
    },
    ...overrides,
  };
}

function createCategoryTreeItem(overrides: Partial<CategoryTreeItemType> = {}): CategoryTreeItemType {
  const categoryProps = createCategory(overrides as Partial<Category>);

  return {
    ...categoryProps,
    children: [],
    parent: undefined,
    isRoot: false,
    ...overrides,
  };
}

describe("getCategoryRoute", () => {
  it("should return route with slug when category has a slug", () => {
    const category: Category = createCategory({
      id: "1",
      slug: "electronics",
    });

    const expectedRoute: RouteLocationRaw = { path: "/electronics" };

    const result = getCategoryRoute(category);

    expect(result).toStrictEqual(expectedRoute);
  });

  it("should return named route when category slug is undefined", () => {
    const category: Category = createCategory({
      id: "2",
      slug: undefined,
    });

    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "2" },
    };

    const result = getCategoryRoute(category);

    expect(result).toEqual(expectedRoute);
  });

  it("should return named route when category slug is empty string", () => {
    const category: Category = createCategory({
      id: "4",
      slug: "",
    });

    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "4" },
    };

    const result = getCategoryRoute(category);

    expect(result).toEqual(expectedRoute);
  });

  it("should handle CategoryTreeItemType with slug", () => {
    const category: CategoryTreeItemType = createCategoryTreeItem({
      id: "3",
      slug: "books",
    });

    const expectedRoute: RouteLocationRaw = { path: "/books" };

    const result = getCategoryRoute(category);

    expect(result).toStrictEqual(expectedRoute);
  });

  it("should handle CategoryTreeItemType without slug", () => {
    const category: CategoryTreeItemType = createCategoryTreeItem({
      id: "4",
      slug: undefined,
    });

    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "4" },
    };

    const result = getCategoryRoute(category);

    expect(result).toEqual(expectedRoute);
  });

  it("should throw an error when category is null", () => {
    expect(() => {
      getCategoryRoute(null as unknown as Category);
    }).toThrowError();
  });

  it("should throw an error when category is undefined", () => {
    expect(() => {
      getCategoryRoute(undefined as unknown as Category);
    }).toThrowError();
  });

  it("should return route with slug and query when category has a slug and query is provided", () => {
    const category: Category = createCategory({
      id: "1",
      slug: "electronics",
    });

    const query = { sort: "price", filter: "brand" };
    const expectedRoute: RouteLocationRaw = {
      path: "/electronics",
      query: { sort: "price", filter: "brand" },
    };

    const result = getCategoryRoute(category, query);

    expect(result).toStrictEqual(expectedRoute);
  });

  it("should return named route with query when category slug is undefined and query is provided", () => {
    const category: Category = createCategory({
      id: "2",
      slug: undefined,
    });

    const query = { page: "2", q: "foo" };
    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "2" },
      query: { page: "2", q: "foo" },
    };

    const result = getCategoryRoute(category, query);

    expect(result).toEqual(expectedRoute);
  });

  it("should return named route with query when category slug is empty string and query is provided", () => {
    const category: Category = createCategory({
      id: "4",
      slug: "",
    });

    const query = { sort: "name-ascending" };
    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "4" },
      query: { sort: "name-ascending" },
    };

    const result = getCategoryRoute(category, query);

    expect(result).toEqual(expectedRoute);
  });

  it("should handle CategoryTreeItemType with slug and query", () => {
    const category: CategoryTreeItemType = createCategoryTreeItem({
      id: "3",
      slug: "books",
    });

    const query = { q: "fiction", sort: "name-ascending" };
    const expectedRoute: RouteLocationRaw = {
      path: "/books",
      query: { q: "fiction", sort: "name-ascending" },
    };

    const result = getCategoryRoute(category, query);

    expect(result).toStrictEqual(expectedRoute);
  });

  it("should handle CategoryTreeItemType without slug and with query", () => {
    const category: CategoryTreeItemType = createCategoryTreeItem({
      id: "4",
      slug: undefined,
    });

    const query = { q: "bar" };
    const expectedRoute: RouteLocationRaw = {
      name: "Category",
      params: { categoryId: "4" },
      query: { q: "bar" },
    };

    const result = getCategoryRoute(category, query);

    expect(result).toEqual(expectedRoute);
  });

  it("should return route without query when query is undefined", () => {
    const category: Category = createCategory({
      id: "1",
      slug: "electronics",
    });

    const expectedRoute: RouteLocationRaw = { path: "/electronics" };

    const result = getCategoryRoute(category, undefined);

    expect(result).toStrictEqual(expectedRoute);
  });

  it("should return route without query when query is empty object", () => {
    const category: Category = createCategory({
      id: "1",
      slug: "electronics",
    });

    const expectedRoute: RouteLocationRaw = { path: "/electronics" };

    const result = getCategoryRoute(category, {});

    expect(result).toStrictEqual(expectedRoute);
  });
});
