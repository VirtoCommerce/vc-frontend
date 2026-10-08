import { describe, expectTypeOf, it } from "vitest";

type ItemType = { id: string; rank: number; code: string | null; meta: { tag: string } };

describe("VcSelectValueKeyType", () => {
  it("offers only the keys whose value fits a bound model", () => {
    expectTypeOf<VcSelectValueKeyType<ItemType, string>>().toEqualTypeOf<"id" | "code">();
    expectTypeOf<VcSelectValueKeyType<ItemType, number>>().toEqualTypeOf<"rank">();
  });

  // Without a model the model type defaults to the item.
  it("offers every key when the model type is the item", () => {
    expectTypeOf<VcSelectValueKeyType<ItemType, ItemType>>().toEqualTypeOf<"id" | "rank" | "code" | "meta">();
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
