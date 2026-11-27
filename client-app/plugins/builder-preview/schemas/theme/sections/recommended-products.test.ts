import { describe, expect, it } from "vitest";
import productTemplateDefault from "@/config/product-default.json";
import recommendedProducts from "./recommended-products.json";

describe("recommended-products schema", () => {
  it("seeds a new section with the recommendation lists of the built-in product template", () => {
    const builtIn = productTemplateDefault.content.find((section) => section.type === "recommended-products");

    expect(builtIn?.blocks).toEqual(recommendedProducts.default.blocks.map((block) => expect.objectContaining(block)));
  });
});
