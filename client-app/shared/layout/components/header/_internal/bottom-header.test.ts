import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import BottomHeader from "./bottom-header.vue";
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

vi.mock("@/core/composables", () => ({
  useNavigations: () => ({
    catalogMenuItems: ref([]),
    desktopMainMenuItems: ref([{ id: "my-list", title: "My list", route: { name: "MyList" } }]),
  }),
  useWhiteLabeling: () => ({ logoUrl: ref("") }),
}));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ organization: ref() }),
}));

vi.mock("./search-bar/search-bar.vue", () => ({ default: { name: "SearchBar", render: () => null } }));
vi.mock("./catalog-menu.vue", () => ({ default: { name: "CatalogMenu", render: () => null } }));

const VcBadgeStub = { name: "VcBadge", template: "<span><slot /></span>" };

function mountHeader() {
  const page = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: page },
      { path: "/catalog", name: "Catalog", component: page },
      { path: "/my-list", name: "MyList", component: page },
    ],
  });

  return mount(BottomHeader, {
    global: {
      plugins: [router],
      components: { ExtensionPoint },
      stubs: { VcBadge: VcBadgeStub, VcIcon: true, VcImage: true },
      mocks: {
        $t: (key: string) => key,
        $n: (value: number) => String(value),
        $context: { settings: {}, storeName: "Store" },
      },
    },
  });
}

describe("BottomHeader", () => {
  it("shows the count a headerMenu entry contributes as a badge on the host's link", () => {
    h.entries = { headerMenu: { "my-list": { use: () => ({ count: 4 }) } } };

    expect(mountHeader().getComponent(VcBadgeStub).text()).toBe("4");
  });

  it("repaints the badge when the contributed count changes", async () => {
    const count = ref(0);
    h.entries = { headerMenu: { "my-list": { use: () => ({ count: computed(() => count.value) }) } } };

    const wrapper = mountHeader();
    expect(wrapper.findComponent(VcBadgeStub).exists()).toBe(false);

    count.value = 2;
    await nextTick();

    expect(wrapper.getComponent(VcBadgeStub).text()).toBe("2");
  });

  it("draws the link without a badge when nothing is contributed", () => {
    h.entries = {};

    const wrapper = mountHeader();

    expect(wrapper.text()).toContain("My list");
    expect(wrapper.findComponent(VcBadgeStub).exists()).toBe(false);
  });
});
