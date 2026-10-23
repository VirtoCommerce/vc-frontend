import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetSubscriptionTermsDocument } from "../../types";
import type { GetSubscriptionTermsQuery } from "../../types";

export async function getSubscriptionTerms(): Promise<GetSubscriptionTermsQuery["subscriptionTerms"]> {
  const { data } = await graphqlClient.query({
    query: GetSubscriptionTermsDocument,
    variables: { storeId: globals.storeId ?? "", cultureName: globals.cultureName },
    fetchPolicy: "network-only",
  });

  return data.subscriptionTerms;
}
