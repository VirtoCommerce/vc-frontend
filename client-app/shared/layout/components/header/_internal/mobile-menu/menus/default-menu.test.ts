import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent } from "vue";
import DefaultMenu from "./default-menu.vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

type EntryType = { use?: () => Record<string, unknown> };

const h = vi.hoisted((): { entries: Record<string, Record<string, EntryType>> } => ({ entries: {} }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: () => null,
    getContribution: (category: string, name: string) => h.entries[category]?.[name]?.use,
    getProps: () => undefined,
    isRegistered: () => false,
    passesCondition: () => true,
  }),
}));

const MobileMenuLinkStub = defineComponent({
  name: "MobileMenuLink",
  props: { link: { type: Object, required: true }, count: { type: Number, default: undefined } },
  template: `<a>{{ link.title }}:{{ count }}</a>`,
});

function mountMenu() {
  return mount(DefaultMenu, {
    props: { items: [{ id: "my-customers", title: "my customers", route: "/company/my-customers" }] },
    global: {
      components: { ExtensionPoint },
      stubs: { MobileMenuLink: MobileMenuLinkStub },
    },
  });
}

describe("DefaultMenu", () => {
  it("passes a contributed count to the native link", () => {
    h.entries = { mobileMenu: { "my-customers": { use: () => ({ count: 5 }) } } };

    expect(mountMenu().text()).toContain("my customers:5");
  });

  it("unwraps a reactive count", () => {
    h.entries = { mobileMenu: { "my-customers": { use: () => ({ count: computed(() => 12) }) } } };

    expect(mountMenu().text()).toContain("my customers:12");
  });

  it("renders no count when the entry carries none", () => {
    h.entries = {};

    expect(mountMenu().text()).toContain("my customers:");
  });
});
