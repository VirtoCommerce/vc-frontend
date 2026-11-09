import { describe, expect, it } from "vitest";
import productTemplateDefault from "@/config/product-default.json";
import productInfo from "./product-info.json";

describe("product-info schema", () => {
  it("declares the variations layout of the built-in product template as its default", () => {
    const field = productInfo.settings.find((setting) => setting.id === "variationsLayout");
    const builtIn = productTemplateDefault.content.find((section) => section.type === "product-info");

    expect(field?.default).toBe("b2b");
    expect(field?.default).toBe(builtIn?.variationsLayout);
    expect(field?.options.map((option) => option.value)).toEqual(["b2b", "b2c"]);
  });
});
