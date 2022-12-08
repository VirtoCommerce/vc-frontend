import { computed, ref } from "vue";
import { find, omit, remove } from "lodash";
import { AddressType, Logger } from "@/core";
import {
  getQuote,
  changeQuoteComment,
  changeQuoteItemQuantity,
  removeQuoteItem,
  updateQuoteAddresses,
  submitQuoteRequest,
  QueryQuoteArgs,
  QuoteType,
  QuoteAddressType,
  InputQuoteAddressType,
} from "@/xapi";

const fetching = ref<boolean>(false);
const quote = ref<QuoteType | undefined>();
const billingAddress = ref<QuoteAddressType | undefined>();
const shippingAddress = ref<QuoteAddressType | undefined>();

export default function useUserQuote() {
  function clearQuote(): void {
    quote.value = undefined;
  }

  function innerUpdateAddresses(): void {
    billingAddress.value = find(
      quote.value?.addresses,
      (address: QuoteAddressType) => address.addressType === AddressType.Billing
    );
    shippingAddress.value = find(
      quote.value?.addresses,
      (address: QuoteAddressType) => address.addressType === AddressType.Shipping
    );
  }

  function setQuoteAddress(newAddress: QuoteAddressType): void {
    remove(quote.value!.addresses!, (address: QuoteAddressType) => address.addressType === newAddress.addressType);
    quote.value!.addresses!.push(newAddress);
    innerUpdateAddresses();
  }

  async function fetchQuote(paylod: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(paylod);
      innerUpdateAddresses();
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${fetchQuote.name}`, e);
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
      Logger.error(`${useUserQuote.name}.${changeComment.name}`, e);
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
      Logger.error(`${useUserQuote.name}.${changeItemQuantity.name}`, e);
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
      Logger.error(`${useUserQuote.name}.${removeItem.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateAddresses(quoteId: string, addresses: QuoteAddressType[]): Promise<void> {
    fetching.value = true;

    try {
      const inputAddresses: InputQuoteAddressType[] = addresses.map(
        (address: QuoteAddressType) => omit(address, ["id", "isDefault", "description"]) as InputQuoteAddressType
      );

      await updateQuoteAddresses({ command: { quoteId, addresses: inputAddresses } });
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${updateAddresses}`, e);
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
      Logger.error(`${useUserQuote.name}.${submitQuote.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  return {
    fetching: computed(() => fetching.value),
    quote: computed(() => quote.value),
    billingAddress: computed(() => billingAddress.value),
    shippingAddress: computed(() => shippingAddress.value),
    clearQuote,
    setQuoteAddress,
    fetchQuote,
    changeComment,
    changeItemQuantity,
    removeItem,
    updateAddresses,
    submitQuote,
  };
}
