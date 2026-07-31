import { useHead } from "@unhead/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBrandProfile } from "./useBrandProfile";
import { useLanguages } from "./useLanguages";
import { useOrganizationSchema } from "./useOrganizationSchema";
import type { OrganizationFactsType } from "./useOrganizationSchema";

vi.mock("@unhead/vue", () => ({ useHead: vi.fn() }));
vi.mock("./useBrandProfile", () => ({ useBrandProfile: vi.fn() }));
vi.mock("./useLanguages", () => ({ useLanguages: vi.fn() }));

const routePath = ref("/");

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return routePath.value;
    },
  }),
}));

type ScriptEntryType = { type: string; innerHTML: string };

function lastScriptGetter(): () => ScriptEntryType[] {
  const input = vi.mocked(useHead).mock.calls.at(-1)?.[0] as { script: () => ScriptEntryType[] };
  return input.script;
}

const FACTS: OrganizationFactsType = {
  id: "https://store.example.com/#organization",
  name: "Acme Industrial Supply",
  url: "https://store.example.com/",
};

function setup(facts: OrganizationFactsType = FACTS) {
  vi.mocked(useBrandProfile).mockReturnValue({
    organizationFacts: computed(() => facts),
  } as unknown as ReturnType<typeof useBrandProfile>);

  // Mirrors the real getUrlWithoutLocale: strips only supported locales, here fr/de.
  vi.mocked(useLanguages).mockReturnValue({
    getUrlWithoutLocale: (path: string) => path.replace(/^\/(?:fr|de)(\/|$)/i, "/"),
  } as unknown as ReturnType<typeof useLanguages>);

  useOrganizationSchema();
  return lastScriptGetter();
}

describe("useOrganizationSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routePath.value = "/";
  });

  it("emits one ld+json script on the homepage", () => {
    const script = setup();
    const tags = script();

    expect(tags).toHaveLength(1);
    expect(tags[0].type).toBe("application/ld+json");
    expect(JSON.parse(tags[0].innerHTML)).toMatchObject({
      "@type": "OnlineStore",
      name: "Acme Industrial Supply",
    });
  });

  // "/xy" must NOT count: only locales the store actually supports are stripped.
  it.each([
    ["/", 1],
    ["/fr", 1],
    ["/fr/", 1],
    ["/catalog", 0],
    ["/fr/catalog", 0],
    ["/xy", 0],
  ])("route %s emits %i node(s)", (path: string, expected: number) => {
    routePath.value = path;
    expect(setup()()).toHaveLength(expected);
  });

  it("emits nothing when the store name is unavailable, even on the homepage", () => {
    expect(setup({ ...FACTS, name: undefined })()).toEqual([]);
  });

  it("re-evaluates on navigation, so the node is dropped when leaving the homepage", () => {
    const script = setup();
    expect(script()).toHaveLength(1);

    routePath.value = "/catalog";
    expect(script()).toEqual([]);
  });
});
