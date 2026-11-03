import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { registerPageBuilderSections } from "../sections";
import PageTemplate from "./page-template.vue";
import type { IThemeSnapshot } from "@/core/theme-snapshot";

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ currentLanguage: ref({ cultureName: "en-US" }), defaultStoreCulture: ref("en-US") }),
}));

const Banner = defineComponent({
  props: { text: { type: String, default: "" } },
  setup: (props) => () => h("aside", { "data-test-id": "template-banner" }, props.text),
});

registerPageBuilderSections({ banner: Banner });

function publish(snapshot: Partial<IThemeSnapshot>): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...snapshot },
  });
}

const wrappers: { unmount: () => void }[] = [];

function mountPage(pageSettings: Record<string, unknown> = {}, permalink = "/landing/spring") {
  const wrapper = mount(PageTemplate, {
    props: { pageSettings, permalink, objectType: "Pages" },
    slots: { default: () => h("article", { "data-test-id": "page-own-content" }) },
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe("PageTemplate", () => {
  beforeEach(() => {
    useThemeSnapshot().setPublished(null);
  });

  // A page left mounted would set the layout again when the next test publishes its theme.
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  });

  it("renders just the page in the built-in template and the full layout", () => {
    const wrapper = mountPage();

    expect(wrapper.html()).toBe('<article data-test-id="page-own-content"></article>');
    expect(usePageLayout().pageLayout.value).toBe("full");
  });

  it("puts the page where its template's page-content section is, by the store's rules", () => {
    publish({
      rules: { version: 2, page: [{ id: "landing", template: "page.landing", when: { path: "/landing/*" } }] },
      templates: {
        "page.landing": {
          settings: { layout: "minimal" },
          content: [
            { id: "top", type: "banner", text: "Above" },
            { id: "main", type: "page-content" },
            { id: "bottom", type: "banner", text: "Below" },
            { id: "off", type: "banner", text: "Hidden", hidden: true },
          ],
        },
      },
    });

    const wrapper = mountPage();
    const order = wrapper.findAll("[data-test-id]").map((node) => node.text() || node.attributes("data-test-id"));

    expect(order).toEqual(["Above", "page-own-content", "Below"]);
    expect(usePageLayout().pageLayout.value).toBe("minimal");
  });

  it("lets the page's own template and layout win over the rules and its template", () => {
    publish({
      templates: {
        "page.blank": { settings: { layout: "blank" }, content: [{ id: "main", type: "page-content" }] },
        page: { settings: { layout: "minimal" }, content: [{ id: "main", type: "page-content" }] },
      },
    });

    mountPage({ template: "page.blank" }).unmount();
    expect(usePageLayout().pageLayout.value).toBe("blank");

    mountPage({ layout: "full" });
    expect(usePageLayout().pageLayout.value).toBe("full");
  });
});
