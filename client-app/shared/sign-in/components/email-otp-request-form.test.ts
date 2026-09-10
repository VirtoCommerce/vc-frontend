import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import EmailOtpRequestForm from "./email-otp-request-form.vue";
import type { IOtpRequestResponse } from "@/shared/sign-in/composables/useOtpSignIn";

const loading = ref(false);
const requestCode = vi.fn<(email: string) => Promise<IOtpRequestResponse | undefined>>();

vi.mock("@/shared/sign-in/composables/useOtpSignIn", () => ({
  useOtpSignIn: () => ({ loading, requestCode }),
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
    props: ["modelValue", "disabled", "testIdInput"],
    emits: ["update:modelValue"],
    template: `<input
      :value="modelValue"
      :disabled="disabled"
      :data-test-id="testIdInput"
      @input="$emit('update:modelValue', $event.target.value)"
    />`,
  },
  VcButton: {
    props: ["loading", "disabled"],
    template: `<button :disabled="disabled || loading"><slot /></button>`,
  },
  VcAlert: {
    template: `<div role="alert"><slot /></div>`,
  },
};

function mountForm() {
  return mount(EmailOtpRequestForm, {
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
  await wrapper.find('[data-test-id="email-otp-email-input"]').setValue(email);
  await submitForm(wrapper);

  return wrapper;
}

describe("EmailOtpRequestForm", () => {
  beforeEach(() => {
    loading.value = false;
    requestCode.mockReset();
  });

  it("requests a code for the entered email and emits succeeded on Sent", async () => {
    requestCode.mockResolvedValue({ outcome: "Sent", maskedEmail: "b***r@acme.com" });

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(requestCode).toHaveBeenCalledWith("buyer@acme.com");
    expect(wrapper.emitted("succeeded")).toEqual([
      [{ email: "buyer@acme.com", result: { outcome: "Sent", maskedEmail: "b***r@acme.com" } }],
    ]);
  });

  it("does not request a code for an invalid email", async () => {
    const wrapper = mountForm();
    await wrapper.find('[data-test-id="email-otp-email-input"]').setValue("not-an-email");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    await flushPromises();

    expect(requestCode).not.toHaveBeenCalled();
    expect(wrapper.emitted("succeeded")).toBeFalsy();
  });

  it("emits disabled when the module reports OTP is disabled, without emitting succeeded", async () => {
    requestCode.mockResolvedValue({ outcome: "Disabled" });

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.emitted("disabled")).toBeTruthy();
    expect(wrapper.emitted("succeeded")).toBeFalsy();
  });

  it("shows a generic error and does not emit when the request fails silently", async () => {
    // A failed useFetch call resolves to undefined rather than throwing.
    requestCode.mockResolvedValue(undefined);

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.find('[role="alert"]').text()).toBe("shared.sign_in.email_otp_sign_in_form.request.errors.generic");
    expect(wrapper.emitted("succeeded")).toBeFalsy();
    expect(wrapper.emitted("disabled")).toBeFalsy();
  });

  it("shows a generic error when requestCode throws", async () => {
    requestCode.mockRejectedValue(new Error("boom"));

    const wrapper = await fillEmailAndSubmit("buyer@acme.com");

    expect(wrapper.find('[role="alert"]').text()).toBe("shared.sign_in.email_otp_sign_in_form.request.errors.generic");
  });
});
