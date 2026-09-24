import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@/core/composables", () => {
  const nativeSignIn = vi.fn<(params: Record<string, string>) => Promise<void>>();
  const authErrors = ref<{ code: string; description: string }[]>();
  const lockoutSecondsRemaining = ref<number>();
  const analytics = vi.fn();

  return {
    __mockAuthState: { nativeSignIn, authErrors, lockoutSecondsRemaining },
    __mockAnalyticsState: { analytics },
    useAuth: () => ({ nativeSignIn, errors: authErrors, lockoutSecondsRemaining }),
    useAnalytics: () => ({ analytics }),
  };
});

vi.mock("@/shared/account/composables", () => {
  const signIn = vi.fn<() => Promise<void>>();
  const signInErrors = ref<{ code: string; description: string }[]>();
  const resetErrors = vi.fn(() => {
    signInErrors.value = [];
  });

  return {
    __mockSignMeInState: { signIn, signInErrors, resetErrors },
    useSignMeIn: () => ({ signIn, errors: signInErrors, resetErrors }),
  };
});

vi.mock("@/core/utilities", () => ({
  Logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@/core/api/common", async () => {
  const { ref: refFn } = await import("vue");

  type FetchResultType = {
    data: { value: unknown };
    error: { value: unknown };
  };

  const fetchResult: FetchResultType = {
    data: refFn<unknown>(undefined),
    error: refFn<unknown>(undefined),
  };

  const useFetch = vi.fn();

  return {
    __mockFetchState: { useFetch, fetchResult },
    useFetch,
  };
});

type IdentityErrorMockType = { code: string; description: string };

type AuthMockStateType = {
  nativeSignIn: ReturnType<typeof vi.fn>;
  authErrors: { value: IdentityErrorMockType[] | undefined };
  lockoutSecondsRemaining: { value: number | undefined };
};

type AnalyticsMockStateType = {
  analytics: ReturnType<typeof vi.fn>;
};

type SignMeInMockStateType = {
  signIn: ReturnType<typeof vi.fn>;
  signInErrors: { value: IdentityErrorMockType[] | undefined };
  resetErrors: ReturnType<typeof vi.fn>;
};

type FetchMockStateType = {
  useFetch: ReturnType<typeof vi.fn>;
  fetchResult: {
    data: { value: unknown };
    error: { value: unknown };
  };
};

async function getAuthState(): Promise<AuthMockStateType> {
  const mod = (await import("@/core/composables")) as unknown as { __mockAuthState: AuthMockStateType };
  return mod.__mockAuthState;
}

async function getAnalyticsState(): Promise<AnalyticsMockStateType> {
  const mod = (await import("@/core/composables")) as unknown as { __mockAnalyticsState: AnalyticsMockStateType };
  return mod.__mockAnalyticsState;
}

async function getSignMeInState(): Promise<SignMeInMockStateType> {
  const mod = (await import("@/shared/account/composables")) as unknown as {
    __mockSignMeInState: SignMeInMockStateType;
  };
  return mod.__mockSignMeInState;
}

async function getFetchState(): Promise<FetchMockStateType> {
  const mod = (await import("@/core/api/common")) as unknown as { __mockFetchState: FetchMockStateType };
  return mod.__mockFetchState;
}

async function importComposable() {
  return import("./useOtpSignIn");
}

describe("useOtpSignIn", () => {
  let postedUrl: string | undefined;
  let postedBody: unknown;

  beforeEach(async () => {
    postedUrl = undefined;
    postedBody = undefined;

    const auth = await getAuthState();
    auth.nativeSignIn.mockReset();
    auth.nativeSignIn.mockResolvedValue(undefined);
    auth.authErrors.value = undefined;
    auth.lockoutSecondsRemaining.value = undefined;

    const signMeIn = await getSignMeInState();
    signMeIn.signIn.mockReset();
    signMeIn.signIn.mockResolvedValue(undefined);
    signMeIn.signInErrors.value = undefined;
    signMeIn.resetErrors.mockClear();

    const analyticsState = await getAnalyticsState();
    analyticsState.analytics.mockReset();

    const fetchState = await getFetchState();
    fetchState.useFetch.mockReset();
    fetchState.useFetch.mockImplementation((url: string) => {
      postedUrl = url;
      return {
        post: (body: unknown) => {
          postedBody = body;
          return {
            json: () => Promise.resolve(fetchState.fetchResult),
          };
        },
      };
    });
    fetchState.fetchResult.data.value = undefined;
    fetchState.fetchResult.error.value = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requestCode posts the email to /api/otp/request and returns the response", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "CodeSent", maskedEmail: "b•••r@acme.com" };

    const { useOtpSignIn } = await importComposable();
    const { requestCode, loading } = useOtpSignIn();

    const result = await requestCode("buyer@acme.com");

    expect(postedUrl).toBe("/api/otp/request");
    expect(postedBody).toEqual({ email: "buyer@acme.com" });
    expect(result).toEqual({ outcome: "CodeSent", maskedEmail: "b•••r@acme.com" });
    expect(loading.value).toBe(false);
  });

  it("requestCode clears errors left over from a previous verifyCode attempt", async () => {
    // A failed verifyCode leaves signInErrors set; starting a fresh request (e.g. after "use a
    // different email" or "resend code") must not leave the old error visible.
    const signMeIn = await getSignMeInState();
    signMeIn.signInErrors.value = [{ code: "invalid_code", description: "The code is invalid or has expired." }];

    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "CodeSent", maskedEmail: "b•••r@acme.com" };

    const { useOtpSignIn } = await importComposable();
    const { requestCode } = useOtpSignIn();

    await requestCode("buyer@acme.com");

    expect(signMeIn.resetErrors).toHaveBeenCalled();
  });

  it("requestCode resolves to undefined when the request fails (useFetch never rejects)", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = null;
    fetchState.fetchResult.error.value = new Error("network error");

    const { useOtpSignIn } = await importComposable();
    const { requestCode, loading } = useOtpSignIn();

    const result = await requestCode("buyer@acme.com");

    expect(result).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("resets loading if the fetch call itself throws synchronously", async () => {
    const fetchState = await getFetchState();
    fetchState.useFetch.mockImplementation(() => ({
      post: () => ({
        json: () => Promise.reject(new Error("unexpected failure")),
      }),
    }));

    const { useOtpSignIn } = await importComposable();
    const { requestCode, loading } = useOtpSignIn();

    await expect(requestCode("buyer@acme.com")).rejects.toThrow("unexpected failure");
    expect(loading.value).toBe(false);
  });

  it("verifyCode completes sign-in and reports success when there is no error", async () => {
    const auth = await getAuthState();
    const signMeIn = await getSignMeInState();
    const { analytics } = await getAnalyticsState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(auth.nativeSignIn).toHaveBeenCalledTimes(1);
    expect(auth.nativeSignIn).toHaveBeenCalledWith({
      email: "buyer@acme.com",
      code: "123456",
    });
    expect(signMeIn.signIn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ outcome: "Success" });
    expect(analytics).toHaveBeenCalledWith("login", "otp", { success: true });
  });

  it("verifyCode returns AccountLocked with the seconds remaining when the token exchange reports a lockout", async () => {
    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "account_locked", description: "Too many attempts" }];
    auth.lockoutSecondsRemaining.value = 245;

    const signMeIn = await getSignMeInState();
    const { analytics } = await getAnalyticsState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(result).toEqual({ outcome: "AccountLocked", lockoutSecondsRemaining: 245 });
    expect(signMeIn.signIn).not.toHaveBeenCalled();
    expect(analytics).toHaveBeenCalledWith("login", "otp", { success: false, errors: "account_locked" });
  });

  it("verifyCode returns OtpDisabled when the token exchange reports OTP is disabled", async () => {
    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "otp_disabled", description: "OTP disabled" }];

    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(result).toEqual({ outcome: "OtpDisabled" });
    expect(signMeIn.signIn).not.toHaveBeenCalled();
  });

  it("verifyCode returns InvalidCode for any other token exchange error", async () => {
    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "invalid_code", description: "The code is invalid or has expired." }];

    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "000000");

    expect(result).toEqual({ outcome: "InvalidCode" });
    expect(signMeIn.signIn).not.toHaveBeenCalled();
  });

  it("verifyCode redirects to /400 when the sign-in is not allowed", async () => {
    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "sign_in_not_allowed", description: "Sign-in not allowed" }];

    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const originalLocation = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(window.location.href).toBe("/400");
    expect(result).toEqual({ outcome: "InvalidCode" });
    expect(signMeIn.signIn).not.toHaveBeenCalled();

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("verifyCode still resolves the structured outcome when getToken(true) rejects on the 400 response", async () => {
    // nativeSignIn -> getToken(true) rejects on any non-2xx /connect/token response (same as the
    // password grant's authorize()), even though the error body already populated authErrors.
    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "invalid_code", description: "The code is invalid or has expired." }];
    auth.nativeSignIn.mockRejectedValue(new Error("Request failed with status code 400"));

    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "000000");

    expect(result).toEqual({ outcome: "InvalidCode" });
    expect(signMeIn.signIn).not.toHaveBeenCalled();
  });

  it("verifyCode logs and reports failure when the token exchange throws", async () => {
    const auth = await getAuthState();
    auth.nativeSignIn.mockRejectedValue(new Error("token exchange failed"));

    const signMeIn = await getSignMeInState();
    const { Logger } = await import("@/core/utilities");
    const { analytics } = await getAnalyticsState();
    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(result).toBeUndefined();
    expect(signMeIn.signIn).not.toHaveBeenCalled();
    expect(Logger.error).toHaveBeenCalled();
    expect(analytics).toHaveBeenCalledWith("login", "otp", { success: false, errors: "token exchange failed" });
  });
});
