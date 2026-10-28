import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { OtpStep, PasswordStep } from "@/shared/sign-in/enums";
import { useOtpSignInMode } from "./useOtpSignInMode";

const resetErrors = vi.fn();

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ resetErrors }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("useOtpSignInMode", () => {
  beforeEach(() => {
    resetErrors.mockClear();
  });

  it("starts in OTP mode when OTP is enabled", () => {
    const { showOtpEmailForm } = useOtpSignInMode(ref(true));

    expect(showOtpEmailForm.value).toBe(true);
  });

  it("starts in password mode when OTP is disabled", () => {
    const { showOtpEmailForm } = useOtpSignInMode(ref(false));

    expect(showOtpEmailForm.value).toBe(false);
  });

  it("clears the sign-in errors left by the OTP flow when switching to the password form", () => {
    const { showOtpEmailForm, switchToPassword } = useOtpSignInMode(ref(true));

    switchToPassword();

    expect(resetErrors).toHaveBeenCalledOnce();
    expect(showOtpEmailForm.value).toBe(false);
  });

  it("switches back to OTP mode", () => {
    const { showOtpEmailForm, switchToPassword, switchToOtp } = useOtpSignInMode(ref(true));

    switchToPassword();
    switchToOtp();

    expect(showOtpEmailForm.value).toBe(true);
  });

  it("hides the switch to OTP while the password sign-in asks for the second factor", () => {
    const { showSwitchToOtpLink, passwordStep, switchToPassword } = useOtpSignInMode(ref(true));

    switchToPassword();
    expect(showSwitchToOtpLink.value).toBe(true);

    passwordStep.value = PasswordStep.TwoFactor;
    expect(showSwitchToOtpLink.value).toBe(false);

    passwordStep.value = PasswordStep.Password;
    expect(showSwitchToOtpLink.value).toBe(true);
  });

  it("titles the code steps of both sign-in modes", () => {
    const { stepHeader, otpStep, passwordStep, switchToPassword } = useOtpSignInMode(ref(true));
    expect(stepHeader.value).toBeUndefined();

    otpStep.value = OtpStep.Verify;
    expect(stepHeader.value).toBe("shared.sign_in.otp_email_sign_in_form.verify.header");

    switchToPassword();
    expect(stepHeader.value).toBeUndefined();

    passwordStep.value = PasswordStep.TwoFactor;
    expect(stepHeader.value).toBe("shared.sign_in.mfa_verify_form.header");
  });

  it("never shows the switch to OTP when OTP is disabled", () => {
    const { showSwitchToOtpLink } = useOtpSignInMode(ref(false));

    expect(showSwitchToOtpLink.value).toBe(false);
  });
});
