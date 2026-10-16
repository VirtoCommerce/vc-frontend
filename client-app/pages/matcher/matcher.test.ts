import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onBeforeUnmount, ref, watch } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import Matcher from "./matcher.vue";
import type { UpdateStateEventArgs } from "./priorityManager";
import type { VueWrapper } from "@vue/test-utils";
import CategoryPage from "@/pages/category.vue";

const previewerEmitters: Record<string, (value: UpdateStateEventArgs) => void> = {};

let pagePrepares = false;
let finishPagePreparing: (() => void) | undefined;

const PageStub = defineComponent({
  setup() {
    if (pagePrepares) {
      finishPagePreparing = useSearchScore().prepareScope();
    }

    onBeforeUnmount(() => {
      useSearchScore().searchScopeData.value = { queryScope: "", searchScope: [] };
    });

    return () => h("div", { "data-testid": "page" });
  },
});

function previewerStub(id: string) {
  return {
    __esModule: true,
    default: defineComponent({
      name: id,
      props: ["isVisible", "pathMatch", "apiKey"],
      emits: { setState: (value: UpdateStateEventArgs) => !!value.state },

      setup(props, { emit }) {
        previewerEmitters[id] = (value) => emit("setState", value);
        return () => (props.isVisible ? h(PageStub) : null);
      },
    }),
  };
}

vi.mock("@/pages/matcher/slug-content.vue", () => previewerStub("slugContent"));
vi.mock("@/pages/matcher/internal.vue", () => previewerStub("internal"));
vi.mock("@/pages/matcher/builderIo/builder-io.vue", () => previewerStub("builderIo"));
vi.mock("@/pages/404.vue", () => ({
  __esModule: true,
  default: { name: "NotFound", render: () => h("div", "not found") },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ modulesSettings: ref([]), themeContext: ref({ settings: {} }) }),
  useRouteQueryParam: () => ref(undefined),
  useBreadcrumbs: () => ref([]),
}));

const categoryState = vi.hoisted(() => ({ isFetching: false }));

vi.mock("@/shared/catalog/components/category.vue", async () => {
  const vue = await import("vue");
  const { useSearchScore: searchScore } = await import("@/shared/layout/composables/useSearchScore");
  return {
    __esModule: true,
    default: vue.defineComponent({
      setup() {
        const finishPreparing = categoryState.isFetching ? searchScore().prepareScope() : undefined;
        vue.onBeforeUnmount(() => {
          searchScore().searchScopeData.value = { queryScope: "", searchScope: [] };
          finishPreparing?.();
        });
        return () => vue.h("div", { "data-testid": "category" });
      },
    }),
  };
});
vi.mock("@/shared/catalog/composables/useCategory", () => ({
  useCategory: () => ({ category: ref(), fetchCategory: vi.fn() }),
}));
vi.mock("@/shared/catalog/composables/useLoyaltyCatalogCurrency", () => ({
  useLoyaltyCatalogCurrency: () => ref(undefined),
}));

const SlotStub = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("div", slots.default?.()),
});

const { searchScopeData, isScopePending, preparingScope } = useSearchScore();

let wrapper: VueWrapper | undefined;

async function mountMatcher() {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  wrapper = mount(Matcher, { global: { stubs: { VcLoaderOverlay: true } } });
  await flushPromises();
  previewerEmitters.internal({ state: "empty" });
  await flushPromises();
}

async function setSlugContentState(state: UpdateStateEventArgs["state"]) {
  previewerEmitters.slugContent({ state });
  await flushPromises();
}

function setCategoryScope() {
  searchScopeData.value = {
    queryScope: "",
    searchScope: [{ id: "category-1", label: "Category", filter: "category.id:category-1", type: "category" }],
  };
}

function dropCategoryScope() {
  searchScopeData.value = { queryScope: "", searchScope: [] };
}

beforeEach(() => {
  dropCategoryScope();
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  pagePrepares = false;
  finishPagePreparing = undefined;
  categoryState.isFetching = false;
  preparingScope.value = false;
  expect(isScopePending.value).toBe(false);
});

describe("Matcher search scope hand-over", () => {
  it("keeps a category scope pending while the loader replaces the category page", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();

    await setSlugContentState("loading");

    expect(wrapper!.find('[data-testid="page"]').exists()).toBe(false);
    expect(searchScopeData.value.searchScope).toHaveLength(0);
    expect(isScopePending.value).toBe(true);
  });

  it("releases the scope once the next page is shown", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();

    await setSlugContentState("loading");
    await setSlugContentState("ready");

    expect(isScopePending.value).toBe(false);
  });

  it("hands the pending scope straight to a category page that mounts in its place", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();
    await setSlugContentState("loading");

    pagePrepares = true;
    const seen: boolean[] = [];
    const stop = watch(isScopePending, (pending) => seen.push(pending), { flush: "sync" });
    await setSlugContentState("ready");
    stop();

    expect(seen).not.toContain(false);
    expect(isScopePending.value).toBe(true);

    finishPagePreparing?.();
    expect(isScopePending.value).toBe(false);
  });

  it("holds the scope again on the next category swap", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();
    await setSlugContentState("loading");
    await setSlugContentState("ready");
    expect(isScopePending.value).toBe(false);

    setCategoryScope();
    await setSlugContentState("loading");

    expect(isScopePending.value).toBe(true);
  });

  it("releases the scope when the next slug resolves to nothing", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();

    await setSlugContentState("loading");
    await setSlugContentState("empty");

    expect(wrapper!.text()).toContain("not found");
    expect(isScopePending.value).toBe(false);
  });

  it("does not hold a scope that the leaving page did not have", async () => {
    await mountMatcher();
    await setSlugContentState("ready");

    await setSlugContentState("loading");

    expect(isScopePending.value).toBe(false);
  });

  it("takes over a scope handed over by a page that left for this route", async () => {
    const handOver = useSearchScore().holdScope();

    await mountMatcher();
    handOver();

    expect(isScopePending.value).toBe(true);

    await setSlugContentState("ready");

    expect(isScopePending.value).toBe(false);
  });

  it("takes over the scope a category route's page hands over as the matcher replaces it", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    setCategoryScope();
    const isMatcher = ref(false);
    const Host = defineComponent({
      setup: () => () => (isMatcher.value ? h(Matcher) : h(CategoryPage, { categoryId: "category-1" })),
    });
    wrapper = mount(Host, { global: { stubs: { VcLoaderOverlay: true, VcBreadcrumbs: true, VcContainer: SlotStub } } });
    await flushPromises();

    const seen: boolean[] = [];
    const stop = watch(isScopePending, (pending) => seen.push(pending), { flush: "sync" });
    isMatcher.value = true;
    await flushPromises();
    stop();

    expect(searchScopeData.value.searchScope).toHaveLength(0);
    expect(seen).not.toContain(false);
    expect(isScopePending.value).toBe(true);

    previewerEmitters.internal({ state: "empty" });
    await setSlugContentState("ready");

    expect(isScopePending.value).toBe(false);
  });

  it("takes over from a category route's page that is still preparing its scope", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    categoryState.isFetching = true;
    const isMatcher = ref(false);
    const Host = defineComponent({
      setup: () => () => (isMatcher.value ? h(Matcher) : h(CategoryPage, { categoryId: "category-1" })),
    });
    wrapper = mount(Host, { global: { stubs: { VcLoaderOverlay: true, VcBreadcrumbs: true, VcContainer: SlotStub } } });
    await flushPromises();
    expect(isScopePending.value).toBe(true);

    const seen: boolean[] = [];
    const stop = watch(isScopePending, (pending) => seen.push(pending), { flush: "sync" });
    isMatcher.value = true;
    await flushPromises();
    stop();

    expect(preparingScope.value).toBe(false);
    expect(seen).not.toContain(false);
    expect(isScopePending.value).toBe(true);

    previewerEmitters.internal({ state: "empty" });
    await setSlugContentState("ready");

    expect(isScopePending.value).toBe(false);
  });

  it("hands nothing over from a category page with neither a scope nor a fetch in flight", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const isMatcher = ref(false);
    const Host = defineComponent({
      setup: () => () => (isMatcher.value ? h(Matcher) : h(CategoryPage, { categoryId: "category-1" })),
    });
    wrapper = mount(Host, { global: { stubs: { VcLoaderOverlay: true, VcBreadcrumbs: true, VcContainer: SlotStub } } });

    isMatcher.value = true;
    await flushPromises();

    expect(wrapper.find('[data-testid="page"]').exists()).toBe(false);
    expect(isScopePending.value).toBe(false);
  });

  it("lets the hand-over lapse when no page takes it", async () => {
    setCategoryScope();
    const isCategory = ref(true);
    const Host = defineComponent({
      setup: () => () => (isCategory.value ? h(CategoryPage, { categoryId: "category-1" }) : h("div", "cart")),
    });
    wrapper = mount(Host, { global: { stubs: { VcBreadcrumbs: true, VcContainer: SlotStub } } });

    isCategory.value = false;
    await flushPromises();

    expect(isScopePending.value).toBe(false);
  });

  it("holds nothing on a first mount with nothing handed over", async () => {
    await mountMatcher();

    expect(wrapper!.find('[data-testid="page"]').exists()).toBe(false);
    expect(isScopePending.value).toBe(false);
  });

  it("releases the scope when the matcher itself is torn down mid-load", async () => {
    await mountMatcher();
    await setSlugContentState("ready");
    setCategoryScope();

    await setSlugContentState("loading");
    wrapper!.unmount();
    wrapper = undefined;

    expect(isScopePending.value).toBe(false);
  });
});
