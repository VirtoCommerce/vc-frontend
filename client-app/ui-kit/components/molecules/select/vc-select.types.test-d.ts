import { describe, expectTypeOf, it } from "vitest";

type ItemType = { id: string; rank: number; code: string | null; meta: { tag: string } };
type ItemKeyType = "id" | "rank" | "code" | "meta";

describe("VcSelectEmittedType", () => {
  it("emits undefined for a cleared single select, an array for a multiple one", () => {
    expectTypeOf<VcSelectEmittedType<string, false>>().toEqualTypeOf<string | undefined>();
    expectTypeOf<VcSelectEmittedType<string, true>>().toEqualTypeOf<string[]>();
  });
});

describe("VcSelectFieldAccessorType", () => {
  it("names only keys of the item", () => {
    expectTypeOf<Extract<VcSelectFieldAccessorType<ItemType, string>, string>>().toEqualTypeOf<ItemKeyType>();
  });
});

describe("VcSelectValueKeyType", () => {
  it("does not distribute over the model type", () => {
    expectTypeOf<VcSelectValueKeyType<ItemType, never>>().toEqualTypeOf<ItemKeyType>();
  });

  it("offers only the keys whose value fits a bound model", () => {
    expectTypeOf<VcSelectValueKeyType<ItemType, string>>().toEqualTypeOf<"id" | "code">();
    expectTypeOf<VcSelectValueKeyType<ItemType, number>>().toEqualTypeOf<"rank">();
  });

  it("offers every key when the model type is the item", () => {
    expectTypeOf<VcSelectValueKeyType<ItemType, ItemType>>().toEqualTypeOf<ItemKeyType>();
  });

  it("lets a field typed unknown fit any model", () => {
    expectTypeOf<VcSelectValueKeyType<Record<string, unknown>, string>>().toEqualTypeOf<string>();
  });

  it("rejects a key whose value does not fit", () => {
    // @ts-expect-error -- a number model cannot take a string id
    const key: VcSelectValueKeyType<ItemType, number> = "id";

    expectTypeOf(key).toEqualTypeOf<"rank">();
  });
});
