import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { saveLayout } from "./account/mutations/saveLayout";
import { getLayout } from "./account/queries/getLayout";
import { graphqlClient } from "./client";
import { errorHandlerLink } from "./config/error-handler";
import { useGetOrderStatisticsQuery } from "./orders/queries/getOrderStatistics";
import { GetLayoutDocument, GetOrderStatisticsDocument, SaveLayoutDocument } from "./types";
import type { GetOrderStatisticsQueryVariables, InputLayout } from "./types";
import type { DocumentNode, FieldNode, OperationDefinitionNode } from "graphql";

const emit = vi.hoisted(() => vi.fn());

vi.mock("@/shared/broadcast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/broadcast")>();
  return { ...actual, useBroadcast: () => ({ ...actual.useBroadcast(), emit }) };
});

vi.mock("@/core/utilities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/utilities")>();
  return { ...actual, Logger: { ...actual.Logger, error: vi.fn(), warn: vi.fn() } };
});

// Fails every operation the way a dead backend does — one network error, no GraphQL payload — through the host's
// real error link, which raises the global toast unless the operation opted out.
const failingLink = new ApolloLink(
  () =>
    new Observable((observer) => {
      observer.error(new Error("Failed to fetch"));
    }),
);

// The wrappers' own client, with the failing link in place of the network.
vi.mock("./client", async () => {
  const apollo = await import("@apollo/client/core");
  const { errorHandlerLink: errorLink } = await import("./config/error-handler");
  const failing = new apollo.ApolloLink(
    () =>
      new apollo.Observable((observer) => {
        observer.error(new Error("Failed to fetch"));
      }),
  );
  return {
    graphqlClient: new apollo.ApolloClient({
      link: apollo.ApolloLink.from([errorLink, failing]),
      cache: new apollo.InMemoryCache(),
      defaultOptions: { query: { fetchPolicy: "no-cache" }, mutate: { fetchPolicy: "no-cache" } },
    }),
  };
});

// Told apart by shape: graphql's `Kind` enum is kept out of the app's imports (see config/links/index.ts).
const operationOf = (document: DocumentNode) =>
  document.definitions.find((definition): definition is OperationDefinitionNode => "operation" in definition);

const IDENTITY = /user|customer|organi[sz]ation|member|contact/i;

const COMMAND: InputLayout = { scope: "accountDashboard", storeId: "B2B-store", schemaVersion: 1, regions: [] };

const STATISTICS_VARIABLES: GetOrderStatisticsQueryVariables = {
  storeId: "B2B-store",
  currencyCode: "USD",
  withWeek: true,
  withMtd: true,
  withMonthOverMonth: true,
  withYtd: true,
  withYearOverYear: true,
  withAverageOrderValue: true,
};

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round += 1) {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

beforeEach(() => {
  emit.mockClear();
});

// The backend scopes all three to the signed-in user from the token. A user, customer or organization id in an
// operation would be an argument the client could point at someone else.
describe.each([
  ["GetLayout", GetLayoutDocument, "layout"],
  ["SaveLayout", SaveLayoutDocument, "saveLayout"],
  ["GetOrderStatistics", GetOrderStatisticsDocument, "orderStatistics"],
] as const)("%s", (_name, document, rootField) => {
  it("declares no user, customer or organization variable", () => {
    const variables = operationOf(document)?.variableDefinitions?.map((definition) => definition.variable.name.value);

    expect(variables?.length).toBeGreaterThan(0);
    expect(variables?.filter((name) => IDENTITY.test(name))).toEqual([]);
  });

  it("passes no such argument to its root field", () => {
    const field = operationOf(document)?.selectionSet.selections.find(
      (selection): selection is FieldNode => "arguments" in selection && selection.name.value === rootField,
    );
    const args = field?.arguments?.map((argument) => argument.name.value);

    expect(args?.length).toBeGreaterThan(0);
    expect(args?.filter((name) => IDENTITY.test(name))).toEqual([]);
  });
});

describe("the layout operations", () => {
  // The dashboard names a failed read itself (its defaults under an alert), so the read must not also toast.
  it("reads without the global error toast", async () => {
    await expect(getLayout({ scope: "accountDashboard", storeId: "B2B-store" })).rejects.toThrow();

    expect(emit).not.toHaveBeenCalled();
  });

  // The control: a failed save is a user action and keeps the toast — so the read above is not passing because
  // nothing could have toasted.
  it("keeps the toast for a failed save", async () => {
    await expect(saveLayout(COMMAND)).rejects.toThrow();

    expect(emit).toHaveBeenCalledWith("unhandled_error", expect.any(String), "all");
  });

  // A save returns the stored document, so a cached read could only ever be an older one.
  it("bypasses the Apollo cache both ways", async () => {
    const query = vi.spyOn(graphqlClient, "query");
    const mutate = vi.spyOn(graphqlClient, "mutate");

    await getLayout({ scope: "accountDashboard" }).catch(() => undefined);
    await saveLayout(COMMAND).catch(() => undefined);

    expect(query).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: "no-cache" }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: "no-cache", variables: { command: COMMAND } }),
    );
  });
});

describe("the order statistics query", () => {
  // Every card shows its own failure, so the query must not also toast.
  it("fails without the global error toast", async () => {
    provideApolloClient(
      new ApolloClient({ link: ApolloLink.from([errorHandlerLink, failingLink]), cache: new InMemoryCache() }),
    );
    const owner = effectScope();
    const { error } = owner.run(() => useGetOrderStatisticsQuery(ref(STATISTICS_VARIABLES), ref(true)))!;

    await settle();

    expect(error.value).toBeTruthy();
    expect(emit).not.toHaveBeenCalled();
    owner.stop();
  });

  it("does not run while disabled", async () => {
    const requests = vi.fn();
    provideApolloClient(
      new ApolloClient({
        link: new ApolloLink(() => {
          requests();
          return new Observable(() => {});
        }),
        cache: new InMemoryCache(),
      }),
    );
    const owner = effectScope();
    owner.run(() => useGetOrderStatisticsQuery(ref(STATISTICS_VARIABLES), ref(false)));

    await settle();

    expect(requests).not.toHaveBeenCalled();
    owner.stop();
  });
});
