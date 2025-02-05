import { useMutation } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import { CreatePurchaseRequestFromDocumentsDocument } from "../api/graphql/types";
import { usePurchaseRequestDocuments } from "./usePurchaseRequestDocuments";

export function useNewPurchaseRequest() {
  const { files, fetchFileOptions, fileOptions, processing, processDocuments } = usePurchaseRequestDocuments();
  const { storeId, cultureName, currencyCode, userId } = globals;

  const { mutate: _createPurchaseRequestFromDocuments } = useMutation(CreatePurchaseRequestFromDocumentsDocument);

  async function createPurchaseRequestFromDocuments(items: INewFile[]): Promise<string | undefined> {
    return await processDocuments(items, async (documentUrls) => {
      const result = await _createPurchaseRequestFromDocuments({
        command: { documentUrls, storeId, cultureName, currencyCode, userId },
      });
      return result?.data?.createPurchaseRequestFromDocuments?.id;
    });
  }

  return {
    creatingPurchaseRequest: processing,
    files,
    fileOptions,
    fetchFileOptions,
    createPurchaseRequestFromDocuments,
  };
}
