import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import AnnouncementBar from "./announcement-bar.vue";

const announcementBar = ref<{ blocks: Record<string, unknown>[] }>();

vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/" }) }));
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
});
