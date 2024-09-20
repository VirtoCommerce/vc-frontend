import { graphqlClient } from "@/core/api/graphql/client";
import { useUser } from "@/shared/account/composables/useUser";
import mutationDocument from "./pushHistoricalEvent.graphql";
import type {
  InputPushHistoricalEventType,
  Mutations,
  MutationsPushHistoricalEventArgs,
} from "@/core/api/graphql/types";

const { isAuthenticated } = useUser();

export async function pushHistoricalEvent(
  payload: InputPushHistoricalEventType,
  sendUnauthorized?: false,
): Promise<void> {
  if (sendUnauthorized || isAuthenticated.value) {
    await graphqlClient.mutate<Required<Pick<Mutations, "pushHistoricalEvent">>, MutationsPushHistoricalEventArgs>({
      mutation: mutationDocument,
      variables: {
        command: payload,
      },
    });
  }
}
