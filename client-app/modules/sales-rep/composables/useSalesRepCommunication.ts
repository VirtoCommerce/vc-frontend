import { useMutation } from "@vue/apollo-composable";
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
  const { mutate, loading } = useMutation(SendCustomerCommunicationDocument);

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
