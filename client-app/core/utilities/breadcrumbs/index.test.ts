import { describe, it, expect } from "vitest";
import { buildBreadcrumbs } from "./index";

describe("buildBreadcrumbs", () => {
  it("should return an empty array when no items are provided", () => {
    const result = buildBreadcrumbs();
    expect(result).toEqual([]);
  });

  it("should return an empty array when an empty array is provided", () => {
    const result = buildBreadcrumbs([]);
    expect(result).toEqual([]);
  });

  it("should create breadcrumbs with only titles when seoPath is not provided", () => {
    const items = [{ title: "Home" }, { title: "Products" }, { title: "Category" }];

    const expected = [
      { title: "Home", route: undefined },
      { title: "Products", route: undefined },
      { title: "Category", route: undefined },
    ];

    const result = buildBreadcrumbs(items);
    expect(result).toEqual(expected);
  });

  it("should create breadcrumbs with titles and routes when seoPath is provided", () => {
    const items = [
      { title: "Home", seoPath: "home" },
      { title: "Products", seoPath: "products" },
      { title: "Category", seoPath: "category" },
    ];

    const expected = [
      { title: "Home", route: "/home" },
      { title: "Products", route: "/products" },
      { title: "Category", route: "/category" },
    ];

    const result = buildBreadcrumbs(items);
    expect(result).toEqual(expected);
  });

  it("should handle seoPaths that already start with a slash", () => {
    const items = [
      { title: "Home", seoPath: "/home" },
      { title: "Products", seoPath: "/products" },
      { title: "Category", seoPath: "/category" },
    ];

    const expected = [
      { title: "Home", route: "/home" },
      { title: "Products", route: "/products" },
      { title: "Category", route: "/category" },
    ];

    const result = buildBreadcrumbs(items);
    expect(result).toEqual(expected);
  });

  it("should handle mixed cases where some items have seoPath and others do not", () => {
    const items = [
      { title: "Home", seoPath: "home" },
      { title: "Products", seoPath: "/products" },
      { title: "Category", seoPath: undefined },
    ];

    const expected = [
      { title: "Home", route: "/home" },
      { title: "Products", route: "/products" },
      { title: "Category", route: undefined },
    ];

    const result = buildBreadcrumbs(items);
    expect(result).toEqual(expected);
  });

  it("should handle nullable seoPath values", () => {
    const items = [
      { title: "Home", seoPath: "home" },
      { title: "Category", seoPath: "category" },
      { title: "Products", seoPath: '' },
    ];

    const expected = [
      { title: "Home", route: "/home" },
      { title: "Category", route: "/category" },
      { title: "Products", route: undefined },
    ];

    const result = buildBreadcrumbs(items);
    expect(result).toEqual(expected);
  });
});
