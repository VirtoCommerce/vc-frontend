import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { Product } from "@/core/api/graphql/types";

describe("useExtensionRegistry", () => {
  let registry: ReturnType<typeof useExtensionRegistry>;
  const dummyProduct = {} as unknown as Product;

  beforeEach(() => {
    registry = useExtensionRegistry();
    // Clean up any test entries in the 'productCard' category to avoid test pollution
    const entries = registry.getEntries("productCard");
    Object.keys(entries).forEach((name) => {
      registry.unregister("productCard", name);
    });
  });

  it("should register and retrieve entries", () => {
    const DummyComponent = defineComponent({ name: "DummyA" });
    registry.register("productCard", "a", { component: DummyComponent });
    const entry = registry.getEntry("productCard", "a");
    expect(entry).toBeDefined();
    expect(entry?.component).toBe(DummyComponent);
    expect(registry.getComponent("productCard", "a")).toBe(DummyComponent);
    expect(registry.isRegistered("productCard", "a")).toBe(true);
    expect(registry.canRender("productCard", "a", dummyProduct)).toBe(true);
  });

  it("should return undefined props when not set", () => {
    const DummyComponent = defineComponent({ name: "DummyNoProps" });
    registry.register("productCard", "noProps", { component: DummyComponent });
    expect(registry.getProps("productCard", "noProps")).toBeUndefined();
  });

  it("should set and retrieve props", () => {
    const DummyComponent = defineComponent({ name: "DummyWithProps" });
    const props = { product: dummyProduct };
    registry.register("productCard", "withProps", { component: DummyComponent, props });
    expect(registry.getProps("productCard", "withProps")).toEqual(props);
  });

  it("should handle condition function correctly", () => {
    const DummyComponent = defineComponent({ name: "DummyCondition" });
    const otherProduct = {} as unknown as Product;
    const condition = (product: Product) => product === dummyProduct;
    registry.register("productCard", "cond", { component: DummyComponent, condition });
    expect(registry.canRender("productCard", "cond", dummyProduct)).toBe(true);
    expect(registry.canRender("productCard", "cond", otherProduct)).toBe(false);
  });

  it("should return false for unregistered entries", () => {
    expect(registry.getEntry("productCard", "unknown")).toBeUndefined();
    expect(registry.getComponent("productCard", "unknown")).toBeNull();
    expect(registry.isRegistered("productCard", "unknown")).toBe(false);
    expect(registry.canRender("productCard", "unknown", dummyProduct)).toBe(false);
  });

  it("should not override existing entries", () => {
    const A = defineComponent({ name: "ComponentA" });
    const B = defineComponent({ name: "ComponentB" });
    registry.register("productCard", "dup", { component: A });
    registry.register("productCard", "dup", { component: B });
    expect(registry.getComponent("productCard", "dup")).toBe(A);
  });

  it("should unregister entries", () => {
    const DummyComponent = defineComponent({ name: "DummyUnreg" });
    registry.register("productCard", "toRemove", { component: DummyComponent });
    expect(registry.isRegistered("productCard", "toRemove")).toBe(true);
    registry.unregister("productCard", "toRemove");
    expect(registry.getEntry("productCard", "toRemove")).toBeUndefined();
    expect(registry.isRegistered("productCard", "toRemove")).toBe(false);
    expect(registry.getComponent("productCard", "toRemove")).toBeNull();
  });

  it("should maintain immutability of entries snapshot", () => {
    const DummyComponent = defineComponent({ name: "DummyReadOnly" });
    registry.register("productCard", "readonly", { component: DummyComponent });
    const entries = registry.getEntries("productCard");
    // Attempt to mutate the returned snapshot should not affect the registry
    (entries as Record<string, unknown>)["mut"] = 123;
    expect(registry.getEntry("productCard", "mut")).toBeUndefined();
  });

  it("should return false when condition throws", () => {
    const DummyComponent = defineComponent({ name: "DummyThrow" });
    const condition = () => {
      throw new Error("Condition error");
    };
    registry.register("productCard", "throw", { component: DummyComponent, condition });
    expect(registry.canRender("productCard", "throw", dummyProduct)).toBe(false);
  });
});
