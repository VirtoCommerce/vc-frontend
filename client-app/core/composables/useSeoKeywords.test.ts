import { useHead } from "@unhead/vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ref } from "vue";
import { useSeoKeywords } from "./useSeoKeywords";

vi.mock("@unhead/vue", () => ({
  useHead: vi.fn(),
}));

type MetaEntryType = { name: string; content: string };

// Returns the reactive `meta` getter passed to the most recent useHead() call.
function lastMetaGetter(): () => MetaEntryType[] {
  const input = vi.mocked(useHead).mock.calls.at(-1)?.[0] as { meta: () => MetaEntryType[] };
  return input.meta;
}

describe("useSeoKeywords", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("omits the keywords tag when the value is undefined", () => {
    useSeoKeywords(undefined);
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("omits the keywords tag when the value is an empty string", () => {
    useSeoKeywords("");
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("renders the keywords tag for a static string", () => {
    useSeoKeywords("alpha, beta");
    expect(lastMetaGetter()()).toEqual([{ name: "keywords", content: "alpha, beta" }]);
  });

  it("unwraps a ref value", () => {
    useSeoKeywords(ref("gamma"));
    expect(lastMetaGetter()()).toEqual([{ name: "keywords", content: "gamma" }]);
  });

  it("re-evaluates a getter, so it reacts to an async-loaded source (the brand.vue case)", () => {
    const brand = ref<{ name?: string } | undefined>(undefined);
    useSeoKeywords(() => brand.value?.name);
    const meta = lastMetaGetter();

    // not loaded yet -> tag omitted
    expect(meta()).toEqual([]);

    // loaded -> tag rendered
    brand.value = { name: "Amstel" };
    expect(meta()).toEqual([{ name: "keywords", content: "Amstel" }]);

    // cleared -> tag omitted again
    brand.value = undefined;
    expect(meta()).toEqual([]);
  });
});
