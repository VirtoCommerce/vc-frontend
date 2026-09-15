import { enableAutoUnmount, mount } from "@vue/test-utils";
import { vMaska } from "maska/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory, describeScrollBox } from "@/core/utilities/tests";
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
  state.isShowSearch.value = true;
  vi.clearAllMocks();
});

describe("TopHeaderOrganizations", () => {
  it("renders the organizations as listbox options", () => {
    const wrapper = mountComponent();

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  });

  // Поле — комбобокс, который управляет списком, поэтому оно обязано лежать СНАРУЖИ него и выше:
  // внутри `role="listbox"` могут быть только опции, а `aria-controls` должен на что-то указывать.
  it("keeps the search field above the list it controls, not inside it", () => {
    const wrapper = mountComponent();
    const field = wrapper.get("[data-test-id='organizations-search']").element;
    const list = wrapper.get('[role="listbox"]').element;

    expect(list.contains(field)).toBe(false);
    expect(field.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(wrapper.get("input").attributes("aria-controls")).toBe(list.id);
  });

  // Внутри role="listbox" допустимы только опции: ни пустое состояние, ни пейджер (role="status")
  // ими не являются, поэтому список лежит ВНУТРИ области прокрутки, а не является ею.
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

  // Редактируемому полю Home/End нужны для каретки. VcSelect перехватывает их только когда
  // поле read-only; здесь оно всегда редактируемое, значит не перехватываем никогда.
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

  // Un-hoisting the current organization mid-request shifts every option up by one, which
  // invalidates the keyboard highlight on every page load.
  it("keeps the current organization pinned to the top while a page loads", async () => {
    state.organization.value = { id: "org-3", name: "Initech" };
    const wrapper = mountComponent();
    await nextTick();

    expect(wrapper.findAll('[role="option"]')[0].text()).toContain("Initech");

    state.loading.value = true;
    await nextTick();

    expect(wrapper.findAll('[role="option"]')[0].text()).toContain("Initech");
  });

  // Paging appends to the list; the highlighted option has not moved, so it must survive.
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

    expect(wrapper.find(".vc-load-more").exists()).toBe(false);

    state.loading.value = true;
    await nextTick();

    expect(wrapper.find(".vc-load-more").exists()).toBe(true);
  });

  // Список организаций короче своей области почти всегда: без запроса, который не ждёт прокрутки,
  // вторая страница не пришла бы никогда.
  it("asks for the next page when the list rests at its bottom", async () => {
    state.hasNextPage.value = true;
    const wrapper = mountComponent();

    describeScrollBox(wrapper.get(".vc-scrollbar").element as HTMLElement, {
      clientHeight: 400,
      scrollHeight: 400,
      scrollTop: 0,
    });

    // В jsdom нет ни вёрстки, ни ResizeObserver: измерение провоцируется изменением контента,
    // которое скроллбар действительно наблюдает.
    state.organizations.value = [...state.organizations.value, { id: "org-4", name: "Hooli" }];
    await new Promise((resolve) => setTimeout(resolve, 160));

    expect(state.loadOrganizations).toHaveBeenCalledTimes(1);
  });

  it("shows the empty message when nothing was found", async () => {
    state.organizations.value = [];
    const wrapper = mountComponent();
    await nextTick();

    expect(wrapper.find("[data-test-id='organizations-empty-list']").exists()).toBe(true);
  });

  // Ниже порога поиска поля нет, а опции намеренно вне таб-порядка: без своего таб-стопа
  // список не достать с клавиатуры вообще. До этого тесты сидели только на ветке с полем.
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

      // Поле лежит снаружи области прокрутки, и её обработчик всё равно уходит в ранний возврат:
      // одно нажатие обязано сдвинуть подсветку ровно на один шаг.
      await input.trigger("keydown", { key: "ArrowDown" });
      await nextTick();

      expect(input.attributes("aria-activedescendant")).toBe(optionIds[0]);
      expect(wrapper.get('[role="listbox"]').attributes("tabindex")).toBeUndefined();
    });
  });
});
