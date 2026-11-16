import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import MfaVerifyForm from "./mfa-verify-form.vue";
import type { ICodeSignInResponse } from "@/shared/sign-in/composables/useCodeSignIn";
import type { MfaResendResponseType } from "@/shared/sign-in/composables/useMfaSignIn";

const loading = ref(false);
const verifyCode =
  vi.fn<
    (
      email: string,
      twoFactorToken: string,
      code: string,
      options: { onVerified: () => Promise<void>; trackAnalytics?: boolean },
    ) => Promise<ICodeSignInResponse | undefined>
  >();
const onVerified = vi.fn(() => Promise.resolve());
const resendCode = vi.fn<(twoFactorToken: string, provider?: string) => Promise<MfaResendResponseType | undefined>>();
const signInErrors = ref<{ code?: string; description?: string }[] | undefined>();
const resetSignInErrors = vi.fn(() => {
  signInErrors.value = undefined;
});
const handleError = vi.fn();

vi.mock("@/shared/sign-in/composables/useMfaSignIn", () => ({
  useMfaSignIn: () => ({ loading, verifyCode, resendCode, signInErrors, resetSignInErrors, handleError }),
}));

vi.mock("@/core/composables", () => ({
  useErrorsTranslator: () => ({
    translate: (error: { description?: string } | undefined) => error?.description,
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/shared/common", () => ({
  ContactAdministratorLink: {
    name: "ContactAdministratorLink",
    template: `<a href="/contacts">contact administrator</a>`,
  },
}));

const stubs = {
  VcButton: {
    name: "VcButton",
    props: ["loading", "disabled"],
    template: `<button :disabled="disabled || loading"><slot /></button>`,
  },
  VcAlert: {
    template: `<div class="vc-alert"><slot /></div>`,
  },
};

function mountForm(challenge: Record<string, unknown> = {}, props: Record<string, unknown> = {}) {
  return mount(MfaVerifyForm, {
    props: {
      email: "buyer@acme.com",
      challenge: {
        twoFactorToken: "token-1",
        provider: "Email",
        providers: [{ name: "Email", destination: "b•••r@acme.com" }],
        ...challenge,
      },
      onVerified,
      ...props,
    },
    global: {
      mocks: {
        $t: (key: string, params?: Record<string, string>) => (params ? `${key} ${JSON.stringify(params)}` : key),
      },
      stubs,
    },
  });
}

async function typeCode(wrapper: ReturnType<typeof mountForm>, code: string) {
  await wrapper.find('[data-test-id="mfa-code-input"]').setValue(code);
  await flushPromises();
}

describe("MfaVerifyForm", () => {
  beforeEach(() => {
    loading.value = false;
    verifyCode.mockReset();
    resendCode.mockReset();
    handleError.mockReset();
    resetSignInErrors.mockClear();
    signInErrors.value = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows where the code was sent", () => {
    const wrapper = mountForm();

    expect(wrapper.find('[data-test-id="mfa-subtitle"]').text()).toContain("b•••r@acme.com");
  });

  it("shows the destination of the provider the code was sent with", () => {
    const wrapper = mountForm({
      provider: "Sms",
      providers: [
        { name: "Email", destination: "b•••r@acme.com" },
        { name: "Sms", destination: "+1•••89" },
      ],
    });

    expect(wrapper.find('[data-test-id="mfa-subtitle"]').text()).toContain("+1•••89");
  });

  it("auto-submits once 6 digits are entered and verifies the code with the two-factor token", async () => {
    verifyCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(verifyCode).toHaveBeenCalledWith("buyer@acme.com", "token-1", "123456", {
      onVerified,
      trackAnalytics: true,
    });
    expect(handleError).not.toHaveBeenCalled();
  });

  it("does not submit an incomplete code", async () => {
    const wrapper = mountForm();
    await typeCode(wrapper, "123");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(verifyCode).not.toHaveBeenCalled();
  });

  it("handles a failed verification and clears the code", async () => {
    const result = { succeeded: false, error: { code: "invalid_code" } };
    verifyCode.mockResolvedValue(result);

    const wrapper = mountForm();
    await typeCode(wrapper, "000000");

    expect(handleError).toHaveBeenCalledWith(result, expect.any(Function));
    expect((wrapper.find('[data-test-id="mfa-code-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("uses the token returned by a resend for the next verification", async () => {
    resendCode.mockResolvedValue({
      succeeded: true,
      twoFactorToken: "token-2",
      provider: "Email",
      providers: [{ name: "Email", destination: "b•••r@acme.com" }],
    });
    verifyCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();
    await typeCode(wrapper, "123456");

    expect(resendCode).toHaveBeenCalledWith("token-1", "Email");
    expect(verifyCode).toHaveBeenCalledWith("buyer@acme.com", "token-2", "123456", expect.anything());
  });

  it("handles a failed resend", async () => {
    const result = { succeeded: false, error: { code: "invalid_two_factor_token" } };
    resendCode.mockResolvedValue(result);

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();

    expect(handleError).toHaveBeenCalledWith(result, expect.any(Function));
  });

  it("resends the code with the provider the last code was sent with", async () => {
    resendCode.mockResolvedValue({ succeeded: true, twoFactorToken: "token-2", provider: "Sms" });

    const wrapper = mountForm({ provider: "Sms" });
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();

    expect(resendCode).toHaveBeenNthCalledWith(1, "token-1", "Sms");
    expect(resendCode).toHaveBeenNthCalledWith(2, "token-2", "Sms");
  });

  it("counts down the resend interval of the challenge", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const wrapper = mountForm({ resendSecondsRemaining: 30 });
    const resendButton = wrapper.find('[data-test-id="mfa-resend-button"]');

    expect(resendButton.attributes("disabled")).toBeDefined();
    expect(resendButton.text()).toBe('shared.sign_in.sign_in_code_form.resend_countdown {"seconds":30}');

    vi.advanceTimersByTime(30_000);
    await flushPromises();

    expect(resendButton.attributes("disabled")).toBeUndefined();
  });

  it("restarts the countdown after a resend", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    resendCode.mockResolvedValue({
      succeeded: true,
      twoFactorToken: "token-2",
      provider: "Email",
      resendSecondsRemaining: 30,
    });

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test-id="mfa-resend-button"]').text()).toBe(
      'shared.sign_in.sign_in_code_form.resend_countdown {"seconds":30}',
    );
  });

  it("only waits for the resend when a code has just been sent", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    resendCode.mockResolvedValue({ succeeded: false, error: { code: "resend_too_soon" }, resendSecondsRemaining: 12 });

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="mfa-resend-button"]').trigger("click");
    await flushPromises();

    expect(handleError).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test-id="mfa-resend-button"]').text()).toBe(
      'shared.sign_in.sign_in_code_form.resend_countdown {"seconds":12}',
    );
  });

  it("emits back when the customer returns to the password form", async () => {
    const wrapper = mountForm();
    const backButton = wrapper.find('[data-test-id="mfa-back-button"]');
    await backButton.trigger("click");

    expect(backButton.text()).toBe("shared.sign_in.mfa_verify_form.back_link");
    expect(wrapper.emitted("back")).toHaveLength(1);
  });

  it("shows the back label it is given", () => {
    const wrapper = mountForm({}, { backLabel: "Cancel" });

    expect(wrapper.find('[data-test-id="mfa-back-button"]').text()).toBe("Cancel");
  });

  it("shows the sign-in errors", () => {
    signInErrors.value = [{ code: "invalid_code", description: "That code didn't work." }];

    const wrapper = mountForm();

    expect(wrapper.find('[data-test-id="mfa-error-alert"]').text()).toContain("That code didn't work.");
    expect(wrapper.find(".sign-in-code-input--error").exists()).toBe(true);
  });
});
