import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import LoginFormSection from "./login-form-section.vue";

const hasOtpEmailAuthentication = ref(true);
const hasPasswordAuthentication = ref(true);
const resetErrors = vi.fn();

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext: ref({ settings: {} }) }),
}));

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ resetErrors }),
}));

vi.mock("@/shared/account", () => ({
  SignInForm: { name: "SignInForm", template: "<form />" },
  useUser: () => ({ isAuthenticated: ref(false) }),
}));

vi.mock("@/shared/sign-in/composables/useIdentityProviders", () => ({
  useIdentityProviders: () => ({ hasPasswordAuthentication }),
}));

vi.mock("@/shared/sign-in/composables/useOtpEmailAuthentication", () => ({
  useOtpEmailAuthentication: () => ({ hasOtpEmailAuthentication }),
}));

vi.mock("@/shared/sign-in/components/otp-email-sign-in-form.vue", () => ({
  default: {
    name: "OtpEmailSignInForm",
    props: ["hasPasswordAuthentication"],
    emits: ["switchToPassword", "stepChanged"],
    template: "<div />",
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

function mountSection() {
  return mount(LoginFormSection, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { VcTypography: { template: "<h2 class='title'><slot /></h2>" } },
    },
  });
}

function otpForm(wrapper: ReturnType<typeof mountSection>) {
  return wrapper.findComponent({ name: "OtpEmailSignInForm" });
}

const switchToOtpLink = '[data-test-id="otp-email-switch-to-otp-link"]';

describe("LoginFormSection", () => {
  beforeEach(() => {
    hasOtpEmailAuthentication.value = true;
    hasPasswordAuthentication.value = true;
    resetErrors.mockClear();
  });

  it("starts with the OTP form when OTP is enabled", () => {
    const wrapper = mountSection();

    expect(otpForm(wrapper).exists()).toBe(true);
    expect(otpForm(wrapper).props("hasPasswordAuthentication")).toBe(true);
    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(false);
  });

  it("shows only the password form when OTP is disabled", () => {
    hasOtpEmailAuthentication.value = false;

    const wrapper = mountSection();

    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(true);
    expect(otpForm(wrapper).exists()).toBe(false);
    expect(wrapper.find(switchToOtpLink).exists()).toBe(false);
  });

  it("switches the title to the verify header while the OTP form is on the verify step", async () => {
    const wrapper = mountSection();
    expect(wrapper.find(".title").text()).toBe("pages.home.sign_in_form_title");

    await otpForm(wrapper).vm.$emit("stepChanged", "verify");

    expect(wrapper.find(".title").text()).toBe("shared.sign_in.otp_email_sign_in_form.verify.header");
  });

  it("switches to the password form and back to OTP", async () => {
    const wrapper = mountSection();

    await otpForm(wrapper).vm.$emit("switchToPassword");

    expect(resetErrors).toHaveBeenCalled();
    expect(wrapper.findComponent({ name: "SignInForm" }).exists()).toBe(true);

    await wrapper.find(switchToOtpLink).trigger("click");

    expect(otpForm(wrapper).exists()).toBe(true);
  });
});
