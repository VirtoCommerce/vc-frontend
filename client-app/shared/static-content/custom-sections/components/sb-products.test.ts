import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import SbProducts from "./sb-products.vue";

const catalog = vi.hoisted(() => ({ fetchProducts: vi.fn() }));

vi.mock("@/shared/catalog", async () => {
  const vue = await import("vue");
  return {
    ProductCard: vue.defineComponent({ name: "ProductCard", props: ["product"], setup: () => () => vue.h("article") }),
    useProducts: () => ({ products: ref([{ id: "p1" }, { id: "p2" }]), fetchProducts: catalog.fetchProducts }),
  };
});

function mountProducts(props: Record<string, unknown> = {}) {
  return mount(SbProducts, {
    props,
    global: {
      stubs: { VcCarousel: { name: "VcCarousel", props: ["slides", "options", "navigation"], template: "<div />" } },
      directives: { trackItem: {} },
    },
  });
}

describe("SbProducts", () => {
  beforeEach(() => {
    catalog.fetchProducts.mockReset();
  });

  it("asks for the products of the search and the filter, as many as it takes", async () => {
    mountProducts({ query: "drill", filter: "brand:acme", take: 6 });
    await flushPromises();

    expect(catalog.fetchProducts).toHaveBeenCalledWith({ itemsPerPage: 6, keyword: "drill", filter: "brand:acme" });
  });

  it("renders the cards bare, in a grid that fits the element's width, columns at most", () => {
    const wrapper = mountProducts({ columns: 5 });
    const cards = wrapper.findAllComponents({ name: "ProductCard" });
    const grid = cards[0].element.parentElement as HTMLElement;

    expect(cards).toHaveLength(2);
    expect(grid.parentElement).toBe(wrapper.element);
    expect(grid.style.getPropertyValue("--columns")).toBe("5");
    expect(wrapper.find("h2").exists()).toBe(false);
  });

  it.each([
    { view: "carousel", hasGutter: true },
    { view: "grid", hasGutter: false },
  ])("keeps a gutter for the carousel's arrows in $view view: $hasGutter", ({ view, hasGutter }) => {
    expect(mountProducts({ view }).classes("sb-products--carousel")).toBe(hasGutter);
  });

  it("sizes the carousel by the element it stands in, columns at most", () => {
    const wrapper = mountProducts({ view: "carousel", columns: 2 });
    const options = wrapper.findComponent({ name: "VcCarousel" }).props("options") as ICarouselOptions;

    expect(options.breakpointsBase).toBe("container");
    expect(options.slidesPerView).toBe(1.5);
    expect(Object.values(options.breakpoints ?? {})).toEqual([
      { slidesPerView: 2 },
      { slidesPerView: 2 },
      { slidesPerView: 2 },
    ]);
  });
});
