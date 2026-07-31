import { useHead } from "@unhead/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBrandProfile } from "./useBrandProfile";
import { useStoreSocialMeta } from "./useStoreSocialMeta";

vi.mock("@unhead/vue", () => ({ useHead: vi.fn() }));
vi.mock("./useBrandProfile", () => ({ useBrandProfile: vi.fn() }));

type MetaEntryType = { property: string; content: string };

function lastMetaGetter(): () => MetaEntryType[] {
  const input = vi.mocked(useHead).mock.calls.at(-1)?.[0] as { meta: () => MetaEntryType[] };
  return input.meta;
}

function mockStoreName(storeName?: string) {
  vi.mocked(useBrandProfile).mockReturnValue({
    storeName: computed(() => storeName),
  } as unknown as ReturnType<typeof useBrandProfile>);
}

describe("useStoreSocialMeta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits og:site_name from the store name", () => {
    mockStoreName("Acme Industrial Supply");
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([{ property: "og:site_name", content: "Acme Industrial Supply" }]);
  });

  it("emits nothing when the store name is unavailable", () => {
    mockStoreName();
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("emits nothing when the store name is blank", () => {
    mockStoreName("   ");
    useStoreSocialMeta();
    expect(lastMetaGetter()()).toEqual([]);
  });

  it("re-evaluates the getter, so it reacts to a store name resolved after setup", () => {
    const source = ref<string | undefined>(undefined);
    vi.mocked(useBrandProfile).mockReturnValue({
      storeName: computed(() => source.value),
    } as unknown as ReturnType<typeof useBrandProfile>);

    useStoreSocialMeta();
    const meta = lastMetaGetter();
    expect(meta()).toEqual([]);

    source.value = "Acme";
    expect(meta()).toEqual([{ property: "og:site_name", content: "Acme" }]);
  });
});
