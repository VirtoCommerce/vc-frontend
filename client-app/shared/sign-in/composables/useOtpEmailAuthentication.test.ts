// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useOtpEmailAuthentication } from "./useOtpEmailAuthentication";

const themeContext = ref<{ storeSettings: { authenticationTypes?: string[] } }>({
  storeSettings: { authenticationTypes: [] },
});

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext }),
}));

describe("useOtpEmailAuthentication", () => {
  it.each([
    [["Password", "OTP"], true],
    [["Password"], false],
    [undefined, false],
  ])("for authentication types %j returns %s", (authenticationTypes, expected) => {
    themeContext.value = { storeSettings: { authenticationTypes } };

    const { hasOtpEmailAuthentication } = useOtpEmailAuthentication();

    expect(hasOtpEmailAuthentication.value).toBe(expected);
  });
});
