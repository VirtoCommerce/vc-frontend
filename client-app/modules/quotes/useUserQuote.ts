import { createSharedComposable } from "@vueuse/core";
import { cloneDeep, omit, remove } from "lodash";
import { computed, ref } from "vue";
import { AddressType } from "@/core/enums";
import { Logger } from "@/core/utilities";
import { toAttachedFile } from "@/ui-kit/utilities";
import {
  getQuote,
  approveQuoteRequest,
  changeQuoteComment,
  changeQuoteItemQuantity,
  declineQuoteRequest,
  removeQuoteItem,
  updateQuoteAddresses,
  submitQuoteRequest,
  updateQuoteAttachments,
} from "./api/graphql";
import type {
  QueryQuoteArgs,
  QuoteType,
  QuoteAddressType,
  InputQuoteAddressType,
  ApproveQuoteResultType,
} from "../quotes/api/graphql/types";

export function _useUserQuote() {
  const fetching = ref<boolean>(false);

  const quote = ref<QuoteType | undefined>();

  const billingAddress = computed<QuoteAddressType | undefined>(() =>
    quote.value?.addresses?.find((address: QuoteAddressType) => address.addressType === AddressType.Billing),
  );
  const shippingAddress = computed<QuoteAddressType | undefined>(() =>
    quote.value?.addresses?.find((address: QuoteAddressType) => address.addressType === AddressType.Shipping),
  );

  const attachments = computed(() => quote.value?.attachments ?? []);

  const attachedFiles = computed(() =>
    attachments.value.map((attachment) =>
      toAttachedFile(attachment.name, attachment.size, attachment.contentType, attachment.url),
    ),
  );

  function setQuoteAddress(newAddress: QuoteAddressType): void {
    remove(quote.value!.addresses, (address: QuoteAddressType) => address.addressType === newAddress.addressType);
    quote.value!.addresses.push(newAddress);
  }

  async function fetchQuote(payload: QueryQuoteArgs): Promise<void> {
    fetching.value = true;

    try {
      quote.value = await getQuote(payload);
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${fetchQuote.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function updateAttachments(
    quoteId: string,
    updatedAttachments: (IUploadedFile | IAttachedFile)[],
  ): Promise<void> {
    fetching.value = true;

    const urls = updatedAttachments.map((attachment) => attachment.url);
    try {
      await updateQuoteAttachments(quoteId, urls);
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${updateAttachments.name}`, e);
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

  async function approveItem(quoteId: string): Promise<ApproveQuoteResultType> {
    fetching.value = true;
    try {
      return await approveQuoteRequest({ command: { quoteId } });
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${approveItem.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function declineItem(quoteId: string): Promise<void> {
    fetching.value = true;
    try {
      await declineQuoteRequest({ command: { quoteId } });
    } catch (e) {
      Logger.error(`${useUserQuote.name}.${declineItem.name}`, e);
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
          cloneDeep(omit(address, ["id", "isDefault", "description", "isFavorite"]) as InputQuoteAddressType),
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
    attachments,
    attachedFiles,
    approveItem,
    declineItem,
    setQuoteAddress,
    fetchQuote,
    changeComment,
    changeItemQuantity,
    removeItem,
    updateAddresses,
    updateAttachments,
    submitQuote,
  };
}

export const useUserQuote = createSharedComposable(_useUserQuote);
