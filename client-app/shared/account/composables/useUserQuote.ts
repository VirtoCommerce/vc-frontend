import { computed, ref, Ref } from "vue";
import { AddressType, Logger } from "@/core";
import { getQuote, QueryQuoteArgs, QuoteAddressType, QuoteType } from "@/xapi";
import _ from "lodash";

const DEFAULT_ITEMS_PER_PAGE = 6;

const fetching: Ref<boolean> = ref(false);
const quote: Ref<QuoteType | undefined> = ref();
const shippingAddress: Ref<QuoteAddressType | undefined> = ref();
const billingAddress: Ref<QuoteAddressType | undefined> = ref();
const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
const pages: Ref<number> = ref(0);

export default () => {
  async function fetchQuote(paylod: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(paylod);

      if (quote.value.items && quote.value.items.length > 0) {
        pages.value = Math.ceil(quote.value.items.length / itemsPerPage.value);
      }

      shippingAddress.value = _.find(
        quote.value?.addresses,
        (address: QuoteAddressType) =>
          address.addressType === AddressType.Shipping || address.addressType === AddressType.BillingAndShipping
      );
      billingAddress.value = _.find(
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

  return {
    loading: computed(() => fetching.value),
    quote: computed(() => quote.value),
    shippingAddress: computed(() => shippingAddress.value),
    billingAddress: computed(() => billingAddress.value),
    pages: computed(() => pages.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    fetchQuote,
  };
};
