import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { usePageSeoInfo } from "./usePageSeoInfo";

type HeadInputType = Record<string, () => unknown>;

interface IHeadState {
  seoMeta: HeadInputType;
  meta?: () => unknown;
}

const head = vi.hoisted((): IHeadState => ({ seoMeta: {} }));

vi.mock("@unhead/vue", () => ({
  useSeoMeta: (input: HeadInputType) => {
    head.seoMeta = input;
  },
  useHead: (input: { meta: () => unknown }) => {
    head.meta = input.meta;
  },
}));

vi.mock("@/core/composables/usePageTitle", async () => {
  const { computed, unref } = await import("vue");
  return {
    usePageTitle: (title: unknown) => ({ title: computed(() => `Store | ${String(unref(title) ?? "")}`) }),
  };
});

function readHead() {
  return {
    title: head.seoMeta.title(),
    description: head.seoMeta.description(),
    ogTitle: head.seoMeta.ogTitle(),
    ogDescription: head.seoMeta.ogDescription(),
    ogType: head.seoMeta.ogType(),
    keywords: head.meta?.(),
  };
}

describe("usePageSeoInfo", () => {
  it("takes the title, description and keywords from the page's SEO info", () => {
    usePageSeoInfo(
      { pageTitle: "Spring sale", metaDescription: "Everything at half price", metaKeywords: "sale, spring" },
      "spring",
    );

    expect(readHead()).toEqual({
      title: "Store | Spring sale",
      description: "Everything at half price",
      ogTitle: "Store | Spring sale",
      ogDescription: "Everything at half price",
      ogType: "website",
      keywords: [{ name: "keywords", content: "sale, spring" }],
    });
  });

  it("names the page by its fallback title when the SEO title is empty", () => {
    usePageSeoInfo({ pageTitle: "" }, "About us");

    expect(readHead()).toMatchObject({ title: "Store | About us", description: undefined, keywords: [] });
  });

  it("ignores SEO fields that are not text", () => {
    usePageSeoInfo({ pageTitle: 42, metaDescription: { text: "x" }, metaKeywords: ["a"] }, "About");

    expect(readHead()).toMatchObject({ title: "Store | About", description: undefined, keywords: [] });
  });

  it("follows the page it is given", () => {
    const seoInfo = ref<unknown>({ pageTitle: "First" });
    usePageSeoInfo(seoInfo, "Page");

    seoInfo.value = { pageTitle: "Second", metaDescription: "Second page" };

    expect(readHead()).toMatchObject({ title: "Store | Second", description: "Second page" });
  });

  it("sets nothing while it is off", () => {
    const isActive = ref(false);
    usePageSeoInfo({ pageTitle: "Spring sale", metaDescription: "Sale", metaKeywords: "sale" }, "Page", isActive);

    expect(readHead()).toEqual({
      title: undefined,
      description: undefined,
      ogTitle: undefined,
      ogDescription: undefined,
      ogType: undefined,
      keywords: [],
    });

    isActive.value = true;

    expect(readHead()).toMatchObject({
      title: "Store | Spring sale",
      keywords: [{ name: "keywords", content: "sale" }],
    });
  });
});
