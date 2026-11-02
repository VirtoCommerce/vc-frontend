import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref, unref } from "vue";
import ViewQuote from "./view-quote.vue";

// The module locale and the quote both arrive after the page is set up, as on a full-page load.
const mocks = vi.hoisted(() => ({
  messages: {} as { value: Record<string, string> },
  quote: {} as { value: { id: string; number: string } | undefined },
  usePageHead: vi.fn(),
}));

vi.mock("vue-i18n", async () => {
  const { ref: vueRef } = await import("vue");

  mocks.messages = vueRef<Record<string, string>>({});

  return {
    useI18n: () => ({
      t: (key: string, params: string[] = []) =>
        (mocks.messages.value[key] ?? key).replace("{0}", String(params[0] ?? "")),
    }),
  };
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/core/composables", () => ({
  usePageHead: mocks.usePageHead,
  useBreadcrumbs: vi.fn(),
}));

vi.mock("@/modules/quotes/useUserQuote", async () => {
  const { ref: vueRef } = await import("vue");

  mocks.quote = vueRef<{ id: string; number: string } | undefined>(undefined);

  return {
    useUserQuote: () => ({
      quote: mocks.quote,
      billingAddress: ref(undefined),
      shippingAddress: ref(undefined),
      approveItem: vi.fn(),
      declineItem: vi.fn(),
      fetchQuote: vi.fn(() => Promise.resolve()),
    }),
  };
});

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ error: vi.fn() }),
}));

vi.mock("@/shared/files", () => ({
  downloadFile: vi.fn(),
}));

vi.mock("@/shared/common", () => ({
  AddressInfo: { name: "AddressInfo", render: () => null },
}));

describe("ViewQuote when the module locale loads after setup", () => {
  beforeEach(() => {
    mocks.messages.value = {};
    mocks.quote.value = undefined;
    mocks.usePageHead.mockClear();
  });

  it("gives the page a title that follows the locale and the loaded quote number", async () => {
    shallowMount(ViewQuote, {
      props: { quoteId: "quote-1" },
      global: { mocks: { $t: (key: string) => key, $d: String } },
    });

    mocks.messages.value = { "quote_details.title": "Quote request #{0}" };
    mocks.quote.value = { id: "quote-1", number: "Q-0001" };
    await nextTick();

    const [{ title }] = mocks.usePageHead.mock.calls[0] as [{ title: unknown }];

    expect(unref(title)).toBe("Quote request #Q-0001");
  });
});
