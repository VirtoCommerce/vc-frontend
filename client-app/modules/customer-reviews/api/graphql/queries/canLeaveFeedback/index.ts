import { graphqlClient } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import canLeaveFeedbackDocument from "./canLeaveFeedbackQuery.graphql";
import type { CanLeaveFeedbackQuery, CanLeaveFeedbackQueryVariables } from "../../types";

export async function canLeaveFeedback(payload: { entityId: string; entityType: string }) {
  const { storeId, userId } = globals;

  const { data } = await graphqlClient.query<CanLeaveFeedbackQuery, CanLeaveFeedbackQueryVariables>({
    query: canLeaveFeedbackDocument,
    variables: {
      ...payload,
      storeId,
      userId,
    },
  });

  return data.canLeaveFeedback;
}
