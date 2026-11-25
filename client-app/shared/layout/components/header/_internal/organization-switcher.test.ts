import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { VcPopover } from "@/ui-kit/components/molecules";
import OrganizationSwitcher from "./organization-switcher.vue";
import type { VueWrapper } from "@vue/test-utils";

// Hoisted: the switcher, imported above, reads them while the mocks load.
const { organization, isMultiOrganization } = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    organization: ref<{ id: string; name: string } | undefined>(),
    isMultiOrganization: ref(true),
  };
});

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ organization, isMultiOrganization }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string, params: Record<string, string>) => `${key} ${JSON.stringify(params)}` }),
}));

// A failed assertion skips a trailing unmount(), and these suites read document.activeElement.
enableAutoUnmount(afterEach);

const OrganizationList = defineComponent({
  name: "OrganizationList",
  emits: { organizationSelected: () => true },
  template: `<button class="test-choose" type="button" @click="$emit('organizationSelected')">Org 2</button>`,
});

const Page = defineComponent({
  components: { OrganizationSwitcher },

  template: `
    <div>
      <OrganizationSwitcher :item="{ id: 'organizations', title: 'Companies' }" />
      <a class="test-next" href="#">All products</a>
    </div>
  `,
});

function mountPage(): VueWrapper {
  return mount(Page, {
    attachTo: document.body,
    global: {
      components: { VcPopover },
      stubs: { OrganizationList, BottomHeaderLink: { template: '<button type="button"><slot /></button>' } },
      mocks: { $t: (key: string) => key },
    },
  });
}

function trigger(wrapper: VueWrapper) {
  return wrapper.get('[data-test-id="organizations-button"]');
}

async function open(wrapper: VueWrapper): Promise<void> {
  await trigger(wrapper).trigger("click");
  await flushPromises();
  expect(trigger(wrapper).attributes("aria-expanded")).toBe("true");
}

beforeEach(() => {
  organization.value = { id: "org-1", name: "Northwind Traders" };
  isMultiOrganization.value = true;
});

describe("OrganizationSwitcher", () => {
  it("renders nothing for a member of one organization", () => {
    isMultiOrganization.value = false;

    expect(mountPage().find('[data-test-id="organizations-button"]').exists()).toBe(false);
  });

  it("names the trigger by its caption and the current organization", () => {
    const wrapper = mountPage();
    const label = wrapper.get(`#${trigger(wrapper).attributes("aria-labelledby")}`);

    expect(label.text()).toBe(
      'shared.layout.header.organization_switcher.trigger_label {"title":"Companies","name":"Northwind Traders"}',
    );
  });

  it("closes once an organization is chosen", async () => {
    const wrapper = mountPage();
    await open(wrapper);

    await wrapper.get(".test-choose").trigger("click");
    await flushPromises();

    expect(trigger(wrapper).attributes("aria-expanded")).toBe("false");
  });

  it("closes on Escape after focus has left the panel", async () => {
    const wrapper = mountPage();
    await open(wrapper);
    const next = wrapper.get<HTMLElement>(".test-next").element;
    next.focus();

    next.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await flushPromises();

    expect(trigger(wrapper).attributes("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(next);
  });
});
