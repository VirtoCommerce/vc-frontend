import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import SlugContent from "./slug-content.vue";

vi.mock("@/shared/common", () => ({
  useSlugInfo: () => ({
    loading: ref(false),
    slugInfo: computed(() => ({ entityInfo: { objectType: "Category", objectId: "category-1" } })),
    objectType: ref("Category"),
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

// Own file: vi.mock is file-wide, and a resolved import stays cached for the whole file.
vi.mock("@/pages/category.vue", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("SlugContent search scope", () => {
  it("releases the scope when the category page fails to load, and still reports the error", async () => {
    const { isScopePending } = useSearchScore();
    const errorHandler = vi.fn();
    const wrapper = mount(SlugContent, {
      props: { pathMatch: ["category"], isVisible: true },
      global: { config: { errorHandler } },
    });

    expect(isScopePending.value).toBe(true);

    await vi.waitFor(() => expect(errorHandler).toHaveBeenCalledOnce());

    expect(isScopePending.value).toBe(false);

    wrapper.unmount();
  });
});
