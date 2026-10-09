import { describe, it, expect } from "vitest";
import { effectScope } from "vue";
import { createSharedComposableByArgs } from "@/core/utilities/composables";

function withScope<T>(fn: () => T): { value: T | undefined; stop: () => void } {
  const scope = effectScope(true);
  const value = scope.run(fn);
  return { value, stop: () => scope.stop() };
}

describe("createSharedComposableByArgs", () => {
  describe("sharing behavior", () => {
    it("should reuse the same instance for identical arguments across different callers", () => {
      let initCount = 0;
      const useShared = createSharedComposableByArgs((a: number, b: number) => {
        initCount += 1;
        return { sum: a + b };
      });

      const first = withScope(() => useShared(1, 2));
      const second = withScope(() => useShared(1, 2));

      expect(initCount).toBe(1);
      expect(first.value).toBe(second.value);
      expect(first.value?.sum).toBe(3);

      first.stop();
      const secondAgain = withScope(() => useShared(1, 2));

      // still shared, no re-init
      expect(initCount).toBe(1);
      expect(second.value).toBe(secondAgain.value);

      // Cleanup
      second.stop();
      secondAgain.stop();

      // all disposed, next usage re-inits
      const afterAllDisposed = withScope(() => useShared(1, 2));
      expect(initCount).toBe(2);
      expect(afterAllDisposed.value?.sum).toBe(3);
      afterAllDisposed.stop();
    });
  });

  describe("isolation behavior", () => {
    it("should create distinct instances for different arguments", () => {
      let initCount = 0;
      const useShared = createSharedComposableByArgs((key: string) => {
        initCount += 1;
        return { key };
      });

      const a = withScope(() => useShared("a"));
      const b = withScope(() => useShared("b"));

      expect(initCount).toBe(2);
      expect(a.value).not.toBe(b.value);
      expect(a.value?.key).toBe("a");
      expect(b.value?.key).toBe("b");

      a.stop();
      b.stop();
    });
  });

  describe("disposal behavior", () => {
    it("should re-create instance after all subscribers dispose", () => {
      let initCount = 0;
      const useShared = createSharedComposableByArgs((label: string) => {
        initCount += 1;
        return { label };
      });

      const s1 = withScope(() => useShared("x"));
      const s2 = withScope(() => useShared("x"));

      expect(initCount).toBe(1);
      expect(s1.value).toBe(s2.value);

      // Dispose all
      s1.stop();
      s2.stop();

      // Next usage re-inits
      const s3 = withScope(() => useShared("x"));
      expect(initCount).toBe(2);
      s3.stop();
    });
  });

  describe("key derivation (JSON.stringify)", () => {
    it("should treat equal-object-args as the same key", () => {
      let initCount = 0;
      const useShared = createSharedComposableByArgs((params: { id: string; extra?: string }) => {
        initCount += 1;
        return { id: params.id, extra: params.extra ?? null };
      });

      // two different object instances with the same shape/content
      const first = withScope(() => useShared({ id: "42", extra: "a" }));
      const second = withScope(() => useShared({ id: "42", extra: "a" }));

      // shared and only one init
      expect(initCount).toBe(1);
      expect(first.value).toBe(second.value);
      expect(first.value?.id).toBe("42");

      first.stop();
      second.stop();
    });

    it("should not throw for circular structures in args (falls back to String)", () => {
      const useShared = createSharedComposableByArgs((obj: { self?: unknown }) => ({ obj }));
      const a: { self?: unknown } = {};
      a.self = a;

      const result = withScope(() => useShared(a));

      expect(result.value).toBeDefined();
      expect(result.value?.obj).toBeDefined();

      result.stop();
    });
  });

  describe("custom resolveKey", () => {
    it("should use provided resolver to control sharing", () => {
      let initCount = 0;
      const useShared = createSharedComposableByArgs(
        (params: { id: string; extra?: string }) => {
          initCount += 1;
          return { id: params.id, extra: params.extra ?? null };
        },
        ([params]) => params.id,
      );

      const a1 = withScope(() => useShared({ id: "A", extra: "1" }));
      const a2 = withScope(() => useShared({ id: "A", extra: "2" }));
      const b1 = withScope(() => useShared({ id: "B", extra: "1" }));

      // resolver collapses by id, so A group shares, B is isolated
      expect(initCount).toBe(2);
      expect(a1.value).toBe(a2.value);
      expect(a1.value).not.toBe(b1.value);

      a1.stop();
      a2.stop();
      b1.stop();
    });
  });
});
