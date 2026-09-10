import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@/core/composables", () => {
  const externalSignInCallback = vi.fn<() => Promise<void>>();
  const authErrors = ref<{ code: string; description: string }[]>();
  const analytics = vi.fn();

  return {
    __mockAuthState: { externalSignInCallback, authErrors },
    __mockAnalyticsState: { analytics },
    useAuth: () => ({ externalSignInCallback, errors: authErrors }),
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

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-1" },
}));

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
  externalSignInCallback: ReturnType<typeof vi.fn>;
  authErrors: { value: IdentityErrorMockType[] | undefined };
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
    auth.externalSignInCallback.mockReset();
    auth.externalSignInCallback.mockResolvedValue(undefined);
    auth.authErrors.value = undefined;

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

  it("requestCode posts storeId and email to /api/otp/request and returns the response", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Sent", maskedEmail: "b•••r@acme.com" };

    const { useOtpSignIn } = await importComposable();
    const { requestCode, loading } = useOtpSignIn();

    const result = await requestCode("buyer@acme.com");

    expect(postedUrl).toBe("/api/otp/request");
    expect(postedBody).toEqual({ storeId: "store-1", email: "buyer@acme.com" });
    expect(result).toEqual({ outcome: "Sent", maskedEmail: "b•••r@acme.com" });
    expect(loading.value).toBe(false);
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

  it("verifyCode completes sign-in and reports success when the outcome is Success", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Success" };

    const auth = await getAuthState();
    const signMeIn = await getSignMeInState();
    const { analytics } = await getAnalyticsState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(postedUrl).toBe("/api/otp/verify");
    expect(postedBody).toEqual({ storeId: "store-1", email: "buyer@acme.com", code: "123456" });
    expect(result).toEqual({ outcome: "Success" });
    expect(auth.externalSignInCallback).toHaveBeenCalledTimes(1);
    expect(signMeIn.signIn).toHaveBeenCalledTimes(1);
    expect(analytics).toHaveBeenCalledWith("login", "otp", { success: true });
  });

  it("verifyCode reports failure and does not redirect for a recoverable sign-in error", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Success" };

    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "user_not_found", description: "User not found" }];

    const signMeIn = await getSignMeInState();
    signMeIn.signInErrors.value = [{ code: "user_not_found", description: "User not found" }];

    const { analytics } = await getAnalyticsState();
    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const originalLocation = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });

    await verifyCode("buyer@acme.com", "123456");

    expect(analytics).toHaveBeenCalledWith("login", "otp", {
      success: false,
      errors: "user_not_found: User not found",
    });
    expect(window.location.href).toBe("");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("verifyCode redirects to /400 when the sign-in is not allowed", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Success" };

    const auth = await getAuthState();
    auth.authErrors.value = [{ code: "sign_in_not_allowed", description: "Sign-in not allowed" }];

    const signMeIn = await getSignMeInState();
    signMeIn.signInErrors.value = [{ code: "sign_in_not_allowed", description: "Sign-in not allowed" }];

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const originalLocation = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });

    await verifyCode("buyer@acme.com", "123456");

    expect(window.location.href).toBe("/400");

    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("verifyCode does not sign in when the code is rejected", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "InvalidCode" };

    const auth = await getAuthState();
    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "000000");

    expect(result).toEqual({ outcome: "InvalidCode" });
    expect(auth.externalSignInCallback).not.toHaveBeenCalled();
    expect(signMeIn.signIn).not.toHaveBeenCalled();
  });

  it("verifyCode resolves to undefined when the request fails (useFetch never rejects)", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = null;
    fetchState.fetchResult.error.value = new Error("network error");

    const auth = await getAuthState();
    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(result).toBeUndefined();
    expect(auth.externalSignInCallback).not.toHaveBeenCalled();
    expect(signMeIn.signIn).not.toHaveBeenCalled();
  });

  it("verifyCode logs and reports failure when completing sign-in throws", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Success" };

    const auth = await getAuthState();
    auth.externalSignInCallback.mockRejectedValue(new Error("token exchange failed"));

    const { Logger } = await import("@/core/utilities");
    const { analytics } = await getAnalyticsState();
    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(result).toEqual({ outcome: "Success" });
    expect(Logger.error).toHaveBeenCalled();
    expect(analytics).toHaveBeenCalledWith("login", "otp", { success: false, errors: "token exchange failed" });
  });
});
