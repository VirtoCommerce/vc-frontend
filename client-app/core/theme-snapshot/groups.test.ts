import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useThemeGroups } from "./groups";
import { useThemeSnapshot } from "./useThemeSnapshot";

const menuApi = vi.hoisted(() => ({ getMenu: vi.fn() }));

vi.mock("@/core/api/graphql", () => ({ getMenu: menuApi.getMenu }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn() } }));

describe("useThemeGroups", () => {
  beforeEach(() => {
    menuApi.getMenu.mockReset();
  });

  it("asks for a menu the draft names again after its request failed", async () => {
    menuApi.getMenu
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([{ title: "Help", url: "/help", priority: 0, childItems: [] }]);
    useThemeSnapshot().setDraft({});
    const { getMenuLinks } = useThemeGroups();

    getMenuLinks("help");
    await flushPromises();
    getMenuLinks("help");
    await flushPromises();

    expect(menuApi.getMenu).toHaveBeenCalledTimes(2);
    expect(getMenuLinks("help")?.map((link) => link.title)).toEqual(["Help"]);
  });

  it("gives a menu only the draft names the catalog flag of the caller, as a published menu", async () => {
    menuApi.getMenu.mockResolvedValueOnce([
      { title: "Printers", url: "/printers", childItems: [{ title: "Laser", url: "/printers/laser" }] },
    ]);
    useThemeSnapshot().setDraft({});
    const { getMenuLinks } = useThemeGroups();

    getMenuLinks("catalog", true);
    await flushPromises();

    const [catalogLink] = getMenuLinks("catalog", true) ?? [];
    const [iconLink] = getMenuLinks("catalog") ?? [];
    expect(catalogLink).toMatchObject({ isCatalogItem: true, children: [{ isCatalogItem: true }] });
    expect(iconLink).toMatchObject({ isCatalogItem: false, children: [{ isCatalogItem: false }] });
    expect(menuApi.getMenu).toHaveBeenCalledOnce();
  });
});
