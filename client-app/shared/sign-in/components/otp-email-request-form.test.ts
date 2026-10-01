import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import OtpEmailRequestForm from "./otp-email-request-form.vue";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const loading = ref(false);
const requestCode = vi.fn<(email: string) => Promise<IOtpRequestResponse | undefined>>();
const signInErrors = ref<{ code?: string; description: string }[] | undefined>();
const showError = vi.fn((error?: { code?: string; description: string }) => {
  signInErrors.value = [error ?? { description: "common.messages.something_went_wrong" }];
});

vi.mock("@/shared/sign-in/composables/useOtpSignIn", () => ({
  useOtpSignIn: () => ({ loading, requestCode, signInErrors, showError }),
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

const stubs = {
  VcInput: {
    props: ["modelValue", "disabled", "error", "testIdInput"],
    emits: ["update:modelValue"],
    template: `<input
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="error"
      :data-test-id="testIdInput"
      @input="$emit('update:modelValue', $event.target.value)"
    />`,
  },
  VcButton: {
    props: ["loading", "disabled"],
    template: `<button :disabled="disabled || loading"><slot /></button>`,
  },
  VcAlert: {
    template: `<div class="vc-alert"><slot /></div>`,
  },
};

function mountForm() {
  return mount(OtpEmailRequestForm, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });
}

async function submitForm(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.find("form").trigger("submit");
  // vee-validate's yup-schema validation resolves over several microtask hops that a
  // single flushPromises() doesn't reliably drain, so poll for the actual outcome instead.
  await vi.waitFor(async () => {
    await flushPromises();
    if (!requestCode.mock.calls.length) {
      throw new Error("requestCode not called yet");
    }
  });
  await flushPromises();
}

async function fillEmailAndSubmit(email: string) {
  const wrapper = mountForm();
  await wrapper.find('[data-test-id="otp-email-email-input"]').setValue(email);
  await submitForm(wrapper);

  return wrapper;
}

describe("OtpEmailRequestForm", () => {
  beforeEach(() => {
    loading.value = false;
    requestCode.mockReset();
    signInErrors.value = undefined;
  });

  it("requests a code for the entered email and emits succeeded on Sent", async () => {
    requestCode.mockResolvedValue({ succeeded: true, maskedEmail: "b***r@acme.com" });

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(requestCode).toHaveBeenCalledWith("buyer@acme.com");
    expect(wrapper.emitted("succeeded")).toEqual([
      [{ email: "buyer@acme.com", result: { succeeded: true, maskedEmail: "b***r@acme.com" } }],
    ]);
  });

  it("does not request a code for an invalid email", async () => {
    const wrapper = mountForm();
    await wrapper.find('[data-test-id="otp-email-email-input"]').setValue("not-an-email");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await flushPromises();

    expect(requestCode).not.toHaveBeenCalled();
    expect(wrapper.emitted("succeeded")).toBeFalsy();
  });

  it("does not request a code for an email longer than the backend accepts", async () => {
    const label = "b".repeat(63);
    const email = `${"a".repeat(64)}@${label}.${label}.${label}.com`;

    const wrapper = mountForm();
    const input = wrapper.find('[data-test-id="otp-email-email-input"]');
    await input.setValue(email);
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(async () => {
      await flushPromises();
      expect(input.attributes("aria-invalid")).toBe("true");
    });

    expect(requestCode).not.toHaveBeenCalled();
  });

  it("emits disabled when the module reports OTP is disabled, without emitting succeeded", async () => {
    requestCode.mockResolvedValue({ succeeded: false, error: { code: "otp_disabled" } });

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.emitted("disabled")).toBeTruthy();
    expect(wrapper.emitted("succeeded")).toBeFalsy();
  });

  it("shows the translated server error and does not emit", async () => {
    requestCode.mockResolvedValue({
      succeeded: false,
      error: { code: "user_not_found", description: "User not found." },
    });

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.find('[role="alert"]').text()).toBe("User not found.");
    expect(wrapper.emitted("succeeded")).toBeFalsy();
    expect(wrapper.emitted("disabled")).toBeFalsy();
  });

  it("shows a generic error and does not emit when the request fails silently", async () => {
    requestCode.mockResolvedValue(undefined);

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.find('[role="alert"]').text()).toBe("common.messages.something_went_wrong");
    expect(wrapper.emitted("succeeded")).toBeFalsy();
    expect(wrapper.emitted("disabled")).toBeFalsy();
  });
});
