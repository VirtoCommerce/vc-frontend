import { graphqlClient } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import mutationDocument from "./createReviewMutation.graphql";
import type { Mutations } from "../../types";
import type { MutationsCreateReviewArgs } from "@/core/api/graphql/types";

export async function createReview(payload: { entityId: string; entityType: string; review: string; rating: number }) {
  const { storeId } = globals;

  const { data } = await graphqlClient.mutate<Required<Pick<Mutations, "createReview">>, MutationsCreateReviewArgs>({
    mutation: mutationDocument,
    variables: {
      command: {
        ...payload,
        storeId,
      },
    },
  });

  return data?.createReview;
}
