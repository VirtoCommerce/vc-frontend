import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguages } from "@/core/composables/useLanguages";
import { useThemeGroups } from "./groups";
import { publishTheme } from "./published-theme.mock";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { ILanguage } from "@/core/types";

const menuApi = vi.hoisted(() => ({ getMenu: vi.fn() }));

vi.mock("@/core/api/graphql", () => ({ getMenu: menuApi.getMenu }));
vi.mock("@/core/composables/useLanguages", async () => {
  const { ref } = await import("vue");
  const currentLanguage = ref({ cultureName: "en-US" });
  return { useLanguages: () => ({ currentLanguage, defaultStoreCulture: ref("en-US") }) };
});
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn() } }));

function setLanguage(cultureName: string): void {
  useLanguages().currentLanguage.value = { cultureName } as ILanguage;
}

describe("useThemeGroups", () => {
  beforeEach(() => {
    menuApi.getMenu.mockReset();
    setLanguage("en-US");
    useThemeSnapshot().setPublished(null);
    useThemeSnapshot().setDraft({});
  });

  it("reads a menu only the draft names without asking for it", async () => {
    const { getMenuLinks } = useThemeGroups();

    expect(getMenuLinks("unread")).toBeUndefined();
    await flushPromises();

    expect(menuApi.getMenu).not.toHaveBeenCalled();
    expect(getMenuLinks("unread")).toBeUndefined();
  });

  it("asks once for each menu the draft names that the published snapshot does not carry", async () => {
    menuApi.getMenu.mockResolvedValue([{ title: "Help", url: "/help", priority: 0, childItems: [] }]);
    publishTheme({}, { menus: [{ name: "Published", items: [{ title: "Home", url: "/" }] }] });
    const { getMenuLinks, loadDraftMenus } = useThemeGroups();

    await Promise.all([loadDraftMenus(["support", "Support", "published", ""]), loadDraftMenus(["support"])]);

    expect(menuApi.getMenu).toHaveBeenCalledOnce();
    expect(menuApi.getMenu).toHaveBeenCalledWith("support", "en-US");
    expect(getMenuLinks("SUPPORT")?.map((link) => link.title)).toEqual(["Help"]);
    expect(getMenuLinks("published")?.map((link) => link.title)).toEqual(["Home"]);
  });

  it("asks for a menu the draft names again after its request failed", async () => {
    menuApi.getMenu
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([{ title: "Help", url: "/help", priority: 0, childItems: [] }]);
    const { getMenuLinks, loadDraftMenus } = useThemeGroups();

    await loadDraftMenus(["help"]);
    expect(getMenuLinks("help")).toBeUndefined();
    await loadDraftMenus(["help"]);

    expect(menuApi.getMenu).toHaveBeenCalledTimes(2);
    expect(getMenuLinks("help")?.map((link) => link.title)).toEqual(["Help"]);
  });

  it("keeps a menu the draft names apart for each language, also when it arrives after a switch", async () => {
    let resolveEnglish!: (items: unknown[]) => void;
    menuApi.getMenu
      .mockReturnValueOnce(new Promise((resolve) => (resolveEnglish = resolve)))
      .mockResolvedValueOnce([{ title: "Hilfe", url: "/hilfe" }]);
    const { getMenuLinks, loadDraftMenus } = useThemeGroups();

    const english = loadDraftMenus(["service"]);
    setLanguage("de-DE");
    resolveEnglish([{ title: "Help", url: "/help" }]);
    await english;

    expect(getMenuLinks("service")).toBeUndefined();

    await loadDraftMenus(["service"]);

    expect(menuApi.getMenu).toHaveBeenLastCalledWith("service", "de-DE");
    expect(getMenuLinks("service")?.map((link) => link.title)).toEqual(["Hilfe"]);
    setLanguage("en-US");
    expect(getMenuLinks("service")?.map((link) => link.title)).toEqual(["Help"]);
  });

  it("gives a menu only the draft names the catalog flag of the caller, as a published menu", async () => {
    menuApi.getMenu.mockResolvedValueOnce([
      { title: "Printers", url: "/printers", childItems: [{ title: "Laser", url: "/printers/laser" }] },
    ]);
    const { getMenuLinks, loadDraftMenus } = useThemeGroups();

    await loadDraftMenus(["catalog"]);

    const [catalogLink] = getMenuLinks("catalog", true) ?? [];
    const [iconLink] = getMenuLinks("catalog") ?? [];
    expect(catalogLink).toMatchObject({ isCatalogItem: true, children: [{ isCatalogItem: true }] });
    expect(iconLink).toMatchObject({ isCatalogItem: false, children: [{ isCatalogItem: false }] });
    expect(menuApi.getMenu).toHaveBeenCalledOnce();
  });
});
