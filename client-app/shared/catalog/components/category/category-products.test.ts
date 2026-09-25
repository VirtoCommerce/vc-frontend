import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import CategoryProducts from "./category-products.vue";
import type { Product } from "@/core/api/graphql/types";

const motion = vi.hoisted(() => {
  let release: (() => void) | undefined;

  return {
    enter: vi.fn(() => Promise.resolve()),
    /** Set before a test that needs the change-over to still be running. */
    holdOpen: false,
    flip: vi.fn((change: (index: number) => void) => {
      change(0);

      if (motion.holdOpen) {
        return new Promise<boolean>((resolve) => {
          release = () => resolve(true);
        });
      }

      return Promise.resolve(true);
    }),
    letGo: () => release?.(),
  };
});

const { enter, flip } = motion;

vi.mock("@/shared/catalog/composables/useCatalogGridMotion", () => ({
  useCatalogGridMotion: () => ({ displayedViewMode: ref("grid"), enter: motion.enter, flip: motion.flip }),
}));

vi.mock("@/core/composables", () => ({
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

vi.mock("@/shared/catalog/components", () => {
  const stub = (name: string) => defineComponent({ name, setup: () => () => h("div", { class: name }) });

  return {
    ProductCard: stub("product-card"),
    ProductSkeletonGrid: stub("product-skeleton"),
    ProductSkeletonList: stub("product-skeleton"),
  };
});

function makeProducts(count: number, prefix: string): Product[] {
  return Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index}` }) as Product);
}

const OLD = makeProducts(3, "old");
const SORTED = makeProducts(3, "sorted");
const FILTERED = makeProducts(2, "filtered");

function mountGrid() {
  const wrapper = mount(CategoryProducts, {
    props: {
      fetchingMoreProducts: false,
      fetchingProducts: false,
      hasActiveFilters: false,
      pagesCount: 1,
      pageHistory: [1],
      pageNumber: 1,
      products: OLD,
      savedViewMode: "grid" as const,
      sortToken: 0,
    },
    global: {
      stubs: { VcButton: true, VcInfinityScrollLoader: true },
      mocks: { $t: (key: string) => key },
    },
  });

  // Mounting a grid that is not fetching runs the entry wave; the counts below are about what the
  // props that follow cause, not that.
  enter.mockClear();
  flip.mockClear();

  return wrapper;
}

type GridType = ReturnType<typeof mountGrid>;

const cards = (wrapper: GridType) => wrapper.findAll(".product-card").length;
const skeletons = (wrapper: GridType) => wrapper.findAll(".product-skeleton").length;

/** The store empties the list as each search goes out; that emptying is what the hold reads. */
async function startFetch(wrapper: GridType) {
  await wrapper.setProps({ fetchingProducts: true, products: [] });
}

async function answerWith(wrapper: GridType, products: Product[]) {
  await wrapper.setProps({ products });
  await flushAll();
  await wrapper.setProps({ fetchingProducts: false });
  await flushAll();
}

async function flushAll() {
  for (let i = 0; i < 6; i += 1) {
    await nextTick();
    await Promise.resolve();
  }
}

describe("CategoryProducts sorting hold", () => {
  it("keeps the cards on screen while the sorting it was armed for is searched", async () => {
    const wrapper = mountGrid();

    await wrapper.setProps({ sortToken: 1 });
    await startFetch(wrapper);

    expect(cards(wrapper)).toBe(3);
    expect(skeletons(wrapper)).toBe(0);

    await answerWith(wrapper, SORTED);

    expect(flip).toHaveBeenCalledTimes(1);
  });

  it("lets the cards go when a filter is asked before the sorting has answered", async () => {
    const wrapper = mountGrid();

    await wrapper.setProps({ sortToken: 1 });
    await startFetch(wrapper);

    // The filter's own search goes out while the sorting's is still in flight: the store empties
    // the list a second time, and the cards being held answer a question the reader has left.
    await startFetch(wrapper);

    expect(cards(wrapper)).toBe(0);
    expect(skeletons(wrapper)).toBeGreaterThan(0);

    await answerWith(wrapper, FILTERED);

    expect(flip).not.toHaveBeenCalled();
    expect(cards(wrapper)).toBe(2);
    expect(enter).toHaveBeenCalledTimes(1);
  });

  it("lets the cards go even when they are still turning over to the sorting before last", async () => {
    motion.holdOpen = true;

    try {
      const wrapper = mountGrid();

      await wrapper.setProps({ sortToken: 1 });
      await startFetch(wrapper);
      await answerWith(wrapper, SORTED);

      // The wave is still running, so `changingOver` is still set when the next sorting is pressed.
      await wrapper.setProps({ sortToken: 2 });
      await startFetch(wrapper);

      expect(skeletons(wrapper)).toBe(0);

      await startFetch(wrapper);

      expect(cards(wrapper)).toBe(0);
      expect(skeletons(wrapper)).toBeGreaterThan(0);
    } finally {
      motion.letGo();
      motion.holdOpen = false;
    }
  });

  it("arms the hold again for a sorting pressed after the cards were let go", async () => {
    const wrapper = mountGrid();

    await wrapper.setProps({ sortToken: 1 });
    await startFetch(wrapper);
    await startFetch(wrapper);
    await answerWith(wrapper, FILTERED);

    await wrapper.setProps({ sortToken: 2 });
    await startFetch(wrapper);

    expect(cards(wrapper)).toBe(2);
    expect(skeletons(wrapper)).toBe(0);

    await answerWith(wrapper, SORTED);

    expect(flip).toHaveBeenCalledTimes(1);
  });
});
