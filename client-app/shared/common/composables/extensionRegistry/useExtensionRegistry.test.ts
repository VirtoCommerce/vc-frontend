import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { Product } from "@/core/api/graphql/types";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

// Mock Logger and initial registry to avoid flakiness
const mockLogger = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn() }));
vi.mock("@/core/utilities", () => ({ Logger: mockLogger }));
vi.mock("@/shared/common/constants/initialExtensionRegistry", () => ({
  initialExtensionRegistry: {
    headerMenu: {},
    mobileMenu: {},
    accountMenu: {},
    mobileHeader: {},
    productCard: {},
  },
}));

describe("useExtensionRegistry", () => {
  const DummyComponent = defineComponent({ name: "DummyComponent" });
  let registry: ReturnType<typeof useExtensionRegistry>;
  const dummyProduct = {} as unknown as Product;

  beforeEach(() => {
    vi.resetModules();
    registry = useExtensionRegistry();
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    it("should start with no entries in productCard", () => {
      const entries = registry.getEntries("productCard");
      expect(Object.keys(entries)).toHaveLength(0);
    });
  });

  describe("registration", () => {
    it("should register and retrieve entries", () => {
      registry.register("productCard", "a", { component: DummyComponent });
      const entries = registry.getEntries("productCard");
      expect(entries).toEqual({ a: { component: DummyComponent } });
      expect(registry.getComponent("productCard", "a")).toBe(DummyComponent);
      expect(registry.isRegistered("productCard", "a")).toBe(true);
      expect(registry.canRender("productCard", "a", dummyProduct)).toBe(true);
    });

    it("should not override existing entries", () => {
      const A = defineComponent({ name: "ComponentA" });
      const B = defineComponent({ name: "ComponentB" });
      registry.register("productCard", "dup", { component: A });
      registry.register("productCard", "dup", { component: B });
      expect(registry.getComponent("productCard", "dup")).toBe(A);
    });

    it("should unregister entries", () => {
      registry.register("productCard", "toRemove", { component: DummyComponent });
      expect(registry.isRegistered("productCard", "toRemove")).toBe(true);
      registry.unregister("productCard", "toRemove");
      expect(registry.getEntries("productCard")).not.toContain("toRemove");
      expect(registry.isRegistered("productCard", "toRemove")).toBe(false);
      expect(registry.getComponent("productCard", "toRemove")).toBeNull();
    });

    it("should not throw when unregistering non-existent entry", () => {
      expect(() => registry.unregister("productCard", "nonexistent")).not.toThrow();
    });

    it("should share state across instances", () => {
      const reg1 = useExtensionRegistry();
      const reg2 = useExtensionRegistry();
      reg1.register("productCard", "globalTest", { component: DummyComponent });
      expect(reg2.getEntries("productCard")).toEqual(
        expect.objectContaining({ globalTest: { component: DummyComponent } }),
      );
    });

    it("should warn when registering duplicate entries", () => {
      registry.register("productCard", "warnTest", { component: DummyComponent });
      registry.register("productCard", "warnTest", { component: DummyComponent });
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'useExtensionRegistry: Component "productCard/warnTest" already registered',
      );
    });
  });

  describe("props management", () => {
    it("should return undefined props when not set", () => {
      registry.register("productCard", "noProps", { component: DummyComponent });
      expect(registry.getProps("productCard", "noProps")).toBeUndefined();
    });

    it("should set and retrieve props", () => {
      const props = { product: dummyProduct };
      registry.register("productCard", "withProps", { component: DummyComponent, props });
      expect(registry.getProps("productCard", "withProps")).toEqual(props);
    });
  });

  describe("condition evaluation", () => {
    it("should handle condition function correctly", () => {
      const otherProduct = {} as unknown as Product;
      const condition = (product: Product) => product === dummyProduct;
      registry.register("productCard", "cond", { component: DummyComponent, condition });
      expect(registry.canRender("productCard", "cond", dummyProduct)).toBe(true);
      expect(registry.canRender("productCard", "cond", otherProduct)).toBe(false);
    });
  });

  describe("entries snapshot", () => {
    it("should maintain immutability of entries snapshot", () => {
      registry.register("productCard", "readonly", { component: DummyComponent });
      const entries = registry.getEntries("productCard");
      (entries as Record<string, unknown>)["mutated"] = 123;
      expect(registry.getEntries("productCard")).not.toContain("mutated");
    });

    it("should reflect entries keys with getEntries", () => {
      const uniqueCategory = "testCategoryForEntriesSnapshot" as ExtensionCategoryType;

      registry.register(uniqueCategory, "entryA", { component: DummyComponent });
      registry.register(uniqueCategory, "entryB", { component: DummyComponent });

      const entries = registry.getEntries(uniqueCategory);
      expect(Object.keys(entries)).toEqual(["entryA", "entryB"]);
    });
  });

  describe("error handling", () => {
    it("should return false for unregistered entries", () => {
      expect(registry.getComponent("productCard", "unknown")).toBeNull();
      expect(registry.isRegistered("productCard", "unknown")).toBe(false);
      expect(registry.canRender("productCard", "unknown", dummyProduct)).toBe(false);
    });

    it("should return false and log an error when condition throws", () => {
      const errorCondition = () => {
        throw new Error("Test condition error");
      };
      registry.register("productCard", "errTest", { component: DummyComponent, condition: errorCondition });
      const result = registry.canRender("productCard", "errTest", dummyProduct);
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'useExtensionRegistry: Error in condition for component "productCard/errTest"',
        expect.any(Error),
      );
    });
  });
});
