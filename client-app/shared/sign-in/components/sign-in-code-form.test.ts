import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import SignInCodeForm from "./sign-in-code-form.vue";

vi.mock("@/core/composables", () => ({
  useErrorsTranslator: () => ({
    translate: (error: { description?: string } | undefined) => error?.description,
  }),
}));

vi.mock("@/shared/common", () => ({
  ContactAdministratorLink: { template: `<a href="/contacts">contact administrator</a>` },
}));

const stubs = {
  VcButton: {
    props: ["loading", "disabled"],
    template: `<button :disabled="disabled || loading"><slot /></button>`,
  },
  VcAlert: { template: `<div class="vc-alert"><slot /></div>` },
};

function mountForm(props: Record<string, unknown> = {}) {
  return mount(SignInCodeForm, {
    props: { idPrefix: "test", subtitle: "We sent a code.", backLabel: "Back", ...props },
    global: { mocks: { $t: (key: string) => key }, stubs },
  });
}

async function typeCode(wrapper: ReturnType<typeof mountForm>, code: string) {
  await wrapper.find('[data-test-id="test-code-input"]').setValue(code);
  await flushPromises();
}

describe("SignInCodeForm", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the subtitle and leaves the heading to the page", () => {
    const wrapper = mountForm();

    expect(wrapper.find('[data-test-id="test-subtitle"]').text()).toBe("We sent a code.");
    expect(wrapper.find("h1, h2").exists()).toBe(false);
  });

  it("emits back from the back link", async () => {
    const wrapper = mountForm();
    const backButton = wrapper.find('[data-test-id="test-back-button"]');
    await backButton.trigger("click");

    expect(backButton.text()).toBe("Back");
    expect(wrapper.emitted("back")).toHaveLength(1);
  });

  it("submits the code once 6 digits are entered", async () => {
    const wrapper = mountForm();

    await typeCode(wrapper, "12345");
    expect(wrapper.emitted("submit")).toBeUndefined();

    await typeCode(wrapper, "123456");
    expect(wrapper.emitted("submit")).toEqual([["123456"]]);
  });

  it("does not submit while loading", async () => {
    const wrapper = mountForm({ loading: true });

    await typeCode(wrapper, "123456");

    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("asks to clear the errors only when there are errors to clear", async () => {
    const wrapper = mountForm();
    await typeCode(wrapper, "1");
    expect(wrapper.emitted("clearErrors")).toBeUndefined();

    await wrapper.setProps({ errors: [{ code: "invalid_code", description: "That code didn't work." }] });
    await typeCode(wrapper, "12");

    expect(wrapper.emitted("clearErrors")).toHaveLength(1);
  });

  it("shows the errors and marks the code input", () => {
    const wrapper = mountForm({ errors: [{ code: "invalid_code", description: "That code didn't work." }] });

    expect(wrapper.find('[data-test-id="test-error-alert"]').text()).toContain("That code didn't work.");
    expect(wrapper.find(".sign-in-code-input--error").exists()).toBe(true);
  });

  // An error above the code input would push the input down while the customer is typing.
  it("shows the errors below the code input", () => {
    const wrapper = mountForm({ errors: [{ code: "invalid_code", description: "That code didn't work." }] });

    const codeInput = wrapper.find('[data-test-id="test-code-input"]').element;
    const errorAlert = wrapper.find('[data-test-id="test-error-alert"]').element;

    expect(codeInput.compareDocumentPosition(errorAlert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("emits resend", async () => {
    const wrapper = mountForm();

    await wrapper.find('[data-test-id="test-resend-button"]').trigger("click");

    expect(wrapper.emitted("resend")).toHaveLength(1);
  });

  it("offers the resend only once the resend is available", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const wrapper = mountForm({ resendAvailableAt: Date.now() + 30_000 });
    const resendButton = wrapper.find('[data-test-id="test-resend-button"]');

    expect(resendButton.attributes("disabled")).toBeDefined();
    expect(resendButton.text()).toBe("shared.sign_in.sign_in_code_form.resend_countdown");

    vi.advanceTimersByTime(30_000);
    await flushPromises();

    expect(resendButton.attributes("disabled")).toBeUndefined();
    expect(resendButton.text()).toBe("shared.sign_in.sign_in_code_form.resend_button");
  });

  it("clears the code, and shows and announces the message on reset", async () => {
    const wrapper = mountForm();
    await typeCode(wrapper, "123");

    await (wrapper.vm as unknown as { reset: (message?: string) => Promise<void> }).reset("Code sent again.");
    await flushPromises();

    expect((wrapper.find('[data-test-id="test-code-input"]').element as HTMLInputElement).value).toBe("");
    expect(wrapper.find('[aria-live="polite"]').text()).toBe("Code sent again.");
    expect(wrapper.find('[data-test-id="test-notice"]').text()).toBe("Code sent again.");
  });

  it("shows no message until one is set", () => {
    const wrapper = mountForm();

    expect(wrapper.find('[data-test-id="test-notice"]').exists()).toBe(false);
  });
});
