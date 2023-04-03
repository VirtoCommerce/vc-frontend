import globals from "@/core/globals";
import { useUser } from "@/shared/account/composables";
import mutationDocument from "./createCustomerReview.graphql";
import type {
  CreateCustomerReviewCommandType,
  Mutations,
  MutationsCreateCustomerReviewArgs,
  CustomerReview,
} from "@/xapi/types";

export type CreateCustomerReviewCommandArgumentsType = Omit<
  CreateCustomerReviewCommandType,
  "storeId" | "userId" | "userName"
>;

export async function createCustomerReview(
  commandArguments: CreateCustomerReviewCommandArgumentsType
): Promise<CustomerReview> {
  const { storeId, userId } = globals;

  const { user } = useUser();

  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.mutate<
    Required<Pick<Mutations, "createCustomerReview">>,
    MutationsCreateCustomerReviewArgs
  >({
    mutation: mutationDocument,
    variables: {
      command: {
        storeId,
        userId,
        userName: user.value.contact!.fullName,
        ...commandArguments,
      },
    },
  });

  return data!.createCustomerReview!;
}
