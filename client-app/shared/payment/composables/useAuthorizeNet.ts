import { MaybeRef, noop, useScriptTag } from "@vueuse/core";
import { Logger } from "@/core/utilities";
import { authorizePayment } from "@/xapi/graphql/cart";

export default function useAuthorizeNet(options: { scriptURL: MaybeRef<string>; manualScriptLoading?: boolean }) {
  const { scriptURL, manualScriptLoading = false } = options;

  const { load: loadAcceptJS } = useScriptTag(scriptURL, noop, {
    manual: manualScriptLoading,
  });

  async function dispatchData(secureData: Accept.SecureData, handler: Accept.ResponseHandler) {
    try {
      Accept.dispatchData(secureData, handler);
    } catch (e) {
      Logger.error(`${useAuthorizeNet.name}.${dispatchData.name}`, e);
    }
  }

  async function sendOpaqueData(payload: { orderId?: string; paymentId: string; opaqueData: Accept.OpaqueData }) {
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
