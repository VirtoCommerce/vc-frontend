import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useThemeChrome } from "./useThemeChrome";
import type { IThemeDraft, IThemeSnapshot } from "@/core/theme-snapshot";

const whiteLabeling = vi.hoisted(() => ({ footerLinks: undefined as { title: string }[] | undefined }));

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "de-DE" }), defaultStoreCulture: ref("en-US") }),
}));
vi.mock("@/core/composables/useWhiteLabeling", async () => {
  const { computed } = await import("vue");
  return { useWhiteLabeling: () => ({ footerLinks: computed(() => whiteLabeling.footerLinks) }) };
});
vi.mock("@/core/api/graphql", () => ({ getMenu: vi.fn(async () => []) }));

function publish(snapshot: Partial<IThemeSnapshot>): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [{ name: "Footer-Help", items: [{ title: "Contact", url: "/contact" }] }],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...snapshot },
  });
}

describe("useThemeChrome", () => {
  beforeEach(() => {
    whiteLabeling.footerLinks = undefined;
    useThemeSnapshot().setPublished(null);
    useThemeSnapshot().setDraft(undefined);
  });

  it("leaves the header and footer as they are without a theme", () => {
    const chrome = useThemeChrome();

    expect(chrome.logoWidth.value).toBeUndefined();
    expect(chrome.footerColumns.value).toBeUndefined();
    expect(chrome.isCreditShown.value).toBe(true);
  });

  it("reads the header and footer settings of the theme's groups", () => {
    publish({
      header: { content: [{ id: "h", type: "site-header", logo_width: 160 }] },
      footer: {
        content: [
          {
            id: "f",
            type: "site-footer",
            copyright: "© Acme",
            show_credit: false,
            blocks: [
              { id: "help", type: "footer-menu", heading: "Help", menu: "footer-help" },
              { id: "own", type: "footer-menu", heading: "Shop", links: [{ label: "Sale", link: "/sale" }] },
              { id: "off", type: "footer-menu", heading: "Hidden", hidden: true },
            ],
          },
        ],
      },
    });

    const chrome = useThemeChrome();

    expect(chrome.logoWidth.value).toBe(160);
    expect(chrome.copyright.value).toBe("© Acme");
    expect(chrome.isCreditShown.value).toBe(false);
    expect(chrome.footerColumns.value).toEqual([
      { id: "help", title: "Help", children: [expect.objectContaining({ title: "Contact", route: "/contact" })] },
      { id: "own", title: "Shop", children: [{ title: "Sale", route: "/sale" }] },
    ]);
  });

  it.each(["javascript:alert(1)", "data:text/html,x"])("treats an unsafe footer link as a missing one: %s", (link) => {
    publish({
      footer: {
        content: [
          { id: "f", type: "site-footer", blocks: [{ id: "b", type: "footer-menu", links: [{ label: "Bad", link }] }] },
        ],
      },
    });

    expect(useThemeChrome().footerColumns.value?.[0].children).toEqual([{ title: "Bad", route: undefined }]);
  });

  it("hides a published column that has no links, such as a menu missing in this language", () => {
    publish({
      footer: {
        content: [
          {
            id: "f",
            type: "site-footer",
            blocks: [
              { id: "help", type: "footer-menu", heading: "Help", menu: "Footer-Help" },
              { id: "news", type: "footer-menu", heading: "News", menu: "Footer-News" },
              { id: "empty", type: "footer-menu", heading: "Empty", links: [] },
            ],
          },
        ],
      },
    });

    expect(useThemeChrome().footerColumns.value?.map((column) => column.id)).toEqual(["help"]);
  });

  it("lets white-labeling's footer links replace the theme's footer menus", () => {
    whiteLabeling.footerLinks = [{ title: "Company" }];
    publish({ footer: { content: [{ id: "f", type: "site-footer", blocks: [{ id: "b", type: "footer-menu" }] }] } });

    expect(useThemeChrome().footerColumns.value).toBeUndefined();
  });

  it("shows a draft's texts in the current language, else the store default", () => {
    const draft: IThemeDraft = {
      footer: {
        content: [
          {
            id: "f",
            type: "site-footer",
            copyright: { "en-US": "© Acme", "de-DE": "© Acme GmbH" },
            blocks: [{ id: "b", type: "footer-menu", heading: { "en-US": "Help" }, links: [] }],
          },
        ],
      },
    };
    useThemeSnapshot().setDraft(draft);

    const chrome = useThemeChrome();

    expect(chrome.copyright.value).toBe("© Acme GmbH");
    expect(chrome.footerColumns.value?.[0].title).toBe("Help");
  });
});
