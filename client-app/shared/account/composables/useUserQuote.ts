import { computed, ref, Ref } from "vue";
import { AddressType, Logger } from "@/core";
import {
  getQuote,
  changeQuoteComment,
  changeQuoteItemQuantity,
  removeQuoteItem,
  updateQuoteAddresses,
  submitQuoteRequest,
  QueryQuoteArgs,
  QuoteAddressType,
  QuoteType,
  InputQuoteAddressType,
} from "@/xapi";
import { find, isEqual } from "lodash";

const fetching: Ref<boolean> = ref(false);
const quote: Ref<QuoteType | undefined> = ref();
const shippingAddress: Ref<QuoteAddressType | undefined> = ref();
const billingAddress: Ref<QuoteAddressType | undefined> = ref();
const billingAndShippingAddressesAreEqual: Ref<boolean> = ref(false);

export default () => {
  async function fetchQuote(paylod: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(paylod);

      const quoteShippingAddress = getAddress(quote.value!, AddressType.Shipping);
      if (quoteShippingAddress) {
        shippingAddress.value = quoteShippingAddress;
      }

      const quoteBillingAddress = getAddress(quote.value!, AddressType.Billing);
      if (quoteBillingAddress) {
        billingAddress.value = quoteBillingAddress;
      }

      billingAndShippingAddressesAreEqual.value = isEqual(shippingAddress.value, billingAddress.value);
    } catch (e) {
      Logger.error("useUserQuote.fetchQuote", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function changeComment(quoteId: string, comment: string): Promise<void> {
    fetching.value = true;

    try {
      await changeQuoteComment({ command: { quoteId, comment } });
    } catch (e) {
      Logger.error("useUserQuote.changeComment", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function changeItemQuantity(quoteId: string, lineItemId: string, quantity: number): Promise<void> {
    fetching.value = true;

    try {
      await changeQuoteItemQuantity({ command: { quoteId, lineItemId, quantity } });
    } catch (e) {
      Logger.error("useUserQuote.changeItemQuantity", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function removeItem(quoteId: string, lineItemId: string): Promise<void> {
    fetching.value = true;

    try {
      await removeQuoteItem({ command: { quoteId, lineItemId } });
    } catch (e) {
      Logger.error("useUserQuote.removeItem", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateAddresses(quoteId: string, addresses: InputQuoteAddressType[]): Promise<void> {
    fetching.value = true;

    try {
      await updateQuoteAddresses({ command: { quoteId, addresses } });
    } catch (e) {
      Logger.error("useUserQuote.updateAddresses", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function submitQuote(quoteId: string, comment: string): Promise<void> {
    fetching.value = true;

    try {
      await submitQuoteRequest({ command: { quoteId, comment } });
    } catch (e) {
      Logger.error("useUserQuote.submit", e);
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
    billingAndShippingAddressesAreEqual,
    fetchQuote,
    changeComment,
    changeItemQuantity,
    removeItem,
    updateAddresses,
    submitQuote,
  };
};

function getAddress(
  quoteRequest: QuoteType,
  type: AddressType.Shipping | AddressType.Billing
): QuoteAddressType | undefined {
  return find(quoteRequest.addresses, (address: QuoteAddressType) => address.addressType === type);
}
