import { ApolloClient, ApolloLink, Observable } from "@apollo/client/core";
import { provideApolloClient, useQuery } from "@vue/apollo-composable";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import { cache } from "@/core/api/graphql/config/cache";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCommunication } from "./useSalesRepCommunication";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepCustomerOptions } from "./useSalesRepCustomerOptions";
import { useSalesRepCustomers } from "./useSalesRepCustomers";
import { useSalesRepCustomersCount } from "./useSalesRepCustomersCount";
import { useSalesRepLayout } from "./useSalesRepLayout";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import { useSalesRepOrders } from "./useSalesRepOrders";
import { useSalesRepRules } from "./useSalesRepRules";
import { useSalesRepTopSellers } from "./useSalesRepTopSellers";
import { useSalesReps } from "./useSalesReps";

const emit = vi.hoisted(() => vi.fn());

vi.mock("@/core/globals", () => ({
  globals: { storeId: "test-store", currencyCode: "USD", cultureName: "en-US" },
}));

vi.mock("@/shared/broadcast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/broadcast")>();
  return { ...actual, useBroadcast: () => ({ ...actual.useBroadcast(), emit }) };
});

vi.mock("@/core/utilities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/utilities")>();
  return { ...actual, Logger: { ...actual.Logger, error: vi.fn(), warn: vi.fn() } };
});

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, te: () => false }) }));

let requestCount = 0;

// Fails every operation the way the QA repro does: one dead `POST /graphql`, no GraphQL payload.
const failingLink = new ApolloLink(
  () =>
    new Observable((observer) => {
      requestCount += 1;
      observer.error(new Error("Failed to fetch"));
    }),
);

function mountWidget(use: () => unknown): () => void {
  const scope = effectScope();
  scope.run(use);
  return () => scope.stop();
}

async function waitForTheFailureToSettle(): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (requestCount > 0) {
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve));
      return;
    }
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
  }

  throw new Error("Timed out waiting for the query to fail");
}

beforeEach(async () => {
  requestCount = 0;
  emit.mockClear();
  await cache.reset({ discardWatches: true });
  provideApolloClient(new ApolloClient({ link: ApolloLink.from([errorHandlerLink, failingLink]), cache }));
});

// Every hub read. Each one names its own failure — an inline card error, an empty view, a not-found page —
// so a failing widget must not also raise the page-level error toast.
const hubReads: [string, () => unknown][] = [
  ["order statistics", () => useSalesRepOrderStatistics()],
  ["cart statistics", () => useSalesRepCartStatistics()],
  ["customer counts", () => useSalesRepCustomerCounts()],
  ["customers count badge", () => useSalesRepCustomersCount()],
  ["my customers list", () => useSalesRepCustomers()],
  ["orders list", () => useSalesRepOrders()],
  ["top sellers", () => useSalesRepTopSellers()],
  ["customer profile header", () => useSalesRepCustomer("org-a")],
  ["share customer picker", () => useSalesRepCustomerOptions()],
  ["sales reps list", () => useSalesReps()],
  ["filter rules", () => useSalesRepRules("order", "filter")],
  ["saved layout", () => useSalesRepLayout(DASHBOARD_LAYOUT_SCOPE)],
];

describe.each(hubReads)("%s", (_name, use) => {
  it("raises no error notification when it fails", async () => {
    const stop = mountWidget(use);
    await waitForTheFailureToSettle();

    expect(requestCount).toBeGreaterThan(0);
    expect(emit).not.toHaveBeenCalled();
    stop();
  });
});

describe("customer communication", () => {
  // The one opted-out mutation: its callers raise their own error toast.
  it("raises no error notification when the send fails", async () => {
    let sent: Promise<unknown> | undefined;
    const stop = mountWidget(() => {
      const { sendCommunication } = useSalesRepCommunication();
      sent = sendCommunication({ organizationId: "org-a", sendEmail: true, sendPush: false, message: "There" });
    });
    await waitForTheFailureToSettle();
    await sent;

    expect(requestCount).toBeGreaterThan(0);
    expect(emit).not.toHaveBeenCalled();
    stop();
  });
});

describe("a read that has not opted out", () => {
  // Proves the harness above would see a toast, rather than passing because nothing ever fired.
  it("still raises the error notification", async () => {
    const stop = mountWidget(() =>
      useQuery(SalesRepCustomersCountDocument, { storeId: "test-store" }, { fetchPolicy: "cache-and-network" }),
    );
    await waitForTheFailureToSettle();

    expect(emit).toHaveBeenCalledWith("unhandled_error", expect.any(String), "all");
    stop();
  });
});
