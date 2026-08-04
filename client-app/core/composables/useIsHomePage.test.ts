import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useIsHomePage } from "./useIsHomePage";
import { useLanguages } from "./useLanguages";

vi.mock("./useLanguages", () => ({ useLanguages: vi.fn() }));

const routePath = ref("/");

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return routePath.value;
    },
  }),
}));

function setup() {
  // Mirrors the real getUrlWithoutLocale: strips only supported locales, here fr/de.
  vi.mocked(useLanguages).mockReturnValue({
    getUrlWithoutLocale: (path: string) => path.replace(/^\/(?:fr|de)(\/|$)/i, "/"),
  } as unknown as ReturnType<typeof useLanguages>);

  return useIsHomePage();
}

describe("useIsHomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routePath.value = "/";
  });

  it.each([
    ["/", true],
    ["/fr", true],
    ["/fr/", true],
    ["/catalog", false],
    ["/fr/catalog", false],
    ["/xy", false],
  ])("route %s -> %s", (path: string, expected: boolean) => {
    routePath.value = path;
    expect(setup().value).toBe(expected);
  });

  it("re-evaluates on navigation", () => {
    const isHomePage = setup();
    expect(isHomePage.value).toBe(true);

    routePath.value = "/catalog";
    expect(isHomePage.value).toBe(false);
  });
});
