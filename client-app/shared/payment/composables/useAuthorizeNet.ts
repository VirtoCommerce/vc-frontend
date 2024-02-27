import { noop, useScriptTag } from "@vueuse/core";
import { authorizePayment } from "@/core/api/graphql/payment/mutations/authorizePayment";
import { Logger } from "@/core/utilities";
import type { AuthorizePaymentResultType } from "@/core/api/graphql/types";
import type { MaybeRef } from "@vueuse/core";

export function useAuthorizeNet(options: { scriptURL: MaybeRef<string>; manualScriptLoading?: boolean }) {
  const { scriptURL, manualScriptLoading = false } = options;

  const { load: loadAcceptJS } = useScriptTag(scriptURL, noop, {
    manual: manualScriptLoading,
  });

  function dispatchData(secureData: Accept.SecureData, handler: Accept.ResponseHandler): void {
    try {
      Accept.dispatchData(secureData, handler);
    } catch (e) {
      Logger.error(`${useAuthorizeNet.name}.${dispatchData.name}`, e);
    }
  }

  async function sendOpaqueData(payload: {
    orderId?: string;
    paymentId: string;
    opaqueData: Accept.OpaqueData;
  }): Promise<AuthorizePaymentResultType> {
    const { orderId, paymentId, opaqueData } = payload;
    try {
      return await authorizePayment({
        orderId,
        paymentId,
        parameters: [
          { key: "dataValue", value: opaqueData.dataValue },
          { key: "dataDescriptor", value: opaqueData.dataDescriptor },
        ],
      });
    } catch (e) {
      Logger.error(`${useAuthorizeNet.name}.${sendOpaqueData.name}`, e);
      throw e;
    }
  }

  return {
    loadAcceptJS,
    dispatchData,
    sendOpaqueData,
  };
}
