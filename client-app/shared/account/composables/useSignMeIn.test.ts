import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignMeIn } from "./useSignMeIn";

const h = vi.hoisted(() => ({
  loadMe: vi.fn<() => Promise<unknown> | false>(),
  refetchMe: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/core/api/graphql", async () => {
  const { ref } = await import("vue");
  return { useGetMeQuery: () => ({ result: ref(), load: h.loadMe, refetch: h.refetchMe }) };
});

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
  useBroadcast: () => ({ emit: vi.fn() }),
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
});
