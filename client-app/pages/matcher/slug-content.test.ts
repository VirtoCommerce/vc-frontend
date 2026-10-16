import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, nextTick, ref, watch } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SlugContent from "./slug-content.vue";
import type { VueWrapper } from "@vue/test-utils";

const loading = ref(false);
const objectType = ref<string | undefined>();
const objectId = ref<string | undefined>("category-1");

vi.mock("@/shared/common", () => ({
  useSlugInfo: () => ({
    loading,
    slugInfo: computed(() => ({ entityInfo: { objectType: objectType.value, objectId: objectId.value } })),
    objectType,
    hasContent: ref(false),
    hasPageDocumentContent: ref(false),
    pageDocumentContent: ref(),
    pageContent: ref(),
    fetchContent: vi.fn(),
    fetchPageDocumentContent: vi.fn(),
    isMarkdownContent: ref(false),
    markdownContent: ref(""),
  }),
}));

vi.mock("@/shared/static-content", () => ({
  useStaticPage: () => ({ staticPage: ref() }),
}));

vi.mock("@/core/composables", () => ({
  useNavigations: () => ({ setMatchingRouteName: vi.fn() }),
}));

const categoryPage = vi.hoisted(() => ({
  failsToSetUp: false,
  finishPreparing: undefined as (() => void) | undefined,
}));

vi.mock("@/pages/category.vue", () => ({
  __esModule: true,
  default: defineComponent({
    setup() {
      if (categoryPage.failsToSetUp) {
        throw new Error("Category setup failed");
      }
      categoryPage.finishPreparing = useSearchScore().prepareScope();
      return () => h("div", { "data-testid": "category" });
    },
  }),
}));

const { isScopePending, preparingScope } = useSearchScore();

let wrapper: VueWrapper | undefined;

function mountSlugContent(isVisible = false) {
  wrapper = mount(SlugContent, { props: { pathMatch: ["category"], isVisible } });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  loading.value = false;
  objectType.value = undefined;
  objectId.value = "category-1";
  categoryPage.failsToSetUp = false;
  categoryPage.finishPreparing = undefined;
  preparingScope.value = false;
  expect(isScopePending.value).toBe(false);
});

describe("SlugContent search scope", () => {
  it("keeps the scope pending from showing a category until the category starts preparing", async () => {
    objectType.value = "Category";
    const slugContent = mountSlugContent();

    await slugContent.setProps({ isVisible: true });

    expect(slugContent.find('[data-testid="category"]').exists()).toBe(false);
    expect(isScopePending.value).toBe(true);

    await flushPromises();

    expect(slugContent.find('[data-testid="category"]').exists()).toBe(true);
    categoryPage.finishPreparing?.();
    expect(isScopePending.value).toBe(false);
  });

  it("holds the scope when mounted already showing a category", async () => {
    objectType.value = "Category";
    mountSlugContent(true);
    await nextTick();

    expect(isScopePending.value).toBe(true);

    await flushPromises();
  });

  it("releases the scope when hidden before the category shows", async () => {
    objectType.value = "Category";
    const slugContent = mountSlugContent(true);

    await slugContent.setProps({ isVisible: false });

    expect(isScopePending.value).toBe(false);
  });

  it("holds nothing for a page that is not a category", async () => {
    objectType.value = "CatalogProduct";
    const slugContent = mountSlugContent();

    await slugContent.setProps({ isVisible: true });

    expect(isScopePending.value).toBe(false);
  });

  it("holds nothing for a category without an id, which would never start preparing", async () => {
    objectType.value = "Category";
    objectId.value = undefined;
    const slugContent = mountSlugContent();

    await slugContent.setProps({ isVisible: true });

    expect(isScopePending.value).toBe(false);
  });

  it("holds nothing while the slug is still loading", async () => {
    objectType.value = "Category";
    loading.value = true;
    const slugContent = mountSlugContent();

    await slugContent.setProps({ isVisible: true });

    expect(isScopePending.value).toBe(false);
  });

  it("releases the scope when the category page fails to set up, and still reports the error", async () => {
    categoryPage.failsToSetUp = true;
    objectType.value = "Category";
    const errorHandler = vi.fn();
    const seen: boolean[] = [];
    const stop = watch(isScopePending, (pending) => seen.push(pending), { flush: "sync" });
    wrapper = mount(SlugContent, {
      props: { pathMatch: ["category"], isVisible: true },
      global: { config: { errorHandler } },
    });

    await flushPromises();
    stop();

    expect(errorHandler).toHaveBeenCalledOnce();
    expect(seen).toEqual([true, false]);
  });

  it("releases the scope when torn down before the category shows", async () => {
    objectType.value = "Category";
    const slugContent = mountSlugContent(true);
    await nextTick();

    slugContent.unmount();
    wrapper = undefined;

    expect(isScopePending.value).toBe(false);
  });
});
