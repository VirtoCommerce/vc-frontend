import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");

  const authorize = vi.fn<(username: string, password: string) => Promise<void>>();
  const authErrors = ref<Array<{ code?: string; description?: string }> | undefined>(undefined);
  const isAuthorizing = ref(false);

  const setAccessToken = vi.fn<(token: string) => void>();
  const setExpiresAt = vi.fn<(seconds: number) => void>();
  const setTokenType = vi.fn<(type: string) => void>();
  const setRefreshToken = vi.fn<(token: string) => void>();

  return {
    __mockAuthState: {
      authorize,
      authErrors,
      isAuthorizing,
      setAccessToken,
      setExpiresAt,
      setTokenType,
      setRefreshToken,
    },
    useAuth: () => ({
      authorize,
      errors: authErrors,
      isAuthorizing,
      setAccessToken,
      setExpiresAt,
      setTokenType,
      setRefreshToken,
    }),
  };
});

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

  const useFetch = vi.fn(() => ({
    post: () => ({
      json: <T = unknown>() =>
        Promise.resolve(fetchResult as { data: { value: T | undefined }; error: { value: unknown } }),
    }),
  }));

  return {
    __mockFetchState: { useFetch, fetchResult },
    useFetch,
  };
});

vi.mock("@/shared/broadcast", () => {
  const emit = vi.fn();
  const TabsType = { ALL: "ALL", CURRENT: "CURRENT" } as const;
  const reloadAndOpenMainPage = "reloadAndOpenMainPage";

  return {
    __mockBroadcastState: {
      emit,
      TabsType,
      reloadAndOpenMainPage,
    },
    TabsType,
    reloadAndOpenMainPage,
    useBroadcast: () => ({ emit }),
  };
});

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/core/utilities", () => ({
  Logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

type AuthMockStateType = {
  authorize: ReturnType<typeof vi.fn>;
  authErrors: { value: Array<{ code?: string; description?: string }> | undefined };
  isAuthorizing: { value: boolean };
  setAccessToken: ReturnType<typeof vi.fn>;
  setExpiresAt: ReturnType<typeof vi.fn>;
  setTokenType: ReturnType<typeof vi.fn>;
  setRefreshToken: ReturnType<typeof vi.fn>;
};

type FetchMockStateType = {
  useFetch: ReturnType<typeof vi.fn>;
  fetchResult: {
    data: { value: unknown };
    error: { value: unknown };
  };
};

type BroadcastMockStateType = {
  emit: ReturnType<typeof vi.fn>;
  TabsType: { ALL: string; CURRENT: string };
  reloadAndOpenMainPage: string;
};

async function getAuthState(): Promise<AuthMockStateType> {
  const mod = (await import("@/core/composables")) as unknown as { __mockAuthState: AuthMockStateType };
  return mod.__mockAuthState;
}

async function getFetchState(): Promise<FetchMockStateType> {
  const mod = (await import("@/core/api/common")) as unknown as { __mockFetchState: FetchMockStateType };
  return mod.__mockFetchState;
}

async function getBroadcastState(): Promise<BroadcastMockStateType> {
  const mod = (await import("@/shared/broadcast")) as unknown as { __mockBroadcastState: BroadcastMockStateType };
  return mod.__mockBroadcastState;
}

async function importComposable() {
  const mod = await import("@/shared/account/composables/useImpersonate");
  return mod;
}

function setSuccessfulImpersonateResponse(state: FetchMockStateType): void {
  state.fetchResult.data.value = {
    access_token: "access",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "refresh",
  };
  state.fetchResult.error.value = undefined;
}

function setFailedImpersonateResponse(state: FetchMockStateType): void {
  state.fetchResult.data.value = undefined;
  state.fetchResult.error.value = new Error("network");
}

describe("useImpersonate", () => {
  beforeEach(async () => {
    const auth = await getAuthState();
    auth.authorize.mockReset();
    auth.authErrors.value = undefined;
    auth.isAuthorizing.value = false;
    auth.setAccessToken.mockReset();
    auth.setExpiresAt.mockReset();
    auth.setTokenType.mockReset();
    auth.setRefreshToken.mockReset();

    const fetchState = await getFetchState();
    fetchState.useFetch.mockReset();
    fetchState.useFetch.mockImplementation(() => ({
      post: () => ({
        json: () => Promise.resolve(fetchState.fetchResult),
      }),
    }));
    fetchState.fetchResult.data.value = undefined;
    fetchState.fetchResult.error.value = undefined;

    const broadcastState = await getBroadcastState();
    broadcastState.emit.mockReset();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("happy path: completes verify then impersonate and ends in success", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    auth.authorize.mockImplementation(async () => {
      auth.authErrors.value = undefined;
    });
    setSuccessfulImpersonateResponse(fetchState);

    const { useImpersonate } = await importComposable();
    const { impersonate, step, failedStep, loading, errors } = useImpersonate();

    await impersonate("support@example.com", "password", "target-user-id");

    expect(auth.authorize).toHaveBeenCalledWith("support@example.com", "password");
    expect(fetchState.useFetch).toHaveBeenCalledWith("/connect/token");
    expect(auth.setAccessToken).toHaveBeenCalledWith("access");
    expect(auth.setRefreshToken).toHaveBeenCalledWith("refresh");
    expect(step.value).toBe("success");
    expect(failedStep.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(errors.value).toEqual([]);
  });

  it("broadcasts reloadAndOpenMainPage 1 second after impersonate success", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();
    const broadcastState = await getBroadcastState();

    auth.authorize.mockImplementation(async () => {
      auth.authErrors.value = undefined;
    });
    setSuccessfulImpersonateResponse(fetchState);

    const { useImpersonate } = await importComposable();
    const { impersonate, step } = useImpersonate();

    await impersonate("support@example.com", "password", "target-user-id");

    expect(step.value).toBe("success");
    // setTimeout is scheduled but timers are paused — emit must NOT have fired yet.
    expect(broadcastState.emit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(broadcastState.emit).toHaveBeenCalledTimes(1);
    expect(broadcastState.emit).toHaveBeenCalledWith(
      broadcastState.reloadAndOpenMainPage,
      null,
      broadcastState.TabsType.ALL,
    );
  });

  it("verify fails: invalid credentials prevent impersonate from being called", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    const verifyErrors = [{ code: "invalid_grant", description: "Invalid email or password" }];
    auth.authorize.mockImplementation(async () => {
      auth.authErrors.value = verifyErrors;
    });

    const { useImpersonate } = await importComposable();
    const { impersonate, step, failedStep, errors, loading } = useImpersonate();

    await impersonate("support@example.com", "wrong-password", "target-user-id");

    expect(auth.authorize).toHaveBeenCalledTimes(1);
    expect(fetchState.useFetch).not.toHaveBeenCalled();
    expect(failedStep.value).toBe("verify");
    expect(errors.value).toEqual(verifyErrors);
    expect(step.value).toBe("idle");
    expect(loading.value).toBe(false);
  });

  it("impersonate fails after verify succeeded", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    auth.authorize.mockImplementation(async () => {
      auth.authErrors.value = undefined;
    });
    setFailedImpersonateResponse(fetchState);

    const { useImpersonate } = await importComposable();
    const { impersonate, step, failedStep, errors, loading } = useImpersonate();

    await impersonate("support@example.com", "password", "target-user-id");

    expect(auth.authorize).toHaveBeenCalledTimes(1);
    expect(fetchState.useFetch).toHaveBeenCalledTimes(1);
    expect(auth.setAccessToken).not.toHaveBeenCalled();
    expect(failedStep.value).toBe("impersonate");
    expect(errors.value).toEqual([{ code: "impersonate_failed" }]);
    expect(step.value).toBe("idle");
    expect(loading.value).toBe(false);
  });

  it("empty targetUserId: skips authorize and reports verify failure", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    const { useImpersonate } = await importComposable();
    const { impersonate, step, failedStep, errors } = useImpersonate();

    await impersonate("support@example.com", "password", "");

    expect(auth.authorize).not.toHaveBeenCalled();
    expect(fetchState.useFetch).not.toHaveBeenCalled();
    expect(failedStep.value).toBe("verify");
    expect(errors.value).toEqual([{ code: "invalid_user_id" }]);
    expect(step.value).toBe("idle");
  });

  it("loading state reflects active step during the flow", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    let resolveAuthorize: (() => void) | undefined;
    let resolveFetch: ((value: unknown) => void) | undefined;

    auth.authorize.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAuthorize = () => {
            auth.authErrors.value = undefined;
            resolve();
          };
        }),
    );

    // Override useFetch to return a deferred json() promise so we can pause inside doImpersonate.
    function makeDeferredJson<T = unknown>() {
      return new Promise<{ data: { value: T | undefined }; error: { value: unknown } }>((resolve) => {
        resolveFetch = resolve as (value: unknown) => void;
      });
    }
    fetchState.useFetch.mockImplementation(() => ({
      post: () => ({ json: makeDeferredJson }),
    }));

    const { useImpersonate } = await importComposable();
    const { impersonate, step, loading } = useImpersonate();

    const promise = impersonate("support@example.com", "password", "target-user-id");

    // While in verify step
    await Promise.resolve();
    expect(step.value).toBe("verify");
    expect(loading.value).toBe(true);

    resolveAuthorize?.();
    // Allow microtasks to flush so the impersonate step kicks in
    await Promise.resolve();
    await Promise.resolve();

    // While in impersonate step
    expect(step.value).toBe("impersonate");
    expect(loading.value).toBe(true);

    resolveFetch?.({
      data: { value: { access_token: "a", token_type: "Bearer", expires_in: 1, refresh_token: "r" } },
      error: { value: undefined },
    });
    await promise;

    expect(step.value).toBe("success");
    expect(loading.value).toBe(false);
  });

  it("impersonateAuthenticated happy path: skips authorize and ends in success", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    setSuccessfulImpersonateResponse(fetchState);

    const { useImpersonate } = await importComposable();
    const { impersonateAuthenticated, step, failedStep, loading, errors } = useImpersonate();

    await impersonateAuthenticated("target-user-id");

    expect(auth.authorize).not.toHaveBeenCalled();
    expect(fetchState.useFetch).toHaveBeenCalledWith("/connect/token");
    expect(auth.setAccessToken).toHaveBeenCalledWith("access");
    expect(auth.setRefreshToken).toHaveBeenCalledWith("refresh");
    expect(step.value).toBe("success");
    expect(failedStep.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(errors.value).toEqual([]);
  });

  it("impersonateAuthenticated empty targetUserId: skips doImpersonate and reports invalid_user_id", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    const { useImpersonate } = await importComposable();
    const { impersonateAuthenticated, step, failedStep, errors } = useImpersonate();

    await impersonateAuthenticated("");

    expect(auth.authorize).not.toHaveBeenCalled();
    expect(fetchState.useFetch).not.toHaveBeenCalled();
    expect(failedStep.value).toBe("verify");
    expect(errors.value).toEqual([{ code: "invalid_user_id" }]);
    expect(step.value).toBe("idle");
  });

  it("impersonateAuthenticated failure: sets failedStep impersonate and impersonate_failed error", async () => {
    const auth = await getAuthState();
    const fetchState = await getFetchState();

    setFailedImpersonateResponse(fetchState);

    const { useImpersonate } = await importComposable();
    const { impersonateAuthenticated, step, failedStep, errors, loading } = useImpersonate();

    await impersonateAuthenticated("target-user-id");

    expect(auth.authorize).not.toHaveBeenCalled();
    expect(fetchState.useFetch).toHaveBeenCalledTimes(1);
    expect(auth.setAccessToken).not.toHaveBeenCalled();
    expect(failedStep.value).toBe("impersonate");
    expect(errors.value).toEqual([{ code: "impersonate_failed" }]);
    expect(step.value).toBe("idle");
    expect(loading.value).toBe(false);
  });

  it("resetState clears step, failedStep and errors", async () => {
    const auth = await getAuthState();
    auth.authorize.mockImplementation(async () => {
      auth.authErrors.value = [{ code: "invalid_grant" }];
    });

    const { useImpersonate } = await importComposable();
    const { impersonate, resetState, step, failedStep, errors } = useImpersonate();

    await impersonate("support@example.com", "password", "target-user-id");
    expect(failedStep.value).toBe("verify");
    expect(errors.value.length).toBeGreaterThan(0);

    resetState();

    expect(step.value).toBe("idle");
    expect(failedStep.value).toBeNull();
    expect(errors.value).toEqual([]);
  });
});
