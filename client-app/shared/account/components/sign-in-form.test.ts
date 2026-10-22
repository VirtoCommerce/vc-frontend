import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import SignInForm from "./sign-in-form.vue";

type IdentityErrorMockType = { code?: string; description?: string };

const authorize = vi.fn<(email: string, password: string) => Promise<void>>();
const twoFactorToken = ref<string>();
const twoFactorProviders = ref<{ name: string; destination?: string }[]>();
const analytics = vi.fn();

const signIn = vi.fn<() => Promise<void>>();
const errors = ref<IdentityErrorMockType[]>();
const resetErrors = vi.fn(() => {
  errors.value = [];
});

vi.mock("@/core/composables", () => ({
  useAuth: () => ({
    authorize,
    twoFactorChallenge: computed(() =>
      errors.value?.some((error) => error.code === "two_factor_required") && twoFactorToken.value
        ? { twoFactorToken: twoFactorToken.value, provider: "Email", providers: twoFactorProviders.value }
        : undefined,
    ),
  }),
  useAnalytics: () => ({ analytics }),
  useErrorsTranslator: () => ({
    translate: (error: IdentityErrorMockType | undefined) => error?.code,
  }),
}));

vi.mock("@/shared/account/composables", () => ({
  useSignMeIn: () => ({ errors, loading: ref(false), signIn, resetErrors }),
}));

vi.mock("@/shared/common", () => ({
  ContactAdministratorLink: { template: `<a href="/contacts">contact administrator</a>` },
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
  VcAlert: { template: `<div data-test-id="sign-in-error-alert"><slot /></div>` },
  VcInput: {
    props: ["modelValue", "testIdInput"],
    emits: ["update:modelValue"],
    template: `<input :data-test-id="testIdInput" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
  },
  VcCheckbox: { template: `<label><slot /></label>` },
  VcButton: { template: `<button><slot /></button>` },
  RouterLink: { template: `<a><slot /></a>` },
};

function mountForm(attrs: Record<string, unknown> = {}) {
  return mount(SignInForm, {
    attrs,
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });
}

async function submit(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.find('[data-test-id="email-input"]').setValue("buyer@acme.com");
  await wrapper.find('[data-test-id="password-input"]').setValue("secret");
  await wrapper.find("form").trigger("submit");
  await vi.waitFor(() => expect(authorize).toHaveBeenCalled());
  await flushPromises();
}

async function respondWithError(code: string) {
  await flushPromises();
  errors.value = [{ code }];
  throw new Error("400");
}

function requireSecondFactor() {
  authorize.mockImplementation(() => {
    twoFactorToken.value = "token-1";
    twoFactorProviders.value = [{ name: "Email", destination: "b•••r@acme.com" }];
    return respondWithError("two_factor_required");
  });
}

describe("SignInForm", () => {
  beforeEach(() => {
    authorize.mockReset();
    signIn.mockReset();
    analytics.mockReset();
    resetErrors.mockClear();
    errors.value = undefined;
    twoFactorToken.value = undefined;
    twoFactorProviders.value = undefined;
  });

  it("signs in when the password is enough", async () => {
    authorize.mockResolvedValue(undefined);

    const wrapper = mountForm();
    await submit(wrapper);

    expect(authorize).toHaveBeenCalledWith("buyer@acme.com", "secret");
    expect(signIn).toHaveBeenCalledOnce();
    expect(wrapper.find('[data-test-id="mfa-verify-form"]').exists()).toBe(false);
  });

  it("asks for the code when the store requires a second factor", async () => {
    requireSecondFactor();

    const wrapper = mountForm();
    await submit(wrapper);

    const mfaForm = wrapper.findComponent({ name: "MfaVerifyForm" });
    expect(mfaForm.exists()).toBe(true);
    expect(mfaForm.props("email")).toBe("buyer@acme.com");
    expect(mfaForm.props("challenge")).toEqual({
      twoFactorToken: "token-1",
      provider: "Email",
      providers: [{ name: "Email", destination: "b•••r@acme.com" }],
    });
    expect(signIn).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test-id="sign-in-error-alert"]').exists()).toBe(false);
    expect(analytics).not.toHaveBeenCalled();
    expect(wrapper.emitted("stepChanged")).toEqual([["two-factor"]]);
  });

  it("completes the sign-in once the code is verified", async () => {
    requireSecondFactor();

    const wrapper = mountForm();
    await submit(wrapper);
    await wrapper.findComponent({ name: "MfaVerifyForm" }).props("onVerified")();
    await flushPromises();

    expect(signIn).toHaveBeenCalledOnce();
  });

  it("returns to the password form when the customer goes back", async () => {
    requireSecondFactor();

    const wrapper = mountForm();
    await submit(wrapper);
    wrapper.findComponent({ name: "MfaVerifyForm" }).vm.$emit("back");
    await flushPromises();

    expect(wrapper.find('[data-test-id="mfa-verify-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-test-id="password-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="sign-in-error-alert"]').exists()).toBe(false);
  });

  it.each(["invalid_two_factor_token", "user_is_temporary_locked_out", "mfa_provider_not_available"])(
    "returns to the password form with the error when the code step fails with %s",
    async (code) => {
      requireSecondFactor();

      const wrapper = mountForm();
      await submit(wrapper);
      wrapper.findComponent({ name: "MfaVerifyForm" }).vm.$emit("failed", { code });
      await flushPromises();

      expect(wrapper.find('[data-test-id="mfa-verify-form"]').exists()).toBe(false);
      expect(wrapper.find('[data-test-id="sign-in-error-alert"]').text()).toContain(code);
      expect(wrapper.emitted("stepChanged")).toEqual([["two-factor"], ["password"]]);
    },
  );

  it("reports the password step when it is removed during the code step", async () => {
    requireSecondFactor();

    const onStepChanged = vi.fn();

    const wrapper = mountForm({ onStepChanged });
    await submit(wrapper);
    wrapper.unmount();

    expect(onStepChanged.mock.calls).toEqual([["two-factor"], ["password"]]);
  });

  it("shows the error when the password is wrong", async () => {
    authorize.mockImplementation(() => respondWithError("login_failed"));

    const wrapper = mountForm();
    await submit(wrapper);

    expect(wrapper.find('[data-test-id="mfa-verify-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-test-id="sign-in-error-alert"]').text()).toBe("login_failed");
  });

  // One login event per attempt: GA counts these, and the Sales Rep hub counts the successes as sign-ins.
  describe("login event", () => {
    // The token request both throws and fills the identity errors on a 400.
    it("reports a wrong password once, with the identity errors", async () => {
      authorize.mockImplementation(async () => {
        await flushPromises();
        errors.value = [{ code: "invalid_grant", description: "The login or password is incorrect." }];
        throw new Error("Bad Request");
      });

      await submit(mountForm());

      expect(analytics.mock.calls).toEqual([
        ["login", "password", { success: false, errors: "invalid_grant: The login or password is incorrect." }],
      ]);
    });

    it("reports a sign-in that threw once, as a failure", async () => {
      authorize.mockRejectedValue(new Error("Failed to fetch"));

      await submit(mountForm());

      expect(analytics.mock.calls).toEqual([["login", "password", { success: false, errors: "Failed to fetch" }]]);
    });

    it("reports a sign-in that went through as a success", async () => {
      authorize.mockResolvedValue(undefined);

      await submit(mountForm());

      expect(analytics.mock.calls).toEqual([["login", "password", { success: true }]]);
    });
  });
});
