import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/core/composables", () => {
  const externalSignInCallback = vi.fn<() => Promise<void>>();

  return {
    __mockAuthState: { externalSignInCallback },
    useAuth: () => ({ externalSignInCallback }),
  };
});

vi.mock("@/shared/account/composables", () => {
  const signIn = vi.fn<() => Promise<void>>();

  return {
    __mockSignMeInState: { signIn },
    useSignMeIn: () => ({ signIn }),
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
  const { ref } = await import("vue");

  type FetchResultType = {
    data: { value: unknown };
    error: { value: unknown };
  };

  const fetchResult: FetchResultType = {
    data: ref<unknown>(undefined),
    error: ref<unknown>(undefined),
  };

  const useFetch = vi.fn();

  return {
    __mockFetchState: { useFetch, fetchResult },
    useFetch,
  };
});

type AuthMockStateType = {
  externalSignInCallback: ReturnType<typeof vi.fn>;
};

type SignMeInMockStateType = {
  signIn: ReturnType<typeof vi.fn>;
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

    const signMeIn = await getSignMeInState();
    signMeIn.signIn.mockReset();
    signMeIn.signIn.mockResolvedValue(undefined);

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

  it("requestCode logs and rethrows when the request fails", async () => {
    const fetchState = await getFetchState();
    fetchState.useFetch.mockImplementation(() => ({
      post: () => ({
        json: () => Promise.reject(new Error("network error")),
      }),
    }));

    const { Logger } = await import("@/core/utilities");
    const { useOtpSignIn } = await importComposable();
    const { requestCode, loading } = useOtpSignIn();

    await expect(requestCode("buyer@acme.com")).rejects.toThrow("network error");
    expect(Logger.error).toHaveBeenCalled();
    expect(loading.value).toBe(false);
  });

  it("verifyCode completes sign-in when the outcome is Success", async () => {
    const fetchState = await getFetchState();
    fetchState.fetchResult.data.value = { outcome: "Success" };

    const auth = await getAuthState();
    const signMeIn = await getSignMeInState();

    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    const result = await verifyCode("buyer@acme.com", "123456");

    expect(postedUrl).toBe("/api/otp/verify");
    expect(postedBody).toEqual({ storeId: "store-1", email: "buyer@acme.com", code: "123456" });
    expect(result).toEqual({ outcome: "Success" });
    expect(auth.externalSignInCallback).toHaveBeenCalledTimes(1);
    expect(signMeIn.signIn).toHaveBeenCalledTimes(1);
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

  it("verifyCode logs and rethrows when the request fails", async () => {
    const fetchState = await getFetchState();
    fetchState.useFetch.mockImplementation(() => ({
      post: () => ({
        json: () => Promise.reject(new Error("network error")),
      }),
    }));

    const { Logger } = await import("@/core/utilities");
    const { useOtpSignIn } = await importComposable();
    const { verifyCode } = useOtpSignIn();

    await expect(verifyCode("buyer@acme.com", "123456")).rejects.toThrow("network error");
    expect(Logger.error).toHaveBeenCalled();
  });
});
