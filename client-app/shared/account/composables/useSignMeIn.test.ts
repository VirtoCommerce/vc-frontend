import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignMeIn } from "./useSignMeIn";

const h = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    loadMe: vi.fn<() => Promise<unknown> | false>(),
    refetchMe: vi.fn<() => Promise<unknown>>(),
    me: ref<{ me?: { id: string } }>(),
    emitBroadcast: vi.fn(),
  };
});

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/core/api/graphql", () => ({
  useGetMeQuery: () => ({ result: h.me, load: h.loadMe, refetch: h.refetchMe }),
}));

vi.mock("@/core/composables/useAuth", async () => {
  const { ref } = await import("vue");
  return { useAuth: () => ({ errors: ref(), resetErrors: vi.fn() }) };
});

vi.mock("@/core/composables/useCurrency", async () => {
  const { ref } = await import("vue");
  return { useCurrency: () => ({ supportedCurrencies: ref([]), saveCurrencyCode: vi.fn() }) };
});

vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ unpinLocale: vi.fn(), removeLocaleFromUrl: vi.fn() }),
}));

vi.mock("@/core/globals", () => ({
  globals: { currencyCode: "USD", storeId: "store", cultureName: "en-US" },
}));

vi.mock("@/shared/broadcast", () => ({
  useBroadcast: () => ({ emit: h.emitBroadcast }),
  openReturnUrl: "openReturnUrl",
  TabsType: { ALL: "ALL" },
}));

vi.mock("@/shared/cart/composables", async () => {
  const { ref } = await import("vue");
  return { useShortCart: () => ({ cart: ref() }) };
});

beforeEach(() => {
  h.loadMe.mockReset();
  h.refetchMe.mockReset().mockResolvedValue(undefined);
  h.emitBroadcast.mockReset();
  h.me.value = { me: { id: "user-1" } };
});

describe("useSignMeIn", () => {
  // A lazy query loads only once: later calls of `load` return false, so a second sign-in must fetch the user again.
  it("fetches the user again when the same form signs in a second time", async () => {
    h.loadMe.mockReturnValueOnce(Promise.resolve()).mockReturnValue(false);
    const { signIn } = useSignMeIn();

    await signIn();
    await signIn();

    expect(h.loadMe).toHaveBeenCalledTimes(2);
    expect(h.refetchMe).toHaveBeenCalledOnce();
  });

  it("uses the first load of the user without fetching it again", async () => {
    h.loadMe.mockReturnValue(Promise.resolve());
    const { signIn } = useSignMeIn();

    await signIn();

    expect(h.refetchMe).not.toHaveBeenCalled();
  });

  // The user query may answer with the user and an error in a secondary field; that still completes the sign-in.
  it("completes the sign-in when the user is loaded", async () => {
    h.loadMe.mockReturnValue(Promise.resolve());
    const { signIn } = useSignMeIn();

    await signIn();

    expect(h.emitBroadcast).toHaveBeenCalledOnce();
  });

  it("opens the given return URL after the sign-in", async () => {
    h.loadMe.mockReturnValue(Promise.resolve());
    const { signIn } = useSignMeIn();

    await signIn({ returnUrl: "/account/impersonate/user-2" });

    expect(h.emitBroadcast).toHaveBeenCalledWith("openReturnUrl", "/account/impersonate/user-2", "ALL");
  });

  it("rejects when the user can't be loaded", async () => {
    h.loadMe.mockReturnValue(Promise.resolve());
    h.me.value = undefined;
    const { signIn } = useSignMeIn();

    await expect(signIn()).rejects.toThrow();
    expect(h.emitBroadcast).not.toHaveBeenCalled();
  });
});
