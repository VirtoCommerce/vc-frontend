import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import TopHeaderOrganizations from "./top-header-organizations.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    searchPhrase: ref(""),
    organizations: ref<{ id: string; name: string }[]>([]),
    loading: ref(false),
    hasNextPage: ref(false),
    pagesCount: ref(1),
    currentPage: ref(1),
    isShowSearch: ref(true),
    loadOrganizations: vi.fn(),
    search: vi.fn(),
    reset: vi.fn(),
    trySwitch: vi.fn().mockResolvedValue(true),
    switchError: ref(""),
    organization: ref<{ id: string; name: string } | undefined>(undefined),
    user: ref<{ contact?: { organizationId?: string } }>({ contact: { organizationId: "org-1" } }),
  };
});

vi.mock("@/shared/account", () => ({
  useUser: () => ({ user: state.user, organization: state.organization }),
  useUserOrganizations: () => ({
    searchPhrase: state.searchPhrase,
    organizations: state.organizations,
    loading: state.loading,
    hasNextPage: state.hasNextPage,
    pagesCount: state.pagesCount,
    currentPage: state.currentPage,
    isShowSearch: state.isShowSearch,
    loadOrganizations: state.loadOrganizations,
    search: state.search,
    reset: state.reset,
  }),
  useOrganizationSwitcher: () => ({ switchError: state.switchError, trySwitch: state.trySwitch }),
}));

// VcInfinityScrollLoader builds one on mount; jsdom has none.
class IntersectionObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

enableAutoUnmount(afterEach);

const mountComponent = createWrapperFactory(mount, TopHeaderOrganizations, {
  attachTo: document.body,
  global: { components: UIKitComponents, directives: { maska: vMaska } },
});

beforeEach(() => {
  state.organizations.value = [
    { id: "org-1", name: "Acme" },
    { id: "org-2", name: "Globex" },
    { id: "org-3", name: "Initech" },
  ];
  state.organization.value = undefined;
  state.loading.value = false;
  state.hasNextPage.value = false;
  state.searchPhrase.value = "";
  vi.clearAllMocks();
});

describe("TopHeaderOrganizations", () => {
  it("renders the organizations as listbox options", () => {
    const wrapper = mountComponent();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  });

  it("puts the search field in the listbox header", () => {
    const wrapper = mountComponent();

    expect(wrapper.find(".vc-listbox__header [data-test-id='organizations-search']").exists()).toBe(true);
  });

  // The whole point of the rewrite: focus stays in the search field while arrowing.
  it("keeps focus in the search field and tracks the option with aria-activedescendant", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    (input.element as HTMLInputElement).focus();
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    expect(input.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[0].attributes("id"));
  });

  it("keeps options out of the tab order", () => {
    const wrapper = mountComponent();

    expect(wrapper.findAll('[role="option"]').map((option) => option.attributes("tabindex"))).toEqual([
      "-1",
      "-1",
      "-1",
    ]);
  });

  it("wraps with ArrowUp and jumps with Home/End", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");
    const ids = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

    await input.trigger("keydown", { key: "ArrowUp" });
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(ids[2]);

    await input.trigger("keydown", { key: "Home" });
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(ids[0]);

    await input.trigger("keydown", { key: "End" });
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBe(ids[2]);
  });

  it("switches to the highlighted organization on Enter", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "Enter" });

    expect(state.trySwitch).toHaveBeenCalledWith("org-2");
  });

  it("runs the search on Enter when nothing is highlighted", async () => {
    const wrapper = mountComponent();

    await wrapper.get("input").trigger("keydown", { key: "Enter" });

    expect(state.search).toHaveBeenCalled();
    expect(state.trySwitch).not.toHaveBeenCalled();
  });

  it("drops the highlight when the list changes underneath", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();
    expect(input.attributes("aria-activedescendant")).toBeTruthy();

    state.organizations.value = [{ id: "org-9", name: "Umbrella" }];
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBeUndefined();
  });

  it("shows the load-more sentinel only while more pages exist", async () => {
    const wrapper = mountComponent();

    expect(wrapper.find(".top-header-organizations__loader").exists()).toBe(false);

    state.hasNextPage.value = true;
    await nextTick();

    expect(wrapper.find(".top-header-organizations__loader").exists()).toBe(true);
  });

  it("shows the empty message when nothing was found", async () => {
    state.organizations.value = [];
    const wrapper = mountComponent();
    await nextTick();

    expect(wrapper.find("[data-test-id='organizations-empty-list']").exists()).toBe(true);
  });
});
