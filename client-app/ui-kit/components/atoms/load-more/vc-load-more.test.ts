import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, reactive } from "vue";
import { describeScrollBox } from "@/core/utilities/tests";
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

function renderRows(count: number) {
  return Array.from({ length: count }, (_, index) => h("p", { key: index }, `row ${index}`));
}

type StateType = {
  loading: boolean;
  hasNextPage: boolean;
  showEndOfList: boolean;
  pageLimitReached: boolean;
  rows: number;
  present: boolean;
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
    showEndOfList: false,
    pageLimitReached: false,
    rows: 1,
    present: true,
    ...initial,
  });
  const onLoadMore = vi.fn();

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(VcScrollbar, { vertical: true }, () => [
            ...renderRows(state.rows),
            state.present
              ? h(VcLoadMore, {
                  loading: state.loading,
                  hasNextPage: state.hasNextPage,
                  showEndOfList: state.showEndOfList,
                  pageLimitReached: state.pageLimitReached,
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

  // Тот самый случай, ради которого всё это: страница пришла, список по-прежнему помещается
  // целиком, и попросить следующую больше некому — прокрутки не будет.
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

  // Обработчик отвечает на запрос тем, что рисует — спиннер, строки-заглушки. Контент изменился,
  // регион по-прежнему стоит у своего низа; запрос — это переход, а не состояние, поэтому ответ
  // не порождает следующий вопрос. Именно на этом трижды спотыкались предыдущие подходы.
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

  // А вот край, до которого действительно доехали заново, пока запрос ещё в пути, — это тот
  // самый случай, который держит `loading`, и единственный, который он держит.
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

  // Попапу VcSelect список отдают уже измеренным: к моменту появления этого компонента у скроллбара
  // менять нечего, и ждать изменения — значит не спросить никогда.
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

  it.each([
    ["a page is on its way", { loading: true, hasNextPage: true }, true],
    ["nothing is being fetched", { loading: false, hasNextPage: true }, false],
    ["there is no next page to wait for", { loading: true, hasNextPage: false }, false],
  ])("shows the indicator only while %s", async (_label, props, visible) => {
    const { wrapper, region } = mountList(props);

    describeFittingContent(region);
    await afterContentSettles();

    expect(wrapper.find(".vc-load-more").exists()).toBe(visible);
  });

  // Строка «вы дошли до конца» — не побочный эффект отсутствия следующей страницы: под списком из
  // четырёх опций она не нужна, поэтому её просят явно.
  it.each([
    ["nothing at all by default", {}, null],
    ["the end of the list when asked for it", { showEndOfList: true }, "ui_kit.reach_limit.end_list"],
    ["the page limit whenever it is set", { pageLimitReached: true }, "ui_kit.reach_limit.page_limit_filters"],
    [
      "the page limit instead of the end, both being set",
      { showEndOfList: true, pageLimitReached: true },
      "ui_kit.reach_limit.page_limit_filters",
    ],
  ])("says %s once no next page is left", async (_label, props, text) => {
    const { wrapper, region } = mountList({ hasNextPage: false, ...props });

    describeFittingContent(region);
    await afterContentSettles();

    const row = wrapper.find(".vc-load-more");

    expect(row.exists()).toBe(text !== null);

    if (text !== null) {
      expect(row.text()).toContain(text);
      expect(row.find(".vc-load-more__icon").exists()).toBe(true);
    }
  });

  // Предел страниц — это «дальше не покажем». Следующая страница формально есть, и ничего сейчас
  // не грузится: единственное, что удерживает запрос, — сам предел.
  it("asks for nothing once the page limit is reached", async () => {
    const { onLoadMore, region } = mountList({ hasNextPage: true, loading: false, pageLimitReached: true });

    describeFittingContent(region);
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  // И спиннер он тоже вытесняет: крутиться не за чем, страница всё равно не будет показана.
  it("shows the limit instead of a spinner while a request is still in flight", async () => {
    const { wrapper, region } = mountList({ hasNextPage: true, loading: true, pageLimitReached: true });

    describeFittingContent(region);
    await afterContentSettles();

    expect(wrapper.find(".vc-loader").exists()).toBe(false);
    expect(wrapper.get(".vc-load-more").text()).toContain("ui_kit.reach_limit.page_limit_filters");
  });

  it("asks for nothing, and says why, with no scroll region around it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onLoadMore = vi.fn();

    mount(VcLoadMore, { attachTo: document.body, props: { hasNextPage: true, onLoadMore }, global: GLOBAL });
    await afterContentSettles();

    expect(onLoadMore).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("VcLoadMore"));

    warn.mockRestore();
  });
});
