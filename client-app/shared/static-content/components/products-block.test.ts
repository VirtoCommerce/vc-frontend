import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ProductsBlock from "./products-block.vue";

vi.mock("@/shared/catalog", () => ({
  ProductCard: { template: "<div />" },
  useProducts: () => ({ products: ref([]), fetchProducts: vi.fn() }),
}));

function mountProductsBlock(props: { title?: string; subtitle?: string } = {}) {
  return mount(ProductsBlock, {
    props,
    global: {
      stubs: { VcTypography: { template: "<h2><slot /></h2>" }, VcProductsGrid: true },
      directives: { trackItem: {} },
    },
  });
}

function findHeadingSiblings(wrapper: ReturnType<typeof mountProductsBlock>): Element[] {
  return [...(wrapper.findComponent({ name: "VcProductsGrid" }).element.parentElement?.children ?? [])];
}

describe("ProductsBlock", () => {
  it("shows the title and the subtitle it has above the products", () => {
    const wrapper = mountProductsBlock({ title: "Bestsellers", subtitle: "This week" });
    const [heading, subtitle] = findHeadingSiblings(wrapper);

    expect(heading.textContent?.trim()).toBe("Bestsellers");
    expect(subtitle.textContent).toBe("This week");
  });

  it("renders no empty heading or subtitle without them", () => {
    const wrapper = mountProductsBlock();

    expect(wrapper.find("h2").exists()).toBe(false);
    expect(findHeadingSiblings(wrapper)).toHaveLength(1);
  });
});
