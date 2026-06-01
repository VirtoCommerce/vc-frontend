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

  describe("when basePath is provided", () => {
    it("should prepend the basePath to the slug-based route", () => {
      const result = getProductRoute("product-123", "test-slug", "/loyalty-catalog");
      expect(result).toBe("/loyalty-catalog/test-slug");
    });

    it("should normalize a trailing slash in basePath", () => {
      const result = getProductRoute("product-123", "test-slug", "/loyalty-catalog/");
      expect(result).toBe("/loyalty-catalog/test-slug");
    });

    it("should fall back to the LoyaltyProduct route when basePath is /loyalty-catalog and slug is missing", () => {
      const result = getProductRoute("product-123", undefined, "/loyalty-catalog");
      expect(result).toEqual({ name: "LoyaltyProduct", params: { productId: "product-123" } });
    });

    it("should fall back to the LoyaltyProduct route when basePath has a trailing slash and slug is missing", () => {
      const result = getProductRoute("product-123", undefined, "/loyalty-catalog/");
      expect(result).toEqual({ name: "LoyaltyProduct", params: { productId: "product-123" } });
    });
  });
});
