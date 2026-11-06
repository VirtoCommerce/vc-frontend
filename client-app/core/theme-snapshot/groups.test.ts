import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
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
});
