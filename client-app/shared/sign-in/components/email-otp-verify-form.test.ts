import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import EmailOtpVerifyForm from "./email-otp-verify-form.vue";
import type { IOtpRequestResponse, IOtpVerifyResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const loading = ref(false);
const verifyCode = vi.fn<(email: string, code: string) => Promise<IOtpVerifyResponse | undefined>>();
const requestCode = vi.fn<(email: string) => Promise<IOtpRequestResponse | undefined>>();
const signInErrors = ref<{ code: string; description: string }[] | undefined>();
const resetSignInErrors = vi.fn(() => {
  signInErrors.value = undefined;
});

vi.mock("@/shared/sign-in/composables/useOtpSignIn", () => ({
  useOtpSignIn: () => ({ loading, verifyCode, requestCode, signInErrors, resetSignInErrors }),
}));

vi.mock("@/core/composables", () => ({
  useErrorsTranslator: () => ({
    translate: (error: { description: string } | undefined) => error?.description,
  }),
}));

vi.mock("@/core/utilities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/utilities")>();
  return { ...actual, Logger: { ...actual.Logger, error: vi.fn() } };
});

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
    template: `<div role="alert"><slot /></div>`,
  },
};

function mountForm() {
  return mount(EmailOtpVerifyForm, {
    props: { email: "buyer@acme.com", maskedEmail: "b***r@acme.com" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });
}

function codeInput(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.find('[data-test-id="email-otp-code-input"]');
}

async function typeCode(wrapper: ReturnType<typeof mountForm>, code: string) {
  await codeInput(wrapper).setValue(code);
  await vi.waitFor(async () => {
    await flushPromises();
    if (!verifyCode.mock.calls.length) {
      throw new Error("verifyCode not called yet");
    }
  });
  await flushPromises();
}

describe("EmailOtpVerifyForm", () => {
  beforeEach(() => {
    loading.value = false;
    verifyCode.mockReset();
    requestCode.mockReset();
    signInErrors.value = undefined;
    resetSignInErrors.mockClear();
  });

  it("auto-submits once 6 digits are entered and verifies the code", async () => {
    verifyCode.mockResolvedValue({ outcome: "Success" });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(verifyCode).toHaveBeenCalledWith("buyer@acme.com", "123456");
  });

  it("clears any previous sign-in error before a new verify attempt", async () => {
    signInErrors.value = [{ code: "user_not_found", description: "stale error" }];
    verifyCode.mockResolvedValue({ outcome: "Success" });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(resetSignInErrors).toHaveBeenCalled();
  });

  it("shows an inline error and re-selects the code on InvalidCode", async () => {
    verifyCode.mockResolvedValue({ outcome: "InvalidCode" });

    const wrapper = mountForm();
    await typeCode(wrapper, "000000");

    expect(wrapper.find("#email-otp-message").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.verify.errors.invalid_code",
    );
  });

  it("emits disabled when the module became disabled", async () => {
    verifyCode.mockResolvedValue({ outcome: "Disabled" });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(wrapper.emitted("disabled")).toBeTruthy();
  });

  it("emits locked with the remaining lockout seconds", async () => {
    verifyCode.mockResolvedValue({ outcome: "Locked", lockoutSecondsRemaining: 42 });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(wrapper.emitted("locked")).toEqual([[42]]);
  });

  it("shows a generic error when verifyCode throws", async () => {
    verifyCode.mockRejectedValue(new Error("boom"));

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(wrapper.find("#email-otp-message").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.verify.errors.generic",
    );
  });

  it("shows sign-in errors with a contact-administrator link for a lockout error", () => {
    signInErrors.value = [{ code: "user_is_locked_out", description: "You are blocked" }];

    const wrapper = mountForm();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.text()).toContain("You are blocked");
    expect(alert.find("a").exists()).toBe(true);
  });

  it("shows sign-in errors without a contact-administrator link for a non-lockout error", () => {
    signInErrors.value = [{ code: "user_not_found", description: "User not found" }];

    const wrapper = mountForm();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.text()).toBe("User not found");
    expect(alert.find("a").exists()).toBe(false);
  });

  it("resend: reports success and clears the code only when the outcome is Sent", async () => {
    requestCode.mockResolvedValue({ outcome: "Sent" });

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("11111");

    await wrapper.find('[data-test-id="email-otp-resend-button"]').trigger("click");
    await flushPromises();

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("");
    expect(wrapper.find("[aria-live='polite']").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.verify.live_resent",
    );
  });

  it("resend: does not report success and keeps the code when the request actually failed", async () => {
    // A failed useFetch call resolves to undefined rather than throwing — this must not
    // be mistaken for a successful resend (that was the original, critical bug).
    requestCode.mockResolvedValue(undefined);

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("11111");

    await wrapper.find('[data-test-id="email-otp-resend-button"]').trigger("click");
    await flushPromises();

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("11111");
    expect(wrapper.find("[aria-live='polite']").text()).toBe("");
    expect(wrapper.find("#email-otp-message").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.verify.errors.generic",
    );
  });

  it("resend: emits disabled when the module became disabled", async () => {
    requestCode.mockResolvedValue({ outcome: "Disabled" });

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="email-otp-resend-button"]').trigger("click");
    await flushPromises();

    expect(wrapper.emitted("disabled")).toBeTruthy();
  });

  it("focuses the code input once mounted", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const wrapper = mount(EmailOtpVerifyForm, {
      attachTo: container,
      props: { email: "buyer@acme.com", maskedEmail: "b***r@acme.com" },
      global: {
        mocks: { $t: (key: string) => key },
        stubs,
      },
    });
    await flushPromises();

    expect(document.activeElement).toBe(codeInput(wrapper).element);

    wrapper.unmount();
    container.remove();
  });
});
