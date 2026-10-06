import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useOtpSignInMode } from "./useOtpSignInMode";

const resetErrors = vi.fn();

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ resetErrors }),
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
});
