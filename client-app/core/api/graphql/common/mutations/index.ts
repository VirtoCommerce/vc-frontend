import { graphqlClient } from "@/core/api/graphql/client";
import mutationDocument from "./pushHistoricalEvent.graphql";
import type {
  InputPushHistoricalEventType,
  Mutations,
  MutationsPushHistoricalEventArgs,
} from "@/core/api/graphql/types";

export async function pushHistoricalEvent(payload: InputPushHistoricalEventType): Promise<void> {
  await graphqlClient.mutate<Required<Pick<Mutations, "pushHistoricalEvent">>, MutationsPushHistoricalEventArgs>({
    mutation: mutationDocument,
    variables: {
      command: payload,
    },
  });
}
