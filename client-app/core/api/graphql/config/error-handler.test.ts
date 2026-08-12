import { ApolloLink, Observable, execute, gql } from "@apollo/client/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import {
  forbiddenEvent,
  graphqlErrorEvent,
  passwordExpiredEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  userLockedEvent,
} from "@/shared/broadcast";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "../consts";
import { errorHandlerLink } from "./error-handler";
import type { GraphQLFormattedError } from "graphql";

const emit = vi.hoisted(() => vi.fn());

vi.mock("@/shared/broadcast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/broadcast")>();
  return { ...actual, useBroadcast: () => ({ ...actual.useBroadcast(), emit }) };
});

const QUERY = gql`
  query TestQuery {
    test {
      id
    }
  }
`;

type FailureType = { networkError?: Error; graphQLErrors?: GraphQLFormattedError[] };

/** Runs one failing operation through the link, optionally opted out of the error notifications. */
async function run(failure: FailureType, suppress = false): Promise<void> {
  const terminatingLink = new ApolloLink(
    () =>
      new Observable((observer) => {
        if (failure.networkError) {
          // A 401/403 arrives as a network error carrying its GraphQL errors on `result` — the shape
          // @apollo/client's error link reads them from.
          observer.error(
            failure.graphQLErrors
              ? Object.assign(failure.networkError, { result: { errors: failure.graphQLErrors } })
              : failure.networkError,
          );
        } else {
          observer.next({ errors: failure.graphQLErrors });
          observer.complete();
        }
      }),
  );

  await new Promise<void>((resolve) => {
    execute(ApolloLink.from([errorHandlerLink, terminatingLink]), {
      query: QUERY,
      context: suppress ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
    }).subscribe({ complete: () => resolve(), error: () => resolve() });
  });
}

function emittedEvents(): string[] {
  return emit.mock.calls.map((call) => call[0] as string);
}

function graphQLError(code: GraphQLErrorCode): GraphQLFormattedError {
  return { message: "failed", extensions: { code } };
}

beforeEach(() => {
  emit.mockClear();
});

describe("errorHandlerLink", () => {
  it("notifies about a network failure", async () => {
    await run({ networkError: new Error("Failed to fetch") });

    expect(emittedEvents()).toEqual([unhandledErrorEvent]);
  });

  it("notifies about an unrecognized GraphQL error", async () => {
    await run({ graphQLErrors: [{ message: "boom" }] });

    expect(emittedEvents()).toEqual([graphqlErrorEvent]);
  });

  it("stays silent when the operation opts out of the error notifications", async () => {
    await run({ networkError: new Error("Failed to fetch") }, true);
    await run({ graphQLErrors: [graphQLError(GraphQLErrorCode.Unhandled)] }, true);
    await run({ graphQLErrors: [{ message: "boom" }] }, true);

    expect(emittedEvents()).toEqual([]);
  });

  it("keeps the auth outcomes for an operation that opted out", async () => {
    await run({ graphQLErrors: [graphQLError(GraphQLErrorCode.Unauthorized)] }, true);
    await run({ graphQLErrors: [graphQLError(GraphQLErrorCode.Forbidden)] }, true);
    await run({ graphQLErrors: [graphQLError(GraphQLErrorCode.UserLocked)] }, true);
    await run({ graphQLErrors: [graphQLError(GraphQLErrorCode.PasswordExpired)] }, true);

    expect(emittedEvents()).toEqual([unauthorizedErrorEvent, forbiddenEvent, userLockedEvent, passwordExpiredEvent]);
  });

  it("keeps the auth outcomes when an opted-out response also carries an unhandled error", async () => {
    await run(
      { graphQLErrors: [graphQLError(GraphQLErrorCode.Unhandled), graphQLError(GraphQLErrorCode.Unauthorized)] },
      true,
    );
    await run(
      { graphQLErrors: [graphQLError(GraphQLErrorCode.Unhandled), graphQLError(GraphQLErrorCode.Forbidden)] },
      true,
    );
    await run(
      { graphQLErrors: [graphQLError(GraphQLErrorCode.Unhandled), graphQLError(GraphQLErrorCode.UserLocked)] },
      true,
    );
    await run(
      { graphQLErrors: [graphQLError(GraphQLErrorCode.Unhandled), graphQLError(GraphQLErrorCode.PasswordExpired)] },
      true,
    );

    expect(emittedEvents()).toEqual([unauthorizedErrorEvent, forbiddenEvent, userLockedEvent, passwordExpiredEvent]);
  });

  it("stays silent for an opted-out network failure that carries no auth code", async () => {
    await run({ networkError: new Error("Failed to fetch"), graphQLErrors: [{ message: "boom" }] }, true);

    expect(emittedEvents()).toEqual([]);
  });

  it("keeps the auth outcome of an opted-out response that also failed at the network level", async () => {
    await run(
      { networkError: new Error("Failed to fetch"), graphQLErrors: [graphQLError(GraphQLErrorCode.Unauthorized)] },
      true,
    );

    expect(emittedEvents()).toEqual([unauthorizedErrorEvent]);
  });
});
