import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import OtpEmailSignInForm from "./otp-email-sign-in-form.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: { value: "en" } }),
}));

const resetErrors = vi.fn();

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ resetErrors }),
}));

vi.mock("@/core/composables/useErrorsTranslator", () => ({
  useErrorsTranslator: () => ({
    translate: (error: { description: string }) => error.description,
  }),
}));

const temporaryLockout = { code: "user_is_temporary_locked_out", description: "Temporarily locked." };
const permanentLockout = { code: "user_is_locked_out", description: "Blocked." };

vi.mock("@/shared/common", () => ({
  ContactAdministratorLink: {
    name: "ContactAdministratorLink",
    template: `<a href="/contacts">contact administrator</a>`,
  },
}));

const focusEmail = vi.fn();

vi.mock("./otp-email-request-form.vue", () => ({
  default: {
    name: "OtpEmailRequestForm",
    emits: ["succeeded", "disabled"],
    setup(_props: unknown, { expose }: { expose: (exposed: Record<string, unknown>) => void }) {
      expose({ focus: focusEmail });
    },
    template: `<div class="stub-request-form" />`,
  },
}));

vi.mock("./otp-email-verify-form.vue", () => ({
  default: {
    name: "OtpEmailVerifyForm",
    props: ["email", "maskedEmail"],
    emits: ["useDifferentEmail", "disabled", "locked"],
    template: `<div class="stub-verify-form" />`,
  },
}));

const stubs = {
  VcButton: {
    name: "VcButton",
    props: ["disabled"],
    template: `<button :disabled="disabled"><slot /></button>`,
  },
};

function translate(key: string, params?: Record<string, unknown>) {
  if (!params) {
    return key;
  }
  return `${key} ${Object.values(params).join(" ")}`;
}

function mountForm(hasPasswordAuthentication = true) {
  return mount(OtpEmailSignInForm, {
    props: { hasPasswordAuthentication },
    attachTo: document.body,
    global: {
      mocks: { $t: translate },
      stubs,
    },
  });
}

function requestForm(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.findComponent({ name: "OtpEmailRequestForm" });
}

function verifyForm(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.findComponent({ name: "OtpEmailVerifyForm" });
}

describe("OtpEmailSignInForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the request step and reports it", () => {
    const wrapper = mountForm();

    expect(requestForm(wrapper).exists()).toBe(true);
    expect(wrapper.emitted("stepChanged")?.[0]).toEqual(["request"]);
  });

  it("moves to the verify step once a code was requested, passing the email through", async () => {
    const wrapper = mountForm();

    await requestForm(wrapper).vm.$emit("succeeded", {
      email: "buyer@acme.com",
      result: { succeeded: true, maskedEmail: "b***r@acme.com" },
    });

    expect(verifyForm(wrapper).exists()).toBe(true);
    expect(verifyForm(wrapper).props()).toMatchObject({ email: "buyer@acme.com", maskedEmail: "b***r@acme.com" });
    expect(wrapper.emitted("stepChanged")?.at(-1)).toEqual(["verify"]);
  });

  it("falls back to the raw email as the masked email when the backend doesn't send one", async () => {
    const wrapper = mountForm();

    await requestForm(wrapper).vm.$emit("succeeded", {
      email: "buyer@acme.com",
      result: { succeeded: true },
    });

    expect(verifyForm(wrapper).props("maskedEmail")).toBe("buyer@acme.com");
  });

  it("focuses the email field only when the user comes back to the request step", async () => {
    focusEmail.mockClear();
    const wrapper = mountForm();
    await flushPromises();
    expect(focusEmail).not.toHaveBeenCalled();

    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });
    await verifyForm(wrapper).vm.$emit("useDifferentEmail");
    await flushPromises();

    expect(focusEmail).toHaveBeenCalledOnce();
  });

  it("goes back to the request step from verify when the user asks for a different email", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", {
      email: "buyer@acme.com",
      result: { succeeded: true },
    });

    await verifyForm(wrapper).vm.$emit("useDifferentEmail");

    expect(requestForm(wrapper).exists()).toBe(true);
  });

  it("shows the generic terminal and focuses its heading when a step reports disabled", async () => {
    const wrapper = mountForm();

    await requestForm(wrapper).vm.$emit("disabled");
    await flushPromises();

    expect(wrapper.find(".otp-email-sign-in-form__terminal-title").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.disabled.title",
    );
    expect(document.activeElement).toBe(wrapper.find(".otp-email-sign-in-form__terminal-title").element);
    expect(wrapper.find(".otp-email-sign-in-form__terminal-text").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.disabled.text",
    );
  });

  it("returns from the generic terminal to the request step", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("disabled");

    await wrapper.find(".otp-email-sign-in-form__terminal-footer button").trigger("click");

    expect(requestForm(wrapper).exists()).toBe(true);
  });

  it("shows the platform text with a countdown and re-enables the retry button at zero", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });

    await verifyForm(wrapper).vm.$emit("locked", temporaryLockout, 5);

    const texts = () => wrapper.findAll(".otp-email-sign-in-form__terminal-text").map((text) => text.text());

    expect(wrapper.find(".otp-email-sign-in-form__terminal-title").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.locked.title",
    );
    expect(texts()[0]).toBe("Temporarily locked.");
    expect(texts()[1]).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_countdown 5s");
    expect(wrapper.findComponent({ name: "VcButton" }).props("disabled")).toBe(true);

    await vi.advanceTimersByTimeAsync(5000);

    expect(texts()[1]).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_ready");
    expect(wrapper.findComponent({ name: "VcButton" }).props("disabled")).toBe(false);
  });

  it("shows the remaining lockout as a duration in hours, minutes or seconds", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });

    await verifyForm(wrapper).vm.$emit("locked", temporaryLockout, 2 * 3600 + 29 * 60 + 30);

    const countdown = () => wrapper.findAll(".otp-email-sign-in-form__terminal-text")[1].text();
    expect(countdown()).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_countdown 2h 30m");

    await vi.advanceTimersByTimeAsync((29 * 60 + 30) * 1000);
    expect(countdown()).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_countdown 2h");

    await vi.advanceTimersByTimeAsync(90 * 60 * 1000);
    expect(countdown()).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_countdown 30m");

    await vi.advanceTimersByTimeAsync((29 * 60 + 15) * 1000);
    expect(countdown()).toBe("shared.sign_in.otp_email_sign_in_form.locked.text_countdown 45s");
  });

  it("shows the platform text and the contact administrator link for a permanent lockout", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });

    await verifyForm(wrapper).vm.$emit("locked", permanentLockout, 2147483647);

    expect(wrapper.find(".otp-email-sign-in-form__terminal-title").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.locked.title_blocked",
    );
    expect(wrapper.findAll(".otp-email-sign-in-form__terminal-text")).toHaveLength(1);
    expect(wrapper.find(".otp-email-sign-in-form__terminal-text").text()).toContain("Blocked.");
    expect(wrapper.findComponent({ name: "ContactAdministratorLink" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
  });

  it("clears the sign-in errors when Try again returns to the request step", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });
    await verifyForm(wrapper).vm.$emit("locked", temporaryLockout, 0);
    resetErrors.mockClear();

    await wrapper.findComponent({ name: "VcButton" }).trigger("click");

    expect(requestForm(wrapper).exists()).toBe(true);
    expect(resetErrors).toHaveBeenCalled();
  });

  it("shows only the platform text when the remaining time is unknown", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { succeeded: true } });

    await verifyForm(wrapper).vm.$emit("locked", temporaryLockout, undefined);

    expect(wrapper.findAll(".otp-email-sign-in-form__terminal-text").map((text) => text.text())).toEqual([
      "Temporarily locked.",
    ]);
    expect(wrapper.findComponent({ name: "VcButton" }).props("disabled")).toBe(false);
  });

  it("hides the password switch link and buttons when the store has no password authentication", async () => {
    const wrapper = mountForm(false);

    expect(wrapper.find(".otp-email-sign-in-form__switch-link").exists()).toBe(false);

    await requestForm(wrapper).vm.$emit("disabled");

    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
    expect(wrapper.find(".otp-email-sign-in-form__terminal-text").text()).toBe(
      "shared.sign_in.otp_email_sign_in_form.disabled.text_no_password",
    );
  });

  it("emits switchToPassword when the password link is used", async () => {
    const wrapper = mountForm();

    await wrapper.find(".otp-email-sign-in-form__switch-link").trigger("click");

    expect(wrapper.emitted("switchToPassword")).toBeTruthy();
  });
});
