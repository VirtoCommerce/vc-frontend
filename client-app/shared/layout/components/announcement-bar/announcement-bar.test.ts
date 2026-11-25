import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import AnnouncementBar from "./announcement-bar.vue";

const announcementBar = ref<{ home_only?: boolean; blocks: Record<string, unknown>[] }>();
const routePath = ref("/");

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return routePath.value;
    },
  }),
}));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ getUrlWithoutLocale: (path: string) => path.replace(/^\/de(\/|$)/, "/") }),
}));
vi.mock("@/shared/layout/composables/useThemeChrome", () => ({ useThemeChrome: () => ({ announcementBar }) }));
vi.mock("@/shared/static-content/composables/useStaticPage", () => ({
  useStaticPage: () => ({ staticPagePreviewSubject: { value: undefined } }),
}));
vi.mock("@/shared/static-content/sections", () => ({ getPreviewSectionAttrs: () => ({}) }));

const VcLink = { props: ["to"], template: "<a><slot /></a>" };

function mountBar(link: string) {
  announcementBar.value = { blocks: [{ id: "a", type: "announcement", text: "Sale", link }] };

  return mount(AnnouncementBar, { global: { stubs: { VcLink } } });
}

describe("AnnouncementBar", () => {
  beforeEach(() => {
    routePath.value = "/";
  });

  it.each(["/sale", "https://example.com/sale"])("links the announcement to %s", (link) => {
    expect(mountBar(link).findComponent(VcLink).props("to")).toBe(link);
  });

  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x"])(
    "shows the announcement as text for the unsafe link %s",
    (link) => {
      const wrapper = mountBar(link);

      expect(wrapper.findComponent(VcLink).exists()).toBe(false);
      expect(wrapper.text()).toBe("Sale");
    },
  );

  it("shows a home-only bar on a locale-prefixed home page", () => {
    routePath.value = "/de";
    announcementBar.value = { home_only: true, blocks: [{ id: "a", type: "announcement", text: "Sale" }] };

    expect(mount(AnnouncementBar, { global: { stubs: { VcLink } } }).text()).toBe("Sale");
  });

  it("hides a home-only bar on a locale-prefixed page other than home", () => {
    routePath.value = "/de/catalog";
    announcementBar.value = { home_only: true, blocks: [{ id: "a", type: "announcement", text: "Sale" }] };

    expect(mount(AnnouncementBar, { global: { stubs: { VcLink } } }).text()).toBe("");
  });
});
