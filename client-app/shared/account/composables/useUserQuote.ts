import { computed, ref, Ref } from "vue";
import { AddressType, Logger } from "@/core";
import {
  changeQuoteCommentMutation,
  changeQuoteItemQuantityMutation,
  removeQuoteItemMutation,
  updateQuoteAddressesMutation,
  getQuote,
  QueryQuoteArgs,
  QuoteAddressType,
  QuoteType,
  InputQuoteAddressType,
} from "@/xapi";
import { find } from "lodash";

const fetching: Ref<boolean> = ref(false);
const quote: Ref<QuoteType | undefined> = ref();
const shippingAddress: Ref<QuoteAddressType | undefined> = ref();
const billingAddress: Ref<QuoteAddressType | undefined> = ref();

export default () => {
  async function fetchQuote(paylod: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(paylod);

      shippingAddress.value = find(
        quote.value?.addresses,
        (address: QuoteAddressType) =>
          address.addressType === AddressType.Shipping || address.addressType === AddressType.BillingAndShipping
      );
      billingAddress.value = find(
        quote.value?.addresses,
        (address: QuoteAddressType) =>
          address.addressType === AddressType.Billing || address.addressType === AddressType.BillingAndShipping
      );
    } catch (e) {
      Logger.error("useUserQuote.fetchQuote", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateQuoteComment(quoteId: string, comment: string): Promise<void> {
    fetching.value = true;

    try {
      await changeQuoteCommentMutation({ command: { quoteId, comment } });
    } catch (e) {
      Logger.error("useUserQuote.updateQuoteComment", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateQuoteItemQuantity(quoteId: string, lineItemId: string, quantity: number): Promise<void> {
    fetching.value = true;

    try {
      await changeQuoteItemQuantityMutation({ command: { quoteId, lineItemId, quantity } });
    } catch (e) {
      Logger.error("useUserQuote.changeQuoteItemQuantity", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function removeQuoteItem(quoteId: string, lineItemId: string): Promise<void> {
    fetching.value = true;

    try {
      await removeQuoteItemMutation({ command: { quoteId, lineItemId } });
    } catch (e) {
      Logger.error("useUserQuote.removeQuoteItem", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateQuoteAddresses(quoteId: string, addresses: InputQuoteAddressType[]): Promise<void> {
    fetching.value = true;

    try {
      await updateQuoteAddressesMutation({ command: { quoteId, addresses } });
    } catch (e) {
      Logger.error("useUserQuote.updateQuoteAddresses", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  return {
    loading: computed(() => fetching.value),
    quote: computed(() => quote.value),
    shippingAddress,
    billingAddress,
    fetchQuote,
    updateQuoteComment,
    updateQuoteItemQuantity,
    removeQuoteItem,
    updateQuoteAddresses,
  };
};
