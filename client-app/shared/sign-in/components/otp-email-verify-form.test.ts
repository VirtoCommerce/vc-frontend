import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import OtpEmailVerifyForm from "./otp-email-verify-form.vue";
import type { IOtpRequestResponse, IOtpVerifyResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const loading = ref(false);
const verifyCode = vi.fn<(email: string, code: string) => Promise<IOtpVerifyResponse | undefined>>();
const requestCode = vi.fn<(email: string) => Promise<IOtpRequestResponse | undefined>>();
const signInErrors = ref<{ code?: string; description: string }[] | undefined>();
const resetSignInErrors = vi.fn(() => {
  signInErrors.value = undefined;
});
const showError = vi.fn((error?: { code?: string; description: string }) => {
  signInErrors.value = [error ?? { description: "common.messages.something_went_wrong" }];
});

vi.mock("@/shared/sign-in/composables/useOtpSignIn", () => ({
  useOtpSignIn: () => ({ loading, verifyCode, requestCode, signInErrors, resetSignInErrors, showError }),
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
    template: `<div class="vc-alert"><slot /></div>`,
  },
};

function mountForm() {
  return mount(OtpEmailVerifyForm, {
    props: { email: "buyer@acme.com", maskedEmail: "b***r@acme.com" },
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });
}

function codeInput(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.find('[data-test-id="otp-email-code-input"]');
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

describe("OtpEmailVerifyForm", () => {
  beforeEach(() => {
    loading.value = false;
    verifyCode.mockReset();
    requestCode.mockReset();
    signInErrors.value = undefined;
    resetSignInErrors.mockClear();
  });

  it("auto-submits once 6 digits are entered and verifies the code", async () => {
    verifyCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(verifyCode).toHaveBeenCalledWith("buyer@acme.com", "123456");
  });

  it("sends the code only once while it is being verified", async () => {
    let finishVerify: (result: IOtpVerifyResponse) => void = () => {};
    verifyCode.mockImplementation(() => {
      loading.value = true;
      return new Promise((resolve) => {
        finishVerify = resolve;
      });
    });

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("123456");
    await wrapper.find("form").trigger("submit");
    await codeInput(wrapper).setValue("1234567");
    await flushPromises();

    expect(verifyCode).toHaveBeenCalledOnce();

    loading.value = false;
    finishVerify({ succeeded: true });
    await flushPromises();
  });

  it("clears any previous sign-in error before a new verify attempt", async () => {
    signInErrors.value = [{ code: "user_not_found", description: "stale error" }];
    verifyCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(resetSignInErrors).toHaveBeenCalled();
  });

  it("shows the server error only in the sign-in alert and marks the code field", async () => {
    const error = { code: "invalid_code", description: "The code is invalid." };

    verifyCode.mockImplementation(() => {
      signInErrors.value = [error];
      return Promise.resolve({ succeeded: false, error });
    });

    const wrapper = mountForm();
    await typeCode(wrapper, "000000");

    expect(wrapper.findAll('[role="alert"]').map((alert) => alert.text())).toEqual(["The code is invalid."]);
    expect(wrapper.find(".otp-email-verify-form__field--error").exists()).toBe(true);
  });

  it("clears a rejected code so the next keystroke cannot resubmit it", async () => {
    verifyCode.mockResolvedValue({ succeeded: false, error: { code: "invalid_code", description: "Wrong code." } });

    const wrapper = mountForm();
    await typeCode(wrapper, "111111");

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("");

    await codeInput(wrapper).setValue("1");
    await flushPromises();

    expect(verifyCode).toHaveBeenCalledTimes(1);
  });

  it("replaces the typed digits with a pasted code instead of appending it", async () => {
    verifyCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("12");
    await codeInput(wrapper).trigger("paste", {
      clipboardData: { getData: () => "Your code: 418302" },
    });
    await flushPromises();

    expect(verifyCode).toHaveBeenCalledOnce();
    expect(verifyCode).toHaveBeenCalledWith("buyer@acme.com", "418302");
  });

  it("points the code field at the error so screen readers announce it", async () => {
    verifyCode.mockImplementation(() => {
      signInErrors.value = [{ code: "invalid_code", description: "Wrong code." }];
      return Promise.resolve({ succeeded: false, error: { code: "invalid_code", description: "Wrong code." } });
    });

    const wrapper = mountForm();
    expect(codeInput(wrapper).attributes("aria-describedby")).toBe("otp-email-hint");

    await typeCode(wrapper, "111111");

    const errorRegion = wrapper.find("#otp-email-code-error");
    expect(errorRegion.attributes("role")).toBe("alert");
    expect(errorRegion.text()).toBe("Wrong code.");
    expect(codeInput(wrapper).attributes("aria-describedby")).toBe("otp-email-code-error otp-email-hint");
  });

  it("emits disabled when the module became disabled", async () => {
    verifyCode.mockResolvedValue({ succeeded: false, error: { code: "otp_disabled" } });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(wrapper.emitted("disabled")).toBeTruthy();
  });

  it("emits locked with the error and the remaining lockout seconds", async () => {
    verifyCode.mockResolvedValue({
      succeeded: false,
      error: { code: "user_is_temporary_locked_out" },
      lockoutSecondsRemaining: 42,
    });

    const wrapper = mountForm();
    await typeCode(wrapper, "123456");

    expect(wrapper.emitted("locked")).toEqual([[{ code: "user_is_temporary_locked_out" }, 42]]);
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

  it("resend: reports success and clears the code only when the code was sent", async () => {
    requestCode.mockResolvedValue({ succeeded: true });

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("11111");

    await wrapper.find('[data-test-id="otp-email-resend-button"]').trigger("click");
    await flushPromises();

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("");
    expect(wrapper.find("[aria-live='polite']").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.verify.live_resent",
    );
  });

  it("resend: does not report success and keeps the code when the request actually failed", async () => {
    requestCode.mockResolvedValue(undefined);

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("11111");

    await wrapper.find('[data-test-id="otp-email-resend-button"]').trigger("click");
    await flushPromises();

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("11111");
    expect(wrapper.find("[aria-live='polite']").text()).toBe("");
    expect(wrapper.find('[role="alert"]').text()).toBe("common.messages.something_went_wrong");
  });

  it("resend: shows the translated server error and keeps the code", async () => {
    requestCode.mockResolvedValue({
      succeeded: false,
      error: { code: "user_not_found", description: "User not found." },
    });

    const wrapper = mountForm();
    await codeInput(wrapper).setValue("11111");

    await wrapper.find('[data-test-id="otp-email-resend-button"]').trigger("click");
    await flushPromises();

    expect((codeInput(wrapper).element as HTMLInputElement).value).toBe("11111");
    expect(wrapper.find("[aria-live='polite']").text()).toBe("");
    expect(wrapper.find('[role="alert"]').text()).toBe("User not found.");
  });

  it("resend: emits disabled when the module became disabled", async () => {
    requestCode.mockResolvedValue({ succeeded: false, error: { code: "otp_disabled" } });

    const wrapper = mountForm();
    await wrapper.find('[data-test-id="otp-email-resend-button"]').trigger("click");
    await flushPromises();

    expect(wrapper.emitted("disabled")).toBeTruthy();
  });

  it("focuses the code input once mounted", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const wrapper = mount(OtpEmailVerifyForm, {
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
