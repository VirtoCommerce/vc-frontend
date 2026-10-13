import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import ImpersonateForm from "./impersonate-form.vue";

type StepType = "idle" | "verify" | "impersonate" | "success";

const step = ref<StepType>("idle");
const errors = ref<{ code?: string }[]>([]);
const twoFactorChallenge = ref<{ twoFactorToken: string; providers?: { name: string }[] }>();
const impersonate = vi.fn<(email: string, password: string, targetUserId: string) => Promise<void>>();
const impersonateAuthenticated = vi.fn<(targetUserId: string) => Promise<void>>();
const resetState = vi.fn();
const failTwoFactor = vi.fn<(error: { code?: string }) => void>();

vi.mock("@/shared/account/composables", () => ({
  useImpersonate: () => ({
    impersonate,
    impersonateAuthenticated,
    loading: computed(() => step.value === "verify" || step.value === "impersonate"),
    step,
    errors,
    twoFactorChallenge,
    resetState,
    failTwoFactor,
  }),
}));

vi.mock("@/core/composables", () => ({
  useErrorsTranslator: () => ({
    translate: (error: { code?: string } | undefined) => error?.code,
  }),
}));

vi.mock("@/shared/sign-in/components/mfa-verify-form.vue", () => ({
  default: {
    name: "MfaVerifyForm",
    props: ["email", "challenge", "onVerified", "backLabel", "trackAnalytics"],
    emits: ["back", "failed"],
    template: `<div data-test-id="mfa-verify-form" />`,
  },
}));

const stubs = {
  VcAlert: { template: `<div data-test-id="impersonate-error"><slot /></div>` },
  VcInput: { props: ["modelValue"], template: `<input />` },
  VcButton: { template: `<button><slot /></button>` },
};

function mountForm() {
  return mount(ImpersonateForm, {
    props: { targetUserId: "target-user" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });
}

function requireSecondFactor() {
  twoFactorChallenge.value = { twoFactorToken: "token-1", providers: [{ name: "Email" }] };
}

describe("ImpersonateForm", () => {
  beforeEach(() => {
    step.value = "idle";
    errors.value = [];
    twoFactorChallenge.value = undefined;
    impersonateAuthenticated.mockReset();
    failTwoFactor.mockReset();
  });

  it("asks the operator for the code when the store requires a second factor", () => {
    requireSecondFactor();

    const wrapper = mountForm();

    const mfaForm = wrapper.findComponent({ name: "MfaVerifyForm" });
    expect(mfaForm.exists()).toBe(true);
    expect(mfaForm.props()).toMatchObject({
      challenge: { twoFactorToken: "token-1", providers: [{ name: "Email" }] },
      backLabel: "shared.account.impersonate_form.cancel_button",
      trackAnalytics: false,
    });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("keeps the code form while the impersonation completes", () => {
    requireSecondFactor();
    step.value = "impersonate";

    const wrapper = mountForm();

    expect(wrapper.findComponent({ name: "MfaVerifyForm" }).exists()).toBe(true);
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("continues the impersonation once the code is verified", async () => {
    requireSecondFactor();
    impersonateAuthenticated.mockImplementation(() => {
      step.value = "success";
      return Promise.resolve();
    });

    const wrapper = mountForm();
    await wrapper.findComponent({ name: "MfaVerifyForm" }).props("onVerified")();
    await flushPromises();

    expect(impersonateAuthenticated).toHaveBeenCalledWith("target-user");
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("closes the dialog when the operator cancels the code step", async () => {
    requireSecondFactor();

    const wrapper = mountForm();
    wrapper.findComponent({ name: "MfaVerifyForm" }).vm.$emit("back");
    await flushPromises();

    expect(wrapper.emitted("cancel")).toHaveLength(1);
    expect(failTwoFactor).not.toHaveBeenCalled();
  });

  it("returns to the password step with the error when the code step fails", async () => {
    requireSecondFactor();
    const error = { code: "user_is_temporary_locked_out" };

    const wrapper = mountForm();
    wrapper.findComponent({ name: "MfaVerifyForm" }).vm.$emit("failed", error);
    await flushPromises();

    expect(failTwoFactor).toHaveBeenCalledWith(error);
  });
});
