import { useCreatePurchaseRequestFromDocumentsMutation } from "@/modules/purchase-requests/api/graphql/mutations/createPurchaseRequestFromDocuments";
import { usePurchaseRequestDocuments } from "./usePurchaseRequestDocuments";

export function useNewPurchaseRequest() {
  const { files, fetchFileOptions, fileOptions, processing, processDocuments } = usePurchaseRequestDocuments();

  const { mutate: _createPurchaseRequestFromDocuments } = useCreatePurchaseRequestFromDocumentsMutation();

  async function createPurchaseRequestFromDocuments(items: INewFile[]): Promise<string | undefined> {
    return await processDocuments(items, async (documentUrls) => {
      const result = await _createPurchaseRequestFromDocuments({ command: { documentUrls } });
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
