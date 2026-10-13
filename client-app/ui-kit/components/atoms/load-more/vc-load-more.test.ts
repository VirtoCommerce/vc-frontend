import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive } from "vue";
import { describeScrollBox } from "@/ui-kit/test-mocks";
import VcIcon from "../icon/vc-icon.vue";
import VcLoader from "../loader/vc-loader.vue";
import VcScrollbar from "../scrollbar/vc-scrollbar.vue";
import VcLoadMore from "./vc-load-more.vue";

// jsdom ships MutationObserver but not ResizeObserver, and VcScrollbar constructs one on mount.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

enableAutoUnmount(afterEach);

// VcScrollbar debounces its content check by 100 ms.
const CONTENT_DEBOUNCE_MS = 100;

async function afterContentSettles() {
  await new Promise((resolve) => setTimeout(resolve, CONTENT_DEBOUNCE_MS + 60));
}

// Globally registered in the app, and `$t` comes from the i18n plugin; a bare mount has neither.
const GLOBAL = { components: { VcIcon, VcLoader }, mocks: { $t: (key: string) => key } };

function renderRows(count: number, label: string, images: boolean) {
  return Array.from({ length: count }, (_, index) =>
    images
      ? h("img", { key: `${label}-${index}`, alt: `${label} ${index}` })
      : h("p", { key: `${label}-${index}` }, `${label} ${index}`),
  );
}

type StateType = {
  loading: boolean;
  hasNextPage: boolean;
  rows: number;
  rowLabel: string;
  imageRows: boolean;
  present: boolean;
  /** Bound as `item-count`; the rendered row count when unset. */
  itemCount: number | undefined;
  /** A consumer's "No results" row, shown while nothing is loaded and nothing is loading. */
  emptyRow: boolean;
};

/**
 * The component under test decides nothing on its own — it reads the scroll region it sits in — so
 * every case here mounts the real VcScrollbar around it. A stubbed context would only prove that
 * the two files agree about a mock.
 */
function mountList(initial: Partial<StateType> = {}) {
  const state = reactive<StateType>({
    loading: false,
    hasNextPage: true,
    rows: 1,
    rowLabel: "row",
    imageRows: false,
    present: true,
    itemCount: undefined,
    emptyRow: false,
    ...initial,
  });
  const onLoadMore = vi.fn();

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(VcScrollbar, { vertical: true }, () => [
            ...renderRows(state.rows, state.rowLabel, state.imageRows),
            state.emptyRow && !state.rows && !state.loading ? h("p", { key: "empty" }, "No results") : null,
            state.present
              ? h(VcLoadMore, {
                  loading: state.loading,
                  hasNextPage: state.hasNextPage,
                  itemCount: state.itemCount ?? state.rows,
                  onLoadMore,
                })
              : null,
          ]);
      },
    }),
    { attachTo: document.body, global: GLOBAL },
  );

  const region = wrapper.get(".vc-scrollbar").element as HTMLElement;

  return { wrapper, state, onLoadMore, region };
}

/** A page whose rows fit the viewport: the region is at its bottom and no scrolling is possible. */
function describeFittingContent(region: HTMLElement) {
  describeScrollBox(region, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
}

describe("VcLoadMore", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("asks for a page when a list that cannot scroll comes to rest at its bottom", async () => {
    const { onLoadMore, region } = mountList();

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("asks again for a rebuilt list of the same size", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 3 });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await afterContentSettles();

    state.rowLabel = "match";
    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("asks again once a page of rows without text has landed and the list still fits", async () => {
    const { state, onLoadMore, region } = mountList({ imageRows: true });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await afterContentSettles();

    state.rows = 4;
    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("asks again for a list rebuilt identical to the one it last asked from", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 3 });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    state.rows = 0;
    await afterContentSettles();

    state.rows = 3;
    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("asks again for a list of rows without text rebuilt identical to the one it last asked from", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 3, imageRows: true });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    state.rows = 0;
    await afterContentSettles();

    state.rows = 3;
    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("names the spinner for the status region", () => {
    const { wrapper } = mountList({ loading: true });

    expect(wrapper.get('[role="status"]').text()).toBe("ui_kit.messages.loading_text");
  });

  it("asks for nothing while a page is already on its way", async () => {
    const { onLoadMore, region } = mountList({ loading: true });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("asks for nothing when there is no next page", async () => {
    const { onLoadMore, region } = mountList({ hasNextPage: false });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("asks again once the page has landed and the list still fits", async () => {
    const { state, onLoadMore, region } = mountList();

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await afterContentSettles();

    state.rows = 4;
    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("does not ask twice while the answer to the first request is being drawn", async () => {
    const { state, onLoadMore, region } = mountList();

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    state.rows = 2;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not ask again for a page that came back with nothing", async () => {
    const { state, onLoadMore, region } = mountList();

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await afterContentSettles();

    state.loading = false;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("counts from scratch once the list has run out", async () => {
    const { state, onLoadMore, region } = mountList();

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.hasNextPage = false;
    await afterContentSettles();

    state.hasNextPage = true;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["to nothing", { clientHeight: 0, scrollHeight: 0, clientWidth: 0, scrollWidth: 0 }],
    ["to no width", { clientHeight: 400, scrollHeight: 400, clientWidth: 0, scrollWidth: 0 }],
    ["to no height", { clientHeight: 0, scrollHeight: 0, clientWidth: 300, scrollWidth: 300 }],
  ])("asks for nothing while its region is collapsed %s, and asks once it reopens", async (_label, box) => {
    const { state, onLoadMore, region } = mountList({ rows: 3 });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.hasNextPage = false;
    await nextTick();
    describeScrollBox(region, { ...box, scrollTop: 0 });
    state.hasNextPage = true;
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    describeFittingContent(region);
    region.dispatchEvent(new Event("scroll"));
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it("asks for nothing more while the page it asked for is still on its way", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 20 });

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
    region.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await nextTick();

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
    region.dispatchEvent(new Event("scroll"));
    await afterContentSettles();

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
    region.dispatchEvent(new Event("scroll"));
    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not ask for a second page on the loading flag alone, before the region is re-measured", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 20 });

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
    region.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await nextTick();

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 900, scrollTop: 400 });
    state.rows = 40;
    state.loading = false;
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await afterContentSettles();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("asks as soon as it appears in a list that is already resting at its bottom", async () => {
    const { state, onLoadMore, region } = mountList({ present: false });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();

    state.present = true;
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("stays silent until the list is actually scrolled to its end", async () => {
    const { onLoadMore, region } = mountList({ rows: 20 });

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 0 });
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
    region.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not re-ask a failing page whose spinner pushed the list off its end", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 20 });

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
    region.dispatchEvent(new Event("scroll"));
    await afterContentSettles();

    for (let attempt = 0; attempt < 4; attempt++) {
      state.loading = true;
      describeScrollBox(region, { clientHeight: 100, scrollHeight: 540, scrollTop: 400 });
      await afterContentSettles();
      state.loading = false;
      describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop: 400 });
      await afterContentSettles();
    }

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("asks again for a failed page once the list is scrolled away from its end and back", async () => {
    const { state, onLoadMore, region } = mountList({ rows: 20 });
    const scrollTo = async (scrollTop: number) => {
      describeScrollBox(region, { clientHeight: 100, scrollHeight: 500, scrollTop });
      region.dispatchEvent(new Event("scroll"));
      await afterContentSettles();
    };

    await scrollTo(400);

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    state.loading = true;
    await afterContentSettles();
    state.loading = false;
    await afterContentSettles();
    await scrollTo(400);

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await scrollTo(0);
    await scrollTo(400);

    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["a page is on its way", { loading: true, hasNextPage: true }, true],
    ["nothing is being fetched", { loading: false, hasNextPage: true }, false],
    ["there is no next page to wait for", { loading: true, hasNextPage: false }, false],
  ])("shows the indicator only while %s", async (_label, props, visible) => {
    const { wrapper, region } = mountList(props);

    describeFittingContent(region);
    await afterContentSettles();

    expect(wrapper.find(".vc-load-more--loading").exists()).toBe(visible);
    expect(wrapper.find(".vc-loader").exists()).toBe(visible);
  });

  it("keeps the status region mounted before a page loads, so the loading text lands in a live region", async () => {
    const { wrapper, state } = mountList({ loading: false, hasNextPage: true });
    const region = wrapper.get('[role="status"]').element;

    expect(region.textContent).toBe("");

    state.loading = true;
    await nextTick();

    expect(wrapper.get('[role="status"]').element).toBe(region);
    expect(region.textContent).toBe("ui_kit.messages.loading_text");
  });

  it("says nothing once no next page is left", async () => {
    const { wrapper, region } = mountList({ hasNextPage: false });

    describeFittingContent(region);
    await afterContentSettles();

    expect(wrapper.find(".vc-load-more").exists()).toBe(false);
  });

  it("asks for nothing, and says why, with no scroll region around it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onLoadMore = vi.fn();

    mount(VcLoadMore, {
      attachTo: document.body,
      props: { hasNextPage: true, itemCount: 0, onLoadMore },
      global: GLOBAL,
    });
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("VcLoadMore"));

    warn.mockRestore();
  });

  it.each([
    ["without loading", { hasNextPage: true }, true],
    ["in kebab case without loading", { "has-next-page": true }, true],
    ["with loading", { hasNextPage: true, loading: false }, false],
  ])("warns about has-next-page %s accordingly", (_label, props, warns) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    mount(VcLoadMore, { props: { itemCount: 0, ...props }, global: GLOBAL });

    expect(warn.mock.calls.some(([message]) => String(message).includes("needs `loading` bound"))).toBe(warns);

    warn.mockRestore();
  });

  describe("counting the loaded items", () => {
    it("asks once for a first page that keeps failing behind an empty state", async () => {
      const { state, onLoadMore, region } = mountList({ rows: 0, itemCount: 0, emptyRow: true });

      describeFittingContent(region);
      await afterContentSettles();

      for (let attempt = 0; attempt < 3; attempt++) {
        state.loading = true;
        await afterContentSettles();
        state.loading = false;
        await afterContentSettles();
      }

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("asks again once the count grew though no visible row changed", async () => {
      const { state, onLoadMore, region } = mountList({ rows: 2, itemCount: 2 });

      describeFittingContent(region);
      await afterContentSettles();

      expect(onLoadMore).toHaveBeenCalledTimes(1);

      state.loading = true;
      await afterContentSettles();

      state.itemCount = 4;
      state.loading = false;
      region.firstElementChild?.setAttribute("data-probe", "re-measure");
      await afterContentSettles();

      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it("does not ask again for a page that added nothing to the count", async () => {
      const { state, onLoadMore, region } = mountList({ rows: 2, itemCount: 2 });

      describeFittingContent(region);
      await afterContentSettles();

      state.loading = true;
      await afterContentSettles();

      state.loading = false;
      region.firstElementChild?.setAttribute("data-probe", "re-measure");
      await afterContentSettles();

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("asks again for a list emptied and rebuilt identical while a search loads", async () => {
      const { state, onLoadMore, region } = mountList({ rows: 3, itemCount: 3 });

      describeFittingContent(region);
      await afterContentSettles();

      expect(onLoadMore).toHaveBeenCalledTimes(1);

      state.loading = true;
      state.rows = 0;
      state.itemCount = 0;
      await afterContentSettles();

      state.rows = 3;
      state.itemCount = 3;
      state.loading = false;
      await afterContentSettles();

      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });
  });

  it("asks when a next page appears on an idle list already at its bottom", async () => {
    const { state, onLoadMore, region } = mountList({ hasNextPage: false });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();

    state.hasNextPage = true;
    await nextTick();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
