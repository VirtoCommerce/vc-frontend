import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EmailOtpSignInForm from "./email-otp-sign-in-form.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/shared/common", () => ({
  ContactAdministratorLink: {
    name: "ContactAdministratorLink",
    template: `<a href="/contacts">contact administrator</a>`,
  },
}));

vi.mock("./email-otp-request-form.vue", () => ({
  default: {
    name: "EmailOtpRequestForm",
    emits: ["succeeded", "disabled"],
    template: `<div class="stub-request-form" />`,
  },
}));

vi.mock("./email-otp-verify-form.vue", () => ({
  default: {
    name: "EmailOtpVerifyForm",
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
  return mount(EmailOtpSignInForm, {
    props: { hasPasswordAuthentication },
    attachTo: document.body,
    global: {
      mocks: { $t: translate },
      stubs,
    },
  });
}

function requestForm(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.findComponent({ name: "EmailOtpRequestForm" });
}

function verifyForm(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.findComponent({ name: "EmailOtpVerifyForm" });
}

describe("EmailOtpSignInForm", () => {
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
      result: { outcome: "Sent", maskedEmail: "b***r@acme.com" },
    });

    expect(verifyForm(wrapper).exists()).toBe(true);
    expect(verifyForm(wrapper).props()).toMatchObject({ email: "buyer@acme.com", maskedEmail: "b***r@acme.com" });
    expect(wrapper.emitted("stepChanged")?.at(-1)).toEqual(["verify"]);
  });

  it("falls back to the raw email as the masked email when the backend doesn't send one", async () => {
    const wrapper = mountForm();

    await requestForm(wrapper).vm.$emit("succeeded", {
      email: "buyer@acme.com",
      result: { outcome: "Sent" },
    });

    expect(verifyForm(wrapper).props("maskedEmail")).toBe("buyer@acme.com");
  });

  it("goes back to the request step from verify when the user asks for a different email", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", {
      email: "buyer@acme.com",
      result: { outcome: "Sent" },
    });

    await verifyForm(wrapper).vm.$emit("useDifferentEmail");

    expect(requestForm(wrapper).exists()).toBe(true);
  });

  it("shows the generic terminal and focuses its heading when a step reports disabled", async () => {
    const wrapper = mountForm();

    await requestForm(wrapper).vm.$emit("disabled");
    await flushPromises();

    expect(wrapper.find(".email-otp-sign-in-form__terminal-title").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.generic.title",
    );
    expect(document.activeElement).toBe(wrapper.find(".email-otp-sign-in-form__terminal-title").element);
  });

  it("returns from the generic terminal to the request step", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("disabled");

    await wrapper.find(".email-otp-sign-in-form__terminal-footer button").trigger("click");

    expect(requestForm(wrapper).exists()).toBe(true);
  });

  it("counts an ordinary lockout down and re-enables the retry button at zero", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { outcome: "Sent" } });

    await verifyForm(wrapper).vm.$emit("locked", 5);

    expect(wrapper.find(".email-otp-sign-in-form__terminal-text").text()).toContain("0:05");
    expect(wrapper.findComponent({ name: "VcButton" }).props("disabled")).toBe(true);

    await vi.advanceTimersByTimeAsync(5000);

    expect(wrapper.find(".email-otp-sign-in-form__terminal-text").text()).toBe(
      "shared.sign_in.email_otp_sign_in_form.locked.text_ready",
    );
    expect(wrapper.findComponent({ name: "VcButton" }).props("disabled")).toBe(false);
  });

  it("treats an absurdly large lockout as indefinite: no countdown, contact administrator instead", async () => {
    const wrapper = mountForm();
    await requestForm(wrapper).vm.$emit("succeeded", { email: "buyer@acme.com", result: { outcome: "Sent" } });

    // Well beyond any real lockout window — e.g. an admin-imposed or sentinel value.
    await verifyForm(wrapper).vm.$emit("locked", 30 * 24 * 60 * 60);

    expect(wrapper.find(".email-otp-sign-in-form__terminal-text").text()).toContain("common.messages.blocked");
    expect(wrapper.findComponent({ name: "ContactAdministratorLink" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
  });

  it("hides the password switch link and buttons when the store has no password authentication", async () => {
    const wrapper = mountForm(false);

    expect(wrapper.find(".email-otp-sign-in-form__switch-link").exists()).toBe(false);

    await requestForm(wrapper).vm.$emit("disabled");

    expect(wrapper.findComponent({ name: "VcButton" }).exists()).toBe(false);
  });

  it("emits switchToPassword when the password link is used", async () => {
    const wrapper = mountForm();

    await wrapper.find(".email-otp-sign-in-form__switch-link").trigger("click");

    expect(wrapper.emitted("switchToPassword")).toBeTruthy();
  });
});
