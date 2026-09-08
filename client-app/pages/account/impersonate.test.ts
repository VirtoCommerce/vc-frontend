import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import ImpersonatePage from "./impersonate.vue";

const isAuthenticated = ref(false);
const operator = ref<{ userName: string } | undefined>(undefined);
const checkPermissions = vi.fn<() => boolean>(() => false);
const impersonateAuthenticated = vi.fn<(userId: string) => Promise<void>>(() => Promise.resolve());
const push = vi.fn();

const identityProviders = ref<string[]>([]);
const hasPasswordAuthentication = ref(true);

vi.mock("@/shared/account", () => ({
  ImpersonateForm: { name: "ImpersonateForm", template: "<form />" },
  useUser: () => ({ isAuthenticated, operator, checkPermissions }),
  useImpersonate: () => ({ impersonateAuthenticated, errors: ref([]) }),
}));

vi.mock("@/shared/sign-in/composables/useIdentityProviders", () => ({
  useIdentityProviders: () => ({
    identityProviders,
    hasPasswordAuthentication,
    hasIdentityProviders: computed(() => identityProviders.value.length > 0),
    hasOnlyIdentityProviders: computed(() => identityProviders.value.length > 0 && !hasPasswordAuthentication.value),
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ fullPath: "/account/impersonate/user-id" }),
  useRouter: () => ({ push }),
}));

vi.mock("@/core/composables", () => ({
  useErrorsTranslator: () => ({ translate: (error: { code?: string }) => error.code }),
  usePageHead: vi.fn(),
}));

function mountPage() {
  return mount(ImpersonatePage, {
    props: { userId: "user-id" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        VcEmptyPage: { template: "<div><slot /><slot name='side' /></div>" },
        VcTypography: { template: "<div><slot /></div>" },
        VcAlert: { name: "VcAlert", template: "<div class='alert'><slot /></div>" },
        VcButton: { name: "VcButton", template: "<button @click='$emit(\"click\")'><slot /></button>" },
        VcLoaderOverlay: true,
        IdentityProviders: { name: "IdentityProviders", props: ["providers", "returnUrl"], template: "<div />" },
        SignInDivider: { template: "<div class='divider'><slot /></div>" },
      },
    },
  });
}

enableAutoUnmount(afterEach);

describe("impersonate page", () => {
  beforeEach(() => {
    isAuthenticated.value = false;
    operator.value = undefined;
    checkPermissions.mockReturnValue(false);
    impersonateAuthenticated.mockClear();
    push.mockClear();
    identityProviders.value = [];
    hasPasswordAuthentication.value = true;
  });

  it("starts the impersonation without verification for an operator that may impersonate", async () => {
    isAuthenticated.value = true;
    checkPermissions.mockReturnValue(true);

    const wrapper = mountPage();
    await flushPromises();

    expect(impersonateAuthenticated).toHaveBeenCalledWith("user-id");
    expect(wrapper.findComponent({ name: "ImpersonateForm" }).exists()).toBe(false);
  });

  it("asks an anonymous operator to verify with the form of a password store", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(impersonateAuthenticated).not.toHaveBeenCalled();
    expect(wrapper.findComponent({ name: "ImpersonateForm" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "IdentityProviders" }).exists()).toBe(false);
  });

  it("offers the providers next to the form when the store has both", async () => {
    identityProviders.value = ["AzureAD"];

    const wrapper = mountPage();
    await flushPromises();

    const providers = wrapper.findComponent({ name: "IdentityProviders" });

    expect(wrapper.findComponent({ name: "ImpersonateForm" }).exists()).toBe(true);
    expect(providers.props("providers")).toEqual(["AzureAD"]);
    expect(wrapper.find(".divider").exists()).toBe(true);
  });

  it("comes back to this page after an external sign in", async () => {
    identityProviders.value = ["AzureAD"];

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findComponent({ name: "IdentityProviders" }).props("returnUrl")).toBe(
      "/account/impersonate/user-id",
    );
  });

  it("offers the providers alone, with a way out, when the store has no password authentication", async () => {
    identityProviders.value = ["AzureAD", "GoogleSSO"];
    hasPasswordAuthentication.value = false;

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findComponent({ name: "ImpersonateForm" }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: "IdentityProviders" }).props("providers")).toEqual(["AzureAD", "GoogleSSO"]);

    await wrapper.find("button").trigger("click");

    expect(push).toHaveBeenCalledWith("/");
  });

  it("starts the impersonation as soon as the operator is authenticated, and only once", async () => {
    checkPermissions.mockReturnValue(true);

    mountPage();
    await flushPromises();

    expect(impersonateAuthenticated).not.toHaveBeenCalled();

    isAuthenticated.value = true;
    await flushPromises();

    expect(impersonateAuthenticated).toHaveBeenCalledOnce();

    isAuthenticated.value = false;
    isAuthenticated.value = true;
    await flushPromises();

    expect(impersonateAuthenticated).toHaveBeenCalledOnce();
  });

  it("starts the impersonation for an operator that is already impersonating someone", async () => {
    isAuthenticated.value = true;
    operator.value = { userName: "support" };

    mountPage();
    await flushPromises();

    expect(impersonateAuthenticated).toHaveBeenCalledWith("user-id");
  });

  it("tells a signed in operator that may not impersonate why the verification is shown again", async () => {
    isAuthenticated.value = true;
    identityProviders.value = ["AzureAD"];
    hasPasswordAuthentication.value = false;

    const wrapper = mountPage();
    await flushPromises();

    expect(impersonateAuthenticated).not.toHaveBeenCalled();
    expect(wrapper.find(".alert").text()).toBe("pages.account.impersonate.no_permission");
  });
});
