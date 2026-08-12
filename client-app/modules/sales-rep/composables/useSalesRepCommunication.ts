import { useMutation } from "@vue/apollo-composable";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SendCustomerCommunicationDocument } from "../api/graphql/types";
import type { SalesRepCommunicationInputType, SalesRepCommunicationResultType } from "../types";

const FAILED_RESULT: SalesRepCommunicationResultType = {
  succeeded: false,
  pushSent: false,
  emailSent: false,
  warnings: [],
};

export function useSalesRepCommunication() {
  // Opted out unlike the other mutations: a rejected send already gets its own error toast from the modal,
  // naming the channel that failed, so the generic one would only stack a second toast on the same action.
  const { mutate, loading } = useMutation(SendCustomerCommunicationDocument, {
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
  });

  async function sendCommunication(input: SalesRepCommunicationInputType): Promise<SalesRepCommunicationResultType> {
    const { storeId, cultureName } = globals;
    try {
      // Apollo rejects on a rejected request (GraphQL/network error); swallow so callers get a failed
      // result and can surface it. A honored request returns the per-channel outcome + warning codes.
      const result = await mutate({ command: { ...input, storeId, cultureName } });
      return result?.data?.sendCustomerCommunication ?? FAILED_RESULT;
    } catch (error) {
      Logger.error("[sales-rep] sendCustomerCommunication failed:", error);
      return FAILED_RESULT;
    }
  }

  return { sendCommunication, loading };
}
