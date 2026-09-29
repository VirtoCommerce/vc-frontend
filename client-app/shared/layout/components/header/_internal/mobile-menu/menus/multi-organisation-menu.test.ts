import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import MultiOrganisationMenu from "./multi-organisation-menu.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    organizations: ref<{ id: string; name: string }[]>([]),
    loading: ref(false),
    hasNextPage: ref(false),
    pagesCount: ref(1),
    currentPage: ref(1),
    loadOrganizations: vi.fn(),
    search: vi.fn(),
    trySwitch: vi.fn().mockResolvedValue(true),
    switchError: ref(""),
    organization: ref<{ id: string; name: string } | undefined>(undefined),
    user: ref({ contact: { organizationId: "org-1" } }),
  };
});

vi.mock("@/shared/account", () => ({
  useUser: () => ({ user: state.user, organization: state.organization, isMultiOrganization: { value: true } }),
  useUserOrganizations: () => ({
    organizations: state.organizations,
    loading: state.loading,
    hasNextPage: state.hasNextPage,
    pagesCount: state.pagesCount,
    currentPage: state.currentPage,
    loadOrganizations: state.loadOrganizations,
    search: state.search,
  }),
  useOrganizationSwitcher: () => ({ switchError: state.switchError, trySwitch: state.trySwitch }),
}));

enableAutoUnmount(afterEach);

const mountComponent = createWrapperFactory(mount, MultiOrganisationMenu, {
  global: { components: UIKitComponents },
});

function radioValues(wrapper: ReturnType<typeof mountComponent>): string[] {
  return wrapper.findAll("input[type='radio']").map((radio) => (radio.element as HTMLInputElement).value);
}

describe("MultiOrganisationMenu", () => {
  beforeEach(() => {
    state.organization.value = { id: "org-1", name: "Acme" };
    state.organizations.value = [
      { id: "org-1", name: "Acme" },
      { id: "org-2", name: "Globex" },
    ];
    state.loading.value = false;
  });

  // Hiding the current organization for every page request shifts every row up by one.
  it("keeps the current organization on top while a page loads", () => {
    state.loading.value = true;

    const wrapper = mountComponent();

    expect(radioValues(wrapper)).toEqual(["org-1", "org-2"]);
  });

  it("leaves the current organization off an empty result", () => {
    state.organizations.value = [];

    const wrapper = mountComponent();

    expect(radioValues(wrapper)).toEqual([]);
  });
});
