import { graphqlClient } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import mutationDocument from "./createCustomerReviewMutation.graphql";
import type { Mutations } from "../../types";
import type { MutationsCreateCustomerReviewArgs } from "@/core/api/graphql/push-messages/types";

export async function createCustomerReview(payload: {
  entityId: string;
  entityType: string;
  entityName: string;
  review: string;
  rating: number;
}) {
  const { storeId, userId, userName } = globals;

  const { data } = await graphqlClient.mutate<
    Required<Pick<Mutations, "createCustomerReview">>,
    MutationsCreateCustomerReviewArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        ...payload,
        storeId,
        userId,
        userName,
      },
    },
  });

  return data?.createCustomerReview;
}
