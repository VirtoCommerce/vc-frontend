import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { VcMenuItem } from "@/ui-kit/components/molecules";
import type { VueWrapper } from "@vue/test-utils";

type RequestType = {
  args: { after?: string; searchPhrase?: string };
  resolve: (value: unknown) => void;
};

// requests: sent and not yet taken by resolveAll().
const hoisted = vi.hoisted(() => ({
  requests: [] as RequestType[],
  trySwitch: vi.fn(),
}));

const user = ref({ contact: { organizationId: "org-0" } });
const organization = ref({ id: "org-0", name: "Org 0" });

vi.mock("@/core/api/graphql/account", () => ({
  getOrganizations: vi.fn(
    (args: RequestType["args"]) =>
      new Promise((resolve) => {
        hoisted.requests.push({ args, resolve });
      }),
  ),
}));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ user, organization }),
}));

vi.mock("@/shared/account/composables/useOrganizationSwitcher", async () => {
  const { ref: vueRef } = await import("vue");
  return { useOrganizationSwitcher: () => ({ switchError: vueRef(""), trySwitch: hoisted.trySwitch }) };
});

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

const stubs = {
  VcInput: {
    name: "VcInput",
    props: ["modelValue", "aria"],
    emits: ["clear", "input", "keydown", "update:modelValue"],
    template: '<div class="test-input"><slot name="append" /></div>',
  },
  VcButton: { template: '<button type="button"><slot /></button>' },
  VcScrollbar: { template: "<div><slot /></div>" },
  VcRadioButton: true,
  VcAlert: true,
  VcIcon: true,
  VcInfinityScrollLoader: true,
};

function page(count: number, total = count, locked: number[] = []) {
  return {
    items: Array.from({ length: count }, (_, i) => ({
      id: `org-${i}`,
      name: `Org ${i}`,
      isLockedForCurrentUser: locked.includes(i),
    })),
    pageInfo: { hasNextPage: false, endCursor: undefined },
    totalCount: total,
  };
}

// The panel the list sits in: VcPopover's dialog, which takes focus on open.
async function mountList(): Promise<VueWrapper> {
  const { default: OrganizationList } = await import("./organization-list.vue");
  const Panel = defineComponent({
    components: { OrganizationList },
    emits: { selected: () => true },

    template: `
      <div role="dialog" tabindex="-1" class="test-panel">
        <OrganizationList @organization-selected="$emit('selected')" />
      </div>
    `,
  });

  const wrapper = mount(Panel, {
    attachTo: document.body,
    global: { stubs, components: { VcMenuItem }, mocks: { $t: (key: string) => key } },
  });
  await flushPromises();
  return wrapper;
}

async function useOrganizations() {
  const { useUserOrganizations } = await import("@/shared/account/composables/useUserOrganizations");
  return useUserOrganizations();
}

// Resolves every request still open, in order; a search answers with 2 rows, the full list with 15.
async function resolveAll(): Promise<void> {
  for (const request of hoisted.requests.splice(0)) {
    request.resolve(request.args.searchPhrase ? page(2, 2) : page(15));
    await flushPromises();
  }

  if (hoisted.requests.length) {
    await resolveAll();
  }
}

function lastRequest(): RequestType | undefined {
  return hoisted.requests.at(-1);
}

function options(wrapper: VueWrapper) {
  return wrapper.findAll<HTMLElement>('[role="option"]');
}

function focused(): Element | null {
  return document.activeElement;
}

beforeEach(() => {
  // useUserOrganizations is session state: each case starts with a fresh one.
  vi.resetModules();
  hoisted.requests.length = 0;
  hoisted.trySwitch.mockReset();
  hoisted.trySwitch.mockResolvedValue(true);
});

describe("OrganizationList: loading", () => {
  it("sends one request on the first open", async () => {
    await mountList();

    expect(hoisted.requests).toHaveLength(1);
    expect(hoisted.requests[0].args.searchPhrase).toBe("");
  });

  it("starts every open from the full list", async () => {
    const first = await mountList();
    await resolveAll();
    (await useOrganizations()).searchPhrase.value = "Merc";
    first.unmount();

    await mountList();

    expect(lastRequest()?.args.searchPhrase).toBe("");
  });

  it("loads the full list again when the field is cleared", async () => {
    const wrapper = await mountList();
    await resolveAll();
    (await useOrganizations()).searchPhrase.value = "Merc";
    await wrapper.get('[data-test-id="organizations-search-button"]').trigger("click");
    await resolveAll();
    expect(options(wrapper)).toHaveLength(2);

    wrapper.findComponent({ name: "VcInput" }).vm.$emit("clear");
    await flushPromises();

    expect(lastRequest()?.args.searchPhrase).toBe("");
    await resolveAll();
    expect(options(wrapper)).toHaveLength(15);
    expect(wrapper.find('[data-test-id="organizations-search"]').exists()).toBe(true);
  });
});

describe("OrganizationList: a search still running", () => {
  it("ends on the full list, field shown, when the field is cleared", async () => {
    const wrapper = await mountList();
    await resolveAll();
    (await useOrganizations()).searchPhrase.value = "Merc";
    await wrapper.get('[data-test-id="organizations-search-button"]').trigger("click");
    expect(lastRequest()?.args.searchPhrase).toBe('"Merc"');

    wrapper.findComponent({ name: "VcInput" }).vm.$emit("clear");
    await flushPromises();
    await resolveAll();

    expect(wrapper.find('[data-test-id="organizations-search"]').exists()).toBe(true);
    expect(options(wrapper)).toHaveLength(15);
  });

  it("ends on the full list, field shown, when the panel is opened again", async () => {
    const first = await mountList();
    await resolveAll();
    (await useOrganizations()).searchPhrase.value = "Merc";
    await first.get('[data-test-id="organizations-search-button"]').trigger("click");
    first.unmount();

    const second = await mountList();
    await resolveAll();

    expect(second.find('[data-test-id="organizations-search"]').exists()).toBe(true);
    expect(options(second)).toHaveLength(15);
  });
});

describe("OrganizationList: keyboard", () => {
  async function mountRows(locked: number[] = []): Promise<VueWrapper> {
    const wrapper = await mountList();
    hoisted.requests.splice(0).forEach((request) => request.resolve(page(4, 4, locked)));
    await flushPromises();
    return wrapper;
  }

  it("moves one row per arrow and wraps at both ends", async () => {
    const wrapper = await mountRows();
    const rows = options(wrapper);

    rows[0].element.focus();
    await rows[0].trigger("keydown", { key: "ArrowDown" });
    expect(focused()).toBe(rows[1].element);

    rows[3].element.focus();
    await rows[3].trigger("keydown", { key: "ArrowDown" });
    expect(focused()).toBe(rows[0].element);

    await rows[0].trigger("keydown", { key: "ArrowUp" });
    expect(focused()).toBe(rows[3].element);
  });

  it("steps over a locked row", async () => {
    const wrapper = await mountRows([2]);
    const rows = options(wrapper);

    rows[1].element.focus();
    await rows[1].trigger("keydown", { key: "ArrowDown" });

    expect(focused()).toBe(rows[3].element);
  });

  it("enters the list from the panel: Down at the first row, Up at the last", async () => {
    const wrapper = await mountRows();
    const panel = wrapper.get<HTMLElement>(".test-panel");
    const rows = options(wrapper);

    panel.element.focus();
    await panel.trigger("keydown", { key: "ArrowUp" });
    expect(focused()).toBe(rows[3].element);

    panel.element.focus();
    await panel.trigger("keydown", { key: "ArrowDown" });
    expect(focused()).toBe(rows[0].element);
  });

  it("enters the list from the search field at the first row", async () => {
    const wrapper = await mountList();
    await resolveAll();

    wrapper.findComponent({ name: "VcInput" }).vm.$emit("keydown", new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();

    expect(focused()).toBe(options(wrapper)[0].element);
  });

  it("points the search field at the row the arrows focus", async () => {
    const wrapper = await mountList();
    await resolveAll();
    const input = wrapper.findComponent({ name: "VcInput" });

    input.vm.$emit("keydown", new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await nextTick();

    expect(input.props("aria")["aria-activedescendant"]).toBe(options(wrapper)[0].attributes("id"));
  });
});

describe("OrganizationList: choosing", () => {
  it("closes without a switch when the current organization is chosen", async () => {
    const wrapper = await mountList();
    await resolveAll();

    await options(wrapper)[0].trigger("click");
    await flushPromises();

    expect(hoisted.trySwitch).not.toHaveBeenCalled();
    expect(wrapper.emitted("selected")).toHaveLength(1);
  });

  it("switches to another organization, then closes", async () => {
    const wrapper = await mountList();
    await resolveAll();

    await options(wrapper)[1].trigger("click");
    await flushPromises();

    expect(hoisted.trySwitch).toHaveBeenCalledWith("org-1");
    expect(wrapper.emitted("selected")).toHaveLength(1);
  });

  it("stays open on the current organization when the switch fails", async () => {
    hoisted.trySwitch.mockResolvedValue(false);
    const wrapper = await mountList();
    await resolveAll();

    await options(wrapper)[1].trigger("click");
    await flushPromises();

    expect(hoisted.trySwitch).toHaveBeenCalledWith("org-1");
    expect(wrapper.emitted("selected")).toBeUndefined();
    expect(options(wrapper)[0].attributes("aria-selected")).toBe("true");
    expect(options(wrapper)[1].attributes("aria-selected")).toBe("false");
  });
});
