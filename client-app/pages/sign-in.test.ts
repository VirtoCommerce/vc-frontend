import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import SignInPage from "./sign-in.vue";

const authenticationTypes = ref<string[]>(["Password"]);
const fullPath = ref("/sign-in");
const getReturnUrl = vi.fn<(url?: string) => string>((url) => `resolved:${url}`);

vi.mock("@/core/composables", () => ({
  usePageHead: vi.fn(),
  useReturnUrl: () => ({ getReturnUrl }),
}));

vi.mock("@/shared/account", () => ({
  SignInForm: { name: "SignInForm", template: "<form />" },
}));

vi.mock("@/shared/sign-in/composables/useIdentityProviders", () => {
  const identityProviders = computed(() => authenticationTypes.value.filter((type) => type !== "Password"));
  const hasPasswordAuthentication = computed(() => authenticationTypes.value.includes("Password"));
  const hasIdentityProviders = computed(() => identityProviders.value.length > 0);

  return {
    useIdentityProviders: () => ({
      identityProviders,
      hasIdentityProviders,
      hasPasswordAuthentication,
      hasOnlyIdentityProviders: computed(() => hasIdentityProviders.value && !hasPasswordAuthentication.value),
    }),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get fullPath() {
      return fullPath.value;
    },
  }),
}));

async function mountPage() {
  const wrapper = mount(SignInPage, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        VcEmptyPage: { template: "<div><slot /><slot name='side' /></div>" },
        VcTypography: { template: "<div><slot /></div>" },
        SignInDivider: { template: "<div class='divider'><slot /></div>" },
        IdentityProviders: { name: "IdentityProviders", props: ["providers", "returnUrl"], template: "<div />" },
      },
    },
  });

  await flushPromises();

  return wrapper;
}

describe("sign-in page", () => {
  beforeEach(() => {
    authenticationTypes.value = ["Password"];
    fullPath.value = "/sign-in";
    getReturnUrl.mockClear();
  });

  it("shows the form alone for a store without identity providers", async () => {
    const wrapper = await mountPage();

    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "IdentityProviders" }).exists()).toBe(false);
    expect(wrapper.find(".divider").exists()).toBe(false);
  });

  it("offers the providers next to the form when the store has both", async () => {
    authenticationTypes.value = ["Password", "AzureAD"];

    const wrapper = await mountPage();

    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "IdentityProviders" }).props("providers")).toEqual(["AzureAD"]);
    expect(wrapper.find(".divider").exists()).toBe(true);
  });

  it("shows the providers alone for a store without password authentication", async () => {
    authenticationTypes.value = ["AzureAD", "GoogleSSO"];

    const wrapper = await mountPage();

    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: "IdentityProviders" }).props("providers")).toEqual(["AzureAD", "GoogleSSO"]);
    expect(wrapper.find(".divider").exists()).toBe(false);
  });

  it("resolves the page to come back to from the current route", async () => {
    authenticationTypes.value = ["Password", "AzureAD"];
    fullPath.value = "/sign-in?returnUrl=/account/orders";

    const wrapper = await mountPage();

    expect(getReturnUrl).toHaveBeenCalledWith("/sign-in?returnUrl=/account/orders");
    expect(wrapper.findComponent({ name: "IdentityProviders" }).props("returnUrl")).toBe(
      "resolved:/sign-in?returnUrl=/account/orders",
    );
  });
});
