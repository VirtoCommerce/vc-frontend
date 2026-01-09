import { describe, it, expect } from "vitest";
import { getProductRoute } from "./index";

describe("getProductRoute", () => {
  describe("when productSlug is provided", () => {
    it("should return route with productSlug when both productId and productSlug are provided", () => {
      const result = getProductRoute("product-123", "test-product-slug");
      expect(result).toBe("/test-product-slug");
    });

    it("should return route with productSlug when productId is empty string and productSlug is provided", () => {
      const result = getProductRoute("", "test-product-slug");
      expect(result).toBe("/test-product-slug");
    });
  });

  describe("when productSlug is not provided", () => {
    it("should return route object with productId when only productId is provided", () => {
      const result = getProductRoute("product-123");
      expect(result).toEqual({ name: "Product", params: { productId: "product-123" } });
    });

    it("should return undefined when productId is empty string", () => {
      const result = getProductRoute("");
      expect(result).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should prioritize productSlug over productId", () => {
      const result = getProductRoute("product-123", "slug-takes-priority");
      expect(result).toBe("/slug-takes-priority");
      expect(result).not.toEqual({ name: "Product", params: { productId: "product-123" } });
    });
  });
});
