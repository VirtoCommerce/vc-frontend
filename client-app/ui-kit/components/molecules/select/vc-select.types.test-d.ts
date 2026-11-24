import { describe, expectTypeOf, it } from "vitest";

type ItemType = { id: string; rank: number; code: string | null; meta: { tag: string } };
type ItemKeyType = "id" | "rank" | "code" | "meta";

declare const SYMBOL_KEY: unique symbol;

type MixedKeyItemType = { id: string; 0: string; [SYMBOL_KEY]: string };
type OptionalItemType = { id?: string; rank?: number };

describe("VcSelectEmittedType", () => {
  it("emits the value or undefined (cleared) for a single select", () => {
    expectTypeOf<VcSelectEmittedType<ItemType, string, false>>().toEqualTypeOf<string | undefined>();
  });

  it("emits the items for a multiple select, whatever the value type", () => {
    expectTypeOf<VcSelectEmittedType<ItemType, string, true>>().toEqualTypeOf<ItemType[]>();
    expectTypeOf<VcSelectEmittedType<ItemType, ItemType, true>>().toEqualTypeOf<ItemType[]>();
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

  it("offers only string keys, a value field being named by a string", () => {
    expectTypeOf<VcSelectValueKeyType<MixedKeyItemType, MixedKeyItemType>>().toEqualTypeOf<"id">();
    expectTypeOf<VcSelectValueKeyType<MixedKeyItemType, string>>().toEqualTypeOf<"id">();
  });

  it("offers an optional key whose value fits a bound model", () => {
    expectTypeOf<VcSelectValueKeyType<OptionalItemType, string>>().toEqualTypeOf<"id">();
    expectTypeOf<VcSelectValueKeyType<OptionalItemType, number>>().toEqualTypeOf<"rank">();
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
