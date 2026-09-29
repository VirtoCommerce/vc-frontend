import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onBeforeUnmount, ref } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import Matcher from "./matcher.vue";
import type { UpdateStateEventArgs } from "./priorityManager";
import type { VueWrapper } from "@vue/test-utils";

const previewerEmitters: Record<string, (value: UpdateStateEventArgs) => void> = {};

// Like the real category page: drops its search scope as it is torn down.
const PageStub = defineComponent({
  setup() {
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
}));

const { searchScopeData, isScopePending } = useSearchScore();

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
