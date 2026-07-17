import { useMutation } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SendCustomerCommunicationDocument } from "../api/graphql/types";
import type { SalesRepCommunicationInputType } from "../types";

export function useSalesRepCommunication() {
  const { mutate, loading } = useMutation(SendCustomerCommunicationDocument);

  async function sendCommunication(input: SalesRepCommunicationInputType): Promise<boolean> {
    const { storeId, cultureName } = globals;
    try {
      // Apollo rejects on GraphQL/network errors; swallow so callers get a plain false and can surface it.
      const result = await mutate({ command: { ...input, storeId, cultureName } });
      return result?.data?.sendCustomerCommunication ?? false;
    } catch (error) {
      Logger.error("[sales-rep] sendCustomerCommunication failed:", error);
      return false;
    }
  }

  return { sendCommunication, loading };
}
