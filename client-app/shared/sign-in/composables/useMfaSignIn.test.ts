import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@/core/composables", () => {
  const mfaSignIn = vi.fn<(params: Record<string, string>) => Promise<void>>();
  const authErrors = ref<{ code: string; description: string }[]>();
  const lockoutSecondsRemaining = ref<number>();
  const revokeTokens = vi.fn();
  const analytics = vi.fn();

  return {
    __mockAuthState: { mfaSignIn, authErrors, revokeTokens },
    __mockAnalyticsState: { analytics },
    useAuth: () => ({ mfaSignIn, errors: authErrors, lockoutSecondsRemaining, revokeTokens }),
    useAnalytics: () => ({ analytics }),
  };
});

vi.mock("@/shared/account/composables", () => {
  const signIn = vi.fn<() => Promise<void>>();
  const signInErrors = ref<{ code?: string; description?: string }[]>();
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

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/core/api/common", async () => {
  const { ref: refFn } = await import("vue");

  const fetchResult = {
    data: refFn<unknown>(undefined),
  };

  const useFetch = vi.fn();
  const errorHandler = vi.fn();

  return {
    __mockFetchState: { useFetch, fetchResult, errorHandler },
    useFetch,
    errorHandler,
    toServerError: () => "unhandled",
    HttpError: { BAD_REQUEST: 400 },
  };
});

type IdentityErrorMockType = { code?: string; description?: string };

type AuthMockStateType = {
  mfaSignIn: ReturnType<typeof vi.fn>;
  authErrors: { value: IdentityErrorMockType[] | undefined };
  revokeTokens: ReturnType<typeof vi.fn>;
};

type SignMeInMockStateType = {
  signIn: ReturnType<typeof vi.fn>;
  signInErrors: { value: IdentityErrorMockType[] | undefined };
  resetErrors: ReturnType<typeof vi.fn>;
};

type FetchMockStateType = {
  useFetch: ReturnType<typeof vi.fn>;
  errorHandler: ReturnType<typeof vi.fn>;
  fetchResult: { data: { value: unknown } };
};

async function getAuthState(): Promise<AuthMockStateType> {
  return ((await import("@/core/composables")) as unknown as { __mockAuthState: AuthMockStateType }).__mockAuthState;
}

async function getAnalytics(): Promise<ReturnType<typeof vi.fn>> {
  const mod = (await import("@/core/composables")) as unknown as {
    __mockAnalyticsState: { analytics: ReturnType<typeof vi.fn> };
  };
  return mod.__mockAnalyticsState.analytics;
}

async function getSignMeInState(): Promise<SignMeInMockStateType> {
  const mod = (await import("@/shared/account/composables")) as unknown as {
    __mockSignMeInState: SignMeInMockStateType;
  };
  return mod.__mockSignMeInState;
}

async function getFetchState(): Promise<FetchMockStateType> {
  return ((await import("@/core/api/common")) as unknown as { __mockFetchState: FetchMockStateType }).__mockFetchState;
}

async function getComposable() {
  const { useMfaSignIn } = await import("./useMfaSignIn");
  return useMfaSignIn();
}

describe("useMfaSignIn", () => {
  let postedUrl: string | undefined;
  let postedBody: unknown;

  beforeEach(async () => {
    postedUrl = undefined;
    postedBody = undefined;

    const auth = await getAuthState();
    auth.mfaSignIn.mockReset();
    auth.mfaSignIn.mockResolvedValue(undefined);
    auth.authErrors.value = undefined;
    auth.revokeTokens.mockReset();

    const signMeIn = await getSignMeInState();
    signMeIn.signIn.mockReset();
    signMeIn.signIn.mockResolvedValue(undefined);
    signMeIn.signInErrors.value = undefined;

    const fetchState = await getFetchState();
    fetchState.useFetch.mockReset();
    fetchState.useFetch.mockImplementation((url: string) => {
      postedUrl = url;
      return {
        post: (body: unknown) => {
          postedBody = body;
          return { json: () => Promise.resolve(fetchState.fetchResult) };
        },
      };
    });
    fetchState.fetchResult.data.value = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("resendCode posts the two-factor token and the provider to /api/mfa/resend and returns the response", async () => {
    const response = { succeeded: true, twoFactorToken: "token-2", providers: [{ name: "Email" }] };
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = response;

    const { resendCode, loading } = await getComposable();
    const result = await resendCode("token-1", "Email");

    expect(postedUrl).toBe("/api/mfa/resend");
    expect(postedBody).toEqual({ twoFactorToken: "token-1", provider: "Email" });
    expect(result).toEqual(response);
    expect(loading.value).toBe(false);
  });

  it("resendCode leaves a 400 to the form and reports any other failure globally", async () => {
    const fetchState = await getFetchState();
    let onFetchError: ((context: { response: { status: number } | null; error: unknown }) => unknown) | undefined;
    fetchState.useFetch.mockImplementation((_url: string, options: { onFetchError: typeof onFetchError }) => {
      onFetchError = options.onFetchError;
      return { post: () => ({ json: () => Promise.resolve(fetchState.fetchResult) }) };
    });

    const { resendCode } = await getComposable();
    await resendCode("token-1");

    onFetchError?.({ response: { status: 400 }, error: "Bad Request" });
    expect(fetchState.errorHandler).not.toHaveBeenCalled();

    onFetchError?.({ response: { status: 500 }, error: "Internal Server Error" });
    expect(fetchState.errorHandler).toHaveBeenCalledOnce();
  });

  it("verifyCode exchanges the token and the code with the current store and completes the sign-in while loading", async () => {
    const auth = await getAuthState();
    const analytics = await getAnalytics();

    const { verifyCode, loading } = await getComposable();
    let loadingWhileCompleting: boolean | undefined;
    const onVerified = vi.fn(() => {
      loadingWhileCompleting = loading.value;
      return Promise.resolve();
    });

    const result = await verifyCode("buyer@acme.com", "token-1", "123456", { onVerified });

    expect(auth.mfaSignIn).toHaveBeenCalledWith({
      email: "buyer@acme.com",
      twoFactorToken: "token-1",
      code: "123456",
      storeId: "store-1",
    });
    expect(onVerified).toHaveBeenCalledOnce();
    expect(loadingWhileCompleting).toBe(true);
    expect(analytics).toHaveBeenCalledWith("login", "password", { success: true });
    expect(result).toEqual({ succeeded: true });
    expect(loading.value).toBe(false);
  });

  it("verifyCode does not track a customer sign-in when analytics are off", async () => {
    const analytics = await getAnalytics();

    const { verifyCode } = await getComposable();
    await verifyCode("operator@acme.com", "token-1", "123456", {
      onVerified: () => Promise.resolve(),
      trackAnalytics: false,
    });

    expect(analytics).not.toHaveBeenCalled();
  });

  it("verifyCode returns the error from the token response without completing the sign-in", async () => {
    const auth = await getAuthState();
    const onVerified = vi.fn(() => Promise.resolve());
    const error = { code: "invalid_code", description: "The code is invalid or has expired." };
    auth.mfaSignIn.mockImplementation(() => {
      auth.authErrors.value = [error];
      return Promise.reject(new Error("400"));
    });

    const { verifyCode } = await getComposable();
    const result = await verifyCode("buyer@acme.com", "token-1", "000000", { onVerified });

    expect(result).toEqual({ succeeded: false, error });
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("verifyCode resolves to undefined when the request fails without a structured error", async () => {
    const auth = await getAuthState();
    auth.mfaSignIn.mockRejectedValue(new Error("network error"));

    const { verifyCode, loading } = await getComposable();
    const result = await verifyCode("buyer@acme.com", "token-1", "123456", { onVerified: () => Promise.resolve() });

    expect(result).toBeUndefined();
    expect(loading.value).toBe(false);
  });

  it("verifyCode discards the tokens when the sign-in can't be completed after the code is accepted", async () => {
    const auth = await getAuthState();
    const analytics = await getAnalytics();

    const { verifyCode, loading } = await getComposable();
    const result = await verifyCode("buyer@acme.com", "token-1", "123456", {
      onVerified: () => Promise.reject(new Error("me query failed")),
    });

    expect(auth.revokeTokens).toHaveBeenCalledOnce();
    expect(result).toEqual({
      succeeded: false,
      error: { description: "common.messages.something_went_wrong" },
      tokensDiscarded: true,
    });
    expect(analytics).toHaveBeenCalledWith("login", "password", { success: false, errors: "me query failed" });
    expect(analytics).not.toHaveBeenCalledWith("login", "password", { success: true });
    expect(loading.value).toBe(false);
  });

  it("handleError emits failed when the tokens were discarded, since the two-factor token is used up", async () => {
    const emit = vi.fn();
    const error = { description: "common.messages.something_went_wrong" };

    const { handleError } = await getComposable();
    handleError({ succeeded: false, error, tokensDiscarded: true }, emit);

    expect(emit).toHaveBeenCalledWith("failed", error);
  });

  it.each([
    "invalid_two_factor_token",
    "user_is_temporary_locked_out",
    "code_attempts_exceeded",
    "user_is_locked_in_organization",
    "duplicate_email_login_attempt",
    "an_error_added_later",
  ])("handleError emits failed on %s, since only a wrong code can be fixed with another code", async (code) => {
    const emit = vi.fn();
    const signMeIn = await getSignMeInState();
    const error = { code, description: code };

    const { handleError } = await getComposable();
    handleError({ succeeded: false, error, lockoutSecondsRemaining: 300 }, emit);

    expect(emit).toHaveBeenCalledWith("failed", error);
    expect(signMeIn.signInErrors.value).toBeUndefined();
  });

  it("handleError shows any other error, or a generic one when there is none", async () => {
    const emit = vi.fn();
    const signMeIn = await getSignMeInState();

    const { handleError } = await getComposable();

    handleError({ succeeded: false, error: { code: "invalid_code" } }, emit);
    expect(signMeIn.signInErrors.value).toEqual([{ code: "invalid_code" }]);

    handleError(undefined, emit);
    expect(signMeIn.signInErrors.value).toEqual([{ description: "common.messages.something_went_wrong" }]);

    expect(emit).not.toHaveBeenCalled();
  });
});
