import { omit, remove } from "lodash";
import { computed, ref } from "vue";
import {
  getQuote,
  changeQuoteComment,
  changeQuoteItemQuantity,
  removeQuoteItem,
  updateQuoteAddresses,
  submitQuoteRequest,
  updateQuoteAttachments,
} from "@/core/api/graphql";
import { AddressType } from "@/core/enums";
import { convertToType, Logger } from "@/core/utilities";
import type {
  QueryQuoteArgs,
  QuoteType,
  QuoteAddressType,
  InputQuoteAddressType,
  QuoteAttachmentType,
} from "@/core/api/graphql/types";

const fetching = ref<boolean>(false);
const quote = ref<QuoteType | undefined>();
const billingAddress = computed<QuoteAddressType | undefined>(
  () => quote.value?.addresses?.find((address: QuoteAddressType) => address.addressType === AddressType.Billing),
);
const shippingAddress = computed<QuoteAddressType | undefined>(
  () => quote.value?.addresses?.find((address: QuoteAddressType) => address.addressType === AddressType.Shipping),
);
const attachments = computed<QuoteAttachmentType[] | undefined>(() => quote.value?.attachments);
const attachmentsUrls = computed<string[]>(() => quote.value?.attachments.map((el) => el.url) || []);

export async function addFile(url: string) {
  if (!quote.value?.id) {
    return;
  }
  try {
    const res = await updateQuoteAttachments(quote.value.id, [...attachmentsUrls.value, url]);
    if (!res?.attachments) {
      console.error("Can't add attachments");
      return;
    }
    quote.value.attachments = res.attachments;
  } catch (e) {
    console.error(e);
  }
}

export async function removeFile(url: string) {
  if (!quote.value?.id) {
    return;
  }
  try {
    const reducedAttachments = attachmentsUrls.value.filter((el) => el !== url);
    const res = await updateQuoteAttachments(quote.value?.id, reducedAttachments);
    if (!res?.attachments) {
      console.error("Can't remove attachments");
      return;
    }
    quote.value.attachments = res.attachments;
  } catch (e) {
    console.error(e);
  }
}

export function isFileAttached(url?: string) {
  if (!url) {
    return false;
  }
  return attachmentsUrls.value.includes(url);
}

export function useUserQuote() {
  function clearQuote(): void {
    quote.value = undefined;
  }

  function setQuoteAddress(newAddress: QuoteAddressType): void {
    remove(quote.value!.addresses!, (address: QuoteAddressType) => address.addressType === newAddress.addressType);
    quote.value!.addresses!.push(newAddress);
  }

  async function fetchQuote(paylod: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(paylod);
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
      const inputAddresses: InputQuoteAddressType[] = addresses.map<InputQuoteAddressType>(
        (address: QuoteAddressType) =>
          convertToType<InputQuoteAddressType>(omit(address, ["id", "isDefault", "description"])),
      );

      await updateQuoteAddresses({ command: { quoteId, addresses: inputAddresses } });
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${updateAddresses.name}`, e);
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
    billingAddress,
    shippingAddress,
    clearQuote,
    setQuoteAddress,
    fetchQuote,
    changeComment,
    changeItemQuantity,
    removeItem,
    updateAddresses,
    submitQuote,

    attachments,
    isFileAttached,
    addFile,
    removeFile,
  };
}
