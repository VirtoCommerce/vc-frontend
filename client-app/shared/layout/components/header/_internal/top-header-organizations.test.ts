import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import { describeScrollBox } from "@/ui-kit/test-mocks";
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
  state.user.value = { contact: { organizationId: "org-1" } };
  state.loading.value = false;
  state.hasNextPage.value = false;
  state.searchPhrase.value = "";
  state.isShowSearch.value = true;
  // The focus modality is document-wide; each test starts from the keyboard.
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
  vi.clearAllMocks();
});

describe("TopHeaderOrganizations", () => {
  it("renders the organizations as listbox options", () => {
    const wrapper = mountComponent();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  });

  it("keeps the search field above the list it controls, not inside it", () => {
    const wrapper = mountComponent();
    const field = wrapper.get("[data-test-id='organizations-search']").element;
    const list = wrapper.get('[role="listbox"]').element;

    expect(list.contains(field)).toBe(false);
    expect(field.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(wrapper.get("input").attributes("aria-controls")).toBe(list.id);
  });

  it("keeps the empty state and the pager out of the listbox", async () => {
    state.organizations.value = [];
    state.hasNextPage.value = true;
    state.loading.value = true;

    const wrapper = mountComponent();
    const list = wrapper.get('[role="listbox"]').element;
    const pager = wrapper.get(".vc-load-more").element;

    expect(list.contains(pager)).toBe(false);
    expect(wrapper.get(".vc-scrollbar").element.contains(pager)).toBe(true);

    state.loading.value = false;
    await nextTick();

    expect(list.contains(wrapper.get("[data-test-id='organizations-empty-list']").element)).toBe(false);
  });

  it("keeps focus in the search field and tracks the option with aria-activedescendant", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    (input.element as HTMLInputElement).focus();
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    expect(input.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[0].attributes("id"));
  });

  it("leaves Home and End to the caret in the search field", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    await input.trigger("keydown", { key: "End" });
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBeUndefined();

    await input.trigger("keydown", { key: "Home" });
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBeUndefined();
  });

  it("keeps options out of the tab order", () => {
    const wrapper = mountComponent();

    expect(wrapper.findAll('[role="option"]').map((option) => option.attributes("tabindex"))).toEqual([
      "-1",
      "-1",
      "-1",
    ]);
  });

  it("wraps with ArrowUp from the search field", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");
    const ids = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

    await input.trigger("keydown", { key: "ArrowUp" });
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBe(ids[2]);

    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBe(ids[0]);
  });

  it("stays on the last loaded organization with ArrowDown while a next page exists", async () => {
    state.hasNextPage.value = true;

    const wrapper = mountComponent();
    const input = wrapper.get("input");
    const ids = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

    for (let press = 0; press < 4; press++) {
      await input.trigger("keydown", { key: "ArrowDown" });
    }

    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBe(ids[2]);
  });

  it("names the list for end-to-end tests", () => {
    const wrapper = mountComponent();

    expect(wrapper.get("[data-test-id='organizations-list']").attributes("role")).toBe("listbox");
  });

  it("marks each option for end-to-end tests", () => {
    const wrapper = mountComponent();

    expect(wrapper.findAll("[data-vc-organization-option] [role='option']")).toHaveLength(3);
  });

  it("leaves the keys of an IME composition to the IME", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    state.search.mockClear();
    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "ArrowDown", isComposing: true });
    await input.trigger("keydown", { key: "Enter", keyCode: 229 });
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBe(wrapper.findAll('[role="option"]')[0].attributes("id"));
    expect(state.trySwitch).not.toHaveBeenCalled();
    expect(state.search).not.toHaveBeenCalled();
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
    state.search.mockClear();

    await wrapper.get("input").trigger("keydown", { key: "Enter" });

    expect(state.search).toHaveBeenCalled();
    expect(state.trySwitch).not.toHaveBeenCalled();
  });

  it("rings the highlight moved by the keyboard, not the one moved by the pointer", async () => {
    const wrapper = mountComponent();

    await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");

    expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(true);
    expect(wrapper.find(".vc-menu-item__inner--highlight-ring").exists()).toBe(false);

    await wrapper.get("input").trigger("keydown", { key: "ArrowDown" });

    expect(wrapper.find(".vc-menu-item__inner--highlight-ring").exists()).toBe(true);
  });

  it("drops a pointer highlight when the pointer leaves the list", async () => {
    const wrapper = mountComponent();

    await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");

    expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(true);

    await wrapper.get('[role="listbox"]').trigger("mouseleave");

    expect(wrapper.find(".vc-menu-item__inner--highlighted").exists()).toBe(false);
  });

  it("switches to the row the pointer highlighted on Enter", async () => {
    const wrapper = mountComponent();

    await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");
    await wrapper.get("input").trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(state.trySwitch).toHaveBeenCalledWith("org-2");
  });

  it("keeps focus in the search field when an option is pressed with the mouse", () => {
    const wrapper = mountComponent();
    const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

    wrapper.findAll('[role="option"]')[1].element.dispatchEvent(press);

    expect(press.defaultPrevented).toBe(true);
  });

  it("keeps focus in the search field when the list's scroller is pressed", () => {
    const wrapper = mountComponent();
    const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

    wrapper.get(".top-header-organizations__list").element.dispatchEvent(press);

    expect(press.defaultPrevented).toBe(true);
  });

  it("runs the search on Enter typed right after a highlight, instead of switching", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");
    state.search.mockClear();

    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "ArrowDown" });
    await input.setValue("init");
    await input.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(state.trySwitch).not.toHaveBeenCalled();
    expect(state.search).toHaveBeenCalled();
  });

  it("does not switch on Enter right after the field is cleared", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    await input.trigger("keydown", { key: "ArrowDown" });
    wrapper.getComponent({ name: "VcInput" }).vm.$emit("clear");
    await nextTick();
    await input.trigger("keydown", { key: "Enter" });
    await nextTick();

    expect(state.trySwitch).not.toHaveBeenCalled();
  });

  it("keeps the current organization pinned to the top while a page loads", async () => {
    state.organization.value = { id: "org-3", name: "Initech" };
    const wrapper = mountComponent();
    await nextTick();

    expect(wrapper.findAll('[role="option"]')[0].text()).toContain("Initech");

    state.loading.value = true;
    await nextTick();

    expect(wrapper.findAll('[role="option"]')[0].text()).toContain("Initech");
  });

  it("leaves the current organization off an empty result", () => {
    state.organization.value = { id: "org-3", name: "Initech" };
    state.organizations.value = [];

    const wrapper = mountComponent();

    expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
  });

  it("keeps the highlight when another page is appended", async () => {
    const wrapper = mountComponent();
    const input = wrapper.get("input");

    await input.trigger("keydown", { key: "ArrowDown" });
    await input.trigger("keydown", { key: "ArrowDown" });
    await nextTick();

    const highlighted = input.attributes("aria-activedescendant");

    state.organizations.value = [...state.organizations.value, { id: "org-4", name: "Umbrella" }];
    await nextTick();

    expect(input.attributes("aria-activedescendant")).toBe(highlighted);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(4);
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

  it("shows the load-more indicator only while a page is on its way", async () => {
    state.hasNextPage.value = true;
    const wrapper = mountComponent();

    expect(wrapper.find(".vc-load-more--loading").exists()).toBe(false);

    state.loading.value = true;
    await nextTick();

    expect(wrapper.find(".vc-load-more--loading").exists()).toBe(true);
  });

  it("asks for the next page when the list rests at its bottom", async () => {
    state.hasNextPage.value = true;
    const wrapper = mountComponent();

    describeScrollBox(wrapper.get(".vc-scrollbar").element as HTMLElement, {
      clientHeight: 400,
      scrollHeight: 400,
      scrollTop: 0,
    });
    await new Promise((resolve) => setTimeout(resolve, 160));

    expect(state.loadOrganizations).toHaveBeenCalledTimes(1);
  });

  it("asks again after each page that lands while the list still rests at its bottom", async () => {
    state.hasNextPage.value = true;
    const wrapper = mountComponent();

    describeScrollBox(wrapper.get(".vc-scrollbar").element as HTMLElement, {
      clientHeight: 400,
      scrollHeight: 400,
      scrollTop: 0,
    });
    await new Promise((resolve) => setTimeout(resolve, 160));

    expect(state.loadOrganizations).toHaveBeenCalledTimes(1);

    for (const [index, id] of ["org-4", "org-5"].entries()) {
      state.loading.value = true;
      await nextTick();
      state.organizations.value = [...state.organizations.value, { id, name: id }];
      state.loading.value = false;
      await new Promise((resolve) => setTimeout(resolve, 160));

      expect(state.loadOrganizations).toHaveBeenCalledTimes(index + 2);
    }
  });

  it("asks once for a first page that keeps failing behind the empty message", async () => {
    state.organizations.value = [];
    state.hasNextPage.value = true;
    const wrapper = mountComponent();

    describeScrollBox(wrapper.get(".vc-scrollbar").element as HTMLElement, {
      clientHeight: 400,
      scrollHeight: 400,
      scrollTop: 0,
    });

    for (let attempt = 0; attempt < 3; attempt++) {
      state.loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 160));
      state.loading.value = false;
      await new Promise((resolve) => setTimeout(resolve, 160));
    }

    expect(state.loadOrganizations).toHaveBeenCalledTimes(1);
  });

  it("shows the empty message when nothing was found", async () => {
    state.organizations.value = [];
    const wrapper = mountComponent();
    await nextTick();

    expect(wrapper.find("[data-test-id='organizations-empty-list']").exists()).toBe(true);
  });

  describe("below the search threshold", () => {
    beforeEach(() => {
      state.isShowSearch.value = false;
    });

    it("renders no search field", () => {
      const wrapper = mountComponent();

      expect(wrapper.find("[data-test-id='organizations-search']").exists()).toBe(false);
    });

    it("makes the list itself the tab stop", () => {
      const wrapper = mountComponent();

      expect(wrapper.get('[role="listbox"]').attributes("tabindex")).toBe("0");
    });

    it("navigates the options from the list", async () => {
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await list.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[0]);

      await list.trigger("keydown", { key: "End" });
      await nextTick();

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[optionIds.length - 1]);
    });

    it.each([
      ["the selected organization", "org-2", 1],
      ["the first organization when none is selected", "org-9", 0],
    ])("starts on %s when the list takes focus", async (_label, organizationId, index) => {
      state.user.value = { contact: { organizationId } };
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await list.trigger("focus");

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[index]);
    });

    it("keeps the keyboard's position when the list takes focus again", async () => {
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await list.trigger("keydown", { key: "End" });
      await list.trigger("focus");

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[optionIds.length - 1]);
    });

    it("starts on the selected organization over a row the pointer rests on", async () => {
      state.user.value = { contact: { organizationId: "org-2" } };
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await wrapper.findAll(".vc-menu-item")[2].trigger("mousemove");
      await list.trigger("focus");

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[1]);
    });

    it("keeps the pointer's highlight when a press focuses the list", async () => {
      state.user.value = { contact: { organizationId: "org-2" } };
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await wrapper.findAll(".vc-menu-item")[2].trigger("mousemove");
      document.dispatchEvent(new PointerEvent("pointerdown"));
      await list.trigger("focus");

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[2]);
    });

    it("points at no option when an empty list takes focus", async () => {
      state.organizations.value = [];
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');

      await list.trigger("focus");

      expect(list.attributes("aria-activedescendant")).toBeUndefined();
    });

    it.each([
      ["starts on the selected organization once the first page lands", true, 1],
      ["leaves an unfocused list alone when the first page lands", false, undefined],
    ])("%s", async (_label, focused, index) => {
      state.user.value = { contact: { organizationId: "org-2" } };
      const loaded = state.organizations.value;
      state.organizations.value = [];
      const wrapper = mountComponent();
      const list = wrapper.get<HTMLElement>('[role="listbox"]');

      if (focused) {
        list.element.focus();
      }

      state.organizations.value = loaded;
      await nextTick();

      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      expect(list.attributes("aria-activedescendant")).toBe(index === undefined ? undefined : optionIds[index]);
    });

    it("picks the highlighted organization on Space", async () => {
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');

      await list.trigger("keydown", { key: "End" });
      await list.trigger("keydown", { key: " " });

      expect(state.trySwitch).toHaveBeenCalledWith("org-3");
    });

    it("keeps the highlight when the organizations come back as new objects", async () => {
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');

      await list.trigger("keydown", { key: "End" });
      state.organizations.value = state.organizations.value.map((item) => ({ ...item }));
      await nextTick();

      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      expect(list.attributes("aria-activedescendant")).toBe(optionIds[2]);
    });

    it("lets a pressed option take focus", () => {
      const wrapper = mountComponent();
      const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });

      wrapper.findAll('[role="option"]')[1].element.dispatchEvent(press);

      expect(press.defaultPrevented).toBe(false);
    });

    it("picks the row the pointer highlighted on Enter", async () => {
      const wrapper = mountComponent();

      await wrapper.findAll(".vc-menu-item")[1].trigger("mousemove");
      await wrapper.get('[role="listbox"]').trigger("keydown", { key: "Enter" });

      expect(state.trySwitch).toHaveBeenCalledWith("org-2");
    });

    it("picks the highlighted organization on Enter", async () => {
      const wrapper = mountComponent();
      const list = wrapper.get('[role="listbox"]');

      await list.trigger("keydown", { key: "ArrowDown" });
      await nextTick();
      await list.trigger("keydown", { key: "Enter" });

      expect(state.trySwitch).toHaveBeenCalledWith("org-1");
    });

    it("leaves the keys to the search field when it is there", async () => {
      state.isShowSearch.value = true;
      const wrapper = mountComponent();
      const input = wrapper.get("input");
      const optionIds = wrapper.findAll('[role="option"]').map((option) => option.attributes("id"));

      await input.trigger("keydown", { key: "ArrowDown" });
      await wrapper.get('[role="listbox"]').trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(optionIds[0]);
      expect(wrapper.get('[role="listbox"]').attributes("tabindex")).toBeUndefined();
    });
  });
});
