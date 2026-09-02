import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Description from "./description.vue";
import type { Product } from "@/core/api/graphql/types";

const product = { description: { content: "Some copy" } } as Product;

function render(props: Record<string, unknown>) {
  return mount(Description, {
    props: { product, model: {}, ...props },
    attrs: { id: "specifications" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { ProductTitledBlock: true, VcWidget: true, VcCollapsibleContent: true, VcMarkdownRender: true },
    },
  });
}

describe("product description block", () => {
  it("renders the fallthrough id on the collapsible root", () => {
    expect(render({ isCollapsible: true }).attributes("id")).toBe("specifications");
  });

  it("renders the fallthrough id on the widget root", () => {
    expect(render({ isCollapsible: false }).attributes("id")).toBe("specifications");
  });

  it("renders nothing when the block is hidden", () => {
    expect(
      render({ model: { hidden: true } })
        .find("#specifications")
        .exists(),
    ).toBe(false);
  });
});
